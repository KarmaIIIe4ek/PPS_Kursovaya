import { NavButton } from '../nav-button'
import { FiHome, FiMail, FiUsers } from 'react-icons/fi'
import { MdCurrencyRuble } from 'react-icons/md'

export const NavBar = () => {
  return (
    <nav className="sticky top-[64px] h-[calc(100vh-64px)] border-r border-divider p-4 overflow-y-auto border-r border-divider p-4">
      <ul className="flex flex-col gap-2 h-full">
        <li className="w-full">
          <NavButton href='/' icon={<FiHome />} className="w-full justify-start">
            Главная
          </NavButton>
        </li>
        <li className="w-full">
          <NavButton href='/support' icon={<FiMail />} className="w-full justify-start">
            Поддержка
          </NavButton>
        </li>
        <li className="w-full">
          <NavButton href='/myGroup' icon={<FiUsers />} className="w-full justify-start">
            Моя группа
          </NavButton>
        </li>
        <li className="w-full">
          <NavButton href='/modifyGroup' icon={<FiUsers />} className="w-full justify-start">
            Управление группами
          </NavButton>
        </li>
        <li className="w-full">
          <NavButton href='/purchase' icon={<MdCurrencyRuble   />} className="w-full justify-start">
            Подписка
          </NavButton>
        </li>
      </ul>
    </nav>
  )
}