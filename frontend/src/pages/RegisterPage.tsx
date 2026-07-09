import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const registerSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(255),
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null)

    try {
      await api.post('/auth/register', values)
      navigate('/login', { replace: true })
    } catch (error) {
      setServerError('Unable to create your account. Please try a different email.')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white/90 shadow-2xl shadow-slate-200/70 backdrop-blur md:grid-cols-[0.95fr_1.05fr]">
          <section className="order-2 hidden flex-col justify-between bg-teal-600 px-8 py-10 text-white md:flex lg:px-12">
            <div>
              <p className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-teal-50">
                Start managing care
              </p>
              <h1 className="max-w-md text-4xl font-semibold tracking-tight lg:text-5xl">
                Create a PillSync account for patients and caregivers.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-teal-50/90">
                Registration creates a secure user profile so the dashboard is ready for reminders and support.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-teal-50/90 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-2xl font-semibold text-white">Secure</p>
                <p className="mt-1">Passwords are validated client-side</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
                <p className="text-2xl font-semibold text-white">Ready</p>
                <p className="mt-1">Profiles are created automatically</p>
              </div>
            </div>
          </section>

          <section className="order-1 px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">PillSync</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Create your account</h1>
                <p className="mt-2 text-sm text-slate-600">Register to begin using PillSync.</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="full_name">
                    Full name
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    autoComplete="name"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    placeholder="Jane Doe"
                    {...register('full_name')}
                  />
                  {errors.full_name ? <p className="mt-2 text-sm text-rose-600">{errors.full_name.message}</p> : null}
                </div>

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
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                    placeholder="At least 8 characters"
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
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-teal-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}