'use client';

export interface ForensicsIssue {
  type: 'font_inconsistency' | 'spacing_anomaly' | 'cloning_detection' | 'compression_artifact' | 'metadata_issue' | 'blur_detection' | 'ai_analysis' | 'ai_analysis_skipped';
  severity: 'low' | 'medium' | 'high' | 'info';
  description: string;
  confidence: number; // 0-100
  location?: string;
}

import type { ContractAnalysis } from './contract-analyzer';

export interface ForensicsResult {
  suspicionScore: number; // 0-100
  riskLevel: 'genuine' | 'suspicious' | 'fake';
  issues: ForensicsIssue[];
  analysisDetails: {
    textAnalysis: string;
    pixelAnalysis: string;
    metadataAnalysis: string;
    recommendation: string;
  };
  contractAnalysis?: ContractAnalysis;
}

// Analyze text characteristics for font and spacing inconsistencies
export const analyzeTextCharacteristics = (text: string): ForensicsIssue[] => {
  const issues: ForensicsIssue[] = [];
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  // Check for abnormal spacing patterns only for longer text bodies
  if (lines.length >= 6) {
    const spacingPatterns = lines.map((line) => (line.match(/\s+/g)?.length || 0));
    const avgSpacing = spacingPatterns.reduce((a, b) => a + b, 0) / spacingPatterns.length;
    const spacingVariance = Math.sqrt(
      spacingPatterns.reduce((sum, val) => sum + Math.pow(val - avgSpacing, 2), 0) / spacingPatterns.length
    );

    if (avgSpacing >= 2.5 && spacingVariance > avgSpacing * 1.0) {
      issues.push({
        type: 'spacing_anomaly',
        severity: 'medium',
        description: 'Inconsistent spacing detected across text lines - possible editing or font substitution',
        confidence: Math.min(65, 40 + spacingVariance * 7),
        location: 'Multiple lines',
      });
    } else if (avgSpacing >= 2 && spacingVariance > avgSpacing * 0.9) {
      issues.push({
        type: 'spacing_anomaly',
        severity: 'low',
        description: 'Minor spacing inconsistencies detected, likely due to OCR extraction or font variation',
        confidence: Math.min(45, 30 + spacingVariance * 5),
        location: 'Multiple lines',
      });
    }
  }

  // Check for unusual character distributions (potential font mixing)
  const charTypes = {
    uppercase: (text.match(/[A-Z]/g) || []).length,
    lowercase: (text.match(/[a-z]/g) || []).length,
    numbers: (text.match(/[0-9]/g) || []).length,
    special: (text.match(/[^\w\s]/g) || []).length,
  };

  const totalChars = Object.values(charTypes).reduce((a, b) => a + b, 0);
  const uppercaseRatio = totalChars > 0 ? charTypes.uppercase / totalChars : 0;

  // Detect unusual capitalization patterns only for longer text bodies
  if (totalChars >= 30 && (uppercaseRatio > 0.45 || uppercaseRatio < 0.08)) {
    issues.push({
      type: 'font_inconsistency',
      severity: 'low',
      description: 'Unusual capitalization pattern detected - may indicate font substitution or editing',
      confidence: 60,
      location: 'Full document',
    });
  }

  return issues;
};

