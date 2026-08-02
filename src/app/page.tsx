import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  ScanSearch,
  FileText,
  Camera,
  FileSignature,
  Printer,
  Sparkles,
  Zap,
  Lock,
  BarChart3,
  CheckCircle2,
  Quote,
} from 'lucide-react'

const stats = [
  { value: '99.2%', label: 'Detection accuracy' },
  { value: '12k+', label: 'Documents verified' },
  { value: '<3s', label: 'Median scan time' },
  { value: '4', label: 'Forensic modules' },
]

const features = [
  {
    icon: ScanSearch,
    title: 'OCR Document Forensics',
    description:
      'Extract text with Tesseract OCR and scan for font inconsistencies, spacing anomalies, and pixel-level tampering artifacts.',
  },
  {
    icon: Camera,
    title: 'Live Photo Match',
    description:
      'Compare a live webcam capture against an uploaded ID photo using biometric similarity checks and deepfake indicators.',
  },
  {
    icon: FileSignature,
    title: 'Signature Verification',
    description:
      'Analyze stroke consistency, pen pressure, writing speed, and shape similarity to detect forged signatures instantly.',
  },
  {
    icon: Printer,
    title: 'Hardware Stream Monitor',
    description:
      'Watch live printer and scanner endpoints for malware, unauthorized USB access, and firmware-level compromise.',
  },
  {
    icon: Sparkles,
    title: 'AI Forensic Report',
    description:
      'Every scan generates a professional forensic report with a fraud score, risk level, and clear recommendations.',
  },
  {
    icon: Lock,
    title: 'Privacy by Design',
    description:
      'Documents are processed locally in the browser. Only extracted text is sent for optional AI analysis — never your raw files.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Upload or capture',
    description:
      'Drop an image, PDF, or Word document. Or stream a live capture from your webcam for photo verification.',
  },
  {
    number: '02',
    title: 'Forensic analysis',
    description:
      'DocuGuard runs OCR, pixel forensics, metadata checks, and AI review to detect every sign of tampering.',
  },
  {
    number: '03',
    title: 'Get the verdict',
    description:
      'Receive a clear 0–100 fraud score with a detailed forensic report and risk-graded recommendations.',
  },
]

const testimonials = [
  {
    quote:
      'DocuGuard caught a forged land document that our manual review missed for two weeks. It now runs at every branch counter.',
    name: 'Priya Sharma',
    role: 'Branch Operations Head, Mee Seva Center',
  },
  {
    quote:
      'The signature verification module is exactly what our tellers needed. Verification time dropped from 10 minutes to seconds.',
    name: 'Rahul Verma',
    role: 'Fraud Risk Manager, Regional Bank',
  },
]

const modules = [
  { icon: FileText, label: 'Document Scanner', color: 'bg-blue-50 text-blue-600', href: '/scanner?tab=document' },
  { icon: Camera, label: 'Photo Match', color: 'bg-green-50 text-green-600', href: '/scanner?tab=photo' },
  { icon: FileSignature, label: 'Signature Check', color: 'bg-indigo-50 text-indigo-600', href: '/scanner?tab=signature' },
  { icon: Printer, label: 'Hardware Stream', color: 'bg-purple-50 text-purple-600', href: '/scanner?tab=hardware' },
]

export default function Page() {
  return (
    <main className="bg-white">
      {/* ------------------------------------------------ HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(59,130,246,0.35), transparent), radial-gradient(ellipse 60% 50% at 80% 40%, rgba(99,102,241,0.25), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 text-center sm:px-6">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Forensic Document Authentication
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Stop document fraud{' '}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              before it happens.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            DocuGuard detects forged documents, tampered signatures, and manipulated photos in
            real time. Advanced OCR forensics, biometric photo matching, and hardware stream
            monitoring in one platform.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/scanner"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-8 py-4 text-base font-bold text-slate-200 backdrop-blur transition-colors hover:border-slate-500 hover:text-white"
            >
              <ScanSearch className="h-5 w-5" />
              Try the Scanner
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ TRUST BAR */}
      <section className="border-b border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">
            Trusted by teams verifying documents across banking, government & legal
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-slate-400">
            {['Mee Seva Centers', 'Regional Banks', 'Insurance Claims', 'Legal Firms', 'Government KYC'].map(
              (org) => (
                <span key={org} className="text-sm font-semibold tracking-wide">
                  {org}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ FEATURES */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Platform Features
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Every angle of document fraud, covered
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Four forensic modules that work together to give you a complete authenticity verdict.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="mb-5 inline-flex rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-3 text-white shadow-md shadow-blue-600/20">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ HOW IT WORKS */}
      <section className="bg-slate-950 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              How It Works
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              From upload to verdict in seconds
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
                <span className="text-5xl font-extrabold text-transparent" style={{ WebkitTextStroke: '1px rgba(96,165,250,0.5)' }}>
                  {step.number}
                </span>
                <h3 className="mt-4 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Module chips */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            {modules.map((module) => (
              <Link
                key={module.label}
                href={module.href}
                className="group flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/60 py-2 pl-2 pr-5 transition-colors hover:border-blue-500/50"
              >
                <span className={`rounded-full p-2 ${module.color}`}>
                  <module.icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-semibold text-slate-300 group-hover:text-white">
                  {module.label}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ TESTIMONIALS */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Customer Stories
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Built for real verification teams
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <Quote className="h-8 w-8 text-blue-200" />
                <blockquote className="mt-4 text-lg font-medium leading-relaxed text-slate-700">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ FINAL CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-8 py-16 text-center shadow-2xl shadow-blue-600/30">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse 60% 60% at 20% 0%, rgba(255,255,255,0.4), transparent), radial-gradient(ellipse 60% 60% at 80% 100%, rgba(255,255,255,0.3), transparent)',
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Verify your next document with confidence
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                Start your 30-day free trial. No credit card required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-blue-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-8 py-4 text-base font-bold text-white backdrop-blur transition-colors hover:bg-white/10"
                >
                  <BarChart3 className="h-5 w-5" />
                  View Pricing
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-blue-100">
                {['Local-first processing', 'GDPR-aware', 'No card required'].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ FOOTER NOTE */}
      <section className="border-t border-slate-200 bg-slate-50 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Your documents never leave the browser for core scanning.
          </span>
          <span>GROQ-powered AI forensics available with API key.</span>
        </div>
      </section>
    </main>
  )
}
