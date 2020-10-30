const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const methodOverride = require('method-override')
const {sendCancelationEmail, sendWelcomeEmail} = require('../emails/accounts')

const upload = multer({
    limits: {
        fileSize: 1048576,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            cb(new Error('Please upload a picture file'))
        }
        cb(undefined, true)
    }
})

router.get('/',async (req, res) =>{
    res.send('main Page')
})

router.get('/users/signup',async (req,res)=>{
    res.render('signup')
})
router.post('/users/signup', async (req, res) => {
    try {
        if (req.body.phoneNumber===''){
            delete req.body.phoneNumber
        }
        const user = new User(req.body)
        // sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        await user.save()
        req.session.token = token
        req.session.save(()=>{
            res.redirect('/users/me')
        })
        // res.status(201).send({user, token})
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/login', async (req, res) => {
    if (req.session.token) {
        res.redirect('/users/me')
    } else res.render('login', {message: req.flash('message'),logout:req.flash('logout')})
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)

        const token = await user.generateAuthToken()
        req.session.token = token
        req.session.save(()=>{
            res.redirect('/users/me')
        })
        // res.send({user, token})

    } catch (e) {
        req.flash('message', 'Email or Password Incorrect')
        res.redirect('/users/login')
        // res.status(500).send(e)
    }

})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.redirect('/users/me/edit')
    // res.send()
}, (error, req, res, next) => {
    res.status(400).redirect('/users/me/edit')
    // res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


router.get('/users/me', auth, async (req, res) => {
    try {
        await req.user.populate('recipes').execPopulate()
        res.render('index', {user: req.user})
        // res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me/edit', auth, async (req, res) => {
    console.log(req.user.phoneNumber)
    res.render('edit_profile', {user: req.user})
})

router.patch('/users/me', auth, async (req, res) => {
    let updates = Object.keys(req.body)

    if (req.body.password === '') {
        updates = updates.filter((update) => {
            return update !== 'password'
        })
    }
    const allowedUpdates = ['phoneNumber', 'name', 'email', 'password']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(405).send({error: 'Not a valid operation!'})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.redirect('/users/me')
        // res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        req.flash('logout','Logout Success!')
        req.session.destroy(()=>{
            res.redirect('/users/login')
        })
        // res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        req.session.destroy(()=>{
            res.redirect('/users/login')
        })
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        req.session.destroy(()=>{
            res.redirect('/users/login')
        })
        // sendCancelationEmail(user.email,user.name)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router