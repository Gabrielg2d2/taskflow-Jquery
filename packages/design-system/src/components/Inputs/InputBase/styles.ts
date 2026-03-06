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
    label: "text-sm font-sans text-fg",
    input: [
      "h-10 px-md rounded-lg border border-border",
      "bg-bg text-sm text-fg",
      "outline-none transition",
      "placeholder:text-muted",
      "focus:border-info focus:ring focus:ring-info",
      "disabled:bg-muted disabled:text-muted disabled:cursor-not-allowed",
    ].join(" "),
    error: "text-xs text-error pl-sm",
  },
  states: {
    error: "focus:border-error focus:ring-error border-solid border-color-error text-error",
  },
};