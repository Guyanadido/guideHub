const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/GuideHub').then(result => {
    console.log('sucess')
}).catch(err => {
    console.error(err)
})