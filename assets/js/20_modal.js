(function () {
  const ui = window.__ui;
  if (!ui) return;

  function openModal(modalId) {
    const modal = ui.$("#" + modalId);
    if (!modal) return;

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    const focusable = modal.querySelector("button, a, input, [tabindex]:not([tabindex='-1'])");
    if (focusable) focusable.focus();
  }

  function closeModal(modalId) {
    const modal = ui.$("#" + modalId);
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function wireMemberDiffModal() {
    ui.$all("[data-open-modal='memberDiff']").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openModal("memberDiffModal");

        if (ui.showToast) ui.showToast("회원 구분 안내를 열었다.");
      });
    });

    ui.$all("[data-close-modal='memberDiff']").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal("memberDiffModal");
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal("memberDiffModal");
    });
  }

  ui.modal = {
    openModal,
    closeModal,
    wireMemberDiffModal
  };
})();
