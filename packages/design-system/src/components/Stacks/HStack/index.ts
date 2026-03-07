import { type DSChild } from "../../../dom/h.js";
  import { cx, cn } from "../../../styles/classes.js";
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
    className: cn(cx.flex.row, cx.responsive["md:flex-row"], cx.gap.md, className),
    children: c,
  });
}
