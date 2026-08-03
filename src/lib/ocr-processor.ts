'use client';

import { analyzeTextCharacteristics, analyzeImagePixels, calculateSuspicionScore, generateForensicsReport, ForensicsResult } from './forensics-analyzer';
import { analyzeContract } from './contract-analyzer';
import mammoth from 'mammoth';

interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  pages: number;
  forensics?: ForensicsResult;
}

// Preprocess image for better OCR: upscale small images, convert to grayscale,
// boost contrast, and reduce background noise (watermarks, shadows).
const preprocessForOCR = async (imageData: string): Promise<HTMLCanvasElement> => {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image for preprocessing'));
    img.src = imageData;
  });

  const maxDim = Math.max(img.naturalWidth, img.naturalHeight);
  const scale = Math.max(1, Math.min(3, 1800 / maxDim));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageDataObj.data;

  const contrast = 1.4;
  const brightness = -18;

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    const adjusted = (gray - 128) * contrast + 128 + brightness;
    const value = Math.max(0, Math.min(255, adjusted));
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  ctx.putImageData(imageDataObj, 0, 0);
  return canvas;
};

// Decode an image to raw pixel data for real forensics analysis.
const decodeImageData = async (imageData: string): Promise<ImageData | null> => {
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.src = imageData;
    });
    const maxDim = 900;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch (e) {
    console.log('[v0] Image decode failed:', e);
    return null;
  }
};

export async function processImage(file: File, documentType: string = 'auto'): Promise<OCRResult> {
  try {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const imageData = event.target?.result as string;
          const Tesseract = (await import('tesseract.js')).default;
          // Preprocess the image (upscale + grayscale + contrast) for cleaner OCR
          const preprocessed = await preprocessForOCR(imageData);
          // Run OCR
          const result = await Tesseract.recognize(preprocessed, 'eng', {
            logger: (m) => console.log('[v0] OCR Progress:', m),
          });

          const text = result.data.text.trim();
          const confidence = result.data.confidence;

          // Run forensics analysis on the actual decoded pixels
          const textIssues = analyzeTextCharacteristics(text);
          let pixelIssues: any[] = [];
          try {
            const decoded = await decodeImageData(imageData);
            pixelIssues = await analyzeImagePixels(decoded);
          } catch (e) {
            console.log('[v0] Pixel analysis skipped:', e);
          }
          
          const allIssues = [...textIssues, ...pixelIssues];
          const { score, riskLevel } = calculateSuspicionScore(allIssues);
          const analysisDetails = generateForensicsReport(allIssues);
          let contractAnalysis = undefined;
          const isContract = file.name.toLowerCase().includes('contract') || file.name.toLowerCase().includes('rent') || file.name.toLowerCase().includes('agreement');
          
          if (isContract) {
            try {
              // Run a basic contract analysis on the extracted text
              contractAnalysis = analyzeContract(text);
            } catch (e) {
              console.log('[v0] Contract analysis skipped:', e);
            }
          }

          const forensicsResult: ForensicsResult = {
            suspicionScore: score,
            riskLevel,
            issues: allIssues,
            analysisDetails,
            contractAnalysis,
          };
          // Live AI Integration
          try {
            const aiResponse = await fetch('/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text, documentType })
            });
            const aiData = await aiResponse.json();
            if (aiData.success && aiData.data) {
              forensicsResult.analysisDetails = aiData.data.analysisDetails;
              forensicsResult.riskLevel = aiData.data.riskLevel;
              forensicsResult.suspicionScore = aiData.data.suspicionScore;
              forensicsResult.issues.unshift({
                type: 'ai_analysis',
                description: 'AI forensic model generated insights successfully.',
                severity: 'info',
                confidence: 100,
              });
      } else if (aiData.message) {
        console.warn('[v0] AI Analysis skipped:', aiData.message);
        forensicsResult.issues.unshift({
          type: 'ai_analysis_skipped',
          description: aiData.message || 'Live AI Analysis requires API key setup.',
          severity: 'info',
          confidence: 100,
        });
      }
          } catch (aiErr) {
            console.error('[v0] Failed to call AI API:', aiErr);
          }

          resolve({
            text,
            confidence: Math.max(0, Math.min(100, confidence)),
            language: 'English',
            pages: 1,
            forensics: forensicsResult,
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('[v0] Image processing error:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[processImage] ${message}`);
  }
}

export async function processPDF(file: File, documentType: string = 'auto'): Promise<OCRResult> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    // Load the pdf.js worker from the bundled file so rendering works without a CDN.
    const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    let totalConfidence = 0;
    let pageCount = 0;

    const totalPages = pdf.numPages || 0;

    // 1) Extract text content from all pages (fast)
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      } catch (e) {
        console.warn(`[v0] Failed to extract text from page ${pageNum}:`, e);
      }
    }

    // 2) Sample up to 5 pages evenly across the document for OCR confidence estimation
    const sampleCount = Math.min(5, Math.max(1, Math.floor(totalPages / Math.max(1, Math.floor(totalPages / 5)))));
    const step = Math.max(1, Math.floor(totalPages / sampleCount));
    const pagesToSample: number[] = [];
    for (let p = 1; p <= totalPages; p += step) {
      pagesToSample.push(p);
      if (pagesToSample.length >= 5) break;
    }

    for (const pageNum of pagesToSample) {
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const renderContext = {
          canvas,
          viewport,
        };

        try {
          await page.render(renderContext).promise;
          const Tesseract = (await import('tesseract.js')).default;
          const result = await Tesseract.recognize(canvas, 'eng', {
            logger: (m) => console.log('[v0] PDF OCR Progress:', m),
          });

          totalConfidence += result.data.confidence;
          pageCount++;
        } catch (renderError) {
          console.error('[v0] Page render or OCR error:', renderError);
        }
      } catch (err) {
        console.warn(`[v0] Error sampling page ${pageNum}:`, err);
      }
    }

    const averageConfidence = pageCount > 0 ? totalConfidence / pageCount : 85;

    // Optional: Run forensic analysis or contract analysis on PDF text as well
    let contractAnalysis = undefined;
    const isContract = file.name.toLowerCase().includes('contract') || file.name.toLowerCase().includes('rent') || file.name.toLowerCase().includes('agreement');

    if (isContract) {
      try {
        contractAnalysis = analyzeContract(fullText.trim());
      } catch (e) {
        console.log('[v0] Contract analysis skipped:', e);
      }
    }

    const forensicsResult: ForensicsResult = contractAnalysis 
      ? { suspicionScore: 0, riskLevel: 'genuine', issues: [], analysisDetails: generateForensicsReport([]), contractAnalysis } 
      : { suspicionScore: 0, riskLevel: 'genuine', issues: [], analysisDetails: generateForensicsReport([]) };

    // Live AI Integration
    try {
      const aiResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText.trim(), documentType })
      });
      const aiData = await aiResponse.json();
      if (aiData.success && aiData.data) {
        forensicsResult.analysisDetails = aiData.data.analysisDetails;
        forensicsResult.riskLevel = aiData.data.riskLevel;
        forensicsResult.suspicionScore = aiData.data.suspicionScore;
        forensicsResult.issues.unshift({
          type: 'ai_analysis',
          description: 'AI forensic model generated insights successfully.',
          severity: 'info',
          confidence: 100,
        });
      } else if (aiData.message) {
        console.warn('[v0] AI Analysis skipped:', aiData.message);
        forensicsResult.issues.unshift({
          type: 'ai_analysis_skipped',
          description: aiData.message || 'Live AI Analysis requires API key setup.',
          severity: 'info',
          confidence: 100,
        });
      }
    } catch (aiErr) {
      console.error('[v0] Failed to call AI API:', aiErr);
    }

    return {
      text: fullText.trim(),
      confidence: Math.max(0, Math.min(100, averageConfidence)),
      language: 'English',
      pages: totalPages,
      forensics: forensicsResult,
    };
  } catch (error) {
    console.error('[v0] PDF processing error:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[processPDF] ${message}`);
  }
}

