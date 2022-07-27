const express = require("express");
const router = express.Router();
const { isLoggedIn } = require('../../middleware')
const Chat = require("../../controllers/Chat/chatControllers");
const catchAsync = require('../../Utilities/catchAsync')

router.post('/', isLoggedIn, catchAsync(Chat.accessChat));

router.get('/', isLoggedIn,  catchAsync(Chat.fetchChats));

router.post('/new/group', isLoggedIn,  catchAsync(Chat.createGroupChat));

router.patch('/rename/group', isLoggedIn,  catchAsync(Chat.renameGroup));

router.post('/remove/user/group', isLoggedIn,  catchAsync(Chat.removeFromGroup));

router.post('/group/re/add', isLoggedIn,  catchAsync(Chat.addToGroup));

router.patch('/:cid/admin/group/disable', isLoggedIn, catchAsync(Chat.disableGroupByAdmin))

router.get('/:id/fetch/message', isLoggedIn,  catchAsync(Chat.fetchChatMessage));

router.post('/support/new/chat', isLoggedIn, catchAsync(Chat.supportAdminChat));

router.get('/support/admin/chat/:userId', catchAsync(Chat.supportAdminFetchChat));

router.post('/new/group/subject', isLoggedIn,  catchAsync(Chat.createSubjectGroupChat));

router.get('/user/subject/student', isLoggedIn, catchAsync(Chat.retrieveSubjectStudentArray))

// router.get('/institute/recent/group/:uid', isLoggedIn,  catchAsync(Chat.retrieveRecentGroup));

router.get('/institute/recent/group/:id', isLoggedIn,  catchAsync(Chat.getRecentChats));


module.exports = router;
