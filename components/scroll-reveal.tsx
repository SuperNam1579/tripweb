"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fades + slides an element up into place the first time it scrolls into
 * view — the scroll-triggered counterpart to the page-load `.reveal` class.
 * Fires once per element (no re-hide on scroll back up, no per-frame
 * parallax) and respects prefers-reduced-motion via the `.scroll-reveal` CSS.
 */
export function ScrollReveal({
  children,
  delayMs = 0,
  className,
}: {
  children: React.ReactNode;
  /** Stagger delay for sibling items revealing together, e.g. a list. */
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${visible ? "is-visible" : ""} ${className ?? ""}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
