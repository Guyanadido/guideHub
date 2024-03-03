const express = require('express')
const {adminAuth} = require('../../middleware/Auth')
const router = new express.Router()
const Language = require('../../models/site_related/language')
const validate = require('../../utils/updateValidation')

//post languages
router.post('/Language', adminAuth, async (req, res) => {
    const languages = req.body.languages
    if(!languages || languages.length === 0) {
        return res.status(400).send({'error':'provide at least one language'})
    }
    try {
        const languageRecords = await Promise.all(languages.map(async (language) => {
            const newLanguage = new Language(language)
            await newLanguage.save()
            return newLanguage
        }))

        res.status(201).send(languageRecords)
    } catch (e) {
        res.status(500).send({'error':e.message})
    }
})

//get multiple languages
//Language?sortBy=createdAt:desc
router.get('/Language', adminAuth, async (req, res) => {
    try {
        const sortBy = {}
        if(req.query.sortBy) {
            const [field, order] = req.query.sortBy.split(':')
            sortBy[field] = order === 'desc' ? -1 : 1
        }
        const languages = await Language.find({}).sort(sortBy)
        res.send(languages)
    } catch (e) {
        res.status(500).send({'error':e.message})
    }
})

//edit language
router.patch('/Language/:id', adminAuth, async (req, res) => {
    const language = await Language.findById(req.params.id)
    if(!language) {
        return res.status(404).send({'error':'not found'})
    }
    try {
        Object.keys(req.body).forEach(update => language[update] = req.body[update])
        await language.save()
        res.send(language)
    } catch(e) {
        res.status(500).send({'error':e.message})
    }
})

//delete language
router.delete('/Language/:id', adminAuth, async (req, res) => {
    try {
        const language = await Language.findByIdAndDelete(req.params.id)
        if(!language) {
            return res.status(404).send({'error':'not found'})
        }
        
        res.send(language)
    } catch (e) {
        res.status(500).send({'error':e.message})
    }
})

module.exports = router