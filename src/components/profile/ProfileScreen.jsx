import { Palette } from 'lucide-react'
import ThemePicker from '../ui/ThemePicker'
import ProfileSummary from './ProfileSummary'
import PersonalAgentCard from './PersonalAgentCard'
import AgentSharingSettings from './AgentSharingSettings'

// Mobile "Profile" tab: the account, its single personal agent, what that agent may share, and the theme.
export default function ProfileScreen() {
  return (
    <div className="h-full overflow-y-auto overscroll-contain px-4 pt-2 pb-8">
      <ProfileSummary />

      <div className="mt-6 flex flex-col gap-6">
        <PersonalAgentCard />
        <AgentSharingSettings />

        <section aria-labelledby="theme-heading">
          <div className="flex items-center gap-2 px-1">
            <Palette className="size-5 text-indigo" aria-hidden="true" />
            <h3 id="theme-heading" className="text-body-l font-semibold text-gray-900">
              Theme
            </h3>
          </div>
          <div className="mt-3 rounded-lg border border-gray-200 bg-white p-1">
            <ThemePicker />
          </div>
        </section>
      </div>
    </div>
  )
}
