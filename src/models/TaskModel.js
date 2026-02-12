export default class TaskModel {
  #tasks = [];

  getState() {
    return {
      tasks: this.#tasks.slice(),
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
}
