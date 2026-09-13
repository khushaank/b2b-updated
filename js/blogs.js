const insightMediaByCategory = {
  'Smart Factory': 'engineering-knowledge.webp',
  'Industry 4.0': 'audits-electrical.webp',
  Energy: 'sustainability-emissions.webp',
  ESG: 'sustainability-emissions.webp',
  Water: 'sustainability-emissions.webp',
  Operations: 'engineering-knowledge.webp',
  Compliance: 'engineering-knowledge.webp',
  'Environmental Compliance': 'sustainability-emissions.webp',
  'Electrical Safety': 'audits-electrical.webp',
  'Workplace Safety': 'fire-safety.webp',
  Safety: 'fire-safety.webp',
  'Fire Safety': 'fire-safety.webp',
  'HVAC & Energy': 'hvac-projects.webp'
};

const decorateInsightCard = (card, isLeadStory = false) => {
  const link = card.querySelector('.blog-card-link');
  const category = card.querySelector('.blog-card-category')?.textContent.trim();
  if (!link) return;

  card.classList.add('insight-card');
  link.querySelector('.insight-visual, .insight-media')?.remove();
  const media = document.createElement('figure');
  const image = document.createElement('img');
  media.className = 'insight-media';
  media.setAttribute('aria-hidden', 'true');
  image.src = `../assets/images/editorial/${insightMediaByCategory[category] || 'engineering-knowledge.webp'}`;
  image.alt = '';
  image.width = 1600;
  image.height = 900;
  image.decoding = 'async';
  image.loading = isLeadStory ? 'eager' : 'lazy';
  if (isLeadStory) image.fetchPriority = 'high';
  media.append(image);
  link.prepend(media);

  if (!link.querySelector('.read-indicator')) {
    link.insertAdjacentHTML('beforeend', '<span class="read-indicator">Read insight <span aria-hidden="true">&rarr;</span></span>');
  }
};

