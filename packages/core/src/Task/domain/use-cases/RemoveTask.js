export class RemoveTaskUseCase {
  #taskRepository;

  constructor({ taskRepository }) {
    this.#taskRepository = taskRepository;
  }

  execute(id) {
    try {
      const task = this.#taskRepository.findById(id);

      if (!task) {
        return { ok: false, code: "TASK_NOT_FOUND", error: "Task not found" };
      }

      this.#taskRepository.remove(id);

      return { ok: true, code: null, error: null };
    } catch (error) {
      return { ok: false, code: "TASK_NOT_DELETABLE", error: error.message };
    }
  }
}
