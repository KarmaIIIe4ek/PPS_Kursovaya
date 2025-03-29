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

    async getTasksWithGroups(req, res, next) {
        try {
            // Получаем все задания, которые доступны хотя бы одной группе
            const tasks = await Task.findAll({
                include: [
                    {
                        model: TaskForGroup,
                        where: { is_open: true }, // Только открытые задания для групп
                        required: true, // Только задания, которые есть в TaskForGroup
                        include: [
                            {
                                model: Group,
                                include: [
                                    {
                                        model: UsersInGroup,
                                        where: { id_user: req.user.id },
                                        required: true // Только группы, где есть текущий пользователь
                                    }
                                ],
                                attributes: ['group_number', 'hash_code_login']
                            }
                        ],
                        attributes: ['is_open', 'deadline']
                    }
                ],
                where: {
                    is_available: true // Только доступные задания
                },
                attributes: ['id_task', 'task_name', 'description', 'is_available']
            });
    
            // Преобразуем результат в нужный формат
            const result = tasks.map(task => {
                return {
                    id_task: task.id_task,
                    task_name: task.task_name,
                    description: task.description,
                    is_available: task.is_available,
                    groups: task.task_for_groups.map(taskForGroup => {
                        return {
                            group_number: taskForGroup.group.group_number,
                            hash_code_login: taskForGroup.group.hash_code_login,
                            is_open: taskForGroup.is_open,
                            deadline: taskForGroup.deadline
                        };
                    })
                };
            });
    
            return res.json({
                result
            });
        } catch (e) {
            console.error('Ошибка при получении списка заданий с группами:', e);
            return res.status(500).json({ 
                message: "Произошла ошибка при получении списка заданий с группами" 
            });
        }
    }

    async getUserTaskAttempts(req, res) {
        const id_user = req.user.id;
    
        try {
            // 1. Получаем все группы пользователя
            const userGroups = await UsersInGroup.findAll({
                where: { id_user },
                include: [{
                    model: Group,
                    attributes: ['id_group', 'group_number', 'hash_code_login'],
                    include: [{
                        model: TaskForGroup,
                        attributes: ['id_task', 'is_open', 'deadline'],
                        include: [{
                            model: Task,
                            attributes: ['id_task', 'task_name', 'description', 'is_available']
                        }]
                    }]
                }]
            });
    
            // 2. Получаем все попытки пользователя
            const attempts = await UserMakeTask.findAll({
                where: { 
                    id_user,
                    is_deleted: false 
                },
                include: [{
                    model: Task,
                    attributes: ['id_task', 'task_name', 'description', 'is_available']
                }],
                order: [['date_start', 'DESC']]
            });
    
            // 3. Собираем результат
            const result = attempts.map(attempt => {
                // Находим группы, где есть это задание
                const relatedGroups = userGroups
                    .filter(ug => 
                        ug.group.task_for_groups.some(tfg => 
                            tfg.id_task === attempt.id_task && 
                            tfg.is_open === true
                        )
                    )
                    .map(ug => {
                        const taskForGroup = ug.group.task_for_groups.find(tfg => 
                            tfg.id_task === attempt.id_task
                        );
                        return {
                            group_number: ug.group.group_number,
                            hash_code_login: ug.group.hash_code_login,
                            is_open: taskForGroup.is_open,
                            deadline: taskForGroup.deadline
                        };
                    });
    
                return {
                    id_result: attempt.id_result,
                    task: {
                        id_task: attempt.task.id_task,
                        task_name: attempt.task.task_name,
                        description: attempt.task.description,
                        is_available: attempt.task.is_available
                    },
                    groups: relatedGroups,
                    score: attempt.score,
                    comment_user: attempt.comment_user,
                    comment_teacher: attempt.comment_teacher,
                    date_start: attempt.date_start,
                    date_finish: attempt.date_finish,
                    status: attempt.date_finish ? 'completed' : 'in_progress'
                };
            });
    
            return res.status(200).json({
                attempts: result
            });
    
        } catch (error) {
            console.error('Ошибка при получении попыток пользователя:', error);
            return res.status(500).json({ 
                error: 'Произошла ошибка при получении ваших попыток выполнения заданий' 
            });
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
            return res.status(500).json({ error: 'Ошибка при создании записи' });
        }
    }

    async finishUserTaskAttempt(req, res) {
        const { id_task, score, comment_user } = req.body;
        const id_user = req.user.id; // ID пользователя из авторизации
    
        try {
            // Проверка наличия id_task в запросе
            if (!id_task) {
                return res.status(400).json({ message: "id_task обязателен для выполнения задачи" });
            }

            // Проверка наличия score в запросе
            if (!score) {
                return res.status(400).json({ message: "score обязателен для выполнения задачи" });
            }
            // 1. Проверяем, что задание доступно
            const task = await Task.findOne({
                where: { id_task: id_task, is_available: true }
            });
    
            if (!task) {
                return res.status(400).json({ error: 'Задание не найдено или недоступно' });
            }
    
            // 2. Находим попытку пользователя
            const existingAttempt = await UserMakeTask.findOne({
                where: { id_user, id_task, is_deleted: false }
            });
    
            if (!existingAttempt) {
                return res.status(400).json({ error: 'Вы ещё не приступали к этому заданию' });
            }

            if (existingAttempt.date_finish) {
                return res.status(400).json({ error: 'Вы уже выполнили это задание ранее' });
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
    
            existingAttempt.update({
                    score: score,
                    comment_user: comment_user || "",
                    date_finish: new Date()
            })
    
            return res.status(200).json({
                message: 'Задание успешно выполнено',
                attempt: {
                    id_result: existingAttempt.id_result,
                    id_user: existingAttempt.id_user,
                    id_task: existingAttempt.id_task,
                    date_start: existingAttempt.date_start,
                    score: existingAttempt.score,
                    comment_user: existingAttempt.comment_user,
                    date_finish: existingAttempt.date_finish
                }
            });
    
        } catch (error) {
            console.error('Ошибка при завершении задания:', error);
            return res.status(500).json({ error: 'Ошибка при завершении задания' });
        }
    }

}

module.exports = new StudentController()