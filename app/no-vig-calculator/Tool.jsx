'use client';
import { useState } from 'react';
import { parseOdds, DEVIG, formatAmerican } from '../../lib/odds';
import { FormatToggle, Field, NumberInput, ResultCard, pct } from '../../components/calc/CalcUI';

const METHODS = [
  ['shin', 'Shin'],
  ['power', 'Power'],
  ['multiplicative', 'Multiplicative'],
  ['additive', 'Additive'],
];

export default function Tool() {
  const [format, setFormat] = useState('american');
  const [a, setA] = useState('-150');
  const [b, setB] = useState('+130');
  const [method, setMethod] = useState('shin');

  const dA = parseOdds(a, format), dB = parseOdds(b, format);
  const valid = Number.isFinite(dA) && Number.isFinite(dB);
  const q = valid ? [1 / dA, 1 / dB] : null;
  const margin = valid ? q[0] + q[1] - 1 : NaN;
  const fair = valid ? DEVIG[method](q) : null;

  return (
    <div>
      <FormatToggle value={format} onChange={(v) => { setFormat(v); setA(''); setB(''); }} />
      <div className="space-y-3 mb-4">
        <Field label="Side A odds"><NumberInput value={a} onChange={setA} ariaLabel="Side A odds" /></Field>
        <Field label="Side B odds"><NumberInput value={b} onChange={setB} ariaLabel="Side B odds" /></Field>
        <Field label="Method" hint="Shin and Power take more margin off the underdog, which is usually where bookmakers put it">
          <select value={method} onChange={(e) => setMethod(e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500">
            {METHODS.map(([id, l]) => <option key={id} value={id}>{l}</option>)}
          </select>
        </Field>
      </div>

      <ResultCard label="Fair probability (vig removed)"
                  value={fair ? `${pct(fair[0])} / ${pct(fair[1])}` : '—'}
                  sub={valid ? `Bookmaker margin on this line: ${pct(margin, 2)}` : 'Enter both sides of the line'}
                  tone={valid && margin > 0.06 ? 'warn' : 'neutral'}>
        {fair && (
          <div className="grid grid-cols-2 gap-4 text-center">
            {['A', 'B'].map((s, i) => (
              <div key={s}>
                <div className="text-xs text-gray-500">Side {s} fair odds</div>
                <div className="text-white font-bold">{formatAmerican(1 / fair[i])}  ·  {(1 / fair[i]).toFixed(3)}</div>
                <div className="text-xs text-gray-500 mt-1">listed {formatAmerican(i ? dB : dA)} implies {pct(q[i])}</div>
              </div>
            ))}
          </div>
        )}
      </ResultCard>

      {fair && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-2 overflow-x-auto">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Every method, side A</div>
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500 text-xs"><th className="text-left font-normal pb-2">Method</th><th className="text-right font-normal pb-2">Fair %</th><th className="text-right font-normal pb-2">Fair odds</th></tr></thead>
            <tbody>
              {METHODS.map(([id, l]) => {
                const p = DEVIG[id](q)[0];
                return (
                  <tr key={id} className={id === method ? 'text-white' : 'text-gray-400'}>
                    <td className="py-1">{l}</td><td className="text-right">{pct(p, 2)}</td><td className="text-right">{formatAmerican(1 / p)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
