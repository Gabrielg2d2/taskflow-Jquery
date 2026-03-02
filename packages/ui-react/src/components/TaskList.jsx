import TaskItem from "./TaskItem";

export default function TaskList({ tasks, filter, onToggle, onRemove, onEdit }) {
  if (tasks.length === 0) {
    const message =
      filter === "all"
        ? "Nenhuma tarefa ainda. Adicione a primeira acima 🙂"
        : `Nenhuma tarefa ${filter === "pending" ? "pendente" : "feita"} encontrada.`;

    return (
      <ul className="border rounded-2xl p-3 flex items-center justify-between">
        <li className="text-gray-500">{message}</li>
      </ul>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
