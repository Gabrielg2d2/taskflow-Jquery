import { describe, it, expect, beforeEach, onTestFailed } from "vitest";
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

    describe("filterAndSearchTasks", () => {
      it("deve retornar sucesso quando filtrar e buscar as tarefas", () => {
        su.addTask("Minha tarefa");
        su.addTask("Minha tarefa 2");
        su.addTask("Minha tarefa 3");

        const result = su.filterTasks(su.getState().tasks, "all", "2");

        expect(result.length).toBe(1);
        expect(result[0].title).toBe("Minha tarefa 2");
      });

      it("deve retornar sucesso quando filtrar e buscar as tarefas, filtro done", () => {
        su.addTask("Minha tarefa");
        su.addTask("Minha tarefa 2");
        su.addTask("Minha tarefa 3");
        su.toggleTask(su.getState().tasks[0].id);
        su.toggleTask(su.getState().tasks[1].id);

        const result = su.filterTasks(su.getState().tasks, "done", "");

        expect(result.length).toBe(2);
        expect(result[0].title).toBe("Minha tarefa 3");
        expect(result[1].title).toBe("Minha tarefa 2");
      });
    });

    describe("filterTasks", () => {
      it("deve retornar sucesso quando filtrar as tarefas, todos os filtros", () => {
        su.addTask("Minha tarefa");
        su.addTask("Minha tarefa 2");
        su.addTask("Minha tarefa 3");

        const result = su.filterTasks(su.getState().tasks, "all", "");
        expect(result.length).toBe(3);
      });

      it("deve retornar sucesso quando filtrar as tarefas, filtro done", () => {
        su.addTask("Minha tarefa");
        su.addTask("Minha tarefa 2");
        su.addTask("Minha tarefa 3");

        const result = su.filterTasks(su.getState().tasks, "done", "");
        expect(result.length).toBe(0);
      });

      it("deve retornar sucesso quando filtrar as tarefas, filtro pending", () => {
        su.addTask("Minha tarefa");
        su.addTask("Minha tarefa 2");
        su.addTask("Minha tarefa 3");

        const result = su.filterTasks(su.getState().tasks, "pending");
        expect(result.length).toBe(3);
      });

      it("deve retornar 2 tarefas filtradas, filtro done", () => {
        su.addTask("Minha tarefa");
        su.addTask("Minha tarefa 2");
        su.addTask("Minha tarefa 3");
        su.toggleTask(su.getState().tasks[0].id);
        su.toggleTask(su.getState().tasks[1].id);

        const result = su.filterTasks(su.getState().tasks, "done");
        expect(result.length).toBe(2);
      });

      it("deve retornar 2 tarefas filtradas, filtro pending", () => {
        su.addTask("Minha tarefa");
        su.addTask("Minha tarefa 2");
        su.addTask("Minha tarefa 3");

        su.toggleTask(su.getState().tasks[2].id);

        const result = su.filterTasks(su.getState().tasks, "pending");

        expect(result.length).toBe(2);
        expect(result[0].title).toBe("Minha tarefa 3");
        expect(result[1].title).toBe("Minha tarefa 2");
      });
    });

    describe("hydrateTasks", () => {
      it("deve retornar sucesso quando hydratar as tarefas", () => {
        const result = su.loadFromStorage();
        expect(result.ok).toBe(true);
        expect(result.code).toBe(null);
        expect(result.error).toBe(null);
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

    describe("hydrateTasks", () => {
      it("deve retornar um erro quando falhar ao hydratar as tarefas", () => {
        const taskService = new TaskApplicationService({
          taskRepository: null,
          idGenerator: new FakeIdGenerator(),
          storage: null,
        });
        const result = taskService.loadFromStorage();

        expect(result.ok).toBe(false);
        expect(result.code).toBe("TASK_NOT_HYDRATABLE");
      });
    });

    describe("addTask", () => {
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

      it("deve retornar um erro quando o repositório de tarefas não está implementado", () => {
        const taskService = new TaskApplicationService({
          taskRepository: null,
          idGenerator: new FakeIdGenerator(),
          storage: new LocalStorageAdapter({
            key: "taskflow-test",
            version: 1,
          }),
        });
        const result = taskService.addTask("Minha tarefa");
        expect(result.ok).toBe(false);
      });
    });

    describe("editTask", () => {
      it("deve retornar um erro ao editar uma tarefa que não existe", () => {
        const result = su.editTask("123", "Minha tarefa");
        expect(result.ok).toBe(false);
        expect(result.error).toBe("Task not found");
      });

      it("deve retornar um erro quando falhar ao editar uma tarefa", () => {
        const taskService = new TaskApplicationService({
          taskRepository: null,
          idGenerator: new FakeIdGenerator(),
          storage: new LocalStorageAdapter({
            key: "taskflow-test",
            version: 1,
          }),
        });
        const result = taskService.editTask("777", "Minha tarefa");

        expect(result.ok).toBe(false);
        expect(result.code).toBe("TASK_NOT_EDITABLE");
      });
    });

    describe("clearAllTasks", () => {
      it("deve retornar um erro quando o limpar todas as tarefas não está implementado", () => {
        const taskService = new TaskApplicationService({
          taskRepository: null,
          idGenerator: new FakeIdGenerator(),
          storage: new LocalStorageAdapter({
            key: "taskflow-test",
            version: 1,
          }),
        });
        const result = taskService.clearAllTasks();
        expect(result.ok).toBe(false);
        expect(result.code).toBe("TASK_NOT_CLEARABLE");
      });

      it("deve retornar um erro quando falhar ao limpar todas as tarefas", () => {
        const taskService = new TaskApplicationService({
          taskRepository: null,
          idGenerator: new FakeIdGenerator(),
          storage: new LocalStorageAdapter({
            key: "taskflow-test",
            version: 1,
          }),
        });
        const result = taskService.clearAllTasks();

        expect(result.ok).toBe(false);
        expect(result.code).toBe("TASK_NOT_CLEARABLE");
      });
    });

    describe("toggleTask", () => {
      it("deve retornar um erro quando o toggle de uma tarefa não está implementado", () => {
        const result = su.toggleTask("777");
        expect(result.ok).toBe(false);
        expect(result.code).toBe("TASK_NOT_FOUND");
      });

      it("deve retornar um erro quando falhar ao toggle de uma tarefa", () => {
        const taskService = new TaskApplicationService({
          taskRepository: null,
          idGenerator: new FakeIdGenerator(),
          storage: new LocalStorageAdapter({
            key: "taskflow-test",
            version: 1,
          }),
        });
        const result = taskService.toggleTask("777");

        expect(result.ok).toBe(false);
        expect(result.code).toBe("TASK_NOT_TOGGLEABLE");
      });
    });

    describe("removeTask", () => {
      it("deve retornar um erro ao remover uma tarefa que não existe", () => {
        const result = su.removeTask("123");
        expect(result.ok).toBe(false);
        expect(result.error).toBe("Task not found");
      });

      it("deve retornar um erro quando falhar ao remover uma tarefa", () => {
        const taskService = new TaskApplicationService({
          taskRepository: null,
          idGenerator: new FakeIdGenerator(),
          storage: new LocalStorageAdapter({
            key: "taskflow-test",
            version: 1,
          }),
        });
        const result = taskService.removeTask("777");
        expect(result.ok).toBe(false);
        expect(result.code).toBe("TASK_NOT_DELETABLE");
      });
    });
  });
});
