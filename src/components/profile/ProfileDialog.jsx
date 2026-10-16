import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import ProfileSummary from './ProfileSummary'
import PersonalAgentCard from './PersonalAgentCard'
import AgentSharingSettings from './AgentSharingSettings'

// Desktop profile: the same account and agent-sharing sections as the mobile
// Profile tab, in a modal over the canvas. A native <dialog> gives us focus
// trapping and Escape-to-close for free.
export default function ProfileDialog({ open, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="profile-dialog-title"
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      className="m-auto max-h-[85vh] w-full max-w-md flex-col overflow-hidden card p-0 text-gray-900 backdrop:bg-black/30 open:flex open:animate-pop-in"
    >
      <header className="flex items-center justify-between px-5 pt-4 pb-2">
        <h2 id="profile-dialog-title" className="text-body-l font-semibold text-gray-900">
          Profile
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 focus-ring"
        >
          <X className="size-5" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6">
        <ProfileSummary />
        <div className="mt-6 flex flex-col gap-6">
          <PersonalAgentCard />
          <AgentSharingSettings />
        </div>
      </div>
    </dialog>
  )
}
