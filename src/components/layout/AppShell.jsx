import { ReactFlowProvider } from '@xyflow/react'
import DesktopShell from './DesktopShell'
import MobileShell from './MobileShell'
import useMediaQuery, { MOBILE_QUERY } from '../../hooks/useMediaQuery'

export default function AppShell() {
  const isMobile = useMediaQuery(MOBILE_QUERY)

  return (
    // The provider sits above both shells so their chat lists and search can move the canvas viewport.
    <ReactFlowProvider>{isMobile ? <MobileShell /> : <DesktopShell />}</ReactFlowProvider>
  )
}
