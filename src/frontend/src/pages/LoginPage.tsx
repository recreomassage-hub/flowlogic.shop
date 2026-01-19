import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { validateEmail } from '../utils/authValidation';
import { isApiError, getErrorMessage } from '../api/types';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>('');
  const { login, isLoading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect to dashboard if authenticated
  useEffect(() => {
    // #region agent log
    const logData = {location:'LoginPage.tsx:16',message:'useEffect isAuthenticated check',data:{isAuthenticated,willNavigate:isAuthenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
    fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    logs.push(logData);
    localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
    // #endregion
    if (isAuthenticated) {
      // #region agent log
      const logData2 = {location:'LoginPage.tsx:18',message:'Navigating to dashboard',data:{path:'/dashboard'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
      const logs2 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs2.push(logData2);
      localStorage.setItem('debug_logs', JSON.stringify(logs2.slice(-50)));
      // #endregion
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Debug: Log button state
  useEffect(() => {
    const isDisabled = isLoading || !!emailError;
    console.log('[LoginPage] Button state updated', { isLoading, emailError, isDisabled, email, hasPassword: !!password });
    // #region agent log
    const logData = {location:'LoginPage.tsx:33',message:'Button state check',data:{isLoading,emailError,isDisabled,email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'};
    fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    logs.push(logData);
    localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
    // #endregion
  }, [isLoading, emailError, email, password]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Real-time email validation
    if (value.trim()) {
      const validation = validateEmail(value);
      const error = validation.error || '';
      setEmailError(error);
      // #region agent log
      const logData = {location:'LoginPage.tsx:36',message:'Email validation',data:{value,valid:validation.valid,error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
      const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs.push(logData);
      localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
      // #endregion
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginPage] handleSubmit CALLED', { email, hasPassword: !!password, emailError });
    // #region agent log
    const logData = {location:'LoginPage.tsx:35',message:'handleSubmit called',data:{email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
    fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    logs.push(logData);
    localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
    // #endregion
    
    // Validate email before submit
    const emailValidation = validateEmail(email);
    // #region agent log
    const logDataValidation = {location:'LoginPage.tsx:79',message:'Email validation check',data:{email,valid:emailValidation.valid,error:emailValidation.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'};
    fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataValidation)}).catch(()=>{});
    const logsValidation = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    logsValidation.push(logDataValidation);
    localStorage.setItem('debug_logs', JSON.stringify(logsValidation.slice(-50)));
    // #endregion
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || 'Please enter a valid email');
      // #region agent log
      const logDataValidationFail = {location:'LoginPage.tsx:82',message:'Email validation failed, returning',data:{error:emailValidation.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataValidationFail)}).catch(()=>{});
      const logsValidationFail = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logsValidationFail.push(logDataValidationFail);
      localStorage.setItem('debug_logs', JSON.stringify(logsValidationFail.slice(-50)));
      // #endregion
      return;
    }

    if (!password) {
      // #region agent log
      const logDataNoPassword = {location:'LoginPage.tsx:86',message:'No password, returning',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logDataNoPassword)}).catch(()=>{});
      const logsNoPassword = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logsNoPassword.push(logDataNoPassword);
      localStorage.setItem('debug_logs', JSON.stringify(logsNoPassword.slice(-50)));
      // #endregion
      return;
    }

    try {
      // #region agent log
      const logData2 = {location:'LoginPage.tsx:49',message:'Before login call',data:{email:email.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
      const logs2 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs2.push(logData2);
      localStorage.setItem('debug_logs', JSON.stringify(logs2.slice(-50)));
      // #endregion
      await login(email.trim(), password);
      // #region agent log
      const logData3 = {location:'LoginPage.tsx:51',message:'After login call',data:{isAuthenticated:useAuthStore.getState().isAuthenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
      const logs3 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs3.push(logData3);
      localStorage.setItem('debug_logs', JSON.stringify(logs3.slice(-50)));
      // #endregion
      // Login successful - navigate will happen via useEffect or ProtectedRoute
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      const status = isApiError(err) ? err.response?.status : undefined;
      const responseData = isApiError(err) ? err.response?.data : undefined;
      // #region agent log
      const logData4 = {location:'LoginPage.tsx:53',message:'Login error caught',data:{error:errorMessage,status,responseData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch(()=>{});
      const logs4 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs4.push(logData4);
      localStorage.setItem('debug_logs', JSON.stringify(logs4.slice(-50)));
      // #endregion
      // Error handled by store - stay on login page to show error
      // Don't navigate away on error
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Flow Logic</title>
      </Helmet>
      <div className="max-w-md mx-auto px-4 py-12">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        {error && (
          <div
            id="login-error"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border-l-4 border-red-500"
          >
            <p className="font-medium">{error}</p>
            {error.toLowerCase().includes('not found') && (
              <p className="mt-2 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium underline hover:text-red-800">
                  Sign up here
                </Link>
              </p>
            )}
          </div>
        )}
        <form 
          onSubmit={(e) => {
            console.log('[LoginPage] FORM onSubmit CALLED', { email, hasPassword: !!password, emailError });
            // #region agent log
            const logData = {location:'LoginPage.tsx:127',message:'Form onSubmit triggered',data:{email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
            fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
            const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
            logs.push(logData);
            localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
            // #endregion
            handleSubmit(e);
          }} 
          aria-describedby={error ? 'login-error' : undefined}
        >
          <div className="mb-4">
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={handleEmailChange}
              required
              error={!!emailError}
              errorMessage={emailError}
              autoComplete="email"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-6">
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !!emailError}
            className="btn btn-primary w-full mb-4"
            onClick={() => {
              console.log('[LoginPage] BUTTON CLICKED', { isLoading, emailError, disabled: isLoading || !!emailError, email, hasPassword: !!password });
              // #region agent log
              const logData = {location:'LoginPage.tsx:112',message:'Button clicked',data:{isLoading,emailError,disabled:isLoading || !!emailError,email,hasPassword:!!password},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
              fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
              const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
              logs.push(logData);
              localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
              // #endregion
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}









