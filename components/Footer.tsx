import Link from "next/link";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="page-shell">
        <div className={styles.inner}>
          <div className={styles.meta}>
            <span className={styles.brand}>Carl Stratton</span>
            <p>Product design & strategy. Based in London.</p>
          </div>
          <div className={styles.links}>
            <Link href="mailto:hello@ccaarrll.com">Email</Link>
            <Link href="https://www.linkedin.com" target="_blank">
              LinkedIn
            </Link>
            <Link href="/#about">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
