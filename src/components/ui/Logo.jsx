import mark from '../../assets/logo-mark.svg'
import wordmark from '../../assets/logo-wordmark.svg'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img src={mark} alt="" className="h-8 w-auto" />
      <img src={wordmark} alt="Innernet" className="h-5 w-auto" />
    </div>
  )
}
