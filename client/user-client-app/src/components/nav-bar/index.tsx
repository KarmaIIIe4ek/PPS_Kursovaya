import React from 'react'
import { NavButton } from '../nav-button'
import { BsPostcard } from 'react-icons/bs'

export const NavBar = () => {
  return (
    <nav className="h-[calc(100vh-80px)] border-r border-gray-300 p-4">
      <ul className="flex flex-col gap-2 h-full">
        <li className="w-full">
          <NavButton href='/' icon={<BsPostcard />} className="w-full justify-start">
            Главная
          </NavButton>
        </li>
        <li className="w-full">
          <NavButton href='/auth' icon={<BsPostcard />} className="w-full justify-start">
            Авторизация
          </NavButton>
        </li>
        <li className="w-full">
          <NavButton href='/groups' icon={<BsPostcard />} className="w-full justify-start">
            Группы
          </NavButton>
        </li>
      </ul>
    </nav>
  )
}