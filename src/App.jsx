import AppShell from './components/layout/AppShell'
import { CanvasProvider } from './store/canvasStore'

export default function App() {
  return (
    <CanvasProvider>
      <AppShell />
    </CanvasProvider>
  )
}
