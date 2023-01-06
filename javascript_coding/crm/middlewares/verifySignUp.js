/**
 * this file will contain the custom middleware for 
 * verifying the request body
 */
const User = require("../models/user.model");
const constants = require("../utils/constants");
validateSignupRequest = async(req, res, next) => {
    //validate if username exists
    if (!req.body.name) {
        return res.status(400).send({
            message: "Failed ! user name is not provided"
        })
    }
    //validate if userId exists
    if (!req.body.userId) {
        return res.status(400).send({
            message: "Failed ! user Id is not provided"
        })
    }
    /**
     * validate if the userId is already not present
     */
    const user = await User.findOne({ userId: req.body.userId });
    if (user != null) {
        return res.status(400).send({
            message: "Failed ! user Id is already exist"
        })
    }
    /**
     * similar validation for all other fields
     * email
     * password
     * userType
     */
    if (!req.body.email) {
        return res.status(400).send({
            message: "Failed ! user Email Id is not provided"
        })
    }

    const email = await User.findOne({ email: req.body.email });
    if (email != null) {
        return res.status(400).send({
            message: "Failed ! Email Id is already exists"
        })
    }

    if (!req.body.password) {
        return res.status(400).send({
            message: "Failed ! user password is not provided"
        })
    }

    const userType = req.body.userType;
    const userTypes = [constants.userTypes.admin, constants.userTypes.customer, constants.userTypes.enginner];

    if (userType && !userTypes.includes(userType)) {
        return res.status(400).send({
            message: "Failed ! userType is not  correctly provided"
        })
    }


    next(); //give the control to the controller

    /**
     * validate if the email id is in correct format: abc@xyz.com
     */
}

module.exports = {
    validateSignUpRequest: validateSignupRequest
}