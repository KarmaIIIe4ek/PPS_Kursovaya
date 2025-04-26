import type { User } from "../types";
import { api } from "./api";

export const usersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        editUserByID: builder.mutation<
            {message: string},
            { id_user: string,
                email: string,
                password: string,
                lastname: string,
                firstname: string,
                middlename: string,
                last_login: Date,
                is_blocked: boolean}
        > ({
            query: (userData) => ({
                url: '/user/editUserByID',
                method: 'POST',
                body: userData
            })
        }),
        getAllUsers: builder.query<User[], void>({
            query: () => ({
                url: '/user/getAll',
                method: 'GET',
            })
        })
    })
})

export const {
    useEditUserByIDMutation,
    useGetAllUsersQuery,
    useLazyGetAllUsersQuery,
} = usersApi;

export const {
    endpoints: { editUserByID, getAllUsers },
  } = usersApi