import { describe, it, expect, beforeEach } from "vitest";
import { RemoveTaskUseCase } from "./RemoveTask.js";
import { AddTaskUseCase } from "./AddTask.js";
import { InMemoryTaskRepository } from "../repositories/InMemoryTaskRepository.js";

class FakeIdGenerator {
  #counter = 0;
  generate() {
    return `id-${++this.#counter}`;
  }
}

describe("RemoveTaskUseCase", () => {
  let taskRepository;
  let idGenerator;
  let useCase;

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository();
    idGenerator = new FakeIdGenerator();
    useCase = new RemoveTaskUseCase({ taskRepository });
  });

  describe("Success", () => {
    it("deve remover uma tarefa com sucesso", () => {
      const { task } = new AddTaskUseCase({
        taskRepository,
        idGenerator,
      }).execute("Tarefa");
      const result = useCase.execute(task.id);

      expect(result.ok).toBe(true);
      expect(result.code).toBe(null);
      expect(result.error).toBe(null);
    });
  });

  describe("Error", () => {
    it("deve retornar erro quando tarefa não existe", () => {
      const result = useCase.execute("id-inexistente");

      expect(result.ok).toBe(false);
      expect(result.code).toBe("TASK_NOT_FOUND");
    });

    it("deve retornar erro quando tarefa não pode ser removida", () => {
      const taskRepositoryError = new Error("Task not deletable");
      const useCaseError = new RemoveTaskUseCase({
        taskRepository: taskRepositoryError,
      });

      const result = useCaseError.execute("id-inexistente");

      expect(result.ok).toBe(false);
      expect(result.code).toBe("TASK_NOT_DELETABLE");
      expect(result.error).toBeDefined();
    });
  });
});
