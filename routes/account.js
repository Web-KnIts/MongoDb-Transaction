const express = require('express');
const { getBalance, transferFund } = require('../controller/accountController');
const verifyReq = require('../middleware/verifyToken');

const accountRouter = express.Router();

accountRouter.get('/balance', verifyReq, getBalance);
accountRouter.put('/transfer-fund', verifyReq, transferFund);

module.exports = accountRouter;
