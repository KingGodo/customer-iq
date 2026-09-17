import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Login = () => {
  const [email, setEmail] = useState('admin@demo.bank');
  const [password, setPassword] = useState('Demo1234!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || data.message || 'Login failed');

      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#0c1210] px-4 font-sans">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#121a16] p-8 shadow-2xl sm:p-10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <span className="flex gap-0.5">
              <span className="h-5 w-1.5 -skew-x-12 rounded-sm bg-lime" />
              <span className="h-5 w-1.5 -skew-x-12 rounded-sm bg-lime" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              CustomerIQ
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Sign in
          </h2>
          <p className="mt-2 text-sm font-medium text-white/45">
            Access your retention workspace
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="h-11 border-white/10 bg-[#0c1210] text-white placeholder:text-white/35"
          />
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-11 border-white/10 bg-[#0c1210] text-white placeholder:text-white/35"
          />

          <Button
            type="submit"
            variant="lime"
            className="h-11 w-full rounded-full font-display text-[13px] font-semibold shadow-none"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
            {!isLoading && (
              <span className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/15">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            )}
          </Button>
        </form>

        <p className="mt-6 rounded-xl bg-[#0c1210] px-4 py-3 text-center text-[12px] font-medium text-white/45">
          Demo · <span className="text-lime">admin@demo.bank</span> / Demo1234!
        </p>

        <p className="mt-6 text-center text-sm font-medium text-white/45">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-bold text-lime hover:underline">
            Register your bank
          </Link>
        </p>
        <div className="mt-3 text-center">
          <Link to="/" className="text-xs font-bold text-white/35 hover:text-white">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Login;
