export const SITE = {
  name: 'Decaf Discovered',
  tagline: 'Finding great decaf coffee, one bag at a time.',
  description:
    'Honest reviews of decaf beans from a normal coffee drinker. No coffee snobbery, just what tastes good.',
  author: 'Decaf Discovered',
  locale: 'en-GB',
  twitter: '@decafdiscovered',
  // Update this to your tip-jar URL — Ko-fi, Buy Me a Coffee, PayPal, etc.
  // Set to '' to hide the buttons entirely.
  buyMeACoffeeUrl: 'https://ko-fi.com/H4B0236Z7A',
  // Beehiiv publication URL. Used as a fallback subscribe link and to point
  // people at the archive of past issues. Set to '' to hide the fallback.
  newsletterUrl: 'https://decafdiscovered.beehiiv.com/',
  // Beehiiv "loader" embed form ID — the UUID from the `data-beehiiv-form`
  // attribute on the script snippet in the beehiiv admin. When set, the
  // on-site newsletter component renders the styled beehiiv form via their
  // loader script. Set to '' to fall back to the button/POST form flow.
  beehiivFormId: '8adedfc7-fe65-4202-9585-b43d364a144c',
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

/**
 * Returns true if the given date is now-or-earlier — i.e. the entry is safe to
 * publish. Used at build time so future-dated reviews/guides are excluded from
 * the built site until a subsequent build runs on/after their `publishedDate`.
 *
 * Because the site is statically generated on Azure Static Web Apps, this is
 * paired with a scheduled GitHub Actions rebuild so content goes live without
 * a manual push.
 */
export function isPublished(publishedDate: Date, now: Date = new Date()): boolean {
  return publishedDate.getTime() <= now.getTime();
}
