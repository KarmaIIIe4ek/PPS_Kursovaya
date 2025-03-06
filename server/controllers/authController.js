const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User} = require('../models/models')

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class AuthController {
    async registration(req, res, next) {
        const {lastname, firstname, middlename, role_name, group, email, password} = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или password'))
        }
        if (group) {
            const existingGroup = await Group.findOne({ where: { id_group: group } });
            if (!existingGroup) {
                return next(ApiError.badRequest('Группа с таким ID не существует'));
            }
        }
        const candidate = await User.findOne({where: {email}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
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
        const token = generateJwt(user.id, user.email, user.role_name);
    
        // Возвращаем токен в ответе
        return res.json({ token });
    }

    async login(req, res, next) {
        const {email, password} = req.body
        const user = await User.findOne({where: {email}})
        if (!user) {
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.internal('Указан неверный пароль'))
        }
        const token = generateJwt(user.id, user.email, user.role_name)
        return res.json({token})
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role_name)
        return res.json({token})
    }
}

module.exports = new AuthController()