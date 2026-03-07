import { type DSChild } from "../../../dom/h.js";
import { StackBase, StackBaseProps } from "../@StackBase/index.js";

export type HStackProps = {
  id?: string;
  children?: DSChild | DSChild[];
  className?: string;
} & StackBaseProps;

export function HStack({
  id = "",
  children = [],
  className = "",
}: HStackProps) {
  const c = Array.isArray(children) ? children : children ? [children] : [];
  return StackBase({
    id,
    className: ["flex-row md:flex-row gap-md", className].filter(Boolean).join(" "),
    children: c,
  });
}
