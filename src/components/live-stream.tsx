import { useState, useEffect } from 'react';
import { Activity, Printer, Check, X, Download } from 'lucide-react';
import { downloadPDFReport } from '@/lib/pdf-report';

type ScannedDoc = {
  id: string;
  time: string;
  source: string;
  status: 'scanning' | 'analyzing' | 'clean' | 'fraud';
  confidence: number;
  deviceName?: string;
  deviceType?: string;
  manufacturer?: string;
  serialNumber?: string;
};

interface ModuleReport {
  score: number;
  status: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  isCompleted: boolean;
  details?: any;
}

interface LiveStreamProps {
  onUpdateReport?: (report: ModuleReport) => void;
}

export default function LiveStream({ onUpdateReport }: LiveStreamProps) {
  const [docs, setDocs] = useState<ScannedDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ScannedDoc | null>(null);

  useEffect(() => {
    const initialDocs: ScannedDoc[] = [
      {
        id: 'DOC-7729',
        time: new Date(Date.now() - 60000).toLocaleTimeString(),
        source: 'Mee Seva Scanner 1',
        status: 'clean',
        confidence: 96.5,
        deviceName: 'HP ScanJet Pro 3000',
        deviceType: 'Document Scanner',
        manufacturer: 'HP Inc.',
        serialNumber: 'CN73H9S10B',
      },
      {
        id: 'DOC-8841',
        time: new Date(Date.now() - 120000).toLocaleTimeString(),
        source: 'Bank Printer A',
        status: 'fraud',
        confidence: 45.2,
        deviceName: 'Xerox VersaLink C400',
        deviceType: 'Multifunction Printer',
        manufacturer: 'Xerox Corp',
        serialNumber: 'XR88F3L12C',
      },
    ];
    setDocs(initialDocs);

    const interval = setInterval(() => {
      const newDoc: ScannedDoc = {
        id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
        time: new Date().toLocaleTimeString(),
        source: ['Mee Seva Scanner 1', 'Mee Seva Scanner 2', 'Bank Printer A'][Math.floor(Math.random() * 3)],
        status: 'scanning',
        confidence: 0,
        deviceName: ['HP ScanJet Pro 3000', 'Canon imageCLASS', 'Xerox VersaLink C400'][Math.floor(Math.random() * 3)],
        deviceType: 'Document Scanner',
        manufacturer: ['HP Inc.', 'Canon Inc.', 'Xerox Corp'][Math.floor(Math.random() * 3)],
        serialNumber: `CN${Math.floor(100000 + Math.random() * 900000)}S10B`,
      };

      setDocs((prev) => [newDoc, ...prev].slice(0, 8));

      setTimeout(() => {
        setDocs((prev) =>
          prev.map((doc) => (doc.id === newDoc.id ? { ...doc, status: 'analyzing' } : doc))
        );

        setTimeout(() => {
          setDocs((prev) =>
            prev.map((doc) => {
              if (doc.id === newDoc.id) {
                const isFraud = Math.random() > 0.7;
                return {
                  ...doc,
                  status: isFraud ? 'fraud' : 'clean',
                  confidence: isFraud ? 45 + Math.random() * 20 : 92 + Math.random() * 7,
                };
              }
              return doc;
            })
          );
        }, 2000);
      }, 1500);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleDownloadReport = () => {
    if (!selectedDoc) return;
    const isClean = selectedDoc.status === 'clean';
    downloadPDFReport(
      {
        title: 'DocuGuard Forensic Report - Hardware Stream',
        subtitle: selectedDoc.deviceName || 'Device report',
        generatedAt: new Date().toLocaleString(),
        rows: [
          { label: 'Document ID', value: selectedDoc.id },
          { label: 'Status', value: isClean ? 'Secure' : 'Risk Detected' },
          { label: 'Score', value: `${isClean ? 96 : 38}/100` },
          { label: 'Confidence', value: `${Math.round(selectedDoc.confidence)}%` },
          { label: 'Device Type', value: selectedDoc.deviceType || '—' },
          { label: 'Manufacturer', value: selectedDoc.manufacturer || '—' },
          { label: 'Serial Number', value: selectedDoc.serialNumber || '—' },
          { label: 'Scan Time', value: selectedDoc.time },
        ],
        sections: [
          {
            heading: 'DEVICE ASSESSMENT',
            lines: [
              isClean
                ? 'Device is operating normally. No malware or threats detected in the scanning buffer.'
                : 'Critical alert: device firmware may be compromised. Suspicious files detected in the scan buffer.',
            ],
          },
        ],
      },
      `docuguard-hardware-report-${Date.now()}.pdf`
    );
  };

  const viewReport = (doc: ScannedDoc) => {
    setSelectedDoc(doc);
    if (onUpdateReport) {
      const isClean = doc.status === 'clean';
      onUpdateReport({
        score: isClean ? 96 : 38,
        status: isClean ? 'Secure' : 'Risk Detected',
        risk: isClean ? 'LOW' : 'HIGH',
        confidence: isClean ? 97 : 91,
        isCompleted: true,
        details: {
          deviceName: doc.deviceName || 'HP ScanJet Pro 3000',
          deviceType: doc.deviceType || 'Document Scanner',
          manufacturer: doc.manufacturer || 'HP Inc.',
          serialNumber: doc.serialNumber || 'CN73H9S10B',
          scanTime: doc.time,
        },
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl bg-blue-100 p-3 text-blue-600">
          <Printer className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Hardware Stream</h1>
        <p className="mt-2 text-slate-600">
          Live feed of documents scanned by connected printers and scanners.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700 animate-pulse">
        <Activity className="h-4 w-4" />
        System active — new scans appear automatically
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Feed list */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Scanned documents</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
            {docs.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">Waiting for scanner data...</div>
            ) : (
              docs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => (doc.status === 'clean' || doc.status === 'fraud') && viewReport(doc)}
                  className={`w-full p-4 text-left transition-all ${
                    selectedDoc?.id === doc.id ? 'bg-blue-50/70 border-l-4 border-blue-500' : 'hover:bg-slate-50'
                  } ${doc.status === 'scanning' || doc.status === 'analyzing' ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 text-sm">{doc.id}</span>
                    <span className="text-xs text-slate-500">{doc.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1.5">{doc.source}</p>
                  {doc.status === 'scanning' && <span className="text-xs text-blue-600 font-medium animate-pulse">Scanning...</span>}
                  {doc.status === 'analyzing' && <span className="text-xs text-blue-600 font-medium animate-pulse">Analyzing...</span>}
                  {doc.status === 'clean' && <span className="text-xs text-green-600 font-bold">Secure</span>}
                  {doc.status === 'fraud' && <span className="text-xs text-red-600 font-bold">Threat detected</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail card */}
        {selectedDoc ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Device report</p>
            <h3 className="text-xl font-black text-slate-900 mt-1 mb-5">
              {selectedDoc.deviceName || 'HP ScanJet Pro 3000'}
            </h3>

            <div className={`rounded-2xl p-6 text-center border ${
              selectedDoc.status === 'clean' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full ${
                selectedDoc.status === 'clean' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {selectedDoc.status === 'clean' ? <Check className="h-7 w-7" /> : <X className="h-7 w-7" />}
              </div>
              <p className={`text-sm font-black uppercase tracking-widest ${
                selectedDoc.status === 'clean' ? 'text-green-700' : 'text-red-700'
              }`}>
                {selectedDoc.status === 'clean' ? 'Device secure' : 'Risk detected'}
              </p>
              <div className="mt-4 flex items-center justify-center gap-6">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Score</p>
                  <p className="text-2xl font-black text-slate-900">
                    {selectedDoc.status === 'clean' ? 96 : 38}<span className="text-sm text-slate-400">/100</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400">Confidence</p>
                  <p className="text-2xl font-black text-slate-900">{Math.round(selectedDoc.confidence)}%</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Device type', value: selectedDoc.deviceType || 'Document Scanner' },
                { label: 'Manufacturer', value: selectedDoc.manufacturer || 'HP Inc.' },
                { label: 'Serial number', value: selectedDoc.serialNumber || '—' },
                { label: 'Scan time', value: selectedDoc.time },
              ].map((row) => (
                <div key={row.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-slate-400 font-semibold uppercase">{row.label}</p>
                  <p className="font-bold text-slate-800 mt-0.5">{row.value}</p>
                </div>
              ))}
            </div>

            <p className={`mt-5 rounded-r-xl border-l-4 p-4 text-sm leading-relaxed ${
              selectedDoc.status === 'clean'
                ? 'border-green-500 bg-green-50 text-slate-700'
                : 'border-red-500 bg-red-50 text-slate-700'
            }`}>
              {selectedDoc.status === 'clean'
                ? 'Device is operating normally. No malware or threats detected in the scanning buffer.'
                : 'Critical alert: device firmware may be compromised. Suspicious files detected in the scan buffer.'}
            </p>

            <button
              onClick={handleDownloadReport}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              <Download className="h-4 w-4" />
              Download PDF Report
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
            <Printer className="h-14 w-14 mb-3 opacity-40" />
            <p className="font-bold text-slate-600">No document selected</p>
            <p className="text-sm mt-1">Click a finished scan to see its report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
