import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, refreshAuthState } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)

    try {
      await api.post('/auth/login', values)
      await refreshAuthState()
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError('Invalid email or password')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-2xl shadow-slate-200/70 backdrop-blur md:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden flex-col justify-between bg-slate-950 px-8 py-10 text-white md:flex lg:px-12">
            <div>
              <p className="mb-6 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-emerald-200">
                PillSync Secure Access
              </p>
              <h1 className="max-w-md text-4xl font-semibold tracking-tight lg:text-5xl">
                Medication care, organized around the people who need it.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                Sign in to manage reminders, profiles, and care coordination from a single dashboard.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-white">24/7</p>
                <p className="mt-1">Reminder visibility</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-2xl font-semibold text-white">1 tap</p>
                <p className="mt-1">Secure sign in</p>
              </div>
            </div>
          </section>

          <section className="px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">PillSync</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Welcome back</h1>
                <p className="mt-2 text-sm text-slate-600">Sign in to continue to your dashboard.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    placeholder="you@example.com"
                    {...register('email')}
                  />
                  {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email.message}</p> : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    placeholder="Enter your password"
                    {...register('password')}
                  />
                  {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password.message}</p> : null}
                </div>

                {serverError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {serverError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                New to PillSync?{' '}
                <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/register">
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}