import { NightAction, Renter, Self } from './types';

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
