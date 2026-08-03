'use client';

import {
  FileText,
  Camera,
  FileSignature,
  Printer,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import type { ModuleReport } from '@/app/scanner/page';

interface DashboardSummaryProps {
  reports: {
    document: ModuleReport;
    photo: ModuleReport;
    signature: ModuleReport;
    hardware: ModuleReport;
  };
  onTabChange: (tab: 'document' | 'photo' | 'signature' | 'hardware') => void;
}

type ModuleKey = 'document' | 'photo' | 'signature' | 'hardware';

const moduleMeta: { key: ModuleKey; label: string; description: string; icon: any }[] = [
  { key: 'document', label: 'Document Scanner', description: 'Check a document for tampering', icon: FileText },
  { key: 'photo', label: 'Photo Match', description: 'Verify a live photo against an ID', icon: Camera },
  { key: 'signature', label: 'Signature Check', description: 'Check if a signature is genuine', icon: FileSignature },
  { key: 'hardware', label: 'Hardware Stream', description: 'Monitor scanner and printer feeds', icon: Printer },
];

export default function DashboardSummary({ reports, onTabChange }: DashboardSummaryProps) {
  const activeReports = moduleMeta.map((m) => reports[m.key]).filter((r) => r.isCompleted);
  const anyCompleted = activeReports.length > 0;

  const avgScore = anyCompleted
    ? Math.round(activeReports.reduce((sum, r) => sum + r.score, 0) / activeReports.length)
    : 0;

  const overallRisk = activeReports.some((r) => r.risk === 'HIGH')
    ? 'HIGH'
    : activeReports.some((r) => r.risk === 'MEDIUM')
      ? 'MEDIUM'
      : 'LOW';

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Run the checks below to see how genuine your document is.
        </p>
      </div>

      {anyCompleted && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Overall score</p>
            <div className="text-5xl font-black text-slate-900">
              {avgScore} <span className="text-xl font-semibold text-slate-400">/ 100</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Average of {activeReports.length} completed checks</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Verdict</p>
            <div className="mb-2 flex items-center justify-center gap-2">
              {overallRisk === 'LOW' ? (
                <ShieldCheck className="h-9 w-9 text-green-600" />
              ) : (
                <ShieldAlert className="h-9 w-9 text-red-500" />
              )}
              <span className={`text-3xl font-black ${overallRisk === 'LOW' ? 'text-green-700' : 'text-red-600'}`}>
                {overallRisk === 'LOW' ? 'Verified' : 'Suspicious'}
              </span>
            </div>
            <p className="text-xs text-slate-500">AI trust assessment</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Risk level</p>
            <div className={`text-3xl font-black ${overallRisk === 'LOW' ? 'text-green-600' : overallRisk === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'}`}>
              {overallRisk === 'LOW' ? 'LOW' : overallRisk === 'MEDIUM' ? 'MEDIUM' : 'HIGH'}
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {anyCompleted ? `Based on ${activeReports.length} completed check${activeReports.length > 1 ? 's' : ''}` : 'No checks yet'}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {moduleMeta.map((m) => {
          const report = reports[m.key];
          return (
            <div
              key={m.key}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <m.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-slate-800">{m.label}</p>
                  <p className="text-xs text-slate-500">
                    {report.isCompleted
                      ? `${report.status} — score ${report.score}/100`
                      : m.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onTabChange(m.key)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
              >
                {report.isCompleted ? 'Re-run' : 'Run'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
