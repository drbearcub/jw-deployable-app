import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

interface HeaderProps {
  // Add any props if needed
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-transparent text-gray-800 p-4 shadow-sm">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <span className="text-sm">{user?.email}</span>
        <Button onClick={logout} variant="ghost" className="text-sm hover:bg-gray-100">Sign Out</Button>
      </div>
    </nav>
  );
};