import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  User,
  Link,
} from "@heroui/react"
import { LuSunMedium } from "react-icons/lu"
import { FaRegMoon } from "react-icons/fa"
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useDispatch, useSelector } from "react-redux"
import { CiLogout } from "react-icons/ci"
import { logout, selectCurrent } from "../../features/user/userSlice"
import { useNavigate } from "react-router-dom"
import { useContext } from "react"
import { ThemeContext } from "../theme-provider"

export const Header = () => {
  const { theme, toggleTheme } = useContext(ThemeContext)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const currentUser = useSelector(selectCurrent)
  
  //добавь тут useEffect

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('token')
    navigate("/auth")
  }
  

  return (
    <Navbar className="maxWidth-100%" isBordered>
      <NavbarBrand>
        <p className="font-bold text-inherit">ВиртЛаб</p>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-4">
        <NavbarItem className="mr-2">
          <User
            description={
              <Link isExternal size="sm">
                {currentUser?.email || "Почта не указана"}
              </Link>
            }
            name={`${currentUser?.lastname || ''} ${currentUser?.firstname || ''} ${currentUser?.middlename || ''}`.trim() || "Пользователь"}
          />
        </NavbarItem>
        <NavbarItem className="mx-5">
          <div 
            className="text-3xl cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleTheme()}
          >
            {theme === "light" ? <FaRegMoon /> : <LuSunMedium />}
          </div>
        </NavbarItem>
        <NavbarItem className="ml-2">
          <Button
            color="default"
            variant="flat"
            className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onPress={handleLogout}
          >
            <CiLogout /> <span>Выйти</span>
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}