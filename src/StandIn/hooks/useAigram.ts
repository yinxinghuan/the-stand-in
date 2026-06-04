import { useEffect, useState } from 'react';
import {
  callAigramAPI,
  isInAigram,
  telegramId,
  type AigramResponse,
} from '@shared/runtime/bridge';
import { Renter, Self } from '../types';
import { fixtureSelf } from '../fixtures';

interface RawUser {
  telegram_id?: string | number;
  id?: string | number;
  user_id?: string | number;
  name?: string;
  nick_name?: string;
  head_url?: string;
  avatar?: string;
  desc?: string;
  bio?: string;
}

interface UserInfo {
  name?: string;
  head_url?: string;
  avatar?: string;
  desc?: string;
  bio?: string;
}

export interface UseAigram {
  /** Resolved player identity. Falls back to fixture self outside Aigram. */
  self: Self;
  /** Real contacts to pair as renters. Empty outside Aigram (fixtures cover it). */
  friends: Renter[];
  /** True once the initial identity + contact probe settled. */
  ready: boolean;
  inAigram: boolean;
}

function idOf(u: RawUser): string {
  const raw = u.telegram_id ?? u.id ?? u.user_id;
  return raw == null ? '' : String(raw);
}

function toRenter(u: RawUser): Renter {
  return {
    id: idOf(u),
    name: u.name || u.nick_name || 'someone',
    avatarUrl: u.head_url || u.avatar || '',
  };
}

const DEFAULT_BIO = 'collecting late trains';

export function useAigram(): UseAigram {
  const [self, setSelf] = useState<Self>(() => fixtureSelf());
  const [friends, setFriends] = useState<Renter[]>([]);
  const [ready, setReady] = useState(!isInAigram);

  useEffect(() => {
    if (!isInAigram || !telegramId) return;
    let cancelled = false;

    (async () => {
      const [meRes, contactsRes] = await Promise.allSettled([
        callAigramAPI<AigramResponse<UserInfo>>(
          `/note/telegram/user/get/info/by/telegram_id?telegram_id=${encodeURIComponent(
            telegramId,
          )}`,
          'GET',
        ),
        callAigramAPI<AigramResponse<RawUser[]>>(
          `/note/telegram/user/contact/list?telegram_id=${encodeURIComponent(
            telegramId,
          )}`,
          'GET',
        ),
      ]);

      if (cancelled) return;

      if (meRes.status === 'fulfilled') {
        const info = meRes.value?.data;
        if (info) {
          setSelf({
            id: telegramId,
            name: info.name || 'You',
            bioHeadline: info.desc || info.bio || DEFAULT_BIO,
            avatarUrl: info.head_url || info.avatar || '',
          });
        }
      }

      if (contactsRes.status === 'fulfilled') {
        const rows = Array.isArray(contactsRes.value?.data)
          ? contactsRes.value.data
          : [];
        const mapped = rows
          .map(toRenter)
          .filter((r) => r.id && r.id !== telegramId && r.name);
        setFriends(mapped);
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { self, friends, ready, inAigram: isInAigram };
}
