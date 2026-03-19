"use client";

import styles from "./Header.module.css";

const STORAGE_KEY = "carl-theme";

export function Header() {
  const handleBrandClick = () => {
    window.localStorage.setItem(STORAGE_KEY, "light");
    document.documentElement.removeAttribute("data-theme");
    if (window.location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
