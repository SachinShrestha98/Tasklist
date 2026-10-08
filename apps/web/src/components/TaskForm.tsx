import { useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Task, TaskInput } from '@/types'

type ReminderUnit = 'minutes' | 'hours' | 'days'
 
const UNIT_MINUTES: Record<ReminderUnit, number> = { minutes: 1, hours: 60, days: 1440 }

interface TaskFormProps {
  onSubmit: (task: TaskInput) => Promise<void>
  task?: Task
  onCancel?: () => void
}

const emptyForm = { header: '', description: '', assignee_email: '', deadline: '' }

function toLocalDateTime(value: string) {
  const date = new Date(value)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

function getInitialForm(task?: Task) {
  if (!task) return emptyForm
  return {
    header: task.header,
    description: task.description,
    assignee_email: task.assignee_email,
    deadline: toLocalDateTime(task.deadline),
  }
}

function getInitialReminder(task?: Task) {
  const minutes = task?.remind_before_minutes ?? 60
  if (minutes % 1440 === 0) return { amount: String(minutes / 1440), unit: 'days' as const }
  if (minutes % 60 === 0) return { amount: String(minutes / 60), unit: 'hours' as const }
  return { amount: String(minutes), unit: 'minutes' as const }
}

export default function TaskForm({ onSubmit, task, onCancel }: TaskFormProps) {
  const [form, setForm] = useState(() => getInitialForm(task))
  const [initialReminder] = useState(() => getInitialReminder(task))
  const [remindAmount, setRemindAmount] = useState(initialReminder.amount)
  const [remindUnit, setRemindUnit] = useState<ReminderUnit>(initialReminder.unit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function setField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await onSubmit({
        ...form,
        deadline: new Date(form.deadline).toISOString(),
        remind_before_minutes: Math.round(Number(remindAmount) * UNIT_MINUTES[remindUnit]),
      })
      setForm(emptyForm)
      setRemindAmount('1')
      setRemindUnit('hours')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the task. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="self-start">
      <CardHeader>
        <CardTitle>{task ? 'Edit task' : 'New task'}</CardTitle>
        <CardDescription>
          {task
            ? 'Update the task details and reminder schedule.'
            : 'The assignee gets an email when the task is completed, and a reminder at the time you choose before the deadline.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="header">Header</Label>
            <Input
              id="header"
              placeholder="Finish the report"
              value={form.header}
              onChange={(e) => setField('header', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What needs to be done?"
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Assignee email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={form.assignee_email}
              onChange={(e) => setField('assignee_email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setField('deadline', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remind-amount">Remind the assignee</Label>
            <div className="flex items-center gap-2">
              <Input
                id="remind-amount"
                type="number"
                min={1}
                step={1}
                className="w-24"
                value={remindAmount}
                onChange={(e) => setRemindAmount(e.target.value)}
                required
              />
              <Select
                value={remindUnit}
                onValueChange={(value) => setRemindUnit(value as ReminderUnit)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">minutes</SelectItem>
                  <SelectItem value="hours">hours</SelectItem>
                  <SelectItem value="days">days</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">before the deadline</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (task ? 'Saving...' : 'Creating...') : (task ? 'Save changes' : 'Create task')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}