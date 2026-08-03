'use client';

import { ForensicsResult } from '@/lib/forensics-analyzer';
import { CheckCircle, FileText, Check, Info } from 'lucide-react';
import { getDetectionRows, getAIPrediction, getAIRecommendations } from '@/lib/forensics-report-content';

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

  const detectionRows = getDetectionRows(forensics);
  const aiPrediction = getAIPrediction(forensics);
  const recommendations = getAIRecommendations(forensics);

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
              {detectionRows.map((row, index) => (
                <tr key={row.check}>
                  <td className="px-6 py-4 font-semibold text-slate-700">{row.check}</td>
                  <td className="px-6 py-4">
                    {index === 0 ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isGenuine ? 'bg-green-100 text-green-800' : isSuspicious ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row.status}
                      </span>
                    ) : index === 1 ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isGenuine ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row.status}
                      </span>
                    ) : index === 4 ? (
                      <span className="font-bold text-blue-600">{row.status}</span>
                    ) : index === 7 ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isGenuine ? 'bg-blue-100 text-blue-800' : isSuspicious ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row.status}
                      </span>
                    ) : (
                      <span className={`font-semibold ${
                        row.status === 'No' || row.status === 'Not Found' || row.status === 'Not Detected'
                          ? 'text-slate-600'
                          : 'text-red-600'
                      }`}>
                        {row.status}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">{row.confidence}</td>
                </tr>
              ))}
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
          {aiPrediction}
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
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className={isGenuine ? 'text-emerald-500 font-bold' : isSuspicious ? 'text-amber-500 font-bold' : 'text-red-500 font-bold'}>
                    {isGenuine ? '✓' : isSuspicious ? '⚠' : '✗'}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
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
