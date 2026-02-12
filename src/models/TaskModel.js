export default class TaskModel {
    #bus;
    #tasks = [];
  
    constructor(eventBus) {
      this.#bus = eventBus;
    }
  
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
      this.#bus.emit("tasks:changed", this.getState());
    }
  
    toggleTask(id) {
      this.#tasks = this.#tasks.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      );
      this.#bus.emit("tasks:changed", this.getState());
    }
  
    removeTask(id) {
      this.#tasks = this.#tasks.filter((item) => item.id !== id);
      this.#bus.emit("tasks:changed", this.getState());
    }
  }
  