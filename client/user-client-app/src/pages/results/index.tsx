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
  Tooltip
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
  FiInfo
} from 'react-icons/fi';
import { EmptyState } from '../../components/empty-state';
import { ErrorModal } from '../../components/error-modal';

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
          <div color="success" className="flex items-center gap-1 color-success" >
            <FiCheckCircle /> Завершено
          </div>
        );
      case 'in_progress':
        return (
          <div color="warning" className="flex items-center gap-1">
            <FiClock /> В процессе
          </div>
        );
      default:
        return (
          <div color="danger" className="flex items-center gap-1">
            <FiAlertCircle /> Ошибка
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FiBook /> Результаты студентов
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold">Выбор группы</h2>
        </CardHeader>
        <CardBody>
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
              >
                {groups?.map((group) => (
                  <SelectItem key={group.hash_code_login} value={group.hash_code_login}>
                    {group.group_number}
                  </SelectItem>
                ))}
              </Select>
              
              {selectedGroup && (
                <div className="text-default-600 text-sm">
                  Студентов в группе: {groups?.find(g => g.hash_code_login === selectedGroup)?.users.length || 0}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      {selectedGroup && (
        <Card>
          <CardHeader>
            <div className="flex justify-between w-[100%] items-center">
              <h2 className="text-xl font-semibold">
                Результаты группы: {groups?.find(g => g.hash_code_login === selectedGroup)?.group_number}
              </h2>
              <h2 color="primary">
                Заданий доступно: {groupResults?.available_tasks.length || 0}
              </h2>
            </div>
          </CardHeader>
          <CardBody>
            {isLoadingResults ? (
              <div className="flex justify-center py-8">
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
              <Tabs aria-label="Results tabs">
                <Tab key="students" title="По студентам">
                  <div className="mt-4">
                    <Table aria-label="Students results table">
                      <TableHeader>
                        <TableColumn>Студент</TableColumn>
                        <TableColumn>Попыток</TableColumn>
                        <TableColumn>Завершено</TableColumn>
                        <TableColumn>Действия</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {groupResults?.users_attempts.map((user) => (
                          <TableRow key={user.id_user}>
                            <TableCell>{user.user_name}</TableCell>
                            <TableCell>{user.attempts.length}</TableCell>
                            <TableCell>
                              {user.attempts.filter(a => a.status === 'completed').length}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" color="primary">
                                Подробнее
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </Tab>
                <Tab key="tasks" title="По заданиям">
                  <div className="mt-4">
                    <Table aria-label="Tasks results table">
                      <TableHeader>
                        <TableColumn>Задание</TableColumn>
                        <TableColumn>Попыток</TableColumn>
                        <TableColumn>Завершено</TableColumn>
                        <TableColumn>Средний балл</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {groupResults?.available_tasks.map((task) => {
                          const taskAttempts = groupResults.users_attempts
                            .flatMap(user => user.attempts)
                            .filter(attempt => attempt.task.id_task === task.id_task);
                          
                          const completedAttempts = taskAttempts
                            .filter(a => a.status === 'completed');
                          
                          const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
                          const avgScore = completedAttempts.length > 0 ? totalScore / completedAttempts.length : 0;
                          
                          return (
                            <TableRow key={task.id_task}>
                              <TableCell>
                                <div className="font-medium">{task.task_name}</div>
                                <div className="text-default-500 text-sm">{task.description}</div>
                              </TableCell>
                              <TableCell>{taskAttempts.length}</TableCell>
                              <TableCell>{completedAttempts.length}</TableCell>
                              <TableCell>
                                {completedAttempts.length > 0 
                                  ? avgScore.toFixed(1) 
                                  : 'Нет данных'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </Tab>
                <Tab key="details" title="Подробный отчет">
                  <div className="mt-4 space-y-6">
                    {groupResults?.users_attempts.map((user) => (
                      <div key={user.id_user} className="border rounded-lg p-4">
                        <h3 className="font-medium text-lg mb-3">{user.user_name}</h3>
                        {user.attempts.length === 0 ? (
                          <div className="text-default-500">Нет попыток</div>
                        ) : (
                          <Table aria-label="User attempts table">
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
                                    {attempt.score ?? (
                                      <Tooltip content="Ожидает проверки">
                                        <FiInfo className="text-default-400" />
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
                      </div>
                    ))}
                  </div>
                </Tab>
              </Tabs>
            )}
          </CardBody>
        </Card>
      )}

      <ErrorModal 
        isOpen={isErrorModalOpen} 
        onClose={() => setIsErrorModalOpen(false)} 
        errorMessage={errorMessage} 
      />
    </div>
  );
};