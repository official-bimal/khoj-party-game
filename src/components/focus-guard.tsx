"use client";
import { useEffect } from "react";
export function FocusGuard() {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const node = document.querySelector(
      ".modal-backdrop",
    ) as HTMLElement | null;
    node
      ?.querySelector<HTMLElement>(
        "button:not(:disabled),input,select,textarea",
      )
      ?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !node) return;
      const items = [
        ...node.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input,select,textarea,[tabindex="0"]',
        ),
      ].filter((el) => el.offsetParent !== null);
      const first = items[0],
        last = items.at(-1);
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !node.contains(document.activeElement))
      ) {
        e.preventDefault();
        last?.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          !node.contains(document.activeElement))
      ) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return null;
}
