'use client';

import { Copy, Download, RotateCcw } from 'lucide-react';
import { useState, lazy, Suspense } from 'react';
import type { ForensicsResult } from '@/lib/forensics-analyzer';

const ForensicsDisplay = lazy(() => import('./forensics-display'));

interface OCRResultProps {
  result: {
    text: string;
    confidence: number;
    language: string;
    processingTime: number;
    forensics?: ForensicsResult;
  };
  onReset: () => void;
}

const cleanText = (text: string): string => {
  return text
    .replace(/\n\s*\n/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
};

export default function OCRResult({ result, onReset }: OCRResultProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'original' | 'edited' | 'forensics'>('original');

  const editedText = cleanText(result.text);
  const riskLevel = result.forensics?.riskLevel ?? 'genuine';
  const score = result.forensics?.suspicionScore ?? 95;

  const handleCopy = () => {
    const textToCopy = activeTab === 'edited' ? editedText : result.text;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const textToDownload = activeTab === 'edited' ? editedText : result.text;
    const element = document.createElement('a');
    const file = new Blob([textToDownload], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `docuguard-${activeTab}-text-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const riskStyles: Record<string, { card: string; label: string; badge: string }> = {
    genuine: {
      card: 'border-green-200 bg-green-50',
      label: 'text-green-900',
      badge: 'bg-green-600 text-white',
    },
    suspicious: {
      card: 'border-yellow-200 bg-yellow-50',
      label: 'text-yellow-900',
      badge: 'bg-yellow-600 text-white',
    },
    fake: {
      card: 'border-red-200 bg-red-50',
      label: 'text-red-900',
      badge: 'bg-red-600 text-white',
    },
  };

  const styles = riskStyles[riskLevel] ?? riskStyles.genuine;
  const statusText = riskLevel === 'genuine' ? 'GENUINE' : riskLevel === 'suspicious' ? 'SUSPICIOUS' : 'FAKE';
  const riskLabel = riskLevel === 'genuine' ? '🟢 LOW' : riskLevel === 'suspicious' ? '🟡 MEDIUM' : '🔴 HIGH';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Score Card */}
      {result.forensics && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <p className="mb-1 text-sm font-semibold text-slate-600">AUTHENTICITY SCORE</p>
              <div className={`rounded-xl border-2 p-4 ${styles.card}`}>
                <p className={`text-3xl font-extrabold ${styles.label}`}>{score}%</p>
                <span className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider ${styles.badge}`}>
                  {statusText}
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="mb-1 text-sm font-semibold text-slate-600">OCR Confidence</p>
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                <p className="text-2xl font-bold text-blue-900">{result.confidence.toFixed(1)}%</p>
                <p className="mt-1 text-xs font-medium text-blue-700">Text Extraction</p>
              </div>
            </div>

            <div className="text-center">
              <p className="mb-1 text-sm font-semibold text-slate-600">Document Details</p>
              <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
                <p className="text-sm font-bold text-indigo-900">{result.text.length} chars</p>
                <p className="mt-1 text-xs text-indigo-700">
                  {(result.processingTime / 1000).toFixed(1)}s • {result.language}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-xs font-semibold text-slate-500">
            Risk Level: {riskLabel}
          </p>
        </div>
      )}

      {/* Extracted text with tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex gap-2 overflow-x-auto border-b border-slate-200">
          <button
            onClick={() => setActiveTab('original')}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'original'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Original Output
          </button>
          <button
            onClick={() => setActiveTab('edited')}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'edited'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Cleaned Output
          </button>
          {result.forensics && (
            <button
              onClick={() => setActiveTab('forensics')}
              className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'forensics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Forensics Report
            </button>
          )}
        </div>

        {activeTab === 'original' ? (
          <div>
            <p className="mb-3 text-sm text-slate-500">
              Raw extracted text from OCR without any modifications:
            </p>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{result.text}</p>
            </div>
          </div>
        ) : activeTab === 'edited' ? (
          <div>
            <p className="mb-3 text-sm text-slate-500">
              Processed and cleaned text with normalized spacing:
            </p>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{editedText}</p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {result.forensics && (
              <Suspense
                fallback={
                  <div className="py-8 text-center">
                    <p className="text-slate-500">Loading forensics analysis...</p>
                  </div>
                }
              >
                <ForensicsDisplay forensics={result.forensics} />
              </Suspense>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
        >
          <Copy className="h-5 w-5" />
          {copied ? 'Copied!' : 'Copy Text'}
        </button>
        <button
          onClick={handleDownload}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
        >
          <Download className="h-5 w-5" />
          Download TXT
        </button>
        <button
          onClick={onReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-200 py-3 font-semibold text-slate-900 transition-colors hover:bg-slate-300"
        >
          <RotateCcw className="h-5 w-5" />
          Process Another
        </button>
      </div>
    </div>
  );
}
