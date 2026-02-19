import { debounce } from "../../@utils/debounce";

export default class TaskController {
  #ui = {
    filter: "all",
    search: "",
    editingTask: null,
  };

  constructor({ bus, model, view, storage }) {
    this.bus = bus;
    this.model = model;
    this.view = view;
    this.storage = storage;
  }

  #verifyFilter(filter) {
    const allowed = ["all", "pending", "done"];
    return allowed.includes(filter) ? filter : "all";
  }

  #verifySearch(search) {
    if (search == null) return "";
    return String(search).trim().toLowerCase();
  }

  #updateUrlParamsFilter(filter) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("filter", filter);
    window.history.pushState(
      { filter: filter },
      "",
      `?${urlParams.toString()}`,
    );
  }

  #updateUrlParamsSearch(search) {
    const urlParams = new URLSearchParams(window.location.search);

    if (!search) {
      urlParams.delete("search");
      window.history.replaceState(
        { search: "" },
        "",
        `?${urlParams.toString()}`,
      );
      return;
    }

    urlParams.set("search", search);
    window.history.replaceState(
      { search: search },
      "",
      `?${urlParams.toString()}`,
    );
  }

  #getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      filter: this.#verifyFilter(urlParams.get("filter")),
      search: this.#verifySearch(urlParams.get("search")),
    };
  }

  #filterTasks(filter, tasks) {
    if (filter === "done") return tasks.filter((task) => task.done);

    if (filter === "pending") return tasks.filter((task) => !task.done);

    return tasks;
  }

  #searchTasks(search, tasks) {
    if (!search) return tasks;

    return tasks.filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase()),
    );
  }

  #sync({
    updateUrlParamFilter = false,
    updateUrlParamSearch = false,
    updateStorage = false,
  }) {
    if (updateUrlParamFilter) {
      this.#updateUrlParamsFilter(this.#ui.filter);
    }
    if (updateUrlParamSearch) {
      this.#updateUrlParamsSearch(this.#ui.search);
    }

    const currentState = this.model.getState();

    const filteredTasks = this.#filterTasks(
      this.#ui.filter,
      currentState.tasks,
    );
    const searchedTasks = this.#searchTasks(this.#ui.search, filteredTasks);

    const state = {
      ...currentState,
      tasks: searchedTasks,
    };

    if (updateStorage) {
      this.storage.save(currentState.tasks);
    }

    this.bus.emit("tasks:changed", state);
  }

  #initializeUrlParams() {
    const { filter, search } = this.#getUrlParams();
    this.#ui.filter = filter;
    this.#ui.search = search;
    this.#ui.editingTask = null;

    this.#sync({
      updateUrlParamFilter: false,
      updateUrlParamSearch: false,
      updateStorage: false,
    });
  }

  #start() {
    const data = this.storage.load();
    if (data) {
      this.model.hydrate(Array.isArray(data) ? data : data.tasks);
    }

    this.#initializeUrlParams();

    window.addEventListener("popstate", () => {
      this.#initializeUrlParams();
    });
  }

  #debouncedSearch = debounce((search) => {
    this.#ui.search = search;
    this.#sync({
      updateUrlParamFilter: false,
      updateUrlParamSearch: true,
      updateStorage: false,
    });
  }, 600);

  init() {
    this.view.bindAddTask((title) => {
      if (!title?.trim()) return;
      this.model.addTask(title);
      this.#ui.editingTask = null;
      this.#ui.filter = "all";
      this.#ui.search = "";
      this.#sync({
        updateUrlParamFilter: true,
        updateUrlParamSearch: false,
        updateStorage: true,
      });
    });

    this.view.bindRemoveAllTasks(() => {
      if (!confirm("Tem certeza que deseja limpar todas as tarefas?")) return;
      this.model.clearAll();
      this.#ui.editingTask = null;
      this.#ui.filter = "all";
      this.#ui.search = "";
      this.#sync({
        updateUrlParamFilter: true,
        updateUrlParamSearch: true,
        updateStorage: true,
      });
    });

    this.view.bindTaskActions({
      onToggle: (id) => {
        this.model.toggleTask(id);
        this.#sync({
          updateUrlParamFilter: false,
          updateUrlParamSearch: false,
          updateStorage: true,
        });
      },
      onRemove: (id) => {
        if (!confirm("Tem certeza que deseja remover a tarefa?")) return;
        this.model.removeTask(id);
        this.#sync({
          updateUrlParamFilter: false,
          updateUrlParamSearch: false,
          updateStorage: true,
        });
      },
      onEdit: (id, title) => {
        this.#ui.editingTask = { id, title };
        this.#sync({
          updateUrlParamFilter: false,
          updateUrlParamSearch: false,
          updateStorage: false,
        });
      },
    });

    this.view.bindSaveTask((id, title) => {
      this.model.editTask(id, title);
      this.#ui.editingTask = null;
      this.#sync({
        updateUrlParamFilter: false,
        updateUrlParamSearch: false,
        updateStorage: true,
      });
    });

    this.view.bindCancelTask(() => {
      this.#ui.editingTask = null;
      this.#sync({
        updateUrlParamFilter: false,
        updateUrlParamSearch: false,
        updateStorage: false,
      });
    });

    this.view.filterChange((filter) => {
      this.#ui.filter = filter;
      this.#sync({
        updateUrlParamFilter: true,
        updateUrlParamSearch: false,
        updateStorage: false,
      });
    });

    this.view.searchChange((search) => {
      this.#debouncedSearch(search);
    });

    this.bus.on("tasks:changed", (state) => {
      this.view.render(
        state,
        this.#ui.editingTask,
        this.#ui.filter,
        this.#ui.search,
      );
    });

    this.#start();
  }
}
