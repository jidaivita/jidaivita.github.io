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

// Progressive enhancement: native controls remain when JavaScript is unavailable.
// A light toolbar avoids placing a dark browser overlay on the scientific scene.
document.querySelectorAll('.setting-media video').forEach(video => {
  const controls = document.createElement('div');
  controls.className = 'media-controls';
  const play = document.createElement('button');
  play.type = 'button';
  play.textContent = 'Play';
  const seek = document.createElement('input');
  seek.type = 'range'; seek.min = '0'; seek.max = '100'; seek.step = '0.1'; seek.value = '0';
  seek.setAttribute('aria-label', 'Video progress');
  const time = document.createElement('span');
  time.className = 'media-time';
  const expand = document.createElement('button');
  expand.type = 'button'; expand.textContent = 'Enlarge';
  const figure = video.closest('figure');
  const format = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  function update() {
    play.textContent = video.paused ? 'Play' : 'Pause';
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    seek.disabled = !duration;
    seek.value = duration ? String(video.currentTime / duration * 100) : '0';
    time.textContent = duration ? `${format(video.currentTime)} / ${format(duration)}` : '0:00';
    seek.setAttribute('aria-valuetext', time.textContent);
  }
  play.addEventListener('click', () => {
    if (video.paused) video.play().catch(update); else video.pause();
  });
  seek.addEventListener('input', () => {
    if (Number.isFinite(video.duration)) video.currentTime = Number(seek.value) / 100 * video.duration;
  });
  let previousOverflow = '';
  function closeEnlarged() {
    if (!figure.classList.contains('is-enlarged')) return;
    figure.classList.remove('is-enlarged');
    figure.removeAttribute('role'); figure.removeAttribute('aria-modal'); figure.removeAttribute('aria-label');
    document.body.style.overflow = previousOverflow;
    expand.textContent = 'Enlarge';
    expand.focus();
  }
  expand.addEventListener('click', () => {
    if (figure.classList.contains('is-enlarged')) { closeEnlarged(); return; }
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    figure.classList.add('is-enlarged');
    figure.setAttribute('role', 'dialog'); figure.setAttribute('aria-modal', 'true');
    figure.setAttribute('aria-label', video.closest('.setting').querySelector('summary strong').textContent + ' video');
    expand.textContent = 'Close';
    expand.focus();
  });
  figure.addEventListener('keydown', event => {
    if (!figure.classList.contains('is-enlarged')) return;
    if (event.key === 'Escape') { event.preventDefault(); closeEnlarged(); }
    if (event.key === 'Tab') {
      const items = Array.from(figure.querySelectorAll('button, input:not(:disabled), a'));
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  video.closest('.setting').addEventListener('toggle', event => {
    if (!event.target.open) closeEnlarged();
  });
  for (const event of ['play','pause','timeupdate','loadedmetadata','durationchange','ended']) video.addEventListener(event, update);
  controls.append(play, seek, time, expand);
  video.after(controls);
  video.controls = false;
  update();
});
