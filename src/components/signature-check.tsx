import { useState } from 'react';
import { ShieldCheck, Search, Check, X, FileSignature, Upload, Download } from 'lucide-react';
import { downloadPDFReport } from '@/lib/pdf-report';
import { analyzeSignature, type SignatureAnalysis } from '@/lib/signature-verify';

interface ModuleReport {
  score: number;
  status: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  isCompleted: boolean;
  details?: any;
}

interface SignatureCheckProps {
  onUpdateReport?: (report: ModuleReport) => void;
}

export default function SignatureCheck({ onUpdateReport }: SignatureCheckProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<'none' | 'match' | 'mismatch'>('none');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [report, setReport] = useState<ModuleReport | null>(null);
  const [analysis, setAnalysis] = useState<SignatureAnalysis | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUploadedImage(url);
      setResult('none');
      setReport(null);
      setAnalysis(null);
    }
  };

  const verifySignature = async () => {
    if (!uploadedImage) return;
    setIsChecking(true);
    setAnalysis(null);
    try {
      const verdict = await analyzeSignature(uploadedImage);
      setAnalysis(verdict);

      const isMatch = verdict.ok && verdict.score >= 70;
      const scoreValue = isMatch ? verdict.score : Math.max(5, verdict.score);
      const riskValue = isMatch ? 'LOW' : verdict.score >= 40 ? 'MEDIUM' : 'HIGH';
      const statusValue = isMatch ? 'Genuine' : 'Forgery';

      const newReport: ModuleReport = {
        score: scoreValue,
        status: statusValue,
        risk: riskValue as any,
        confidence: verdict.confidence,
        isCompleted: true,
        details: {
          inkCoverage: `${verdict.metrics.inkCoverage}%`,
          strokeWidthCV: verdict.metrics.strokeWidthCV.toFixed(2),
          pressureVariance: `${verdict.metrics.pressureVariance}`,
          smoothness: `${verdict.metrics.smoothness}/100`,
          components: verdict.metrics.components,
          uploadTime: new Date().toLocaleTimeString(),
        },
      };

      setReport(newReport);
      setResult(isMatch ? 'match' : 'mismatch');
      if (onUpdateReport) {
        onUpdateReport(newReport);
      }
    } catch (e: any) {
      setAnalysis({
        ok: false,
        message: e?.message || 'Signature analysis failed. Please try again.',
        score: 0,
        confidence: 0,
        metrics: { inkCoverage: 0, strokeWidthCV: 0, pressureVariance: 0, smoothness: 0, components: 0 },
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    downloadPDFReport(
      {
        title: 'DocuGuard Forensic Report - Signature Check',
        subtitle: 'Signature authenticity verification',
        generatedAt: new Date().toLocaleString(),
        rows: [
          { label: 'Status', value: report.status },
          { label: 'Score', value: `${report.score}/100` },
          { label: 'Risk Level', value: report.risk },
          { label: 'Confidence', value: `${report.confidence}%` },
          ...Object.entries(report.details ?? {}).map(([k, v]) => ({
            label: k.charAt(0).toUpperCase() + k.slice(1),
            value: String(v),
          })),
        ],
        sections: [
          {
            heading: 'SIGNATURE CHECKS',
            lines: analysis
              ? [
                  `Genuineness score: ${analysis.score}/100`,
                  `Ink coverage: ${analysis.metrics.inkCoverage}%`,
                  `Stroke width consistency (CV): ${analysis.metrics.strokeWidthCV} (lower = more uniform)`,
                  `Pen pressure variance: ${analysis.metrics.pressureVariance}`,
                  `Stroke smoothness: ${analysis.metrics.smoothness}/100`,
                  `Connected components: ${analysis.metrics.components}`,
                  analysis.message,
                ]
              : [],
          },
        ],
      },
      `docuguard-signature-report-${Date.now()}.pdf`
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl bg-blue-100 p-3 text-blue-600">
          <FileSignature className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Signature Check</h1>
        <p className="mt-2 text-slate-600">
          Upload a signature to check whether it is genuine or forged.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Upload area */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800">Upload signature</h2>

            <label className="block w-full border-2 border-dashed border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors rounded-2xl p-10 text-center cursor-pointer">
              <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
              {uploadedImage ? (
                <div className="relative h-32 w-full">
                  <img src={uploadedImage} alt="Uploaded signature" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-blue-600">
                  <Upload className="w-10 h-10 mb-3 opacity-80" />
                  <span className="font-semibold">Click to upload signature image</span>
                  <span className="text-sm text-slate-500 mt-2">JPG, PNG, WebP supported</span>
                </div>
              )}
            </label>

            <input
              type="text"
              placeholder="Account number or ID (optional)"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={verifySignature}
              disabled={!uploadedImage || isChecking}
              className="w-full bg-blue-600 text-white font-bold rounded-xl px-6 py-4 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
            >
              {isChecking ? <Search className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {isChecking ? 'Checking...' : 'Check Signature'}
            </button>
          </div>

          {/* Status area */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 h-full flex flex-col justify-center min-h-[300px]">
            {result === 'none' && !isChecking && (
              <div className="text-center text-slate-400">
                <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Upload a signature and click check.</p>
              </div>
            )}

            {isChecking && (
              <div className="text-center text-blue-500 animate-pulse">
                <Search className="w-16 h-16 mx-auto mb-4" />
                <h3 className="text-xl font-bold">Analyzing signature...</h3>
                <p className="text-sm text-slate-500 mt-2">Checking strokes, pressure, and shape.</p>
              </div>
            )}

            {!isChecking && result !== 'none' && (
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  result === 'match' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {result === 'match' ? <Check className="w-10 h-10" /> : <X className="w-10 h-10" />}
                </div>
                <h3 className="text-2xl font-bold mb-1">
                  {result === 'match' ? 'Signature genuine' : 'Possible forgery'}
                </h3>
                <p className="text-slate-600 text-sm">
                  {result === 'match'
                    ? 'The signature looks consistent with an authentic signature.'
                    : 'The signature shows signs of inconsistency and possible forgery.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Result summary */}
        {result !== 'none' && !isChecking && report && (
          <div className="mt-8 border-t border-slate-200 pt-8">
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="flex items-center justify-center gap-8">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</p>
                  <p className="text-3xl font-black text-slate-900">
                    {report.score}<span className="text-base font-semibold text-slate-400">/100</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk</p>
                  <p className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                    result === 'match' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result === 'match' ? 'Low' : 'High'}
                  </p>
                </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Confidence</p>
                    <p className="text-3xl font-black text-slate-900">{report.confidence}%</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadReport}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4" />
                  Download PDF Report
                </button>
              </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {analysis &&
                [
                  { label: 'Stroke consistency', ok: analysis.metrics.strokeWidthCV < 0.6, detail: `CV ${analysis.metrics.strokeWidthCV.toFixed(2)}` },
                  { label: 'Pen pressure', ok: analysis.metrics.pressureVariance >= 20 && analysis.metrics.pressureVariance <= 80, detail: `Var ${analysis.metrics.pressureVariance}` },
                  { label: 'Stroke smoothness', ok: analysis.metrics.smoothness > 45, detail: `${analysis.metrics.smoothness}/100` },
                  { label: 'Ink coverage', ok: analysis.metrics.inkCoverage < 30, detail: `${analysis.metrics.inkCoverage}%` },
                ].map((row) => (
                <div key={row.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm">
                  <span className="font-semibold text-slate-700">{row.label}</span>
                  <span className={`flex items-center gap-1.5 font-bold ${row.ok ? 'text-green-700' : 'text-red-700'}`}>
                    {row.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />} {row.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
