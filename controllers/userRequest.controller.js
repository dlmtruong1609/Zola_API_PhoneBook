/* eslint-disable camelcase */
const db = require('../models')
const Account = db.account
const UserRequest = db.userRequest
const UserContact = db.userContact
const { validationResult } = require('express-validator')
const CONSTANT = require('../constants/account.constants')
const { userPhoneBook } = require('../models')
const jwtHelper = require('../helpers/jwt.helper')
require('dotenv').config()
// Biến cục bộ trên server này sẽ lưu trữ tạm danh sách token
// Nen lưu vào Redis hoặc DB
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// format trả về err
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  // Build your resulting errors however you want! String, object, whatever - it works!
  return {
    msg: msg,
    param: param
  }
}

const fieldAllowInJson = 'id,phone,email,name,avatar,active,role,"createdAt","updatedAt"'

const addFriend = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = decoded.data
  const user_id = accountDecode.id
  const user_request_id = req.body.user_request_id // Đây là id của user mà user đó muốn kết bạn
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const userRequestFind = await UserRequest.findOne({
      where: { user_id: user_request_id }
    })
    if (userRequestFind === null) {
      // khoi tao lan dau
      const listUserRequest = []
      listUserRequest.push(user_id)
      await UserRequest.create({
        user_id: user_request_id,
        user_request_id: listUserRequest
      })
      return res.status(200).send({
        message: CONSTANT.WAITING_USER_ACCEPT
      })
    } else {
      // da khoi tao
      userRequestFind.user_request_id.push(user_id)
      await UserRequest.update({
        user_request_id: userRequestFind.user_request_id
      }, {
        where: { id: userRequestFind.id }
      })
      return res.status(200).send({
        message: CONSTANT.WAITING_USER_ACCEPT
      })
    }
  } else {
    res.status(400).send(errs.array())
  }
}

const getALLlistUserRequest = async (req, res) => {
  try {
    const users = await UserRequest.findAll({
    })
    return res.status(200).send(users)
  } catch (_err) {
    console.log(_err)
    return res.status(500).send({
      message: CONSTANT.SERVER_ERROR
    })
  }
}

const acceptFriend = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  // user phone
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = decoded.data
  const user_id = accountDecode.id

  // user phone want accept friend
  const user_id_want_accept = req.body.user_id_want_accept
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    // xu ly user contact thu 1
    const userRequest = await UserRequest.findOne({ where: { user_id: user_id } })
    userRequest.user_request_id.forEach((element, number, object) => {
      if (element === parseInt(user_id_want_accept)) {
        object.splice(number, 1)
      }
    })
    // move user request to user contact
    await UserRequest.update({
      user_request_id: userRequest.user_request_id
    }, {
      where: {
        id: userRequest.id
      }
    })

    // user one
    // neu khoi tao lan dau
    const listFriendContactOne = []
    const result = await db.sequelize.query(`select * from public."UserContacts" where user_id='${user_id}'`)
    if (typeof result[0][0] === 'undefined') {
      listFriendContactOne.push(user_id_want_accept)
      await UserContact.create({
        user_id: user_id,
        friend_id: listFriendContactOne
      })
    } else {
      result[0][0].friend_id.push(user_id_want_accept)
      await UserContact.update({
        friend_id: result[0][0].friend_id
      }, {
        where: {
          id: result[0][0].id
        }
      })
    }

    // userTwo
    // neu khoi tao lan dau
    const listFriendContactTwo = []
    const resultUserTwo = await db.sequelize.query(`select * from public."UserContacts" where user_id='${user_id_want_accept}'`)
    if (typeof resultUserTwo[0][0] === 'undefined') {
      listFriendContactTwo.push(user_id)
      await UserContact.create({
        user_id: user_id_want_accept,
        friend_id: listFriendContactTwo
      })
    } else {
      resultUserTwo[0][0].friend_id.push(user_id)
      await UserContact.update({
        friend_id: resultUserTwo[0][0].friend_id
      }, {
        where: {
          id: resultUserTwo[0][0].id
        }
      })
    }

    res.status(200).send({
      message: CONSTANT.ACCEPT_SUCCESS
    })

    // // tao room chung vi ca 2 dieu kien tren deu thanh cong
    // room.create({
    //   name: null,
    //   list_message: [],
    //   type: null
    // }).then(roomCreate => {
    //   userAttend.create({
    //     room_id: roomCreate.id,
    //     user_id: user_id
    //   })
    //   userAttend.create({
    //     room_id: roomCreate.id,
    //     user_id: user_id_want_accept
    //   })
    //     .then(userContactCreate => {
    //       return res.status(200).send(
    //         new Response(true, CONSTANT.USER_CONTACT_UPDATE_SUCCESS, null)
    //       )
    //     })
    // });
  } else {
    res.status(400).send(errs.array())
  }
}

