const SubscriptionModel = require("../models/SubscriptionModel.js")

exports.accountState = (request, response, next) => {
    try {

        //find out if current user has a paid valid subscription
        //return appropriate response


    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "getTestPage failed" })
    }

}