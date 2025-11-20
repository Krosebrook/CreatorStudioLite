import { useState, useEffect, useCallback, useRef } from 'react';

export type AnimationState = 'idle' | 'animating' | 'paused' | 'completed';
export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring' | 'bounce';

interface AnimationConfig {
  duration?: number;
  delay?: number;
  easing?: EasingFunction;
  loop?: boolean;
  autoPlay?: boolean;
}

interface AnimationControls {
  state: AnimationState;
  progress: number;
  play: () => void;
  pause: () => void;
  reset: () => void;
  seek: (progress: number) => void;
}

const easingFunctions: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  spring: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    }
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

export function useAnimation(config: AnimationConfig = {}): AnimationControls {
  const {
    duration = 1000,
    delay = 0,
    easing = 'easeInOut',
    loop = false,
    autoPlay = false,
  } = config;

  const [state, setState] = useState<AnimationState>(autoPlay ? 'animating' : 'idle');
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp + delay;
      }

      const elapsed = timestamp - startTimeRef.current;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFunctions[easing](rawProgress);

      setProgress(easedProgress);

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setState('completed');
        if (loop) {
          startTimeRef.current = null;
          setState('animating');
          rafRef.current = requestAnimationFrame(animate);
        }
      }
    },
    [duration, delay, easing, loop]
  );

  const play = useCallback(() => {
    if (state === 'completed') {
      setProgress(0);
      startTimeRef.current = null;
    }
    setState('animating');
  }, [state]);

  const pause = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setState('paused');
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setProgress(0);
    startTimeRef.current = null;
    setState('idle');
  }, []);

  const seek = useCallback((seekProgress: number) => {
    setProgress(Math.max(0, Math.min(1, seekProgress)));
  }, []);

  useEffect(() => {
    if (state === 'animating') {
      rafRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [state, animate]);

  return { state, progress, play, pause, reset, seek };
}

export function useSequenceAnimation(scenes: AnimationConfig[]) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const animation = useAnimation({
    ...scenes[currentScene],
    autoPlay: isPlaying,
  });

  useEffect(() => {
    if (animation.state === 'completed' && currentScene < scenes.length - 1) {
      setCurrentScene((prev) => prev + 1);
      animation.reset();
      if (isPlaying) {
        animation.play();
      }
    }
  }, [animation.state, currentScene, scenes.length, isPlaying]);

  const playSequence = useCallback(() => {
    setIsPlaying(true);
    animation.play();
  }, [animation]);

  const pauseSequence = useCallback(() => {
    setIsPlaying(false);
    animation.pause();
  }, [animation]);

  const resetSequence = useCallback(() => {
    setCurrentScene(0);
    setIsPlaying(false);
    animation.reset();
  }, [animation]);

  return {
    currentScene,
    sceneProgress: animation.progress,
    totalProgress: (currentScene + animation.progress) / scenes.length,
    isPlaying,
    playSequence,
    pauseSequence,
    resetSequence,
  };
}
