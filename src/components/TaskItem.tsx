'use client'

import { Check, Clock } from 'lucide-react'

interface TaskItemProps {
  task: { id: string; name: string; points: number }
  completed: boolean
  completedAt: any
  onToggle: (taskId: string) => void
}

export default function TaskItem({ task, completed, completedAt, onToggle }: TaskItemProps) {
  const formatTime = (timestamp: any) => {
    if (!timestamp) return ''
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
        completed
          ? 'task-done border border-gold/15'
          : 'bg-primary/[0.02] border border-primary/5 hover:border-gold/15 hover:bg-primary/[0.04]'
      }`}
    >
      {/* المربع */}
      <input
        type="checkbox"
        checked={completed}
        onChange={() => onToggle(task.id)}
        className="custom-checkbox"
      />

      {/* اسم المهمة */}
      <span
        className={`flex-1 text-sm font-medium leading-relaxed ${
          completed ? 'line-through text-primary/40' : 'text-primary/90'
        }`}
      >
        {task.name}
      </span>

      {/* وقت الإكمال */}
      {completed && completedAt && (
        <div className="flex items-center gap-1 text-xs text-gold/60 flex-shrink-0">
          <Clock size={12} />
          {formatTime(completedAt)}
        </div>
      )}

      {/* النقاط */}
      <div
        className={`flex items-center gap-1 text-xs font-bold flex-shrink-0 px-3 py-1 rounded-full ${
          completed
            ? 'bg-gold/15 text-gold-light'
            : 'bg-primary/5 text-primary/50'
        }`}
      >
        {completed && <Check size={10} />}
        {task.points} نقطة
      </div>
    </div>
  )
}