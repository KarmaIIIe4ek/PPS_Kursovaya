const Router = require('express')
const router = new Router()

const authRouter = require('./authRouter')
const supportRouter = require('./supportRouter')
const teacherRouter = require('./teacherRouter')
const studentRouter = require('./studentRouter')

router.use('/auth', authRouter)
router.use('/support', supportRouter)
router.use('/teacher', teacherRouter)
router.use('/student', studentRouter)

module.exports = router