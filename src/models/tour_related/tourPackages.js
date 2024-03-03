const mongoose = require('mongoose')

const tourSchema = mongoose.Schema({
    guide: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 100,
    },
    locations: [{
            type: String,
            required: true,
            trim: true,
    }],
    price: {
        type: Number,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 0
    },
    totalBooking: {
        type: Number,
        min:0,
        default: 0,
    },
    startDate: {
        type: Date,
        required: true,
        min: Date.now()
    },
    endDate: {
        type: Date,
        required: true,
        min: Date.now(),
        validate(value) {
            if(value <= this.startDate) {
                throw new Error('start date must be greter than or equal to endDate')
            }
        }
    },
    images: [{
        image: {
            type: Buffer,
        }
    }],
    tourTypes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tourTypes'
    }]
}, {
    timestamps: true
})

tourSchema.virtual('reviews', {
    ref: 'review',
    localField: '_id',
    foreignField: 'tourPackage'
})

tourSchema.methods.toJSON = function() {
    const type = this.toObject()
    delete type.images

    return type
}

tourSchema.path('images').validate(async function(value) {
    if(value.length > 5) {
        throw new Error('upload at most 5 images')
    }
})
  

const tourPackages = mongoose.model('tourPackage', tourSchema)
module.exports = tourPackages