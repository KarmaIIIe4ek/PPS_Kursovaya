import type { GroupWithTasksAndAttempts } from "../types";
import { api } from "./api";

export const resultsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getGroupAttempts: builder.query<
            GroupWithTasksAndAttempts,
            string 
        >({
            query: (hash_code_login) => ({
                url: `/teacher/group/getGroupAttempts?hash_code_login=${encodeURIComponent(hash_code_login)}`,
                method: 'GET' 
            })
        })
    })
})

export const {
    useGetGroupAttemptsQuery,
    useLazyGetGroupAttemptsQuery
} = resultsApi;

export const {
    endpoints: { getGroupAttempts },
  } = resultsApi