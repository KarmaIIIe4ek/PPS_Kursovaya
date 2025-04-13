import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input
} from "@heroui/react";
import { useState } from "react";
import { ErrorModal } from "../error-modal";

type AddUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (email: string) => void;
  isLoading: boolean;
  groupName?: string;
};

export const AddUserModal = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  isLoading, 
  groupName 
}: AddUserModalProps) => {
  const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleSubmit = () => {
    setErrorMessage(''); // Сбрасываем предыдущую ошибку
    onAdd(email);
    setEmail('');
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
            <ModalHeader className="flex flex-col gap-1">Добавить участника</ModalHeader>
            <ModalBody>
              <Input
                label="Email участника"
                placeholder="Введите email пользователя"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
              {groupName && (
                <div className="mt-4 text-sm text-default-500">
                  Группа: <span className="font-medium">{groupName}</span>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Отмена
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                isLoading={isLoading}
                isDisabled={!email.trim()}
              >
                Добавить
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