import DeleteTaskButton from '@/components/DeleteTaskButton' 
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Task } from '@/types'

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  onComplete: (id: number) => void
  onEdit: (task: Task) => void
  onDelete: (id: number) => void 
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

function isOverdue(task: Task) {
  return task.status === 'PENDING' && new Date(task.deadline) < new Date()
}

function StatusBadge({ task }: { task: Task }) {
  if (task.status === 'COMPLETED') return <Badge>Completed</Badge>
  if (isOverdue(task)) return <Badge variant="destructive">Overdue</Badge>
  return <Badge variant="secondary">Pending</Badge>
}

export default function TaskList({ tasks, loading, onComplete, onEdit, onDelete }: TaskListProps) {
  const pendingCount = tasks.filter((task) => task.status === 'PENDING').length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          {pendingCount} pending of {tasks.length}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading tasks...</p>}

        {!loading && tasks.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No tasks yet. Create your first one with the form.
          </p>
        )}

        {tasks.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium">{task.header}</div>
                    <div className="max-w-xs truncate text-sm text-muted-foreground">
                      {task.description}
                    </div>
                  </TableCell>
                  <TableCell>{task.assignee_email}</TableCell>
                  <TableCell>
                    <div className={isOverdue(task) ? 'text-destructive' : ''}>
                      {formatDate(task.deadline)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Reminder: {formatDate(task.remind_at)}
                      {task.notification_sent ? ' (sent)' : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge task={task} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(task)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={task.status === 'COMPLETED'}
                        onClick={() => onComplete(task.id)}
                      >
                        Complete
                      </Button>
                      <DeleteTaskButton
                        taskHeader={task.header}
                        onConfirm={() => onDelete(task.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}