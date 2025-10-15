const jwt = require('jsonwebtoken')

function isAuth_1(req, res, next) {
    const authorizationHeader = req.get('Authorization')
    const token = authorizationHeader.split(' ')[1]

    if (!token || token === 'null') {
        return next()
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (decodedToken) {
        return res.json({ isLoggedIn: 'You are already logged in!' })
    }
    else {
        next()
    }
}

module.exports.isAuth_1 = isAuth_1


function isAuth_2(req, res, next) {
    const token = req.header('token')
    if (!token || token === 'null') {
        return res.json({ tokenErr: true, message: 'Weldone! But login first!' })
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    if (!decodedToken) {
        return res.json({ invalidToken: true, message: 'Weldone! But Invalid token!' })
    }
    next()
}

module.exports.isAuth_2= isAuth_2