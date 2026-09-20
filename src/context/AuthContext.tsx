import { createContext, useContext, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDB, useCurrentUserId } from '../lib/db';
import type { Role, User } from '../lib/types';

interface AuthCtx {
  user: User | null;
}

const Ctx = createContext<AuthCtx>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  const db = useDB();
  const id = useCurrentUserId();
  const user = id ? db.users.find((u) => u.id === id) ?? null : null;
  return <Ctx.Provider value={{ user }}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  return useContext(Ctx);
}

/** Route guard: requires a signed-in user with the given role.
 *  Prevents reaching the other role's UI by typing URLs. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'student' ? '/student' : '/teacher'} replace />;
  }
  return <>{children}</>;
}

/** Route guard: any signed-in user (session room is shared). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/auth/signin" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}
