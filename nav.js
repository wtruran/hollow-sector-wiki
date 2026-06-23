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
      { href: 'shipyards.html', text: 'Ship Yards' },
    ]},
    { label: 'Reference', links: [
      { href: 'ships.html',       text: 'Ships' },
      { href: 'materials.html',   text: 'Materials' },
      { href: 'commodities.html', text: 'Commodities' },
      { href: 'asteroids.html',   text: 'Asteroids' },
      { href: 'stations.html',    text: 'Stations' },
      { href: 'factions.html',    text: 'Factions' },
    ]},
  ];

  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-logo">
      <h1>Hollow Sector</h1>
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
});
