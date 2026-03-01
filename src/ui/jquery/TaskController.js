import { debounce } from "../../@utils/debounce.js";

/**
 * Controller específico para jQuery.
 * Orquestra a comunicação entre TaskApplicationService, View e Router.
 */
export default class TaskController {
  #ui = {
    filter: "all",
    search: "",
    editingTask: null,
  };

  #taskService;
  #view;
  #router;
  #bus;

  constructor({ taskService, view, router, bus }) {
    this.#taskService = taskService;
    this.#view = view;
    this.#router = router;
    this.#bus = bus;
  }

  #sync({
    updateUrlFilter = false,
    updateUrlSearch = false,
    saveStorage = false,
    toast = { message: null, type: "info", actionLabel: null },
  } = {}) {
    if (updateUrlFilter) {
      this.#router.pushFilter(this.#ui.filter, this.#ui.search);
    }
    if (updateUrlSearch) {
      this.#router.replaceSearch(this.#ui.filter, this.#ui.search);
    }

    const currentState = this.#taskService.getState();

    const filteredTasks = this.#taskService.filterTasks(
      currentState.tasks,
      this.#ui.filter,
      this.#ui.search
    );

    const state = { ...currentState, tasks: filteredTasks };

    if (saveStorage) {
      const result = this.#taskService.saveToStorage();
      if (!result.ok) {
        this.#view.showToast("Erro ao salvar tarefas! Tente novamente mais tarde.", {
          type: "warning",
        });
      }
    }

    if (toast.message) {
      this.#view.clearToast();
      this.#view.showToast(toast.message, {
        type: toast.type,
        actionLabel: toast.actionLabel,
      });
    }

    this.#bus.emit("tasks:changed", state);
  }

  #initializeFromUrl() {
    const { filter, search } = this.#router.getParams();
    this.#ui.filter = this.#taskService.normalizeFilter(filter);
    this.#ui.search = this.#taskService.normalizeSearch(search);
    this.#ui.editingTask = null;

    this.#sync();
  }

  #start() {
    this.#taskService.loadFromStorage();
    this.#initializeFromUrl();

    this.#router.onNavigate(() => {
      this.#initializeFromUrl();
    });
  }

  #debouncedSearch = debounce((search) => {
    this.#ui.search = this.#taskService.normalizeSearch(search);
    this.#sync({ updateUrlSearch: true });
  }, 600);

  init() {
    this.#bus.on("tasks:changed", (state) => {
      this.#view.render(state, this.#ui.editingTask, this.#ui.filter, this.#ui.search);
    });

    this.#view.bindHandlers({
      onAdd: (title) => {
        const result = this.#taskService.addTask(title);
        if (!result.ok) {
          return this.#view.showToast("Erro ao adicionar tarefa", { type: "error" });
        }

        this.#ui.editingTask = null;
        this.#ui.filter = "all";
        this.#ui.search = "";

        this.#sync({
          updateUrlFilter: true,
          updateUrlSearch: true,
          saveStorage: true,
          toast: { message: "Tarefa adicionada com sucesso!", type: "success" },
        });
      },

      onClearAll: () => {
        if (!confirm("Tem certeza que deseja limpar todas as tarefas?")) return;

        this.#taskService.clearAllTasks();
        this.#ui.editingTask = null;
        this.#ui.filter = "all";
        this.#ui.search = "";

        this.#sync({
          updateUrlFilter: true,
          updateUrlSearch: true,
          saveStorage: true,
        });
      },

      onToggle: (id) => {
        this.#taskService.toggleTask(id);
        this.#sync({ saveStorage: true });
      },

      onRemove: (id) => {
        if (!confirm("Tem certeza que deseja remover a tarefa?")) return;

        this.#taskService.removeTask(id);
        this.#sync({
          saveStorage: true,
          toast: { message: "Tarefa removida com sucesso!", type: "success" },
        });
      },

      onEdit: (id, title) => {
        this.#ui.editingTask = { id, title };
        this.#sync();
      },

      onSaveEdit: (id, title) => {
        const safe = String(title ?? "").trim();
        if (!safe) return;

        this.#taskService.editTask(id, safe);
        this.#ui.editingTask = null;
        this.#sync({
          saveStorage: true,
          toast: { message: "Tarefa editada com sucesso!", type: "success" },
        });
      },

      onCancelEdit: () => {
        this.#ui.editingTask = null;
        this.#sync();
      },

      onFilter: (filter) => {
        this.#ui.filter = this.#taskService.normalizeFilter(filter);
        this.#sync({ updateUrlFilter: true });
      },

      onSearch: (search) => {
        this.#debouncedSearch(search);
      },
    });

    this.#start();
  }
}
