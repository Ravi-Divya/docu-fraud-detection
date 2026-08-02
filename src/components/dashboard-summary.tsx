'use client';

import {
  FileText,
  Camera,
  FileSignature,
  Printer,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Award,
  Info,
  Play,
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

const moduleMeta: { key: ModuleKey; label: string; emoji: string; icon: any; color: string }[] = [
  { key: 'document', label: 'Document Scanner', emoji: '📄', icon: FileText, color: 'bg-blue-50 text-blue-600' },
  { key: 'photo', label: 'Photo Match', emoji: '📷', icon: Camera, color: 'bg-green-50 text-green-600' },
  { key: 'signature', label: 'Signature Check', emoji: '✍️', icon: FileSignature, color: 'bg-indigo-50 text-indigo-600' },
  { key: 'hardware', label: 'Hardware Stream', emoji: '💻', icon: Printer, color: 'bg-purple-50 text-purple-600' },
];

export default function DashboardSummary({ reports, onTabChange }: DashboardSummaryProps) {
  const activeReports = moduleMeta
    .map((m) => reports[m.key])
    .filter((r) => r.isCompleted);

  const anyCompleted = activeReports.length > 0;

  const avgScore = anyCompleted
    ? Math.round(activeReports.reduce((sum, r) => sum + r.score, 0) / activeReports.length)
    : 0;

  const overallRisk = activeReports.some((r) => r.risk === 'HIGH')
    ? 'HIGH'
    : activeReports.some((r) => r.risk === 'MEDIUM')
      ? 'MEDIUM'
      : 'LOW';

  const avgConfidence = anyCompleted
    ? Math.round(activeReports.reduce((sum, r) => sum + r.confidence, 0) / activeReports.length)
    : 0;

  const getRiskBadge = (risk: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (risk) {
      case 'LOW':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-800">🟢 Low</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-black text-yellow-800">🟡 Medium</span>;
      case 'HIGH':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-800">🔴 High</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Verification Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Run each forensic module below to build a complete authenticity verdict.
        </p>
      </div>

      {/* Overview Cards */}
      {anyCompleted ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Overall AI Score</p>
            <div className="mb-2 text-5xl font-black text-slate-900">
              {avgScore} <span className="text-xl font-semibold text-slate-400">/ 100</span>
            </div>
            <p className="text-xs text-slate-500">Average of {activeReports.length} completed modules</p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Overall Status</p>
            <div className="mb-2 flex items-center gap-2">
              {overallRisk === 'LOW' ? (
                <ShieldCheck className="h-10 w-10 text-emerald-600" />
              ) : (
                <ShieldAlert className="h-10 w-10 text-rose-600" />
              )}
              <span className={`text-3xl font-black ${overallRisk === 'LOW' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {overallRisk === 'LOW' ? 'VERIFIED' : 'SUSPICIOUS'}
              </span>
            </div>
            <p className="text-xs text-slate-500">AI Trust Assessment Verdict</p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Risk Level</p>
            <div className="mb-2 text-3xl font-black text-slate-900">
              {overallRisk === 'LOW' ? '🟢 LOW' : overallRisk === 'MEDIUM' ? '🟡 MEDIUM' : '🔴 HIGH'}
            </div>
            <p className="text-xs text-slate-500">Confidence rating: {avgConfidence}%</p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-10 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-600">
            <Play className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No scans completed yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Run your first forensic module to see the overall AI score, risk level, and full
            verdict here.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {moduleMeta.map((m) => (
              <button
                key={m.key}
                onClick={() => onTabChange(m.key)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <m.icon className="h-4 w-4" />
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Module Overview Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-6">
          <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <Award className="h-5 w-5 text-blue-600" />
            Module Status
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {anyCompleted ? `${activeReports.length} OF 4 MODULES COMPLETED` : 'AWAITING SCANS'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">AI Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Risk</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {moduleMeta.map((m) => {
                const report = reports[m.key];
                return (
                  <tr key={m.key} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-6 py-5">
                      <span className="flex items-center gap-3 font-semibold text-slate-800">
                        <span className={`rounded-lg p-2 ${m.color}`}>
                          <m.icon className="h-4 w-4" />
                        </span>
                        {m.emoji} {m.label}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700">
                      {report.isCompleted ? (
                        <>
                          {report.score} <span className="text-xs font-medium text-slate-400">/ 100</span>
                        </>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {report.isCompleted ? (
                        <span className={`font-bold ${report.risk === 'LOW' ? 'text-green-600' : 'text-red-600'}`}>
                          {report.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">Not started</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      {report.isCompleted ? getRiskBadge(report.risk) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => onTabChange(m.key)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                      >
                        {report.isCompleted ? 'Re-run' : 'Run scan'}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verdict */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm">
        <h3 className="mb-6 flex items-center gap-2 border-b border-slate-100 pb-4 text-xl font-bold text-slate-800">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          Overall Forensic Assessment
        </h3>

        {anyCompleted ? (
          <>
            <div className="mb-8 grid gap-6 text-sm md:grid-cols-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-extrabold uppercase text-slate-400">Overall AI Score</p>
                <p className="mt-1 text-2xl font-black text-slate-800">{avgScore} / 100</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-extrabold uppercase text-slate-400">Overall Status</p>
                <p className="mt-1 text-2xl font-black text-slate-800">
                  {overallRisk === 'LOW' ? 'VERIFIED' : 'ACTION REQUIRED'}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-extrabold uppercase text-slate-400">Risk Level</p>
                <p className="mt-1 text-2xl font-black text-slate-800">{overallRisk}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs font-extrabold uppercase text-slate-400">AI Confidence</p>
                <p className="mt-1 text-2xl font-black text-slate-800">{avgConfidence}%</p>
              </div>
            </div>

            <div className="rounded-r-xl border-l-4 border-blue-600 bg-blue-50 p-5 shadow-sm">
              <h5 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Info className="h-4 w-4 text-blue-600" />
                Final Verdict
              </h5>
              <p className="text-sm font-medium leading-relaxed text-slate-700">
                {overallRisk === 'LOW'
                  ? 'No significant evidence of forgery, tampering, or malicious activity was detected across the completed modules. Individual module reports list any minor observations.'
                  : 'Attention Required: One or more forensic checks returned a High Risk level. Suspected modifications or mismatch anomalies have been flagged. Manual investigation of the highlighted issues is recommended.'}
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-r-xl border-l-4 border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-medium leading-relaxed text-slate-600">
              Complete at least one forensic module to generate your overall assessment and final
              verdict.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