// Analyze decoded image pixels for real tampering indicators:
// sharpness (Laplacian variance), JPEG 8x8 blocking artifacts,
// copy-move cloning (duplicate block signatures), and region-level noise inconsistency.
export const analyzeImagePixels = async (imageData: ImageData | null): Promise<ForensicsIssue[]> => {
  const issues: ForensicsIssue[] = [];

  if (!imageData || imageData.width < 16 || imageData.height < 16) {
    return issues;
  }

  try {
    const { data, width, height } = imageData;
    const grayscale = new Float32Array(width * height);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      grayscale[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    // 1. Sharpness via Laplacian variance (low = blur/smoothing, common after retouching)
    const lapVariance = laplacianVariance(grayscale, width, height);
    if (lapVariance < 120) {
      issues.push({
        type: 'blur_detection',
        severity: 'high',
        description: 'Extensive blur or smoothing detected across the image - typical of photo retouching or copy-paste blending',
        confidence: Math.min(92, 55 + (120 - lapVariance) / 2),
        location: 'Full image',
      });
    } else if (lapVariance < 260) {
      issues.push({
        type: 'blur_detection',
        severity: 'medium',
        description: 'Below-average sharpness detected - possible localized smoothing in edited regions',
        confidence: Math.min(75, 45 + (260 - lapVariance) / 4),
        location: 'Multiple regions',
      });
    }

    // 2. JPEG re-save artifacts: energy discontinuity at 8x8 block boundaries
    const blockingScore = jpegBlockingScore(grayscale, width, height);
    if (blockingScore > 1.25) {
      issues.push({
        type: 'compression_artifact',
        severity: 'medium',
        description: 'Strong 8x8 blocking artifacts - image was heavily re-compressed after editing (double-JPEG)',
        confidence: Math.min(85, 40 + blockingScore * 30),
        location: 'Grid-aligned regions',
      });
    } else if (blockingScore > 1.12) {
      issues.push({
        type: 'compression_artifact',
        severity: 'low',
        description: 'Mild JPEG blocking artifacts - image may have been re-saved or resized',
        confidence: Math.min(60, 35 + blockingScore * 20),
        location: 'Grid-aligned regions',
      });
    }

    // 3. Copy-move clone detection via duplicate structured block signatures
    const cloneRatio = cloneDetection(grayscale, width, height);
    if (cloneRatio > 0.08) {
      issues.push({
        type: 'cloning_detection',
        severity: 'high',
        description: `Copy-move cloning detected: ${(cloneRatio * 100).toFixed(1)}% of structured regions appear duplicated elsewhere in the image`,
        confidence: Math.min(94, 70 + cloneRatio * 100),
        location: 'Multiple regions in image',
      });
    } else if (cloneRatio > 0.03) {
      issues.push({
        type: 'cloning_detection',
        severity: 'medium',
        description: 'Possible copy-paste editing detected - some duplicated structured regions found',
        confidence: Math.min(78, 55 + cloneRatio * 100),
        location: 'Scattered regions',
      });
    }

    // 3b. Localized texture anomaly: blocks whose edge energy deviates strongly from
    //     their text row (pasted text with a different font renders differently)
    const anomalyBlocks = textureAnomalyBlocks(grayscale, width, height);
    if (anomalyBlocks >= 6) {
      issues.push({
        type: 'blur_detection',
        severity: 'high',
        description: `Localized content anomaly: ${anomalyBlocks} pixel blocks differ significantly from surrounding text - consistent with inserted or replaced content`,
        confidence: Math.min(88, 62 + anomalyBlocks * 3),
        location: 'Localized region',
      });
    } else if (anomalyBlocks >= 3) {
      issues.push({
        type: 'blur_detection',
        severity: 'medium',
        description: 'Small localized texture anomaly detected - possible minor editing in a limited area',
        confidence: Math.min(70, 50 + anomalyBlocks * 5),
        location: 'Localized region',
      });
    }

    // 4. Region-level noise/energy inconsistency (splicing indicator)
    const regionInconsistency = regionEnergyInconsistency(grayscale, width, height);
    if (regionInconsistency > 1.0) {
      issues.push({
        type: 'blur_detection',
        severity: 'medium',
        description: 'Inconsistent detail across image regions - some areas are significantly smoother, indicating composited content',
        confidence: Math.min(80, 50 + regionInconsistency * 40),
        location: 'Localized regions',
      });
    } else if (regionInconsistency > 0.7) {
      issues.push({
        type: 'blur_detection',
        severity: 'low',
        description: 'Detail varies across image regions - typical of scanned or mixed-content documents',
        confidence: Math.min(55, 30 + regionInconsistency * 25),
        location: 'Localized regions',
      });
    }
  } catch (error) {
    console.log('[v0] Pixel analysis error:', error);
  }

  return issues;
};

// Debug/calibration: raw pixel metrics without thresholds applied.
export const debugPixelMetrics = (imageData: ImageData | null) => {
  if (!imageData) return null;
  const { data, width, height } = imageData;
  const grayscale = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    grayscale[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return {
    width,
    height,
    lapVariance: laplacianVariance(grayscale, width, height),
    blockingScore: jpegBlockingScore(grayscale, width, height),
    cloneRatio: cloneDetection(grayscale, width, height),
    regionInconsistency: regionEnergyInconsistency(grayscale, width, height),
    anomalyBlocks: textureAnomalyBlocks(grayscale, width, height),
  };
};

// Variance of the Laplacian: high variance = sharp image, low = blurred/smoothed.
const laplacianVariance = (g: Float32Array, w: number, h: number): number => {
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = g[i - 1] + g[i + 1] + g[i - w] + g[i + w] - 4 * g[i];
      sum += lap;
      sumSq += lap * lap;
      n++;
    }
  }
  if (n === 0) return 0;
  const mean = sum / n;
  return sumSq / n - mean * mean;
};

