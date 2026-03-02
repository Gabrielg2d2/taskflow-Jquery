const colors = {
  info: "bg-zinc-900 text-white",
  success: "bg-green-600 text-white",
  warning: "bg-amber-500 text-black",
  error: "bg-red-600 text-white",
};

export default function Toast({ message, type = "info", onClose }) {
  const colorClass = colors[type] ?? colors.info;

  return (
    <div
      className={`mb-3 rounded-2xl px-4 py-3 flex items-center justify-between shadow ${colorClass}`}
    >
      <span className="text-sm">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-4 text-sm opacity-80 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
