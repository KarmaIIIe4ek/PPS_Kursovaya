import { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Avatar,
  Chip,
  Accordion,
  AccordionItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Divider
} from '@heroui/react';
import {
  FiPlus,
  FiTrash2,
  FiUsers,
  FiUnlock,
  FiMoreVertical,
  FiCopy,
  FiUserPlus,
  FiUserMinus,
  FiBookOpen,
  FiAlertCircle,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiMoreHorizontal,
  FiKey
} from 'react-icons/fi';
import {
  useCreateMutation,
  useAddUserToGroupMutation,
  useRemoveFromGroupByEmailMutation,
  useDeleteByIdMutation,
  useGrantRightsToGroupMutation,
  useGetAllMyGroupsQuery,
  useGetAllMyAccessQuery,
  useChangeIsOpenByIdMutation,
} from '../../app/services/groupApi';
import { CreateGroupModal } from '../../components/create-group-modal';
import { AddUserModal } from '../../components/add-user-modal';
import { GrantRightsModal } from '../../components/grant-rights-modal';
import { RemoveUserModal } from '../../components/remove-user-modal';
import { ErrorModal } from '../../components/error-modal';
import { useGetAllAvailableQuery } from '../../app/services/taskApi';
import { ConfirmDeleteGroupModal } from '../../components/confirm-delete-group-modal';
import { ConfirmChangeIsOpen } from '../../components/confirm-change-is-open';
import { motion } from 'framer-motion';

// Анимационные варианты
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

