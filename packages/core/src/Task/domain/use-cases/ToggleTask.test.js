import { describe, it, expect, beforeEach } from "vitest";
import { ToggleTaskUseCase } from "./ToggleTask.js";
import { AddTaskUseCase } from "./AddTask.js";
import { InMemoryTaskRepository } from "../repositories/InMemoryTaskRepository.js";

class FakeIdGenerator {
  #counter = 0;
  generate() {
    return `id-${++this.#counter}`;
  }
}

describe("ToggleTaskUseCase", () => {
  let taskRepository;
  let toggleUseCase;
  let addUseCase;

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository();
    const idGenerator = new FakeIdGenerator();
    toggleUseCase = new ToggleTaskUseCase({ taskRepository });
    addUseCase = new AddTaskUseCase({ taskRepository, idGenerator });
  });

  describe("Success", () => {
    it("deve fazer toggle de pending para done", () => {
      const { task } = addUseCase.execute("Tarefa");

      const result = toggleUseCase.execute(task.id);

      expect(result.ok).toBe(true);

      const updated = taskRepository.findById(task.id);
      expect(updated.done).toBe(true);
    });

    it("deve fazer toggle de done para pending", () => {
      const { task } = addUseCase.execute("Tarefa");
      toggleUseCase.execute(task.id);
      toggleUseCase.execute(task.id);

      const updated = taskRepository.findById(task.id);
      expect(updated.done).toBe(false);
    });
  });

  describe("Error", () => {
    it("deve retornar erro quando tarefa não existe", () => {
      const result = toggleUseCase.execute("id-inexistente");

      expect(result.ok).toBe(false);
      expect(result.code).toBe("TASK_NOT_FOUND");
    });
  });
});
