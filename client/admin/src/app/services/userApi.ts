import type { Admin } from "../types";
import { api } from "./api";

export const userApi = api.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<
            {token: string},
            {email: string; password: string}
        > ({
            query: (userData) => ({
                url: '/auth/login',
                method: 'POST',
                body: userData
            })
        }),
        getInfoAboutSelf: builder.query<Admin, void>({
            query: () => ({
                url: '/auth/getInfoAboutSelf',
                method: 'GET',
            })
        })
    })
})

export const {
    useLoginMutation,
    useGetInfoAboutSelfQuery,
    useLazyGetInfoAboutSelfQuery,
} = userApi;

export const {
    endpoints: { login, getInfoAboutSelf },
  } = userApi