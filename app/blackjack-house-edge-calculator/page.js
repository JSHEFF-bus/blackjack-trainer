// Server wrapper. The calculator itself is a client component and cannot export
// metadata, so on its own this page inherited the HOMEPAGE title and canonical URL, which
// told Google it was a duplicate of "/" and kept it out of search results.
import Calculator from './Calculator';

export const metadata = {
  title: 'Blackjack House Edge Calculator',
  description: 'Calculate the exact house edge for any blackjack table. Choose the decks, soft 17, double after split, surrender and 3:2 or 6:5 payout to see the edge and your expected hourly loss.',
  alternates: { canonical: '/blackjack-house-edge-calculator' },
};

export default function Page() {
  return <Calculator />;
}
