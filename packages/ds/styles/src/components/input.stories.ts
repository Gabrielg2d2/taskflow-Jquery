import type { Meta, StoryObj } from "@storybook/html";

const meta = {
  title: "Components/Inputs/InputBase",
  render: (args) => `
    <div class="ds-vstack">
      <label for="${args.name}">${args.label}</label>
      <input 
        ${args.disabled ? "disabled" : ""}
        ${args.name ? "name=" + '"' + args.name + '"' : ""}
        ${args.value ? "value=" + '"' + args.value + '"' : ""}
        ${args.type ? "type=" + '"' + args.type + '"' : ""}
        ${args.placeholder ? "placeholder=" + '"' + args.placeholder + '"' : ""}
        ${args.error ? "aria-invalid=" + '"' + "true" + '"' : ""}
        ${args.error ? "aria-describedby=" + '"' + args.name + "-error" + '"' : ""}
        ${args.error ? "class=" + '"' + "ds-input ds-input:error" + '"' : "class=" + '"' + "ds-input ds-input:base" + '"'}
      />  

      ${args.helperTextError && args.error ? `<p class="ds-input:error-message">${args.helperTextError}</p>` : ""}
      ${args.helperText ? `<p class="ds-input:helper-text">${args.helperText}</p>` : ""}
    </div>
  `,
  args: {
    placeholder: "Digite aqui...",
    type: "text",
    disabled: false,
    error: false,
    name: "input-story",
    value: "",
    helperText: "Este é um texto de ajuda",
    helperTextError: "Este é um texto de erro",
    label: "Label",
  },
  argTypes: {
    placeholder: { control: "text" },
    type: {
      control: "select",
      options: [
        "text",
        "email",
        "password",
        "number",
        "tel",
        "url",
        "search",
        "date",
        "time",
        "datetime-local",
        "month",
        "week",
      ],
    },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    name: { control: "text" },
    value: { control: "text" },
    class: { control: "text" },
    helperText: { control: "text" },
    helperTextError: { control: "text" },
  },
} satisfies Meta;

export default meta;

export const Base: StoryObj = {
  args: {
    placeholder: "Digite aqui...",
    type: "text",
    disabled: false,
    error: "",
    name: "input-base",
    value: ""
  },
};

export const Error: StoryObj = {
  args: {
    name: "input-error",
    error: true,
    helperTextError: "Este é um texto de erro"
  },
};

export const InputWithLabel: StoryObj = {
  args: {
    label: "Label",
    name: "input-with-label"
  },
};

export const Disabled: StoryObj = {
  args: {
    disabled: true
  },
};