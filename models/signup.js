const mongoose = require('mongoose')

const Schema = mongoose.Schema

const signupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmPass: {
        type: String,
        required: true
    },
    resetToken: {
        type: String,
    },
    resetTokenExp: {
        type: Number
    }
})

module.exports = mongoose.model('users', signupSchema)