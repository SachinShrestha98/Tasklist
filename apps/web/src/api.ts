import type {Task, TaskInput} from './types'

export async function listTasks(): Promise<Task[]> {
    const response = await fetch(`/api/tasks/`)
    if(!response.ok){
        throw new Error(`Failed to load tasks`)
    }
    return response.json()
}

export async function createTask(task: TaskInput): Promise<Task> {
    const response = await fetch('api/tasks/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(task)
    })
 
    if(!response.ok){
        const error = await response.json().catch(()=> null)
        throw new Error(error?.detail || 'Failed to create task')
    }
    return response.json()
}

export async function updateTask(id: number, task: TaskInput): Promise<void> {
    const response = await fetch(`/api/tasks/${id}/`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.detail || 'Failed to update task')
    }
}

export async function completeTask(id: number): Promise<Task> {
    const response = await fetch(`api/tasks/${id}/complete/`, {
        method: 'POST',
    }) 
    if (!response.ok){
        throw new Error('Failed to complete task')
    }
    return response.json()
}

export async function deleteTask(id: number): Promise<void> {
    const response = await fetch(`/api/tasks/${id}/`, {
        method: 'DELETE'
    })
    if(!response.ok){
        throw new Error(`Failed to delete task`)
    } 
}