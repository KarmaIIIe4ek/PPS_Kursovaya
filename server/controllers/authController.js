const bcrypt = require('bcrypt');
const { User } = require('../models/models');

const generateJwt = require('../utils/jwtGenerate')

class AuthController {
    async registration(req, res, next) {
        const { lastname, firstname, middlename, role_name, email, password } = req.body;

        // Проверка наличия email и password
        if (!email || !password) {
            return res.status(400).json({ message: 'Некорректный email или password' });
        }

        if (role_name !== 'student' && role_name !== 'teacher') {
            return res.status(400).json({ message: 'Некорректная роль' });
        }

        // Проверка, существует ли пользователь с таким email
        const candidate = await User.findOne({ where: { email } });
        if (candidate) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Хеширование пароля
        const hashPassword = await bcrypt.hash(password, 5);

        // Создание пользователя
        const user = await User.create({
            email,
            password: hashPassword,
            lastname,
            firstname,
            middlename,
            role_name,
            last_login: new Date(), // Устанавливаем текущую дату и время
            is_blocked: false, // По умолчанию пользователь не заблокирован
            is_deleted: false, // По умолчанию пользователь не удален
            createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
            updatedAt: new Date() // Sequelize автоматически добавляет это поле, но можно указать вручную
        });

        // Генерация JWT токена
        const token = generateJwt(user.id_user, user.email, user.role_name);

        // Возвращаем токен в ответе
        return res.json({ token });
    }

    async login(req, res, next) {
        const { email, password } = req.body;

        // Поиск пользователя по email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Проверка пароля
        const comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            return res.status(400).json({ message: 'Указан неверный пароль' });
        }

        // Генерация JWT токена
        const token = generateJwt(user.id_user, user.email, user.role_name);

        // Возвращаем токен в ответе
        return res.json({ token });
    }

    async check(req, res, next) {
        // Генерация нового токена для проверки авторизации
        const token = generateJwt(req.user.id, req.user.email, req.user.role_name);
        return res.json({ token });
    }

    async editSelfFromToken(req, res, next) {
        const { email, password, lastname, firstname, middlename } = req.body;

        // Поиск пользователя по id из токена
        const candidate = await User.findOne({
            where: { id_user: req.user.id }
        });

        // Проверка, существует ли другой пользователь с таким email
        if (email && candidate) {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser && existingUser.id_user !== candidate.id_user) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }
        }

        // Хеширование пароля, если он был передан
        const hashedPassword = password ? await bcrypt.hash(password, 5) : candidate.password;

        // Обновление данных администратора
        const updatedUser = await candidate.update({
            email: email || candidate.email,
            password: hashedPassword,
            lastname: lastname || candidate.lastname,
            firstname: firstname || candidate.firstname,
            middlename: middlename || candidate.middlename,
        });

        // Форматируем ответ
        const user = {
            id_user: updatedUser.id_user,
            email: updatedUser.email,
            lastname: updatedUser.lastname,
            firstname: updatedUser.firstname,
            middlename: updatedUser.middlename,
            role_name: updatedUser.role_name,
            last_login: updatedUser.last_login,
            is_blocked: updatedUser.is_blocked,
            is_deleted: updatedUser.is_deleted,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };
        // Генерация JWT токена
        const token = generateJwt(updatedUser.id_user, updatedUser.email, updatedUser.role_name);

        // Возвращаем обновлённую запись в ответе
        return res.json({ 
            token, 
            user 
        });
    }

    async getInfoAboutSelf(req, res, next) {
        try {
            // Проверка, существует ли пользователь с таким id
            const user = await User.findOne({ 
                where: { id_user: req.user.id },
                attributes: [
                    'id_user',
                    'email',
                    'lastname',
                    'firstname',
                    'middlename',
                    'role_name',
                    'last_login',
                    'is_blocked',
                    'is_deleted',
                    'createdAt',
                    'updatedAt'
                ],
                raw: true // Чтобы получить plain object вместо модели
            });
    
            if (!user) {
                return res.status(400).json({ message: 'Пользователь с таким id не найден' });
            }
    
            // Формируем ответ без пароля и с нужными полями
            const userData = {
                id_user: user.id_user,
                email: user.email,
                lastname: user.lastname,
                firstname: user.firstname,
                middlename: user.middlename,
                role_name: user.role_name,
                last_login: user.last_login,
                is_blocked: user.is_blocked,
                is_deleted: user.is_deleted,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
    
            // Возвращаем данные пользователя
            return res.json(userData);
    
        } catch (error) {
            console.error('Ошибка при получении информации о пользователе:', error);
            return res.status(500).json({ message: 'Произошла ошибка при получении информации' });
        }
    }
}

module.exports = new AuthController();