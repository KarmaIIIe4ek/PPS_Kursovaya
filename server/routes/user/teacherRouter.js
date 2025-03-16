const Router = require('express')
const router = new Router()
const authMiddleware = require('../../middleware/authMiddleware')
const checkRoleMiddleware = require('../../middleware/checkRoleMiddleware')
const groupController = require('../../controllers/groupController')

router.post('/group/create', authMiddleware, checkRoleMiddleware('teacher'), groupController.create)
router.post('/group/deleteById', authMiddleware, checkRoleMiddleware('teacher'), groupController.deleteById)
router.get('/group/getAllMyGroups', authMiddleware, checkRoleMiddleware('teacher'), groupController.getAllMyGroups)
router.post('/group/addUserToGroup', authMiddleware, checkRoleMiddleware('teacher'), groupController.addUserToGroup)
router.post('/group/grantRightsToGroup', authMiddleware, checkRoleMiddleware('teacher'), groupController.grantRightsToGroup)
router.post('/group/changeIsOpenById', authMiddleware, checkRoleMiddleware('teacher'), groupController.changeIsOpenById)
router.get('/group/getAllMyAccess', authMiddleware, checkRoleMiddleware('teacher'), groupController.getAllMyAccess)

module.exports = router