import { ImageOff, X } from 'lucide-react'
import AttachmentChip from './AttachmentChip'
import { openAttachment } from '../../lib/attachments'

function ImageThumb({ attachment, onRemove, size }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100 ${size}`}>
      {attachment.url ? (
        <button type="button" onClick={() => openAttachment(attachment)} title={`Open ${attachment.name}`} className="block size-full focus-ring">
          <img src={attachment.url} alt={attachment.name} className="size-full object-cover" />
        </button>
      ) : (
        <span title={`${attachment.name} (preview not available after reload)`} className="flex size-full items-center justify-center text-gray-400">
          <ImageOff className="size-5" aria-hidden="true" />
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${attachment.name}`}
          className="absolute top-1 right-1 rounded-full bg-gray-900/70 p-0.5 text-white hover:bg-gray-900 focus-ring"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  )
}

// Images as thumbnails, everything else as file chips. `onRemove` makes them editable (composer).
export default function AttachmentList({ attachments, onRemove, compact = false }) {
  if (!attachments?.length) return null
  const images = attachments.filter((a) => a.kind === 'image')
  const files = attachments.filter((a) => a.kind !== 'image')

  return (
    <div className="flex flex-col gap-1.5">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {images.map((a) => (
            <ImageThumb key={a.id} attachment={a} size={compact ? 'size-14' : 'size-24'} onRemove={onRemove && (() => onRemove(a.id))} />
          ))}
        </div>
      )}
      {files.map((a) => (
        <AttachmentChip key={a.id} attachment={a} onRemove={onRemove && (() => onRemove(a.id))} />
      ))}
    </div>
  )
}
