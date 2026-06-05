import { NightAction, Renter, Self } from './types';
import type { SleepingUser } from './hooks/useGhostWall';

// Until pairing engine is wired, the renter is hard-coded.
// Cycle through a few candidates so re-runs feel varied.
const renterPool: Renter[] = [
  { id: 'jenny', name: 'Jenny', avatarUrl: '' },
  { id: 'algram', name: 'Algram', avatarUrl: '' },
  { id: 'jmf', name: 'JM·F', avatarUrl: '' },
  { id: 'ghostpixel', name: 'ghostpixel', avatarUrl: '' },
];

let rotation = 0;

export function fixtureRenter(): Renter {
  const r = renterPool[rotation % renterPool.length];
  rotation += 1;
  return r;
}

// Template sleepers — shown on the awake screen when the wall has no real
// sleeping friends, so "stand in for someone" is always something you can do
// (never a dead end, even during the sleep cooldown). Same canonical cast as
// the renter pool. since-offsets are staggered so the strip reads as a few
// people who drifted off at different times tonight.
export function fixtureSleepers(now: number): SleepingUser[] {
  return [
    { userId: 'tpl_jenny', name: 'Jenny', avatarUrl: '', since: now - 22 * 60_000, synthetic: true },
    { userId: 'tpl_algram', name: 'Algram', avatarUrl: '', since: now - 51 * 60_000, synthetic: true },
    { userId: 'tpl_ghostpixel', name: 'ghostpixel', avatarUrl: '', since: now - 134 * 60_000, synthetic: true },
  ];
}

export function fixtureSelf(): Self {
  return {
    id: 'me',
    name: 'Yin',
    bioHeadline: 'collecting late trains',
  };
}

// A renter's "post" + new bio headline, varied by who took the night.
export function fixtureNightActions(renter: Renter): NightAction[] {
  const lines: Record<string, [string, string]> = {
    jenny: [
      'i told everyone in the lobby you said hi. you owe me.',
      'borrowed for one night, please return',
    ],
    algram: [
      'three a.m. confession: i fold my socks by warmth not color.',
      'temporarily not myself',
    ],
    jmf: [
      'wrote a love letter and addressed it wrong on purpose.',
      "i'm someone else's draft tonight",
    ],
    ghostpixel: [
      'logged into your account, ate all your leftovers, sorry.',
      'house-sitting a person',
    ],
  };
  const fallback: [string, string] = [
    'spoke for you in a language you do not own.',
    'on loan',
  ];
  const [post, bio] = lines[renter.id] ?? fallback;
  return [
    { kind: 'post', body: post },
    { kind: 'bio', body: bio },
  ];
}
