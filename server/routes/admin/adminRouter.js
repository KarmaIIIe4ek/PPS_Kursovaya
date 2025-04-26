const Router = require('express')
const router = new Router()
const adminController = require('../../controllers/adminController')
const adminAuthMiddleware = require('../../middleware/adminAuthMiddleware')
const blacklistRouter = require('./blacklistRouter')
const supportController = require('../../controllers/supportController')
const adminUserController = require('../../controllers/adminUserController')
const taskController = require('../../controllers/taskController')
const purchaseController = require('../../controllers/purchaseController')

router.post('/auth/login', adminController.loginAdmin)
router.get('/auth/check', adminAuthMiddleware, adminController.checkAdmin)
router.get('/auth/getInfoAboutSelf', adminAuthMiddleware, adminController.getInfoAboutSelf)

router.use('/blacklist', blacklistRouter)

router.get('/support/getAllAppeal', adminAuthMiddleware, supportController.getAll)
router.post('/support/sendResponse', adminAuthMiddleware, supportController.sendResponseToSupport)

router.get('/user/getAll', adminAuthMiddleware, adminUserController.getAllStudents)
router.get('/user/getAllTeachers', adminAuthMiddleware, adminUserController.getAllTeacher)
router.post('/user/editUserByID', adminAuthMiddleware, adminUserController.editUserByID)

router.get('/task/getAll', adminAuthMiddleware, taskController.getAll)
router.post('/task/add', adminAuthMiddleware, taskController.add)
router.post('/task/changeAvailableById', adminAuthMiddleware, taskController.changeAvailableById)

router.get('/purchase/getAll', adminAuthMiddleware, purchaseController.getAll)
router.post('/purchase/changeIsPaidById', adminAuthMiddleware, purchaseController.changeIsPaidById)
router.post('/purchase/changeIsBlockedById', adminAuthMiddleware, purchaseController.changeIsBlockedById)

module.exports = router