import { useRef, useState, useCallback, useEffect } from 'react';
import useScrollReveal from '../hooks/useScrollReveal.js';
import useStore from '../hooks/useStore.js';
import { DEFAULT_FAQ, normalizeFaqItems } from '../data/faqDefaults.js';

function FaqItem({ item, isOpen, onToggle }) {
  const panelRef = useRef(null);
  const timerRef = useRef(null);
  const endHandlerRef = useRef(null);

  // Animate height on open/close
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Clear any pending settle
    if (endHandlerRef.current) panel.removeEventListener('transitionend', endHandlerRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (isOpen) {
      panel.hidden = false;
      if (prefersReduced) { panel.style.height = 'auto'; return; }

      const to = panel.scrollHeight;
      panel.style.height = panel.offsetHeight + 'px';
      void panel.offsetHeight;
      panel.style.height = to + 'px';

      const settle = () => { panel.style.height = 'auto'; };
      endHandlerRef.current = e => { if (e.propertyName !== 'height') return; settle(); };
      panel.addEventListener('transitionend', endHandlerRef.current);
      const ms = (parseFloat(getComputedStyle(panel).transitionDuration) || 0) * 1000;
      timerRef.current = setTimeout(settle, ms + 90);
    } else {
      if (prefersReduced) { panel.style.height = ''; panel.hidden = true; return; }

      const from = panel.offsetHeight;
      if (from === 0) { panel.hidden = true; panel.style.height = ''; return; }

      panel.style.height = from + 'px';
      void panel.offsetHeight;
      panel.style.height = '0px';

      const settle = () => { panel.hidden = true; panel.style.height = ''; };
      endHandlerRef.current = e => { if (e.propertyName !== 'height') return; settle(); };
      panel.addEventListener('transitionend', endHandlerRef.current);
      const ms = (parseFloat(getComputedStyle(panel).transitionDuration) || 0) * 1000;
      timerRef.current = setTimeout(settle, ms + 90);
    }
  }, [isOpen]);

  return (
    <div className={`faq__item${item.placeholder ? ' faq__item--placeholder' : ''}${isOpen ? ' is-open' : ''} reveal`}>
      <h3 className="faq__heading">
        <button
          className="faq__trigger"
          type="button"
          id={`faq-${item.id}`}
          aria-expanded={isOpen}
          aria-controls={`faq-panel-${item.id}`}
          onClick={onToggle}
        >
          <span className="faq__question">{item.question}</span>
          <span className="faq__icon" aria-hidden="true"></span>
        </button>
      </h3>
      <div
        className="faq__panel"
        id={`faq-panel-${item.id}`}
        role="region"
        aria-labelledby={`faq-${item.id}`}
        ref={panelRef}
        hidden
      >
        <div className="faq__answer"><p>{item.answer}</p></div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const ref = useRef(null);
  const [openId, setOpenId] = useState(null);
  const [faq] = useStore('faq', DEFAULT_FAQ);
  useScrollReveal(ref);

  const toggle = useCallback((id) => {
    setOpenId(prev => prev === id ? null : id);
  }, []);
  const faqItems = normalizeFaqItems(faq);

  return (
    <section className="section section--alt" id="faq" aria-labelledby="faq-title" ref={ref}>
      <div className="shell shell--narrow">
        <header className="section-head reveal">
          <p className="eyebrow">Before You Join</p>
          <h2 className="section-title" id="faq-title">Frequently Asked Questions</h2>
        </header>

        <div className="faq">
          {faqItems.map(item => (
            <FaqItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
