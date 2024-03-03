const express = require('express')
const router = new express.Router()
const sharp = require('sharp')

const {adminAuth} = require('../../middleware/Auth')
const TourType = require('../../models/site_related/tourTypes')
const {image} = require('../../utils/imageAndGallery')
const validate = require('../../utils/updateValidation')

//post one / multiple tour types 
router.post('/Tourtypes', adminAuth, async(req, res) => {
    const tourTypes = req.body.tourTypes
    if(!tourTypes) {
        return res.status(400).send({'error':'provide at least one tour type'})
    }
    try {
        const recordedTourTypes = await Promise.all(tourTypes.map(async (tourType) => {
            const recordedTourType = new TourType(tourType)
            await recordedTourType.save()  
            return recordedTourType
        })) 
   
        res.status(201).send(recordedTourTypes)
    } catch(e) {
        res.status(500).send({'error':e.message})
    }
})
   
//post upload image
router.post('/Tourtypes/image/:id', adminAuth, image.single('image'), async(req, res) => {
    try {
        const tourType = await TourType.findById(req.params.id)
        if(!tourType) {
            return res.status(404).send({'error':'not found'})
        }
 
        const sharpImage = await sharp(req.file.buffer).png().toBuffer()
        tourType.image = sharpImage
        await tourType.save()
        res.send(tourType)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }   
})

//get multiple tourTypes
// /TourTypes?sortBy=createdAt:desc?&page=1&limit=10
router.get('/TourTypes', async(req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit

        const sortBy = {}
        if(req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':')
            sortBy[field] = order === 'desc' ? -1 : 1
        }

        const {locations, keywords} = req.query;
        const parsedLocations = locations ? JSON.parse(locations) : []
        const parsedKeywords = keywords ? JSON.parse(keywords) : []
        
        const tourType = await TourType.find({
            $or: [
                {keywords: {$in: parsedKeywords}},
                {keywords: {$regex: new RegExp(parsedKeywords.join('|'), 'i')}},
                {relatedLocations: {$in: parsedLocations}},
            ]

        })
            .sort(sortBy)
            .limit(limit)
            .skip(skip)
        res.send(tourType)  
    } catch (e) {
        res.status(500).send(e.message)
    }
})

//edit tourtype 
router.patch('/Tourtype/:id', adminAuth, async(req, res) => {
    const isvalid = validate(req.body, ['name', 'description', 'keywords', 'relatedLocations'])
    if(!isvalid) {
        return res.status(400).send({'error':'invalid update'})
    }
    try {
        const tourType = await TourType.findById(req.params.id)
        if(!tourType) {
            return res.status(404).send({'error':'not found'})
        }

        Object.keys(req.body).forEach(update => tourType[update] = req.body[update])
        await tourType.save()
        res.send(tourType)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
}) 

//delete Image
router.delete('/Tourtype/image/:id', adminAuth, async(req, res) => {
    try {
        const tourType = await TourType.findById(req.params.id)
        if(!tourType) {
            return res.status(404).send({'error':'not found'})
        }
        tourType.image = undefined
        await tourType.save()
        res.send(tourType)
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }
})

//delete Tour type
router.delete('/Tourtype/:id', adminAuth, async(req, res) => {
    try {
        const tourType = await TourType.findByIdAndDelete(req.params.id)
        if(!tourType) return res.status(404).send({'error':'not found'})
        res.send(tourType)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

module.exports = router