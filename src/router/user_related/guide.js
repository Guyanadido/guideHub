const express = require('express')
const router = new express.Router()

const sharp = require('sharp')

const Guide = require('../../models/user_related/guide')
const User = require('../../models/user_related/user')
const {auth} = require('../../middleware/Auth')
const validate = require('../../utils/updateValidation')
const {gallery, video} = require('../../utils/imageAndGallery')
const {guideSearchQuery} = require('../../utils/SearchQueries')

//fill guide profile 
router.post('/Guide/profile', auth, async(req, res) => {
    const guide = new Guide({user: req.user._id, ...req.body})
    await User.findByIdAndUpdate(
        {_id: req.user._id},
        {$set: {role: 'guide'}},
        {new: true}
    )
    try {
        await guide.save()
        res.send(guide)
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }
})

//upload gallery for the guide
router.post('/Guide/gallery', auth, gallery.array('galleries'), async(req, res) => {
    try {
        const guide = await Guide.findOne({user: req.user._id})
        if(!guide) {
            return res.status(401).send({'error':'unauthorised access'})
        }

        const gallery = req.files.map(async (file) => {
            if(file.mimetype.startsWith('image/')) {
                return await sharp(file.buffer).png().toBuffer()
            } else if(file.mimetype.startsWith('video/')) {
                return file.buffer
            }
        })
        
        const formattedGallery = await Promise.all(gallery)
        guide.gallery = []
        formattedGallery.forEach(async (item) => {
            await guide.gallery.push({item})
        })
        await guide.save()
        res.send(guide.gallery)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

//upload intro video
router.post('/Guide/video', auth, video.single('video'), async(req, res) => {
    try {
        const guide = await Guide.findOne({user: req.user._id})
        if(!guide) {
            return res.status(401).send({'error':'unauthorised access'})
        }

        guide.introVideo = req.file.buffer
        guide.save()
        res.send(guide.introVideo)
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }
})

//get a single guide by id
router.get('/Guide/:id', auth, async(req, res) => {
    try {
        const guide = await Guide.findById(req.params.id)
        if(!guide) {
            return res.status(400).send({'error':'guide not found'})
        }
        res.send(guide)
    } catch (e) {
        res.status(500).send()
    }
})


//get multiple guides
// /Guides?limit=10&page=2
// /Guides?sortBy=createdAt:desc
// /Guides?places=['omo valliy', 'debub', 'hawassa']&tourTypes=['adventure', 'cultural', 'food']
router.get('/Guides', auth, async(req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit

        const sortBy = {}
        if(req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':')
            sortBy[field] = order === 'desc' ? -1 : 1 
        }

        const {place, tourTypes} = req.query
        const parsedPlaces = place ? JSON.parse(place): []
        const parsedTourTypes = tourTypes ? JSON.parse(tourTypes) : []
        const guides = await Guide.find({
            $or: [
                {placesToGuide: {$in: parsedPlaces}},
                {placesToGuide: {$regex: new RegExp(parsedPlaces.join('|'), 'i')}},
                {expertInTourTypes: {$in: parsedTourTypes}}
            ],
        })
        .sort(sortBy)
        .limit(limit)
        .skip(skip)

        res.send(guides)
    } catch (e) {
        res.status(500).send(e.message)
    }
}) 

//update guide profile 
router.patch('/Guide', auth, async(req, res) => {
    
    if (!validate(req.body, ['about', 'expertInTourTypes', 'placesToGuide'])) {
        return res.status(401).send({'error':'invalid update'})
    }

    try {
        const guide = await Guide.findOne({user: req.user._id})
        if(!guide) {
            return res.status(400).send({'error':'anAuthorised update'})
        }

        Object.keys(req.body).forEach(update => guide[update] = req.body[update])
        await guide.save()
        res.send(guide)
    } catch (e) {
        res.status(500).send()
    }
})

//add single gallery item
router.patch('/Guide/gallery', auth, gallery.single('media'), async(req, res) => {
    try {
        const guide = await Guide.findOne({user: req.user._id})
        if(!guide) {
            return res.status(404).send({'error':'not found'})
        }

        let item
        if(req.file.mimetype.startsWith('image/')) {
            item = await sharp(req.file.buffer).png().toBuffer()
        } else {
            item = req.file.buffer
        }
 
        guide.gallery.push({item})
        await guide.save()
        res.send(item)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

// remove single gallery item
router.delete('/Guides/gallery/:id', auth, async(req, res) => {
    try {
        const guide = await Guide.findOne({user: req.user._id})
        if(!guide) {
            return res.status(404).send({'error':'not found'})
        } 

        guide.gallery =  guide.gallery.filter(item => item._id.toString() !== req.params.id)
        await guide.save()
        res.send(guide)
    } catch (e) {
        res.status(500).send()
    }
})

// remove the entire gallery
router.delete('/Guide/gallery', auth, async (req, res) => {
    try {
        const guide = Guide.findOneAndUpdate(
            {user: req.user._id},
            {$set: {gallery: []}}
        )

        if(!guide) {
            return res.status(404).send({'error':'not found'})
        }
    } catch (e) {
        res.status(500).send()
    }
})

//remove intro video
router.delete('/Guide/video', auth, async(req, res) => {
    try {
        const guide = await Guide.findOne({user: req.user._id})
        if (!guide) {
            return res.status(400).send({'error':'not found'})
        }

        guide.introVideo = undefined
        await guide.save()
        res.send(guide)
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }
})

module.exports = router