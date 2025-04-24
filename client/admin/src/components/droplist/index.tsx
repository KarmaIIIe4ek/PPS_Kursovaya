import type React from "react"
import type { Control } from "react-hook-form"
import { useController } from "react-hook-form"
import { Autocomplete as NextAutocomplete, AutocompleteItem } from "@heroui/react"

// Определяем тип для ключей
type AutocompleteKey = string | number | null;

type Props = {
  name: string
  label: string
  placeholder?: string
  control: Control<any>
  required?: string
  options: Array<{ value: string; label: string }>
  endContent?: JSX.Element
  errorMessage?: string
  onSelectionChange?: (key: string) => void
}

export const Autocomplete: React.FC<Props> = ({
  name,
  label,
  placeholder,
  control,
  required = "",
  options,
  endContent,
  errorMessage,
  onSelectionChange,
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

  const handleSelectionChange = (key: AutocompleteKey) => {
    const stringValue = key?.toString() || "";
    field.onChange(stringValue);
    onSelectionChange?.(stringValue);
  }

  const resolvedErrorMessage = errorMessage || `${errors[name]?.message ?? ""}`

  return (
    <NextAutocomplete
      id={name}
      label={label}
      placeholder={placeholder}
      defaultItems={options}
      selectedKey={field.value}
      onSelectionChange={handleSelectionChange}
      onBlur={field.onBlur}
      isInvalid={invalid}
      errorMessage={resolvedErrorMessage}
      endContent={endContent}
    >
      {(item) => (
        <AutocompleteItem key={item.value}>
          {item.label}
        </AutocompleteItem>
      )}
    </NextAutocomplete>
  )
}