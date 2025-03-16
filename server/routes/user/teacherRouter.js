const Router = require('express')
const router = new Router()
const authMiddleware = require('../../middleware/authMiddleware')
const supportController = require('../../controllers/teacherController')
const checkRoleMiddleware = require('../../middleware/checkRoleMiddleware')
const groupController = require('../../controllers/groupController')

router.post('/group/create', authMiddleware, checkRoleMiddleware('teacher'), groupController.create)
router.get('/group/getAllMyGroups', authMiddleware, checkRoleMiddleware('teacher'), groupController.getAllMyGroups)
router.post('/group/addUserToGroup', authMiddleware, checkRoleMiddleware('teacher'), groupController.addUserToGroup)


module.exports = router