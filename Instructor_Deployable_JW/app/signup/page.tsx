'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/lib/auth';

export default function Signup() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <div>
      <AuthForm mode="signup" />
    </div>
  );
}