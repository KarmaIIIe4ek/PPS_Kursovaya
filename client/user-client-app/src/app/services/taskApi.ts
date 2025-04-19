import type { Task } from "../types"
import { api } from "./api"

export const taskApi = api.injectEndpoints({
  endpoints: builder => ({
    createUserTaskAttempt: builder.mutation<{ message: string }, { id_task: number }>(
      {
        query: userData => ({
          url: "/student/task/createUserTaskAttempt",
          method: "POST",
          body: userData,
        }),
      },
    ),
    finishUserTaskAttempt: builder.mutation<{ message: string }, { id_task: number, score: number, comment_user: string }>(
      {
        query: userData => ({
          url: "/student/task/finishUserTaskAttempt",
          method: "POST",
          body: userData,
        }),
      },
    ),
    getAllAvailable: builder.query<Task[], void>({
      query: () => ({
        url: "/teacher/tasks/getAllAvailable",
        method: "GET",
      }),
    }),
  }),
})

export const { useGetAllAvailableQuery, useLazyGetAllAvailableQuery, useCreateUserTaskAttemptMutation, useFinishUserTaskAttemptMutation } = taskApi

export const {
  endpoints: { getAllAvailable, finishUserTaskAttempt, createUserTaskAttempt},
} = taskApi
