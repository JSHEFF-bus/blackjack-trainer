'use client';
import { useState } from 'react';
import { parseOdds, equalHedge, twoWayArb } from '../../lib/odds';
import { FormatToggle, Field, NumberInput, ResultCard, Stat, pct, money } from '../../components/calc/CalcUI';

export default function Tool() {
  const [mode, setMode] = useState('hedge');
  const [format, setFormat] = useState('american');
  const [stake, setStake] = useState('50');
  const [orig, setOrig] = useState('+400');
  const [hedgeOdds, setHedgeOdds] = useState('-150');
  const [total, setTotal] = useState('100');
  const [a, setA] = useState('+105');
  const [b, setB] = useState('+102');

  const h = equalHedge(Number(stake), parseOdds(orig, format), parseOdds(hedgeOdds, format));
  const arb = twoWayArb(Number(total), parseOdds(a, format), parseOdds(b, format));

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="inline-flex bg-gray-900 border border-gray-800 rounded-lg p-1">
          {[['hedge', 'Hedge a bet'], ['arb', 'Arbitrage']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setMode(k)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md ${mode === k ? 'bg-blue-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}>{l}</button>
          ))}
        </div>
      </div>
      <FormatToggle value={format} onChange={(v) => { setFormat(v); setOrig(''); setHedgeOdds(''); setA(''); setB(''); }} />

      {mode === 'hedge' ? (
        <>
          <div className="space-y-3 mb-8">
            <Field label="Your original stake"><NumberInput value={stake} onChange={setStake} ariaLabel="Original stake" prefix="$" width="w-24" /></Field>
            <Field label="Original odds"><NumberInput value={orig} onChange={setOrig} ariaLabel="Original odds" /></Field>
            <Field label="Odds now on the other side" hint="e.g. the opponent's moneyline, or the under if you hold the over">
              <NumberInput value={hedgeOdds} onChange={setHedgeOdds} ariaLabel="Hedge odds" />
            </Field>
          </div>
          <ResultCard label="Bet this on the other side" value={h ? money(h.hedge) : '—'}
                      tone={h ? (h.ifOriginal > 0 ? 'good' : 'bad') : 'neutral'}
                      sub={h ? (h.ifOriginal > 0 ? `Locks in ${money(h.ifOriginal)} whichever side wins` : `Locks in a loss of ${money(-h.ifOriginal)} either way`) : 'Enter the stake and both prices'}>
            {h && (
              <div className="grid grid-cols-2 gap-3">
                <Stat label="If your original bet wins" value={money(h.ifOriginal)} tone={h.ifOriginal > 0 ? 'good' : 'bad'} />
                <Stat label="If the hedge wins" value={money(h.ifHedge)} tone={h.ifHedge > 0 ? 'good' : 'bad'} />
              </div>
            )}
          </ResultCard>
        </>
      ) : (
        <>
          <div className="space-y-3 mb-8">
            <Field label="Total to stake"><NumberInput value={total} onChange={setTotal} ariaLabel="Total stake" prefix="$" width="w-24" /></Field>
            <Field label="Side A, best odds"><NumberInput value={a} onChange={setA} ariaLabel="Side A odds" /></Field>
            <Field label="Side B, best odds" hint="Usually at a different sportsbook"><NumberInput value={b} onChange={setB} ariaLabel="Side B odds" /></Field>
          </div>
          <ResultCard label={arb?.isArb ? 'Guaranteed return' : 'Not an arbitrage'}
                      value={arb ? `${arb.returnPct >= 0 ? '+' : ''}${(arb.returnPct * 100).toFixed(2)}%` : '—'}
                      tone={arb ? (arb.isArb ? 'good' : 'bad') : 'neutral'}
                      sub={arb ? `The two prices add up to ${pct(arb.implied, 2)} (an arbitrage needs under 100%)` : 'Enter both prices'}>
            {arb && (
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Stake on A" value={money(arb.stakeA)} />
                <Stat label="Stake on B" value={money(arb.stakeB)} />
                <Stat label="Pays back" value={money(arb.payout)} tone={arb.isArb ? 'good' : 'bad'} />
              </div>
            )}
          </ResultCard>
        </>
      )}
    </div>
  );
}
