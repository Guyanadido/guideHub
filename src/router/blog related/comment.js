const express = require('express')
const router = express.Router()

const {auth} = require('../../middleware/Auth')
const Blog = require('../../models/blog_related/blog')
const Comment = require('../../models/blog_related/comment')
const Reply = require('../../models/blog_related/replys')
const { default: mongoose } = require('mongoose')

//new comment
router.post('/comment/:id', auth, async(req, res) => {
    try {
        const blog = await Blog.findOne({_id: req.params.id})
        if(!blog) {
            return res.send({'error': 'blog not found'})
        }

        if (!req.body.comment) {
            return res.status(401).send({'error':'empty comment'})
        }
        const comment = new Comment({blog: blog._id, commentor: req.user._id, content: req.body.comment})
        await comment.save()
        res.send(comment)
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/reply/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findOne({_id: req.params.id})
        if(!comment) {
            return res.status(401).send({'error' : 'comment not found'})
        }

        if (!req.body.comment) {
            return res.status(401).send({'error':'empty comment'})
        }

        const replyObj = {
            mainComment: comment._id,
            commentor: req.user._id,
            content: req.body.comment
        }

        const reply = new Reply(replyObj)
        await reply.save()
        res.send(reply)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

// /comments/:id?sortBy=createdAt:desc&page=1&limit=2
router.get('/comments/:id', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const sortObj = {}
        if(req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':')
            sortObj[field] = order === 'asc' ? 1 : -1
        }

        const comments = await Comment.find({blog: req.params.id})
            .sort(sortObj)
            .skip(skip)
            .limit(limit)

        if(!comments) {
            return res.status(500).send()
        }
        const totalComments = await Comment.countDocuments({blog: req.params.id})
        res.send({
            comments,
            totalPages: Math.ceil(totalComments / limit),
            currentPage: page,
            perPage: limit
        })
    } catch (e) {
        res.status(500).send()
    }
})

// /replys/:id?sortBy=createdAt:desc&page=1&limit=2
router.get('/replys/:id', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        const sortObj = {}
        if(req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':')
            sortObj[field] = order === 'asc' ? 1 : -1
        }

        const replys = await Reply.find({mainComment: req.params.id})
            .sort(sortObj)
            .skip(skip)
            .limit(limit)

        if(!replys) {
            return res.status(500).send()
        }
        const totalComments = await Comment.countDocuments({blog: req.params.id})
        res.send({
            replys,
            totalPages: Math.ceil(totalComments / limit),
            currentPage: page,
            perPage: limit
        })
    } catch (e) {
        res.status(500).send()
    }
})

//edit comments
router.patch('/comment/:id', auth, async(req, res) => { 
    try {
        const comment = await Comment.findOne({_id: req.params.id, commentor: req.user._id})
        if(!comment) {
            return res.status(404).send({'error':'comment not found'})
        }

        if(!req.body.content) {
            return res.status(401).send({'error':"comment can't be empty"})
        }

        comment.content = req.body.content
        await comment.save()
        res.send(comment)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

//edit replys
router.patch('/reply/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findOne({_id: req.body.id})
        if(!comment) {
            return res.status(404).send({'error':'comment not found'})
        }

        if(!req.body.content) {
            return res.status(401).send({'error':'empty comment'})
        }

        const replyObj = {
            mainComment: comment._id,
            commentor: req.user._id,
            content: req.body.content
        }

        const reply = new Reply(replyObj)
        await reply.save()
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }
})

//delete comment
router.delete('/comment/:id', auth, async(req, res) => {
    try {
        const comment = await Comment.findOneAndDelete({_id: req.params.id, commentor: req.user._id})
        if(!comment) {
            return res.status(400).send({'error':'request can not be performed'})
        }
        res.send(comment)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

//delete replys
router.delete('/reply/:id', auth, async (req, res) => {
    try {
        const reply = await Reply.findOneAndDelete({_id: req.params.id, commentor: req.user._id})
        if(!reply) {
            return res.status(400).send({'error':'request cannot be performed'})
        }
        res.send(reply)
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }
})

module.exports = router