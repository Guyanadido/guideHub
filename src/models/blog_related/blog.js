const mongoose = require('mongoose')

const Like = require('../blog_related/like')
const Comment = require('../blog_related/comment')

const blogSchema = mongoose.Schema({
    guide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'guides',
        req: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    excerpt: {
        type: String,
        required: true,
        trim: true,
        maxLength: 55,
        minLength: 10,
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    featured_img: {
        type: Buffer,
    },
    gallery: [{
        item: {
            type: Buffer,
        }
    }],
    // slug: {
    //     type: String,
    //     trim: true,
    //     // required: true,
    //     unique: true,
    // },
    catagories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'tourTypes'
    }],
    placesFeatured: [{
            type: String,
            trim: true,
            maxLength: 20,  
    }],
    tags: [{
            type: String,
            trim: true,
            maxLength: 20,
    }],
    likes: {
        type: Number,
        default: 0,
    },
    shares: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
})

blogSchema.pre('save', async function(next) {
    const blog = this
    blog.catagories = await Promise.all(blog.catagories.map(async (catagory) => {
        catagory = await new mongoose.Types.ObjectId(catagory)
        return catagory
    }))

    next()
})

blogSchema.pre('remove', async function(next) {
    const blog = this
    await Like.deleteMany({likee: blog._id})
    await Comment.deleteMany({blog: blog._id})
    next()
})

blogSchema.methods.toJSON = function() {
    const blog = this
    const blogObject = blog.toObject()
    delete blogObject.featured_img
    delete blogObject.gallery

    return blogObject
}

const Blog = mongoose.model('blog', blogSchema)
module.exports = Blog