'use client';
import { useState } from 'react';

// House edge adjustments based on Wizard of Odds figures
// Base: 6-deck, S17, DAS, no surrender = ~0.40%
const BASE_EDGE = 0.40;

const RULES = [
  {
    id: 'decks',
    label: 'Number of decks',
    type: 'select',
    options: [
      { label: '1 deck',  value: 1,  adj: -0.48 },
      { label: '2 decks', value: 2,  adj: -0.19 },
      { label: '4 decks', value: 4,  adj: -0.06 },
      { label: '6 decks', value: 6,  adj:  0     },
      { label: '8 decks', value: 8,  adj:  0.01  },
    ],
    default: 6,
  },
  {
    id: 'soft17',
    label: 'Dealer on soft 17',
    type: 'select',
    options: [
      { label: 'Stands (S17)',  value: 'S17', adj:  0    },
      { label: 'Hits (H17)',   value: 'H17', adj:  0.22  },
    ],
    default: 'S17',
  },
  {
    id: 'das',
    label: 'Double after split',
    type: 'select',
    options: [
      { label: 'Allowed (DAS)',     value: 'yes', adj:  0    },
      { label: 'Not allowed (NDAS)',value: 'no',  adj:  0.14 },
    ],
    default: 'yes',
  },
  {
    id: 'surrender',
    label: 'Surrender',
    type: 'select',
    options: [
      { label: 'Late surrender allowed', value: 'late', adj:  0    },
      { label: 'No surrender',           value: 'none', adj:  0.08 },
      { label: 'Early surrender',        value: 'early',adj: -0.24 },
    ],
    default: 'late',
  },
  {
    id: 'rsa',
    label: 'Re-split aces',
    type: 'select',
    options: [
      { label: 'Allowed',     value: 'yes', adj:  0    },
      { label: 'Not allowed', value: 'no',  adj:  0.03 },
    ],
    default: 'yes',
  },
  {
    id: 'payout',
    label: 'Blackjack pays',
    type: 'select',
    options: [
      { label: '3:2 (standard)', value: '3:2', adj:  0    },
      { label: '6:5',            value: '6:5', adj:  1.39 },
      { label: 'Even money',     value: '1:1', adj:  2.27 },
    ],
    default: '3:2',
  },
];

function getEdge(selections) {
  let edge = BASE_EDGE;
  for (const rule of RULES) {
    const sel = selections[rule.id] ?? rule.default;
    const opt = rule.options.find(o => String(o.value) === String(sel));
    if (opt) edge += opt.adj;
  }
  return Math.max(edge, 0.01);
}

function edgeColor(edge) {
  if (edge <= 0.5)  return 'text-green-400';
  if (edge <= 1.0)  return 'text-yellow-400';
  if (edge <= 2.0)  return 'text-orange-400';
  return 'text-red-400';
}

function edgeLabel(edge) {
  if (edge <= 0.5)  return 'Excellent — player-friendly rules';
  if (edge <= 1.0)  return 'Good — standard Vegas rules';
  if (edge <= 2.0)  return 'Moderate — look for a better table';
  return 'Poor — avoid this game if possible';
}

export default function HouseEdgeCalculator() {
  const [selections, setSelections] = useState(
    Object.fromEntries(RULES.map(r => [r.id, r.default]))
  );

  const edge = getEdge(selections);
  const color = edgeColor(edge);
  const label = edgeLabel(edge);

  function set(id, val) {
    setSelections(s => ({ ...s, [id]: val }));
  }

  const hourlyLoss = (betSize) => ((edge / 100) * betSize * 80).toFixed(2);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-xl mx-auto px-4 py-10">

        <h1 className="text-2xl font-bold text-white mb-2">
          Blackjack House Edge Calculator
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Select the rules at your table to see the exact house edge
        </p>

        <div className="space-y-3 mb-8">
          {RULES.map(rule => (
            <div key={rule.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
              <label className="text-sm text-gray-300 shrink-0">{rule.label}</label>
              <select
                value={selections[rule.id]}
                onChange={e => set(rule.id, e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
              >
                {rule.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Result */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">House edge</div>
          <div className={`text-5xl font-black mb-2 ${color}`}>
            {edge.toFixed(2)}%
          </div>
          <div className={`text-sm font-medium ${color}`}>{label}</div>

          <div className="mt-5 pt-5 border-t border-gray-800">
            <div className="text-xs text-gray-500 mb-3">Expected hourly loss (80 hands/hr)</div>
            <div className="grid grid-cols-3 gap-3">
              {[10, 25, 50].map(bet => (
                <div key={bet} className="text-center">
                  <div className="text-xs text-gray-500">${bet}/hand</div>
                  <div className="text-white font-bold text-sm">${hourlyLoss(bet)}/hr</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-10 space-y-2 text-sm text-gray-400 leading-relaxed">
          <p>
            <strong className="text-gray-200">6:5 payout is the biggest trap.</strong> A single rule change from 3:2 to 6:5 adds 1.39% to the house edge — more than everything else combined. Always find a 3:2 table.
          </p>
          <p>
            <strong className="text-gray-200">These figures assume perfect basic strategy.</strong> Every mistake you make raises the effective house edge. A typical recreational player plays at roughly 2–3% house edge due to strategy errors.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a
            href="/"
            className="block text-center bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm px-4 py-3 rounded-xl transition-colors"
          >
            Practice Basic Strategy →
          </a>
          <a
            href="/blackjack-strategy-chart"
            className="block text-center bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold text-sm px-4 py-3 rounded-xl transition-colors"
          >
            Strategy Charts →
          </a>
        </div>

        <section className="mt-14 border-t border-gray-800 pt-10">
          <h2 className="text-lg font-bold text-white mb-5">What affects the house edge?</h2>
          <div className="space-y-5 text-sm text-gray-400 leading-relaxed">
            <div>
              <h3 className="text-gray-200 font-semibold mb-1">Number of decks</h3>
              <p>Fewer decks favor the player. A single-deck game has roughly 0.5% lower house edge than a 6-deck game, because natural blackjacks are more frequent and the remaining deck composition shifts more with each card dealt.</p>
            </div>
            <div>
              <h3 className="text-gray-200 font-semibold mb-1">Dealer hits soft 17 (H17)</h3>
              <p>When the dealer hits soft 17, they have more chances to improve a weak hand. This adds ~0.22% to the house edge. Always prefer S17 tables.</p>
            </div>
            <div>
              <h3 className="text-gray-200 font-semibold mb-1">Blackjack payout</h3>
              <p>3:2 is standard. 6:5 — now common at many tables — adds 1.39% to the house edge, single-handedly turning a beatable game into a poor one. Never play 6:5.</p>
            </div>
            <div>
              <h3 className="text-gray-200 font-semibold mb-1">Surrender</h3>
              <p>Late surrender (allowed after the dealer checks for blackjack) saves ~0.08%. Early surrender (before the check) saves ~0.24% and is extremely rare. If surrender is available, use it — it's free money.</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
