import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

const footerLinks = [
  {
    title: 'Product',
    links: [
      { label: 'Document Scanner', href: '/scanner?tab=document' },
      { label: 'Photo Match', href: '/scanner?tab=photo' },
      { label: 'Signature Check', href: '/scanner?tab=signature' },
      { label: 'Hardware Stream', href: '/scanner?tab=hardware' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Datasets', href: '/datasets' },
      { label: 'Sign Up', href: '/signup' },
      { label: 'Log In', href: '/login' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-1.5">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">DocuGuard</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              AI-powered forensic document authentication. Detect forged documents, tampered
              signatures, and digital fraud in real time.
            </p>
          </div>

          {footerLinks.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-blue-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            © 2026 DocuGuard. All rights reserved. Developed by Ravi Divya.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
