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

  #updateUrlParamsFilterAndSearch(filter, search) {
    const verifiedFilter = this.#verifyFilter(filter);
    const verifiedSearch = this.#verifySearch(search);

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("filter", verifiedFilter);

    if (!verifiedSearch) {
      urlParams.delete("search");
      window.history.pushState(
        { filter: verifiedFilter },
        "",
        `?${urlParams.toString()}`,
      );
    } else {
      urlParams.set("search", verifiedSearch);
      window.history.pushState(
        { filter: verifiedFilter, search: verifiedSearch },
        "",
        `?${urlParams.toString()}`,
      );
    }
  }

  #getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      filter: this.#verifyFilter(urlParams.get("filter")),
      search: this.#verifySearch(urlParams.get("search")),
    };
  }

  #filterTasks(filter, tasks) {
    const verifiedFilter = this.#verifyFilter(filter);

    if (verifiedFilter === "done") return tasks.filter((task) => task.done);

    if (verifiedFilter === "pending") return tasks.filter((task) => !task.done);

    return tasks;
  }

  #searchTasks(search, tasks) {
    const verifiedSearch = this.#verifySearch(search);

    if (!verifiedSearch) return tasks;

    return tasks.filter((task) =>
      task.title.toLowerCase().includes(verifiedSearch),
    );
  }

  #sync({ updateUrlParams = false, updateStorage = false }) {
    if (updateUrlParams) {
      this.#updateUrlParamsFilterAndSearch(this.#ui.filter, this.#ui.search);
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

  #start() {
    const data = this.storage.load();
    if (data) {
      this.model.hydrate(data.tasks);
    }
    const { filter, search } = this.#getUrlParams();
    this.#ui.filter = filter;
    this.#ui.search = search;
    this.#ui.editingTask = null;

    this.#sync({ updateUrlParams: true, updateStorage: true });
  }

  #debouncedSearch = debounce((search) => {
    this.#ui.search = search;
    this.#sync({ updateUrlParams: true, updateStorage: false });
  }, 500);

  init() {
    this.view.bindAddTask((title) => {
      if (!title?.trim()) return;
      this.model.addTask(title);
      this.#ui.editingTask = null;
      this.#ui.filter = "all";
      this.#ui.search = "";
      this.#sync({ updateUrlParams: true, updateStorage: true });
    });

    this.view.bindRemoveAllTasks(() => {
      if (!confirm("Tem certeza que deseja limpar todas as tarefas?")) return;
      this.model.clearAll();
      this.#ui.editingTask = null;
      this.#ui.filter = "all";
      this.#ui.search = "";
      this.#sync({ updateUrlParams: true, updateStorage: true });
    });

    this.view.bindTaskActions({
      onToggle: (id) => {
        this.model.toggleTask(id);
        this.#sync({ updateUrlParams: false, updateStorage: true });
      },
      onRemove: (id) => {
        if (!confirm("Tem certeza que deseja remover a tarefa?")) return;
        this.model.removeTask(id);
        this.#sync({ updateUrlParams: false, updateStorage: true });
      },
      onEdit: (id, title) => {
        this.#ui.editingTask = { id, title };
        this.#sync({ updateUrlParams: false, updateStorage: false });
      },
    });

    this.view.bindSaveTask((id, title) => {
      this.model.editTask(id, title);
      this.#ui.editingTask = null;
      this.#sync({ updateUrlParams: false, updateStorage: true });
    });

    this.view.bindCancelTask(() => {
      this.#ui.editingTask = null;
      this.#sync({ updateUrlParams: false, updateStorage: false });
    });

    this.view.filterChange((filter) => {
      this.#ui.filter = filter;
      this.#sync({ updateUrlParams: true, updateStorage: false });
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
