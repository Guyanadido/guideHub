const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    tourist: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'tourist'
    },
    guide: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'guides'
    },
    tourPackage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tourPackage'
    },
    rating: {
        type: mongoose.Types.Decimal128,
        required: true,
        min: 1,
        max: 5,
    },
    content: {
        type: String,
        required: true,
        maxLength: 10000,
    }
}, {
    timestamps: true
})

const Review = mongoose.model('review', reviewSchema)
module.exports = Review