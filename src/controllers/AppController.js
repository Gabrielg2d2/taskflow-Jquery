export default class AppController {
  #unsubTasksChanged;

  constructor({ bus, model, view }) {
    this.bus = bus;
    this.model = model;
    this.view = view;
  }

  #sync() {
    this.bus.emit("tasks:changed", this.model.getState());
  }

  #changeBusListener() {
    this.#unsubTasksChanged?.();
    this.#unsubTasksChanged = this.bus.on("tasks:changed", (state) => {
      this.view.render(state);
    });
  }

  init() {
    // 1) View -> Controller -> Model
    this.view.bindAddTask((title) => {
      if (!title.trim()) return; // validação mínima
      this.model.addTask(title);
      this.view.resetTaskForm();
      this.#sync();
    });

    // 2) View -> Controller -> Model
    this.view.bindTaskActions({
      onToggle: (id) => {
        this.model.toggleTask(id);
        this.#sync();
      },
      onRemove: (id) => {
        this.model.removeTask(id);
        this.#sync();
      },
    });

    // 3) Model -> Controller -> View (reatividade)
    this.#changeBusListener();

    // 4) primeiro render
    this.#sync();
  }
}
