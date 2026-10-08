import { useCallback, useEffect, useRef, useState } from 'react'
import { completeTask, createTask, deleteTask, listTasks, updateTask } from '@/api'
import TaskForm from '@/components/TaskForm'
import TaskList from '@/components/TaskList'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Task, TaskInput } from '@/types'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]) 
  const [loading, setLoading] = useState(true) 
  const [error, setError] = useState('') 
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const taskFormRef = useRef<HTMLDivElement>(null)

  const loadTasks = useCallback(async () => {
    try {
      setTasks(await listTasks())
      setError('')
    } catch {
      setError('Could not load tasks. Is the API running?')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  async function handleCreate(task: TaskInput) {
    await createTask(task)
    await loadTasks()
  }

  async function handleUpdate(task: TaskInput) {
    if (!editingTask) return
    await updateTask(editingTask.id, task)
    setEditingTask(null)
    await loadTasks()
  }

  function handleEdit(task: Task) {
    setEditingTask(task)
    taskFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleComplete(id: number) {
    try {
      await completeTask(id)
      await loadTasks()
    } catch {
      setError('Could not complete the task. Please try again.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTask(id)
      await loadTasks()
    } catch {
      setError('Could not delete the task. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <h1 className="text-xl font-semibold">TaskList</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[360px_1fr]">
        <div ref={taskFormRef}>
          <TaskForm
            key={editingTask?.id ?? 'new-task'}
            task={editingTask ?? undefined}
            onSubmit={editingTask ? handleUpdate : handleCreate}
            onCancel={editingTask ? () => setEditingTask(null) : undefined}
          />
        </div>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <TaskList
            tasks={tasks}
            loading={loading}
            onComplete={handleComplete}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  )
}