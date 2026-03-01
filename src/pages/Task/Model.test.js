import { describe, it, expect, beforeEach } from "vitest";
import TaskModel from "./Model.js";

function addAndGetId(model, title) {
  const r = model.addTask(title);
  expect(r.ok).toBe(true);
  
  const state = model.getState();
  expect(state.tasks.length).toBeGreaterThan(0);
  return state.tasks[0].id;
}

describe("TaskModel", () => {
  let model;

  beforeEach(() => {
    model = new TaskModel();
  });

  it("addTask: title vazio => TASK_EMPTY", () => {
    const r = model.addTask("   ");

    expect(r.ok).toBe(false);
    expect(r.code).toBe("TASK_EMPTY");
  });

  it("addTask: normaliza espaços (trim + colapsa)", () => {
    const r = model.addTask("  comprar    pão  ");
    expect(r.ok).toBe(true);

    const { tasks } = model.getState();
    expect(tasks[0].title).toBe("comprar pão");
  });

  it("addTask: duplicado (case-insensitive) => TASK_DUPLICATE", () => {
    expect(model.addTask("Comprar pão").ok).toBe(true);

    const r2 = model.addTask("  comprar PÃO  ");
    expect(r2.ok).toBe(false);
    expect(r2.code).toBe("TASK_DUPLICATE");
  });

  it("toggleTask: id inexistente => TASK_NOT_FOUND", () => {
    const r = model.toggleTask("nao-existe");

    expect(r.ok).toBe(false);
    expect(r.code).toBe("TASK_NOT_FOUND");
  });

  it("toggleTask: alterna done", () => {
    const id = addAndGetId(model, "A");
    let state = model.getState();
    expect(state.tasks[0].done).toBe(false);

    const r = model.toggleTask(id);
    expect(r.ok).toBe(true);

    state = model.getState();
    expect(state.tasks[0].done).toBe(true);
  });

  it("removeTask: id inexistente => TASK_NOT_FOUND", () => {
    const r = model.removeTask("nao-existe");
    expect(r.ok).toBe(false);
    expect(r.code).toBe("TASK_NOT_FOUND");
  });

  it("removeTask: remove e atualiza stats", () => {
    addAndGetId(model, "A");
    const idB = addAndGetId(model, "B");

    expect(model.getState().stats.total).toBe(2);

    const r = model.removeTask(idB);
    expect(r.ok).toBe(true);

    const st = model.getState();
    expect(st.stats.total).toBe(1);
    expect(st.tasks.some((t) => t.id === idB)).toBe(false);
  });

  it("editTask: id inexistente => TASK_NOT_FOUND", () => {
    const r = model.editTask("nao-existe", "Novo");

    expect(r.ok).toBe(false);
    expect(r.code).toBe("TASK_NOT_FOUND");
  });

  it("editTask: vazio => TASK_EMPTY", () => {
    const id = addAndGetId(model, "A");
    const r = model.editTask(id, "   ");

    expect(r.ok).toBe(false);
    expect(r.code).toBe("TASK_EMPTY");
  });

  it("editTask: mesmo título => ok", () => {
    const id = addAndGetId(model, "A");
    const r = model.editTask(id, "A");

    expect(r.ok).toBe(true);
  });

  it("editTask: duplicado (em outra task) => TASK_DUPLICATE", () => {
    const idA = addAndGetId(model, "A");
    addAndGetId(model, "B");

    const r = model.editTask(idA, "B");
    expect(r.ok).toBe(false);
    expect(r.code).toBe("TASK_DUPLICATE");
  });

  it("hydrate: aceita array e reflete no state", () => {
    const tasks = [
      { id: "1", title: "X", done: false, createdAt: 1 },
      { id: "2", title: "Y", done: true, createdAt: 2 },
    ];
    const r = model.hydrate(tasks);
    expect(r.ok).toBe(true);

    const st = model.getState();
    expect(st.stats.total).toBe(2);
    expect(st.stats.done).toBe(1);
    expect(st.stats.pending).toBe(1);
  });

  it("clearAll: zera tasks e stats", () => {
    addAndGetId(model, "A");
    expect(model.getState().stats.total).toBe(1);

    const r = model.clearAll();
    expect(r.ok).toBe(true);

    const st = model.getState();
    expect(st.stats.total).toBe(0);
    expect(st.tasks.length).toBe(0);
  });
});
