import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SEED_STORAGE_KEY = 'woodworking-calc-seeded-users';

function hasBeenSeeded(userId: string): boolean {
  const seeded = localStorage.getItem(SEED_STORAGE_KEY);
  if (!seeded) return false;
  const parsed: string[] = JSON.parse(seeded);
  return parsed.includes(userId);
}

function markAsSeeded(userId: string): void {
  const seeded = localStorage.getItem(SEED_STORAGE_KEY);
  const parsed: string[] = seeded ? JSON.parse(seeded) : [];
  if (!parsed.includes(userId)) {
    parsed.push(userId);
    localStorage.setItem(SEED_STORAGE_KEY, JSON.stringify(parsed));
  }
}

async function seedUserIfNeeded(userId: string): Promise<void> {
  if (hasBeenSeeded(userId)) return;

  await supabase.rpc('seed_user_data', { p_user_id: userId });
  markAsSeeded(userId);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        seedUserIfNeeded(currentSession.user.id);
      }

      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        seedUserIfNeeded(newSession.user.id);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
