import type { Meta, StoryObj } from "@storybook/html";

const meta = {
  title: "Components/Inputs/InputBase",
  tags: ["autodocs"],
  render: (args) => `
    <div>
      <input 
        ${args.disabled ? "disabled" : ""}
        ${args.error ? "error" : ""}
        ${args.name ? "name=" + '"' + args.name + '"' : ""}
        ${args.value ? "value=" + '"' + args.value + '"' : ""}
        ${args.type ? "type=" + '"' + args.type + '"' : ""}
        ${args.placeholder ? "placeholder=" + '"' + args.placeholder + '"' : ""}
        ${args.class ? "class=" + '"' + args.class + '"' : ""}
      />

      ${args.error ? `<p class="ds-input:error-message">${args.error}</p>` : ""}
    </div>
  `,
  args: {
    placeholder: "Digite aqui...",
    type: "text",
    disabled: false,
    error: "",
    name: "input-story",
    value: "",
    class: "ds-input:base",
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
    value: "",
    class: "ds-input:base",
  },
};

export const Error: StoryObj = {
  args: {
    class: "ds-input:base ds-input:error",
  },
};
