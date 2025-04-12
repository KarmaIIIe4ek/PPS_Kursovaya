const { group } = require('console');
const {Group, User, UsersInGroup, TaskForGroup, Task, Purchase} = require('../models/models')
const crypto = require('crypto')
const { Op } = require('sequelize'); // Импортируем Op из Sequelize

class GroupController {
    async create(req, res, next) {
        const { group_number } = req.body;
    
        try {
            // Проверка наличия group_number в запросе
            if (!group_number) {
                return res.status(400).json({ message: "group_number обязателен для создания группы" });
            }
            if (group_number.length > 20) {
                return res.status(400).json({ message: "group_number не может быть больше 20 символов" });
            }
            // Поиск пользователя по email
            const user = await User.findOne({ where: { id_user: req.user.id} });
                
            if (!user) {
                return res.status(404).json({ message: "Пользователь с таким email не найден" });
            }

            // Поиск пользователя по email
            const group = await Group.findOne({ where: { 
                group_number: group_number,
                id_user: user.id_user
            } });
    
            if (group) {
                return res.status(404).json({ message: "Группа уже была создана" });
            }
            

            let hash_code_login;
            let isUnique = false;

            // Пытаемся сгенерировать уникальный хеш-код
            while (!isUnique) {
                // Генерация хеш-кода на основе group_number и случайной строки
                const randomString = crypto.randomBytes(4).toString('hex'); // 8 символов
                hash_code_login = `${group_number}-${randomString}`; // Пример: "123-abc12345"

                // Проверка уникальности в таблице Group
                const existingTask = await Group.findOne({ where: { hash_code_login } });
                if (!existingTask) {
                    isUnique = true; // Хеш-код уникален
                }
            }
            // Создание группы
            const newGroup = await Group.create({
                group_number: group_number,
                id_user: user.id_user,
                hash_code_login: hash_code_login,
                createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                updatedAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
            });
    
            return res.json({
                message: "Группа успешно создана",
            });
        } catch (e) {
            console.error('Ошибка при добавлении группы:', e);
            return res.status(500).json({ message: "Произошла ошибка при добавлении группы" });
        }
    }

    async deleteById(req, res, next) {
        const { id_group } = req.body;
    
        try {
            // Проверка наличия group_number в запросе
            if (!id_group) {
                return res.status(400).json({ message: "id_group обязателен для удаления группы" });
            }
            
            // Поиск группы по id_group
            const group = await Group.findOne({ where: { 
                id_group: id_group,
                id_user: req.user.id
            } });

            if (!group) {
                return res.status(400).json({ message: "Группа не найдена" });
            }

            if (req.user.id !== group.id_user) {
                return res.status(404).json({ message: "Вы не можете удалить чужую группу" });
            }


            await UsersInGroup.destroy({where: {
                id_group: group.id_group

            }})

            await TaskForGroup.destroy({where: {
                id_group: group.id_group
            }})

            group.destroy()
    
            return res.json({
                message: "Группа успешно удалена",
            });
        } catch (e) {
            console.error('Ошибка при удалении группы:', e);
            return res.status(500).json({ message: "Произошла ошибка при удалении группы" });
        }
    }

