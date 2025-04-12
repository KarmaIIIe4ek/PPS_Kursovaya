import type React from 'react';
import { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Badge,
  Divider,
} from '@heroui/react';
import { 
  useAddMutation, 
  useConfirmMutation, 
  useGetAllMyQuery 
} from '../../app/services/purchaseApi';
import type { Purchase } from '../../app/types';
import { 
  FiCreditCard, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiPlus,
  FiClock,
  FiCalendar
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';
import { Button } from '../../components/button';
import { ErrorModal } from '../../components/error-modal';
import { CreatePurchaseModal } from '../../components/create-purchase-modal';
import { FaRegCalendarCheck } from 'react-icons/fa';

export const PurchasePage = () => {
  const { data: purchases, isLoading, isError, refetch } = useGetAllMyQuery();
  const [confirmPurchase] = useConfirmMutation();
  const [addPurchase] = useAddMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleAddPurchase = async (data: { price: number; payment_method: string }) => {
    try {
      await addPurchase(data).unwrap();
      refetch();
      setIsCreateModalOpen(false);
    } catch (error: any) {
      console.error('Ошибка при создании заявки на оплату:', error);
      setErrorMessage(
        error.data?.message || 'Произошла неизвестная ошибка при создании заявки на оплату'
      );
      setIsErrorModalOpen(true);
    }
  };

  const handleConfirmPurchase = async (id: number) => {
    try {
      await confirmPurchase({ id_purchase: id }).unwrap();
      refetch();
    } catch (error: any) {
      console.error('Ошибка при подтверждении оплаты:', error);
      setErrorMessage(
        error.data?.message || 'Произошла неизвестная ошибка при подтверждении оплаты'
      );
      setIsErrorModalOpen(true);
    }
  };

  const formatDate = (dateString: Date) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateEndDate = (paymentDate: Date, price: number) => {
    if (!paymentDate) return 'Не указана';
    
    const endDate = new Date(paymentDate);
    const monthsToAdd = price === 499 ? 1 : 12; // 1 месяц за 499р, 12 месяцев за 1999р
    
    endDate.setMonth(endDate.getMonth() + monthsToAdd);
    return formatDate(endDate);
  };

  const getPaymentMethod = (method: string) => {
    switch(method) {
      case 'mir': return 'МИР';
      case 'visa_mastercard': return 'Visa, Mastercard';
      case 'bank_transfer': return 'Банковский перевод';
      default: return method;
    }
  };

  const getStatusBadge = (purchase: Purchase) => {
    if (purchase.is_blocked) {
      return (
        <Badge isOneChar color="danger" className="ml-2">
          <p className='pr-4'>Заблокирована администратором</p>
        </Badge>
      );
    }
    return purchase.is_paid ? (
      <Badge isOneChar color="success" className="ml-2">
        <p className='pr-4'>Активна</p>
      </Badge>
    ) : (
      <Badge isOneChar color="warning" className="ml-2">
        <p className='pr-4'>Ожидает оплаты</p>
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <FiCreditCard size={24} /> Мои подписки
      </h1>

      <div className="mb-8">
        <Button 
          color="primary"
          onClick={() => setIsCreateModalOpen(true)}
          icon={<FiPlus />}
        >
          Оформить подписку
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">История подписок</h2>
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
              description="Не удалось загрузить список подписок"
              action={
                <Button color="primary" onClick={refetch}>
                  Попробовать снова
                </Button>
              }
            />
          ) : purchases?.length === 0 ? (
            <EmptyState
              icon={<FiCreditCard size={48} className="text-gray-400" />}
              title="Нет подписок"
              description="У вас пока нет активных подписок"
            />
          ) : (
            <div className="space-y-6">
              {purchases?.map((purchase: Purchase) => (
                <div key={purchase.id_purchase} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg text-primary flex items-center gap-2">
                        {purchase.is_paid ? (
                          <>
                            <FaRegCalendarCheck className="text-success" />
                            Подписка #{purchase.id_purchase}
                          </>
                        ) : (
                          <>
                            <FiClock className="text-warning" />
                            Заявка #{purchase.id_purchase}
                          </>
                        )}
                      </h3>
                      <div className="text-sm text-gray-500 mt-1">
                        Создана: {formatDate(purchase.created_date)}
                      </div>
                    </div>
                    {getStatusBadge(purchase)}
                  </div>

                  <Divider className="my-3" />

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Сумма:</p>
                      <p className="font-medium">{purchase.price} ₽</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Способ оплаты:</p>
                      <p className="font-medium">{getPaymentMethod(purchase.payment_method)}</p>
                    </div>
                    {purchase.is_paid && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">Дата оплаты:</p>
                          <p className="font-medium">{formatDate(purchase.payment_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Окончание подписки:</p>
                          <p className="font-medium flex items-center gap-1">
                            <FiCalendar className="text-primary" />
                            {calculateEndDate(purchase.payment_date, purchase.price)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {!purchase.is_paid && (
                    <div className="flex justify-end">
                      <Button
                        color="primary"
                        size="sm"
                        onClick={() => handleConfirmPurchase(purchase.id_purchase)}
                        icon={<FiCheckCircle />}
                      >
                        Подтвердить оплату
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <CreatePurchaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleAddPurchase}
      />

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </div>
  );
};


