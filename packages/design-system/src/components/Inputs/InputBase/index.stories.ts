import type { Meta, StoryObj } from "@storybook/html";
import { InputBase } from ".";

const meta: Meta = {
  title: "Components/Inputs/InputBase",
  tags: ["autodocs"],
  render: () => InputBase({
    label: "Input Base",
    placeholder: "Digite aqui...",
    type: "text"
  }),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
