import $ from "jquery";
import escapeHtml from "../../@utils/escapeHtml.js";

export default class TaskView {
  // keys por slot (render parcial)
  #headerKey = "";
  #formKey = "";
  #clearKey = "";
  #toolbarKey = "";
  #listKey = "";

  #mounted = false;

  // handlers (bind único)
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
  };

  constructor(rootSelector) {
    this.$root = $(rootSelector);
    this.#mount();
    this.#bindOneTimeWatchers();
  }

  bindHandlers(partial) {
    this.handlers = { ...this.handlers, ...partial };
  }

  // -------------------------
  // MOUNT (shell fixo 1x)
  // -------------------------
  #mount() {
    if (this.#mounted) return;

    const isDarkMode = localStorage.getItem("theme") === "dark";

    const styleDark = {};

    const styleLight = {
      container: "max-w-xl mx-auto p-6",
    };

    const styles = isDarkMode ? styleDark : styleLight;

    this.$root.html(`
      <div class="${styles.container}">
        <div data-js="slot-header"></div>
        <div data-js="slot-form"></div>
        <div data-js="slot-clear"></div>
        <br />
        <div data-js="slot-toolbar"></div>
        <div data-js="slot-list"></div>
      </div>
    `);

    // caches dos slots
    this.$slotHeader = this.$root.find('[data-js="slot-header"]');
    this.$slotForm = this.$root.find('[data-js="slot-form"]');
    this.$slotClear = this.$root.find('[data-js="slot-clear"]');
    this.$slotToolbar = this.$root.find('[data-js="slot-toolbar"]');
    this.$slotList = this.$root.find('[data-js="slot-list"]');

    this.#mounted = true;
  }

  // -------------------------
  // STYLES
  // -------------------------
  #getTheme(light, dark) {
    const isDarkMode = localStorage.getItem("theme") === "dark";
    const chosen = isDarkMode ? dark : light;

    // fallback: se faltar key no dark, usa do light
    return { ...light, ...chosen };
  }

  // -------------------------
  // KEYS
  // -------------------------
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

  // -------------------------
  // TEMPLATES
  // -------------------------
  #templateEmpty(
    message = "Nenhuma tarefa ainda. Adicione a primeira acima 🙂",
  ) {
    const styleDark = {};

    const styleLight = {
      text: "text-gray-500",
      item: "border rounded-2xl p-3 flex items-center justify-between",
    };

    const style = this.#getTheme(styleLight, styleDark);

    return `
      <ul data-js="task-list" class="${style.item}">
        <li class="${style.text}">${message}</li>
      </ul>
    `;
  }

  #templateHeader(stats) {
    const styleDark = {};

    const styleLight = {
      header: "flex items-center justify-between mb-4",
      title: "text-2xl font-semibold mb-4",
      sectionStats: "flex items-center gap-3",
      subtitle: "text-gray-500",
      numberTasks: "text-gray-700 font-bold",
    };

    const styles = this.#getTheme(styleLight, styleDark);

    return `<div class="${styles.header}"> 
      <h1 class="${styles.title}">TaskFlow</h1>
      <div class="${styles.sectionStats}">
        <span class="${styles.subtitle}">
          Feitas: <strong data-js="done-tasks" class="${styles.numberTasks}">${stats.done}</strong>
        </span>
        <span class="${styles.subtitle}">
          Pendentes: <strong data-js="pending-tasks" class="${styles.numberTasks}">${stats.pending}</strong>
        </span>
        <span class="${styles.subtitle}">
          Total: <strong data-js="total-tasks" class="${styles.numberTasks}">${stats.total}</strong>
        </span>
      </div>
    </div>`;
  }

  #templateToolbar(filter, search) {
    const safeSearch = escapeHtml(search ?? "");

    const styleDark = {};

    const styleLight = {
      toolbar: "flex gap-2 mb-4",
      search: "flex-1 border rounded-xl px-3 py-2",
      buttonFilter: "px-2 py-1 rounded-xl border",
      buttonFilterActive: "bg-blue-500 text-white",
    };

    const styles = this.#getTheme(styleLight, styleDark);

    const activeAll = filter === "all" ? styles.buttonFilterActive : "";
    const activePending = filter === "pending" ? styles.buttonFilterActive : "";
    const activeDone = filter === "done" ? styles.buttonFilterActive : "";

    return `
      <div class="${styles.toolbar}">
        <div class="flex-1">
          <input
            data-js="task-search"
            class="${styles.search}"
            placeholder="Buscar..."
            value="${safeSearch}"
            autocomplete="off"
            type="search"
            name="search"
          />
        </div>

        <button type="button" data-js="task-filter-all" class="${styles.buttonFilter} ${activeAll}">Todas</button>
        <button type="button" data-js="task-filter-pending" class="${styles.buttonFilter} ${activePending}">Pendentes</button>
        <button type="button" data-js="task-filter-done" class="${styles.buttonFilter} ${activeDone}">Feitas</button>
      </div>
    `;
  }

  #templateForm(editingTask = null) {
    const isEditing = !!editingTask;
    const safeTitle = isEditing ? escapeHtml(editingTask.title ?? "") : "";

    const styleDark = {};

    const styleLight = {
      form: "flex gap-2 mb-4",
      input: "flex-1 border rounded-xl px-3 py-2",
      buttonSave: "bg-green-500 text-white px-4 py-2 rounded-xl",
      buttonCancel: "bg-red-500 text-white px-4 py-2 rounded-xl",
      buttonDisabled: "opacity-50 cursor-not-allowed",
      button: "bg-black text-white px-4 py-2 rounded-xl",
    };

    const styles = this.#getTheme(styleLight, styleDark);

    return `
      <form data-js="task-form" class="${styles.form}">
        <input
          data-js="task-input"
          class="${styles.input}"
          autocomplete="off"
          placeholder="${isEditing ? "Editar tarefa..." : "Nova tarefa..."}"
          ${isEditing ? `value="${safeTitle}"` : ""}
          ${isEditing ? `data-id="${editingTask.id}"` : ""}
        />

        ${
          isEditing
            ? `
              <button data-js="task-save" class="${styles.buttonSave}" type="button">Salvar</button>
              <button data-js="task-cancel" class="${styles.buttonCancel}" type="button">Cancelar</button>
            `
            : `
              <button data-js="task-submit" class="${styles.button} ${styles.buttonDisabled}" type="submit" disabled>
                Adicionar
              </button>
            `
        }
      </form>
    `;
  }

  #templateClearAllTasksButton(tasksLength) {
    const disabled = tasksLength === 0;

    const styleDark = {};

    const styleLight = {
      buttonClear:
        "bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 mb-2 ",
      buttonClearDisabled: "opacity-50 cursor-not-allowed",
      buttonClearText: "text-white",
    };

    const styles = this.#getTheme(styleLight, styleDark);

    return `
      <button
        data-js="task-clear"
        class="${styles.buttonClear} ${disabled ? styles.buttonClearDisabled : ""}"
        ${disabled ? "disabled" : ""}
        type="button"
      >
        <span class="${styles.buttonClearText}">Limpar tudo</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      </button>
    `;
  }

  #templateTaskItem(id, title, done) {

    const styleDark = {};

    const styleLight = {
      item: "border rounded-2xl p-3 flex items-center justify-between",
      itemBtns: "flex gap-2",
      itemBtnToggle: "px-3 py-1 rounded-xl border",
      itemBtnRemove: "px-3 py-1 rounded-xl border text-red-600",
      itemBtnEdit: "px-3 py-1 rounded-xl border text-blue-600",
      itemDone: "line-through text-gray-400",
      itemNotDone: "",
    };

    const styles = this.#getTheme(styleLight, styleDark);

    const safeTitle = escapeHtml(title);
    const doneClass = done ? styles.itemDone : styles.itemNotDone;
    const btnText = done ? "Desfazer" : "Feito";

    return `
      <li data-id="${id}" class="${styles.item}">
        <span class="${doneClass}">${safeTitle}</span>

        <div class="${styles.itemBtns}">
          <button type="button" data-js="task-toggle" data-id="${id}" class="${styles.itemBtnToggle}">
            ${btnText}
          </button>
          <button type="button" data-js="task-remove" data-id="${id}" class="${styles.itemBtnRemove}">
            Remover
          </button>
          <button type="button" data-js="task-edit" data-id="${id}" data-title="${safeTitle}" class="${styles.itemBtnEdit}">
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


    const styleLight = {
      list: "space-y-2",
    };
    const styleDark = {};

    const styles = this.#getTheme(styleLight, styleDark);

    return `
      <ul data-js="task-list" class="${styles.list}">
        ${tasks.map((t) => this.#templateTaskItem(t.id, t.title, t.done)).join("")}
      </ul>
    `;
  }

  // -------------------------
  // ONE-TIME WATCHERS (delegation)
  // -------------------------
  #bindOneTimeWatchers() {
    // garante que não duplica (hot reload / reinstanciar)
    this.$root.off(".taskflow");

    // FORM submit (Adicionar)
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

    // Habilitar/desabilitar submit ao digitar (somente em add mode)
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

    // LIST: toggle/remove/edit
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

    // EDIT: save/cancel
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

    // CLEAR ALL
    this.$root.on("click.taskflow", '[data-js="task-clear"]', (e) => {
      e.preventDefault();
      if ($(e.currentTarget).prop("disabled")) return;
      this.handlers.onClearAll?.();
    });

    // FILTERS
    this.$root.on("click.taskflow", '[data-js^="task-filter-"]', (e) => {
      e.preventDefault();
      const filter = $(e.currentTarget)
        .attr("data-js")
        .replace("task-filter-", "");
      this.handlers.onFilter?.(filter);
    });

    // SEARCH
    this.$root.on("input.taskflow", '[data-js="task-search"]', (e) => {
      const search = String($(e.currentTarget).val() ?? "");
      this.handlers.onSearch?.(search);
    });

    // Keyboard shortcuts in edit mode: Esc cancels / Enter saves
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

  // -------------------------
  // PARTIAL RENDERS
  // -------------------------
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

  // -------------------------
  // PUBLIC RENDER
  // -------------------------
  render(domainState, editingTask = null, filter = "all", search = "") {
    this.#renderHeaderPartial(domainState.stats);
    this.#renderFormPartial(editingTask);
    this.#renderClearPartial(domainState.tasks.length);
    this.#renderToolbarPartial(filter, search);
    this.#renderTaskListPartial(domainState.tasks, filter);
  }
}
