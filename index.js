const express = require('express');
const  router  = require('./routes');
const cookie = require('cookie-parser');
const connectToDb = require('./Db/Db');
const app = express()

app.use(express.json());
app.use(cookie());
app.use('/api/v1',router)
connectToDb();
app.listen(4000,()=>console.log("Server Listned at Port : ", 4000));