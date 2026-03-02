import { Task } from "../entities/Task.js";
import { TaskTitle, TaskTitleEmptyError } from "../value-objects/TaskTitle.js";

export class AddTaskUseCase {
  #taskRepository;
  #idGenerator;

  constructor({ taskRepository, idGenerator }) {
    this.#taskRepository = taskRepository;
    this.#idGenerator = idGenerator;
  }

  execute(rawTitle) {
    try {
      const title = new TaskTitle(rawTitle);

      const duplicate = this.#taskRepository.findByTitle(title.value);
      if (duplicate) {
        return { ok: false, code: "TASK_DUPLICATE", error: "Task already exists" };
      }

      const task = new Task({
        id: this.#idGenerator.generate(),
        title: title.value,
        done: false,
        createdAt: Date.now(),
      });

      this.#taskRepository.add(task);

      return { ok: true, code: null, error: null, task };
    } catch (error) {
      if (error instanceof TaskTitleEmptyError) {
        return { ok: false, code: error.code, error: error.message };
      }
      return { ok: false, code: "TASK_NOT_ADDABLE", error: error.message };
    }
  }
}
