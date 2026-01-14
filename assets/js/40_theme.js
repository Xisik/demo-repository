(function () {
  const KEY = "theme"; // "light" | "dark"
  const root = document.documentElement;

  function getPreferredTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function getStoredTheme() {
    const v = localStorage.getItem(KEY);
    return (v === "light" || v === "dark") ? v : null;
  }

  function setTheme(theme, persist) {
    root.setAttribute("data-theme", theme);

    const btn = document.querySelector("[data-theme-toggle]");
    if (btn) {
      const isDark = theme === "dark";
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      // 현재 상태를 토글의 "다음 동작"으로 표기
      btn.textContent = isDark ? "\udb80\udce0" : "\udb80\udcdb";
    }

    if (persist) localStorage.setItem(KEY, theme);
  }

  function init() {
    const stored = getStoredTheme();
    const initial = stored || getPreferredTheme();
    setTheme(initial, false);

    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      setTheme(next, true);
    });
  }

  init();
})();
