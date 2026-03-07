/**
 * Objeto de classes para autocomplete - use em class: classes.layout.flex, etc.
 */
export const cx = {
  layout: {
    flex: "flex" as const,
    grid: "grid" as const,
    block: "block" as const,
    inline: "inline" as const,
    "inline-flex": "inline-flex" as const,
    "inline-grid": "inline-grid" as const,
    "inline-block": "inline-block" as const,
    "inline-table": "inline-table" as const,
  },
  flex: {
    row: "flex flex-row" as const,
    col: "flex flex-col" as const,
    wrap: "flex flex-wrap" as const,
    nowrap: "flex flex-nowrap" as const,
    "row-reverse": "flex flex-row-reverse" as const,
    "col-reverse": "flex flex-col-reverse" as const,
    start: "justify-start items-start" as const,
    center: "justify-center items-center" as const,
    end: "justify-end items-end" as const,
    between: "justify-between" as const,
    around: "justify-around" as const,
    evenly: "justify-evenly" as const,
  },
  gap: {
    xs: "gap-xs" as const,
    sm: "gap-sm" as const,
    md: "gap-md" as const,
    lg: "gap-lg" as const,
    xl: "gap-xl" as const,
  },
  text: {
    xs: "text-xs" as const,
    sm: "text-sm" as const,
    md: "text-md" as const,
    lg: "text-lg" as const,
    xl: "text-xl" as const,
    fg: "text-fg" as const,
    muted: "text-muted" as const,
    primary: "text-primary" as const,
    error: "text-error" as const,
    success: "text-success" as const,
  },
  bg: {
    page: "bg-page" as const,
    primary: "bg-primary" as const,
    muted: "bg-muted" as const,
    error: "bg-error" as const,
  },
  border: {
    default: "border border-border" as const,
    error: "border border-error" as const,
    primary: "border border-primary" as const,
  },
  responsive: {
    "md:flex-row": "md:flex-row" as const,
    "sm:flex-row": "sm:flex-row" as const,
  },
} as const;

/** Helper para combinar classes com autocomplete */
export function cn(...inputs: (string | undefined | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
