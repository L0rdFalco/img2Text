const express = require("express")

const authController = require("../controllers/authController.js")
const viewsController = require("../controllers/viewsController.js")

const ViewsRouter = express.Router()

ViewsRouter.route("/").get(authController.isLoggedIn, viewsController.getHomePage)
ViewsRouter.route("/test").get(viewsController.getTestPage)
ViewsRouter.route("/sitemap.xml").get(viewsController.getSitemap)
ViewsRouter.route("/robots.txt").get(viewsController.getRobotsTXT)
ViewsRouter.route("/offload").get(viewsController.getOffloadingPage)
ViewsRouter.route("/login").get(viewsController.getLoginPage)
ViewsRouter.route("/signup").get(viewsController.getSignupPage)
ViewsRouter.route("/forgotpw").get(viewsController.getForgotPasswordPage)
ViewsRouter.route("/resetpw").get(viewsController.getResetPasswordPage)
ViewsRouter.route("/pricing").get(viewsController.getPricingPage)

ViewsRouter.route("/orderpage/:packageName").get(authController.protect, viewsController.getOrderPage)
ViewsRouter.route("/img2text").get(authController.protect, viewsController.getImg2textPage)
ViewsRouter.route("/dashboard").get(authController.protect, viewsController.getDashboardPage)
ViewsRouter.route("/subs").get(authController.protect, viewsController.getActiveSubscriptionsPage)

module.exports = ViewsRouter;

