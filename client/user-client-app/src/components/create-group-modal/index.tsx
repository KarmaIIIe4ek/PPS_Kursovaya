import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  useDisclosure
} from "@heroui/react";
import { useState } from "react";

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (groupNumber: string) => void;
  isLoading: boolean;
};

export const CreateGroupModal = ({ 
  isOpen, 
  onClose, 
  onCreate, 
  isLoading 
}: CreateGroupModalProps) => {
  const [groupNumber, setGroupNumber] = useState('');

  const handleSubmit = () => {
    onCreate(groupNumber);
    setGroupNumber('');
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
            <ModalHeader className="flex flex-col gap-1">Создание новой группы</ModalHeader>
            <ModalBody>
              <Input
                label="Номер группы"
                placeholder="Введите номер группы"
                value={groupNumber}
                onChange={(e) => setGroupNumber(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Отмена
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
                isLoading={isLoading}
                isDisabled={!groupNumber.trim()}
              >
                Создать
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};