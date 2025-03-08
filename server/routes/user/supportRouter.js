const Router = require('express')
const router = new Router()
const authMiddleware = require('../../middleware/authMiddleware')
const supportController = require('../../controllers/supportController')

router.post('/sendToSupport', authMiddleware, supportController.sendToSupport)
router.get('/getListMyAppeal', authMiddleware, supportController.getListMyAppeal)

module.exports = router