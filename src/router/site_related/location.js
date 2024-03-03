const express = require('express')
const router = new express.Router()
const sharp = require('sharp')
const {image} = require('../../utils/imageAndGallery')

const Location = require('../../models/site_related/location')
const {adminAuth} = require('../../middleware/Auth')
const validate = require('../../utils/updateValidation')

//create new location
router.post('/Location', adminAuth, async(req, res) => {
    const location = new Location({...req.body})
    try {
        await location.save() 
        res.send(location)
    } catch (e) { 
        console.log(e)
        res.status(500).send(e.message)
    }
})

//upload images
router.post('/Location/image/:id', adminAuth, image.array('gallery'), async(req, res) => {
    try { 
        const location = await Location.findById(req.params.id)
        if(!location) {
            return res.status(400).sned({'error':'not found'})
        }
        const sharpImages = req.files.map(async (file) => {
            return await sharp(file.buffer).png().toBuffer()
        })
        const images = await Promise.all(sharpImages)
        images.forEach(image => location.images.push({image}))
        await location.save()
        res.send(location)
    } catch (e) {
        res.status(500).send(e.message)
    }
}) 

//get multiple locations
// /Locations?sortBy=createdAt:desc?&page=1&limit=10
router.get('/Locations', async(req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit

        const sortBy = {}
        if(req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':')
            sortBy[field] = order === 'desc' ? -1 : 1
        }

        const userSearch = req.query.name ? req.query.name : ''
        const sanitizedQuery = userSearch.trim().toLowerCase()
        const searchQuery = {
            name: {$regex: new RegExp(sanitizedQuery, 'i')}
        }
        const locaions = await Location.find(searchQuery)
            .sort(sortBy)
            .limit(limit)
            .skip(skip)
        res.send(locaions)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

//add new image item to the image field
router.patch('/Location/image/:id', adminAuth, image.single('image'), async(req, res) => {
    try {
        const location = await Location.findById(req.params.id)
        if(!location) {
            return res.status(400).send({'error':'not found'})
        }
        const image = await sharp(req.file.buffer).png().toBuffer()
        location.images.push({image})
        await location.save() 
        res.send(location)
    } catch (e) {
        res.status(500).send(e.message)
    }
})


//edit Location
router.patch('/Location/:id', adminAuth, async(req, res) => {
    if(!validate(req.body, ['name', 'description', 'tourTypes', 'latitude', 'longitude'])) {
        return res.status(400).send({'error':'invalid updates'})
    }

    try {
        const location = await Location.findById(req.params.id)
        if(!location) {
            return res.status(401).send({'error':'an Authorised update'})
        }

        Object.keys(req.body).forEach(update => location[update] = req.body[update])
        await location.save()
        res.send(location)
    } catch (e) {
        res.status(500).send()
    }
})

//remove one item from location images field
router.delete('/Location/:locId/:imgId', adminAuth, async(req, res) => {
    try {
        const location = await Location.findById(req.params.locId)
        if(!location) {
            return res.status(404).send({'error':'not found'})
        }
        location.images = location.images.filter(image => image._id.toString() !== req.params.imgId)
        await location.save()
        res.send(location)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

//delete location
router.delete('/Location/:id', adminAuth, async(req, res) => {
    try {
        const location = await Location.findOneAndDelete({_id: req.params.id})
        if(!location) {
            return res.status(404).send({'error':'not found'})
        }
        res.send(location)
    } catch (e) {
        res.status(500).send(e.message)
    } 
})

module.exports = router