const Router = require('express')
const router = new Router()
const adminController = require('../controllers/adminController')
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware')

router.post('/auth/login', adminController.loginAdmin)
router.get('/auth/check', adminAuthMiddleware, adminController.checkAdmin)

router.post('/create/admin', adminAuthMiddleware, adminController.createAdmin)

module.exports = router