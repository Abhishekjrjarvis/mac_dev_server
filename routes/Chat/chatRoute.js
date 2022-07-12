const express = require("express");
const router = express.Router();
const { isLoggedIn } = require('../../middleware')
const Chat = require("../../controllers/Chat/chatControllers");
const catchAsync = require('../../Utilities/catchAsync')

router.post('/', isLoggedIn, catchAsync(Chat.accessChat));

router.get('/', isLoggedIn,  catchAsync(Chat.fetchChats));

router.post('/group', isLoggedIn,  catchAsync(Chat.createGroupChat));

router.put('/rename', isLoggedIn,  catchAsync(Chat.renameGroup));

router.post('/groupremove', isLoggedIn,  catchAsync(Chat.removeFromGroup));

router.post('/groupadd', isLoggedIn,  catchAsync(Chat.addToGroup));

router.post('/:id/fetch/message', isLoggedIn,  catchAsync(Chat.fetchChatMessage));

module.exports = router;
