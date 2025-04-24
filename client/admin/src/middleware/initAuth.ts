import { userApi } from "../app/services/userApi"
import { selectCurrent, selectToken, setCredentials } from "../features/user/userSlice"

export const initAuth = (store: AppStore) => {
  const state = store.getState()
  const token = selectToken(state)
  
  if (token && !selectCurrent(state)) {
    store.dispatch(userApi.endpoints.getInfoAboutSelf.initiate())
      .then(({ data }) => {
        if (data) {
          store.dispatch(setCredentials({ token, user: data }))
        }
      })
  }
}