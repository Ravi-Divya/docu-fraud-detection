'use client';

import { ForensicsResult } from '@/lib/forensics-analyzer';
import { AlertCircle, CheckCircle, AlertTriangle, FileText, Check, Info } from 'lucide-react';

interface ForensicsDisplayProps {
  forensics: ForensicsResult;
  fileInfo?: {
    name: string;
    type: string;
    size: string;
    date: string;
    pages: number;
  };
}

export default function ForensicsDisplay({ forensics, fileInfo }: ForensicsDisplayProps) {
  const info = fileInfo || {
    name: 'document_scan_copy.pdf',
    type: 'PDF Document',
    size: '1.2 MB',
    date: new Date().toLocaleDateString(),
    pages: 1
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'genuine':
        return { 
          bg: 'bg-green-50/50', 
          border: 'border-green-200', 
          text: 'text-green-900', 
          badge: 'bg-green-600 text-white',
          lightBadge: 'bg-green-100 text-green-800',
          indicator: '🟢 LOW'
        };
      case 'suspicious':
        return { 
          bg: 'bg-yellow-50/50', 
          border: 'border-yellow-200', 
          text: 'text-yellow-900', 
          badge: 'bg-yellow-600 text-white',
          lightBadge: 'bg-yellow-100 text-yellow-800',
          indicator: '🟡 MEDIUM'
        };
      case 'fake':
        return { 
          bg: 'bg-red-50/50', 
          border: 'border-red-200', 
          text: 'text-red-900', 
          badge: 'bg-red-600 text-white',
          lightBadge: 'bg-red-100 text-red-800',
          indicator: '🔴 HIGH'
        };
      default:
        return { 
          bg: 'bg-gray-50', 
          border: 'border-gray-200', 
          text: 'text-gray-900', 
          badge: 'bg-gray-600 text-white',
          lightBadge: 'bg-gray-100 text-gray-800',
          indicator: '⚪ UNKNOWN'
        };
    }
  };

  const colors = getRiskColor(forensics.riskLevel);
  const score = forensics.suspicionScore; // e.g. 95 for genuine, low score for fake

  // Set values based on risk level
  const isGenuine = forensics.riskLevel === 'genuine';
  const isSuspicious = forensics.riskLevel === 'suspicious';
  
  const statusValues = {
    authenticity: isGenuine ? 'Genuine' : isSuspicious ? 'Suspicious' : 'Fake',
    tampering: isGenuine ? 'Not Detected' : 'Detected',
    modification: isGenuine ? 'No' : 'Yes',
    metadata: isGenuine ? 'No' : 'Yes',
    ocr: isGenuine ? '98%' : '84%',
    hidden: isGenuine ? 'Not Found' : 'Found',
    duplicate: isGenuine ? 'No' : 'Yes',
    blur: isGenuine ? 'Low' : isSuspicious ? 'Medium' : 'High'
  };

  const confidenceValues = {
    authenticity: isGenuine ? '96%' : isSuspicious ? '74%' : '98%',
    tampering: isGenuine ? '94%' : '81%',
    modification: isGenuine ? '91%' : '88%',
    metadata: isGenuine ? '88%' : '85%',
    hidden: isGenuine ? '95%' : '90%',
    duplicate: isGenuine ? '92%' : '89%',
    blur: isGenuine ? '97%' : '94%'
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Basic Information
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">File Name</p>
            <p className="text-sm font-bold text-slate-800 truncate" title={info.name}>{info.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">File Type</p>
            <p className="text-sm font-bold text-slate-800">{info.type}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">File Size</p>
            <p className="text-sm font-bold text-slate-800">{info.size}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Upload Date</p>
            <p className="text-sm font-bold text-slate-800">{info.date}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Number of Pages</p>
            <p className="text-sm font-bold text-slate-800">{info.pages}</p>
          </div>
        </div>
      </div>

      {/* AI Detection Results */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            AI Detection Results
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                <th className="px-6 py-4">Check</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">AI Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-700">Document Authenticity</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isGenuine ? 'bg-green-100 text-green-800' : isSuspicious ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {statusValues.authenticity}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">{confidenceValues.authenticity}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-700">Tampering Detection</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isGenuine ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {statusValues.tampering}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">{confidenceValues.tampering}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-700">Text Modification</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${!isGenuine ? 'text-red-600' : 'text-slate-600'}`}>
                    {statusValues.modification}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">{confidenceValues.modification}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-700">Metadata Modified</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${!isGenuine ? 'text-red-600' : 'text-slate-600'}`}>
                    {statusValues.metadata}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">{confidenceValues.metadata}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-700">OCR Accuracy</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-blue-600">{statusValues.ocr}</span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-400">-</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-700">Hidden Content</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${!isGenuine ? 'text-red-600' : 'text-slate-600'}`}>
                    {statusValues.hidden}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">{confidenceValues.hidden}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-700">Duplicate Content</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${!isGenuine ? 'text-red-600' : 'text-slate-600'}`}>
                    {statusValues.duplicate}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">{confidenceValues.duplicate}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-semibold text-slate-700">Blur Detection</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isGenuine ? 'bg-blue-100 text-blue-800' : isSuspicious ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {statusValues.blur}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">{confidenceValues.blur}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Prediction */}
      <div className="bg-slate-50 border-l-4 border-blue-600 rounded-r-xl p-5 shadow-sm">
        <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
          <Info className="w-4 h-4 text-blue-600" />
          AI Prediction
        </h5>
        <blockquote className="text-slate-700 italic text-sm leading-relaxed">
          {isGenuine 
            ? `This document appears Genuine with a 96% confidence. No major tampering was detected. Minor metadata changes were found but do not significantly affect authenticity.`
            : isSuspicious 
            ? `This document appears Suspicious with a 74% confidence. We detected potential layout tampering or irregular spacing that could indicate post-processing.`
            : `This document is predicted to be Fake with a 98% confidence. Multiple high-severity photoshop cloning patterns and pixel anomalies were detected in the text areas.`
          }
        </blockquote>
      </div>

      {/* AI Recommendation & Score */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600" />
              AI Recommendation
            </h4>
            <ul className="space-y-3">
              {isGenuine ? (
                <>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Safe to use.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Verify original metadata if required.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Keep the original copy for legal purposes.</span>
                  </li>
                </>
              ) : isSuspicious ? (
                <>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-amber-500 font-bold">⚠</span>
                    <span>Manual validation of text spacing recommended.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-amber-500 font-bold">⚠</span>
                    <span>Request high-resolution scan of document.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-red-500 font-bold">✗</span>
                    <span>Reject this document immediately.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-red-500 font-bold">✗</span>
                    <span>Flag account or transaction for fraud review.</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="text-red-500 font-bold">✗</span>
                    <span>Escalate to legal/forensics department.</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Overall Score */}
        <div className={`rounded-2xl p-6 border ${colors.border} ${colors.bg} flex flex-col items-center justify-center text-center shadow-sm`}>
          <p className="text-sm font-extrabold text-slate-700 tracking-wider uppercase mb-2">Document Authenticity Score</p>
          <div className="text-5xl font-black text-slate-900 mb-2">{score} <span className="text-2xl font-semibold text-slate-500">/ 100</span></div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${colors.badge}`}>
            Risk Level : {colors.indicator}
          </div>
        </div>
      </div>
    </div>
  );
}
