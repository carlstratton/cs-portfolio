"use client";

import Link from "next/link";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className="page-shell" data-header-shell="true">
        <div className={styles.inner} data-header-inner="true">
          <Link
            href="/"
            className={styles.brand}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Carl Stratton
          </Link>
          <span className={styles.tagline}>Product, Design, Applied AI</span>
        </div>
      </div>
    </header>
  );
}
