import type React from 'react';
import { useState } from 'react';
import { 
  Button,
  Card,
  CardHeader,
  CardBody,
  Textarea,
  Spinner,
  Badge,
  Divider,
  Alert
} from '@heroui/react';
import { 
  useSendToSupportMutation, 
  useGetListMyAppealQuery 
} from '../../app/services/supportApi';
import type { Support as SupportType } from '../../app/types';
import { 
  FiMail, 
  FiAlertCircle, 
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';

export const Support = () => {
  const [message, setMessage] = useState('');
  const { data: appeals, isLoading, isError, refetch } = useGetListMyAppealQuery();
  const [sendToSupport, { isLoading: isSending, isError: isSendError }] = useSendToSupportMutation();

  const MAX_MESSAGE_LENGTH = 2000; // Максимальное количество символов
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
          <Alert color="warning" 
          className='w-[9vw] flex-grow-0 justify-between'  
          title='В обработке'
          classNames={{title: 'flex-grow-0'}}
          />
        );
      case 'Закрыто':
        return (
          <Alert color="success" 
          className='w-[9vw] flex-grow-0 justify-between'  
          title='Решено'
          classNames={{title: 'flex-grow-0'}}
          />
        );
      default:
        return <Alert color="danger" 
        className='w-[9vw] flex-grow-0 justify-between'  
        title={status}
        classNames={{title: 'flex-grow-0'}}
        />
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FiMail size={24} /> Техническая поддержка
      </h1>
      
      {/* Форма создания обращения */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Новое обращение</h2>
        </CardHeader>
        <CardBody>
          {isSendError && (
            <Alert color="danger" className="mb-4">
              Ошибка при отправке обращения. Попробуйте позже.
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Textarea
              label="Опишите вашу проблему"
              placeholder="Подробно опишите возникшую проблему или вопрос..."
              rows={5}
              value={message}
              onChange={handleMessageChange}
              disabled={isSending}
              className="mb-2"
            />
            <div className={`text-xs mb-4 text-right ${
              remainingChars < 50 ? 'text-danger' : 'text-gray-500'
            }`}>
              Осталось символов: {remainingChars}/{MAX_MESSAGE_LENGTH}
            </div>
            
            <div className="flex justify-between">
              <Button 
                type="submit" 
                color="primary"
                isLoading={isSending}
                disabled={!message.trim() || message.length > MAX_MESSAGE_LENGTH}
              >
                Отправить обращение
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Список обращений */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Мои обращения</h2>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-8">
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
              icon={<FiMail size={48} className="text-gray-400" />}
              title="Нет обращений"
              description="У вас пока нет обращений в поддержку"
            />
          ) : (
            <div className="space-y-6 ">
              {appeals?.map((appeal: SupportType) => (
                <div key={appeal.id_support}>
                  <div className="flex justify-between mb-2">
                    <h3 className="font-medium text-lg text-secondary">
                      Обращение #{appeal.id_support}
                    </h3>
                    {renderStatusBadge(appeal.status)}
                  </div>
                  <p className=" mb-3 whitespace-pre-line">
                    Текст обращения:
                  </p>
                  <p className="text-gray-500 mb-3 whitespace-pre-line">
                    {appeal.user_text}
                  </p>
                  
                  {appeal.admin_response && (
                    <>
                      <Divider className="my-3" />
                      <div className="bg-default p-4 rounded-lg">
                        <p className="text-sm font-semibold text-primary mb-2">
                          Ответ поддержки:
                        </p>
                        <p className="text-gray-500 whitespace-pre-line">
                          {appeal.admin_response}
                        </p>
                      </div>
                    </>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-3">
                    {new Date(appeal.createdAt).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  
                  <Divider className="my-4" />
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};