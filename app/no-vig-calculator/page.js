import ToolPage from '../../components/calc/ToolPage';
import Tool from './Tool';

export const metadata = {
  title: 'No-Vig Calculator: Remove the Vig & Find Fair Odds',
  description: 'Free no-vig calculator. Strip the bookmaker margin out of any two-way line to find the fair probability and fair odds, using the Shin, power, multiplicative or additive method.',
  alternates: { canonical: '/no-vig-calculator' },
};

export default function Page() {
  return (
    <ToolPage
      slug="no-vig-calculator"
      title="No-Vig Fair Odds Calculator"
      intro="Enter both sides of a betting line to remove the bookmaker margin and see the fair probability of each side."
      sections={[
        ['What the vig is', [
          'A bookmaker never offers fair prices on both sides. At -110 / -110 each side implies 52.4%, adding to 104.8%. The extra 4.8% is the margin, also called the vig or juice, and it is how the book gets paid whichever side wins.',
          'To know what a price actually thinks, you have to take that margin back out. That is what this calculator does.',
        ]],
        ['Why the method matters', [
          'On an even line like -110 / -110 every method gives 50% / 50%, so it makes no difference. On a lopsided line they disagree, sometimes by more than a percentage point, and a point is often the whole difference between a good bet and a bad one.',
          'The multiplicative method takes the same proportion off both sides. Bookmakers tend to load more of their margin onto the underdog, though, because that is what casual bettors like to back (the favourite-longshot bias). The Shin and power methods take more off the underdog for that reason, and are usually the better estimate.',
        ]],
      ]}
      faq={[
        ['What is a no-vig line?', 'The price each side would have if the bookmaker took no margin: the fair odds implied by the market once the vig is removed.'],
        ['Which de-vig method is most accurate?', 'For two-way markets with a clear favourite, Shin or power generally beat the simple multiplicative method, because they account for bookmakers overpricing underdogs. On near-even lines they all agree.'],
        ['How do I use fair odds?', 'Compare them with a price at another sportsbook. If another book offers better odds than the fair odds from a sharp, low-margin book, that bet has positive expected value. The EV calculator does that sum.'],
      ]}
    >
      <Tool />
    </ToolPage>
  );
}
