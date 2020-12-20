/* eslint-disable camelcase */
const db = require('../models')
const Account = db.account
const CONSTANT = require('../constants/account.constants')
const jwtHelper = require('../helpers/jwt.helper')
const { check, header, query } = require('express-validator')
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
const validateAddFriend = () => {
  return [
    check('user_request_id', CONSTANT.USER_ID_WANT_ADD_FRIEND_IS_REQUIRED).not().isEmpty(),
    check('user_request_id').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      if (user_id === value) {
        return Promise.reject(CONSTANT.USER_ID_WANT_ADD_FRIEND_INVALID)
      }
    }),
    check('user_request_id').custom((value, { req }) => {
      return Account.findByPk(req.body.user_request_id).then((account) => {
        if (!account) {
          return Promise.reject(CONSTANT.USER_ID_WANT_ADD_FRIEND_NOT_FOUND)
        }
      })
    }),
    check('user_request_id').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id

      const result = await db.sequelize.query(`SELECT * FROM public."UserRequests" where ${user_id}=ANY(user_request_id) AND user_id=${value};`)
      if (result[1].rowCount === 1) {
        return Promise.reject(CONSTANT.USER_ID_WANT_ADD_FRIEND_HAD_EXISTS)
      }
    }),
    check('user_request_id').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      const result = await db.sequelize.query(`SELECT * FROM public."UserRequests" where ${value}=ANY(user_request_id) AND user_id=${user_id};`)
      if (result[1].rowCount === 1) {
        return Promise.reject(CONSTANT.REQUIRED_REDIRECT_TO_ACCEPT_FRIEND)
      }
    }),
    check('user_request_id').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      const result = await db.sequelize.query(`SELECT * FROM public."UserContacts" where '${user_id}'=ANY(friend_id) AND user_id='${value}';`)
      if (result[1].rowCount === 1) {
        return Promise.reject(CONSTANT.USER_ID_HAD_ADDED_FRIEND)
      }
    })
  ]
}

const validateAccepFriend = () => {
  return [

    check('user_id_want_accept', CONSTANT.USER_ID_WANT_ACCEPT_FRIEND_IS_REQUIRED).not().isEmpty(),
    check('user_id_want_accept').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      if (value === user_id) {
        return Promise.reject(CONSTANT.USER_WANT_ACCEPT_INVALID)
      }
    }),
    check('user_id_want_accept').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      const result = await db.sequelize.query(`SELECT * FROM public."UserRequests" where ${value}=ANY(user_request_id) AND user_id=${user_id};`)
      if (result[1].rowCount === 0) {
        return Promise.reject(CONSTANT.USER_ACCEPT_NOT_FOUND)
      }
    })
  ]
}

const validateDeclineFriend = () => {
  return [
    check('user_id_want_decline', CONSTANT.USER_ID_WANT_DECLINE_FRIEND_IS_REQUIRED).not().isEmpty(),
    check('user_id_want_decline').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      if (user_id === value) {
        return Promise.reject(CONSTANT.USER_ID_WANT_DECLINE_FRIEND_INVALID)
      }
    }),
    check('user_id_want_decline').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      const result = await db.sequelize.query(`SELECT * FROM public."UserRequests" where ${value}=ANY(user_request_id) AND user_id=${user_id};`)
      if (result[1].rowCount === 0) {
        return Promise.reject(CONSTANT.NOT_FOUND_USER_ID_WANT_DECLINE)
      }
    })
  ]
}

const validatePhoneUserRequest = () => {
  return [
    check('phone', CONSTANT.PHONE_IS_REQUIRED).not().isEmpty(),
    check('phone', CONSTANT.IS_PHONE).matches(/((09|03|07|08|05)+([0-9]{8})\b)/)

  ]
}

