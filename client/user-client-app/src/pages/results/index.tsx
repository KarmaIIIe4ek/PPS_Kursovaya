import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Badge,
  Divider,
  Select,
  SelectItem,
  Button,
  Tab,
  Tabs,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  Chip,
  Avatar,
  Progress
} from '@heroui/react';
import { 
  useLazyGetGroupAttemptsQuery 
} from '../../app/services/resultsApi';
import { 
  useGetAllMyGroupsQuery
} from '../../app/services/groupApi';
import { 
  FiUsers,
  FiBook,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiInfo,
  FiPlus,
  FiAward,
  FiUser
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';
import { ErrorModal } from '../../components/error-modal';
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

export const ResultsPage = () => {
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  
  const { data: groups, isLoading: isLoadingGroups } = useGetAllMyGroupsQuery();
  
  const [fetchResults, { 
    data: groupResults, 
    isLoading: isLoadingResults,
    isError: isResultsError 
  }] = useLazyGetGroupAttemptsQuery();

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value);
    if (value) {
      fetchResults(value)
        .unwrap()
        .catch(error => {
          setErrorMessage(error.data?.message || 'Ошибка загрузки результатов');
          setIsErrorModalOpen(true);
        });
    }
  };

  const formatDate = (dateString: Date) => {
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
            startContent={<FiPlus className="text-lg" />}
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">Результаты студентов</h1>
      </motion.div>

      <motion.div variants={slideUp}>
        <Card className="mb-6 shadow-lg">
          <CardHeader className="border-b border-default-200 p-6">
            <h2 className="text-xl font-semibold">Выбор группы</h2>
          </CardHeader>
          <CardBody className="p-6">
            {isLoadingGroups ? (
              <div className="flex justify-center">
                <Spinner size="lg" />
              </div>
            ) : groups?.length === 0 ? (
              <EmptyState
                icon={<FiUsers className="text-default-400" size={48} />}
                title="Нет доступных групп"
                description="У вас пока нет созданных групп"
              />
            ) : (
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Select
                  label="Выберите группу"
                  className="min-w-[300px]"
                  selectedKeys={selectedGroup ? [selectedGroup] : []}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  variant="bordered"
                  size="lg"
                >
                  {groups?.map((group) => (
                    <SelectItem 
                      key={group.hash_code_login} 
                      value={group.hash_code_login}
                      startContent={<FiUsers className="text-default-400" />}
                    >
                      {group.group_number}
                    </SelectItem>
                  ))}
                </Select>
                
                {selectedGroup && (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-default-400" />
                      <span>Студентов:</span>
                      <Badge 
                        content={groups?.find(g => g.hash_code_login === selectedGroup)?.users.length || 0}
                        color="primary"
                        shape="circle"
                        size="lg"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <FiBook className="text-default-400" />
                      <span>Заданий:</span>
                      <Badge 
                        content={groupResults?.available_tasks.length || 0}
                        color="secondary"
                        shape="circle"
                        size="lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {selectedGroup && (
        <motion.div variants={slideUp}>
          <Card className="shadow-lg" >
            <CardHeader className="border-b border-default-200 p-6">
              <div className="flex justify-between w-full items-center">
                <h2 className="text-xl font-semibold">
                  Результаты группы: {groups?.find(g => g.hash_code_login === selectedGroup)?.group_number}
                </h2>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {isLoadingResults ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : isResultsError ? (
                <EmptyState
                  icon={<FiAlertCircle className="text-danger" size={48} />}
                  title="Ошибка загрузки"
                  description="Не удалось загрузить результаты группы"
                  action={
                    <Button 
                      color="primary" 
                      onClick={() => fetchResults(selectedGroup)}
                    >
                      Попробовать снова
                    </Button>
                  }
                />
              ) : (
                <Tabs 
                  aria-label="Results tabs" 
                  variant="underlined"
                  classNames={{
                    panel: "p-6"
                  }}
                >
                  <Tab 
                    key="students" 
                    title={
                      <div className="flex items-center gap-2">
                        <FiUser /> По студентам
                      </div>
                    }
                  >
                    <Table 
                      aria-label="Students results table"
                      removeWrapper
                      classNames={{
                        th: "bg-default-100",
                        tr: "hover:bg-default-100 transition-colors"
                      }}
                    >
                      <TableHeader>
                        <TableColumn>Студент</TableColumn>
                        <TableColumn>Попыток</TableColumn>
                        <TableColumn>Завершено</TableColumn>
                        <TableColumn>В процессе</TableColumn>
                        <TableColumn>Не начато</TableColumn>
                        <TableColumn>Прогресс</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {groupResults?.users_attempts.map((user) => {
                          const completedCount = user.attempts.filter(a => a.status === 'completed').length;
                          const inProgressCount = user.attempts.filter(a => a.status === 'in_progress').length;
                          const notStartedCount = groupResults.available_tasks.length - completedCount - inProgressCount;
                          const progressValue = (completedCount / groupResults.available_tasks.length) * 100;
                          
                          return (
                            <TableRow key={user.id_user}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar name={user.user_name} size="sm" />
                                  <span>{user.user_name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  content={user.attempts.length} 
                                  color="primary" 
                                  shape="circle" 
                                  size="lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  content={completedCount} 
                                  color="success" 
                                  shape="circle" 
                                  size="lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  content={inProgressCount} 
                                  color="warning" 
                                  shape="circle" 
                                  size="lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  content={notStartedCount > 0 ? notStartedCount : 0} 
                                  color="default" 
                                  shape="circle" 
                                  size="lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Progress 
                                  value={progressValue |5} 
                                  size="sm" 
                                  color={progressValue > 80 ? 'success' : progressValue > 30 ? 'warning' : 'danger'}
                                  className="max-w-[150px]"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Tab>
                  <Tab 
                    key="tasks" 
                    title={
                      <div className="flex items-center gap-2">
                        <FiBook /> По заданиям
                      </div>
                    }
                  >
                    <Table 
                      aria-label="Tasks results table"
                      removeWrapper
                      classNames={{
                        th: "bg-default-100",
                        tr: "hover:bg-default-100 transition-colors"
                      }}
                    >
                      <TableHeader>
                        <TableColumn>Задание</TableColumn>
                        <TableColumn>Попыток</TableColumn>
                        <TableColumn>Завершено</TableColumn>
                        <TableColumn>В процессе</TableColumn>
                        <TableColumn>Не начато</TableColumn>
                        <TableColumn>Средний балл</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {groupResults?.available_tasks.map((task) => {
                          const taskAttempts = groupResults.users_attempts
                            .flatMap(user => user.attempts)
                            .filter(attempt => attempt.task.id_task === task.id_task);
                          
                          const completedAttempts = taskAttempts.filter(a => a.status === 'completed');
                          const inProgressAttempts = taskAttempts.filter(a => a.status === 'in_progress');
                          const notStartedCount = groupResults.users_attempts.length - completedAttempts.length - inProgressAttempts.length;
                          
                          const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
                          const avgScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
                          
                          return (
                            <TableRow key={task.id_task}>
                              <TableCell>
                                <div className="font-medium">{task.task_name}</div>
                                <div className="text-default-500 text-sm">{task.description}</div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  content={taskAttempts.length} 
                                  color="primary" 
                                  shape="circle" 
                                  size="lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  content={completedAttempts.length} 
                                  color="success" 
                                  shape="circle" 
                                  size="lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  content={inProgressAttempts.length} 
                                  color="warning" 
                                  shape="circle" 
                                  size="lg"
                                />
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  content={notStartedCount > 0 ? notStartedCount : 0} 
                                  color="default" 
                                  shape="circle" 
                                  size="lg"
                                />
                              </TableCell>
                              <TableCell>
                                {completedAttempts.length > 0 
                                  ? (
                                    <Badge 
                                      content={avgScore.toFixed(1)} 
                                      color="secondary" 
                                      shape="circle" 
                                      size="lg"
                                    />
                                  )
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Tab>
                  <Tab 
                    key="details" 
                    title={
                      <div className="flex items-center gap-2">
                        <FiInfo /> Подробный отчет
                      </div>
                    }
                  >
                    <div className="space-y-6">
                      {groupResults?.users_attempts.map((user) => (
                        <motion.div 
                          key={user.id_user} 
                          variants={scaleUp}
                          className="border border-default-200 rounded-lg p-6 hover:shadow-sm transition-shadow"
                        >
                          <h3 className="font-medium text-lg mb-4 flex items-center gap-3">
                            <Avatar name={user.user_name} size="sm" />
                            {user.user_name}
                          </h3>
                          {user.attempts.length === 0 ? (
                            <div className="text-default-500 p-4">Нет попыток</div>
                          ) : (
                            <Table 
                              aria-label="User attempts table"
                              removeWrapper
                              classNames={{
                                th: "bg-default-100",
                              }}
                            >
                              <TableHeader>
                                <TableColumn>Задание</TableColumn>
                                <TableColumn>Статус</TableColumn>
                                <TableColumn>Балл</TableColumn>
                                <TableColumn>Начало</TableColumn>
                                <TableColumn>Завершение</TableColumn>
                              </TableHeader>
                              <TableBody>
                                {user.attempts.map((attempt) => (
                                  <TableRow key={attempt.id_result}>
                                    <TableCell>
                                      <div className="font-medium">{attempt.task.task_name}</div>
                                      <div className="text-default-500 text-sm">
                                        {attempt.task.description}
                                      </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                                    <TableCell>
                                      {attempt.score ? (
                                        <Badge 
                                          content={attempt.score} 
                                          color="success" 
                                          shape="circle" 
                                          size="lg"
                                        />
                                      ) : (
                                        <Tooltip content="Ожидает проверки">
                                          <FiInfo className="text-default-400 text-lg" />
                                        </Tooltip>
                                      )}
                                    </TableCell>
                                    <TableCell>{formatDate(attempt.date_start)}</TableCell>
                                    <TableCell>{formatDate(attempt.date_finish)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </Tab>
                </Tabs>
              )}
            </CardBody>
          </Card>
        </motion.div>
      )}

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </motion.div>
  );
};