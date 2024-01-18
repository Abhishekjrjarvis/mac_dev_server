const InstituteAdmin = require("../../models/InstituteAdmin");
const Admin = require("../../models/superAdmin");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const Report = require("../../models/Report");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const InsAnnouncement = require("../../models/InsAnnouncement");
const bcrypt = require("bcryptjs");
const Answer = require("../../models/Question/Answer");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const ReplyComment = require("../../models/ReplyComment/ReplyComment");
const AnswerReply = require("../../models/Question/AnswerReply");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Class = require("../../models/Class");
const invokeSpecificRegister = require("../../Firebase/specific");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");

const {
  getFileStream,
  uploadDocFile,
  uploadVideo,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../Firebase/firebase");
const { dateTimeSort } = require("../../Utilities/timeComparison");
const { shuffleArray } = require("../../Utilities/Shuffle");
const { valid_student_form_query } = require("../../Functions/validForm");
const { handle_undefined } = require("../../Handler/customError");
const { calc_profile_percentage } = require("../../Functions/ProfilePercentage");
const QvipleId = require("../../models/Universal/QvipleId");
const { generateAccessInsToken } = require("../../helper/functions");
const StudentMessage = require("../../models/Content/StudentMessage");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.retrieveProfileData = async (req, res) => {
  try {
    const { id } = req.params;
    var totalUpVote = 0;
    var user = await User.findById({ _id: id })
      .select(
        "userLegalName photoId show_suggestion last_login qviple_id profile_modification is_mentor user_block_institute questionCount blockedBy blockCount blockStatus user one_line_about recoveryMail answerQuestionCount profilePhoto user_birth_privacy user_address_privacy user_circle_privacy tag_privacy user_follower_notify user_comment_notify user_answer_notify user_institute_notify userBio userAddress userEducation userHobbies userGender coverId profileCoverPhoto username followerCount followingUICount circleCount postCount userAbout userEmail userAddress userDateOfBirth userPhoneNumber userHobbies userEducation "
      )
      .populate({
        path: "daily_quote_query.quote",
      });
    const answers = await Answer.find({ author: id });
    for (let up of answers) {
      totalUpVote += up.upVoteCount;
    }
    if (user && user?.userPosts?.length < 1) {
      var post = [];
    }
    const qvipleId = await QvipleId.findOne({ user: `${user?._id}`})
    user.qviple_id = qvipleId?.qviple_id
    // Add Another Encryption
    res.status(200).send({
      message: "Limit User Profile Data ",
      user,
      upVote: totalUpVote,
      post,
      profile_modification: user?.profile_modification,
    });
    // if (`${req.tokenData?.userId}` === `${id}`) {
    // } else {
    //   const see_user = await User.findById({
    //     _id: `${req.tokenData?.userId}`,
    //   }).select("userLegalName deviceToken");
    //   invokeSpecificRegister(
    //     "Specific Notification",
    //     `${see_user?.userLegalName} viewed your profile`,
    //     "View Profile",
    //     see_user._id,
    //     see_user.deviceToken
    //   );
    // }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveFIAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id }).select(
      "followInsAnnouncement"
    );

    const announcements = await InsAnnouncement.find({
      _id: { $in: user?.followInsAnnouncement },
    })
      .sort("-createdAt")
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      })
      .lean()
      .exec();

    if (user) {
      // const aEncrypt = await encryptionPayload(render_data);
      res.status(200).send({
        message: "Success",
        announcements: announcements,
      });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.error(e);
  }
};

exports.retrieveFIOneAnnouncement = async (req, res) => {
  try {
    const announcementDetail = await InsAnnouncement.findById(req.params.aid)
      .populate({
        path: "announcementDocument",
        select: "documentType documentName documentKey",
      })
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      })
      .select(
        "insAnnTitle insAnnDescription insAnnVisibility announcementDocument createdAt institute"
      )
      .lean()
      .exec();

    if (announcementDetail) {
      // const adsEncrypt = await encryptionPayload(announcementDetail);
      res.status(200).send({
        message: "Success",
        announcementDetail,
      });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.error(e);
  }
};

exports.retrieveFIOneAnnouncement = async (req, res) => {
  try {
    const announcementDetail = await InsAnnouncement.findById(req.params.aid)
      .populate({
        path: "announcementDocument",
        select: "documentType documentName documentKey",
      })
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      })
      .select(
        "insAnnTitle insAnnDescription insAnnVisibility announcementDocument createdAt institute"
      )
      .lean()
      .exec();

    if (announcementDetail) {
      // const adsEncrypt = await encryptionPayload(announcementDetail);
      res.status(200).send({
        message: "Success",
        announcementDetail,
      });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.error(e);
  }
};

exports.updateUserFollowIns = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    const user = await User.findById({ _id: user_session });
    const sinstitute = await InstituteAdmin.findById({
      _id: req.body.InsfollowId,
    });

    if (sinstitute.userFollowersList.includes(user_session)) {
      res.status(200).send({ message: "You Already Following This Institute" });
    } else {
      if (sinstitute.status === "Approved") {
        const notify = new Notification({});
        sinstitute.userFollowersList.push(user_session);
        user.userInstituteFollowing.push(req.body.InsfollowId);
        user.followingUICount += 1;
        sinstitute.followersCount += 1;
        notify.notifyContent = `${user.userLegalName} started following you`;
        notify.notifySender = user._id;
        notify.notifyReceiever = sinstitute._id;
        notify.notifyCategory = "User Follow Institute";
        sinstitute.iNotify.push(notify._id);
        notify.institute = sinstitute._id;
        notify.notifyByPhoto = user._id;
        await Promise.all([user.save(), sinstitute.save(), notify.save()]);
        res.status(200).send({ message: "Following This Institute" });
        if (sinstitute.isUniversal === "Not Assigned") {
          const post = await Post.find({
            $and: [{ author: sinstitute._id, postStatus: "Anyone" }],
          });
          post.forEach(async (ele) => {
            ele.post_arr.push(user?._id)
            user.userPosts.push(ele);
            await ele.save()
          });
          await user.save();
        } else {
        }
        //
        const post = await Post.find({ author: `${sinstitute._id}` });
        post.forEach(async (ele) => {
          ele.authorFollowersCount = sinstitute.followersCount;
          await ele.save();
        });
        //
      } else {
        res
          .status(200)
          .send({ message: "Institute is Not Approved, you will not follow" });
      }
    }
  } catch (e) {
    console.log("UFOI", e);
  }
};

exports.removeUserFollowIns = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    var user = await User.findById({ _id: user_session });
    var sinstitute = await InstituteAdmin.findById({
      _id: req.body.InsfollowId,
    });

    if (sinstitute.status === "Approved") {
      if (
        sinstitute.userFollowersList.length >= 1 &&
        sinstitute.userFollowersList.includes(`${user._id}`)
      ) {
        user.userInstituteFollowing.pull(sinstitute._id);
        if (user.followingUICount > 0) {
          user.followingUICount -= 1;
        }
        sinstitute.userFollowersList.pull(user._id);
        if (sinstitute.followersCount > 0) {
          sinstitute.followersCount -= 1;
        }
        await user.save();
        await sinstitute.save();
        res.status(200).send({ message: "Unfollow Institute" });
        if (sinstitute.isUniversal === "Not Assigned") {
          const post = await Post.find({
            $and: [{ author: sinstitute._id, postStatus: "Anyone" }],
          });
          post.forEach(async (ele) => {
            ele.post_arr.pull(user?._id)
            user.userPosts.pull(ele);
            await ele.save()
          });
          await user.save();
        } else {
        }
        //
        const post = await Post.find({ author: `${sinstitute._id}` });
        post.forEach(async (ele) => {
          ele.authorFollowersCount = sinstitute.followersCount;
          await ele.save();
        });
        //
      } else {
        res
          .status(200)
          .send({ message: "You Already Unfollow This Institute" });
      }
    } else {
      res
        .status(200)
        .send({ message: "Institute is Not Approved, you will not follow" });
    }
  } catch (e) {
    console.log(`UUFOI`, e);
  }
};

exports.updateUserFollow = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    const user = await User.findById({ _id: user_session });
    const suser = await User.findById({ _id: req.body.userFollowId });

    if (suser.userBlock?.includes(`${user._id}`)) {
      res
        .status(200)
        .send({ message: "You're blocked by this Person / user 😒" });
    } else {
      if (user.userFollowing.includes(req.body.userFollowId)) {
        // res.status(200).send({ message: "You Already Following This User" });
      } else {
        const notify = new Notification({});
        suser.userFollowers.push(user_session);
        user.userFollowing.push(req.body.userFollowId);
        user.followingUICount += 1;
        suser.followerCount += 1;
        notify.notifyContent = `${user.userLegalName} started following you`;
        notify.notify_hi_content = `${user.userLegalName} आपको  फॉलो  कर  रहा है |`;
        notify.notify_mr_content = `${user.userLegalName} ने तुम्हाला फॉलो करायला सुरुवात केली`;
        notify.notifySender = user._id;
        notify.notifyReceiever = suser._id;
        notify.notifyCategory = "User Follow";
        suser.uNotify.push(notify);
        notify.user = suser;
        notify.notifyByPhoto = user;
        await Promise.all([user.save(), suser.save(), notify.save()]);
        if (suser?.user_follower_notify === "Enable") {
          await invokeFirebaseNotification(
            "Followers",
            notify,
            suser.userLegalName,
            suser._id,
            suser.deviceToken
          );
        }
        res.status(200).send({ message: " Following This User 👍😀✨🎉" });
        const post = await Post.find({
          $and: [{ author: suser._id, postStatus: "Anyone" }],
        });
        post.forEach(async (ele) => {
          //
          if (user?.userPosts?.includes(ele)) {
          } else {
            ele.post_arr.push(user?._id)
            user.userPosts.push(ele);
            await ele.save()
          }
          //
        });
        await user.save();
        //
        const posts = await Post.find({ author: `${suser._id}` });
        posts.forEach(async (ele) => {
          ele.authorFollowersCount = suser.followerCount;
          await ele.save();
        });
        //
      }
    }
  } catch (e) {
    console.log("UFOU", e);
  }
};

