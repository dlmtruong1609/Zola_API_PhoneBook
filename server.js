const express = require('express')
const userRouter = require('./routes/user.route')
const logger = require('morgan')

require('dotenv').config()

const cors = require('cors')
const server = express()

server.use(logger('dev'))

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: false }))
server.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// router
server.use('/', userRouter)

const db = require('./models')
db.sequelize.sync({ alter: true }).then(() => {
  console.log('Drop and re-sync db.')
})
try {
  db.sequelize.authenticate()
  console.log('Connection has been established successfully.')
} catch (error) {
  console.error('Unable to connect to the database:', error)
}

server.listen(process.env.PORT || '3210', (err) => {
  if (err) throw err
  console.log('> Ready on http://localhost:3210')
})
