import { loadJSON, saveJSON } from "@/lib/storage";

export type Visitor = { visits: number; first: number; name: string };

export function touchVisitor(): Visitor {
  const v = loadJSON<Visitor>("nib:visitor", { visits: 0, first: Date.now(), name: "" });
  let counted = false;
  try {
    counted = !!sessionStorage.getItem("nib:session");
    sessionStorage.setItem("nib:session", "1");
  } catch {}
  if (!counted) {
    v.visits += 1;
    saveJSON("nib:visitor", v);
  }
  return v;
}

export function rememberName(name: string) {
  const clean = name.trim().slice(0, 24);
  if (!clean) return;
  const v = loadJSON<Visitor>("nib:visitor", { visits: 1, first: Date.now(), name: "" });
  v.name = clean;
  saveJSON("nib:visitor", v);
}
