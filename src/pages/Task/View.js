import $ from "jquery";
import escapeHtml from "../../@utils/escapeHtml.js";

const styles = {
  container: "max-w-xl mx-auto p-6",
  form: "flex gap-2 mb-4",
  input: "flex-1 border rounded-xl px-3 py-2",
  button: "bg-black text-white px-4 py-2 rounded-xl",
  buttonDisabled: "opacity-50 cursor-not-allowed",
  list: "space-y-2",
  item: "border rounded-2xl p-3 flex items-center justify-between",
  itemDone: "line-through text-gray-400",
  itemNotDone: "",
  itemBtns: "flex gap-2",
  itemBtnToggle: "px-3 py-1 rounded-xl border",
  itemBtnRemove: "px-3 py-1 rounded-xl border text-red-600",
  header: "flex items-center justify-between mb-4",
  title: "text-2xl font-semibold mb-4",
  sectionStats: "flex items-center gap-3",
  subtitle: "text-gray-500",
  numberTasks: "text-gray-700 font-bold",
  buttonClear:
    "bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 mb-2 ",
  buttonClearDisabled: "opacity-50 cursor-not-allowed",
  buttonClearText: "text-white",
  itemBtnEdit: "px-3 py-1 rounded-xl border text-blue-600",
  buttonSave: "bg-green-500 text-white px-4 py-2 rounded-xl",
  buttonCancel: "bg-red-500 text-white px-4 py-2 rounded-xl",
  toolbar: "flex gap-2 mb-4",
  search: "flex-1 border rounded-xl px-3 py-2",
  buttonFilter: "px-2 py-1 rounded-xl border",
  buttonFilterActive: "bg-blue-500 text-white",
};

export default class TaskView {
  constructor(rootSelector) {
    this.$root = $(rootSelector);
  }