const validateDeleteFriend = () => {
  return [
    check('user_id_want_delete').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      console.log(`SELECT * FROM public."UserContacts" where '${value}'=ANY(friend_id) AND user_id='${user_id}'`)
      const result = await db.sequelize.query(`SELECT * FROM public."UserContacts" where '${value}'=ANY(friend_id) AND user_id='${user_id}'`)
      if (result[1].rowCount === 0) {
        return Promise.reject(CONSTANT.USER_DELETE_NOT_FOUND)
      }
    })
  ]
}

const validateTextSearch = () => {
  return [
    // check('value', CONSTANT.NAME_IS_REQUIRED).not().isEmpty()
  ]
}

// fix token
const validateGetListPhoneBookById = () => {
  return [
    header('x-access-token').custom(async (value, { req }) => {
      const decodedApi = await jwtHelper.verifyToken(req.headers['x-access-token'], accessTokenSecret)
      const decoded = decodedApi.data
      console.log(decoded)
      const result = await db.sequelize.query(`select *  FROM public."Accounts" where id='${decoded.id}'`)
      if (result[1].rowCount === 0) {
        return Promise.reject(CONSTANT.USER_ID_PHONE_BOOK_NOT_FOUND)
      }
    }),
    header('x-access-token').custom(async (value, { req }) => {
      const decodedApi = await jwtHelper.verifyToken(req.headers['x-access-token'], accessTokenSecret)
      const decoded = decodedApi.data
      const result = await db.sequelize.query(`select *  FROM public."UserPhoneBooks" where user_id='${decoded.id}'`)
      if (result[1].rowCount === 0 || result[0][0].user_phone_book_id === null || typeof result[0][0].user_phone_book_id === 'undefined' || result[0][0].user_phone_book_id.length <= 0) {
        return Promise.reject(CONSTANT.USER_ID_PHONE_BOOK_DONT_HAVE_ANY_LIST_USER)
      }
    })
  ]
}

const validateGetFriendRequestById = () => {
  return [
    header('x-access-token').custom(async (value, { req }) => {
      const decodedApi = await jwtHelper.verifyToken(req.headers['x-access-token'], accessTokenSecret)
      const decoded = decodedApi.data
      const result = await db.sequelize.query(`select *  FROM public."Accounts" where id='${decoded.id}'`)
      if (result[1].rowCount === 0) {
        return Promise.reject(CONSTANT.USER_ID_REQUEST_ID_NOT_FOUND)
      }
    }),
    header('x-access-token').custom(async (value, { req }) => {
      const decodedApi = await jwtHelper.verifyToken(req.headers['x-access-token'], accessTokenSecret)
      const decoded = decodedApi.data
      const result = await db.sequelize.query(`select *  FROM public."UserRequests" where user_id='${decoded.id}'`)

      if (result[1].rowCount === 0 || result[0][0].user_request_id === null || typeof result[0][0].user_request_id === 'undefined' || result[0][0].user_request_id.length <= 0) {
        return Promise.reject(CONSTANT.USER_ID_DONT_HAVE_ANY_LIST_REQUEST)
      }
    })
  ]
}

const validateGetFriendContactById = () => {
  return [
    header('x-access-token').custom(async (value, { req }) => {
      const decodedApi = await jwtHelper.verifyToken(req.headers['x-access-token'], accessTokenSecret)
      const decoded = decodedApi.data
      const result = await db.sequelize.query(`select *  FROM public."Accounts" where id='${decoded.id}'`)
      if (result[1].rowCount === 0) {
        return Promise.reject(CONSTANT.USER_ID_CONTACT_NOT_FOUND)
      }
    }),
    header('x-access-token').custom(async (value, { req }) => {
      const decodedApi = await jwtHelper.verifyToken(req.headers['x-access-token'], accessTokenSecret)
      const decoded = decodedApi.data
      const result = await db.sequelize.query(`select *  FROM public."UserContacts" where user_id='${decoded.id}'`)
      if (result[1].rowCount === 0 || result[0][0].friend_id === null || typeof result[0][0].friend_id === 'undefined' || result[0][0].friend_id.length <= 0) {
        return Promise.reject(CONSTANT.USER_ID_DONT_HAVE_ANY_LIST_CONTACT)
      }
    })
  ]
}

