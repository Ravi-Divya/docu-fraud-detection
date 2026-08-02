import Link from 'next/link'
import { Check, Sparkles, Building2, Rocket } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    icon: Rocket,
    price: '$0',
    period: '/month',
    description: 'For individuals testing document verification.',
    features: [
      '50 document scans / month',
      'OCR + pixel forensics',
      'Signature check module',
      'Standard AI analysis',
      'Email support',
    ],
    cta: 'Start Free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    icon: Sparkles,
    price: '$49',
    period: '/month',
    description: 'For verification teams and growing branches.',
    features: [
      'Unlimited document scans',
      'All 4 forensic modules',
      'Live photo match with deepfake check',
      'Hardware stream monitoring',
      'Priority AI analysis',
      'Priority support',
    ],
    cta: 'Start 30-day Trial',
    href: '/signup',
    highlight: true,
  },
  {
    name: 'Enterprise',
    icon: Building2,
    price: 'Custom',
    period: '',
    description: 'For banks, government KYC, and large institutions.',
    features: [
      'Everything in Pro',
      'On-premise deployment',
      'Custom AI model tuning',
      'SLA & dedicated manager',
      'Audit & compliance reports',
      'SSO / SAML integration',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlight: false,
  },
]

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
            Start with our 30-day free trial on Pro. No credit card required.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-3xl p-8 transition-all ${
                plan.highlight
                  ? 'bg-gradient-to-br from-blue-700 to-indigo-700 text-white shadow-2xl shadow-blue-600/30 lg:-translate-y-3'
                  : 'border border-slate-200 bg-white shadow-sm hover:shadow-lg'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-xs font-bold text-blue-700 shadow">
                  MOST POPULAR
                </span>
              )}

              <div className={`mb-5 inline-flex w-fit rounded-xl p-2.5 ${plan.highlight ? 'bg-white/15' : 'bg-blue-50 text-blue-600'}`}>
                <plan.icon className="h-6 w-6" />
              </div>
              <h2 className={`text-xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                {plan.name}
              </h2>
              <p className={`mt-2 text-sm ${plan.highlight ? 'text-blue-100' : 'text-slate-500'}`}>
                {plan.description}
              </p>

              <div className="mt-6 flex items-end gap-1">
                <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`pb-1 text-sm font-medium ${plan.highlight ? 'text-blue-100' : 'text-slate-400'}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="mt-8 flex-1 space-y-3.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        plan.highlight ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <span className={plan.highlight ? 'text-blue-50' : 'text-slate-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-8 rounded-xl py-3.5 text-center text-sm font-bold transition-all ${
                  plan.highlight
                    ? 'bg-white text-blue-700 shadow-lg hover:-translate-y-0.5 hover:shadow-xl'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-slate-500">
          All plans include local-first processing — your raw documents never leave the browser.
        </p>
      </div>
    </main>
  )
}
