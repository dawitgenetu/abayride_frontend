import { useEffect } from 'react';
import { useAuth } from '@clerk/react';
import { setApiTokenGetter } from '../services/api';

/** Syncs Clerk session tokens (or legacy admin_token) into axios requests */
export function ClerkApiAuthBridge({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isLoaded) return undefined;

    setApiTokenGetter(async () => {
      if (isSignedIn) {
        try {
          return await getToken();
        } catch {
          return null;
        }
      }
      return localStorage.getItem('admin_token');
    });

    return () => setApiTokenGetter(null);
  }, [isLoaded, isSignedIn, getToken]);

  return children;
}
