export type IProps = {
  slots: {
    root: string;
    label: string;
    input: string;
    error: string;
  };
  states: {
    error: string;
  };
};

export const inputBaseStyles: IProps = {
  slots: {
    root: "flex flex-col gap-ds-sm",
    label: "text-ds-sm font-medium text-ds-fg",
    input: [
      "w-full h-10 px-ds-md rounded-ds-lg border border-ds-border",
      "bg-ds-bg text-ds-sm text-ds-fg",
      "outline-none transition",
      "placeholder:text-ds-muted",
      "focus:border-ds-info focus:ring-4 focus:ring-ds-info/20",
      "disabled:bg-ds-muted/10 disabled:text-ds-muted disabled:cursor-not-allowed",
    ].join(" "),
    error: "text-ds-xs text-ds-error",
  },
  states: {
    error: "border-ds-error focus:border-ds-error focus:ring-ds-error/20",
  },
};