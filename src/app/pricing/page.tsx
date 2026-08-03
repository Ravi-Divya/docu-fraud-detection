import Link from 'next/link'
import { Check, Rocket } from 'lucide-react'

export default function Pricing() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Pricing</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Start with our free plan. No credit card required.
          </p>
        </div>

        <div className="mx-auto grid max-w-md gap-8">
          <div className="relative flex flex-col rounded-3xl border border-blue-200 bg-white p-8 shadow-sm transition-all hover:shadow-lg">
            <div className="mb-5 inline-flex w-fit rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <Rocket className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Free</h2>
            <p className="mt-2 text-sm text-slate-500">
              For individuals testing document verification.
            </p>

            <div className="mt-6 flex items-end gap-1">
              <span className="text-4xl font-extrabold text-slate-900">$0</span>
              <span className="pb-1 text-sm font-medium text-slate-400">/month</span>
            </div>

            <ul className="mt-8 flex-1 space-y-3.5">
              {[
                '50 document scans / month',
                'OCR + pixel forensics',
                'Signature check module',
                'Standard AI analysis',
                'Email support',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="mt-8 rounded-xl bg-blue-600 py-3.5 text-center text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              Start Free
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
