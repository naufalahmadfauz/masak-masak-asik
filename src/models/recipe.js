const mongoose = require('mongoose')
const User = require('../models/user')

const recipeSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        trim:true,
        default:''
    },
    author:{
        type:mongoose.Types.ObjectId,
        required: true,
        ref:'User'
    },
    completed:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})


const Recipe = mongoose.model('Recipe',recipeSchema)
module.exports = Recipe