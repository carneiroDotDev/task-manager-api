const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_KEY)

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'luuizpaulo@gmail.com',
    subject: 'Welcome to my application',
    html: `<!DOCTYPE html>
    <html>
    <body>
    <h1>Welcome to the app, ${name}. Let me know if you liked it.</h1>
           <img src="https://miro.medium.com/max/8000/1*ciLg4-fezXdbaunhk1E6gQ.jpeg">
           </body>
           </html>`
  })
}

const sendCancelationEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'luuizpaulo@gmail.com',
    subject: 'It hurts to see you go',
    html: `<!DOCTYPE html>
    <html>
    <body>
    <h1>Bye, ${name}.</h1>
    <p>Is there something we could have done to make you stay?</p>
           </body>
           </html>`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}
