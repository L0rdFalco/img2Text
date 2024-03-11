const SubscriptionModel = require("../models/SubscriptionModel.js")

exports.accountState = async (request, response, next) => {
    try {
        const currUser = request.user.id

        console.log(currUser);

        const savedUser = await SubscriptionModel.findOne({ user: currUser })

        //find out if current user has a paid valid subscription
        //return appropriate response

        if (savedUser) { //premium user
            console.log("premium user");

            return response.status(400).json({ message: "CO>(ZPF5tgU?1wJ" })

        }

        else {//free user
            console.log("free user");

            return response.status(400).json({ message: "hP(^WuJ(hHk0u8F" })

        }


    } catch (error) {
        console.log(error);
        return response.status(400).json({ message: "getTestPage failed" })
    }

}