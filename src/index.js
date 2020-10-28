const app = require('./app')

app.listen(process.env.PORT,()=>{
    console.log('server is up and running on port ',process.env.PORT)
})
// const Recipe = require('./models/recipe')
// const User = require('./models/user')
//
// const main = async ()=>{
//     const recipe =await  Recipe.findById("5f885008f7b64509b4c042b6")
//     await recipe.populate('author').execPopulate()
//     console.log(recipe)
//
//     // const user =await  User.findById("5f884fa2e2291a12acdec3a9")
//     // await user.populate('recipes').execPopulate()
//     // console.log(user.recipes)
// }
// main()