const express = require('express')
const { touristAuth, auth } = require('../../middleware/Auth')
const TourPackages = require('../../models/tour_related/tourPackages')
const Booking = require('../../models/tour_related/booking')
const Review = require('../../models/tour_related/review')
const router = new express.Router()

//new review 
router.post('/Review/:id', touristAuth, async(req, res) => {
    try {
        const tour = await TourPackages.findById(req.params.id)
        if(!tour) {
            return res.status(404).send({'error': 'not found'})
        }

        const isExist = await Booking.findOne({tourist: req.user._id, tourPackage: tour._id})
        if(isExist) {
            return res.status(400).send({'error': 'already reviewed'})
        }

        const review = new Review({
            tourist: req.user._id,
            guide: tour.guide,
            tourPackage: tour._id,
            ...req.body
        })

        await review.save()
        res.send(review)
    } catch(e) {
        res.status(500).send({'error': e.message})
    }
})

//read reviews for tour 
router.get('/Review/:id', auth, async(req, res) => {
    try {
        const sortBy = {}
        if(req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':')
            sortBy[field] = order === 'desc' ? -1 : 1 
        }

        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit

        const reviews = await Review.find({tourPackage: req.params.id})
            .sort(sortBy)
            .limit(limit)
            .skip(skip)
        if(!reviews) {
            return res.status(404).send({'error':'not found'})
        }
        
        res.send(reviews)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
})

//update review 
router.patch('/Review/:id', touristAuth, async(req, res) => {
    try {
        const review = await Review.findOne({_id: req.params.id, tourist: req.user._id})
        if(!review) {
            return res.status(404).send({'error':'not found'})
        }

        review.content = req.body.content ? req.body.content : review.content
        review.rating = req.body.rating ? req.body.rating : review.rating
        await review.save()
        res.send(review)
    } catch(e) {
        res.status(500).send({'error': e.message})
    }
})

//delete review 
router.delete('/Review/:id', touristAuth, async(req, res) => {
    try {
        const review = await Review.findOneAndDelete({_id: req.params.id, tourist: req.user._id})
        if(!review) {
           return res.status(404).send({'error':'not found'})
        }

        res.send(review)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
})

module.exports = router