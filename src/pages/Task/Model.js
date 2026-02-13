export default class TaskModel {
  #tasks = [];

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

  addTask(title) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const task = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      done: false,
      createdAt: Date.now(),
    };
    this.#tasks = [task, ...this.#tasks];
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
    const trimmedNewTitle = newTitle.trim();
    
    if (!trimmedNewTitle) return;
    if (trimmedNewTitle === currentTitle) return;

    this.#tasks = this.#tasks.map((item) =>
      item.id === id ? { ...item, title: trimmedNewTitle } : item,
    );
  }

  hydrate(tasks) {
    this.#tasks = Array.isArray(tasks) ? tasks : [];
  }

  clearAll() {
    this.#tasks = [];
  }
}
