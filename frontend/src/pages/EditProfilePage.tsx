import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import api from '../lib/api'

const editProfileSchema = z.object({
  phone: z.string().max(32).optional().or(z.literal('')),
  date_of_birth: z.string().optional().or(z.literal('')),
  gender: z.string().max(50).optional().or(z.literal('')),
  blood_group: z.string().max(10).optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  emergency_contact_name: z.string().max(255).optional().or(z.literal('')),
  emergency_contact_phone: z.string().max(32).optional().or(z.literal('')),
  profile_image_url: z.string().max(512).optional().or(z.literal('')),
})

type EditProfileValues = z.infer<typeof editProfileSchema>

export function EditProfilePage() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      phone: '',
      date_of_birth: '',
      gender: '',
      blood_group: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      profile_image_url: '',
    },
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get<EditProfileValues>('/profile')
        reset({
          phone: response.data.phone ?? '',
          date_of_birth: response.data.date_of_birth ?? '',
          gender: response.data.gender ?? '',
          blood_group: response.data.blood_group ?? '',
          address: response.data.address ?? '',
          emergency_contact_name: response.data.emergency_contact_name ?? '',
          emergency_contact_phone: response.data.emergency_contact_phone ?? '',
          profile_image_url: response.data.profile_image_url ?? '',
        })
      } catch {
        reset()
      }
    }

    if (isAuthenticated) {
      void loadProfile()
    }
  }, [isAuthenticated, reset])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center px-4 text-slate-700">Loading profile...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const onSubmit = async (values: EditProfileValues) => {
    setServerError(null)

    try {
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== ''),
      )
      await api.put('/profile', payload)
      navigate('/profile', { replace: true })
    } catch (error) {
      setServerError('Unable to save profile changes. Please try again.')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-2xl shadow-slate-200/70 backdrop-blur lg:p-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-600">Profile</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Edit your profile</h1>
              <p className="mt-2 text-sm text-slate-600">Update your own contact and personal details only.</p>
            </div>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-teal-500 hover:text-teal-700"
            >
              View profile
            </Link>
          </div>

          <form className="mt-8 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Field label="Phone" placeholder="(555) 123-4567" {...register('phone')} />
            <Field label="Date of birth" type="date" {...register('date_of_birth')} />
            <Field label="Gender" placeholder="Female" {...register('gender')} />
            <Field label="Blood group" placeholder="O+" {...register('blood_group')} />
            <Field label="Emergency contact name" placeholder="John Doe" {...register('emergency_contact_name')} />
            <Field label="Emergency contact phone" placeholder="(555) 987-6543" {...register('emergency_contact_phone')} />
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                placeholder="Street, city, state"
                {...register('address')}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="profile_image_url">
                Profile image URL
              </label>
              <input
                id="profile_image_url"
                type="url"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                placeholder="https://example.com/photo.jpg"
                {...register('profile_image_url')}
              />
            </div>

            {serverError ? (
              <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {serverError}
              </div>
            ) : null}

            <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-500 hover:text-teal-700"
              >
                Back to dashboard
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function Field(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, ...inputProps } = props

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
        {...inputProps}
      />
    </div>
  )
}