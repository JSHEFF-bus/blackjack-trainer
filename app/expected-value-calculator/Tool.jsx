'use client';
import { useState } from 'react';
import { parseOdds, expectedValue, kellyFraction, decimalToProb } from '../../lib/odds';
import { FormatToggle, Field, NumberInput, ResultCard, Stat, pct, money, signedPct } from '../../components/calc/CalcUI';

export default function Tool() {
  const [format, setFormat] = useState('american');
  const [odds, setOdds] = useState('+150');
  const [prob, setProb] = useState('45');
  const [stake, setStake] = useState('100');
  const [bank, setBank] = useState('1000');

  const d = parseOdds(odds, format);
  const p = Number(prob) / 100;
  const ev = expectedValue(p, d);
  const be = decimalToProb(d);
  const k = kellyFraction(p, d);
  const s = Number(stake), B = Number(bank);
  const tone = !Number.isFinite(ev) ? 'neutral' : ev > 0 ? 'good' : 'bad';

  return (
    <div>
      <FormatToggle value={format} onChange={(v) => { setFormat(v); setOdds(''); }} />
      <div className="space-y-3 mb-8">
        <Field label="Odds offered"><NumberInput value={odds} onChange={setOdds} ariaLabel="Odds" /></Field>
        <Field label="Your win probability" hint="Your own estimate, or the fair probability from the no-vig calculator">
          <NumberInput value={prob} onChange={setProb} ariaLabel="Win probability" suffix="%" width="w-20" />
        </Field>
        <Field label="Stake"><NumberInput value={stake} onChange={setStake} ariaLabel="Stake" prefix="$" width="w-24" /></Field>
      </div>

      <ResultCard label="Expected value" value={signedPct(ev, 2)} tone={tone}
                  sub={!Number.isFinite(ev) ? 'Enter odds and a probability between 0 and 100'
                       : ev > 0 ? `A good bet: about ${money(ev * s)} profit per bet on average`
                       : `A losing bet: about ${money(ev * s)} per bet on average`}>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="You need to win" value={pct(be, 1)} />
          <Stat label="You think you win" value={pct(p, 1)} tone={p > be ? 'good' : 'bad'} />
          <Stat label="Edge" value={Number.isFinite(be) ? `${((p - be) * 100).toFixed(1)} pts` : '—'} tone={p > be ? 'good' : 'bad'} />
        </div>
      </ResultCard>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-gray-500 uppercase tracking-widest">Kelly stake</div>
          <NumberInput value={bank} onChange={setBank} ariaLabel="Bankroll" prefix="bankroll $" width="w-24" />
        </div>
        {Number.isFinite(k) && k > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Full Kelly" value={`${pct(k)} · ${money(k * B)}`} />
            <Stat label="Half Kelly" value={`${pct(k / 2)} · ${money((k / 2) * B)}`} tone="good" />
            <Stat label="Quarter Kelly" value={`${pct(k / 4)} · ${money((k / 4) * B)}`} />
          </div>
        ) : (
          <p className="text-sm text-gray-400">Kelly says <strong className="text-gray-200">do not bet</strong>: there is no edge at this price.</p>
        )}
        <p className="text-xs text-gray-500 mt-3">Full Kelly assumes your probability is exactly right. It almost never is, which is why most people bet half or a quarter of it.</p>
      </div>
    </div>
  );
}
