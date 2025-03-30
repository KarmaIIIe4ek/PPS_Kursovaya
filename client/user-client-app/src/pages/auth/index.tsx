import { Card, CardBody, Tab, Tabs } from "@heroui/react"
import { useState } from "react"
import { Login } from "../../features/user/login"
import { Register } from "../../features/user/register"
import { useAuthGuard } from "../../hooks/useAuthGuard"
import { ErrorMessage } from "../../components/error-message" // Предполагается, что у вас есть компонент для отображения ошибок

export const Auth = () => {
  const [selected, setSelected] = useState("login")
  const [authError, setAuthError] = useState("") // Состояние для хранения ошибки

  useAuthGuard()

  // Функция для обработки ошибок
  const handleAuthError = (error: string) => {
    setAuthError(error)
    // Очищаем ошибку через 5 секунд
    setTimeout(() => setAuthError(""), 5000)
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col">
        <Card className="max-w-full w-[340px]">
          <CardBody className="overflow-hidden">
            <Tabs
              fullWidth
              size="md"
              selectedKey={selected}
              onSelectionChange={(key) => {
                setSelected(key as string)
                setAuthError("") // Очищаем ошибку при переключении вкладок
              }}
            >
              <Tab key="login" title="Вход">
                <Login 
                  setSelected={setSelected}
                  onError={handleAuthError} // Передаем обработчик ошибок
                />
              </Tab>
              <Tab key="sign-up" title="Регистрация">
                <Register 
                  setSelected={setSelected}
                  onError={handleAuthError} // Передаем обработчик ошибок
                />
              </Tab>
            </Tabs>
            {/* Отображаем ошибку, если она есть */}
            {authError && (
              <ErrorMessage 
                error={authError}
                className="mb-4" // Добавляем отступ снизу
              />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}