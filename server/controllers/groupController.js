const { group } = require('console');
const {Group, User, UsersInGroup} = require('../models/models')
const crypto = require('crypto')

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
                group_number: newGroup.group_number,
                hash_code_login: hash_code_login,
            });
        } catch (e) {
            console.error('Ошибка при добавлении группы:', e);
            return res.status(500).json({ message: "Произошла ошибка при добавлении группы" });
        }
    }

    async getAllMyGroups(req, res, next) {
        try {
            // Получаем все группы, созданные пользователем
            const groups = await Group.findAll({
                where: { id_user: req.user.id },
                attributes: ['id_group', 'group_number', 'hash_code_login']
            });
    
            // Для каждой группы получаем список пользователей
            const formattedGroups = await Promise.all(groups.map(async (group) => {
                // Получаем пользователей для текущей группы
                const users = await UsersInGroup.findAll({
                    where: { id_group: group.id_group },
                    include: [
                        {
                            model: User,
                            attributes: ['id_user', 'email', 'lastname', 'firstname', 'middlename']
                        }
                    ]
                });
    
                // Форматируем данные о пользователях
                const usersData = users.map(user => ({
                    id_user: user.user.id_user,
                    email: user.user.email,
                    lastname: user.user.lastname,
                    firstname: user.user.firstname,
                    middlename: user.user.middlename
                }));
    
                // Возвращаем данные о группе с пользователями
                return {
                    group_number: group.group_number,
                    hash_code_login: group.hash_code_login,
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
    
}

module.exports = new GroupController()