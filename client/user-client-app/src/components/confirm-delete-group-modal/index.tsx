import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useState } from "react";
import { ErrorModal } from "../error-modal";
import type { GroupWithTasks } from "../../app/types";

type ConfirmDeleteGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id_group: number) => void;
  isLoading: boolean;
  group: GroupWithTasks;
};

export const ConfirmDeleteGroupModal = ({ 
  isOpen, 
  onClose, 
  onDelete, 
  isLoading, 
  group
}: ConfirmDeleteGroupModalProps) => {
    const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleSubmit = () => {
    setErrorMessage(''); // Сбрасываем предыдущую ошибку
    onDelete(group.id_group);
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
            <ModalHeader className="flex flex-col gap-1">Удаление группы</ModalHeader>
            <ModalBody>
                Вы уверенны, что хотите удалить группу?
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Отмена
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
              >
                Удалить
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