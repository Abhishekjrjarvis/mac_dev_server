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
      // console.log("posted by no universal")
      if (post?.postStatus === "Anyone") {
        for(var val of institute?.followers){
          post.post_arr.push(val)
        }
        for(var val of institute?.userFollowersList){
          post.post_arr.push(val)
        }
      }
      else{
        for(var val of institute?.joinedUserList){
          post.post_arr.push(val)
        }
      }
    } else if (institute.isUniversal === "Universal") {
      // console.log("posted by universal")
      const all = await InstituteAdmin.find({ $and: [{ status: "Approved" }, { isUniversal: "Not Assigned" }] });
      const user = await User.find({ userStatus: "Approved" });
      if (post.postStatus === "Anyone") {
        for(var val of all){
            for(var ele of val?.followers){
              console.log("FO")
              post.post_arr.push(ele)
            }
            for(var ele of val?.userFollowersList){
              console.log("UFO")
              post.post_arr.push(ele)
            }
        }
        for(var val of user){
          console.log("USER")
          post.post_arr.push(val?._id)
        }
      }
      else{
        for(var val of all){
          for(var ele of val?.joinedUserList){
            post.post_arr.push(ele)
          }
        }
      }
      // console.log("end posted by universal")
    }
    if (Array.isArray(taggedPeople)) {
      if (post?.tagPeople?.length) {
        for (let instit of taggedPeople) {
          const institTag = await InstituteAdmin.findById(instit.tagId)
            // .populate({ path: "followers" })
            // .populate({ path: "userFollowersList" });
          if (institTag?.posts.includes(post._id)) {
          } else {
            institTag.posts?.push(post._id);
          }
          institTag.tag_post?.push(post._id);
          if (post.postStatus === "Anyone") {
            for (var ele of institTag?.followers) {
              post.post_arr.push(ele)
            }
            for (var ele of institTag?.userFollowersList) {
              post.post_arr.push(ele)
            }
          }
          await institTag.save();
        }
      }
    }
    await post.save()
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
      if (post?.postStatus === "Anyone") {
        for(var val of institute?.followers){
          post.post_arr.push(val)
        }
        for(var val of institute?.userFollowersList){
          post.post_arr.push(val)
        }
      }
      else{
        for(var val of institute?.joinedUserList){
          post.post_arr.push(val)
        }
      }
    } else if (institute.isUniversal === "Universal") {
      const all = await InstituteAdmin.find({ $and: [{ status: "Approved" }, { isUniversal: "Not Assigned" }] });
      const user = await User.find({ userStatus: "Approved" });
      if (post.postStatus === "Anyone") {
        for(var val of all){
            for(var ele of val?.followers){
              console.log("FO")
              post.post_arr.push(ele)
            }
            for(var ele of val?.userFollowersList){
              console.log("UFO")
              post.post_arr.push(ele)
            }
        }
        for(var val of user){
          console.log("USER")
          post.post_arr.push(val?._id)
        }
      }
      else{
        for(var val of all){
          for(var ele of val?.joinedUserList){
            post.post_arr.push(ele)
          }
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
        await User.updateMany(
          { _id: { $in: users } },
          { $push: { userPosts: post?._id } }
        );
      }
    }
    await post.save()
  } catch (e) {
    console.log(e);
  }
};
