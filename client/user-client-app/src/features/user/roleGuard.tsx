// features/user/roleGuard.tsx
import { useGetInfoAboutSelfQuery } from "../../app/services/userApi"
import { Navigate, useLocation } from "react-router-dom"
import { Spinner } from "@heroui/react"

export const TeacherGuard = ({ children }: { children: JSX.Element }) => {
  const location = useLocation()
  const { data: user, isLoading } = useGetInfoAboutSelfQuery()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  if (user?.role_name !== "teacher") {
    // Можно перенаправить на главную или показать страницу 403
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return children
}