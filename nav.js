// Shared sidebar navigation — injected into every wiki page
document.addEventListener('DOMContentLoaded', () => {
  const current = location.pathname.split('/').pop() || 'index.html';
  const nav = [
    { label: 'Overview', links: [
      { href: 'index.html',     text: 'Introduction' },
      { href: 'getting-started.html', text: 'Getting Started' },
      { href: 'map.html',       text: 'Map & Navigation' },
    ]},
    { label: 'Mechanics', links: [
      { href: 'jobs.html',      text: 'Jobs' },
      { href: 'risk.html',      text: 'Risk & Combat' },
      { href: 'mining.html',    text: 'Mining' },
      { href: 'market.html',    text: 'Market' },
      { href: 'colonies.html',  text: 'Colonies' },
      { href: 'research.html',  text: 'Research' },
      { href: 'salvage.html',   text: 'Salvage & Derelicts' },
      { href: 'anomalies.html', text: 'Anomalies' },
      { href: 'piracy.html',    text: 'Piracy' },
      { href: 'logistics.html', text: 'Logistics' },
      { href: 'transmissions.html', text: 'Transmissions' },
      { href: 'shipyards.html', text: 'Ship Yards' },
    ]},
    { label: 'Reference', links: [
      { href: 'ships.html',       text: 'Ships' },
      { href: 'materials.html',   text: 'Materials' },
      { href: 'commodities.html', text: 'Commodities' },
      { href: 'asteroids.html',   text: 'Asteroids' },
      { href: 'stations.html',    text: 'Stations' },
      { href: 'factions.html',    text: 'Factions' },
      { href: 'faction-ships.html', text: 'Faction Ships' },
    ]},
  ];

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <img class="sidebar-logo-img" src="img/wordmark.svg" alt="Hollow Sector">
      <p>CEO's Guide to the Sector</p>
    </div>
    <nav class="sidebar-nav">
      ${nav.map(section => `
        <div class="nav-section">
          <div class="nav-section-label">${section.label}</div>
          ${section.links.map(l => `<a href="${l.href}" class="${l.href === current ? 'active' : ''}">${l.text}</a>`).join('')}
        </div>
      `).join('')}
    </nav>
  `;

  // ── Mobile: top bar + hamburger drawer ──
  const topbar = document.createElement('div');
  topbar.className = 'mobile-topbar';
  topbar.innerHTML = `
    <button class="hamburger" aria-label="Menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
    <img class="mobile-logo-img" src="img/wordmark.svg" alt="Hollow Sector">
  `;
  const backdrop = document.createElement('div');
  backdrop.className = 'sidebar-backdrop';
  document.body.insertBefore(topbar, document.body.firstChild);
  document.body.appendChild(backdrop);

  const hamburger = topbar.querySelector('.hamburger');
  const open = () => {
    sidebar.classList.add('open');
    backdrop.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
  };
  const close = () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  };
  hamburger.addEventListener('click', () =>
    sidebar.classList.contains('open') ? close() : open());
  backdrop.addEventListener('click', close);
  sidebar.addEventListener('click', e => { if (e.target.closest('a')) close(); });

  // ── Wrap wide tables so they scroll instead of overflowing the page ──
  document.querySelectorAll('.wiki-table').forEach(table => {
    if (table.parentElement.classList.contains('table-scroll')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
});
