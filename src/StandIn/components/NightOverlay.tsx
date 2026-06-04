import { Phase, Self } from '../types';
import { t } from '../i18n';
import Candle from './Candle';

interface Props {
  phase: Phase;
  self: Self;
}

// Covers tucking_in / asleep / waking — all three are night,
// with phase-specific motion: candle, ghost echo, sunrise wash.
export default function NightOverlay({ phase, self }: Props) {
  const candlePhase: 'lit' | 'puffing' | 'out' =
    phase === 'tucking_in' ? 'puffing' : phase === 'asleep' || phase === 'waking' ? 'out' : 'lit';

  return (
    <div className={`tsi-night tsi-night--${phase}`}>
      <div className="tsi-night__candle-wrap">
        <Candle phase={candlePhase} />
      </div>

      <div className="tsi-night__center">
        <div className="tsi-night__brand">{t('brand')}</div>

        {phase === 'tucking_in' && (
          <div className="tsi-night__caption">{t('tucking_in')}</div>
        )}

        {phase === 'asleep' && (
          <>
            <div className="tsi-night__ghost-stack">
              <span className="tsi-night__ghost tsi-night__ghost--echo">{self.name}</span>
              <span className="tsi-night__ghost">{self.name}</span>
            </div>
            <div className="tsi-night__caption">{t('asleep_subtitle')}</div>
          </>
        )}

        {phase === 'waking' && (
          <div className="tsi-night__caption tsi-night__caption--sunrise">
            {t('waking')}
          </div>
        )}
      </div>

      <div className="tsi-night__sunrise" />
    </div>
  );
}
