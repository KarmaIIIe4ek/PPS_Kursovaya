const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {Admin} = require('../models/models')

const generateJwt = (id_admin, email, role_name) => {
    return jwt.sign(
        {id_admin, email, role_name},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class AdminController {
    async createAdmin(req, res, next) {
        const {lastname, firstname, middlename, email, password} = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или password'))
        }
        const candidate = await Admin.findOne({where: {email}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
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
    
        // Генерация JWT токена
        const token = generateJwt(admin.id_admin, admin.email, "admin");
    
        // Возвращаем токен в ответе
        return res.json({ token });
    }

    async loginAdmin(req, res, next) {
        const {email, password} = req.body
        const admin = await Admin.findOne({where: {email}})
        if (!admin) {
            return next(ApiError.internal('Пользователь не найден'))
        }
        let comparePassword = bcrypt.compareSync(password, admin.password)
        if (!comparePassword) {
            return next(ApiError.internal('Указан неверный пароль'))
        }
        const token = generateJwt(admin.id_admin, admin.email, "admin")
        return res.json({token})
    }

    async checkAdmin(req, res, next) {
        const token = generateJwt(req.admin.id_admin, req.admin.email, "admin")
        return res.json({token})
    }
}

module.exports = new AdminController()