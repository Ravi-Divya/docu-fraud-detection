import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

const stats = [
  { value: '99.2%', label: 'Detection accuracy' },
  { value: '12k+', label: 'Documents verified' },
  { value: '<3s', label: 'Median scan time' },
  { value: '4', label: 'Forensic modules' },
]

export default function Page() {
  return (
    <main className="bg-slate-50">
      {/* ------------------------------------------------ HERO */}
      <section className="relative overflow-hidden bg-slate-50">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 55% at 50% -10%, rgba(56,189,248,0.18), transparent), radial-gradient(ellipse 50% 40% at 85% 30%, rgba(14,165,233,0.12), transparent)',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Forensic Document Authentication
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Stop document fraud{' '}
            <span className="bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
              before it happens.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            DocuGuard detects forged documents, tampered signatures, and manipulated photos in
            real time. OCR forensics, photo matching, and hardware stream monitoring in one
            platform.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-3xl font-extrabold text-blue-600">{stat.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ TRUST BAR REMOVED */}
      {/* ------------------------------------------------ FEATURES REMOVED */}
      {/* ------------------------------------------------ HOW IT WORKS REMOVED */}
      {/* ------------------------------------------------ TESTIMONIALS REMOVED */}
      {/* ------------------------------------------------ FINAL CTA REMOVED */}
      {/* ------------------------------------------------ FOOTER NOTE REMOVED */}
    </main>
  )
}
