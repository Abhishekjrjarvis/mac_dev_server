const InstituteAdmin = require("./models/InstituteAdmin");
const User = require("./models/User");
const jwt = require("jsonwebtoken");


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