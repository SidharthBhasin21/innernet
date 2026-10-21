import { BookOpen, Check, Sparkles, X } from 'lucide-react'
import { Handle, Position } from '@xyflow/react'
import Avatar from '../ui/Avatar'
import AddBranch from './AddBranch'
import Thinking from './Thinking'
import { useCanvas } from '../../store/canvasStore'
import { thinkMessage } from '../../lib/trip/planModel'
import { getUser } from '../../data/mockUsers'

// Handles only anchor the lines between nodes; the user never connects by hand.
const anchor = { opacity: 0, pointerEvents: 'none' }

// A phrase the user selected and asked their agent about. It's temporary: it
// stays only until the user keeps it (it becomes a normal node) or discards it.
export default function LookupNode({ plan, node }) {
  const { keepNode, removeNode, addQuestion, focusPlan } = useCanvas()
  const { phrase, answer, temp } = node.spec
  const thinking = node.status === 'thinking'
  const friend = answer.by ? getUser(answer.by) : null

  return (
    <article
      aria-label={thinking ? `Looking up ${phrase}` : `${answer.title}${temp ? ' (temporary)' : ''}`}
      aria-busy={thinking}
      data-lookup-plan={plan.id}
      data-lookup-node={node.id}
      onPointerDown={() => focusPlan(plan.id)}
      className={`w-75 animate-pop-in rounded-xl border bg-white shadow-medium select-text ${temp ? 'border-dashed border-purple/60' : 'border-purple/40'}`}
    >
      <Handle type="target" position={Position.Top} style={anchor} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} style={anchor} isConnectable={false} />

      {thinking ? (
        <Thinking icon={BookOpen} message={thinkMessage(node.spec)} />
      ) : (
        <div className="p-4 animate-pop-in">
          <div className="plan-drag-handle flex cursor-grab items-center gap-2.5 select-none active:cursor-grabbing">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-(--tone-purple-soft) text-purple" aria-hidden="true">
              <BookOpen className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-body-m font-semibold text-gray-900">{answer.title}</h3>
              <p className="truncate text-caption text-gray-500">{answer.query ? `Asked: “${answer.query}”` : `You selected “${phrase}”`}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-caption font-medium ${temp ? 'bg-(--tone-amber-soft) text-warning' : 'bg-(--tone-green-soft) text-success'}`}>{temp ? 'Temporary' : 'Kept'}</span>
          </div>

          <p className="nodrag mt-2.5 flex cursor-auto items-start gap-1.5 text-body-s text-gray-700">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-purple" aria-hidden="true" />
            {answer.meaning}
          </p>
          {answer.tip && <p className="nodrag mt-2 cursor-auto rounded-md bg-(--tone-purple-soft) px-2.5 py-2 text-caption text-gray-700">{answer.tip}</p>}
          {friend && answer.quote && (
            <p className="nodrag mt-2 flex cursor-auto items-start gap-1.5 text-caption text-gray-600">
              <Avatar user={friend} size="xs" />
              <span>
                <span className="font-medium text-gray-800">{friend.name.split(' ')[0]}:</span> “{answer.quote}”
              </span>
            </p>
          )}

          <div className="nodrag mt-3 flex cursor-auto items-center gap-2">
            {temp ? (
              <>
                <button type="button" onClick={() => keepNode(plan.id, node.id)} className="btn btn-primary inline-flex items-center gap-1.5 px-3 py-1 text-body-s">
                  <Check className="size-3.5" aria-hidden="true" />
                  Keep
                </button>
                <button type="button" onClick={() => removeNode(plan.id, node.id)} className="btn btn-secondary inline-flex items-center gap-1.5 px-3 py-1 text-body-s">
                  <X className="size-3.5" aria-hidden="true" />
                  Discard
                </button>
              </>
            ) : (
              <button type="button" onClick={() => removeNode(plan.id, node.id)} className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-body-s text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-ring">
                <X className="size-3.5" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
          {/* Asking more about it means you want it, so it's kept. */}
          <AddBranch
            onAdd={(prompt) => {
              keepNode(plan.id, node.id)
              addQuestion(plan.id, node.id, prompt)
            }}
          />
        </div>
      )}
    </article>
  )
}
