import { describe, it, expect } from "vitest";
import { Task } from "./Task.js";

describe("Task Entity", () => {
  it("deve criar uma task com valores padrão", () => {
    const task = new Task({ id: "1", title: "Test" });

    expect(task.id).toBe("1");
    expect(task.title).toBe("Test");
    expect(task.done).toBe(false);
    expect(task.createdAt).toBeDefined();
  });

  it("deve criar uma task com todos os valores", () => {
    const task = new Task({
      id: "1",
      title: "Test",
      done: true,
      createdAt: 123456,
    });

    expect(task.done).toBe(true);
    expect(task.createdAt).toBe(123456);
  });

  it("deve fazer toggle do status done", () => {
    const task = new Task({ id: "1", title: "Test", done: false });
    const toggled = task.toggle();

    expect(toggled.done).toBe(true);
    expect(toggled.id).toBe(task.id);
    expect(toggled.title).toBe(task.title);
  });

  it("deve atualizar o título", () => {
    const task = new Task({ id: "1", title: "Old" });
    const updated = task.updateTitle("New");

    expect(updated.title).toBe("New");
    expect(updated.id).toBe(task.id);
  });

  it("deve converter para plain object", () => {
    const task = new Task({ id: "1", title: "Test", done: true, createdAt: 123 });
    const plain = task.toPlainObject();

    expect(plain).toEqual({
      id: "1",
      title: "Test",
      done: true,
      createdAt: 123,
    });
  });

  it("deve criar a partir de plain object", () => {
    const plain = { id: "1", title: "Test", done: true, createdAt: 123 };
    const task = Task.fromPlainObject(plain);

    expect(task).toBeInstanceOf(Task);
    expect(task.id).toBe("1");
    expect(task.title).toBe("Test");
    expect(task.done).toBe(true);
  });
});
