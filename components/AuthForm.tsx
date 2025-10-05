import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const { login, signup } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await login(email, password, accessCode);
        toast({
          title: "Login Successful",
          description: "You have been logged in successfully.",
          variant: "default",
        });
      } else {
        await signup(email, password, accessCode);
        toast({
          title: "Sign Up Successful",
          description: "Your account has been created successfully.",
          variant: "default",
        });
      }
      router.push('/dashboard');
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        {mode === 'signup' && (
          <Input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="Access Code"
            required
          />
        )}
        <Button
          type="submit"
          className="w-full bg-gray-800 text-white hover:bg-gray-700 transition"
        >
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </Button>
      </form>
    </div>
  );
}