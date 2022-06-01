const router = require("express").Router();
const Message = require("../models/Message");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const InstituteMessage = require('../models/InstituteMessage')
const InstituteChat = require('../models/InstituteChat')
const {
  // uploadFile,
  // uploadVideo,
  uploadDocFile,
  // getFileStream,
  // deleteFile,
} = require("../S3Configuration");
//add



router.post("/", upload.single('file'), async (req, res) => {
  const { sender, conversationId, text, reply } = req.body
  const file = req.file;
  if(file  && file.mimetype.includes('/pdf')){
    const results = await uploadDocFile(file);
    var newMessage = new Message({
      sender: sender,
      conversationId: conversationId,
      text: text,
      document: results.key,
      documentName: file.originalname,
      isSend: true
    });
  }
  else if(file && (file.mimetype.includes('/jpeg') || file.mimetype.includes('/png') || file.mimetype.includes('/jpg'))){
    const results = await uploadDocFile(file);
    var newMessage = new Message({
      sender: sender,
      conversationId: conversationId,
      text: text,
      image: results.key,
      isSend: true
    });
  }
  else{
    var newMessage = new Message({
      sender: sender,
      conversationId: conversationId,
      text: text,
      isSend: true,
      reply: reply !== '' ? reply : ''
    });
  }
  
  // console.log(newMessage)
  
  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/group", async (req, res) => {
  const newMessage = new GroupMessage(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

router.get("/:conversationId", async (req, res) => {
  try {
    const { conversationId } = req.params
    const messages = await Message.find({
      conversationId: conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});



router.post("/:conversationId/read", async (req, res) => {
  try {
    const { senderId, } = req.body
    const { conversationId } = req.params
    const messages = await Message.find({
      conversationId: conversationId,
    });
    // console.log(messages.length)
    for(let i=0; i< messages.length; i++){
      if(messages[i].readBy === false && senderId !== messages[i].sender){
        messages[i].readBy = true
        messages[i].isSend = false
        await messages[i].save()
      }
      else{

      }
    }
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});


router.post('/:cid/send', async(req, res) =>{
  // console.log(req.body, req.params)
  try{
    const { cid } = req.params
    const { content, sender, chat } = req.body
    const message = new InstituteMessage({
      content: content,
      sender: sender,
      chat: chat
    });
    const chats = await InstituteChat.findById({_id: cid})
    chats.messageList.push(message)

    // Save the message to the database.
    await message.save()
    await chats.save()
    const newMessage = await InstituteMessage.find({}).populate({
      path: "sender", 
    })
    .populate({
      path: 'chat',
      populate: {
        path: 'users',
      }
    })
    res.status(200).send({ message: 'Users Data', newMessage})
  }
  catch{

  }
})



router.get('/:cid/group', async(req, res) =>{
  try{
    const { cid } = req.params
    const message = await InstituteChat.findById({_id: cid})
    .populate({ 
      path : 'messageList',
      populate: {
        path: 'sender'
      }
    })
    .populate({
      path: 'messageList',
      populate: {
        path: 'chat',
        populate: {
          path: 'users',
        }
      }
    })
    
    res.status(200).send({ message: 'Users Data', message})
  }
  catch{

  }
})




router.get('/:cid/g/user/list', async(req, res) =>{
  try{
    const { cid } = req.params
    const gList = await InstituteChat.findById({_id: cid})
    .populate({
        path: 'users',
        select: 'userLegalName'
    })
    
    res.status(200).send({ message: 'Users Data', gList})
  }
  catch{

  }
})


module.exports = router;