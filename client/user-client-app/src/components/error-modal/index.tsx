import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button  } from "@heroui/react";
  
  type ErrorModalProps = {
    isOpen: boolean;
    onClose: () => void;
    errorMessage: string;
  };
  
  export const ErrorModal = ({ 
    isOpen, 
    onClose, 
    errorMessage 
  }: ErrorModalProps) => {
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
              <ModalHeader className="flex flex-col gap-1">Ошибка</ModalHeader>
              <ModalBody>
                <div className="text-danger-500">{errorMessage}</div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  ОК
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    );
  };