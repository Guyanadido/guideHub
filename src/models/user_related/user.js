const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Blog = require('../blog_related/blog')
const Guide = require('./guide')
const Tourist = require('./tourist')

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    secondName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('provide a valid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value) {
            if (validator.contains(value, 'password', { ignoreCase: false })) {
                throw new Error('password can not contain "password"')
            }
        }
    },
    role: {
        type: String,
        enum: ['tourist', 'guide', 'admin'],
        default: 'tourist',
    },
    avator: {
        type: Buffer
    },
    status: {
        type: Boolean,
    },
    languages: [{
        language: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'language'
        }
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

userSchema.virtual('guides', {
    ref: 'guides',
    localField: '_id',
    foreignField: 'user'
})

userSchema.virtual('tourist', {
    ref: 'tourist',
    localField: '_id',
    foreignField: 'user'
})

userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove', async function(next) {
    const user = this
    await Blog.deleteMany({guide: user._id})

    next()
})

userSchema.pre('remove', async function(next) {
    const user = this

    if(user.role === 'guide') {
        await Guide.findOneAndDelete({user: user._id})
    }  else {
        await Tourist.findOneAndDelete({user: user._id})
    }
    next()
})


userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id:user._id.toString() }, process.env.TOKEN_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.getUserByCredentials = async (name, email, password) => {
    const user = await User.findOne({firstName:name, email})

    if(!user) {
        throw new Error('unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        throw new Error('unable to login')
    }

    return user
}

userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.tokens
    delete userObject.password
    delete userObject.avator
    return userObject
}

const User = mongoose.model('user', userSchema)

module.exports = User