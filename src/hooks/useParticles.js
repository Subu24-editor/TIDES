import { useEffect } from 'react';

function random(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Populates a container element (via ref) with particle <span> nodes
 * that drift upward via CSS animations.
 *
 * Re-renders when the reduced-motion preference changes.
 */
export default function useParticles(hostRef) {
  useEffect(() => {
    const host = hostRef?.current;
    if (!host) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function render() {
      host.innerHTML = '';
      if (motionQuery.matches) return;

      const count = window.innerWidth < 720 ? 12 : 22;
      for (let i = 0; i < count; i++) {
        const mote = document.createElement('span');
        const size = random(1.2, 3.2);
        mote.style.left = random(0, 100) + '%';
        mote.style.setProperty('--size', size.toFixed(2) + 'px');
        mote.style.setProperty('--dur', random(26, 58).toFixed(1) + 's');
        mote.style.setProperty('--delay', (-random(0, 50)).toFixed(1) + 's');
        mote.style.setProperty('--drift', random(-70, 70).toFixed(0) + 'px');
        mote.style.setProperty('--peak', random(0.18, 0.55).toFixed(2));
        host.appendChild(mote);
      }
    }

    render();

    const handler = () => render();
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handler);
    } else {
      motionQuery.addListener(handler);
    }

    return () => {
      if (typeof motionQuery.removeEventListener === 'function') {
        motionQuery.removeEventListener('change', handler);
      } else {
        motionQuery.removeListener(handler);
      }
    };
  }, [hostRef]);
}
