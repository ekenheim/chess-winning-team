// URL flags, capability gates and the render tier. Imports nothing from three so the 2D bundle stays small.
export type Tier = "high" | "low";

export function urlFlag(name: string): string | null {
  try {
    return new URLSearchParams(location.search).get(name);
  } catch {
    return null;
  }
}

let webgl2: boolean | null = null;
export const supportsWebGL2 = (): boolean => {
  if (webgl2 != null) return webgl2;
  try {
    const c = document.createElement("canvas");
    const ctx = c.getContext("webgl2");
    webgl2 = !!ctx;
    ctx?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl2 = false;
  }
  return webgl2;
};

/** `?gl=low|high` wins; else high. Board3D downgrades to low at runtime on a software renderer when `?gl` is absent. */
export function initialTier(): Tier {
  const f = urlFlag("gl");
  return f === "low" ? "low" : "high";
}

export function reducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}
