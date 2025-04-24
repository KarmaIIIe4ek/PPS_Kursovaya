import { motion, AnimatePresence } from 'framer-motion';
import { NavButton } from '../nav-button';
import { FiHome, FiMail, FiUsers, FiChevronDown, FiMoon, FiSun } from 'react-icons/fi';
import { MdCurrencyRuble, MdOutlineAnalytics } from 'react-icons/md';
import { useGetInfoAboutSelfQuery } from "../../app/services/userApi";
import { Spinner } from "@heroui/react";
import { BiTask } from 'react-icons/bi';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';


// Анимации
const navItem = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3
    }
  }),
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

const spinnerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const teacherSection = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

export const NavBar = () => {
  const { data: user, isLoading } = useGetInfoAboutSelfQuery();
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  if (isLoading) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={spinnerContainer}
        className="sticky top-[64px] h-[calc(100vh-64px)] border-r border-divider p-4 flex items-center justify-center"
      >
        <Spinner size="lg" />
      </motion.div>
    );
  }

  const isTeacher = user?.role_name === "teacher";
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ width: 0 }}
      animate={{ width: 330 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-[64px] h-[calc(100vh-64px)] border-r border-divider p-4 overflow-y-auto 
        bg-background text-foreground`}
    >
      <motion.ul 
        className="flex flex-col gap-1 h-full"
        initial="hidden"
        animate="visible"
      >
        <motion.li 
          variants={navItem}
          custom={0}
          whileHover="hover"
          whileTap="tap"
          className="w-full "
        >
          <NavButton 
            href='/profile' 
            icon={<FiHome />} 
            className={`w-full justify-start  transition-all ${isActive('/profile') ? 'bg-primary-100' : ''}`}
            active={isActive('/profile')}
          >
            Главная
          </NavButton>
        </motion.li>

        <motion.li 
          variants={navItem}
          custom={isTeacher ? 7 : 4}
          whileHover="hover"
          whileTap="tap"
          className="w-full mt-2"
        >
          <NavButton 
            href='/tasks' 
            icon={<BiTask />} 
            className={`w-full justify-start ${isActive('/tasks') ? 'bg-primary-100' : ''}`}
            active={isActive('/tasks')}
          >
            Задания
          </NavButton>
        </motion.li>

        <motion.li 
          variants={navItem}
          custom={1}
          whileHover="hover"
          whileTap="tap"
          className="w-full"
        >
          <NavButton 
            href='/purchases' 
            icon={<FiMail />} 
            className={`w-full justify-start ${isActive('/purchases') ? 'bg-primary-100' : ''}`}
            active={isActive('/purchases')}
          >
            Подписки
          </NavButton>
        </motion.li>

        <motion.li 
          variants={navItem}
          custom={1}
          whileHover="hover"
          whileTap="tap"
          className="w-full"
        >
          <NavButton 
            href='/users' 
            icon={<FiMail />} 
            className={`w-full justify-start ${isActive('/users') ? 'bg-primary-100' : ''}`}
            active={isActive('/users')}
          >
            Пользователи
          </NavButton>
        </motion.li>

        <motion.li 
          variants={navItem}
          custom={2}
          whileHover="hover"
          whileTap="tap"
          className="w-full"
        >
          <NavButton 
            href='/blacklist' 
            icon={<FiUsers />} 
            className={`w-full justify-start ${isActive('/blacklist') ? 'bg-primary-100' : ''}`}
            active={isActive('/blacklist')}
          >
            Чёрный список
          </NavButton>
        </motion.li>
        <motion.li 
          variants={navItem}
          custom={1}
          whileHover="hover"
          whileTap="tap"
          className="w-full"
        >
          <NavButton 
            href='/support' 
            icon={<FiMail />} 
            className={`w-full justify-start ${isActive('/support') ? 'bg-primary-100' : ''}`}
            active={isActive('/support')}
          >
            Поддержка
          </NavButton>
        </motion.li>

        
      </motion.ul>
    </motion.nav>
  );
};