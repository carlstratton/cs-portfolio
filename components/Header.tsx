import Link from "next/link";
import styles from "./Header.module.css";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className={styles.header}>
      <div className="page-shell" data-header-shell="true">
        <div className={styles.inner} data-header-inner="true">
          <Link href="/" className={styles.brand}>
            <span>Carl Stratton</span>
          </Link>
          <nav className={styles.nav}>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
