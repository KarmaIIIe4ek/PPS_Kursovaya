const {Blacklist, User, Group, UsersInGroup} = require('../models/models')

class BlacklistController {
    async addToBlacklist(req, res, next) {
        const { email, reason } = req.body;
    
        try {
            // Проверка наличия email в запросе
            if (!email) {
                return res.status(400).json({ message: "Email обязателен для добавления в черный список" });
            }
    
            // Поиск пользователя по email
            const user = await User.findOne({ where: { email } });
    
            if (!user) {
                return res.status(404).json({ message: "Пользователь с таким email не найден" });
            }
    
            // Проверка, не добавлен ли пользователь уже в черный список
            const existingBlacklistEntry = await Blacklist.findOne({ where: { id_user: user.id_user } });
    
            if (existingBlacklistEntry) {
                return res.status(400).json({ message: "Пользователь уже находится в черном списке" });
            }
    
            // Создание записи в черном списке
            const blacklist = await Blacklist.create({
                reason: reason || "Причина не указана", // Если причина не указана, используем значение по умолчанию
                createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                updatedAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                id_user: user.id_user
            });
    
            return res.json({
                message: "Пользователь успешно добавлен в черный список",
                blacklist: blacklist.id
            });
        } catch (e) {
            console.error('Ошибка при добавлении в черный список:', e);
            return res.status(500).json({ message: "Произошла ошибка при добавлении в черный список" });
        }
    }

    async removeFromBlacklist(req, res, next) {
        const { email } = req.body;
    
        try {
            // Проверка наличия email в запросе
            if (!email) {
                return res.status(400).json({ message: "Email обязателен для добавления в черный список" });
            }
            // Поиск пользователя по email
            const user = await User.findOne({ where: { email } });
    
            if (!user) {
                return res.status(404).json({ message: "Пользователь с таким email не найден" });
            }
            // Находим запись в черном списке по email
            const blacklistEntry = await Blacklist.findOne({ where: { id_user: user.id_user } });
    
            if (!blacklistEntry) {
                return res.status(404).json({ message: "Пользователь не найден в черном списке" });
            }
    
            // Удаляем запись из черного списка
            await blacklistEntry.destroy();
    
            return res.json({ message: "Пользователь успешно удален из черного списка" });
        } catch (e) {
            console.error('Ошибка при удалении из черного списка:', e);
            return res.status(500).json({ message: "Произошла ошибка при удалении из черного списка" });
        }
    }

    async getAll(req, res, next) {
        try {
            // Получаем все записи из blacklist с включением данных из таблицы User и Group
            const blacklistEntries = await Blacklist.findAll({
                include: [
                    {
                        model: User,
                    }
                ]
            });
    
            // Форматируем ответ, чтобы включить только нужные данные
            const formattedBlacklist = blacklistEntries.map(entry => {
                const user = entry.user || {}; // Если User отсутствует, используем пустой объект
                return {
                    id_blacklist: entry.id_blacklist,
                    date_added: entry.createdAt,
                    reason: entry.reason,
                    user: {
                        id_user: user.id_user,
                        email: user.email,
                        lastname: user.lastname,
                        firstname: user.firstname,
                        middlename: user.middlename || null,
                        role_name: user.role_name,
                        last_login: user.last_login,
                        is_blocked: user.is_blocked,
                        is_deleted: user.is_deleted,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                    }
                };
            });
    
            return res.json(formattedBlacklist);
        } catch (e) {
            console.error('Ошибка при получении данных из blacklist:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении данных из blacklist" });
        }
    }
}

module.exports = new BlacklistController()