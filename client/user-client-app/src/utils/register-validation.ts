import * as yup from "yup";

export const registerSchema = yup.object({
  lastname: yup.string().required("Обязательное поле"),
  firstname: yup.string().required("Обязательное поле"),
  middlename: yup.string(),
  role_name: yup.string().required("Обязательное поле"),
  email: yup.string().email("Некорректный email").required("Обязательное поле"),
  password: yup.string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .required("Обязательное поле"),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], "Пароли должны совпадать")
    .required("Подтвердите пароль")
});

// Тип для данных формы (включая confirmPassword)
export type RegisterFormValues = yup.InferType<typeof registerSchema>;

// Тип для отправки на сервер (без confirmPassword)
export type RegisterSubmitData = Omit<RegisterFormValues, 'confirmPassword'>;