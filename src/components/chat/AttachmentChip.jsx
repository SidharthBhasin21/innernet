import { File, FileSpreadsheet, FileText, X } from 'lucide-react'
import { formatBytes, openAttachment } from '../../lib/attachments'

const icons = {
  pdf: { icon: FileText, tint: 'bg-(--tone-pink-soft) text-error' },
  sheet: { icon: FileSpreadsheet, tint: 'bg-(--tone-green-soft) text-success' },
  file: { icon: File, tint: 'bg-indigo-soft text-indigo' },
}

const label = (attachment) => (attachment.kind === 'pdf' ? 'PDF' : attachment.name.split('.').pop()?.toUpperCase())

// A non-image attachment: icon, name and size. Opens the file when it has a URL.
export default function AttachmentChip({ attachment, onRemove }) {
  const { icon: Icon, tint } = icons[attachment.kind] ?? icons.file

  return (
    <div className="relative flex min-w-0 items-center gap-2.5 rounded-md border border-gray-200 bg-white py-2 pr-3 pl-2">
      <button
        type="button"
        onClick={() => openAttachment(attachment)}
        disabled={!attachment.url}
        title={attachment.url ? `Open ${attachment.name}` : 'Preview not available after reload'}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-sm text-left focus-ring disabled:cursor-default"
      >
        <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-sm ${tint}`}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-body-s font-medium text-gray-900">{attachment.name}</span>
          <span className="block text-caption text-gray-500">
            {label(attachment)} · {formatBytes(attachment.size)}
          </span>
        </span>
      </button>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove ${attachment.name}`} className="rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 focus-ring">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
