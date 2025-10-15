const express = require('express')
const router = express.Router()

const { body } = require('express-validator')

const controller = require('../controllers/data')

router.post('/postData', [
    body('websiteUrl').notEmpty().withMessage('Please enter website URL!').bail(),
    body('username').notEmpty().withMessage('Please enter username!').bail(),
    body('password').notEmpty().withMessage('Please enter password!')
], controller.postData)


router.get('/getData', controller.getData)

router.delete('/deleteData', controller.deleteData)

module.exports = router;