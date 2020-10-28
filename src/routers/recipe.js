const express = require('express')
const router = new express.Router()
const Recipe = require('../models/recipe')
const auth = require('../middleware/auth')

router.post('/recipes', auth, async (req, res) => {
    try {
        const recipe = new Recipe({
            ...req.body,
            author: req.user._id
        })
        await recipe.save()
        res.status(201).send(recipe)
    } catch (e) {
        res.status(500).send()
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
        res.send(recipe)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/recipes/:id', auth, async (req, res) => {
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
        res.send(recipe)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/recipes/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findOne({_id: req.params.id, author: req.user._id})
        if (!recipe) {
            res.status(404).send()
        }
        recipe.remove()
        res.send(recipe)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router