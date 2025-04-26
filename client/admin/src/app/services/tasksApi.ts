import type { Task } from "../types";
import { api } from "./api";

export const tasksApi = api.injectEndpoints({
    endpoints: (builder) => ({
        changeAvailableById: builder.mutation<
            {message: string},
            {id_task: string}
        > ({
            query: (userData) => ({
                url: '/task/changeAvailableById',
                method: 'POST',
                body: userData
            })
        }),
        getAll: builder.query<Task[], void>({
            query: () => ({
                url: '/task/getAll',
                method: 'GET',
            })
        })
    })
})

export const {
    useChangeAvailableByIdMutation,
    useLazyGetAllQuery,
    useGetAllQuery,
} = tasksApi;

export const {
    endpoints: { changeAvailableById, getAll },
  } = tasksApi