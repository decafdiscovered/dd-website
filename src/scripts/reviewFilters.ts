/**
 * Client-side review filtering. Pure DOM, zero framework.
 *
 * The reviews index server-renders every ReviewCard. Each card exposes
 * its filterable metadata via data-* attributes so we never need to
 * ship the underlying data as JSON.
 */
export function initReviewFilters(): void {
  const form = document.querySelector<HTMLFormElement>('[data-filters]');
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-review-card]'));
  if (!form || cards.length === 0) return;

  const visibleOut = form.querySelector<HTMLElement>('[data-visible-count]');
  const totalOut = form.querySelector<HTMLElement>('[data-total-count]');
  const ratingInput = form.querySelector<HTMLInputElement>('[data-rating-input]');
  const ratingOut = form.querySelector<HTMLElement>('[data-rating-output]');
  const textInput = form.querySelector<HTMLInputElement>('[data-text-input]');
  const noResults = document.querySelector<HTMLElement>('[data-no-results]');

  if (totalOut) totalOut.textContent = String(cards.length);

  const readSelected = (name: string): string[] =>
    Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)).map((el) =>
      el.value.toLowerCase(),
    );

  const parseJson = (el: HTMLElement, attr: string): string[] => {
    try {
      const raw = el.dataset[attr];
      return raw ? (JSON.parse(raw) as string[]).map((v) => v.toLowerCase()) : [];
    } catch {
      return [];
    }
  };

  const applyFilters = (): void => {
    const methods = readSelected('method');
    const flavours = readSelected('flavour');
    const bestFor = readSelected('bestFor');
    const minRating = ratingInput ? Number(ratingInput.value) : 1;
    const query = (textInput?.value ?? '').trim().toLowerCase();

    if (ratingOut && ratingInput) ratingOut.textContent = Number(ratingInput.value).toFixed(1);

    let visible = 0;
    for (const card of cards) {
      const cardMethods = parseJson(card, 'methods');
      const cardTags = parseJson(card, 'tags');
      const cardBestFor = parseJson(card, 'bestFor');
      const cardRating = Number(card.dataset.rating ?? '0');
      const cardText = card.textContent?.toLowerCase() ?? '';

      const methodOk = methods.length === 0 || methods.some((m) => cardMethods.includes(m));
      const flavourOk = flavours.length === 0 || flavours.some((f) => cardTags.includes(f));
      const bestForOk = bestFor.length === 0 || bestFor.some((b) => cardBestFor.includes(b));
      const ratingOk = cardRating >= minRating;
      const queryOk = query.length === 0 || cardText.includes(query);

      const show = methodOk && flavourOk && bestForOk && ratingOk && queryOk;
      card.toggleAttribute('hidden', !show);
      if (show) visible++;
    }

    if (visibleOut) visibleOut.textContent = String(visible);
    if (noResults) noResults.toggleAttribute('hidden', visible !== 0);
  };

  form.addEventListener('input', applyFilters);
  form.addEventListener('reset', () => {
    // Let the browser reset the form first, then re-run.
    window.setTimeout(applyFilters, 0);
  });

  applyFilters();
}
