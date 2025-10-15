const userModel = require('../models/signup')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs');
const loggedInUsersModel = require('../models/login')


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mdtalha9434@gmail.com',
        pass: process.env.GAP
    }
})

exports.signup = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ validationErrors: errors.array() })
    }
    
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPass = req.body.confirmPass;

    const passwordSalt = bcrypt.genSaltSync(12)
    const confirmPassSalt = bcrypt.genSaltSync(12)

    const hassedConfirmPass = bcrypt.hashSync(password, passwordSalt)
    const hassedPass = bcrypt.hashSync(confirmPass, confirmPassSalt)

    const newUser = new userModel({
        name: name,
        email: email,
        password: hassedPass,
        confirmPass: hassedConfirmPass
    })
    try {
        const savedUser = await newUser.save()
        transporter.sendMail({
            from: 'mdtalha9434@gmail.com',
            to: req.body.email,
            subject: 'Signup Successfull',
            text: 'Signup successfull!',
            html: "<h1>Signup successfull!</h1> <p>It&apos;s our Pleasure. Great to see you Ahead. Hope you would take great experience from here!</p><p>Here is the Login Link- <a href='http://localhost:5173/login'>link</a></p>"
        })
        console.log('new saved user-', savedUser)
    }
    catch (err) {
        console.log('err in saving new user-', err)
    }
    return res.json({ msg: 'Signup successfull!' })
}


exports.login = async (req, res) => {
    const newLoggedInUser = new loggedInUsersModel({ email: req.body.email })
    const savedNewLoggedInUser = await newLoggedInUser.save()
    console.log('savedNewLoggedInUser-', savedNewLoggedInUser)

    const token = jwt.sign({ email: req.body.email }, 'topsecret')
    return res.json({ msg: 'Login successfull!', token: token, email: savedNewLoggedInUser.email })
}


exports.postResetPassword = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({ validationError: errors.array()[0].msg })
    }

    const email = req.body.email
    const token = crypto.randomBytes(10).toString('hex')

    const foundedUserInDataBase = await userModel.findOne({ email: email })
    if (!foundedUserInDataBase) {
        return res.json({ message: 'Signup first!' })
    }

    const newUser = new userModel({
        email: email,
        password: foundedUserInDataBase.password,
        confirmPass: foundedUserInDataBase.confirmPass,
        name: foundedUserInDataBase.name,
        resetToken: token,
        resetTokenExp: (Date.now() + 3600000)
    })

    const savedUser = await newUser.save()
    const deletedUser = await userModel.deleteOne({ email: email })

    console.log('saved user-', savedUser, 'deleted success!-', deletedUser)

    const sentMailInfo = await transporter.sendMail({
        from: 'mdtalha9434@gmail.com',
        to: email,
        subject: 'Reset password',
        text: 'Password reseting Email',
        html: `<h1>Password Reset</h1> <span>reset your password here-</span> <a href=http://localhost:5173/resetPassword/${token}>link<a/>`
    })
    console.log('sentMailInfo-', sentMailInfo)

    res.json({ message: 'Email sent successfull! Visit Gmail- ' })
}


exports.verifyTokenAndresetPass = async (req, res, next) => {
    const token = req.header('resetToken')
    const password = req.body.newPass;
    const confirmPass = req.body.newConfirmPass;

    const userByToken = await userModel.findOne({ resetToken: token })
    if (!userByToken) {
        console.log('Invalid Token!')
        return res.json({ message: 'Token is invalid!' })
    }
    const tokenExp = userByToken.resetTokenExp;
    if (tokenExp < Date.now()) {
        console.log('Token has expired!')
        return res.json({ message: 'Token has expired!' })
    }

    const hassedNewPass = bcrypt.hashSync(password, 12)
    const hassedNewConfirmPass = bcrypt.hashSync(confirmPass, 12)

    const newPassUser = new userModel({
        name: userByToken.name,
        email: userByToken.email,
        password: hassedNewPass,
        confirmPass: hassedNewConfirmPass
    })

    const savedNewPassUser = await newPassUser.save()
    console.log('new saved pass user-', savedNewPassUser)
    const deletedOldPassUser = await userModel.deleteOne({ resetToken: token })
    console.log('old pass user deleted-', deletedOldPassUser)

    return res.json({ message: 'Password reset success! Visit Login page- ' });
}


exports.logout = async (req, res) => {
    const email = req.header('email')
    await loggedInUsersModel.deleteOne({ email: email })
    return res.json({ logoutSuccess: true })
}