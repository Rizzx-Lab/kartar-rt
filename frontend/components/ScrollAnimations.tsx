'use client';

import { useEffect, useRef } from 'react';

export default function ScrollAnimations() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const animateElements = () => {
      const elements = document.querySelectorAll('.scroll-fade-in, .scroll-fade-in-left, .scroll-fade-in-right, .scroll-fade-in-scale');
      elements.forEach((el) => {
        if (!el.classList.contains('visible')) {
          observerRef.current?.observe(el);
        }
      });
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Initial observation
    animateElements();

    // Also observe when DOM changes (for dynamic content)
    const mutationObserver = new MutationObserver(() => {
      animateElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}