const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Group } = require('../models/models');

const generateJwt = (id_user, email, role) => {
    return jwt.sign(
        { id_user, email, role },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
};

class AuthController {
    async registration(req, res, next) {
        const { lastname, firstname, middlename, role_name, group, email, password } = req.body;

        // Проверка наличия email и password
        if (!email || !password) {
            return res.status(400).json({ message: 'Некорректный email или password' });
        }

        // Проверка существования группы, если она указана
        if (group) {
            const existingGroup = await Group.findOne({ where: { id_group: group } });
            if (!existingGroup) {
                return res.status(400).json({ message: 'Группа с таким ID не существует' });
            }
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
        const token = generateJwt(req.user.id_user, req.user.email, req.user.role_name);
        return res.json({ token });
    }
}

module.exports = new AuthController();