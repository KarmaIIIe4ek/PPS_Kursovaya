const jwt = require('jsonwebtoken');
const { Admin } = require('../models/models'); // Импортируем модель Admin

module.exports = async function (req, res, next) {
    if (req.method === "OPTIONS") {
        return next(); // Пропускаем предварительные запросы (OPTIONS)
    }

    try {
        const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
        if (!token) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.admin = decoded;

        // Проверяем, является ли пользователь администратором
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Доступ запрещен: недостаточно прав" });
        }

        // Проверяем, активен ли администратор
        const admin = await Admin.findOne({ where: { email: decoded.email } });
        if (!admin || !admin.is_active) {
            return res.status(403).json({ message: "Доступ запрещен: администратор заблокирован" });
        }

        // Обновляем last_login для администратора
        await Admin.update(
            { last_login: new Date() },
            { where: { email: decoded.email } }
        );

        next(); // Передаем управление следующему middleware или контроллеру
    } catch (e) {
        console.error('Ошибка при проверке токена или обновлении last_login:', e);
        return res.status(401).json({ message: "Не авторизован" });
    }
};