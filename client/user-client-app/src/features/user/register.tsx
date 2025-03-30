import { Input } from "../../components/input";
import { useForm } from "react-hook-form";
import { Button, Link } from "@heroui/react";
import { useLazyGetInfoAboutSelfQuery, useRegisterMutation } from "../../app/services/userApi";
import { ErrorMessage } from "../../components/error-message";
import { hasErrorField } from "../../utils/has-error-field";
import { useState } from "react";
import { Autocomplete } from "../../components/droplist";
import { yupResolver } from "@hookform/resolvers/yup";
import type { 
  RegisterFormValues,
  RegisterSubmitData 
} from "../../utils/register-validation";
import { 
  registerSchema 
} from "../../utils/register-validation";
import { useNavigate } from "react-router-dom";

type Props = {
  setSelected: (value: string) => void
  onError?: (error: string) => void
}

export const Register = ({ setSelected, onError }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      lastname: "",
      firstname: "",
      middlename: "",
      role_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [register] = useRegisterMutation();
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [triggerGetInfoAboutSelfQuery] = useLazyGetInfoAboutSelfQuery()

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Создаем объект без confirmPassword перед отправкой
      const submitData: RegisterSubmitData = {
        lastname: data.lastname,
        firstname: data.firstname,
        middlename: data.middlename ? data.middlename : undefined,
        role_name: data.role_name,
        email: data.email,
        password: data.password
      };
      
      await register(submitData).unwrap();
      await triggerGetInfoAboutSelfQuery()
      navigate("/")
    } catch (err) {
      if (err.data?.message) {
        onError?.(err.data.message) // Передаем ошибку в родительский компонент
      } else {
        onError?.("Произошла неизвестная ошибка")
      }
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        control={control}
        name="lastname"
        label="Фамилия"
        errorMessage={errors.lastname?.message}
      />
      <Input
        control={control}
        name="firstname"
        label="Имя"
        errorMessage={errors.firstname?.message}
      />
      <Input
        control={control}
        name="middlename"
        label="Отчество"
        errorMessage={errors.middlename?.message}
      />
      <Autocomplete
        name="role_name"
        label="Роль"
        control={control}
        options={[
          { value: "student", label: "Ученик" },
          { value: "teacher", label: "Преподаватель" },
        ]}
        errorMessage={errors.role_name?.message}
      />
      <Input
        control={control}
        name="email"
        label="Email"
        type="email"
        errorMessage={errors.email?.message}
      />
      <Input
        control={control}
        name="password"
        label="Пароль"
        type="password"
        errorMessage={errors.password?.message}
      />
      <Input
        control={control}
        name="confirmPassword"
        label="Подтвердите пароль"
        type="password"
        errorMessage={errors.confirmPassword?.message}
      />
      <p className="text-center text-small">
        Уже есть аккаунт?{" "}
        <Link
          size="sm"
          className="cursor-pointer"
          onPress={() => setSelected("login")}
        >
          Войдите
        </Link>
      </p>
      <div className="flex gap-2 justify-end">
        <Button 
          fullWidth 
          color="primary" 
          type="submit"
          isDisabled={Object.keys(errors).length > 0}
        >
          Зарегистрироваться
        </Button>
      </div>
    </form>
  );
};