'use client';
import { useState } from 'react';
import { parseOdds, decimalToProb, formatAmerican, decimalToFraction, probToDecimal } from '../../lib/odds';
import { FormatToggle, Field, NumberInput, ResultCard, Stat, pct } from '../../components/calc/CalcUI';

export default function Tool() {
  const [format, setFormat] = useState('american');
  const [odds, setOdds] = useState('-110');
  const [prob, setProb] = useState('');

  const d = parseOdds(odds, format);
  const p = decimalToProb(d);
  const f = decimalToFraction(d);
  const fromProb = probToDecimal(Number(prob) / 100);

  return (
    <div>
      <FormatToggle value={format} onChange={(v) => { setFormat(v); setOdds(''); }} />
      <div className="space-y-3 mb-8">
        <Field label={`Odds (${format})`} hint="American: +150 or -110 · Decimal: 2.50 · Fractional: 3/2">
          <NumberInput value={odds} onChange={setOdds} ariaLabel="Odds" placeholder={format === 'american' ? '-110' : format === 'decimal' ? '1.91' : '10/11'} />
        </Field>
      </div>

      <ResultCard label="Implied probability" value={pct(p, 2)}
                  sub={Number.isFinite(d) ? 'How often the price says this wins, before removing the margin' : 'Enter valid odds'}>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="American" value={formatAmerican(d)} />
          <Stat label="Decimal" value={Number.isFinite(d) ? d.toFixed(3) : '—'} />
          <Stat label="Fractional" value={f ? `${f.num}/${f.den}` : '—'} />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Stat label="$100 bet returns" value={Number.isFinite(d) ? `$${(100 * d).toFixed(2)}` : '—'} />
          <Stat label="$100 bet profits" value={Number.isFinite(d) ? `$${(100 * (d - 1)).toFixed(2)}` : '—'} />
        </div>
      </ResultCard>

      <div className="space-y-3">
        <Field label="Or start from a probability" hint="Turns a win chance into the fair odds for it">
          <NumberInput value={prob} onChange={setProb} ariaLabel="Probability percent" placeholder="55" suffix="%" width="w-20" />
        </Field>
        {Number.isFinite(fromProb) && (
          <div className="grid grid-cols-3 gap-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
            <Stat label="Fair American" value={formatAmerican(fromProb)} />
            <Stat label="Fair decimal" value={fromProb.toFixed(3)} />
            <Stat label="Fair fractional" value={(() => { const g = decimalToFraction(fromProb); return g ? `${g.num}/${g.den}` : '—'; })()} />
          </div>
        )}
      </div>
    </div>
  );
}
