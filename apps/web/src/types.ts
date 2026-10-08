export interface Task {
    id: number
    header: string
    description: string
    assignee_email: string
    deadline: string
    remind_before_minutes: number
    remind_at: string
    status: 'PENDING' | 'COMPLETED'
    notification_sent: boolean
    created_at: string
}

export interface TaskInput {
    header: string
    description: string
    assignee_email: string
    remind_before_minutes: number
    deadline: string
}