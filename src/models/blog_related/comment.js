const mongoose = require('mongoose')

const commentSchema = mongoose.Schema({
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog',
        required: true
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
        default: 0,
    }
}, {
    timestamps: true
})

const Comment = mongoose.model('comment', commentSchema)

module.exports = Comment