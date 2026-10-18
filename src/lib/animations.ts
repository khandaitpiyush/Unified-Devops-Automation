import { gsap } from 'gsap';

export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function animateFadeIn(
  element: HTMLElement | null | (HTMLElement | null)[],
  options: { delay?: number; duration?: number; y?: number } = {}
) {
  if (!element || isReducedMotion()) return;
  const { delay = 0, duration = 0.45, y = 14 } = options;
  gsap.fromTo(
    element,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: 'power2.out',
      clearProps: 'transform',
    }
  );
}

export function animateStagger(
  elements: (HTMLElement | null | Element)[] | NodeListOf<Element> | HTMLCollection | string,
  options: { stagger?: number; duration?: number; y?: number; delay?: number } = {}
) {
  if (isReducedMotion()) return;
  const { stagger = 0.06, duration = 0.4, y = 12, delay = 0 } = options;
  gsap.fromTo(
    elements,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      stagger,
      delay,
      ease: 'power2.out',
      clearProps: 'transform',
    }
  );
}

export function animateModalEntrance(element: HTMLElement | null) {
  if (!element || isReducedMotion()) return;
  gsap.fromTo(
    element,
    { opacity: 0, scale: 0.97, y: 8 },
    {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.28,
      ease: 'power2.out',
    }
  );
}
