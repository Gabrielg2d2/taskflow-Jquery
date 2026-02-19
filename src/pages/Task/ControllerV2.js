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
    const trimmed = String(search).trim().toLowerCase()
    return trimmed === "null" ? "" : trimmed;
  }

  #updateUrlParamsFilterAndSearch(filter, search) {
    const verifiedFilter = this.#verifyFilter(filter);
    const verifiedSearch = this.#verifySearch(search);
    
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("filter", verifiedFilter);
    
    if (!verifiedSearch) {
      urlParams.delete("search");
      window.history.pushState({ filter: verifiedFilter }, "", `?${urlParams.toString()}`);
    } else {
      urlParams.set("search", verifiedSearch);
      window.history.pushState({ filter: verifiedFilter, search: verifiedSearch }, "", `?${urlParams.toString()}`);
    }
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

    return tasks.filter((task) => task.title.toLowerCase().includes(verifiedSearch));
  }

  #sync() {

    this.#updateUrlParamsFilterAndSearch(this.#ui.filter, this.#ui.search);

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