const declineFriend = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  // user phone
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = decoded.data
  const user_id = accountDecode.id
  // user phone want accept friend
  const user_id_want_accept = req.body.user_id_want_decline
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const userRequest = await UserRequest.findOne({ where: { user_id: user_id } })
    userRequest.user_request_id.forEach((element, number, object) => {
      if (element === parseInt(user_id_want_accept)) {
        object.splice(number, 1)
      }
    })
    await UserRequest.update({
      user_request_id: userRequest.user_request_id
    }, {
      where: {
        id: userRequest.id
      }
    })
    return res.status(200).send({
      message: CONSTANT.USER_DECLINE_UPDATE_SUCCESS
    })
  } else {
    res.status(400).send(errs.array())
  }
}

const deleteFriend = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  // user phone
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = await decoded.data
  const user_id = accountDecode.id
  console.log('usser_id: ' + user_id)
  // user phone want accept friend
  const user_id_want_delete = req.query.user_id_want_delete

  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const userContact = await UserContact.findOne({ where: { user_id: user_id } })
    // console.log(userContact.friend_id.length)
    userContact.friend_id.forEach((element, number, object) => {
      if (element === user_id_want_delete) {
        object.splice(number, 1)
      }
    })
    // console.log(userContact.friend_id.length)
    await UserContact.update({
      friend_id: userContact.friend_id
    }, {
      where: {
        id: userContact.id
      }
    })

    const userContactDelete = await UserContact.findOne({ where: { user_id: user_id_want_delete } })
    // console.log(userContactDelete.friend_id.length)
    userContactDelete.friend_id.forEach((element, number, object) => {
      if (element === user_id) {
        object.splice(number, 1)
      }
    })
    // console.log(userContactDelete.friend_id.length)
    await UserContact.update({
      friend_id: userContactDelete.friend_id
    }, {
      where: {
        id: userContactDelete.id
      }
    })
    return res.status(200).send({
      message: CONSTANT.USER_DELETE_UPDATE_SUCCESS
    })
  } else {
    res.status(400).send(errs.array())
  }
}

const getListFriendRequestByPhoneUser = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const user_phone = req.query.phone
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`select ${fieldAllowInJson} from public."Accounts" a join public."UserRequests" b on a.id = b.user_id where a.phone='${user_phone}'`)
    if (typeof result[0][0] === 'undefined') {
      return res.status(200).send({
        message: CONSTANT.DONT_HAVE_ANY_FRIEND_REQUEST
      })
    }
    // console.log(result[0][0].user_request_id);
    const listUserFound = await Account.findAll({
      where: { id: result[0][0].user_request_id }
    })
    return res.status(200).send(listUserFound)
  } else {
    res.status(400).send(errs.array())
  }
}

const getListFriendContactByPhoneUser = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  // user phone
  const user_phone = req.query.phone
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`select ${fieldAllowInJson} from public."Accounts" a join public."UserContacts" b on a.id = cast(b.user_id as int) where a.phone='${user_phone}'`)
    if (typeof result[0][0] === 'undefined') {
      return res.status(200).send({
        message: CONSTANT.DONT_HAVE_ANY_FRIEND_CONTACT
      })
    }
    const listUserFound = await Account.findAll({
      where: { id: result[0][0].friend_id }
    })
    return res.status(200).send(listUserFound)
  } else {
    res.status(400).send(errs.array())
  }
}

const getListPhoneBookByPhoneUser = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  // user phone
  const user_phone = req.query.phone
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`select ${fieldAllowInJson} from public."Accounts" a join public."UserPhoneBooks" b on a.id = cast(b.user_id as int) where a.phone='${user_phone}'`)
    if (typeof result[0][0] === 'undefined') {
      return res.status(200).send({
        message: CONSTANT.DONT_HAVE_ANY_FRIEND_BOOK
      })
    }
    // console.log(result[0][0].user_request_id);
    const listUserFound = await Account.findAll({
      where: { id: result[0][0].user_phone_book_id }
    })
    return res.status(200).send(listUserFound)
  } else {
    res.status(400).send(errs.array())
  }
}

