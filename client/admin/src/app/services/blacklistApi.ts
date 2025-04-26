import type { Blacklist, Task } from "../types";
import { api } from "./api";

export const blacklistApi = api.injectEndpoints({
    endpoints: (builder) => ({
        addToBlacklist: builder.mutation<
            {message: string},
            {email: string; reason: string}
        > ({
            query: (userData) => ({
                url: '/blacklist/addToBlacklist',
                method: 'POST',
                body: userData
            })
        }),
        removeFromBlacklist: builder.mutation<
            {message: string},
            {email: string}
        > ({
            query: (userData) => ({
                url: '/blacklist/removeFromBlacklist',
                method: 'POST',
                body: userData
            })
        }),
        getAllBlacklist: builder.query<Blacklist[], void>({
            query: () => ({
                url: '/blacklist/getAll',
                method: 'GET',
            })
        })
    })
})

export const {
    useAddToBlacklistMutation,
    useRemoveFromBlacklistMutation,
    useGetAllBlacklistQuery,
    useLazyGetAllBlacklistQuery,
} = blacklistApi;

export const {
    endpoints: { addToBlacklist, removeFromBlacklist, getAllBlacklist },
  } = blacklistApi