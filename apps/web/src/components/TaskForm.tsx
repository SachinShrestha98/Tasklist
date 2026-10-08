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
import type { TaskInput } from '@/types'

type ReminderUnit = 'minutes' | 'hours' | 'days'
 
const UNIT_MINUTES: Record<ReminderUnit, number> = { minutes: 1, hours: 60, days: 1440 }

interface TaskFormProps {
  onSubmit: (task: TaskInput) => Promise<void>
}

const emptyForm = { header: '', description: '', assignee_email: '', deadline: '' }

export default function TaskForm({ onSubmit }: TaskFormProps) {
  const [form, setForm] = useState(emptyForm)
  const [remindAmount, setRemindAmount] = useState('1')
  const [remindUnit, setRemindUnit] = useState<ReminderUnit>('hours')
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
        <CardTitle>New task</CardTitle>
        <CardDescription>
          The assignee gets an email when the task is completed, and a reminder at the time you
          choose before the deadline.
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

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create task'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}