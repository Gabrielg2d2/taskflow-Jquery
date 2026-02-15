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
    this.view.bindAddTask((title) => {
      if (!title.trim()) return;
      this.model.addTask(title);
      this.#sync();
    });

    this.view.bindRemoveAllTasks(() => {
      if (!confirm("Tem certeza que deseja limpar todas as tarefas?")) return;
      this.model.clearAll();
      this.#sync();
    });

    this.view.bindTaskActions({
      onToggle: (id) => {
        this.model.toggleTask(id);
        this.#sync();
      },
      onRemove: (id) => {
        this.model.removeTask(id);
        this.#sync();
      },
      onEdit: (id, title) => {
        this.view.render(this.model.getState(), { id, title });
      },
    });

    this.view.bindSaveTask((id, title) => {
      this.model.editTask(id, title);
      this.#sync();
    });

    this.view.bindCancelTask(() => {
      this.#sync();
    });

    this.#changeBusListener();

    this.#start();
  }
}