// fix
const getTextSearch = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung

  const value = req.query.value
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`SELECT ${fieldAllowInJson} FROM public."Accounts" WHERE phone like '${value}%' or name like '${value}%' or  email like '${value}%'`)
    if (typeof result[0][0] === 'undefined') {
      return res.status(200).send([])
    } else {
      return res.status(200).send(result[0])
    }
  } else {
    res.status(400).send(errs.array())
  }
}

// fix
const getListPhoneBookById = async (req, res) => {
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = decoded.data
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const value = accountDecode.id
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`select *  FROM public."UserPhoneBooks" where user_id='${value}'`)
    const listUserFound = await Account.findAll({
      where: { id: result[0][0].user_phone_book_id }
    }, {
      attributes: {
        exclude: ['password']
      }
    })
    return res.status(200).send(listUserFound)
  } else {
    res.status(400).send(errs.array())
  }
}

// fix
const getListRequestByUserId = async (req, res) => {
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = decoded.data
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const value = accountDecode.id
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`select *  FROM public."UserRequests" where user_id=${value}`)
    const listUserFound = await Account.findAll({
      where: { id: result[0][0].user_request_id }
    }, {
      attributes: {
        exclude: ['password']
      }
    })
    return res.status(200).send(listUserFound)
  } else {
    res.status(400).send(errs.array())
  }
}

// fix
const getListFriendContactById = async (req, res) => {
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = decoded.data
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const value = accountDecode.id
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`select *  FROM public."UserContacts" where user_id='${value}'`)
    // result[0]
    const listUserFound = await Account.findAll({
      where: { id: result[0][0].friend_id }
    }, {
      attributes: {
        exclude: ['password']
      }
    })
    return res.status(200).send(listUserFound)
  } else {
    res.status(400).send(errs.array())
  }
}

// fix
const getSearchUserByPhone = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const value = req.query.phone
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`SELECT ${fieldAllowInJson} FROM public."Accounts" WHERE phone @@ to_tsquery('${value}:*')`)
    if (typeof result[0][0] === 'undefined') {
      return res.status(200).send([])
    } else {
      return res.status(200).send(result[0][0])
    }
  } else {
    res.status(400).send(errs.array())
  }
}

// delete phone by id
// delete in userContact

// if type collection :
// = 1: userRequest
// = 2: userContact
// = 3: userPhoneBook
const deletePhoneByIdCommon = async (req, res, typeCollection) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  // user phone
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = decoded.data
  const user_id = accountDecode.id
  console.log(user_id + 'test')
  // user phone want accept friend
  const user_id_want_delete = req.query.user_id_want_delete
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    if (typeCollection === 1) {
      const result = await db.sequelize.query(`SELECT * FROM public."UserRequests" WHERE user_id=${user_id}`)
      result[0][0].user_request_id.forEach((element, number, object) => {
        if (element === parseInt(user_id_want_delete)) {
          object.splice(number, 1)
        }
      })
      await UserRequest.update({
        user_request_id: result[0][0].user_request_id
      }, {
        where: {
          id: result[0][0].id
        }
      })
      return res.status(200).send({
        message: CONSTANT.DELETE_PHONE_BY_ID_REQUEST_SUCCESS
      })
    }
    if (typeCollection === 2) {
      const result = await db.sequelize.query(`SELECT * FROM public."UserContacts" WHERE user_id='${user_id}'`)
      result[0][0].friend_id.forEach((element, number, object) => {
        if (element === user_id_want_delete) {
          object.splice(number, 1)
        }
      })
      await UserContact.update({
        friend_id: result[0][0].friend_id
      }, {
        where: {
          id: result[0][0].id
        }
      })

      const resultUserTwo = await db.sequelize.query(`SELECT * FROM public."UserContacts" WHERE user_id='${user_id_want_delete}'`)
      resultUserTwo[0][0].friend_id.forEach((element, number, object) => {
        if (element === user_id) {
          object.splice(number, 1)
        }
      })
      await UserContact.update({
        friend_id: resultUserTwo[0][0].friend_id
      }, {
        where: {
          id: resultUserTwo[0][0].id
        }
      })
      return res.status(200).send({
        message: CONSTANT.DELETE_PHONE_BY_ID_CONTACT_SUCCESS
      })
    }
    if (typeCollection === 3) {
      const result = await db.sequelize.query(`SELECT * FROM public."UserPhoneBooks" WHERE user_id='${user_id}'`)
      result[0][0].user_phone_book_id.forEach((element, number, object) => {
        if (element === user_id_want_delete) {
          object.splice(number, 1)
        }
      })
      await userPhoneBook.update({
        user_phone_book_id: result[0][0].user_phone_book_id
      }, {
        where: {
          id: result[0][0].id
        }
      })
      return res.status(200).send({
        message: CONSTANT.DELETE_PHONE_BY_ID_PHONEBOOK_SUCCESS
      })
    }
  } else {
    res.status(400).send(errs.array())
  }
}

