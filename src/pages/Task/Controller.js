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
    return allowed.includes(filter ?? "") ? filter : "all";
  }

  #verifySearch(search) {
    const s = String(search ?? "").trim().toLowerCase();
    return s === "undefined" || s === "null" ? "" : s;
  }

  #updateUrlParamsFilter(filter) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("filter", filter);

    // mantém search atual na URL (se existir)
    const q = this.#verifySearch(this.#ui.search);
    if (q) urlParams.set("search", q);
    else urlParams.delete("search");

    window.history.pushState({ filter, search: q }, "", `?${urlParams.toString()}`);
  }

  #updateUrlParamsSearch(search) {
    const urlParams = new URLSearchParams(window.location.search);

    // mantém filter atual na URL
    urlParams.set("filter", this.#ui.filter);

    const q = this.#verifySearch(search);
    if (!q) urlParams.delete("search");
    else urlParams.set("search", q);

    window.history.replaceState(
      { filter: this.#ui.filter, search: q },
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
    const q = search.toLowerCase();
    return tasks.filter((task) => task.title.toLowerCase().includes(q));
  }

  #sync({ updateUrlParamFilter = false, updateUrlParamSearch = false, updateStorage = false } = {}) {
    if (updateUrlParamFilter) this.#updateUrlParamsFilter(this.#ui.filter);
    if (updateUrlParamSearch) this.#updateUrlParamsSearch(this.#ui.search);

    const currentState = this.model.getState();

    const filteredTasks = this.#filterTasks(this.#ui.filter, currentState.tasks);
    const searchedTasks = this.#searchTasks(this.#ui.search, filteredTasks);

    const state = { ...currentState, tasks: searchedTasks };

    if (updateStorage) this.storage.save(currentState.tasks);

    this.bus.emit("tasks:changed", state);
  }

  #initializeUrlParams() {
    const { filter, search } = this.#getUrlParams();
    this.#ui.filter = filter;
    this.#ui.search = search;
    this.#ui.editingTask = null;

    this.#sync(); // render baseado na URL atual
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
    this.#ui.search = this.#verifySearch(search);
    this.#sync({ updateUrlParamSearch: true });
  }, 600);

  init() {
    // 1) Bus -> View (render centralizado)
    this.bus.on("tasks:changed", (state) => {
      this.view.render(state, this.#ui.editingTask, this.#ui.filter, this.#ui.search);
    });

    // 2) View -> Controller (bind único)
    this.view.bindHandlers({
      onAdd: (title) => {
        const safe = String(title ?? "").trim();
        if (!safe) return;

        this.model.addTask(safe);
        this.#ui.editingTask = null;

        // comportamento que você já tinha: resetar UI ao adicionar
        this.#ui.filter = "all";
        this.#ui.search = "";

        this.#sync({ updateUrlParamFilter: true, updateUrlParamSearch: true, updateStorage: true });
      },

      onClearAll: () => {
        if (!confirm("Tem certeza que deseja limpar todas as tarefas?")) return;

        this.model.clearAll();
        this.#ui.editingTask = null;
        this.#ui.filter = "all";
        this.#ui.search = "";

        this.#sync({ updateUrlParamFilter: true, updateUrlParamSearch: true, updateStorage: true });
      },

      onToggle: (id) => {
        this.model.toggleTask(id);
        this.#sync({ updateStorage: true });
      },

      onRemove: (id) => {
        if (!confirm("Tem certeza que deseja remover a tarefa?")) return;

        this.model.removeTask(id);
        this.#sync({ updateStorage: true });
      },

      onEdit: (id, title) => {
        this.#ui.editingTask = { id, title };
        this.#sync();
      },

      onSaveEdit: (id, title) => {
        const safe = String(title ?? "").trim();
        if (!safe) return;

        this.model.editTask(id, safe);
        this.#ui.editingTask = null;
        this.#sync({ updateStorage: true });
      },

      onCancelEdit: () => {
        this.#ui.editingTask = null;
        this.#sync();
      },

      onFilter: (filter) => {
        this.#ui.filter = this.#verifyFilter(filter);
        this.#sync({ updateUrlParamFilter: true });
      },

      onSearch: (search) => {
        this.#debouncedSearch(search);
      },
    });

    // 3) Start
    this.#start();
  }
}