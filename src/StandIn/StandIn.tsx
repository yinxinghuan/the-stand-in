import { useState } from 'react';
import { FIELD_H, FIELD_W } from './types';
import { SleepingUser } from './hooks/useGhostWall';
import { useStandIn } from './hooks/useStandIn';
import AwakeScreen from './components/AwakeScreen';
import NightOverlay from './components/NightOverlay';
import ReviewScreen from './components/ReviewScreen';
import LedgerScreen from './components/LedgerScreen';
import StandInScreen from './components/StandInScreen';
import './StandIn.less';

export default function StandIn() {
  const {
    phase,
    scale,
    self,
    history,
    pendingNight,
    inAigram,
    canSleep,
    cooldownRemaining,
    sleepingUsers,
    tuckIn,
    judge,
    finishReview,
    standInFor,
  } = useStandIn();

  const [showingLedger, setShowingLedger] = useState(false);
  const [standingInFor, setStandingInFor] = useState<SleepingUser | null>(null);

  return (
    <div
      className="tsi"
      style={{
        width: FIELD_W,
        height: FIELD_H,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {showingLedger ? (
        <LedgerScreen
          history={history}
          inAigram={inAigram}
          onBack={() => setShowingLedger(false)}
        />
      ) : standingInFor && phase === 'awake' ? (
        <StandInScreen
          target={standingInFor}
          inAigram={inAigram}
          onPublish={(actions) => standInFor(standingInFor, actions)}
          onBack={() => setStandingInFor(null)}
        />
      ) : phase === 'awake' ? (
        <AwakeScreen
          self={self}
          onTuckIn={tuckIn}
          historyCount={history.length}
          onOpenLedger={() => setShowingLedger(true)}
          canSleep={canSleep}
          cooldownRemaining={cooldownRemaining}
          inAigram={inAigram}
          sleepingUsers={sleepingUsers}
          onStandIn={(u) => setStandingInFor(u)}
        />
      ) : phase === 'reviewing' && pendingNight ? (
        <ReviewScreen
          night={pendingNight}
          inAigram={inAigram}
          onJudge={judge}
          onFinish={finishReview}
        />
      ) : (
        <NightOverlay phase={phase} self={self} />
      )}
    </div>
  );
}
