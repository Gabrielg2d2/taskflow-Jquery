import { TaskTitle, TaskTitleEmptyError } from "../value-objects/TaskTitle.js";

export class EditTaskUseCase {
  #taskRepository;

  constructor({ taskRepository }) {
    this.#taskRepository = taskRepository;
  }

  execute(id, rawNewTitle) {
    try {
      const task = this.#taskRepository.findById(id);

      if (!task) {
        return { ok: false, code: "TASK_NOT_FOUND", error: "Task not found" };
      }

      const newTitle = new TaskTitle(rawNewTitle);

      if (newTitle.equals(task.title)) {
        return { ok: true, code: null, error: null };
      }

      const duplicate = this.#taskRepository.findByTitle(newTitle.value, id);
      if (duplicate) {
        return { ok: false, code: "TASK_DUPLICATE", error: "Task already exists" };
      }

      const updatedTask = task.updateTitle(newTitle.value);
      this.#taskRepository.update(updatedTask);

      return { ok: true, code: null, error: null };
    } catch (error) {
      if (error instanceof TaskTitleEmptyError) {
        return { ok: false, code: error.code, error: error.message };
      }
      return { ok: false, code: "TASK_NOT_EDITABLE", error: error.message };
    }
  }
}
