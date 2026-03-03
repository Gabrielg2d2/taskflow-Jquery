/// <reference types="cypress" />
/// <reference types="@testing-library/cypress" />

describe("TaskFlow - jQuery UI", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("deve exibir mensagem quando não há tarefas", () => {
    cy.findByText(/nenhuma tarefa ainda/i).should("be.visible");
  });

  it("deve adicionar uma tarefa", () => {
    cy.findByPlaceholderText(/nova tarefa/i).type("Minha primeira tarefa");
    cy.findByRole("button", { name: /adicionar/i }).click();

    cy.findByText("Minha primeira tarefa").should("be.visible");
  });

  it("deve desabilitar o botão Adicionar quando input vazio", () => {
    cy.findByRole("button", { name: /adicionar/i }).should("be.disabled");
  });

  it("deve marcar tarefa como feita", () => {
    cy.findByPlaceholderText(/nova tarefa/i).type("Tarefa para marcar");
    cy.findByRole("button", { name: /adicionar/i }).click();

    cy.findByRole("button", { name: /feito/i }).click();

    cy.findByText("Tarefa para marcar")
      .parent()
      .within(() => cy.findByRole("button", { name: /desfazer/i }).should("be.visible"));
  });

  it("deve filtrar por pendentes", () => {
    cy.findByPlaceholderText(/nova tarefa/i).type("Tarefa 1");
    cy.findByRole("button", { name: /adicionar/i }).click();
    cy.findByPlaceholderText(/nova tarefa/i).type("Tarefa 2");
    cy.findByRole("button", { name: /adicionar/i }).click();

    cy.contains("li", "Tarefa 1").within(() => {
      cy.findByRole("button", { name: /feito/i }).click();
    });

    cy.findByRole("button", { name: /pendentes/i }).click();

    cy.findByText("Tarefa 2").should("be.visible");
  });

  it("deve limpar todas as tarefas", () => {
    cy.findByPlaceholderText(/nova tarefa/i).type("Tarefa para limpar");
    cy.findByRole("button", { name: /adicionar/i }).click();

    cy.findByRole("button", { name: /limpar tudo/i }).click();
    cy.on("window:confirm", () => true);

    cy.findByText(/nenhuma tarefa ainda/i).should("be.visible");
  });
});
