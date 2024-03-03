const express = require('express')
const router = new express.Router()

const {auth} = require('../../middleware/Auth')
const Tourist = require('../../models/user_related/tourist')
const validate = require('../../utils/updateValidation')

router.post('/Tourist/profile', auth, async(req, res) => {
    const tourist = new Tourist({user: req.user._id, ...req.body})
    try {
        await tourist.save()
        res.send(tourist)
    } catch (e) {
        res.status(500).send(e.message)
    } 
})

//get profile
router.get('/tourist', auth, async (req, res) => {
    try {
        const tourist = await Tourist.findOne({user: req.user._id})
        if(!tourist) {
            return res.status(404).send({'error':'not found'})
        }

        res.send(tourist)
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }
})

router.get('/tourist/:id', auth, async(req, res) => {
    try {
        const tourist = await Tourist.findById(req.params.id)
        if(!tourist) {
            return res.status(404).send({'error':'not ofund'})
        }

        res.send(tourist)
    } catch (e) {
        res.status(500).send()
    }
})

// /tourist?sortBy=createdAt=desc
// /tourist?page=1&limit=5&natinality=['english', "scotish"]&preferences=["adventure", "food"]
router.get('/Tourists', auth, async(req, res) => {
    try {
        const page = req.query.page || 1
        const limit = req.query.limit || 10
        const skip = (page - 1) * limit

        const sortBy = {}
        if(req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':')
            sortBy[field] = order === 'desc' ? -1 : 1 
        }

        const {natinality, preferences} = req.query
        const parsedNatinality = natinality ? JSON.parse(natinality): []
        const parsedPreferences = preferences ? JSON.parse(preferences) : []
        const tourists = await Tourist.find({
            $or: [
                {natinality: {$in: parsedNatinality.map(country => new RegExp(country, 'i'))}},
                {preferences: {$in: parsedPreferences}}
            ],
        })
        .sort(sortBy)
        .limit(limit)
        .skip(skip)

        res.send(tourists)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.patch('/tourist', auth, async(req, res) => {
    if (!validate(req.body, ['natinality', 'preferences'])) {
        return res.status(401).send({'error':'invalid update'})
    }

    try {
        const tourist = await Tourist.findOneAndUpdate({user: req.user._id})
        if(!tourist) {
            return res.status(400).send({'error':'anAuthorised update'})
        }

        Object.keys(req.body).forEach(update => tourist[update] = req.body[update])
        await tourist.save()
        res.send(tourist)
    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    } 
})

module.exports = router