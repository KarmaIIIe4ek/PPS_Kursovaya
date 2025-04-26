import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Select,
  SelectItem,
  Badge,
  Spinner,
  Textarea,
  addToast
} from '@heroui/react';
import { 
  FiUser,
  FiEdit2,
  FiTrash2,
  FiSlash,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiMail,
  FiLock,
  FiUnlock
} from 'react-icons/fi';
import { 
  useGetAllUsersQuery,
  useEditUserByIDMutation,
  useLazyGetAllUsersQuery 
} from '../../app/services/usersApi';
import { 
  useAddToBlacklistMutation,
  useGetAllBlacklistQuery
} from '../../app/services/blacklistApi';
import { EmptyState } from '../../components/empty-state';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { User } from '../../app/types';
import { FaBan } from 'react-icons/fa';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export const UsersPage = () => {
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isBlacklistOpen, onOpen: onBlacklistOpen, onClose: onBlacklistClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    email: '',
    password: '',
    lastname: '',
    firstname: '',
    middlename: '',
    is_blocked: false
  });
  const [blacklistReason, setBlacklistReason] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingToBlacklist, setIsAddingToBlacklist] = useState(false);
  
  const { data: users, isLoading, isError, refetch: refetchUsers } = useGetAllUsersQuery();
  const { data: blacklist, refetch: refetchBlacklist } = useGetAllBlacklistQuery();
  const [editUser] = useEditUserByIDMutation();
  const [addToBlacklist] = useAddToBlacklistMutation();
  const [triggerGetAllUsers] = useLazyGetAllUsersQuery();

  const isUserInBlacklist = (email: string) => {
    return blacklist?.some(item => item.user.email === email) || false;
  };

  const filteredUsers = users?.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role_name === roleFilter;
    const matchesSearch = searchQuery === '' || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      password: '',
      lastname: user.lastname,
      firstname: user.firstname,
      middlename: user.middlename || '',
      is_blocked: user.is_blocked
    });
    onEditOpen();
  };

  const openBlacklistModal = (user: User) => {
    setSelectedUser(user);
    setBlacklistReason('');
    onBlacklistOpen();
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    
    try {
      await editUser({
        id_user: selectedUser.id_user.toString(),
        ...editForm,
        last_login: selectedUser.last_login
      }).unwrap();
      await triggerGetAllUsers();
      onEditClose();
    } catch (error) {
      console.error('Ошибка при редактировании пользователя:', error);
    }
  };

  const handleAddToBlacklist = async () => {
    if (!selectedUser || !blacklistReason.trim()) return;
    
    setIsAddingToBlacklist(true);
    try {
      await addToBlacklist({
        email: selectedUser.email,
        reason: blacklistReason
      }).unwrap();
      
      await Promise.all([
        refetchUsers(),
        refetchBlacklist(),
        triggerGetAllUsers()
      ]);
      
      addToast({
        title: 'Пользователь добавлен в ЧС',
        description: `${selectedUser.email} успешно добавлен в чёрный список`,
        appearance: 'success',
        autoDismiss: true
      });
      
      onBlacklistClose();
    } catch (error) {
      console.error('Ошибка при добавлении в чёрный список:', error);
      addToast({
        title: 'Ошибка',
        description: 'Не удалось добавить пользователя в чёрный список',
        appearance: 'error',
        autoDismiss: true
      });
    } finally {
      setIsAddingToBlacklist(false);
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'Никогда';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Некорректная дата';
      
      return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return 'Ошибка даты';
    }
  };

  const getRoleBadge = (role: string) => {
    // Вариант с использованием Chip
    switch(role) {
      case 'student':
        return (
          <Chip 
            color="primary" 
            variant="solid"
            classNames={{
              base: "bg-primary-100 text-primary-800",
              content: "text-sm font-medium"
            }}
          >
            Студент
          </Chip>
        );
      case 'teacher':
        return (
          <Chip 
            color="secondary" 
            variant="solid"
            classNames={{
              base: "bg-secondary-100 text-secondary-800",
              content: "text-sm font-medium"
            }}
          >
            Преподаватель
          </Chip>
        );
      case 'admin':
        return (
          <Chip 
            color="success" 
            variant="solid"
            classNames={{
              base: "bg-success-100 text-success-800",
              content: "text-sm font-medium"
            }}
          >
            Администратор
          </Chip>
        );
      default:
        return (
          <Chip 
            variant="solid"
            classNames={{
              base: "bg-default-100 text-default-800",
              content: "text-sm font-medium"
            }}
          >
            {role}
          </Chip>
        );
    }
  };

  const getStatusBadge = (user: User) => {
    if (isUserInBlacklist(user.email)) {
      return <Chip color="danger" variant="flat" startContent={<FiSlash />}>В чёрном списке</Chip>;
    }
    return user.is_blocked ? (
      <Chip color="warning" variant="flat" startContent={<FiLock />}>Заблокирован</Chip>
    ) : (
      <Chip color="success" variant="flat" startContent={<FiUnlock />}>Активен</Chip>
    );
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <motion.div variants={slideUp} className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Avatar
            icon={<FiUser className="text-lg" />}
            className="bg-primary-100 text-primary-500"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            Управление пользователями
          </h1>
        </div>
        <Button 
          color="primary" 
          variant="light" 
          onClick={() => refetchUsers()}
          startContent={<FiRefreshCw />}
        >
          Обновить
        </Button>
      </motion.div>

      <motion.div variants={slideUp} className="mb-6">
        <Card className="shadow-sm">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Поиск пользователей"
                placeholder="Поиск по email или имени..."
                startContent={<FiSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select
                label="Фильтр по роли"
                selectedKeys={[roleFilter]}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <SelectItem key="all" value="all">Все роли</SelectItem>
                <SelectItem key="student" value="student">Студенты</SelectItem>
                <SelectItem key="teacher" value="teacher">Преподаватели</SelectItem>
              </Select>
              <div className="flex items-center gap-2">
                <div className="bg-primary-500 text-white rounded-full px-3 py-1 text-sm font-medium">
                  {filteredUsers?.length || 0}
                </div>
                <span className="text-default-500">Найдено пользователей</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div variants={slideUp}>
        <Card className="shadow-lg">
          <CardHeader className="border-b border-default-200">
            <h2 className="text-xl font-semibold">Список пользователей</h2>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <EmptyState
                icon={<FiX className="text-danger" size={48} />}
                title="Ошибка загрузки"
                description="Не удалось загрузить список пользователей"
                action={
                  <Button color="primary" onClick={() => refetchUsers()}>
                    Попробовать снова
                  </Button>
                }
              />
            ) : filteredUsers?.length === 0 ? (
              <EmptyState
                icon={<FiUser className="text-default-400" size={48} />}
                title="Пользователи не найдены"
                description="Попробуйте изменить параметры поиска"
              />
            ) : (
              <Table aria-label="Users table">
                <TableHeader>
                  <TableColumn>Пользователь</TableColumn>
                  <TableColumn>Роль</TableColumn>
                  <TableColumn>Статус</TableColumn>
                  <TableColumn>Последний вход</TableColumn>
                  <TableColumn>Действия</TableColumn>
                </TableHeader>
                <TableBody>
                  {(filteredUsers || [])?.map((user) => (
                    <TableRow key={user.id_user}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={`${user.firstname} ${user.lastname}`}
                            className="bg-default-100 text-default-800"
                          />
                          <div>
                            <p className="font-medium">{user.lastname} {user.firstname} {user.middlename}</p>
                            <p className="text-default-500 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role_name)}</TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        {user.last_login ? formatDate(user.last_login) : 'Никогда'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => openEditModal(user)}
                          >
                            <FiEdit2 />
                          </Button>
                          {!isUserInBlacklist(user.email) && (
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => openBlacklistModal(user)}
                            >
                              <FaBan />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Модальное окно редактирования */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FiEdit2 />
            <span>Редактирование пользователя</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Email"
                placeholder="Введите email"
                startContent={<FiMail />}
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
              <Input
                label="Пароль (оставьте пустым, чтобы не менять)"
                placeholder="Введите новый пароль"
                type="password"
                startContent={<FiLock />}
                value={editForm.password}
                onChange={(e) => setEditForm({...editForm, password: e.target.value})}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Фамилия"
                  placeholder="Введите фамилию"
                  value={editForm.lastname}
                  onChange={(e) => setEditForm({...editForm, lastname: e.target.value})}
                />
                <Input
                  label="Имя"
                  placeholder="Введите имя"
                  value={editForm.firstname}
                  onChange={(e) => setEditForm({...editForm, firstname: e.target.value})}
                />
                <Input
                  label="Отчество"
                  placeholder="Введите отчество"
                  value={editForm.middlename}
                  onChange={(e) => setEditForm({...editForm, middlename: e.target.value})}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onEditClose}>
              Отмена
            </Button>
            <Button color="primary" onPress={handleEditSubmit}>
              Сохранить изменения
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно добавления в чёрный список */}
      <Modal isOpen={isBlacklistOpen} onClose={onBlacklistClose}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FiSlash />
            <span>Добавление в чёрный список</span>
          </ModalHeader>
          <ModalBody>
            <p className="mb-4">Вы уверены, что хотите добавить пользователя <span className="font-semibold">{selectedUser?.email}</span> в чёрный список?</p>
            <Textarea
              label="Причина"
              placeholder="Укажите причину добавления в чёрный список"
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onBlacklistClose}>
              Отмена
            </Button>
            <Button 
              color="danger" 
              onPress={handleAddToBlacklist}
              isDisabled={!blacklistReason.trim()}
              isLoading={isAddingToBlacklist}
            >
              Добавить в чёрный список
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};