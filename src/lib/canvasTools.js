import { Frame, Hand, ImageIcon, MousePointer2 } from 'lucide-react'

export const canvasTools = [
  { id: 'select', label: 'Select — click the canvas to start a chat', icon: MousePointer2 },
  { id: 'hand', label: 'Hand — pan the canvas', icon: Hand },
  { id: 'frame', label: 'Frame (coming soon)', icon: Frame, disabled: true },
  { id: 'image', label: 'Image (coming soon)', icon: ImageIcon, disabled: true },
]
