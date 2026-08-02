'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Camera, FileSignature, Printer, LayoutDashboard, Loader2 } from 'lucide-react';
import OCRUpload from '@/components/ocr-upload';
import OCRResult from '@/components/ocr-result';
import type { ForensicsResult } from '@/lib/forensics-analyzer';
import PhotoMatch from '@/components/photo-match';
import SignatureCheck from '@/components/signature-check';
import LiveStream from '@/components/live-stream';
import DashboardSummary from '@/components/dashboard-summary';
import { getLoggedInUser } from '@/lib/auth';

interface ExtractionResult {
  text: string;
  confidence: number;
  language: string;
  processingTime: number;
  forensics?: ForensicsResult;
}

export interface ModuleReport {
  score: number;
  status: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  isCompleted: boolean;
  details?: any;
}

type TabId = 'dashboard' | 'document' | 'photo' | 'signature' | 'hardware';

const tabs: { id: TabId; label: string; icon: any; activeClass: string }[] = [
  { id: 'dashboard', label: 'Dashboard Summary', icon: LayoutDashboard, activeClass: 'bg-slate-900 text-white shadow-md' },
  { id: 'document', label: 'Document Scanner', icon: FileText, activeClass: 'bg-blue-600 text-white shadow-md' },
  { id: 'photo', label: 'Photo Match', icon: Camera, activeClass: 'bg-green-600 text-white shadow-md' },
  { id: 'signature', label: 'Signature Check', icon: FileSignature, activeClass: 'bg-indigo-600 text-white shadow-md' },
  { id: 'hardware', label: 'Hardware Stream', icon: Printer, activeClass: 'bg-purple-600 text-white shadow-md' },
];

function emptyReport(): ModuleReport {
  return { score: 0, status: 'Not scanned', risk: 'LOW', confidence: 0, isCompleted: false };
}

export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  const [reports, setReports] = useState<Record<TabId, ModuleReport>>({
    dashboard: emptyReport(),
    document: emptyReport(),
    photo: emptyReport(),
    signature: emptyReport(),
    hardware: emptyReport(),
  });

  // Auth guard: require login before using the scanner
  useEffect(() => {
    if (!getLoggedInUser()) {
      router.replace('/login?next=/scanner');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  // Read ?tab= from URL (deep links from landing page)
  useEffect(() => {
    if (checkingAuth) return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as TabId | null;
    if (tab && tabs.some((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [checkingAuth]);

  const handleDocumentResult = (res: ExtractionResult | null) => {
    setResult(res);
    if (res && res.forensics) {
      const forensics = res.forensics;
      const isGenuine = forensics.riskLevel === 'genuine';
      setReports((prev) => ({
        ...prev,
        document: {
          score: forensics.suspicionScore ?? 95,
          status: isGenuine ? 'Genuine' : forensics.riskLevel === 'suspicious' ? 'Suspicious' : 'Fake',
          risk: isGenuine ? 'LOW' : 'HIGH',
          confidence: Math.round(res.confidence * 100) || 96,
          isCompleted: true,
        },
      }));
    }
  };

  const handlePhotoUpdate = (rep: ModuleReport) =>
    setReports((prev) => ({ ...prev, photo: rep }));

  const handleSignatureUpdate = (rep: ModuleReport) =>
    setReports((prev) => ({ ...prev, signature: rep }));

  const handleHardwareUpdate = (rep: ModuleReport) =>
    setReports((prev) => ({ ...prev, hardware: rep }));

  if (checkingAuth) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Checking your session...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push('/')}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        {/* Tabs Navigation */}
        <div className="mb-10 flex flex-wrap justify-center gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-sm backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? tab.activeClass
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <DashboardSummary reports={reports} onTabChange={setActiveTab} />
        )}

        {activeTab === 'document' && (
          <div>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-extrabold text-slate-900">Document Scanner</h1>
              <p className="mt-2 text-slate-600">
                Select your document type, then upload or capture to begin forensic detection.
              </p>
            </div>
            {!result ? (
              <OCRUpload
                onResult={handleDocumentResult}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            ) : (
              <OCRResult result={result} onReset={() => setResult(null)} />
            )}
          </div>
        )}

        {activeTab === 'photo' && <PhotoMatch onUpdateReport={handlePhotoUpdate} />}

        {activeTab === 'signature' && <SignatureCheck onUpdateReport={handleSignatureUpdate} />}

        {activeTab === 'hardware' && <LiveStream onUpdateReport={handleHardwareUpdate} />}
      </div>
    </main>
  );
}
