import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-transparent text-gray-800 p-4 absolute top-0 left-0 right-0">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">
          Dashboard
        </Link>
        <div className="flex items-center space-x-4">
          {user && <span>{user.email}</span>}
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}