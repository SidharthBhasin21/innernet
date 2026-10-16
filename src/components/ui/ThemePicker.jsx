import { Check, Feather, Moon, Sun } from 'lucide-react'
import { THEMES } from '../../lib/theme'
import useTheme from '../../hooks/useTheme'

const icons = {
  paper: Feather,
  dark: Moon,
  classic: Sun,
}

// A radio list of themes. Used in the desktop settings menu and the mobile profile.
export default function ThemePicker() {
  const [theme, setTheme] = useTheme()

  return (
    <div role="radiogroup" aria-label="Theme" className="flex flex-col gap-0.5">
      {THEMES.map(({ id, label, description }) => {
        const selected = theme === id
        const Icon = icons[id]
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(id)}
            className={`flex w-full items-center gap-3 rounded-sm px-2.5 py-2 text-left transition-colors focus-ring ${
              selected ? 'bg-indigo-soft' : 'hover:bg-gray-100'
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-flex size-8 shrink-0 items-center justify-center rounded-sm ${
                selected ? 'bg-white text-indigo shadow-subtle' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-body-m font-medium text-gray-900">{label}</span>
              <span className="block text-body-s text-gray-500">{description}</span>
            </span>
            {selected && <Check className="size-4 shrink-0 text-indigo" aria-hidden="true" />}
          </button>
        )
      })}
    </div>
  )
}
