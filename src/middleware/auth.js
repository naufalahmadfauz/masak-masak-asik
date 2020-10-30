const User = require('../models/user');
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    try {
        
        let token;

        if (req.header('Authorization')){
            token = req.header('Authorization').replace('Bearer ', '')
        }else token = req.session.token

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        if (!user) {
            await req.session.destroy()
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    }catch (e) {
        res.status(401).send('Please login first!')
    }
}

module.exports = auth