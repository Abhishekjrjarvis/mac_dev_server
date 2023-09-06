const User = require("../../../models/User");
const Post = require("../../../models/Post");
const InstituteAdmin = require("../../../models/InstituteAdmin");
const Poll = require("../../../models/Question/Poll");
const { uploadPostImageFile } = require("../../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const Close = require("../../../Service/close");
const HashTag = require("../../../models/HashTag/hashTag");
const invokeFirebaseNotification = require("../../../Firebase/firebase");
const Notification = require("../../../models/notification");
// const encryptionPayload = require("../../../Utilities/Encrypt/payload");

exports.postQuestionText = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" })
      .populate({ path: "joinedUserList" });

    const post = new Post({ ...req.body });
    post.imageId = "1";
    if (req.files && req.files.length >= 1) {
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
    institute.posts.push(post._id);
    institute.questionCount += 1;
    post.author = institute._id;
    post.authorName = institute.insName;
    post.authorUserName = institute.name;
    post.authorPhotoId = institute.photoId;
    post.authorProfilePhoto = institute.insProfilePhoto;
    post.authorOneLine = institute.one_line_about;
    post.authorFollowersCount = institute.followersCount;
    post.isInstitute = "institute";
    post.postType = "Question";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([institute.save(), post.save()]);
    // const postEncrypt = await encryptionPayload(post);
    res.status(201).send({ message: "post Question is created", post });
    if (institute.isUniversal === "Not Assigned") {
      if (institute.followers.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.followers.forEach(async (ele) => {
            ele.posts.push(post._id);
            await ele.save();
          });
        } else {
        }
      }
      if (institute.userFollowersList.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.userFollowersList.forEach(async (ele) => {
            ele.userPosts.push(post._id);
            await ele.save();
          });
        } else {
          if (institute.joinedUserList.length >= 1) {
            institute.joinedUserList.forEach(async (ele) => {
              ele.userPosts.push(post._id);
              await ele.save();
            });
          }
        }
      }
    } else if (institute.isUniversal === "Universal") {
      const all = await InstituteAdmin.find({ status: "Approved" });
      const user = await User.find({ userStatus: "Approved" });
      if (post.postStatus === "Anyone") {
        all.forEach(async (el) => {
          if (el._id !== institute._id) {
            el.posts.push(post._id);
            await el.save();
          }
        });
        user.forEach(async (el) => {
          el.userPosts.push(post._id);
          await el.save();
        });
      }
      if (req.body?.hashtag && req.body?.hashtag?.length > 0) {
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
      //   if (post.postStatus === "Private") {
      //     all.forEach(async (el) => {
      //       if (el._id !== institute._id) {
      //         el.posts.push(post._id);
      //         await el.save();
      //       }
      //     });
      //   }
    }
    // if (institute?.isUniversal === "Universal") {
    //   for (var ref of institute?.userFollowersList) {
    //     var notify = new Notification({});
    //     notify.notifyContent = `Qviple Universal posted a question: ${post?.postQuestion}`;
    //     notify.notifySender = institute?._id;
    //     notify.notifyReceiever = ref._id;
    //     notify.notifyCategory = "Post Feed";
    //     ref.uNotify.push(notify._id);
    //     notify.notifyByInsPhoto = institute._id;
    //     await invokeFirebaseNotification(
    //       "New To Post Feed",
    //       notify,
    //       institute.insName,
    //       ref._id,
    //       ref.deviceToken
    //     );
    //     await Promise.all([notify.save(), ref.save()]);
    //   }
    // }
  } catch (e) {
    console.log(e);
  }
};

exports.postQuestionDelete = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { posts: pid } });
    await Post.findByIdAndDelete({ _id: pid });
    if (institute.questionCount >= 1) {
      institute.questionCount -= 1;
    }
    await institute.save();
    res.status(200).send({ message: "post question deleted" });
  } catch (e) {
    console.log(e);
  }
};

exports.retrievePollQuestionText = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" })
      .populate({ path: "joinedUserList" });
    if (req.body.pollAnswer.length >= 2 && req.body.pollAnswer.length <= 5) {
      const post = new Post({ ...req.body });
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
      institute.posts.push(post._id);
      institute.pollCount += 1;
      post.author = institute._id;
      post.authorName = institute.insName;
      post.authorUserName = institute.name;
      post.authorPhotoId = institute.photoId;
      post.authorProfilePhoto = institute.insProfilePhoto;
      post.authorOneLine = institute.one_line_about;
      post.authorFollowersCount = institute.followersCount;
      post.isInstitute = "institute";
      post.postType = "Poll";
      post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
      post.poll_query = poll;
      poll.duration_date = Close.end_poll(req.body.day);
      await Promise.all([institute.save(), post.save(), poll.save()]);
      // Add Another Encryption
      res.status(201).send({ message: "poll is created", poll, post });
      if (institute.isUniversal === "Not Assigned") {
        if (institute.followers.length >= 1) {
          if (post.postStatus === "Anyone") {
            institute.followers.forEach(async (ele) => {
              ele.posts.push(post._id);
              await ele.save();
            });
          } else {
          }
        }
        if (institute.userFollowersList.length >= 1) {
          if (post.postStatus === "Anyone") {
            institute.userFollowersList.forEach(async (ele) => {
              ele.userPosts.push(post._id);
              await ele.save();
            });
          } else {
            if (institute.joinedUserList.length >= 1) {
              institute.joinedUserList.forEach(async (ele) => {
                ele.userPosts.push(post._id);
                await ele.save();
              });
            }
          }
        }
      } else if (institute.isUniversal === "Universal") {
        const all = await InstituteAdmin.find({ status: "Approved" });
        const user = await User.find({ userStatus: "Approved" });
        if (post.postStatus === "Anyone") {
          all.forEach(async (el) => {
            if (el._id !== institute._id) {
              el.posts.push(post._id);
              await el.save();
            }
          });
          user.forEach(async (el) => {
            el.userPosts.push(post._id);
            await el.save();
          });
        }
      } else {
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
      // if (institute?.isUniversal === "Universal") {
      //   for (var ref of institute?.userFollowersList) {
      //     var notify = new Notification({});
      //     notify.notifyContent = `Qviple Universal posted a poll: ${poll?.poll_question}`;
      //     notify.notifySender = institute?._id;
      //     notify.notifyReceiever = ref._id;
      //     notify.notifyCategory = "Post Feed";
      //     ref.uNotify.push(notify._id);
      //     notify.notifyByInsPhoto = institute._id;
      //     await invokeFirebaseNotification(
      //       "New To Post Feed",
      //       notify,
      //       institute.insName,
      //       ref._id,
      //       ref.deviceToken
      //     );
      //     await Promise.all([notify.save(), ref.save()]);
      //   }
      // }
    } else {
      res
        .status(422)
        .send({ message: "Not Valid Poll Option Min Max Critiriea" });
    }
  } catch (e) {
    console.log(e);
  }
};
