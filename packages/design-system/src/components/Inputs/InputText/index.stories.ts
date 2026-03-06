import type { Meta, StoryObj } from "@storybook/html";
import { InputText } from ".";

const meta: Meta = {
  title: "Components/Inputs/InputText",
  tags: ["autodocs"],
  render: () => InputText({
    label: "Input Text",
    placeholder: "Digite aqui...",
    type: "text"
  }),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
