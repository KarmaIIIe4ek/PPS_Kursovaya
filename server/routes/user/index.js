const Router = require('express')
const router = new Router()

const authRouter = require('./authRouter')
const supportRouter = require('./supportRouter')
const teacherRouter = require('./teacherRouter')
//const studentRouter = require('./studentRouter')
//const teacherRouter = require('./teacherRouter')

router.use('/auth', authRouter)
router.use('/support', supportRouter)
router.use('/teacher', teacherRouter)
//router.use('/student', studentRouter)
//router.use('/teacher', teacherRouter)

module.exports = router