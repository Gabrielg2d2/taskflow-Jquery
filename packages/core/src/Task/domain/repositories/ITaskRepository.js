/**
 * Interface para repositório de tarefas.
 * Qualquer implementação (memória, localStorage, API) deve seguir este contrato.
 * @interface
 */
export class ITaskRepository {
  /**
   * Retorna todas as tarefas
   * @returns {Task[]}
   */
  getAll() {
    throw new Error("Method not implemented");
  }

  /**
   * Busca tarefa por ID
   * @param {string} id
   * @returns {Task|null}
   */
  findById(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Busca tarefa por título (case-insensitive)
   * @param {string} title
   * @param {string|null} excludeId - ID para excluir da busca
   * @returns {Task|null}
   */
  findByTitle(title, excludeId = null) {
    throw new Error("Method not implemented");
  }

  /**
   * Adiciona uma tarefa (no início da lista)
   * @param {Task} task
   */
  add(task) {
    throw new Error("Method not implemented");
  }

  /**
   * Atualiza uma tarefa existente
   * @param {Task} task
   */
  update(task) {
    throw new Error("Method not implemented");
  }

  /**
   * Remove tarefa por ID
   * @param {string} id
   */
  remove(id) {
    throw new Error("Method not implemented");
  }

  /**
   * Remove todas as tarefas
   */
  clear() {
    throw new Error("Method not implemented");
  }

  /**
   * Hidrata o repositório com tarefas existentes
   * @param {Task[]} tasks
   */
  hydrate(tasks) {
    throw new Error("Method not implemented");
  }
}
