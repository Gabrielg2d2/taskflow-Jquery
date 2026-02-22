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
  };

  #getError(code) {
    return {
      ok: false,
      code,
    };
  }

  #success() {
    return {
      ok: true,
      code: null,
    };
  }

  #normalizeTitle(title) {
    return String(title ?? "")
      .trim()
      .replace(/\s+/g, " ");
  }

  getState() {
    const total = this.#tasks.length;
    const done = this.#tasks.filter((t) => t.done).length;

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
      if (!normalizedTitle) return this.#getError(this.#codes.TASK_EMPTY);

      const task = {
        id: crypto.randomUUID(),
        title: normalizedTitle,
        done: false,
        createdAt: Date.now(),
      };
      this.#tasks = [task, ...this.#tasks];
      return this.#success();
    } catch (error) {
      return this.#getError(this.#codes.UNKNOWN);
    }
  }

  toggleTask(id) {
    this.#tasks = this.#tasks.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item,
    );
  }

  removeTask(id) {
    this.#tasks = this.#tasks.filter((item) => item.id !== id);
  }

  editTask(id, newTitle) {
    const currentTitle = this.#tasks.find((item) => item.id === id)?.title;

    const normalizedNewTitle = this.#normalizeTitle(newTitle);

    if (!normalizedNewTitle) return;
    if (normalizedNewTitle === currentTitle) return;

    this.#tasks = this.#tasks.map((item) =>
      item.id === id ? { ...item, title: normalizedNewTitle } : item,
    );
  }

  hydrate(tasks) {
    this.#tasks = Array.isArray(tasks) ? tasks : [];
  }

  clearAll() {
    this.#tasks = [];
  }
}
