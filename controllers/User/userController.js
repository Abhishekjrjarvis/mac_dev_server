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
const Comment = require('../../models/Comment')
const ReplyComment = require('../../models/ReplyComment/ReplyComment')
const AnswerReply = require('../../models/Question/AnswerReply')
const Chat = require("../../models/Chat/Chat");
const StudentNotification = require('../../models/Marks/StudentNotification')

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

exports.retrieveProfileData = async (req, res) => {
  try {
    const { id } = req.params;
    var totalUpVote = 0
    const user = await User.findById({ _id: id })
      .select(
        "userLegalName photoId questionCount one_line_about recoveryMail answerQuestionCount recentChat profilePhoto user_birth_privacy user_address_privacy user_circle_privacy tag_privacy user_follower_notify user_comment_notify user_answer_notify user_institute_notify userBio userAddress userEducation userHobbies userGender coverId profileCoverPhoto username followerCount followingUICount circleCount postCount userAbout userEmail userAddress userDateOfBirth userPhoneNumber userHobbies userEducation "
      )
      const answers = await Answer.find({ author: id })
      for(let up of answers){
        totalUpVote += up.upVoteCount
      }
      if(user && user?.userPosts?.length < 1){
        var post = []
      }
    res.status(200).send({ message: "Limit User Profile Data ", user, upVote: totalUpVote, post });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveFIAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .populate({
        path: "userInstituteFollowing",
        populate: {
          path: "announcement",
          select:
            "insAnnPhoto insAnnDescription insAnnTitle insAnnVisibility createdAt",
          populate: {
            path: "reply",
            select: "replyText createdAt replyAuthorAsUser replyAuthorAsIns",
          },
        },
        select: "id",
      })
      .populate({
        path: "userInstituteFollowing",
        populate: {
          path: "announcement",
          select:
            "insAnnPhoto insAnnDescription insAnnTitle insAnnVisibility createdAt starList",
          populate: {
            path: "institute",
            select: "insName photoId insProfilePhoto",
          },
        },
        select: "id",
      })
      .select("_id")
      .lean()
      .exec();

    const announcementArray = (announcement) => {
      const announ = [];
      // const announ2 = [];

      announcement?.forEach((announce) => {
        announce?.announcement?.forEach((oneAnnounce) => {
          announ.push({
            _id: oneAnnounce._id,
            insAnnTitle: oneAnnounce.insAnnTitle,
            insAnnVisibility: oneAnnounce.insAnnVisibility,
            starList: oneAnnounce.starList,
            createdAt: oneAnnounce.createdAt,
            institute: {
              _id: oneAnnounce.institute._id,
              insName: oneAnnounce.institute.insName,
              photoId: oneAnnounce.institute.photoId,
              insProfilePhoto: oneAnnounce.institute.insProfilePhoto,
            },
          });
        });
      });
      // let count = 0;
      // for (announcement of announ) {
      //   let countAgain = 0;
      //   let flag = false;
      //   for (announcementAgain of announ) {
      //     if (
      //       dateTimeSort(
      //         announcement[count]?.createdAt,
      //         announcementAgain[countAgain]?.createdAt
      //       )
      //     )
      //       flag = true;
      //     else flag = false;
      //   }
      // }

      return announ;
    };

    if (user) {
      res.status(200).send({
        message: "Success",
        announcements: announcementArray(user?.userInstituteFollowing),
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
        notify.notifyContent = `${user.userLegalName} started to following you`;
        notify.notifySender = user._id;
        notify.notifyReceiever = sinstitute._id;
        sinstitute.iNotify.push(notify._id);
        notify.institute = sinstitute._id;
        notify.notifyByPhoto = user._id;
        await Promise.all([
          user.save(),
          sinstitute.save(),
          notify.save()
        ])
        res.status(200).send({ message: "Following This Institute" });
        if (sinstitute.isUniversal === "Not Assigned") {
          const post = await Post.find({
            $and: [{ author: sinstitute._id, postStatus: "Anyone" }],
          });
          post.forEach(async (ele) => {
            user.userPosts.push(ele);
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
    console.log('UFOI', e)
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
        if(user.followingUICount > 0){
          user.followingUICount -= 1;
        }
        sinstitute.userFollowersList.pull(user._id);
        if(sinstitute.followersCount > 0){
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
            user.userPosts.pull(ele);
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

    if (user.userFollowing.includes(req.body.userFollowId)) {
      res.status(200).send({ message: "You Already Following This User" });
    } else {
      const notify = new Notification({});
      suser.userFollowers.push(user_session);
      user.userFollowing.push(req.body.userFollowId);
      user.followingUICount += 1;
      suser.followerCount += 1;
      notify.notifyContent = `${user.userLegalName} started to following you`;
      notify.notifySender = user._id;
      notify.notifyReceiever = suser._id;
      suser.uNotify.push(notify);
      notify.user = suser;
      notify.notifyByPhoto = user;
      await Promise.all([
        user.save(),
        suser.save(),
        notify.save()
      ])
      if(suser?.user_follower_notify === 'Enable'){
        invokeFirebaseNotification("Followers", notify, suser.userLegalName, suser._id, suser.deviceToken);
      }
      res.status(200).send({ message: " Following This User" });
      const post = await Post.find({
        $and: [{ author: suser._id, postStatus: "Anyone" }],
      });
      post.forEach(async (ele) => {
        //
        if(user?.userPosts?.includes(ele)){

        }
        else{
          user.userPosts.push(ele);
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
  } catch (e) {
    console.log('UFOU', e)
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
      if(user.followingUICount > 0){
        user.followingUICount -= 1;
      }
      if(suser.followerCount > 0){
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
        if(suser.followingUICount > 0){
          suser.followingUICount -= 1;
        }
        user.userFollowers.pull(req.body.followId);
        if(user.followerCount > 0){
          user.followerCount -= 1;
        }
        suser.userCircle.push(user_session);
        user.userCircle.push(req.body.followId);
        suser.circleCount += 1;
        user.circleCount += 1;
        notify.notifyContent = `${user.userLegalName} has been added to your circle`;
        notify.notifySender = user._id;
        notify.notifyReceiever = suser._id;
        suser.uNotify.push(notify);
        notify.user = suser;
        notify.notifyByPhoto = user;
        await Promise.all([ user.save(), suser.save(), notify.save() ])
        if(suser?.user_follower_notify === 'Enable'){
          invokeFirebaseNotification("Circle", notify, 'Circled', suser._id, suser.deviceToken);
        }
        res.status(200).send({ message: "😀 Added to circle" });
        const post = await Post.find({
          $and: [{ author: suser._id }],
        });
        post.forEach(async (ele) => {
          if(user && user.userPosts?.includes(`${ele}`)){
          }
          else{
            user.userPosts.push(ele);
          }
        });
        await user.save();
        const posts = await Post.find({
          $and: [{ author: user._id }],
        });
        posts.forEach(async (ele) => {
          if(suser && suser.userPosts?.includes(`${ele}`)){
          }
          else{
            suser.userPosts.push(ele);
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
    console.log('UCU', e)
  }
};

// exports.removeUserCircle = async (req, res) => {
//   console.log('Uncircled hit')
//   try {
//     var user_session = req.tokenData && req.tokenData.userId;
//     var user = await User.findById({ _id: user_session });
//     var suser = await User.findById({ _id: req.body.followId });

//     if (
//       user.userCircle.includes(req.body.followId) &&
//       suser.userCircle.includes(user_session)
//     ) {
//       try {
//         console.log('INC')
//         user.userCircle.pull(req.body.followId);
//         suser.userCircle.pull(user_session);
//         if(suser.circleCount > 0){
//           suser.circleCount -= 1;
//         }
//         if(user.circleCount > 0){
//           user.circleCount -= 1;
//         }
//         user.userFollowers.push(req.body.followId);
//         suser.userFollowing.push(user_session);
//         user.followerCount += 1;
//         suser.followingUICount += 1;
//         await user.save();
//         await suser.save();
//         res.status(200).send({ message: "Uncircled" });
//         const post = await Post.find({
//           $and: [{ author: suser._id }],
//         });
//         post.forEach(async (ele) => {
//           if(user && user.userPosts?.includes(`${ele._id}`)){
//             console.log('true')
//             user.userPosts.pull(`${ele._id}`);
//           }
//           else{
//           }
//         });
//         await user.save();
//         const posts = await Post.find({
//           $and: [{ author: user._id }],
//         });
//         posts.forEach(async (ele) => {
//           if(suser && suser.userPosts?.includes(`${ele._id}`)){
//             console.log('true')
//             suser.userPosts.pull(`${ele._id}`);
//           }
//           else{
//           }
//         });
//         await suser.save();
//       } catch {
//         res.status(500).send({ error: "error" });
//       }
//     } else {
//       console.log('NOC')
//       res.status(200).send({ message: "You are Not In a Circle" });
//     }
//   } catch (e) {
//     console.log(`UUCU`, e);
//   }
// };

exports.updateUserPhone = async (req, res) => {
  try {
    const { id } = req.params;
    const { userPhoneNumber } = req.body;
    const user = await User.findById({ _id: id });
    user.userPhoneNumber = userPhoneNumber;
    await user.save();
    res.status(200).send({ message: "Mobile No Updated", user });
  } catch (e) {
    console.log(`Error`);
  }
};

exports.updateUserPersonal = async (req, res) => {
  try {
    const { id } = req.params;
    var user = await User.findByIdAndUpdate(id, req.body);
    res.status(200).send({ message: "Personal Info Updated" });
      const post = await Post.find({ author: `${user._id}` });
      post.forEach(async (ele) => {
        ele.authorOneLine = user.one_line_about;
        await ele.save();
      });
      const comment = await Comment.find({ author: `${user._id}` });
      comment.forEach(async (com) => {
        com.authorOneLine = user.one_line_about;
        await com.save();
      });
      const replyComment = await ReplyComment.find({ author: `${user._id}` });
      replyComment.forEach(async (reply) => {
        reply.authorOneLine = user.one_line_about;
        await reply.save();
      });
      const answers = await Answer.find({ author: `${user._id}` });
      answers.forEach(async (ans) => {
        ans.authorOneLine = user.one_line_about;
        await ans.save();
      });
      const answerReply = await AnswerReply.find({ author: `${user._id}` });
      answerReply.forEach(async (ansRep) => {
        ansRep.authorOneLine = user.one_line_about;
        await ansRep.save();
      });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.addUserAccountInstitute = async (req, res) => {
  try {
    const { id, iid } = req.params;
    const user = await User.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: iid });
    user.addUserInstitute.push(institute);
    institute.addInstituteUser.push(user);
    await user.save();
    await institute.save();
    res.status(200).send({ message: "Added", user, institute });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.addUserAccountUser = async (req, res) => {
  try {
    const { id, iid } = req.params;
    const user = await User.findById({ _id: id });
    const userNew = await User.findById({ _id: iid });
    user.addUser.push(userNew);
    userNew.addUser.push(user);
    await user.save();
    await userNew.save();
    res.status(200).send({ message: "Added", user, userNew });
  } catch (e) {
    console.log(`Error`, e.message);
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
      //
      // res.clearCookie("SessionID", { path: "/" });
      //
      res.status(200).send({ message: "Deactivated Account", status: user.activeStatus });
    } else {
      res.status(404).send({ message: "Bad Request" });
    }
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.feedbackUser = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: "62596c3a47690fe0d371f5b4" });
    const user = await User.findById({ _id: id });
    const feed = await new Feedback({});
    feed.rating = req.body.rating;
    feed.bestPart = req.body.bestPart;
    feed.worstPart = req.body.worstPart;
    feed.suggestion = req.body.suggestion;
    feed.user = user;
    admin.feedbackList.push(feed);
    await feed.save();
    await admin.save();
    res.status(200).send({ message: "Feedback" });
  } catch (e) {
    console.log(`Error`, e.message);
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
    console.log(`Error`, e.message);
  }
};

exports.getCreditTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    const { transferCredit, transferIns } = req.body;
    const user = await User.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: `${transferIns}` });
    const notify = await new Notification({});
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
    await user.save();
    await institute.save();
    await notify.save();
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
    const report = await new Report({ reportStatus: reportStatus });
    admin.reportList.push(report._id);
    admin.reportPostQueryCount += 1
    report.reportInsPost = post._id;
    report.reportBy = user._id;
    await Promise.all([ 
     admin.save(),
     report.save()
    ])
    res.status(200).send({ message: "reported", report: report.reportStatus });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;

    const user = await User.findById({ _id: id }).populate({ path: "uNotify" });

    const notify = await Notification.find({ _id: { $in: user.uNotify } })
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
        select: "photoId photo dName",
      })
      .sort("-notifyTime")
      .limit(limit)
      .skip(skip);

    res.status(200).send({ message: "Notification send", notify });
  } catch (e) {
    console.log(e);
  }
};


exports.getAllUserActivity = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;

    const user = await User.findById({ _id: id }).populate({ path: "activity_tab" });

    const notify = await StudentNotification.find({ _id: { $in: user.activity_tab } })
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
        // populate: {
        //   path: 'studentClass',
        //   select: 'className'
        // }
      })
      .populate({
        path: "notifyByDepartPhoto",
        select: "photoId photo dName",
      })
      // .populate({
      //   path: "notifyByStudentPhoto",
      //   select:
      //     "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName",
      //   populate: {
      //     path: 'batches',
      //     select: 'batchName'
      //   }
      // })
      .populate({
        path: "notifyByClassPhoto",
        select: "photoId photo className",
      })
      // .populate({
      //   path: "notifyByStudentPhoto",
      //   select:
      //     "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName",
      //   populate: {
      //     path: 'department',
      //     select: 'dName'
      //   }
      // })
      .sort("-notifyTime")
      .limit(limit)
      .skip(skip);

    res.status(200).send({ message: "All Activity", activity: notify });
  } catch (e) {
    console.log(e);
  }
};



exports.getAllTotalCount = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById({ _id: id })
    .select('_id')
    .populate({ path: "activity_tab uNotify" });
    var total = 0
    const notify = await Notification.find({
      $and: [{ _id: { $in: user.uNotify } }, { notifyViewStatus: 'Not View' }],
    })
    const activity = await StudentNotification.find({
      $and: [{ _id: { $in: user.activity_tab } }, { notifyViewStatus: 'Not View' }],
    })
    total = total + notify?.length + activity?.length

    res.status(200).send({ message: "Not Viewed Notification & Activity", count: total });
  } catch (e) {
    console.log(e);
  }
};



exports.retrieveMarkAllView = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById({ _id: id })
    .select('_id')
    .populate({ path: "activity_tab uNotify" });
    const notify = await Notification.find({
      $and: [{ _id: { $in: user.uNotify } }, { notifyViewStatus: 'Not View' }],
    })
    const activity = await StudentNotification.find({
      $and: [{ _id: { $in: user.activity_tab } }, { notifyViewStatus: 'Not View' }],
    })
    if(notify?.length >=1){
      notify.forEach( async(ele) =>{
        ele.notifyViewStatus = 'View'
        await ele.save()
      })
    }
    if(activity?.length >=1){
      activity.forEach( async(ele) =>{
        ele.notifyViewStatus = 'View'
        await ele.save()
      })
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
    const activity = await StudentNotification.findOne({_id: rid})
    if(read){
      read.notifyReadStatus = "Read";
      await read.save();
    }
    else if(activity){
      activity.notifyReadStatus = "Read";
      await activity.save();
    }
    else{}
    res.status(200).send({ message: "Mark As Read" });
  } catch (e) {
    console.log(e);
  }
};

exports.getHideNotifications = async (req, res) => {
  try {
    const { nid } = req.params;
    const notify = await Notification.findOne({ _id: nid });
    const activity = await StudentNotification.findOne({_id: nid})
    if(notify){
      notify.notifyVisibility = "hide";
      await notify.save();
    }
    else if(activity){
      activity.notifyVisibility = "hide";
      await activity.save();
    }
    else{}
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
        "userLegalName username ageRestrict photoId one_line_about profilePhoto user_birth_privacy user_address_privacy user_circle_privacy tag_privacy user_follower_notify user_comment_notify user_answer_notify user_institute_notify"
      )
      if(user.userPosts && user.userPosts.length < 1){
        var post = []
      }
      // .populate({
      //   path: 'supportChat',
      //   populate: {
      //     path: 'latestMessage'
      //   }
      // })
      // .populate({
      //   path: 'supportChat',
      //   populate: {
      //     path: 'message'
      //   }
      // })
      // .lean()
      // .exec();
    if (user) {
      res.status(200).send({ message: "Success", user, post });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
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

    const followers = await User.find({ _id: { $in: user.userFollowers } })
      .select(
        "userLegalName username photoId profilePhoto user_birth_privacy user_address_privacy user_circle_privacy"
      )
      .limit(limit)
      .skip(skip);
    if (user) {
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
    const user = await User.findById({ _id: uid }).select('id userFollowing userInstituteFollowing')

    const uFollowing = await User.find({ _id: { $in: user.userFollowing } })
      .select(
        "userLegalName username photoId profilePhoto user_birth_privacy user_address_privacy user_circle_privacy"
      )
      .limit(limit)
      .skip(skip);

    const uInsFollowing = await InstituteAdmin.find({
      _id: { $in: user.userInstituteFollowing },
    })
      .select("insName name photoId insProfilePhoto")
      .limit(limit)
      .skip(skip);
    var mergeArray = [...uFollowing, ...uInsFollowing]
    res.status(200).send({
      message: "Success",
      uFollowing: uFollowing,
      uInsFollowing: uInsFollowing,
      mergeArray: mergeArray
    });
  } catch {}
};

exports.circleArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { uid } = req.params;
    const skip = (page - 1) * limit;
    const user = await User.findById({ _id: uid }).populate({
      path: "userCircle",
    });

    const circle = await User.find({ _id: { $in: user.userCircle } })
      .select(
        "userLegalName username photoId profilePhoto user_birth_privacy user_address_privacy user_circle_privacy"
      )
      .limit(limit)
      .skip(skip);

    res.status(200).send({ message: "Success", circle: circle });
  } catch {}
};

