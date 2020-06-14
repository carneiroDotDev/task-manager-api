const mongoose = require('mongoose')
// const validator = require('validator')

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
})

taskSchema.pre('save', async function (next) {
  const task = this

  console.log('pre-save hook')

  // if (task.isModified('completed')) {
  //   task.completed = await bcrypt.hash(user.password, 8)
  // }

  next()
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task

// const newTask = new Task({
//   description: '       Ir ao KVR '
// })

// newTask.save()
//   .then(() => { console.log(newTask) })
//   .catch((error) => { console.log('Error! - ', error) })