// Ratio of horizontal gradient energy at 8px grid boundaries vs elsewhere.
// JPEG compression aligns blocks to this grid, so re-compression raises the ratio.
const jpegBlockingScore = (g: Float32Array, w: number, h: number): number => {
  let boundary = 0;
  let interior = 0;
  let bn = 0;
  let inn = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const e = Math.abs(g[i] - g[i - 1]);
      if (x % 8 === 0) {
        boundary += e;
        bn++;
      } else {
        interior += e;
        inn++;
      }
    }
  }
  if (bn === 0 || inn === 0) return 1;
  const bAvg = boundary / bn;
  const iAvg = interior / inn;
  return bAvg / (iAvg + 1e-6);
};

// Copy-move detection in two independent modes:
//  1) Row runs: contiguous identical blocks within a text row. Short runs (4-16 blocks)
//     are a cloned text insert; very long runs (>= 17) are page furniture
//     (headers, footers, watermarks) and are ignored.
//  2) Diagonal shifts: duplicate block pairs with both dx != 0 and dy != 0.
//     Structural repetition is always axis-aligned, so diagonal duplicates
//     indicate rotated/pasted content.
const cloneDetection = (g: Float32Array, w: number, h: number): number => {
  const BLOCK = 16;
  const cols = Math.floor(w / BLOCK);
  const rows = Math.floor(h / BLOCK);
  if (cols < 4 || rows < 4) return 0;

  const sig: ({ mean: number; var: number; hash: number } | null)[] = new Array(cols * rows);
  let structuredCount = 0;

  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      let sum = 0;
      let sumSq = 0;
      let hash = 0;
      for (let y = by * BLOCK; y < (by + 1) * BLOCK; y++) {
        for (let x = bx * BLOCK; x < (bx + 1) * BLOCK; x++) {
          const v = g[y * w + x];
          sum += v;
          sumSq += v * v;
          hash = (hash * 31 + Math.round(v)) | 0;
        }
      }
      const n = BLOCK * BLOCK;
      const mean = sum / n;
      const variance = sumSq / n - mean * mean;
      if (variance < 8) continue; // uniform background - ignore
      structuredCount++;
      sig[by * cols + bx] = { mean, var: variance, hash };
    }
  }

  if (structuredCount < 10) return 0;

  const sameBlock = (a: { mean: number; var: number; hash: number } | null, b: { mean: number; var: number; hash: number } | null) =>
    !!a && !!b && a.hash === b.hash && Math.abs(a.mean - b.mean) < 1 && Math.abs(a.var - b.var) < 20;

  // 1) Row runs
  let cloneBlocks = 0;
  for (let by = 0; by < rows; by++) {
    let runLen = 0;
    for (let bx = 0; bx < cols; bx++) {
      const i = by * cols + bx;
      const s = sig[i];
      const prev = bx > 0 ? sig[by * cols + bx - 1] : null;
      if (s && sameBlock(s, prev)) {
        runLen++;
      } else {
        if (runLen >= 4 && runLen <= 16) cloneBlocks += runLen;
        runLen = 1;
      }
    }
    if (runLen >= 4 && runLen <= 16) cloneBlocks += runLen;
  }

  // 2) Diagonal shifts (dx != 0 && dy != 0)
  const buckets = new Map<number, number[]>();
  sig.forEach((s, idx) => {
    if (!s) return;
    const arr = buckets.get(s.hash);
    if (arr) arr.push(idx);
    else buckets.set(s.hash, [idx]);
  });
  const diagonalShifts = new Map<string, number>();
  for (const list of buckets.values()) {
    if (list.length < 2) continue;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      const sa = sig[a];
      const ax = a % cols;
      const ay = Math.floor(a / cols);
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        const sb = sig[b];
        if (Math.abs(sa!.mean - sb!.mean) > 1 || Math.abs(sa!.var - sb!.var) > 20) continue;
        const bx = b % cols;
        const by = Math.floor(b / cols);
        const dx = bx - ax;
        const dy = by - ay;
        if (dx === 0 || dy === 0) continue;
        const key = `${dx},${dy}`;
        diagonalShifts.set(key, (diagonalShifts.get(key) || 0) + 1);
      }
    }
  }
  for (const count of diagonalShifts.values()) {
    if (count >= 3) cloneBlocks += count * 2;
  }

  return Math.min(1, cloneBlocks / Math.max(1, structuredCount));
};

