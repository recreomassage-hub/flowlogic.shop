import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { validateEmail, validatePassword, getPasswordRequirements } from '../utils/authValidation';
import { isApiError, getErrorMessage } from '../api/types';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [wellnessAccepted, setWellnessAccepted] = useState(false);
  
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  
  const { register, isLoading, error, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    // #region agent log
    const logData = {location:'RegisterPage.tsx:23',message:'useEffect isAuthenticated check',data:{isAuthenticated,willNavigate:isAuthenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
    fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
    const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
    logs.push(logData);
    localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
    // #endregion
    if (isAuthenticated) {
      // #region agent log
      const logData2 = {location:'RegisterPage.tsx:25',message:'Navigating to dashboard',data:{isAuthenticated,path:'/dashboard'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
      const logs2 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs2.push(logData2);
      localStorage.setItem('debug_logs', JSON.stringify(logs2.slice(-50)));
      // #endregion
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Real-time email validation
    if (value.trim()) {
      const validation = validateEmail(value);
      const error = validation.error || '';
      setEmailError(error);
      console.log('[RegisterPage] Email validation:', { value, valid: validation.valid, error });
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Real-time password validation
    if (value.trim()) {
      const validation = validatePassword(value);
      const firstError = validation.errors[0] || '';
      setPasswordError(firstError);
      setPasswordErrors(validation.errors);
      setPasswordStrength(validation.strength);
      console.log('[RegisterPage] Password validation:', { 
        length: value.length, 
        valid: validation.valid, 
        errors: validation.errors,
        firstError 
      });
    } else {
      setPasswordError('');
      setPasswordErrors([]);
      setPasswordStrength('weak');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterPage.tsx:68',message:'handleSubmit called',data:{email,hasPassword:!!password,wellnessAccepted,emailError:!!emailError,passwordError:!!passwordError},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    console.log('[RegisterPage] handleSubmit called', {
      email,
      hasPassword: !!password,
      hasName: !!name,
      wellnessAccepted,
      emailError,
      passwordError,
    });
    
    if (!wellnessAccepted) {
      console.log('[RegisterPage] Wellness checkbox not accepted');
      return;
    }

    // Clear previous errors before validation
    setEmailError('');
    setPasswordError('');
    setPasswordErrors([]);

    // Validate email before submit
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      console.log('[RegisterPage] Email validation failed:', emailValidation.error);
      setEmailError(emailValidation.error || 'Please enter a valid email');
      return;
    }

    // Validate password before submit
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      console.log('[RegisterPage] Password validation failed:', passwordValidation.errors);
      setPasswordError(passwordValidation.errors[0] || 'Password does not meet requirements');
      setPasswordErrors(passwordValidation.errors);
      return;
    }

    console.log('[RegisterPage] Validation passed, calling register...');
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterPage.tsx:106',message:'Before register call',data:{email:email.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    try {
      console.log('[RegisterPage] Registering user:', { email: email.trim(), hasPassword: !!password, hasName: !!name });
      const registerResponse = await register(email.trim(), password, name.trim() || undefined);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'RegisterPage.tsx:109',message:'After register call, before navigate',data:{email:email.trim(),isAuthenticated:useAuthStore.getState().isAuthenticated,emailConfirmed:registerResponse.email_confirmed},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Registration successful - check if email is already confirmed
      if (registerResponse.email_confirmed) {
        // Email already confirmed (auto-confirmed in prod) - redirect to login
        console.log('[RegisterPage] Email already confirmed, redirecting to login');
        // #region agent log
        const logData = {location:'RegisterPage.tsx:137',message:'Email confirmed, redirecting to login',data:{path:'/login',email:email.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
        fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
        const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
        logs.push(logData);
        localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
        // #endregion
        navigate('/login');
      } else {
        // Email needs verification - redirect to verification page
        console.log('[RegisterPage] Registration successful, redirecting to verify page');
        // #region agent log
        const currentAuthState = useAuthStore.getState();
        const logData = {location:'RegisterPage.tsx:145',message:'Calling navigate to verify',data:{path:`/verify?email=${encodeURIComponent(email.trim())}`,isAuthenticated:currentAuthState.isAuthenticated,hasUser:!!currentAuthState.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'};
        fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
        const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
        logs.push(logData);
        localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
        // #endregion
        navigate(`/verify?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err) {
      // Error handled by store - stay on page to show error
      const errorMessage = getErrorMessage(err);
      const status = isApiError(err) ? err.response?.status : undefined;
      const statusText = isApiError(err) ? err.response?.statusText : undefined;
      const responseData = isApiError(err) ? err.response?.data : undefined;
      // #region agent log
      const logData = {location:'RegisterPage.tsx:146',message:'Registration error caught',data:{error:errorMessage,status,statusText,responseData,willNavigate:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'};
      fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
      const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
      logs.push(logData);
      localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
      // #endregion
      console.error('[RegisterPage] Registration error:', err);
      console.error('[RegisterPage] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      
      // For 409 Conflict (email already registered), show error but don't navigate
      // Error message is already set in authStore
      if (err.response?.status === 409) {
        console.log('[RegisterPage] 409 Conflict - email already registered, staying on page');
        // Don't navigate - error will be shown in UI
        return;
      }
      
      // Don't navigate on error - stay on page to show error message
    }
  };

  const passwordRequirements = getPasswordRequirements();

  const passwordStrengthLabels = {
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
  };

  // Debug: Log button state
  useEffect(() => {
    const isDisabled = isLoading || !wellnessAccepted || !!emailError || !!passwordError;
    console.log('[RegisterPage] Button state:', {
      isLoading,
      wellnessAccepted,
      emailError,
      passwordError,
      isDisabled,
      email,
      passwordLength: password.length,
    });
  }, [isLoading, wellnessAccepted, emailError, passwordError, email, password]);

  return (
    <>
      <Helmet>
        <title>Sign Up - Flow Logic</title>
      </Helmet>
      <div className="max-w-md mx-auto px-4 py-12">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
        {error && (
          <div
            id="register-error"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={`mb-4 p-3 rounded-lg border-l-4 ${
              error.toLowerCase().includes('restored') || error.toLowerCase().includes('success')
                ? 'bg-green-50 text-green-700 border-green-500'
                : 'bg-red-50 text-red-700 border-red-500'
            }`}
          >
            <p className="font-medium">{error}</p>
            {error.toLowerCase().includes('already registered') && (
              <p className="mt-2 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-medium underline hover:opacity-80">
                  Sign in here
                </Link>
              </p>
            )}
            {(error.toLowerCase().includes('restored') || error.toLowerCase().includes('success')) && (
              <p className="mt-2 text-sm">
                You can now{' '}
                <Link to="/login" className="font-medium underline hover:opacity-80">
                  sign in here
                </Link>
              </p>
            )}
          </div>
        )}
        <form 
          onSubmit={(e) => {
            console.log('[RegisterPage] Form onSubmit triggered');
            handleSubmit(e);
          }} 
          aria-describedby={error ? 'register-error' : undefined}
        >
          <div className="mb-4">
            <Input
              id="name"
              type="text"
              label="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Enter your name"
            />
          </div>
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
          <div className="mb-4">
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={handlePasswordChange}
              required
              error={!!passwordError}
              errorMessage={passwordError}
              autoComplete="new-password"
              placeholder="Create a strong password"
              helperText={
                password && passwordStrength !== 'weak' 
                  ? `Password strength: ${passwordStrengthLabels[passwordStrength]}`
                  : undefined
              }
            />
            {password && (
              <div className="mt-2">
                <div className="text-xs font-medium mb-2 text-gray-600">
                  Password requirements:
                </div>
                <ul className="space-y-1 text-xs text-gray-600">
                  {passwordRequirements.map((req, index) => {
                    const isMet = !passwordErrors.some(err => 
                      err.toLowerCase().includes(req.split(' ')[0].toLowerCase())
                    );
                    return (
                      <li key={index} className={`flex items-start ${isMet ? 'text-green-600' : ''}`}>
                        <span className="mr-2">{isMet ? '✓' : '○'}</span>
                        <span>{req}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="wellness-checkbox" className="flex items-start">
              <input
                id="wellness-checkbox"
                type="checkbox"
                checked={wellnessAccepted}
                onChange={(e) => {
                  console.log('[RegisterPage] Wellness checkbox changed:', e.target.checked);
                  setWellnessAccepted(e.target.checked);
                }}
                required
                className="mt-1 mr-2"
                aria-describedby="wellness-checkbox-description"
              />
              <span id="wellness-checkbox-description" className="text-sm text-gray-700">
                I accept the wellness disclaimer. This product is not a medical device.
              </span>
            </label>
          </div>
          <button
            type="submit"
            disabled={isLoading || !wellnessAccepted || !!emailError || !!passwordError}
            className="btn btn-primary w-full mb-4"
            onClick={() => {
              console.log('[RegisterPage] Button clicked', {
                isLoading,
                wellnessAccepted,
                emailError,
                passwordError,
                email,
                passwordLength: password.length,
                disabled: isLoading || !wellnessAccepted || !!emailError || !!passwordError,
                disabledReason: {
                  isLoading,
                  notWellness: !wellnessAccepted,
                  hasEmailError: !!emailError,
                  hasPasswordError: !!passwordError,
                }
              });
              // Don't prevent default - let form submit normally
            }}
          >
            {isLoading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
    </>
  );
}
