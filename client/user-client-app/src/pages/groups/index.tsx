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
  Chip,
  Avatar,
  Badge,
  Button as NextButton,
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
  FiAlertCircle,
  FiCalendar,
  FiKey
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';
import { ErrorModal } from '../../components/error-modal';
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
  hidden: { opacity: 1, scale: 1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

export const GroupPage = () => {
  const [hashCodeInput, setHashCodeInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const { 
    data: groups, 
    isLoading, 
    isError, 
    refetch 
  } = useGetGroupsWhereIAmMemberQuery();
  
  const [addToGroup, { isLoading: isAdding }] = useAddSelfToGroupMutation();
  const [removeFromGroup, { isLoading: isRemoving }] = useRemoveSelfFromGroupMutation();

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
        return (
          <Chip 
            color="primary" 
            variant="flat"
            startContent={<FiShield className="text-lg" />}
          >
            Преподаватель
          </Chip>
        );
      default:
        return (
          <Chip 
            variant="flat"
            startContent={<FiUser className="text-lg" />}
          >
            Студент
          </Chip>
        );
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-8 max-w-6xl"
    >
      <motion.div variants={slideUp} className="flex items-center gap-3 mb-8 ">
        <Avatar
          icon={<FiUsers className="text-lg" />}
          className="bg-primary-100 text-primary-500"
        />
        
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Мои группы</h1>
      </motion.div>

      <motion.div variants={slideUp} className="flex justify-end mb-6">
        <NextButton 
          color="primary" 
          onClick={onOpen}
          endContent={<FiPlus />}
          className="font-medium"
        >
          Вступить в группу
        </NextButton>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={<FiAlertCircle size={48} className="text-danger" />}
          title="Ошибка загрузки"
          description="Не удалось загрузить список групп"
          action={
            <NextButton color="primary" onClick={refetch}>
              Попробовать снова
            </NextButton>
          }
        />
      ) : groups?.length === 0 ? (
        <EmptyState
          icon={<FiUsers size={48} className="text-default-400" />}
          title="Нет групп"
          description="Вы пока не состоите ни в одной группе"
        />
      ) : (
        <motion.div className="space-y-6">
          {groups?.map((group) => (
            <motion.div 
              key={group.id_group}
              variants={scaleUp}
              whileHover={{ scale: 1.005 }}
            >
              <Card className="shadow-lg">
                <CardHeader className="border-b border-default-200 p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-4">
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <FiHash /> {group.group_number}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-default-500 mt-1">
                        <FiCalendar /> Создана: {formatDate(group.created_at)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-default-500 mt-1">
                        Код: {group.hash_code_login}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <NextButton
                        color="danger"
                        variant="flat"
                        onClick={() => handleRemoveFromGroup(group.hash_code_login)}
                        endContent={<FiTrash2 />}
                        isLoading={isRemoving}
                      >
                        Покинуть группу
                      </NextButton>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">Преподаватель:</h3>
                    <div className="flex items-center gap-3 p-3 bg-default-100 rounded-lg">
                      <Avatar
                        name={`${group.creator.lastname} ${group.creator.firstname}`}
                        className="bg-primary-100 text-primary-500"
                      />
                      <div>
                        <div className="font-medium">
                          {group.creator.lastname} {group.creator.firstname} {group.creator.middlename || ''}
                        </div>
                        <div className="text-sm text-default-500 flex items-center gap-1">
                          <FiMail /> {group.creator.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-4" />

                  <h3 className="font-medium mb-4">Участники группы ({group.members.length}):</h3>
                  <Table 
                    aria-label="Group members table" 
                    removeWrapper
                    classNames={{
                      th: "bg-default-100",
                      tr: "hover:bg-default-100 transition-colors"
                    }}
                  >
                    <TableHeader>
                      <TableColumn>ФИО</TableColumn>
                      <TableColumn>Email</TableColumn>
                      <TableColumn>Роль</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {group.members.map((member) => (
                        <TableRow key={member.id_user}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={`${member.lastname} ${member.firstname}`}
                                size="sm"
                                className="bg-default-100"
                              />
                              <div>
                                {member.lastname} {member.firstname} {member.middlename || ''}
                              </div>
                            </div>
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
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Модальное окно для вступления в группу */}
      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 p-6 border-b border-default-200">
                <div className="flex items-center gap-2">
                  <FiKey className="text-primary" /> Вступить в группу
                </div>
              </ModalHeader>
              <ModalBody className="p-6">
                <Input
                  label="Код группы"
                  labelPlacement="outside"
                  placeholder="Введите код группы"
                  value={hashCodeInput}
                  onChange={(e) => setHashCodeInput(e.target.value)}
                  description="Получите код группы у преподавателя"
                  startContent={
                    <FiHash className="text-default-400" />
                  }
                  classNames={{
                    input: "text-base",
                    label: "text-base font-medium"
                  }}
                />
              </ModalBody>
              <ModalFooter className="p-6 border-t border-default-200">
                <NextButton color="default" variant="light" onClick={onClose}>
                  Отмена
                </NextButton>
                <NextButton 
                  color="primary" 
                  onClick={handleAddToGroup}
                  isDisabled={!hashCodeInput.trim()}
                  isLoading={isAdding}
                >
                  Вступить
                </NextButton>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </motion.div>
  );
};