export const ModifyGroup = () => {
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedGroupWithTask, setSelectedGroupWithTasks] = useState<any>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number>(-1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isRemoveUserModalOpen, setIsRemoveUserModalOpen] = useState(false);
  const [isGrantRightsModalOpen, setIsGrantRightsModalOpen] = useState(false);
  const [isConfirmDeleteGroupModalOpen, setIsConfirmDeleteGroupModalOpen] = useState(false);
  const [isChangeIsOpenModal, setIsChangeIsOpenModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const { 
    data: myGroups, 
    isLoading: isLoadingGroups, 
    isError: isGroupsError,
    refetch: refetchGroups 
  } = useGetAllMyGroupsQuery();
  
  const { 
    data: myAccess, 
    isLoading: isLoadingAccess, 
    isError: isAccessError,
    refetch: refetchAccess
  } = useGetAllMyAccessQuery();

  const { data: availableTasks } = useGetAllAvailableQuery();

  const [createGroup, { isLoading: isCreating }] = useCreateMutation();
  const [addUserToGroup, { isLoading: isAddingUser }] = useAddUserToGroupMutation();
  const [removeUserFromGroup, { isLoading: isRemovingUser }] = useRemoveFromGroupByEmailMutation();
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteByIdMutation();
  const [grantRights, { isLoading: isGrantingRights }] = useGrantRightsToGroupMutation();
  const [changeIsOpen, { isLoading: isChangingIsOpen }] = useChangeIsOpenByIdMutation();

  const handleError = (error: any, defaultMessage: string) => {
    console.error('Ошибка:', error);
    setErrorMessage(error.data?.message || defaultMessage);
    setIsErrorModalOpen(true);
  };

  const handleCreateGroup = async (groupNumber: string) => {
    try {
      await createGroup({ group_number: groupNumber }).unwrap();
      setIsCreateModalOpen(false);
      refetchGroups();
      refetchAccess();
    } catch (error: any) {
      console.error('Ошибка при создании группы:', error);
      if (error.data?.message) {
        setErrorMessage(error.data.message);
      } else {
        setErrorMessage('Произошла неизвестная ошибка при создании группы');
      }
      setIsErrorModalOpen(true);
    }
  };

  const handleAddUser = async (email: string) => {
    if (!selectedGroup) return;
    try {
      await addUserToGroup({ 
        email, 
        hash_code_login: selectedGroup.hash_code_login 
      }).unwrap();
      setIsAddUserModalOpen(false);
      refetchGroups();
    } catch (error: any) {
      console.error('Ошибка при добавлении пользователя:', error);
      if (error.data?.message) {
        setErrorMessage(error.data.message);
      } else {
        setErrorMessage('Произошла неизвестная ошибка при добавлении пользователя');
      }
      setIsErrorModalOpen(true);
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (!selectedGroup) return;
    try {
      await removeUserFromGroup({ 
        email, 
        hash_code_login: selectedGroup.hash_code_login 
      }).unwrap();
      setIsRemoveUserModalOpen(false);
      refetchGroups();
    } catch (error: any) {
      console.error('Ошибка при удалении пользователя:', error);
      if (error.data?.message) {
        setErrorMessage(error.data.message);
      } else {
        setErrorMessage('Произошла неизвестная ошибка при удалении пользователя');
      }
      setIsErrorModalOpen(true);
    }
  };

  const handleGrantRights = async (taskId: number) => {
    if (!selectedGroup) return;
    try {
      await grantRights({ 
        id_task: taskId, 
        hash_code_login: selectedGroup.hash_code_login 
      }).unwrap();
      refetchAccess();
      setIsGrantRightsModalOpen(false);
      refetchGroups();
    } catch (error: any) {
      console.error('Ошибка при предоставлении прав:', error);
      if (error.data?.message) {
        setErrorMessage(error.data.message);
      } else {
        setErrorMessage('Произошла неизвестная ошибка при выдаче прав');
      }
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteGroup = async (id_group: number) => {
    try {
      await deleteGroup({id_group: id_group}).unwrap();
      refetchAccess();
      setIsConfirmDeleteGroupModalOpen(false);
      refetchGroups();
    } catch (error: any) {
      console.error('Ошибка при удалении группы:', error);
      if (error.data?.message) {
        setErrorMessage(error.data.message);
      } else {
        setErrorMessage('Произошла неизвестная ошибка при  удалении группы');
      }
      setIsErrorModalOpen(true);
    }
  };

  const handleChangeIsOpen = async (id_task: number) => {
    if (!selectedGroupWithTask) return;
    try {
      await changeIsOpen({ 
        id_task: selectedTaskId, 
        hash_code_login: selectedGroupWithTask.hash_code_login 
      }).unwrap();
      refetchAccess();
      setIsChangeIsOpenModal(false);
    } catch (error: any) {
      console.error('Ошибка при смене доступности заданя:', error);
      if (error.data?.message) {
        setErrorMessage(error.data.message);
      } else {
        setErrorMessage('Произошла неизвестная ошибка при смене доступности заданя');
      }
      setIsErrorModalOpen(true);
    }
  };

  const myGroupsColumns = [
    { name: "Номер группы", uid: "group_number" },
    { name: "Код доступа", uid: "hash_code" },
    { name: "Участники", uid: "users" },
    { name: "Задачи", uid: "tasks" },
    { name: "Действия", uid: "actions" }
  ];

  const accessGroupsColumns = [
    { name: "Номер группы", uid: "group_number" },
    { name: "Код доступа", uid: "hash_code" },
    { name: "Задачи", uid: "tasks" },
    { name: "Статус", uid: "status" },
    { name: "Действия", uid: "actions" }
  ];


  const renderUserItem = (user: any) => (
    <motion.div 
      key={user.id_user} 
      className="flex items-center gap-3 py-2 px-4 hover:bg-default-100 rounded-lg transition-colors"
      whileHover={{ scale: 1.01 }}
    >
      <Avatar 
        name={`${user.lastname} ${user.firstname}`} 
        size="sm"
        className="flex-shrink-0"
      />
      <div className="min-w-0">
        <p className="font-medium truncate">{user.lastname} {user.firstname} {user.middlename}</p>
        <p className="text-sm text-default-500 truncate">{user.email}</p>
      </div>
      <Chip 
        size="sm" 
        color={user.role_name === 'teacher' ? 'primary' : 'default'} 
        variant="flat"
        className="ml-auto flex-shrink-0"
      >
        {user.role_name === 'teacher' ? 'Преподаватель' : 'Студент'}
      </Chip>
    </motion.div>
  );

  const renderTaskItem = (task: any, group: any, isAccessGroup?: boolean) => (
    <motion.div 
      className="hover:bg-default-50 rounded-lg transition-colors"
      whileHover={{ scale: 1.005 }}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mt-1 flex-shrink-0">
          <FiBookOpen size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{task.task?.task_name || task.task_name}</p>
          <p className="text-sm text-default-500 mt-1 truncate">
            {task.task?.description || task.description}
          </p>
        </div>
        {isAccessGroup && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <Chip 
              size="sm" 
              color={task.is_open ? 'success' : 'warning'} 
              variant="flat"
            >
              {task.is_open ? 'Доступ открыт' : 'Доступ закрыт'}
            </Chip>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  aria-label="Действия"
                >
                  <FiMoreHorizontal size={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Действия с заданием"
                onAction={() => {
                  setSelectedTaskId(task.task?.id_task);
                  setSelectedGroupWithTasks(group);
                  setIsChangeIsOpenModal(true);
                }}
              >
                <DropdownItem 
                  key="change-status"
                  startContent={<FiKey size={16} />}
                >
                  Изменить статус
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        )}
      </div>
    </motion.div>
  );

  const EmptyState = ({ 
    icon, 
    title, 
    description, 
    action 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
  }) => (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="text-default-400 mb-4 text-4xl">{icon}</div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-default-500 mb-4">{description}</p>
      {action}
    </motion.div>
  );

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-8 max-w-7xl"
    >
      <motion.div 
        variants={slideUp}
        className="flex justify-between items-center mb-8"
      >
        <div className="flex items-center gap-3">
          <Avatar
            icon={<FiUsers className="text-lg" />}
            className="bg-primary-100 text-primary-500"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Управление группами</h1>
        </div>
        <Button 
          color="primary" 
          onClick={() => setIsCreateModalOpen(true)}
          endContent={<FiPlus size={18} />}
          className="font-medium"
        >
          Создать группу
        </Button>
      </motion.div>

      {/* Мои группы */}
      <motion.div variants={slideUp}>
        <Card className="mb-8 shadow-lg" >
          <CardHeader className="border-b border-default-200 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiUsers className="text-primary" /> Мои группы
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {isLoadingGroups ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : isGroupsError ? (
              <EmptyState
                icon={<FiAlertCircle className="text-danger" />}
                title="Ошибка загрузки"
                description="Не удалось загрузить список групп"
                action={
                  <Button color="primary" onClick={() => refetchGroups()}>
                    Попробовать снова
                  </Button>
                }
              />
            ) : myGroups?.length === 0 ? (
              <EmptyState
                icon={<FiUsers className="text-default-400" />}
                title="Нет групп"
                description="У вас пока нет созданных групп"
              />
            ) : (
              <Accordion 
                selectionMode="multiple" 
                variant="shadow"
                itemClasses={{
                  base: "border-none",
                  heading: "px-6 py-4",
                  trigger: "py-4",
                  content: "px-6 pb-6"
                }}
              >
                {myGroups?.map((group) => (
                  <AccordionItem
                    key={group.hash_code_login}
                    aria-label={group.group_number}
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{group.group_number}</span>
                        <div className="flex items-center gap-3">
                          <Badge color="primary" content={group.users.length} size="sm">
                            <FiUsers className="text-default-500" />
                          </Badge>
                          <Badge color="secondary" content={group.tasks.length} size="sm">
                            <FiBookOpen className="text-default-500" />
                          </Badge>
                        </div>
                      </div>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <FiKey /> Код доступа
                          </h3>
                          <div className="flex items-center gap-2 p-3 bg-default-100 rounded-lg">
                            <code className="font-mono">{group.hash_code_login}</code>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onClick={() => navigator.clipboard.writeText(group.hash_code_login)}
                            >
                              <FiCopy size={16} />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <FiUsers /> Участники ({group.users.length})
                          </h3>
                          {group.users.length > 0 ? (
                            <Card className="divide-y">
                              {group.users.map(renderUserItem)}
                            </Card>
                          ) : (
                            <p className="text-default-500 text-sm p-3">Нет участников</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <FiBookOpen /> Доступные задания
                          </h3>
                          {group.tasks.length > 0 ? (
                            <Card className="divide-y">
                              {group.tasks.map(task => renderTaskItem(task, group))}
                            </Card>
                          ) : (
                            <p className="text-default-500 text-sm p-3">Нет доступных заданий</p>
                          )}
                        </div>

                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <FiMoreVertical /> Действия
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Button
                              color="primary"
                              variant="flat"
                              onClick={() => {
                                setSelectedGroup(group);
                                setIsAddUserModalOpen(true);
                              }}
                              startContent={<FiUserPlus />}
                              fullWidth
                            >
                              Добавить участника
                            </Button>
                            <Button
                              color="warning"
                              variant="flat"
                              onClick={() => {
                                setSelectedGroup(group);
                                setIsRemoveUserModalOpen(true);
                              }}
                              startContent={<FiUserMinus />}
                              fullWidth
                            >
                              Удалить участника
                            </Button>
                            <Button
                              color="secondary"
                              variant="flat"
                              onClick={() => {
                                setSelectedGroup(group);
                                setIsGrantRightsModalOpen(true);
                              }}
                              startContent={<FiBookOpen />}
                              fullWidth
                            >
                              Назначить задание
                            </Button>
                            <Button
                              color="danger"
                              variant="flat"
                              onClick={() => {
                                setSelectedGroup(group);
                                setIsConfirmDeleteGroupModalOpen(true);
                              }}
                              startContent={<FiTrash2 />}
                              fullWidth
                            >
                              Удалить группу
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Группы с доступом */}
      <motion.div variants={slideUp}>
        <Card className="shadow-lg">
          <CardHeader className="border-b border-default-200 p-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiUnlock className="text-success" /> Группы с доступом
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            {isLoadingAccess ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : isAccessError ? (
              <EmptyState
                icon={<FiAlertCircle className="text-danger" />}
                title="Ошибка загрузки"
                description="Не удалось загрузить список групп с доступом"
              />
            ) : myAccess?.length === 0 ? (
              <EmptyState
                icon={<FiUnlock className="text-default-400" />}
                title="Нет доступных групп"
                description="У вас нет доступа к другим группам"
              />
            ) : (
              <Accordion 
                selectionMode="multiple" 
                variant="shadow"
                itemClasses={{
                  base: "border-none",
                  heading: "px-6 py-4",
                  trigger: "py-4",
                  content: "px-6 pb-6"
                }}
              >
                {myAccess?.map((group) => (
                  <AccordionItem
                    key={group.hash_code_login}
                    aria-label={group.group_number}
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{group.group_number}</span>
                        <Badge color="secondary" content={group.tasks.length} size="sm">
                          <FiBookOpen className="text-default-500" />
                        </Badge>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-default-100 rounded-lg">
                        <FiKey className="text-primary" />
                        <code className="font-mono">{group.hash_code_login}</code>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() => navigator.clipboard.writeText(group.hash_code_login)}
                          className="ml-auto"
                        >
                          <FiCopy size={16} />
                        </Button>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <FiBookOpen /> Доступные задания ({group.tasks.filter(t => t.is_open).length})
                        </h3>
                        {group.tasks.length > 0 ? (
                          <Card className="divide-y">
                            {group.tasks.map(task => renderTaskItem(task, group, true))}
                          </Card>
                        ) : (
                          <p className="text-default-500 text-sm p-3">Нет доступных заданий</p>
                        )}
                      </div>
                    </div>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Модальные окна */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateGroup}
        isLoading={isCreating}
      />

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onAdd={handleAddUser}
        isLoading={isAddingUser}
        groupName={selectedGroup?.group_number}
      />

      <RemoveUserModal
        isOpen={isRemoveUserModalOpen}
        onClose={() => setIsRemoveUserModalOpen(false)}
        onRemove={handleRemoveUser}
        isLoading={isRemovingUser}
        groupName={selectedGroup?.group_number}
      />

      <GrantRightsModal
        isOpen={isGrantRightsModalOpen}
        onClose={() => setIsGrantRightsModalOpen(false)}
        onGrant={handleGrantRights}
        isLoading={isGrantingRights}
        group={selectedGroup}
        tasks={availableTasks || []}
      />

      <ConfirmDeleteGroupModal
        isOpen={isConfirmDeleteGroupModalOpen}
        onClose={() => setIsConfirmDeleteGroupModalOpen(false)}
        onDelete={handleDeleteGroup}
        group={selectedGroup}
      />

      <ConfirmChangeIsOpen
        isOpen={isChangeIsOpenModal}
        onClose={() => setIsChangeIsOpenModal(false)}
        onChange={handleChangeIsOpen}
        group={selectedGroupWithTask}
        id_task={selectedTaskId}
      />

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </motion.div>
  );
};