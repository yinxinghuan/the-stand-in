// The Ghost Wall — the cross-user layer behind The Stand-In.
//
// Every player's save row is world-readable via get/data/list (6 most-recent
// users). From those rows we derive two things:
//
//   sleepingUsers — anyone currently asleep (their row carries a `sleeping`
//                   mark with name + avatar), so an awake player can stand in
//                   for them. Excludes me.
//   actsAboutMe   — StandInActs other players authored targeting ME, that I
//                   have not yet judged (id ∉ consumedActIds). On wake these
//                   become the night I review; if empty we fall back to a
//                   template (useStandIn handles that).
//
// Outside Aigram this resolves to empty — the single-player loop runs on
// fixtures + templates, never the wall.

import { useCallback, useEffect, useState } from 'react';
import {
  callAigramAPI,
  isInAigram,
  type AigramResponse,
} from '@shared/runtime/bridge';
import { getGameUuid } from '@shared/runtime/game-id';
import type { SleepingMark, StandInAct } from '../types';

// A sleeping mark older than this is treated as a stale/abandoned session
// (player closed the app mid-night and never woke to clear it), so we hide
// them from the awake stand-in list.
const MAX_SLEEP_MS = 18 * 60 * 60 * 1000;

interface SaveRow {
  user_id: string;
  time?: string;
  resource_data?: string;
}

// Shape of any player's published save, as seen from the wall.
interface WallSave {
  sleeping?: SleepingMark | null;
  standIns?: StandInAct[];
}

export interface SleepingUser {
  userId: string;
  name: string;
  avatarUrl: string;
  since: number;
  // True for template sleepers seeded when the wall has no real ones, so the
  // "stand in for someone" half is never empty. Synthetic users have no real
  // Aigram profile — their avatar/name chip must not be tappable.
  synthetic?: boolean;
}

export interface UseGhostWall {
  sleepingUsers: SleepingUser[];
  actsAboutMe: StandInAct[];
  loaded: boolean;
  refresh: () => void;
}

export function useGhostWall(
  myId: string | null,
  consumedActIds: string[],
): UseGhostWall {
  const [sleepingUsers, setSleepingUsers] = useState<SleepingUser[]>([]);
  const [actsAboutMe, setActsAboutMe] = useState<StandInAct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const sessionId = getGameUuid();
    if (!isInAigram || !sessionId) {
      setLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await callAigramAPI<AigramResponse<SaveRow[]>>(
          `/note/aigram/ai/game/get/data/list?session_id=${encodeURIComponent(
            sessionId,
          )}`,
          'GET',
        );
        const rows = Array.isArray(res?.data) ? res.data : [];
        const consumed = new Set(consumedActIds);
        const sleepers: SleepingUser[] = [];
        const acts: StandInAct[] = [];

        for (const row of rows) {
          if (!row.resource_data) continue;
          let save: WallSave;
          try {
            save = JSON.parse(row.resource_data) as WallSave;
          } catch {
            continue;
          }

          if (
            save.sleeping &&
            row.user_id &&
            row.user_id !== myId &&
            Date.now() - (save.sleeping.since || 0) < MAX_SLEEP_MS
          ) {
            sleepers.push({
              userId: row.user_id,
              name: save.sleeping.name || 'someone',
              avatarUrl: save.sleeping.avatarUrl || '',
              since: save.sleeping.since || 0,
            });
          }

          for (const a of save.standIns || []) {
            if (
              a &&
              a.id &&
              a.targetUserId === myId &&
              !consumed.has(a.id) &&
              Array.isArray(a.actions) &&
              a.actions.length > 0
            ) {
              acts.push(a);
            }
          }
        }

        sleepers.sort((a, b) => b.since - a.since);
        acts.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        if (cancelled) return;
        setSleepingUsers(sleepers);
        setActsAboutMe(acts);
      } catch {
        if (!cancelled) {
          setSleepingUsers([]);
          setActsAboutMe([]);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nonce, myId, consumedActIds]);

  return { sleepingUsers, actsAboutMe, loaded, refresh };
}