// Per-row robust anomaly detection: for each text row, blocks whose edge energy
// deviates strongly from the row median (MAD-based z-score) are flagged.
// Uniform rows (low MAD) and uniform background blocks are ignored.
const textureAnomalyBlocks = (g: Float32Array, w: number, h: number): number => {
  const BLOCK = 16;
  const cols = Math.floor(w / BLOCK);
  const rows = Math.floor(h / BLOCK);
  if (cols < 4 || rows < 4) return 0;

  const energy = new Float32Array(cols * rows);
  const variance = new Float32Array(cols * rows);
  for (let by = 0; by < rows; by++) {
    for (let bx = 0; bx < cols; bx++) {
      let sum = 0;
      let sumSq = 0;
      let e = 0;
      for (let y = by * BLOCK; y < (by + 1) * BLOCK; y++) {
        for (let x = bx * BLOCK; x < (bx + 1) * BLOCK; x++) {
          const v = g[y * w + x];
          sum += v;
          sumSq += v * v;
          const vx = x + 1 < w ? g[y * w + x + 1] : v;
          const vy = y + 1 < h ? g[(y + 1) * w + x] : v;
          e += Math.abs(vx - v) + Math.abs(vy - v);
        }
      }
      const n = BLOCK * BLOCK;
      energy[by * cols + bx] = e / n;
      variance[by * cols + bx] = sumSq / n - (sum / n) * (sum / n);
    }
  }

  let flagged = 0;
  for (let by = 0; by < rows; by++) {
    const vals: number[] = [];
    const idxs: number[] = [];
    for (let bx = 0; bx < cols; bx++) {
      const i = by * cols + bx;
      if (variance[i] >= 8) {
        vals.push(energy[i]);
        idxs.push(i);
      }
    }
    if (vals.length < 4) continue;
    const sorted = [...vals].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const devs = vals.map(v => Math.abs(v - median));
    devs.sort((a, b) => a - b);
    const mad = devs[Math.floor(devs.length / 2)];
    if (mad < 0.8) continue; // uniform row - nothing to compare against
    const threshold = Math.max(median * 0.6, mad * 5);
    vals.forEach((v, k) => {
      if (v > median + threshold) flagged++;
    });
  }
  return flagged;
};

// Split into a 4x4 grid; measure per-region local gradient energy.
// A high spread (CV) across regions suggests spliced/composited content.
const regionEnergyInconsistency = (g: Float32Array, w: number, h: number): number => {
  const COLS = 4;
  const ROWS = 4;
  const energies: number[] = [];
  for (let ry = 0; ry < ROWS; ry++) {
    for (let rx = 0; rx < COLS; rx++) {
      let e = 0;
      let n = 0;
      const x0 = Math.floor((rx * w) / COLS);
      const x1 = Math.max(x0 + 1, Math.floor(((rx + 1) * w) / COLS));
      const y0 = Math.floor((ry * h) / ROWS);
      const y1 = Math.max(y0 + 1, Math.floor(((ry + 1) * h) / ROWS));
      for (let y = y0 + 1; y < y1 - 1; y++) {
        for (let x = x0 + 1; x < x1 - 1; x++) {
          const i = y * w + x;
          e += Math.abs(g[i] - g[i - 1]) + Math.abs(g[i] - g[i - w]);
          n++;
        }
      }
      energies.push(n > 0 ? e / n : 0);
    }
  }
  const mean = energies.reduce((a, b) => a + b, 0) / energies.length;
  if (mean < 0.1) return 0;
  const variance = energies.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / energies.length;
  return Math.sqrt(variance) / mean;
};

