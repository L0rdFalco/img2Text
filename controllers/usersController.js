const SubscriptionModel = require("../models/SubscriptionModel.js")

exports.accountState = async (request, response, next) => {
    try {
        const currUser = request.user.id

        console.log(currUser);

        const savedUser = await SubscriptionModel.findOne({ user: currUser })

        console.log(savedUser);

        //find out if current user has a paid valid subscription
        //return appropriate response

        if (savedUser) {

            response.status(400).json({ message: "premium user" })

        }

        else {
            response.status(400).json({ message: "free user" })

        }


    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "getTestPage failed" })
    }

}