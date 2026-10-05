'use strict';
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

// Keep the environment overview compact while allowing stable links to each setting.
const settingDetails = Array.from(document.querySelectorAll('.setting'));
settingDetails.forEach(detail => {
  detail.addEventListener('toggle', () => {
    const video = detail.querySelector('video');
    if (!detail.open) { if (video) video.pause(); return; }
    settingDetails.forEach(other => { if (other !== detail) other.open = false; });
    if (video && !document.hidden && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.play().catch(() => { /* Native controls remain available. */ });
    }
  });
});
function revealLinkedSetting() {
  const detail = document.getElementById(location.hash.slice(1));
  if (detail && detail.tagName === 'DETAILS') {
    detail.open = true;
    requestAnimationFrame(() => detail.scrollIntoView({block: 'start'}));
  }
}
window.addEventListener('hashchange', revealLinkedSetting);
revealLinkedSetting();
