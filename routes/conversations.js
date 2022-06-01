const router = require("express").Router();
const Conversation = require("../models/Conversation");
const InstituteChat = require('../models/InstituteChat')
const InstituteAdmin = require('../models/InstituteAdmin')


//get conv of a user

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const conversation = await Conversation.find({
      members: { $in: [userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});


// get conv includes two userId

router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation)
  } catch (err) {
    res.status(500).json(err);
  }
});



router.get('/:iid/ins', async(req, res) =>{
  try{
    const { iid } = req.params
    const insChat = await InstituteAdmin.findById({_id: iid}).populate({
      select: 'insName photoId insProfilePhoto',
      path: 'joinChat'
    })
    res.status(200).send({ message: 'Chat Ins Data', insChat})
  }
  catch{

  }
})

router.get('/:cid/chat', async(req, res) =>{
  try{
    const { cid } = req.params
    const chat = await InstituteChat.findById({_id: cid}).populate({
      path: 'groupAdmin'
    })
    .populate({
      path: 'users',
      populate: {
        path: 'joinChat'
      }
    })
    .populate({
      path: 'latestMessage'
    })
    res.status(200).send({ message: 'Chat Data', chat})
  }
  catch{

  }
})



router.get('/:cid/ins-chat', async(req, res) =>{
  try{
    const { cid } = req.params
    const chat = await InstituteChat.findById({_id: cid}).populate({
      path: 'groupAdmin',
    })
    // .populate({
    //   path: 'users',
    //   populate: {
    //     path: 'joinChat'
    //   }
    // })
    // .populate({
    //   path: 'latestMessage'
    // })
    res.status(200).send({ message: 'Chat Data', chat})
  }
  catch{

  }
})


module.exports = router;