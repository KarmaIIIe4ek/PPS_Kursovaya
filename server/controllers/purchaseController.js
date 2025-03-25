const {Purchase} = require('../models/models')

class PurchaseController {
    async add(req, res, next) {
        const { price, payment_method } = req.body;
    
        try {
            // Проверка наличия price в запросе
            if (!price) {
                return res.status(400).json({ message: "price обязателен" });
            }

            // Проверка наличия payment_method в запросе
            if (!payment_method) {
                return res.status(400).json({ message: "payment_method обязателен" });
            }
    
            // Создание записи в черном списке
            const purchase = await Purchase.create({
                id_user: req.user.id,
                price: price,
                is_paid: false,
                payment_method: payment_method,
                created_date: new Date(),
                is_blocked: false,
                createdAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
                updatedAt: new Date(), // Sequelize автоматически добавляет это поле, но можно указать вручную
            });
    
            return res.json({
                message: "Заявка создана",
                id_purchase: purchase.id_purchase
            });
        } catch (e) {
            console.error('Ошибка при создании заявки на оплату:', e);
            return res.status(500).json({ message: "Произошла ошибка при создании заявки на оплату" });
        }
    }

    async confirm(req, res, next) {
        const { id_purchase } = req.body;
    
        try {
            // Проверка наличия id_purchase в запросе
            if (!id_purchase) {
                return res.status(400).json({ message: "id_purchase обязателен" });
            }
            // Поиск задания по id_task
            const purchase = await Purchase.findOne({ where: { id_purchase } });
    
            if (!purchase) {
                return res.status(404).json({ message: "Заявка с таким id не найдена" });
            }

            purchase.update({
                payment_date: new Date(),
                is_paid: true
            })

            return res.json({ message: "Покупка подтверждена" });
            
        } catch (e) {
            console.error('Ошибка при оплате покупки:', e);
            return res.status(500).json({ message: "Произошла ошибка при оплате покупки" });
        }
    }

    async changeIsPaidById(req, res, next) {
        const { id_purchase } = req.body;
    
        try {
            // Проверка наличия id_purchase в запросе
            if (!id_purchase) {
                return res.status(400).json({ message: "id_purchase обязателен" });
            }
            // Поиск задания по id_task
            const purchase = await Purchase.findOne({ where: { id_purchase } });
    
            if (!purchase) {
                return res.status(404).json({ message: "Заявка с таким id не найдена" });
            }

            purchase.update({
                is_paid: !purchase.is_paid
            })
            if (purchase.is_paid) {
                return res.json({ message: "Статус изменён на 'Оплачено'" });
            } else {
                return res.json({ message: "Статус изменён на 'Не оплачено'" });
            }
            
        } catch (e) {
            console.error('Ошибка при изменении статуса оплаты:', e);
            return res.status(500).json({ message: "Произошла ошибка при изменении статуса оплаты" });
        }
    }

    async changeIsBlockedById(req, res, next) {
        const { id_purchase } = req.body;
    
        try {
            // Проверка наличия id_purchase в запросе
            if (!id_purchase) {
                return res.status(400).json({ message: "id_purchase обязателен" });
            }
            // Поиск
            const purchase = await Purchase.findOne({ where: { id_purchase } });
    
            if (!purchase) {
                return res.status(404).json({ message: "Заявка с таким id не найдена" });
            }

            purchase.update({
                is_blocked: !purchase.is_blocked
            })

            if (purchase.is_blocked) {
                return res.json({ message: "Статус изменён на 'Заблокирован'" });
            } else {
                return res.json({ message: "Статус изменён на 'Разблокирован'" });
            }
            
        } catch (e) {
            console.error('Ошибка при изменении статуса блокировки оплаты:', e);
            return res.status(500).json({ message: "Произошла ошибка при изменении статуса блокировки оплаты" });
        }
    }

    async getAll(req, res, next) {
        try {
            // Получаем все записи
            const purchases = await Purchase.findAll({
                order: [['id_purchase', 'ASC']]
            });
    
            // Форматируем ответ, чтобы включить только нужные данные
            const formattedPurchases = purchases.map(purchase => {
                return {
                    id_purchase: purchase.id_purchase,
                    id_user: purchase.id_user,
                    price: purchase.price,
                    is_paid: purchase.is_paid,
                    payment_method: purchase.payment_method,
                    created_date: purchase.created_date,
                    is_blocked: purchase.is_blocked,
                };
            });
    
            return res.json(formattedPurchases);
        } catch (e) {
            console.error('Ошибка при получении данных из списка покупок:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении списка покупок" });
        }
    }

    async getAllMy(req, res, next) {
        try {
            // Получаем все записи
            const purchases = await Purchase.findAll({
                where: {id_user: req.user.id},
                order: [['id_purchase', 'ASC']]
            });

            // Форматируем ответ, чтобы включить только нужные данные
            const formattedPurchases = purchases.map(purchase => {
                return {
                    id_purchase: purchase.id_task,
                    id_user: purchase.id_user,
                    price: purchase.price,
                    is_paid: purchase.is_paid,
                    payment_method: purchase.payment_method,
                    created_date: purchase.created_date,
                    is_blocked: purchase.is_blocked,
                };
            });
    
            return res.json(formattedPurchases);
        } catch (e) {
            console.error('Ошибка при получении данных из списка покупок:', e);
            return res.status(500).json({ message: "Произошла ошибка при получении списка покупок" });
        }
    }

}

module.exports = new PurchaseController()