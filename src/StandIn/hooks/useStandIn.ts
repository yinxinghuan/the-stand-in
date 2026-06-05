import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameSave } from '@shared/save';
import {
  COOLDOWN_MS,
  DEV_FAST_NIGHT,
  NIGHT_MS_DEV,
  NightAction,
  NightRecord,
  Phase,
  Renter,
  SleepingMark,
  StandInAct,
  Verdict,
} from '../types';
import {
  fixtureNightActions,
  fixtureRenter,
  fixtureSleepers,
} from '../fixtures';
import { useAigram } from './useAigram';
import { useGhostWall, SleepingUser } from './useGhostWall';

const GAME_ID = 'the-stand-in';

interface SaveShape {
  history: NightRecord[];
  lastSleepAt?: number;        // local-only cadence stamp; cooldown measures from here
  sleeping?: SleepingMark | null; // present while I'm asleep (rentable on the wall)
  standIns?: StandInAct[];     // acts I authored about OTHER sleepers
  consumedActIds?: string[];   // wall acts about me I've already judged
}

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// Template night — used when the wall has nothing about me (single-player, or
// nobody stood in last night). Actions are templated; the renter is a real
// contact when one is available.
function buildNightRecord(renter: Renter): NightRecord {
  const actions = fixtureNightActions(renter);
  return {
    id: `n_${Date.now()}`,
    dateLabel: todayLabel(),
    renter,
    actions,
    verdicts: actions.map(() => 'pending' as Verdict),
  };
}

// Real night — built from wall acts a single author did to me. One night =
// one renter, so we take all acts by the same author and fold them together.
function buildNightFromActs(acts: StandInAct[]): NightRecord {
  const first = acts[0];
  const actions = acts.flatMap((a) => a.actions);
  return {
    id: `n_${Date.now()}`,
    dateLabel: todayLabel(),
    renter: {
      id: first.authorId,
      name: first.authorName,
      avatarUrl: first.authorAvatarUrl,
    },
    actions,
    verdicts: actions.map(() => 'pending' as Verdict),
  };
}

