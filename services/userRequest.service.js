/* eslint-disable camelcase */
const Response = require('../utils/response')
const db = require('../models')
const Account = db.account
const UserRequest = db.userRequest
const UserContact = db.userContact
const room = db.room
const userAttend = db.userAttend
var { validationResult } = require('express-validator')
const CONSTANT = require('../utils/account.constants')
require('dotenv').config()

// format trả về err
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  // Build your resulting errors however you want! String, object, whatever - it works!
  return {
    msg: msg,
    param: param
  }
}

const addFriend = (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const user_id = req.body.user_id // Đây là id của chính user đó
  const user_request_id = req.body.user_request_id // Đây là id của user mà user đó muốn kết bạn
  console.log(errs.array().length)
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    UserRequest.findOne({
      where: { user_id: user_request_id }
    }).then(userRequestFind => {
      if (userRequestFind === null) {
        // khoi tao lan dau
        const listUserRequest = []
        listUserRequest.push(user_id)
        UserRequest.create({
          user_id: user_request_id,
          user_request_id: listUserRequest
        }).then(resultInitUserRequest => {
          return res.status(200).send(new Response(true, CONSTANT.WAITING_USER_ACCEPT, null))
        })
      } else {
        // da khoi tao
        userRequestFind.user_request_id.push(user_id)
        UserRequest.update({
          user_request_id: userRequestFind.user_request_id
        }, {
          where: { id: userRequestFind.id }
        }).then(resultUpdateUserRequest => {
          return res.status(200).send(new Response(true, CONSTANT.WAITING_USER_ACCEPT, null))
        })
      }
    })
  } else {
    const response = new Response(false, CONSTANT.INVALID_VALUE, errs.array())
    res.status(400).send(response)
  }
}

const getALLlistUserRequest = (req, res) => {
  UserRequest.findAll({
  })
    .then((allUser) => {
      return res.status(200).send(
        new Response(true, CONSTANT.USER_LIST, allUser)
      )
    })
    .catch((_err) => {
      console.log(_err)
      return res.status(500).send(new Response(false, CONSTANT.SERVER_ERROR, null))
    })
}

const acceptFriend = (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const user_id = req.body.user_id
  // user phone want accept friend
  const user_id_want_accept = req.body.user_id_want_accept
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    // xu ly user contact thu 1
    UserRequest.findOne({ where: { user_id: user_id } }).then(value => {
      value.user_request_id.forEach((element, number, object) => {
        if (element === parseInt(user_id_want_accept)) {
          object.splice(number, 1)
        }
      })
      // move user request to user contact
      UserRequest.update({
        user_request_id: value.user_request_id
      }, {
        where: {
          id: value.id
        }
      })
      UserContact.findOne({
        user_id: value.user_id
      }).then(userContactCreate => {
        // neu khoi tao lan dau
        const listFriendContactOne = []

        if (userContactCreate === null) {
          listFriendContactOne.push(user_id_want_accept)
          UserContact.create({
            user_id: user_id,
            friend_id: listFriendContactOne
          })
        } else {
          userContactCreate.friend_id.push(user_id_want_accept)
          UserContact.update({
            friend_id: userContactCreate.friend_id
          }, {
            where: {
              id: userContactCreate.id
            }
          }).then(x => {
            return res.status(200).send(
              new Response(true, 'shit', x)
            )
          })
        }
      })
    })
    // xu ly user contact thu 2
    const listFriendContactTwo = []
    UserRequest.findOne({ where: { user_id: user_id_want_accept } }).then(userContactCreateTwo => {
      // neu khoi tao lan dau
      if (userContactCreateTwo === null) {
        listFriendContactTwo.push(user_id)
        UserContact.create({
          user_id: user_id_want_accept,
          friend_id: listFriendContactTwo
        })
      } else {
        userContactCreateTwo.friend_id.push(user_id)
        UserContact.update({
          friend_id: userContactCreateTwo.friend_id
        }, {
          where: {
            id: userContactCreateTwo.id
          }
        })
      }
    })
    // tao room chung vi ca 2 dieu kien tren deu thanh cong
    room.create({
      name: null,
      list_message: [],
      type: null
    }).then(roomCreate => {
      userAttend.create({
        room_id: roomCreate.id,
        user_id: user_id
      })
      userAttend.create({
        room_id: roomCreate.id,
        user_id: user_id_want_accept
      })
        .then(userContactCreate => {
          return res.status(200).send(
            new Response(true, CONSTANT.USER_CONTACT_UPDATE_SUCCESS, null)
          )
        })
    })
  } else {
    const response = new Response(false, CONSTANT.INVALID_VALUE, errs.array())
    res.status(400).send(response)
  }
}

