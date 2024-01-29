const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");
const Post = require("../models/Post");
const HashTag = require("../models/HashTag/hashTag");
const Notification = require("../models/notification");
const invokeSpecificRegister = require("../Firebase/specific");

exports.execute_user_social_feed_query = async (
  user,
  post,
  taggedPeople
) => {
  try {
    if (user?.userFollowers.length >= 1) {
        if (post.postStatus === "Anyone") {
            for(var val of user?.userFollowers){
                post.post_arr.push(val)
            }
        } else {
        }
      }
      if (user?.userCircle.length >= 1) {
        for(var val of user.userCircle){
            post.post_arr.push(val)
        }
      }
      if (Array.isArray(taggedPeople)) {
        if (post?.tagPeople?.length) {
          for (let instit of taggedPeople) {
            if (instit.tagType === "User") {
              const userTag = await User.findById(instit.tagId)
                // .populate({ path: "userFollowers" })
                // .populate({ path: "userCircle" });
              userTag.tag_post?.push(post._id);
              post.post_arr.push(userTag?._id)
              if (post.postStatus === "Anyone") {
                for(var val of userTag?.userFollowers){
                    post.post_arr.push(val)
                }
                for(var val of userTag?.userCircle){
                    post.post_arr.push(val)
                }
              }
              await userTag.save();
            } else {
              const institTag = await InstituteAdmin.findById(instit.tagId);
              post.post_arr.push(institTag?._id)
              institTag.tag_post?.push(post._id);
              await institTag.save();
            }
          }
        }
      }
      await post.save()
  } catch (e) {
    console.log(e);
  }
};

exports.execute_user_social_feed_question_query = async (
  user,
  post,
  hash
) => {
  try {
    if (user?.userFollowers.length >= 1) {
        for(var val of user?.userFollowers){
            post.post_arr.push(val)
        }
      }
      if (user?.userCircle.length >= 1) {
        for(var val of user?.userCircle){
            post.post_arr.push(val)
        }
      }
      if (hash && hash?.length > 0) {
        for(var ele of hash){
            const hash = await HashTag.findById({ _id: `${ele}` }).select(
                "hashtag_follower"
              );
              const users = await User.find({ _id: { $in: hash?.hashtag_follower } });
              for(var val of users){
                post.post_arr.push(val)
            }
        }
      }
    await post.save()
  } catch (e) {
    console.log(e);
  }
};

exports.send_user_global_notification_query = async (user, post, type) => {
  try {
    if (post?.postType === "Question") {
      for (var ref of user?.userFollowers) {
        var notify = new Notification({});
        notify.notifyContent = `${user?.username} has a new question for you`;
        notify.notifySender = user?._id;
        notify.notifyReceiever = ref._id;
        notify.notifyCategory = "Post Feed";
        ref.uNotify.push(notify._id);
        notify.notifyByPhoto = user._id;
        invokeSpecificRegister(
          "Specific Notification",
          notify?.notifyContent,
          user?.username,
          ref?._id,
          ref?.deviceToken
        );
        await Promise.all([notify.save(), ref.save()]);
      } 
    }
    else if (post?.postType === "Poll") {
      for (var ref of user?.userFollowers) {
        var notify = new Notification({});
        notify.notifyContent = `New quiz from ${user?.username}, give your valuable vote`;
        notify.notifySender = user?._id;
        notify.notifyReceiever = ref._id;
        notify.notifyCategory = "Post Feed";
        ref.uNotify.push(notify._id);
        notify.notifyByPhoto = user._id;
        invokeSpecificRegister(
          "Specific Notification",
          notify?.notifyContent,
          user?.username,
          ref?._id,
          ref?.deviceToken
        );
        await Promise.all([notify.save(), ref.save()]);
      }
    }
    else if (post?.postType === "Post") {
      for (var ref of user?.userFollowers) {
        var notify = new Notification({});
        notify.notifyContent = `${user?.username} has new info to share, know what it is`;
        notify.notifySender = user?._id;
        notify.notifyReceiever = ref._id;
        notify.notifyCategory = "Post Feed";
        ref.uNotify.push(notify._id);
        notify.notifyByPhoto = user._id;
        invokeSpecificRegister(
          "Specific Notification",
          notify?.notifyContent,
          user?.username,
          ref?._id,
          ref?.deviceToken
        );
        await Promise.all([notify.save(), ref.save()]);
      }
    }
    else {
      
    }
  }
  catch (e) {
    console.log(e)
  }
}
