const bcrypt = require('bcryptjs');
const constants = require("../utils/constants");
const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
const authConfig = require("../configs/auth.config");
/**
 * controller for signup/registration
 */
exports.signup = async(req, res) => {

    //userStatus: APPROVED | PENDING |REJECTED
    /**
     * userType: customer,userstatus:approved
     * usertype:engineer,userstatus:pending
     */
    var userStatus = req.body.userStatus;
    if (!req.body.userStatus) {
        if (!req.body.userType || req.body.userType == constants.userTypes.customer) {
            userStatus = constants.userStatus.approved;
        } else {
            userStatus = constants.userStatus.pending;
        }
    }
    const userObjToBeStoredInDB = {
        name: req.body.name,
        userId: req.body.userId,
        email: req.body.email,
        userType: req.body.userType,
        password: bcrypt.hashSync(req.body.password, 8),
        userStatus: userStatus
    }

    /**
     * insert this new user to the db
     */
    try {
        const userCreated = await User.create(userObjToBeStoredInDB);
        console.log("user created", userCreated);

        /**
         * return the response
         */
        const userCreationResponse = {
            name: userCreated.name,
            userId: userCreated.userId,
            email: userCreated.email,
            userType: userCreated.userType,
            userStatus: userCreated.userStatus,
            createdAt: userCreated.createdAt,
            updatedAt: userCreated.updatedAt
        }
        res.status(201).send(userCreationResponse);
    } catch (err) {
        console.log("Error while creating new user", err.message);
        res.status(500).send({
            message: "some internal error while inserting new user"
        })
    }

}

/**
 * controller for signin
 */

exports.signin = async(req, res) => {
    //search the user if it exists
    try {
        var user = await User.findOne({ userId: req.body.userId });
    } catch (err) {
        console.log("Error in signing", err.message);
    }

    if (user == null) {
        return res.status(400).send({
            message: "Failed ! user id doesn't exist"
        });
    }
    /**
     * check if the user is approved or not
     */
    if (user.userStatus != constants.userStatus.approved) {
        return res.status(200).send({
            message: "can't allow the login as the user is still not approved"
        })
    }

    //user is existing , so now we will do the password matching
    const isPasswordValid = bcrypt.compareSync(req.body.password, user.password);
    if (!isPasswordValid) {
        return res.status(401).send({
            message: "Invalid Password"
        });
    }
    /**
     * successfully login
     * 
     * i need to generate access token now
     */
    const token = jwt.sign({ id: user.userId }, authConfig.secret, {
        expiresIn: 600
    });
    //send the response
    res.status(200).send({
        name: user.name,
        userId: user.userId,
        email: user.email,
        userType: user.userType,
        userStatus: user.userStatus,
        accessToken: token
    });

};