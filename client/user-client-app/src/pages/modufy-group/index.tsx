import type React from 'react';
import { useState, useMemo, useCallback } from 'react';
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
  Badge,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  Button,
  DropdownItem,
  Accordion,
  Avatar,
  Chip,
  AccordionItem
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
  FiChevronUp
} from 'react-icons/fi';
import {
  useCreateMutation,
  useAddUserToGroupMutation,
  useRemoveFromGroupByEmailMutation,
  useDeleteByIdMutation,
  useGrantRightsToGroupMutation,
  useGetAllMyGroupsQuery,
  useGetAllMyAccessQuery,
  useLazyGetAllMyAccessQuery
} from '../../app/services/groupApi';
import type { GroupWithTasksAndUsers, GroupWithTasks, Task } from '../../app/types';
import { CreateGroupModal } from '../../components/create-group-modal';
import { AddUserModal } from '../../components/add-user-modal';
import { GrantRightsModal } from '../../components/grant-rights-modal';
import { RemoveUserModal } from '../../components/remove-user-modal';
import { Button as CustomButton } from '../../components/button';
import { DropdownItemWithIcon } from '../../components/dropdown-item-with-icon';
import { ErrorModal } from '../../components/error-modal';
import { useGetAllAvailableQuery } from '../../app/services/taskApi';
import { ConfirmDeleteGroupModal } from '../../components/confirm-delete-group-modal';

