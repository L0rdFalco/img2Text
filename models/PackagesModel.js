const mongoose = require("mongoose")

const PackagesSchema = mongoose.Schema(
    {

        name: {
            type: String,
            trim: true,
            required: [true, "package must have a name"],

        },
        price: {
            type: Number,
            required: [true, "package must have a price"],

        },
        paymentCycle: {
            type: String,
            trim: true,
            required: [true, "package requires a payment cycle"],
            enum: {
                values: ["onetime", "recurring"],
                message: "wrong cycle setting"
            }
        },
        description: {
            type: String,
            trim: true,
            required: [true, "package must have a description"],

        },
        imageUrl: {
            type: String,
            trim: true
        },
        features: [{
            type: String,
            trim: true
        }],
        ratingsQuantity: {
            type: Number,
            default: 0

        },

        createdAt:
        {
            type: Date,
            default: Date.now
        }


    },
    {
        //allows virtual fields to show up in responses
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    })

const PackagesModel = mongoose.model("package", PackagesSchema)

module.exports = PackagesModel