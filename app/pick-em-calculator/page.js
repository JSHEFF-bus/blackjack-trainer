import ToolPage from '../../components/calc/ToolPage';
import Tool from './Tool';

export const metadata = {
  title: "Pick'em EV Calculator for PrizePicks & Underdog (Power & Flex)",
  description: "Free pick'em calculator for PrizePicks and Underdog style slips. Enter your payouts and each pick's chance to see expected value, the break-even win rate per pick, and Power vs Flex.",
  alternates: { canonical: '/pick-em-calculator' },
};

export default function Page() {
  return (
    <ToolPage
      slug="pick-em-calculator"
      title="Pick'em EV Calculator"
      intro="For PrizePicks and Underdog style entries. Enter the multipliers your app shows and how likely you think each pick is, and see whether the slip is worth playing."
      sections={[
        ['The break-even number', [
          'Every pick\'em slip has a break-even win rate per pick. On a 2-pick Power play paying 3x it is 57.7%, because 0.577 × 0.577 × 3 = 1. Below that, the slip loses money over time however confident you feel.',
          'That figure is the one to remember. A pick you think is a coin flip is not a good pick in a pick\'em slip; it has to be clearly better than the break-even rate for the number of picks you are playing.',
        ]],
        ['Power or Flex?', [
          'Power plays pay only if every pick hits, and pay more for it. Flex plays pay something for near misses and less for a perfect slip. Flex is lower-variance; which has the better expected value depends on your pick quality, and the calculator shows both if you switch between them.',
        ]],
        ['Boosted and discounted lines', [
          'Apps label some lines as harder (with a higher payout) or easier (with a lower one). They change the multiplier for the whole slip, so an easy line is rarely free: it is paid for out of the payout. Always copy the exact multiplier your app shows after you have picked your lines.',
        ]],
      ]}
      faq={[
        ['What win rate do I need on PrizePicks?', 'It depends on the slip. On a 2-pick Power at 3x you need 57.7% per pick. Use the calculator with your app\'s multipliers to see the exact figure for your entry.'],
        ['Is Flex or Power better?', 'Neither in general. Flex pays on near misses so it loses less on a bad day; Power pays more for a perfect slip. Compare the expected value of both for your own picks.'],
        ['Are same-game picks a good idea?', 'They can help a Power play because the picks tend to win together, but apps know that and often lower the payout on correlated picks. Check the multiplier before assuming it helps.'],
      ]}
    >
      <Tool />
    </ToolPage>
  );
}
