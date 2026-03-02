export class FilterTasksUseCase {
  static FILTERS = ["all", "pending", "done"];

  execute(tasks, filter, search = "") {
    let filtered = tasks;

    if (filter === "done") {
      filtered = filtered.filter((task) => task.done);
    } else if (filter === "pending") {
      filtered = filtered.filter((task) => !task.done);
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(q)
      );
    }

    return filtered;
  }

  isValidFilter(filter) {
    return FilterTasksUseCase.FILTERS.includes(filter);
  }

  normalizeFilter(filter) {
    return this.isValidFilter(filter) ? filter : "all";
  }

  normalizeSearch(search) {
    const s = String(search ?? "").trim().toLowerCase();
    return s === "undefined" || s === "null" ? "" : s;
  }
}
