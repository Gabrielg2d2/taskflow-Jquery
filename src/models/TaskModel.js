export default class TaskModel {
  #tasks = [];

  getState() {
    const total = this.#tasks.length;
    const done = this.#tasks.filter(t => t.done).length;

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
    const task = {
      id: crypto.randomUUID(),
      title,
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

  hydrate(tasks) {
    this.#tasks = Array.isArray(tasks) ? tasks : [];
  }
  
}
