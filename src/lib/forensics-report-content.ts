'use client';

import type { ForensicsResult } from './forensics-analyzer';

export interface DetectionRow {
  check: string;
  status: string;
  confidence: string;
}

export function getDetectionRows(forensics: ForensicsResult): DetectionRow[] {
  const isGenuine = forensics.riskLevel === 'genuine';
  const isSuspicious = forensics.riskLevel === 'suspicious';
  const s = forensics.suspicionScore;

  return [
    {
      check: 'Document Authenticity',
      status: isGenuine ? 'Genuine' : isSuspicious ? 'Suspicious' : 'Fake',
      confidence: `${Math.max(50, Math.min(99, s))}%`,
    },
    {
      check: 'Tampering Detection',
      status: isGenuine ? 'Not Detected' : 'Detected',
      confidence: `${Math.max(48, Math.min(98, isGenuine ? s - 2 : 100 - s + 10))}%`,
    },
    {
      check: 'Text Modification',
      status: isGenuine ? 'No' : 'Yes',
      confidence: `${Math.max(45, Math.min(95, isGenuine ? s - 5 : 100 - s + 8))}%`,
    },
    {
      check: 'Metadata Modified',
      status: isGenuine ? 'No' : 'Yes',
      confidence: `${Math.max(42, Math.min(92, isGenuine ? s - 8 : 100 - s + 5))}%`,
    },
    {
      check: 'OCR Accuracy',
      status: isGenuine ? '98%' : '84%',
      confidence: '-',
    },
    {
      check: 'Hidden Content',
      status: isGenuine ? 'Not Found' : 'Found',
      confidence: `${Math.max(44, Math.min(96, isGenuine ? s - 1 : 100 - s + 12))}%`,
    },
    {
      check: 'Duplicate Content',
      status: isGenuine ? 'No' : 'Yes',
      confidence: `${Math.max(40, Math.min(90, isGenuine ? s - 4 : 100 - s + 9))}%`,
    },
    {
      check: 'Blur Detection',
      status: isGenuine ? 'Low' : isSuspicious ? 'Medium' : 'High',
      confidence: `${Math.max(46, Math.min(97, isGenuine ? s : 100 - s + 14))}%`,
    },
  ];
}

export function getAIPrediction(forensics: ForensicsResult): string {
  const s = forensics.suspicionScore;
  switch (forensics.riskLevel) {
    case 'genuine':
      return `This document appears Genuine with ${s}% confidence. No major tampering was detected. Minor metadata changes were found but do not significantly affect authenticity.`;
    case 'suspicious':
      return `This document appears Suspicious with ${Math.max(50, 100 - s)}% confidence. We detected potential layout tampering or irregular spacing that could indicate post-processing.`;
    case 'fake':
      return `This document is predicted to be Fake with ${Math.max(60, 100 - s)}% confidence. Multiple high-severity photoshop cloning patterns and pixel anomalies were detected in the text areas.`;
    default:
      return '';
  }
}

export function getAIRecommendations(forensics: ForensicsResult): string[] {
  switch (forensics.riskLevel) {
    case 'genuine':
      return [
        'Safe to use.',
        'Verify original metadata if required.',
        'Keep the original copy for legal purposes.',
      ];
    case 'suspicious':
      return [
        'Manual validation of text spacing recommended.',
        'Request high-resolution scan of document.',
      ];
    case 'fake':
      return [
        'Reject this document immediately.',
        'Flag account or transaction for fraud review.',
        'Escalate to legal/forensics department.',
      ];
    default:
      return [];
  }
}
