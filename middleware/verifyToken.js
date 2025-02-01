const jwt = require('jsonwebtoken');
const {User} = require('../Db/schema');

 const verifyReq = async(req,res,next)=>{
    const header = req.headers.authorization;
    if (!header) {
        return res.status(403).json({ message: 'Authorization header is missing' });
    }
    const splitHeader = header.split(" ");
    var token;
    if(splitHeader[0].toLowerCase() === 'bearer')
    {
        token = splitHeader[1];
    }
    if (!token) {
        return res.status(403).json({ message: 'Token is missing' });
    }
    try
    {
        const payload = jwt.verify(token,process.env.JWT_SECRET);
        const verifyUser = await User.findByID(payload._id);
        if(verifyUser)
        {
           req.user_id = verifyUser._id;
           next(); 
        }

        return res.status(401).json({
            message:"You are not authorized"
        })
    }
    catch(err)
    {
        return res.status(500).send({ message: "Something went wrong!" });
  }

}
module.exports = verifyReq