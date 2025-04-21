import React from 'react';
import { 
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Badge,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Progress,
  Tooltip
} from '@heroui/react';
import { 
  useGetSelfAtemptQuery
} from '../../app/services/resultsApi';
import { 
  FiBook,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiInfo,
  FiAward,
  FiList,
  FiUser
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';
import { motion } from 'framer-motion';

// Анимационные варианты
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
};

export const SelfResultsPage = () => {
  const { data: tasksData, isLoading, isError } = useGetSelfAtemptQuery();

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return 'Не завершено';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const calculateDuration = (start: string, finish: string | null) => {
    if (!finish) return '-';
    
    const startDate = new Date(start);
    const finishDate = new Date(finish);
    const diffMs = finishDate.getTime() - startDate.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours > 0 ? `${hours}ч ` : ''}${minutes > 0 ? `${minutes}м ` : ''}${seconds}с`;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'completed':
        return (
          <Chip 
            color="success" 
            variant="flat"
            startContent={<FiCheckCircle className="text-lg" />}
          >
            Завершено
          </Chip>
        );
      case 'in_progress':
        return (
          <Chip
            color="warning"
            variant="flat"
            startContent={<FiClock className="text-lg" />}
          >
            В процессе
          </Chip>
        );
      case 'not_started':
        return (
          <Chip
            color="default"
            variant="flat"
            startContent={<FiClock className="text-lg" />}
          >
            Не начато
          </Chip>
        );
      default:
        return (
          <Chip
            color="danger"
            variant="flat"
            startContent={<FiAlertCircle className="text-lg" />}
          >
            Ошибка
          </Chip>
        );
    }
  };

  // Статистика
  const totalAttempts = tasksData?.reduce((sum, task) => sum + task.attempts.length, 0) || 0;
  const completedTasks = tasksData?.filter(task => task.status === 'completed').length || 0;
  const totalTasks = tasksData?.length || 1;
  const averageScore = tasksData?.reduce((sum, task) => {
    const completedAttempt = task.attempts.find(a => a.status === 'completed' && a.score);
    return sum + (completedAttempt?.score || 0);
  }, 0) / completedTasks || 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="container mx-auto px-4 py-8 max-w-6xl"
      >
        <EmptyState
          icon={<FiAlertCircle className="text-danger" size={48} />}
          title="Ошибка загрузки"
          description="Не удалось загрузить ваши результаты"
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-8 max-w-6xl"
    >
      <motion.div variants={slideUp} className="flex items-center gap-3 mb-8">
        <Avatar
          icon={<FiBook className="text-lg" />}
          className="bg-primary-100 text-primary-500"
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Мои результаты</h1>
      </motion.div>

      {/* Общая статистика */}
      <motion.div variants={slideUp}>
        <Card className="mb-6 shadow-lg">
          <CardHeader className="border-b border-default-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Общая информация</h2>
            <Badge 
              content={totalAttempts}
              color="primary"
              shape="circle"
              size="lg"
            >
              <Avatar
                icon={<FiAward className="text-lg" />}
                className="bg-primary-100 text-primary-500"
              />
            </Badge>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div variants={scaleUp}>
                <Card className="p-4 bg-default-100 hover:bg-default-200 transition-colors">
                  <div className="text-sm text-default-600 mb-1">Заданий доступно</div>
                  <div className="text-2xl font-bold">{tasksData?.length || 0}</div>
                  <Progress 
                    value={100} 
                    size="sm" 
                    className="mt-2"
                  />
                </Card>
              </motion.div>
              
              <motion.div variants={scaleUp}>
                <Card className="p-4 bg-default-100 hover:bg-default-200 transition-colors">
                  <div className="text-sm text-default-600 mb-1">Завершено</div>
                  <div className="text-2xl font-bold">{completedTasks}</div>
                  <Progress 
                    value={(completedTasks / totalTasks) * 100} 
                    color="success"
                    size="sm" 
                    className="mt-2"
                  />
                </Card>
              </motion.div>
              
              <motion.div variants={scaleUp}>
                <Card className="p-4 bg-default-100 hover:bg-default-200 transition-colors">
                  <div className="text-sm text-default-600 mb-1">Средний балл</div>
                  <div className="text-2xl font-bold">
                    {completedTasks > 0 ? averageScore.toFixed(1) : '—'}
                  </div>
                  <Progress 
                    value={completedTasks > 0 ? averageScore * 10 : 0} 
                    color="primary"
                    size="sm" 
                    className="mt-2"
                  />
                </Card>
              </motion.div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Детализация результатов */}
      <motion.div variants={slideUp}>
        <Card className="shadow-lg" >
          <CardHeader className="border-b border-default-200">
            <h2 className="text-xl font-semibold">Детализация результатов</h2>
          </CardHeader>
          <CardBody>
            {tasksData?.length === 0 ? (
              <EmptyState
                icon={<FiList className="text-default-400" size={48} />}
                title="Нет данных о заданиях"
                description="У вас пока нет доступных заданий"
              />
            ) : (
              <Tabs aria-label="Results tabs" variant="underlined">
                <Tab 
                  key="tasks" 
                  title={
                    <div className="flex items-center gap-2">
                      <FiList /> По заданиям
                    </div>
                  }
                >
                  <div className="mt-4">
                    <Table 
                      aria-label="Tasks table" 
                      removeWrapper
                      classNames={{
                        th: "bg-default-100",
                        tr: "hover:bg-default-100 transition-colors"
                      }}
                    >
                      <TableHeader>
                        <TableColumn>Задание</TableColumn>
                        <TableColumn>Группы</TableColumn>
                        <TableColumn>Статус</TableColumn>
                        <TableColumn>Попытки</TableColumn>
                        <TableColumn>Результат</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {tasksData?.map((taskResult) => {
                          const lastAttempt = taskResult.attempts[taskResult.attempts.length - 1];
                          return (
                            <TableRow key={taskResult.task.id_task}>
                              <TableCell>
                                <div className="font-medium">{taskResult.task.task_name}</div>
                                <div className="text-default-500 text-sm">{taskResult.task.description}</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {taskResult.groups.map(group => (
                                    <Chip 
                                      key={group.id_group} 
                                      variant="flat"
                                      color="primary"
                                    >
                                      {group.group_number}
                                    </Chip>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(taskResult.status)}</TableCell>
                              <TableCell>
                                <Badge 
                                  content={taskResult.attempts.length} 
                                  color="primary" 
                                  shape="circle" 
                                  size="lg"
                                />
                              </TableCell>
                              <TableCell>
                                {lastAttempt?.score ? (
                                  <Badge 
                                    content={lastAttempt.score} 
                                    color="success" 
                                    shape="circle" 
                                    size="lg"
                                  />
                                ) : (
                                  <Tooltip content="Не начато">
                                    <FiInfo className="text-default-400 text-lg" />
                                  </Tooltip>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </Tab>
                
                <Tab 
                  key="attempts" 
                  title={
                    <div className="flex items-center gap-2">
                      <FiClock /> Все попытки
                    </div>
                  }
                >
                  <div className="mt-4 space-y-6">
                    {tasksData?.map((taskResult) => (
                      <motion.div 
                        key={taskResult.task.id_task} 
                        className="border border-default-200 rounded-lg p-5 hover:shadow-sm transition-shadow"
                        variants={scaleUp}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-lg text-primary">{taskResult.task.task_name}</h3>
                          {getStatusBadge(taskResult.status)}
                        </div>
                        <p className="text-default-500 mb-4">{taskResult.task.description}</p>
                        
                        <Table 
                          aria-label="Attempts table" 
                          removeWrapper
                          classNames={{
                            th: "bg-default-100",
                          }}
                        >
                          <TableHeader>
                            <TableColumn>Дата начала</TableColumn>
                            <TableColumn>Дата завершения</TableColumn>
                            <TableColumn>Время выполнения</TableColumn>
                            <TableColumn>Балл</TableColumn>
                            <TableColumn>Комментарий</TableColumn>
                          </TableHeader>
                          <TableBody>
                            {taskResult.attempts.map((attempt) => (
                              <TableRow key={attempt.id_result}>
                                <TableCell>{formatDate(attempt.date_start)}</TableCell>
                                <TableCell>{formatDate(attempt.date_finish)}</TableCell>
                                <TableCell>
                                  {calculateDuration(attempt.date_start, attempt.date_finish)}
                                </TableCell>
                                <TableCell>
                                  {attempt.score ? (
                                    <Badge 
                                      content={attempt.score} 
                                      color="success" 
                                      shape="circle" 
                                      size="lg"
                                    />
                                  ) : (
                                    <FiInfo className="text-default-400 text-lg" />
                                  )}
                                </TableCell>
                                <TableCell>
                                  {attempt.comment_user || (
                                    <span className="text-default-400">Нет комментария</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </motion.div>
                    ))}
                  </div>
                </Tab>
              </Tabs>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
};