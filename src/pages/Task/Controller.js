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

  #verifyFilter(filter) {
    const verifyFilter = ["all", "pending", "done"];
    if (!verifyFilter.includes(filter)) {
      filter = "all";
    }
    return filter;
  }

  #changeBusListener() {
    this.#unsubTasksChanged?.();
    this.#unsubTasksChanged = this.bus.on("tasks:changed", (state) => {
      const urlParams = new URLSearchParams(window.location.search);
      let filter = urlParams.get("filter");

      filter = this.#verifyFilter(filter);

      this.view.render(state, null, filter);
    });
  }

  #debounce(fn, delay = 500) {
    let timerId;

    return function (...args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  #debouncedSearch = this.#debounce((search) => {
    const trimmedSearch = search.trim().toLowerCase();

    if (!trimmedSearch) {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("search");

      let filter = urlParams.get("filter");
      filter = this.#verifyFilter(filter);
      window.history.pushState({ filter }, "", `?${urlParams.toString()}`);

      this.view.render(this.model.getState(), null, filter);
      return;
    }

    const tasks = this.model
      .getState()
      .tasks.filter((task) => task.title.toLowerCase().includes(trimmedSearch));

    const state = {
      ...this.model.getState(),
      tasks,
    };

    const urlParams = new URLSearchParams(window.location.search);
    let filter = urlParams.get("filter");
    filter = this.#verifyFilter(filter);

    urlParams.set("filter", filter);
    urlParams.set("search", trimmedSearch);
    window.history.pushState(
      { filter, search },
      "",
      `?${urlParams.toString()}`,
    );

    this.view.render(state, null, filter, trimmedSearch);
  });

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
        if (!confirm("Tem certeza que deseja remover a tarefa?")) return;
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

    this.view.filterChange((filter) => {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("filter", filter);
      window.history.pushState({ filter }, "", `?${urlParams.toString()}`);

      this.view.render(this.model.getState(), null, filter);
    });

    this.view.searchChange((search) => {
      this.#debouncedSearch(search);
    });

    this.#changeBusListener();

    this.#start();
  }
}
