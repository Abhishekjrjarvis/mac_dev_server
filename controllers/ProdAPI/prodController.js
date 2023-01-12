const Post = require("../../models/Post");
const Poll = require("../../models/Question/Poll");
const Answer = require("../../models/Question/Answer");
const User = require("../../models/User");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

// exports.allUsers = async (req, res) => {
//   try {
//     const user = await User.find({})
//       .select("id username userPosts")
//       .sort("-createdAt")
//       .lean()
//       .exec();

//     var query = [];
//     user?.forEach(async (post) => {
//       const posts = await Post.find({ _id: { $in: post?.userPosts } }).select(
//         "_id"
//       );
//       query.push(...posts);
//     });
//     res.status(200).send({
//       message: "All Post Id",
//       allIds: user,
//       count: user?.length,
//       query: query,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

exports.allPosts = async (req, res) => {
  try {
    const user = await User.find({})
      .select("id username userPosts")
      .sort("-createdAt")
      .lean()
      .exec();

    var query = [];
    user?.forEach(async (post) => {
      const posts = await Post.find({ _id: { $in: post?.userPosts } }).select(
        "_id"
      );
      query.push(...posts);
    });
    res.status(200).send({
      message: "All Post Id",
      allIds: user,
      count: user?.length,
      query: query,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.allPolls = async (req, res) => {
  try {
    const poll = await InstituteAdmin.find({})
      .select("id staffFormSetting studentFormSetting")
      .lean()
      .exec();
    res
      .status(200)
      .send({ message: "All Poll Id", allIds: poll, count: poll?.length });
  } catch {}
};

exports.allPostById = async (req, res) => {
  try {
    const post = await InstituteAdmin.find({}).select(" insName staffJoinCode");
    res.status(200).send({ message: "All Poll Id", allIds: post });
  } catch {}
};

exports.allAnswer = async (req, res) => {
  try {
    const { answerId } = req.query;
    const post = await Answer.find({ _id: answerId }).populate({
      path: "post",
      select: "postQuestion",
    });
    res.status(200).send({ message: "All Answer", allIds: post });
  } catch {}
};

exports.allRepost = async (req, res) => {
  try {
    const { postId } = req.query;
    const post = await Post.find({
      $and: [{ postType: "Repost" }, { _id: postId }],
    })
      .select("postType")
      .populate({
        path: "rePostAnswer",
        select: "answerContent ",
        populate: {
          path: "post",
          select: "postQuestion",
        },
      });
    res.status(200).send({ message: "All Repost", allIds: post });
  } catch (e) {
    console.log(e);
  }
};

const replaceUser = (user) => {
  var updateUser = [];
  user.filter((ele) => {
    if (!ele?.user_latitude && !ele?.user_longitude) return;
    else {
      return updateUser.push(ele);
    }
  });
  return updateUser;
};

exports.allUser = async (req, res) => {
  try {
    const user = await User.find({})
      .select("id user_latitude user_longitude userInstituteFollowing")
      .lean()
      .exec();
    if (user?.length > 0) {
      var validLUser = replaceUser(user);
      res.status(200).send({
        message: "All User Id",
        allIds: validLUser,
        count: validLUser?.length,
      });
    }
  } catch {}
};

const replaceIns = (ins) => {
  var updateIns = [];
  ins.filter((ele) => {
    if (!ele?.ins_latitude && !ele?.ins_longitude) return;
    else {
      return updateIns.push(ele);
    }
  });
  return updateIns;
};

exports.allIns = async (req, res) => {
  try {
    const ins = await InstituteAdmin.find({})
      .select("id ins_latitude ins_longitude")
      .lean()
      .exec();
    if (ins?.length > 0) {
      var validLIns = replaceIns(ins);
      res.status(200).send({
        message: "All Ins Id",
        allIds: validLIns,
        count: validLIns?.length,
      });
    }
  } catch {}
};

exports.rewardProfileAdsQuery = async (req, res) => {
  try {
    const { uid } = req.params;
    var user_ads = await User.findById({ _id: uid }).select(
      "id profile_ads_count"
    );
    if (user_ads?.profile_ads_count === 10) {
      user_ads.profile_ads_count = 0;
      await user_ads.save();
    } else {
      user_ads.profile_ads_count += 1;
      await user_ads.save();
    }
    // const rewardEncrypt = await encryptionPayload(user_ads.profile_ads_count);
    res.status(200).send({
      message: "Get Ready for Reward Based Ads",
      ads_view_count: user_ads.profile_ads_count,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.oneInstitute = async (req, res) => {
  try {
    const ins = await User.find({});
    res.status(200).send({ message: "One Institute ", one_ins: ins });
  } catch {}
};

exports.oneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const one_user = await User.findById({ _id: id });
    const followers_user = await User.find({
      _id: { $in: one_user?.userFollowers },
    });
    const following_user = await User.find({
      _id: { $in: one_user?.userFollowing },
    });
    const circle_user = await User.find({ _id: { $in: one_user?.userCircle } });
    const ins_user = await InstituteAdmin.find({
      _id: { $in: one_user?.userInstituteFollowing },
    });
    const post_author = await Post.find({ author: one_user?._id });
    const all_user = await User.find({});
    for (let fsu of followers_user) {
      fsu.userFollowing.pull(one_user?._id);
      if (fsu.followingUICount > 0) {
        fsu.followingUICount -= 1;
      }
      await fsu.save();
    }
    for (let fu of following_user) {
      fu.userFollowers.pull(one_user?._id);
      if (fu.followerCount > 0) {
        fu.followerCount -= 1;
      }
      await fu.save();
    }
    for (let cu of circle_user) {
      cu.userCircle.pull(one_user?._id);
      if (cu.circleCount > 0) {
        cu.circleCount -= 1;
      }
      await cu.save();
    }
    for (let ifu of ins_user) {
      ifu.userFollowersList.pull(one_user?._id);
      if (ifu.followingUICount > 0) {
        ifu.followingUICount -= 1;
      }
      await ifu.save();
    }
    for (let alp of post_author) {
      del_post.push(alp._id);
    }
    for (let alu of all_user) {
      if (alu._id !== one_user._id) {
        alu.userPosts.pull(...del_post);
      }
    }
    res.status(200).send({
      message: "Deletion Operation Complete You're good to go 😀🙌",
      delete: true,
    });
  } catch {
    console.log(e);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
  } catch (e) {
    console.log(e);
  }
};

exports.allLogs = async (req, res) => {
  try {
    const logs = await Student.find({}).select(
      "studentFirstName studentDocuments studentAadharFrontCard"
    );
    res.status(200).send({ message: "All Student Documents", logs });
  } catch (e) {
    console.log(e);
  }
};
