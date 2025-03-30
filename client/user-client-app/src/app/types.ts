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