require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const models = require('./models/models');
const userRoutes = require('./routes/user/index');
const adminRoutes = require('./routes/admin/adminRouter');
const https = require('https');
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

const HTTPS_PORT_USER = process.env.HTTPS_PORT_USER || 443; // Порт для HTTPS пользовательского сервера
const HTTPS_PORT_ADMIN = process.env.HTTPS_PORT_ADMIN || 444; // Порт для HTTPS админского сервера

const appUser = express();
const appAdmin = express(); // Приложение для админ-панели

appAdmin.use(cors());
appUser.use(cors());
appAdmin.use(express.json());
appUser.use(express.json());

// Загружаем SSL/TLS сертификаты
const options = {
    key: fs.readFileSync(path.join('./certificate', 'private.key')), // Приватный ключ
    cert: fs.readFileSync(path.join('./certificate', 'certificate.crt')) // Сертификат
};

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
appUser.use('/', userRoutes);
appAdmin.use('/', adminRoutes);

const startUserServer = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        logger.info('Подключение к базе данных успешно установлено');

        https.createServer(options, appUser).listen(HTTPS_PORT_USER, () => {
            logger.info(`Пользовательский HTTPS сервер запущен на порту ${HTTPS_PORT_USER}`);
            console.log(`Пользовательский HTTPS сервер запущен на порту ${HTTPS_PORT_USER}`);
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

        https.createServer(options, appAdmin).listen(HTTPS_PORT_ADMIN, () => {
            logger.info(`Админский HTTPS сервер запущен на порту ${HTTPS_PORT_ADMIN}`);
            console.log(`Админский HTTPS сервер запущен на порту ${HTTPS_PORT_ADMIN}`);
        });
    } catch (e) {
        logger.error(`Ошибка при подключении к базе данных: ${e.message}`);
        console.log("Ошибка при подключении к бд\n", e);
    }
};

startAdminServer();