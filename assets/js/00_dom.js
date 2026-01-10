(function () {
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  window.__ui = window.__ui || {};
  window.__ui.$ = $;
  window.__ui.$all = $all;
})();
