import { useState, useEffect, useRef } from "react";

export default function TaskForm({
  editingTask,
  onAdd,
  onSaveEdit,
  onCancelEdit,
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);
  const isEditing = !!editingTask;

  useEffect(() => {
    if (editingTask) {
      setValue(editingTask.title);
      inputRef.current?.focus();
      const len = editingTask.title.length;
      inputRef.current?.setSelectionRange(len, len);
    } else {
      setValue("");
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    if (isEditing) {
      onSaveEdit(editingTask.id, trimmed);
    } else {
      onAdd(trimmed);
      setValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (isEditing && e.key === "Escape") {
      e.preventDefault();
      onCancelEdit();
    }
  };

  const isDisabled = !value.trim();

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isEditing ? "Editar tarefa..." : "Nova tarefa..."}
        autoComplete="off"
        className="flex-1 border rounded-xl px-3 py-2"
      />

      {isEditing ? (
        <>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-xl"
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-red-500 text-white px-4 py-2 rounded-xl"
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          type="submit"
          disabled={isDisabled}
          className="bg-black text-white px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Adicionar
        </button>
      )}
    </form>
  );
}
