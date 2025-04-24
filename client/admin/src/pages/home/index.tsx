import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Avatar,
  Spinner,
  Divider
} from '@heroui/react';
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiX} from 'react-icons/fi';
import { 
  useGetInfoAboutSelfQuery
} from '../../app/services/userApi';
import { GrUserAdmin } from "react-icons/gr";
import { ErrorModal } from '../../components/error-modal';
import { Button } from '../../components/button';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';

// Улучшенные анимации
const pageAnimation = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "backOut"
    }
  }
};

const hoverEffect = {
  transition: { 
    type: "spring", 
    stiffness: 400, 
    damping: 10 
  }
};

const tapEffect = {
  scale: 0.98,
  transition: { 
    type: "spring", 
    stiffness: 800, 
    damping: 20 
  }
};

export const HomePage = () => {
  const { theme, toggleTheme } = useTheme();
  const { data: user, isLoading, isError, refetch } = useGetInfoAboutSelfQuery();
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  // Состояние формы редактирования
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    lastname: '',
    firstname: '',
    middlename: ''
  });

  // Заполняем форму данными пользователя при загрузке
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        confirmPassword: '',
        lastname: user.lastname,
        firstname: user.firstname,
        middlename: user.middlename || ''
      });
    }
  }, [user]);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.6,
            ease: "easeInOut",
            scale: {
              type: "spring",
              damping: 10,
              stiffness: 100
            }
          }}
        >
          <Spinner size="lg" className="text-primary-500" />
        </motion.div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            type: "spring",
            damping: 15,
            stiffness: 100
          }}
          className="w-full max-w-md"
        >
          <Card className="w-full shadow-xl">
            <CardBody className="text-center p-8">
              <motion.div
                animate={{ 
                  x: [-5, 5, -5],
                  transition: { 
                    repeat: Infinity, 
                    duration: 1.5 
                  } 
                }}
              >
                <FiX className="text-danger-500 text-4xl mx-auto mb-4" />
              </motion.div>
              <p className="text-danger-500 text-lg font-medium mb-6">
                Ошибка загрузки данных пользователя
              </p>
              <motion.div 
                whileHover={hoverEffect}
                whileTap={tapEffect}
              >
                <Button 
                  color="primary" 
                  onClick={() => refetch()}
                  className="mt-4 px-8 py-3 rounded-lg"
                  size="lg"
                >
                  Попробовать снова
                </Button>
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageAnimation}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <motion.div 
        variants={itemAnimation}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <motion.span 
            className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent"
          >
            Личный кабинет
          </motion.span>
          <motion.div
            animate={{

              transition: { 
                repeat: Infinity, 
                repeatType: "reverse", 
                duration: 2 
              }
            }}
          >
            <FiUser className="text-primary-500" />
          </motion.div>
        </h1>
        <Divider className="my-4" />
      </motion.div>

      <motion.div 
        variants={cardAnimation}
      >
        <Card className="mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-transparent">
          <CardHeader className="flex justify-between items-center p-6">
            <motion.h2 
              className="text-2xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
              whileHover={{ 
                backgroundClip: "text",
                WebkitBackgroundClip: "text"
              }}
            >
              Основная информация
            </motion.h2>
          </CardHeader>
          <CardBody className="p-6">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="flex flex-col items-center p-4"
                variants={itemAnimation}
              >
                <motion.div 
                  whileHover={{ 
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar
                    text={`${user.firstname[0]}${user.lastname[0]}`}
                    className="w-28 h-28 text-3xl mb-6 shadow-lg border-2 border-primary-500"
                  />
                </motion.div>
                <motion.h2 
                  className="text-2xl font-bold text-center mb-2 "
                >
                  {user.lastname} {user.firstname} {user.middlename || ''}
                </motion.h2>
                <motion.div 
                  className="mt-4 px-4 py-2 rounded-full bg-opacity-20 bg-default"
                  whileHover={{ scale: 1.05 }}
                >
                    <h2 className="flex gap-2 items-center text-primary-600">
                      <GrUserAdmin  size={24}/> 
                      <span className="font-medium">Администратор</span>
                    </h2>
                </motion.div>
              </motion.div>

              <motion.div 
                className="space-y-6 p-4"
                variants={itemAnimation}
              >
                {[
                  { 
                    icon: <FiMail className="text-primary-500" />, 
                    label: "Email", 
                    value: user.email 
                  },
                  { 
                    icon: <FiCalendar className="text-primary-500" />, 
                    label: "Последняя активность", 
                    value: formatDate(user.last_login) 
                  },
                  { 
                    icon: <FiCalendar className="text-primary-500" />, 
                    label: "Аккаунт создан", 
                    value: formatDate(user.createdAt) 
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemAnimation}
                    className="p-4 rounded-xl bg-default-50 hover:bg-default-100 transition-colors duration-300"
                    whileHover={{ x: 5 }}
                  >
                    <p className="text-sm text-default-500 mb-1">{item.label}</p>
                    <p className={`flex items-center gap-3 ${item.color || 'text-default-800'}`}>
                      <motion.span
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {item.icon}
                      </motion.span>
                      <span className="font-medium">{item.value}</span>
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </CardBody>
        </Card>
      </motion.div>

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </motion.div>
  );
};