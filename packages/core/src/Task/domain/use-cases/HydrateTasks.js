export class HydrateTasksUseCase {
  #taskRepository;

  constructor({ taskRepository }) {
    this.#taskRepository = taskRepository;
  }

  execute(tasks) {
    try {
      const taskArray = Array.isArray(tasks) ? tasks : [];
      this.#taskRepository.hydrate(taskArray);
      return { ok: true, code: null, error: null };
    } catch (error) {
      return { ok: false, code: "TASK_NOT_HYDRATABLE", error: error.message };
    }
  }
}
