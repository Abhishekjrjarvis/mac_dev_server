const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");
const Post = require("../models/Post");
const { send_global_announcement_notification_query } = require("../Feed/socialFeed");

exports.announcement_feed_query = async (one_ins, announce) => {
  try {
    const institute = await InstituteAdmin.findById({ _id: one_ins })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" })
      .populate({ path: "joinedUserList" });
    const post = new Post({});
    post.imageId = "1";
    institute.posts.push(post?._id);
    institute.postCount += 1;
    post.author = institute?._id;
    post.authorName = institute?.insName;
    post.authorUserName = institute?.name;
    post.authorPhotoId = institute?.photoId;
    post.authorProfilePhoto = institute?.insProfilePhoto;
    post.authorOneLine = institute?.one_line_about;
    post.authorFollowersCount = institute?.followersCount;
    post.isInstitute = "institute";
    post.postType = "Announcement";
    post.new_announcement = announce?._id;
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([post.save(), institute.save()]);
    //Feed Insertion Process
    if (institute.isUniversal === "Not Assigned") {
      if (institute.followers.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.followers.forEach(async (ele) => {
            if (ele.posts.includes(post._id)) {
            } else {
              ele.posts.push(post._id);
              await ele.save();
            }
          });
        } else {
        }
      }
      if (institute.userFollowersList.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.userFollowersList.forEach(async (ele) => {
            if (ele.userPosts.includes(post._id)) {
            } else {
              ele.userPosts.push(post._id);
              await ele.save();
            }
          });
        } else {
          if (institute.joinedUserList.length >= 1) {
            institute.joinedUserList.forEach(async (ele) => {
              if (ele.userPosts.includes(post._id)) {
              } else {
                ele.userPosts.push(post._id);
                await ele.save();
              }
            });
          }
        }
      }
    } else if (institute.isUniversal === "Universal") {
      const all = await InstituteAdmin.find({ status: "Approved" });
      const user = await User.find({ userStatus: "Approved" });
      if (post.postStatus === "Anyone") {
        all.forEach(async (el) => {
          if (el._id !== institute._id) {
            el.posts.push(post._id);
            await el.save();
          }
        });
        user.forEach(async (el) => {
          el.userPosts.push(post._id);
          await el.save();
        });
      }
      if (post.postStatus === "Private") {
        all.forEach(async (el) => {
          if (el._id !== institute._id) {
            el.posts.push(post._id);
            await el.save();
          }
        });
      }
    }
    await send_global_announcement_notification_query(institute, announce)
  } catch (e) {
    console.log(e);
  }
};