const validateGetSearchFriendByPhone = () => {
  return [
    // check('phone').custom(async (value, { req }) => {
    //   const result = await db.sequelize.query(`SELECT * FROM public."Accounts" WHERE phone @@ to_tsquery('${value}:*')`)
    //   if (result[1].rowCount === 0) {
    //     return Promise.reject(CONSTANT.NOT_FOUND_USER)
    //   }
    // })
  ]
}

const validateDeletePhoneByIdUserRequest = () => {
  return [
    query('user_id_want_delete', CONSTANT.USER_WANT_DELETE_IS_REQUIRED).not().isEmpty(),
    query('user_id_want_delete').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      if (user_id === value) {
        return Promise.reject(CONSTANT.USER_WANT_DELETE_IS_INVALID)
      }
    }),
    query('user_id_want_delete').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      const result = await db.sequelize.query(`SELECT * FROM public."UserRequests" where ${value}=ANY(user_request_id) AND user_id=${user_id};`)
      if (result[1].rowCount === 0) {
        return Promise.reject(CONSTANT.NOT_FOUND_USER_WANT_DELETE)
      }
    })
  ]
}

const validateDeletePhoneByIdUserContact = () => {
  return [
    query('user_id_want_delete', CONSTANT.USER_WANT_DELETE_IS_REQUIRED).not().isEmpty(),
    query('user_id_want_delete').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      if (user_id === value) {
        return Promise.reject(CONSTANT.USER_WANT_DELETE_IS_INVALID)
      }
    }),
    query('user_id_want_delete').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      const result = await db.sequelize.query(`SELECT * FROM public."UserContacts" where '${value}'=ANY(friend_id) AND user_id='${user_id}';`)
      if (result[1].rowCount === 0) {
        return Promise.reject(CONSTANT.NOT_FOUND_USER_WANT_DELETE)
      }
    })
  ]
}

const validateDeletePhoneByIdUserPhoneBook = () => {
  return [

    query('user_id_want_delete', CONSTANT.USER_WANT_DELETE_IS_REQUIRED).not().isEmpty(),
    query('user_id_want_delete').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      if (user_id === value) {
        return Promise.reject(CONSTANT.USER_WANT_DELETE_IS_INVALID)
      }
    }),
    query('user_id_want_delete').custom(async (value, { req }) => {
      const decoded = await jwtHelper.verifyToken(
        req.headers['x-access-token'],
        accessTokenSecret
      )
      const accountDecode = decoded.data
      const user_id = accountDecode.id
      const result = await db.sequelize.query(`SELECT * FROM public."UserPhoneBooks" where '${value}'=ANY(user_phone_book_id) AND user_id='${user_id}';`)
      if (result[1].rowCount === 0) {
        return Promise.reject(CONSTANT.NOT_FOUND_USER_WANT_DELETE)
      }
    })
  ]
}

module.exports = {
  validateAddFriend: validateAddFriend,
  validateAccepFriend: validateAccepFriend,
  validateDeclineFriend: validateDeclineFriend,
  validatePhoneUserRequest: validatePhoneUserRequest,
  validateTextSearch: validateTextSearch,
  validateDeleteFriend: validateDeleteFriend,
  validateGetListPhoneBookById: validateGetListPhoneBookById,
  validateGetFriendRequestById: validateGetFriendRequestById,
  validateGetFriendContactById: validateGetFriendContactById,
  validateGetSearchFriendByPhone: validateGetSearchFriendByPhone,
  validateDeletePhoneByIdUserRequest: validateDeletePhoneByIdUserRequest,
  validateDeletePhoneByIdUserContact: validateDeletePhoneByIdUserContact,
  validateDeletePhoneByIdUserPhoneBook: validateDeletePhoneByIdUserPhoneBook
}
