const mongoose = require('mongoose')

const bookingSchema = mongoose.Schema({
    tourist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tourist',
        required: true,
    },
    guide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'guides',
        required: true
    },
    tourPackage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tourPackage',
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now(),
        min: Date.now()
    },
    status: {
        type: String,
        trim: true,
        enum: ['pending', 'confirmed', 'canceled'],
        default: 'pending',
    }
}, {
    timestamps: true
})

const Booking = mongoose.model('booking', bookingSchema)

module.exports = Booking