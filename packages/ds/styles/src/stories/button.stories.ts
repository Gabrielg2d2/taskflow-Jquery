import type { Meta, StoryObj } from "@storybook/html";

const meta = {
  title: "Components/Buttons/ButtonBase",
  render: (args) => `
    <div data-theme="light">
      <button class="ds-button ds-button:${args.variant} ds-button:${args.type} ${args.disabled ? "disabled" : ""}">
        ${args.text}
      </button>
    </div>
  `,
  args: {
    variant: "primary",
    type: "button",
    disabled: false,
    text: "Text button",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "success", "warning", "info", "error"],
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    disabled: {
      control: "boolean",
    },
    text: {
      control: "text",
    },
  },
} satisfies Meta;

export default meta;

export const Base: StoryObj = {
  args: {
    variant: "error"
  }
};