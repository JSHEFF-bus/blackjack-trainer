import { TOOLS } from '../../lib/tools';

export const metadata = {
  title: 'Free Betting Calculators: Odds, No-Vig, EV, Parlay & Hedge',
  description: "Free sports betting calculators: odds converter, no-vig fair odds, expected value and Kelly, parlay, pick'em (PrizePicks, Underdog) and hedge or arbitrage. No sign-up.",
  alternates: { canonical: '/betting-calculators' },
};

export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Betting calculators',
    itemListElement: TOOLS.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t.name, url: `https://blackjackgto.com/${t.slug}`,
    })),
  };
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-500 mb-4"><a href="/" className="hover:text-gray-300">Blackjack GTO</a></nav>
        <h1 className="text-2xl font-bold text-white mb-2">Betting Calculators</h1>
        <p className="text-gray-400 text-sm mb-8">
          The same maths that drives our blackjack trainer, for sports betting: what a price really
          means, what the bookmaker takes, and whether a bet is worth making. Free, no sign-up.
        </p>
        <div className="space-y-3">
          {TOOLS.map((t) => (
            <a key={t.slug} href={`/${t.slug}`}
               className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-5 py-4 transition-colors">
              <div className="text-white font-semibold mb-1">{t.name} <span className="text-blue-400">→</span></div>
              <div className="text-sm text-gray-400">{t.blurb}</div>
            </a>
          ))}
        </div>
        <section className="mt-12 border-t border-gray-800 pt-8 text-sm text-gray-400 leading-relaxed space-y-3">
          <h2 className="text-base font-bold text-white">Where to start</h2>
          <p>New to the numbers? Start with the <a href="/odds-converter" className="text-blue-400">odds converter</a> to see what a price implies, then the <a href="/no-vig-calculator" className="text-blue-400">no-vig calculator</a> to see how much of that is the bookmaker's margin.</p>
          <p>Deciding on a specific bet? The <a href="/expected-value-calculator" className="text-blue-400">EV calculator</a> answers the only question that matters: does the price pay more than the chance of winning justifies?</p>
          <p className="text-xs text-gray-600 pt-4">For education and entertainment. Gambling involves risk. If gambling stops being fun, call 1-800-GAMBLER.</p>
        </section>
      </div>
    </main>
  );
}
