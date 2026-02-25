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

  #assertNoEmptyTitle(title) {
    if (!title)
      throw new TaskModelValidationError(
        this.#getError(this.#codes.TASK_EMPTY),
      );
  }

  #assertTaskExists(id) {
    const exists = this.#tasks.some((task) => task.id === id);
    if (!exists)
      throw new TaskModelValidationError(
        this.#getError(this.#codes.TASK_NOT_FOUND),
      );
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
      const normalizedTitle = this.#normalizeTitle(newTitle);

      this.#assertNoEmptyTitle(normalizedTitle);

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
      this.#assertTaskExists(id);

      this.#tasks = this.#tasks.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item,
      );

      return this.#success();
    } catch (error) {
      return this.#customError(error, this.#codes.TASK_NOT_TOGGLEABLE);
    }
  }

  removeTask(id) {
    try {
      this.#assertTaskExists(id);

      this.#tasks = this.#tasks.filter((item) => item.id !== id);

      return this.#success();
    } catch (error) {
      return this.#customError(error, this.#codes.TASK_NOT_DELETABLE);
    }
  }

  editTask(id, newTitle) {
    try {
      this.#assertTaskExists(id);

      const normalizedNewTitle = this.#normalizeTitle(newTitle);

      this.#assertNoEmptyTitle(normalizedNewTitle);

      const task = this.#tasks.find((task) => task.id === id);
      if (normalizedNewTitle === task.title) return this.#success();

      this.#assertNoDuplicateTitle(normalizedNewTitle, id);

      this.#tasks = this.#tasks.map((item) =>
        item.id === id ? { ...item, title: normalizedNewTitle } : item,
      );

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
