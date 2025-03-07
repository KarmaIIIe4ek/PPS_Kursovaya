const Router = require('express')
const router = new Router()
const blacklistController = require('../controllers/blacklistController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/sendToSupport', authMiddleware, blacklistController.addToBlacklist)
router.get('/getListMyAppeal', authMiddleware, blacklistController.removeFromBlacklist)

module.exports = router