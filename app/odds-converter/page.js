import ToolPage from '../../components/calc/ToolPage';
import Tool from './Tool';

export const metadata = {
  title: 'Odds Converter: American, Decimal, Fractional & Implied Probability',
  description: 'Free odds converter. Convert American odds to decimal and fractional, see the implied probability of any price, and turn a win percentage into fair odds.',
  alternates: { canonical: '/odds-converter' },
};

export default function Page() {
  return (
    <ToolPage
      slug="odds-converter"
      title="Odds Converter"
      intro="Convert between American, decimal and fractional odds and see the implied probability of any price."
      sections={[
        ['How the three formats relate', [
          'Decimal odds are the total you get back for every $1 staked, stake included. 2.50 returns $2.50 on $1: your dollar back plus $1.50 profit.',
          'American odds are written from $100. A plus number (+150) is the profit on a $100 bet. A minus number (-110) is how much you must stake to win $100. Fractional odds (3/2) are profit over stake, the British convention.',
          '+150, 2.50 and 3/2 are the same price written three ways.',
        ]],
        ['What implied probability means', [
          'Implied probability is 1 divided by the decimal odds. A 2.50 price implies 40%: it would break even if the outcome happened four times in ten.',
          'Add up the implied probabilities on both sides of a bookmaker line and you will get more than 100%. That excess is the margin (the vig). -110 on both sides implies 52.4% each, 104.8% in total. Use the no-vig calculator to strip it out.',
        ]],
      ]}
      faq={[
        ['How do I convert American odds to decimal?', 'For positive American odds, divide by 100 and add 1: +150 becomes 2.50. For negative odds, divide 100 by the number (ignoring the minus) and add 1: -110 becomes 1.909.'],
        ['What does -110 mean?', 'You stake $110 to win $100. It is decimal 1.909, fractional 10/11, and an implied probability of 52.4%, which is the win rate you need just to break even at that price.'],
        ['Is implied probability the real chance of winning?', 'No. It includes the bookmaker margin, so it overstates every side. The fair probability is lower; remove the vig to estimate it.'],
      ]}
    >
      <Tool />
    </ToolPage>
  );
}
