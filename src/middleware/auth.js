const jwt = require('jsonwebtoken')
const User = require('../models/user_related/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.status(401).send({ 'error': 'please authenticate' })
    }
}

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)

        const admin = await User.findOne({_id: decoded._id, 'tokens.token': token})
        if(!admin || admin.role !== 'admin') {
            throw new Error()
        }

        req.token = token
        req.admin = admin

        next()
    } catch (e) {
        res.status(401).send({'error':'admin privilage only'})
    }
}

const guideAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user || user.role !== 'guide') {
            throw new Error()
        }
        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.status(401).send({ 'error': 'guides privilage' })
    }
}

const touristAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user || user.role !== 'tourist') {
            throw new Error()
        }
        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.status(401).send({ 'error': 'tourists privilage' })
    }
}

module.exports = {
    auth,
    adminAuth,
    guideAuth,
    touristAuth
}