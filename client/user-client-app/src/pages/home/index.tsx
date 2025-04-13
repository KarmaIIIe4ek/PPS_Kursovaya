import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Avatar,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Badge,
  Tooltip,
  Select,
  SelectItem
} from '@heroui/react';
import {
  FiUser,
  FiEdit,
  FiSave,
  FiLock,
  FiMail,
  FiCalendar,
  FiShield,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { 
  useGetInfoAboutSelfQuery,
  useEditSelfFromTokenMutation 
} from '../../app/services/userApi';
import { ErrorModal } from '../../components/error-modal';
import { Button } from '../../components/button';
import { PiChalkboardTeacher, PiStudent } from 'react-icons/pi';
import { GiTeacher } from 'react-icons/gi';
import * as yup from "yup";
import { useTheme } from '../../hooks/useTheme';

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

    // Проверка совпадения паролей (теперь это делается в схеме валидации)
    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      setIsErrorModalOpen(true);
      return;
    }

    try {
      // Отправляем только заполненные поля
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
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="max-w-md">
          <CardBody className="text-center">
            <p className="text-danger">Ошибка загрузки данных пользователя</p>
            <Button 
              color="primary" 
              onClick={() => refetch()}
              className="mt-4"
            >
              Попробовать снова
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }
  
  const cardClasses = theme === 'dark' 
    ? 'dark:bg-gray-800 dark:text-white' 
    : 'bg-white text-gray-900';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FiUser /> Личный кабинет
      </h1>

      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Основная информация</h2>
          <Button
            color="primary"
            size="sm"
            onClick={onOpen}
            icon={<FiEdit />}
          >
            Редактировать
          </Button>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <Avatar
                text={`${user.firstname[0]}${user.lastname[0]}`}
                className="w-24 h-24 text-2xl mb-4"
              />
              <h3 className="text-xl font-semibold">
                {user.lastname} {user.firstname} {user.middlename || ''}
              </h3>
              {user.role_name === 'student' ? 
              <h2 color="primary" className="mt-2 flex gap-2 items-center">
                <PiStudent size={40}/> Студент
              </h2> :
              <h2 color="primary" className="mt-2 flex  gap-2 items-center">
                <GiTeacher size={40}/>Преподаватель
              </h2>
            }

            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-default-500">Email</p>
                <p className="flex items-center gap-2">
                  <FiMail /> {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-default-500">Последняя активность</p>
                <p className="flex items-center gap-2">
                  <FiCalendar /> {formatDate(user.last_login)}
                </p>
              </div>
              <div>
                <p className="text-sm text-default-500">Аккаунт создан</p>
                <p className="flex items-center gap-2">
                  <FiCalendar /> {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
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
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Модальное окно редактирования с валидацией */}
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Редактирование профиля
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Фамилия"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              errorMessage={errors.lastname}
              isInvalid={!!errors.lastname}
            />
            <Input
              label="Имя"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              errorMessage={errors.firstname}
              isInvalid={!!errors.firstname}
            />
            <Input
              label="Отчество"
              name="middlename"
              value={formData.middlename}
              onChange={handleInputChange}
              errorMessage={errors.middlename}
              isInvalid={!!errors.middlename}
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              errorMessage={errors.email}
              isInvalid={!!errors.email}
            />
            <Input
              label="Новый пароль"
              name="password"
              type="password"
              placeholder="Оставьте пустым, если не хотите менять"
              value={formData.password}
              onChange={handleInputChange}
              description="Минимум 6 символов"
              errorMessage={errors.password}
              isInvalid={!!errors.password}
            />
            <Input
              label="Подтвердите пароль"
              name="confirmPassword"
              type="password"
              placeholder="Подтвердите новый пароль"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={!formData.password}
              errorMessage={errors.confirmPassword}
              isInvalid={!!errors.confirmPassword}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmit}
            isLoading={isEditing}
            icon={<FiSave />}
          >
            Сохранить изменения
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </div>
  );
};