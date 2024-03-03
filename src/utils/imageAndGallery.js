const multer = require('multer')

const image = multer({
    limits: {
        fileSize:2000000
    },

    fileFilter(req, file, cd) {
        if(!file.originalname.match(/\.(jpg||jpej||png)$/)) {
            return cd(new Error('upload an image'))
        }

        cd(undefined, true)
    }
})

const gallery = multer({
    limits: {
        fileSize: 20000000,
    },

    fileFilter(req, file, cb) {
        if ((file.size > 20000000)) {
            return cb(new Error('size limit passed'))
        }

        if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
            return cb(new Error('upload a video or image'))
        }

        cb(undefined, true)
    }
})

const video = multer({
    limits: {
        fileSize: 20000000.
    }, 

    fileFilter(req, file, cb) {
        if ((file.size > 20000000)) {
            return cb(new Error('size limit passed'))
        }

        if (!file.mimetype.startsWith('video/')) {
            return cb(new Error('upload a video'))
        }

        cb(undefined, true)
    }
})

module.exports = {
    image,
    video,
    gallery,
}