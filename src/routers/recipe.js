const express = require('express')
const router = new express.Router()
const Recipe = require('../models/recipe')
const auth = require('../middleware/auth')


router.get('/recipes/new',auth,async (req,res)=>{
    res.render('create_recipe',{requiredtitle:req.flash('required')})
})
router.post('/recipes', auth, async (req, res) => {
    if(req.body.completed==='on'){
        req.body.completed=true
    }
    try {
        const recipe = new Recipe({
            ...req.body,
            author: req.user._id
        })
        await recipe.save()
        res.status(201).redirect('/recipes')
        // res.status(201).send(recipe)
    } catch (e) {
        req.flash('required','Judul Resep Tidak Boleh Kosong!')
        res.status(500).redirect('/recipes/new')
    }

})

router.get('/recipes', auth, async (req, res) => {
    try {
        let searchCriteria = {}
        let sort = {}
        
        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1]
        }

        if (req.query.completed) {
            searchCriteria.completed = req.query.completed === 'true'
            searchCriteria.author = req.user._id
        } else searchCriteria.author = req.user._id

        const recipes = await Recipe.find(searchCriteria, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        })

        // const match ={}
        // const sort = {}
        // if (req.query.completed){
        //     match.completed = req.query.completed==='true'
        // }
        //
        // if (req.query.sortBy){
        //     const parts = req.query.sortBy.split(':')
        //     sort[parts[0]] = parts[1]==='desc'?-1:1
        // }
        //
        // await req.user.populate({
        //     path:'recipes',
        //     match,
        //     options:{
        //         limit:parseInt(req.query.limit),
        //         skip:parseInt(req.query.skip),
        //         sort
        //     }
        // }).execPopulate()

        // if (!recipes){
        //     res.status(404).send()
        // }
        res.render('recipes',{recipes})
        // res.send(recipes)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/recipes/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({_id: req.params.id, author: req.user._id})

        if (!recipe) {
            res.status(404).send()
        }
        res.render('recipe',{recipe})
        // res.send(recipe)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/recipes/:id/edit', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({_id: req.params.id, author: req.user._id})

        if (!recipe) {
            res.status(404).send()
        }
        console.log(recipe.completed)
        res.render('recipe_edit',{recipe,requiredtitle:req.flash('required')})
        // res.send(recipe)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/recipes/:id', auth, async (req, res) => {
    console.log(req.params)
    if (req.body.completed==='on'){
        req.body.completed = true
    }else req.body.completed = false
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({error: 'Not a valid operation!'})
    }
    try {
        const recipe = await Recipe.findOne({_id: req.params.id, author: req.user.id})

        if (!recipe) {
            res.status(404).send()
        }

        updates.forEach((update) => {
            recipe[update] = req.body[update]
        })
        await recipe.save()
        res.redirect('/recipes')
        // res.send(recipe)
    } catch (e) {
        req.flash('required','Judul Resep Tidak Boleh Kosong!')
        res.status(500).redirect(`/recipes/${req.params.id}/edit`)
    }
})

router.delete('/recipes/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({_id: req.params.id, author: req.user._id})
        if (!recipe) {
            res.status(404).send()
        }
        recipe.remove()
        res.redirect('/recipes')
        // res.send(recipe)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router