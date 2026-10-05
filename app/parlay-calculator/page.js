import ToolPage from '../../components/calc/ToolPage';
import Tool from './Tool';

export const metadata = {
  title: 'Parlay Calculator: Payout, Odds & Expected Value',
  description: 'Free parlay calculator. Combine up to ten legs in American, decimal or fractional odds to see the parlay odds, payout, implied probability and expected value.',
  alternates: { canonical: '/parlay-calculator' },
};

export default function Page() {
  return (
    <ToolPage
      slug="parlay-calculator"
      title="Parlay Calculator"
      intro="Add each leg's odds to see what the parlay pays. Add your own win chance for each leg to see whether it is worth it."
      sections={[
        ['How parlay odds are calculated', [
          'A parlay multiplies the decimal odds of every leg. Two legs at -110 (1.909 each) become 1.909 × 1.909 = 3.64, or +264. Every leg has to win.',
        ]],
        ['Why parlays usually cost you more', [
          'The bookmaker margin multiplies too. A single bet at -110 costs you about 4.5% on average. Two of them in a parlay cost about 9%, three cost about 13%. Every leg you add pays the house again.',
          'The flip side is also true. If every leg is genuinely a good bet, a parlay multiplies the edge as well. The calculator shows which situation you are in once you enter a win chance for each leg.',
        ]],
        ['Same-game parlays', [
          'Legs from the same game are not independent. If you take a quarterback over on passing yards and the game total over, both win together in a shootout. That makes the parlay more likely than simple multiplication suggests, and sportsbooks know it: same-game parlays are priced lower than the product of the legs to take that back.',
        ]],
      ]}
      faq={[
        ['How much does a 3-leg parlay pay at -110?', 'About +596. Each leg is 1.909 in decimal; 1.909 × 1.909 × 1.909 = 6.96, so a $10 bet returns $69.60.'],
        ['Are parlays a good bet?', 'On average no, because the margin compounds with every leg. They only make sense when each leg is individually a positive-value bet.'],
        ['What happens if a leg pushes?', 'At most sportsbooks the pushed leg is removed and the parlay pays at the odds of the remaining legs. Check your book\'s rules.'],
      ]}
    >
      <Tool />
    </ToolPage>
  );
}
