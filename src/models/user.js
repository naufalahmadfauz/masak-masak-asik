const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Recipe = require('../models/recipe')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Must be a valid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        min: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password should not contain "Password"')
            }
        },
        trim: true
    },
    phoneNumber: {
        type: Number,
        default: 1,
        minlength:10,
    },
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }],
    avatar:{
        type:Buffer
    }
})

userSchema.virtual('recipes',{
    ref:'Recipe',
    localField:'_id',
    foreignField:'author'
})

userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar
    return userObject
}


userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = await jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async function (email, password) {
    const user = await User.findOne({email})
    if (!user) {
        throw new Error("Unable to login")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login!')
    }
    return user
}


userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove',async function(next){
    const user = this
    await Recipe.deleteMany({author:user._id})

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User