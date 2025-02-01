const express = require('express');
const  verifyReq  = require('../middleware/verifyToken');
const { updateUser, logoutUser, loginUser, createUser } = require('../controller/userController');
const userRouter = express.Router();

userRouter.post('/signin',createUser);
userRouter.post('/login',loginUser);
userRouter.post('/logout',logoutUser);
userRouter.put('/update',verifyReq,updateUser);
userRouter.get('/user',(req,res)=>res.send('message'))
module.exports = userRouter;