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

type ConfirmChangeIsOpenModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onChange: (id_task: number, hask_code_login: string) => void;
  isLoading: boolean;
  group: GroupWithTasks;
  id_task: number;
};

export const ConfirmChangeIsOpen = ({ 
  isOpen, 
  onClose, 
  onChange, 
  isLoading, 
  group,
  id_task
}: ConfirmChangeIsOpenModalProps) => {
    const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleSubmit = () => {
    setErrorMessage(''); // Сбрасываем предыдущую ошибку
    onChange(id_task, group.hash_code_login);
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
            <ModalHeader className="flex flex-col gap-1">Смена статуса доступа к заданию</ModalHeader>
            <ModalBody>
                Вы уверенны, что хотите поменять статус доступа к заданию?
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Отмена
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
              >
                Подтвердить
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