'use client';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useBlackjack } from '@/lib/useBlackjack';
import { decksRemaining } from '@/lib/blackjack';
import Hand from '@/components/Hand';
import Card from '@/components/Card';
import ActionButtons from '@/components/ActionButtons';
import Chip from '@/components/Chip';
import CountDisplay from '@/components/CountDisplay';
import FeedbackPanel from '@/components/FeedbackPanel';
import BasicStrategyChart from '@/components/BasicStrategyChart';
import { getInsuranceAdvice } from '@/lib/basicStrategy';

function decompose(amount) {
  const denoms = [100, 50, 25, 10, 5];
  const chips = [];
  let rem = amount;
  for (const d of denoms) {
    while (rem >= d && chips.length < 6) {
      chips.push(d);
      rem -= d;
    }
  }
  return chips.length ? chips : [5];
}

// ── Chip row (left-to-right fold) ────────────────────────────────
function ChipRow({ chips, size = 40, entryClass = '', winClass = '', stagger = 75, baseDelay = 0 }) {
  const OVERLAP = Math.round(size * 0.28);
  const step = size - OVERLAP;
  const totalWidth = chips.length > 0 ? size + (chips.length - 1) * step : size;
  return (
    <div className="relative" style={{ width: totalWidth, height: size }}>
      {chips.map((val, i) => (
        <div
          key={i}
          className={`absolute ${entryClass}`}
          style={{ left: i * step, top: 0, zIndex: i, animationDelay: `${baseDelay + i * stagger}ms` }}
        >
          <Chip
            value={val}
            size={size}
            className={winClass}
            style={{ animationDelay: `${baseDelay + i * stagger}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

function BetChips({ bet, result, netProfit = 0, chipPhase, betKey }) {
  const betChips = useMemo(() => decompose(bet), [bet]);
  const doubled     = chipPhase === 'doubled';
  const surrendered = chipPhase === 'surrendered';
  const isWin  = result === 'win' || result === 'blackjack';
  const isLose = result === 'lose' || result === 'bust';

  const payoutAmt = result === 'blackjack' ? Math.floor(bet * 1.5)
    : result === 'win' ? netProfit : 0;
  const payoutChips = useMemo(() => payoutAmt > 0 ? decompose(payoutAmt) : [], [payoutAmt]);

  const displayAmt = result === 'blackjack' ? Math.floor(bet * 1.5)
    : isWin ? netProfit
    : isLose ? Math.abs(netProfit)
    : doubled ? bet * 2 : bet;

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Bet stack — folds in on deal, shines on win, slides left on lose */}
      <div style={{ opacity: surrendered ? 0.28 : 1, transition: 'opacity 0.6s' }}>
        <ChipRow
          key={betKey}
          chips={doubled ? [...betChips, ...betChips] : betChips}
          size={40}
          entryClass={isLose ? 'chip-to-dealer' : 'chip-fold-in'}
          winClass={isWin ? 'chip-win-shine' : ''}
        />
      </div>

      {/* Payout chips sliding in from dealer */}
      {payoutChips.length > 0 && (
        <ChipRow
          chips={payoutChips}
          size={40}
          entryClass="chip-from-dealer"
          stagger={110}
          baseDelay={320}
        />
      )}

      <span className={`text-xs font-black tabular-nums ${
        surrendered ? 'text-gray-500' : isWin ? 'text-yellow-300' : isLose ? 'text-red-400/60' : 'text-yellow-400'
      }`}>
        {surrendered ? `$${Math.floor(bet / 2)} back` : isWin ? `+$${displayAmt}` : isLose ? `-$${displayAmt}` : `$${displayAmt}`}
      </span>
    </div>
  );
}

// ── Blackjack celebration ─────────────────────────────────────────
function BlackjackCelebration({ bet }) {
  const particles = useMemo(() => {
    const count = 32;
    return Array.from({ length: count }, (_, i) => {
      const angle = ((360 / count) * i) * (Math.PI / 180);
      const tier  = i % 3;
      const dist  = [55, 95, 145][tier];
      const chars = ['★', '✦', '◆', '✸'];
      const colors = ['#fde047', '#fbbf24', '#f59e0b', '#fffbeb'];
      return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist, delay: tier * 90, size: [16, 13, 10][tier], color: colors[i % 4], char: chars[i % 4] };
    });
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bj-overlay-pulse" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(253,224,71,0.42) 0%, rgba(234,179,8,0.14) 52%, transparent 72%)' }} />
      {particles.map((p, i) => (
        <span key={i} className="bj-sparkle" style={{ top: '50%', left: '50%', '--tx': `${p.tx}px`, '--ty': `${p.ty}px`, animationDelay: `${p.delay}ms`, fontSize: `${p.size}px`, color: p.color, textShadow: `0 0 10px ${p.color}` }}>
          {p.char}
        </span>
      ))}
      <div className="text-center bj-text-slam">
        <div style={{ fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, background: 'linear-gradient(138deg, #fffbeb 0%, #fde047 18%, #f59e0b 48%, #fde047 76%, #fffbeb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.025em', lineHeight: 1, filter: 'drop-shadow(0 3px 28px rgba(251,191,36,0.95))' }}>
          BLACKJACK!
        </div>
        <div className="bj-payout-bounce font-black" style={{ fontSize: '22px', color: '#fde047', textShadow: '0 0 14px rgba(253,224,71,0.8)', marginTop: '8px' }}>
          +${Math.floor(bet * 1.5)}&nbsp;&nbsp;·&nbsp;&nbsp;3:2
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
export default function BlackjackTrainer() {
  const {
    shoe, runningCount, trueCount,
    phase, playerHands, activeHandIndex, dealerHand,
    bet, lastBet, lastNetProfit, bankroll, handBets, result, lastMistakes, lastCardCountHints,
    stats, canDouble, canSurrender, canSplit,
    playerHadBlackjack, insuranceTook, insuranceResult, insuranceMistake,
    setBet, deal, playerAction, dealerPlay, reset, insuranceAction, revealHole,
  } = useBlackjack();

  const [betKey,        setBetKey]        = useState(0);
  const [chipPhase,     setChipPhase]     = useState('idle');
  const [flashKey,      setFlashKey]      = useState(null);
  const [betInput,      setBetInput]      = useState('10');
  const [resultVisible,       setResultVisible]       = useState(false);
  const [showInsurancePrompt, setShowInsurancePrompt] = useState(false);
  const [insuranceReturning,  setInsuranceReturning]  = useState(false);
  const dealerPlayedRef = useRef(false);

  // Show full bankroll during active play — only reflect loss/win when round settles
  const activeBets = ['insurance', 'player', 'dealer'].includes(phase)
    ? (handBets ?? [bet]).reduce((s, b) => s + b, 0)
    : 0;
  const displayBankroll = bankroll + activeBets;

  const [animatedBankroll, setAnimatedBankroll] = useState(() => bankroll);
  const animBankrollRef = useRef(bankroll);
  const animRAF = useRef(null);
  useEffect(() => {
    const start = animBankrollRef.current;
    const end = displayBankroll;
    if (start === end) return;
    const startTime = performance.now();
    if (animRAF.current) cancelAnimationFrame(animRAF.current);
    const step = (now) => {
      const t = Math.min((now - startTime) / 600, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(start + (end - start) * eased);
      animBankrollRef.current = val;
      setAnimatedBankroll(val);
      if (t < 1) animRAF.current = requestAnimationFrame(step);
    };
    animRAF.current = requestAnimationFrame(step);
    return () => { if (animRAF.current) cancelAnimationFrame(animRAF.current); };
  }, [displayBankroll]);

  const prevBet = useRef(bet);
  useEffect(() => {
    if (bet !== prevBet.current) {
      setBetInput(String(bet));
      prevBet.current = bet;
    }
  }, [bet]);

  useEffect(() => {
    setChipPhase('idle');
    setBetKey(k => k + 1);
  }, [stats.hands]);

  // Insurance popup — appears 1.35s after ace settles (after rotation completes)
  useEffect(() => {
    if (phase === 'insurance') {
      setShowInsurancePrompt(false);
      setInsuranceReturning(false);
      const t = setTimeout(() => setShowInsurancePrompt(true), 1350);
      return () => clearTimeout(t);
    } else {
      setShowInsurancePrompt(false);
      setInsuranceReturning(false);
    }
  }, [phase]);

  // Track whether the dealer phase ran (to delay result reveal)
  useEffect(() => {
    if (phase === 'dealer') dealerPlayedRef.current = true;
    if (phase === 'betting') dealerPlayedRef.current = false;
  }, [phase]);

  // Reveal result — immediate for busts/surrenders/BJ, delayed after dealer play
  useEffect(() => {
    if (phase === 'over') {
      const delay = dealerPlayedRef.current ? 700 : 0;
      const t = setTimeout(() => {
        setResultVisible(true);
        if (result && result !== 'push' && result !== 'surrender') {
          setFlashKey(`${stats.hands}-${result}`);
        }
      }, delay);
      return () => clearTimeout(t);
    } else {
      setResultVisible(false);
    }
  }, [phase, result, stats.hands]);

  const dealerVisibleCount = dealerHand.filter(c => !c.faceDown).length;
  useEffect(() => {
    if (phase === 'dealer') {
      const jitter = Math.floor(Math.random() * 500) - 200; // -200…+300 ms natural variation
      const delay = Math.max(480, (dealerVisibleCount === 1 ? 1100 : 800) + jitter);
      const t = setTimeout(dealerPlay, delay);
      return () => clearTimeout(t);
    }
  }, [phase, dealerPlay, dealerVisibleCount]);

  // Auto-flip dealer hole card when game ends with it still face-down (dealer blackjack)
  const dealerHasHidden = dealerHand.some(c => c.faceDown);
  useEffect(() => {
    if (phase === 'over' && dealerHasHidden) {
      const t = setTimeout(revealHole, 1600);
      return () => clearTimeout(t);
    }
  }, [phase, dealerHasHidden, revealHole]);

  const MAX_BET = 500;
  const MIN_BET = 5;

  const handleSetBet = useCallback((amount) => {
    const clamped = Math.max(MIN_BET, Math.min(MAX_BET, Math.min(bankroll, amount)));
    setBet(clamped);
    setBetInput(String(clamped));
    setBetKey(k => k + 1);
  }, [setBet, bankroll]);

  const handleBetInput = (raw) => {
    setBetInput(raw);
    const val = parseInt(raw, 10);
    if (!isNaN(val) && val >= MIN_BET && val <= Math.min(MAX_BET, bankroll)) {
      setBet(val);
      setBetKey(k => k + 1);
    }
  };

  const handlePlayerAction = useCallback((move) => {
    if (move === 'D') setChipPhase('doubled');
    else if (move === 'R') setChipPhase('surrendered');
    playerAction(move);
  }, [playerAction]);

  const handleInsuranceDecision = useCallback((take) => {
    setInsuranceReturning(true);
    setTimeout(() => insuranceAction(take), 700);
  }, [insuranceAction]);

  // ── Keyboard shortcuts ───────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT') return;
      const k = e.key.toLowerCase();

      if (phase === 'player') {
        if (k === 'h' || k === 'arrowdown') { e.preventDefault(); handlePlayerAction('H'); }
        if (k === 's' || k === ' ') { e.preventDefault(); handlePlayerAction('S'); }
        if ((k === 'd' || k === '2') && canDouble)    { e.preventDefault(); handlePlayerAction('D'); }
        if (k === 'p' && canSplit)     { e.preventDefault(); handlePlayerAction('P'); }
        if (k === 'r' && canSurrender) { e.preventDefault(); handlePlayerAction('R'); }
      }
      if ((phase === 'betting' || phase === 'over') && (k === ' ' || k === 'enter') && bankroll >= bet) {
        e.preventDefault();
        deal();
      }
      if (phase === 'insurance' && !insuranceReturning) {
        if (k === 'y') { e.preventDefault(); handleInsuranceDecision(true); }
        if (k === 'n' || k === ' ') { e.preventDefault(); handleInsuranceDecision(false); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, insuranceReturning, canDouble, canSplit, canSurrender, handlePlayerAction, deal, handleInsuranceDecision, bankroll, bet]);

  const decksLeft      = decksRemaining(shoe);
  const cardsDealt     = dealerHand.length > 0;
  const playerHasCards = playerHands.some(h => h.length > 0);
  const isBJ = phase === 'over' && result === 'blackjack';

  // Dynamic zoom for split hands on mobile — recalculates as cards are added
  const splitZoom = (() => {
    if (playerHands.length < 2) return 1;
    const maxCards = Math.max(...playerHands.map(h => h.length), 2);
    const handW = maxCards * 84 + (maxCards - 1) * 8 + 24; // cards + gaps + p-3 padding
    const totalW = playerHands.length * handW + (playerHands.length - 1) * 8;
    return Math.min(1, 330 / totalW);
  })();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Blackjack GTO Trainer',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any — runs in the browser',
    url: 'https://blackjackgto.com',
    description: 'Free interactive blackjack trainer with real-time basic strategy feedback and Hi-Lo card counting practice. No signup, no money, no risk.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Real-time basic strategy feedback on every decision',
      'Hi-Lo running count and true count display',
      'Basic strategy chart reference built in',
      '6-deck shoe simulation with penetration',
      'Mistake tracking and session stats',
      'Keyboard shortcuts for fast play',
    ],
    author: { '@type': 'Organization', name: 'Blackjack GTO', url: 'https://blackjackgto.com' },
  };

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="min-h-[100dvh] lg:h-[100dvh] overflow-y-auto lg:overflow-hidden bg-gray-950 text-white">
      <div className="lg:h-full max-w-6xl mx-auto p-2 lg:p-3 flex flex-col lg:flex-row gap-2 lg:gap-3">

        {/* ── Left: Table ── */}
        <div className="flex flex-col gap-2 lg:flex-1 lg:min-h-0">

          {/* Topbar */}
          <div className="flex-none flex items-center justify-between px-3 lg:px-4 py-2 rounded-xl bg-gray-900 border border-gray-800">
            <span className="font-bold tracking-tight text-sm">Blackjack GTO</span>
            <div className="flex items-center gap-3 lg:gap-4 text-xs">
              <div>
                <span className="text-gray-500">Bankroll </span>
                <span className={`font-bold tabular-nums ${displayBankroll < 100 ? 'text-red-400' : 'text-emerald-400'}`}>${animatedBankroll}</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-500">Shoe </span>
                <span className="text-gray-300 font-semibold">{decksLeft.toFixed(1)}d</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-gray-500">Hands </span>
                <span className="text-gray-300 font-semibold">{stats.hands}</span>
              </div>
            </div>
          </div>

          {/* Table felt */}
          <div
            className="relative rounded-3xl overflow-hidden border-2 border-green-900 shadow-2xl flex flex-col min-h-[440px] lg:flex-1 lg:min-h-0"
            style={{ background: 'radial-gradient(ellipse at 50% 30%, #14532d 0%, #052e16 100%)' }}
          >
            {/* Flash overlay */}
            {flashKey && (
              <div
                key={flashKey}
                className={`absolute inset-0 pointer-events-none z-20 ${result === 'blackjack' ? 'flash-bj' : result === 'win' ? 'flash-win' : 'flash-lose'}`}
                style={{
                  background:
                    result === 'blackjack'
                      ? 'radial-gradient(ellipse at 50% 50%, rgba(253,224,71,0.58) 0%, rgba(234,179,8,0.2) 55%, transparent 75%)'
                      : result === 'win'
                        ? 'radial-gradient(ellipse at 50% 50%, rgba(74,222,128,0.48) 0%, rgba(34,197,94,0.15) 55%, transparent 75%)'
                        : 'radial-gradient(ellipse at 50% 50%, rgba(239,68,68,0.48) 0%, rgba(185,28,28,0.15) 55%, transparent 75%)',
                }}
              />
            )}

            {isBJ && <BlackjackCelebration bet={lastBet} />}

            {/* Dealer zone */}
            <div className="flex-1 flex flex-col items-center justify-center py-3 px-4 border-b border-green-900/60">
              <div className="text-green-600 text-xs font-semibold uppercase tracking-widest mb-2">Dealer</div>
              {cardsDealt ? (
                phase === 'insurance' ? (
                  <InsuranceDealerHand ace={dealerHand[0]} hole={dealerHand[1]} returning={insuranceReturning} />
                ) : (
                  <Hand hand={dealerHand} isDealer />
                )
              ) : (
                <div className="flex gap-2 opacity-20">
                  {[0,1].map(i => <div key={i} className="rounded-xl border-2 border-green-700 bg-green-900/40" style={{ width:84, height:126 }} />)}
                </div>
              )}
              {phase === 'over' && resultVisible && result && !isBJ && (
                <FeltResult result={result} bet={lastBet} netProfit={lastNetProfit} />
              )}
              {phase === 'insurance' && showInsurancePrompt && !insuranceReturning && (
                <InsurancePopup
                  bet={bet}
                  trueCount={trueCount}
                  onDecision={handleInsuranceDecision}
                  playerHasBJ={playerHadBlackjack}
                />
              )}
            </div>

            {/* Mobile deck calculator strip */}
            <div className="lg:hidden flex items-center justify-center gap-4 py-1 border-y border-green-900/40 bg-black/20 text-xs">
              <span>
                <span className="text-green-700 font-semibold uppercase tracking-wider">RC </span>
                <span className={`font-black tabular-nums ${runningCount > 0 ? 'text-green-400' : runningCount < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {runningCount > 0 ? `+${runningCount}` : runningCount}
                </span>
              </span>
              <span>
                <span className="text-green-700 font-semibold uppercase tracking-wider">TC </span>
                <span className={`font-black tabular-nums ${trueCount > 0 ? 'text-green-400' : trueCount < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {trueCount > 0 ? `+${trueCount.toFixed(1)}` : trueCount.toFixed(1)}
                </span>
              </span>
              <span>
                <span className="text-green-700 font-semibold uppercase tracking-wider">Deck </span>
                <span className="font-black tabular-nums text-gray-300">{decksLeft.toFixed(1)}</span>
              </span>
            </div>

            {/* Player zone */}
            <div className="flex-1 flex flex-col items-center justify-center py-3 px-4">
              <div className="text-green-600 text-xs font-semibold uppercase tracking-widest mb-2">You</div>
              {playerHasCards ? (
                <div
                  className={`flex gap-2 lg:gap-6 justify-center ${playerHands.length > 1 ? 'flex-nowrap player-split-hands' : 'flex-wrap'}`}
                  style={playerHands.length > 1 ? { '--split-zoom': splitZoom } : {}}
                >
                  {playerHands.map((hand, i) => (
                    <Hand
                      key={i}
                      hand={hand}
                      active={i === activeHandIndex && phase === 'player'}
                      label={playerHands.length > 1 ? `Hand ${i + 1}` : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex gap-2 opacity-20">
                  {[0,1].map(i => <div key={i} className="rounded-xl border-2 border-green-700 bg-green-900/40" style={{ width:84, height:126 }} />)}
                </div>
              )}
              {bet > 0 && (
                <div className="hidden sm:block mt-3">
                  <BetChips bet={phase === 'over' ? lastBet : bet} result={resultVisible ? result : null} netProfit={lastNetProfit} chipPhase={chipPhase} betKey={betKey} />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex-none rounded-xl bg-gray-900 border border-gray-800 px-4 py-2.5 min-h-[64px] flex flex-col justify-center">

            {/* Deal button */}
            {(phase === 'betting' || phase === 'over') && (
              <div className="space-y-2">
                <button
                  onClick={deal}
                  disabled={bankroll < bet}
                  className="relative w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-black font-black rounded-xl text-lg transition-all shadow-lg shadow-yellow-900/30 disabled:opacity-40 disabled:cursor-not-allowed tracking-tight"
                >
                  <span className="hidden sm:inline">▶  </span>{phase === 'over' ? 'Next Hand' : `Deal  ·  $${bet}`}
                  <span className="hidden sm:inline absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-black/15 border border-black/20 text-black/60">
                    Space
                  </span>
                </button>
                {bankroll <= 0 && (
                  <button onClick={reset} className="w-full py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl font-bold text-sm border border-red-700">
                    Bust out — reset bankroll
                  </button>
                )}
              </div>
            )}

            {/* Player action */}
            {phase === 'player' && (
              <div className="space-y-2">
                {playerHands.length > 1 && (
                  <div className="text-center text-purple-400 font-semibold text-xs">
                    Hand {activeHandIndex + 1} of {playerHands.length}
                  </div>
                )}
                <ActionButtons
                  onAction={handlePlayerAction}
                  canDouble={canDouble}
                  canSurrender={canSurrender}
                  canSplit={canSplit}
                  disabled={false}
                />
                {canSurrender && (
                  <p className="text-center text-blue-400/60 text-xs">Late surrender available</p>
                )}
              </div>
            )}

            {phase === 'insurance' && (
              <div className="flex items-center justify-center gap-2 py-1.5 text-gray-500 text-xs">
                <span className="animate-pulse">Dealer insurance offer — answer on the table</span>
              </div>
            )}

            {phase === 'dealer' && (
              <div className="flex items-center justify-center gap-2 py-1.5 text-gray-400">
                <span className="animate-pulse text-sm font-medium tracking-wide">Dealer playing…</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Info panels ── */}
        <div className="w-full lg:w-72 flex flex-col gap-2 lg:min-h-0 lg:overflow-y-auto">

          {/* Bet input */}
          <div className="flex-none bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-bold text-sm">Your Bet</span>
              <span className="text-gray-600 text-xs">
                Min <span className="text-yellow-600 font-semibold">$5</span>
                {' · '}
                Max <span className="text-yellow-600 font-semibold">$500</span>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl select-none">$</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={betInput}
                onChange={e => handleBetInput(e.target.value)}
                onFocus={e => e.target.select()}
                onBlur={() => {
                  const fallback = betInput.trim() === '' ? 10 : bet;
                  setBet(Math.max(MIN_BET, Math.min(MAX_BET, Math.min(bankroll, fallback))));
                  setBetInput(String(Math.max(MIN_BET, Math.min(MAX_BET, Math.min(bankroll, fallback)))));
                }}
                disabled={phase !== 'betting' && phase !== 'over'}
                className="w-full h-10 pl-9 pr-3 rounded-lg bg-gray-800 border border-gray-600 text-white font-black text-xl text-right focus:outline-none focus:border-yellow-500 tabular-nums disabled:opacity-40"
              />
            </div>
          </div>

          <FeedbackPanel
            result={result}
            lastMistakes={lastMistakes}
            insuranceMistake={insuranceMistake}
            insuranceTook={insuranceTook}
            insuranceResult={insuranceResult}
            stats={stats}
          />
          <CountDisplay
            runningCount={runningCount}
            trueCount={trueCount}
            lastCardCountHints={lastCardCountHints}
            decksLeft={decksLeft}
          />
          <BasicStrategyChart />
        </div>

      </div>
    </div>

    {/* SEO content — below the game, indexed by Google */}
    <section className="bg-gray-950 border-t border-gray-900 text-gray-400">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-white font-bold text-lg mb-3">Free Blackjack Basic Strategy &amp; Card Counting Trainer</h2>
        <p className="text-sm leading-relaxed mb-6">
          Blackjack GTO is a free interactive blackjack trainer that teaches you the correct play for every hand.
          Each decision is graded against mathematically optimal basic strategy in real time — hit, stand, double, split, or surrender.
          The built-in Hi-Lo card counting display tracks the running count and true count as you play, so you can practice both skills simultaneously.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 text-xs">
          {[
            { label: 'Basic Strategy', desc: 'Real-time feedback on every decision' },
            { label: 'Card Counting', desc: 'Running count & true count display' },
            { label: 'No Signup', desc: 'Free forever, no account required' },
            { label: '6-Deck Shoe', desc: 'Realistic casino conditions' },
          ].map(({ label, desc }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
              <div className="text-white font-semibold mb-0.5">{label}</div>
              <div className="text-gray-500">{desc}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <a href="/how-to-play-blackjack" className="text-blue-400 hover:text-blue-300">How to play blackjack →</a>
          <a href="/blackjack-strategy-chart" className="text-blue-400 hover:text-blue-300">Strategy charts →</a>
          <a href="/how-to-memorize-blackjack-strategy" className="text-blue-400 hover:text-blue-300">Memorize basic strategy →</a>
          <a href="/how-to-count-cards" className="text-blue-400 hover:text-blue-300">How to count cards →</a>
          <a href="/blackjack-house-edge-calculator" className="text-blue-400 hover:text-blue-300">House edge calculator →</a>
          <a href="/betting-calculators" className="text-blue-400 hover:text-blue-300">Betting calculators →</a>
        </div>
      </div>
    </section>
    </>
  );
}

// ── Result on the felt (near dealer hand) ────────────────────────
const FELT_META = {
  win:       { label: 'You Win!',    cls: 'text-emerald-200 bg-emerald-950/90 border-emerald-400' },
  push:      { label: 'Push',        cls: 'text-gray-200   bg-gray-800/90    border-gray-500'     },
  lose:      { label: 'Dealer Wins', cls: 'text-red-200    bg-red-950/90     border-red-500'      },
  bust:      { label: 'Bust!',       cls: 'text-red-200    bg-red-950/90     border-red-500'      },
  surrender: { label: 'Surrendered', cls: 'text-blue-200   bg-blue-950/90    border-blue-500'     },
};

function FeltResult({ result, bet, netProfit }) {
  const m = FELT_META[result];
  if (!m) return null;
  const amountStr =
    result === 'surrender' ? `+$${Math.floor(bet / 2)} back`
    : result === 'win'     ? `+$${netProfit}`
    : result === 'lose' || result === 'bust' ? `-$${Math.abs(netProfit)}`
    : null;
  return (
    <div className={`mt-3 flex items-center gap-2.5 px-5 py-2 rounded-2xl border-2 font-black text-xl win-amount-in ${m.cls}`}
      style={{ backdropFilter: 'blur(4px)' }}>
      <span>{m.label}</span>
      {amountStr && <span className="opacity-75 text-lg">{amountStr}</span>}
    </div>
  );
}

// ── Result banner ─────────────────────────────────────────────────
const RESULT_META = {
  win:       { emoji: '🏆', label: 'You Win!',    cls: 'text-emerald-300 bg-emerald-950/70 border-emerald-600', payout: b => `+$${b}` },
  blackjack: { emoji: '⚡', label: 'Blackjack!',  cls: 'text-yellow-200 bg-yellow-950/70 border-yellow-500',   payout: b => `+$${Math.floor(b*1.5)}` },
  push:      { emoji: '🤝', label: 'Push',         cls: 'text-gray-200  bg-gray-800/70   border-gray-500',      payout: null },
  lose:      { emoji: '💸', label: 'Dealer Wins',  cls: 'text-red-300   bg-red-950/70    border-red-700',       payout: b => `-$${b}` },
  bust:      { emoji: '💥', label: 'Bust!',        cls: 'text-red-300   bg-red-950/70    border-red-700',       payout: b => `-$${b}` },
  surrender: { emoji: '🏳️', label: 'Surrendered',  cls: 'text-blue-200  bg-blue-950/70   border-blue-600',      payout: b => `+$${Math.floor(b/2)} back` },
};

// ── Insurance: Ace slides over hole card, both rotate 90° together ─
function InsuranceDealerHand({ ace, hole, returning }) {
  const groupClass = returning ? 'insurance-pair-return' : 'insurance-pair-present';
  const aceClass   = returning ? 'ace-return-home'       : 'ace-cover-hole';
  return (
    <div className="relative" style={{ width: 176, height: 126 }}>
      {/* Group wrapper — both cards rotate together */}
      <div className={`absolute ${groupClass}`} style={{ left: 0, top: 0, width: 176, height: 126 }}>
        {/* Hole card stays fixed within group */}
        <div className="absolute" style={{ left: 92, top: 0 }}>
          <Card card={hole} noAnimate />
        </div>
        {/* Ace slides right to overlap hole, then stays for group rotation */}
        <div className={`absolute ${aceClass}`} style={{ left: 0, top: 0, zIndex: 10 }}>
          <Card card={ace} noAnimate />
        </div>
      </div>
    </div>
  );
}

// ── Insurance popup (appears ~1s after ace settles) ───────────────
function InsurancePopup({ bet, trueCount, onDecision, playerHasBJ }) {
  const insuranceBet = Math.floor(bet / 2);
  const shouldTake = getInsuranceAdvice(trueCount);
  const tcStr = (trueCount > 0 ? '+' : '') + trueCount.toFixed(1);

  return (
    <div className="insurance-popup-in mt-3 bg-gray-900/95 border border-gray-600 rounded-2xl px-4 py-3 shadow-2xl w-72"
      style={{ backdropFilter: 'blur(6px)' }}>
      <div className="text-center mb-2.5">
        <div className="text-white font-black text-lg leading-none mb-0.5">
          {playerHasBJ ? 'Even Money?' : 'Insurance?'}
        </div>
        <div className="text-gray-400 text-xs">
          {playerHasBJ ? 'Guarantee a push, or play it out' : `Side bet $${insuranceBet} · pays 2:1`}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-1 text-xs">
          <span className={`font-bold ${trueCount >= 3 ? 'text-green-400' : trueCount > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
            TC {tcStr}
          </span>
          <span className="text-gray-700">·</span>
          <span className={shouldTake ? 'text-green-400 font-semibold' : 'text-gray-500'}>
            {shouldTake ? 'Count says: Take' : 'Count says: Decline'}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onDecision(true)}
          className="relative flex-1 py-2 rounded-xl border border-green-700 bg-green-900/50 hover:bg-green-800/70 active:scale-95 transition-all text-center"
        >
          <span className="absolute top-1 right-1.5 font-mono text-[8px] px-1 py-px rounded bg-black/30 border border-white/20 text-white/50">Y</span>
          <div className="text-white font-bold text-sm">{playerHasBJ ? 'Even Money' : 'Take'}</div>
          <div className="text-green-400 text-xs">${insuranceBet}</div>
        </button>
        <button
          onClick={() => onDecision(false)}
          className="relative flex-1 py-2 rounded-xl border border-gray-600 bg-gray-800/50 hover:bg-gray-700/70 active:scale-95 transition-all text-center"
        >
          <span className="absolute top-1 right-1.5 font-mono text-[8px] px-1 py-px rounded bg-black/30 border border-white/20 text-white/50">N</span>
          <div className="text-white font-bold text-sm">Decline</div>
          <div className="text-gray-400 text-xs">no bet</div>
        </button>
      </div>
    </div>
  );
}

function ResultBanner({ result, bet }) {
  const meta = RESULT_META[result];
  if (!meta) return null;
  const amountStr = meta.payout ? meta.payout(bet) : null;
  const amountColor =
    result === 'win' || result === 'blackjack' ? 'text-yellow-300' :
    result === 'surrender'                      ? 'text-blue-300'   : 'text-red-300';
  return (
    <div className={`flex items-center justify-between px-4 py-2 rounded-xl border-2 ${meta.cls}`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">{meta.emoji}</span>
        <span className="text-base font-black">{meta.label}</span>
      </div>
      {amountStr && (
        <span className={`text-xl font-black tabular-nums win-amount-in ${amountColor}`}>{amountStr}</span>
      )}
    </div>
  );
}
