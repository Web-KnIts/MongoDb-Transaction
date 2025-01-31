const express = require('express');
const  router  = require('./routes');
const userRouter = require('./routes/user');
const cookie = require('cookie-parser')
const app = express()

app.use(express.json());
app.use(cookie());
app.use('/api/v1',router)
app.listen(4000,()=>console.log("Server Listned at Port : ", 4000));