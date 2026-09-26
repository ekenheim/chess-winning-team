// Central animation registry for frameloop="demand": whoever animates holds a key, and the SceneInvalidator
// keeps requesting frames while any key is held. Nothing else calls invalidate() in a loop.
let invalidateFn: (() => void) | null = null;
const keys = new Set<string>();

export function bindInvalidate(fn: () => void): void {
  invalidateFn = fn;
}

export function startAnim(key: string): void {
  keys.add(key);
  invalidateFn?.();
}

export function endAnim(key: string): void {
  keys.delete(key);
}

export function endAnimsWithPrefix(prefix: string): void {
  for (const k of keys) if (k.startsWith(prefix)) keys.delete(k);
}

export function isAnimating(): boolean {
  return keys.size > 0;
}

/** Ask for one frame without holding a key (e.g. a texture finished loading). */
export function requestFrame(): void {
  invalidateFn?.();
}

export const frameStats: { count: number } = { count: 0 };
