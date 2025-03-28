const Router = require('express')
const router = new Router()
const authMiddleware = require('../../middleware/authMiddleware')
const groupController = require('../../controllers/groupController')
const studentController = require('../../controllers/studentController')

router.post('/group/addSelfToGroup', authMiddleware, groupController.addSelfToGroup)
router.post('/group/removeSelfFromGroup', authMiddleware, groupController.removeSelfFromGroup)

router.get('/task/getUserGroupsWithTasks', authMiddleware, studentController.getUserGroupsWithTasks)
router.post('/task/createUserTaskAttempt', authMiddleware, studentController.createUserTaskAttempt)

module.exports = router