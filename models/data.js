const mongoose = require('mongoose')

const Schema = mongoose.Schema

const dataSchema = new Schema({
    websiteUrl: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('data', dataSchema)