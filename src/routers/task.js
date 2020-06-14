const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!task) {
      return res.status(404).send('No such task for this user')
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  // const _task = req.params.id
  const updates = Object.keys(req.body)
  const allowedUpdates = ['completed', 'description']

  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates! ' })
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    // const task = await Task.findById(req.params.id)
    // const task = await Task.findByIdAndUpdate(_task, req.body, { new: true, runValidators: true })
    if (!task) {
      return res.status(404).send('Such task was not found for this user')
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()
    res.status(200).send(task)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

router.post('/tasks', auth, (req, res) => {
  console.log(req.body)
  const task = new Task({
    ...req.body,
    owner: req.user.id
  })

  task.save()
    .then(() => { res.status(201).send(task) })
    .catch((error) => {
      res.status(400).send(error)
    })
})

router.get('/tasks', auth, async (req, res) => {
  // await req.user.populate('tasks').execPopulate()
  // res.send(req.user.tasks)
  // Task.find({ owner: req.user._id })
  //   .then((tasks) => { res.send(tasks) })
  //   .catch((error) => {
  //     res.status(404).send(error)
  //   })

  try {
    const match = {}
    const sort = {}

    if (req.query.completed) {
      match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':')
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send('Error fetching the tasks')
  }
})

router.get('/tasks/:id', auth, (req, res) => {
  const _id = req.params.id

  Task.findOne({ _id, owner: req.user._id }).then(task => {
    if (!task) {
      return res.status(404).send('No task with this id was found')
    }
    res.status(200).send(task)
  }).catch(() => {
    res.status(404).send('No task was found')
  })
})

module.exports = router