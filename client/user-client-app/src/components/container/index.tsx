import type React from 'react'
import { twMerge } from 'tailwind-merge'

type Props = {
  children: React.ReactNode
  className?: string
}

export const Container: React.FC<Props> = ({ children, className }) => {
  const baseClasses = 'flex max-w-screen-full mx-auto'
  const mergedClasses = twMerge(baseClasses, className)

  return (
    <div className={mergedClasses}>{children}</div>
  )
}