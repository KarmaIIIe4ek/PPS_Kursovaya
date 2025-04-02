import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Select, ModalContent, SelectItem } from '@heroui/react';
import { FiX } from 'react-icons/fi';
import type { GroupWithTasksAndUsers, Task } from '../../app/types';
import { useState } from 'react';

type GrantRightsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onGrant: (taskId: number) => void;
  isLoading: boolean;
  group: GroupWithTasksAndUsers | null;
  tasks: Task[];
};

export const GrantRightsModal = ({ 
  isOpen, 
  onClose, 
  onGrant, 
  isLoading, 
  group, 
  tasks 
}: GrantRightsModalProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const handleSubmit = () => {
    if (selectedTaskId) {
      onGrant(selectedTaskId);
      setSelectedTaskId(null);
    }
  };

  const handleSelectionChange = (e: any) => {
    setSelectedTaskId(e.target.value);
    console.log(selectedTaskId)
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          Назначить задание
        </ModalHeader>
        <ModalBody>
          <Select
            label="Выберите задание"
            selectedKeys={selectedTaskId}
            onChange={handleSelectionChange}
          >
            {tasks.map((task) => (
              <SelectItem key={task.id_task}>
                {task.task_name}
              </SelectItem>
            ))}
          </Select>
          {group && (
            <div className="mt-4 text-sm text-gray-600">
              Группа: <span className="font-medium">{group.group_number}</span>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onPress={onClose}>
            Отмена
          </Button>
          <Button 
            color="primary" 
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={!selectedTaskId}
          >
            Назначить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};