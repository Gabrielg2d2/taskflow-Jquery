import type { Meta, StoryObj } from "@storybook/html-vite";
import { DSButton } from "./DSButton.js";

const meta: Meta<typeof DSButton> = {
  title: "Components/DSButton",
  tags: ["autodocs"],
  render: () => DSButton(),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
