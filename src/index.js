const app = require('./app')
const port = process.env.PORT //process.env.port will be used by Heroku

app.listen(port, () => {
  console.log('Server is up in port ', port)
})
