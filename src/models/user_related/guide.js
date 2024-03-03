const mongoose = require('mongoose')

const guideSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true,
        ref: 'user'
    },
    about: {
        type: String,
        trim: true,
        required:true
    },
    expertInTourTypes: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'tourTypes'}],
        required: true,
    },
    placesToGuide: {
        type: [String],
        required: true
    },
    availability: [{
        available: {
            startDate: {
                type: Date,
                default: Date.now(),
                min: Date.now()
            },
            endDate: {
                type: Date,
                min: Date.now()
            }
        }
    }],
    introVideo: {
        type: Buffer
    },
    gallery: [{
        item: {
            type: Buffer
        }
    }]
}, {
    timestamps: true
})

guideSchema.path('gallery').validate(async function(value) {
    if(value.lenth > 10) {
        throw new Error('gallery cannot have more than 10 items')
    }
})

guideSchema.pre('save', async function(next) {
    this.placesToGuide = this.placesToGuide.map(place => place.trim())
    next()
})

guideSchema.virtual('qualifications', {
    ref: 'qualifications',
    localField: '_id',
    foreignField: 'guide'
})

guideSchema.virtual('tourPackages', {
    ref: 'tourPackage',
    localField: '_id',
    foreignField: 'guide'
})

guideSchema.virtual('reviews', {
    ref: 'review',
    localField: '_id',
    foreignField: 'guide'
})

guideSchema.methods.toJSON = function() {
    const guide = this
    const guideObject = guide.toObject()
    delete guideObject.introVideo
    delete guideObject.gallery

    return guideObject
}

const Guides = mongoose.model('guides', guideSchema)

module.exports = Guides