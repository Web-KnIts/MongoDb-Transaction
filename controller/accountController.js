const Account = require('../Db/schema');
const verifyReq = require('../middleware/verifyToken');
const mongoose = require('mongoose');


const getBalance = async(req,res)=>{
    try{
        const account = await Account.findById(req.user_id);
        if(!account)
        {
            return res.status(404).send({message:"user does not have account"});
        }
        return res.status(200).send({message:"Balance Fetched",balance:account.balance})
    }
    catch(err)
    {
        return res.status(500).send({message:"internal server error"});
    }
}


const transferFund = async(req,res)=>{
    const session  = await mongoose.startSession();
    try{
        session.startTransaction();
        const {toAccountId,amount} = req.body;
        const myAccount = await Account.findOne({userId:req.user_id}).session(session);

        if(!myAccount || myAccount.balance < amount || amount <= 0)
        {
            session.abortTransaction();
            return res.status(422).send({message:"Insufficient Funds"});
        }

        const toAccount = await Account.findOne({userId:toAccountId}).session(session);
        if(!toAccount)
        {
            session.abortTransaction();
            return res.status(422).send({message:"Receivers account not found"});
        }
        await Account.updateOne(
            {userId:req.user_id},
            {$inc:{balance:-amount}},
        ).session(session);
        await Account.updateOne(
            {userId:toAccountId},
            {$inc:{balance:amount}}
        ).session(session)

        session.commitTransaction();
        return res.status(200).send({message:"funds transfered"});
    }
    catch(err)
    {
        session.abortTransaction();
        return res.status(500).send({message:"faild to transfer"})
    }
    finally{
        session.endSession();
    }
}

export {transferFund,getBalance}