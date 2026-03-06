import type { Meta, StoryObj } from "@storybook/html-vite";
import { DSInput } from "./DSInput.js";

const meta: Meta<typeof DSInput> = {
  title: "Components/DSInput",
  tags: ["autodocs"],
  render: () => DSInput(),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
