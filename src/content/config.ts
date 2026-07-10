import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Reusable enums — kept small on purpose. Everyday language only,
 * no cupping jargon. Expand as the site grows.
 */
const decafMethod = z.enum([
  'Swiss Water',
  'Mountain Water',
  'Sugar Cane / Ethyl Acetate',
  'CO2',
  'Unknown',
]);
const roastLevel = z.enum(['Light', 'Medium-light', 'Medium', 'Medium-dark', 'Dark']);
const bestForOption = z.enum(['Espresso', 'Flat white', 'Filter', 'Cafetière', 'AeroPress']);

const ratings = z.object({
  overallScore: z.number().min(1).max(10),
  espressoScore: z.number().min(1).max(10).optional(),
  milkDrinksScore: z.number().min(1).max(10).optional(),
  valueScore: z.number().min(1).max(10).optional(),
  wouldBuyAgain: z.boolean().default(false),
});

const taste = z.object({
  // Descriptors are free-text but should stay approachable, e.g.
  // "chocolatey", "smooth and low acidity", "full-bodied".
  sweetness: z.string(),
  bitterness: z.string(),
  acidity: z.string(),
  body: z.string(),
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/reviews' }),
  schema: ({ image }) =>
    z.object({
      coffeeName: z.string(),
      roaster: z.string(),
      country: z.string(),
      origin: z.string().optional(),
      decaffeinationMethod: decafMethod,
      roastLevel: roastLevel,
      // Prices/URLs are optional so demo content can omit them safely.
      price: z.number().nonnegative().optional(),
      weight: z.number().int().positive().optional(),
      purchaseUrl: z.string().url().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      publishedDate: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      bestFor: z.array(bestForOption).default([]),
      ratings,
      taste,
      summary: z.string(),
      myExperience: z.string(),
      bestBrewingMethod: z.string(),
      whoWouldLikeThis: z.string(),
      whoMightNotLikeThis: z.string(),
      pros: z.array(z.string()).default([]),
      cons: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      isSampleContent: z.boolean().default(false),
    }),
});

const roasters = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/roasters' }),
  schema: z.object({
    name: z.string(),
    // Free-text "City, Region" — e.g. "Strathaven, Scotland".
    location: z.string(),
    // Country used for the country filter on the roasters index.
    // Kept as a plain string so subdivisions like "Scotland" or "Wales" work.
    country: z.string(),
    // Emoji flag shown on each roaster tile, e.g. "🏴󠁧󠁢󠁳󠁣󠁴󠁿" or "🇬🇧".
    flag: z.string().optional(),
    website: z.string().url().optional(),
    summary: z.string(),
    isSampleContent: z.boolean().default(false),
  }),
});

const guides = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    publishedDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    isSampleContent: z.boolean().default(false),
  }),
});

export const collections = { reviews, roasters, guides };

// Re-exported unions for use in filter UIs and typed helpers.
export const DECAF_METHODS = decafMethod.options;
export const ROAST_LEVELS = roastLevel.options;
export const BEST_FOR_OPTIONS = bestForOption.options;
