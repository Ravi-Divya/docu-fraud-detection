import { useState } from 'react';
import { ShieldCheck, Search, Check, X, FileSignature, Upload, CheckCircle, Info } from 'lucide-react';

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

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setUploadedImage(url);
      setResult('none');
      setReport(null);
    }
  };

  const verifySignature = () => {
    if (!uploadedImage) return;
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      const isMatch = Math.random() > 0.4;
      const scoreValue = isMatch ? 94 : 29;
      const riskValue = isMatch ? 'LOW' : 'HIGH';
      const statusValue = isMatch ? 'Genuine' : 'Forgery';
      
      const newReport: ModuleReport = {
        score: scoreValue,
        status: statusValue,
        risk: riskValue as any,
        confidence: isMatch ? 95 : 93,
        isCompleted: true,
        details: {
          signatureId: `SIG-${1000 + Math.floor(Math.random() * 9000)}-B`,
          referenceSignature: 'REF-SIG-JOHN-HANCOCK.png',
          uploadTime: new Date().toLocaleTimeString()
        }
      };

      setReport(newReport);
      setResult(isMatch ? 'match' : 'mismatch');
      if (onUpdateReport) {
        onUpdateReport(newReport);
      }
    }, 2000);
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
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4 text-blue-600">
            <FileSignature className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Bank Employee Signature Verification</h1>
          <p className="text-lg text-slate-600">Upload a cropped signature or a signed document to verify its unique identity against the bank's database.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            
            {/* Upload Area */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">1. Upload Signature Sample</h2>
              
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
                    <span className="text-sm text-slate-500 mt-2 text-center">JPG, PNG, WebP supported</span>
                  </div>
                )}
              </label>

              <div className="flex gap-4">
                <input type="text" placeholder="Account Number or ID (Optional)" className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <button 
                onClick={verifySignature}
                disabled={!uploadedImage || isChecking}
                className="w-full bg-blue-600 text-white font-bold rounded-xl px-6 py-4 flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md animate-pulse-subtle"
              >
                {isChecking ? <Search className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                {isChecking ? 'Verifying Identity...' : 'Check Signature Match'}
              </button>
            </div>

            {/* Verification Processing Indicator Area */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 h-full flex flex-col justify-center min-h-[300px]">
              {result === 'none' && !isChecking && (
                <div className="text-center text-slate-400">
                  <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Awaiting signature upload and verification.</p>
                </div>
              )}

              {isChecking && (
                <div className="text-center text-blue-500 animate-pulse">
                  <Search className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-bold">Analyzing Signature Biometrics...</h3>
                  <p className="text-sm text-slate-500 mt-2">Checking loop sizes, pressure points, and slant...</p>
                </div>
              )}

              {!isChecking && result !== 'none' && (
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    result === 'match' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {result === 'match' ? <Check className="w-10 h-10" /> : <X className="w-10 h-10" />}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{result === 'match' ? 'Signature Verified' : 'Forgery Alert'}</h3>
                  <p className="text-slate-600 text-sm">
                    {result === 'match' 
                      ? 'This signature mathematically matches the reference signature on file.' 
                      : 'This signature exhibits signs of inconsistency and potential forgery.'}
                  </p>
                </div>
              )}
            </div>
            
          </div>

          {/* Detailed Forensic Report */}
          {result !== 'none' && !isChecking && report && (
            <div className="mt-12 space-y-8 border-t border-slate-200 pt-8">
              <div className="text-center">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                  result === 'match' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result === 'match' ? 'Signature Authentic' : 'Signature Forged / Mismatch'}
                </span>
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2">Signature Check Forensic Report</h3>
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-left">
                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FileSignature className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Signature ID</p>
                    <p className="text-sm font-bold text-slate-800">{report.details.signatureId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Reference Signature</p>
                    <p className="text-sm font-bold text-slate-800 truncate" title={report.details.referenceSignature}>{report.details.referenceSignature}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Upload Time</p>
                    <p className="text-sm font-bold text-slate-800">{report.details.uploadTime}</p>
                  </div>
                </div>
              </div>

              {/* AI Detection Results */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left">
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
                        <th className="px-6 py-4">Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Signature Match</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${result === 'match' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {result === 'match' ? '95% Match' : '23% Match'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">{result === 'match' ? '95%' : '98%'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Forgery Probability</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${result === 'match' ? 'text-slate-600' : 'text-red-600'}`}>
                            {result === 'match' ? '7%' : '92%'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">{result === 'match' ? '93%' : '96%'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Stroke Consistency</td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700">{result === 'match' ? 'Good' : 'Poor (Hesitation)'}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">{result === 'match' ? '94%' : '91%'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Pen Pressure</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{result === 'match' ? 'Normal' : 'Irregular'}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">{result === 'match' ? '91%' : '88%'}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Writing Speed</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{result === 'match' ? 'Similar' : 'Inconsistent'}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">90%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Shape Similarity</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-blue-600">{result === 'match' ? '96%' : '42%'}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">96%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Angle Difference</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{result === 'match' ? 'Low' : 'High'}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">95%</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 font-semibold text-slate-700">Size Difference</td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{result === 'match' ? 'Low' : 'Medium'}</td>
                        <td className="px-6 py-4 font-bold text-slate-600">94%</td>
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
                    ? `Signature matches the reference with 95% confidence. No significant signs of forgery were detected.`
                    : `Signature shows a high probability of forgery (92%). The stroke line reveals high speed hesitation and tremor patterns indicating drawing rather than rapid signature execution.`
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
                            <span>Signature appears authentic.</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-emerald-500 font-bold">✓</span>
                            <span>Manual verification recommended only for high-value legal or financial documents.</span>
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-red-500 font-bold">✗</span>
                            <span>Reject the signature as invalid/forged.</span>
                          </li>
                          <li className="flex items-start gap-2.5 text-sm text-slate-600">
                            <span className="text-red-500 font-bold">✗</span>
                            <span>Verify ID proof manually and contact the account owner.</span>
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
                      <p className="text-sm font-extrabold text-slate-700 tracking-wider uppercase mb-2">Signature Trust Score</p>
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
