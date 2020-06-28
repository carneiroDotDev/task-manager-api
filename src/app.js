const express = require('express')
const userRouter = require('./routers/user')
const userTask = require('./routers/task')
require('./db/mongoose')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(userTask)

module.exports = app

// const multer = require('multer')
// const upload = multer({
//   dest: 'images'
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//   res.send('Image uploaded')
// })

// app.use((req, res, next) => {
//   if (req.method === 'GET') {
//     res.send('Get requests are disabled')
//   } else {
//     next()
//   }
// })

// app.use((req, res, next) => {
//   res.status(503).send('We are under maintanance')
// })

// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//   token = jwt.sign({ _id: '123' }, 'jsonwebtoken', { expiresIn: '7 days' })
//   console.log(token)

//   const data = jwt.verify(token, 'jsonwebtoken')
//   console.log(data)
// }

// myFunction()

// const Task = require('./models/task')
// const User = require('./models/user')
// const relationalData = async () => {
//   // const task = await Task.findById('5ed40f03d8bd65ef6a996baf')
//   // await task.populate('owner').execPopulate()
//   // console.log(task.owner)

//   const user = await User.findById('5ed40ea50d55e3ede142fcdd')
//   await user.populate('tasks').execPopulate()
//   console.log(user.tasks)
// }

// relationalData()

