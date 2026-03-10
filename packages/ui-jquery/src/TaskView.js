import $ from "jquery";
import escapeHtml from "./utils/escapeHtml.js";

export default class TaskView {
  #headerKey = "";
  #formKey = "";
  #clearKey = "";
  #toolbarKey = "";
  #listKey = "";

  #mounted = false;

  handlers = {
    onAdd: null,
    onClearAll: null,
    onToggle: null,
    onRemove: null,
    onEdit: null,
    onSaveEdit: null,
    onCancelEdit: null,
    onFilter: null,
    onSearch: null,
    onToastAction: null,
  };

  constructor(rootSelector) {
    this.$root = $(rootSelector);
    this.#mount();
    this.#bindOneTimeWatchers();
  }

  bindHandlers(partial) {
    this.handlers = { ...this.handlers, ...partial };
  }

  #mount() {
    if (this.#mounted) return;

    const isDarkMode = localStorage.getItem("theme") === "dark";

    const styleDark = {};

    const styleLight = {
      container: "max-w-xl mx-auto p-6",
    };

    const styles = isDarkMode ? styleDark : styleLight;

    this.$root.html(`
      <div class="h-screen flex justify-center">
        <div data-theme="light" class="flex-1 flex-col gap-lg w-max-600">
          <div data-js="slot-toast"></div>
          <div data-js="slot-header"></div>
          <div data-js="slot-form"></div>
          <div data-js="slot-clear"></div>
          <div data-js="slot-toolbar"></div>
          <div data-js="slot-list"></div>
        </div>
      </div>
    `);

    this.$slotToast = this.$root.find('[data-js="slot-toast"]');
    this.$slotHeader = this.$root.find('[data-js="slot-header"]');
    this.$slotForm = this.$root.find('[data-js="slot-form"]');
    this.$slotClear = this.$root.find('[data-js="slot-clear"]');
    this.$slotToolbar = this.$root.find('[data-js="slot-toolbar"]');
    this.$slotList = this.$root.find('[data-js="slot-list"]');

    this.#mounted = true;
  }

