import React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import Image from 'next/image'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-gradient-to-r from-gray-200 via-gray-100 to-white p-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Image src="/JWLogo.png" alt="JW Logo" width={192} height={64} />
          <span className="text-lg sm:text-xl font-semibold text-gray-800">
            Your AI Assistant for Every Course
          </span>
        </div>
        <div className="flex flex-col items-end">
          {user && <span className="text-sm text-gray-600 mb-1">{user.email}</span>}
          <Button onClick={logout} variant="ghost" className="text-sm hover:bg-gray-100">
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  )
}
