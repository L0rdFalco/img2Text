const SubscriptionModel = require("../models/SubscriptionModel.js")
const SocialUsersModel = require("../models/SocialUsersModel.js");
const UsersModel = require("../models/UsersModel.js");

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


exports.saveImageBlob = async (request, response, next) => {
    const imgBlob = JSON.parse(Object.keys(request.body)[0]).imgUrl.startsWith("data:image/png;base64");

    return

    let currUser = null
    let imgUrl = ""

    if (request.user.provider === "manual") currUser = await UsersModel.findById(request.user.id)
    else currUser = await SocialUsersModel.findById(request.user.id)

    if (!currUser) return;

    let updatedUserRez = null

    if (request.user.provider === "manual") {

        updatedUserRez = await UsersModel.findByIdAndUpdate(request.user.id,
            {
                $push: {
                    imageBlobs: {
                        dataImgUrl: imgUrl

                    },

                }
            },
            { new: true }
        )
    }
    else {
        updatedUserRez = await SocialUsersModel.findByIdAndUpdate(request.user.id,
            {
                $push: {
                    imageBlobs: {

                        dataImgUrl: imgUrl

                    },

                }
            },
            { new: true }
        )

    }

    return updatedUserRez


}