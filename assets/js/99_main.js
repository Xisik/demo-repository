(function () {
  const ui = window.__ui;
  if (!ui) return;

  function init() {
    if (ui.modal && ui.modal.wireMemberDiffModal) ui.modal.wireMemberDiffModal();
  }

  init();
})();
