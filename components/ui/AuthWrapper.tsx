'use client'

import { useState } from 'react'
import { AuthForm } from '@/components/AuthForm'
import { Button } from '@/components/ui/button'

interface AuthWrapperProps {
  initialMode?: 'login' | 'signup'
}

export function AuthWrapper({ initialMode = 'login' }: AuthWrapperProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const opposite = mode === 'login' ? 'signup' : 'login'

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-300 p-4 flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-6xl min-h-[600px] rounded-2xl overflow-hidden">

        <div className="w-full md:w-1/3 flex items-center justify-center bg-gray-800 text-white p-8 rounded-t-2xl md:rounded-t-none md:rounded-l-2xl">
          <div className="text-center max-w-xs">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {mode === 'login' ? 'New here?' : 'Welcome back!'}
            </h2>
            <p className="mb-6 text-sm sm:text-base">
              {mode === 'login'
                ? 'Sign up to create your own Jill Watson assistant.'
                : 'Log in to access your Jill Watson assistants.'}
            </p>
            <Button
              variant="outline"
              onClick={() => setMode(opposite)}
              className="text-black border-white hover:text-gray-800 transition"
            >
              {mode === 'login' ? 'Go to Sign Up' : 'Go to Login'}
            </Button>
          </div>
        </div>

        <div className="w-full md:w-2/3 flex items-center justify-center bg-white p-8 rounded-b-2xl md:rounded-b-none md:rounded-r-2xl">
          <div className="w-full max-w-md">
            <img src="/JWLogo.png" alt="JW Logo" className="w-96 h-auto mx-auto mb-6" />
            <AuthForm mode={mode} />
          </div>
        </div>

      </div>
    </div>
  )
}
