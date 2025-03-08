const Router = require('express')
const router = new Router()
const adminController = require('../../controllers/adminController')
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware')
const blacklistRouter = require('./blacklistRouter')
const supportController = require('../../controllers/supportController')
const adminUserController = require('../../controllers/adminUserController')

router.post('/auth/login', adminController.loginAdmin)
router.get('/auth/check', adminAuthMiddleware, adminController.checkAdmin)

router.post('/createAdmin', adminAuthMiddleware, adminController.createAdmin)
router.post('/updateAdmin', adminAuthMiddleware, adminController.editAdminSelfFromToken)

router.use('/blacklist', blacklistRouter)

router.get('/support/getAllAppeal', adminAuthMiddleware, supportController.getAll)
router.post('/support/sendResponseToSupport', adminAuthMiddleware, supportController.sendResponseToSupport)

router.get('/user/getAllUsers', adminAuthMiddleware, adminUserController.getAllStudents)
router.get('/user/getAllTeacher', adminAuthMiddleware, adminUserController.getAllTeacher)
router.post('/user/editUserByID', adminAuthMiddleware, adminUserController.editUserByID)

module.exports = router