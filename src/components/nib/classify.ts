import type { Kind } from "./nibBrain";

export function classify(target: EventTarget | null): { kind: Kind; el: Element | null } {
  if (!(target instanceof Element)) return { kind: "none", el: null };
  let el: Element | null;
  if ((el = target.closest('[disabled],[aria-disabled="true"],[data-nib="disabled"]'))) return { kind: "disabled", el };
  if ((el = target.closest('input,textarea,select,[contenteditable="true"],[data-nib="native"]'))) return { kind: "native", el };
  if ((el = target.closest('[data-nib="drag"]'))) return { kind: "drag", el };
  if ((el = target.closest('a[href],button,summary,[role="button"],[role="link"],[data-nib="link"]'))) return { kind: "link", el };
  if ((el = target.closest('p,li,h1,h2,h3,h4,blockquote,figcaption,[data-nib="read"]'))) return { kind: "text", el };
  return { kind: "none", el: null };
}
