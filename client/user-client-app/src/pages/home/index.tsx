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
  useDisclosure
} from '@heroui/react';
import {
  FiUser,
  FiEdit,
  FiSave,
  FiMail,
  FiCalendar,
  FiX,
  FiCheck
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

// Анимации
const cardAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
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
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Spinner size="lg" />
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
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="w-full">
            <CardBody className="text-center">
              <p className="text-danger">Ошибка загрузки данных пользователя</p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  color="primary" 
                  onClick={() => refetch()}
                  className="mt-4"
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
      variants={fadeIn}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <motion.div variants={itemAnimation}>
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <FiUser /> Личный кабинет
        </h1>
      </motion.div>

      <motion.div variants={cardAnimation}>
        <Card className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex justify-between items-center">
            <motion.h2 
              className="text-xl font-semibold"
              whileHover={{ scale: 1.02 }}
            >
              Основная информация
            </motion.h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                color="primary"
                size="sm"
                onClick={onOpen}
                icon={<FiEdit />}
              >
                Редактировать
              </Button>
            </motion.div>
          </CardHeader>
          <CardBody>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div 
                className="flex flex-col items-center"
                variants={itemAnimation}
              >
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Avatar
                    text={`${user.firstname[0]}${user.lastname[0]}`}
                    className="w-24 h-24 text-2xl mb-4 shadow-md"
                  />
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold text-center"
                  whileHover={{ scale: 1.02 }}
                >
                  {user.lastname} {user.firstname} {user.middlename || ''}
                </motion.h3>
                <motion.div 
                  className="mt-2"
                  whileHover={{ scale: 1.03 }}
                >
                  {user.role_name === 'student' ? 
                    <h2 color="primary" className="flex gap-2 items-center">
                      <PiStudent size={24}/> Студент
                    </h2> :
                    <h2 color="primary" className="flex gap-2 items-center">
                      <GiTeacher size={24}/> Преподаватель
                    </h2>
                  }
                </motion.div>
              </motion.div>

              <motion.div 
                className="space-y-4"
                variants={itemAnimation}
              >
                <motion.div variants={itemAnimation}>
                  <p className="text-sm text-default-500">Email</p>
                  <p className="flex items-center gap-2">
                    <FiMail /> {user.email}
                  </p>
                </motion.div>
                <motion.div variants={itemAnimation}>
                  <p className="text-sm text-default-500">Последняя активность</p>
                  <p className="flex items-center gap-2">
                    <FiCalendar /> {formatDate(user.last_login)}
                  </p>
                </motion.div>
                <motion.div variants={itemAnimation}>
                  <p className="text-sm text-default-500">Аккаунт создан</p>
                  <p className="flex items-center gap-2">
                    <FiCalendar /> {formatDate(user.createdAt)}
                  </p>
                </motion.div>
                <motion.div variants={itemAnimation}>
                  <p className="text-sm text-default-500">Статус</p>
                  <div className="flex items-center gap-2">
                    {user.is_blocked ? (
                      <h2 color="danger" className="flex items-center gap-1">
                        <FiX color='red'/> Заблокирован
                      </h2>
                    ) : (
                      <h2 color="success" className="flex items-center gap-1">
                        <FiCheck color='green' /> Активен
                      </h2>
                    )}
                  </div>
                </motion.div>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                  Редактирование профиля
                </ModalHeader>
                <ModalBody>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    variants={staggerContainer}
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
                        placeholder: "Пустое, если не изменяете пароль",
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
                      <motion.div key={index} variants={itemAnimation}>
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
                          className="focus:ring-2 focus:ring-primary-500"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </ModalBody>
                <ModalFooter>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button color="danger" variant="light" onClick={onClose}>
                      Отмена
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button 
                      color="primary" 
                      onClick={handleSubmit}
                      isLoading={isEditing}
                      icon={<FiSave />}
                    >
                      Сохранить изменения
                    </Button>
                  </motion.div>
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