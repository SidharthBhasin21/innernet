import { Plus } from 'lucide-react'

// In the collapsed sidebar the header becomes a thin divider.
export default function SectionHeader({ title, addLabel, collapsed = false }) {
  if (collapsed) return <hr aria-hidden="true" className="mx-auto w-8 border-gray-200" />

  return (
    <div className="flex items-center justify-between px-3">
      <h2 className="text-body-m font-medium text-gray-500">{title}</h2>
      <button type="button" aria-label={addLabel} className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring">
        <Plus className="size-4" />
      </button>
    </div>
  )
}
