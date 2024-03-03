const express = require('express')
const { touristAuth, guideAuth, adminAuth, auth } = require('../../middleware/Auth')
const Booking = require('../../models/tour_related/booking')
const TourPackage = require('../../models/tour_related/tourPackages')
const { bookingSearch } = require('../../utils/SearchQueries')
const router = new express.Router()

//new booking
router.post('/Booking/:packId', touristAuth, async(req, res) => {
    try {
        const tour = await TourPackage.findById(req.params.packId)
        if(!tour) {
            return res.status(404).send({'error':'not found'})
        }

        const isExist = await Booking.findOne({tourist: req.user._id, tourPackage: req.params.packId})
        if(isExist) {
            return res.status(400).send({'error':'already booked'})
        }

        if((tour.capacity < tour.totalBooking + 1)) {
            return res.status(400).send({'error':'sorry, No available slotes'})
        }
        const booking = new Booking({
            tourist: req.user._id,
            guide: tour.guide,
            tourPackage: tour._id,
        })

        tour.totalBooking = tour.totalBooking + 1

        await tour.save()
        await booking.save()
        res.status(201).send(booking)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
})

//get booking
router.get('/Booking/:id', auth, async(req, res) => {
    try {
        const booking = await Booking.findOne({
            _id: req.params.id,
            $or: [
                {tourist: req.user._id},
                {guide: req.user._id}
            ]
        })
    
        if(!booking) {
            return res.status(404).send({'error':'not found'})
        }
    
        res.send(booking)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
})

//get tourist bookings
router.get('/Bookigs/tourist', touristAuth, async(req, res) => {
    try {
        const bookings = await Booking.find({tourist: req.user._id})
        if(!bookings) {
            return res.status(404).send({'error':'not found'})
        }

        res.send(bookings)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
})

//get guide specific booking
router.get('/Booking/guide/:packId', guideAuth, async(req, res) => {
    try {
        const bookings = await Booking.find({guide: req.user._id, tourPackage: req.params.packId})
        if(!bookings) {
            return res.status(404).send({'error':'not found'})
        }

        res.send(bookings)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
})

//get multiple bookings based on the date and status(admin privilage)
// /Booking/?minDate="june 10, 2021"&maxDate="january 15, 2036"&status="pending"
router.get('/Bookings', adminAuth, async(req, res) => {
    try {
        const query = bookingSearch(req.query)
        const bookings = await Booking.find(query)

        if(!bookings) {
            return res.status(404).send({'error': 'not found'})
        }

        res.send(bookings)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
})

//update status
router.patch('/Booking/:id', touristAuth, async(req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate({
            _id: req.params.id,
            tourist: req.user._id
        }, {
            status: req.body.status
        }, {
            new: true
        })
        if(!booking) {
            return res.status(404).send({'error':'not found'})
        }
        res.send(booking)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
})

//delete booking
router.delete('/Booking/:id', touristAuth, async(req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({_id: req.params.id, tourist: req.user._id})
        if(!booking) {
            return res.status(404).send({'error': 'not found'})
        }

        res.send(booking)
    } catch (e) {
        res.status(500).send({'error': e.message})
    }
})

module.exports = router 