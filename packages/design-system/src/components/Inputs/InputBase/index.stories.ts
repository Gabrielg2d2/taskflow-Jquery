import type { Meta, StoryObj } from "@storybook/html";
import { InputBase, type InputBaseProps } from ".";

const meta = {
  title: "Components/Inputs/InputBase",
  tags: ["autodocs"],
  render: (args: InputBaseProps) => InputBase(args),
  args: {
    label: "Input Base",
    placeholder: "Digite aqui...",
    type: "text"
  }
} satisfies Meta<InputBaseProps>;

export default meta;

type Story = StoryObj<InputBaseProps>;

export const Default: Story = {};


export const Disabled: Story = {
  args: {
    disabled: true
  }
};

export const Error: Story = {
  args: {
    error: "Este é um erro"
  }
};

export const Label: Story = {
  args: {
    label: "Input Base Label"
  }
};

export const Placeholder: Story = {
  args: {
    placeholder: "Digite aqui... Placeholder"
  }
};