exports.followingInsArray = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid })
      .select("id")
      .populate({
        path: "userInstituteFollowing",
        select: "insName name photoId insProfilePhoto",
      })
      .lean()
      .exec();
    if (user) {
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
    res.status(200).send({ message: "Success", mail: user.recoveryMail });
  } catch {}
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
    res.status(200).send({ message: "Success", user });
  } catch {}
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
    res.status(200).send({ message: "Success", user });
  } catch {}
};

exports.retrieveStaffDesignationArray = async (req, res) => {
  try {
    const { sid } = req.params;
    const staff = await Staff.findById({ _id: sid })
      .select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffMotherName staffGender staffNationality staffMTongue staffCast staffCastCategory staffBirthPlace staffState staffDistrict staffReligion staffAddress staffPhoneNumber staffAadharNumber staffQualification staffDocuments staffDesignationCount staffAadharCard staffDOB staffStatus staffROLLNO"
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
        select: "subjectName subjectTitle subjectStatus",
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
        path: "institute",
        select: "insName photoId insProfilePhoto",
      })
      .populate({
        path: "user",
        select: "userLegalName photoId profilePhoto",
      })
      .populate({
        path: "financeDepartment",
        select: "financeName financeEmail financePhoneNumber",
        populate: {
          path: "financeHead",
          select: "staffFirstName staffMiddleName staffLastName",
        },
      })
      .populate({
        path: "financeDepartment",
        select: "financeName financeEmail financePhoneNumber",
        populate: {
          path: "institute",
          select: "financeStatus",
        },
      })
      .lean()
      .exec();
    // .populate({
    //   path: "staffAdmissionAdmin",
    //   populate: {
    //     path: "institute",
    //     populate: {
    //       path: "depart",
    //       populate: {
    //         path: "batches",
    //       },
    //     },
    //   },
    // })
    // .populate({
    //   path: "elearning",
    // })
    // .populate({
    //   path: "library",
    // })
    // .populate("financeDepartment")
    // .populate("sportDepartment")
    // .populate("staffSportClass")
    // .populate("staffAdmissionAdmin")
    // .populate({
    //   path: "staffAdmissionAdmin",
    //   populate: {
    //     path: "adAdminName",
    //   },
    // });
    res.status(200).send({ message: "Staff Designation Data", staff });
  } catch {}
};

