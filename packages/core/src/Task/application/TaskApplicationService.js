import {
  AddTaskUseCase,
  ToggleTaskUseCase,
  RemoveTaskUseCase,
  EditTaskUseCase,
  ClearAllTasksUseCase,
  GetTasksStateUseCase,
  FilterTasksUseCase,
  HydrateTasksUseCase,
} from "../domain/use-cases/index.js";

/**
 * Serviço de aplicação que orquestra os use cases de tarefas.
 * Esta é a fachada principal que a UI deve usar.
 * Totalmente agnóstico a framework de UI.
 */
export class TaskApplicationService {
  #addTaskUseCase;
  #toggleTaskUseCase;
  #removeTaskUseCase;
  #editTaskUseCase;
  #clearAllTasksUseCase;
  #getTasksStateUseCase;
  #filterTasksUseCase;
  #hydrateTasksUseCase;
  #storage;

  constructor({ taskRepository, idGenerator, storage }) {
    this.#addTaskUseCase = new AddTaskUseCase({ taskRepository, idGenerator });
    this.#toggleTaskUseCase = new ToggleTaskUseCase({ taskRepository });
    this.#removeTaskUseCase = new RemoveTaskUseCase({ taskRepository });
    this.#editTaskUseCase = new EditTaskUseCase({ taskRepository });
    this.#clearAllTasksUseCase = new ClearAllTasksUseCase({ taskRepository });
    this.#getTasksStateUseCase = new GetTasksStateUseCase({ taskRepository });
    this.#filterTasksUseCase = new FilterTasksUseCase();
    this.#hydrateTasksUseCase = new HydrateTasksUseCase({ taskRepository });
    this.#storage = storage;
  }

  addTask(title) {
    return this.#addTaskUseCase.execute(title);
  }

  toggleTask(id) {
    return this.#toggleTaskUseCase.execute(id);
  }

  removeTask(id) {
    return this.#removeTaskUseCase.execute(id);
  }

  editTask(id, newTitle) {
    return this.#editTaskUseCase.execute(id, newTitle);
  }

  clearAllTasks() {
    return this.#clearAllTasksUseCase.execute();
  }

  getState() {
    return this.#getTasksStateUseCase.execute();
  }

  filterTasks(tasks, filter, search) {
    return this.#filterTasksUseCase.execute(tasks, filter, search);
  }

  normalizeFilter(filter) {
    return this.#filterTasksUseCase.normalizeFilter(filter);
  }

  normalizeSearch(search) {
    return this.#filterTasksUseCase.normalizeSearch(search);
  }

  loadFromStorage() {
    const data = this.#storage.load();
    if (data) {
      const tasks = Array.isArray(data) ? data : data.tasks;
      return this.#hydrateTasksUseCase.execute(tasks);
    }
    return { ok: true, code: null, error: null };
  }

  saveToStorage() {
    try {
      const state = this.getState();
      this.#storage.save(state.tasks);
      return { ok: true, code: null, error: null };
    } catch (error) {
      return { ok: false, code: "STORAGE_ERROR", error: error.message };
    }
  }
}
