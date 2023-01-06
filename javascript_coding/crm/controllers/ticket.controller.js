/**
 * create a ticket 
 * v1 - Any one should be able to create the ticket
 */
const User = require("../models/user.model");
const constants = require("../utils/constants");
const Ticket = require("../models/ticket.model");
const objectConverter = require("../utils/objectConverter");
const notificationServiceClient = require("../utils/NotificationServiceClient");
exports.createTicket = async(req, res) => {
    // logic to create the ticket
    const ticketObj = {
            title: req.body.title,
            ticketPriority: req.body.ticketPriority,
            description: req.body.description
        }
        /**
         * if any engineer  is available 
         */
    try {
        const engineer = await User.findOne({
            userType: constants.userTypes.enginner,
            userStatus: constants.userStatus.approved
        });
        if (engineer != null) {
            ticketObj.assignee = engineer.userId;

        }
        const ticket = await Ticket.create(ticketObj);

        /**
         * Ticket is created now 
         * 1. we should update the customer and engineer document
         *
         */

        /**
         * find out the customer
         */
        if (ticket) {
            const user = await User.findOne({
                userId: req.userId
            })
            user.ticketsCreated.push(ticket._id);
            await user.save();

            /**
             * update the engineer
             */
            engineer.ticketAssigned.push(ticket._id);
            await engineer.save();

            /**
             * Right place to send the email
             * 
             * call the notificationService to send the email
             * 
             * I need to have a client to call the external service
             * 
             */

            notificationServiceClient(ticket._id, "Created new ticket :" + ticket._id, ticket.description, user.email + "," + engineer.email, user.email);

            return res.status(201).send(objectConverter.ticketResponse(ticket));
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).send({
            message: "Some internal error"
        });
    }
}

/**
 * api to fetch all tickets
 *  allow the user to filter based on state
 * 
 * Extension:
 * using querry param ,allow the users to
 * filter the list of tickets based on status
 * 
 * depending of the user i need to return different list of tickets:
 * 1. ADMIN - return all the tickets
 * 2. ENGINEER -all the tickets created or assigned to him/her
 * 3. CUSTOMER- all the tickets created by him/her
 */

exports.getAllTickets = async(req, res) => {

    /**
     * i want to get the list of all the tickets
     */
    const queryObj = {};
    if (req.query.status != undefined) {
        queryObj.status = req.query.status;
    }
    const user = await User.findOne({ userId: req.userId });

    if (user.userType == constants.userTypes.admin) {
        //return all the tickets
        //no need to change anything queryObj 
    } else if (user.userType == constants.userTypes.customer) {
        if (user.ticketsCreated == null || user.ticketsCreated.length == 0) {
            return res.status(200).send({
                message: "No tickets created by you !"
            });
        }
        queryObj._id = {
            $in: user.ticketsCreated //array of tickets id 
        };

    } else {
        //User is of type of engineer
        queryObj._id = {
            $in: user.ticketsCreated //array of tickets id 
        };
        //all the tickets where i am the assignee
        queryObj.assignee = req.userId;

    }


    /**
     * i need to get all the ticket ids from 
     */
    /**const tickets = [];
    var count = 0;
    user.ticketsCreated.forEach(async t => {

        tickets.push(await Ticket.findOne({ _id: t }));
        count++;
        if (count >= user.ticketsCreated.length) {
            res.status(200).send(objectConverter.ticketListResponse(tickets));
        }
    });**/
    //const querryObj = { reporter: req.userId };
    //const tickets = await Ticket.find(querryObj);


    const tickets = await Ticket.find(queryObj);
    res.status(200).send(objectConverter.ticketListResponse(tickets));

}

/**
 * controller to fetch ticket based on id
 */

exports.getOneTicket = async(req, res) => {
    const ticket = await Ticket.findOne({
        _id: req.params.id
    });
    res.status(200).send(objectConverter.ticketResponse(ticket));
}

/**
 * write the controller to update the ticket
 * 
 * move all the validations  to the middleware layer
 */

exports.updateTicket = async(req, res) => {
    // check if the ticket exists
    const ticket = await Ticket.findOne({
        _id: req.params.id
    });
    if (ticket == null) {
        return res.status(200).send({
            message: "Ticket doesn't exist"
        });
    }
    /**
     * only the ticket request be allowed to update the ticket
     */
    const user = await User.findOne({
        userId: req.userId
    });
    /**
     * only checking for the user who has created the ticket
     * 
     * 1.Admin
     * 2.Enginner
     */

    /**
     * if ticket is not assigned to any engineer ,any engineer 
     * can self asssign themselves the given ticket
     */

    if (ticket.assignee == undefined) {
        ticket.assignee = req.userId;
    }

    if ((user.ticketsCreated == undefined || !user.ticketsCreated.includes(req.params.id)) && !(user.userType == constants.userTypes.admin) && !(ticket.assignee == req.userId)) {
        return res.status(403).send({
            message: "Only owner of the ticket/engineer/admin is allowed to update"
        });
    }

    //update the attribute of the saved ticket
    ticket.title = req.body.title != undefined ? req.body.title : ticket.title;
    ticket.description = req.body.description != undefined ? req.body.description : ticket.description;
    ticket.ticketPriority = req.body.ticketPriority != undefined ? req.body.ticketPriority : ticket.ticketPriority;
    ticket.status = req.body.status != undefined ? req.body.status : ticket.status;

    //ability to re-assign the ticket 
    if (user.userType == constants.userTypes.admin) {
        ticket.assignee = req.body.assignee != undefined ? req.body.assignee : ticket.assignee;
    }
    //saved the changed ticket 

    const updatedTicket = await ticket.save();
    //return the updated ticket
    const engineer = await User.findOne({ userId: ticket.assignee });
    if (user.userType == constants.userTypes.customer) {

        notificationServiceClient(ticket._id, "Updated a ticket  :" + ticket._id, ticket.description, user.email + "," + engineer.email, user.email);
    } else if (user.userType == constants.userTypes.enginner) {
        const customers = await User.find({ userType: constants.userTypes.customer });
        customers.forEach((customer) => {
            const customeremail = customer.email;
            const customerTickets = customer.ticketsCreated;
            console.log(customeremail);
            console.log(user.email);
            if (customerTickets.includes(ticket._id)) {
                notificationServiceClient(ticket._id, "updated a ticket  :" + ticket._id, ticket.description, user.email + "," + customeremail, user.email);
            }

        });
    } else if (user.userType == constants.userTypes.admin) {
        //const customer = await User.findOne({ userId: ticket.reporter });  reporter field is empty
        // console.log(customer.userId);
        const customers = await User.find({ userType: constants.userTypes.customer });
        customers.forEach((customer) => {
            const customeremail = customer.email;
            const customerTickets = customer.ticketsCreated;
            if (customerTickets.includes(ticket._id)) {
                notificationServiceClient(ticket._id, "updated a ticket  :" + ticket._id, ticket.description, user.email + "," + engineer.email + "," + customeremail, user.email);
            }

        });

    }
    return res.status(200).send(objectConverter.ticketResponse(updatedTicket));

}