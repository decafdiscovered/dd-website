export const SITE = {
  name: 'Decaf Discovered',
  tagline: 'Finding great decaf coffee, one bag at a time.',
  description:
    'Honest reviews of decaf beans from a normal coffee drinker. No coffee snobbery, just what tastes good.',
  author: 'Decaf Discovered',
  locale: 'en-GB',
  twitter: '@decafdiscovered',
  // Update this to your Buy Me a Coffee profile URL (e.g. 'https://buymeacoffee.com/your-handle').
  // Set to '' to hide the buttons entirely.
  buyMeACoffeeUrl: 'https://buymeacoffee.com/techielass',
  affiliateDisclosure:
    'Some links may be affiliate links. If you buy through these links I may earn a small commission at no extra cost to you.',
} as const;

/** Common flavour tags used across cards and filters. */
export const FLAVOUR_TAGS = [
  'Chocolate',
  'Nutty',
  'Caramel',
  'Fruity',
  'Smooth',
  'Good with milk',
] as const;
export type FlavourTag = (typeof FLAVOUR_TAGS)[number];

/** Format a UK date like "12 March 2025". */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/** Format a GBP price. Returns null if the price is missing. */
export function formatPrice(price?: number): string | null {
  if (price === undefined) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price);
}

/** Convert a numeric score (1–10) into a percentage width for bars. */
export function scoreToPercent(score: number): number {
  return Math.max(0, Math.min(100, (score / 10) * 100));
}
