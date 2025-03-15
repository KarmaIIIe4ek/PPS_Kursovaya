const bcrypt = require('bcrypt');
const { Admin } = require('../models/models');
const generateJwt = require('../utils/jwtGenerate')

class AdminController {
    async createAdmin(req, res, next) {
        const { lastname, firstname, middlename, email, password } = req.body;

        // Проверка наличия email и password
        if (!email || !password) {
            return res.status(400).json({ message: 'Некорректный email или password' });
        }

        // Проверка, существует ли администратор с таким email
        const candidate = await Admin.findOne({ where: { email } });
        if (candidate) {
            return res.status(400).json({ message: 'Администратор с таким email уже существует' });
        }

        // Хеширование пароля
        const hashPassword = await bcrypt.hash(password, 5);

        // Создание администратора
        const admin = await Admin.create({
            email,
            password: hashPassword,
            lastname,
            firstname,
            middlename,
            last_login: new Date(), // Устанавливаем текущую дату и время
            is_active: false, // По умолчанию админская учётка заблокирована
            createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
            updatedAt: new Date() // Sequelize автоматически добавляет это поле, но можно указать вручную
        });

        // Форматируем ответ
        const formattedAdmin = {
            id_admin: admin.id_admin,
            email: admin.email,
            lastname: admin.lastname,
            firstname: admin.firstname,
            middlename: admin.middlename,
            is_active: admin.is_active
        };

        // Возвращаем созданную запись в ответе
        return res.json({ formattedAdmin });
    }

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

    async editAdminSelfFromToken(req, res, next) {
        const { lastname, firstname, middlename, email, password, is_active } = req.body;

        // Поиск администратора по id_admin из токена
        const candidate = await Admin.findOne({
            where: { id_admin: req.admin.id_admin }
        });

        // Проверка, является ли email защищённым (например, email суперадмина)
        if (candidate.email === process.env.ADMIN_EMAIL) {
            return res.status(400).json({ message: 'Эту учётную запись нельзя изменять' });
        }

        // Проверка, существует ли другой администратор с таким email
        if (email && candidate) {
            const existingAdmin = await Admin.findOne({ where: { email } });
            if (existingAdmin && existingAdmin.id_admin !== candidate.id_admin) {
                return res.status(400).json({ message: 'Администратор с таким email уже существует' });
            }
        }

        // Хеширование пароля, если он был передан
        const hashedPassword = password ? await bcrypt.hash(password, 5) : candidate.password;

        // Обновление данных администратора
        const updatedAdmin = await candidate.update({
            email: email || candidate.email,
            password: hashedPassword,
            lastname: lastname || candidate.lastname,
            firstname: firstname || candidate.firstname,
            middlename: middlename || candidate.middlename,
            is_active: is_active !== undefined ? is_active : candidate.is_active
        });

        // Форматируем ответ
        const admin = {
            id_admin: updatedAdmin.id_admin,
            email: updatedAdmin.email,
            lastname: updatedAdmin.lastname,
            firstname: updatedAdmin.firstname,
            middlename: updatedAdmin.middlename,
            is_active: updatedAdmin.is_active
        };
        // Генерация JWT токена
        const token = generateJwt(updatedAdmin.id_admin, updatedAdmin.email, "admin");

        // Возвращаем обновлённую запись в ответе
        return res.json({ 
            token, 
            admin 
        });
    }

    async checkAdmin(req, res, next) {
        // Генерация нового токена для проверки авторизации
        const token = generateJwt(req.admin.id_admin, req.admin.email, "admin");
        return res.json({ token });
    }
}

module.exports = new AdminController();