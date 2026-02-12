export default class AppController {
  #unsubTasksChanged;

  constructor({ bus, model, view, storage }) {
    this.bus = bus;
    this.model = model;
    this.view = view;
    this.storage = storage;
  }

  #sync() {
    this.bus.emit("tasks:changed", this.model.getState());
  }

  #saveToStorage() {
    this.storage.save(this.model.getState().tasks);
  }

  #loadFromStorage() {
    const data = this.storage.load();
    if (data) {
      this.model.hydrate(data.tasks);
    }
  }

  #clearStorage() {
    this.storage.clear();
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
      this.#saveToStorage();
      this.view.resetTaskForm();
      this.#sync();
    });

    // 2) View -> Controller -> Model
    this.view.bindTaskActions({
      onToggle: (id) => {
        this.model.toggleTask(id);
        this.#saveToStorage();
        this.#sync();
      },
      onRemove: (id) => {
        this.model.removeTask(id);  
        this.#saveToStorage();
        this.#sync();
      },
    });

    // 3) Model -> Controller -> View (reatividade)
    this.#changeBusListener();

    // 4) primeiro render
    this.#loadFromStorage();
    this.#sync();
  }
}
