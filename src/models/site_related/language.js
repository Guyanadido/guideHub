const mongoose = require('mongoose')

const languageSchema = mongoose.Schema({
    languageName: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        maxLength: 3,
        trim: true,
        unique: true,
        required:true
    }
})

const Language = mongoose.model('language', languageSchema)

module.exports = Language