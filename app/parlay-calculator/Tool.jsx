'use client';
import { useState } from 'react';
import { parseOdds, parlayDecimal, formatAmerican } from '../../lib/odds';
import { FormatToggle, NumberInput, ResultCard, Stat, pct, money, signedPct } from '../../components/calc/CalcUI';

const blank = () => ({ odds: '', prob: '' });

export default function Tool() {
  const [format, setFormat] = useState('american');
  const [legs, setLegs] = useState([{ odds: '-110', prob: '' }, { odds: '+120', prob: '' }, blank()]);
  const [stake, setStake] = useState('10');

  const set = (i, k, v) => setLegs((L) => L.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const rows = legs.map((l) => ({ ...l, d: parseOdds(l.odds, format), p: Number(l.prob) / 100 }));
  const filled = rows.filter((r) => Number.isFinite(r.d));
  const D = filled.length >= 2 ? parlayDecimal(filled.map((r) => r.d)) : NaN;
  const s = Number(stake);
  const allProbs = filled.length >= 2 && filled.every((r) => r.prob !== '' && r.p > 0 && r.p < 1);
  const trueP = allProbs ? filled.reduce((a, r) => a * r.p, 1) : NaN;
  const ev = allProbs ? trueP * D - 1 : NaN;

  return (
    <div>
      <FormatToggle value={format} onChange={(v) => { setFormat(v); setLegs([blank(), blank(), blank()]); }} />
      <div className="space-y-2 mb-3">
        <div className="grid grid-cols-[2rem_1fr_1fr_1.5rem] gap-2 text-xs text-gray-500 px-1">
          <span>#</span><span>Odds</span><span>Win % (optional)</span><span />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[2rem_1fr_1fr_1.5rem] gap-2 items-center bg-gray-900 border border-gray-800 rounded-xl px-2 py-2">
            <span className="text-xs text-gray-500 text-center">{i + 1}</span>
            <NumberInput value={r.odds} onChange={(v) => set(i, 'odds', v)} ariaLabel={`Leg ${i + 1} odds`} width="w-full" />
            <NumberInput value={r.prob} onChange={(v) => set(i, 'prob', v)} ariaLabel={`Leg ${i + 1} win probability`} width="w-full" placeholder="—" />
            <button type="button" aria-label={`Remove leg ${i + 1}`} onClick={() => setLegs((L) => (L.length > 2 ? L.filter((_, j) => j !== i) : L))}
                    className="text-gray-600 hover:text-red-400 text-lg leading-none">×</button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mb-8">
        <button type="button" disabled={legs.length >= 10} onClick={() => setLegs((L) => [...L, blank()])}
                className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-600">+ Add leg</button>
        <span className="flex items-center gap-2 text-sm text-gray-300">Stake <NumberInput value={stake} onChange={setStake} ariaLabel="Stake" prefix="$" width="w-20" /></span>
      </div>

      <ResultCard label="Parlay odds" value={formatAmerican(D)}
                  sub={Number.isFinite(D) ? `${filled.length} legs · decimal ${D.toFixed(2)} · ${money(s * D)} back on ${money(s)}` : 'Enter at least two legs'}>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Profit if it hits" value={money(s * (D - 1))} />
          <Stat label="Book's implied chance" value={pct(1 / D, 2)} />
          <Stat label="Your chance" value={pct(trueP, 2)} />
        </div>
        {allProbs && (
          <div className={`mt-4 text-center text-sm font-semibold ${ev > 0 ? 'text-green-400' : 'text-red-400'}`}>
            Expected value {signedPct(ev)} · about {money(ev * s)} per parlay
          </div>
        )}
      </ResultCard>
      <p className="text-xs text-gray-500">
        Assumes the legs are independent. Legs from the same game usually move together, which changes
        the true chance, and sportsbooks price same-game parlays differently for exactly that reason.
      </p>
    </div>
  );
}
