require('../src/db/mongoose')
const mongoose = require('mongoose')
const express = require('express')
const userRouter = require('../src/routers/user')
const recipeRouter = require('../src/routers/recipe')
const session = require('express-session')
const path = require('path')
const hbs = require('hbs')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const MongoStore = require('connect-mongo')(session)

const app = express()

const viewPath = path.join(__dirname, './templates/views')
const partialsPath = path.join(__dirname, './templates/partials')
const publicPath = path.join(__dirname, '../public')

app.set('views', viewPath)
app.set('view engine', 'hbs')
hbs.registerPartials(partialsPath)

app.use(express.json())
app.use(session({
    secret: 'masakmasak',
    cookie:{maxAge:7200000},
    // maxAge:3000,
    resave: false,
    saveUninitialized: false,
    store:new MongoStore({ mongooseConnection: mongoose.connection })
}))
app.use(flash())
app.use(express.urlencoded({extended: false}))
app.use(express.static(publicPath))
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

app.use(userRouter)
app.use(recipeRouter)


module.exports = app

/*
* cara kerja mongoStore
* set store di session dengan value
* membuat instance basru dari mongostore dengan options
* mongoose connection dari mongoose.connection
* mongoose.connection isinya ada setelah mongoose.connect
*
*
* Cara kerja express session
*
* express session itu middleware
* jadi ketika request datang,session akan membuat data baru di req.session
* req.session ini kita bisa akses datanya mau di tambah,edit hapus dll
* nah ketika sudah di set req.session nya,nanti dikirim ke browser di res
* berupa cookie,yang dikirim bukan data yang di set pas req.session
* tapi hanya id session nya saja
* req.session disimpan di memory node,atau kalau di sini kita simpan ke databse
*jadi ketika browser request ke endpoint
* browser kirim id session
* sama session cari session id yang sama
* ambil data session di DB kemudian simpan di memori node di req.session
*
*
* */