const deletePhoneInUserRequest = (req, res) => {
  deletePhoneByIdCommon(req, res, 1)
}

const deletePhoneInUserContact = (req, res) => {
  deletePhoneByIdCommon(req, res, 2)
}

const deletePhoneInUserPhoneBook = (req, res) => {
  deletePhoneByIdCommon(req, res, 3)
}

const postSyncPhonebook = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = decoded.data
  const user_id = accountDecode.id
  const list = req.body.listPhoneBook
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    // loc account co dk trong he thong
    const listAccount = []
    list.forEach(element => {
      listAccount.push("'" + element + "'")
    })
    const resultFindAccount = await db.sequelize.query(`select ${fieldAllowInJson} from public."Accounts" where phone in (${listAccount})`)
    console.log(`select * from public."Accounts" where user_id in (${listAccount})`)
    const listAccountId = []
    console.log(resultFindAccount[0][0])
    resultFindAccount[0].forEach(element => {
      // console.log(element)
      listAccountId.push(element.id)
    })
    const result = await db.sequelize.query(`select * from public."UserPhoneBooks" where user_id='${user_id}'`)
    // //da khoi tao

    if (typeof result[0][0] !== 'undefined') {
      await userPhoneBook.update({
        user_phone_book_id: listAccountId
      }, {
        where: { id: result[0][0].id }
      })
      return res.status(200).send({
        message: CONSTANT.SYNC_SUCCESS
      })
    } else {
      // chua khoi tao
      await userPhoneBook.create({
        user_id: user_id,
        user_phone_book_id: listAccountId
      })
      return res.status(200).send({
        message: CONSTANT.SYNC_SUCCESS
      })
    }
  } else {
    res.status(400).send(errs.array())
  }
}

const getUserSentRequest = async (req, res) => {
  const decoded = await jwtHelper.verifyToken(
    req.headers['x-access-token'],
    accessTokenSecret
  )
  const accountDecode = decoded.data
  const userId = accountDecode.id
  const result = await db.sequelize.query(`SELECT a.id, a.phone, a.email, a.name, a.avatar, a.role FROM "Accounts" a left join "UserRequests" b on a.id=b.user_id where ${userId}=ANY(user_request_id);`)
  res.status(200).send(result[0])
}

module.exports = {
  addFriend: addFriend,
  getALLlistUserRequest: getALLlistUserRequest,
  acceptFriend: acceptFriend,
  declineFriend: declineFriend,
  getListFriendRequestByPhoneUser: getListFriendRequestByPhoneUser,
  getListFriendContactByPhoneUser: getListFriendContactByPhoneUser,
  getListPhoneBookByPhoneUser: getListPhoneBookByPhoneUser,
  getTextSearch: getTextSearch,
  deleteFriend: deleteFriend,
  getListPhoneBookById: getListPhoneBookById,
  getListRequestByUserId: getListRequestByUserId,
  getListFriendContactById: getListFriendContactById,
  getSearchUserByPhone: getSearchUserByPhone,
  deletePhoneInUserRequest: deletePhoneInUserRequest,
  deletePhoneInUserContact: deletePhoneInUserContact,
  deletePhoneInUserPhoneBook: deletePhoneInUserPhoneBook,
  postSyncPhonebook: postSyncPhonebook,
  getUserSentRequest: getUserSentRequest
}