exports.retrieveStudentDesignationArray = async (req, res) => {
  try {
    const { sid } = req.params;
    const student = await Student.findById({ _id: sid })
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentReligion studentMotherName studentDOB studentNationality studentMTongue studentCast studentCastCategory studentBirthPlace studentState studentDistrict studentAddress studentPhoneNumber studentParentsName studentParentsPhoneNumber studentAadharCard studentAadharNumber studentDocuments studentGRNO studentStatus studentROLLNO"
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
        select: "insName name photoId insProfilePhoto",
      })
      .populate({
        path: "user",
        select: "userLegalName username photoId profilePhoto",
      });
    // .populate("checklist")
    // .populate({
    //   path: "department",
    //   populate: {
    //     path: "fees",
    //   },
    // })
    // .populate({
    //   path: "studentMarks",
    //   populate: {
    //     path: "examId",
    //   },
    // })
    // .populate("studentFee")
    // .populate({
    //   path: "department",
    //   populate: {
    //     path: "checklists",
    //   },
    // })
    // .populate({
    //   path: "sportEvent",
    //   populate: {
    //     path: "sportEventMatch",
    //     populate: {
    //       path: "sportEventMatchClass",
    //       populate: {
    //         path: "sportStudent",
    //       },
    //     },
    //   },
    // })
    // .populate("complaints");
    // .populate('studentAttendence')
    res.status(200).send({ message: "Student Designation Data", student });
  } catch {}
};

