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
  Tooltip,
  Tabs,
  Tab,
  Avatar,
  Chip
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
  
  // Функция для расчета времени выполнения
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
              startContent={<FiClock className="text-current" />}
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

  // Подсчет общей статистики
  const totalAttempts = tasksData?.reduce((sum, task) => sum + task.attempts.length, 0) || 0;
  const completedTasks = tasksData?.filter(task => task.status === 'completed').length || 0;
  const averageScore = tasksData?.reduce((sum, task) => {
    const completedAttempt = task.attempts.find(a => a.status === 'completed' && a.score);
    return sum + (completedAttempt?.score || 0);
  }, 0) / completedTasks || 0;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <EmptyState
          icon={<FiAlertCircle className="text-danger" size={48} />}
          title="Ошибка загрузки"
          description="Не удалось загрузить ваши результаты"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FiBook /> Мои результаты
      </h1>

      <Card className="mb-6">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Общая информация</h2>
          <Badge 
            content={totalAttempts}
            color="primary"
            shape="circle"
            size="lg"
          >
            <Avatar
              icon={<FiAward className="text-default-600" />}
              className="bg-primary-100"
            />
          </Badge>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">Заданий доступно</div>
              <div className="text-2xl font-bold">{tasksData?.length || 0}</div>
            </Card>
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">Завершено</div>
              <div className="text-2xl font-bold">{completedTasks}</div>
            </Card>
            <Card className="bg-default-100 p-4">
              <div className="text-sm text-default-600">Средний балл</div>
              <div className="text-2xl font-bold">
                {completedTasks > 0 ? averageScore.toFixed(1) : 'Нет данных'}
              </div>
            </Card>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
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
            <Tabs aria-label="Results tabs">
              <Tab key="tasks" title="По заданиям">
                <div className="mt-4">
                  <Table aria-label="Tasks table">
                    <TableHeader>
                      <TableColumn>Задание</TableColumn>
                      <TableColumn>Группы</TableColumn>
                      <TableColumn>Статус</TableColumn>
                      <TableColumn>Попыток осталось</TableColumn>
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
                              {taskResult.groups.map(group => (
                                <Chip key={group.id_group} variant="flat" className="mr-2 mb-1">
                                  {group.group_number}
                                </Chip>
                              ))}
                            </TableCell>
                            <TableCell>{getStatusBadge(taskResult.status)}</TableCell>
                            <TableCell>
                              <Badge 
                                content={taskResult.attempts.length } 
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
                                  <span><FiInfo className="text-default-400" /></span>
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
              <Tab key="attempts" title="Все попытки">
                <div className="mt-4 space-y-6">
                  {tasksData?.map((taskResult) => (
                    <div key={taskResult.task.id_task} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-lg">{taskResult.task.task_name}</h3>
                        {getStatusBadge(taskResult.status)}
                      </div>
                      <p className="text-default-500 mb-4">{taskResult.task.description}</p>
                      
                      <Table aria-label="Attempts table">
                        <TableHeader>
                          <TableColumn>Дата начала</TableColumn>
                          <TableColumn>Дата завершения</TableColumn>
                          <TableColumn>Время выполнения</TableColumn>
                          <TableColumn>Балл</TableColumn>
                          <TableColumn>Ваш комментарий</TableColumn>
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
                                  <FiInfo className="text-default-400" />
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
                    </div>
                  ))}
                </div>
              </Tab>
            </Tabs>
          )}
        </CardBody>
      </Card>
    </div>
  );
};