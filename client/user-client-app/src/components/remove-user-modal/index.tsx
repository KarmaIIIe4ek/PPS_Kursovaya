import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Alert
} from "@heroui/react";
import { useState } from "react";

type RemoveUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRemove: (email: string) => void;
  isLoading: boolean;
  groupName?: string;
};

export const RemoveUserModal = ({ 
  isOpen, 
  onClose, 
  onRemove, 
  isLoading, 
  groupName 
}: RemoveUserModalProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    onRemove(email);
    setEmail('');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={(isOpen) => !isOpen && onClose()}
      backdrop="blur"
      radius="lg"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Удалить участника</ModalHeader>
            <ModalBody>
              <Alert color="warning" className="mb-4">
                Удаление участника лишит его доступа к группе и связанным заданиям
              </Alert>
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
                color="danger" 
                onPress={handleSubmit}
                isLoading={isLoading}
                isDisabled={!email.trim()}
              >
                Удалить
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};