import type { User } from "../types";
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
        register: builder.mutation<
            {token: string},
            {
                lastname: string,
                firstname: string,
                middlename: string,
                role_name: string, 
                email: string,
                password: string,
            }
        > ({
            query: (userData) => ({
                url: '/auth/registration',
                method: 'POST',
                body: userData
            })
        }),
        editSelfFromToken: builder.mutation<
            {token: string},
            {
                email: string,
                password: string,
                lastname: string,
                firstname: string,
                middlename: string,
            }
        > ({
            query: (userData) => ({
                url: '/auth/editSelfFromToken',
                method: 'POST',
                body: userData
            })
        }),
        getInfoAboutSelf: builder.query<User, void>({
            query: () => ({
                url: '/auth/getInfoAboutSelf',
                method: 'GET',
            })
        })
    })
})

export const {
    useRegisterMutation,
    useLoginMutation,
    useGetInfoAboutSelfQuery,
    useLazyGetInfoAboutSelfQuery,
    useEditSelfFromTokenMutation
} = userApi;

export const {
    endpoints: { login, register, getInfoAboutSelf, editSelfFromToken },
  } = userApi