  #getTheme(light, dark) {
    const isDarkMode = localStorage.getItem("theme") === "dark";
    const chosen = isDarkMode ? dark : light;
    return { ...light, ...chosen };
  }

  #makeHeaderKey(stats) {
    return `${stats.total}|${stats.done}|${stats.pending}`;
  }

  #makeFormKey(editingTask) {
    return editingTask ? `${editingTask.id}|${editingTask.title}` : "add";
  }

  #makeClearKey(tasksLength) {
    return String(tasksLength);
  }

  #makeToolbarKey(filter, search) {
    return `${filter}|${search ?? ""}`;
  }

  #makeListKey(tasks, filter) {
    const tasksPart = (tasks ?? [])
      .map((t) => `${t.id}|${t.done ? 1 : 0}|${t.title}`)
      .join("::");
    return `${filter}::${tasksPart}`;
  }

  #toastTimer = null;

  showToast(message, { type = "info", actionLabel = null } = {}) {
    const timerDuration = 6000;

    const colors = {
      info: "bg-zinc-900 text-white",
      success: "bg-green-600 text-white",
      warning: "bg-amber-500 text-black",
      error: "bg-red-600 text-white",
    };

    const cls = colors[type] ?? colors.info;

    if (this.#toastTimer) clearTimeout(this.#toastTimer);

    const styleDark = {};
    const styleLight = {
      toast:
        "mb-3 rounded-2xl px-4 py-3 flex items-center justify-between shadow",
      toastText: "text-sm",
      toastAction: "ml-4 underline text-sm font-semibold",
      toastClose: "ml-4 text-sm opacity-80 hover:opacity-100",
    };
    const styles = this.#getTheme(styleLight, styleDark);

    this.$slotToast.html(`
    <div class="${styles.toast} ${cls}">
      <span class="${styles.toastText}">${escapeHtml(message)}</span>

      ${
        actionLabel
          ? `<button data-js="toast-action" type="button" class="${styles.toastAction}">
              ${escapeHtml(actionLabel)}
            </button>`
          : `<button data-js="toast-close" type="button" class="${styles.toastClose}">
              ✕
            </button>`
      }
    </div>
  `);

    this.#toastTimer = setTimeout(() => this.clearToast(), timerDuration);
  }

  clearToast() {
    if (this.#toastTimer) clearTimeout(this.#toastTimer);
    this.#toastTimer = null;
    this.$slotToast.empty();
  }

  #templateEmpty(
    message = "Nenhuma tarefa ainda. Adicione a primeira acima 🙂",
  ) {
    return `
      <ul data-js="task-list" class="border rounded-lg p-lg flex justify-center">
        <li class="">${message}</li>
      </ul>
    `;
  }

  #templateHeader(stats) {
    return `
          <div class="flex items-center justify-between mb-4"> 
            <h1 class="">TaskFlow <span class="text-sm font-normal">(jQuery)</span></h1>
            <div class="flex items-center gap-md">
              <span class="">
                Feitas: <strong data-js="done-tasks" class="">${stats.done}</strong>
              </span>
              <span class="">
                Pendentes: <strong data-js="pending-tasks" class="">${stats.pending}</strong>
              </span>
              <span class="">
                Total: <strong data-js="total-tasks" class="">${stats.total}</strong>
              </span>
            </div>
          </div>`;
  }

  #templateToolbar(filter, search) {
    const safeSearch = escapeHtml(search ?? "");

    return `
      <div class="flex-row gap-lg justify-between my-lg">
      
          <input 
            data-js="task-search"
            class="ds-input ds-input:base"
            placeholder="Buscar..."
            value="${safeSearch}"
            autocomplete="off"
            type="search"
            name="search"
          />

        <div class="flex-row gap-lg">
          <button type="button" data-js="task-filter-all" class="">Todas</button>
          <button type="button" data-js="task-filter-pending" class="">Pendentes</button>
          <button type="button" data-js="task-filter-done" class="">Feitas</button>
        </div>
      </div>
    `;
  }

  #templateForm(editingTask = null) {
    const isEditing = !!editingTask;
    const safeTitle = isEditing ? escapeHtml(editingTask.title ?? "") : "";

    return `
      <form data-js="task-form" class="flex-row justify-between gap-lg">
        <input
          data-js="task-input"
          class="ds-input ds-input:base"
          autocomplete="off"
          placeholder="${isEditing ? "Editar tarefa..." : "Nova tarefa..."}"
          ${isEditing ? `value="${safeTitle}"` : ""}
          ${isEditing ? `data-id="${editingTask.id}"` : ""}
        />

        ${
          isEditing
            ? `
              <button data-js="task-save" class="" type="button">Salvar</button>
              <button data-js="task-cancel" class="" type="button">Cancelar</button>
            `
            : `
              <button data-js="task-submit" class="" type="submit" disabled>
                Adicionar
              </button>
            `
        }
      </form>
    `;
  }

  #templateClearAllTasksButton(tasksLength) {
    const disabled = tasksLength === 0;

    return `
      <button
        data-js="task-clear"
        class=""
        ${disabled ? "disabled" : ""}
        type="button"
      >
        <span class="">Limpar tudo</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    `;
  }

  #templateTaskItem(id, title, done) {
    const safeTitle = escapeHtml(title);
    const btnText = done ? "Desfazer" : "Feito";

    return `
      <li data-id="${id}" class="flex-row gap-lg justify-between items-start border rounded-sm p-lg">

        <span class="">${safeTitle}</span>

        <div class="flex-row gap-lg">
          <button type="button" data-js="task-toggle" data-id="${id}" class="">
            ${btnText}
          </button>
          <button type="button" data-js="task-remove" data-id="${id}" class="">
            Remover
          </button>
          <button type="button" data-js="task-edit" data-id="${id}" data-title="${safeTitle}" class="">
            Editar
          </button>
        </div>

      </li>
    `;
  }

  #templateTaskList(tasks = [], filter = "all") {
    if (tasks.length === 0 && filter !== "all") {
      return this.#templateEmpty(
        `Nenhuma tarefa ${filter === "pending" ? "pendente" : "feita"} encontrada.`,
      );
    }
    if (tasks.length === 0) return this.#templateEmpty();

    return `
      <ul data-js="task-list" class="flex-1 p-0 flex-col gap-lg">
        ${tasks.map((t) => this.#templateTaskItem(t.id, t.title, t.done)).join("")}
      </ul>
    `;
  }

  #bindOneTimeWatchers() {
    this.$root.off(".taskflow");

    this.$root.on("submit.taskflow", '[data-js="task-form"]', (e) => {
      e.preventDefault();

      const $input = this.$root.find('[data-js="task-input"]');
      const isEditing = !!$input.data("id");
      if (isEditing) return;

      const title = String($input.val() ?? "").trim();
      if (!title) return;

      this.handlers.onAdd?.(title);

      $input.val("").trigger("input").trigger("focus");
    });

    this.$root.on("input.taskflow", '[data-js="task-input"]', (e) => {
      const $input = $(e.currentTarget);

      const isEditing = !!String($input.data("id") ?? "");
      if (isEditing) return;

      const value = String($input.val() ?? "").trim();
      const disabled = value.length === 0;

      $input
        .closest('[data-js="task-form"]')
        .find('[data-js="task-submit"]')
        .toggleClass("opacity-50 cursor-not-allowed", disabled)
        .prop("disabled", disabled);
    });

    this.$root.on("click.taskflow", '[data-js="task-toggle"]', (e) => {
      e.preventDefault();
      const id = $(e.currentTarget).data("id");
      if (id) this.handlers.onToggle?.(id);
    });

    this.$root.on("click.taskflow", '[data-js="task-remove"]', (e) => {
      e.preventDefault();
      const id = $(e.currentTarget).data("id");
      if (id) this.handlers.onRemove?.(id);
    });

    this.$root.on("click.taskflow", '[data-js="task-edit"]', (e) => {
      e.preventDefault();
      const $btn = $(e.currentTarget);
      const id = $btn.data("id");
      const title = $btn.data("title");
      if (!id) return;
      this.handlers.onEdit?.(id, title);
    });

    this.$root.on("click.taskflow", '[data-js="task-save"]', (e) => {
      e.preventDefault();
      const $input = this.$root.find('[data-js="task-input"]');
      const id = $input.data("id");
      const title = String($input.val() ?? "").trim();
      if (!id || !title) return;

      this.handlers.onSaveEdit?.(id, title);
    });

    this.$root.on("click.taskflow", '[data-js="task-cancel"]', (e) => {
      e.preventDefault();
      this.handlers.onCancelEdit?.();
    });

    this.$root.on("click.taskflow", '[data-js="task-clear"]', (e) => {
      e.preventDefault();
      if ($(e.currentTarget).prop("disabled")) return;
      this.handlers.onClearAll?.();
    });

    this.$root.on("click.taskflow", '[data-js^="task-filter-"]', (e) => {
      e.preventDefault();
      const filter = $(e.currentTarget)
        .attr("data-js")
        .replace("task-filter-", "");
      this.handlers.onFilter?.(filter);
    });

    this.$root.on("input.taskflow", '[data-js="task-search"]', (e) => {
      const search = String($(e.currentTarget).val() ?? "");
      this.handlers.onSearch?.(search);
    });

    this.$root.on("click.taskflow", '[data-js="toast-action"]', (e) => {
      e.preventDefault();
      this.handlers.onToastAction?.();
      this.clearToast();
    });

    this.$root.on("click.taskflow", '[data-js="toast-close"]', (e) => {
      e.preventDefault();
      this.clearToast();
    });

    this.$root.on("keydown.taskflow", '[data-js="task-input"]', (e) => {
      const $input = $(e.currentTarget);
      const isEditing = !!$input.data("id");
      if (!isEditing) return;

      if (e.key === "Escape") {
        e.preventDefault();
        this.handlers.onCancelEdit?.();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const id = $input.data("id");
        const title = String($input.val() ?? "").trim();
        if (!id || !title) return;
        this.handlers.onSaveEdit?.(id, title);
      }
    });
  }

  #renderHeaderPartial(stats) {
    const key = this.#makeHeaderKey(stats);
    if (key === this.#headerKey) return;
    this.#headerKey = key;
    this.$slotHeader.html(this.#templateHeader(stats));
  }

  #renderFormPartial(editingTask) {
    const key = this.#makeFormKey(editingTask);
    if (key === this.#formKey) return;
    this.#formKey = key;

    this.$slotForm.html(this.#templateForm(editingTask));

    const $input = this.$slotForm.find('[data-js="task-input"]');
    $input.trigger("focus");

    const el = $input.get(0);
    if (el && el.setSelectionRange) {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }

  #renderClearPartial(tasksLength) {
    const key = this.#makeClearKey(tasksLength);
    if (key === this.#clearKey) return;
    this.#clearKey = key;
    this.$slotClear.html(this.#templateClearAllTasksButton(tasksLength));
  }

  #renderToolbarPartial(filter, search) {
    const key = this.#makeToolbarKey(filter, search);
    if (key === this.#toolbarKey) return;
    this.#toolbarKey = key;
    this.$slotToolbar.html(this.#templateToolbar(filter, search));
  }

  #renderTaskListPartial(tasks, filter) {
    const key = this.#makeListKey(tasks, filter);
    if (key === this.#listKey) return;
    this.#listKey = key;
    this.$slotList.html(this.#templateTaskList(tasks, filter));
  }

  render(domainState, editingTask = null, filter = "all", search = "") {
    this.#renderHeaderPartial(domainState.stats);
    this.#renderFormPartial(editingTask);
    this.#renderClearPartial(domainState.tasks.length);
    this.#renderToolbarPartial(filter, search);
    this.#renderTaskListPartial(domainState.tasks, filter);
  }
}
