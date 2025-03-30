// features/user/authGuard.tsx
import { useGetInfoAboutSelfQuery } from "../../app/services/userApi"
import { Spinner } from "@heroui/react"
import { Navigate, useLocation } from "react-router-dom"
import { useAppSelector } from "../../app/hooks"
import { selectIsAuthenticated, selectToken } from "./userSlice"

export const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const location = useLocation()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const token = useAppSelector(selectToken)
  const { data: user, isLoading, isError } = useGetInfoAboutSelfQuery()

  if (isLoading || (token && !user && !isError)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if ((isError || !user) && !isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return children
}