exports.updateUserUnFollow = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    var user = await User.findById({ _id: user_session });
    var suser = await User.findById({ _id: req.body.userFollowId });

    if (user.userFollowing.includes(req.body.userFollowId)) {
      suser.userFollowers.pull(user_session);
      user.userFollowing.pull(req.body.userFollowId);
      if (user.followingUICount > 0) {
        user.followingUICount -= 1;
      }
      if (suser.followerCount > 0) {
        suser.followerCount -= 1;
      }
      await user.save();
      await suser.save();
      res.status(200).send({ message: " UnFollowing This User" });
      const post = await Post.find({
        $and: [{ author: suser._id, postStatus: "Anyone" }],
      });
      post.forEach(async (ele) => {
        user.userPosts.pull(ele);
        ele.post_arr.pull(user?._id)
        await ele.save()
      });
      await user.save();
      //
      const posts = await Post.find({ author: `${suser._id}` });
      posts.forEach(async (ele) => {
        ele.authorFollowersCount = suser.followerCount;
        await ele.save();
      });
      //
    } else {
      res
        .status(200)
        .send({ message: "You Are no Longer Following This User" });
    }
  } catch (e) {
    console.log(`UUFOU`, e);
  }
};

exports.updateUserCircle = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    var user = await User.findById({ _id: user_session });
    var suser = await User.findById({ _id: req.body.followId });

    if (
      user.userCircle.includes(req.body.followId) &&
      suser.userCircle.includes(user_session)
    ) {
      res.status(200).send({ message: "You are Already In a Circle" });
    } else {
      try {
        const notify = new Notification({});
        suser.userFollowing.pull(user_session);
        if (suser.followingUICount > 0) {
          suser.followingUICount -= 1;
        }
        user.userFollowers.pull(req.body.followId);
        if (user.followerCount > 0) {
          user.followerCount -= 1;
        }
        suser.userCircle.push(user_session);
        user.userCircle.push(req.body.followId);
        suser.circleCount += 1;
        user.circleCount += 1;
        notify.notifyContent = `${user.userLegalName} has been added to your circle`;
        notify.notify_hi_content = `${user.userLegalName} आपके सर्कल मे जुड गाय है |`;
        notify.notify_mr_content = `${user.userLegalName} तुमच्या सर्कल मध्ये जोडले गेले आहे`;
        notify.notifySender = user._id;
        notify.notifyReceiever = suser._id;
        notify.notifyCategory = "User Circle";
        suser.uNotify.push(notify);
        notify.user = suser;
        notify.notifyByPhoto = user;
        await Promise.all([user.save(), suser.save(), notify.save()]);
        if (suser?.user_follower_notify === "Enable") {
          await invokeFirebaseNotification(
            "Circle",
            notify,
            "Circled",
            suser._id,
            suser.deviceToken
          );
        }
        res.status(200).send({ message: "😀 Added to circle" });
        const post = await Post.find({
          $and: [{ author: suser._id }],
        });
        post.forEach(async (ele) => {
          if (user && user.userPosts?.includes(`${ele}`)) {
          } else {
            ele.post_arr.push(user?._id)
            user.userPosts.push(ele);
            await ele.save()
          }
        });
        await user.save();
        const posts = await Post.find({
          $and: [{ author: user._id }],
        });
        posts.forEach(async (ele) => {
          if (suser && suser.userPosts?.includes(`${ele}`)) {
          } else {
            suser.userPosts.push(ele);
            ele.post_arr.push(suser?._id)
            await ele.save()
          }
        });
        await suser.save();
        //
        const post_count = await Post.find({ author: `${suser._id}` });
        post_count.forEach(async (ele) => {
          ele.authorFollowersCount = suser.followerCount;
          await ele.save();
        });
        const post_counts = await Post.find({ author: `${user._id}` });
        post_counts.forEach(async (ele) => {
          ele.authorFollowersCount = user.followerCount;
          await ele.save();
        });
        //
      } catch {
        res.status(500).send({ error: "error" });
      }
    }
  } catch (e) {
    console.log("UCU", e);
  }
};

exports.removeUserCircle = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    var user = await User.findById({ _id: user_session });
    var suser = await User.findById({ _id: req.body.followId });

    if (
      user.userCircle.includes(req.body.followId) &&
      suser.userCircle.includes(user_session)
    ) {
      try {
        user.userCircle.pull(req.body.followId);
        suser.userCircle.pull(user_session);
        if (suser.circleCount > 0) {
          suser.circleCount -= 1;
        }
        if (user.circleCount > 0) {
          user.circleCount -= 1;
        }
        user.userFollowers.push(req.body.followId);
        suser.userFollowing.push(user_session);
        user.followerCount += 1;
        suser.followingUICount += 1;
        await Promise.all([user.save(), suser.save()]);
        res.status(200).send({ message: "Uncircled" });
        const post = await Post.find({
          $and: [{ author: `${suser._id}` }],
        });

        post.forEach(async (ele) => {
          if (user && user.userPosts?.includes(`${ele}`)) {
            user.userPosts.pull(ele._id);
          } else {
          }
        });
        await user.save();

        const posts = await Post.find({
          $and: [{ author: `${user._id}` }],
        });

        posts.forEach(async (ele) => {
          if (suser && suser.userPosts?.includes(`${ele}`)) {
            suser.userPosts.pull(ele._id);
          } else {
          }
        });
        await suser.save();
        //
        const post_follow = await Post.find({
          $and: [{ author: user._id, postStatus: "Anyone" }],
        });
        post_follow.forEach(async (ele) => {
          //
          if (suser?.userPosts?.includes(ele)) {
          } else {
            suser.userPosts.push(ele);
          }
          //
        });
        await suser.save();
        //
        //
        const post_count = await Post.find({ author: `${suser._id}` });
        post_count.forEach(async (ele) => {
          ele.authorFollowersCount = suser.followerCount;
          await ele.save();
        });
        const post_counts = await Post.find({ author: `${user._id}` });
        post_counts.forEach(async (ele) => {
          ele.authorFollowersCount = user.followerCount;
          await ele.save();
        });
        //
      } catch {
        res.status(500).send({ error: "error" });
      }
    } else {
      res.status(200).send({ message: "You are Not In a Circle" });
    }
  } catch (e) {
    console.log(`UUCU`, e);
  }
};

exports.updateUserPhone = async (req, res) => {
  try {
    const { id } = req.params;
    const { userPhoneNumber } = req.body;
    const user = await User.findById({ _id: id });
    user.userPhoneNumber = userPhoneNumber;
    await user.save();
    // const uEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "Mobile No Updated", user });
  } catch (e) {
    console.log(`Error`);
  }
};

//
var date = new Date();
var p_date = date.getDate();
var p_month = date.getMonth() + 1;
var p_year = date.getFullYear();
if (p_date < 9) {
  p_date = `0${p_date}`;
}
if (p_month < 10) {
  p_month = `0${p_month}`;
}
//
var month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
//

exports.updateUserPersonal = async (req, res) => {
  try {
    const { id } = req.params;
    var users = await User.findByIdAndUpdate(id, req.body);
    await users.save();
    res.status(200).send({ message: "Personal Info Updated" });
    //
    var user = await User.findById({ _id: id });
    var b_date = user.userDateOfBirth.slice(8, 10);
    var b_month = user.userDateOfBirth.slice(5, 7);
    var b_year = user.userDateOfBirth.slice(0, 4);
    if (b_date > p_date) {
      p_date = p_date + month[b_month - 1];
      p_month = p_month - 1;
    }
    if (b_month > p_month) {
      p_year = p_year - 1;
      p_month = p_month + 12;
    }
    var get_cal_year = p_year - b_year;
    if (get_cal_year > 13) {
      user.ageRestrict = "No";
    } else {
      user.ageRestrict = "Yes";
    }
    user.profile_modification = new Date();
    await user.save();
    //
    const post = await Post.find({ author: `${user._id}` });
    post.forEach(async (ele) => {
      ele.authorOneLine = user.one_line_about;
      ele.authorName = user.userLegalName;
      await ele.save();
    });
    const comment = await Comment.find({ author: `${user._id}` });
    comment.forEach(async (com) => {
      com.authorOneLine = user.one_line_about;
      com.authorName = user.userLegalName;
      await com.save();
    });
    const replyComment = await ReplyComment.find({ author: `${user._id}` });
    replyComment.forEach(async (reply) => {
      reply.authorOneLine = user.one_line_about;
      reply.authorName = user.userLegalName;
      await reply.save();
    });
    const answers = await Answer.find({ author: `${user._id}` });
    answers.forEach(async (ans) => {
      ans.authorOneLine = user.one_line_about;
      ans.authorName = user.userLegalName;
      await ans.save();
    });
    const answerReply = await AnswerReply.find({ author: `${user._id}` });
    answerReply.forEach(async (ansRep) => {
      ansRep.authorOneLine = user.one_line_about;
      ansRep.authorName = user.userLegalName;
      await ansRep.save();
    });
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.addUserAccountInstitute = async (req, res) => {
  try {
    const { id, iid } = req.params;
    const user = await User.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: iid });
    user.addUserInstitute.push(institute);
    institute.addInstituteUser.push(user);
    await Promise.all([user.save(), institute.save()]);
    // Add Another Encryption
    res.status(200).send({ message: "Added Institute A/c", user, institute });
  } catch (e) {
    console.log(e);
  }
};

