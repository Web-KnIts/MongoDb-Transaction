const {Account} = require('../Db/schema');
const mongoose = require('mongoose');


const getBalance = async(req,res)=>{
    try{
        const account = await Account.findOne({userId:req.user_id});
        console.log(account)
        if(!account)
        {
            return res.status(404).send({message:"user does not have account"});
        }
        return res.status(200).send({message:"Balance Fetched",balance:account.balance})
    }
    catch(err)
    {
        console.log(err)
        return res.status(500).send({message:"internal server error"});
    }
}


// const transferFund = async (req, res) => {
//     const session = await mongoose.startSession();
//     try {
//         // Start the transaction
//         session.startTransaction();

//         const { toAccountId, amount } = req.body;

//         // Ensure valid inputs
//         if (amount <= 0) {
//             return res.status(422).send({ message: "Amount must be greater than zero" });
//         }

//         // Fetch the sender's account
//         const myAccount = await Account.findOne({ userId: req.user_id }).session(session);
//         console.log('My Account: ', myAccount);
//         if (!myAccount || myAccount.balance < amount) {
//             // Abort transaction if insufficient funds
//             await session.abortTransaction();
//             return res.status(422).send({ message: "Insufficient funds" });
//         }

//         // Fetch the receiver's account
//         const toAccount = await Account.findOne({ userId: toAccountId }).session(session);
//         console.log("To Account: ", toAccount);
//         if (!toAccount) {
//             // Abort transaction if receiver's account not found
//             await session.abortTransaction();
//             return res.status(422).send({ message: "Receiver's account not found" });
//         }

//         // Update sender's account (decrease balance)
//         await Account.updateOne(
//             { userId: req.user_id },
//             { $inc: { balance: -amount } }
//         ).session(session);

//         // Update receiver's account (increase balance)
//         await Account.updateOne(
//             { userId: toAccountId },
//             { $inc: { balance: amount } }
//         ).session(session);

//         // Commit the transaction only if no issues have been encountered
//         await session.commitTransaction();

//         // Respond with success
//         return res.status(200).send({ message: "Funds transferred successfully" });

//     } catch (err) {
//         console.log(err);
//         // If any error occurs, abort the transaction
//         await session.abortTransaction();
//         return res.status(500).send({ message: "Failed to transfer funds" });
//     } finally {
//         // End the session
//         session.endSession();
//     }
// };


const transferFund = async(req,res)=>{
    const session  = await mongoose.startSession();
    try{
        session.startTransaction();
        const {toAccountId,amount} = req.body;
        const myAccount = await Account.findOne({userId:req.user_id}).session(session);
        console.log('my -> ',myAccount)
        if(req.user_id === toAccountId)
        {
            return res.status(404).send({message:"Cannot transfer yourself"})
        }
        if(!myAccount || myAccount.balance < amount || amount <= 0)
        {
            await session.abortTransaction();
            return res.status(422).send({message:"Insufficient Funds"});
        }

        const toAccount = await Account.findOne({userId:toAccountId}).session(session);
        console.log("to ->",toAccount)
        if(!toAccount)
        {
           await session.abortTransaction();
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

        await session.commitTransaction();
        return res.status(200).send({message:"funds transfered"});
    }
    catch(err)
    {
        console.log(err);
       await session.abortTransaction();
        return res.status(500).send({message:"faild to transfer"})
    }
    finally{
        await session.endSession();
    }
}

module.exports = {transferFund,getBalance}