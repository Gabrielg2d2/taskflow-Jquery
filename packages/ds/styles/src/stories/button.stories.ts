import type { Meta, StoryObj } from "@storybook/html";

const meta = {
  title: "Components/Buttons/ButtonBase",
  render: (args) => `
    <div data-theme="light">
      <button
        class="ds-button
          ds-button:${args.variant}
          ds-button:${args.type}
          ${args.disabled ? "disabled" : ""}
          ${args.size ? "ds-button:${args.size}" : ""}
        "
         ${args.disabled ? "disabled" : ""}
        >
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
    variant: "primary",
    disabled: false
  }
};

export const AllVariants: StoryObj = {
  render: (args) => `
    <div data-theme="light" class="flex-col gap-lg p-lg justify-center items-center">
      <button
        class="ds-button
          ds-button:primary
          ds-button:${args.type}
          ${args.disabled ? "disabled" : ""}
          ${args.size ? "ds-button:${args.size}" : ""}
        "
         ${args.disabled ? "disabled" : ""}
        >
        ${args.text}
      </button>

      <button
        class="ds-button
          ds-button:secondary
          ds-button:${args.type}
          ${args.disabled ? "disabled" : ""}
          ${args.size ? "ds-button:${args.size}" : ""}
        "
         ${args.disabled ? "disabled" : ""}
        >
        ${args.text}
      </button>

      <button
        class="ds-button
          ds-button:success
          ds-button:${args.type}
          ${args.disabled ? "disabled" : ""}
          ${args.size ? "ds-button:${args.size}" : ""}
        "
         ${args.disabled ? "disabled" : ""}
        >
        ${args.text}
      </button>

      <button
        class="ds-button
          ds-button:warning
          ds-button:${args.type}
          ${args.disabled ? "disabled" : ""}
          ${args.size ? "ds-button:${args.size}" : ""}
        "
         ${args.disabled ? "disabled" : ""}
        >
        ${args.text}
      </button>

      <button
        class="ds-button
          ds-button:info
          ds-button:${args.type}
          ${args.disabled ? "disabled" : ""}
          ${args.size ? "ds-button:${args.size}" : ""}
        "
         ${args.disabled ? "disabled" : ""}
        >
        ${args.text}
      </button>

      <button
        class="ds-button
          ds-button:error
          ds-button:${args.type}
          ${args.disabled ? "disabled" : ""}
          ${args.size ? "ds-button:${args.size}" : ""}
        "
         ${args.disabled ? "disabled" : ""}
        >
        ${args.text}
      </button>
    </div>
  `,
  args: {
    type: "button",
    disabled: false,
    text: "Text button",
  },
};