import { h, type DSChild } from "../../../dom/h.js";

export type StackBaseProps = {
  id?: string;
  children?: DSChild | DSChild[];
  className?: string;
};

export function StackBase({ id = "", children = [], className = "" }: StackBaseProps) {
  const c = Array.isArray(children) ? children : children ? [children] : [];
  return h(
    "div",
    {
      id: id || undefined,
      class: ["flex flex-row gap-xs", className].filter(Boolean).join(" "),
    },
    ...c,
  );
}