export const ModifyGroup = () => {
  const [selectedGroup, setSelectedGroup] = useState<GroupWithTasksAndUsers | null>(null);
  const [selectedGroupWithTask, setSelectedGroupWithTasks] = useState<GroupWithTasks | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isRemoveUserModalOpen, setIsRemoveUserModalOpen] = useState(false);
  const [isGrantRightsModalOpen, setIsGrantRightsModalOpen] = useState(false);
  const [isConfirmDeleteGroupModalOpen, setIsConfirmDeleteGroupModalOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const [email, setEmail] = useState('');
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

  const [createGroup, { isLoading: isCreating }] = useCreateMutation();
  const [addUserToGroup, { isLoading: isAddingUser }] = useAddUserToGroupMutation();
  const [removeUserFromGroup, { isLoading: isRemovingUser }] = useRemoveFromGroupByEmailMutation();
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteByIdMutation();
  const [grantRights, { isLoading: isGrantingRights }] = useGrantRightsToGroupMutation();
  const [getAllMyAccess] = useLazyGetAllMyAccessQuery();



  const {
    data: availableTasks,
    isLoading: isLoadingTasks,
    isError: isTasksError
  } = useGetAllAvailableQuery();

  const toggleGroupExpand = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
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
    <div key={user.id_user} className="flex items-center gap-3 py-2 px-4">
      <Avatar name={`${user.lastname} ${user.firstname}`} size="sm" />
      <div>
        <p className="font-medium">{user.lastname} {user.firstname} {user.middlename}</p>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>
      <Chip size="sm" color={user.role_name === 'teacher' ? 'primary' : 'default'} className="ml-auto">
        {user.role_name === 'teacher' ? 'Преподаватель' : 'Студент'}
      </Chip>
    </div>
  );

  const renderTaskItem = (task: any, isAccessGroup?: boolean) => (
    <div key={isAccessGroup ? task.id_task_for_group : task.id_task} className="flex items-center gap-3 py-2 px-4">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <FiBookOpen size={16} />
      </div>
      <div>
        <p className="font-medium">{task.task?.task_name || task.task_name}</p>
        <p className="text-sm text-gray-500">{task.task?.description || task.description}</p>
        {isAccessGroup && (
          <Chip 
            size="sm" 
            color={task.is_open ? 'success' : 'warning'} 
            className="mt-1"
          >
            {task.is_open ? 'Доступ открыт' : 'Доступ закрыт'}
          </Chip>
        )}
      </div>
    </div>
  );

  const renderMyGroupsCell = (group: GroupWithTasksAndUsers, columnKey: React.Key) => {
    switch (columnKey) {
      case "group_number":
        return <span className="font-medium">{group.group_number}</span>;
      
      case "hash_code":
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">{group.hash_code_login}</span>
            <CustomButton 
              size="sm" 
              variant="ghost" 
              icon={<FiCopy size={14} />}
              onClick={() => navigator.clipboard.writeText(group.hash_code_login)}
            />
          </div>
        );
      
      case "users":
        return <Badge color="primary">{group.users.length}</Badge>;
      
      case "tasks":
        return <Badge color="secondary">{group.tasks.length}</Badge>;
      
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="ghost"
                aria-label="Действия с группой"
                className='w-full'
              >
                <FiMoreVertical size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Действия с группой"
              onAction={(key) => {
                switch (key) {
                  case "add-user":
                    setSelectedGroup(group);
                    setIsAddUserModalOpen(true);
                    break;
                  case "remove-user":
                    setSelectedGroup(group);
                    setIsRemoveUserModalOpen(true);
                    break;
                  case "grant-rights":
                    setSelectedGroup(group);
                    setIsGrantRightsModalOpen(true);
                    break;
                  case "delete-group":
                    setSelectedGroup(group);
                    setIsConfirmDeleteGroupModalOpen(true);
                    break;
                }
              }}
            >
              <DropdownItem 
                key="add-user" 
                startContent={<FiUserPlus size={16} />}
                textValue="Добавить участника"
              >
                Добавить участника
              </DropdownItem>
              
              <DropdownItem 
                key="remove-user" 
                startContent={<FiUserMinus size={16} />}
                textValue="Удалить участника"
              >
                Удалить участника
              </DropdownItem>
              
              <DropdownItem 
                key="grant-rights" 
                startContent={<FiBookOpen size={16} />}
                textValue="Назначить задание"
              >
                Назначить задание
              </DropdownItem>
              
              <DropdownItem 
                key="delete-group" 
                startContent={<FiTrash2 size={16} />}
                className="text-danger"
                textValue="Удалить группу"
              >
                Удалить группу
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        );
      
      default:
        return null;
    }
  };

  const renderAccessGroupsCell = (group: GroupWithTasks, columnKey: React.Key) => {
    switch (columnKey) {
      case "group_number":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onClick={() => toggleGroupExpand(group.hash_code_login)}
            >
              {expandedGroups[group.hash_code_login] ? <FiChevronUp /> : <FiChevronDown />}
            </Button>
            <span className="font-medium">{group.group_number}</span>
          </div>
        );
      case "hash_code":
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono">{group.hash_code_login}</span>
            <CustomButton 
              size="sm" 
              variant="ghost" 
              icon={<FiCopy size={14} />}
              onClick={() => navigator.clipboard.writeText(group.hash_code_login)}
            />
          </div>
        );
      case "tasks":
        return <Badge color="secondary">{group.tasks.length}</Badge>;
      case "status":
        return <Badge color="success">Доступ предоставлен</Badge>;
      case "actions":
        return (
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Действия с группой"
              >
                <FiMoreVertical size={16} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Действия с группой"
              onAction={(key) => {
                setSelectedGroupWithTasks(group);
                switch (key) {
                  case "grant-rights":
                    setIsGrantRightsModalOpen(true);
                    break;
                }
              }}
            >
              <DropdownItemWithIcon 
                key="grant-rights" 
                icon={<FiBookOpen size={16} />}
                text="Назначить задание"
              />
            </DropdownMenu>
          </Dropdown>
        );
      default:
        return null;
    }
  };

  const CustomEmptyState = ({ 
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-400 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Управление группами</h1>
        <CustomButton 
          color="primary" 
          onClick={() => setIsCreateModalOpen(true)}
          icon={<FiPlus size={18} />}
        >
          Создать группу
        </CustomButton>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FiUsers size={20} /> Мои группы
          </h2>
        </CardHeader>
        <CardBody>
          {isLoadingGroups ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : isGroupsError ? (
            <CustomEmptyState
              icon={<FiAlertCircle size={48} className="text-danger" />}
              title="Ошибка загрузки"
              description="Не удалось загрузить список групп"
              action={
                <CustomButton color="primary" onClick={() => refetchGroups()}>
                  Попробовать снова
                </CustomButton>
              }
            />
          ) : myGroups?.length === 0 ? (
            <CustomEmptyState
              icon={<FiMail size={48}/>}
              title="Нет групп"
              description="У вас пока нет созданных групп"
            />
          ) : (
            <Accordion selectionMode="multiple" className="space-y-2 rounded-lg "       
            showDivider={true}
            variant="shadow">
              {(myGroups || []).map((group) => (
                <AccordionItem
                  key={group.hash_code_login}
                  aria-label={group.group_number}
                  title={group.group_number}
                  subtitle={'Количество участников: ' + group.users.length}
                  startContent={<FiUsers className="text-danger" />}
                  classNames={{base: 'border-top-width-0'}}
                >
                  <div className="p-4 ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <FiUsers size={16} /> Код доступа
                          </h3>
                          {renderMyGroupsCell(group, myGroupsColumns[1].uid)}
                        </div>
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <FiUsers size={16} /> Действия с группой
                          </h3>
                          <div className="rounded-lg divide-y">
                          {renderMyGroupsCell(group, myGroupsColumns[4].uid)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium mb-2 flex items-center gap-2">
                            <FiUsers size={16} /> Участники ({group.users.length})
                          </h3>
                          {group.users.length > 0 ? (
                            <div className="border rounded-lg divide-y">
                              {group.users.map(renderUserItem)}
                            </div>
                          ) : (
                            <p className=" text-sm">Нет участников</p>
                          )}
                        </div>
                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          <FiBookOpen size={16} /> Доступные задания ({group.tasks.length})
                        </h3>
                        {group.tasks.length > 0 ? (
                          <div className="border rounded-lg divide-y">
                            {group.tasks.map(task => renderTaskItem(task))}
                          </div>
                        ) : (
                          <p className=" text-sm">Нет доступных заданий</p>
                        )}
                      </div>
                      <div></div>
                    </div>
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FiUnlock size={20} /> Группы с доступом
          </h2>
        </CardHeader>
        <CardBody>
          {isLoadingAccess ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : isAccessError ? (
            <CustomEmptyState
              icon={<FiAlertCircle size={48} className="text-danger" />}
              title="Ошибка загрузки"
              description="Не удалось загрузить список групп с доступом"
            />
          ) : myAccess?.length === 0 ? (
            <CustomEmptyState
              icon={<FiUnlock size={48} className="text-gray-400" />}
              title="Нет доступных групп"
              description="У вас нет доступа к другим группам"
            />
          ) : (
            <Accordion selectionMode="multiple" className="space-y-2 rounded-lg "       
            showDivider={true}
            variant="shadow">
              {(myAccess || []).map((group) => (
                <AccordionItem
                key={group.hash_code_login}
                aria-label={group.group_number}
                title={group.group_number}
                subtitle={'Количество выданных прав на задания: ' + group.tasks.length}
                startContent={<FiUsers className="text-danger" />}
                classNames={{base: 'border-top-width-0'}}
                >
                  <div className="p-4 ">
                    <div className="w-full">
                            {(myAccess || []).map((group) => (
                              <TableRow key={group.hash_code_login}>
                                {accessGroupsColumns.map((column) => (
                                  <TableCell key={`${group.hash_code_login}-${column.uid}`}>
                                    {renderAccessGroupsCell(group, 0) as React.ReactNode}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                      </div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <FiBookOpen size={16} /> Доступные задания ({group.tasks.filter(task => task.is_open).length})
                    </h3>
                    {group.tasks.length > 0 ? (
                      <div className="border  rounded-lg divide-y">
                        {group.tasks.map(task => renderTaskItem(task, true))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Нет доступных заданий</p>
                    )}
                  </div>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardBody>
      </Card>

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

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </div>
  );
};