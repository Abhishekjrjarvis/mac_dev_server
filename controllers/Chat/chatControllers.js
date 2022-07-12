const Chat = require("../../models/Chat/Chat");
const User = require("../../models/User");

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
    .populate("users", "-userPassword")
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
        "-userPassword"
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
      .populate("users", "-userPassword")
      .populate("groupAdmin", "-userPassword")
      .populate('message')
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username photoId profilePhoto userLegalName userEmail",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
}


exports.createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-userPassword")
      .populate("groupAdmin", "-userPassword");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
}


exports.renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-userPassword")
    .populate("groupAdmin", "-userPassword");

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
    .populate("users", "-userPassword")
    .populate("groupAdmin", "-userPassword");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
}


exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-userPassword")
    .populate("groupAdmin", "-userPassword");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
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

