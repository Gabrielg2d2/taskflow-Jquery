class TaskModelValidationError extends Error {
  constructor(result) {
    super(result?.error ?? "Validation failed");
    this.name = "TaskModelValidationError";
    this.result = result;
  }
}

export default class TaskModel {
  #tasks = [];

  #codes = {
    UNKNOWN: "UNKNOWN",
    TASK_EMPTY: "TASK_EMPTY",
    TASK_DUPLICATE: "TASK_DUPLICATE",
    TASK_NOT_FOUND: "TASK_NOT_FOUND",
    TASK_NOT_UPDATABLE: "TASK_NOT_UPDATABLE",
    TASK_NOT_DELETABLE: "TASK_NOT_DELETABLE",
    TASK_NOT_TOGGLEABLE: "TASK_NOT_TOGGLEABLE",
    TASK_NOT_EDITABLE: "TASK_NOT_EDITABLE",
    TASK_NOT_HYDRATABLE: "TASK_NOT_HYDRATABLE",
    TASK_NOT_CLEARABLE: "TASK_NOT_CLEARABLE",
    TASK_NOT_ADDABLE: "TASK_NOT_ADDABLE",
  };

  #getError(code, error) {
    return {
      ok: false,
      code: this.#codes[code] ?? this.#codes.UNKNOWN,
      error: error?.message ?? null,
    };
  }

  #success() {
    return {
      ok: true,
      code: null,
      error: null,
    };
  }

  #normalizeTitle(title) {
    return String(title ?? "")
      .trim()
      .replace(/\s+/g, " ");
  }

  #customError(error, code) {
    if (error?.result) return error.result;
    return this.#getError(code ?? this.#codes.UNKNOWN, error);
  }

  #assertNoEmptyTitleAndNormalize(title) {
    const normalizedTitle = this.#normalizeTitle(title);
    if (!normalizedTitle)
      throw new TaskModelValidationError(
        this.#getError(this.#codes.TASK_EMPTY),
      );
    return normalizedTitle;
  }

  #assertTaskExistsAndReturnIndex(id) { 
    const idx = this.#tasks.findIndex((task) => task.id === id);
    if (idx === -1)
      throw new TaskModelValidationError(
        this.#getError(this.#codes.TASK_NOT_FOUND),
      );
    return idx;
  }


  #assertNoDuplicateTitle(normalizedTitle, excludeId = null) {
    const duplicate = this.#tasks.some(
      (task) =>
        (excludeId == null || task.id !== excludeId) &&
        task.title.toLowerCase() === normalizedTitle.toLowerCase(),
    );
    if (duplicate)
      throw new TaskModelValidationError(
        this.#getError(this.#codes.TASK_DUPLICATE),
      );
  }

  getState() {
    const total = this.#tasks.length;
    const done = this.#tasks.filter((task) => task.done).length;

    return {
      tasks: this.#tasks.slice(),
      stats: {
        total,
        done,
        pending: total - done,
      },
    };
  }

  addTask(newTitle) {
    try {
      const normalizedTitle = this.#assertNoEmptyTitleAndNormalize(newTitle);

      this.#assertNoDuplicateTitle(normalizedTitle);

      const task = {
        id: crypto.randomUUID(),
        title: normalizedTitle,
        done: false,
        createdAt: Date.now(),
      };
      this.#tasks = [task, ...this.#tasks];
      return this.#success();
    } catch (error) {
      return this.#customError(error, this.#codes.TASK_NOT_ADDABLE);
    }
  }

  toggleTask(id) {
    try {
      const idx = this.#assertTaskExistsAndReturnIndex(id);
      const next = this.#tasks.slice();
      next[idx] = { ...next[idx], done: !next[idx].done };
      this.#tasks = next;

      return this.#success();
    } catch (error) {
      return this.#customError(error, this.#codes.TASK_NOT_TOGGLEABLE);
    }
  }

  removeTask(id) {
    try {
      const idx = this.#assertTaskExistsAndReturnIndex(id)
      const next = this.#tasks.slice();
      next.splice(idx, 1);
      this.#tasks = next; 

      return this.#success();
    } catch (error) {
      return this.#customError(error, this.#codes.TASK_NOT_DELETABLE);
    }
  }

  editTask(id, newTitle) {
    try {
      const idx = this.#assertTaskExistsAndReturnIndex(id);
      
      const normalizedNewTitle = this.#assertNoEmptyTitleAndNormalize(newTitle);

      const next = this.#tasks.slice();
      const currentTask = next[idx];

      if (normalizedNewTitle.toLocaleLowerCase() === currentTask.title.toLowerCase()) return this.#success(); 

      this.#assertNoDuplicateTitle(normalizedNewTitle, idx);
      
      currentTask.title = normalizedNewTitle;
      this.#tasks = next;

      return this.#success();
    } catch (error) {
      return this.#customError(error, this.#codes.TASK_NOT_EDITABLE);
    }
  }

  hydrate(tasks) {
    try {
      this.#tasks = Array.isArray(tasks) ? tasks : [];
      return this.#success();
    } catch (error) {
      return this.#customError(error, this.#codes.TASK_NOT_HYDRATABLE);
    }
  }

  clearAll() {
    try {
      this.#tasks = [];
      return this.#success();
    } catch (error) {
      return this.#customError(error, this.#codes.TASK_NOT_CLEARABLE);
    }
  }
}
