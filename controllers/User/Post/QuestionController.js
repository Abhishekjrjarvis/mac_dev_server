const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Answer = require("../../../models/Question/Answer");
const AnswerReply = require("../../../models/Question/AnswerReply");
const Notification = require("../../../models/notification");
const { uploadPostImageFile, deleteFile } = require("../../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../../Firebase/firebase");
const InstituteAdmin = require("../../../models/InstituteAdmin");
const HashTag = require("../../../models/HashTag/hashTag");
// const encryptionPayload = require("../../../Utilities/Encrypt/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../../config/redis-config");

exports.postQuestionText = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .populate({ path: "userFollowers" })
      .populate({ path: "userCircle" });
    const post = new Post({ ...req.body });
    post.imageId = "1";
    if (req.files?.length >= 1) {
      for (let file of req.files) {
        const results = await uploadPostImageFile(file);
        post.postImage.push(results.Key);
        await unlinkFile(file.path);
      }
      post.imageId = "0";
    }
    if (req.body?.hashtag && req.body?.hashtag?.length > 0) {
      for (let hash of req.body?.hashtag) {
        const hTag = await HashTag.findById({ _id: `${hash}` });
        post.hash_tag.push(hTag._id);
        hTag.hashtag_post.push(post._id);
        hTag.hashtag_question_count += 1;
        await hTag.save();
      }
      post.is_hashtag = true;
    }
    user.userPosts.push(post._id);
    user.questionCount += 1;
    post.author = user._id;
    post.authorName = user.userLegalName;
    post.authorUserName = user.username;
    post.authorPhotoId = user.photoId;
    post.authorProfilePhoto = user.profilePhoto;
    post.authorOneLine = user.one_line_about;
    post.authorFollowersCount = user.followerCount;
    post.isUser = "user";
    post.postType = "Question";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([user.save(), post.save()]);
    // const postEncrypt = await encryptionPayload(post);
    res.status(201).send({ message: "post question is create", post });
    if (user.userFollowers.length >= 1) {
      user.userFollowers.forEach(async (ele) => {
        ele.userPosts.push(post._id);
        await ele.save();
      });
    }
    if (user.userCircle.length >= 1) {
      user.userCircle.forEach(async (ele) => {
        ele.userPosts.push(post._id);
        await ele.save();
      });
    }
    if (req.body?.hashtag && req.body?.hashtag?.length > 0) {
      req.body?.hashtag?.forEach(async (ele) => {
        const hash = await HashTag.findById({ _id: `${ele}` }).select(
          "hashtag_follower"
        );
        const users = await User.find({ _id: { $in: hash?.hashtag_follower } });
        users?.forEach(async (user) => {
          if (user.userPosts?.includes(post._id)) {
          } else {
            user.userPosts.push(post._id);
          }
          await user.save();
        });
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.postQuestionDelete = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const user = await User.findById({ _id: id });
    await User.findByIdAndUpdate(id, { $pull: { userPosts: pid } });
    await Post.findByIdAndDelete({ _id: pid });
    if (user.questionCount >= 1) {
      user.questionCount -= 1;
    }
    await user.save();
    res.status(200).send({ message: "post question deleted" });
  } catch (e) {
    console.log(e);
  }
};

exports.answerLike = async (req, res) => {
  try {
    const { aid } = req.params;
    const answer = await Answer.findById({ _id: aid });
    const question = await Post.findById({ _id: `${answer.post}` });
    const user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    if (user_session) {
      if (
        answer.upVote.length >= 1 &&
        answer.upVote.includes(String(user_session))
      ) {
        answer.upVote.pull(user_session);
        if (answer.upVoteCount >= 1) {
          answer.upVoteCount -= 1;
          question.answerUpVoteCount -= 1;
        }
        await Promise.all([answer.save(), question.save()]);
        // const voteEncrypt = await encryptionPayload(answer.upVoteCount);
        res.status(200).send({
          message: "Removed from Upvote 👎",
          upVoteCount: answer.upVoteCount,
        });
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
        question.answerUpVoteCount += 1;
        await Promise.all([answer.save(), question.save()]);
        // Add Another Encryption
        res.status(200).send({
          message: "Added To Upvote 👍",
          upVoteCount: answer.upVoteCount,
          downVoteCount: answer.downVoteCount,
        });
      }
    } else {
      res.status(401).send();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.answerDisLike = async (req, res) => {
  try {
    const { aid } = req.params;
    const answer = await Answer.findById({ _id: aid });
    const question = await Post.findById({ _id: `${answer.post}` });
    const user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    if (user_session) {
      if (
        answer.downVote.length >= 1 &&
        answer.downVote.includes(String(user_session))
      ) {
        answer.downVote.pull(user_session);
        if (answer.downVoteCount >= 1) {
          answer.downVoteCount -= 1;
        }
        await Promise.all([answer.save()]);
        // const voteEncrypt = await encryptionPayload(answer.downVoteCount);
        res.status(200).send({
          message: "Removed from DownVote 👎",
          downVoteCount: answer.downVoteCount,
        });
      } else {
        if (
          answer.upVote.length >= 1 &&
          answer.upVote.includes(String(user_session))
        ) {
          answer.upVote.pull(user_session);
          if (answer.upVoteCount >= 1) {
            answer.upVoteCount -= 1;
            question.answerUpVoteCount -= 1;
          }
        }
        answer.downVote.push(user_session);
        answer.downVoteCount += 1;
        await Promise.all([answer.save(), question.save()]);
        // Add Another Encryption
        res.status(200).send({
          message: "Added To DownVote 👍",
          downVoteCount: answer.downVoteCount,
          upVoteCount: answer.upVoteCount,
        });
      }
    } else {
      res.status(401).send();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.postQuestionSave = async (req, res) => {
  try {
    const { pid } = req.params;
    const user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    if (user_session) {
      const post = await Post.findById({ _id: pid });
      if (
        post.endUserSave.length >= 1 &&
        post.endUserSave.includes(user_session)
      ) {
        post.endUserSave.pull(user_session);
        await post.save();
        res.status(200).send({ message: "Remove To Favourites 👎" });
      } else {
        post.endUserSave.push(user_session);
        await post.save();
        res.status(200).send({ message: "Added To Favourites 👍" });
      }
    } else {
      res.status(401).send({ message: "Unauthorized access" });
    }
  } catch {}
};

exports.postQuestionAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { post_type } = req.query;
    var post = await Post.findById({ _id: id });
    //
    var post_user = await User.findOne({ _id: `${post.author}` });
    var post_ins = await InstituteAdmin.findOne({ _id: `${post.author}` });
    //
    if (post_type === "Only Answer") {
      const answers = new Answer({ ...req.body });
      answers.answerImageId = "1";
      if (req.files) {
        for (let file of req.files) {
          const results = await uploadPostImageFile(file);
          answers.answerImage.push(results.Key);
          await unlinkFile(file.path);
        }
        answers.answerImageId = "0";
      }
      if (req.tokenData && req.tokenData.userId) {
        var user = await User.findById({ _id: req.tokenData.userId });
        if (user.staff.length >= 1) {
          answers.isMentor = "yes";
        }
        answers.author = user._id;
        answers.authorName = user.userLegalName;
        answers.authorUserName = user.username;
        answers.authorPhotoId = user.photoId;
        answers.authorProfilePhoto = user.profilePhoto;
        answers.authorOneLine = user.one_line_about;
      } else {
        res.status(401).send({ message: "Unauthorized" });
      }
      user.answered_query.push(answers._id);
      post.answer.push(answers._id);
      post.answerCount += 1;
      answers.post = post;
      user.answerQuestionCount += 1;
      await Promise.all([post.save(), answers.save(), user.save()]);
      //
      var notify = new Notification({});
      notify.notifyContent = `${answers.authorName} answered your question`;
      notify.notify_hi_content = `${answers.authorName} ने आपके प्रश्न का उत्तर दिया |`;
      notify.notify_mr_content = `${answers.authorName} ने तुमच्या प्रश्नाचे उत्तर दिले.`;
      notify.notifySender = answers.author;
      notify.notifyCategory = "Answer";
      notify.notifyByPhoto = answers.author;
      if (post_user) {
        notify.notifyReceiever = post_user._id;
        post_user.uNotify.push(notify._id);
        notify.user = post_user._id;
        await Promise.all([post_user.save(), notify.save()]);
        if (post_user?.user_answer_notify === "Enable") {
          await invokeFirebaseNotification(
            "Answer",
            notify,
            "New Answer",
            answers.author,
            post_user.deviceToken,
            post._id
          );
        }
      } else if (post_ins) {
        notify.notifyReceiever = post_ins._id;
        post_ins.iNotify.push(notify._id);
        notify.institute = post_ins._id;
        await Promise.all([post_ins.save(), notify.save()]);
        await invokeFirebaseNotification(
          "Answer",
          notify,
          "New Answer",
          answers.author,
          post_ins.deviceToken,
          post._id
        );
      }
      // const answerEncrypt = await encryptionPayload(answers);
      res.status(201).send({ message: "answer created", answers });
      //
    } else {
      res.status(200).send({ message: "Access Denied By Post Type" });
    }
  } catch (e) {
    console.log("AN", e);
  }
};

exports.getQuestionAnswer = async (req, res) => {
  try {
    const pid = req.params.id;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`USER-Answer-${pid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Question Answer Feed from Cache 🙌",
    //     answer: is_cache.answer,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const insPost = await Post.findById(pid);
    const answer = await Answer.find({
      _id: { $in: insPost.answer },
    })
      .sort("-upVoteCount")
      .limit(limit)
      .skip(skip)
      .select(
        "answerContent answer_content_transcript createdAt answerImageId answerImage upVote upVoteCount authorOneLine downVote downVoteCount isMentor answerReplyCount author answerSave authorName authorUserName authorPhotoId authorProfilePhoto"
      )
      .populate({
        path: "post",
        select:
          "postQuestion author authorProfilePhoto authorPhotoId authorUserName isUser answerCount createdAt post_question_transcript",
      });
    // const answerEncrypt = await encryptionPayload(answer);
    // const cached = await connect_redis_miss(
    //   `USER-Answer-${pid}-${page}`,
    //   answer
    // );
    res.status(200).send({
      message: "All answer's of one Question",
      // answer: cached.answer,
      answer: answer,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getAnswerReply = async (req, res) => {
  try {
    const rid = req.params.rid;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`USER-AnswerReply-${rid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Answer Reply Feed from Cache 🙌",
    //     answer: is_cache.reply,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const answer = await Answer.findById(rid);
    const reply = await AnswerReply.find({
      _id: { $in: answer.answerReply },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "answerReplyContent createdAt author authorName authorUserName authorOneLine authorPhotoId authorProfilePhoto"
      )
      .populate({
        path: "parentAnswer",
        select: "id",
      });
    // const replyEncrypt = await encryptionPayload(reply);
    // const cached = await connect_redis_miss(
    //   `USER-AnswerReply-${rid}-${page}`,
    //   reply
    // );
    res.status(200).send({
      message: "All Answer's reply Feed from DB",
      // reply: cached.reply,
      reply: reply,
    });
  } catch {}
};

exports.postAnswerReply = async (req, res) => {
  try {
    const { rid } = req.params;
    const { reply, uid } = req.body;
    if (req.tokenData && req.tokenData.userId) {
      const users = await User.findById({ _id: req.tokenData.userId });
      const answerReply = new AnswerReply({
        answerReplyContent: reply,
        author: users._id,
        authorName: users.userLegalName,
        authorUserName: users.username,
        authorPhotoId: users.photoId,
        authorProfilePhoto: users.profilePhoto,
        authorOneLine: users.one_line_about,
        parentAnswer: rid,
      });
      const p_answer = await Answer.findById(rid);
      p_answer.answerReply.unshift(answerReply._id);
      p_answer.answerReplyCount += 1;
      await Promise.all([p_answer.save(), answerReply.save()]);
      const user = await User.findById(users._id).select(
        "photoId profilePhoto username userLegalName"
      );
      const replyAnswer = {
        _id: answerReply._id,
        answerReplyContent: answerReply.answerReplyContent,
        createdAt: answerReply.createdAt,
        author: user._id,
        authorName: user.userLegalName,
        authorUserName: user.username,
        authorPhotoId: user.photoId,
        authorProfilePhoto: user.profilePhoto,
        authorOneLine: user.one_line_about,
      };
      // Add Another Encryption
      res.status(201).send({
        replyAnswer,
        allAnswerReply: p_answer.answerReplyCount,
      });
    } else {
      res.status(401).send({ message: "Unauthorized" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.questionAnswerSave = async (req, res) => {
  try {
    const { aid } = req.params;
    const user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    var user = await User.findById({ _id: `${user_session}` });
    if (user_session) {
      const answer = await Answer.findById({ _id: aid });
      if (
        answer.answerSave.length >= 1 &&
        answer.answerSave.includes(user_session)
      ) {
        answer.answerSave.pull(user_session);
        user.user_saved_answer.pull(answer._id);
        await Promise.all([answer.save(), user.save()]);
        res
          .status(200)
          .send({ message: "Remove Answer To Favourites 👎", status: false });
      } else {
        answer.answerSave.push(user_session);
        user.user_saved_answer.push(answer._id);
        await Promise.all([answer.save(), user.save()]);
        res
          .status(200)
          .send({ message: "Added Answer To Favourites 👍", status: true });
      }
    } else {
      res.status(401).send({ message: "Unauthorized access" });
    }
  } catch {}
};

exports.postQuestionDeleteAnswer = async (req, res) => {
  try {
    const { pid, aid } = req.params;
    const post = await Post.findById({ _id: pid });
    await Post.findByIdAndUpdate(id, { $pull: { answer: aid } });
    await Answer.findByIdAndDelete({ _id: aid });
    if (post.answerCount > 0) {
      post.answerCount -= 1;
    }
    await post.save();
    res.status(200).send({ message: "post question answer deleted" });
  } catch (e) {
    console.log(e);
  }
};

exports.rePostQuestionAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { post_type } = req.query;
    var post = await Post.findById({ _id: id });
    //
    var post_user = await User.findOne({ _id: `${post.author}` });
    var post_ins = await InstituteAdmin.findOne({ _id: `${post.author}` });
    //
    if (post_type === "Repost") {
      var answers = new Answer({ ...req.body });
      answers.answerImageId = "1";
      if (req.files.length >= 1) {
        for (let file of req.files) {
          const results = await uploadPostImageFile(file);
          answers.answerImage.push(results.Key);
          await unlinkFile(file.path);
        }
        answers.answerImageId = "0";
      }
      if (req.tokenData && req.tokenData.userId) {
        var user = await User.findById({ _id: `${req.tokenData.userId}` })
          .populate({ path: "userFollowers" })
          .populate({ path: "userCircle" });
        if (user.staff.length >= 1) {
          answers.isMentor = "yes";
        }
        answers.author = user._id;
        answers.authorName = user.userLegalName;
        answers.authorUserName = user.username;
        answers.authorPhotoId = user.photoId;
        answers.authorProfilePhoto = user.profilePhoto;
        answers.authorOneLine = user.one_line_about;
      }
      var rePost = new Post({});
      var parseHash = req.body?.hashtag ? JSON.parse(req.body?.hashtag) : "";
      if (parseHash.length > 0) {
        for (let hash of parseHash) {
          const hTag = await HashTag.findById({ _id: `${hash}` });
          rePost.hash_tag.push(hTag._id);
          hTag.hashtag_post.push(rePost._id);
          hTag.hashtag_repost_count += 1;
          await hTag.save();
        }
        rePost.is_hashtag = true;
      }
      rePost.author = user._id;
      rePost.authorName = user.userLegalName;
      rePost.authorUserName = user.username;
      rePost.authorPhotoId = user.photoId;
      rePost.authorProfilePhoto = user.profilePhoto;
      rePost.authorOneLine = user.one_line_about;
      rePost.authorFollowersCount = user.followerCount;
      user.answered_query.push(answers._id);
      post.answer.push(answers._id);
      post.answerCount += 1;
      answers.post = post;
      user.answerQuestionCount += 1;
      user.userPosts.push(rePost._id);
      user.postCount += 1;
      rePost.isUser = "user";
      rePost.postType = "Repost";
      rePost.rePostAnswer = answers;
      rePost.post_url = `https://qviple.com/q/${rePost.authorUserName}/profile`;
      await Promise.all([
        rePost.save(),
        answers.save(),
        user.save(),
        post.save(),
      ]);

      var notify = new Notification({});
      notify.notifyContent = `${answers.authorName} answered your question with repost.`;
      notify.notify_hi_content = `${answers.authorName} ने आपके प्रश्न का उत्तर रिपोस्ट के साथ दिया।`;
      notify.notify_mr_content = `${answers.authorName} ने तुमच्या प्रश्नाचे उत्तर पुन्हा पोस्टसह दिले.`;
      notify.notifySender = answers.author;
      notify.notifyByPhoto = answers.author;
      notify.notifyCategory = "Repost";
      if (post_user) {
        notify.notifyReceiever = post_user._id;
        post_user.uNotify.push(notify._id);
        notify.user = post_user._id;
        await Promise.all([post_user.save(), notify.save()]);
        await invokeFirebaseNotification(
          "Answer",
          notify,
          "New Repost Answer",
          answers.author,
          post_user.deviceToken,
          post._id
        );
      } else if (post_ins) {
        notify.notifyReceiever = post_ins._id;
        post_ins.iNotify.push(notify._id);
        notify.institute = post_ins._id;
        await Promise.all([post_ins.save(), notify.save()]);
        await invokeFirebaseNotification(
          "Answer",
          notify,
          "New Repost Answer",
          answers.author,
          post_ins.deviceToken,
          post._id
        );
      }
      //
      // const repostEncrypt = await encryptionPayload(repost);
      res.status(200).send({ message: "RePosted Answer", rePost });
      if (user.userFollowers.length >= 1) {
        user.userFollowers.forEach(async (ele) => {
          if (ele.userPosts.includes(rePost._id)) {
          } else {
            ele.userPosts.push(rePost._id);
            await ele.save();
          }
        });
      }
      if (user.userCircle.length >= 1) {
        user.userCircle.forEach(async (ele) => {
          if (ele.userPosts.includes(rePost._id)) {
          } else {
            ele.userPosts.push(rePost._id);
            await ele.save();
          }
        });
      }
      if (parseHash && parseHash?.length > 0) {
        parseHash?.forEach(async (ele) => {
          const hash = await HashTag.findById({ _id: `${ele}` }).select(
            "hashtag_follower"
          );
          const users = await User.find({
            _id: { $in: hash?.hashtag_follower },
          });
          users?.forEach(async (user) => {
            if (user.userPosts?.includes(rePost._id)) {
            } else {
              user.userPosts.push(rePost._id);
            }
            await user.save();
          });
        });
      }
    } else {
      res.status(203).send({ message: "Access Denied By Post Type" });
    }
  } catch (e) {
    console.log("REAN", e);
  }
};

exports.rePostAnswerLike = async (req, res) => {
  try {
    const { pid, aid } = req.params;
    const answer = await Answer.findById({ _id: aid });
    const rePost = await Post.findById({ _id: pid });
    const question = await Post.findById({ _id: `${answer.post}` });
    const user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    if (user_session) {
      //
      if (
        rePost.repostMultiple.length >= 1 &&
        rePost.repostMultiple.includes(String(user_session))
      ) {
        rePost.repostMultiple.pull(user_session);
        await rePost.save();
      } else {
        rePost.repostMultiple.push(user_session);
        await rePost.save();
      }
      //
      if (
        answer.upVote.length >= 1 &&
        answer.upVote.includes(String(user_session))
      ) {
        answer.upVote.pull(user_session);
        if (answer.upVoteCount >= 1) {
          answer.upVoteCount -= 1;
          question.answerUpVoteCount -= 1;
          rePost.isHelpful = "No";
        }
        await Promise.all([answer.save(), question.save(), rePost.save()]);
        // const voteEncrypt = await encryptionPayload(answer.upVoteCount);
        res.status(200).send({
          message: "Removed from Upvote 👎",
          upVoteCount: answer.upVoteCount,
        });
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
        question.answerUpVoteCount += 1;
        rePost.isHelpful = "Yes";
        await Promise.all([answer.save(), question.save(), rePost.save()]);
        // Add Another Encryption
        res.status(200).send({
          message: "Added To Upvote 👍",
          upVoteCount: answer.upVoteCount,
          downVoteCount: answer.downVoteCount,
        });

        if (rePost?.postType === "Repost") {
          const upVoteUser = await User.findById({ _id: `${user_session}` })
            .populate("userFollowers")
            .populate("userCircle");
          // if (`${rePost.author}` === `${upVoteUser._id}`) {
          //   console.log('true')
          // } else {
          // console.log('rendered')
          upVoteUser.userFollowers.forEach(async (ele) => {
            if (ele?.userPosts?.includes(rePost._id)) {
            } else {
              ele.userPosts.push(rePost._id);
              await ele.save();
            }
          });

          upVoteUser.userCircle.forEach(async (ele) => {
            if (ele?.userPosts?.includes(rePost._id)) {
            } else {
              ele.userPosts.push(rePost._id);
              await ele.save();
            }
          });
          // }
        }
      }
    } else {
      res.status(401).send();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveHelpQuestion = async (req, res) => {
  try {
    const { pid } = req.params;
    var user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    const post_ques = await Post.findById({ _id: pid });
    var user = await User.findById({ _id: `${user_session}` });
    if (user) {
      //
      if (
        post_ques.needMultiple.length >= 1 &&
        post_ques.needMultiple.includes(String(user._id))
      ) {
        post_ques.needMultiple.pull(user._id);
        await post_ques.save();
      } else {
        post_ques.needMultiple.push(user._id);
        await post_ques.save();
      }
      //
      if (
        post_ques.needUser.length >= 1 &&
        post_ques.needUser.includes(String(user._id))
      ) {
        post_ques.needUser.pull(user._id);
        if (post_ques?.needCount > 0) {
          post_ques.needCount -= 1;
          post_ques.isNeed = "No";
        }
        await post_ques.save();
        // const needEncrypt = await encryptionPayload(post_ques.needCount);
        res
          .status(200)
          .send({ message: "Removed from isNeed", need: post_ques.needCount });
      } else {
        post_ques.needUser.push(user._id);
        post_ques.needCount += 1;
        post_ques.isNeed = "Yes";
        await post_ques.save();
        // const needEncrypt = await encryptionPayload(post_ques.needCount);
        res
          .status(200)
          .send({ message: "Added to isNeed", need: post_ques.needCount });

        if (post_ques?.postType === "Question") {
          const isNeedUser = await User.findById({ _id: `${user_session}` })
            .populate("userFollowers")
            .populate("userCircle");
          if (`${post_ques.author}` === `${isNeedUser._id}`) {
          } else {
            isNeedUser.userFollowers.forEach(async (ele) => {
              if (ele?.userPosts?.includes(post_ques._id)) {
              } else {
                ele.userPosts.push(post_ques._id);
                await ele.save();
              }
            });

            isNeedUser.userCircle.forEach(async (ele) => {
              if (ele?.userPosts?.includes(post_ques._id)) {
              } else {
                ele.userPosts.push(post_ques._id);
                await ele.save();
              }
            });
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

//FOR EDIT AND DELETE

exports.answerEdit = async (req, res) => {
  try {
    if (!req.params.aid) throw "Please send answer id to perform task";
    await Answer.findByIdAndUpdate(req.params.aid, req.body);
    // if (req.body?.deleteImage?.length) {
    //   for (let dimage of req.body?.deleteImage) {
    //     answer?.answerImage?.pull(dimage);
    //     await deleteFile(dimage);
    //   }
    // }
    // if (req?.files) {
    //   for (let file of req.files) {
    //     const results = await uploadPostImageFile(file);
    //     answer.answerImage.push(results.Key);
    //     await unlinkFile(file.path);
    //   }
    //   answer.answerImageId = "0";
    // }
    // await answer.save();
    res
      .status(200)
      .send({ message: "Answer | Repost Edited successfully👍", new: true });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.answerReplyEdit = async (req, res) => {
  try {
    if (!req.params.aid) throw "Please send reply answer id to perform task";
    await AnswerReply.findByIdAndUpdate(req.params.aid, req.body);
    res.status(200).send({ message: "Reply answer Edited successfully👍" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.answerReplyDelete = async (req, res) => {
  try {
    if (!req.params.aid) throw "Please send reply answer id to perform task";
    const ranswer = await AnswerReply.findById(req.params.aid);
    const answer = await Answer.findById(ranswer.parentAnswer);
    if (answer.answerReplyCount >= 1) {
      answer.answerReplyCount -= 1;
    }
    await answer.save();
    await AnswerReply.findByIdAndDelete(req.params.cid);
    res.status(200).send({ message: "Reply Answer Deleted successfully👍" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.getAllSaveAnswerQuery = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const uid = req.params.uid;
    // const is_cache = await connect_redis_hit(`USER-AnswerSave-${uid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Save Answer Feed from Cache 🙌",
    //     answer: is_cache.answer,
    //     answerCount: is_cache.answerCount,
    //     totalPage: is_cache.totalPage,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const user = await User.findById(uid).select("id").populate({
      path: "user_saved_answer",
    });
    if (user && user.user_saved_answer.length >= 1) {
      var answer = await Answer.find({
        $and: [{ _id: { $in: user.user_saved_answer } }],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "answerContent answer_content_transcript createdAt answerImageId answerImage upVote upVoteCount authorOneLine downVote downVoteCount isMentor answerReplyCount author answerSave authorName authorUserName authorPhotoId authorProfilePhoto"
        )
        .populate({
          path: "post",
          select:
            "postQuestion author authorProfilePhoto authorPhotoId authorUserName isUser answerCount createdAt post_question_transcript",
        });

      const answerCount = await Answer.find({
        _id: { $in: user.user_saved_answer },
      });
      if (page * limit >= answerCount.length) {
      } else {
        var totalPage = page + 1;
      }
      // Add Another Encryption
      // const bind_answer = {
      //   answer: answer,
      //   answerCount: answerCount.length,
      //   totalPage: totalPage,
      // };
      // const cached = await connect_redis_miss(
      //   `USER-AnswerSave-${uid}-${page}`,
      //   bind_answer
      // );
      res.status(200).send({
        message: "All Save Answer Feed from DB 🙌",
        // answer: cached.answer,
        // answerCount: cached.answerCount,
        // totalPage: cached.totalPage,
        answer: answer,
        answerCount: answerCount.length,
        totalPage: totalPage,
      });
    } else {
      res.status(200).send({ message: "No Answer Found", answer: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getOneQuestionQuery = async (req, res) => {
  try {
    const { qid } = req.params;
    // const is_cache = await connect_redis_hit(`One-Question-${qid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "One Question from Cache 🙌",
    //     one_query: is_cache.one_question,
    //   });
    const one_question = await Post.findById({ _id: qid }).select(
      "postQuestion commentCount answerCount createdAt author authorUserName authorProfilePhoto authorPhotoId needCount needUser isInstitute isUser endUserSave"
    );
    // const oneEncrypt = await encryptionPayload(one_question);
    // const cached = await connect_redis_miss(
    //   `One-Question-${qid}`,
    //   one_question
    // );
    res.status(200).send({
      message: "Question Query",
      // one_query: cached.one_question
      one_query: one_question,
    });
  } catch (e) {
    console.log(e);
  }
};