exports.addUserAccountUser = async (req, res) => {
  try {
    const { id, iid } = req.params;
    const user = await User.findById({ _id: id });
    const userNew = await User.findById({ _id: iid });
    user.addUser.push(userNew);
    userNew.addUser.push(user);
    await Promise.all([user.save(), userNew.save()]);
    // Add Another Encryption
    res.status(200).send({ message: "Added User A/c", user, userNew });
  } catch (e) {
    console.log(e);
  }
};

exports.deactivateUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ddate, password } = req.body;
    const user = await User.findById({ _id: id });
    const comparePassword = bcrypt.compareSync(password, user.userPassword);
    if (comparePassword) {
      user.activeStatus = status;
      user.activeDate = ddate;
      await user.save();
      // const statusEncrypt = await encryptionPayload(user.activeStatus);
      res
        .status(200)
        .send({ message: "Deactivated Account", status: user.activeStatus });
    } else {
      res.status(404).send({ message: "Bad Request" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.feedbackUser = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: "62596c3a47690fe0d371f5b4" });
    const user = await User.findById({ _id: id });
    const feed = new Feedback({});
    feed.rating = req.body.rating;
    feed.bestPart = req.body.bestPart;
    feed.worstPart = req.body.worstPart;
    feed.suggestion = req.body.suggestion;
    feed.user = user._id;
    admin.feedbackList.push(feed._id);
    await Promise.all([feed.save(), admin.save()]);
    res.status(200).send({ message: "Feedback By The User" });
  } catch (e) {
    console.log(e);
  }
};

exports.feedbackRemindLater = async (req, res) => {
  try {
    const { id } = req.params;
    const { remindDate } = req.body;
    const user = await User.findById({ _id: id });
    user.remindLater = remindDate;
    await user.save();
    res.status(200).send({ message: "Remind me Later" });
  } catch (e) {
    console.log(e);
  }
};

