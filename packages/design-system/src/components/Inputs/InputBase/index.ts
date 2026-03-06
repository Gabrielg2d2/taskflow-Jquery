import { h } from "../../../dom/h.js";
import { inputBaseStyles } from "./styles.js";

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
    class: inputBaseStyles.slots.root
  }, [
    label &&
      h("label", {
        class: inputBaseStyles.slots.label,
        for: inputId
      }, label),

    h("input", {
      id: inputId,
      name,
      type,
      value,
      placeholder,
      disabled,
      "aria-invalid": String(Boolean(error)),
      "aria-describedby": error ? `${inputId}-error` : undefined,
      class: [
        inputBaseStyles.slots.input,
        error ? inputBaseStyles.states.error : "",
        className
      ].filter(Boolean).join(" ")
    }),

    error &&
      h("p", {
        id: `${inputId}-error`,
        class: inputBaseStyles.slots.error
      }, error)
  ].filter(Boolean));
}