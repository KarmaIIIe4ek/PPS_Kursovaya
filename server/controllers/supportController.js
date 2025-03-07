const ApiError = require('../error/ApiError');
const {Support, User} = require('../models/models')

class SupportController {
    async sendToSupport(req, res, next) {
        const { user_text } = req.body;
    
        try {
            // Проверка наличия описания в запросе
            if (!user_text) {
                return res.status(400).json({ message: "Отсутсвует описание!" });
            }

            const user = await User.findOne({where: {id_user: req.user.id_user}})
            if (!user) {
                return next(ApiError.internal('Пользователь не найден'))
            }

            const support = await Support.create({
                user_text: user_text,
                status: "Новое",
                createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                updatedAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                id_user: user.id_user
            });
    
            return res.json({
                message: "Обращение успешно создано!",
                support: support.id
            });
        } catch (e) {
            console.error('Ошибка при создании обращения в ТП:', e);
            return res.status(500).json({ message: "Произошла ошибка при создании обращения в ТП" });
        }
    }

    async getAll(req, res, next) {
        try {
            // Получаем все записи из support
            const supportEntries = await Support.findAll();
    
            // Форматируем ответ, чтобы включить только нужные данные
            const formattedSupport = supportEntries.map(entry => {
                return {
                    id_support: entry.id_support,
                    id_user: entry.id_user,
                    id_admin: entry.id_admin,
                    user_text: entry.user_text,
                    status: entry.status,
                    admin_response: entry.admin_response || null
                };
            });
    
            return res.json(formattedSupport);
        } catch (e) {
            console.error('Ошибка при получении данных из support:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении данных из support" });
        }
    }

    async getListMyAppeal(req, res, next) {
        try {
            // Получаем все записи из support
            const supportEntries = await Support.findAll({where: { id_user: req.user.id_user } });
    
            // Форматируем ответ, чтобы включить только нужные данные
            const formattedSupport = supportEntries.map(entry => {
                return {
                    id_support: entry.id_support,
                    id_user: entry.id_user,
                    id_admin: entry.id_admin,
                    user_text: entry.user_text,
                    status: entry.status,
                    admin_response: entry.admin_response || null
                };
            });
    
            return res.json(formattedSupport);
        } catch (e) {
            console.error('Ошибка при получении данных из support:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении данных из support" });
        }
    }

    async sendResponseToSupport(req, res, next) {
        try {
            const [updatedCount, [updatedSupport]] = await Support.update(
                {
                    admin_response: req.body.admin_response,
                    status: req.body.status
                },
                {
                    where: { id_support: req.body.id_support },
                    returning: true // Возвращает обновленную запись
                }
            );
            
            if (updatedCount === 0) {
                return res.status(404).json({ message: "Запись не найдена" });
            }
            
            const formattedSupport = {
                id_support: updatedSupport.id_support,
                id_user: updatedSupport.id_user,
                id_admin: updatedSupport.id_admin,
                user_text: updatedSupport.user_text,
                status: updatedSupport.status,
                admin_response: updatedSupport.admin_response || null
            };
            
            return res.json(formattedSupport);
        } catch (e) {
            console.error('Ошибка при получении данных из support:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении данных из support" });
        }
    }
}

module.exports = new SupportController()