exports.getCreditTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { transferCredit, transferIns } = req.body;
    const user = await User.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: `${transferIns}` });
    const notify = new Notification({});
    institute.transferCredit =
      institute.transferCredit + parseInt(transferCredit);
    user.referalPercentage = user.referalPercentage - parseInt(transferCredit);
    institute.userReferral.push(user);
    user.transferInstitute.push(institute);
    notify.notifyContent = `${user.userLegalName} transfer ${transferCredit} points to you`;
    notify.notifySender = id;
    notify.notifyReceiever = institute._id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyByPhoto = user;
    await Promise.all([user.save(), institute.save(), notify.save()]);
    // const cEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "transfer", user });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getReportPostUser = async (req, res) => {
  try {
    const { id, uid } = req.params;
    const { reportStatus } = req.body;
    const user = await User.findById({ _id: id });
    const post = await Post.findById({ _id: uid });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const report = new Report({ reportStatus: reportStatus });
    admin.reportList.push(report._id);
    admin.reportPostQueryCount += 1;
    report.reportInsPost = post._id;
    report.reportBy = user._id;
    user.userPosts?.pull(post?._id);
    await Promise.all([admin.save(), report.save(), user.save()]);
    // const rEncrypt = await encryptionPayload(report.reportStatus);
    res.status(200).send({
      message: "reported with feed Removal",
      report: report.reportStatus,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;

    const user = await User.findById({ _id: id }).populate({ path: "uNotify" });

    const notify = await Notification.find({ _id: { $in: user?.uNotify } })
      .populate({
        path: "notifyByInsPhoto",
        select: "photoId insProfilePhoto name insName",
      })
      .populate({
        path: "notifyByPhoto",
        select: "photoId profilePhoto username userLegalName",
      })
      .populate({
        path: "notifyByStaffPhoto",
        select:
          "photoId staffProfilePhoto staffFirstName staffMiddleName staffLastName",
      })
      .populate({
        path: "notifyByStudentPhoto",
        select:
          "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName",
      })
      .populate({
        path: "notifyByDepartPhoto",
        select: "coverId cover dName",
      })
      .sort("-notifyTime")
      .limit(limit)
      .skip(skip);
    // const nEncrypt = await encryptionPayload(notify);
    res.status(200).send({ message: "Notification send", notify });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllUserActivity = async (req, res) => {
  try {
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var id = req.params.id;
    var skip = (page - 1) * limit;
    var { category } = req?.query;
    var user = await User.findById({ _id: id }).populate({
      path: "activity_tab",
    });

    if (category) {
      var notify = await StudentNotification.find({
        $and: [
          {
            _id: { $in: user?.activity_tab },
          },
          {
            notifyCategory: { $regex: `${category}`, $options: "i" },
          },
        ],
      })
        .populate({
          path: "notifyByInsPhoto",
          select: "photoId insProfilePhoto name insName",
        })
        .populate({
          path: "notifyByStaffPhoto",
          select:
            "photoId staffProfilePhoto staffFirstName staffMiddleName staffLastName",
        })
        .populate({
          path: "notifyByStudentPhoto",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName",
        })
        .populate({
          path: "notifyByDepartPhoto",
          select: "coverId cover dName",
        })
        .populate({
          path: "notifyByClassPhoto",
          select: "coverId cover className",
        })
        .populate({
          path: "notifyByFinancePhoto",
          select: "coverId cover",
        })
        .populate({
          path: "notifyByAdmissionPhoto",
          select: "coverId cover institute",
          populate: {
            path: "institute",
            select: "insName name photoId insProfilePhoto",
          },
        })
        .populate({
          path: "notifyByHostelPhoto",
          select: "coverId cover institute",
          populate: {
            path: "institute",
            select: "insName name photoId insProfilePhoto",
          },
        })
        .populate({
          path: "notifyByEventManagerPhoto",
          select: "event_photo photoId",
        })
        .populate({
          path: "election_winner",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName",
        })
        .populate({
          path: "participate_winner",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName",
        })
        .populate({
          path: "queryId",
        })
        .populate({
          path: "seatingId",
          populate: {
            path: "seat_block_staff",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
          },
        })
        .populate({
          path: "seatingId",
          populate: {
            path: "seat_block_class",
            select: "className classTitle classStatus classTeacher",
            populate: {
              path: "classTeacher",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
            },
          },
        })
        .populate({
          path: "fee_receipt",
        })
        .sort("-notifyTime");
      res.status(200).send({ message: "All Activity", activity: notify });
    } else {
      var notify = await StudentNotification.find({
        $and: [
          {
            _id: { $in: user?.activity_tab },
          },
          {
            notifyCategory: { $ne: "Reminder Alert" },
          },
        ],
      })
        .populate({
          path: "notifyByInsPhoto",
          select: "photoId insProfilePhoto name insName",
        })
        .populate({
          path: "notifyByStaffPhoto",
          select:
            "photoId staffProfilePhoto staffFirstName staffMiddleName staffLastName",
        })
        .populate({
          path: "notifyByStudentPhoto",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName",
        })
        .populate({
          path: "notifyByDepartPhoto",
          select: "coverId cover dName",
        })
        .populate({
          path: "notifyByClassPhoto",
          select: "coverId cover className",
        })
        .populate({
          path: "notifyByFinancePhoto",
          select: "coverId cover",
        })
        .populate({
          path: "notifyByAdmissionPhoto",
          select: "coverId cover institute",
          populate: {
            path: "institute",
            select: "insName name photoId insProfilePhoto",
          },
        })
        .populate({
          path: "notifyByHostelPhoto",
          select: "coverId cover institute",
          populate: {
            path: "institute",
            select: "insName name photoId insProfilePhoto",
          },
        })
        .populate({
          path: "notifyByEventManagerPhoto",
          select: "event_photo photoId",
        })
        .populate({
          path: "election_winner",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName",
        })
        .populate({
          path: "participate_winner",
          select:
            "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName",
        })
        .populate({
          path: "queryId",
        })
        .populate({
          path: "seatingId",
          populate: {
            path: "seat_block_staff",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
          },
        })
        .populate({
          path: "seatingId",
          populate: {
            path: "seat_block_class",
            select: "className classTitle classStatus classTeacher",
            populate: {
              path: "classTeacher",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
            },
          },
        })
        .populate({
          path: "fee_receipt",
        })
        .sort("-notifyTime")
        .limit(limit)
        .skip(skip);
      // const aEncrypt = await encryptionPayload(notify);
      res.status(200).send({ message: "All Activity", activity: notify });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAllUserStudentMessage = async (req, res) => {
  try {
    const { id } = req?.params
    if(!id) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var skip = (page - 1) * limit;
    var user = await User.findById({ _id: id }).select("student_message");
    var all_message = await StudentMessage.find({ _id: { $in: user?.student_message } })
    .sort({ created_at: -1 })
    .limit(limit)
    .skip(skip)
    .populate({
      path: "student from student_list",
        select:
          "studentFirstName studentMiddleName studentLastName studentProfilePhoto photoId valid_full_name staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId studentGRNO",
    });
    if (all_message?.length > 0) {
      res.status(200).send({
        message: "Explore New All Message Query",
        access: true,
        all_message: all_message,
      });
    } else {
      res.status(200).send({
        message: "No New All Message Query",
        access: false,
        all_message: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAllTotalCount = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById({ _id: id })
      .select("_id activity_tab uNotify followInsAnnouncement")
      .populate({
        path: "uNotify",
      });
    var total = 0;
    var counts = 0;
    const notify = await Notification.find({
      $and: [{ _id: { $in: user?.uNotify } }, { notifyViewStatus: "Not View" }],
    });
    const activity = await StudentNotification.find({
      $and: [
        { _id: { $in: user?.activity_tab } },
        { notifyViewStatus: "Not View" },
        {
          notifyCategory: { $ne: "Reminder Alert" },
        },
      ],
    });
    const student_message = await StudentNotification.find({
      $and: [
        { _id: { $in: user?.activity_tab } },
        { notifyViewStatus: "Not View" },
        {
          notifyCategory: "Reminder Alert",
        },
      ],
    });
    const announcements = await InsAnnouncement.find({
      _id: { $in: user?.followInsAnnouncement },
    })
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      })
      .lean()
      .exec();
    for (var num of announcements) {
      if (num.insAnnViewUser?.includes(`${user?._id}`)) {
        // console.log(true);
      } else {
        counts = counts + 1;
        // console.log(false);
      }
    }
    // total = total + notify?.length + activity?.length + counts;
    total = total + notify?.length + activity?.length + student_message?.length;
    // Add Another Encryption
    res.status(200).send({
      message: "Not Viewed Notification & Activity",
      count: total,
      notifyCount: notify?.length,
      activityCount: activity?.length,
      announcementCount: counts ? 0 : 0,
      student_message: student_message?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveMarkAllView = async (req, res) => {
  try {
    const id = req.params.id;
    const { type } = req.query;
    var user = await User.findById({ _id: id })
      .select("_id")
      .populate({ path: "activity_tab uNotify followInsAnnouncement" });
    if (type === "Notification") {
      const notify = await Notification.find({
        $and: [
          { _id: { $in: user?.uNotify } },
          { notifyViewStatus: "Not View" },
        ],
      });
      if (notify?.length >= 1) {
        notify.forEach(async (ele) => {
          ele.notifyViewStatus = "View";
          await ele.save();
        });
      }
    } else if (type === "Activity") {
      const activity = await StudentNotification.find({
        $and: [
          { _id: { $in: user?.activity_tab } },
          { notifyViewStatus: "Not View" },
          {
            notifyCategory: { $ne: "Reminder Alert" },
          },
        ],
      });
      if (activity?.length >= 1) {
        activity.forEach(async (ele) => {
          ele.notifyViewStatus = "View";
          await ele.save();
        });
      }
    } else if (type === "STUDENT_MESSAGE") {
      const student_message = await StudentNotification.find({
        $and: [
          { _id: { $in: user?.activity_tab } },
          { notifyViewStatus: "Not View" },
          {
            notifyCategory: "Reminder Alert",
          },
        ],
      });
      if (student_message?.length >= 1) {
        student_message.forEach(async (ele) => {
          ele.notifyViewStatus = "View";
          await ele.save();
        });
      }
    } else if (type === "Announcement") {
      var announcements = await InsAnnouncement.find({
        $and: [
          { _id: { $in: user?.followInsAnnouncement } },
          // { insAnnViewUser: { $nin: [user._id] } },
        ],
      });
      for (let num of announcements) {
        if (num?.insAnnViewUser?.includes(`${user?._id}`)) {
        } else {
          num.insAnnViewUser.push(user._id);
          await num.save();
        }
      }
    } else {
    }

    res.status(200).send({ message: "Mark All To Be Viewed" });
  } catch (e) {
    console.log(e);
  }
};

exports.updateReadNotifications = async (req, res) => {
  try {
    const { rid } = req.params;
    const read = await Notification.findOne({ _id: rid });
    const activity = await StudentNotification.findOne({ _id: rid });
    if (read) {
      read.notifyReadStatus = "Read";
      await read.save();
    } else if (activity) {
      activity.notifyReadStatus = "Read";
      await activity.save();
    } else {
    }
    res.status(200).send({ message: "Mark As Read" });
  } catch (e) {
    console.log(e);
  }
};

exports.getHideNotifications = async (req, res) => {
  try {
    const { nid } = req.params;
    const notify = await Notification.findOne({ _id: nid });
    const activity = await StudentNotification.findOne({ _id: nid });
    if (notify) {
      notify.notifyVisibility = "hide";
      await notify.save();
    } else if (activity) {
      activity.notifyVisibility = "hide";
      await activity.save();
    } else {
    }
    res.status(200).send({ message: "Hide" });
  } catch (e) {
    console.log(e);
  }
};

exports.getDeleteNotifications = async (req, res) => {
  try {
    const { id, nid } = req.params;
    await User.findByIdAndUpdate(id, { $pull: { uNotify: nid } });
    await Notification.findByIdAndDelete({ _id: nid });
    res.status(200).send({ message: "Deleted" });
  } catch (e) {
    console.log(e);
  }
};

exports.getPersonalSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .select(
        "userLegalName userEmail userDateOfBirth one_line_about userPhoneNumber userStatus userGender userAddress userBio username photoId profilePhoto userHobbies userEducation "
      )
      .populate({
        path: "InstituteReferals",
        select: "insName name photoId insProfilePhoto",
      })
      .lean()
      .exec();
    if (user) {
      // const uEncrypt = await encryptionPayload(user);
      res.status(200).send({ message: "Success", user });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getSwitchAccounts = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .populate({
        path: "addUser",
        select: "userLegalName username photoId profilePhoto",
      })
      .populate({
        path: "addUserInstitute",
        select: "insName name photoId insProfilePhoto",
      })
      .select("-userPassword")
      .lean()
      .exec();
    if (user) {
      // const uEncrypt = await encryptionPayload(user);
      res.status(200).send({ message: "Success", user });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getQCoins = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .select("referalPercentage")
      .populate({
        path: "InstituteReferals",
        select: "insName name photoId insProfilePhoto",
      })
      .lean()
      .exec();
    if (user) {
      // const uEncrypt = await encryptionPayload(user);
      res.status(200).send({ message: "Success", user });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getDashDataQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .select(
        "userLegalName username userBlock followerCount qviple_id followingUICount circleCount user_block_institute last_login profile_modification recoveryMail userPhoneNumber follow_hashtag ageRestrict blockedBy is_mentor show_suggestion photoId blockStatus one_line_about profilePhoto user_birth_privacy user_address_privacy user_circle_privacy tag_privacy user_follower_notify user_comment_notify user_answer_notify user_institute_notify userFollowers userFollowing userCircle"
      )
      .populate({
        path: "daily_quote_query.quote",
      });
    if (user?.userPosts && user?.userPosts.length < 1) {
      var post = [];
    }
    const qvipleId = await QvipleId.findOne({ user: `${user?._id}`})
    user.qviple_id = qvipleId?.qviple_id
    if (user) {
      // Add Another Encryption
      res.status(200).send({
        message: "Success",
        user,
        post,
        profile_modification: user?.profile_modification,
      });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.followersArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.params;
    const skip = (page - 1) * limit;
    const user = await User.findById({ _id: uid }).populate({
      path: "userFollowers",
    });

    const followers = await User.find({
      $and: [
        { _id: { $in: user?.userFollowers } },
        { activeStatus: "Activated" },
      ],
    })
      .select(
        "userLegalName username photoId profilePhoto blockStatus user_birth_privacy user_address_privacy user_circle_privacy"
      )
      .limit(limit)
      .skip(skip);
    if (user) {
      // const fEncrypt = await encryptionPayload(followers);
      res.status(200).send({ message: "Success", followers: followers });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.followingArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.params;
    const skip = (page - 1) * limit;
    const user = await User.findById({ _id: uid }).select(
      "id userFollowing userInstituteFollowing"
    );

    const uFollowing = await User.find({
      $and: [
        { _id: { $in: user?.userFollowing } },
        { activeStatus: "Activated" },
      ],
    })
      .select(
        "userLegalName username photoId profilePhoto blockStatus user_birth_privacy user_address_privacy user_circle_privacy"
      )
      .limit(limit)
      .skip(skip);

    const uInsFollowing = await InstituteAdmin.find({
      _id: { $in: user?.userInstituteFollowing },
    })
      .select("insName name photoId insProfilePhoto blockStatus")
      .limit(limit)
      .skip(skip);
    var mergeArray = [...uFollowing, ...uInsFollowing];
    // Add Another Encryption
    res.status(200).send({
      message: "Success",
      uFollowing: uFollowing,
      uInsFollowing: uInsFollowing,
      mergeArray: mergeArray,
    });
  } catch {}
};

exports.circleArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.params;
    const { search } = req.query;
    const skip = (page - 1) * limit;
    var user = await User.findById({ _id: uid }).select("userCircle");

    if (search) {
      var circle = await User.find({
        $and: [
          { _id: { $in: user?.userCircle } },
          { activeStatus: "Activated" },
        ],
        $or: [
          { userLegalName: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ],
      })
        .select(
          "userLegalName username photoId one_line_about profilePhoto blockStatus user_birth_privacy user_address_privacy user_circle_privacy"
        )
        .limit(limit)
        .skip(skip);
    } else {
      var circle = await User.find({
        $and: [
          { _id: { $in: user?.userCircle } },
          { activeStatus: "Activated" },
        ],
      })
        .select(
          "userLegalName username photoId one_line_about profilePhoto blockStatus user_birth_privacy user_address_privacy user_circle_privacy"
        )
        .limit(limit)
        .skip(skip);
    }
    if (circle?.length > 0) {
      // const cEncrypt = await encryptionPayload(circle);
      res.status(200).send({ message: "Success", circle: circle });
    } else {
      res.status(200).send({ message: "Failure", circle: [] });
    }
  } catch (e) {
    console.log();
  }
};

exports.followingInsArray = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("id")
      .populate({
        path: "userInstituteFollowing",
        select: "insName name photoId insProfilePhoto blockStatus",
      })
      .lean()
      .exec();
    if (user) {
      // const fEncrypt = await encryptionPayload(user);
      res.status(200).send({ message: "Success", user });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveAllStarAnnouncementUser = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params;
    const skip = (page - 1) * limit;
    const user = await User.findById({ _id: id }).populate({
      path: "starAnnouncement",
    });
    const announcement = await InsAnnouncement.find({
      _id: { $in: user.starAnnouncement },
    })
      .select(
        "insAnnTitle insAnnPhoto insAnnDescription insAnnVisibility createdAt"
      )
      .populate({
        path: "reply",
        select: "replyText replyAuthorByIns replyAuthorByUser createdAt",
      })
      .populate({
        path: "institute",
        select: "insName photoId insProfilePhoto",
      })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip);
    // const aEncrypt = await encryptionPayload(announcement);
    res.status(200).send({ message: "Success", announcement });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveRecoveryMailUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { recoveryMail } = req.body;
    const user = await User.findById({ _id: id });
    user.recoveryMail = recoveryMail;
    await Promise.all([user.save()]);
    // const mEncrypt = await encryptionPayload(user.recoveryMail);
    res.status(200).send({ message: "Success", mail: user.recoveryMail });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserStaffArray = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("userLegalName username photoId profilePhoto")
      .populate({
        path: "staff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffStatus",
        populate: {
          path: "institute",
          select: "insName name photoId insProfilePhoto",
        },
      });
    // const sEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "Success", user });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserStudentArray = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("userLegalName username photoId profilePhoto")
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentStatus",
        populate: {
          path: "institute",
          select: "insName name photoId insProfilePhoto",
        },
      });
    // const sEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "Success", user });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStaffDesignationArray = async (req, res) => {
  try {
    const { sid } = req.params;
    const { isApk } = req.query;
    // const is_cache = await connect_redis_hit(`Staff-Designation-Member-${sid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Designation Feed from Cache 🙌",
    //     staff: is_cache.staff,
    //   });
    if (isApk) {
      var staff = await Staff.findById({ _id: sid })
        .select(
          "staffFirstName staffDesignationCount vehicle_category active_designation staffMiddleName mentorDepartment hostelDepartment hostelUnitDepartment staffDepartment staffClass staffSubject staffLastName photoId staffProfilePhoto staffDOB staffGender staffNationality staffMotherName staffMTongue staffCast staffCastCategory staffReligion staffBirthPlace staffBirthPlacePincode staffBirthPlaceState staffBirthPlaceDistrict staffDistrict staffPincode staffState staffAddress staffCurrentPincode staffCurrentDistrict staffCurrentState staffCurrentAddress staffPhoneNumber staffAadharNumber staffQualification staffDocuments staffAadharFrontCard staffAadharBackCard staffPreviousSchool staffBankName staffBankAccount staffBankAccountHolderName staffBankIfsc staffBankPassbook staffCasteCertificatePhoto staffStatus staffROLLNO staffPhoneNumber eventManagerDepartment casual_leave medical_leave sick_leave off_duty_leave c_off_leave lwp_leave current_designation staff_pf_number"
        )
        .populate({
          path: "staffDepartment",
          select: "dName dTitle",
          populate: {
            path: "departmentSelectBatch",
            select: "batchName batchStatus",
          },
        })
        .populate({
          path: "staffClass",
          select: "className classTitle classStatus classHeadTitle",
          populate: {
            path: "batch",
            select: "batchName batchStatus",
          },
        })
        .populate({
          path: "staffSubject",
          select:
            "subjectName subjectTitle subjectStatus selected_batch_query subject_category subjectOptional",
          populate: {
            path: "class",
            select: "className classTitle classStatus classHeadTitle",
            populate: {
              path: "batch",
              select: "batchName batchStatus",
            },
          },
        })
        .populate({
          path: "staffSubject",
          select:
            "subjectName subjectTitle subjectStatus selected_batch_query subject_category subjectOptional",
          populate: {
            path: "selected_batch_query",
            select: "batchName batchStatus",
          },
        })
        .populate({
          path: "institute",
          select:
            "insName photoId insProfilePhoto student_section_form_show_query",
        })
        .populate({
          path: "user",
          select:
            "userLegalName userPhoneNumber userEmail photoId profilePhoto",
        })
        .populate({
          path: "financeDepartment",
          select:
            "financeName financeEmail financePhoneNumber designation_status designation_password",
          populate: {
            path: "financeHead",
            select: "staffFirstName staffMiddleName staffLastName",
          },
        })
        .populate({
          path: "financeDepartment",
          select:
            "financeName financeEmail financePhoneNumber designation_status designation_password",
          populate: {
            path: "institute",
            select: "financeStatus",
          },
        })
        .populate({
          path: "admissionDepartment",
          select:
            "admissionAdminEmail admissionAdminPhoneNumber admissionAdminAbout designation_status designation_password",
          populate: {
            path: "admissionAdminHead",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "sportDepartment",
          select: "sportEmail sportPhoneNumber sportAbout sportName",
          populate: {
            path: "sportHead",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "staffSportClass",
          select:
            "sportClassEmail sportClassPhoneNumber sportClassAbout sportClassName",
          populate: {
            path: "sportClassHead",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "transportDepartment",
          select: "vehicle_count",
          populate: {
            path: "transport_manager",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "vehicle",
          select: "_id vehicle_number",
        })
        .populate({
          path: "library",
          select: "coverId cover institute",
          populate: {
            path: "libraryHead",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "aluminiDepartment",
          select: "_id",
        })
        .populate({
          path: "admissionModeratorDepartment",
          select: "admission access_role active_tab",
        })
        .populate({
          path: "financeModeratorDepartment",
          select: "finance access_role",
        })
        .populate({
          path: "instituteModeratorDepartment",
          select: "institute access_role academic_department staff_institute_admin",
          populate: {
            path: "academic_department institute",
            select: "departmentSelectBatch dName dTitle insName name insPassword financeDepart admissionDepart",
          },
        })
        .populate({
          path: "hostelModeratorDepartment",
          select: "hostel access_role active_tab",
        })
        .populate({
          path: "staffBatch",
          select: "batchName batchStatus",
        })
        .lean()
        .exec();
      if (staff?.staffDocuments?.length > 0) {
        for (var docs of staff?.staffDocuments) {
          staff.incomeCertificate =
            docs.documentName === "incomeCertificate"
              ? docs.documentKey
              : staff.incomeCertificate;
          staff.leavingTransferCertificate =
            docs.documentName === "leavingTransferCertificate"
              ? docs.documentKey
              : staff.leavingTransferCertificate;
          staff.nonCreamyLayerCertificate =
            docs.documentName === "nonCreamyLayerCertificate"
              ? docs.documentKey
              : staff.nonCreamyLayerCertificate;
          staff.domicileCertificate =
            docs.documentName === "domicileCertificate"
              ? docs.documentKey
              : staff.domicileCertificate;
          staff.nationalityCertificate =
            docs.documentName === "nationalityCertificate"
              ? docs.documentKey
              : staff.nationalityCertificate;
          staff.lastYearMarksheet =
            docs.documentName === "lastYearMarksheet"
              ? docs.documentKey
              : staff.lastYearMarksheet;
          staff.joiningTransferLetter =
            docs.documentName === "joiningTransferLetter"
              ? docs.documentKey
              : staff.joiningTransferLetter;
          staff.identityDocument =
            docs.documentName === "identityDocument"
              ? docs.documentKey
              : staff.identityDocument;
        }
      }
    } else {
      var staff = await Staff.findById({ _id: sid })
        .select(
          "staffFirstName staffDesignationCount vehicle_category active_designation staffMiddleName mentorDepartment hostelDepartment hostelUnitDepartment staffDepartment staffClass staffSubject staffLastName photoId staffProfilePhoto staffDOB staffGender staffNationality staffMotherName staffMTongue staffCast staffCastCategory staffReligion staffBirthPlace staffBirthPlacePincode staffBirthPlaceState staffBirthPlaceDistrict staffDistrict staffPincode staffState staffAddress staffCurrentPincode staffCurrentDistrict staffCurrentState staffCurrentAddress staffPhoneNumber staffAadharNumber staffQualification staffDocuments staffAadharFrontCard staffAadharBackCard staffPreviousSchool staffBankName staffBankAccount staffBankAccountHolderName staffBankIfsc staffBankPassbook staffCasteCertificatePhoto staffStatus staffROLLNO staffPhoneNumber eventManagerDepartment casual_leave medical_leave sick_leave off_duty_leave c_off_leave lwp_leave current_designation staff_pf_number"
        )
        .populate({
          path: "staffDepartment",
          select: "dName dTitle",
          populate: {
            path: "departmentSelectBatch",
            select: "batchName batchStatus",
          },
        })
        .populate({
          path: "staffClass",
          select: "className classTitle classStatus classHeadTitle",
          populate: {
            path: "batch",
            select: "batchName batchStatus",
          },
        })
        .populate({
          path: "staffSubject",
          select:
            "subjectName subjectTitle subjectStatus selected_batch_query subject_category subjectOptional",
          populate: {
            path: "class",
            select: "className classTitle classStatus classHeadTitle",
            populate: {
              path: "batch",
              select: "batchName batchStatus",
            },
          },
        })
        .populate({
          path: "staffSubject",
          select:
            "subjectName subjectTitle subjectStatus selected_batch_query subject_category subjectOptional",
          populate: {
            path: "selected_batch_query",
            select: "batchName batchStatus",
          },
        })
        .populate({
          path: "institute",
          select:
            "insName photoId insProfilePhoto student_section_form_show_query",
        })
        .populate({
          path: "user",
          select:
            "userLegalName userPhoneNumber userEmail photoId profilePhoto",
        })
        .populate({
          path: "financeDepartment",
          select:
            "financeName financeEmail financePhoneNumber designation_status designation_password",
          populate: {
            path: "financeHead",
            select: "staffFirstName staffMiddleName staffLastName",
          },
        })
        .populate({
          path: "financeDepartment",
          select:
            "financeName financeEmail financePhoneNumber designation_status designation_password",
          populate: {
            path: "institute",
            select: "financeStatus",
          },
        })
        .populate({
          path: "admissionDepartment",
          select:
            "admissionAdminEmail admissionAdminPhoneNumber admissionAdminAbout designation_status designation_password",
          populate: {
            path: "admissionAdminHead",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "sportDepartment",
          select: "sportEmail sportPhoneNumber sportAbout sportName",
          populate: {
            path: "sportHead",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "staffSportClass",
          select:
            "sportClassEmail sportClassPhoneNumber sportClassAbout sportClassName",
          populate: {
            path: "sportClassHead",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "transportDepartment",
          select: "vehicle_count",
          populate: {
            path: "transport_manager",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "vehicle",
          select: "_id vehicle_number",
        })
        .populate({
          path: "library",
          select: "coverId cover institute",
          populate: {
            path: "libraryHead",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        })
        .populate({
          path: "aluminiDepartment",
          select: "_id",
        })
        .populate({
          path: "admissionModeratorDepartment",
          select: "admission access_role active_tab",
        })
        .populate({
          path: "financeModeratorDepartment",
          select: "finance access_role",
        })
        .populate({
          path: "instituteModeratorDepartment",
          select: "institute access_role academic_department staff_institute_admin",
          populate: {
            path: "academic_department institute",
            select: "departmentSelectBatch dName dTitle insName name insPassword financeDepart admissionDepart",
          },
        })
        .populate({
          path: "hostelModeratorDepartment",
          select: "hostel access_role active_tab",
        })
        .populate({
          path: "staffBatch",
          select: "batchName batchStatus",
        })
        .lean()
        .exec();
    }
    // const staffEncrypt = await encryptionPayload(staff);
    // const cached = await connect_redis_miss(
    //   `Staff-Designation-Member-${sid}`,
    //   staff
    // );
    var token_list = []
    staff?.instituteModeratorDepartment?.filter((val) => {
      if(`${val?.access_role}` === "INSTITUTE_ADMIN" || `${val?.access_role}` === "SOCIAL_MEDIA_ACCESS") {
        const token = generateAccessInsToken(
          val?.institute?.name,
          val?.institute?._id,
          val?.institute?.insPassword
        );
        token_list.push({
          token: `Bearer ${token}`,
          _id: val?.institute?._id,
          name: val?.institute?.name,
          mods_id: val?._id,
          access_by: val?.access_role,
          financeDepart: val?.institute?.financeDepart?.[0],
          admissionDepart: val?.institute?.admissionDepart?.[0],
        })
      }
    })
    res.status(200).send({
      message: "All Staff Designation Feed from DB 🙌",
      // staff: cached.staff,
      staff: staff,
      token_list: token_list,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStudentDesignationArray = async (req, res) => {
  try {
    const { sid } = req.params;
    const { isApk } = req.query;
    // const is_cache = await connect_redis_hit(
    //   `Student-Designation-Member-${sid}`
    // );
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Student Designation Feed from Cache 🙌",
    //     student: is_cache.student,
    //     average_points: is_cache.average_points,
    //   });
    if (sid) {
      var re_admission_tab;
      var average_points = 0;
      if (isApk) {
        var student = await Student.findById({ _id: sid })
          .select(
            "batchCount extraPoints studentFirstName fee_structure exist_linked_hostel student_hostel_cpi profile_percentage student_anti_ragging student_id_card_front student_id_card_back student_blood_group query_lock_status student_programme student_branch student_year student_single_seater_room student_ph student_gate_score student_gate_year student_degree_institute student_degree_year student_pre_sem_obtained_points student_percentage_cpi student_pre_sem_total_points student_final_sem_total_points student_final_sem_obtained_points studentEmail form_status online_amount_edit_access library studentBirthPlace studentBankAccountHolderName studentMiddleName studentLastName photoId studentProfilePhoto studentDOB studentGender studentNationality studentMotherName department studentMTongue studentCast studentCastCategory studentReligion studentBirthPlace studentBirthPlacePincode studentBirthPlaceState studentBirthPlaceDistrict studentDistrict studentState studentPincode studentAddress studentCurrentPincode student_prn_enroll_number studentCurrentDistrict studentCurrentState studentCurrentAddress studentPhoneNumber studentAadharNumber studentParentsName studentParentsPhoneNumber studentFatherRationCardColor studentParentsOccupation studentParentsAnnualIncom studentDocuments studentAadharFrontCard studentAadharBackCard studentPreviousSchool studentBankName studentBankAccount studentBankIfsc studentBankPassbook studentCasteCertificatePhoto studentStatus studentGRNO studentROLLNO"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle classStatus classHeadTitle",
            populate: {
              path: "batch",
              select: "batchName batchStatus",
            },
          })
          .populate({
            path: "institute",
            select:
              "insName name photoId insProfilePhoto financeDepart library studentFormSetting student_section_form_show_query transportDepart",
          })
          .populate({
            path: "user",
            select:
              "userLegalName username photoId profilePhoto userPhoneNumber userEmail",
          })
          .populate({
            path: "vehicle",
            select: "_id vehicle_number",
          })
          .populate({
            path: "mentor",
            select: "mentor_head",
            populate: {
              path: "mentor_head",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
            },
          })
          .populate({
            path: "student_unit",
            select: "hostel_unit_name hostel",
            populate: {
              path: "hostel",
              select: "_id",
            },
          })
          .populate({
            path: "student_bed_number",
            select: "bed_number bed_status hostelRoom",
            populate: {
              path: "hostelRoom",
              select: "room_name room_strength",
            },
          })
          .populate({
            path: "department",
            select: "dName dTitle",
          })
          .populate({
            path: "exist_linked_hostel.exist_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto student_bed_number hostelRemainFeeCount",
            populate: {
              path: "student_bed_number",
              select: "bed_number bed_status hostelRoom",
              populate: {
                path: "hostelRoom",
                select: "room_name hostelUnit",
                populate: {
                  path: "hostelUnit",
                  select: "hostel_unit_name",
                },
              },
            },
          });
        if (student?.studentClass) {
          var classes = await Class.findById({
            _id: `${student?.studentClass?._id}`,
          });
          if (classes?.UnApproveStudent?.includes(`${student?._id}`)) {
            re_admission_tab = "Visible";
          }
        }
        if (student?.studentDocuments?.length > 0) {
          for (var docs of student.studentDocuments) {
            student.incomeCertificate =
              docs.documentName === "incomeCertificate"
                ? docs.documentKey
                : student.incomeCertificate;
            student.leavingTransferCertificate =
              docs.documentName === "leavingTransferCertificate"
                ? docs.documentKey
                : student.leavingTransferCertificate;
            student.nonCreamyLayerCertificate =
              docs.documentName === "nonCreamyLayerCertificate"
                ? docs.documentKey
                : student.nonCreamyLayerCertificate;
            student.domicileCertificate =
              docs.documentName === "domicileCertificate"
                ? docs.documentKey
                : student.domicileCertificate;
            student.nationalityCertificate =
              docs.documentName === "nationalityCertificate"
                ? docs.documentKey
                : student.nationalityCertificate;
            student.lastYearMarksheet =
              docs.documentName === "lastYearMarksheet"
                ? docs.documentKey
                : student.lastYearMarksheet;
            student.joiningTransferLetter =
              docs.documentName === "joiningTransferLetter"
                ? docs.documentKey
                : student.joiningTransferLetter;
            student.identityDocument =
              docs.documentName === "identityDocument"
                ? docs.documentKey
                : student.identityDocument;
            student.casteCertificate =
              docs.documentName === "casteCertificate"
                ? docs.documentKey
                : student.casteCertificate;
            student.student_anti_ragging =
              docs.documentName === "student_anti_ragging"
                ? docs.documentKey
                : student.student_anti_ragging;
            student.student_id_card_front =
              docs.documentName === "student_id_card_front"
                ? docs.documentKey
                : student.student_id_card_front;
            student.student_id_card_back =
              docs.documentName === "student_id_card_back"
                ? docs.documentKey
                : student.student_id_card_back;
          }
        }
        const status = await valid_student_form_query(
          student?.institute,
          student,
          "APK"
        );
      } else {
        var student = await Student.findById({ _id: sid })
          .select(
            "batchCount extraPoints studentFirstName exist_linked_hostel fee_structure student_hostel_cpi profile_percentage student_anti_ragging student_id_card_front student_id_card_back student_blood_group query_lock_status student_programme student_branch student_year student_single_seater_room student_ph student_gate_score student_gate_year student_degree_institute student_degree_year student_pre_sem_obtained_points student_percentage_cpi student_pre_sem_total_points student_final_sem_total_points student_final_sem_obtained_points studentEmail form_status online_amount_edit_access student_prn_enroll_number studentBirthPlace studentBankAccountHolderName department studentMiddleName studentLastName photoId studentProfilePhoto studentDOB studentGender studentNationality studentMotherName studentMTongue studentCast studentCastCategory studentReligion studentBirthPlace studentBirthPlacePincode studentBirthPlaceState studentBirthPlaceDistrict studentDistrict studentState studentPincode studentAddress studentCurrentPincode studentCurrentDistrict studentCurrentState studentCurrentAddress studentPhoneNumber studentAadharNumber studentParentsName studentParentsPhoneNumber studentFatherRationCardColor studentParentsOccupation studentParentsAnnualIncom studentDocuments studentAadharFrontCard studentAadharBackCard studentPreviousSchool studentBankName studentBankAccount studentBankIfsc studentBankPassbook studentCasteCertificatePhoto studentStatus studentGRNO studentROLLNO"
          )
          .populate({
            path: "studentClass",
            select: "className classTitle classStatus classHeadTitle",
            populate: {
              path: "batch",
              select: "batchName batchStatus",
            },
          })
          .populate({
            path: "institute",
            select:
              "insName name photoId insProfilePhoto financeDepart library studentFormSetting student_section_form_show_query transportDepart",
          })
          .populate({
            path: "user",
            select:
              "userLegalName username photoId profilePhoto userPhoneNumber userEmail",
          })
          .populate({
            path: "vehicle",
            select: "_id vehicle_number",
          })
          .populate({
            path: "student_unit",
            select: "hostel_unit_name hostel",
            populate: {
              path: "hostel",
              select: "_id",
            },
          })
          .populate({
            path: "mentor",
            select: "mentor_head",
            populate: {
              path: "mentor_head",
              select:
                "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
            },
          })
          .populate({
            path: "student_bed_number",
            select: "bed_number bed_status hostelRoom",
            populate: {
              path: "hostelRoom",
              select: "room_name room_strength",
            },
          })
          .populate({
            path: "department",
            select: "dName dTitle",
          })
          .populate({
            path: "exist_linked_hostel.exist_student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto student_bed_number hostelRemainFeeCount",
            populate: {
              path: "student_bed_number",
              select: "bed_number bed_status hostelRoom",
              populate: {
                path: "hostelRoom",
                select: "room_name hostelUnit",
                populate: {
                  path: "hostelUnit",
                  select: "hostel_unit_name",
                },
              },
            },
          });
        if (student?.studentClass) {
          var classes = await Class.findById({
            _id: `${student?.studentClass?._id}`,
          });
          if (classes?.UnApproveStudent?.includes(`${student?._id}`)) {
            re_admission_tab = "Visible";
          }
        }
      }
      average_points += student?.extraPoints / student?.batchCount;
      var point = await handle_undefined(average_points);
      const status = await valid_student_form_query(
        student?.institute,
        student,
        "WEB"
      );
      // Add Another Encryption
      // const bind_student = {
      //   student: student,
      //   average_points: average_points,
      // };
      // const cached = await connect_redis_miss(
      //   `Student-Designation-Member-${sid}`,
      //   bind_student
      // );
      await calc_profile_percentage(student)
      res.status(200).send({
        message: "All Student Designation Feed from DB 🙌",
        // student: cached.student,
        // average_points: cached.average_points,
        student: student,
        status: status,
        average_points: (point == "0" || 0) ? 0 : parseInt(point),
        re_admission_tab: re_admission_tab ? re_admission_tab : "" || null,
      });
    } else {
      res.status(200).send({ message: "Need a valid Key Id" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserThreeArray = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id }).select(
      "id userFollowers userFollowing userInstituteFollowing userCircle"
    );
    // const userEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "3-Array", user });
  } catch {}
};

exports.retrieveUserKnowQuery = async (req, res) => {
  try {
    const { uid } = req.params;
    var totalUpVote = 0;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const user = await User.findById({ _id: uid }).select(
      "questionCount answerQuestionCount answered_query"
    );
    const answer = await Answer.find({ _id: { $in: user.answered_query } })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "post",
        select: "postQuestion postImage imageId isUser postType trend_category",
      });
    // Add Another Encryption
    res
      .status(200)
      .send({ message: "Know's ", user, upVote: totalUpVote, answer: answer });
  } catch {}
};

exports.circleArrayQuery = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("userLegalName username photoId profilePhoto")
      .populate({
        path: "userCircle",
        select: "userLegalName username photoId profilePhoto",
      });
    // const uEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "Success", user });
  } catch {}
};

exports.allCircleUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { username: { $regex: req.query.search, $options: "i" } },
          { userLegalName: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find({
    _id: { $ne: req.tokenData && req.tokenData.userId },
  }).populate({ path: "userCircle" });
  const user = users.userCircle.find(keyword);
  // const uEncrypt = await encryptionPayload(user);
  res.send(user);
};

exports.retrieveUserSubjectChat = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("id")
      .populate({
        path: "subjectChat",
        populate: {
          path: "subjects",
          match: { subjectStatus: { $eq: "UnCompleted" } },
          select: "subjectName subjectStatus",
          populate: {
            path: "class",
            select: "className classTitle",
          },
        },
      });
    // const cEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "As a Subject Teacher", chat: user });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserClassChat = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("id")
      .populate({
        path: "classChat",
        populate: {
          path: "classes",
          match: { classStatus: { $eq: "UnCompleted" } },
          select: "className classStatus classTitle",
          populate: {
            path: "batch",
            select: "batchName",
          },
        },
      })
      .lean()
      .exec();
    // const classEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "As a Class Teacher", class_chat: user });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserDepartmentChat = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("id")
      .populate({
        path: "departmentChat",
        populate: {
          path: "department",
          select: "dName dTitle",
          populate: {
            path: "departmentSelectBatch",
            select: "batchName",
          },
        },
      })
      .lean()
      .exec();
    // const dEncrypt = await encryptionPayload(user);
    res
      .status(200)
      .send({ message: "As a Department Head", depart_chat: user });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserApplicationStatus = async (req, res) => {
  try {
    var options = { sort: { createdAt: "-1" } };
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("id")
      .populate({
        path: "applicationStatus",
        populate: {
          path: "applicationId",
          select:
            "one_installments admissionAdmin applicationName applicationDepartment applicationUnit applicationBatch applicationMaster",
          populate: {
            path: "applicationUnit",
            select: "hostel hostel_unit_name",
            populate: {
              path: "hostel",
              select: "bank_account",
              populate: {
                path: "bank_account",
              },
            },
          },
        },
        options,
      })
      .populate({
        path: "applicationStatus",
        populate: {
          path: "instituteId",
          select: "insName name photoId insProfilePhoto",
        },
        options,
      })
      .populate({
        path: "applicationStatus",
        populate: {
          path: "feeStructure hostel_fee_structure",
          select:
            "one_installments total_admission_fees applicable_fees structure_name structure_month two_installments three_installments four_installments five_installments six_installments seven_installments eight_installments nine_installments ten_installments eleven_installments tweleve_installments",
          populate: {
            path: "category_master",
            select: "category_name",
          },
        },
        options,
      })
      .populate({
        path: "applicationStatus",
        populate: {
          path: "bank_account",
        },
        options,
      })
      .populate({
        path: "applicationStatus",
        populate: {
          path: "fee_receipt",
        },
        options,
      })
      .populate({
        path: "applicationStatus",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName valid_full_name studentStatus application_print",
        },
        options,
      });
    // const appEncrypt = await encryptionPayload(user.applicationStatus);
    res.status(200).send({
      message: "user Application Status",
      status: user.applicationStatus,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveProfileDataUsername = async (req, res) => {
  try {
    var totalUpVote = 0;
    const user = await User.findOne({
      username: req.params.username,
    }).select(
      "userLegalName photoId questionCount answerQuestionCount profilePhoto user_birth_privacy user_address_privacy user_circle_privacy userBio userAddress userEducation userHobbies userGender coverId profileCoverPhoto username followerCount followingUICount circleCount postCount userAbout userEmail userAddress userDateOfBirth userPhoneNumber userHobbies userEducation "
    );
    const questionUpVote = await Post.find({ author: user._id });
    for (let up of questionUpVote) {
      totalUpVote += up.answerUpVoteCount;
    }
    // Add Another Encryption
    res
      .status(200)
      .send({ message: "Limit User Profile Data ", user, upVote: totalUpVote });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStaffSalaryHistory = async (req, res) => {
  try {
    const { sid } = req.params;
    const staff = await Staff.findById({ _id: sid })
      .select("_id institute")
      .populate({
        path: "salary_history",
        populate: {
          path: "emp_pay",
          select: "salary pay_mode month",
          populate: {
            path: "staff",
            select:
              "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
          },
        },
      });
    const institute = await InstituteAdmin.findById({
      _id: `${staff.institute}`,
    })
      .select(
        "insName insAddress insPhoneNumber insEmail insDistrict insState insProfilePhoto photoId"
      )
      .populate({
        path: "financeDepart",
        select: "financeHead",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      });
    // Add Another Encryption
    res.status(200).send({
      message: "All Salary History ",
      salary: staff?.salary_history,
      institute: institute,
    });
  } catch (e) {
    console.log(e);
  }
};

//
// exports.updateUserBlock = async (req, res) => {
//   try {
//     var user_session = req.tokenData && req.tokenData.userId;
//     var { blockId } = req.query
//     var user = await User.findById({ _id: user_session });
//     var suser = await User.findById({ _id: blockId });
//     if (
//       user.userCircle.includes(blockId) &&
//       suser.userCircle.includes(user_session)
//     ) {
//         user.userBlock.push(suser._id)
//         suser.blockedBy.push(user._id)
//         user.blockCount += 1
//         await Promise.all([ user.save(), suser.save() ])
//         res.status(200).send({ message: "You are Blocked not able to follow / show feed" });
//         try {
//           user.userCircle.pull(blockId);
//           suser.userCircle.pull(user_session);
//           if(suser.circleCount > 0){
//             suser.circleCount -= 1;
//           }
//           if(user.circleCount > 0){
//             user.circleCount -= 1;
//           }

//           const post = await Post.find({ author: `${suser._id}` });
//           post.forEach(async (ele) => {
//             if(user?.userPosts?.includes(`${ele._id}`)){
//               user.userPosts.pull(ele._id);
//             }
//           });
//           await user.save();

//           const posts = await Post.find({ author: `${user._id}` });
//           posts.forEach(async (ele) => {
//             if(suser?.userPosts?.includes(`${ele._id}`)){
//               suser.userPosts.pull(ele._id);
//             }
//           });
//           await suser.save();

//           const post_count = await Post.find({ author: `${suser._id}` });
//           post_count.forEach(async (ele) => {
//             ele.authorFollowersCount = suser.followerCount;
//             await ele.save();
//           });
//           const post_counts = await Post.find({ author: `${user._id}` });
//           post_counts.forEach(async (ele) => {
//             ele.authorFollowersCount = user.followerCount;
//             await ele.save();
//           });
//           //
//         } catch {
//           res.status(500).send({ error: "error" });
//         }
//     } else {
//       res.status(200).send({ message: "Engage Network" });
//     }
//   } catch (e) {
//     console.log('UBU', e)
//   }
// };
//

exports.updateUserUnBlock = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    const { blockId } = req.query;
    var user = await User.findById({ _id: user_session });
    var suser = await User.findById({ _id: blockId });

    if (user?.userBlock?.includes(`${suser._id}`)) {
      user.userBlock.pull(suser._id);
      suser.blockedBy.pull(user._id);
      if (user.blockCount >= 1) {
        user.blockCount -= 1;
      }
      await Promise.all([user.save(), suser.save()]);
      res.status(200).send({
        message: "You are UnBlocked able to follow / circle ",
        unblock: true,
      });
    } else {
      res.status(200).send({
        message: "You are Already UnBlocked able to follow / circle ",
      });
    }
  } catch (e) {
    console.log("UUBU", e);
  }
};

exports.retrieveUserReportBlock = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    const { blockId } = req.query;
    var user = await User.findById({ _id: user_session });
    var suser = await User.findById({ _id: blockId });

    if (user?.userBlock?.includes(`${suser._id}`)) {
      res
        .status(200)
        .send({ message: "You are Already Blocked able to follow / circle " });
    } else {
      user.userBlock.push(suser._id);
      suser.blockedBy.push(user._id);
      if (user.blockCount >= 1) {
        user.blockCount += 1;
      }
      await Promise.all([user.save(), suser.save()]);
      res.status(200).send({
        message: "You are Blocked not able to follow / circle ",
        block: true,
      });
      try {
        user.userCircle?.pull(blockId);
        suser.userCircle?.pull(user_session);
        if (suser.circleCount > 0) {
          suser.circleCount -= 1;
        }
        if (user.circleCount > 0) {
          user.circleCount -= 1;
        }
        suser.userFollowers?.pull(user_session);
        user.userFollowing?.pull(blockId);
        if (user.followingUICount > 0) {
          user.followingUICount -= 1;
        }
        if (suser.followerCount > 0) {
          suser.followerCount -= 1;
        }

        const post = await Post.find({ author: `${suser._id}` });
        post.forEach(async (ele) => {
          if (user?.userPosts?.includes(`${ele._id}`)) {
            user.userPosts.pull(ele._id);
          }
        });
        await user.save();

        const posts = await Post.find({ author: `${user._id}` });
        posts.forEach(async (ele) => {
          if (suser?.userPosts?.includes(`${ele._id}`)) {
            suser.userPosts.pull(ele._id);
          }
        });
        await suser.save();

        const post_count = await Post.find({ author: `${suser._id}` });
        post_count.forEach(async (ele) => {
          ele.authorFollowersCount = suser.followerCount;
          await ele.save();
        });
        const post_counts = await Post.find({ author: `${user._id}` });
        post_counts.forEach(async (ele) => {
          ele.authorFollowersCount = user.followerCount;
          await ele.save();
        });
        //
      } catch {
        res.status(500).send({ error: "error" });
      }
    }
  } catch (e) {
    console.log("UUBU", e);
  }
};

exports.retrieveUserLocationPermission = async (req, res) => {
  try {
    const { uid } = req.params;
    await User.findByIdAndUpdate(uid, req.body);
    res.status(200).send({ message: "User Location Permission Updated" });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserRoleQuery = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid }).select(
      "staff student active_member_role"
    );

    const staff = await Staff.find({ _id: { $in: user?.staff } })
      .sort("staffDesignationCount")
      .select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
      )
      .populate({
        path: "institute",
        select: "insName insProfilePhoto photoId name alias_pronounciation",
      });

    const student = await Student.find({ _id: { $in: user?.student } })
      .sort("createdAt")
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto student_join_mode student_unit studentGRNO"
      )
      .populate({
        path: "institute",
        select: "insName insProfilePhoto photoId name alias_pronounciation",
      })
      .populate({
        path: "student_unit",
        select: "hostel_unit_name hostel hostel_unit_photo",
        populate: {
          path: "hostel",
          select: "_id",
        },
      });

    var mergeArray = [...staff, ...student];
    var get_array = mergeArray?.filter((val) => {
      if (`${val?._id}` == `${user?.active_member_role}`) return val;
    });
    mergeArray = mergeArray?.filter((val) => {
      if (`${val?._id}` != `${user?.active_member_role}`) return val;
    });
    if (get_array?.length > 0) {
      mergeArray.unshift(get_array?.[0]);
    }
    // const roleEncrypt = await encryptionPayload(mergeArray);
    res.status(200).send({
      message: "User Role for Staff & Student",
      role_query: mergeArray,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserRoleQueryFormat = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid }).select("staff student");
    if (user?.staff?.length > 0 || user?.student?.length > 0) {
      res.status(200).send({
        message: "User Role for Staff & Student 😀👍",
        role_query: true,
      });
    } else {
      res.status(200).send({
        message: "No Role for Staff & Student 🙄🔍",
        role_query: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStaffAllDesignationQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_staff = await Staff.findById({ _id: sid }).select(
      "designation_array staffDesignationCount"
    );

    res.status(200).send({
      message: "Explore All Designation for Staff",
      access: true,
      one_staff: one_staff,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.updateUserUnBlockInstitute = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    const { blockId } = req.query;
    var user = await User.findById({ _id: user_session });
    var block_ins = await InstituteAdmin.findById({ _id: blockId });
    if (block_ins?.isUniversal === "Universal") {
      res
        .status(200)
        .send({ message: "Not able to block Universal A/c", unblock: false });
    } else {
      if (user?.user_block_institute?.includes(`${block_ins._id}`)) {
        user.user_block_institute.pull(block_ins._id);
        if (user.blockCount >= 1) {
          user.blockCount -= 1;
        }
        await Promise.all([user.save(), block_ins.save()]);
        res
          .status(200)
          .send({ message: "You are UnBlocked able to follow", unblock: true });
      } else {
        res
          .status(200)
          .send({ message: "You are Already UnBlocked able to follow" });
      }
    }
  } catch (e) {
    console.log("UUBI", e);
  }
};

exports.retrieveUserReportBlockIns = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    const { blockId } = req.query;
    var user = await User.findById({ _id: user_session });
    var block_ins = await InstituteAdmin.findById({ _id: blockId });
    const staff = await Staff.find({
      $and: [
        { _id: { $in: user?.staff } },
        { staffStatus: "Approved" },
        { institute: blockId },
      ],
    });
    var flag = staff?.length > 0 ? true : false;

    if (block_ins?.isUniversal === "Universal") {
      res
        .status(200)
        .send({ message: "Not able to block Universal A/c", unblock: false });
    } else {
      if (!flag) {
        if (user?.user_block_institute?.includes(`${block_ins._id}`)) {
          res.status(200).send({
            message: "You are Already Blocked not able to follow / circle ",
          });
        } else {
          user.user_block_institute.push(block_ins._id);
          if (user.blockCount >= 1) {
            user.blockCount += 1;
          }
          await Promise.all([user.save(), block_ins.save()]);
          res.status(200).send({
            message: "You are Blocked not able to follow",
            block: true,
          });
          try {
            block_ins.followers?.pull(user_session);
            user.userInstituteFollowing?.pull(blockId);
            if (user.followingUICount > 0) {
              user.followingUICount -= 1;
            }
            if (block_ins.followersCount > 0) {
              block_ins.followersCount -= 1;
            }

            const post = await Post.find({ author: `${block_ins._id}` });
            post.forEach(async (ele) => {
              if (user?.userPosts?.includes(`${ele._id}`)) {
                user.userPosts.pull(ele._id);
              }
            });
            await user.save();

            const post_count = await Post.find({ author: `${block_ins._id}` });
            post_count.forEach(async (ele) => {
              ele.authorFollowersCount = block_ins.followersCount;
              await ele.save();
            });
            //
          } catch {
            console.log(e);
          }
        }
      } else {
        res.status(200).send({
          message: "You're the member of this Institute ",
          block: false,
        });
      }
    }
  } catch (e) {
    console.log("UUBU", e);
  }
};

exports.renderMode = async (req, res) => {
  try {
    var all_students = await Student.find({});
    for (var ref of all_students) {
      if (ref?.hostelPaidFeeCount > 0) {
        ref.student_join_mode = "HOSTEL_PROCESS";
      } else {
        ref.student_join_mode = "ADMISSION_PROCESS";
      }
      await ref.save();
    }
    res.status(200).send({ message: "Explore New Mode", access: true });
  } catch (e) {
    console.log(e);
  }
};

// exports.getAllThreeCount = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const user = await User.findById({ _id: id })
//       .select("_id activity_tab uNotify")
//       .populate({
//         path: "uNotify",
//       });
//     var total = 0;
//     const notify = await Notification.find({
//       $and: [{ _id: { $in: user?.uNotify } }, { notifyViewStatus: "Not View" }],
//     });
//     const activity = await StudentNotification.find({
//       $and: [
//         { _id: { $in: user?.activity_tab } },
//         { notifyViewStatus: "Not View" },
//       ],
//     });
//     total = total + notify?.length + activity?.length;

//     res
//       .status(200)
//       .send({ message: "Not Viewed Notification & Activity", count: total });
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.retrieveMarkAllView = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const user = await User.findById({ _id: id })
//       .select("_id")
//       .populate({ path: "activity_tab uNotify" });
//     const notify = await Notification.find({
//       $and: [{ _id: { $in: user?.uNotify } }, { notifyViewStatus: "Not View" }],
//     });
//     const activity = await StudentNotification.find({
//       $and: [
//         { _id: { $in: user?.activity_tab } },
//         { notifyViewStatus: "Not View" },
//       ],
//     });
//     if (notify?.length >= 1) {
//       notify.forEach(async (ele) => {
//         ele.notifyViewStatus = "View";
//         await ele.save();
//       });
//     }
//     if (activity?.length >= 1) {
//       activity.forEach(async (ele) => {
//         ele.notifyViewStatus = "View";
//         await ele.save();
//       });
//     }

//     res.status(200).send({ message: "Mark All To Be Viewed" });
//   } catch (e) {
//     console.log(e);
//   }
// };
