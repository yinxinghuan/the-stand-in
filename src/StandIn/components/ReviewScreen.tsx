import { openAigramProfile } from '@shared/runtime/bridge';
import { NightAction, NightRecord, Renter, Verdict } from '../types';
import { t } from '../i18n';
import Stamp from './Stamp';

interface Props {
  night: NightRecord;
  inAigram: boolean;
  onJudge: (i: number, v: Verdict) => void;
  onFinish: () => void;
}

function RenterMark({ renter, inAigram }: { renter: Renter; inAigram: boolean }) {
  const tappable = inAigram && !!renter.id;
  const avatar = renter.avatarUrl ? (
    <img
      className="tsi-rentermark__avatar"
      src={renter.avatarUrl}
      alt={renter.name}
      draggable={false}
    />
  ) : (
    <div className="tsi-rentermark__circle">{renter.name.slice(0, 1)}</div>
  );

  // Inside the scrollable review list → onClick, not onPointerDown.
  return (
    <button
      type="button"
      className="tsi-rentermark"
      disabled={!tappable}
      onClick={(e) => {
        e.stopPropagation();
        if (tappable) openAigramProfile(renter.id);
      }}
    >
      {avatar}
      <span className="tsi-rentermark__name">— {renter.name}</span>
    </button>
  );
}

function ActionCard({
  action,
  renter,
  verdict,
  inAigram,
  onApprove,
  onDisavow,
}: {
  action: NightAction;
  renter: Renter;
  verdict: Verdict;
  inAigram: boolean;
  onApprove: () => void;
  onDisavow: () => void;
}) {
  const label =
    action.kind === 'post' ? t('action_post_label') : t('action_bio_label');

  return (
    <div className={`tsi-action tsi-action--${verdict}`}>
      <div className="tsi-action__paper">
        <div className="tsi-action__label">{label}</div>

        <div className="tsi-action__body">
          {verdict === 'disavowed' ? (
            <span className="tsi-action__ghost">{t('ghost_was_here')}</span>
          ) : (
            <span className="tsi-action__quote">{action.body}</span>
          )}
        </div>

        <RenterMark renter={renter} inAigram={inAigram} />

        {verdict !== 'pending' && (
          <div className="tsi-action__stamp">
            <Stamp
              kind={verdict}
              label={verdict === 'approved' ? t('approved_stamp') : t('disavowed_stamp')}
            />
          </div>
        )}
      </div>

      {verdict === 'pending' && (
        <div className="tsi-action__btns">
          <button className="tsi-action__btn tsi-action__btn--disavow" onPointerDown={onDisavow}>
            {t('disavow')}
          </button>
          <button className="tsi-action__btn tsi-action__btn--approve" onPointerDown={onApprove}>
            {t('approve')}
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReviewScreen({ night, inAigram, onJudge, onFinish }: Props) {
  const allJudged = night.verdicts.every((v) => v !== 'pending');

  return (
    <div className="tsi-screen tsi-review">
      <div className="tsi-review__date">{night.dateLabel}</div>
      <h1 className="tsi-review__title">{t('review_title')}</h1>
      <div className="tsi-review__subtitle">
        {t('review_subtitle', { name: night.renter.name })}
      </div>

      <div className="tsi-review__list">
        {night.actions.map((a, i) => (
          <ActionCard
            key={i}
            action={a}
            renter={night.renter}
            verdict={night.verdicts[i]}
            inAigram={inAigram}
            onApprove={() => onJudge(i, 'approved')}
            onDisavow={() => onJudge(i, 'disavowed')}
          />
        ))}
      </div>

      <button
        className="tsi-review__finish"
        disabled={!allJudged}
        onPointerDown={onFinish}
      >
        {t('back')}
      </button>
    </div>
  );
}
