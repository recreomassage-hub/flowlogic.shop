import { useEffect } from 'react';

/**
 * Hook to show browser warning before leaving page
 * @param enabled - Whether to show warning
 * @param message - Custom warning message (optional, browser may override)
 */
export function useBeforeUnload(enabled: boolean, message?: string): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern browsers require preventDefault and setting returnValue
      e.preventDefault();
      // Some browsers ignore custom messages, but we set it anyway
      e.returnValue = message || 'Recording/upload in progress. Are you sure you want to leave?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, message]);
}

