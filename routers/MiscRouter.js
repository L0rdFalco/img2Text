const express = require("express")
const miscController = require("../controllers/miscController.js")
const authController = require("../controllers/authController.js")

const MiscRouter = express.Router()

MiscRouter.route("/extract-text").post(miscController.extractText)


module.exports = MiscRouter