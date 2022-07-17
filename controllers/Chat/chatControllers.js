const Chat = require("../../models/Chat/Chat");
const User = require("../../models/User");
const SupportChat = require('../../models/Chat/SupportChat')
const InstituteAdmin = require('../../models/InstituteAdmin')

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
      .populate({
        path: 'groupAdmin',
        select: 'username photoId profilePhoto'
      })
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
  if (!req.body.users || !req.body.name || !req.body.admin || !req.body.instituteQuery) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  if (req.body.users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  const userAdmin = await User.findById({ _id: req.body.admin})
  if(req.body.users.includes(`${userAdmin._id}`)){

  }
  else{
  req.body.users.push(req.body.admin);
  }

  try {
    const groupChat = new Chat({})
    const user = await User.findById({_id: req.body.admin})
    const institute = await InstituteAdmin.findById({ _id: req.body.instituteQuery})
    groupChat.chatName = req.body.name
    groupChat.isGroupChat = true
    groupChat.groupAdmin.push(req.body.admin)
    user.recentChat.push(groupChat._id)
    institute.recentChat.push(groupChat._id)
    for(let i = 0; i< req.body.users.length; i++){
      groupChat.users.push(req.body.users[i])
    }
    await Promise.all([ user.save(), institute.save(), groupChat.save()])

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "username photoId profilePhoto")
      .populate({
        path: 'groupAdmin',
        select: 'username photoId profilePhoto'
      });

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
    .populate({
      path: 'groupAdmin',
      select: 'username photoId profilePhoto'
    });

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
    .populate({
      path: 'groupAdmin',
      select: 'username photoId profilePhoto'
    });

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
    .populate({
      path: 'groupAdmin',
      select: 'username photoId profilePhoto'
    });

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



exports.retrieveSubjectStudentArray = async(req, res) =>{
  try{
    const userId = req.tokenData && req.tokenData.userId
    const user = await User.findById({_id: userId})
    .select('id')
    .populate({
      path: 'isSubjectChat',
      select: 'subjectName',
      populate: {
        path: 'class',
        select: 'className classTitle',
        populate: {
          path: 'ApproveStudent',
          select: 'studentFirstName'
        }
      }
    })
    res.status(200).send({ message: 'Subject Student ', user})
  }
  catch(e){
    console.log(e)
  }
}



exports.createSubjectGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name ) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  if (req.body.users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  var user = await User.findById({_id: req.tokenData && req.tokenData.userId})

  if(req.body.users.includes(`${user._id}`)){
  }
  else{
  req.body.users.push(user._id);
  }

  try {
    if(user.isSubjectTeacher === 'Yes'){
      const groupChat = new Chat({})
      groupChat.chatName = req.body.name
      groupChat.isGroupChat = true
      groupChat.groupAdmin.push(user._id)
      for(let i = 0; i< req.body.users.length; i++){
        groupChat.users.push(req.body.users[i])
      }
      await groupChat.save()

      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "username photoId profilePhoto")
        .populate({
          path: 'groupAdmin',
          select: 'username photoId profilePhoto'
        });

      res.status(200).json(fullGroupChat);
    }
    else{
      res.status(401).send({ message: 'Invalid Access to Group Chat'})
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
}



// exports.retrieveRecentGroup = async (req, res) => {
//   try {
//     const { uid } = req.params
//     Chat.find({ users: { $elemMatch: { $eq: uid } } })
//       .populate("users", "username photoId profilePhoto")
//       .populate("groupAdmin", "username photoId profilePhoto")
//       .populate({
//         path: 'message',
//         select: 'content updatedAt',
//         populate: {
//           path: 'sender',
//           select: 'username'
//         }
//       })
//       .populate({
//         path: 'message',
//         select: 'content updatedAt',
//         populate: {
//           path: 'sender',
//           select: 'username'
//         }
//       })
//       .populate({
//         path: 'message',
//         select: 'content updatedAt',
//         populate: {
//           path: 'replyMessage',
//           select: 'replyContent reply replyIndex',
//           populate: {
//             path: 'replySender',
//             select: 'username'
//           }
//         }
//       })
//       .populate({
//         path: 'message',
//         select: 'content updatedAt',
//         populate: {
//           path: 'forwardMessage',
//           select: 'isForward'
//         }
//       })
//       .populate({
//         path: 'message',
//         populate: {
//           path: 'document',
//           select: 'documentName documentSize documentKey documentType'
//         }
//       })
//       .populate("latestMessage")
//       .sort({ updatedAt: -1 })
//       .then(async (results) => {
//         results = await User.populate(results, {
//           path: "latestMessage.sender",
//           select: "username photoId profilePhoto ",
//         });
//         res.status(200).send(results);
//       });
//   } catch (error) {
//     res.status(400);
//     // throw new Error(error.message);
//   }
// }

exports.getRecentChats = async(req, res) => {
  try{
    const { id } = req.params
    const institute = await InstituteAdmin.findById({ _id: id })
    .select('insName name photoId insProfilePhoto recentChat')

    const chat = await Chat.find({ _id: {$in: institute.recentChat}})
    .select('chatName chatProfilePhoto chatDescription updatedAt isGroupChat createdAt groupAdmin')
    .populate({
      path: 'latestMessage',
      select: 'content updatedAt',
      populate: {
        path: 'sender',
        populate: 'username'
      }
    })
    .populate({
        path: 'latestMessage',
        select: 'content updatedAt',
        populate: {
          path: 'document',
          populate: 'documentName documentType documentKey documentSize'
        }
    })
    .populate({
        path: 'message',
        select: 'content updatedAt',
        populate: {
          path: 'sender',
          select: 'username'
        }
    })
    .populate({
        path: 'message',
        select: 'content updatedAt',
        populate: {
          path: 'replyMessage',
          select: 'reply replyContent replyIndex',
          populate: {
            path: 'replySender',
            select: 'username'
          }
        }
    })
    .populate({
        path: 'message',
        select: 'content updatedAt',
        populate: {
          path: 'forwardMessage',
          select: 'isForward'
        }
    })
    .populate({
        path: 'message',
        select: 'content updatedAt',
        populate: {
          path: 'document',
          select: 'documentName documentType documentSize document documentKey'
        }
    })
    .populate({
        path: 'users',
        select: 'username userLegalName photoId profilePhoto',
    })
    .sort("-updatedAt")
    .lean()
    .exec()
    res.status(200).send({ message: 'Recent chats', institute, chat})
  }
  catch{

  }
}
