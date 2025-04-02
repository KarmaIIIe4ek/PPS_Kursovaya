import type { Support } from "../types";
import { api } from "./api";

export const supportApi = api.injectEndpoints({
    endpoints: (builder) => ({
        sendToSupport: builder.mutation<
            {message: string},
            {user_text: string}
        > ({
            query: (user_text) => ({
                url: '/support/sendToSupport',
                method: 'POST',
                body: user_text
            })
        }),
        getListMyAppeal: builder.query<Support[], void>({
            query: () => ({
                url: '/support/getListMyAppeal',
                method: 'GET',
            })
        })
    })
})

export const {
    useSendToSupportMutation,
    useGetListMyAppealQuery,
    useLazyGetListMyAppealQuery
} = supportApi;

export const {
    endpoints: { sendToSupport, getListMyAppeal },
  } = supportApi