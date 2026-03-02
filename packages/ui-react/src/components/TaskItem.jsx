import { useCallback } from "react";

export default function TaskItem({ task, onToggle, onRemove, onEdit }) {
  const handleToggle = useCallback(() => {
    onToggle(task.id);
  }, [onToggle, task.id]);

  const handleRemove = useCallback(() => {
    onRemove(task.id);
  }, [onRemove, task.id]);

  const handleEdit = useCallback(() => {
    onEdit(task.id, task.title);
  }, [onEdit, task.id, task.title]);

  return (
    <li className="border rounded-2xl p-3 flex items-center justify-between">
      <span className={task.done ? "line-through text-gray-400" : ""}>
        {task.title}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleToggle}
          className="px-3 py-1 rounded-xl border"
        >
          {task.done ? "Desfazer" : "Feito"}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          className="px-3 py-1 rounded-xl border text-red-600"
        >
          Remover
        </button>
        <button
          type="button"
          onClick={handleEdit}
          className="px-3 py-1 rounded-xl border text-blue-600"
        >
          Editar
        </button>
      </div>
    </li>
  );
}
