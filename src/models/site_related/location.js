const mongoose = require('mongoose')

const locationSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    }, 
    description: {
        type: String,
        trim: true,
        required: true,
        maxLength: 200
    },
    images: [{
        image: {
            type: Buffer,
        }
    }],
    tourTypes: {
            type: [{type: mongoose.Schema.Types.ObjectId, ref:'tourTypes'}]
        },
    latitude: {
        type: mongoose.Types.Decimal128,
        required: true,
        trim: true
    },
    longitude: {
        type: mongoose.Types.Decimal128,
        required: true,
        trim: true
    }
})

locationSchema.methods.toJSON = function() {
    const location = this
    const locationObject = location.toObject()

    delete locationObject.images
    return locationObject
}

locationSchema.path('images').validate(async function(value) {
    if(value.length > 5) {
        throw new Error('must provide at most 5 place images')
    }
})

locationSchema.path('tourTypes').validate(async function(value) {
    if(value.length <= 0) {
        throw new Error('require at least one tour type a place is associated to')
    }
})

const Location = mongoose.model('location', locationSchema)
module.exports = Location