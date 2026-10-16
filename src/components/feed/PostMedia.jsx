import { FileText, Sparkles } from 'lucide-react'

const tiles = {
  amber: 'from-warning/80 to-pink/70',
  pink: 'from-pink/70 to-purple/70',
  purple: 'from-purple/70 to-indigo/80',
  blue: 'from-blue/70 to-indigo/60',
}

export default function PostMedia({ media }) {
  if (media.type === 'grid') {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 overflow-hidden rounded-md">
        {media.tones.map((tone, i) => (
          <div key={i} className={`aspect-[16/10] bg-gradient-to-br ${tiles[tone]}`} />
        ))}
      </div>
    )
  }
  if (media.type === 'banner') {
    return (
      <div className={`mt-3 flex aspect-[16/7] items-center justify-center rounded-md bg-gradient-to-br ${tiles[media.tone]}`}>
        <Sparkles className="size-6 text-white/90" aria-hidden="true" />
      </div>
    )
  }
  if (media.type === 'progress') {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-md border border-gray-200 p-3">
        <div className="min-w-0 flex-1">
          <p className="text-body-m font-semibold text-gray-900">{media.label}</p>
          <p className="mt-1 text-caption text-indigo">{media.value}%</p>
          <div className="mt-1 h-1.5 rounded-full bg-gray-100" role="progressbar" aria-valuenow={media.value} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-indigo" style={{ width: `${media.value}%` }} />
          </div>
        </div>
        <div className="aspect-[4/3] w-24 rounded-sm bg-gradient-to-br from-gray-700 to-gray-900" />
      </div>
    )
  }
  return (
    <div className="mt-3 grid grid-cols-2 gap-1">
      {[0, 1].map((i) => (
        <div key={i} className="flex aspect-[4/3] items-center justify-center rounded-sm border border-gray-200 bg-gray-100">
          <FileText className="size-5 text-gray-400" aria-hidden="true" />
        </div>
      ))}
    </div>
  )
}
