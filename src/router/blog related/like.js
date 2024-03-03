const express = require('express')
const router = new express.Router()

const Comment = require('../../models/blog_related/comment')
const Reply = require('../../models/blog_related/replys')
const Blog = require('../../models/blog_related/blog')
const Like = require('../../models/blog_related/like')
const {auth} = require('../../middleware/auth')
const { default: mongoose } = require('mongoose')

//add new like to a blog 
router.patch('/Like/blog/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findOne({_id: req.params.id})
        if(!blog) {
            return res.status(404).send({'error': 'blog not found'})
        }

        // const islikeExist = await Like.findOne({likee: req.user._id, blog: req.params.id})
        // if (islikeExist) {
        //     return res.status(401).send({'error':'already liked'})
        // } 

        // const newLike = new Like({likee: req.user._id, blog: req.params.id})

        const like = await Like.findOneAndUpdate(
            {likee: req.user._id, liked: req.params.id},
            {$set: {likee: req.user._id, liked: req.params.id}},
            {upsert: true}
        )

        if(like !== null) {
            return res.status(400).send({'error':'already liked'})
        }

        blog.likes = blog.likes + 1
        await newLike.save()
        await blog.save()
        const totalLikes = blog.likes
        res.send({totalLikes, newLike})
    } catch (e) {
        res.status(500).send()
    }
})

//remove like from a blog
router.delete('/Like/blog/:id', auth, async(req, res) => {
    try {
        const blog = await Blog.findOne({_id: req.params.id})
        if(!blog) {
            return res.status(404).send({'error': 'blog not found'})
        }  

        const like = await Like.findOneAndDelete({likee: req.user._id, liked: req.params.id})
        if(!like) {
            return res.status(404).send()
        }

        blog.likes = blog.likes - 1
        await blog.save()
        res.send(blog.likes)
    } catch (e) {
        res.status(500).send()
    }
})


//add like to a comment 
router.patch('/Like/comment/:id', auth, async (req, res) => {
    try {
        const comment = await Comment.findOne({_id: req.params.id})
        if(!comment) {
            return res.status(404).send({'error': 'comment not found'})
        }

        const like = await Like.findOneAndUpdate(
            {likee: req.user._id, liked: req.params.id},
            {$set: {likee: req.user._id, liked: req.params.id}},
            {upsert: true}
        )

        if(like !== null) {
            return res.status(400).send({'error':'already liked'})
        }

        comment.likes = comment.likes + 1
        await comment.save()
        res.send({totalLikes, newLike})
    } catch (e) {
        res.status(500).send()
    }
})

//remove like from a comment
router.delete('/Like/comment/:id', auth, async(req, res) => {
    try {
        const comment = await Comment.findOne({_id: req.params.id})
        if(!comment) {
            return res.status(404).send({'error': 'comment not found'})
        }  

        const like = await Like.findOneAndDelete({likee: req.user._id, liked: req.params.id})
        if(!like) {
            return res.status(404).send()
        }

        comment.likes = comment.likes - 1
        await comment.save()
        res.send(comment)
    } catch (e) {
        res.status(500).send()
    }
})

//new reply like 
router.patch('/Like/reply/:id', auth, async (req, res) => {
    try {
        const reply = await Reply.findOne({_id: req.params.id})
        if(!reply) {
            return res.status(400).send({'error':'comment not found'})
        }

        const like = await Like.findOneAndUpdate(
            {likee: req.user._id, liked: req.params.id},
            {$set: {likee: req.user._id, liked: req.params.id}},
            {upsert: true}
        )

        if(like !== null) {
            return res.status(400).send({'error':'already liked'})
        }
        
        reply.likes = reply.likes + 1
        await reply.save()
        res.send(reply.likes)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

//remove reply like
router.delete('/Like/reply/:id', auth, async (req, res) => {
    try {
        const reply = await Reply.findOne({_id: req.params.id})
        if(!reply) {
            return res.status(404).send({'error': 'comment not found'})
        }  

        const like = await Like.findOneAndDelete({likee: req.user._id, liked: req.params.id})
        if(!like) {
            return res.status(404).send()
        }

        reply.likes = reply.likes - 1
        await reply.save()
        res.send(reply.likes)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router
