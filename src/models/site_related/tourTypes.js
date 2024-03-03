const mongoose = require('mongoose')

const tourTypesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    }, 
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 10,
        maxLength: 1000,
    },
    keywords: [{
            type: String,
            trim: true,
    }],
    image: {
        type: Buffer,
    },
    relatedLocations: {
        type: [{type: String, ref: 'location'}]
    }
}, {
    timestamps: true
})

tourTypesSchema.path('keywords').validate(async function(value) {
    if(value.length <= 0) {
        throw new Error('must provide atleast one key word')
    }
})

tourTypesSchema.path('relatedLocations').validate(async function(value) {
    if(value.length <= 0) {
        throw new Error('must provide atleast one location')
    }
})

tourTypesSchema.methods.toJSON = function() {
    const tourTypeObject = this.toObject()
    delete tourTypeObject.image
    return tourTypeObject
}

const TourTypes = mongoose.model('tourTypes', tourTypesSchema)

module.exports = TourTypes