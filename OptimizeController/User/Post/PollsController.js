const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Poll = require("../../../models/Question/Poll");
const Close = require("../../../Service/close");
const HashTag = require("../../../models/HashTag/hashTag");
// const encryptionPayload = require("../../../Utilities/Encrypt/payload");

exports.retrievePollQuestionText = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .populate({ path: "userFollowers" })
      .populate({ path: "userCircle" });
    if (req.body.pollAnswer.length >= 2 && req.body.pollAnswer.length <= 5) {
      var post = new Post({ ...req.body });
      var poll = new Poll({ ...req.body });
      for (let i = 0; i < req.body.pollAnswer.length; i++) {
        poll.poll_answer.push({
          content: req.body.pollAnswer[i].content,
        });
      }
      if (req.body?.hashtag?.length > 0) {
        for (let hash of req.body?.hashtag) {
          const hTag = await HashTag.findById({ _id: `${hash}` });
          post.hash_tag.push(hTag._id);
          hTag.hashtag_post.push(post._id);
          hTag.hashtag_poll_count += 1;
          await hTag.save();
        }
        post.is_hashtag = true;
      }
      post.imageId = "1";
      user.userPosts.push(post._id);
      user.poll_Count += 1;
      post.author = user._id;
      post.authorName = user.userLegalName;
      post.authorUserName = user.username;
      post.authorPhotoId = user.photoId;
      post.authorProfilePhoto = user.profilePhoto;
      post.authorOneLine = user.one_line_about;
      post.authorFollowersCount = user.followerCount;
      post.isUser = "user";
      post.postType = "Poll";
      post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
      post.poll_query = poll;
      poll.duration_date = Close.end_poll(req.body.day);
      await Promise.all([user.save(), post.save(), poll.save()]);
      // Add Another Encryption
      res.status(201).send({ message: "Poll is create", poll, post });
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
      if (req.body?.hashtag?.length > 0) {
        req.body?.hashtag?.forEach(async (ele) => {
          const hash = await HashTag.findById({ _id: `${ele}` }).select(
            "hashtag_follower"
          );
          const users = await User.find({
            _id: { $in: hash?.hashtag_follower },
          });
          users?.forEach(async (user) => {
            if (user.userPosts?.includes(post._id)) {
            } else {
              user.userPosts.push(post._id);
            }
            await user.save();
          });
        });
      }
    } else {
      res
        .status(422)
        .send({ message: "Not Valid Poll Option Min Max Critiriea" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.pollLike = async (req, res) => {
  try {
    const { pid } = req.params;
    const { answerId } = req.body;
    var user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    var post = await Post.findById({ _id: pid });
    const poll = await Poll.findById({ _id: `${post.poll_query}` });
    if (user_session) {
      if (
        poll.answeredUser.length >= 1 &&
        poll.answeredUser.includes(String(user_session))
      ) {
        res.status(200).send({ message: "You're already voted" });
      } else {
        for (let i = 0; i < poll.poll_answer.length; i++) {
          if (`${poll.poll_answer[i]._id}` === `${answerId}`) {
            if (
              poll.poll_answer[i].users.length >= 1 &&
              poll.poll_answer[i].users.includes(String(user_session))
            ) {
            } else {
              poll.poll_answer[i].users.push(user_session);
              poll.userPollCount += 1;
              poll.poll_answer[i].percent_vote =
                (poll.poll_answer[i].users.length / poll.userPollCount) * 100;
              poll.total_votes += 1;
              await poll.save();
            }
          }
        }
        poll.answeredUser.push(user_session);
        for (let i = 0; i < poll.poll_answer.length; i++) {
          poll.poll_answer[i].percent_vote =
            (poll.poll_answer[i].users.length / poll.userPollCount) * 100;
          await poll.save();
        }
        // const voteEncrypt = await encryptionPayload(poll.total_votes);
        res
          .status(200)
          .send({ message: "Added To Poll", voteAtPoll: poll.total_votes });
        //
        if (post?.postType === "Poll") {
          const poll_user = await User.findById({ _id: `${user_session}` })
            .populate("userFollowers")
            .populate("userCircle");
          if (`${post.author}` === `${poll_user._id}`) {
          } else {
            poll_user.userFollowers.forEach(async (ele) => {
              if (ele?.userPosts?.includes(post._id)) {
              } else {
                ele.userPosts.push(post._id);
                await ele.save();
              }
            });

            poll_user.userCircle.forEach(async (ele) => {
              if (ele?.userPosts?.includes(post._id)) {
              } else {
                ele.userPosts.push(post._id);
                await ele.save();
              }
            });
          }
        }
        //
      }
    } else {
      res.status(401).send({ message: "UnAuthorised" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditPollQuery = async (req, res) => {
  try {
    const { pid } = req.params;
    var post = await Post.findById({ _id: pid });
    var poll = await Poll.findById({ _id: `${post.poll_query}` });
    if (req.body?.poll_question) {
      poll.poll_question = req.body?.poll_question;
    }
    if (req.body?.trend_category) {
      post.trend_category = req.body?.trend_category;
    }
    if (req.body?.pollAnswer.length >= 2 && req.body?.pollAnswer.length <= 5) {
      for (let i = 0; i < req.body?.pollAnswer.length; i++) {
        poll.poll_answer.forEach((ele) => {
          if (`${ele?._id}` === `${req.body?.pollAnswer[i].oid}`) {
            ele.content = req.body?.pollAnswer[i].content;
          }
        });
      }
    }
    await Promise.all([poll.save(), post.save()]);
    res
      .status(200)
      .send({ message: "Poll Edited Successfully 👍", edited: true });
  } catch (e) {
    console.log(e);
  }
};