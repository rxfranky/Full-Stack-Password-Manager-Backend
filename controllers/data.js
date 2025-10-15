const DataModel = require('../models/data')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const dataModel = require('../models/data')

exports.postData = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ Err: true, validationErrors: errors.array() })
    }
    const token = req.header('authorization')

    if (!token || token === 'null') {
        return res.json({ tokenErr: true, message: 'Please login first!' })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken) {
        return res.json({ invalidToken: true, message: 'Token is invalid' })
    }

    const loggedInUserEmail = req.header('loggedInUser')

    const websiteUrl = req.body.websiteUrl;
    const username = req.body.username
    const password = req.body.password
    const id = req.body.id

    let edit = false;
    let success = true;

    if (id) {
        await dataModel.deleteOne({ _id: id })
        edit = true
        success = false
    }

    const newData = new DataModel({
        websiteUrl: websiteUrl,
        username: username,
        password: password,
        user: loggedInUserEmail
    })
    const savedData = await newData.save()
    console.log('saved data-', savedData)
    res.json({ success, message: 'Data saved success!', edited: edit })
}


exports.getData = async (req, res) => {
    const token = req.get('token')
    const email = req.get('email')
    if (!token || token === 'null') {
        return res.json({ tokenErr: true, message: 'Please login first!' })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken) {
        return res.json({ invalidToken: true, message: 'Token is invalid!' })
    }

    const datas = await dataModel.find({ user: email })

    return res.json({ fetchData: true, fetchedDatas: datas })
}


exports.deleteData = async (req, res) => {
    const id = req.body.val;
    const deletedData = await dataModel.findOneAndDelete({ _id: id })

    console.log('deletedData-', deletedData)

    return res.json({ deleted: true, message: 'Data deleted success!' })
}