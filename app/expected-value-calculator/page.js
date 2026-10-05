import ToolPage from '../../components/calc/ToolPage';
import Tool from './Tool';

export const metadata = {
  title: 'Expected Value (EV) Calculator for Sports Betting & Kelly Stake',
  description: 'Free EV calculator for betting. Enter the odds and your win probability to see expected value, the break-even win rate, and the Kelly criterion stake.',
  alternates: { canonical: '/expected-value-calculator' },
};

export default function Page() {
  return (
    <ToolPage
      slug="expected-value-calculator"
      title="Expected Value (EV) Calculator"
      intro="Enter the odds you are offered and how likely you think the bet is to win. The calculator tells you whether it is worth making and how much to stake."
      sections={[
        ['How expected value works', [
          'Expected value is what a bet is worth on average if you could make it many times. The formula is your win probability multiplied by the decimal odds, minus 1.',
          'A bet at +150 (decimal 2.50) that you think wins 45% of the time: 0.45 × 2.50 − 1 = +0.125. You make 12.5 cents per dollar staked on average. At 35% it is 0.35 × 2.50 − 1 = −0.125, a 12.5-cent loss.',
          'Positive EV does not mean the bet will win. A +12.5% bet still loses 55% of the time. It means that over enough bets like it, you come out ahead.',
        ]],
        ['The number that matters: your probability', [
          'Every EV calculation is only as good as the probability you put in. If you overestimate your chances by five points, a bet that looks +10% can really be a loser. The most reliable probability most people can get is the fair probability from a sharp, low-margin book, which you can find with the no-vig calculator.',
        ]],
        ['The Kelly criterion', [
          'Kelly tells you what fraction of your bankroll to stake to grow it fastest, given your edge. Bet more and you risk ruin; bet less and you grow slowly. Because nobody knows their probability exactly, betting half or a quarter of the Kelly amount is the common, safer choice.',
        ]],
      ]}
      faq={[
        ['What is a +EV bet?', 'A bet whose expected value is positive: the odds pay more than the true probability of winning justifies. Over many such bets you would expect to profit.'],
        ['What win rate do I need at -110?', '52.4%. That is the implied probability of -110, and anything below it loses money over time.'],
        ['Should I bet full Kelly?', 'Usually not. Full Kelly is only optimal if your probability is exactly right. Errors in your estimate make full Kelly far too aggressive, so fractional Kelly is the standard choice.'],
      ]}
    >
      <Tool />
    </ToolPage>
  );
}
