/**
 * Gera CSS automaticamente para classes com valores arbitrários.
 * Ex: h-[400px], w-[200px], p-[1rem], rounded-[12px]
 *
 * Uso: importar e chamar initArbitraryStyles() no início da aplicação.
 */

const PROPERTY_MAP: Record<string, string> = {
  h: "height",
  w: "width",
  "min-h": "min-height",
  "max-h": "max-height",
  "min-w": "min-width",
  "max-w": "max-width",
  p: "padding",
  px: "padding-inline",
  py: "padding-block",
  pt: "padding-top",
  pb: "padding-bottom",
  pl: "padding-left",
  pr: "padding-right",
  m: "margin",
  mx: "margin-inline",
  my: "margin-block",
  mt: "margin-top",
  mb: "margin-bottom",
  ml: "margin-left",
  mr: "margin-right",
  gap: "gap",
  rounded: "border-radius",
  text: "font-size",
  leading: "line-height",
  tracking: "letter-spacing",
};

const ARBITRARY_PATTERN = /([a-z][a-z0-9-]*)-\[([^\]]+)\]/g;

function parseValue(value: string, prop: string): string {
  const v = value.trim();
  if (/^var\(/.test(v)) return v;
  if (/^\d+$/.test(v)) return `${v}px`; // número só = px
  return v;
}

function collectArbitraryClasses(root: Element): Map<string, string> {
  const rules = new Map<string, string>();
  const walk = (el: Element) => {
    const cls = el.getAttribute("class");
    if (cls) {
      let m: RegExpExecArray | null;
      ARBITRARY_PATTERN.lastIndex = 0;
      while ((m = ARBITRARY_PATTERN.exec(cls))) {
        const fullClass = m[0];
        const prefix = m[1];
        const value = m[2];
        const cssProp = PROPERTY_MAP[prefix];
        const parsedValue = parseValue(value, prefix);
        if (cssProp) {
          rules.set(fullClass, `${cssProp}:${parsedValue}`);
        }
      }
    }
    for (const child of el.children) walk(child);
  };
  walk(root);
  return rules;
}

function injectStyles(rules: Map<string, string>) {
  let style = document.getElementById("ds-arbitrary-styles") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "ds-arbitrary-styles";
    document.head.appendChild(style);
  }
  const css = Array.from(rules.entries())
    .map(([cls, decl]) => `[class~="${cls}"]{${decl}}`)
    .join("");
  style.textContent = css;
}

function scanAndInject() {
  const root = document.body || document.documentElement;
  const rules = collectArbitraryClasses(root);
  injectStyles(rules);
}

let observer: MutationObserver | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;

function debouncedScan() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    scanAndInject();
    timeoutId = null;
  }, 50);
}

/**
 * Inicializa o gerador automático de estilos arbitrários.
 * Chame uma vez no carregamento da aplicação.
 */
export function initArbitraryStyles() {
  if (typeof document === "undefined") return;

  const run = () => {
    scanAndInject();
    if (!observer) {
      observer = new MutationObserver(() => debouncedScan());
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}
