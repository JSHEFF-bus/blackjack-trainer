// The betting calculators, in one place so the hub page, the sitemap, the footer and the
// "related tools" links can never drift out of step.
export const TOOLS = [
  { slug: 'odds-converter', name: 'Odds Converter',
    blurb: 'Convert American, decimal and fractional odds, and see the implied probability.' },
  { slug: 'no-vig-calculator', name: 'No-Vig Fair Odds Calculator',
    blurb: 'Strip the bookmaker margin out of a two-way line to get the fair probability.' },
  { slug: 'expected-value-calculator', name: 'Expected Value (EV) Calculator',
    blurb: 'Is a bet worth it? Expected profit and the Kelly stake from your own probability.' },
  { slug: 'parlay-calculator', name: 'Parlay Calculator',
    blurb: 'Payout, true probability and expected value for a parlay of up to ten legs.' },
  { slug: 'pick-em-calculator', name: "Pick'em EV Calculator",
    blurb: "Power and Flex expected value for PrizePicks and Underdog style slips." },
  { slug: 'hedge-calculator', name: 'Hedge & Arbitrage Calculator',
    blurb: 'Lock in a profit on an open bet, or split stakes across two books.' },
];
