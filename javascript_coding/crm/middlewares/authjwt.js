 /**
  * Authentication
  *   -if the token passed is valid or no
  * 1. if no token is passed in the request header- not allowed
  * 2.if token is passed:Authenticated
  *      if correct allow ,else reject
  *  
  */
 const jwt = require('jsonwebtoken');
 const config = require("..//configs/auth.config");
 const User = require("../models/user.model");
 const constants = require("../utils/constants");

 verifyToken = (req, res, next) => {
     /**
      * read the token from the header
      */
     const token = req.headers['x-access-token'];
     if (!token) {
         return res.status(403).send({
             message: "No token provided"
         });
     }
     //if the token was provided ,we need to verify it
     jwt.verify(token, config.secret, (err, decoded) => {
         if (err) {
             return res.status(401).send({
                 message: "Unauthorised"
             });
         }
         // I will try to read the userId from the decoded token and store it in req object
         req.userId = decoded.id;
         next();
     })
 };


 /**
  * if the passed access token is of ADMIN or not
  * 
  */

 isAdmin = async(req, res, next) => {
     /**
      * fetch user from the db using userId
      */

     const user = await User.findOne({ userId: req.userId });
     if (user && user.userType == constants.userTypes.admin) {
         next();
     } else {
         res.status(403).send({
             message: "Requires Admin role"
         });
     }
 }


 const authJwt = {
     verifyToken: verifyToken,
     isAdmin: isAdmin
 };
 module.exports = authJwt;