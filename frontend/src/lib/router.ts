import { useEffect, useState } from "react";

const read = () => {
  const h = window.location.hash.replace(/^#/, "");
  return h || "/";
};

export function useRoute() {
  const [path, setPath] = useState(read);
  useEffect(() => {
    const on = () => setPath(read());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return path;
}

export function navigate(path: string, opts?: { replace?: boolean }) {
  if (opts?.replace) {
    window.history.replaceState(null, "", `#${path}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = path;
  }
  window.scrollTo({ top: 0 });
}

export function goBack(fallback = "/app") {
  if (window.history.length > 1) window.history.back();
  else navigate(fallback);
}

/** Przekierowanie wykonywane po renderze (bez aktualizacji stanu w trakcie renderowania). */
export function Redirect({ to }: { to: string }) {
  useEffect(() => {
    navigate(to, { replace: true });
  }, [to]);
  return null;
}

/** Dopasowuje ścieżkę do wzorca, np. '/app/meeting/:id'. */
export function match(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split("/");
  const a = path.split("?")[0].split("/");
  if (p.length !== a.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) params[p[i].slice(1)] = decodeURIComponent(a[i]);
    else if (p[i] !== a[i]) return null;
  }
  return params;
}
