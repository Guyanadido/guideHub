const express = require('express')
const { auth, guideAuth } = require('../../middleware/Auth')
const { image } = require('../../utils/imageAndGallery')
const TourPackages = require('../../models/tour_related/tourPackages')
const router = new express.Router()

const validate = require('../../utils/updateValidation')
const {tourTypeSearchQuery} = require('../../utils/SearchQueries')
const parseAndSanitizeDate = require('../../utils/parseDate')
const sharp = require('sharp')


//create new tour package
router.post('/Tour', guideAuth, async(req, res) => { 
    try {
        const dates = parseAndSanitizeDate([req.body.sd, req.body.ed])
        delete req.body.images
        const tour = new TourPackages({
            guide: req.user._id,
            ...req.body,
            startDate: dates[0],
            endDate: dates[1]
        })
    
        await tour.save() 
        res.send(tour)
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    } 
}) 

//upload images
router.post('/Tour/images/:id', guideAuth, image.array('image'), async(req, res) => {
    try {     
        const tour = await TourPackages.findOne({_id: req.params.id, guide: req.user._id})
        if(!tour) {
            return res.status(404).send({'error':'not found'})
        }

        const sharpImage = await Promise.all(req.files.map(async (file) => {
            return await sharp(file.buffer).png().toBuffer()
        }))

        sharpImage.map(image => tour.images.push({image}))
        tour.save()
        res.send(tour)
    } catch(e) { 
        res.status(500).send(e.message)
    } 
})

//get a tour package
router.get('/Tour/:id', auth, async(req, res) => {
    try {
        const tour = await TourPackages.findById(req.params.id)
        if(!tour) {
            return res.status(404).send({'error':'not found'})
        }

        res.send(tour)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

//get tours
// /Tour?guide=123&title=this&description=that&location=["123","456"]&tourTypes=["123","456"]&sd="feb 14, 2024"&ed="feb 20, 2036"
router.get('/Tours', auth, async(req, res) => {
    try {
        const sortBy = {}
        if(req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':')
            sortBy[field] = order === 'desc' ? -1 : 1 
        }

        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit
 
        const query = req.query
        const queries = tourTypeSearchQuery(query)
        const tours = await TourPackages.find(queries)
            .sort(sortBy)
            .limit(limit)  
            .skip(skip)
        res.send(tours)
    } catch(e) {      
        res.status(500).send(e.message)
    }
})

//update tours
router.patch('/Tour/:id', guideAuth, async(req, res) => {
    try {
        const tour = await TourPackages.findOne({_id: req.params.id, guide: req.user._id})
        if(!tour) {
            return res.status(404).send({'error':'not found'})
        }
        const isValid = validate(req.body, ['title', 'description', 'locations', 'price', 'capacity', 'sd', 'ed', 'tourTypes'])
        if(!isValid) {
            return res.status(400).send({'error':'invalid updates'})
        }       
     
        req.body.startDate = req.body.sd ? parseAndSanitizeDate([req.body.sd])[0] : tour.startDate
        req.body.endDate = req.body.ed ? parseAndSanitizeDate([req.body.ed])[0] : tour.endDate

        Object.keys(req.body).forEach(update => tour[update] = req.body[update])
        await tour.save()
        res.send(tour)
    } catch (e) {  
        res.status(500).send({'error': e.message})
    }
})

//delete a single image
router.delete('/Tour/:packId/:imId', guideAuth, async(req, res) => {
    try {
        const tour = await TourPackages.findOne({_id: req.params.packId, guide: req.user._id})
        if(!tour || !tour.images) {
            return res.status(404).send({'error':'not found'})
        }

        tour.images = tour.images.filter(image => image._id.toString() !== req.params.imId)
        await tour.save()
        res.send(tour)
    } catch (e) { 
        res.status(500).send({'error': e.message})
    }
})

//delete tour package
router.delete('/Tour/:id', guideAuth, async(req, res) => {
    try {
        const tour = await TourPackages.findOneAndDelete({_id: req.params.id, guide: req.user._id})
        if(!tour) {
            return res.status(404).send({'error': 'not found'})
        }

        res.send(tour)
    } catch(e) {
        res.status(500).send({'error': e.message})
    }
})

//delete guide specific packages 
router.delete('/Tours', guideAuth, async(req, res) => {
    try {
        const tours = await TourPackages.deleteMany({guide: req.user._id})
        if(!tours) {
            return res.status(404).send({'error':'not found'})
        }
        res.send(tours)
    } catch (e) {
        console.log(e)
        res.status(500).send({'error': e.message})
    }
})

module.exports = router