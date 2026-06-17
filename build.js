// wiki/build.js
// Reads src/constants.js and regenerates the four data-driven wiki pages.
// Run: npm run wiki
// Watch: npm run wiki:watch  (re-runs on any file change in the project)

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import {
  SHIPS, SHIP_CLASS,
  MATERIALS, MATERIAL_TIER,
  ASTEROIDS,
  STATIONS, HOME_ELIGIBLE_STATIONS,
  DEFENSE_RATES, JOB_RATINGS, REP_PER_RATING,
  FACTIONS, FACTION_REP_MAX, FACTION_B_UNLOCK, FACTION_A_UNLOCK,
  STARTER_SHIPS, LIMITED_SHIP_POOL,
} from '../src/constants.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const out = p => join(__dir, p);

// ── Shared shell ─────────────────────────────────────────────────────────────
function page(title, breadcrumb, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Hollow Sector Wiki</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
<div class="layout">
  <aside class="sidebar" id="sidebar"></aside>
  <main class="main">
    ${breadcrumb}
    ${content}
  </main>
</div>
<script src="nav.js"></script>
</body>
</html>`;
}

function header(title, subtitle, crumbSection) {
  return `<div class="page-header">
  <div class="breadcrumb"><a href="index.html">Wiki</a> / ${crumbSection}</div>
  <h1>${title}</h1>
  <p class="subtitle">${subtitle}</p>
</div>`;
}

function table(heads, rows) {
  const ths = heads.map(h => `<th>${h}</th>`).join('');
  const trs = rows.map(cells =>
    `<tr>${cells.map(c => `<td${c.cls ? ` class="${c.cls}"` : ''}>${c.v ?? c}</td>`).join('')}</tr>`
  ).join('\n        ');
  return `<table class="wiki-table">
  <thead><tr>${ths}</tr></thead>
  <tbody>
    ${trs}
  </tbody>
</table>`;
}

function badge(text, type) {
  return `<span class="badge badge-${type}">${text}</span>`;
}

// ── SHIPS ────────────────────────────────────────────────────────────────────
function buildShips() {
  const byClass = cls => Object.values(SHIPS).filter(s => s.class === cls);

  function shipRow(s) {
    const limited = LIMITED_SHIP_POOL.includes(s.model);
    const starter = STARTER_SHIPS.includes(s.model);
    const typeBadge = limited ? badge('Limited', 'limited') : badge('Standard', 'common');
    const aversion = s.riskAversion ? s.riskAversion : '<span class="dim">—</span>';
    const mining   = s.miningSpeed  ? s.miningSpeed  : '<span class="dim">—</span>';
    return [
      { v: s.model, cls: 'val' }, aversion, mining,
      s.cargo ?? '—', s.speed, s.range,
      `ƒ${s.upkeep}/min`, `ƒ${s.cost.toLocaleString()}`, typeBadge,
    ];
  }

  const freightRows  = byClass(SHIP_CLASS.FREIGHT).map(shipRow);
  const fighterRows  = byClass(SHIP_CLASS.FIGHTER).map(shipRow);
  const miningRows   = byClass(SHIP_CLASS.MINING).map(shipRow);
  const heads = ['Model','Risk Aversion','Mining Speed','Cargo (SU)','Speed (real min / 100WU)','Range (WU)','Upkeep','Cost','Type'];

  const content = `
${header('Ships', 'All ship models — auto-generated from constants.js', 'Reference')}

<div class="callout teal">
  This page is <strong>auto-generated</strong>. Run <code>npm run wiki</code> after editing ship data in <code>src/constants.js</code>.
</div>

<h2>Freight</h2>
${table(heads, freightRows)}

<h2>Fighter</h2>
${table(heads, fighterRows)}

<h2>Mining</h2>
${table(heads, miningRows)}

<div class="callout">
  <strong>Speed:</strong> minutes per 1MM — lower is faster.<br>
  <strong>Mining Speed:</strong> minutes per CU extracted — lower is faster.<br>
  <strong>Risk Aversion:</strong> stacks across escorts; must meet or exceed job risk to guarantee 0% fail chance.
</div>`;

  writeFileSync(out('ships.html'), page('Ships', '', content));
  console.log('✓ ships.html');
}

// ── MATERIALS ────────────────────────────────────────────────────────────────
function buildMaterials() {
  const tierLabel = t =>
    t === MATERIAL_TIER.COMMON   ? badge('Common', 'common') :
    t === MATERIAL_TIER.UNCOMMON ? badge('Uncommon', 'uncommon') :
                                    badge('Rare', 'rare');

  const riskClass = ([lo]) => lo >= 6 ? 'high' : lo >= 2 ? 'medium' : '';

  function riskBar([lo, hi]) {
    const pct = Math.round((hi / 10) * 100);
    const cls = riskClass([lo]);
    return `<div class="risk-bar"><span>${lo}–${hi}</span>
      <div class="risk-track"><div class="risk-fill ${cls}" style="width:${pct}%"></div></div>
    </div>`;
  }

  const rows = Object.entries(MATERIALS).map(([name, m]) => [
    { v: name, cls: 'val' },
    tierLabel(m.tier),
    `ƒ${m.valuePerCU.toLocaleString()}`,
    `ƒ${Math.round(m.valuePerCU * 0.7).toLocaleString()}`,
    `ƒ${Math.round(m.valuePerCU * 1.3).toLocaleString()}`,
    m.mineTimePerCU,
    riskBar(m.piracyRisk),
  ]);

  const content = `
${header('Materials', 'All mineable resources — auto-generated from constants.js', 'Reference')}

<div class="callout teal">
  This page is <strong>auto-generated</strong>. Run <code>npm run wiki</code> after editing material data in <code>src/constants.js</code>.
</div>

${table(
  ['Material','Tier','Base Value (ƒ/CU)','Min Price','Max Price','Mine Time (real sec/CU)','Piracy Risk'],
  rows
)}

<div class="callout">
  Market prices fluctuate <strong>±30%</strong> from base value on a 6-hour refresh. Min/Max columns show the possible range.
</div>
<div class="callout">
  Asteroid risk is set to the highest-risk material on that asteroid and re-rolled every 4 hours.
</div>`;

  writeFileSync(out('materials.html'), page('Materials', '', content));
  console.log('✓ materials.html');
}

// ── ASTEROIDS ────────────────────────────────────────────────────────────────
function buildAsteroids() {
  const tierOf = mats => {
    const hasRare     = mats.some(m => MATERIALS[m]?.tier === MATERIAL_TIER.RARE);
    const hasUncommon = mats.some(m => MATERIALS[m]?.tier === MATERIAL_TIER.UNCOMMON);
    return hasRare ? 'rare' : hasUncommon ? 'uncommon' : 'common';
  };
  const riskRange = mats => {
    const max = Math.max(...mats.map(m => MATERIALS[m]?.piracyRisk[1] ?? 0));
    const min = Math.max(...mats.map(m => MATERIALS[m]?.piracyRisk[0] ?? 0));
    return `${min}–${max}`;
  };
  const tierBadgeOf = tier =>
    tier === 'rare'     ? badge('Rare', 'rare') :
    tier === 'uncommon' ? badge('Uncommon', 'uncommon') :
                          badge('Common', 'common');

  const rows = ASTEROIDS.map(a => {
    const tier = tierOf(a.materials);
    return { row: [
      { v: a.name, cls: 'val' },
      `(${a.x}, ${a.y})`,
      a.materials.join(', '),
      tierBadgeOf(tier),
      riskRange(a.materials),
    ], tier };
  });

  const trRows = rows.map(({ row, tier }) => {
    const cells = row.map(c => `<td${c.cls ? ` class="${c.cls}"` : ''}>${c.v ?? c}</td>`).join('');
    return `<tr data-tier="${tier}">${cells}</tr>`;
  }).join('\n        ');

  const content = `
${header('Asteroids', `All ${ASTEROIDS.length} asteroid fields — auto-generated from constants.js`, 'Reference')}

<div class="callout teal">
  This page is <strong>auto-generated</strong>. Run <code>npm run wiki</code> after editing asteroid data in <code>src/constants.js</code>.
</div>

<div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap" id="ast-filters">
  <button class="sort-btn active" onclick="filterAsteroids(this,'all')">All (${ASTEROIDS.length})</button>
  <button class="sort-btn" onclick="filterAsteroids(this,'common')">Common (${rows.filter(r=>r.tier==='common').length})</button>
  <button class="sort-btn" onclick="filterAsteroids(this,'uncommon')">Uncommon (${rows.filter(r=>r.tier==='uncommon').length})</button>
  <button class="sort-btn" onclick="filterAsteroids(this,'rare')">Rare (${rows.filter(r=>r.tier==='rare').length})</button>
</div>

<table class="wiki-table" id="ast-table">
  <thead><tr><th>Name</th><th>Coords</th><th>Materials</th><th>Max Tier</th><th>Risk Range</th></tr></thead>
  <tbody>
    ${trRows}
  </tbody>
</table>

<script src="asteroids-filter.js"></script>`;

  writeFileSync(out('asteroids.html'), page('Asteroids', '', content));
  console.log('✓ asteroids.html');
}

// ── STATIONS ─────────────────────────────────────────────────────────────────
function buildStations() {
  const homeSet = new Set(HOME_ELIGIBLE_STATIONS);
  const rows = STATIONS.map(s => [
    { v: s.name, cls: 'val' },
    `(${s.x}, ${s.y})`,
    homeSet.has(s.name) ? badge('Yes', 'common') : '<span class="dim">—</span>',
  ]);

  const content = `
${header('Stations', `All ${STATIONS.length} space stations — auto-generated from constants.js`, 'Reference')}

<div class="callout teal">
  This page is <strong>auto-generated</strong>. Run <code>npm run wiki</code> after editing station data in <code>src/constants.js</code>.
</div>

${table(['Name', 'Coords', 'Home Eligible'], rows)}`;

  writeFileSync(out('stations.html'), page('Stations', '', content));
  console.log('✓ stations.html');
}

// ── Run all ──────────────────────────────────────────────────────────────────
console.log('Building wiki reference pages...');
buildShips();
buildMaterials();
buildAsteroids();
buildStations();
console.log('Done.');
