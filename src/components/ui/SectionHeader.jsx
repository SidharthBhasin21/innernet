import { Plus } from 'lucide-react'

export default function SectionHeader({ title, addLabel }) {
  return (
    <div className="flex items-center justify-between px-3">
      <h2 className="text-body-m font-medium text-gray-500">{title}</h2>
      <button type="button" aria-label={addLabel} className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring">
        <Plus className="size-4" />
      </button>
    </div>
  )
}
