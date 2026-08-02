import Link from 'next/link';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function About() {
  return (
    <main className="flex-1 w-full bg-slate-50 text-slate-900 min-h-[calc(100vh-4rem)]">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-16 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">About</span>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-900 mb-4">Platform Overview</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">A deep dive into how DocuGuard works, what's possible, and where we're heading in digital authentication.</p>
        </div>

        <div className="space-y-20">
          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-blue-700 text-xl border border-blue-200">1</span>
              How it works
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Perceive</h3>
                <p className="text-slate-600 leading-relaxed">The system ingests documents via advanced OCR, parsing not just text but structure, metadata, and visual artifacts with pixel-perfect precision.</p>
              </div>
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Reason</h3>
                <p className="text-slate-600 leading-relaxed">Our AI models analyze the ingested data against vast datasets of known fraud patterns, looking for inconsistencies and structural anomalies.</p>
              </div>
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Act</h3>
                <p className="text-slate-600 leading-relaxed">It automatically flags anomalies, highlights tampered regions, and generates a detailed confidence score for the document in real-time.</p>
              </div>
              <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Adapt</h3>
                <p className="text-slate-600 leading-relaxed">The system learns from new user corrections and evolving threat vectors to continuously improve and refine its detection rates over time.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 text-xl border border-indigo-200">2</span>
              Three Modes
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm tracking-wide uppercase mt-1 border border-indigo-100">Interactive</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Manual Review Dashboard</h3>
                  <p className="text-slate-600 text-lg">Upload single documents and manually review the AI's step-by-step findings in a rich UI. Perfect for one-off verifications and deep forensic analysis by investigators.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 items-start bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm tracking-wide uppercase mt-1 border border-indigo-100">Workflows</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Batch Processing Pipelines</h3>
                  <p className="text-slate-600 text-lg">Set up pipelines that process hundreds of documents simultaneously. Automatically categorize them into safe, suspicious, and rejected bins based on custom thresholds.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 items-start bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold text-sm tracking-wide uppercase mt-1 border border-indigo-100">Flows</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Seamless API Integration</h3>
                  <p className="text-slate-600 text-lg">Headless operations integrated directly into your existing app infrastructure via REST APIs and Webhooks. Enable real-time verification in your onboarding sequences.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 text-purple-700 text-xl border border-purple-200">3</span>
              Possibilities
            </h2>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-600 text-lg mb-6 font-medium">What you can build with DocuGuard's underlying technology:</p>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                <li className="flex items-center gap-3 text-lg text-slate-700"><CheckCircle2 className="w-6 h-6 text-green-500" /> Signature forgery detection & unique identity tracking</li>
                <li className="flex items-center gap-3 text-lg text-slate-700"><CheckCircle2 className="w-6 h-6 text-green-500" /> Manual bank employee signature verification workflows</li>
                <li className="flex items-center gap-3 text-lg text-slate-700"><CheckCircle2 className="w-6 h-6 text-green-500" /> Live stream webcam scanning for Mee Seva shops</li>
                <li className="flex items-center gap-3 text-lg text-slate-700"><CheckCircle2 className="w-6 h-6 text-green-500" /> Automated KYC verification</li>
                <li className="flex items-center gap-3 text-lg text-slate-700"><CheckCircle2 className="w-6 h-6 text-green-500" /> Insurance claim fraud detection</li>
                <li className="flex items-center gap-3 text-lg text-slate-700"><CheckCircle2 className="w-6 h-6 text-green-500" /> Invoice tampering analysis</li>
                <li className="flex items-center gap-3 text-lg text-slate-700"><CheckCircle2 className="w-6 h-6 text-green-500" /> Contract modification alerts</li>
                <li className="flex items-center gap-3 text-lg text-slate-700"><CheckCircle2 className="w-6 h-6 text-green-500" /> Academic transcript verification</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 text-xl border border-emerald-200">4</span>
              Use Cases
            </h2>
            <div className="border border-slate-200 p-8 rounded-3xl bg-white shadow-sm">
              <h3 className="font-bold text-slate-900 text-xl mb-4">Things it can do right now:</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                  <p className="text-slate-600 text-lg"><strong>Live Stream Scanning:</strong> Instantly check documents through a webcam feed before uploading them. Perfect for fast-paced environments like Mee Seva centers processing licenses and certificates.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                  <p className="text-slate-600 text-lg"><strong>Signature Identity & Verification:</strong> Assign unique identities to signatures, allowing systems to flag discrepancies and enabling bank employees to perform manual verifications on flagged documents.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                  <p className="text-slate-600 text-lg">Extract text securely and locally from standard IDs, passports, official documents, and Word (.docx) files without sending raw images to the cloud.</p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                  <p className="text-slate-600 text-lg">Detect obvious visual tampering like misaligned text, mismatched fonts, altered background patterns, and forged signatures.</p>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-100 text-rose-700 text-xl border border-rose-200">5</span>
              Honest Take
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <CheckCircle2 className="w-32 h-32 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-600 flex items-center gap-3 mb-4 relative z-10">
                  <CheckCircle2 className="w-7 h-7 text-green-600" /> What Works
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed relative z-10">
                  The core layout analysis, offline capability via PWA, local text extraction, and our modern user interface are extremely robust. Finding clear metadata anomalies in PDFs works reliably and quickly, making standard verification a breeze.
                </p>
              </div>
              <div className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <AlertCircle className="w-32 h-32 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-orange-600 flex items-center gap-3 mb-4 relative z-10">
                  <AlertCircle className="w-7 h-7 text-orange-600" /> What Doesn't (Yet)
                </h3>
                <p className="text-slate-600 text-lg leading-relaxed relative z-10">
                  Deep-fake image detection within scanned documents is still experimental. Extremely low-resolution scans or heavily crumpled papers can result in false positives. The "Adapt" learning phase requires more diverse user data before it becomes fully autonomous.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
