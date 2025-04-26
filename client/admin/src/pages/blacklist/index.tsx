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
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Chip,
  Badge,
  Spinner
} from '@heroui/react';
import { 
  FiUser,
  FiTrash2,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiSlash,
  FiClock
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Blacklist } from '../../app/types';
import { useGetAllBlacklistQuery, useLazyGetAllBlacklistQuery, useRemoveFromBlacklistMutation } from '../../app/services/blacklistApi';
import { EmptyState } from '../../components/empty-state';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export const BlacklistPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEntry, setSelectedEntry] = useState<Blacklist | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: blacklist, isLoading, isError, refetch } = useGetAllBlacklistQuery();
  const [removeFromBlacklist] = useRemoveFromBlacklistMutation();
  const [triggerGetAll] = useLazyGetAllBlacklistQuery();

  const filteredBlacklist = blacklist?.filter(entry => 
    searchQuery === '' || 
    entry.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openRemoveModal = (entry: Blacklist) => {
    setSelectedEntry(entry);
    onOpen();
  };

  const handleRemoveFromBlacklist = async () => {
    if (!selectedEntry) return;
    
    try {
      await removeFromBlacklist({
        email: selectedEntry.user.email
      }).unwrap();
      triggerGetAll();
      onClose();
    } catch (error) {
      console.error('Ошибка при удалении из чёрного списка:', error);
    }
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd.MM.yyyy HH:mm', { locale: ru });
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
            icon={<FiSlash className="text-lg" />}
            className="bg-danger-100 text-danger-500"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            Чёрный список
          </h1>
        </div>
        <Button 
          color="primary" 
          variant="light" 
          onClick={refetch}
          startContent={<FiRefreshCw />}
        >
          Обновить
        </Button>
      </motion.div>

      <motion.div variants={slideUp} className="mb-6">
        <Card className="shadow-sm">
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Поиск в чёрном списке"
                placeholder="Поиск по email, имени или причине..."
                startContent={<FiSearch />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
                <div className="flex items-center gap-2">
                    <Chip
                        
                        color="danger" 
                        variant="solid"
                        classNames={{
                        base: "px-3 py-1",
                        content: "font-medium"
                        }}
                    >
                        {filteredBlacklist?.length || 0}
                    </Chip>
                    <span className="text-default-500">Найдено записей</span>
                </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div variants={slideUp}>
        <Card className="shadow-lg">
          <CardHeader className="border-b border-default-200">
            <h2 className="text-xl font-semibold">Список заблокированных пользователей</h2>
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
                description="Не удалось загрузить чёрный список"
                action={
                  <Button color="primary" onClick={refetch}>
                    Попробовать снова
                  </Button>
                }
              />
            ) : filteredBlacklist?.length === 0 ? (
              <EmptyState
                icon={<FiSlash className="text-default-400" size={48} />}
                title="Чёрный список пуст"
                description="Нет пользователей в чёрном списке"
              />
            ) : (
              <Table aria-label="Blacklist table">
                <TableHeader>
                  <TableColumn>Пользователь</TableColumn>
                  <TableColumn>Роль</TableColumn>
                  <TableColumn>Причина</TableColumn>
                  <TableColumn>Дата добавления</TableColumn>
                  <TableColumn>Действия</TableColumn>
                </TableHeader>
                <TableBody>
                  {(filteredBlacklist || [])?.map((entry) => (
                    <TableRow key={entry.id_blacklist}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={`${entry.user.firstname} ${entry.user.lastname}`}
                            className="bg-default-100 text-default-800"
                          />
                          <div>
                            <p className="font-medium">{entry.user.lastname} {entry.user.firstname}</p>
                            <p className="text-default-500 text-sm">{entry.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(entry.user.role_name)}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="whitespace-pre-wrap">{entry.reason}</p>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color="default"
                          variant="flat"
                          startContent={<FiClock />}
                        >
                          {formatDate(entry.date_added)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={() => openRemoveModal(entry)}
                          startContent={<FiTrash2 />}
                        >
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Модальное окно удаления из чёрного списка */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FiTrash2 />
            <span>Удаление из чёрного списка</span>
          </ModalHeader>
          <ModalBody>
            <p>Вы уверены, что хотите удалить пользователя <span className="font-semibold">{selectedEntry?.user.email}</span> из чёрного списка?</p>
            {selectedEntry && (
              <div className="mt-4 p-4 bg-default-100 rounded-lg">
                <p className="text-sm text-default-500">Причина блокировки:</p>
                <p className="font-medium">{selectedEntry.reason}</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Отмена
            </Button>
            <Button 
              color="danger" 
              onPress={handleRemoveFromBlacklist}
            >
              Удалить из чёрного списка
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};