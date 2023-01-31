const InstituteAdmin = require("../models/InstituteAdmin");
const Post = require("../models/Post");

exports.universal_account_creation_feed = async (user) => {
  try {
    var uInstitute = await InstituteAdmin.findOne({
      isUniversal: "Universal",
    }).select("id userFollowersList followersCount posts");
    if (uInstitute?.posts?.length > 0) {
      const post = await Post.find({
        _id: { $in: uInstitute.posts },
        postStatus: "Anyone",
      });
      post.forEach(async (ele) => {
        user.userPosts.push(ele);
      });
    }
    if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
    } else {
      uInstitute.userFollowersList.push(user._id);
      uInstitute.followersCount += 1;
      user.userInstituteFollowing.push(uInstitute._id);
      user.followingUICount += 1;
      await uInstitute.save();
      const posts = await Post.find({ author: `${uInstitute._id}` });
      posts.forEach(async (ele) => {
        ele.authorFollowersCount = uInstitute.followersCount;
        await ele.save();
      });
    }
    await user.save();
  } catch (e) {
    console.log(e);
  }
};
