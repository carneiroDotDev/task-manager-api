
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
  _id: userOneId,
  name: 'Mike',
  email: 'mike@example.com',
  password: '56what!!',
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
}

const setupDatabase = async () => {
  await User.deleteMany()
  await new User(userOne).save()
}

const userTwo = {
  name: 'Blabla',
  email: 'blabla@example.com',
  password: '!blabla11'
}

module.exports = { userOne, userOneId, userTwo, setupDatabase }
