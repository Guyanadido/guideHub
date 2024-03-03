const mongoose = require('mongoose')

const touristSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    natinality: [{
        type: String,
        trim: true,
    }],
    preferences: {
        type: [{type: mongoose.Schema.Types.ObjectId, ref: 'tourTypes'}],
        required: true,
    }
}, {
    timestamps: true
})

touristSchema.path('natinality').validate(async function(value) {
    if(value.length <= 0) {
        throw new Error('provide at least one nationality')
    }
})

touristSchema.path('preferences').validate(async function(value) {
    if(value.length <= 0) {
        throw new Error('provide at least one preference')
    }
})

const Tourist = mongoose.model('tourist', touristSchema)

module.exports = Tourist

