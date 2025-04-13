import type { Purchase } from "../types";
import { api } from "./api";

export const purchaseApi = api.injectEndpoints({
    endpoints: (builder) => ({
        add: builder.mutation<
            {message:string},
            {price: number; payment_method: string}
        > ({
            query: (userData) => ({
                url: '/teacher/purchase/add',
                method: 'POST',
                body: userData
            })
        }),
        confirm: builder.mutation<
            {message: string},
            {id_purchase: number}
        > ({
            query: (userData) => ({
                url: '/teacher/purchase/confirm',
                method: 'POST',
                body: userData
            })
        }),
        getAllMy: builder.query<Purchase[], void>({
            query: () => ({
                url: '/teacher/purchase/getAllMy',
                method: 'GET',
            })
        })
    })
})

export const {
    useAddMutation,
    useConfirmMutation,
    useGetAllMyQuery,
    useLazyGetAllMyQuery
} = purchaseApi;

export const {
    endpoints: { add, confirm, getAllMy},
  } = purchaseApi