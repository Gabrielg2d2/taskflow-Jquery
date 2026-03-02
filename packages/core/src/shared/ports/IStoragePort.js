/**
 * Interface para persistência de tarefas.
 * @interface
 */
export class IStoragePort {
  /**
   * Carrega tarefas do storage
   * @returns {{ tasks: object[], version: number } | null}
   */
  load() {
    throw new Error("Method not implemented");
  }

  /**
   * Salva tarefas no storage
   * @param {object[]} tasks
   */
  save(tasks) {
    throw new Error("Method not implemented");
  }

  /**
   * Limpa o storage
   */
  clear() {
    throw new Error("Method not implemented");
  }
  
}
