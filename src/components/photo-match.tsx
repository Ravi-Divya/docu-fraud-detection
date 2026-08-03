import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, UserCheck, X, Check, Download } from 'lucide-react';
import { downloadPDFReport } from '@/lib/pdf-report';
import { verifyFaces, warmUpFaceModels, type FaceVerifyResult } from '@/lib/face-verify';

interface ModuleReport {
  score: number;
  status: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  isCompleted: boolean;
  details?: any;
}

interface PhotoMatchProps {
  onUpdateReport?: (report: ModuleReport) => void;
}

export default function PhotoMatch({ onUpdateReport }: PhotoMatchProps) {
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [liveImage, setLiveImage] = useState<string | null>(null);
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<'none' | 'match' | 'mismatch'>('none');
  const [report, setReport] = useState<ModuleReport | null>(null);
  const [verification, setVerification] = useState<FaceVerifyResult | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Attach the stream once the <video> element is mounted (it only renders
  // after isLiveStream becomes true).
  useEffect(() => {
    if (isLiveStream && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isLiveStream]);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setDocumentImage(url);
      setResult('none');
      setReport(null);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setIsLiveStream(true);
      setLiveImage(null);
      setResult('none');
      setReport(null);
    } catch (err) {
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsLiveStream(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const captureLiveImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setLiveImage(dataUrl);
      }
    }
  };

  const verifyIdentity = async () => {
    if (!documentImage || !liveImage) return;
    setIsChecking(true);
    setVerification(null);
    setLoadingModels(true);
    try {
      await warmUpFaceModels();
      setLoadingModels(false);
      const verdict = await verifyFaces(documentImage, liveImage);
      setVerification(verdict);

      const isMatch = verdict.ok && verdict.isMatch;
      const scoreValue = isMatch ? verdict.similarity : 34;
      const riskValue = isMatch ? 'LOW' : 'HIGH';
      const statusValue = isMatch ? 'Authentic' : 'Mismatch';

      const newReport: ModuleReport = {
        score: scoreValue,
        status: statusValue,
        risk: riskValue as any,
        confidence: isMatch ? verdict.confidence : Math.min(verdict.confidence, 95),
        isCompleted: true,
        details: {
          descriptorDistance: verdict.ok
            ? verdict.message.split('—')[1]?.trim().split(' ')[0] ?? 'N/A'
            : 'N/A',
          idFaceDetected: verdict.idFaceDetected ? 'Yes' : 'No',
          liveFaceDetected: verdict.liveFaceDetected ? 'Yes' : 'No',
          photoQuality: verdict.quality,
          similarity: `${verdict.similarity}%`,
        },
      };

      setReport(newReport);
      setResult(isMatch ? 'match' : 'mismatch');
      if (onUpdateReport) {
        onUpdateReport(newReport);
      }
    } catch (e: any) {
      setLoadingModels(false);
      setVerification({
        ok: false,
        message: e?.message || 'Face verification failed. Please try again.',
        isMatch: false,
        similarity: 0,
        confidence: 0,
        idFaceDetected: false,
        liveFaceDetected: false,
        idSharpness: 0,
        liveSharpness: 0,
        quality: 'Low',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    downloadPDFReport(
      {
        title: 'DocuGuard Forensic Report - Photo Match',
        subtitle: 'Live facial biometric verification',
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
            heading: 'VERIFICATION CHECKS',
            lines: verification
              ? [
                  `Facial similarity: ${verification.similarity}%`,
                  `Descriptor distance: ${verification.message.split('—')[1]?.trim() ?? 'N/A'}`,
                  `Face detected in ID photo: ${verification.idFaceDetected ? 'Yes' : 'No'}`,
                  `Face detected in live capture: ${verification.liveFaceDetected ? 'Yes' : 'No'}`,
                  `Photo quality: ${verification.quality}`,
                  `Live capture sharpness: ${Math.round(verification.liveSharpness)}/100`,
                ]
              : [],
          },
        ],
      },
      `docuguard-photo-match-report-${Date.now()}.pdf`
    );
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW':
        return { bg: 'bg-green-50/50', border: 'border-green-200', text: 'text-green-900', badge: 'bg-green-600 text-white', indicator: '🟢 LOW' };
      case 'MEDIUM':
        return { bg: 'bg-yellow-50/50', border: 'border-yellow-200', text: 'text-yellow-900', badge: 'bg-yellow-600 text-white', indicator: '🟡 MEDIUM' };
      case 'HIGH':
        return { bg: 'bg-red-50/50', border: 'border-red-200', text: 'text-red-900', badge: 'bg-red-600 text-white', indicator: '🔴 HIGH' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900', badge: 'bg-gray-600 text-white', indicator: '⚪ UNKNOWN' };
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-2xl mb-4 text-green-600">
            <UserCheck className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Live Photo Match</h1>
          <p className="text-lg text-slate-600">Upload an official ID document and take a live photo to verify the identity matches.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Document Upload Area */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">1</span>
                Upload ID Document
              </h2>
              
              <label className="block w-full border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-6 text-center cursor-pointer h-64">
                <input type="file" className="hidden" accept="image/*" onChange={handleDocumentUpload} />
                {documentImage ? (
                  <div className="relative h-full w-full">
                    <img src={documentImage} alt="Uploaded Document" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Upload className="w-8 h-8 mb-3 opacity-80" />
                    <span className="font-semibold">Click to upload ID photo</span>
                  </div>
                )}
              </label>
            </div>

            {/* Live Camera Area */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">2</span>
                Capture Live Photo
              </h2>
              
              <div className="w-full border-2 border-slate-200 bg-slate-50 rounded-2xl p-2 text-center h-64 relative overflow-hidden flex flex-col items-center justify-center">
                {isLiveStream ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover rounded-xl ${isChecking ? 'brightness-90' : ''}`} />

                    {/* captured snapshot preview — camera stays ON */}
                    {liveImage && !isChecking && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 bg-white/90 backdrop-blur rounded-xl p-1.5 pr-3 shadow-lg">
                        <img src={liveImage} alt="Captured" className="w-12 h-12 object-cover rounded-lg border border-green-200" />
                        <div className="text-left">
                          <p className="text-xs font-bold text-green-700 flex items-center gap-1"><Check className="w-3 h-3" /> Photo captured</p>
                          <p className="text-[11px] text-slate-500">Live feed still running</p>
                        </div>
                      </div>
                    )}

                    {/* verifying overlay — live feed stays visible behind */}
                    {isChecking && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/40 backdrop-blur-[2px] rounded-xl">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-green-400 border-t-transparent animate-spin"></div>
                          <UserCheck className="absolute inset-0 m-auto w-7 h-7 text-white" />
                        </div>
                        <p className="text-white font-bold text-sm tracking-wide animate-pulse">
                          {loadingModels ? 'Loading AI face recognition models...' : 'Verifying Facial Biometrics...'}
                        </p>
                        <p className="text-white/75 text-xs">
                          {loadingModels ? 'Downloading models (one time, ~12 MB)' : 'Comparing face descriptors in real time'}
                        </p>
                      </div>
                    )}

                    {/* result badge on live feed */}
                    {result !== 'none' && !isChecking && (
                      <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
                        result === 'match' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {result === 'match' ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        {result === 'match' ? 'Match' : 'Mismatch'}
                      </div>
                    )}

                    {/* take / retake photo — hidden while verifying */}
                    {!isChecking && (
                      <button onClick={captureLiveImage} className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700">
                        {liveImage ? 'Retake Photo' : 'Take Photo'}
                      </button>
                    )}

                    {/* manual stop camera */}
                    <button onClick={stopCamera} disabled={isChecking} title="Stop camera" className="absolute bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600 disabled:opacity-40">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : liveImage ? (
                  <div className="relative h-full w-full">
                    <img src={liveImage} alt="Live Capture" className="w-full h-full object-cover rounded-xl" />
                    <button onClick={startCamera} className="absolute top-4 right-4 bg-white/80 backdrop-blur text-slate-800 px-3 py-1 text-sm rounded-full font-medium shadow hover:bg-white">
                      Restart Camera
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Camera className="w-8 h-8 mb-3 opacity-80" />
                    <button onClick={startCamera} className="bg-slate-800 text-white px-6 py-2 rounded-full font-semibold hover:bg-slate-700">
                      Start Camera
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification Action */}
          <div className="mt-8 border-t border-slate-100 pt-8 text-center">
            <button 
              onClick={verifyIdentity}
              disabled={!documentImage || !liveImage || isChecking}
              className="bg-green-600 text-white font-bold rounded-xl px-12 py-4 text-lg inline-flex items-center justify-center gap-3 hover:bg-green-700 disabled:opacity-50 disabled:bg-slate-400 transition-colors shadow-lg"
            >
              {isChecking ? <UserCheck className="w-6 h-6 animate-pulse" /> : <UserCheck className="w-6 h-6" />}
              {isChecking ? 'Verifying Facial Biometrics...' : 'Verify Identity Match'}
            </button>
            {isChecking && (
              <p className="mt-3 text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live camera stays on while the check runs — you stay visible during verification.
              </p>
            )}
          </div>

          {/* Result */}
          {result !== 'none' && !isChecking && report && (
            <div className="mt-10 border-t border-slate-200 pt-8">
              <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                  result === 'match' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {result === 'match' ? <Check className="h-8 w-8" /> : <X className="h-8 w-8" />}
                </div>
                <p className={`text-sm font-black uppercase tracking-widest ${result === 'match' ? 'text-green-700' : 'text-red-700'}`}>
                  {result === 'match' ? 'Verified' : 'Mismatch Detected'}
                </p>
                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  {result === 'match' ? 'Identity confirmed' : 'Face does not match'}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {result === 'match'
                    ? 'The live photo and the ID document show the same person.'
                    : 'The live photo does not match the uploaded ID document.'}
                </p>
                <div className="mt-6 flex items-center justify-center gap-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Score</p>
                    <p className="text-3xl font-black text-slate-900">{report.score}<span className="text-base font-semibold text-slate-400">/100</span></p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Risk</p>
                    <p className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${result === 'match' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                {verification &&
                  [
                    { label: 'Facial similarity', ok: result === 'match', detail: `${verification.similarity}%` },
                    { label: 'Face in ID photo', ok: verification.idFaceDetected, detail: verification.idFaceDetected ? 'Detected' : 'Not found' },
                    { label: 'Face in live capture', ok: verification.liveFaceDetected, detail: verification.liveFaceDetected ? 'Detected' : 'Not found' },
                    { label: 'Photo quality', ok: verification.quality !== 'Low', detail: verification.quality },
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
    </div>
  );
}
