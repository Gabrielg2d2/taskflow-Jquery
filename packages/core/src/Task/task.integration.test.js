import { describe, it, expect, beforeEach } from "vitest";
import { TaskApplicationService } from "./index";
import { InMemoryTaskRepository } from "./domain/repositories/InMemoryTaskRepository";
import { LocalStorageAdapter } from "../../../infrastructure/src/storage/LocalStorageAdapter";

class FakeIdGenerator {
  generate() {
    return `id-${Date.now()}-${Math.random()}`;
  }
}

describe("TaskApplicationService Integration", () => {
  let su = TaskApplicationService;

  beforeEach(() => {
    su = new TaskApplicationService({
      taskRepository: new InMemoryTaskRepository(),
      idGenerator: new FakeIdGenerator(),
      storage: new LocalStorageAdapter({ key: "taskflow-test", version: 1 }),
    });
  });

  describe("addTask", () => {
    it("deve adicionar uma tarefa com sucesso", () => {
      const result = su.addTask("Minha tarefa");

      expect(result.ok).toBe(true);
      expect(result.data.task.title).toBe("Minha tarefa");
      expect(result.data.task.done).toBe(false);
      expect(result.data.task).toEqual({
        id: expect.any(String),
        title: "Minha tarefa",
        done: false,
        createdAt: expect.any(Number),
      });
    });
  });

  describe("toggleTask", () => {
    it("deve fazer toggle de uma tarefa com sucesso", () => {
      const result = su.addTask("Minha tarefa");
      expect(result.ok).toBe(true);
      expect(result.data.task.done).toBe(false);

      su.toggleTask(result.data.task.id);
      const result2 = su.getState();
      expect(result2.tasks[0].done).toBe(true);
    });
  });

  describe("removeTask", () => {
    it("deve remover uma tarefa com sucesso", () => {
      const result = su.addTask("Minha tarefa");
      expect(result.ok).toBe(true);
      expect(result.data.task.done).toBe(false);

      su.removeTask(result.data.task.id);
      const result2 = su.getState();
      expect(result2.tasks.length).toBe(0);
    });
  });

  describe("editTask", () => {
    it("deve editar uma tarefa com sucesso", () => {
      const result = su.addTask("Minha tarefa");
      expect(result.ok).toBe(true);
      expect(result.data.task.title).toBe("Minha tarefa");

      su.editTask(result.data.task.id, "Minha tarefa editada");
      const result2 = su.getState();
      expect(result2.tasks[0].title).toBe("Minha tarefa editada");
    });
  });

  describe("clearAllTasks", () => {
    it("deve limpar todas as tarefas com sucesso", () => {
      su.addTask("Minha tarefa");
      su.addTask("Minha tarefa 2");
      su.addTask("Minha tarefa 3");

      su.clearAllTasks();
      const result2 = su.getState();
      expect(result2.tasks.length).toBe(0);
    });
  });
});
