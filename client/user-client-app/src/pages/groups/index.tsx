import { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Divider,
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { 
  useGetGroupsWhereIAmMemberQuery,
  useAddSelfToGroupMutation,
  useRemoveSelfFromGroupMutation
} from '../../app/services/groupApi';
import { 
  FiUsers,
  FiPlus,
  FiTrash2,
  FiHash,
  FiUser,
  FiMail,
  FiShield,
  FiAlertCircle
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';
import { ErrorModal } from '../../components/error-modal';
import { Button } from '../../components/button';

export const GroupPage = () => {
  const [hashCodeInput, setHashCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Получаем группы, где студент является участником
  const { 
    data: groups, 
    isLoading, 
    isError, 
    refetch 
  } = useGetGroupsWhereIAmMemberQuery();
  
  // Мутации для добавления/удаления себя из группы
  const [addToGroup] = useAddSelfToGroupMutation();
  const [removeFromGroup] = useRemoveSelfFromGroupMutation();

  const handleAddToGroup = async () => {
    try {
      await addToGroup({ hash_code_login: hashCodeInput }).unwrap();
      setHashCodeInput('');
      refetch();
      onClose();
    } catch (error: any) {
      setErrorMessage(error.data?.message || 'Ошибка при добавлении в группу');
      setIsErrorModalOpen(true);
    }
  };

  const handleRemoveFromGroup = async (hashCode: string) => {
    try {
      await removeFromGroup({ hash_code_login: hashCode }).unwrap();
      refetch();
    } catch (error: any) {
      setErrorMessage(error.data?.message || 'Ошибка при выходе из группы');
      setIsErrorModalOpen(true);
    }
  };

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    switch(role.toLowerCase()) {
      case 'teacher':
        return <div color="primary" className="flex items-center gap-1" content=''><FiShield /> Преподаватель</div>;
      default:
        return <div className="flex items-center gap-1" content=''><FiUser /> Студент</div>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FiUsers size={24} /> Мои группы
      </h1>

      <div className="flex justify-end mb-6">
        <Button 
          color="primary" 
          onClick={onOpen}
          icon={<FiPlus />}
        >
          Вступить в группу
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={<FiAlertCircle size={48} className="text-danger" />}
          title="Ошибка загрузки"
          description="Не удалось загрузить список групп"
          action={
            <Button color="primary" onClick={refetch}>
              Попробовать снова
            </Button>
          }
        />
      ) : groups?.length === 0 ? (
        <EmptyState
          icon={<FiUsers size={48} className="text-default-400" />}
          title="Нет групп"
          description="Вы пока не состоите ни в одной группе"
        />
      ) : (
        <div className="space-y-6">
          {groups?.map((group) => (
            <Card key={group.id_group}>
              <CardHeader>
                <div className="flex justify-between w-[100%] items-center">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <FiHash /> {group.group_number}
                    </h2>
                    <div className="text-sm text-default-500">
                      Создана: {formatDate(group.created_at)} | Код: {group.hash_code_login}
                    </div>
                  </div>
                  <Button
                    color="danger"
                    size="md"
                    onClick={() => handleRemoveFromGroup(group.hash_code_login)}
                    icon={<FiTrash2 />}
                  >
                    Покинуть группу
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Преподаватель:</h3>
                  <div className="flex items-center gap-2 p-2 bg-default-100 rounded-lg">
                    <div className="font-medium">
                      {group.creator.lastname} {group.creator.firstname} {group.creator.middlename || ''}
                    </div>
                  </div>
                </div>

                <Divider className="my-4" />

                <h3 className="font-medium mb-3">Участники группы:</h3>
                <Table aria-label="Group members table">
                  <TableHeader>
                    <TableColumn>ФИО</TableColumn>
                    <TableColumn>Email</TableColumn>
                    <TableColumn>Роль</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {group.members.map((member) => (
                      <TableRow key={member.id_user}>
                        <TableCell>
                          {member.lastname} {member.firstname} {member.middlename || ''}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <FiMail /> {member.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRoleBadge(member.role_name)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Модальное окно для вступления в группу */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Вступить в группу</ModalHeader>
          <ModalBody>
            <Input
              label="Код группы (hash_code_login)"
              placeholder="Введите код группы"
              value={hashCodeInput}
              onChange={(e) => setHashCodeInput(e.target.value)}
              description="Получите код группы у преподавателя"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button 
              color="primary" 
              onClick={handleAddToGroup}
              isDisabled={!hashCodeInput.trim()}
            >
              Вступить
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