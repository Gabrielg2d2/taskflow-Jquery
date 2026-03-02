import { Task } from "../entities/Task.js";
import { ITaskRepository } from "./ITaskRepository.js";

export class InMemoryTaskRepository extends ITaskRepository {
  #tasks = [];

  getAll() {
    return this.#tasks.map((t) => Task.fromPlainObject(t.toPlainObject()));
  }

  findById(id) {
    const task = this.#tasks.find((t) => t.id === id);
    return task ? Task.fromPlainObject(task.toPlainObject()) : null;
  }

  findByTitle(title, excludeId = null) {
    const normalized = title.toLowerCase();
    const task = this.#tasks.find(
      (t) =>
        t.title.toLowerCase() === normalized &&
        (excludeId === null || t.id !== excludeId)
    );
    return task ? Task.fromPlainObject(task.toPlainObject()) : null;
  }

  add(task) {
    this.#tasks = [task, ...this.#tasks];
  }

  update(task) {
    const idx = this.#tasks.findIndex((t) => t.id === task.id);
    if (idx !== -1) {
      this.#tasks = [
        ...this.#tasks.slice(0, idx),
        task,
        ...this.#tasks.slice(idx + 1),
      ];
    }
  }

  remove(id) {
    this.#tasks = this.#tasks.filter((t) => t.id !== id);
  }

  clear() {
    this.#tasks = [];
  }

  hydrate(tasks) {
    this.#tasks = (tasks ?? []).map((t) =>
      t instanceof Task ? t : Task.fromPlainObject(t)
    );
  }
}
