/* eslint-disable no-const-assign */
module.exports = (sequelize, Sequelize) => {
  const Message = sequelize.define('Message', {
    user_id: {
      type: Sequelize.STRING
    },
    content: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING
    },
    createdAt: {
      type: Sequelize.DATE
    }
  })
  return Message
}
