import { openAigramProfile } from '@shared/runtime/bridge';
import { NightRecord } from '../types';
import { t } from '../i18n';

interface Props {
  history: NightRecord[];
  inAigram: boolean;
  onBack: () => void;
}

export default function LedgerScreen({ history, inAigram, onBack }: Props) {
  return (
    <div className="tsi-screen tsi-ledger">
      <div className="tsi-ledger__header">
        <button className="tsi-ledger__back" onPointerDown={onBack}>
          ← {t('back')}
        </button>
        <h1 className="tsi-ledger__title">{t('ledger_title')}</h1>
      </div>

      {history.length === 0 ? (
        <div className="tsi-ledger__empty">{t('ledger_empty')}</div>
      ) : (
        <div className="tsi-ledger__list">
          {history.map((n) => (
            <div key={n.id} className="tsi-ledger__row">
              <div className="tsi-ledger__row-head">
                <span className="tsi-ledger__date">{n.dateLabel}</span>
                {inAigram && n.renter.id ? (
                  <button
                    type="button"
                    className="tsi-ledger__renter tsi-ledger__renter--tappable"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAigramProfile(n.renter.id);
                    }}
                  >
                    — {n.renter.name}
                  </button>
                ) : (
                  <span className="tsi-ledger__renter">— {n.renter.name}</span>
                )}
              </div>
              <div className="tsi-ledger__row-body">
                {n.actions.map((a, i) => (
                  <div
                    key={i}
                    className={`tsi-ledger__act tsi-ledger__act--${n.verdicts[i]}`}
                  >
                    <span className="tsi-ledger__kind">
                      {a.kind === 'post' ? '✎' : '☱'}
                    </span>
                    <span className="tsi-ledger__body">
                      {n.verdicts[i] === 'disavowed' ? t('ghost_was_here') : a.body}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
