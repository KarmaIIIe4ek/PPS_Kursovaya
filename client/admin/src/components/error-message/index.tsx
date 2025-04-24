import type React from "react"

type ErrorMessageProps = {
  error?: string
  className?: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error = "", 
  className = "" 
}) => {
  if (!error) return null
  
  return (
    <p className={`text-red-500 mt-2 mb-5 text-small text-center ${className}`}>
      {error}
    </p>
  )
}