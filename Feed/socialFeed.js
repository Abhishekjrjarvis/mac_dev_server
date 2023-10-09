const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");
const Post = require("../models/Post");
const HashTag = require("../models/HashTag/hashTag");

exports.execute_ins_social_feed_query = async (
  institute,
  post,
  taggedPeople
) => {
  try {
    if (institute.isUniversal === "Not Assigned") {
      if (institute?.followers?.length >= 1) {
        if (post.postStatus === "Anyone") {
          for (var ele of institute?.followers) {
            ele.posts.push(post?._id);
            await ele.save();
          }
        } else {
        }
      }
      if (institute.userFollowersList.length >= 1) {
        if (post.postStatus === "Anyone") {
          for (var ele of institute?.userFollowersList) {
            ele.userPosts.push(post?._id);
            await ele.save();
          }
        } else {
          if (institute.joinedUserList.length >= 1) {
            for (var ele of institute?.joinedUserList) {
              ele.userPosts.push(post?._id);
              await ele.save();
            }
          }
        }
      }
    } else if (institute.isUniversal === "Universal") {
      const all = await InstituteAdmin.find({ status: "Approved" });
      const user = await User.find({ userStatus: "Approved" });
      if (post.postStatus === "Anyone") {
        for (var el of all) {
          if (el?._id !== institute?._id) {
            el.posts.push(post?._id);
            await el.save();
          }
        }
        for (var el of user) {
          el.userPosts.push(post?._id);
          await el.save();
        }
      }
      if (post.postStatus === "Private") {
        for (var el of all) {
          if (el?._id !== institute?._id) {
            el.posts.push(post?._id);
            await el.save();
          }
        }
      }
    }
    if (Array.isArray(taggedPeople)) {
      if (post?.tagPeople?.length) {
        for (let instit of taggedPeople) {
          const institTag = await InstituteAdmin.findById(instit.tagId)
            .populate({ path: "followers" })
            .populate({ path: "userFollowersList" });
          if (institTag?.posts.includes(post._id)) {
          } else {
            institTag.posts?.push(post._id);
          }
          institTag.tag_post?.push(post._id);
          if (post.postStatus === "Anyone") {
            for (var ele of institTag?.followers) {
              if (ele?.posts?.includes(post?._id)) {
              } else {
                ele.posts.push(post?._id);
                await ele.save();
              }
            }
            for (var ele of institTag?.userFollowersList) {
              if (ele?.userPosts?.includes(post?._id)) {
              } else {
                ele.userPosts.push(post?._id);
                await ele.save();
              }
            }
          }
          await institTag.save();
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.execute_ins_social_feed_question_query = async (
  institute,
  post,
  hash
) => {
  try {
    if (institute.isUniversal === "Not Assigned") {
      if (institute?.followers?.length >= 1) {
        if (post.postStatus === "Anyone") {
          for (var ele of institute?.followers) {
            ele.posts.push(post?._id);
            await ele.save();
          }
        } else {
        }
      }
      if (institute.userFollowersList.length >= 1) {
        if (post.postStatus === "Anyone") {
          for (var ele of institute?.userFollowersList) {
            ele.userPosts.push(post?._id);
            await ele.save();
          }
        } else {
          if (institute.joinedUserList.length >= 1) {
            for (var ele of institute?.joinedUserList) {
              ele.userPosts.push(post?._id);
              await ele.save();
            }
          }
        }
      }
    } else if (institute.isUniversal === "Universal") {
      const all = await InstituteAdmin.find({ status: "Approved" });
      const user = await User.find({ userStatus: "Approved" });
      if (post.postStatus === "Anyone") {
        for (var el of all) {
          if (el?._id !== institute?._id) {
            el.posts.push(post?._id);
            await el.save();
          }
        }
        for (var el of user) {
          el.userPosts.push(post?._id);
          await el.save();
        }
      }
    }
    if (hash?.length > 0) {
      for (var ele of hash) {
        const hash = await HashTag.findById({ _id: `${ele}` }).select(
          "hashtag_follower"
        );
        const users = await User.find({
          _id: { $in: hash?.hashtag_follower },
        });
        for (var ref of users) {
          if (ref?.userPosts?.includes(post?._id)) {
          } else {
            ref.userPosts.push(post?._id);
          }
          await ref.save();
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
