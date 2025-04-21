import { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Badge,
  Divider,
  Avatar,
  Chip,
  Button as NextButton
} from '@heroui/react';
import { 
  useAddMutation, 
  useConfirmMutation, 
  useGetAllMyQuery 
} from '../../app/services/purchaseApi';
import { 
  FiCreditCard, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiPlus,
  FiClock,
  FiCalendar,
  FiDollarSign
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';
import { ErrorModal } from '../../components/error-modal';
import { CreatePurchaseModal } from '../../components/create-purchase-modal';
import { FaRegCalendarCheck, FaRubleSign } from 'react-icons/fa';
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
        <Chip 
          color="danger" 
          variant="flat"
          startContent={<FiAlertCircle />}
        >
          Заблокирована
        </Chip>
      );
    }
    return purchase.is_paid ? (
      <Chip 
        color="success" 
        variant="flat"
        startContent={<FiCheckCircle />}
      >
        Активна
      </Chip>
    ) : (
      <Chip 
        color="warning" 
        variant="flat"
        startContent={<FiClock />}
      >
        Ожидает оплаты
      </Chip>
    );
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-8 max-w-4xl"
    >
      <motion.div variants={slideUp} className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Avatar
            icon={<FiCreditCard className="text-lg" />}
            className="bg-primary-100 text-primary-500"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Мои подписки</h1>
        </div>
        <NextButton 
          color="primary"
          onClick={() => setIsCreateModalOpen(true)}
          endContent={<FiPlus />}
          className="font-medium"
        >
          Оформить подписку
        </NextButton>
      </motion.div>

      <motion.div variants={slideUp}>
        <Card className="shadow-lg" >
          <CardHeader className="border-b border-default-200 p-6">
            <h2 className="text-xl font-semibold">История подписок</h2>
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
                  <NextButton color="primary" onClick={refetch}>
                    Попробовать снова
                  </NextButton>
                }
              />
            ) : purchases?.length === 0 ? (
              <EmptyState
                icon={<FiCreditCard size={48} className="text-default-400" />}
                title="Нет подписок"
                description="У вас пока нет активных подписок"
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
                            {purchase.is_paid ? (
                              <FaRegCalendarCheck className="text-success text-xl" />
                            ) : (
                              <FiClock className="text-warning text-xl" />
                            )}
                            <h3 className="font-medium text-lg">
                              {purchase.is_paid ? 'Подписка' : 'Заявка'} #{purchase.id_purchase}
                            </h3>
                          </div>
                          <p className="text-sm text-default-500">
                            Создана: {formatDate(purchase.created_date)}
                          </p>
                        </div>
                        {getStatusBadge(purchase)}
                      </CardHeader>

                      <Divider />

                      <CardBody className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
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

                        {!purchase.is_paid && !purchase.is_blocked && (
                          <div className="flex justify-end">
                            <NextButton
                              color="primary"
                              onClick={() => handleConfirmPurchase(purchase.id_purchase)}
                              endContent={<FiCheckCircle />}
                              className="font-medium"
                            >
                              Подтвердить оплату
                            </NextButton>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

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
    </motion.div>
  );
};