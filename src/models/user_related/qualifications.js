const mongoose = require('mongoose')

const qualificationSchema = mongoose.Schema({
    guide: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'guides'
    },
    name: {
        type: String,
        required: true,
        trim: true,
    }, 
    description: {
        type: String,
        required: true,
        trim: true,
        minLength: 10,
        maxLength: 100,
    },
    supportingFiles: [{
        file: {
                type: Buffer,
                required: true,
        }
    }],
    supportingImages: [{
        image: {
            type: Buffer,
            required: true,
        }
    }]
}, {
    timestamps: true
})

const Qualifications = mongoose.model('qualifications', qualificationSchema)

module.exports = Qualifications