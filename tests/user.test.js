const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOne, userOneId, userTwo, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('should signup a new user', async () => {
  const response = await request(app).post('/users').send({
    name: 'Luiz',
    email: 'eita@example.com',
    password: '!Luiz11',
    age: '31'
  }).expect(201)

  // Assertion about the database was changed 
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  //Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Luiz',
      email: 'eita@example.com'
    },
    token: user.tokens[0].token
  })

  expect(user.password).not.toBe('!Luiz11')
})

test('Should login an existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)

  const user = await User.findById(userOne._id)
  expect(user).not.toBeNull()

  expect(response.body.token).toBe(user.tokens[1].token)

  expect(response.body).toMatchObject({
    user: {
      name: 'Mike',
      email: 'mike@example.com'
    },
    token: user.tokens[1].token
  })
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
  const response = await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  const user = await User.findById(response.body._id)
  expect(user).toBeNull()
})

test('should upload avatar image', async () => {
  await request(app).post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', './tests/fixtures/profile-pic.jpg')
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update user data', async () => {
  await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ name: 'Luizzzzzzz' })
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user.name).toBe('Luizzzzzzz')
})

test('should not update user invalid field', async () => {
  await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ tokens: '' })
    .expect({ error: 'Invalid updates! ' })
})