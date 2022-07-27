const Message = require("../../models/Chat/Message");
const User = require("../../models/User");
const Chat = require("../../models/Chat/Chat");
const ChatDocument = require('../../models/Chat/chatDocuments')
const ReplyChat = require('../../models/Chat/ReplyChat')
const ForwardMessage = require('../../models/Chat/ForwardMessage')
const SupportChat = require('../../models/Chat/SupportChat')
const SupportMessage = require('../../models/Chat/SupportMessage')
const {
  uploadDocFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);


exports.allMessagesQuery = async (req, res) => {
  try {
    if(req.params && req.params.chatId){
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "username profilePhoto photoId userLegalName userEmail")
      .populate("chat")
      .populate({
        path: 'document',
        select: 'documentName documentSize documentKey documentType'
      })
      .populate({
        path: 'replyMessage',
        select: 'reply replyContent delievered',
        populate: {
          path: 'replySender',
          select: 'username profilePhoto photoId userLegalName userEmail'
        }
      })
      .populate({
        path: 'forwardMessage delievered',
        select: 'isForward'
      })
    res.json(messages);
    }
  } catch (error) {
    res.status(400);
    // throw new Error(error.message);
  }
}


exports.sendMessageQuery = async (req, res) => {
  const { content, chatId, reply, replyContent, replyIndex } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.tokenData && req.tokenData.userId,
    content: content,
    chat: chatId,
    isSend: true,
    delievered: true
  };


  try {
    if(replyContent && replyIndex){
      var rMessage = new ReplyChat({})
      rMessage.reply = true
      rMessage.replyContent = replyContent
      rMessage.replyIndex = replyIndex
      rMessage.delievered = true
      rMessage.replySender = req.tokenData && req.tokenData.userId
      await rMessage.save()
    }
    var message = new Message(newMessage);
    if(replyContent && replyIndex){
      message.replyMessage = rMessage._id
    }
    await message.save()

    message = await message.populate("sender", "username userLegalName photoId profilePhoto userEmail");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "username userLegalName photoId profilePhoto userEmail",
    });
    message = await message.populate({
      path: "replyMessage",
      select: "reply replyContent delievered",
      populate: {
        path: 'replySender', 
        select: 'username userLegalName photoId profilePhoto userEmail'
      }
    })

    const chat = await Chat.findById(req.body.chatId)
    chat.latestMessage = message._id
    chat.message.push(message._id)
    await chat.save()

    res.json(message);
  } catch (error) {
    res.status(400);
    // throw new Error(error.message);
  }
}


