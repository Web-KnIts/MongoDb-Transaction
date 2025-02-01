const express = require('express');
const userRouter = require('./user');
const accountRouter = require('./account');

const router = express.Router();

router.use('/account',accountRouter)
router.use('/',userRouter)


module.exports = router;