const declineFriend = (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  // user phone
  const user_id = req.body.user_id
  // user phone want accept friend
  const user_id_want_accept = req.body.user_id_want_decline
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    UserRequest.findOne({ where: { user_id: user_id } }).then(value => {
      value.user_request_id.forEach((element, number, object) => {
        if (element === parseInt(user_id_want_accept)) {
          object.splice(number, 1)
        }
      })
      UserRequest.update({
        user_request_id: value.user_request_id
      }, {
        where: {
          id: value.id
        }
      }).then(userHadUpdate => {
        return res.status(200).send(
          new Response(true, CONSTANT.USER_DECLINE_UPDATE_SUCCESS, null)
        )
      })
    })
  } else {
    const response = new Response(false, CONSTANT.INVALID_VALUE, errs.array())
    res.status(400).send(response)
  }
}

const deleteFriend = (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  // user phone
  const user_id = req.body.user_id
  // user phone want accept friend
  const user_id_want_delete = req.body.user_id_want_delete

  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    UserContact.findOne({ where: { user_id: user_id } }).then(value => {
      // console.log(value.friend_id.length)
      value.friend_id.forEach((element, number, object) => {
        if (element === user_id_want_delete) {
          object.splice(number, 1)
        }
      })
      // console.log(value.friend_id.length)
      UserContact.update({
        friend_id: value.friend_id
      }, {
        where: {
          id: value.id
        }
      }).then(userHadUpdate => {
        return res.status(200).send(
          new Response(true, CONSTANT.USER_DELETE_UPDATE_SUCCESS, null)
        )
      })
    })
  } else {
    const response = new Response(false, CONSTANT.INVALID_VALUE, errs.array())
    res.status(400).send(response)
  }
}

const getListFriendRequestByPhoneUser = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  // user phone
  const user_phone = req.query.phone
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`select * from public."Accounts" a join public."UserRequests" b on a.id = b.user_id where a.phone='${user_phone}'`)
    if (typeof result[0][0] === 'undefined') {
      return res.status(200).send(
        new Response(false, CONSTANT.DONT_HAVE_ANY_FRIEND_REQUEST, null)
      )
    }
    // console.log(result[0][0].user_request_id);
    Account.findAll({
      where: { id: result[0][0].user_request_id }
    }).then(listUserFound => {
      return res.status(200).send(
        new Response(true, CONSTANT.FIND_SUCCESS, listUserFound)
      )
    })
  } else {
    const response = new Response(false, CONSTANT.INVALID_VALUE, errs.array())
    res.status(400).send(response)
  }
}

const getListFriendContactByPhoneUser = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  console.log('ok')
  // user phone
  const user_phone = req.query.phone
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`select * from public."Accounts" a join public."UserContacts" b on a.id = cast(b.user_id as int) where a.phone='${user_phone}'`)
    if (typeof result[0][0] === 'undefined') {
      return res.status(200).send(
        new Response(false, CONSTANT.DONT_HAVE_ANY_FRIEND_CONTACT, null)
      )
    }
    Account.findAll({
      where: { id: result[0][0].friend_id }
    }).then(listUserFound => {
      return res.status(200).send(
        new Response(true, CONSTANT.FIND_SUCCESS, listUserFound)
      )
    })
  } else {
    const response = new Response(false, CONSTANT.INVALID_VALUE, errs.array())
    res.status(400).send(response)
  }
}

const getListPhoneBookByPhoneUser = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  console.log('ok')
  // user phone
  const user_phone = req.query.phone
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    const result = await db.sequelize.query(`select * from public."Accounts" a join public."UserPhoneBooks" b on a.id = cast(b.user_id as int) where a.phone='${user_phone}'`)
    if (typeof result[0][0] === 'undefined') {
      return res.status(200).send(
        new Response(false, CONSTANT.DONT_HAVE_ANY_FRIEND_BOOK, null)
      )
    }
    // console.log(result[0][0].user_request_id);
    Account.findAll({
      where: { id: result[0][0].user_phone_book_id }
    }).then(listUserFound => {
      return res.status(200).send(
        new Response(true, CONSTANT.FIND_SUCCESS, listUserFound)
      )
    })
  } else {
    const response = new Response(false, CONSTANT.INVALID_VALUE, errs.array())
    res.status(400).send(response)
  }
}

const getTextSearch = async (req, res) => {
  const errs = validationResult(req).formatWith(errorFormatter) // format chung
  const value = req.query.value
  if (typeof errs.array() === 'undefined' || errs.array().length === 0) {
    console.log(`SELECT * FROM public."Accounts" WHERE  to_tsvector(email || ' ' || name || ' ' || phone) @@ to_tsquery('${value}')`)
    const result = await db.sequelize.query(`SELECT * FROM public."Accounts" WHERE phone @@ to_tsquery('${value}:*') or name @@ to_tsquery('${value}:*') or  email @@ to_tsquery('${value}:*')`)
    if (typeof result[0][0] === 'undefined') {
      return res.status(200).send(
        new Response(false, CONSTANT.USER_NOT_FOUND, null)
      )
    } else {
      return res.status(200).send(
        new Response(true, CONSTANT.FIND_SUCCESS, result[0])
      )
    }
  } else {
    const response = new Response(false, CONSTANT.INVALID_VALUE, errs.array())
    res.status(400).send(response)
  }
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
  deleteFriend: deleteFriend
}
