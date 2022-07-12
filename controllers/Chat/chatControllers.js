const Chat = require("../../models/Chat/Chat");
const User = require("../../models/User");
const SupportChat = require('../../models/Chat/SupportChat')

exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.tokenData && req.tokenData.userId } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "username photoId profilePhoto")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username photoId profilePhoto userLegalName userEmail",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: `${req.tokenData && req.tokenData.username}`,
      isGroupChat: false,
      users: [req.tokenData && req.tokenData.userId, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "username photoId profilePhoto"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
}


exports.fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.tokenData && req.tokenData.userId } } })
      .populate("users", "username photoId profilePhoto")
      .populate("groupAdmin", "username photoId profilePhoto")
      // .populate('message')
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username photoId profilePhoto ",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
}


exports.createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name || !req.body.admin) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  if (req.body.users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  req.body.users.push(req.body.admin);

  try {
    const groupChat = new Chat({})
    groupChat.chatName = req.body.name
    groupChat.isGroupChat = true
    groupChat.groupAdmin = req.body.admin
    for(let i = 0; i< req.body.users.length; i++){
      groupChat.users.push(req.body.users[i])
    }
    await groupChat.save()

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "username photoId profilePhoto")
      .populate("groupAdmin", "username photoId profilePhoto");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
}


exports.renameGroup = async (req, res) => {
  const { chatId, chatName, chatDescription } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
      chatDescription: chatDescription,
    },
    {
      new: true,
    }
  )
    .populate("users", "username photoId profilePhoto")
    .populate("groupAdmin", "username photoId profilePhoto");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
}


exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "username photoId profilePhoto")
    .populate("groupAdmin", "username photoId profilePhoto");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
}


exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "username photoId profilePhoto")
    .populate("groupAdmin", "username photoId profilePhoto");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
}



exports.disableGroupByAdmin = async(req, res) =>{
  try{
    const { cid } = req.params
    const chat = await Chat.findById({_id: cid}).populate({
      path: 'groupAdmin',
      select: 'username'
    })
    if(`${chat.groupAdmin.username}` === `${req?.tokenData?.username}`){
      if(`${chat.chatVisibility}` === 'Enable'){
        chat.chatVisibility = 'Disable'
        await chat.save()
        res.status(200).send({ message: 'Disabled Group'})
      }
      else if(`${chat.chatVisibility}` === 'Disable'){
        chat.chatVisibility = 'Enable'
        await chat.save()
        res.status(200).send({ message: 'Enabled Group'})
      }
    }
    else{
      res.status(401).send({ message: 'Invalid Access to Disable Group'})
    }
  }
  catch{

  }
}


exports.fetchChatMessage = async(req, res) =>{
  try{
    const { id } = req.params
    const chat = await Chat.findById({_id: id})
    .select('chatName')
    .populate({
      path: 'message',
      populate: {
        path: 'document',
        select: 'documentName documentSize documentKey documentType'
      }
    })
    .populate({
      path: 'message',
      populate: {
        path: 'replyMessage',
        select: 'reply replyContent',
        populate: {
          path: 'replySender',
          select: 'username profilePhoto photoId userLegalName userEmail'
        }
      }
    })
    .populate({
      path: 'message',
      populate: {
        path: 'sender',
        select: 'username userLegalName photoId profilePhoto userEmail'
      }
    })
    res.status(200).send({ message: 'Chat Message', chat})
  }catch{

  }
}




exports.supportAdminChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await SupportChat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.tokenData && req.tokenData.adminId } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("latestMessage");

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: `Qviple Support Platform`,
      isGroupChat: false,
      users: [req.tokenData && req.tokenData.adminId, userId],
    };

    try {
      const createdChat = await SupportChat.create(chatData);
      const FullChat = await SupportChat.findOne({ _id: createdChat._id })
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
}



exports.supportAdminFetchChat = async (req, res) => {
  try {
    const { userId } = req.body
    const chat = await SupportChat.find({ users: { $elemMatch: { $eq: userId } } })
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      res.status(200).send({ message: 'All Chats', chat})
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
}