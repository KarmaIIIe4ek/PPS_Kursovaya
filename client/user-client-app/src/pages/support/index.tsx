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
  Badge,
  Avatar
} from '@heroui/react';
import { 
  useSendToSupportMutation, 
  useGetListMyAppealQuery 
} from '../../app/services/supportApi';
import type { Support as SupportType } from '../../app/types';
import { 
  FiMail, 
  FiAlertCircle,
  FiSend,
  FiClock,
  FiCheckCircle,
  FiMessageSquare
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';
import { motion } from 'framer-motion';
import { Alert } from '@heroui/react';

// Анимационные варианты
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const MAX_MESSAGE_LENGTH = 2000;

export const Support = () => {
  const [message, setMessage] = useState('');
  const { data: appeals, isLoading, isError, refetch } = useGetListMyAppealQuery();
  const [sendToSupport, { isLoading: isSending, isError: isSendError }] = useSendToSupportMutation();

  const remainingChars = MAX_MESSAGE_LENGTH - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length > MAX_MESSAGE_LENGTH) return;
    
    try {
      await sendToSupport({ user_text: message }).unwrap();
      setMessage('');
      refetch();
    } catch (error) {
      console.error('Ошибка при отправке обращения:', error);
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(e.target.value);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'Новое':
        return (
          <Chip 
            color="warning" 
            variant="flat"
            startContent={<FiClock className="text-lg" />}
            className="ml-2"
          >
            В обработке
          </Chip>
        );
      case 'Закрыто':
        return (
          <Chip 
            color="success" 
            variant="flat"
            startContent={<FiCheckCircle className="text-lg" />}
            className="ml-2"
          >
            Решено
          </Chip>
        );
      default:
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
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <motion.div variants={slideUp} className="flex items-center gap-3 mb-8">
        <Avatar
          icon={<FiMail className="text-lg" />}
          className="bg-primary-100 text-primary-500"
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Техническая поддержка</h1>
      </motion.div>
      
      {/* Форма создания обращения */}
      <motion.div variants={slideUp}>
        <Card className="mb-8 shadow-lg">
          <CardHeader className="border-b border-default-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiMessageSquare /> Новое обращение
            </h2>
          </CardHeader>
          <CardBody>
            {isSendError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert color="danger" variant="flat">
                  Ошибка при отправке обращения. Попробуйте позже.
                </Alert>
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit}>
              <Textarea
                label="Опишите вашу проблему"
                labelPlacement="outside"
                placeholder="Подробно опишите возникшую проблему или вопрос..."
                description={
                  <span className={`text-xs ${
                    remainingChars < 50 ? 'text-danger' : 'text-default-500'
                  }`}>
                    Осталось символов: {remainingChars}/{MAX_MESSAGE_LENGTH}
                  </span>
                }
                minRows={5}
                maxRows={8}
                value={message}
                onChange={handleMessageChange}
                isDisabled={isSending}
                classNames={{
                  input: "text-base",
                  label: "text-base font-medium"
                }}
                className="mb-4"
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  color="primary"
                  size="lg"
                  isLoading={isSending}
                  isDisabled={!message.trim() || message.length > MAX_MESSAGE_LENGTH}
                  endContent={!isSending && <FiSend />}
                  className="font-medium"
                >
                  {isSending ? "Отправка..." : "Отправить обращение"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>

      {/* Список обращений */}
      <motion.div variants={slideUp}>
        <Card className="shadow-lg">
          <CardHeader className="border-b border-default-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiMail /> Мои обращения
            </h2>
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
                description="У вас пока нет обращений в поддержку"
              />
            ) : (
              <div className="space-y-6">
                {appeals?.map((appeal: SupportType) => (
                  <motion.div 
                    key={appeal.id_support}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-default-200 rounded-lg p-5 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-lg text-primary">
                          Обращение #{appeal.id_support}
                        </h3>
                        <p className="text-xs text-default-500 mt-1">
                          {new Date(appeal.createdAt).toLocaleString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {renderStatusBadge(appeal.status)}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-default-600 mb-1">
                        Ваше сообщение:
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
                              Ответ поддержки:
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
    </motion.div>
  );
};