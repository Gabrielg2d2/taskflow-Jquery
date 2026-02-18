export default class TaskController {
  #unsubTasksChanged;
  #ui = {
    filter: "all",
    search: "",
  };

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

  #updateUrlParams(newFilter) {
    if (!newFilter?.trim()) {
      this.#ui.filter = "all";
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("filter");
      window.history.pushState(
        { filter: "all" },
        "",
        `?${urlParams.toString()}`,
      );
      return;
    }

    const filter = this.#verifyFilter(newFilter);
    this.#ui.filter = filter;
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("filter", filter);
    window.history.pushState({ filter }, "", `?${urlParams.toString()}`);
  }

  #updateUrlParamsWithSearch(newSearch) {
    if (!newSearch?.trim()) {
      this.#ui.search = "";
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.delete("search");
      window.history.pushState({ search: "" }, "", `?${urlParams.toString()}`);
      return;
    }
    this.#ui.search = newSearch;
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("search", newSearch);
    window.history.pushState(
      { search: newSearch },
      "",
      `?${urlParams.toString()}`,
    );
  }

  #updateUrlParamsWithFilterAndSearch(filter, search) {
    this.#updateUrlParams(filter);
    this.#updateUrlParamsWithSearch(search);
  }

  #filterTasks(filter) {
    let tasks = this.model.getState().tasks.slice();

    switch (filter) {
      case "done":
        tasks = tasks.filter((task) => task.done);
        break;
      case "pending":
        tasks = tasks.filter((task) => !task.done);
        break;
      default:
        tasks = tasks;
        break;
    }

    this.#updateUrlParamsWithFilterAndSearch(filter, "");

    return {
      ...this.model.getState(),
      tasks: tasks,
    };
  }

  #changeBusListener() {
    this.#unsubTasksChanged?.();
    this.#unsubTasksChanged = this.bus.on("tasks:changed", (state) => {
      const urlParams = new URLSearchParams(window.location.search);
      const filter = urlParams.get("filter");
      const search = urlParams.get("search");

      this.#updateUrlParamsWithFilterAndSearch(filter, search);

      if (search) {
        this.#searchTasks(search);
        return;
      }

      this.view.render(state, null, this.#ui.filter, this.#ui.search);
    });
  }

  #debounce(fn, delay = 500) {
    let timerId;

    return function (...args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  #searchTasks(search) {
    const trimmedSearch = search?.trim()?.toLowerCase(); 

    if (!trimmedSearch) {
      this.#updateUrlParamsWithFilterAndSearch(this.#ui.filter, "");
      this.view.render(this.model.getState(), null, this.#ui.filter, "");
      return;
    }

    const tasks = this.model
      .getState()
      .tasks.filter((task) => task.title.toLowerCase().includes(trimmedSearch));

    const state = {
      ...this.model.getState(),
      tasks,
    };

    this.#updateUrlParamsWithFilterAndSearch(this.#ui.filter, trimmedSearch);

    this.view.render(state, null, this.#ui.filter, this.#ui.search);
  }

  #debouncedSearchTasks = this.#debounce(this.#searchTasks);

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
        this.view.render(
          this.model.getState(),
          { id, title },
          this.#ui.filter,
          this.#ui.search,
        );
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
      const domainState = this.#filterTasks(filter);
      this.view.render(domainState, null, filter, this.#ui.search);
    });

    this.view.searchChange((search) => {
      this.#debouncedSearchTasks(search);
    });

    this.#changeBusListener();

    this.#start();
  }
}
