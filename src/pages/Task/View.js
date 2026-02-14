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
  buttonSave: "bg-green-500 text-white px-4 py-2 rounded-xl hidden",
  buttonCancel: "bg-red-500 text-white px-4 py-2 rounded-xl hidden",
};

export default class TaskView {
  #minCharLength = 1;

  constructor(rootSelector) {
    this.$root = $(rootSelector);

    this.$root.html(`
      <div class="${styles.container}">

        <div class="${styles.header}">
          <h1 class="${styles.title}">TaskFlow</h1>
            <div class="${styles.sectionStats}">
              <span class="${styles.subtitle}">
                Feitas: <strong data-js="done-tasks" class="${styles.numberTasks}">0</strong>
              </span>
              <span class="${styles.subtitle}">
                Pendentes: <strong data-js="pending-tasks" class="${styles.numberTasks}">0</strong>
              </span>
              <span class="${styles.subtitle}">
                Total: <strong data-js="total-tasks" class="${styles.numberTasks}">0</strong>
              </span>
            </div>
        </div>


        <form data-js="task-form" class="${styles.form}">
          <input
            data-js="task-input"
            class="${styles.input}"
            placeholder="Nova tarefa..."
            autocomplete="off"
          />
          <button data-js="task-submit" class="${styles.button} ${styles.buttonDisabled}" type="submit" disabled>
            Adicionar
          </button>
          <button data-js="task-save" class="${styles.buttonSave}" type="button">
            Salvar
          </button>
          <button data-js="task-cancel" class="${styles.buttonCancel}" type="button">
            Cancelar
          </button>
        </form>
        
        <button data-js="task-clear" class="${styles.buttonClear} ${styles.buttonClearDisabled}" type="button" disabled>
          <span class="${styles.buttonClearText}">Limpar tudo</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>

        <ul data-js="task-list" class="${styles.list}"></ul>
      </div>
    `);

    // cache task form
    this.$form = this.$root.find('[data-js="task-form"]');
    this.$input = this.$root.find('[data-js="task-input"]');
    this.$button = this.$root.find('[data-js="task-submit"]');
    this.$list = this.$root.find('[data-js="task-list"]');

    // cache task clear button
    this.$buttonClear = this.$root.find('[data-js="task-clear"]');

    // cache task save and cancel buttons
    this.$buttonSave = this.$root.find('[data-js="task-save"]');
    this.$buttonCancel = this.$root.find('[data-js="task-cancel"]');

    // cache task header
    this.$statsTotal = this.$root.find('[data-js="total-tasks"]');
    this.$statsDone = this.$root.find('[data-js="done-tasks"]');
    this.$statsPending = this.$root.find('[data-js="pending-tasks"]');

    // watch input changes
    this.$input
      .off("input.taskflow")
      .on("input.taskflow", () => this.#updateSubmitButtonState());
  }

  #updateClearAllTasksButtonState(state) {
    const hasTasks = (state?.stats?.total ?? 0) > 0;
    this.$buttonClear.prop("disabled", !hasTasks);
    this.$buttonClear.toggleClass(styles.buttonClearDisabled, !hasTasks);
  }

  #updateSubmitButtonState() {
    const hasValue = this.$input.val().trim().length >= this.#minCharLength;
    this.$button.prop("disabled", !hasValue);
    this.$button.toggleClass(styles.buttonDisabled, !hasValue);
  }

  #renderTaskHeader(state) {
    this.$statsTotal.text(state.stats.total);
    this.$statsDone.text(state.stats.done);
    this.$statsPending.text(state.stats.pending);
  }

  #renderTaskList(state) {
    const html = state.tasks
      .map((item) => {
        const safeTitle = escapeHtml(item.title);
        const doneClass = item.done ? styles.itemDone : styles.itemNotDone;
        const btnText = item.done ? "Desfazer" : "Feito";
        const dataId = item.id;

        return `
          <li data-id="${dataId}" class="${styles.item}">
            <span class="${doneClass}">${safeTitle}</span>

            <div class="${styles.itemBtns}">
              <button type="button" data-action="toggle" class="${styles.itemBtnToggle}">
                ${btnText}
              </button>
              <button type="button" data-action="remove" class="${styles.itemBtnRemove}">
                Remover
              </button>
              <button type="button" data-id="${dataId}" data-title="${safeTitle}" data-action="edit" class="${styles.itemBtnEdit}">
                Editar
              </button>
            </div>
          </li>
        `;
      })
      .join("");

    this.$list.html(html);
  }

  #resetEditTaskForm() {
    this.$input.val("");
    this.$input.data("id", "");
    this.$input.trigger("focus");
    this.$buttonSave.addClass("hidden");
    this.$button.removeClass("hidden");
    this.$buttonCancel.addClass("hidden");
    this.$list.find("li").removeClass("bg-green-200");
  }

  enterEditMode(id, title) {
    this.$input.val(title);
    this.$input.data("id", id);
    this.$input.trigger("focus");

    this.$button.addClass("hidden");
    this.$buttonSave.removeClass("hidden");
    this.$buttonCancel.removeClass("hidden");

    this.$list.find("li").removeClass("bg-green-200");
    this.$list.find(`li[data-id="${id}"]`).addClass("bg-green-200");
  }

  cancelEditTask() {
    this.$buttonCancel.off("click.taskflow");
    this.$buttonCancel.on("click.taskflow", (e) => {
      e.preventDefault();
      this.#resetEditTaskForm();
    });
  }

  resetTaskForm() {
    this.$input.val("");
    this.$input.trigger("focus");
    this.#updateSubmitButtonState();
    this.#resetEditTaskForm();
  }

  render(state) {
    this.#renderTaskList(state);
    this.#renderTaskHeader(state);
    this.#updateClearAllTasksButtonState(state);
  }

  bindClearAllTasks(handler) {
    this.$buttonClear.off("click.clear-taskflow");
    this.$buttonClear.on("click.clear-taskflow", (e) => {
      e.preventDefault();
      handler();
    });
  }

  bindAddTask(handler) {
    this.$form.off("submit.taskflow");
    this.$form.on("submit.taskflow", (e) => {
      e.preventDefault();
      if (this.$input.data("id")) return; // em edição: não adicionar
      const title = this.$input.val().trim();
      handler(title);
    });
  }

  bindTaskActions({ onToggle, onRemove, onEdit }) {
    this.$list.off("click.taskflow");

    this.$list.on("click.taskflow", '[data-action="toggle"]', (e) => {
      const id = $(e.currentTarget).closest("[data-id]").data("id");
      onToggle(id);
    });

    this.$list.on("click.taskflow", '[data-action="remove"]', (e) => {
      const id = $(e.currentTarget).closest("[data-id]").data("id");
      onRemove(id);
    });

    this.$list.on("click.taskflow", '[data-action="edit"]', (e) => {
      e.preventDefault();
      const id = $(e.currentTarget).data("id");
      const title = $(e.currentTarget).data("title");
      onEdit(id, title);
    });
  }

  bindSaveTask(handler) {
    this.$buttonSave.off("click.taskflow");
    this.$buttonSave.on("click.taskflow", (e) => {
      e.preventDefault();
      const id = this.$input.data("id");
      const title = this.$input.val().trim();
      if (!id || !title) return;
      handler(id, title);
    });
  }
}
