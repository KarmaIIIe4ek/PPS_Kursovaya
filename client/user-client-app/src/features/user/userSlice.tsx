import { createSlice } from "@reduxjs/toolkit"
import { userApi } from "../../app/services/userApi"
import type { RootState } from "../../app/store"
import type { User } from "../../app/types"

interface InitialState {
  user: User | null
  isAuthenticated: boolean
  users: User[] | null
  current: User | null
  token?: string
}

// Загрузка состояния из localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem('authState')
    if (!serializedState) return null
    return JSON.parse(serializedState)
  } catch (e) {
    return null
  }
}

const savedState = loadAuthState()

const initialState: InitialState = savedState ? {
  ...savedState,
  users: null,
  user: null
} : {
  user: null,
  isAuthenticated: false,
  users: null,
  current: null,
  token: undefined
}

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.current = null
      state.token = undefined
      localStorage.removeItem('authState')
    },
    resetUser: (state) => {
      state.user = null
    },
    setCredentials: (state, action) => {
      state.token = action.payload.token
      state.current = action.payload.user
      state.isAuthenticated = true
      localStorage.setItem('authState', JSON.stringify({
        current: state.current,
        isAuthenticated: state.isAuthenticated
      }))
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(userApi.endpoints.login.matchFulfilled, (state, action) => {
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('authState', JSON.stringify({
          token: state.token,
          isAuthenticated: state.isAuthenticated
        }))
      })
      .addMatcher(userApi.endpoints.getInfoAboutSelf.matchFulfilled, (state, action) => {
        state.current = action.payload
        state.isAuthenticated = true
        localStorage.setItem('authState', JSON.stringify({
          current: state.current,
          isAuthenticated: state.isAuthenticated
        }))
      })
      .addMatcher(userApi.endpoints.register.matchFulfilled, (state, action) => {
        state.isAuthenticated = true
        state.token = action.payload.token
        localStorage.setItem('authState', JSON.stringify({
          current: state.current,
          isAuthenticated: state.isAuthenticated
        }))
      })
      .addMatcher(userApi.endpoints.editSelfFromToken.matchFulfilled, (state, action) => {
        // Обновляем текущего пользователя и токен (если он был изменен)
        if (action.payload.token) {
          state.token = action.payload.token;
        }
        if (action.payload.user) {
          state.current = action.payload.user;
        }
        state.isAuthenticated = true;
        
        // Сохраняем обновленные данные в localStorage
        localStorage.setItem('authState', JSON.stringify({
          current: state.current,
          isAuthenticated: state.isAuthenticated
        }));
                // Сохраняем обновленные данные в localStorage
        localStorage.setItem('token', state.token);
      })
  },
})

export const { logout, resetUser, setCredentials } = slice.actions
export default slice.reducer

export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectCurrent = (state: RootState) => state.auth.current
export const selectUsers = (state: RootState) => state.auth.users
export const selectUser = (state: RootState) => state.auth.user
export const selectToken = (state: RootState) => state.auth.token