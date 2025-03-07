const ApiError = require('../error/ApiError');
const {Support} = require('../models/models')

class SupportController {
    async sendToSupport(req, res, next) {
        const { user_text } = req.body;
    
        try {
            // Проверка наличия описания в запросе
            if (!user_text) {
                return res.status(400).json({ message: "Отсутсвует описание!" });
            }

            const user = await User.findOne({where: {id_user: req.user.id}})
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
}

module.exports = new BlacklistController()