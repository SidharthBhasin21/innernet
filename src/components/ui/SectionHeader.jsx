import { Plus } from 'lucide-react'

// In the collapsed sidebar the header becomes a thin divider. The `page`
// variant (mobile screens) uses a larger title and can offer "See all".
export default function SectionHeader({ title, addLabel, onAdd, onSeeAll, collapsed = false, variant = 'sidebar' }) {
  if (collapsed) return <hr aria-hidden="true" className="mx-auto w-8 border-gray-200" />

  return (
    <div className="flex items-center justify-between px-3">
      <h2 className={variant === 'page' ? 'text-body-l font-semibold text-gray-900' : 'text-body-m font-medium text-gray-500'}>{title}</h2>
      {onSeeAll ? (
        <button type="button" onClick={onSeeAll} className="rounded-sm px-1 text-body-m font-medium text-indigo hover:text-indigo-hover focus-ring">
          See all
        </button>
      ) : (
        <button type="button" onClick={onAdd} aria-label={addLabel} className="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring">
          <Plus className="size-4" />
        </button>
      )}
    </div>
  )
}
