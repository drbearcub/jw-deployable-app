'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-8">Instructor Deployments</h1>
      <p className="text-xl mb-8">Create your own instance of Jill Watson</p>
      {isLoading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>Redirecting to dashboard...</div>
      ) : (
        <div className="space-x-4">
          <Link href="/login">
            <Button>
              Login
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}