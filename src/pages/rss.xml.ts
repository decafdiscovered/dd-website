import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE, isPublished } from '@utils/site';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const reviews = await getCollection(
    'reviews',
    ({ data }) => !data.draft && !data.isSampleContent && isPublished(data.publishedDate),
  );
  return rss({
    title: `${SITE.name} — Reviews`,
    description: SITE.description,
    site: context.site ?? 'https://decafdiscovered.co.uk',
    items: reviews
      .sort((a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime())
      .map((review) => ({
        title: `${review.data.coffeeName} — ${review.data.roaster}`,
        description: review.data.summary,
        pubDate: review.data.publishedDate,
        link: `/reviews/${review.id}/`,
      })),
  });
}
