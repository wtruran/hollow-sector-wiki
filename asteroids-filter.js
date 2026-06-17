function filterAsteroids(btn, tier) {
  document.querySelectorAll('#ast-filters .sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#ast-table tbody tr').forEach(row => {
    row.style.display = (tier === 'all' || row.dataset.tier === tier) ? '' : 'none';
  });
}
