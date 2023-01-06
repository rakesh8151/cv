const express = require("express");
const serverConfig = require("./configs/server.config");
const mongoose = require("mongoose");
const dbConfig = require("./configs/db.config");
const bodyParser = require("body-parser");
const User = require("./models/user.model");
const bcrypt = require("bcryptjs");
const constants = require("./utils/constants");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * setup the mongodb connection and create on admin user
 */
mongoose.connect(dbConfig.DB_URL, () => {
    console.log("MongoDB connected");
    //Initialization 
    init();
})

async function init() {
    //create the admin user
    var user = await User.findOne({ userId: "admin" });
    if (user) return;
    else {
        const user = await User.create({
            name: "Sumit Kumar",
            userId: "admin",
            email: "sumit@gmail.com",
            userType: constants.userTypes.admin,
            password: bcrypt.hashSync("sumit", 8)

        });
        console.log("Admin user is created");
    }
}

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/ticket.routes')(app);

/**
 * start the express server
 * Need to export it so that it can be 
 * used by supertest for initiating a request
 */

module.exports = app.listen(serverConfig.PORT, () => {
    console.log("Application has started on the port ", serverConfig.PORT);
});

// module.exports = app.listen(8081, () => {
//     console.log("Application has started on the port ", 8081);
// });