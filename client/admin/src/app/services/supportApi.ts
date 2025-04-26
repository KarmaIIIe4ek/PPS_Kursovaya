import type { Support } from "../types";
import { api } from "./api";

export const supportApi = api.injectEndpoints({
    endpoints: (builder) => ({
        sendResponse: builder.mutation<
            Support,
            {id_support: string; admin_response: string; status: string}
        > ({
            query: (userData) => ({
                url: '/support/sendResponse',
                method: 'POST',
                body: userData
            })
        }),
        getAllAppeal: builder.query<Support[], void>({
            query: () => ({
                url: '/support/getAllAppeal',
                method: 'GET',
            })
        })
    })
})

export const {
    useGetAllAppealQuery,
    useLazyGetAllAppealQuery,
    useSendResponseMutation
} = supportApi;

export const {
    endpoints: { sendResponse, getAllAppeal },
  } = supportApi