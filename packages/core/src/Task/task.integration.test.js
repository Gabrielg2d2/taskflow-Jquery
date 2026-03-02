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
  describe("Success", () => {
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

  describe("Failure", () => {
    let su = TaskApplicationService;

    beforeEach(() => {
      su = new TaskApplicationService({
        taskRepository: new InMemoryTaskRepository(),
        idGenerator: new FakeIdGenerator(),
        storage: new LocalStorageAdapter({ key: "taskflow-test", version: 1 }),
      });
    });

    it("deve retornar um erro ao adicionar uma tarefa com título vazio", () => {
      const result = su.addTask("");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Task title cannot be empty");
    });

    it("deve retornar um erro ao editar uma tarefa com título vazio", () => {
      const result = su.addTask("Minha tarefa");
      const result2 = su.editTask(result.data.task.id, "");

      expect(result2.ok).toBe(false);
      expect(result2.error).toBe("Task title cannot be empty");
    });

    it("deve retornar um erro ao adicionar uma tarefa com título duplicado", () => {
      su.addTask("Minha tarefa");
      const result = su.addTask("Minha tarefa");

      expect(result.ok).toBe(false);
      expect(result.error).toBe("Task already exists");
    });

    it("deve retornar um erro ao editar uma tarefa com título duplicado", () => {
      su.addTask("Minha tarefa");
      const result = su.addTask("Minha tarefa 2");

      const result2 = su.editTask(result.data.task.id, "Minha tarefa");
      expect(result2.ok).toBe(false);
      expect(result2.error).toBe("Task already exists");
    });

    it("deve retornar um erro ao remover uma tarefa que não existe", () => {
      const result = su.removeTask("123");
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Task not found");
    });

    it("deve retornar um erro ao editar uma tarefa que não existe", () => {
      const result = su.editTask("123", "Minha tarefa");
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Task not found");
    });

    it("deve retornar um erro quando o repositório de tarefas não está implementado", () => {

      const taskService = new TaskApplicationService({
        taskRepository: null,
        idGenerator: new FakeIdGenerator(),
        storage: new LocalStorageAdapter({ key: "taskflow-test", version: 1 }),
      });
      const result = taskService.addTask("Minha tarefa");
      expect(result.ok).toBe(false);
    });

    it("deve retornar um erro quando o limpar todas as tarefas não está implementado", () => {
      const taskService = new TaskApplicationService({
        taskRepository: null,
        idGenerator: new FakeIdGenerator(),
        storage: new LocalStorageAdapter({ key: "taskflow-test", version: 1 }),
      });
      const result = taskService.clearAllTasks();
      expect(result.ok).toBe(false);
      expect(result.code).toBe("TASK_NOT_CLEARABLE");
    });

    it("deve retornar um erro quando o toggle de uma tarefa não está implementado", () => {
      
      const result = su.toggleTask("777");
      expect(result.ok).toBe(false);
      expect(result.code).toBe("TASK_NOT_FOUND");
    });
  });
});
