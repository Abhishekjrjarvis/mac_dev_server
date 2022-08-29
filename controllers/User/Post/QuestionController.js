const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Answer = require('../../../models/Question/Answer')
const AnswerReply = require('../../../models/Question/AnswerReply')
const Notification = require('../../../models/notification')
const {
  uploadPostImageFile,
} = require("../../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require('../../../Firebase/firebase')

exports.postQuestionText = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
    .populate({ path: 'userFollowers'})
    .populate({ path: 'userCircle'})
    const post = new Post({ ...req.body });
    post.imageId = "1";
    if(req.files.length >= 1){
        for (let file of req.files) {
            const results = await uploadPostImageFile(file);
            post.postImage.push(results.Key);
            await unlinkFile(file.path);
        }
        post.imageId = "0";
    }
    user.userPosts.push(post._id);
    user.questionCount += 1
    post.author = user._id;
    post.authorName = user.userLegalName
    post.authorUserName = user.username
    post.authorPhotoId = user.photoId
    post.authorProfilePhoto = user.profilePhoto
    post.isUser = 'user'
    post.postType = 'Question'
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`
    await Promise.all([user.save(), post.save()]);
    res.status(201).send({ message: "post question is create", post });
    if(user.userFollowers.length >= 1){
        user.userFollowers.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
    }
    if(user.userCircle.length >= 1){
        user.userCircle.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
    }
  } catch(e) {
    console.log(e)
  }
};

exports.postQuestionDelete = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const user = await User.findById({ _id: id})
    await User.findByIdAndUpdate(id, { $pull: { userPosts: pid } });
    await Post.findByIdAndDelete({ _id: pid });
    user.questionCount -= 1
    await user.save()
    res.status(200).send({ message: "post question deleted" });
  } catch(e) {
    console.log(e)
  }
};

exports.answerLike = async (req, res) => {
  try {
    const { aid } = req.params;
    const answer = await Answer.findById({ _id: aid });
    const question = await Post.findById({_id: `${answer.post}`})
    const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''
    if (user_session) {
      if (
        answer.upVote.length >= 1 &&
        answer.upVote.includes(String(user_session))
      ) {
        answer.upVote.pull(user_session);
        if (answer.upVoteCount >= 1) {
          answer.upVoteCount -= 1;
          question.answerUpVoteCount -= 1
        }
        await Promise.all([ answer.save(), question.save()])
        res
          .status(200)
          .send({ message: "Removed from Upvote 👎", upVoteCount: answer.upVoteCount, });
      } else {
        if (
          answer.downVote.length >= 1 &&
          answer.downVote.includes(String(user_session))
        ) {
          answer.downVote.pull(user_session);
          if (answer.downVoteCount >= 1) {
            answer.downVoteCount -= 1;
          }
        }
        answer.upVote.push(user_session);
        answer.upVoteCount += 1;
        question.answerUpVoteCount += 1
        await Promise.all([ answer.save(), question.save()])
        res
          .status(200)
          .send({ message: "Added To Upvote 👍", upVoteCount: answer.upVoteCount, downVoteCount: answer.downVoteCount });
      }
    } else {
      res.status(401).send();
    }
  } catch(e) {
    console.log(e)
  }
};


exports.answerDisLike = async (req, res) => {
  try {
    const { aid } = req.params;
    const answer = await Answer.findById({ _id: aid });
    const question = await Post.findById({_id: `${answer.post}`})
    const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''
    if (user_session) {
      if (
        answer.downVote.length >= 1 &&
        answer.downVote.includes(String(user_session))
      ) {
        answer.downVote.pull(user_session);
        if (answer.downVoteCount >= 1) {
          answer.downVoteCount -= 1;
        }
        await Promise.all([ answer.save() ])
        res.status(200).send({ message: "Removed from DownVote 👎", downVoteCount: answer.downVoteCount, });
      } else {
        if (
          answer.upVote.length >= 1 &&
          answer.upVote.includes(String(user_session))
        ) {
          answer.upVote.pull(user_session);
          if (answer.upVoteCount >= 1) {
            answer.upVoteCount -= 1;
            question.answerUpVoteCount -= 1
          }
        }
        answer.downVote.push(user_session);
        answer.downVoteCount += 1;
        await Promise.all([ answer.save(), question.save() ])
        res.status(200).send({ message: "Added To DownVote 👍", downVoteCount: answer.downVoteCount, upVoteCount: answer.upVoteCount });
      }
    } else {
      res.status(401).send();
    }
  } catch(e) {
    console.log(e)
  }
};

exports.postQuestionSave = async (req, res) => {
  try {
    const { pid } = req.params;
    const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''
    if (user_session) {
      const post = await Post.findById({_id: pid})
      if (post.endUserSave.length >= 1 && post.endUserSave.includes(user_session)) {
        post.endUserSave.pull(user_session);
        await post.save();
        res.status(200).send({ message: "Remove To Favourites 👎" });
      } else {
        post.endUserSave.push(user_session);
        await post.save();
        res.status(200).send({ message: "Added To Favourites 👍" });
      }
    } else {
      res.status(401).send({ message: 'Unauthorized access'});
    }
  } catch {}
};

exports.postQuestionAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { post_type } = req.query
    var post = await Post.findById({ _id: id });
    if(post && post.isUser === 'User'){
    var post_user = await User.findById({_id: `${post.author}`})
    }
    if(post_type === 'Only Answer'){
      const answers = new Answer({ ...req.body });
      answers.answerImageId = "1"
      if(req.files){
          for (let file of req.files) {
              const results = await uploadPostImageFile(file);
              answers.answerImage.push(results.Key);
              await unlinkFile(file.path);
          }
          answers.answerImageId = "0";
      }
      if (req.tokenData && req.tokenData.userId) {
        var user = await User.findById({_id: req.tokenData.userId})
        if(user.staff.length >= 1){
          answers.isMentor = 'yes'
        }
        answers.author = user._id;
        answers.authorName = user.userLegalName
        answers.authorUserName = user.username
        answers.authorPhotoId = user.photoId
        answers.authorProfilePhoto = user.profilePhoto
      } else {
        res.status(401).send({ message: 'Unauthorized'});
      }
      user.answered_query.push(answers._id)
      post.answer.push(answers._id);
      post.answerCount += 1;
      answers.post = post;
      user.answerQuestionCount += 1
      if(post_user){
        var notify = new Notification({})
        notify.notifyContent = `${answers.authorUserName} have added answers on ${post.authorUserName} questions`;
        notify.notifySender = answers.author;
        notify.notifyReceiever = post.author;
        post_user.uNotify.push(notify._id);
        notify.user = post_user._id;
        notify.notifyByPhoto = user._id;
        invokeFirebaseNotification("Answer", notify, 'New Answer', post_user._id, post_user.deviceToken, post._id);
        await Promise.all([ post_user.save(), notify.save() ])
      }
      await Promise.all([post.save(), answers.save(), user.save() ]);
      res.status(201).send({ message: "answer created", answers });
    }
    else{
      res.status(200).send({ message: 'Access Denied By Post Type'})
    }
  } catch(e) {
    console.log(e)
  }
};

exports.getQuestionAnswer = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const pid = req.params.id;
    const skip = (page - 1) * limit;
    const insPost = await Post.findById(pid);
    const answer = await Answer.find({
      _id: { $in: insPost.answer },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select("answerContent createdAt answerImageId answerImage upVote upVoteCount downVote downVoteCount isMentor answerReplyCount author answerSave authorName authorUserName authorPhotoId authorProfilePhoto")
      .populate({
        path: 'post',
        select: 'postQuestion'
      })
    res.status(200).send({ message: "All answer's of one Question", answer });
  } catch {}
};

exports.getAnswerReply = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const rid = req.params.rid;
    const skip = (page - 1) * limit;
    const answer = await Answer.findById(rid);
    const reply = await AnswerReply.find({
      _id: { $in: answer.answerReply },
    })
    .sort("-createdAt")
    .limit(limit)
    .skip(skip)
    .select("answerReplyContent createdAt author authorName authorUserName authorPhotoId authorProfilePhoto")
    .populate({
        path: 'parentAnswer',
        select: 'id'
    })
    res.status(200).send({ message: "All Answer's reply", reply })
  } catch {}
};

exports.postAnswerReply = async (req, res) => {
  try {
    const { rid } = req.params;
    const { reply, uid } = req.body;
    if (req.tokenData && req.tokenData.userId) {
      const users = await User.findById({_id: req.tokenData.userId}) 
      const answerReply = new AnswerReply({
        answerReplyContent: reply,
        author: users._id,
        authorName: users.userLegalName,
        authorUserName: users.username,
        authorPhotoId: users.photoId,
        authorProfilePhoto: users.profilePhoto,
        parentAnswer: rid,
      });
      const p_answer = await Answer.findById(rid);
      p_answer.answerReply.unshift(answerReply._id);
      p_answer.answerReplyCount += 1;
      await Promise.all([p_answer.save(), answerReply.save()]);
      const user = await User.findById(users._id).select("photoId profilePhoto username userLegalName")
      const replyAnswer = {
        _id: answerReply._id,
        answerReplyContent: answerReply.answerReplyContent,
        createdAt: answerReply.createdAt,
        author: user._id,
        authorName: user.userLegalName,
        authorUserName: user.username,
        authorPhotoId: user.photoId,
        authorProfilePhoto: user.profilePhoto,
      };
      res.status(201).send({
        replyAnswer,
        allAnswerReply: p_answer.answerReplyCount,
      });
    } else {
      res.status(401).send({ message: 'Unauthorized'});
    }
  } catch (e) {
    console.log(e);
  }
};

exports.questionAnswerSave = async (req, res) => {
    try {
      const { aid } = req.params;
      const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''
      if (user_session) {
        const answer = await Answer.findById({_id: aid})
        if (answer.answerSave.length >= 1 && answer.answerSave.includes(user_session)) {
          answer.answerSave.pull(user_session);
          await answer.save();
          res.status(200).send({ message: "Remove Answer To Favourites 👎" });
        } else {
          answer.answerSave.push(user_session);
          await answer.save();
          res.status(200).send({ message: "Added Answer To Favourites 👍" });
        }
      } else {
        res.status(401).send({ message: 'Unauthorized access'});
      }
    } catch {}
  };



  exports.postQuestionDeleteAnswer = async (req, res) => {
    try {
      const { pid, aid } = req.params;
      const post = await Post.findById({ _id: pid})
      await Post.findByIdAndUpdate(id, { $pull: { answer: aid } });
      await Answer.findByIdAndDelete({ _id: aid });
      post.answerCount -= 1
      await post.save()
      res.status(200).send({ message: "post question answer deleted" });
    } catch(e) {
      console.log(e)
    }
  };




  exports.rePostQuestionAnswer = async (req, res) => {
    try {
      const { id } = req.params;
      const { post_type } = req.query
      var post = await Post.findById({ _id: id });
      if(post && post.isUser === 'isUser'){
        var post_user = await User.findById({_id: `${post.author}`})
      }
      if(post_type === 'Repost'){
        var answers = new Answer({ ...req.body });
        answers.answerImageId = "1"
        if(req.files.length >=1 ){
          for(let file of req.files) {
              const results = await uploadPostImageFile(file);
              answers.answerImage.push(results.Key);
              await unlinkFile(file.path);
          }
          answers.answerImageId = "0";
        }
        if (req.tokenData && req.tokenData.userId) {
          var user = await User.findById({_id: req.tokenData.userId})
          .populate({ path: 'userFollowers'})
          .populate({ path: 'userCircle'})
          if(user.staff.length >= 1){
            answers.isMentor = 'yes'
          }
          answers.author = user._id;
          answers.authorName = user.userLegalName
          answers.authorUserName = user.username
          answers.authorPhotoId = user.photoId
          answers.authorProfilePhoto = user.profilePhoto
        }
        const rePost = new Post({})
        rePost.author = user._id;
        rePost.authorName = user.userLegalName
        rePost.authorUserName = user.username
        rePost.authorPhotoId = user.photoId
        rePost.authorProfilePhoto = user.profilePhoto
        user.answered_query.push(answers._id)
        post.answer.push(answers._id);
        post.answerCount += 1;
        answers.post = post;
        user.answerQuestionCount += 1
        user.userPosts.push(rePost._id);
        user.postCount += 1
        rePost.isUser = 'user'
        rePost.postType = 'Repost'
        rePost.rePostAnswer = answers
        rePost.post_url = `https://qviple.com/q/${rePost.authorUserName}/profile`
        if(post_user){
          var reNotify = new Notification({})
          reNotify.notifyContent = `${answers.authorUserName} have added answers on ${post.authorUserName} questions`;
          reNotify.notifySender = answers.author;
          reNotify.notifyReceiever = post.author;
          post_user.uNotify.push(reNotify._id);
          reNotify.user = post_user._id;
          reNotify.notifyByPhoto = user._id
          invokeFirebaseNotification("Answer", reNotify, 'New Answer', post_user._id, post_user.deviceToken, post._id);
          await Promise.all([ reNotify.save(), post_user.save() ])
        }
        await Promise.all([rePost.save(), answers.save(), user.save(), post.save() ]);
        res.status(200).send({ message: 'RePosted Answer', rePost})
        if(user.userFollowers.length >= 1){
          user.userFollowers.forEach(async (ele) => {
            ele.userPosts.push(post._id)
            await ele.save()
          })
        }
        if(user.userCircle.length >= 1){
            user.userCircle.forEach(async (ele) => {
              ele.userPosts.push(post._id)
              await ele.save()
            })
        }
      }
      else{
        res.status(203).send({ message: 'Access Denied By Post Type'})
      }
    } catch(e) {
      console.log(e)
    }
  };