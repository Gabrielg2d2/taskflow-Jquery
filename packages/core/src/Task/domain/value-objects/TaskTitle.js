export class TaskTitle {
  #value;

  constructor(raw) {
    const normalized = TaskTitle.normalize(raw);
    if (!normalized) {
      throw new TaskTitleEmptyError();
    }
    this.#value = normalized;
  }

  static normalize(raw) {
    return String(raw ?? "")
      .trim()
      .replace(/\s+/g, " ");
  }

  static isValid(raw) {
    return TaskTitle.normalize(raw).length > 0;
  }

  get value() {
    return this.#value;
  }

  equals(other) {
    if (other instanceof TaskTitle) {
      return this.#value.toLowerCase() === other.value.toLowerCase();
    }
    return this.#value.toLowerCase() === TaskTitle.normalize(other).toLowerCase();
  }

  toString() {
    return this.#value;
  }
}

export class TaskTitleEmptyError extends Error {
  constructor() {
    super("Task title cannot be empty");
    this.name = "TaskTitleEmptyError";
    this.code = "TASK_EMPTY";
  }
}
