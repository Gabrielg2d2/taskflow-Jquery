export type DSChild =
  | Node
  | string
  | number
  | boolean
  | null
  | undefined
  | DSChild[];

export type DSAttrs = Record<string, any> & {
  class?: string;
  className?: string;
  style?: Partial<CSSStyleDeclaration> | string;
};

function isNode(x: any): x is Node {
  return x && typeof x === "object" && "nodeType" in x;
}

function flat(children: DSChild[], out: Array<Node | string> = []) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) flat(c, out);
    else if (isNode(c)) out.push(c);
    else out.push(String(c));
  }
  return out;
}

function setStyle(el: HTMLElement, style: DSAttrs["style"]) {
  if (!style) return;
  if (typeof style === "string") {
    el.setAttribute("style", style);
    return;
  }
  for (const [k, v] of Object.entries(style)) {
    if (v === undefined || v === null) continue;
    // @ts-expect-error dynamic style assignment
    el.style[k] = String(v);
  }
}

function setAttr(el: HTMLElement, key: string, value: any) {
  if (value === undefined || value === null) return;

  // events: onClick, onInput, onKeyDown...
  if (key.startsWith("on") && typeof value === "function") {
    const eventName = key.slice(2).toLowerCase();
    el.addEventListener(eventName, value);
    return;
  }

  if (key === "className" || key === "class") {
    el.className = String(value);
    return;
  }

  if (key === "style") {
    setStyle(el, value);
    return;
  }

  // prefer property if exists (id, value, checked, disabled, etc.)
  if (key in el) {
    try {
      // @ts-expect-error dynamic assignment
      el[key] = value;
      return;
    } catch {}
  }

  el.setAttribute(key, String(value));
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: DSAttrs | null,
  ...children: DSChild[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (attrs) {
    // merge class/className
    const cls = [attrs.className, attrs.class].filter(Boolean).join(" ");
    if (cls) el.className = cls;

    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class" || k === "className") continue;
      setAttr(el as any, k, v);
    }
  }

  const nodes = flat(children);
  for (const n of nodes) {
    if (typeof n === "string") el.appendChild(document.createTextNode(n));
    else el.appendChild(n);
  }

  return el;
}
