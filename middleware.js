const InstituteAdmin = require("./models/InstituteAdmin");
const User = require("./models/User");
const jwt = require("jsonwebtoken");
const { decryptKey } = require('./Utilities/Encrypt/payload')
const rateLimit = require('express-rate-limit')


module.exports.isApproved = async (req, res, next) => {
  const { id } = req.params;
  const institute = await InstituteAdmin.findById({ _id: id });
  if (institute.status === "Not Approved") {
    res
      .status(200)
      .send({ message: "Your Institute will not approved by super admin" });
  }
  next();
};


module.exports.isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, `${process.env.TOKEN_SECRET}`, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.tokenData = decoded;
    // console.log(req.tokenData)
    next();
  });
}


module.exports.isValidKey = async(req, res, next) =>{
  try{
    const key = req.headers["statickey"]
    // const d_key = decryptKey(key)
    if(`${key}` === `${process.env.STATICKEY}`){
      next()
    }
    else{
      res.status(401).send({ message: 'No Access'})
    }
  }
  catch(e){
    console.log(e)
  }
}


module.exports.isLimit = rateLimit({
  max: 5,
  windowMs: 10000
})