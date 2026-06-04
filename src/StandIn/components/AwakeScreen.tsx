import { useEffect, useState } from 'react';
import { openAigramProfile } from '@shared/runtime/bridge';
import { Self } from '../types';
import { SleepingUser } from '../hooks/useGhostWall';
import { t } from '../i18n';

interface Props {
  self: Self;
  onTuckIn: () => void;
  historyCount: number;
  onOpenLedger: () => void;
  canSleep: boolean;
  cooldownRemaining: number;
  inAigram: boolean;
  sleepingUsers: SleepingUser[];
  onStandIn: (target: SleepingUser) => void;
}

function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function useEveningClock(): string {
  // Always a quiet evening hour, regardless of real-world time. The minute
  // ticks slowly so the screen feels alive, but the hour holds at 10 PM.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const minute = (47 + tick) % 60;
  return `10:${String(minute).padStart(2, '0')} PM`;
}

export default function AwakeScreen({
  self,
  onTuckIn,
  historyCount,
  onOpenLedger,
  canSleep,
  cooldownRemaining,
  inAigram,
  sleepingUsers,
  onStandIn,
}: Props) {
  const clock = useEveningClock();
  const sleepers = sleepingUsers.slice(0, 3);

  return (
    <div className="tsi-screen tsi-awake">
      {/* Bedroom motifs */}
      <div className="tsi-awake__lamp-glow" />
      <div className="tsi-awake__window" aria-hidden>
        <div className="tsi-awake__window-pane" />
      </div>

      <div className="tsi-awake__clock">{clock}</div>

      <div className="tsi-awake__frame">
        <div className="tsi-awake__avatar">
          <span>{self.name.slice(0, 1)}</span>
        </div>
        <div className="tsi-awake__name">{self.name}</div>
        <div className="tsi-awake__rule" />
        <div className="tsi-awake__bio">{self.bioHeadline}</div>
      </div>

      <div className="tsi-awake__hint">
        {canSleep ? t('awake_hint') : t('cooldown_hint')}
      </div>

      <button
        className="tsi-awake__btn"
        onPointerDown={canSleep ? onTuckIn : undefined}
        disabled={!canSleep}
      >
        <span className="tsi-awake__btn-mark">✦</span>
        {canSleep
          ? t('awake_go_to_bed')
          : t('cooldown_ready_in', { time: formatRemaining(cooldownRemaining) })}
      </button>

      {sleepers.length > 0 && (
        <div className="tsi-awake__wall">
          <div className="tsi-awake__wall-title">{t('sleeping_section')}</div>
          {sleepers.map((u) => (
            <div
              key={u.userId}
              className="tsi-awake__sleeper"
              onPointerDown={() => onStandIn(u)}
            >
              <button
                type="button"
                className="tsi-awake__sleeper-who"
                disabled={!inAigram}
                onClick={(e) => {
                  e.stopPropagation();
                  if (inAigram) openAigramProfile(u.userId);
                }}
              >
                {u.avatarUrl ? (
                  <img
                    className="tsi-awake__sleeper-avatar"
                    src={u.avatarUrl}
                    alt={u.name}
                    draggable={false}
                  />
                ) : (
                  <span className="tsi-awake__sleeper-circle">
                    {u.name.slice(0, 1)}
                  </span>
                )}
                <span className="tsi-awake__sleeper-name">{u.name}</span>
              </button>
              <span className="tsi-awake__sleeper-cta">
                {t('stand_in_cta')} →
              </span>
            </div>
          ))}
        </div>
      )}

      {historyCount > 0 && (
        <button className="tsi-awake__ledger" onPointerDown={onOpenLedger}>
          {t('to_ledger')} · {historyCount}
        </button>
      )}

      <div className="tsi-awake__dev">{t('dev_speed_label')}</div>
    </div>
  );
}
