import { useState, useEffect } from 'react';

export type ViewportSize = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

interface ViewportState {
  width: number;
  height: number;
  size: ViewportSize;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  aspectRatio: string;
}

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
};

function getViewportSize(width: number): ViewportSize {
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

function getOrientation(width: number, height: number): Orientation {
  return width > height ? 'landscape' : 'portrait';
}

function getAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const w = width / divisor;
  const h = height / divisor;

  if (Math.abs(w / h - 16 / 9) < 0.1) return '16:9';
  if (Math.abs(w / h - 9 / 16) < 0.1) return '9:16';
  if (Math.abs(w / h - 4 / 3) < 0.1) return '4:3';
  if (Math.abs(w / h - 1) < 0.1) return '1:1';

  return `${w}:${h}`;
}

export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const size = getViewportSize(width);
    const orientation = getOrientation(width, height);
    const aspectRatio = getAspectRatio(width, height);

    return {
      width,
      height,
      size,
      orientation,
      isMobile: size === 'mobile',
      isTablet: size === 'tablet',
      isDesktop: size === 'desktop',
      aspectRatio,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const size = getViewportSize(width);
      const orientation = getOrientation(width, height);
      const aspectRatio = getAspectRatio(width, height);

      setViewport({
        width,
        height,
        size,
        orientation,
        isMobile: size === 'mobile',
        isTablet: size === 'tablet',
        isDesktop: size === 'desktop',
        aspectRatio,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}
