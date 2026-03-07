import { h } from "../../../dom/h.js";

export type InputBaseProps = {
  id?: string;
  name?: string;
  value?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  className?: string;
};

export function InputBase({
  id = "",
  name = "",
  value = "",
  type = "text",
  placeholder = "",
  disabled = false,
  error = "",
  label = "",
  className = ""
} : InputBaseProps) {
  const inputId = id || `input-${name || "text"}`;

  return h("div", {
    class: "flex flex-col"
  }, [
    label &&
      h("label", {
        class: "text-sm text-semibold text-default mb-xs",
        for: inputId
      }, label),

    h("input", {
      id: inputId,
      name,
      type,
      value,
      placeholder,
      disabled,
      autocomplete: "off",
      "aria-invalid": String(Boolean(error)),
      "aria-describedby": error ? `${inputId}-error` : undefined,
      class: [
        "h-10 px-md rounded-md border border-border text-sm text-fg outline-none transition placeholder:text-muted focus:border-info focus:ring focus:ring-info disabled:bg-muted disabled:text-muted disabled:cursor-not-allowed",
        error ? "focus:border-error focus:ring-error border-solid border-color-error text-error" : "focus:border-primary",
        disabled ? "bg-muted text-muted cursor-not-allowed" : "",
        className
      ].filter(Boolean).join(" ")
    }),

    error &&
      h("p", {
        id: `${inputId}-error`,
        class: "text-xs text-error mt-xs"
      }, error)
  ].filter(Boolean));
}