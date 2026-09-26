import { useEffect, useState } from "react";

export type Route =
  | { view: "ladder" }
  | { view: "library"; run?: string }
  | { view: "replay"; run: string; file: string; ply?: number };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  if (parts[0] === "replay" && parts[1] && parts[2]) {
    const ply = parts[3] ? parseInt(parts[3], 10) : NaN;
    return { view: "replay", run: parts[1], file: parts[2], ply: Number.isFinite(ply) ? ply : undefined };
  }
  if (parts[0] === "library") return { view: "library", run: parts[1] };
  return { view: "ladder" };
}

export function href(route: Route): string {
  switch (route.view) {
    case "ladder":
      return "#/";
    case "library":
      return route.run ? `#/library/${encodeURIComponent(route.run)}` : "#/library";
    case "replay":
      return `#/replay/${encodeURIComponent(route.run)}/${encodeURIComponent(route.file)}${route.ply != null ? `/${route.ply}` : ""}`;
  }
}

export function navigate(route: Route) {
  window.location.hash = href(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
