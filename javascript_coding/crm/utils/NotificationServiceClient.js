/**
 * Logic to make a POST call to the notification service
 * 
 */



const Client = require("node-rest-client").Client;

const client = new Client();


/**
 * Expose a function which will take the following information:
 * 
 * subject,
 * content,
 * recepientEmails,
 * requester,
 * ticketId
 * 
 * and then make a POST call
 */

module.exports = (ticketId, subject, content, emailIds, requester) => {
    /**
     * POST call
     *   -URI : 127.0.0.1:7777/notifServ/api/v1/notifications
     *   -HTTP verb:POST
     *   - Request Body
     *   - Headers
     */

    // Request body

    const reqBody = {
        subject: subject,
        content: content,
        recepientEmails: emailIds,
        requester: requester,
        ticketId: ticketId
    };

    const headers = {
        "Content-Type": "application/json"
    }

    const args = {
        data: reqBody,
        headers: headers
    }

    var req = client.post("http://127.0.0.1:7777/notifServ/api/v1/notifications", args, (data, response) => {
        console.log("Request sent");
        console.log(data);
    });

    /**
     * check for the error
     */

    req.on('requestTimeout', function(req) {
        console.log('rrequest has expired');
        req.abort();
    });

    req.on('responseTimeout', function(res) {
        console.log('response has expired');
    });

    req.on('error', function(err) {
        console.log('request error', err);
    });
}