import { describe, it, expect, beforeEach } from "vitest";
import { AddTaskUseCase } from "./AddTask.js";
import { InMemoryTaskRepository } from "../repositories/InMemoryTaskRepository.js";

class FakeIdGenerator {
  #counter = 0;
  generate() {
    return `id-${++this.#counter}`;
  }
}

describe("AddTaskUseCase", () => {
  let taskRepository;
  let idGenerator;
  let useCase;

  beforeEach(() => {
    taskRepository = new InMemoryTaskRepository();
    idGenerator = new FakeIdGenerator();
    useCase = new AddTaskUseCase({ taskRepository, idGenerator });
  });

  it("deve adicionar uma tarefa com sucesso", () => {
    const result = useCase.execute("Minha tarefa");

    expect(result.ok).toBe(true);
    expect(result.task).toBeDefined();
    expect(result.task.title).toBe("Minha tarefa");
    expect(result.task.done).toBe(false);
  });

  it("deve normalizar o título (remover espaços extras)", () => {
    const result = useCase.execute("  Minha   tarefa  ");

    expect(result.ok).toBe(true);
    expect(result.task.title).toBe("Minha tarefa");
  });

  it("deve retornar erro quando título vazio", () => {
    const result = useCase.execute("");

    expect(result.ok).toBe(false);
    expect(result.code).toBe("TASK_EMPTY");
  });

  it("deve retornar erro quando título só tem espaços", () => {
    const result = useCase.execute("   ");

    expect(result.ok).toBe(false);
    expect(result.code).toBe("TASK_EMPTY");
  });

  it("deve retornar erro quando tarefa duplicada", () => {
    useCase.execute("Tarefa A");
    const result = useCase.execute("Tarefa A");

    expect(result.ok).toBe(false);
    expect(result.code).toBe("TASK_DUPLICATE");
  });

  it("deve detectar duplicata case-insensitive", () => {
    useCase.execute("Tarefa A");
    const result = useCase.execute("tarefa a");

    expect(result.ok).toBe(false);
    expect(result.code).toBe("TASK_DUPLICATE");
  });

  it("deve adicionar tarefa ao repositório", () => {
    useCase.execute("Tarefa 1");
    useCase.execute("Tarefa 2");

    const tasks = taskRepository.getAll();
    expect(tasks).toHaveLength(2);
  });
});
