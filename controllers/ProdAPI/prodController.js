const Post = require("../../models/Post");
const Poll = require("../../models/Question/Poll");
const Answer = require("../../models/Question/Answer");
const User = require("../../models/User");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Staff = require("../../models/Staff");

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
    // const { query } = req.query
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
    const post = await User.find({}).select("is_mentor staff");
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
    const { id } = req.params;
    // const staff = await Staff.find({}).select("id staffFirstName");
    const ins = await InstituteAdmin.findById({ _id: id })
      .select("id")
      .populate({
        path: "iNotify",
        select: "notifyContent",
      });
    res.status(200).send({ message: "One Institute ", one_ins: ins });
  } catch {}
};

exports.oneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    res.status(200).send({ message: "One User ", one_user: user });
  } catch {}
};
