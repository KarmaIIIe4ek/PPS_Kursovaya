import type { Task } from "../types";
import { api } from "./api";

export const taskApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAllAvailable: builder.query<Task[], void>({
            query: () => ({
                url: '/teacher/tasks/getAllAvailable',
                method: 'GET',
            })
        })
    })
})

export const {
    useGetAllAvailableQuery,
    useLazyGetAllAvailableQuery
} = taskApi;

export const {
    endpoints: { getAllAvailable },
  } = taskApi