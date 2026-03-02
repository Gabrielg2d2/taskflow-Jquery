export class ClearAllTasksUseCase {
  #taskRepository;

  constructor({ taskRepository }) {
    this.#taskRepository = taskRepository;
  }

  execute() {
    try {
      this.#taskRepository.clear();
      return { ok: true, code: null, error: null };
    } catch (error) {
      return { ok: false, code: "TASK_NOT_CLEARABLE", error: error.message };
    }
  }
}
