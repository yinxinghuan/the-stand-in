export const FIELD_W = 390;
export const FIELD_H = 844;

// One "night" in real wall-clock time would be 23:00 → 06:00 local (7h).
// For development we collapse that to 30 seconds so the loop can be felt
// without waiting. Toggle DEV_FAST_NIGHT to switch.
export const DEV_FAST_NIGHT = true;
export const NIGHT_MS_DEV = 30_000;       // 30s = one whole night in dev
export const NIGHT_MS_REAL = 7 * 60 * 60 * 1000;

// Cooldown between nights — the "come back later" cadence. Half-day in prod;
// a short window in dev so the gate can be felt without waiting. Driven purely
// by a local timestamp (never platform stats — those don't reset reliably and
// would lock the player out permanently).
export const COOLDOWN_MS_REAL = 10 * 60 * 60 * 1000;  // ~half a day
export const COOLDOWN_MS_DEV = 20_000;                // 20s in dev
export const COOLDOWN_MS = DEV_FAST_NIGHT ? COOLDOWN_MS_DEV : COOLDOWN_MS_REAL;

// Phase of the local user's day.
export type Phase =
  | 'awake'        // pre-bedtime, normal use
  | 'tucking_in'   // 23:00 — lights-off animation
  | 'asleep'       // body is rented out, soul is gone
  | 'waking'       // 06:00 — sunrise animation
  | 'reviewing';   // judging what the renter did last night

export interface Renter {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Self {
  id: string;
  name: string;
  bioHeadline: string;
  avatarUrl?: string;
}

export type ActionKind = 'post' | 'bio';

export interface NightAction {
  kind: ActionKind;
  body: string;          // the post body, or the new bio headline
  imageUrl?: string;     // optional, only on 'post'
}

export type Verdict = 'pending' | 'approved' | 'disavowed';

export interface NightRecord {
  id: string;                  // local id for this night
  dateLabel: string;           // e.g. "Tue, Jun 4"
  renter: Renter;
  actions: NightAction[];
  verdicts: Verdict[];         // index-aligned with actions
}

// Ghost Wall (cross-user). While I sleep I publish a SleepingMark carrying my
// identity so an awake friend can find me and stand in. When they do, they
// append a StandInAct (targeted at me) to THEIR save row; on wake I scan the
// wall for acts about me and turn them into the night I judge.
export interface SleepingMark {
  since: number;
  name: string;
  avatarUrl: string;
}

export interface StandInAct {
  id: string;            // unique; tracked in the target's consumedActIds
  targetUserId: string;  // the sleeper this act was done to
  authorId: string;      // who stood in
  authorName: string;
  authorAvatarUrl: string;
  createdAt: number;
  actions: NightAction[];
}
