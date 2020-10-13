/* eslint-disable no-const-assign */
module.exports = (sequelize, Sequelize) => {
  const UserAttend = sequelize.define('UserAttend', {
    room_id: {
      type: Sequelize.STRING
    },
    user_id: {
      type: Sequelize.STRING
    },
    createdAt: {
      type: Sequelize.DATE
    }
  })
  return UserAttend
}
