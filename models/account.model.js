module.exports = (sequelize, Sequelize) => {
  const Account = sequelize.define('Account', {
    phone: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    avatar: {
      type: Sequelize.STRING
    },
    active: {
      type: Sequelize.BOOLEAN
    },
    password: {
      type: Sequelize.STRING
    },
    role: {
      type: Sequelize.STRING
    },
    createdAt: {
      type: Sequelize.DATE
    }
  })
  return Account
}
