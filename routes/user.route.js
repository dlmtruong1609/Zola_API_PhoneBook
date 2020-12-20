const express = require('express')
const router = express.Router()
const userRequestController = require('../controllers/userRequest.controller')
const userRequestValidator = require('../validators/user_request.validator')

router.post('/api/v0/users/addFriend', userRequestValidator.validateAddFriend(), userRequestController.addFriend)

router.post('/api/v0/users/accepFriend', userRequestValidator.validateAccepFriend(), userRequestController.acceptFriend)

router.post('/api/v0/users/declineFriend', userRequestValidator.validateDeclineFriend(), userRequestController.declineFriend)

router.get('/api/v0/users/listFriendRequest', userRequestController.getALLlistUserRequest)

router.get('/api/v0/users/getListFriendRequestByPhoneUser', userRequestValidator.validatePhoneUserRequest(), userRequestController.getListFriendRequestByPhoneUser)

router.get('/api/v0/users/getListFriendContactByPhoneUser', userRequestValidator.validatePhoneUserRequest(), userRequestController.getListFriendContactByPhoneUser)

router.get('/api/v0/users/getListFriendPhoneBookByPhoneUser', userRequestValidator.validatePhoneUserRequest(), userRequestController.getListPhoneBookByPhoneUser)

router.get('/api/v0/users/textSearch', userRequestValidator.validateTextSearch(), userRequestController.getTextSearch)

router.delete('/api/v0/users/deleteFriend', userRequestValidator.validateDeleteFriend(), userRequestController.deleteFriend)

router.get('/api/v0/users/getListPhoneBookById', userRequestValidator.validateGetListPhoneBookById(), userRequestController.getListPhoneBookById)

router.get('/api/v0/users/getListRequestId', userRequestValidator.validateGetFriendRequestById(), userRequestController.getListRequestByUserId)

router.get('/api/v0/users/getListContactId', userRequestValidator.validateGetFriendContactById(), userRequestController.getListFriendContactById)

router.get('/api/v0/users/searchUserByPhone', userRequestValidator.validateGetSearchFriendByPhone(), userRequestController.getSearchUserByPhone)

router.delete('/api/v0/users/deletePhoneByIdRequest', userRequestValidator.validateDeletePhoneByIdUserRequest(), userRequestController.deletePhoneInUserRequest)

router.delete('/api/v0/users/deletePhoneByIdContact', userRequestValidator.validateDeletePhoneByIdUserContact(), userRequestController.deletePhoneInUserContact)

router.delete('/api/v0/users/deletePhoneByIdPhoneBook', userRequestValidator.validateDeletePhoneByIdUserPhoneBook(), userRequestController.deletePhoneInUserPhoneBook)

router.post('/api/v0/users/syncPhoneBook', userRequestController.postSyncPhonebook)

router.get('/api/v0/users/request/sent', userRequestController.getUserSentRequest)

module.exports = router
