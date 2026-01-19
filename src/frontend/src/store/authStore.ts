import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, RegisterResponse } from '../api/auth';
import { authApi } from '../api/auth';
import { isApiError, getErrorMessage } from '../api/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        // #region agent log
        const logData = {location:'authStore.ts:26',message:'login function entry',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
        fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
        const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
        logs.push(logData);
        localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
        // #endregion
        set({ isLoading: true, error: null });
        try {
          // #region agent log
          const logData2 = {location:'authStore.ts:29',message:'Calling authApi.login',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
          fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData2)}).catch(()=>{});
          const logs2 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
          logs2.push(logData2);
          localStorage.setItem('debug_logs', JSON.stringify(logs2.slice(-50)));
          // #endregion
          const response = await authApi.login({ email, password });
          // #region agent log
          const logData3 = {location:'authStore.ts:30',message:'Login response received',data:{hasUser:!!response.user,userId:response.user?.user_id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
          fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData3)}).catch(()=>{});
          const logs3 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
          logs3.push(logData3);
          localStorage.setItem('debug_logs', JSON.stringify(logs3.slice(-50)));
          // #endregion
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          // #region agent log
          const logData4 = {location:'authStore.ts:35',message:'Login state updated',data:{isAuthenticated:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
          fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData4)}).catch(()=>{});
          const logs4 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
          logs4.push(logData4);
          localStorage.setItem('debug_logs', JSON.stringify(logs4.slice(-50)));
          // #endregion
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          const status = isApiError(error) ? error.response?.status : undefined;
          const responseData = isApiError(error) ? error.response?.data : undefined;
          // #region agent log
          const logData5 = {location:'authStore.ts:36',message:'Login error',data:{error:errorMessage,status,responseData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'};
          fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData5)}).catch(()=>{});
          const logs5 = JSON.parse(localStorage.getItem('debug_logs') || '[]');
          logs5.push(logData5);
          localStorage.setItem('debug_logs', JSON.stringify(logs5.slice(-50)));
          // #endregion
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, name?: string): Promise<RegisterResponse> => {
        console.log('[AuthStore] Starting registration for:', email);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authStore.ts:46',message:'register function entry',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        set({ isLoading: true, error: null });
        try {
          console.log('[AuthStore] Calling authApi.register...');
          const response: RegisterResponse = await authApi.register({
            email,
            password,
            name,
            wellness_disclaimer_accepted: true,
          });
          console.log('[AuthStore] Registration response:', response);
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authStore.ts:57',message:'Registration response received',data:{hasMessage:!!response.message,userId:response.user_id,emailConfirmed:response.email_confirmed},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          
          // Handle account restoration message
          if (response.message && response.message.includes('restored')) {
            console.log('[AuthStore] Account restored');
            // Account was restored - show success message but don't auto-login
            set({
              user: {
                user_id: response.user_id,
                email: response.email,
                name: response.name,
                tier: response.tier as User['tier'],
                wellness_disclaimer_accepted: response.wellness_disclaimer_accepted,
                created_at: new Date().toISOString(),
              },
              isAuthenticated: false, // Don't auto-login, user needs to login manually
              isLoading: false,
              error: response.message, // Show restoration message
            });
            return response;
          } else {
            console.log('[AuthStore] Normal registration successful');
            // Normal registration
            // In prod, backend auto-confirms users, but Cognito may still send verification code
            // User needs to verify email before login
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authStore.ts:77',message:'Before set state - normal registration',data:{willSetIsAuthenticated:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            set({
              user: {
                user_id: response.user_id,
                email: response.email,
                name: response.name,
                tier: response.tier as User['tier'],
                wellness_disclaimer_accepted: response.wellness_disclaimer_accepted,
                created_at: new Date().toISOString(),
              },
              // Don't auto-authenticate - user needs to verify email first (or login if already confirmed)
              // After verification, they can login
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authStore.ts:96',message:'After set state - normal registration',data:{isAuthenticated:false,emailConfirmed:response.email_confirmed},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            console.log('[AuthStore] State updated, isAuthenticated:', false, 'email_confirmed:', response.email_confirmed);
            // Return response so RegisterPage can check email_confirmed
            return response;
          }
        } catch (error) {
          console.error('[AuthStore] Registration error:', error);
          const responseData = isApiError(error) ? error.response?.data : undefined;
          console.error('[AuthStore] Error response:', responseData);
          const errorMessage = getErrorMessage(error);
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // #region agent log
        const logData = {location:'authStore.ts:141',message:'Persisting state to localStorage',data:{isAuthenticated:state.isAuthenticated,hasUser:!!state.user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'};
        fetch('http://127.0.0.1:7242/ingest/77bf5b9f-2845-440c-8d1e-fb3a5b329e9b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(logData)}).catch(()=>{});
        const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
        logs.push(logData);
        localStorage.setItem('debug_logs', JSON.stringify(logs.slice(-50)));
        // #endregion
        return { user: state.user, isAuthenticated: state.isAuthenticated };
      },
    }
  )
);

