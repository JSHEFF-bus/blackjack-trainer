// Server component: everything Google reads (heading, explanation, FAQ, structured data)
// renders as HTML, and only the interactive calculator is a client component.
import { TOOLS } from '../../lib/tools';

export default function ToolPage({ slug, title, intro, children, sections = [], faq = [] }) {
  const url = `https://blackjackgto.com/${slug}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: title,
      url,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: intro,
    },
    ...(faq.length
      ? [{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faq.map(([q, a]) => ({
            '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
          })),
        }]
      : []),
  ];
  const related = TOOLS.filter((t) => t.slug !== slug);
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-300">Blackjack GTO</a>
          <span className="mx-2">/</span>
          <a href="/betting-calculators" className="hover:text-gray-300">Betting calculators</a>
        </nav>
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        <p className="text-gray-400 text-sm mb-8">{intro}</p>

        {children}

        {sections.length > 0 && (
          <section className="mt-14 border-t border-gray-800 pt-10 space-y-6 text-sm text-gray-400 leading-relaxed">
            {sections.map(([h, body]) => (
              <div key={h}>
                <h2 className="text-base font-bold text-white mb-2">{h}</h2>
                {Array.isArray(body) ? body.map((p, i) => <p key={i} className="mb-2">{p}</p>) : <p>{body}</p>}
              </div>
            ))}
          </section>
        )}

        {faq.length > 0 && (
          <section className="mt-12 border-t border-gray-800 pt-10">
            <h2 className="text-lg font-bold text-white mb-5">Frequently asked questions</h2>
            <div className="space-y-5 text-sm text-gray-400 leading-relaxed">
              {faq.map(([q, a]) => (
                <div key={q}>
                  <h3 className="text-gray-200 font-semibold mb-1">{q}</h3>
                  <p>{a}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 border-t border-gray-800 pt-8">
          <h2 className="text-sm font-bold text-white mb-3">More betting calculators</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {related.map((t) => (
              <a key={t.slug} href={`/${t.slug}`}
                 className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg px-3 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                {t.name} →
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-6 leading-relaxed">
            For education and entertainment. These tools do the arithmetic; they cannot tell you a
            probability you do not already have. Gambling involves risk; only bet what you can afford
            to lose. If gambling stops being fun, call 1-800-GAMBLER.
          </p>
        </section>
      </div>
    </main>
  );
}
