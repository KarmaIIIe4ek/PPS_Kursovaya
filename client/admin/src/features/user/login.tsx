import { Input } from "../../components/input"
import { useForm } from "react-hook-form"
import { Button, Link } from "@heroui/react"
import {
  useLazyGetInfoAboutSelfQuery,
  useLoginMutation,
} from "../../app/services/userApi"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { ErrorMessage } from "../../components/error-message"
import { hasErrorField } from "../../utils/has-error-field"

type LoginSchema = {
  email: string
  password: string
}

type Props = {
  setSelected: (value: string) => void
  onError?: (error: string) => void
}

export const Login = ({ setSelected, onError }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginSchema>({
    mode: "onChange",
    reValidateMode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const [login, { isLoading }] = useLoginMutation()
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [triggerGetInfoAboutSelfQuery] = useLazyGetInfoAboutSelfQuery()

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data).unwrap()
      await triggerGetInfoAboutSelfQuery()
      navigate("/")
    } catch (err: any) {
      if (err.data?.message) {
        onError?.(err.data.message) // Передаем ошибку в родительский компонент
      } else {
        onError?.("Произошла неизвестная ошибка")
      }
    }
  }
  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        control={control}
        name="email"
        label="Email"
        type="email"
        required="Обязательное поле"
      />
      <Input
        control={control}
        name="password"
        label="Пароль"
        type="password"
        required="Обязательное поле"
      />
      <ErrorMessage error={error} />
      <div className="flex gap-2 justify-end">
        <Button fullWidth color="primary" type="submit" isLoading={isLoading}>
          Войти
        </Button>
      </div>
    </form>
  )
}