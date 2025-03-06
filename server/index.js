require('dotenv').config()
const express = require('express')
const cors = require('cors')
const sequelize = require('./db')
const models = require('./models/models')
const userRoutes = require('./routes/index');
const adminRoutes = require('./routes/adminRouter');

const PORT_USER = process.env.PORT_USER || 5000
const PORT_ADMIN =  process.env.PORT_ADMIN || 5001;

const appUser = express()
const appAdmin = express(); // Приложение для админ-панели

appAdmin.use(cors())
appUser.use(cors())
appAdmin.use(express.json());
appUser.use(express.json())

appUser.use('/', userRoutes);
appAdmin.use('/admin', adminRoutes);

const startUserServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        appUser.listen(PORT_USER, () => console.log(`Пользовательский сервер запущен на порту ${PORT_USER}`));
    } catch (e) {
        console.log(e);
    }
};

startUserServer();

const startAdminServer = async () => {
    try {
        await sequelize.authenticate(); // Проверка подключения
        await sequelize.sync(); // Синхронизация моделей (если нужно)
        appAdmin.listen(PORT_ADMIN, () => console.log(`Админский сервер запущен на порту ${PORT_ADMIN}`));
    } catch (e) {
        console.log(e);
    }
};

startAdminServer();

