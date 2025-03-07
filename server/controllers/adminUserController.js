const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../models/models')

const generateJwt = (id_user, email, role) => {
    return jwt.sign(
        {id_user, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async getAllStudents(req, res, next) {
        try {
            // Получаем все записи из blacklist с включением данных из таблицы User и Group
            const studentsEntries = await User.findAll({
                attributes: [ 'id_user', 'email', 'lastname', 'firstname', 'middlename', 'last_login', 'role_name', 'is_blocked'],
                where: {role_name: 'student'}
            });
            // Форматируем ответ, чтобы включить только нужные данные
            const formattedStudents = studentsEntries.map(entry => {
                return {
                    id_user: entry.id_user,
                    email: entry.email,
                    lastname: entry.lastname,
                    firstname: entry.firstname,
                    middlename: entry.middlename || null,
                    last_login: entry.last_login || null,
                    role_name: entry.role_name,
                    is_blocked: entry.is_blocked
                };
            });
    
            return res.json(formattedStudents);
        } catch (e) {
            console.error('Ошибка при получении данных из User:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении данных из User" });
        }
    }
    async getAllTeacher(req, res, next) {
        try {
            // Получаем все записи из blacklist с включением данных из таблицы User и Group
            const teacherEntries = await User.findAll({
                attributes: [ 'id_user', 'email', 'lastname', 'firstname', 'middlename', 'last_login', 'role_name', 'is_blocked'],
                where: {role_name: 'teacher'}
            });
            // Форматируем ответ, чтобы включить только нужные данные
            const formattedTeacher = teacherEntries.map(entry => {
                return {
                    id_user: entry.id_user,
                    email: entry.email,
                    lastname: entry.lastname,
                    firstname: entry.firstname,
                    middlename: entry.middlename || null,
                    last_login: entry.last_login || null,
                    role_name: entry.role_name,
                    is_blocked: entry.is_blocked
                };
            });
    
            return res.json(formattedTeacher);
        } catch (e) {
            console.error('Ошибка при получении данных из User:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении данных из User" });
        }
    }

    async editUserByID(req, res, next) {
        try {
            const { id_user, email, password, lastname, firstname, middlename, last_login, is_blocked } = req.body;
    
            // Проверка наличия обязательных полей
            if (!id_user) {
                return res.status(400).json({ message: "Необходимо указать id_user" });
            }
    
            // Поиск пользователя по id_user
            const user = await User.findOne({
                where: { id_user: id_user }
            });
    
            if (!user) {
                return res.status(404).json({ message: "Пользователь не найден" });
            }
    
            const existingUser = await User.findOne({
                where: { email: email }
            });

            // Если email уже используется другим пользователем
            if (existingUser && existingUser.id_user !== id_user) {
                return res.status(400).json({ message: "Email уже используется другим пользователем" });
            }
            
            // Обновление данных пользователя
            const updatedUser = await user.update({
                email: email || user.email,
                password: password ? (await bcrypt.hash(password, 5)) : user.password,
                lastname: lastname || user.lastname,
                firstname: firstname || user.firstname,
                middlename: middlename || user.middlename,
                last_login: last_login || user.last_login,
                role_name: user.role_name,
                is_blocked: is_blocked !== undefined ? is_blocked : user.is_blocked // Если is_blocked не передан, оставляем старый
            });
    
            // Форматируем ответ
            const formattedUser = {
                id_user: updatedUser.id_user,
                email: updatedUser.email,
                lastname: updatedUser.lastname,
                firstname: updatedUser.firstname,
                middlename: updatedUser.middlename || null,
                last_login: updatedUser.last_login || null,
                role_name: updatedUser.role_name,
                is_blocked: updatedUser.is_blocked
            };
    
            return res.json(formattedUser);
        } catch (e) {
            console.error('Ошибка при обновлении данных пользователя:', e.message);
            return res.status(500).json({ message: "Произошла ошибка при обновлении данных пользователя" });
        }
    }

}

module.exports = new UserController()