const {Group, UsersInGroup, Task, TaskForGroup, UserMakeTask} = require('../models/models')

class StudentController {
    async getUserGroupsWithTasks(req, res, next) {
    
        try {
            const groups = await Group.findAll({
                include: [
                    {
                        model: UsersInGroup,
                        where: { id_user: req.user.id },
                        attributes: [] // Не включаем атрибуты из промежуточной таблицы
                    },
                    {
                        model: TaskForGroup,
                        include: [
                            {
                                model: Task,
                                attributes: ['id_task', 'is_available', 'task_name', 'description']
                            }
                        ],
                        attributes: ['id_task_for_group', 'is_open', 'deadline']
                    }
                ],
                attributes: ['group_number', 'hash_code_login'],
                where: {
                    '$users_in_groups.id_user$': req.user.id // Уточняем условие для связи
                }
            });
    
            // Преобразуем результат в нужный формат
            const result = groups.map(group => {
                return {
                    group_number: group.group_number,
                    hash_code_login: group.hash_code_login,
                    tasks: group.task_for_groups.map(taskForGroup => {
                        return {
                            id_task_for_group: taskForGroup.id_task_for_group,
                            is_open: taskForGroup.is_open,
                            deadline: taskForGroup.deadline,
                            task: {
                                id_task: taskForGroup.task.id_task,
                                is_available: taskForGroup.task.is_available,
                                task_name: taskForGroup.task.task_name,
                                description: taskForGroup.task.description
                            }
                        };
                    })
                };
            });
    
            return res.json({
                result
            });
        } catch (e) {
            console.error('Ошибка при получении списка доступных заданий:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении списка доступных заданий" });
        }
    }

    async createUserTaskAttempt(req, res) {
        const { id_task } = req.body;
        const id_user = req.user.id; // ID пользователя из авторизации
    
        try {
            // Проверка наличия id_task в запросе
            if (!id_task) {
                return res.status(400).json({ message: "id_task обязателен для выполнения задачи" });
            }
            // 1. Проверяем, что задание доступно
            const task = await Task.findOne({
                where: { id_task: id_task, is_available: true }
            });
    
            if (!task) {
                return res.status(400).json({ error: 'Задание не найдено или недоступно' });
            }
    
            // 2. Проверяем, что пользователь еще не выполнял это задание
            const existingAttempt = await UserMakeTask.findOne({
                where: { id_user, id_task, is_deleted: false }
            });
    
            if (existingAttempt) {
                return res.status(400).json({ error: 'Вы уже выполняли это задание' });
            }
    
            // 3. Проверяем, что у пользователя есть группа с доступом к заданию
            const validGroup = await Group.findOne({
                include: [
                    {
                        model: UsersInGroup,
                        where: { id_user },
                        attributes: []
                    },
                    {
                        model: TaskForGroup,
                        where: { 
                            id_task,
                            is_open: true
                        },
                        required: true,
                        attributes: []
                    }
                ]
            });
    
            if (!validGroup) {
                return res.status(403).json({ 
                    error: 'У вас нет доступа к этому заданию или оно закрыто для ваших групп' 
                });
            }
    
            // 4. Создаем запись о выполнении задания
            const newAttempt = await UserMakeTask.create({
                id_user,
                id_task,
                date_start: new Date(),
                is_deleted: false
            });
    
            return res.status(200).json({
                message: 'Запись на выполнение задания создана',
                attempt: {
                    id_result: newAttempt.id_result,
                    id_task: newAttempt.id_task,
                    date_start: newAttempt.date_start
                }
            });
    
        } catch (error) {
            console.error('Ошибка при создании записи:', error);
            return res.status(500).json({ error: 'Произошла ошибка. Попробуйте позже.' });
        }
    }

}

module.exports = new StudentController()