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
          className="w-full"
        >
          <NavButton 
            href='/profile' 
            icon={<FiHome />} 
            className={`w-full justify-start transition-all ${isActive('/profile') ? 'bg-primary-100' : ''}`}
            active={isActive('/profile')}
          >
            Главная
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
            href='/myGroup' 
            icon={<FiUsers />} 
            className={`w-full justify-start ${isActive('/myGroup') ? 'bg-primary-100' : ''}`}
            active={isActive('/myGroup')}
          >
            Мои группы
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
            href='/makeTask' 
            icon={<BiTask />} 
            className={`w-full justify-start ${isActive('/makeTask') ? 'bg-primary-100' : ''}`}
            active={isActive('/makeTask')}
          >
            Задания
          </NavButton>
        </motion.li>

        <motion.li 
          variants={navItem}
          custom={isTeacher ? 8 : 5}
          whileHover="hover"
          whileTap="tap"
          className="w-full"
        >
          <NavButton 
            href='/selfResults' 
            icon={<MdOutlineAnalytics />} 
            className={`w-full justify-start ${isActive('/selfResults') ? 'bg-primary-100' : ''}`}
            active={isActive('/selfResults')}
          >
            Мои результаты
          </NavButton>
        </motion.li>
        {isTeacher && (
          <>
            <motion.div 
              className="mt-2 mb-1"
              variants={navItem}
              custom={3}
            >
              <motion.button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ backgroundColor: theme === 'light' ? 'rgba(243, 244, 246, 0.5)' : 'rgba(55, 65, 81, 0.5)' }}
              >
                <span className="flex-1 text-left">Преподаватель</span>
                <motion.div
                  animate={{ rotate: expanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiChevronDown size={16} />
                </motion.div>
              </motion.button>
            </motion.div>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  variants={teacherSection}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="pl-2 border-l-2 border-gray-200 dark:border-gray-600 ml-3"
                >
                  <motion.li 
                    variants={navItem}
                    className="w-full mb-1"
                  >
                    <NavButton 
                      href='/modifyGroup' 
                      icon={<FiUsers />} 
                      className={`w-full justify-start ${isActive('/modifyGroup') ? 'bg-primary-100' : ''}`}
                      active={isActive('/modifyGroup')}
                    >
                      Управление группами
                    </NavButton>
                  </motion.li>

                  <motion.li 
                    variants={navItem}
                    className="w-full mb-1"
                  >
                    <NavButton 
                      href='/purchase' 
                      icon={<MdCurrencyRuble />} 
                      className={`w-full justify-start ${isActive('/purchase') ? 'bg-primary-100' : ''}`}
                      active={isActive('/purchase')}
                    >
                      Подписка
                    </NavButton>
                  </motion.li>

                  <motion.li 
                    variants={navItem}
                    className="w-full"
                  >
                    <NavButton 
                      href='/results' 
                      icon={<MdOutlineAnalytics />} 
                      className={`w-full justify-start ${isActive('/results') ? 'bg-primary-100' : ''}`}
                      active={isActive('/results')}
                    >
                      Результаты группы
                    </NavButton>
                  </motion.li>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        <motion.li 
          variants={navItem}
          custom={1}
          whileHover="hover"
          whileTap="tap"
          className="w-full mt-3"
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