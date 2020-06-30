const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

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

const userTwo = {
  name: 'Blabla',
  email: 'blabla@example.com',
  password: '!blabla11'
}

beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

test('should signup a new user', async () => {
  await request(app).post('/users').send({
    name: 'Luiz',
    email: 'eita@example.com',
    password: '!Luiz11',
    age: '31'
  }).expect(201)
})

test('Should login an existing user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)
})

test('Should fail with a non existing user', async () => {
  await request(app).post('/users/login').send({ ...userTwo }).expect('user not found')
})

test('Should get profile for user', async () => {

  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should not delete user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect('{"error":"Please authenticate yourself"}')
})

test('Should delete user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})