import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
  Divider,
} from "@heroui/react";
import { useState } from "react";
import { ErrorModal } from "../error-modal";
import { FiPlus } from "react-icons/fi";

type CreatePurchaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { price: number; payment_method: string }) => Promise<void>;
};

const subscriptionPlans = [
  { duration: "1 месяц", price: 499, value: "monthly" },
  { duration: "12 месяцев", price: 1999, value: "yearly" },
];

const paymentMethods = [
  { value: "mir", label: "Мир" },
  { value: "visa_mastercard", label: "Visa, Mastercard" },
];

export const CreatePurchaseModal = ({ 
  isOpen, 
  onClose, 
  onSubmit
}: CreatePurchaseModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [paymentMethod, setPaymentMethod] = useState("mir");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const selectedPlanData = subscriptionPlans.find(plan => plan.value === selectedPlan);
      
      if (!selectedPlanData) {
        throw new Error("Не выбран тарифный план");
      }

      await onSubmit({
        price: selectedPlanData.price,
        payment_method: paymentMethod
      });
      onClose();
    } catch (error: any) {
      setErrorMessage(error.message || "Произошла ошибка при создании подписки");
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={(isOpen) => !isOpen && onClose()}
        backdrop="blur"
        radius="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Оформление подписки
              </ModalHeader>
              <ModalBody>
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Выберите срок подписки:</h3>
                  <RadioGroup
                    value={selectedPlan}
                    onValueChange={setSelectedPlan}
                  >
                    {subscriptionPlans.map((plan) => (
                      <Radio 
                        key={plan.value} 
                        value={plan.value}
                        description={`${plan.price} ₽`}
                        className="mb-2"
                      >
                        {plan.duration}
                      </Radio>
                    ))}
                  </RadioGroup>
                </div>

                <Divider className="my-4" />

                <div className="mt-6">
                  <h3 className="font-medium mb-3">Выберите способ оплаты:</h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    {paymentMethods.map((method) => (
                      <Radio 
                        key={method.value} 
                        value={method.value}
                        className="mb-2"
                      >
                        {method.label}
                      </Radio>
                    ))}
                  </RadioGroup>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Отмена
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  startContent={<FiPlus />}
                >
                  Оформить подписку
                </Button>
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
    </>
  );
};