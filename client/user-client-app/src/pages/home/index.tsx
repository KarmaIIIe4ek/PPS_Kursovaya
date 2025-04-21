import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Avatar,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Divider
} from '@heroui/react';
import {
  FiUser,
  FiEdit,
  FiSave,
  FiMail,
  FiCalendar,
  FiX,
  FiCheck,
  FiLock,
  FiUnlock
} from 'react-icons/fi';
import { 
  useGetInfoAboutSelfQuery,
  useEditSelfFromTokenMutation 
} from '../../app/services/userApi';
import { ErrorModal } from '../../components/error-modal';
import { Button } from '../../components/button';
import { PiStudent } from 'react-icons/pi';
import { GiTeacher } from 'react-icons/gi';
import * as yup from "yup";
import { useTheme } from '../../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeInOut"
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

// Схема валидации для редактирования профиля
const editProfileSchema = yup.object({
  lastname: yup.string().required("Обязательное поле"),
  firstname: yup.string().required("Обязательное поле"),
  middlename: yup.string(),
  email: yup.string().email("Некорректный email").required("Обязательное поле"),
  password: yup
    .string()
    .min(6, "Пароль должен содержать минимум 6 символов")
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  confirmPassword: yup
    .string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .when('password', {
      is: (password: string) => password && password.length > 0,
      then: (schema) =>
        schema
          .required("Подтвердите пароль")
          .oneOf([yup.ref('password')], "Пароли должны совпадать"),
    }),
});

// Тип для данных формы
type EditProfileFormValues = yup.InferType<typeof editProfileSchema>;

export const HomePage = () => {
  const { theme, toggleTheme } = useTheme();
  const { data: user, isLoading, isError, refetch } = useGetInfoAboutSelfQuery();
  const [editSelf, { isLoading: isEditing }] = useEditSelfFromTokenMutation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errors, setErrors] = useState<Partial<EditProfileFormValues>>({});
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = async (): Promise<boolean> => {
    try {
      await editProfileSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      if (validationErrors instanceof yup.ValidationError) {
        const newErrors: Partial<EditProfileFormValues> = {};
        validationErrors.inner.forEach(error => {
          if (error.path) {
            newErrors[error.path as keyof EditProfileFormValues] = error.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      const updateData: any = {};
      if (formData.email && formData.email !== user?.email) updateData.email = formData.email;
      if (formData.password) updateData.password = formData.password;
      if (formData.lastname && formData.lastname !== user?.lastname) updateData.lastname = formData.lastname;
      if (formData.firstname && formData.firstname !== user?.firstname) updateData.firstname = formData.firstname;
      if (formData.middlename !== user?.middlename) updateData.middlename = formData.middlename;

      await editSelf(updateData).unwrap();
      refetch();
      onClose();
    } catch (error: any) {
      setErrorMessage(error.data?.message || 'Ошибка при обновлении данных');
      setIsErrorModalOpen(true);
    }
  };

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
            <motion.div 

              whileTap={tapEffect}
            >
              <Button
                color="primary"
                size="md"
                onClick={onOpen}
                icon={<FiEdit />}
                className="rounded-lg shadow-md"
              >
                Редактировать
              </Button>
            </motion.div>
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
                  className="mt-4 px-4 py-2 rounded-full bg-opacity-20"
                  whileHover={{ scale: 1.05 }}
                  style={{
                    backgroundColor: user.role_name === 'student' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(236, 72, 153, 0.2)'
                  }}
                >
                  {user.role_name === 'student' ? 
                    <h2 className="flex gap-2 items-center text-primary-600">
                      <PiStudent size={24}/> 
                      <span className="font-medium">Студент</span>
                    </h2> :
                    <h2 className="flex gap-2 items-center text-secondary-600">
                      <GiTeacher size={24}/> 
                      <span className="font-medium">Преподаватель</span>
                    </h2>
                  }
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
                  },
                  { 
                    icon: user.is_blocked ? 
                      <FiLock className="text-danger-500" /> : 
                      <FiUnlock className="text-success-500" />, 
                    label: "Статус", 
                    value: user.is_blocked ? "Заблокирован" : "Активен",
                    color: user.is_blocked ? "text-danger-500" : "text-success-500"
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

      {/* Модальное окно редактирования */}
      <AnimatePresence>
        {isOpen && (
          <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                type: "spring",
                damping: 20,
                stiffness: 300
              }}
              className="bg-gradient-to-br from-default-50 to-default-100 rounded-xl overflow-hidden"
            >
              <ModalContent className="border-none shadow-2xl">
                <ModalHeader className="flex flex-col gap-1 p-6 bg-gradient-to-r from-primary-500 to-secondary-500">
                  <motion.h3 
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Редактирование профиля
                  </motion.h3>
                </ModalHeader>
                <ModalBody className="p-6">
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {[
                      { label: "Фамилия", name: "lastname", value: formData.lastname },
                      { label: "Имя", name: "firstname", value: formData.firstname },
                      { label: "Отчество", name: "middlename", value: formData.middlename },
                      { label: "Email", name: "email", type: "email", value: formData.email },
                      { 
                        label: "Новый пароль", 
                        name: "password", 
                        type: "password", 
                        placeholder: "Оставьте пустым, если не меняете",
                        description: "Минимум 6 символов",
                        value: formData.password 
                      },
                      { 
                        label: "Подтвердите пароль", 
                        name: "confirmPassword", 
                        type: "password", 
                        placeholder: "Подтвердите новый пароль",
                        value: formData.confirmPassword,
                        disabled: !formData.password
                      }
                    ].map((input, index) => (
                      <motion.div 
                        key={index} 
                        variants={itemAnimation}
                        whileHover={{ y: -2 }}
                      >
                        <Input
                          label={input.label}
                          name={input.name}
                          type={input.type || "text"}
                          placeholder={input.placeholder}
                          description={input.description}
                          value={input.value}
                          onChange={handleInputChange}
                          errorMessage={errors[input.name as keyof typeof errors]}
                          isInvalid={!!errors[input.name as keyof typeof errors]}
                          disabled={input.disabled}
                          className="focus:ring-2 focus:ring-primary-500 border border-default-200 rounded-lg"
                          variant="bordered"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </ModalBody>
                <ModalFooter className="p-6 bg-default-50">
                  <div className="flex gap-4 w-full">
                    <motion.div 
                      whileHover={hoverEffect}
                      whileTap={tapEffect}
                      className="flex-1"
                    >
                      <Button 
                        color="danger" 
                        variant="light" 
                        onClick={onClose}
                        className="w-full rounded-lg py-3"
                      >
                        Отмена
                      </Button>
                    </motion.div>
                    <motion.div 
                      whileHover={hoverEffect}
                      whileTap={tapEffect}
                      className="flex-1"
                    >
                      <Button 
                        color="primary" 
                        onClick={handleSubmit}
                        isLoading={isEditing}
                        icon={<FiSave />}
                        className="w-full rounded-lg py-3 shadow-md"
                      >
                        Сохранить изменения
                      </Button>
                    </motion.div>
                  </div>
                </ModalFooter>
              </ModalContent>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </motion.div>
  );
};