  #templateEmpty() {
    return `
      <li class="${styles.item} text-gray-500">
        Nenhuma tarefa ainda. Adicione a primeira acima 🙂
      </li>
    `;
  }

  #templateHeader(stats) {
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
        </div>
    `;
  }

  #templateToolbar() {
    return `
      <div class="${styles.toolbar}">
        <div class="flex-1">
          <input
            data-js="task-search"
            class="${styles.search}"
            placeholder="Buscar..."
          />
        </div>

        <button type="button" data-js="task-filter-all" class="${styles.buttonFilter} ${styles.buttonFilterActive}">Todas</button>
        <button type="button" data-js="task-filter-pending" class="${styles.buttonFilter}">Pendentes</button>
        <button type="button" data-js="task-filter-done" class="${styles.buttonFilter}">Feitas</button>
      </div>
    `;
  }

  #templateForm(isEditing = false) {
    return `
      <form data-js="task-form" class="${styles.form}">
          <input
            data-js="task-input"
            class="${styles.input}"
            placeholder="Nova tarefa..."
            autocomplete="off"
          />
          ${
            isEditing
              ? `
            <button data-js='task-save' class="${styles.buttonSave}" type="button">
              Salvar
            </button>
            <button data-js='task-cancel' class="${styles.buttonCancel}" type="button">
              Cancelar
            </button>
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

  #templateClearAllTasksButton(hasTasks) {
    return `
      <button data-js="task-clear" class="${styles.buttonClear} ${hasTasks ? "" : styles.buttonClearDisabled}" type="button">
          <span class="${styles.buttonClearText}">Limpar tudo</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
    `;
  }

  #templateTaskItem(id, title, done) {
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
          <button
            type="button"
            data-js="task-edit"
            data-id="${id}"
            data-title="${safeTitle}"
            class="${styles.itemBtnEdit}"
          >
            Editar
          </button>
        </div>
      </li>
    `;
  }

  #templateTaskList(tasks) {
    if (tasks.length === 0) return this.#templateEmpty();

    return `
      <ul data-js="task-list" class="${styles.list}">
        ${tasks.map((item) => this.#templateTaskItem(item.id, item.title, item.done)).join("")}
      </ul>
    `;
  }

  render(domainState, editingTask = null, filter = "all") {
    const dataFilter = ["all", "pending", "done"];
    if (!dataFilter.includes(filter)) {
      filter = "all";
    }

    const tasks =
      filter === "all"
        ? domainState.tasks
        : domainState.tasks.filter((item) =>
            filter === "done" ? item.done : !item.done,
          );

    const hasTasks = domainState.tasks.length > 0;

    this.$root.html(
      `
        <div class="${styles.container}">
          ${this.#templateHeader(domainState.stats)}
          ${this.#templateForm(editingTask)}
            ${this.#templateClearAllTasksButton(hasTasks)}
            <br />
            ${this.#templateToolbar(filter)}
            ${this.#templateTaskList(tasks)}
        </div>
      `,
    );

    const form = this.$root.find("[data-js='task-form']");
    const input = this.$root.find("[data-js='task-input']");

    if (editingTask) {
      input.val(editingTask.title).data("id", editingTask.id);
    }

    // watch input changes
    input.off("input.taskflow");
    input.on("input.taskflow", () => {
      const isButtonSubmitDisabled = !input.val()?.trim();
      form
        .find("[data-js='task-submit']")
        .toggleClass(styles.buttonDisabled, isButtonSubmitDisabled)
        .prop("disabled", isButtonSubmitDisabled);
    });
  }

  filterChange(handler) {
    this.$root.off("click.taskflow", '[data-js^="task-filter-"]');

    this.$root.on("click.taskflow", '[data-js^="task-filter-"]', (e) => {
      e.preventDefault();

      this.$root
        .find('[data-js^="task-filter-"]')
        .removeClass(styles.buttonFilterActive);

      $(e.currentTarget).addClass(styles.buttonFilterActive);

      // Definir url com o filtro
      const filter = $(e.currentTarget).data("js").replace("task-filter-", "");
      window.history.pushState({ filter }, "", `?filter=${filter}`);

      handler(filter);
    });
  }

  bindAddTask(handler) {
    this.$root.off("submit.taskflow", '[data-js="task-form"]');
    this.$root.on("submit.taskflow", '[data-js="task-form"]', (e) => {
      e.preventDefault();
      const title = this.$root.find("[data-js='task-input']").val()?.trim();
      if (!title) return;
      handler(title);
    });
  }

  bindRemoveAllTasks(handler) {
    this.$root.off("click.taskflow", '[data-js="task-clear"]');
    this.$root.on("click.taskflow", '[data-js="task-clear"]', (e) => {
      e.preventDefault();
      handler();
    });
  }

  bindTaskActions({ onToggle, onRemove, onEdit }) {
    this.$root.off("click.taskflow", "[data-js='task-toggle']");
    this.$root.on("click.taskflow", "[data-js='task-toggle']", (e) => {
      e.preventDefault();
      const id = $(e.currentTarget).data("id");
      if (id) onToggle(id);
    });

    this.$root.off("click.taskflow", "[data-js='task-remove']");
    this.$root.on("click.taskflow", "[data-js='task-remove']", (e) => {
      e.preventDefault();
      const id = $(e.currentTarget).data("id");
      if (id) onRemove(id);
    });

    this.$root.off("click.taskflow", "[data-js='task-edit']");
    this.$root.on("click.taskflow", "[data-js='task-edit']", (e) => {
      e.preventDefault();
      const id = $(e.currentTarget).data("id");
      const title = $(e.currentTarget).data("title");
      if (!id) return;
      this.$root
        .find("[data-js='task-input']")
        .val(title ?? "")
        .data("id", id);
      onEdit(id, title);
    });
  }

  bindSaveTask(handler) {
    this.$root.off("click.taskflow", "[data-js='task-save']");
    this.$root.on("click.taskflow", "[data-js='task-save']", (e) => {
      e.preventDefault();
      const input = this.$root.find("[data-js='task-input']");
      const id = input.data("id");
      const title = input.val()?.trim();
      if (!id || !title) return;
      handler(id, title);
    });
  }

  bindCancelTask(handler) {
    this.$root.off("click.taskflow", "[data-js='task-cancel']");
    this.$root.on("click.taskflow", "[data-js='task-cancel']", (e) => {
      e.preventDefault();
      handler();
    });
  }
}
