// Applies the saved theme before Angular boots to avoid a flash of the wrong theme.
(function () {
  try {
    var s = JSON.parse(localStorage.getItem('lingora.theme') || '{}');
    var mode = s.mode || 'system';
    if (mode === 'system') mode = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var el = document.documentElement;
    el.setAttribute('data-mode', mode);
    el.setAttribute('data-palette', s.palette || 'indigo');
    if (s.fontScale) el.style.setProperty('--font-scale', String(s.fontScale));
    var loc = localStorage.getItem('lingora.locale');
    if (loc) el.setAttribute('lang', loc);
  } catch (e) {}
})();
