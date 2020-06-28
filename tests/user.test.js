const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')

const userOne = {
  name: 'Mike',
  email: 'mike@example.com',
  password: '!Mike11'
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
  await request(app).post('/users/login').send({ ...userOne }).expect(200)
})

test('Should login an existing user', async () => {
  await request(app).post('/users/login').send({ ...userOne }).expect(200)
})

test('Should fail with a non existing user', async () => {
  await request(app).post('/users/login').send({ ...userTwo }).expect('user not found')
})