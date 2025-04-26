import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Avatar,
  Button as NextButton,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider} from '@heroui/react';
import { 
  useChangeIsPaidByIdMutation,
  useChangeIsBlockedByIdMutation,
  useLazyGetAllPurchasesQuery,
} from '../../app/services/purchasesApi';
import { 
  FiCreditCard, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiClock,
  FiCalendar,
  FiMoreVertical,
  FiUser,
  FiRefreshCw
} from 'react-icons/fi';
import { FaRegCalendarCheck, FaRubleSign } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { EmptyState } from '../../components/empty-state';
import { ErrorModal } from '../../components/error-modal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

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

export const PurchasesPage = () => {
  const [getAllPurchases, { data: purchases, isLoading, isError }] = useLazyGetAllPurchasesQuery();
  const [changeIsPaid] = useChangeIsPaidByIdMutation();
  const [changeIsBlocked] = useChangeIsBlockedByIdMutation();
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  React.useEffect(() => {
    getAllPurchases();
  }, [getAllPurchases]);

  const handleTogglePaidStatus = async (id_purchase: string) => {
    try {
      await changeIsPaid({ id_purchase }).unwrap();
      getAllPurchases();
    } catch (error: any) {
      console.error('Ошибка при изменении статуса оплаты:', error);
      setErrorMessage(
        error.data?.message || 'Произошла неизвестная ошибка при изменении статуса оплаты'
      );
      setIsErrorModalOpen(true);
    }
  };

  const handleToggleBlockedStatus = async (id_purchase: string) => {
    try {
      await changeIsBlocked({ id_purchase }).unwrap();
      getAllPurchases();
    } catch (error: any) {
      console.error('Ошибка при изменении статуса блокировки:', error);
      setErrorMessage(
        error.data?.message || 'Произошла неизвестная ошибка при изменении статуса блокировки'
      );
      setIsErrorModalOpen(true);
    }
  };

  const formatDate = (dateString: Date) => {
    if (!dateString) return 'Не указана';
    return format(new Date(dateString), 'dd MMMM yyyy HH:mm', { locale: ru });
  };

  const calculateEndDate = (paymentDate: Date, price: number) => {
    if (!paymentDate) return 'Не указана';
    
    const endDate = new Date(paymentDate);
    const monthsToAdd = price === 499 ? 1 : 12;
    endDate.setMonth(endDate.getMonth() + monthsToAdd);
    return formatDate(endDate);
  };

  const getPaymentMethod = (method: string) => {
    switch(method) {
      case 'mir': return 'МИР';
      case 'visa_mastercard': return 'Visa/Mastercard';
      case 'bank_transfer': return 'Банковский перевод';
      default: return method;
    }
  };

  const getStatusBadge = (purchase: any) => {
    if (purchase.is_blocked) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-danger-100 text-danger-800 text-sm">
          <FiAlertCircle className="text-sm" />
          <span>Заблокирована</span>
        </div>
      );
    }
    return purchase.is_paid ? (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success-100 text-success-800 text-sm">
        <FiCheckCircle className="text-sm" />
        <span>Активна</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning-100 text-warning-800 text-sm">
        <FiClock className="text-sm" />
        <span>Ожидает оплаты</span>
      </div>
    );
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-8 max-w-6xl"
    >
      <motion.div variants={slideUp} className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Avatar
            icon={<FiCreditCard className="text-lg" />}
            className="bg-primary-100 text-primary-500"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            Управление подписками
          </h1>
        </div>
        <NextButton 
          color="primary"
          onClick={() => getAllPurchases()}
          endContent={<FiRefreshCw />}
          className="font-medium"
        >
          Обновить
        </NextButton>
      </motion.div>

      <motion.div variants={slideUp}>
        <Card className="shadow-lg">
          <CardHeader className="border-b border-default-200 p-6">
            <h2 className="text-xl font-semibold">Все подписки пользователей</h2>
          </CardHeader>
          <CardBody className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : isError ? (
              <EmptyState
                icon={<FiAlertCircle size={48} className="text-danger" />}
                title="Ошибка загрузки"
                description="Не удалось загрузить список подписок"
                action={
                  <NextButton color="primary" onClick={() => getAllPurchases()}>
                    Попробовать снова
                  </NextButton>
                }
              />
            ) : purchases?.length === 0 ? (
              <EmptyState
                icon={<FiCreditCard size={48} className="text-default-400" />}
                title="Нет подписок"
                description="В системе пока нет подписок"
              />
            ) : (
              <div className="space-y-6">
                {purchases?.map((purchase: any) => (
                  <motion.div 
                    key={purchase.id_purchase}
                    variants={scaleUp}
                  >
                    <Card className="border border-default-200">
                      <CardHeader className="flex justify-between items-start p-6">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <FiUser className="text-default-400" />
                            <span className="font-medium">ID пользователя: {purchase.id_user}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {purchase.is_paid ? (
                              <FaRegCalendarCheck className="text-success text-xl" />
                            ) : (
                              <FiClock className="text-warning text-xl" />
                            )}
                            <h3 className="font-medium text-lg">
                              Подписка #{purchase.id_purchase}
                            </h3>
                          </div>
                          <p className="text-sm text-default-500">
                            Создана: {formatDate(purchase.created_date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(purchase)}
                          <Dropdown>
                            <DropdownTrigger>
                              <NextButton isIconOnly size="sm" variant="light">
                                <FiMoreVertical />
                              </NextButton>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Действия с подпиской">
                              <DropdownItem 
                                key="toggle-paid" 
                                onClick={() => handleTogglePaidStatus(purchase.id_purchase)}
                              >
                                {purchase.is_paid ? 'Отменить оплату' : 'Подтвердить оплату'}
                              </DropdownItem>
                              <DropdownItem 
                                key="toggle-blocked" 
                                onClick={() => handleToggleBlockedStatus(purchase.id_purchase)}
                              >
                                {purchase.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </CardHeader>

                      <Divider />

                      <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-default-500 mb-1">Сумма:</p>
                              <div className="flex items-center gap-2">
                                <FaRubleSign className="text-primary" />
                                <p className="font-medium text-lg">{purchase.price} ₽</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-default-500 mb-1">Способ оплаты:</p>
                              <p className="font-medium">
                                {getPaymentMethod(purchase.payment_method)}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-default-500 mb-1">Статус оплаты:</p>
                              <p className="font-medium">
                                {purchase.is_paid ? 'Оплачена' : 'Не оплачена'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-default-500 mb-1">Статус блокировки:</p>
                              <p className="font-medium">
                                {purchase.is_blocked ? 'Заблокирована' : 'Активна'}
                              </p>
                            </div>
                          </div>

                          {purchase.is_paid && (
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-default-500 mb-1">Дата оплаты:</p>
                                <p className="font-medium">
                                  {formatDate(purchase.payment_date)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-default-500 mb-1">Окончание:</p>
                                <div className="flex items-center gap-2">
                                  <FiCalendar className="text-primary" />
                                  <p className="font-medium">
                                    {calculateEndDate(purchase.payment_date, purchase.price)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </motion.div>
  );
};