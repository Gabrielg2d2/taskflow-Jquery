export class GetTasksStateUseCase {
  #taskRepository;

  constructor({ taskRepository }) {
    this.#taskRepository = taskRepository;
  }

  execute() {
    const tasks = this.#taskRepository.getAll();
    const total = tasks.length;
    const done = tasks.filter((task) => task.done).length;

    return {
      tasks: tasks.map((t) => t.toPlainObject()),
      stats: {
        total,
        done,
        pending: total - done,
      },
    };
  }
}
