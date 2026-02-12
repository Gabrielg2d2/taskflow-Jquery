export default class AppController {
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
    this.bus.emit("tasks:changed", state);
  }

  #start() {
    const data = this.storage.load();
    if (data) {
      this.model.hydrate(data.tasks);
      this.#sync();
    }else{
      this.#sync();
    }
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

    this.view.bindClearAllTasks(() => {
      this.model.clearAll();
      this.storage.clear();
      this.#sync();
    });

    // 3) Model -> Controller -> View (reatividade)
    this.#changeBusListener();

    // 4) primeiro render
    this.#start();
    
  }
}
