import { type DSChild } from "../../../dom/h.js";
import { StackBase, StackBaseProps } from "../@StackBase/index.js";

export type VStackProps = {
  id?: string;
  children?: DSChild | DSChild[];
  className?: string;
} & StackBaseProps;

export function VStack({
  id = "",
  children = [],
  className = "",
}: VStackProps) {
  const c = Array.isArray(children) ? children : children ? [children] : [];
  return StackBase({
    id,
    className: ["flex-col gap-xs", className].filter(Boolean).join(" "),
    children: c,
  });
}
