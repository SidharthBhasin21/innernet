export default function ToolButton({ tool: { id, label, icon: Icon, disabled }, active, onSelect, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center transition-colors focus-ring disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? 'bg-indigo-soft text-indigo' : 'text-gray-700 hover:bg-gray-100'
      } ${className}`}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  )
}
