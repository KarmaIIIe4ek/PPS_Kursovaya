const Router = require('express')
const router = new Router()
const blacklistController = require('../controllers/blacklistController')
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware')

router.post('/addToBlacklist', adminAuthMiddleware, blacklistController.addToBlacklist)
router.post('/removeFromBlacklist', adminAuthMiddleware, blacklistController.removeFromBlacklist)
router.get('/getAll', adminAuthMiddleware, blacklistController.getAll)

module.exports = router