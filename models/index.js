const dbConfig = require('../db/index')

const Sequelize = require('sequelize')
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  port: dbConfig.PORT,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize


db.account = require('./account.model')(sequelize, Sequelize)
db.userRequest = require('./userRequest.model')(sequelize, Sequelize)
db.userContact = require('./userContact.model')(sequelize, Sequelize)
db.userPhoneBook = require('./userPhoneBook.model')(sequelize, Sequelize)
db.userAttend = require('./userAttend.model')(sequelize, Sequelize)
db.room = require('./room.model')(sequelize, Sequelize)
db.message = require('./message.model')(sequelize, Sequelize)
module.exports = db
