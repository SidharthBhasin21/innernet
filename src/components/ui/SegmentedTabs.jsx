// Pill-style tab switcher used by the mobile screens.
export default function SegmentedTabs({ tabs, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="flex rounded-lg bg-gray-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={value === tab}
          onClick={() => onChange(tab)}
          className={`flex-1 rounded-md py-2 text-body-m font-medium transition-colors focus-ring ${
            value === tab ? 'bg-white text-indigo shadow-subtle' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
