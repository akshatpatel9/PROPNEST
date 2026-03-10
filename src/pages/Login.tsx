import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/ui';
import { Home, KeyRound, Mail, Loader2 } from 'lucide-react';

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError('');
      setSuccessMsg('');
      try {
        if (isSignUp) {
          const data = await signup(email, password);
          if (data.session) {
            navigate('/dashboard');
          } else {
            setSuccessMsg('Account created! Please check your email to verify your account.');
            setIsSignUp(false);
          }
        } else {
          await login(email, password);
          navigate('/dashboard');
        }
      } catch (err: any) {
        setError(err.message || `Failed to ${isSignUp ? 'sign up' : 'login'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Home className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            {isSignUp ? 'Create an account' : 'Welcome to RIGHT square'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {isSignUp ? 'Sign up to start browsing or listing properties.' : 'Sign in to start browsing or listing properties.'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-600 border border-green-100">
              {successMsg}
            </div>
          )}
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <Input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="pl-10"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <Button type="submit" variant="primary" className="w-full h-12 text-base" disabled={loading}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMsg('');
              }}
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
