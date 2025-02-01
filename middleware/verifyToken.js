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
        const verifyUser = await User.findById(payload.id);
        console.log(verifyUser);
        if(!verifyUser)
        {
            return res.status(401).json({
                message:"You are not authorized"
            })
         
        }
        req.user_id = verifyUser._id;
       return next(); 
    }
    catch(err)
    {
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      
      // Catch other types of errors
      return res.status(500).send({ message: 'Something went wrong!', error: err.message });
    }
}
module.exports = verifyReq