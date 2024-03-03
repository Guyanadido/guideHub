const express = require('express')
const User = require('../../models/user_related/user')
const router = new express.Router()
const {auth} = require('../../middleware/Auth')
const checkValidation = require('../../utils/userValidate')

const {image} = require('../../utils/imageAndGallery')
const sharp = require('sharp')
//create a new user
router.post('/user', async (req, res) => {
    const user = new User(req.body)
    user.role = 'tourist'
    try {
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }    
})

//login a user
router.post('/user/login', async (req, res) => {
    try {
        const user = await User.getUserByCredentials(req.body.firstName, req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

//logout a user
router.post('/user/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token != req.token)
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

//lgout all user sessions
router.post('/user/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send(req.user)
    } catch(e) {
        res.status(500).send()
    }
})


router.get('/user/me', auth, async(req, res) => {
    res.send(req.user)
})

router.patch('/user/me', auth, async (req, res) => {
    if(!checkValidation(req.body)) {
        return res.status(400).send({'error': 'invalid update'})
    }

    try {
        const updates = Object.keys(req.body)
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/user/me', auth, async(req, res) => {
    try {
        await req.user.deleteOne()
        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/user/avator/me', auth, image.single('avator'), async (req, res) => {
    try {
        if(!req.file) {
            throw new Error('no image provided')
        }
        const imageBuffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
        req.user.avator = imageBuffer
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(400).send({'error': e.message})
    }
})

// router.get('/user/:id/me', async (req, res) => {

//     const user  = await User.findById(req.params.id)

//     if (!user || !user.avator) {
//         res.status(404).send({'error': 'no photo'})
//     }

//     res.set('content-Type', 'image/jpg')
//     res.send(user.avator)
// })

router.get('/user/avator/me', auth, (req, res) => {
    try {
        if (!req.user.avator) {
            res.status(404).send({'error': 'no photo'})
        }
    
        res.set('content-Type', 'image/jpg')
        res.send(req.user.avator)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router