import { IRouter } from "../../application/ports/IRouter.js";

/**
 * Implementação de router usando History API do browser.
 */
export class BrowserRouter extends IRouter {
  #listeners = new Set();

  constructor() {
    super();
    this.#setupPopstateListener();
  }

  #setupPopstateListener() {
    window.addEventListener("popstate", () => {
      this.#notifyListeners();
    });
  }

  #notifyListeners() {
    const params = this.getParams();
    this.#listeners.forEach((cb) => cb(params));
  }

  getParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      filter: this.#normalizeFilter(urlParams.get("filter")),
      search: this.#normalizeSearch(urlParams.get("search")),
    };
  }

  #normalizeFilter(filter) {
    const allowed = ["all", "pending", "done"];
    return allowed.includes(filter ?? "") ? filter : "all";
  }

  #normalizeSearch(search) {
    const s = String(search ?? "").trim().toLowerCase();
    return s === "undefined" || s === "null" ? "" : s;
  }

  pushFilter(filter, search) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("filter", filter);

    const q = this.#normalizeSearch(search);
    if (q) urlParams.set("search", q);
    else urlParams.delete("search");

    window.history.pushState({ filter, search: q }, "", `?${urlParams.toString()}`);
  }

  replaceSearch(filter, search) {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("filter", filter);

    const q = this.#normalizeSearch(search);
    if (!q) urlParams.delete("search");
    else urlParams.set("search", q);

    window.history.replaceState({ filter, search: q }, "", `?${urlParams.toString()}`);
  }

  onNavigate(callback) {
    this.#listeners.add(callback);
    return () => this.#listeners.delete(callback);
  }
}
