const express = require('express')
const router = express.Router()
const userRequestService = require('../services/userRequest.service')
const userRequestValidator = require('../validators/user_request.validator')

router.post('/api/v0/users/addFriend', userRequestValidator.validateAddFriend(), userRequestService.addFriend)

router.post('/api/v0/users/accepFriend', userRequestValidator.validateAccepFriend(), userRequestService.acceptFriend)

router.post('/api/v0/users/declineFriend', userRequestValidator.validateDeclineFriend(), userRequestService.declineFriend)

router.get('/api/v0/users/listFriendRequest', userRequestService.getALLlistUserRequest)

router.get('/api/v0/users/getListFriendRequestByPhoneUser', userRequestValidator.validatePhoneUserRequest(), userRequestService.getListFriendRequestByPhoneUser)

router.get('/api/v0/users/getListFriendContactByPhoneUser', userRequestValidator.validatePhoneUserRequest(), userRequestService.getListFriendContactByPhoneUser)

router.get('/api/v0/users/getListFriendPhoneBookByPhoneUser', userRequestValidator.validatePhoneUserRequest(), userRequestService.getListPhoneBookByPhoneUser)

router.get('/api/v0/users/textSearch', userRequestValidator.validateTextSearch(), userRequestService.getTextSearch)

router.post('/api/v0/users/deleteFriend', userRequestValidator.validateDeleteFriend(), userRequestService.deleteFriend)

router.get('/api/v0/users/getListPhoneBookById', userRequestValidator.validateGetListPhoneBookById(), userRequestService.getListPhoneBookById)

router.get('/api/v0/users/getListRequestId', userRequestValidator.validateGetFriendRequestById(), userRequestService.getListRequestByUserId)

router.get('/api/v0/users/getListContactId', userRequestValidator.validateGetFriendContactById(), userRequestService.getListFriendContactById)

router.get('/api/v0/users/searchUserByPhone', userRequestValidator.validateGetSearchFriendByPhone(), userRequestService.getSearchUserByPhone)

router.post('/api/v0/users/deletePhoneByIdRequest', userRequestValidator.validateDeletePhoneByIdUserRequest(), userRequestService.deletePhoneInUserRequest)

router.post('/api/v0/users/deletePhoneByIdContact', userRequestValidator.validateDeletePhoneByIdUserContact(), userRequestService.deletePhoneInUserContact)

router.post('/api/v0/users/deletePhoneByIdPhoneContact', userRequestValidator.validateDeletePhoneByIdUserPhoneBook(), userRequestService.deletePhoneInUserPhoneBook)


module.exports = router
