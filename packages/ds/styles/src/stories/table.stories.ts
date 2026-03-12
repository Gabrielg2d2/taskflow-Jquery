import type { Meta, StoryObj } from "@storybook/html";

const meta = {
  title: "Components/Table",
  render: (args) => {
    const variant = args.variant || "";
    const tableClass = variant ? `ds-table:${variant}` : "";
    return `
    <div class="flex flex-col items-center justify-center m-md xs:m-0">
      <div data-theme="light" class="ds-table ${tableClass}" style="max-width: 500px;">
        <table class="ds-table__table">
          <thead>
            <tr>
              <th>Tarefa</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Implementar tabs</td>
              <td>Feito</td>
              <td>11/03</td>
            </tr>
            <tr>
              <td>Implementar tabela</td>
              <td>Feito</td>
              <td>11/03</td>
            </tr>
            <tr>
              <td>Evoluir design system</td>
              <td>Pendente</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
  },
  args: { variant: "default" },
  argTypes: {
    variant: {
      control: "select",
      options: ["", "bordered", "striped", "compact"],
    },
  },
} satisfies Meta;

export default meta;

export const Default: StoryObj = {
  args: { variant: "" },
};

export const Bordered: StoryObj = {
  args: { variant: "bordered" },
};

export const Striped: StoryObj = {
  args: { variant: "striped" },
};

export const Compact: StoryObj = {
  args: { variant: "compact" },
};
