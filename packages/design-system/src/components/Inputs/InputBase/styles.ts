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
    root: "flex flex-col",
    label: "text-sm text-semibold text-color-default mb-xs",
    input: [
      "h-10 px-md",
      "rounded-md border border-border",
      "text-sm text-fg",
      "outline-none transition",
      "placeholder:text-muted",
      "focus:border-info focus:ring focus:ring-info",
      "disabled:bg-muted disabled:text-muted disabled:cursor-not-allowed",
    ].join(" "),
    error: "text-xs text-error mt-xs",
  },
  states: {
    error: "focus:border-error focus:ring-error border-solid border-color-error text-error",
  },
};