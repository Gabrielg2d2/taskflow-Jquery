/**
 * Interface para roteamento/manipulação de URL.
 * @interface
 */
export class IRouter {
  /**
   * Obtém parâmetros atuais da URL
   * @returns {{ filter: string, search: string }}
   */
  getParams() {
    throw new Error("Method not implemented");
  }

  /**
   * Atualiza parâmetro de filtro na URL (push state)
   * @param {string} filter
   * @param {string} search
   */
  pushFilter(filter, search) {
    throw new Error("Method not implemented");
  }

  /**
   * Atualiza parâmetro de busca na URL (replace state)
   * @param {string} filter
   * @param {string} search
   */
  replaceSearch(filter, search) {
    throw new Error("Method not implemented");
  }

  /**
   * Registra callback para mudanças de navegação
   * @param {Function} callback
   * @returns {Function} unsubscribe
   */
  onNavigate(callback) {
    throw new Error("Method not implemented");
  }
}
