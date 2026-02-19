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
    const verifyFilter = ["all", "pending", "done"];
    if (!verifyFilter.includes(filter)) {
      filter = "all";
    }

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("filter", filter);
    window.history.pushState({ filter }, "", `?${urlParams.toString()}`);

    return filter;
  }

  #verifySearch(search) {
    search = search?.trim()?.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);

    if (!search) {
      urlParams.delete("search");
      window.history.pushState({ search: "" }, "", `?${urlParams.toString()}`);
      return "";
    }

    urlParams.set("search", search);
    window.history.pushState({ search }, "", `?${urlParams.toString()}`);

    return search;
  }

  #filterTasks(filter, tasks) {
    filter = this.#verifyFilter(filter);

    if (filter === "done") return tasks.filter((task) => task.done);

    if (filter === "pending") return tasks.filter((task) => !task.done);

    return tasks;
  }

  #searchTasks(search, tasks) {
    search = this.#verifySearch(search);

    if (!search) return tasks;

    return tasks.filter((task) => task.title.toLowerCase().includes(search));
  }

  #sync() {
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

    this.storage.save(currentState.tasks);
    this.bus.emit("tasks:changed", state);
  }

  #start() {
    const data = this.storage.load();
    if (data) {
      this.model.hydrate(data.tasks);
    }
    const urlParams = new URLSearchParams(window.location.search);
    const getFilter = urlParams.get("filter");
    const getSearch = urlParams.get("search");

    this.#ui.filter = this.#verifyFilter(getFilter);
    this.#ui.search = this.#verifySearch(getSearch);
    this.#ui.editingTask = null;

    this.#sync();
  }

  #debouncedSearch = debounce((search) => {
    this.#ui.search = search;
    this.#sync();
  }, 500);

  init() {
    this.view.bindAddTask((title) => {
      if (!title?.trim()) return;
      this.model.addTask(title);
      this.#ui.editingTask = null;
      this.#ui.filter = "all";
      this.#ui.search = "";
      this.#sync();
    });

    this.view.bindRemoveAllTasks(() => {
      if (!confirm("Tem certeza que deseja limpar todas as tarefas?")) return;
      this.model.clearAll();
      this.#ui.editingTask = null;
      this.#ui.filter = "all";
      this.#ui.search = "";
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
        this.#ui.editingTask = { id, title };
        this.#sync();
      },
    });

    this.view.bindSaveTask((id, title) => {
      this.model.editTask(id, title);
      this.#ui.editingTask = null;
      this.#sync();
    });

    this.view.bindCancelTask(() => {
      this.#ui.editingTask = null;
      this.#sync();
    });

    this.view.filterChange((filter) => {
      this.#ui.filter = filter;
      this.#sync();
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
