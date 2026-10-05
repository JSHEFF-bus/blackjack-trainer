import ToolPage from '../../components/calc/ToolPage';
import Tool from './Tool';

export const metadata = {
  title: 'Hedge Bet & Arbitrage Calculator',
  description: 'Free hedge calculator: find the stake that locks in a profit on an open bet. Plus a two-way arbitrage calculator that splits your stake across two sportsbooks.',
  alternates: { canonical: '/hedge-calculator' },
};

export default function Page() {
  return (
    <ToolPage
      slug="hedge-calculator"
      title="Hedge & Arbitrage Calculator"
      intro="Hedge an open bet so you win the same whatever happens, or split a stake across two sportsbooks when their prices disagree."
      sections={[
        ['When hedging makes sense', [
          'Hedging means betting the other side of a bet you already hold. It is most useful on a futures bet or the last leg of a parlay, when the price has moved in your favour and you would rather bank a certain profit than risk it all on one result.',
          'You pay for that certainty. The hedge bet carries its own bookmaker margin, so a hedged position is worth slightly less on average than letting the original ride. Hedge when the guaranteed amount matters more to you than the extra expected value.',
        ]],
        ['How arbitrage works, and why it is rare', [
          'If two sportsbooks disagree enough, you can back both sides and win whatever happens. The test is simple: add the implied probabilities of the best price on each side. Under 100% is an arbitrage; over 100% is not.',
          'In practice true arbitrage opportunities are small (usually 1-3%), close within minutes, and sportsbooks restrict accounts that take them regularly. Most apparent arbitrages turn out to be two bets that are not quite the same, such as different lines or different settlement rules. Check both bets carefully before staking anything.',
        ]],
      ]}
      faq={[
        ['How do I calculate a hedge bet?', 'Multiply your original stake by its decimal odds, then divide by the decimal odds of the hedge. Staking that amount on the other side gives the same result whichever side wins.'],
        ['Is arbitrage betting legal?', 'Placing bets at licensed sportsbooks is legal where sports betting is legal, but sportsbooks can and do limit accounts that arbitrage. It is not a guaranteed long-term income.'],
        ['Why does the calculator say "not an arbitrage"?', 'Because the two prices add up to more than 100%. That is normal: it is the combined margin of the two books. A true arbitrage needs the books to disagree by more than their margins.'],
      ]}
    >
      <Tool />
    </ToolPage>
  );
}
