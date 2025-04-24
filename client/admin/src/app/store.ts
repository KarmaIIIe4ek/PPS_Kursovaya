import type { ThunkAction, Action } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit"
import { api } from "./services/api"
import auth from "../features/user/userSlice"
import { listenerMiddleware } from "../middleware/auth"
import { initAuth } from "../middleware/initAuth";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(api.middleware)
      .prepend(listenerMiddleware.middleware),
})
// Инициализация аутентификации после создания store
initAuth(store)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

