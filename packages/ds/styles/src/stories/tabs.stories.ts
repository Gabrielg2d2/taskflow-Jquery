import type { Meta, StoryObj } from "@storybook/html";
import { within, userEvent } from "@storybook/test";

const initTabs = (container: HTMLElement) => {
  const tabs = container.querySelectorAll('[role="tab"]');
  const panels = container.querySelectorAll('[role="tabpanel"]');

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      panels.forEach((p) => p.classList.add("ds-tabs__panel--hidden"));
      tab.setAttribute("aria-selected", "true");
      const panelId = tab.getAttribute("aria-controls");
      const panel = panelId ? container.querySelector(`#${panelId}`) : panels[i];
      panel?.classList.remove("ds-tabs__panel--hidden");
    });
  });
};

const meta = {
  title: "Components/Tabs",
  render: (args) => {
    const variant = args.variant || "line";
    return `
    <div data-theme="light" class="ds-tabs ds-tabs:${variant}" style="max-width: 400px;">
      <div class="ds-tabs__list" role="tablist">
        <button type="button" role="tab" aria-selected="true" aria-controls="tab-panel-1" id="tab-1" class="ds-tabs__tab">
          Tarefas
        </button>
        <button type="button" role="tab" aria-selected="false" aria-controls="tab-panel-2" id="tab-2" class="ds-tabs__tab">
          Configurações
        </button>
        <button type="button" role="tab" aria-selected="false" aria-controls="tab-panel-3" id="tab-3" class="ds-tabs__tab">
          Estatísticas
        </button>
      </div>
      <div id="tab-panel-1" class="ds-tabs__panel" role="tabpanel">Conteúdo da aba Tarefas.</div>
      <div id="tab-panel-2" class="ds-tabs__panel ds-tabs__panel--hidden" role="tabpanel">Conteúdo da aba Configurações.</div>
      <div id="tab-panel-3" class="ds-tabs__panel ds-tabs__panel--hidden" role="tabpanel">Conteúdo da aba Estatísticas.</div>
    </div>
  `;
  },
  args: { variant: "line" },
  argTypes: {
    variant: {
      control: "select",
      options: ["line", "pill", "card"],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const container = canvasElement.querySelector(".ds-tabs");
    if (container) initTabs(container as HTMLElement);
  },
} satisfies Meta;

export default meta;

export const Line: StoryObj = {
  args: { variant: "line" },
};

export const Pill: StoryObj = {
  args: { variant: "pill" },
};

export const Card: StoryObj = {
  args: { variant: "card" },
};
