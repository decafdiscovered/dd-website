/**
 * Client-side roaster filtering. Pure DOM, zero framework.
 *
 * The roasters index server-renders every tile with data-* attributes
 * describing its country and searchable text, so this script never
 * needs the underlying data as JSON.
 */
export function initRoasterFilters(): void {
  const form = document.querySelector<HTMLFormElement>('[data-roaster-filters]');
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-roaster-card]'));
  if (!form || cards.length === 0) return;

  const visibleOut = form.querySelector<HTMLElement>('[data-visible-count]');
  const totalOut = form.querySelector<HTMLElement>('[data-total-count]');
  const textInput = form.querySelector<HTMLInputElement>('[data-text-input]');
  const countrySelect = form.querySelector<HTMLSelectElement>('[data-country-input]');
  const noResults = document.querySelector<HTMLElement>('[data-no-roaster-results]');

  if (totalOut) totalOut.textContent = String(cards.length);

  const applyFilters = (): void => {
    const query = (textInput?.value ?? '').trim().toLowerCase();
    const country = (countrySelect?.value ?? '').toLowerCase();

    let visible = 0;
    for (const card of cards) {
      const cardCountry = (card.dataset.country ?? '').toLowerCase();
      const cardText = (card.dataset.search ?? '').toLowerCase();

      const countryOk = country === '' || cardCountry === country;
      const queryOk = query.length === 0 || cardText.includes(query);

      const show = countryOk && queryOk;
      card.toggleAttribute('hidden', !show);
      if (show) visible++;
    }

    if (visibleOut) visibleOut.textContent = String(visible);
    if (noResults) noResults.toggleAttribute('hidden', visible !== 0);
  };

  form.addEventListener('input', applyFilters);
  form.addEventListener('change', applyFilters);
  form.addEventListener('reset', () => {
    window.setTimeout(applyFilters, 0);
  });

  applyFilters();
}
