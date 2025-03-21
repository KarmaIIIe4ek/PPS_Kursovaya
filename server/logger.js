const fs = require('fs');
const path = require('path');
const winston = require('winston');
const morgan = require('morgan');

// Папки для логов и архива
const logDirectory = path.join(__dirname, 'logs');
const archiveDirectory = path.join(__dirname, 'logs-archive');

// Создаем папки, если они не существуют
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}
if (!fs.existsSync(archiveDirectory)) {
    fs.mkdirSync(archiveDirectory, { recursive: true });
}

// Настройка Winston для записи логов в файл
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logDirectory, 'app.log') }),
        new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' })
    ]
});

// Логирование ошибок в консоль (для удобства разработки)
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Функция для перемещения старых логов в новую директорию
const moveOldLogs = () => {
    const logs = fs.readdirSync(logDirectory);
    if (logs.length === 0) return;

    // Создаем новую директорию для старых логов
    const newArchiveDir = path.join(archiveDirectory, `logs-${new Date().toISOString().replace(/[:.]/g, '-')}`);
    fs.mkdirSync(newArchiveDir, { recursive: true });

    // Перемещаем старые логи в новую директорию
    logs.forEach((logFile) => {
        const oldPath = path.join(logDirectory, logFile);
        const newPath = path.join(newArchiveDir, logFile);
        fs.renameSync(oldPath, newPath);
    });

    console.log(`Старые логи перемещены в ${newArchiveDir}`);
    logger.info(`Старые логи перемещены в ${newArchiveDir}`);
};

// Middleware для захвата тела запроса
const captureRequestBody = (req, res, next) => {
    // Используем req.body, который уже был распарсен express.json()
    if (req.body) {
        req.parsedBody = req.body; // Сохраняем тело запроса в req.parsedBody
    } else {
        req.parsedBody = ''; // Если тело запроса отсутствует, сохраняем пустую строку
    }
    next();
};

// Middleware для захвата тела ответа
const captureResponseBody = (req, res, next) => {
    const originalSend = res.send;
    let responseBody = '';
    res.send = function (body) {
        responseBody = body; // Сохраняем тело ответа
        return originalSend.call(this, body);
    };
    res.on('finish', () => {
        req.responseBody = responseBody; // Сохраняем тело ответа в req
    });
    next();
};

// Кастомный токен для заголовков запроса
morgan.token('headers', (req) => {
    return JSON.stringify(req.headers, null, 2); // Форматируем заголовки как JSON
});

// Кастомный токен для хоста и порта
morgan.token('host-port', (req) => {
    return `${req.headers.host}`; // Хост и порт из заголовков
});

// Кастомный формат для morgan
morgan.token('request-body', (req) => {
    if (req.parsedBody && typeof req.parsedBody === 'object') {
        return JSON.stringify(req.parsedBody, null, 2); // Форматируем JSON
    }
    return req.parsedBody || ''; // Возвращаем строку, если это не объект
});

morgan.token('response-body', (req) => {
    if (req.responseBody && typeof req.responseBody === 'object') {
        return JSON.stringify(req.responseBody, null, 2); // Форматируем JSON
    }
    return req.responseBody || ''; // Возвращаем строку, если это не объект
});

const customFormat = ':method :url :status :response-time ms\nHost: :host-port\nHeaders: :headers\nRequest Body: :request-body\nResponse Body: :response-body\n';

// Настройка Morgan для записи HTTP-логов в файл
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });
const morganMiddleware = morgan(customFormat, { stream: accessLogStream });

// Экспортируем всё, что нужно
module.exports = {
    logger,
    moveOldLogs,
    captureRequestBody,
    captureResponseBody,
    morganMiddleware
};