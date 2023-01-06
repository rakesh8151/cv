/**
 * this file will have all the logic to manipulate the user resource 
 */

const User = require("../models/user.model");
const objectConverter = require("../utils/objectConverter");


/**
 * fetch the of all user
 * only admin is allowed to call this method
 * Admin should be able to filter based on:
 * 1. Name
 * 2.userTpye
 * 3.userStatus
 */

exports.findAllUsers = async(req, res) => {

    /**
     * read the data from the querry param
     */
    const nameReq = req.query.name;
    const userStatusReq = req.query.userStatus;
    const userTypeReq = req.query.userType;

    const mongoQuerryObj = {}
    if (nameReq && userStatusReq && userTypeReq) {
        mongoQuerryObj.name = nameReq;
        mongoQuerryObj.userStatus = userStatusReq;
        mongoQuerryObj.userType = userTypeReq;
    } else if (userStatusReq && userTypeReq) {
        mongoQuerryObj.userStatus = userStatusReq;
        mongoQuerryObj.userType = userTypeReq;
    } else if (nameReq && userStatusReq) {
        mongoQuerryObj.name = nameReq;
        mongoQuerryObj.userStatus = userStatusReq;

    } else if (nameReq && userTypeReq) {
        mongoQuerryObj.name = nameReq;
        mongoQuerryObj.userType = userTypeReq;
    } else if (nameReq) {
        mongoQuerryObj.name = nameReq;
    } else if (userStatusReq) {
        mongoQuerryObj.userStatus = userStatusReq;
    } else if (userTypeReq) {
        mongoQuerryObj.userType = userTypeReq;
    }



    /**
     * fetch the user documents from the users collection
     */



    try {
        const user = await User.find(mongoQuerryObj);

        return res.status(200).send(objectConverter.userResponse(user)); //user password will also be returned in response
    } catch (err) {
        console.log(err.messsage);
        return res.status(500).send({
            messsage: "Internal error while fetching all users"
        })
    }
}


/**
 * fetch the user based on the userId
 */

exports.findUserById = async(req, res) => {
    const userIdReq = req.params.userId; // Reading from the request parameter
    const user = await User.find({ userId: userIdReq });
    if (user) {
        res.status(200).send(objectConverter.userResponse(user));
    } else {
        res.status(200).send({
            messsage: "user with id " + userIdReq + "doesn't exist"
        });
    }
}

/** 
 * update the user - status,userType
 * only admin should be allowed to do this
 * Admin - name,userStatus,userType
 */

exports.updateUser = async(req, res) => {
    /**
     * one of the ways of updating
     */
    try {
        const userIdReq = req.params.userId;

        const user = await User.findOneAndUpdate({
            userId: userIdReq
        }, {
            name: req.body.name,
            userStatus: req.body.userStatus,
            userType: req.body.userType,
            email: req.body.email

        }).exec();

        res.status(200).send({
            messsage: "User record successfully updated"
        })
    } catch (err) {
        console.log(err.messsage);
        res.status(500).send({
            messsage: "Interval server error while updating"
        });
    }


}