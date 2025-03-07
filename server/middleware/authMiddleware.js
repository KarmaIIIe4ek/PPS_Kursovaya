const jwt = require('jsonwebtoken');
const { User, Blacklist } = require('../models/models'); // Импортируем модели User и Admin

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
        req.user = decoded;

        // Проверяем, не заблокирован ли пользователь
        const user = await User.findOne({ where: { email: decoded.email } });
        if (!user || user.is_blocked) {
            return res.status(403).json({ message: "Доступ запрещен: аккаунт заблокирован" });
        }

        const blacklist = await Blacklist.findOne({ where: { id_user: decoded.id } });
        if (blacklist) {
            return res.status(403).json({ message: "Доступ запрещен: аккаунт добавлен в чёрный список" });
        }

        const userId = decoded.id;
        await User.update(
            { last_login: new Date() },
            { where: { id_user: userId } }
        );

        next(); // Передаем управление следующему middleware или контроллеру
    } catch (e) {
        console.error('Ошибка при проверке токена или обновлении last_login:', e);
        return res.status(401).json({ message: "Не авторизован" });
    }
};