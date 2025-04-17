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

export type TokenWithUser = {
  token: string
  user: User
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

export type Purchase = {
  id_purchase: number
  id_user: number
  price: number
  is_paid: boolean
  payment_method: string
  created_date: Date
  is_blocked: boolean
  payment_date: Date
}

export type GroupWithTasksAndAttempts = {
  id_group: number
  group_number: string
  hash_code_login: string
  createdAt: Date
  available_tasks: AvailableTask[]
  users_attempts: UserAttempts[]
}

export type AvailableTask = {
  id_task: number
  task_name: string
  description: string
  is_open: boolean
  deadline: Date | null
}

export type UserAttempts = {
  id_user: number
  user_name: string
  attempts: Attempt[]
}

export type Attempt = {
  id_result: number
  task: TaskInAttempt
  score: number | null
  comment_user: string | null
  comment_teacher: string | null
  date_start: Date
  date_finish: Date | null
  status: 'completed' | 'in_progress' | string // Можно уточнить возможные статусы
}

export type TaskInAttempt = {
  id_task: number
  is_available: boolean
  task_name: string
  description: string
}

export type GroupMember = Pick<User, 
  'id_user' | 'email' | 'lastname' | 'firstname' | 'middlename' | 'role_name'
>;

export type GroupCreator = Pick<User, 
  'id_user' | 'email' | 'lastname' | 'firstname' | 'middlename'
>;

export type GroupWithMembers = {
  id_group: number;
  group_number: string;
  hash_code_login: string;
  created_at: Date | string; // Можно уточнить в зависимости от формата
  creator: GroupCreator;
  members: GroupMember[];
};

export type UserTaskAttempt = {
  task: Task;
  groups: Group[];
  attempts: Attempt[];
  status: 'completed' | 'in_progress' | 'not_started';
};

