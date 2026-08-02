'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { hashPassword, getUsers, getLoggedInUser, setLoggedInUser, isEmailValid } from '@/lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (getLoggedInUser()) router.replace('/scanner');
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isEmailValid(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const users = getUsers();
      const matchedUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!matchedUser) {
        setError('No account found with this email. Please sign up.');
        setIsLoading(false);
        return;
      }

      const passwordHash = await hashPassword(password);
      if (matchedUser.passwordHash !== passwordHash) {
        setError('Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }

      setLoggedInUser({ fullName: matchedUser.fullName, email: matchedUser.email });
      router.push('/scanner');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during log in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-3 shadow-lg shadow-blue-600/25">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-600">Log in to your DocuGuard account</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex select-none items-center cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <span className="ml-2 text-xs text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-75"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
