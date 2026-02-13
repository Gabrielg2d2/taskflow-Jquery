export default class TaskController {
  #unsubTasksChanged;

  constructor({ bus, model, view, storage }) {
    this.bus = bus;
    this.model = model;
    this.view = view;
    this.storage = storage;
  }

  #sync() {
    const state = this.model.getState();
    this.storage.save(state.tasks);
    this.view.resetTaskForm();
    this.bus.emit("tasks:changed", state);
  }

  #start() {
    const data = this.storage.load();
    if (data) {
      this.model.hydrate(data.tasks);
    }
    this.#sync();
  }

  #changeBusListener() {
    this.#unsubTasksChanged?.();
    this.#unsubTasksChanged = this.bus.on("tasks:changed", (state) => {
      this.view.render(state);
    });
  }

  init() {
    // View -> Controller -> Model
    this.view.bindAddTask((title) => {
      if (!title.trim()) return;
      this.model.addTask(title);
      this.#sync();
    });

    // View -> Controller -> Model
    this.view.bindTaskActions({
      onToggle: (id) => {
        this.model.toggleTask(id);
        this.#sync();
      },
      onRemove: (id) => {
        this.model.removeTask(id);
        this.#sync();
      }
    });

    this.view.bindClearAllTasks(() => {
      this.model.clearAll();
      this.storage.clear();
      this.#sync();
    });

    this.view.bindSaveEditTask((id, title) => {
      this.model.editTask(id, title);
      this.#sync();
    });

    this.view.cancelEditTask();

    // Model -> Controller -> View (reatividade)
    this.#changeBusListener();

    // primeiro render
    this.#start();
  }
}