exports.retrieveUserThreeArray = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id }).select(
      "id userFollowers userFollowing userInstituteFollowing userCircle"
    );
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
    res.status(200).send({ message: "Success", user });
  } catch {}
};

exports.allCircleUsers = async (req, res) => {
  console.log(req.query);
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
  res.send(user);
}

exports.retrieveUserSubjectChat = async(req, res) =>{
  try{
    const { uid } = req.params
    const user = await User.findById({_id: uid})
    .select('isSubjectTeacher')
    .populate({
      path: 'isSubjectChat',
      match:{subjectStatus:{$eq:`UnCompleted`}},
      select: 'subjectName',
      populate: {
        path: 'class',
        select: 'className classTitle'
      }
    })
    res.status(200).send({ message: 'As a Subject Teacher', chat: user})
  }
  catch{

  }
}

exports.retrieveUserApplicationStatus = async(req, res) =>{
  try{
    const { uid } = req.params
    const user = await User.findById({_id: uid})
    .select('id')
    .populate({
      path: 'applicationStatus'
    })
    res.status(200).send({ message: 'user Application Status', status: user.applicationStatus})
  }
  catch{

  }
}


exports.retrieveProfileDataUsername = async (req, res) => {
  try {
    var totalUpVote = 0;
    const user = await User.findOne({ userLegalName: username }).select(
      "userLegalName photoId questionCount answerQuestionCount recentChat profilePhoto user_birth_privacy user_address_privacy user_circle_privacy userBio userAddress userEducation userHobbies userGender coverId profileCoverPhoto username followerCount followingUICount circleCount postCount userAbout userEmail userAddress userDateOfBirth userPhoneNumber userHobbies userEducation "
    );
    const questionUpVote = await Post.find({ author: user._id });
    for (let up of questionUpVote) {
      totalUpVote += up.answerUpVoteCount;
    }
    res
      .status(200)
      .send({ message: "Limit User Profile Data ", user, upVote: totalUpVote });
  } catch (e) {
    console.log(e);
  }
};


exports.retrieveStaffSalaryHistory = async(req, res) =>{
  try{
    const { sid } = req.params
    const staff = await Staff.findById({_id: sid})
    .select('_id')
    .populate({
      path: 'salary_history',
      populate: {
        path: 'emp_pay'
      }
    })
    res.status(200).send({ message: 'All Salary History ', salary: staff.salary_history})
  }
  catch(e){
    console.log(e)
  }
}


exports.updateUserBlock = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    var user = await User.findById({ _id: user_session });
    var suser = await User.findById({ _id: req.body.followId });

    if (
      user.userCircle.includes(req.body.followId) &&
      suser.userCircle.includes(user_session)
    ) {
      if(user?.userBlock?.includes(`${suser._id}`)){
        user.userBlock.pull(suser._id)
        if(user.blockCount >=1 ){
          user.blockCount -= 1
        }
        await user.save()
        res.status(200).send({ message: "You are UnBlocked able to chat" });
      }
      else{
        user.userBlock.push(suser._id)
        user.blockCount += 1
        await user.save()
        res.status(200).send({ message: "You are Blocked not able to chat" });
      }
    } else {
      res.status(200).send({ message: "Engage Network" });
    }
  } catch (e) {
    console.log('UBU', e)
  }
};