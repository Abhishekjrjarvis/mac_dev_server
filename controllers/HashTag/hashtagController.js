const HashTag = require("../../models/HashTag/hashTag");
const User = require("../../models/User");
const Post = require("../../models/Post");
const { uploadDocFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

const addHashtag = () => {
  var hashTag = [
    "#climatechange",
    "#economics",
    "#universe",
    "#jee",
    "#neet",
    "#5thstandard",
    "#6thstandard",
    "#7thstandard",
    "#8thstandard",
    "#9thstandard",
    "#10thstandard",
    "#11thstandard",
    "#12thstandard",
    "#cat",
    "#pharmacy",
    "#cet",
    "#physics",
    "#biology",
    "#chemistry",
    "#maths",
    "#electrical",
    "#computerscience",
    "#mechanical",
    "#english",
    "#hindi",
    "#environment",
    "#geography",
    "#history",
    "#social",
    "#earth",
    "#facts",
    "#upsc",
    "#life",
    "#technology",
    "#elearning",
    "#career",
    "#arts",
    "#drawing",
    "#informationtechnology",
    "#aptitude",
    "#comunication",
    "#civil",
    "#measurement",
    "#homescience",
    "#globalwarming",
  ];

  hashTag?.forEach(async (ele) => {
    const new_hash = new HashTag({});
    new_hash.hashtag_name = ele;
    await new_hash.save();
  });
  return true;
};

// console.log(addHashtag());

const photo_hashtag = async () => {
  const all = await HashTag.find({});
  all?.forEach(async (ele) => {
    ele.hashtag_profile_photo = "72cb82ebece43d88721ae4ae49583071";
    await ele.save();
  });
};

// console.log(photo_hashtag());

exports.renderHashtag = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "You're are breaking rules of API Fetching 😡",
        out: true,
      });
    const hash = await HashTag.findById({ _id: hid }).select(
      "hashtag_name hashtag_profile_photo hashtag_follower_count hashtag_trend hashtag_about hashtag_question_count hashtag_repost_count hashtag_poll_count"
    );
    res.status(200).send({
      message: "Explore your favourite hashtag 😀",
      in: true,
      hash,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderHashtagPost = async (req, res) => {
  try {
    const { hid } = req.params;
    if (!hid)
      return res.status(200).send({
        message: "You're are breaking rules of API Fetching 😡",
        out: true,
        totalPage: 0,
        postCount: 0,
        post: [],
      });
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var skip = (page - 1) * limit;
    const hash = await HashTag.findById({ _id: hid });
    var post = await Post.find({ _id: { $in: hash?.hashtag_post } })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "postTitle postText question_visibility postQuestion post_question_transcript post_description_transcript comment_turned isHelpful needCount authorOneLine authorFollowersCount needUser isNeed answerCount tagPeople isUser isInstitute answerUpVoteCount postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postType"
      )
      .populate({
        path: "poll_query",
      })
      .populate({
        path: "rePostAnswer",
        populate: {
          path: "post",
          select:
            "postQuestion authorProfilePhoto authorUserName author authorPhotoId isUser answerCount createdAt",
        },
      })
      .populate({
        path: "needMultiple",
        select: "username photoId profilePhoto",
      })
      .populate({
        path: "repostMultiple",
        select: "username photoId profilePhoto",
      });
    const postCount = await Post.find({ _id: { $in: hash.hashtag_post } });
    var totalPage = 0;
    if (page * limit >= postCount.length) {
    } else {
      totalPage = page + 1;
    }
    res.status(200).send({
      message: "Explore your favourite hashtag 😀",
      in: true,
      totalPage,
      postCount: postCount?.length,
      post,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.followHashtag = async (req, res) => {
  try {
    var user_session = req.tokenData && req.tokenData.userId;
    const { hid } = req.query;
    var user = await User.findById({ _id: user_session });
    var hash = await HashTag.findById({ _id: hid });

    if (user.follow_hashtag?.includes(hash._id)) {
      hash.hashtag_follower.pull(user._id);
      user.follow_hashtag.pull(hash._id);
      if (user.follow_hashtag_count > 0) {
        user.follow_hashtag_count -= 1;
      }
      if (hash.hashtag_follower_count > 0) {
        hash.hashtag_follower_count -= 1;
      }
      await Promise.all([user.save(), hash.save()]);
      res
        .status(200)
        .send({ message: " UnFollow this hashtag 🖐😒", tag: true });
      hash.hashtag_post?.forEach(async (ele) => {
        if (user?.userPosts?.includes(ele)) {
          user.userPosts.pull(ele);
        }
      });
      await user.save();
    } else {
      hash.hashtag_follower.push(user._id);
      user.follow_hashtag.push(hash._id);
      user.follow_hashtag_count += 1;
      hash.hashtag_follower_count += 1;
      await Promise.all([user.save(), hash.save()]);
      res.status(200).send({ message: " Follow this hashtag ✨🎉", tag: true });
      hash.hashtag_post?.forEach(async (ele) => {
        if (user?.userPosts?.includes(ele)) {
        } else {
          user.userPosts.push(ele);
        }
      });
      await user.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.arrayHashtag = async (req, res) => {
  try {
    const { search } = req.query
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var skip = (page - 1) * limit;
    if(search){
      var hash = await HashTag.find({})
      .select(
        "hashtag_name hashtag_follower_count hashtag_profile_photo hashtag_photo_id"
      );
    }
    else{
      var hash = await HashTag.find({})
        .sort("created_at")
        .limit(limit)
        .skip(skip)
        .select(
          "hashtag_name hashtag_follower_count hashtag_profile_photo hashtag_photo_id"
        );
    }
    if (hash?.length > 0) {
      res.status(200).send({
        message: "All Array of Hashtag by follower",
        hash: hash,
        status: true,
      });
    } else {
      res.status(200).send({
        message: "All Array of Hashtag by follower",
        hash: [],
        status: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateHashtag = async (req, res) => {
  try {
    const { hid } = req.params;
    const hash = await HashTag.findById({ _id: hid });
    const file = req.file;
    const results = await uploadDocFile(file);
    hash.hashtag_profile_photo = results.key;
    hash.hashtag_photo_id = "1";
    await Promise.all([hash.save()]);
    await unlinkFile(file.path);
    res.status(200).send({
      message: "update Profile 😀",
      hash: hash,
      status: true,
    });
  } catch (e) {
    console.log(e);
  }
};
