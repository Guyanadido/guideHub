const mongoose = require('mongoose')

const replysSchema = mongoose.Schema({
    mainComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment'
    },
    commentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 10000,
    }, 
    likes: {
        type: Number,
        default:0
    }
}, {
    timestamps: true
})

const Reply = mongoose.model('reply' ,replysSchema)
module.exports = Reply

