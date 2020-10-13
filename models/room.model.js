/* eslint-disable no-const-assign */
module.exports = (sequelize, Sequelize) => {
  const Room = sequelize.define('Room', {
    name: {
      type: Sequelize.STRING
    },
    list_message: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    type: {
      type: Sequelize.STRING
    },
    createdAt: {
      type: Sequelize.DATE
    }
  })
  return Room
}
