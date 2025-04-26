import type React from 'react';
import { useState } from 'react';
import { 
  Button,
  Card,
  CardHeader,
  CardBody,
  Textarea,
  Spinner,
  Divider,
  Chip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input
} from '@heroui/react';
import { 
  FiMail, 
  FiAlertCircle,
  FiSend,
  FiClock,
  FiCheckCircle,
  FiMessageSquare,
  FiMoreVertical,
  FiUser,
  FiRefreshCw,
  FiPlus,
  FiX
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useGetAllAppealQuery, useSendResponseMutation } from '../../app/services/supportApi';
import { EmptyState } from '../../components/empty-state';

// Анимационные варианты
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const MAX_RESPONSE_LENGTH = 2000;
const DEFAULT_STATUSES = ['Решено', 'В обработке', 'Требует уточнения'];

export const SupportPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAppeal, setSelectedAppeal] = useState<number | null>(null);
  const [responseText, setResponseText] = useState('');
  const [status, setStatus] = useState('Решено');
  const [customStatus, setCustomStatus] = useState('');
  const [showCustomStatusInput, setShowCustomStatusInput] = useState(false);
  const { data: appeals, isLoading, isError, refetch } = useGetAllAppealQuery();
  const [sendResponse, { isLoading: isSending }] = useSendResponseMutation();

  const remainingChars = MAX_RESPONSE_LENGTH - responseText.length;

  const handleResponseSubmit = async () => {
    if (!selectedAppeal || !responseText.trim()) return;
    
    const finalStatus = showCustomStatusInput && customStatus ? customStatus : status;
    
    try {
      await sendResponse({
        id_support: selectedAppeal.toString(),
        admin_response: responseText,
        status: finalStatus
      }).unwrap();
      setResponseText('');
      setCustomStatus('');
      setShowCustomStatusInput(false);
      setSelectedAppeal(null);
      onClose();
      refetch();
    } catch (error) {
      console.error('Ошибка при отправке ответа:', error);
    }
  };

  const handleResponseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_RESPONSE_LENGTH) {
      setResponseText(e.target.value);
    }
  };

  const openResponseModal = (id_support: number) => {
    setSelectedAppeal(id_support);
    setStatus('Решено');
    setCustomStatus('');
    setShowCustomStatusInput(false);
    onOpen();
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMMM yyyy HH:mm', { locale: ru });
  };

  const renderStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('решено') || statusLower.includes('закрыто')) {
      return (
        <Chip 
          color="success" 
          variant="flat"
          startContent={<FiCheckCircle className="text-lg" />}
          className="ml-2"
        >
          {status}
        </Chip>
      );
    } else if (statusLower.includes('обработк') || statusLower.includes('новое')) {
      return (
        <Chip 
          color="warning" 
          variant="flat"
          startContent={<FiClock className="text-lg" />}
          className="ml-2"
        >
          {status}
        </Chip>
      );
    } else if (statusLower.includes('отклонено') || statusLower.includes('отказано')) {
      return (
        <Chip 
          color="danger" 
          variant="flat"
          startContent={<FiAlertCircle className="text-lg" />}
          className="ml-2"
        >
          {status}
        </Chip>
      );
    } else {
      return (
        <Chip 
          color="default" 
          variant="flat"
          startContent={<FiMessageSquare className="text-lg" />}
          className="ml-2"
        >
          {status}
        </Chip>
      );
    }
  };

  const toggleCustomStatusInput = () => {
    setShowCustomStatusInput(!showCustomStatusInput);
    if (!showCustomStatusInput) {
      setCustomStatus('');
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-8 max-w-6xl"
    >
      <motion.div variants={slideUp} className="flex items-center gap-3 mb-8">
        <Avatar
          icon={<FiMail className="text-lg" />}
          className="bg-primary-100 text-primary-500"
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
          Обращения пользователей
        </h1>
      </motion.div>

      {/* Список обращений */}
      <motion.div variants={slideUp}>
        <Card className="shadow-lg">
          <CardHeader className="border-b border-default-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiMessageSquare /> Все обращения
            </h2>
            <Button 
              color="primary" 
              variant="light" 
              onClick={() => refetch()}
              startContent={<FiRefreshCw />}
            >
              Обновить
            </Button>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <EmptyState
                icon={<FiAlertCircle size={48} className="text-danger" />}
                title="Ошибка загрузки"
                description="Не удалось загрузить список обращений"
                action={
                  <Button color="primary" onClick={refetch}>
                    Попробовать снова
                  </Button>
                }
              />
            ) : appeals?.length === 0 ? (
              <EmptyState
                icon={<FiMail size={48} className="text-default-400" />}
                title="Нет обращений"
                description="Пользователи пока не отправляли обращения"
              />
            ) : (
              <div className="space-y-6">
                {appeals?.map((appeal) => (
                  <motion.div 
                    key={appeal.id_support}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-default-200 rounded-lg p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FiUser className="text-default-400" />
                          <span className="text-sm">ID пользователя: {appeal.id_user}</span>
                        </div>
                        <h3 className="font-medium text-lg text-primary">
                          Обращение #{appeal.id_support}
                        </h3>
                        <p className="text-xs text-default-500 mt-1">
                          {formatDate(appeal.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(appeal.status)}
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <FiMoreVertical />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Действия с обращением">
                            <DropdownItem 
                              key="respond" 
                              onClick={() => openResponseModal(appeal.id_support)}
                            >
                              Ответить
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-default-600 mb-1">
                        Сообщение пользователя:
                      </p>
                      <p className="whitespace-pre-line text-default-800">
                        {appeal.user_text}
                      </p>
                    </div>
                    
                    {appeal.admin_response && (
                      <>
                        <Divider className="my-4" />
                        <div className="bg-default-100 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar
                              icon={<FiMail className="text-lg" />}
                              className="bg-primary-100 text-primary-500 w-6 h-6"
                            />
                            <p className="text-sm font-semibold text-primary">
                              Ответ администратора:
                            </p>
                          </div>
                          <p className="whitespace-pre-line text-default-800">
                            {appeal.admin_response}
                          </p>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Модальное окно ответа */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <FiMessageSquare />
            <span>Ответ на обращение #{selectedAppeal}</span>
          </ModalHeader>
          <ModalBody>
            <Textarea
              label="Ваш ответ"
              labelPlacement="outside"
              placeholder="Напишите ответ пользователю..."
              description={
                <span className={`text-xs ${
                  remainingChars < 50 ? 'text-danger' : 'text-default-500'
                }`}>
                  Осталось символов: {remainingChars}/{MAX_RESPONSE_LENGTH}
                </span>
              }
              minRows={5}
              maxRows={8}
              value={responseText}
              onChange={handleResponseChange}
              isDisabled={isSending}
              classNames={{
                input: "text-base",
                label: "text-base font-medium"
              }}
              className="mb-4"
            />
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-default-600">Статус обращения:</p>
              
              <div className="flex flex-wrap gap-2">
                {DEFAULT_STATUSES.map((statusOption) => (
                  <Button
                    key={statusOption}
                    color={status === statusOption && !showCustomStatusInput ? 'primary' : 'default'}
                    variant={status === statusOption && !showCustomStatusInput ? 'solid' : 'bordered'}
                    onClick={() => {
                      setStatus(statusOption);
                      setShowCustomStatusInput(false);
                    }}
                    className="capitalize"
                    isDisabled={showCustomStatusInput}
                  >
                    {statusOption}
                  </Button>
                ))}
                
                <Button
                  color={showCustomStatusInput ? 'primary' : 'default'}
                  variant={showCustomStatusInput ? 'solid' : 'bordered'}
                  onClick={toggleCustomStatusInput}
                  startContent={showCustomStatusInput ? <FiX /> : <FiPlus />}
                >
                  {showCustomStatusInput ? 'Отмена' : 'Другой статус'}
                </Button>
              </div>
              
              {showCustomStatusInput && (
                <Input
                  label="Укажите свой статус"
                  placeholder="Например: Отклонено, Требуется доп. информация"
                  value={customStatus}
                  onChange={(e) => setCustomStatus(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Отмена
            </Button>
            <Button 
              color="primary" 
              onPress={handleResponseSubmit}
              isLoading={isSending}
              isDisabled={!responseText.trim() || (showCustomStatusInput && !customStatus.trim())}
              endContent={<FiSend />}
            >
              Отправить ответ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </motion.div>
  );
};