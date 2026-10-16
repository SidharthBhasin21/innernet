import ChatComposer from '../chat/ChatComposer'
import { useCanvas } from '../../store/canvasStore'

export const COMPOSER_ID = 'composer'

// Canvas-space wrapper so the composer pans and zooms with the canvas.
export default function ComposerNode() {
  const { composer, startChat, closeComposer } = useCanvas()
  if (!composer) return null

  return (
    <div className="nodrag nopan cursor-auto">
      <ChatComposer
        initialPrompt={composer.prompt}
        onSubmit={(prompt, attachments) => startChat({ prompt, attachments, position: composer.position })}
        onCancel={closeComposer}
      />
    </div>
  )
}
