"use client";

import Image from "next/image";
import styles from "./HomeAboutPanel.module.css";

const EMAIL = "cgstratton+website@gmail.com";
const MAILTO = `mailto:${EMAIL}`;

export function HomeAboutPanel() {
  return (
    <article className={styles.panel}>
      <div className={styles.imageWrap}>
        <Image
          src="/about-carl-whiteboard.png"
          alt="Carl at a whiteboard during a design session"
          width={750}
          height={500}
          quality={100}
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <p className={styles.intro}>
          Product design rooted in curiosity, user-centricity, and delightfulness.
        </p>

        <p>
          As a start-up founder and designer, Carl has spent much of his career working
          alongside small teams building new products and businesses, whilst
          collaborating with friends, colleagues, founders, and engineers who share a
          curiosity for new ideas and care about building thoughtful, well-considered
          products.
        </p>

        <section className={styles.section}>
          <h2 className={styles.heading}>Background</h2>
          <p>
            A hip-hop kid with a love for technology, turned design graduate. Carl was
            exposed to the London start-up scene in 2010, and has been designing
            interfaces and digital experience ever since. He led design at numerous
            start-ups including Farfetch and Seedrs, and has advised organisations
            including Workspace, Vodafone, and the NHS on digital strategy and product
            experience.
          </p>
          <p>
            As a founder-builder, Carl founded Emblzn (2013) and Shoesie (2018), both of
            which went through accelerator programmes including{" "}
            <a href="https://www.ignite.io/" target="_blank" rel="noreferrer">
              Ignite
            </a>
            . Emblzn later won UK Innovate&apos;s Digital Innovation Award for mass
            customisation.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>What Carl Does</h2>
          <p>
            The projects Carl works on typically involve strategy, research,
            problem-solving, and testing, to deliver meaningful digital solutions. They
            combine business thinking with product craft and interface design to shape
            clear, useful experiences for the people using them.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>Applied AI Product Design</h2>
          <p>
            Over the past few years, Carl has increasingly integrated AI into his product
            workflow, using agentic tools to design, prototype, and validate ideas.
          </p>
          <p>
            He has built and released multiple production iOS products, most recently
            working with a small group of friends to launch{" "}
            <a
              href="https://apps.apple.com/us/app/totl-top-of-the-league/id6754661450"
              target="_blank"
              rel="noreferrer"
            >
              TotL
            </a>
            , Top of the League, a social football predictions app built across web and
            React Native, including user accounts, game mechanics, leaderboards, social
            groups, notifications, and third-party data integrations.
          </p>
        </section>

        <p>
          Thanks for taking the time to read. If you&apos;re working on something
          interesting, feel free to get in touch and say hello.
        </p>

        <div className={styles.links}>
          <a href={MAILTO}>Email</a>
          <a
            href="https://www.linkedin.com/in/cgstratton/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </article>
  );
}
