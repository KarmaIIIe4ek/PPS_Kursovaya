export type User = {
  id_user: number
  email: string
  lastname: string
  firstname: string
  middlename: string | null
  role_name: string
  last_login: Date
  is_blocked: boolean
  is_deleted: boolean
  createdAt: Date
  updatedAt: Date
}

export type Support = {
  id_support: number
  id_user: number
  id_admin: number
  user_text: string
  status: string
  admin_response: string
  createdAt: Date
}

export type Group = {
  id_group: number
  group_number: string
  hash_code_login: string
  id_user: number
  createdAt: Date
}

export type GroupWithTasksAndUsers = {
  id_group: number
  group_number: string
  hash_code_login: string
  id_user: number
  createdAt: Date
  users: User[]
  tasks: Task[]
}

export type GroupWithTasks = {
  id_group: number
  group_number: string
  hash_code_login: string
  id_user: number
  createdAt: Date
  tasks: TaskForGroup[]
}

export type TaskForGroup = {
  id_task_for_group: string
  is_open: string
  deadline: number
  task: Task 
}

export type Task = {
  id_task: number
  is_available: boolean
  task_name: string
  description: string
}