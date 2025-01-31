import { getBalance, transferFund } from '../controller/accountController';

const express = require('express')
const verifyReq = require('../middleware/verifyToken');

export const accountRouter = express.Router();

accountRouter.get('/balance',verifyReq,getBalance)
accountRouter.put('/transfer-fund',verifyReq,transferFund);