exports.sendMessageDocumentQuery = async (req, res) => {
  const { content, chatId, replyContent, replyIndex } = req.body;
  try {
    let message = new Message({})
    message.content = content
    message.chat = chatId
    message.delievered = true
    message.isSend = true
    message.sender = req.tokenData && req.tokenData.userId
    for (let file of req.files) {
      const cDocument = new ChatDocument({})
      cDocument.documentType = file.mimetype
      cDocument.documentName = file.originalname
      cDocument.documentEncoding = file.encoding
      cDocument.documentSize = file.size
      const results = await uploadDocFile(file);
      cDocument.documentKey = results.Key
      message.document.push(cDocument._id)
      await cDocument.save()
      await unlinkFile(file.path);
    }
    if(replyContent && replyIndex){
      var rMessage = new ReplyChat({})
      rMessage.reply = true
      rMessage.replyContent = replyContent
      rMessage.replyIndex = replyIndex
      rMessage.delievered = true
      rMessage.replySender = req.tokenData && req.tokenData.userId
      await rMessage.save()
      message.replyMessage = rMessage._id
    }
    await message.save()
    message = await message.populate("sender", "username userLegalName photoId profilePhoto userEmail");
    message = await message.populate("chat");
    message = await message.populate('document', 'documentName documentKey documentType documentSize')
    message = await User.populate(message, {
      path: "chat.users",
      select: "username userLegalName photoId profilePhoto userEmail",
    });
    message = await message.populate({
      path: "replyMessage",
      select: "reply replyContent delievered",
      populate: {
        path: 'replySender', 
        select: 'username userLegalName photoId profilePhoto userEmail'
      }
    })

    const chat = await Chat.findById(req.body.chatId)
    chat.latestMessage = message._id
    chat.message.push(message._id)
    await chat.save()

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
}


exports.forwardMessageQuery = async(req, res) =>{
  try{
    const { Id, messageQuery, forward } = req.body
    var message = await Message.findById({_id: messageQuery})
    .populate('chat')
    .populate('document')
    const forwardM = new ForwardMessage({isForward: forward})
    var newMessage = new Message({
      content: `${message.content}`,
      sender: req.tokenData && req.tokenData.userId,
      delievered: true
    })
    for(let i = 0; i < Id.length; i++){
      const chat = await Chat.findById({_id: Id[i]})
      chat.latestMessage = newMessage._id
      chat.message.push(newMessage._id)
      await chat.save()
    }
    newMessage.forwardMessage = forwardM._id
    newMessage.document.push(...message.document)
    newMessage.chat = message.chat._id
    await newMessage.save()
    await forwardM.save()
    newMessage = await newMessage.populate('sender', 'username userProfilePhoto userEmail photoId userLegalName')
    newMessage = await newMessage.populate("chat");
    newMessage = await User.populate(newMessage, {
      path: "chat.users",
      select: "username userLegalName photoId profilePhoto userEmail",
    });
    newMessage = await newMessage.populate({
      path: 'forwardMessage delievered',
      select: 'isForward forwardIndex'
    })
    newMessage = await newMessage.populate({
      path: 'document',
      select: 'documentName documentType documentKey documentSize'
    })
    res.json(newMessage)
  }
  catch(e){
    console.log(e)
  }
}




exports.markAsReadReceipts = async(req, res) =>{
  try{
    const { cid } = req.params
    const message = await Message.find({ $and: [ { chat: cid }, { readBySelf: false }] })
    for(let i = 0; i < message.length; i++ ){
      message[i].readBySelf = 'Read'
      await message[i].save()
    }
    res.status(200).send({ message: 'Marked as Read'})
  }
  catch(e){
    console.log(e)
  }
}


exports.markAsUnReadReceipts = async(req, res) =>{
  try{
    const { cid } = req.params
    const message = await Message.find({ $and: [ { chat: cid }, { readBySelf: 'Read' }] })
    for(let i = 0; i < message.length; i++ ){
      message[i].readBySelf = false
      await message[i].save()
    }
    res.status(200).send({ message: 'Marked as UnRead'})
  }
  catch(e){
    console.log(e)
  }
}


exports.dumpOneMessage = async(req, res) =>{
  try{
    const { mid, cid } = req.params
    var message = await Message.findById({_id: mid}).populate({path:'sender'})
    var session_user = await User.findById({_id: req.tokenData && req.tokenData.userId})
    if(message.sender.username === session_user.username){
    await Chat.findByIdAndUpdate(cid, { $pull: { message: mid }})
    await Message.findByIdAndDelete({_id: mid})
    res.status(200).send({ message: 'Deleted Message'})
    }
    else{
      res.status(401).send({ message: 'Unauthorized User...'})
    }
  }
  catch(e){
    console.log(e)
  }
}


exports.forwardMessageDocumentQuery = async(req, res) =>{
  try{
    const { Id, messageQuery, forward } = req.body
    var message = await Message.findById({_id: messageQuery})
    .populate('chat')
    .populate('document')
    const forwardM = new ForwardMessage({isForward: forward})
    var newMessage = new Message({
      content: `${message.content}`,
      sender: req.tokenData && req.tokenData.userId,
    })
    for(let i = 0; i < Id.length; i++){
      const chat = await Chat.findById({_id: Id[i]})
      chat.latestMessage = newMessage._id
      chat.message.push(newMessage._id)
      await chat.save()
    }
    newMessage.forwardMessage = forwardM._id
    newMessage.document.push(...message.document)
    newMessage.chat = message.chat._id
    await newMessage.save()
    await forwardM.save()
    newMessage = await newMessage.populate('sender', 'username userProfilePhoto userEmail photoId userLegalName')
    newMessage = await newMessage.populate("chat");
    newMessage = await User.populate(newMessage, {
      path: "chat.users",
      select: "username userLegalName photoId profilePhoto userEmail",
    });
    newMessage = await newMessage.populate({
      path: 'forwardMessage',
      select: 'isForward forwardIndex'
    })
    newMessage = await newMessage.populate({
      path: 'document',
      select: 'documentName documentType documentKey documentSize'
    })
    res.json(newMessage)
  }
  catch(e){
    console.log(e)
  }
}


exports.sendSupportChatMessage = async (req, res) => {
  try {
    if(req.params && req.params.chatId){
    const messages = await SupportMessage.find({ chat: req.params.chatId })
    res.json(messages);
    }
  } catch (error) {
    res.status(400);
    // throw new Error(error.message);
  }
}


exports.sendSupportMessageQuery = async (req, res) => {
  const { content, chatId, userId } = req.body;

  if (!content || !chatId || !userId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: userId,
    content: content,
    chat: chatId,
    delievered: true,
    isSend: true
  };


  try {
    var message = new SupportMessage(newMessage);
    await message.save()

    message = await SupportMessage.findById({_id: message._id})
    .populate({
      path: 'chat',
      select: 'id users',
      populate: {
        path: 'latestMessage',
        select: 'content'
      }
    })
    const chat = await SupportChat.findById(req.body.chatId)
    chat.latestMessage = message._id
    chat.message.push(message._id)
    await chat.save()

    res.json(message);
  } catch (error) {
    res.status(400);
    // throw new Error(error.message);
  }
}