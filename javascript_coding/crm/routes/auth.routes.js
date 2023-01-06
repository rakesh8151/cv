/**
 * this file will act as the route for authentication and authorization
 */

//define the routes - REST endpoints for user registartion
const authController = require("../controllers/auth.controller");
const { verifySignUp } = require("../middlewares");

module.exports = (app) => {
    //POST 127.0.0.1:8080/crm/api/v1/auth/signup
    app.post("/crm/api/v1/auth/signup", [verifySignUp.validateSignUpRequest], authController.signup);

    //POST 127.0.0.1:8080/crm/api/v1/auth/signin
    app.post("/crm/api/v1/auth/signin", authController.signin);

}