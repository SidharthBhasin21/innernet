import mark from '../../assets/logo-mark.svg'
import wordmark from '../../assets/logo-wordmark.svg'

// `compact` shows only the app mark (used by the collapsed sidebar).
export default function Logo({ compact = false }) {
  if (compact) return <img src={mark} alt="Innernet" className="h-8 w-auto" />

  return (
    <div className="flex items-center gap-2">
      <img src={mark} alt="" className="h-8 w-auto" />
      <img src={wordmark} alt="Innernet" className="h-5 w-auto" />
    </div>
  )
}
