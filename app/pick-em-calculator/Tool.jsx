'use client';
import { useState, useMemo } from 'react';
import { pickemValue, pickemBreakevenLeg } from '../../lib/odds';
import { Field, NumberInput, ResultCard, Stat, pct, money, signedPct } from '../../components/calc/CalcUI';

// Example payouts only. They differ by state and change with boosted (demon) or
// discounted (goblin) lines, so the page tells people to copy their app's numbers.
const DEFAULTS = {
  power: { 2: { 2: 3 }, 3: { 3: 5 }, 4: { 4: 10 }, 5: { 5: 20 }, 6: { 6: 37.5 } },
  flex: { 3: { 3: 3, 2: 1 }, 4: { 4: 6, 3: 1.5 }, 5: { 5: 10, 4: 2, 3: 0.4 }, 6: { 6: 25, 5: 2, 4: 0.4 } },
};

export default function Tool() {
  const [n, setN] = useState(3);
  const [mode, setMode] = useState('power');
  const [pay, setPay] = useState(DEFAULTS);
  const [probs, setProbs] = useState(['55', '55', '55', '55', '55', '55']);
  const [stake, setStake] = useState('10');

  const flexOk = n >= 3;
  const m = mode === 'flex' && !flexOk ? 'power' : mode;
  const table = pay[m][n] || {};
  const tiers = Object.keys(table).map(Number).sort((a, b) => b - a);
  const ps = probs.slice(0, n).map((x) => Number(x) / 100);
  const res = pickemValue(ps, table);
  const be = useMemo(() => pickemBreakevenLeg(n, table), [n, JSON.stringify(table)]);
  const s = Number(stake);

  const setTier = (k, v) => setPay((P) => ({ ...P, [m]: { ...P[m], [n]: { ...P[m][n], [k]: v === '' ? '' : Number(v) } } }));

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="inline-flex bg-gray-900 border border-gray-800 rounded-lg p-1">
          {[2, 3, 4, 5, 6].map((k) => (
            <button key={k} type="button" onClick={() => setN(k)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md ${n === k ? 'bg-blue-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {k}-pick
            </button>
          ))}
        </div>
        <div className="inline-flex bg-gray-900 border border-gray-800 rounded-lg p-1">
          {['power', 'flex'].map((k) => (
            <button key={k} type="button" disabled={k === 'flex' && !flexOk} onClick={() => setMode(k)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize disabled:text-gray-700 ${m === k ? 'bg-blue-700 text-white' : 'text-gray-400 hover:text-gray-200'}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-3">
        <div className="text-xs text-gray-500 mb-2">Payout multipliers: <strong className="text-gray-300">copy these from your app</strong></div>
        <div className="flex flex-wrap gap-3">
          {tiers.map((k) => (
            <span key={k} className="flex items-center gap-2 text-sm text-gray-300">
              {k}/{n} correct
              <NumberInput value={String(table[k])} onChange={(v) => setTier(k, v)} ariaLabel={`${k} of ${n} multiplier`} suffix="x" width="w-16" />
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {ps.map((_, i) => (
          <Field key={i} label={`Pick ${i + 1}: chance it hits`}>
            <NumberInput value={probs[i]} onChange={(v) => setProbs((P) => P.map((x, j) => (j === i ? v : x)))} ariaLabel={`Pick ${i + 1} probability`} suffix="%" width="w-20" />
          </Field>
        ))}
        <Field label="Entry"><NumberInput value={stake} onChange={setStake} ariaLabel="Entry fee" prefix="$" width="w-20" /></Field>
      </div>

      <ResultCard label="Expected value" value={signedPct(res?.ev)}
                  tone={!res ? 'neutral' : res.ev > 0 ? 'good' : 'bad'}
                  sub={res ? `About ${money(res.ev * s)} per entry on average · pays something ${pct(res.pAnyPayout)} of the time` : 'Enter a probability for every pick'}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat label="Break-even per pick" value={pct(be, 1)} />
          <Stat label="Your average pick" value={pct(ps.reduce((a, b) => a + b, 0) / n, 1)}
                tone={ps.reduce((a, b) => a + b, 0) / n > be ? 'good' : 'bad'} />
        </div>
        {res && (
          <div className="grid grid-cols-4 gap-2 text-center">
            {res.dist.map((pk, k) => ({ k, pk })).reverse().slice(0, 4).map(({ k, pk }) => (
              <div key={k} className="text-xs">
                <div className="text-gray-500">{k}/{n}</div>
                <div className="text-white font-semibold">{pct(pk)}</div>
                <div className="text-gray-500">{table[k] ? `${table[k]}x` : '0x'}</div>
              </div>
            ))}
          </div>
        )}
      </ResultCard>
      <p className="text-xs text-gray-500">
        Assumes the picks are independent. Picks from the same game usually move together, which
        raises the chance of hitting them all, and apps often pay less on correlated picks to take that back.
      </p>
    </div>
  );
}