    async getAllMyGroups(req, res, next) {
        try {
            // Получаем все группы, созданные пользователем
            const groups = await Group.findAll({
                where: { id_user: req.user.id },
                attributes: ['id_group', 'group_number', 'hash_code_login', 'id_user', 'createdAt']
            });
    
            // Для каждой группы получаем список пользователей
            const formattedGroups = await Promise.all(groups.map(async (group) => {
                // Получаем пользователей для текущей группы
                const users = await UsersInGroup.findAll({
                    where: { id_group: group.id_group },
                    include: [
                        {
                            model: User,
                            order: [['lastname']]
                        }
                    ],
                    
                });
                
                // Форматируем данные о пользователях
                const usersData = users.map(user => ({
                    id_user: user.user.id_user,
                    email: user.user.email,
                    lastname: user.user.lastname,
                    firstname: user.user.firstname,
                    middlename: user.user.middlename,
                    role_name: user.user.role_name,
                    last_login: user.user.last_login,
                    is_blocked: user.user.is_blocked,
                    is_deleted: user.user.is_deleted,
                    createdAt: user.user.createdAt,
                    updatedAt: user.user.updatedAt
                }));

                const tasks = await TaskForGroup.findAll({
                    where: { 
                        id_group: group.id_group,
                     },
                    include: [
                        {
                            model: Task,
                        }
                    ],
                    order: [['id_task']]
                });
                
                
                // Форматируем данные о Заданиях
                const tasksData = tasks.map(task => ({
                    id_task: task.task.id_task,
                    is_available: task.task.is_available,
                    task_name: task.task.task_name,
                    description: task.task.description
                }));
    
                // Возвращаем данные о группе с пользователями
                return {
                    id_group: group.id_group,
                    group_number: group.group_number,
                    hash_code_login: group.hash_code_login,
                    id_user: group.id_user,
                    createdAt: group.createdAt,
                    tasks: tasksData,
                    users: usersData
                };
            }));
    
            return res.json(formattedGroups);
        } catch (e) {
            console.error('Ошибка при получении данных из списка групп:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении списка групп" });
        }
    }

    async addUserToGroup(req, res, next) {
        const { email, hash_code_login } = req.body;
    
        try {
            // Проверка наличия email в запросе
            if (!email) {
                return res.status(400).json({ message: "email обязателен для добавления в группу" });
            }
             // Проверка наличия hash_code_login в запросе
             if (!hash_code_login) {
                return res.status(400).json({ message: "hash_code_login обязателен для добавления в группу" });
            }
            
            // Поиск пользователя по email
            const user = await User.findOne({ where: { email } });
                
            if (!user) {
                return res.status(404).json({ message: "Пользователь с таким email не найден" });
            }

            // Поиск группы по хеш-коду
            const group = await Group.findOne({ where: { 
                hash_code_login: hash_code_login,
            } });

            if (!group) {
                return res.status(404).json({ message: "Группа не найдена" });
            }

            // Поиск группы по хеш-коду
            const user_was_in_group = await UsersInGroup.findOne({ where: { 
                id_group: group.id_group,
                id_user: user.id_user
            } });

            if (user_was_in_group) {
                return res.status(404).json({ message: "Пользователь уже находится в этой группе" });
            }

            // Добавление пользователя в группу
            const user_in_group = await UsersInGroup.create({
                id_user: user.id_user,
                id_group: group.id_group,
                createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                updatedAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
            });
    
            return res.json({
                message: "Пользователь успешно добавлен в группу"
            });
        } catch (e) {
            console.error('Ошибка при добавлении в группу:', e);
            return res.status(500).json({ message: "Ошибка при добавлении в группу" });
        }
    }

    async removeFromGroupByEmail(req, res, next) {
        const { email, hash_code_login } = req.body;
    
        try {
             // Проверка наличия hash_code_login в запросе
             if (!hash_code_login) {
                return res.status(400).json({ message: "hash_code_login обязателен для удаления из группы" });
            }

            // Проверка наличия email в запросе
            if (!email) {
                return res.status(400).json({ message: "email обязателен для удаления из группы" });
            }

            // Поиск пользователя по email
            const user = await User.findOne({ where: { email } });
                
            if (!user) {
                return res.status(404).json({ message: "Пользователь с таким email не найден" });
            }

            // Поиск группы по хеш-коду
            const group = await Group.findOne({ where: { 
                hash_code_login: hash_code_login,
            } });

            if (!group) {
                return res.status(404).json({ message: "Группа не найдена" });
            }

            if (user.id_user === group.id_user) {
                return res.status(404).json({ message: "Вы не можете удалить себя из своей группы" });
            }

            // Поиск группы по хеш-коду
            const user_was_in_group = await UsersInGroup.findOne({ where: { 
                id_group: group.id_group,
                id_user: user.id_user
            } });

            if (!user_was_in_group) {
                return res.status(404).json({ message: "Пользователь не находится в этой группе" });
            }

            user_was_in_group.destroy();
    
            return res.json({
                message: "Пользователь успешно удален из группы"
            });
        } catch (e) {
            console.error('Ошибка при удалении из группы:', e);
            return res.status(500).json({ message: "Ошибка при удалении из группы" });
        }
    }

    async addSelfToGroup(req, res, next) {
        const { hash_code_login } = req.body;
    
        try {
             // Проверка наличия hash_code_login в запросе
             if (!hash_code_login) {
                return res.status(400).json({ message: "hash_code_login обязателен для добавления в группу" });
            }
            
            // Поиск пользователя по email
            const user = await User.findOne({ where: { id_user: req.user.id } });
                
            if (!user) {
                return res.status(404).json({ message: "Пользователь с таким email не найден" });
            }

            // Поиск группы по хеш-коду
            const group = await Group.findOne({ where: { 
                hash_code_login: hash_code_login,
            } });

            if (!group) {
                return res.status(404).json({ message: "Группа не найдена" });
            }

            // Поиск группы по хеш-коду
            const user_was_in_group = await UsersInGroup.findOne({ where: { 
                id_group: group.id_group,
                id_user: user.id_user
            } });

            if (user_was_in_group) {
                return res.status(404).json({ message: "Вы уже находитесь в этой группе" });
            }

            // Добавление пользователя в группу
            const user_in_group = await UsersInGroup.create({
                id_user: user.id_user,
                id_group: group.id_group,
                createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                updatedAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
            });
    
            return res.json({
                message: "Пользователь успешно добавлен в группу"
            });
        } catch (e) {
            console.error('Ошибка при добавлении в группу:', e);
            return res.status(500).json({ message: "Ошибка при добавлении в группу" });
        }
    }

    async removeSelfFromGroup(req, res, next) {
        const { hash_code_login } = req.body;
    
        try {
             // Проверка наличия hash_code_login в запросе
             if (!hash_code_login) {
                return res.status(400).json({ message: "hash_code_login обязателен для удаления из группы" });
            }
            
            // Поиск пользователя по email
            const user = await User.findOne({ where: { id_user: req.user.id } });
                
            if (!user) {
                return res.status(404).json({ message: "Пользователь с таким email не найден" });
            }

            // Поиск группы по хеш-коду
            const group = await Group.findOne({ where: { 
                hash_code_login: hash_code_login,
            } });

            if (!group) {
                return res.status(404).json({ message: "Группа не найдена" });
            }

            // Поиск группы по хеш-коду
            const user_was_in_group = await UsersInGroup.findOne({ where: { 
                id_group: group.id_group,
                id_user: user.id_user
            } });

            if (!user_was_in_group) {
                return res.status(404).json({ message: "Вы не находитесь в этой группе" });
            }

            user_was_in_group.destroy();
    
            return res.json({
                message: "Вы успешно удалены из группы"
            });
        } catch (e) {
            console.error('Ошибка при удалении из группы:', e);
            return res.status(500).json({ message: "Ошибка при удалении из группы" });
        }
    }

    async grantRightsToGroup (req, res, next) {
        const { id_task, hash_code_login, deadline } = req.body;
    
        try {
            // Проверка наличия id_task в запросе
            if (!id_task) {
                return res.status(400).json({ message: "id_task обязателен для выдачи прав" });
            }
             // Проверка наличия hash_code_login в запросе
             if (!hash_code_login) {
                return res.status(400).json({ message: "hash_code_login обязателен для выдачи прав" });
            }
            
            // Поиск задания по id
            const task = await Task.findOne({ where: { id_task } });
                
            if (!task) {
                return res.status(404).json({ message: "Задание с таким id не найдено" });
            }

            // Поиск группы по хеш-коду
            const group = await Group.findOne({ where: { 
                hash_code_login: hash_code_login,
                id_user: req.user.id
            } });

            if (!group) {
                return res.status(404).json({ message: "Группа не найдена" });
            }

            // Поиск группы по хеш-коду
            const purchase = await Purchase.findOne({ where: { 
                id_user: req.user.id,
                is_paid: true,
            } });

            if (!purchase) {
                return res.status(404).json({ message: "У вас не оплачена услуга" });
            }

            if (purchase.is_blocked) {
                return res.status(404).json({ message: "Услуги для вас заблокированы администратором" });
            }

            const tasks_for_group = await TaskForGroup.findOne({
                where: {
                    id_task: task.id_task,
                    id_group: group.id_group,
                }
            });

            if (tasks_for_group) {
                return res.status(404).json({ message: "Права уже были выданы" });
            }

            // Поиск группы по хеш-коду
            const task_for_group = await TaskForGroup.create({
                is_open: false,
                deadline: deadline || null,
                id_task: task.id_task,
                id_group: group.id_group,
                createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                updatedAt: new Date() // Sequelize автоматически добавляет это поле, но можно указать вручную
            });
    
            return res.json({
                message: "Группе успешно выданы права на задание"
            });
        } catch (e) {
            console.error('Ошибка при выдаче прав группе на задание:', e);
            return res.status(500).json({ message: "Ошибка при выдаче прав группе на задание" });
        }
    }
    
    async changeIsOpenById(req, res, next) {
        const { id_task, hash_code_login } = req.body;
    
        try {
            // Проверка наличия id_task в запросе
            if (!id_task) {
                return res.status(400).json({ message: "id_task обязателен" });
            }

            // Проверка наличия hash_code_login в запросе
            if (!hash_code_login) {
                return res.status(400).json({ message: "hash_code_login обязателен" });
            }

            // Поиск задания по id_task
            const task = await Task.findOne({ where: { id_task } });
    
            if (!task) {
                return res.status(404).json({ message: "Задание с таким id не найдено" });
            }

            // Поиск группы по hash_code_login
            const group = await Group.findOne({ where: { hash_code_login } });
    
            if (!group) {
                return res.status(404).json({ message: "Группа с таким hash_code_login не найдена" });
            }

            // Поиск оплаты пользователя
            const purchase = await Purchase.findOne({ where: { 
                id_user: req.user.id,
                is_paid: true,
            } });

            if (!purchase) {
                return res.status(404).json({ message: "У вас не оплачена услуга" });
            }

            if (purchase.is_blocked) {
                return res.status(404).json({ message: "Услуги для вас заблокированы администратором" });
            }

            const task_for_group = await TaskForGroup.findOne({ where: { 
                id_group: group.id_group,
                id_task: task.id_task
             } });
    
            if (!task_for_group) {
                return res.status(404).json({ message: "Выданные права с такими данными не найдены" });
            }

            task_for_group.update({
                is_open: !task_for_group.is_open
            })
            if (task_for_group.is_open === false) {
                return res.json({ message: "Выполнение задания группой больше недоступно" });
            } else {
                return res.json({ message: "Выполнение задания группой теперь доступно" });
            }
            
        } catch (e) {
            console.error('Ошибка при изменении доступности выполнении задания группой:', e);
            return res.status(500).json({ message: "Произошла ошибка при изменении доступности выполнении задания группой" });
        }
    }

    async getAllMyAccess(req, res, next) {
    
        try {

            // Поиск группы по id_user (преподавателя)
            const groups = await Group.findAll({ where: { id_user: req.user.id },
                include: [
                    {
                        model: TaskForGroup,
                        include: [
                                {
                                model: Task,
                            }
                        ],
                    }
                ],
            });
            // Форматируем ответ
            const formattedGroups = groups.map(group => {
                // Сортируем task_for_groups по id_task_for_group перед маппингом
                const sortedTasks = group.task_for_groups
                    ? [...group.task_for_groups].sort((a, b) => a.id_task_for_group - b.id_task_for_group)
                    : [];
            
                return {
                    id_group: group.id_group,
                    group_number: group.group_number,
                    hash_code_login: group.hash_code_login,
                    id_user: group.id_user,
                    createdAt: group.createdAt,
                    tasks: sortedTasks.map(taskForGroup => ({
                        id_task_for_group: taskForGroup.id_task_for_group,
                        is_open: taskForGroup.is_open,
                        deadline: taskForGroup.deadline,
                        task: {
                            id_task: taskForGroup.task.id_task,
                            is_available: taskForGroup.task.is_available,
                            task_name: taskForGroup.task.task_name,
                            description: taskForGroup.task.description
                        }
                    }))
                };
            });

            return res.json(formattedGroups);
            
        } catch (e) {
            console.error('Ошибка при получении списка групп с выданными им правами:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении списка групп с выданными им правами" });
        }
    }

    async getGroupsWhereIAmMember(req, res, next) {
        try {
            // Получаем все группы, в которых состоит текущий пользователь
            const userGroups = await UsersInGroup.findAll({
                where: { id_user: req.user.id },
                include: [
                    {
                        model: Group,
                        include: [
                            {
                                model: User,
                                as: 'user', // Используем стандартный алиас, если не задавали свой
                                attributes: ['id_user', 'email', 'lastname', 'firstname', 'middlename']
                            },
                            {
                                model: UsersInGroup,
                                include: [
                                    {
                                        model: User,
                                        attributes: ['id_user', 'email', 'lastname', 'firstname', 'middlename', 'role_name']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [
                    [Group, 'createdAt', 'DESC']
                ]
            });
    
            // Форматируем ответ
            const formattedGroups = userGroups.map(userGroup => {
                const group = userGroup.group;
                
                // Форматируем данные участников
                const membersData = group.users_in_groups.map(member => ({
                    id_user: member.user.id_user,
                    email: member.user.email,
                    lastname: member.user.lastname,
                    firstname: member.user.firstname,
                    middlename: member.user.middlename,
                    role_name: member.user.role_name
                }));
    
                return {
                    id_group: group.id_group,
                    group_number: group.group_number,
                    hash_code_login: group.hash_code_login,
                    created_at: group.createdAt,
                    creator: {
                        id_user: group.user.id_user,
                        email: group.user.email,
                        lastname: group.user.lastname,
                        firstname: group.user.firstname,
                        middlename: group.user.middlename
                    },
                    members: membersData
                };
            });
    
            return res.json(formattedGroups);
        } catch (e) {
            console.error('Ошибка при получении списка групп, где пользователь является участником:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении списка групп, где пользователь является участником" });
        }
    }
}

module.exports = new GroupController()