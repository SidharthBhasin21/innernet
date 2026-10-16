import { createId } from './chats'

export const ATTACHMENT_LIMITS = {
  maxFiles: 10,
  maxBytes: 20 * 1024 * 1024,
  // Files at or under this size are stored inline so they survive a reload.
  // Larger ones get a session-only preview, since localStorage is only ~5MB.
  maxPersistedBytes: 750 * 1024,
}

export const ACCEPTED_FILES = 'image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.md,.json'

export function attachmentKind(type, name = '') {
  if (type.startsWith('image/')) return 'image'
  if (type === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) return 'pdf'
  if (/sheet|excel|csv/.test(type) || /\.(xlsx?|csv)$/i.test(name)) return 'sheet'
  return 'file'
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

export async function toAttachment(file) {
  const persisted = file.size <= ATTACHMENT_LIMITS.maxPersistedBytes
  return {
    id: createId('file'),
    name: file.name,
    type: file.type,
    size: file.size,
    kind: attachmentKind(file.type, file.name),
    url: persisted ? await readAsDataUrl(file) : URL.createObjectURL(file),
    persisted,
  }
}

// Splits picked files into ones we accept and a reason for any we skip.
export function validateFiles(files, existingCount) {
  const room = ATTACHMENT_LIMITS.maxFiles - existingCount
  const tooBig = files.filter((file) => file.size > ATTACHMENT_LIMITS.maxBytes)
  const ok = files.filter((file) => file.size <= ATTACHMENT_LIMITS.maxBytes)
  const accepted = ok.slice(0, Math.max(room, 0))

  let error = null
  if (tooBig.length) error = `${tooBig[0].name} is larger than ${formatBytes(ATTACHMENT_LIMITS.maxBytes)}.`
  else if (accepted.length < ok.length) error = `You can attach up to ${ATTACHMENT_LIMITS.maxFiles} files at a time.`
  return { accepted, error }
}

// Session-only previews (blob: URLs) can't survive a reload.
export const forStorage = (attachment) => (attachment.persisted ? attachment : { ...attachment, url: null })

// Browsers block opening data: URLs directly, so convert to a blob URL first.
export async function openAttachment(attachment) {
  if (!attachment.url) return
  const url = attachment.url.startsWith('data:') ? URL.createObjectURL(await (await fetch(attachment.url)).blob()) : attachment.url
  window.open(url, '_blank', 'noopener')
}
