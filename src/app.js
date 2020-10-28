require('../src/db/mongoose')
const express = require('express')
const userRouter = require('../src/routers/user')
const recipeRouter = require('../src/routers/recipe')
const session = require('express-session')
const path = require('path')
const hbs = require('hbs')
const flash = require('connect-flash')
const methodOverride = require('method-override')

const app = express()


const viewPath = path.join(__dirname, './templates/views')
const partialsPath = path.join(__dirname, './templates/partials')
const publicPath = path.join(__dirname, '../public')

app.set('views',viewPath)
app.set('view engine','hbs')
hbs.registerPartials(partialsPath)
// app.engine('html', hbs.__express)

app.use(express.json())
app.use(session({ secret: 'masakmasak',resave:false,saveUninitialized: true}))
app.use(flash())

app.use(express.urlencoded({extended:false}))
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