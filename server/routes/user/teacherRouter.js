const Router = require('express')
const router = new Router()
const authMiddleware = require('../../middleware/authMiddleware')
const checkRoleMiddleware = require('../../middleware/checkRoleMiddleware')
const groupController = require('../../controllers/groupController')
const taskController = require('../../controllers/taskController')
const purchaseController = require('../../controllers/purchaseController')

router.post('/group/create', authMiddleware, checkRoleMiddleware('teacher'), groupController.create)
router.post('/group/deleteById', authMiddleware, checkRoleMiddleware('teacher'), groupController.deleteById)
router.get('/group/getAllMyGroups', authMiddleware, checkRoleMiddleware('teacher'), groupController.getAllMyGroups)
router.post('/group/addUserToGroup', authMiddleware, checkRoleMiddleware('teacher'), groupController.addUserToGroup)
router.post('/group/grantRightsToGroup', authMiddleware, checkRoleMiddleware('teacher'), groupController.grantRightsToGroup)
router.post('/group/changeIsOpenById', authMiddleware, checkRoleMiddleware('teacher'), groupController.changeIsOpenById)
router.get('/group/getAllMyAccess', authMiddleware, checkRoleMiddleware('teacher'), groupController.getAllMyAccess)

router.get('/tasks/getAllAvailable', authMiddleware, checkRoleMiddleware('teacher'), taskController.getAllAvailable)

router.post('/purchase/add', authMiddleware, checkRoleMiddleware('teacher'), purchaseController.add)
router.post('/purchase/confirm', authMiddleware, checkRoleMiddleware('teacher'), purchaseController.confirm)
router.get('/purchase/getAllMy', authMiddleware, checkRoleMiddleware('teacher'), purchaseController.getAllMy)

module.exports = router