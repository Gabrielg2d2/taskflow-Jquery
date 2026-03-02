import { useMemo, useCallback } from "react";

export default function TaskToolbar({
  filter,
  search,
  onFilterChange,
  onSearchChange,
}) {
  const filters = useMemo(
    () => [
      { key: "all", label: "Todas" },
      { key: "pending", label: "Pendentes" },
      { key: "done", label: "Feitas" },
    ],
    []
  );

  const handleSearchChange = useCallback(
    (e) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  return (
    <div className="flex gap-2 mb-4">
      <div className="flex-1">
        <input
          type="search"
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar..."
          autoComplete="off"
          className="w-full border rounded-xl px-3 py-2"
        />
      </div>

      {filters.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onFilterChange(key)}
          className={`px-2 py-1 rounded-xl border ${
            filter === key ? "bg-blue-500 text-white" : ""
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