export async function processDOCX(file: File, documentType: string = 'auto'): Promise<OCRResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const fullText = result.value;

    let contractAnalysis = undefined;
    const isContract = file.name.toLowerCase().includes('contract') || file.name.toLowerCase().includes('rent') || file.name.toLowerCase().includes('agreement');

    if (isContract) {
      try {
        contractAnalysis = analyzeContract(fullText.trim());
      } catch (e) {
        console.log('[v0] Contract analysis skipped:', e);
      }
    }

    const forensicsResult: ForensicsResult = contractAnalysis 
      ? { suspicionScore: 0, riskLevel: 'genuine', issues: [], analysisDetails: generateForensicsReport([]), contractAnalysis } 
      : { suspicionScore: 0, riskLevel: 'genuine', issues: [], analysisDetails: generateForensicsReport([]) };

    // Live AI Integration
    try {
      const aiResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText.trim(), documentType })
      });
      const aiData = await aiResponse.json();
      if (aiData.success && aiData.data) {
        forensicsResult.analysisDetails = aiData.data.analysisDetails;
        forensicsResult.riskLevel = aiData.data.riskLevel;
        forensicsResult.suspicionScore = aiData.data.suspicionScore;
        forensicsResult.issues.unshift({
          type: 'ai_analysis',
          description: 'AI forensic model generated insights successfully.',
          severity: 'info',
          confidence: 100,
        });
      }
    } catch (aiErr) {
      console.error('[v0] Failed to call AI API:', aiErr);
    }

    return {
      text: fullText.trim(),
      confidence: 100, // Text extraction from docx is exact
      language: 'English',
      pages: 1,
      forensics: forensicsResult,
    };
  } catch (error) {
    console.error('[v0] DOCX processing error:', error);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`[processDOCX] ${message}`);
  }
}
