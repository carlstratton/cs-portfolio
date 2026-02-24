"use client";

import styles from "./Assistant.module.css";
import type { CSSProperties } from "react";

export type AssistantIntent = "projects" | "about" | "contact";

const SUGGESTIONS: Array<{ label: string; intent: AssistantIntent }> = [
  { label: "See selected projects", intent: "projects" },
  { label: "Tell me about Carl", intent: "about" },
  { label: "Make contact", intent: "contact" },
];

interface Props {
  docked?: boolean;
  transitioning?: boolean;
  activeIntent?: AssistantIntent | null;
  disabledIntents?: AssistantIntent[];
  onSelect?: (data: {
    intent: AssistantIntent;
    label: string;
    sourceEl: HTMLButtonElement;
  }) => void;
}

export function Assistant({
  docked = false,
  transitioning = false,
  activeIntent = null,
  disabledIntents = [],
  onSelect,
}: Props) {
  return (
    <div
      className={styles.assistant}
      aria-label="Site assistant"
      data-docked={docked}
      data-transitioning={transitioning}
    >
      <div className={styles.prompt} aria-hidden={docked}>
        Where would you like to start?
      </div>

      <div className={styles.suggestions} aria-label="Suggestions">
        {SUGGESTIONS.map((s, index) => (
          (() => {
            const disabled = disabledIntents.includes(s.intent);
            return (
          <button
            key={s.intent}
            type="button"
            className={[
              styles.suggestion,
              transitioning && s.intent === activeIntent ? styles.suggestionActive : "",
              transitioning && s.intent !== activeIntent ? styles.suggestionHidden : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              {
                "--chip-delay": `${220 + index * 220}ms`,
              } as CSSProperties
            }
            data-intent={s.intent}
            data-assistant-active={transitioning && s.intent === activeIntent ? "true" : "false"}
            aria-label={s.label}
            title={s.label}
            disabled={disabled}
            onClick={(e) =>
              onSelect?.({
                intent: s.intent,
                label: s.label,
                sourceEl: e.currentTarget,
              })
            }
          >
            {s.label}
          </button>
            );
          })()
        ))}
      </div>
    </div>
  );
}

