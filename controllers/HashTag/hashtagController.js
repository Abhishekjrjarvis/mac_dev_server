const HashTag = require("../../models/HashTag/hashTag");
const User = require("../../models/User");
const Post = require("../../models/Post");

const addHashtag = () => {
  var hashTag = [
    "#jee",
    "#cat",
    "#pharmacy",
    "#neet",
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
    "#climatechange",
    "#environment",
    "#geography",
    "#history",
    "#social",
    "#economics",
    "#earth",
    "#universe",
    "#10thstandard",
    "#12thstandard",
    "#11thstandard",
    "#9thstandard",
    "#8thstandard",
    "#7thstandard",
    "#6thstandard",
    "#5thstandard",
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

exports.renderHashtag = async (req, res) => {
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
    var hash_data = {
      hashtag_name: hash.hashtag_name,
      hashtag_about: hash.hashtag_about,
      hashtag_follower_count: hash.hashtag_follower_count,
      hashtag_question_count: hash.hashtag_question_count,
      hashtag_repost_count: hash.hashtag_repost_count,
      hashtag_poll_count: hash.hashtag_poll_count,
      hashtag_proflile_photo: hash.hashtag_proflile_photo,
    };
    res.status(200).send({
      message: "Explore your favourite hashtag 😀",
      in: true,
      hash: hash_data,
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
    var page = req.query.page ? parseInt(req.query.page) : 1;
    var limit = req.query.limit ? parseInt(req.query.limit) : 10;
    var skip = (page - 1) * limit;
    const hash = await HashTag.find({})
      .sort("-hashtag_follower_count")
      .limit(limit)
      .skip(skip)
      .select("hashtag_name hashtag_follower_count hashtag_proflile_photo");
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
