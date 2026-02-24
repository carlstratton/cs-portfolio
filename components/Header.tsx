"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import { useTheme } from "@/lib/theme";

export function Header() {
  const { toggle } = useTheme();

  return (
    <header className={styles.header}>
      <div className="page-shell" data-header-shell="true">
        <div className={styles.inner} data-header-inner="true">
          <Link
            href="/"
            className={styles.brand}
            onClick={(e) => {
              e.preventDefault();
              toggle();
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
