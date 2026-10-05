// Betting maths shared by every calculator page. Pure functions, no React, so the
// same code can be unit-tested in Node and rendered in the browser.
//
// Conventions: odds are handled internally as DECIMAL odds (total return per 1 staked,
// stake included). Probabilities are 0-1. Anything invalid returns NaN rather than
// throwing, so a half-typed input never crashes the page.

const ok = (x) => typeof x === 'number' && Number.isFinite(x);

// ---------- conversions ----------

export function americanToDecimal(a) {
  a = Number(a);
  // American odds between -100 and +100 do not exist (+100 and -100 are both evens)
  if (!ok(a) || (a > -100 && a < 100)) return NaN;
  return a > 0 ? 1 + a / 100 : 1 + 100 / Math.abs(a);
}

export function decimalToAmerican(d) {
  d = Number(d);
  if (!ok(d) || d <= 1) return NaN;
  return d >= 2 ? (d - 1) * 100 : -100 / (d - 1);
}

export function decimalToProb(d) {
  d = Number(d);
  return ok(d) && d > 1 ? 1 / d : NaN;
}

export function probToDecimal(p) {
  p = Number(p);
  return ok(p) && p > 0 && p < 1 ? 1 / p : NaN;
}

export function fractionToDecimal(num, den) {
  num = Number(num); den = Number(den);
  if (!ok(num) || !ok(den) || num <= 0 || den <= 0) return NaN;
  return 1 + num / den;
}

// Best fraction for (d - 1) with a denominator no larger than maxDen, by continued
// fractions. 2.5 -> 3/2, 1.909 -> 10/11, 4.333 -> 10/3.
export function decimalToFraction(d, maxDen = 100) {
  d = Number(d);
  if (!ok(d) || d <= 1) return null;
  const x = d - 1;
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  let f = x;
  for (let i = 0; i < 64; i++) {
    const a = Math.floor(f);
    const h2 = a * h1 + h0, k2 = a * k1 + k0;
    if (k2 > maxDen) break;
    [h0, h1, k0, k1] = [h1, h2, k1, k2];
    if (Math.abs(f - a) < 1e-12) break;
    f = 1 / (f - a);
  }
  return { num: h1, den: k1 };
}

// Parse whatever the user typed in an odds box. Accepts American (+150, -110),
// decimal (2.50) or fractional (3/2). Returns decimal odds or NaN.
export function parseOdds(input, format = 'american') {
  const s = String(input ?? '').trim();
  if (!s) return NaN;
  if (format === 'decimal') return Number(s) > 1 ? Number(s) : NaN;
  if (format === 'fractional') {
    const m = s.match(/^(\d+(?:\.\d+)?)\s*[/:]\s*(\d+(?:\.\d+)?)$/);
    return m ? fractionToDecimal(m[1], m[2]) : NaN;
  }
  return americanToDecimal(s.replace(/^\+/, ''));
}

export function formatAmerican(d) {
  const a = decimalToAmerican(d);
  if (!ok(a)) return '—';
  const r = Math.round(a);
  return r > 0 ? `+${r}` : `${r}`;
}

// ---------- removing the vig ----------

const sum = (xs) => xs.reduce((s, x) => s + x, 0);

// Divide every implied probability by the overround. Same PROPORTION off each side,
// which leaves the favourite-longshot bias in place.
export function devigMultiplicative(q) {
  const s = sum(q);
  return q.map((x) => x / s);
}

// Subtract the same AMOUNT from each side. Can go negative on a big longshot, so clamp.
export function devigAdditive(q) {
  const s = sum(q), n = q.length;
  const p = q.map((x) => Math.max(x - (s - 1) / n, 1e-9));
  const t = sum(p);
  return p.map((x) => x / t);
}

// Raise every implied probability to the same power k so they sum to 1. Takes more
// off longshots than favourites. Solved by bisection: the sum falls as k rises.
export function devigPower(q) {
  if (sum(q) <= 1) return devigMultiplicative(q);
  let lo = 1, hi = 50;
  for (let i = 0; i < 200; i++) {
    const k = (lo + hi) / 2;
    if (sum(q.map((x) => x ** k)) > 1) lo = k; else hi = k;
    if (hi - lo < 1e-12) break;
  }
  const k = (lo + hi) / 2;
  const p = q.map((x) => x ** k);
  const t = sum(p);
  return p.map((x) => x / t);
}