const article = document.querySelector('.blog-article-wrapper, .blog-article');
if (article) {
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  document.body.append(progress);

  const headings = [...article.querySelectorAll('h2')];
  if (headings.length) {
    const toc = document.createElement('aside');
    toc.className = 'article-hover-toc';
    toc.setAttribute('aria-label', 'Article contents');
    const nav = document.createElement('nav');
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.innerHTML = `<span></span><b>${heading.textContent.trim()}</b>`;
      nav.appendChild(link);
    });
    toc.appendChild(nav);
    document.body.append(toc);
  }

  const update = () => {
    const rect = article.getBoundingClientRect();
    const total = article.offsetHeight - window.innerHeight;
    const read = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
    progress.style.transform = `scaleX(${read})`;
    const activeIndex = headings.findLastIndex((heading) => heading.getBoundingClientRect().top < window.innerHeight * .42);
    document.querySelectorAll('.article-hover-toc a').forEach((link, index) => link.classList.toggle('active', index === activeIndex));
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

const insightsHub = document.querySelector('.insights-hub');
if (insightsHub) {
  const featuredGrid = insightsHub.querySelector('#featuredInsights');
  const latestGrid = insightsHub.querySelector('#blogGrid');
  const featuredSection = insightsHub.querySelector('.featured-insights');
  const latestSection = insightsHub.querySelector('.latest-insights');
  const searchInput = document.querySelector('#insightTitleSearch');
  const searchStatus = insightsHub.querySelector('[data-search-status]');
  const emptyState = insightsHub.querySelector('#insightsEmpty');
  const latestCount = insightsHub.querySelector('[data-latest-count]');
  const totalCount = insightsHub.querySelector('[data-insight-total]');
  const featuredCards = featuredGrid ? [...featuredGrid.querySelectorAll('.blog-card')] : [];
  const latestCards = latestGrid ? [...latestGrid.querySelectorAll('.blog-card')] : [];
  const allCards = [...featuredCards, ...latestCards];
  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
  const suggestions = document.createElement('div');
  suggestions.className = 'insights-suggestions';
  suggestions.hidden = true;
  searchInput?.parentElement?.appendChild(suggestions);

  allCards.forEach((card, index) => {
    decorateInsightCard(card, card === featuredCards[0]);
    if (featuredCards.includes(card) && index > 0) card.classList.add('insight-card-secondary');
  });

  const updateInsights = () => {
    const query = searchInput?.value.trim().toLocaleLowerCase() || '';
    const matches = (card) => card.querySelector('h2')?.textContent.trim().toLocaleLowerCase().includes(query);
    const visibleFeatured = featuredCards.filter(matches);
    const visibleLatest = query ? latestCards.filter(matches) : latestCards.slice(0, 6);
    const visibleTotal = visibleFeatured.length + visibleLatest.length;

    featuredCards.forEach((card) => { card.hidden = !visibleFeatured.includes(card); });
    latestCards.forEach((card) => { card.hidden = !visibleLatest.includes(card); });
    if (featuredSection) featuredSection.hidden = visibleFeatured.length === 0;
    if (latestSection) latestSection.hidden = visibleLatest.length === 0;
    if (emptyState) emptyState.hidden = visibleTotal !== 0;
    if (searchStatus) searchStatus.textContent = query ? `${plural(visibleTotal, 'title')} found` : '';
    if (latestCount) latestCount.textContent = plural(visibleLatest.length, 'latest article');
    if (totalCount) totalCount.textContent = allCards.length;
  };

  const updateSuggestions = () => {
    if (!searchInput) return;
    const query = searchInput.value.trim().toLocaleLowerCase();
    const matches = allCards.filter((card) => card.querySelector('h2')?.textContent.trim().toLocaleLowerCase().includes(query)).slice(0, 5);
    suggestions.replaceChildren();
    const heading = document.createElement('p');
    heading.className = 'insights-suggestions-heading';
    heading.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 17 6-6 4 4 7-8"></path><path d="M14 7h6v6"></path></svg>';
    heading.append(query ? 'Suggested titles' : 'Trending articles');
    suggestions.appendChild(heading);
    matches.forEach((card) => {
      const sourceLink = card.querySelector('.blog-card-link');
      const link = document.createElement('a');
      const title = document.createElement('span');
      const category = document.createElement('small');
      link.href = sourceLink?.getAttribute('href') || '#';
      title.textContent = card.querySelector('h2')?.textContent.trim() || 'Read article';
      category.textContent = card.querySelector('.blog-card-category')?.textContent.trim() || 'Insight';
      link.append(title, category);
      suggestions.appendChild(link);
    });
    suggestions.hidden = matches.length === 0;
  };

  searchInput?.addEventListener('focus', updateSuggestions);
  searchInput?.addEventListener('input', () => { updateInsights(); updateSuggestions(); });
  searchInput?.addEventListener('keydown', (event) => { if (event.key === 'Escape') suggestions.hidden = true; });
  document.addEventListener('pointerdown', (event) => {
    if (!searchInput?.parentElement?.contains(event.target)) suggestions.hidden = true;
  });
  updateInsights();
}

const allPostsHub = document.querySelector('.all-posts-hub');
if (allPostsHub) {
  const grid = allPostsHub.querySelector('#allPostsGrid');
  const count = allPostsHub.querySelector('[data-all-posts-count]');
  const status = allPostsHub.querySelector('[data-all-posts-status]');
  const searchInput = allPostsHub.ownerDocument.querySelector('#allPostsSearch');

  fetch('./')
    .then((response) => {
      if (!response.ok) throw new Error('Could not load the article collection.');
      return response.text();
    })
    .then((html) => {
      const source = new DOMParser().parseFromString(html, 'text/html');
      const cards = [...source.querySelectorAll('#featuredInsights .blog-card, #blogGrid .blog-card')];
      cards.forEach((card) => {
        card.classList.remove('featured-card', 'insight-card-featured', 'insight-card-secondary');
        decorateInsightCard(card);
      });
      grid?.replaceChildren(...cards);
      if (count) count.textContent = `${cards.length} articles`;
      if (status) status.hidden = true;

      searchInput?.addEventListener('input', () => {
        const query = searchInput.value.trim().toLocaleLowerCase();
        const matchingCards = cards.filter((card) => card.querySelector('h2')?.textContent.toLocaleLowerCase().includes(query));
        cards.forEach((card) => { card.hidden = !matchingCards.includes(card); });
        if (count) count.textContent = query ? `${matchingCards.length} matching articles` : `${cards.length} articles`;
        if (status) {
          status.hidden = matchingCards.length !== 0;
          status.textContent = 'No article titles match that search. Try fewer words.';
        }
      });
    })
    .catch(() => {
      if (status) status.textContent = 'The article collection could not load. Please refresh the page.';
    });
}
