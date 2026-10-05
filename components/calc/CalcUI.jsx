'use client';
// Shared building blocks for the betting calculators. Styled to match the existing
// house-edge calculator: gray-950 page, gray-900 cards, blue accents.

export const FORMATS = [
  { id: 'american', label: 'American', placeholder: '-110' },
  { id: 'decimal', label: 'Decimal', placeholder: '1.91' },
  { id: 'fractional', label: 'Fractional', placeholder: '10/11' },
];

export function FormatToggle({ value, onChange }) {
  return (
    <div className="inline-flex bg-gray-900 border border-gray-800 rounded-lg p-1 mb-6" role="group" aria-label="Odds format">
      {FORMATS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            value === f.id ? 'bg-blue-700 text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
      <span className="flex items-center justify-between gap-4">
        <span className="text-sm text-gray-300">{label}</span>
        {children}
      </span>
      {hint && <span className="block text-xs text-gray-500 mt-1.5">{hint}</span>}
    </label>
  );
}

export function NumberInput({ value, onChange, placeholder, step = 'any', suffix, prefix, ariaLabel, width = 'w-28' }) {
  return (
    <span className="flex items-center gap-1">
      {prefix && <span className="text-gray-500 text-sm">{prefix}</span>}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        step={step}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        className={`${width} bg-gray-800 border border-gray-700 text-gray-100 text-sm text-right rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500`}
      />
      {suffix && <span className="text-gray-500 text-sm">{suffix}</span>}
    </span>
  );
}

export function ResultCard({ label, value, sub, tone = 'neutral', children }) {
  const color =
    tone === 'good' ? 'text-green-400' : tone === 'bad' ? 'text-red-400' : tone === 'warn' ? 'text-yellow-400' : 'text-white';
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
      <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</div>
      <div className={`text-4xl sm:text-5xl font-black mb-2 ${color}`}>{value}</div>
      {sub && <div className={`text-sm font-medium ${color}`}>{sub}</div>}
      {children && <div className="mt-5 pt-5 border-t border-gray-800">{children}</div>}
    </div>
  );
}

export function Stat({ label, value, tone }) {
  const color = tone === 'good' ? 'text-green-400' : tone === 'bad' ? 'text-red-400' : 'text-white';
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`font-bold text-sm ${color}`}>{value}</div>
    </div>
  );
}

export const pct = (x, dp = 1) => (Number.isFinite(x) ? `${(x * 100).toFixed(dp)}%` : '—');
export const money = (x) =>
  Number.isFinite(x) ? `${x < 0 ? '-' : ''}$${Math.abs(x).toFixed(2)}` : '—';
export const signedPct = (x, dp = 1) =>
  Number.isFinite(x) ? `${x >= 0 ? '+' : ''}${(x * 100).toFixed(dp)}%` : '—';
