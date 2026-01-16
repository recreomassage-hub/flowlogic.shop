import { useState } from 'react';
import * as React from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../api/types';

export function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') || '';
  
  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VerifyEmailPage.tsx:14',message:'VerifyEmailPage mounted',data:{email,hasCode:!!code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }, [email, code]);
  // #endregion

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      setError('Email and verification code are required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.verify({ email, code });
      // Если пользователь уже подтвержден, показываем успех и перенаправляем
      if (response.alreadyConfirmed) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setSuccess(true);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VerifyEmailPage.tsx:35',message:'Setting success, will navigate to login',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        setTimeout(() => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VerifyEmailPage.tsx:37',message:'Navigating to login',data:{path:'/login'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      // Если пользователь уже подтвержден, показываем успех вместо ошибки
      if (errorMessage.toLowerCase().includes('already confirmed') || 
          errorMessage.toLowerCase().includes('already verified')) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Helmet>
          <title>Email Verified - Flow Logic</title>
        </Helmet>
        <div className="max-w-md mx-auto px-4 py-12">
        <div className="card">
          <div className="text-center">
            <div className="mb-4 text-green-600 text-5xl">✓</div>
            <h2 className="text-2xl font-bold mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Verify Email - Flow Logic</title>
      </Helmet>
      <div className="max-w-md mx-auto px-4 py-12">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Verify Your Email</h2>
        {email && (
          <p className="mb-4 text-sm text-gray-600">
            We've sent a verification code to <strong>{email}</strong>
          </p>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {!email && (
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  const newEmail = e.target.value;
                  navigate(`/verify?email=${encodeURIComponent(newEmail)}`, { replace: true });
                }}
                required
                className="input"
                placeholder="Enter your email"
              />
            </div>
          )}
          <div className="mb-6">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              className="input text-center text-2xl tracking-widest"
              placeholder="000000"
              autoFocus
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter the 6-digit code from your email
            </p>
          </div>
          <button
            type="submit"
            disabled={isLoading || !code || !email}
            className="btn btn-primary w-full mb-4"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Didn't receive the code?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Try registering again
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}




