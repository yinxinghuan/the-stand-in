import { useState } from 'react';
import { openAigramProfile } from '@shared/runtime/bridge';
import { ActionKind, NightAction } from '../types';
import { SleepingUser } from '../hooks/useGhostWall';
import { t } from '../i18n';

interface Props {
  target: SleepingUser;
  inAigram: boolean;
  onPublish: (actions: NightAction[]) => void;
  onBack: () => void;
}

export default function StandInScreen({
  target,
  inAigram,
  onPublish,
  onBack,
}: Props) {
  const [kind, setKind] = useState<ActionKind>('post');
  const [body, setBody] = useState('');
  const [done, setDone] = useState(false);

  const tappable = inAigram && !!target.userId;
  const trimmed = body.trim();

  const publish = () => {
    if (!trimmed || done) return;
    onPublish([{ kind, body: trimmed }]);
    setDone(true);
    window.setTimeout(onBack, 1200);
  };

  const avatar = target.avatarUrl ? (
    <img
      className="tsi-standin__avatar"
      src={target.avatarUrl}
      alt={target.name}
      draggable={false}
    />
  ) : (
    <div className="tsi-standin__circle">{target.name.slice(0, 1)}</div>
  );

  return (
    <div className="tsi-screen tsi-standin">
      <div className="tsi-standin__header">
        <button className="tsi-standin__back" onPointerDown={onBack}>
          ← {t('back')}
        </button>
      </div>

      <h1 className="tsi-standin__title">
        {t('stand_in_title', { name: target.name })}
      </h1>

      <button
        type="button"
        className="tsi-standin__who"
        disabled={!tappable}
        onClick={(e) => {
          e.stopPropagation();
          if (tappable) openAigramProfile(target.userId);
        }}
      >
        {avatar}
        <span className="tsi-standin__who-name">{target.name}</span>
      </button>

      {done ? (
        <div className="tsi-standin__done">
          {t('stand_in_done', { name: target.name })}
        </div>
      ) : (
        <>
          <div className="tsi-standin__modes">
            <button
              className={`tsi-standin__mode${
                kind === 'post' ? ' tsi-standin__mode--on' : ''
              }`}
              onPointerDown={() => setKind('post')}
            >
              {t('stand_in_as_post')}
            </button>
            <button
              className={`tsi-standin__mode${
                kind === 'bio' ? ' tsi-standin__mode--on' : ''
              }`}
              onPointerDown={() => setKind('bio')}
            >
              {t('stand_in_as_bio')}
            </button>
          </div>

          <textarea
            className="tsi-standin__input"
            value={body}
            maxLength={kind === 'bio' ? 60 : 180}
            placeholder={
              kind === 'post' ? t('stand_in_ph_post') : t('stand_in_ph_bio')
            }
            onChange={(e) => setBody(e.target.value)}
          />

          <button
            className="tsi-standin__publish"
            disabled={!trimmed}
            onPointerDown={publish}
          >
            {t('stand_in_publish')}
          </button>
        </>
      )}
    </div>
  );
}
