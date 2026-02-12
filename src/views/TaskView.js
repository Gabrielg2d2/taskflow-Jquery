import $ from "jquery";
import escapeHtml from "../@utils/escapeHtml.js";

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
  sectionTotal: "flex items-center gap-3",
  subtitle: "text-gray-500",
  number: "text-gray-700 font-bold",
};

export default class TaskView {
  #minCharLength = 1;

  constructor(rootSelector) {
    this.$root = $(rootSelector);

    this.$root.html(`
      <div class="${styles.container}">

      <div class="${styles.header}">
        <h1 class="${styles.title}">TaskFlow</h1>
          <div class="${styles.sectionTotal}">
            <span class="${styles.subtitle}">Total: <span class="${styles.number}">0</span></span>
            <span class="${styles.subtitle}">Feitas: <span class="${styles.number}">0</span></span>
            <span class="${styles.subtitle}">Pendentes: <span class="${styles.number}">0</span></span>
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
        </form>

        <ul data-js="task-list" class="${styles.list}"></ul>
      </div>
    `);

    // cache
    this.$form = this.$root.find('[data-js="task-form"]');
    this.$input = this.$root.find('[data-js="task-input"]');
    this.$button = this.$root.find('[data-js="task-submit"]');
    this.$list = this.$root.find('[data-js="task-list"]');

    // watch input changes
    this.$input.on("input", () => this.updateSubmitButtonState());
  }

  bindAddTask(handler) {
    this.$form.on("submit", (e) => {
      e.preventDefault();
      const title = this.$input.val().trim();
      handler(title);
    });
  }

  bindTaskActions({ onToggle, onRemove }) {
    this.$list.on("click", '[data-action="toggle"]', (e) => {
      const id = $(e.currentTarget).closest("[data-id]").data("id");
      onToggle(id);
    });

    this.$list.on("click", '[data-action="remove"]', (e) => {
      const id = $(e.currentTarget).closest("[data-id]").data("id");
      onRemove(id);
    });
  }

  updateSubmitButtonState() {
    const hasValue = this.$input.val().trim().length > this.#minCharLength;
    this.$button.prop("disabled", !hasValue);
    this.$button.toggleClass(styles.buttonDisabled, !hasValue);
  }

  clearInput() {
    this.$input.val("");
    this.$input.trigger("focus");
  }

  resetTaskForm() {
    this.clearInput();
    this.updateSubmitButtonState();
  }

  render(state) {
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
              <button data-action="toggle" class="${styles.itemBtnToggle}">
                ${btnText}
              </button>
              <button data-action="remove" class="${styles.itemBtnRemove}">
                Remover
              </button>
            </div>
          </li>
        `;
      })
      .join("");

    this.$list.html(html);
  }
}
