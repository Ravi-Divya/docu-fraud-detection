'use client';

import { useRef, useState, useEffect } from 'react';
import { Upload, Loader2, Camera, X, FileText, FlaskConical } from 'lucide-react';
import { processPDF, processImage, processDOCX } from '@/lib/ocr-processor';
import type { ForensicsResult } from '@/lib/forensics-analyzer';

interface OCRUploadProps {
  onResult: (result: {
    text: string;
    confidence: number;
    language: string;
    processingTime: number;
    forensics?: ForensicsResult;
  }) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export type DocumentCategory =
  | 'auto'
  | 'pan'
  | 'aadhaar'
  | 'voter_id'
  | 'license'
  | 'marksheet'
  | 'business_contract'
  | 'employee_contract'
  | 'house_rent';

const documentTypes: { value: DocumentCategory; label: string; emoji: string }[] = [
  { value: 'auto', label: 'Auto-detect', emoji: '🤖' },
  { value: 'pan', label: 'PAN Card', emoji: '🪪' },
  { value: 'aadhaar', label: 'Aadhaar Card', emoji: '🆔' },
  { value: 'voter_id', label: 'Voter ID', emoji: '🗳️' },
  { value: 'license', label: 'Driving License', emoji: '🚗' },
  { value: 'marksheet', label: 'Marksheet', emoji: '🎓' },
  { value: 'business_contract', label: 'Business Contract', emoji: '📑' },
  { value: 'employee_contract', label: 'Employee Contract', emoji: '🤝' },
  { value: 'house_rent', label: 'House Rent Agreement', emoji: '🏠' },
];

const samples = [
  { label: 'Authentic Contract', file: '/samples/authentic_contract.jpg', type: 'image/jpeg' },
  { label: 'Tampered Contract', file: '/samples/tampered_contract.jpg', type: 'image/jpeg' },
  { label: 'Real Signature', file: '/samples/signature_real.png', type: 'image/png' },
  { label: 'Forged Signature', file: '/samples/signature_forged.png', type: 'image/png' },
];

export default function OCRUpload({ onResult, isLoading, setIsLoading }: OCRUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentCategory>('auto');
  const [isLiveStream, setIsLiveStream] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsLiveStream(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsLiveStream(true);
    } catch {
      alert('Unable to access camera. Please check browser permissions.');
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'live-stream-capture.jpg', { type: 'image/jpeg' });
          stopCamera();
          handleFile(file);
        }
      }, 'image/jpeg');
    }
  };

  const handleFile = async (file: File) => {
    if (!file) return;

    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx')) {
      alert('Please upload an image, PDF, or Word document.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File too large. Please upload files smaller than 50MB.');
      return;
    }

    setIsLoading(true);
    try {
      const startTime = Date.now();
      let result;

      if (file.type === 'application/pdf') {
        result = await processPDF(file, documentType);
      } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
        result = await processDOCX(file, documentType);
      } else {
        result = await processImage(file, documentType);
      }

      onResult({
        text: result.text,
        confidence: result.confidence,
        language: result.language || 'English',
        processingTime: Date.now() - startTime,
        forensics: result.forensics,
      });
    } catch (error) {
      console.error('OCR Error:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Error processing file: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = async (url: string, type: string, label: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const ext = url.split('.').pop() || 'jpg';
      const file = new File([blob], `${label.replace(/\s+/g, '_').toLowerCase()}.${ext}`, { type });
      await handleFile(file);
    } catch (err) {
      console.error('Failed to load sample:', err);
      alert('Could not load the sample file. Please upload your own document instead.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) handleFile(files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) handleFile(files[0]);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Document type selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold text-slate-800">1. Select document type</p>
        <div className="flex flex-wrap gap-2">
          {documentTypes.map((doc) => (
            <button
              key={doc.value}
              onClick={() => setDocumentType(doc.value)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                documentType === doc.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {doc.emoji} {doc.label}
            </button>
          ))}
        </div>
      </div>

      {isLiveStream && (
        <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-black">
          <video ref={videoRef} autoPlay playsInline className="max-h-[60vh] w-full object-contain" />
          <div className="absolute right-4 top-4 z-10">
            <button
              onClick={stopCamera}
              className="rounded-full bg-red-600 p-2 text-white shadow-lg transition-colors hover:bg-red-700"
              aria-label="Stop camera"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center">
            <button
              onClick={captureImage}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-colors hover:bg-blue-700"
            >
              <Camera className="h-5 w-5" /> Capture & Scan
            </button>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleChange}
        className="hidden"
      />

      {/* Upload dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-blue-200 bg-white hover:border-blue-300'
        } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex w-full flex-col items-center justify-center gap-4 px-8 py-14"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900">Processing your file...</p>
                <p className="mt-1 text-sm text-slate-500">
                  Running OCR + pixel forensics + AI review
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-blue-500" />
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900">
                  {dragActive ? 'Drop your file here' : 'Drag & drop your file'}
                </p>
                <p className="mt-1 text-sm text-slate-500">or click to browse</p>
                <p className="mt-3 text-xs text-slate-400">
                  Supported: PNG, JPG, WebP, PDF, DOCX (up to 50MB)
                </p>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Live camera + samples */}
      {!isLoading && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={startCamera}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-700"
          >
            <Camera className="h-4 w-4" /> Scan with Camera
          </button>
          <button
            onClick={() => setShowSamples((v) => !v)}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-700"
          >
            <FlaskConical className="h-4 w-4" /> Try a Sample Document
          </button>
        </div>
      )}

      {showSamples && !isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
            <FlaskConical className="h-4 w-4 text-blue-600" />
            Sample files from the DocuGuard dataset folder
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {samples.map((sample) => (
              <button
                key={sample.file}
                onClick={() => loadSample(sample.file, sample.type, sample.label)}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-all hover:border-blue-300 hover:bg-blue-50"
              >
                <span className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                  <FileText className="h-4 w-4" />
                </span>
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
