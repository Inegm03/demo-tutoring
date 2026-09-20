import type { Level, SessionDuration } from '../lib/types';

/**
 * DEMO pricing rules. These are configurable placeholders, not a finalized
 * business model. Adjust freely; all UI reads from here.
 */
export const BASE_PRICE_PER_HOUR: Record<Level, number> = {
  primary: 25,
  intermediate: 30,
  secondary: 35,
};

export const DURATION_MULTIPLIER: Record<SessionDuration, number> = {
  30: 0.55,
  45: 0.8,
  60: 1,
  90: 1.45,
};

export const SESSION_DURATIONS: SessionDuration[] = [30, 45, 60, 90];

/**
 * Platform commission — configurable demo value, NOT a finalized business
 * rule. 0 means the teacher receives the full session price in the demo.
 * The data model records both gross and net so a real commission can be
 * introduced later without schema changes.
 */
export const PLATFORM_COMMISSION_RATE = 0;

/** Suggested wallet top-up amounts (SAR). */
export const TOPUP_PRESETS = [25, 50, 100, 200];

export function sessionPrice(level: Level, duration: SessionDuration): number {
  return Math.round(BASE_PRICE_PER_HOUR[level] * DURATION_MULTIPLIER[duration]);
}

export function teacherNet(gross: number): number {
  return Math.round(gross * (1 - PLATFORM_COMMISSION_RATE));
}
