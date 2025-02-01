require('dotenv').config()
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const { User,Account } = require("../Db/schema");

const signinSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const updateSchema = z.object({
    password:z.string().min(6).optional(),
    firstname:z.string().optional(),
    lastname:z.string().optional()
})

const generateJwt = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const createUser = async (req, res) => {
  const { email, firstname, password, lastname } = req.body;
  if (!email || !firstname || !password || !lastname) {
    return res.status(400).send({ message: "Some fields are empty" });
  }
  try {
    const { success } = signinSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).send({ message: "Incorrect Inputs!" });
    }
    const isUserAlreadyPresent = await User.findOne({ email: email });
    if (isUserAlreadyPresent) {
      return res.status(411).send({ message: "Email taken" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);
    const createdUser = await User.create({
      email: email,
      password: hashPass,
      firstname: firstname,
      lastname: lastname,
    });

    const accountOpened = await Account.create({ userId: createdUser._id });
    const token = await generateJwt({ id: createdUser._id, email: createdUser.email });

    res.cookie('token', token, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.status(200).send({
      message: "User Created",
      user: `${createdUser.firstname} ${createdUser.lastname}`,
      balance: accountOpened.balance,
    });

  } catch (error) {
    return res.status(500).send({ message: "Error signing up!", error: error.message });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send({ message: "Some fields are empty" });
  }
  try {
    const { success } = loginSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).send({ message: "Incorrect Inputs!" });
    }
    const isUserAlreadyPresent = await User.findOne({
      email: email,
    });
    if (!isUserAlreadyPresent) {
      return res.status(400).send({ message: "User not found" });
    }
    const passwordMatched = await bcrypt.compare(
      password,
      isUserAlreadyPresent.password
    );
    if (!passwordMatched) {
      return res.status(400).send({ message: "wrong password" });
    }
    const account = await Account.findOne({ userId: isUserAlreadyPresent._id });
    if (!account) {
      return res.status(404).send({ message: "Account not found" });
    }
    const token = generateJwt({id:isUserAlreadyPresent._id,email:isUserAlreadyPresent.email})
    res.cookie('token',token,{
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      return res.status(200).send({
        username: `${isUserAlreadyPresent.firstname} ${isUserAlreadyPresent.lastname}`,
        balance: account.balance,
        token
      });
  } catch (error) {
    return res.status(500).send({ message: "Error log in!", error: error });
  }
};

const logoutUser = async(req,res)=>{
    try{
        res.clearCookie("token");
        return res.status(200).send({message:"Logged Out"})
    }
    catch(error)
    {
        return res.status(500).send({ message: "Error logging out!", error });
    }
}


const updateUser = async(req,res) =>{
    try{
        const {success} = updateSchema.safeParse(req.body);
        if(!success)
        {
            return res.status(401).send({message:"invalid data"});
        }
        await User.findByIdAndUpdate(
            req.user_id,       
            req.body,          
            { new: true }   
          );
    }catch(err)
    {
        return res.status(403).send({message:"Faild to update user"})
    }
}

const regexSearch = async(req,res)=>{
  const item = req.query.filter || "";
  try
  {
    const users = await User.find({
      $or:[
        {firstname:{$regex:new RegExp(item,'i')}},
        {lastname:{$regex:new RegExp(item,'i')}},
      ],
      _id:{$ne:req._id}, // preventing the request user result
    }).select('firstname lastname email _id');
    return res.status(200).send({
      users: users
    });
  }catch(err)
  {
    return res.status(500).send({ message: "Error Searching Users!" });
  }
}
module.exports = {updateUser,logoutUser,loginUser,createUser,regexSearch}