module.exports = (sequelize, Sequelize) => {
  const UserRequest = sequelize.define('UserRequest', {
    user_request_id: {
      type: Sequelize.ARRAY(Sequelize.INTEGER)
    },
    user_id: {
      type: Sequelize.INTEGER
    },
    createdAt: {
      type: Sequelize.DATE
    }
  })
  return UserRequest
}
