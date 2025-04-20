require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const models = require('./models/models');
const userRoutes = require('./routes/user/index');
const adminRoutes = require('./routes/admin/adminRouter');
const http = require('http'); // Заменили https на http
const fs = require('fs');
const path = require('path');

// Импортируем всё из logger.js
const {
    logger,
    moveOldLogs,
    captureRequestBody,
    captureResponseBody,
    morganMiddleware
} = require('./logger');

const HTTP_PORT_USER = process.env.HTTP_PORT_USER || 5000; 
const HTTP_PORT_ADMIN = process.env.HTTP_PORT_ADMIN || 5001; 

const appUser = express();
const appAdmin = express(); // Приложение для админ-панели

appAdmin.use(cors());
appUser.use(cors());
appAdmin.use(express.json());
appUser.use(express.json());

// Убрали загрузку SSL/TLS сертификатов, так как они не нужны для HTTP

// Перемещение старых логов перед запуском
moveOldLogs();

// Middleware для захвата тел запросов и ответов
appUser.use(captureRequestBody); // Подключаем captureRequestBody
appUser.use(captureResponseBody);

appAdmin.use(captureRequestBody); // Подключаем captureRequestBody
appAdmin.use(captureResponseBody);

// Настройка Morgan для записи HTTP-логов в файл
appUser.use(morganMiddleware);
appAdmin.use(morganMiddleware);

// Подключение роутов
appUser.use('/api', userRoutes);
appAdmin.use('/api', adminRoutes);

const startUserServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        logger.info('Подключение к базе данных успешно установлено');

        http.createServer(appUser).listen(HTTP_PORT_USER, '0.0.0.0', () => { // Заменили https на http
            logger.info(`Пользовательский HTTP сервер запущен на порту ${HTTP_PORT_USER}`);
            console.log(`Пользовательский HTTP сервер запущен на порту ${HTTP_PORT_USER}`);
        });
    } catch (e) {
        logger.error(`Ошибка при подключении к базе данных: ${e.message}`);
        console.log("Ошибка при подключении к бд\n", e);
    }
};

startUserServer();

const startAdminServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        logger.info('Подключение к базе данных успешно установлено');

        http.createServer(appAdmin).listen(HTTP_PORT_ADMIN, '0.0.0.0', () => { // Заменили https на http
            logger.info(`Админский HTTP сервер запущен на порту ${HTTP_PORT_ADMIN}`);
            console.log(`Админский HTTP сервер запущен на порту ${HTTP_PORT_ADMIN}`);
        });
    } catch (e) {
        logger.error(`Ошибка при подключении к базе данных: ${e.message}`);
        console.log("Ошибка при подключении к бд\n", e);
    }
};

startAdminServer();