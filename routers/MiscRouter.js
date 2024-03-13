const express = require("express")
const miscController = require("../controllers/miscController.js")
const authController = require("../controllers/authController.js")

const MiscRouter = express.Router()

MiscRouter.route("/").post(authController.protect, miscController.extractText)


module.exports = MiscRouter