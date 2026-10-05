import { useEffect, useRef, useCallback } from 'react';

/**
 * Manages the floating navbar:
 *  - `is-scrolled` on the header when scrollY > 24
 *  - `is-active` / aria-current on the nav link whose section is in view
 *
 * Usage:
 *   const headerRef = useNavScroll(linkRefs);
 *   <header ref={headerRef} …>
 */
export default function useNavScroll(linkRefs) {
  const headerRef = useRef(null);
  const ticking = useRef(false);

  const update = useCallback(() => {
    const header = headerRef.current;
    if (!header) return;

    const y = window.scrollY || window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 24);

    // Collect live link elements and their target sections.
    const pairs = (linkRefs.current || [])
      .map(a => {
        if (!a) return null;
        const href = a.getAttribute('href');
        if (!href || href.charAt(0) !== '#') return null;
        const section = document.getElementById(href.slice(1));
        return section ? { link: a, section } : null;
      })
      .filter(Boolean);

    if (!pairs.length) return;

    const ordered = pairs
      .map(p => ({ ...p, top: p.section.getBoundingClientRect().top + y }))
      .sort((a, b) => a.top - b.top);

    const line = y + 140;
    let current = ordered[0].section;
    for (const item of ordered) {
      if (item.top <= line) current = item.section;
    }

    const atBottom = window.innerHeight + y >= document.body.offsetHeight - 4;
    if (atBottom) current = ordered[ordered.length - 1].section;

    pairs.forEach(({ link, section }) => {
      const isActive = section === current;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }, [linkRefs]);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        update();
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, [update]);

  return headerRef;
}
