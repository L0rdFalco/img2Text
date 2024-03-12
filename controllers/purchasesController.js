const fs = require("fs")
const axios = require("axios");
const SocialUsersModel = require("../models/SocialUsersModel.js");
const SubscriptionModel = require("../models/SubscriptionModel.js");
const PackagesModel = require("../models/PackagesModel.js");
const helpers = require("../utils/helperFunctions.js")

exports.createOrder = async (request, response, next) => {

    try {
        const sPackage = await PackagesModel.findById(request.body.packageId)

        const sPackagePrice = sPackage.price



        let cOrderRes = null;
        try {
            let baseUrl = null;

            if (process.env.NODE_ENV === "development") {
                baseUrl = process.env.PAYPAL_SANDBOX_BASE_URL

            }
            else if (process.env.NODE_ENV === "production") {
                baseUrl = process.env.PAYPAL_LIVE_BASE_URL
            }



            const url = `${baseUrl}/v2/checkout/orders`
            const tokenObj = await generateAccessToken()
            cOrderRes = await axios({
                url: url,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenObj.access_token}`
                },

                data: JSON.stringify({
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            amount: {
                                currency_code: "USD",
                                value: sPackagePrice,
                            }
                        }
                    ],

                })

            })

            response.status(200).json({
                message: "create Order success",
                data: cOrderRes.data
            })

        } catch (error) {
            console.log(error);
            response.status(400).json({
                message: "could not complete the transaction. Please try again later 1",
                data: cOrderRes.data
            })
        }

    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "could not complete the transaction. Please try again later 2" })
    }
}

exports.capturePayment = async (request, response, next) => {
    try {

        const userId = request.user.id

        const sPackage = await PackagesModel.findById(request.body.packageId)
        if (sPackage.name === "one") expiryDate = helpers.endDate(30)[1]
        if (sPackage.name === "two") expiryDate = helpers.endDate(180)[1]
        if (sPackage.name === "three") expiryDate = helpers.endDate(365)[1]

        let baseUrl = null;

        if (process.env.NODE_ENV === "development") {
            baseUrl = process.env.PAYPAL_SANDBOX_BASE_URL

        }
        else if (process.env.NODE_ENV === "production") {
            baseUrl = process.env.PAYPAL_LIVE_BASE_URL
        }

        const orderId = request.params.orderID;

        const tokenObj = await generateAccessToken()
        const url = `${baseUrl}/v2/checkout/orders/${orderId}/capture`;

        const cPaymentObj = await axios({
            url: url,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenObj.access_token}`
            }
        })



        if (!cPaymentObj) return response.status(400).json({ message: "could not capture payment. Try again later" })

        const SubsModel = await SubscriptionModel.findOne({ user: userId })

        if (SubsModel) {
            //update the specific subscription model with the new details i.e price, creation date, expriry date
            console.log("premium user changing to a different package");

            const updatedSubscription = await SubscriptionModel.findOneAndUpdate({ user: request.user.id },
                {
                    package: sPackage.id,
                    user: request.user.id,
                    price: sPackage.price,
                    paypalCaptureId: cPaymentObj.data.id,
                    paymentCycle: "onetime",
                    endDate: expiryDate
                },
                {
                    new: true,
                    runValidators: true
                })

            if (updatedSubscription) {

                const msg = `You have successfully changed to the ${sPackage.name} package.`
                return response.status(200).json({
                    message: msg,
                    url: "/subs"

                })
            }

            else {
                const msg = `could not change to the ${sPackage.name} package.`
                return response.status(200).json({
                    message: msg,
                    url: "/subs"

                })
            }
        }

        //meaning that current user wants to buy a basic package
        else if (!SubsModel && sPackage.name === "one") {
            console.log("free user buying a one package");
            // add user to subscriptions collection

            const newPaidUser = await SubscriptionModel.create({
                package: sPackage.id,
                user: request.user.id,
                price: sPackage.price,
                paypalCaptureId: cPaymentObj.data.id,
                paymentCycle: "onetime",
                endDate: expiryDate
            })

            if (newPaidUser) {
                const msg = `You have successfully bought ${sPackage.name} package.`
                return response.status(200).json({
                    message: msg,
                    url: "/subs"
                })

            }
            else {
                return response.status(200).json({
                    message: "something went wrong when buying one package. Try again",
                })
            }

        }
        //meaning that current user wants to buy a premium package
        else if (!SubsModel && sPackage.name === "two") {
            console.log("free user buying a two package");
            // add user to subscriptions collection

            const newPaidUser = await SubscriptionModel.create({
                package: sPackage.id,
                user: request.user.id,
                price: sPackage.price,
                paypalCaptureId: cPaymentObj.data.id,
                paymentCycle: "onetime",
                endDate: expiryDate
            })

            if (newPaidUser) {
                const msg = `You have successfully bought ${sPackage.name} package.`
                return response.status(200).json({
                    message: msg,
                    url: "/subs"
                })

            }
            else {
                return response.status(200).json({
                    message: "something went wrong when buying two package. Try again",
                })
            }
        }

        //meaning that current user wants to buy a platinum package
        else if (!SubsModel && sPackage.name === "three") {
            console.log("free user buying a three package");

            const newPaidUser = await SubscriptionModel.create({
                package: sPackage.id,
                user: request.user.id,
                price: sPackage.price,
                paypalCaptureId: cPaymentObj.data.id,
                paymentCycle: "onetime",
                endDate: expiryDate
            })

            if (newPaidUser) {
                const msg = `You have successfully bought ${sPackage.name} package.`
                return response.status(200).json({
                    message: msg,
                    url: "/subs"
                })

            }
            else {
                return response.status(200).json({
                    message: "something went wrong when buying three package. Try again",
                })
            }
        }
        //meaning that current user is free and is looking to buy a single use
        else if (!SubsModel && sPackage.name === "single") {
            console.log("free user paying for single use");


        }

        else {
            console.log("HERE!");
        }

    } catch (error) {
        console.log(error);
        response.status(400).json({ message: "capturePayment fail" })
    }
}


async function generateAccessToken() {
    try {

        let clientId = null;
        let clientSecret = null;
        let baseUrl = null;

        if (process.env.NODE_ENV === "development") {
            baseUrl = process.env.PAYPAL_SANDBOX_BASE_URL
            clientId = process.env.PAYPAL_SANDBOX_CLIENT_ID
            clientSecret = process.env.PAYPAL_SANDBOX_CLIENT_SECRET
        }
        else if (process.env.NODE_ENV === "production") {
            baseUrl = process.env.PAYPAL_LIVE_BASE_URL
            clientId = process.env.PAYPAL_LIVE_CLIENT_ID
            clientSecret = process.env.PAYPAL_LIVE_CLIENT_SECRET
        }

        const response = await axios({
            url: `${baseUrl}/v1/oauth2/token`,
            method: "POST",
            data: "grant_type=client_credentials",
            auth: {
                username: clientId,
                password: clientSecret
            }
        })

        return response.data
    } catch (error) {
        console.log("generateAccessToken failed");
    }


}
