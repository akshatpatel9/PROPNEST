import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/ui';
import { KeyRound, Loader2, AlertCircle, Mail, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hasSession, setHasSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    // Get email from URL if present
    const query = new URLSearchParams(location.search);
    const emailParam = query.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    const checkSession = async () => {
      // 1. Check if we already have a session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (mounted) {
          setHasSession(true);
          setCheckingSession(false);
        }
        return;
      }

      // 2. If no session, check if there's a code or token in the URL
      const query = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      const hasAuthParams = query.has('code') || hash.includes('access_token') || hash.includes('error');

      if (hasAuthParams) {
        // Supabase is likely exchanging the code for a session right now in the background.
        // We wait for onAuthStateChange to fire.
        // Add a timeout fallback just in case the exchange fails silently or takes too long.
        setTimeout(() => {
          if (mounted) {
            setCheckingSession(false);
            // If we still don't have a session after 4 seconds, it failed.
          }
        }, 4000);
      } else {
        // No session and no auth params. The user just navigated here directly or link is stripped.
        if (mounted) {
          setHasSession(false);
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    // Listen for auth state changes to catch the session once the URL code is exchanged
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || session) {
        if (mounted) {
          setHasSession(true);
          setCheckingSession(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (hasSession) {
        // Magic link flow
        await updatePassword(password);
      } else {
        // OTP flow
        if (!email || !otp) {
          setError('Please provide your email and the 6-digit code.');
          setLoading(false);
          return;
        }

        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'recovery'
        });

        if (verifyError) throw verifyError;

        // Session is now established, update password
        await updatePassword(password);
      }

      setSuccessMsg('Password updated successfully! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <KeyRound className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {hasSession ? 'Please enter your new password below.' : 'Enter the 6-digit code sent to your email and your new password.'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {checkingSession ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <p className="text-sm text-slate-500">Verifying...</p>
            </div>
          ) : (
            <>
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
                {!hasSession && (
                  <>
                    <div>
                      <label htmlFor="email" className="sr-only">Email address</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          className="pl-10"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="otp" className="sr-only">6-Digit Code</label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <Hash className="h-5 w-5 text-slate-400" aria-hidden="true" />
                        </div>
                        <Input
                          id="otp"
                          name="otp"
                          type="text"
                          required
                          className="pl-10 tracking-widest"
                          placeholder="123456"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="password" className="sr-only">New Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <KeyRound className="h-5 w-5 text-slate-400" aria-hidden="true" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      className="pl-10"
                      placeholder="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Button type="submit" variant="primary" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
                </Button>
              </div>
              
              {!hasSession && (
                <div className="mt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-emerald-600 hover:text-emerald-500 font-medium"
                  >
                    Didn't receive a code? Request a new one
                  </button>
                </div>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};