export function useStandIn() {
  const { self, friends, inAigram } = useAigram();

  const [phase, setPhase] = useState<Phase>('awake');
  const [pendingNight, setPendingNight] = useState<NightRecord | null>(null);

  // Cloud save. savedData loads once and never echoes writes back, so keep the
  // full shape in a ref as source of truth and treat persist() as a side
  // effect. React mirrors exist only for values the UI / wall need to react to.
  const save = useGameSave<SaveShape>(GAME_ID);
  const saveRef = useRef<SaveShape>({
    history: [],
    standIns: [],
    consumedActIds: [],
  });
  const [history, setHistory] = useState<NightRecord[]>([]);
  const [lastSleepAt, setLastSleepAt] = useState<number>(0);
  const [consumedActIds, setConsumedActIds] = useState<string[]>([]);
  useEffect(() => {
    if (!save.savedData) return;
    const s = save.savedData;
    saveRef.current = {
      history: s.history || [],
      lastSleepAt: s.lastSleepAt,
      sleeping: s.sleeping ?? null,
      standIns: s.standIns || [],
      consumedActIds: s.consumedActIds || [],
    };
    setHistory(saveRef.current.history);
    setLastSleepAt(saveRef.current.lastSleepAt || 0);
    setConsumedActIds(saveRef.current.consumedActIds || []);
  }, [save.savedData]);

  const commit = useCallback(
    (patch: Partial<SaveShape>) => {
      saveRef.current = { ...saveRef.current, ...patch };
      save.persist(saveRef.current);
    },
    [save],
  );

  // The cross-user wall: who's sleeping (I can stand in for them) and what was
  // done to me while I slept (unjudged acts targeting me).
  const { sleepingUsers, actsAboutMe, refresh: refreshWall } = useGhostWall(
    self.id,
    consumedActIds,
  );
  const actsRef = useRef<StandInAct[]>([]);
  useEffect(() => {
    actsRef.current = actsAboutMe;
  }, [actsAboutMe]);

  // Who you can stand in for. Real sleepers from the wall take priority; when
  // none are asleep (early days, empty wall, single-player) fall back to a
  // template cast so the awake screen always offers something to do — including
  // during the sleep cooldown. Templates are stable across renders.
  const templateSleepers = useRef<SleepingUser[]>(
    fixtureSleepers(Date.now()),
  ).current;
  const displaySleepers =
    sleepingUsers.length > 0 ? sleepingUsers : templateSleepers;

  // Cooldown gate — ticking remaining time until the next night is allowed.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const readyAt = lastSleepAt + COOLDOWN_MS;
  const cooldownRemaining = Math.max(0, readyAt - now);
  const canSleep = cooldownRemaining === 0;

  const timerRef = useRef<number | null>(null);
  const pendingActIdsRef = useRef<string[]>([]);

  // Pick the night's renter for a template night: a random real contact, else
  // a fixture.
  const pickRenter = useCallback((): Renter => {
    if (friends.length > 0) {
      return friends[Math.floor(Math.random() * friends.length)];
    }
    return fixtureRenter();
  }, [friends]);

  // Bedtime → renter takes over → wake → review. On wake we prefer real acts
  // from the wall (one author = tonight's renter); else a template night.
  const tuckIn = useCallback(() => {
    if (phase !== 'awake' || !canSleep) return;

    // Publish that I'm asleep so an awake friend can find me, and re-read the
    // wall so the acts I judge on waking are as fresh as possible.
    commit({
      sleeping: {
        since: Date.now(),
        name: self.name,
        avatarUrl: self.avatarUrl || '',
      },
    });
    refreshWall();
    setPhase('tucking_in');

    timerRef.current = window.setTimeout(() => {
      setPhase('asleep');

      const nightMs = DEV_FAST_NIGHT ? NIGHT_MS_DEV : 5000;
      timerRef.current = window.setTimeout(() => {
        setPhase('waking');

        timerRef.current = window.setTimeout(() => {
          const acts = actsRef.current;
          if (acts.length > 0) {
            // One night = one renter. Take the earliest author's acts.
            const author = acts[0].authorId;
            const theirs = acts.filter((a) => a.authorId === author);
            pendingActIdsRef.current = theirs.map((a) => a.id);
            setPendingNight(buildNightFromActs(theirs));
          } else {
            pendingActIdsRef.current = [];
            setPendingNight(buildNightRecord(pickRenter()));
          }
          setPhase('reviewing');
        }, 2400);
      }, nightMs);
    }, 1600);
  }, [phase, canSleep, pickRenter, self, commit, refreshWall]);

  const judge = useCallback(
    (actionIndex: number, verdict: Verdict) => {
      if (!pendingNight) return;
      setPendingNight({
        ...pendingNight,
        verdicts: pendingNight.verdicts.map((v, i) =>
          i === actionIndex ? verdict : v,
        ),
      });
    },
    [pendingNight],
  );

  const finishReview = useCallback(() => {
    if (!pendingNight) return;
    // Default any 'pending' verdict to 'approved' (silence == consent).
    const finalized: NightRecord = {
      ...pendingNight,
      verdicts: pendingNight.verdicts.map((v) =>
        v === 'pending' ? 'approved' : v,
      ),
    };
    const stamp = Date.now();
    const nextHistory = [finalized, ...history];
    const nextConsumed = [...consumedActIds, ...pendingActIdsRef.current];
    setLastSleepAt(stamp);
    setHistory(nextHistory);
    setConsumedActIds(nextConsumed);
    commit({
      history: nextHistory,
      lastSleepAt: stamp,
      sleeping: null,
      consumedActIds: nextConsumed,
    });
    pendingActIdsRef.current = [];
    setPendingNight(null);
    setPhase('awake');
  }, [pendingNight, history, consumedActIds, commit]);

  // Producer side — stand in for a currently-sleeping friend by doing
  // something as them. Appended to my standIns (bounded) and published so the
  // target sees it when they wake.
  const standInFor = useCallback(
    (target: SleepingUser, actions: NightAction[]) => {
      if (!self.id || actions.length === 0) return;
      // Template sleeper — there's no real wall row to publish to, so let the
      // compose screen run its course for the experience but write nothing.
      if (target.synthetic) return;
      const act: StandInAct = {
        id: `act_${self.id}_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 7)}`,
        targetUserId: target.userId,
        authorId: self.id,
        authorName: self.name,
        authorAvatarUrl: self.avatarUrl || '',
        createdAt: Date.now(),
        actions,
      };
      const nextStandIns = [act, ...(saveRef.current.standIns || [])].slice(
        0,
        50,
      );
      commit({ standIns: nextStandIns });
      refreshWall();
    },
    [self, commit, refreshWall],
  );

  // Viewport scale to fit FIELD_W × FIELD_H proportionally.
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScale(Math.min(w / 390, h / 844));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  return {
    phase,
    scale,
    self,
    history,
    pendingNight,
    inAigram,
    canSleep,
    cooldownRemaining,
    sleepingUsers: displaySleepers,
    tuckIn,
    judge,
    finishReview,
    standInFor,
  };
}
