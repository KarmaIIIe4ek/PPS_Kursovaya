import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Switch,
  Button
} from '@heroui/react';
import {
  FiBook,
  FiCheck,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';
import { 
  useChangeAvailableByIdMutation,
  useGetAllQuery,
  useLazyGetAllQuery
} from '../../app/services/tasksApi';

// Анимации
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } }
};

export const TasksPage = () => {
  const { data: tasks, isLoading, isError, refetch } = useGetAllQuery();
  const [changeAvailability] = useChangeAvailableByIdMutation();
  const [triggerGetAll] = useLazyGetAllQuery();

  const handleToggleAvailability = async (id_task: number, currentStatus: boolean) => {
    try {
      await changeAvailability({ id_task: id_task.toString() }).unwrap();
      // Оптимистичное обновление или повторный запрос
      triggerGetAll();
    } catch (error) {
      console.error('Ошибка при изменении доступности задания:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner size="lg" /></div>;
  }

  if (isError) {
    return (
      <EmptyState
        icon={<FiX className="text-danger" size={48} />}
        title="Ошибка загрузки"
        description="Не удалось загрузить список заданий"
        action={
          <Button color="primary" onClick={refetch}>
            Попробовать снова
          </Button>
        }
      />
    );
  }

  return (
    <motion.div 
      className="container mx-auto px-4 py-8 max-w-6xl"
      initial="hidden"
      animate="show"
      variants={fadeIn}
    >
      <motion.div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Avatar
            icon={<FiBook className="text-lg" />}
            className="bg-primary-100 text-primary-500"
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
            Управление заданиями
          </h1>
        </div>
        <Button 
          color="primary" 
          variant="light" 
          onClick={refetch}
          startContent={<FiRefreshCw />}
        >
          Обновить
        </Button>
      </motion.div>

      <Card className="shadow-lg">
        <CardHeader className="border-b border-default-200">
          <h2 className="text-xl font-semibold">Список всех заданий</h2>
        </CardHeader>
        <CardBody>
          {tasks?.length === 0 ? (
            <EmptyState
              icon={<FiBook className="text-default-400" size={48} />}
              title="Нет заданий"
              description="В системе пока нет созданных заданий"
            />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show">
              <Table aria-label="Tasks management table">
                <TableHeader>
                  <TableColumn>ID</TableColumn>
                  <TableColumn>Название</TableColumn>
                  <TableColumn>Описание</TableColumn>
                  <TableColumn>Доступность</TableColumn>
                  <TableColumn>Статус</TableColumn>
                </TableHeader>
                <TableBody>
                  {(tasks || [])?.map((task) => (
                    <TableRow key={task.id_task}>
                      <TableCell>{task.id_task}</TableCell>
                      <TableCell className="font-medium">{task.task_name}</TableCell>
                      <TableCell className="text-default-500">{task.description}</TableCell>
                      <TableCell>
                        <Switch
                          isSelected={task.is_available}
                          onChange={() => handleToggleAvailability(task.id_task, task.is_available)}
                          color="success"
                          startContent={<FiCheck />}
                          endContent={<FiX />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={task.is_available ? 'success' : 'danger'}
                          variant="flat"
                          startContent={task.is_available ? <FiCheck /> : <FiX />}
                        >
                          {task.is_available ? 'Доступно' : 'Недоступно'}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </CardBody>
      </Card>

      <Card className="mt-6 shadow-lg">
        <CardHeader className="border-b border-default-200">
          <h2 className="text-xl font-semibold">Статистика</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">Всего заданий</div>
              <div className="text-2xl font-bold">{tasks?.length || 0}</div>
            </Card>
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">Доступно</div>
              <div className="text-2xl font-bold text-success">
                {tasks?.filter(t => t.is_available).length || 0}
              </div>
            </Card>
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">Недоступно</div>
              <div className="text-2xl font-bold text-danger">
                {tasks?.filter(t => !t.is_available).length || 0}
              </div>
            </Card>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};