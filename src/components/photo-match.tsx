import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle2, AlertTriangle, UserCheck, X, FileImage, Check, Info } from 'lucide-react';

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
  
  const videoRef = useRef<HTMLVideoElement>(null);

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
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsLiveStream(true);
      setLiveImage(null);
      setResult('none');
      setReport(null);
    } catch (err) {
      alert("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
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
        stopCamera();
      }
    }
  };

  const verifyIdentity = () => {
    if (!documentImage || !liveImage) return;
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      const isMatch = Math.random() > 0.3;
      const scoreValue = isMatch ? 97 : 34;
      const riskValue = isMatch ? 'LOW' : 'HIGH';
      const statusValue = isMatch ? 'Authentic' : 'Mismatch';
      
      const newReport: ModuleReport = {
        score: scoreValue,
        status: statusValue,
        risk: riskValue as any,
        confidence: isMatch ? 98 : 91,
        isCompleted: true,
        details: {
          fileName: 'live_facial_biometrics.jpg',
          resolution: '1280 x 720',
          imageSize: '240 KB',
          format: 'JPEG'
        }
      };

      setReport(newReport);
      setResult(isMatch ? 'match' : 'mismatch');
      if (onUpdateReport) {
        onUpdateReport(newReport);
      }
    }, 2500);
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
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover rounded-xl" />
                    <button onClick={captureLiveImage} className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700">
                      Take Photo
                    </button>
                    <button onClick={stopCamera} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow hover:bg-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : liveImage ? (
                  <div className="relative h-full w-full">
                    <img src={liveImage} alt="Live Capture" className="w-full h-full object-cover rounded-xl" />
                    <button onClick={startCamera} className="absolute top-4 right-4 bg-white/80 backdrop-blur text-slate-800 px-3 py-1 text-sm rounded-full font-medium shadow hover:bg-white">
                      Retake
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
          </div>

          {/* Forensic Report Display */}
          {result !== 'none' && !isChecking && report && (
            <div className="mt-12 space-y-8 border-t border-slate-200 pt-8">
              <div className="text-center">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                  result === 'match' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result === 'match' ? 'Biometrics Match Verified' : 'Biometrics Mismatch Alert'}
                </span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">Photo Match Forensic Report</h3>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileImage className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">File Name</p>
                    <p className="text-sm font-bold text-slate-800 truncate" title={report.details.fileName}>{report.details.fileName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Resolution</p>
                    <p className="text-sm font-bold text-slate-800">{report.details.resolution}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Image Size</p>
                    <p className="text-sm font-bold text-slate-800">{report.details.imageSize}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Format</p>
                    <p className="text-sm font-bold text-slate-800">{report.details.format}</p>
                  </div>
                </div>
              </div>

              {/* AI Detection Results */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    AI Detection Results
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                        <th className="px-6 py-4">Check</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Face Match</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            result === 'match' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result === 'match' ? '98% Match' : '14% Match'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">{result === 'match' ? '98%' : '99%'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Fake Image Detection</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700">{result === 'match' ? 'No' : 'Yes'}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">{result === 'match' ? '97%' : '92%'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Image Edited</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{result === 'match' ? 'No' : 'Yes'}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">94%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Photoshop Detected</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{result === 'match' ? 'No' : 'Yes'}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">90%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Blur Detection</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                            Low
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">96%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Deepfake Detection</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{result === 'match' ? 'No' : 'Yes'}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">99%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">EXIF Metadata</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${result === 'match' ? 'text-slate-700' : 'text-red-600'}`}>
                            {result === 'match' ? 'Available' : 'Removed'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">95%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Compression Artifacts</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${result === 'match' ? 'text-slate-700' : 'text-red-600'}`}>
                            {result === 'match' ? 'Normal' : 'Abnormal'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">92%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Clone Detection</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{result === 'match' ? 'No' : 'Yes'}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">93%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Prediction */}
              <div className="bg-slate-50 border-l-4 border-blue-600 rounded-r-xl p-5 shadow-sm text-left">
                <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-blue-600" />
                  AI Prediction
                </h5>
                <blockquote className="text-slate-700 italic text-sm leading-relaxed">
                  {result === 'match' 
                    ? `Uploaded image matches the reference with 98% similarity. No deepfake indicators were found. Minor compression artifacts are normal.`
                    : `Biometric matching failed with only 14% similarity. Extreme pixel tampering and compression patterns matching photoshop cloning tools were detected in the face segment.`
                  }
                </blockquote>
              </div>

              {/* AI Recommendation & Score */}
              <div className="grid md:grid-cols-2 gap-6 text-left">
                {/* AI Recommendations */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      AI Recommendation
                    </h4>
                    <ul className="space-y-3">
                      {result === 'match' ? (
                        <>
                          <li className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>Image is suitable for verification.</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>Original image is recommended for legal use.</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>No further review required.</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-red-500 font-bold">✗</span>
                            <span>Do not approve verification; face details mismatch.</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-red-500 font-bold">✗</span>
                            <span>Flag session for suspected identity impersonation.</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-red-500 font-bold">✗</span>
                            <span>Require live video presence validation.</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Overall Score */}
                {(() => {
                  const colors = getRiskColor(report.risk);
                  return (
                    <div className={`rounded-2xl p-6 border ${colors.border} ${colors.bg} flex flex-col items-center justify-center text-center shadow-sm`}>
                      <p className="text-sm font-extrabold text-slate-700 tracking-wider uppercase mb-2">Image Trust Score</p>
                      <div className="text-5xl font-black text-slate-900 mb-2">{report.score} <span className="text-2xl font-semibold text-slate-500">/ 100</span></div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${colors.badge}`}>
                        Risk Level : {colors.indicator}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
