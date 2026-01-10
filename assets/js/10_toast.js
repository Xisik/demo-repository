(function () {
  const ui = window.__ui;
  if (!ui) return;

  function showToast(message) {
    const toast = ui.$("#toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-show");

    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toast.classList.remove("is-show");
    }, 2200);
  }

  ui.showToast = showToast;
})();
