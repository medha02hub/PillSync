import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-slate-700">
        Loading dashboard...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur lg:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Welcome back, {user?.full_name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Your authentication state was refreshed on app startup, so this page is available only after a valid login.
          </p>
        </div>
      </div>
    </div>
  )
}