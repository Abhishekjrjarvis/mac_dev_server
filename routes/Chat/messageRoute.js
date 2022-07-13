const express = require("express");
const router = express.Router();
const { isLoggedIn } = require('../../middleware')
const Message = require("../../controllers/Chat/messageControllers");
const catchAsync = require('../../Utilities/catchAsync')
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/:chatId", isLoggedIn, catchAsync(Message.allMessagesQuery));

router.post('/', isLoggedIn, catchAsync(Message.sendMessageQuery));

router.post('/document', isLoggedIn, upload.array('file'), catchAsync(Message.sendMessageDocumentQuery));

router.post('/forward', isLoggedIn, catchAsync(Message.forwardMessageQuery))

router.patch('/read/receipts/:cid', isLoggedIn, catchAsync(Message.markAsReadReceipts))

router.patch('/unread/receipts/:cid', isLoggedIn, catchAsync(Message.markAsUnReadReceipts))

router.delete('/:mid/chat/dump/:cid', isLoggedIn, catchAsync(Message.dumpOneMessage))

router.post('/support/admin/message', isLoggedIn, catchAsync(Message.sendSupportMessageQuery));



module.exports = router;
