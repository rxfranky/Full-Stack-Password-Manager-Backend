const express = require('express')
const router = express.Router()

const { body } = require('express-validator')
const { validationResult } = require('express-validator')

const bcrypt = require('bcryptjs')

const controller = require('../controllers/auth')
const userModel = require('../models/signup')
const isAuth = require('../util/isAuth')


router.post('/signup', [
    body('name').notEmpty().withMessage('please enter name!').bail().matches(/^[A-Za-z\s]+$/).withMessage('please enter valid name!'),

    body('email').notEmpty().withMessage('please enter email!').bail().isEmail().withMessage('enter valid email!').bail().custom(async (val) => {
        const email = await userModel.findOne({ email: val })
        if (email) {
            throw new Error() // or reject promise
        }
    }).withMessage('email already exist!'),

    body('password').notEmpty().withMessage('please enter password!').bail().isLength({ min: 4 }).withMessage('password must contain four chars!'),

    body('confirmPass').notEmpty().withMessage('please enter confirm password!').bail().custom((val, { req }) => {
        return val === req.body.password;
    }).withMessage('confirm password does not match!')
], controller.signup)


router.post('/login', isAuth.isAuth_1, [body('email').notEmpty().bail().withMessage('Please enter email').isEmail().withMessage('Please enter valid email!').bail().custom(async (email) => {
    const foundedEmail = await userModel.findOne({ email: email })
    if (!foundedEmail) {
        throw new Error()
    }
}).withMessage('Email not found!')], (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ emailValidationError: errors.array() })
    }
    next()
}, [body('password').notEmpty().withMessage('Please enter password').bail().isLength({ min: 4 }).withMessage('Password is sort!').bail().custom(async (password, { req }) => {
    const user = await userModel.findOne({ email: req.body.email })
    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) {
        throw new Error()
    }
}).withMessage('Incorrect password entered!')], (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ passwordValidationError: errors.array() })
    }
    next()
}, controller.login)


router.post('/resetPassword', [body('email').notEmpty().withMessage('Please enter email!').bail().isEmail().withMessage('Please enter valid email!')], controller.postResetPassword)

router.post('/verifyToken&resetPass', [body('newPass').notEmpty().withMessage('Please enter password!').bail().isLength({ min: 4 }).withMessage('Password should be four chars long!'),

body('newConfirmPass').notEmpty().withMessage('Please enter confirm password!').bail().custom((newConfirmPass, { req }) => {
    if (newConfirmPass !== req.body.newPass) {
        throw new Error('Password and Confirm Password should be same!');
    }
    return true;
})
], (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ validationErr: errors.array() })
    }
    next();
}, controller.verifyTokenAndresetPass)


router.get('/logout', isAuth.isAuth_2, controller.logout)

module.exports = router