// Extract and analyze metadata for inconsistencies
export const analyzeMetadata = (metadata: Record<string, any>): ForensicsIssue[] => {
  const issues: ForensicsIssue[] = [];

  if (!metadata || Object.keys(metadata).length === 0) {
    issues.push({
      type: 'metadata_issue',
      severity: 'medium',
      description: 'No metadata found - image metadata may have been stripped (common in edited documents)',
      confidence: 70,
    });
    return issues;
  }

  const { CreateDate, ModifyDate, Software, Copyright } = metadata;

  // Check for metadata manipulation
  if (CreateDate && ModifyDate) {
    const createTime = new Date(CreateDate).getTime();
    const modifyTime = new Date(ModifyDate).getTime();
    const timeDiff = Math.abs(modifyTime - createTime);

    if (timeDiff > 24 * 60 * 60 * 1000) {
      issues.push({
        type: 'metadata_issue',
        severity: 'low',
        description: `Large gap between creation (${CreateDate}) and modification (${ModifyDate}) dates - possible late editing`,
        confidence: 60,
      });
    }
  }

  // Detect photoshop or editing software
  if (Software && (Software.toLowerCase().includes('photoshop') || Software.toLowerCase().includes('gimp'))) {
    issues.push({
      type: 'metadata_issue',
      severity: 'high',
      description: `Image edited with ${Software} - professional editing tool indicates possible tampering`,
      confidence: 85,
    });
  }

  return issues;
};

// Calculate overall suspicion score
export const calculateSuspicionScore = (issues: ForensicsIssue[]): { score: number; riskLevel: 'genuine' | 'suspicious' | 'fake' } => {
  if (issues.length === 0) {
    return { score: 96, riskLevel: 'genuine' };
  }

  let penalty = 0;
  const severityWeight = (severity: ForensicsIssue['severity']) =>
    severity === 'high' ? 32 : severity === 'medium' ? 18 : severity === 'low' ? 8 : 0;
  const textIssues = issues.filter(i => ['font_inconsistency', 'spacing_anomaly'].includes(i.type));
  const pixelIssues = issues.filter(i => ['cloning_detection', 'blur_detection', 'compression_artifact'].includes(i.type));
  const metadataIssues = issues.filter(i => i.type === 'metadata_issue');

  penalty += textIssues.reduce((sum, i) => sum + severityWeight(i.severity), 0);
  penalty += pixelIssues.reduce((sum, i) => sum + severityWeight(i.severity), 0);
  penalty += metadataIssues.reduce((sum, i) => sum + severityWeight(i.severity), 0);

  const score = Math.max(3, Math.min(96, 96 - penalty));
  const riskLevel: 'genuine' | 'suspicious' | 'fake' = score >= 70 ? 'genuine' : score >= 45 ? 'suspicious' : 'fake';

  return { score: Math.round(score), riskLevel };
};

// Generate detailed analysis report
export const generateForensicsReport = (issues: ForensicsIssue[]): ForensicsResult['analysisDetails'] => {
  const mediumRiskIssues = issues.filter(i => i.severity === 'medium');

  return {
    textAnalysis: issues.filter(i => i.type.includes('font') || i.type.includes('spacing')).length > 0
      ? `Detected ${issues.filter(i => i.type.includes('font') || i.type.includes('spacing')).length} text-based anomalies suggesting possible font substitution or manual text editing.`
      : 'Text characteristics appear normal - consistent formatting detected.',

    pixelAnalysis: issues.filter(i => i.type.includes('cloning') || i.type.includes('blur') || i.type.includes('compression')).length > 0
      ? `Found ${issues.filter(i => i.type.includes('cloning') || i.type.includes('blur') || i.type.includes('compression')).length} pixel-level anomalies including potential photoshop cloning, blur effects, and compression artifacts.`
      : 'Pixel analysis shows no significant anomalies - image appears to have consistent pixel distribution.',

    metadataAnalysis: issues.filter(i => i.type === 'metadata_issue').length > 0
      ? `Metadata issues detected: ${issues.filter(i => i.type === 'metadata_issue').map(i => i.description).join('; ')}`
      : 'Metadata appears complete and consistent - no obvious tampering indicators.',

    recommendation: mediumRiskIssues.length > 0
      ? `⚠️ CAUTION: ${mediumRiskIssues.length} medium-risk indicators detected. Consider additional verification.`
      : '✓ LOW RISK: Document appears genuine with minimal tampering indicators, but always verify through official channels.',
  };
};
