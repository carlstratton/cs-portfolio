"use client";

import styles from "./Header.module.css";

const STORAGE_KEY = "carl-theme";

export function Header() {
  const handleBrandClick = () => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const next = stored === "light" ? "dark" : "light";
    window.localStorage.setItem(STORAGE_KEY, next);
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  return (
    <header className={styles.header}>
      <div className="page-shell" data-header-shell="true">
        <div className={styles.inner} data-header-inner="true">
          <a
            href="/"
            className={styles.brand}
            onClick={handleBrandClick}
          >
            Carl Stratton
          </a>
          <span className={styles.tagline}>Product, Design, Applied AI</span>
        </div>
      </div>
    </header>
  );
}
