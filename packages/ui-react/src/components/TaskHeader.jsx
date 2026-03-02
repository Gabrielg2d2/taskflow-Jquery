export default function TaskHeader({ stats }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-semibold mb-4">
        TaskFlow <span className="text-sm font-normal text-green-500">(React)</span>
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-gray-500">
          Feitas:{" "}
          <strong className="text-gray-700 font-bold">{stats.done}</strong>
        </span>
        <span className="text-gray-500">
          Pendentes:{" "}
          <strong className="text-gray-700 font-bold">{stats.pending}</strong>
        </span>
        <span className="text-gray-500">
          Total:{" "}
          <strong className="text-gray-700 font-bold">{stats.total}</strong>
        </span>
      </div>
    </div>
  );
}