// Shin (1993): treats the margin as protection against better-informed bettors, and
// removes more from the longshot. Ported from the Python version used in our analysis.
export function devigShin(q) {
  const S = sum(q);
  if (S <= 1 || q.length < 2) return devigMultiplicative(q);
  const total = (z) => {
    if (z <= 0) return S;
    return sum(q.map((x) => (Math.sqrt(z * z + (4 * (1 - z) * x * x) / S) - z) / (2 * (1 - z))));
  };
  let lo = 0, hi = 0.99;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (total(mid) > 1) lo = mid; else hi = mid;
    if (hi - lo < 1e-12) break;
  }
  const z = (lo + hi) / 2;
  const p = q.map((x) => (Math.sqrt(z * z + (4 * (1 - z) * x * x) / S) - z) / (2 * (1 - z)));
  const t = sum(p);
  return p.map((x) => x / t);
}

export const DEVIG = {
  multiplicative: devigMultiplicative,
  additive: devigAdditive,
  power: devigPower,
  shin: devigShin,
};

// ---------- value ----------

// Expected profit per 1 staked, given your probability and the decimal odds.
export function expectedValue(p, d) {
  p = Number(p); d = Number(d);
  if (!ok(p) || !ok(d) || p < 0 || p > 1 || d <= 1) return NaN;
  return p * d - 1;
}

// Kelly stake as a fraction of bankroll. Negative means do not bet.
export function kellyFraction(p, d) {
  const b = Number(d) - 1;
  if (!ok(b) || b <= 0) return NaN;
  return (p * b - (1 - p)) / b;
}

// ---------- parlays ----------

export function parlayDecimal(decimals) {
  if (!decimals.length || decimals.some((d) => !ok(d) || d <= 1)) return NaN;
  return decimals.reduce((acc, d) => acc * d, 1);
}

// ---------- hedging and arbitrage ----------

// Hedge an existing bet so you win the same whichever side lands.
export function equalHedge(stake, origDecimal, hedgeDecimal) {
  stake = Number(stake);
  if (!ok(stake) || stake <= 0 || !(origDecimal > 1) || !(hedgeDecimal > 1)) return null;
  const hedge = (stake * origDecimal) / hedgeDecimal;
  const ifOriginal = stake * origDecimal - stake - hedge;
  const ifHedge = hedge * hedgeDecimal - hedge - stake;
  return { hedge, ifOriginal, ifHedge };
}

// Two-way arbitrage: back both sides at the best available prices.
export function twoWayArb(total, dA, dB) {
  total = Number(total);
  if (!ok(total) || total <= 0 || !(dA > 1) || !(dB > 1)) return null;
  const implied = 1 / dA + 1 / dB;
  const stakeA = (total * (1 / dA)) / implied;
  const stakeB = total - stakeA;
  return { implied, isArb: implied < 1, returnPct: 1 / implied - 1, stakeA, stakeB,
           payout: stakeA * dA };
}

// ---------- pick'em (PrizePicks / Underdog style) ----------

// Probability of exactly k hits from independent legs with different probabilities
// (the Poisson-binomial distribution), by dynamic programming.
export function hitDistribution(probs) {
  let dist = [1];
  for (const p of probs) {
    const next = new Array(dist.length + 1).fill(0);
    dist.forEach((v, k) => { next[k] += v * (1 - p); next[k + 1] += v * p; });
    dist = next;
  }
  return dist;
}

// payouts: { hits: multiplier }, e.g. Power 3-pick { 3: 5 }, Flex { 3: 3, 2: 1 }.
export function pickemValue(probs, payouts) {
  if (!probs.length || probs.some((p) => !ok(p) || p < 0 || p > 1)) return null;
  const dist = hitDistribution(probs);
  let ret = 0, pAny = 0;
  dist.forEach((pk, k) => {
    const m = Number(payouts[k] || 0);
    ret += pk * m;
    if (m > 0) pAny += pk;
  });
  return { dist, expectedReturn: ret, ev: ret - 1, pAnyPayout: pAny };
}

// The single per-leg probability at which a slip breaks even, for comparison against
// your own leg estimates.
export function pickemBreakevenLeg(n, payouts) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const r = pickemValue(new Array(n).fill(mid), payouts);
    if (r.expectedReturn < 1) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
