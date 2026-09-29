import { useEffect } from 'react';

/**
 * Attach an IntersectionObserver to all `.reveal` elements inside a given
 * container ref. Once an element enters the viewport it gains `is-visible`
 * and is unobserved (fire-once, mirrors the vanilla JS behaviour).
 *
 * Siblings inside the same parent grid receive a staggered `--reveal-delay`
 * CSS custom property so a row of cards arrives like a small swell.
 *
 * Pass a ref to the section root element (or null to skip).
 */
export default function useScrollReveal(containerRef) {
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = Array.from(container.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    // Stagger siblings in the same parent.
    items.forEach(el => {
      const siblings = Array.from(el.parentElement.querySelectorAll('.reveal'))
        .filter(node => node.parentElement === el.parentElement);
      const index = siblings.indexOf(el);
      if (index > 0) el.style.setProperty('--reveal-delay', Math.min(index, 5) * 90 + 'ms');
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef]);
}
