import type React from 'react'
import { Button } from '../button'
import { useNavigate } from 'react-router-dom'

type Props = {
  children: React.ReactNode
  icon: JSX.Element
  href: string
  className?: string
}

export const NavButton: React.FC<Props> = ({
  children,
  icon,
  href,
  className = ''
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(href)
  }

  return (
    <Button 
      className={`w-full justify-start text-xl px-4 py-3 ${className}`}
      icon={icon}
      onClick={handleClick}
      fullWidth
    >
      {children}
    </Button>
  )
}