'use strict';
const measuredConditions = {mass: [0.5271, 0.3075], both: [0.0709, 0.9249]};
document.querySelectorAll('[data-relation]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-relation]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    const values = measuredConditions[button.dataset.relation];
    ['mass', 'drag'].forEach((factor, i) => {
      document.getElementById(`${factor}-value`).textContent = values[i].toFixed(4);
      document.getElementById(`${factor}-bar`).style.setProperty('--w', `${values[i] * 100}%`);
    });
  });
});
const tabs = Array.from(document.querySelectorAll('[data-env]'));
function selectEnvironment(tab, focus = false) {
  tabs.forEach(other => {
    const selected = other === tab;
    other.setAttribute('aria-selected', String(selected));
    other.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(other.getAttribute('aria-controls'));
    panel.hidden = !selected;
    if (!selected) panel.querySelectorAll('video').forEach(video => video.pause());
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectEnvironment(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectEnvironment(tabs[next], true); }
  });
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) document.querySelectorAll('video').forEach(video => video.pause());
});
document.getElementById('copy-citation').addEventListener('click', async () => {
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(document.getElementById('bibtex').textContent);
    status.textContent = 'Citation copied.';
  } catch {
    status.textContent = 'Select the citation above to copy it.';
  }
});
