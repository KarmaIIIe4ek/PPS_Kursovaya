const {Task} = require('../models/models')

class TaskController {
    async add(req, res, next) {
        const { task_name, description } = req.body;
    
        try {
            // Проверка наличия email в запросе
            if (!task_name) {
                return res.status(400).json({ message: "task_name обязателен" });
            }
    
            // Поиск задания по заголовку
            const task = await Task.findOne({ where: { task_name } });
    
            if (task) {
                return res.status(404).json({ message: "Такое задание уже существует" });
            }
            
            // Создание записи в черном списке
            const newTask = await Task.create({
                is_available: false,
                task_name: task_name,
                description: description,
                createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                updatedAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
            });
    
            return res.json({
                message: "Задание добавлено",
                newTask: newTask.id_task
            });
        } catch (e) {
            console.error('Ошибка при добавлении задания:', e);
            return res.status(500).json({ message: "Произошла ошибка при добавлении задания" });
        }
    }

    async changeAvailableById(req, res, next) {
        const { id_task } = req.body;
    
        try {
            // Проверка наличия id_task в запросе
            if (!id_task) {
                return res.status(400).json({ message: "id_task обязателен" });
            }
            // Поиск задания по id_task
            const task = await Task.findOne({ where: { id_task } });
    
            if (!task) {
                return res.status(404).json({ message: "Задание с таким id не найдено" });
            }

            task.update({
                is_available: !task.is_available
            })
            if (task.is_available === false) {
                return res.json({ message: "Задание больше недоступно" });
            } else {
                return res.json({ message: "Задание теперь доступно" });
            }
            
        } catch (e) {
            console.error('Ошибка при изменении доступности задания:', e);
            return res.status(500).json({ message: "Произошла ошибка при изменении доступности задания" });
        }
    }

    async getAll(req, res, next) {
        try {
            // Получаем все записи
            const Tasks = await Task.findAll({
                order: [['id_task', 'ASC']]
            });
    
            // Форматируем ответ, чтобы включить только нужные данные
            const formattedTasks = Tasks.map(task => {
                return {
                    id_task: task.id_task,
                    is_available: task.is_available,
                    task_name: task.task_name,
                    description: task.description
                };
            });
    
            return res.json(formattedTasks);
        } catch (e) {
            console.error('Ошибка при получении данных из списка заданий:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении списка заданий" });
        }
    }

    async getAllAvailable(req, res, next) {
        try {
            // Получаем все записи
            const Tasks = await Task.findAll({
                where: {is_available: true},
                order: [['id_task', 'ASC']]
            });
            
            // Форматируем ответ, чтобы включить только нужные данные
            const formattedTasks = Tasks.map(task => {
                return {
                    id_task: task.id_task,
                    is_available: task.is_available,
                    task_name: task.task_name,
                    description: task.description
                };
            });
    
            return res.json(formattedTasks);
        } catch (e) {
            console.error('Ошибка при получении данных из списка доступных заданий:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении списка доступных заданий" });
        }
    }

}

module.exports = new TaskController()