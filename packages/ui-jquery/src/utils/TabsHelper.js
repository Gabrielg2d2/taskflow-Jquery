/**
 * Inicializa o comportamento de tabs em um container.
 * Espera: role="tab" com aria-controls apontando para o id do painel.
 *
 * @param {HTMLElement | string} container - Elemento ou seletor do container .ds-tabs
 * @returns {() => void} Função para destruir os listeners
 */
export default function initTabs(container) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) return () => {};

  const handleTabClick = (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;

    const tablist = tab.closest('[role="tablist"]');
    const panelId = tab.getAttribute("aria-controls");
    if (!panelId) return;

    const allTabs = tablist?.querySelectorAll('[role="tab"]') ?? [];
    const allPanels = el.querySelectorAll('[role="tabpanel"]');

    allTabs.forEach((t) => t.setAttribute("aria-selected", "false"));
    allPanels.forEach((p) => p.classList.add("ds-tabs__panel--hidden"));

    tab.setAttribute("aria-selected", "true");
    const panel = el.querySelector(`#${panelId}`);
    if (panel) panel.classList.remove("ds-tabs__panel--hidden");
  };

  el.addEventListener("click", handleTabClick);

  return () => el.removeEventListener("click", handleTabClick);
}
