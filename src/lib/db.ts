import { useSyncExternalStore } from 'react';
import type { DB } from './types';
import { buildSeed, DB_VERSION } from './seed';

/**
 * DEMO persistence layer.
 *
 * All application data lives in a single localStorage key ("strictly
 * necessary" browser storage — no cookies, no analytics, no third-party
 * transfer). Cross-tab updates propagate via the `storage` event, which
 * lets the student and teacher demo run live in two tabs of one browser.
 *
 * In production this module would be replaced by a real API client; the
 * rest of the app only talks to `api.ts`, never to localStorage directly.
 */
const KEY = 'demo-tutoring-db';
const SESSION_USER_KEY = 'demo-tutoring-current-user'; // per-tab (sessionStorage)

let cache: DB | null = null;
const listeners = new Set<() => void>();

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      if (parsed.version === DB_VERSION) return parsed;
    }
  } catch {
    // corrupted storage → reseed
  }
  const seed = buildSeed();
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

export function getDB(): DB {
  if (!cache) cache = load();
  return cache;
}

function emit() {
  listeners.forEach((fn) => fn());
}

/** Read-modify-write. The mutation runs against fresh data (re-read from
 *  storage) so a concurrent change in another tab is never clobbered. */
export function mutate(fn: (db: DB) => void): DB {
  const db = load(); // always fresh — the other tab may have written
  fn(db);
  cache = db;
  localStorage.setItem(KEY, JSON.stringify(db));
  emit();
  return db;
}

export function resetDemoData(): void {
  const seed = buildSeed();
  cache = seed;
  localStorage.setItem(KEY, JSON.stringify(seed));
  emit();
}

// Cross-tab sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      cache = null;
      emit();
    }
  });
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** React hook: subscribe to the whole DB (components select what they need). */
export function useDB(): DB {
  return useSyncExternalStore(subscribe, getDB);
}

// ---- per-tab auth (sessionStorage so two tabs can hold different roles) ----

export function getCurrentUserId(): string | null {
  return sessionStorage.getItem(SESSION_USER_KEY);
}

export function setCurrentUserId(id: string | null): void {
  if (id) sessionStorage.setItem(SESSION_USER_KEY, id);
  else sessionStorage.removeItem(SESSION_USER_KEY);
  emit();
}

/** React hook: current signed-in user id (per-tab). Primitive snapshot, so
 *  sign-in/out re-renders subscribers even when the DB object is unchanged. */
export function useCurrentUserId(): string | null {
  return useSyncExternalStore(subscribe, getCurrentUserId);
}
