import { useState, useCallback, useMemo, useEffect } from "react";
import { InMemoryTaskRepository, TaskApplicationService } from "@taskflow/core";
import { LocalStorageAdapter, CryptoIdGenerator } from "@taskflow/infrastructure";

export function useTaskService() {
  const taskService = useMemo(() => {
    const taskRepository = new InMemoryTaskRepository();
    const idGenerator = new CryptoIdGenerator();
    const storage = new LocalStorageAdapter({ key: "taskflow", version: 1 });

    const service = new TaskApplicationService({
      taskRepository,
      idGenerator,
      storage,
    });

    service.loadFromStorage();
    return service;
  }, []);

  const [state, setState] = useState(() => taskService.getState());
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const refreshState = useCallback(() => {
    setState(taskService.getState());
  }, [taskService]);

  const addTask = useCallback(
    (title) => {
      const result = taskService.addTask(title);
      if (result.ok) {
        taskService.saveToStorage();
        refreshState();
      }
      return result;
    },
    [taskService, refreshState]
  );

  const toggleTask = useCallback(
    (id) => {
      taskService.toggleTask(id);
      taskService.saveToStorage();
      refreshState();
    },
    [taskService, refreshState]
  );

  const removeTask = useCallback(
    (id) => {
      taskService.removeTask(id);
      taskService.saveToStorage();
      refreshState();
    },
    [taskService, refreshState]
  );

  const editTask = useCallback(
    (id, newTitle) => {
      const result = taskService.editTask(id, newTitle);
      if (result.ok) {
        taskService.saveToStorage();
        refreshState();
      }
      return result;
    },
    [taskService, refreshState]
  );

  const clearAllTasks = useCallback(() => {
    taskService.clearAllTasks();
    taskService.saveToStorage();
    refreshState();
  }, [taskService, refreshState]);

  const filteredTasks = useMemo(() => {
    return taskService.filterTasks(state.tasks, filter, search);
  }, [taskService, state.tasks, filter, search]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFilter = urlParams.get("filter");
    const urlSearch = urlParams.get("search");

    if (urlFilter && ["all", "pending", "done"].includes(urlFilter)) {
      setFilter(urlFilter);
    }
    if (urlSearch) {
      setSearch(urlSearch);
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams();
    urlParams.set("filter", filter);
    if (search) urlParams.set("search", search);
    else urlParams.delete("search");

    window.history.replaceState({}, "", `?${urlParams.toString()}`);
  }, [filter, search]);

  return {
    state: { ...state, tasks: filteredTasks },
    filter,
    search,
    setFilter,
    setSearch,
    addTask,
    toggleTask,
    removeTask,
    editTask,
    clearAllTasks,
  };
}
