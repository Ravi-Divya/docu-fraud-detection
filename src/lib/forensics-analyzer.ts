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

// Analyze image buffer for compression artifacts and cloning
export const analyzeImagePixels = async (buffer: Uint8Array | null): Promise<ForensicsIssue[]> => {
  const issues: ForensicsIssue[] = [];

  if (!buffer) {
    return issues;
  }

  try {
    // Simulating pixel analysis - in production, use proper image analysis libraries
    // Check for compression artifacts by analyzing color distribution
    const sampledPixels = Math.floor(buffer.length / 1000);
    let compressionScore = 0;

    for (let i = 0; i < sampledPixels; i++) {
      const idx = Math.floor((i * buffer.length) / sampledPixels);
      if (idx < buffer.length) {
        // Analyze byte patterns for JPEG compression artifacts
        const byte = buffer[idx];
        if ((byte & 0xf0) === 0xf0 || (byte & 0x0f) === 0x0f) {
          compressionScore++;
        }
      }
    }

    const compressionRatio = (compressionScore / sampledPixels) * 100;

    if (compressionRatio > 15) {
      issues.push({
        type: 'compression_artifact',
        severity: 'low',
        description: 'High compression artifacts detected - image may have been re-saved multiple times',
        confidence: Math.min(75, 40 + compressionRatio),
      });
    }

    // Detect potential cloning/copy-paste regions
    const bufferHash = generateSimpleHash(buffer);
    const repeatingPatterns = detectRepeatingPatterns(buffer);

    if (repeatingPatterns > 0.15) {
      issues.push({
        type: 'cloning_detection',
        severity: 'high',
        description: 'Possible cloning or copy-paste editing detected - suspicious repeating pixel patterns found',
        confidence: Math.min(90, 60 + repeatingPatterns * 100),
        location: 'Multiple regions in image',
      });
    }

    // Detect blur patterns (common in edited regions)
    const blurIndicators = analyzeBlurPatterns(buffer);
    if (blurIndicators > 0.2) {
      issues.push({
        type: 'blur_detection',
        severity: 'medium',
        description: 'Blur or smoothing detected in certain regions - typical of photoshop blending',
        confidence: Math.min(85, 55 + blurIndicators * 100),
        location: 'Edited regions detected',
      });
    }
  } catch (error) {
    console.log('[v0] Pixel analysis error:', error);
  }

  return issues;
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

// Helper function to detect repeating patterns in buffer
const detectRepeatingPatterns = (buffer: Uint8Array): number => {
  const sampleSize = Math.min(1000, buffer.length);
  let repeats = 0;

  for (let i = 0; i < sampleSize - 10; i += 10) {
    const chunk1 = buffer.subarray(i, i + 10);
    for (let j = i + 10; j < Math.min(i + 500, sampleSize); j += 10) {
      const chunk2 = buffer.subarray(j, j + 10);
      let equal = true;
      for (let k = 0; k < chunk1.length; k += 1) {
        if (chunk1[k] !== chunk2[k]) {
          equal = false;
          break;
        }
      }
      if (equal) {
        repeats++;
      }
    }
  }

  return repeats / (sampleSize / 10);
};

// Helper function to analyze blur patterns
const analyzeBlurPatterns = (buffer: Uint8Array): number => {
  const sampleSize = Math.min(2000, buffer.length);
  let blurIndicators = 0;

  for (let i = 0; i < sampleSize - 3; i += 4) {
    const byte1 = buffer[i] ?? 0;
    const byte2 = buffer[i + 1] ?? 0;
    const byte3 = buffer[i + 2] ?? 0;

    // Low variance in consecutive bytes indicates blur/smoothing
    const variance = Math.abs(byte1 - byte2) + Math.abs(byte2 - byte3);
    if (variance < 10) {
      blurIndicators++;
    }
  }

  return blurIndicators / (sampleSize / 4);
};

// Simple hash for detecting patterns
const generateSimpleHash = (buffer: Uint8Array): number => {
  let hash = 0;
  for (let i = 0; i < buffer.length; i += 100) {
    hash = (hash << 5) - hash + buffer[i];
    hash = hash & hash;
  }
  return hash;
};

// Calculate overall suspicion score
export const calculateSuspicionScore = (issues: ForensicsIssue[]): { score: number; riskLevel: 'genuine' | 'suspicious' | 'fake' } => {
  if (issues.length === 0) {
    return { score: 95, riskLevel: 'genuine' };
  }

  let penalty = 0;
  const textIssues = issues.filter(i => ['font_inconsistency', 'spacing_anomaly'].includes(i.type));
  const pixelIssues = issues.filter(i => ['cloning_detection', 'blur_detection', 'compression_artifact'].includes(i.type));
  const metadataIssues = issues.filter(i => i.type === 'metadata_issue');

  if (textIssues.length > 0) {
    penalty += 55;
  }

  penalty += pixelIssues.length * 20;
  penalty += metadataIssues.length * 15;

  const score = Math.max(5, 100 - penalty);
  const riskLevel: 'genuine' | 'suspicious' | 'fake' = score > 50 ? 'genuine' : 'suspicious';

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
