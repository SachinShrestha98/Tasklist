import { useCallback, useEffect, useState } from 'react'
import { completeTask, createTask, deleteTask, listTasks } from '@/api'
import TaskForm from '@/components/TaskForm'
import TaskList from '@/components/TaskList'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Task, TaskInput } from '@/types'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]) 
  const [loading, setLoading] = useState(true) 
  const [error, setError] = useState('') 

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
        <TaskForm onSubmit={handleCreate} />

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
            onDelete={handleDelete}
          />
        </div>
      </main>
    </div>
  )
}