const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')

const router = new express.Router()
const upload = multer({
  // dest: './src/avatars',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image file'))
    }

    cb(undefined, true);
  }
})

// const errorMiddleware = (req, res, next) => {
//   throw new Error('From my middleware')
// }

router.get('/', (req, res) => {
  res.send('There is no route set for home')
})

router.post('/users', async (req, res) => {
  // console.log(req.body)
  const user = new User(req.body)
  const token = await user.generateAuthToken()

  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    res.status(201).send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(500).send('user not found')
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token
    })

    await req.user.save()
    res.status(200).send('Success - Logged out')
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save()
    res.status(200).send('You have been logged out of all sessions')
  } catch (e) {
    res.status(500).send()
  }
})

// router.get('/users', auth, async (req, res) => {
//   // This route is senseless since it retrieves and exposes the data of 
//   // all users. This was substituted to /users/me 
//   try {
//     const users = await User.find({})
//     res.send(users)
//   }
//   catch (e) {
//     res.status(400).send(e)
//   }
// })

router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})

// should be depricated
router.get('/users/:id', async (req, res) => {
  const _id = req.params.id

  try {
    const user = await User.findById(_id)
    if (!user) {
      return res.status(404).send()
    }
    res.status(200).send(user)
  }
  catch (e) {
    res.status(500).send()
  }
})

router.patch('/users/me', auth, async (req, res) => {
  // const _id = req.params.id
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']

  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates! ' })
  }

  try {
    // const user = await User.findById(req.params.id)
    const user = req.user
    updates.forEach((update) => user[update] = req.body[update])
    await user.save()

    // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
    if (!user) {
      return res.status(404).send()
    }
    res.status(200).send(user)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.user._id)

    // if (!user) {
    //   return res.status(404).send()
    // }

    await req.user.remove()
    sendCancelationEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

  req.user.avatar = buffer
  await req.user.save()
  res.send('Avatar uploaded')

}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send('Avatar deleted')
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
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
    res.status(404).send('Avatar picture not found')
  }
})

module.exports = router