import { useState, useEffect } from 'react';
import { Activity, Printer, FileText, CheckCircle, AlertTriangle, ShieldAlert, Check, Info, X } from 'lucide-react';

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
    // Generate initial sample docs to give immediate interactive items
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
        serialNumber: 'CN73H9S10B'
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
        serialNumber: 'XR88F3L12C'
      }
    ];
    setDocs(initialDocs);

    // Simulate live incoming documents from a hardware scanner
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
        serialNumber: `CN${Math.floor(100000 + Math.random() * 900000)}S10B`
      };

      setDocs(prev => [newDoc, ...prev].slice(0, 8));

      // Simulate analysis process
      setTimeout(() => {
        setDocs(prev => prev.map(doc => {
          if (doc.id === newDoc.id) {
            return { ...doc, status: 'analyzing' };
          }
          return doc;
        }));

        setTimeout(() => {
          setDocs(prev => prev.map(doc => {
            if (doc.id === newDoc.id) {
              const isFraud = Math.random() > 0.7;
              return { 
                ...doc, 
                status: isFraud ? 'fraud' : 'clean',
                confidence: isFraud ? 45 + Math.random() * 20 : 92 + Math.random() * 7 
              };
            }
            return doc;
          }));
        }, 2000);
      }, 1500);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const viewReport = (doc: ScannedDoc) => {
    setSelectedDoc(doc);
    
    // Also notify parent page dashboard if callback is provided
    if (onUpdateReport) {
      const isClean = doc.status === 'clean';
      const updatedReport: ModuleReport = {
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
          scanTime: doc.time
        }
      };
      onUpdateReport(updatedReport);
    }
  };

  const getRiskColor = (status: string) => {
    if (status === 'clean') {
      return { bg: 'bg-green-50/50', border: 'border-green-200', text: 'text-green-900', badge: 'bg-green-600 text-white', indicator: '🟢 LOW' };
    }
    return { bg: 'bg-red-50/50', border: 'border-red-200', text: 'text-red-900', badge: 'bg-red-600 text-white', indicator: '🔴 HIGH' };
  };

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Printer className="w-8 h-8 text-blue-600" />
              Hardware Doc Stream
            </h1>
            <p className="text-slate-600 mt-2">Live monitoring of printer/scanner hardware endpoints for instant PDF fraud detection.</p>
          </div>
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold animate-pulse">
            <Activity className="w-5 h-5" />
            System Active
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feed List */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="font-semibold text-slate-800">Scanned Documents</h2>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {docs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                    <Loader className="w-6 h-6 animate-spin mb-3 text-blue-400" />
                    <p className="text-xs">Waiting for scanner data...</p>
                  </div>
                ) : (
                  docs.map(doc => (
                    <div 
                      key={doc.id} 
                      onClick={() => (doc.status === 'clean' || doc.status === 'fraud') && viewReport(doc)}
                      className={`p-4 text-left transition-all cursor-pointer ${
                        selectedDoc?.id === doc.id ? 'bg-blue-50/70 border-l-4 border-blue-500' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 text-sm">{doc.id}</span>
                        <span className="text-xs text-slate-500">{doc.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">Endpoint: {doc.source}</p>
                      <div>
                        {doc.status === 'scanning' && <span className="text-xs text-blue-600 font-medium animate-pulse">Scanning...</span>}
                        {doc.status === 'analyzing' && <span className="text-xs text-purple-600 font-medium animate-pulse">Analyzing...</span>}
                        {doc.status === 'clean' && <span className="text-xs text-green-600 font-bold">✓ Secure</span>}
                        {doc.status === 'fraud' && <span className="text-xs text-red-600 font-bold">✗ Threat Detected</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Details & Forensic Report View */}
          <div className="md:col-span-2">
            {selectedDoc ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Device Scan Report</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">Hardware Stream Forensic Report</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedDoc(null)} 
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm text-left">
                  <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-blue-600" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">Device Name</p>
                      <p className="font-bold text-slate-800">{selectedDoc.deviceName || 'HP ScanJet Pro 3000'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">Device Type</p>
                      <p className="font-bold text-slate-800">{selectedDoc.deviceType || 'Document Scanner'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">Manufacturer</p>
                      <p className="font-bold text-slate-800">{selectedDoc.manufacturer || 'HP Inc.'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">Serial Number</p>
                      <p className="font-bold text-slate-800">{selectedDoc.serialNumber || 'CN73H9S10B'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase">Scan Time</p>
                      <p className="font-bold text-slate-800">{selectedDoc.time}</p>
                    </div>
                  </div>
                </div>

                {/* AI Detection Results Table */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden text-left text-xs">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      AI Detection Results
                    </h4>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase">
                        <th className="px-5 py-2.5">Check</th>
                        <th className="px-5 py-2.5">Status</th>
                        <th className="px-5 py-2.5">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">Device Health</td>
                        <td className="px-5 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedDoc.status === 'clean' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedDoc.status === 'clean' ? 'Good' : 'Critical'}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 font-bold text-slate-500">97%</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">Malware Detected</td>
                        <td className="px-5 py-2.5">
                          <span className={`font-semibold ${selectedDoc.status === 'clean' ? 'text-slate-600' : 'text-red-600 font-bold'}`}>
                            {selectedDoc.status === 'clean' ? 'No' : 'Yes (Rootkit Trojan)'}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 font-bold text-slate-500">99%</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">Suspicious Files</td>
                        <td className="px-5 py-2.5">
                          <span className={`font-semibold ${selectedDoc.status === 'clean' ? 'text-slate-600' : 'text-red-600 font-bold'}`}>
                            {selectedDoc.status === 'clean' ? 'None' : '2 Files'}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 font-bold text-slate-500">91%</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">Unauthorized USB</td>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">{selectedDoc.status === 'clean' ? 'No' : 'Yes'}</td>
                        <td className="px-5 py-2.5 font-bold text-slate-500">95%</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">Storage Integrity</td>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">{selectedDoc.status === 'clean' ? 'Good' : 'Compromised'}</td>
                        <td className="px-5 py-2.5 font-bold text-slate-500">96%</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">File Corruption</td>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">{selectedDoc.status === 'clean' ? 'None' : 'Sectors Damaged'}</td>
                        <td className="px-5 py-2.5 font-bold text-slate-500">98%</td>
                      </tr>
                      <tr>
                        <td className="px-5 py-2.5 font-semibold text-slate-600">Security Risk</td>
                        <td className="px-5 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            selectedDoc.status === 'clean' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedDoc.status === 'clean' ? 'Low' : 'Critical'}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 font-bold text-slate-500">95%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* AI Prediction */}
                <div className="bg-slate-50 border-l-4 border-blue-600 rounded-r-xl p-4 shadow-sm text-left text-xs">
                  <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    AI Prediction
                  </h5>
                  <blockquote className="text-slate-700 italic leading-relaxed">
                    {selectedDoc.status === 'clean'
                      ? 'Device is operating normally. No malware or critical threats were detected in the hardware cache or scanning buffer.'
                      : 'Critical Alert: Local device scanner firmware might be compromised. Two suspicious buffer files detected indicating intercept logging.'
                    }
                  </blockquote>
                </div>

                {/* AI Recommendation & Score */}
                <div className="grid md:grid-cols-2 gap-4 text-left text-xs">
                  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        AI Recommendation
                      </h4>
                      <ul className="space-y-2">
                        {selectedDoc.status === 'clean' ? (
                          <>
                            <li className="flex items-start gap-2 text-slate-600">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>Perform regular antivirus checks.</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-600">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>Remove temporary files regularly.</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-600">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>Continue stream monitoring.</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-2 text-slate-600">
                              <span className="text-red-500 font-bold">✗</span>
                              <span>Isolate scanner hardware endpoint immediately.</span>
                            </li>
                            <li className="flex items-start gap-2 text-slate-600">
                              <span className="text-red-500 font-bold">✗</span>
                              <span>Flash scanner firmware to official version.</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Score */}
                  {(() => {
                    const isClean = selectedDoc.status === 'clean';
                    const colors = getRiskColor(selectedDoc.status);
                    return (
                      <div className={`rounded-xl p-4 border ${colors.border} ${colors.bg} flex flex-col items-center justify-center text-center shadow-sm`}>
                        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">Hardware Security Score</p>
                        <div className="text-3xl font-black text-slate-900 mb-1">
                          {isClean ? 96 : 38} <span className="text-lg font-semibold text-slate-400">/ 100</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colors.badge}`}>
                          Risk Level : {isClean ? '🟢 LOW' : '🔴 HIGH'}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center text-slate-400">
                <Printer className="w-16 h-16 mb-4 opacity-30 text-slate-500 animate-pulse-subtle" />
                <h3 className="font-bold text-slate-700 text-lg">No Document Selected</h3>
                <p className="text-sm mt-1 max-w-sm">Select an active scanner endpoint or doc ID from the left panel to inspect the Hardware Stream Report.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple loader icon component for this page
function Loader(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
