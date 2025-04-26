import type { Purchase } from "../types";
import { api } from "./api";

export const purchasesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        changeIsPaidById: builder.mutation<
            {message: string},
            {id_purchase: string}
        > ({
            query: (userData) => ({
                url: '/purchase/changeIsPaidById',
                method: 'POST',
                body: userData
            })
        }),
        changeIsBlockedById: builder.mutation<
            {message: string},
            {id_purchase: string}
        > ({
            query: (userData) => ({
                url: '/purchase/changeIsBlockedById',
                method: 'POST',
                body: userData
            })
        }),
        getAllPurchases: builder.query<Purchase[], void>({
            query: () => ({
                url: '/purchase/getAll',
                method: 'GET',
            })
        })
    })
})

export const {
    useChangeIsPaidByIdMutation,
    useChangeIsBlockedByIdMutation,
    useGetAllPurchasesQuery,
    useLazyGetAllPurchasesQuery,
} = purchasesApi;

export const {
    endpoints: { changeIsPaidById, changeIsBlockedById, getAllPurchases },
  } = purchasesApi