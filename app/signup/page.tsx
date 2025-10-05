'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { AuthWrapper } from '@/components/ui/AuthWrapper'

export default function SignupPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  return user ? null : <AuthWrapper initialMode="signup" />
}
