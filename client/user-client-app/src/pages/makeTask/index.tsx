import React from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Badge,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Select,
  SelectItem
} from '@heroui/react';
import {
  FiBook,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiArrowRight,
  FiList,
  FiPlus
} from 'react-icons/fi';
import { useGetSelfAtemptQuery } from '../../app/services/resultsApi';
import { EmptyState } from '../../components/empty-state';
import { useNavigate } from 'react-router-dom';

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

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } }
};

export const MakeTask = () => {
  const { data: tasksData, isLoading, isError } = useGetSelfAtemptQuery();
  const [selectedGroup, setSelectedGroup] = React.useState<string>('');
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return (
          <Chip 
            color="success" 
            startContent={<FiCheckCircle className="text-current" />}
            variant="flat"
          >
            Завершено
          </Chip>
        );
      case 'in_progress':
        return (
          <Chip
            color="warning"
            startContent={<FiClock className="text-current" />}
            variant="flat"
          >
            В процессе
          </Chip>
        );
      case 'not_started':
        return (
          <Chip
            color="default"
            startContent={<FiPlus className="text-current" />}
            variant="flat"
          >
            Не начато
          </Chip>
        );
      default:
        return (
          <Chip
            color="danger"
            startContent={<FiAlertCircle className="text-current" />}
            variant="flat"
          >
            Ошибка
          </Chip>
        );
    }
  };

  const handleStartTask = (taskId: number) => {
    navigate(`/task/${taskId}`);
  };

  const filteredTasks = selectedGroup 
    ? tasksData?.filter(task => 
        task.groups.some(group => group.hash_code_login === selectedGroup)
      )
    : tasksData;

  const uniqueGroups = React.useMemo(() => {
    if (!tasksData) return [];
    return tasksData
      .flatMap(task => task.groups)
      .filter((group, index, self) => 
        index === self.findIndex(g => g.hash_code_login === group.hash_code_login)
      );
  }, [tasksData]);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner size="lg" /></div>;
  }

  if (isError) {
    return (
      <EmptyState
        icon={<FiAlertCircle className="text-danger" size={48} />}
        title="Ошибка загрузки"
        description="Не удалось загрузить список заданий"
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
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FiBook /> Доступные задания
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 w-[100%] p-5">
            <h2 className="text-xl font-semibold">Фильтры</h2>
            <div className="flex items-center justify-between w-[100%]">
              <Select
                label="Выберите группу"
                className="min-w-[200px] w-[100%]"
                selectedKeys={selectedGroup ? [selectedGroup] : []}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <SelectItem key="" value="">
                  Все группы
                </SelectItem>
                {uniqueGroups.map(group => (
                  <SelectItem key={group.hash_code_login} value={group.hash_code_login}>
                    {group.group_number}
                  </SelectItem>
                ))}
              </Select>
              <h2 className="ml-2 w-[30%] text-right">Всего заданий: {filteredTasks?.length || 0}</h2>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {filteredTasks?.length === 0 ? (
            <EmptyState
              icon={<FiList className="text-default-400" size={48} />}
              title="Нет доступных заданий"
              description={selectedGroup 
                ? "В выбранной группе нет доступных заданий" 
                : "У вас пока нет доступных заданий"}
            />
          ) : (
            <motion.div variants={container} initial="hidden" animate="show">
              <Table aria-label="Tasks table">
                <TableHeader>
                  <TableColumn>Задание</TableColumn>
                  <TableColumn>Группы</TableColumn>
                  <TableColumn>Статус</TableColumn>
                  <TableColumn>Попытки</TableColumn>
                  <TableColumn>Действия</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredTasks?.map((taskResult) => (
                    <TableRow key={taskResult.task.id_task}>
                      <TableCell>
                        <div className="font-medium">{taskResult.task.task_name}</div>
                        <div className="text-default-500 text-sm">{taskResult.task.description}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {taskResult.groups.map(group => (
                            <h2>
                              {group.group_number}
                            </h2>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(taskResult.status)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          content={taskResult.attempts.length} 
                          color="primary" 
                          shape="circle" 
                          size="lg"
                        />
                      </TableCell>
                      <TableCell>
                        {taskResult.status === 'completed' ? <p>Завершено</p> :
                            <Button
                            color={
                            taskResult.status === 'completed' ? 'success' :
                            taskResult.status === 'in_progress' ? 'warning' : 'primary'
                            }
                            variant="solid"
                            endIcon={<FiArrowRight />}
                            onPress={() => handleStartTask(taskResult.task.id_task)}
                        >
                            {taskResult.status === 'completed' ? 'Повторить' : 
                            taskResult.status === 'in_progress' ? 'Продолжить' : 'Начать'}
                        </Button>
                        }
                        
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </motion.div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Статистика выполнения</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">Всего заданий</div>
              <div className="text-2xl font-bold">{tasksData?.length || 0}</div>
            </Card>
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">Завершено</div>
              <div className="text-2xl font-bold">
                {tasksData?.filter(t => t.status === 'completed').length || 0}
              </div>
            </Card>
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">В процессе</div>
              <div className="text-2xl font-bold">
                {tasksData?.filter(t => t.status === 'in_progress').length || 0}
              </div>
            </Card>
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">Не начато</div>
              <div className="text-2xl font-bold">
                {tasksData?.filter(t => t.status === 'not_started').length || 0}
              </div>
            </Card>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};