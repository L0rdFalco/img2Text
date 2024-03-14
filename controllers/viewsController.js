const PackagesModel = require("../models/PackagesModel.js")
const SubscriptionModel = require("../models/SubscriptionModel.js")

exports.getTestPage = async (request, response, next) => {
    try {


        response.status(200).render("test")

    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "getTestPage failed" })
    }

}


exports.getImg2textPage = (request, response, next) => {
    try {


        response.status(200).render("img2text")

        // response.status(400).json({ message: "/image2text" })


    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "Img2text Page failed" })
    }

}

exports.getSitemap = (request, response, next) => {
    try {
        response.sendFile("sitemap.xml", { root: '.' })

    } catch (error) {
        response.status(400).render("errorpage", { data: { status: 400, message: "couldn't get sitemap page" } })
    }

}

exports.getRobotsTXT = (request, response, next) => {
    try {
        response.sendFile("robots.txt", { root: '.' })

    } catch (error) {
        response.status(400).render("errorpage", { data: { status: 400, message: "couldn't get sitemap page" } })
    }

}

exports.getOffloadingPage = (request, response, next) => {
    try {

        response.status(200).render("offloading")

    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "getTestPage failed" })
    }

}
exports.getHomePage = (request, response, next) => {
    try {

        response.status(200).render("home")

    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "getHomePage failed" })
    }

}

exports.getLoginPage = (request, response, next) => {
    try {
        response.status(200).render("login")

    } catch (error) {
        response.status(400).json({ message: "getLoginPage failed" })
    }

}

exports.getSignupPage = (request, response, next) => {
    try {
        response.status(200).render("signup")

    } catch (error) {
        response.status(400).json({ message: "getSingupPage failed" })
    }

}

exports.getPricingPage = (request, response, next) => {
    try {
        response.status(200).render("pricing")

    } catch (error) {
        response.status(400).json({ message: "getPricingPage failed" })
    }

}

exports.getDashboardPage = (request, response, next) => {
    try {
        response.status(200).render("dashboard")


    } catch (error) {
        response.status(400).json({ message: "getDashboardPage failed" })
    }

}

exports.getActiveSubscriptionsPage = async (request, response, next) => {
    try {

        const subscriptionDocs = await SubscriptionModel.find({ user: request.user.id })

        response.status(200).render("subscriptions", {
            data: subscriptionDocs
        }


        )

    } catch (error) {
        response.status(400).json({ message: "getActiveSubscriptionsPage failed" })
    }

}

exports.getSavedImagesPage = (request, response, next) => {
    try {
        response.status(200).render("saved-images")

    } catch (error) {
        response.status(400).json({ message: "getSavedImagesPage failed" })
    }

}

exports.getOrderPage = async (request, response, next) => {
    try {


        // const currUser = await SocialUsersModel.findById(request.user.id)

        //get the last element in the generatedManuscripts array and get its boxid
        //query db for the ebook product model and set said info in the order page
        console.log("order type payload 1", request.params);

        let packageName = request.params.packageName

        console.log(2);
        const CurrentPackage = await PackagesModel.findOne({ name: packageName })

        console.log(3);

        console.log("node env: ", process.env.NODE_ENV);
        let paypalUrl = null

        if (process.env.NODE_ENV === "production") {
            console.log("prod");
            paypalUrl = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_LIVE_CLIENT_ID}&currency=USD`

        }
        else if (process.env.NODE_ENV === "development") {
            console.log("dev");
            paypalUrl = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_SANDBOX_CLIENT_ID}&currency=USD`
        }

        console.log(4);

        response.status(200).render("orderpage", {
            data: {
                id: CurrentPackage.id,
                name: CurrentPackage.name,
                price: CurrentPackage.price,
                desc: CurrentPackage.description,
                url: paypalUrl
            }
        })

    } catch (error) {
        console.log(error);
        response.status(400).render("errorpage", { data: { status: 400, message: "couldn't get order page" } })
    }

}

exports.getForgotPasswordPage = (request, response, next) => {
    try {
        response.status(200).render("forgot-password")

    } catch (error) {
        response.status(400).json({ message: "getProfilePage failed" })
    }

}

exports.getResetPasswordPage = (request, response, next) => {
    try {
        response.status(200).render("reset-password")

    } catch (error) {
        response.status(400).json({ message: "getProfilePage failed" })
    }

}