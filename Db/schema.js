const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: [6, "password must have 6 char atleast"],
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minLength: 3,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minLength: 3,
  },
}
);

const accountSchema = mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true,
  },
  balance:{
    type:Number,
    required:true,
    default:5000
  }
})
const User = mongoose.model("User", userSchema);
const Account = mongoose.model("Account",accountSchema)
module.exports =  {User,Account}