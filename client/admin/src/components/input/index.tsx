import type React from "react"
import type { Control} from "react-hook-form";
import { useController } from "react-hook-form"
import { Input as NextInput } from "@heroui/react"

// components/input.tsx
type Props = {
  name: string
  label: string
  placeholder?: string
  type?: string
  control: Control<any>
  required?: string
  endContent?: JSX.Element
  errorMessage?: string  // Добавляем поддержку errorMessage
}

export const Input: React.FC<Props> = ({
  name,
  label,
  placeholder,
  type,
  control,
  required = "",
  endContent,
  errorMessage, // Получаем errorMessage из пропсов
}) => {
  const {
    field,
    fieldState: { invalid },
    formState: { errors },
  } = useController({
    name,
    control,
    rules: { required },
  })

  // Используем переданный errorMessage или берем из formState
  const resolvedErrorMessage = errorMessage || `${errors[name]?.message ?? ""}`

  return (
    <NextInput
      id={name}
      label={label}
      type={type}
      placeholder={placeholder}
      value={field.value}
      name={field.name}
      isInvalid={invalid}
      onChange={field.onChange}
      onBlur={field.onBlur}
      errorMessage={resolvedErrorMessage}
      endContent={endContent}
    />
  )
}