import { TOOLS } from '../lib/tools';

export default function sitemap() {
  const tools = [
    { url: 'https://blackjackgto.com/betting-calculators', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...TOOLS.map((t) => ({ url: `https://blackjackgto.com/${t.slug}`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 })),
  ];
  return [
    {
      url: 'https://blackjackgto.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://blackjackgto.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://blackjackgto.com/privacy-policy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: 'https://blackjackgto.com/how-to-count-cards',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://blackjackgto.com/blackjack-strategy-chart',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://blackjackgto.com/how-to-play-blackjack',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://blackjackgto.com/how-to-memorize-blackjack-strategy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://blackjackgto.com/blackjack-house-edge-calculator',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
      ...tools,
  ];
}
