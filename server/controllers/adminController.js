const bcrypt = require('bcryptjs');
const { Admin } = require('../models/models');
const generateJwt = require('../utils/jwtGenerate')

class AdminController {
    async loginAdmin(req, res, next) {
        const { email, password } = req.body;

        // Поиск администратора по email
        const admin = await Admin.findOne({ where: { email } });
        if (!admin) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Проверка пароля
        const comparePassword = bcrypt.compareSync(password, admin.password);
        if (!comparePassword) {
            return res.status(400).json({ message: 'Указан неверный пароль' });
        }

        // Генерация JWT токена
        const token = generateJwt(admin.id_admin, admin.email, "admin");

        // Возвращаем токен в ответе
        return res.json({ token });
    }

    async checkAdmin(req, res, next) {
        // Генерация нового токена для проверки авторизации
        const token = generateJwt(req.user.id, req.user.email, "admin");
        return res.json({ token });
    }

    async getInfoAboutSelf(req, res, next) {
            try {
                // Проверка, существует ли пользователь с таким id
                const admin = await Admin.findOne({ 
                    where: { id_admin: req.user.id },
                    raw: true // Чтобы получить plain object вместо модели
                });
        
                if (!admin) {
                    return res.status(400).json({ message: 'Администратор с таким id не найден' });
                }
        
                // Формируем ответ без пароля и с нужными полями
                const userData = {
                    id_admin: admin.id_admin,
                    email: admin.email,
                    lastname: admin.lastname,
                    firstname: admin.firstname,
                    middlename: admin.middlename,
                    last_login: admin.last_login,
                    is_active: admin.is_active,
                    createdAt: admin.createdAt,
                    updatedAt: admin.updatedAt
                };
        
                // Возвращаем данные пользователя
                return res.json(userData);
        
            } catch (error) {
                console.error('Ошибка при получении информации о пользователе:', error);
                return res.status(500).json({ message: 'Произошла ошибка при получении информации' });
            }
        }
}

module.exports = new AdminController();