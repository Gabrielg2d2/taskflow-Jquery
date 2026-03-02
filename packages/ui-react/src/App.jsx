import { useState, useCallback } from "react";
import { useTaskService } from "./hooks/useTaskService";
import TaskHeader from "./components/TaskHeader";
import TaskForm from "./components/TaskForm";
import TaskToolbar from "./components/TaskToolbar";
import TaskList from "./components/TaskList";
import Toast from "./components/Toast";

export default function App() {
  const {
    state,
    filter,
    search,
    setFilter,
    setSearch,
    addTask,
    toggleTask,
    removeTask,
    editTask,
    clearAllTasks,
  } = useTaskService();

  const [editingTask, setEditingTask] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  }, []);

  const handleAdd = useCallback(
    (title) => {
      const result = addTask(title);
      if (result.ok) {
        showToast("Tarefa adicionada com sucesso!", "success");
        setFilter("all");
        setSearch("");
      } else {
        showToast("Erro ao adicionar tarefa", "error");
      }
    },
    [addTask, showToast, setFilter, setSearch]
  );

  const handleToggle = useCallback(
    (id) => {
      toggleTask(id);
    },
    [toggleTask]
  );

  const handleRemove = useCallback(
    (id) => {
      if (confirm("Tem certeza que deseja remover a tarefa?")) {
        removeTask(id);
        showToast("Tarefa removida com sucesso!", "success");
      }
    },
    [removeTask, showToast]
  );

  const handleEdit = useCallback((id, title) => {
    setEditingTask({ id, title });
  }, []);

  const handleSaveEdit = useCallback(
    (id, title) => {
      const result = editTask(id, title);
      if (result.ok) {
        setEditingTask(null);
        showToast("Tarefa editada com sucesso!", "success");
      }
    },
    [editTask, showToast]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingTask(null);
  }, []);

  const handleClearAll = useCallback(() => {
    if (confirm("Tem certeza que deseja limpar todas as tarefas?")) {
      clearAllTasks();
      setFilter("all");
      setSearch("");
    }
  }, [clearAllTasks, setFilter, setSearch]);

  return (
    <div className="max-w-xl mx-auto p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <TaskHeader stats={state.stats} />

      <TaskForm
        editingTask={editingTask}
        onAdd={handleAdd}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />

      <button
        onClick={handleClearAll}
        disabled={state.stats.total === 0}
        className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>Limpar tudo</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
      </button>

      <TaskToolbar
        filter={filter}
        search={search}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
      />

      <TaskList
        tasks={state.tasks}
        filter={filter}
        onToggle={handleToggle}
        onRemove={handleRemove}
        onEdit={handleEdit}
      />
    </div>
  );
}
