const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Comment = require("../../../models/Comment");
const InstituteAdmin = require("../../../models/InstituteAdmin");
const ReplyComment = require("../../../models/ReplyComment/ReplyComment");
const Poll = require("../../../models/Question/Poll");
const Notification = require("../../../models/notification");
const {
  uploadPostImageFile,
  uploadVideo,
} = require("../../../S3Configuration");
const fs = require("fs");
const util = require("util");
// const { suffle_search_list } = require("../../../Utilities/randomFunction");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../../Firebase/firebase");

exports.postWithText = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .populate({ path: "userFollowers" })
      .populate({ path: "userCircle" });
    const post = new Post({ ...req.body });
    if (Array.isArray(req.body?.people)) {
      for (let val of req.body?.people) {
        post.tagPeople.push({
          tagId: val.tagId,
          tagUserName: val.tagUserName,
          tagType: val.tagType,
        });
      }
    }
    post.imageId = "1";
    user.userPosts.push(post._id);
    user.postCount += 1;
    post.author = user._id;
    post.authorName = user.userLegalName;
    post.authorUserName = user.username;
    post.authorPhotoId = user.photoId;
    post.authorProfilePhoto = user.profilePhoto;
    post.authorOneLine = user.one_line_about;
    post.authorFollowersCount = user.followerCount;
    post.isUser = "user";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([user.save(), post.save()]);
    res.status(201).send({ message: "post is create", post });
    if (user.userFollowers.length >= 1) {
      if (post.postStatus === "Anyone") {
        user.userFollowers.forEach(async (ele) => {
          if(ele.userPosts.includes(post._id)){}
          else{ 
            ele.userPosts.push(post._id);
            await ele.save();
          }
        });
      } else {
      }
    }
    if (user.userCircle.length >= 1) {
      user.userCircle.forEach(async (ele) => {
        if(ele.userPosts.includes(post._id)){}
        else{
          ele.userPosts.push(post._id);
          await ele.save();
        }
      });
    }
    if (Array.isArray(req.body?.people)) {
      if (post?.tagPeople?.length) {
        for (let instit of req.body?.people) {
          if (instit.tagType === "User") {
            const userTag = await User.findById(instit.tagId)
              .populate({ path: "userFollowers" })
              .populate({ path: "userCircle" });
            userTag.tag_post?.push(post._id);
            if (userTag?.userPosts.includes(post._id)) {
            } else {
              userTag.userPosts?.push(post._id);
            }
            if (post.postStatus === "Anyone") {
              userTag?.userFollowers?.forEach(async (ele) => {
                if (ele?.userPosts?.includes(post._id)) {
                } else {
                  ele.userPosts.push(post._id);
                  await ele.save();
                }
              });
              userTag?.userCircle?.forEach(async (ele) => {
                if (ele?.userPosts?.includes(post._id)) {
                } else {
                  ele.userPosts.push(post._id);
                  await ele.save();
                }
              });
            }
            await userTag.save();
          } else {
            const institTag = await InstituteAdmin.findById(instit.tagId);
            if (institTag?.posts.includes(post._id)) {
            } else {
              institTag.posts?.push(post._id);
            }
            institTag.tag_post?.push(post._id);
            await institTag.save();
          }
        }
      }
    }
  } catch {}
};

exports.postWithImage = async (req, res) => {
  try {
    const { id } = req.params;
    const post = new Post({ ...req.body });
    const user = await User.findById({ _id: id })
      .populate({ path: "userFollowers" })
      .populate({ path: "userCircle" });
    const taggedPeople = req.body?.people ? JSON.parse(req.body?.people) : "";

    if (Array.isArray(taggedPeople)) {
      for (let val of taggedPeople) {
        post.tagPeople.push({
          tagId: val.tagId,
          tagUserName: val.tagUserName,
          tagType: val.tagType,
        });
      }
    }
    for (let file of req.files) {
      const results = await uploadPostImageFile(file);
      post.postImage.push(results.Key);
      await unlinkFile(file.path);
    }
    post.imageId = "0";
    user.userPosts.push(post._id);
    user.postCount += 1;
    post.author = user._id;
    post.authorName = user.userLegalName;
    post.authorUserName = user.username;
    post.authorPhotoId = user.photoId;
    post.authorProfilePhoto = user.profilePhoto;
    post.authorOneLine = user.one_line_about;
    post.authorFollowersCount = user.followerCount;
    post.isUser = "user";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([user.save(), post.save()]);
    res.status(201).send({ message: "post is create", post });
    if (user.userFollowers.length >= 1) {
      if (post.postStatus === "Anyone") {
        user.userFollowers.forEach(async (ele) => {
          if(ele.userPosts.includes(post._id)){}
          else{
            ele.userPosts.push(post._id);
            await ele.save();
          }
        });
      } else {
      }
    }
    if (user.userCircle.length >= 1) {
      user.userCircle.forEach(async (ele) => {
        if(ele.userPosts.includes(post._id)){}
        else{
          ele.userPosts.push(post._id);
          await ele.save();
        }
      });
    }
    if (Array.isArray(taggedPeople)) {
      if (post?.tagPeople?.length) {
        for (let instit of taggedPeople) {
          if (instit.tagType === "User") {
            const userTag = await User.findById(instit.tagId)
              .populate({ path: "userFollowers" })
              .populate({ path: "userCircle" });
            if (userTag?.userPosts.includes(post._id)) {
            } else {
              userTag.userPosts?.push(post._id);
            }
            userTag.tag_post?.push(post._id);
            if (post.postStatus === "Anyone") {
              userTag?.userFollowers?.forEach(async (ele) => {
                if (ele?.userPosts?.includes(post._id)) {
                } else {
                  ele.userPosts.push(post._id);
                  await ele.save();
                }
              });
              userTag?.userCircle?.forEach(async (ele) => {
                if (ele?.userPosts?.includes(post._id)) {
                } else {
                  ele.userPosts.push(post._id);
                  await ele.save();
                }
              });
            }
            await userTag.save();
          } else {
            const institTag = await InstituteAdmin.findById(instit.tagId);
            if (institTag?.posts.includes(post._id)) {
            } else {
              institTag.posts?.push(post._id);
            }
            institTag.tag_post?.push(post._id);
            await institTag.save();
          }
        }
      }
    }
  } catch {}
};

exports.postWithVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .populate({ path: "userFollowers" })
      .populate({ path: "userCircle" });
    const post = new Post({ ...req.body });
    const taggedPeople = req.body?.people ? JSON.parse(req.body?.people) : "";

    if (Array.isArray(taggedPeople)) {
      for (let val of taggedPeople) {
        post.tagPeople.push({
          tagId: val.tagId,
          tagUserName: val.tagUserName,
          tagType: val.tagType,
        });
      }
    }
    const file = req.file;
    const results = await uploadVideo(file);
    post.postVideo = results.Key;
    post.imageId = "1";
    user.userPosts.push(post._id);
    user.postCount += 1;
    post.author = user._id;
    post.authorName = user.userLegalName;
    post.authorUserName = user.username;
    post.authorPhotoId = user.photoId;
    post.authorProfilePhoto = user.profilePhoto;
    post.authorOneLine = user.one_line_about;
    post.authorFollowersCount = user.followerCount;
    post.isUser = "user";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([user.save(), post.save()]);
    await unlinkFile(file.path);
    res.status(201).send({ message: "post created", post });
    if (user.userFollowers.length >= 1) {
      if (post.postStatus === "Anyone") {
        user.userFollowers.forEach(async (ele) => {
          if(ele.userPosts.includes(post._id)){}
          else{
            ele.userPosts.push(post._id);
            await ele.save();
          }
        });
      } else {
      }
    }
    if (user.userCircle.length >= 1) {
      user.userCircle.forEach(async (ele) => {
        if(ele.userPosts.includes(post._id)){}
        else{
          ele.userPosts.push(post._id);
          await ele.save();
        }
      });
    }
    if (Array.isArray(taggedPeople)) {
      if (post?.tagPeople?.length) {
        for (let instit of taggedPeople) {
          if (instit.tagType === "User") {
            const userTag = await User.findById(instit.tagId)
              .populate({ path: "userFollowers" })
              .populate({ path: "userCircle" });
            if (userTag?.userPosts.includes(post._id)) {
            } else {
              userTag.userPosts?.push(post._id);
            }
            userTag.tag_post?.push(post._id);
            if (post.postStatus === "Anyone") {
              userTag?.userFollowers?.forEach(async (ele) => {
                if (ele?.userPosts?.includes(post._id)) {
                } else {
                  ele.userPosts.push(post._id);
                  await ele.save();
                }
              });
              userTag?.userCircle?.forEach(async (ele) => {
                if (ele?.userPosts?.includes(post._id)) {
                } else {
                  ele.userPosts.push(post._id);
                  await ele.save();
                }
              });
            }
            await userTag.save();
          } else {
            const institTag = await InstituteAdmin.findById(instit.tagId);
            if (institTag?.posts.includes(post._id)) {
            } else {
              institTag.posts?.push(post._id);
            }
            institTag.tag_post?.push(post._id);
            await institTag.save();
          }
        }
      }
    }
  } catch {}
};

exports.postWithVsibilityUpdate = async (req, res) => {
  try {
    const { pid } = req.params;
    const { postStatus } = req.body;
    const post = await Post.findById({ _id: pid });
    post.postStatus = postStatus;
    await post.save();
    res.status(200).send({ message: "visibility change" });
    //
    var post_visible = await Post.findById({ _id: pid }).select("postStatus");
    var user = await User.findById({ _id: `${post.author}` })
      .select("id")
      .populate({ path: "userFollowers", select: "userPosts" })
      .populate({ path: "userCircle", select: "userPosts" });
    if (user.userFollowers.length >= 1) {
      if (post_visible.postStatus === "Anyone") {
        user.userFollowers.forEach(async (ele) => {
          if (ele?.userPosts?.includes(`${post_visible._id}`)) {
          } else {
            ele.userPosts.push(post_visible._id);
            await ele.save();
          }
        });
      } else if (post_visible.postStatus === "Private") {
        user.userFollowers.forEach(async (ele) => {
          if (ele?.userPosts?.includes(`${post_visible._id}`)) {
            ele.userPosts.pull(post_visible._id);
            await ele.save();
          } else {
          }
        });
      }
    }
    if (user.userCircle.length >= 1) {
      user.userCircle.forEach(async (ele) => {
        if (ele?.userPosts?.includes(`${post_visible._id}`)) {
        } else {
          ele.userPosts.push(post_visible._id);
          await ele.save();
        }
      });
    }
    //
  } catch (e) {
    console.log(e);
  }
};

exports.postWithDeleted = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const user = await User.findById({ _id: id }).select(
      "postCount poll_Count"
    );
    const post = await Post.findById({ _id: pid })
      .select("postType")
      .populate({ path: "poll_query", select: "id" });
    await User.findByIdAndUpdate(id, { $pull: { userPosts: pid } });
    await User.findByIdAndUpdate(id, { $pull: { user_saved_post: pid } });
    await User.findByIdAndUpdate(id, { $pull: { tag_post: pid } });
    if (user.postCount >= 1) {
      user.postCount -= 1;
    }
    if (post && post.postType === "Poll" && post.poll_query !== "") {
      await Poll.findByIdAndDelete(post.poll_query?._id);
      if (user.poll_Count >= 1) {
        user.poll_Count -= 1;
      }
      // post.poll_query = "";
      // await post.save();
    }
    await Post.findByIdAndDelete({ _id: pid });
    await user.save();
    res.status(200).send({ message: "Deleted Operation Completed" });
    //
    const deleted_user_post = await User.findById({ _id: user?._id })
      .select("id")
      .populate({
        path: "userFollowers",
        select: "userPosts user_saved_post tag_post",
      })
      .populate({
        path: "userCircle",
        select: "userPosts user_saved_post tag_post",
      });
    deleted_user_post?.userFollowers?.forEach(async (del_user) => {
      if (del_user?.userPosts?.includes(`${post?._id}`)) {
        del_user?.userPosts?.pull(post._id);
        await del_user.save();
      }
      if (del_user?.user_saved_post?.includes(`${post?._id}`)) {
        del_user?.user_saved_post?.pull(post._id);
        await del_user.save();
      }
      if (del_user?.tag_post?.includes(`${post?._id}`)) {
        del_user?.tag_post?.pull(post._id);
        await del_user.save();
      }
    });
    deleted_user_post?.userCircle?.forEach(async (del_user) => {
      if (del_user?.userPosts?.includes(`${post?._id}`)) {
        del_user?.userPosts?.pull(post._id);
        await del_user.save();
      }
      if (del_user?.user_saved_post?.includes(`${post?._id}`)) {
        del_user?.user_saved_post?.pull(post._id);
        await del_user.save();
      }
      if (del_user?.tag_post?.includes(`${post?._id}`)) {
        del_user?.tag_post?.pull(post._id);
        await del_user.save();
      }
    });
    //
  } catch (e) {
    console.log(e);
  }
};

exports.postLike = async (req, res) => {
  try {
    const { pid } = req.params;
    var post = await Post.findById({ _id: pid });
    var user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    if (user_session) {
      if (
        post.endUserLike.length >= 1 &&
        post.endUserLike.includes(String(user_session))
      ) {
        post.endUserLike.pull(user_session);
        if (post.likeCount >= 1) {
          post.likeCount -= 1;
        }
        await post.save();
        res
          .status(200)
          .send({ message: "Removed from Likes", likeCount: post.likeCount });
      } else {
        post.endUserLike.push(user_session);
        post.likeCount += 1;
        await post.save();
        res
          .status(200)
          .send({ message: "Added To Likes", likeCount: post.likeCount });
      }
    } else {
      res.status(401).send();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.postSave = async (req, res) => {
  try {
    const { pid } = req.params;
    const user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    if (user_session) {
      const user = await User.findById({ _id: `${user_session}` });
      const post = await Post.findById({ _id: pid });
      if (
        post.endUserSave.length >= 1 &&
        post.endUserSave.includes(user_session)
      ) {
        post.endUserSave.pull(user_session);
        user.user_saved_post.pull(post._id);
        await Promise.all([post.save(), user.save()]);
        res.status(200).send({ message: "Remove To Favourites" });
      } else {
        post.endUserSave.push(user_session);
        user.user_saved_post.push(post._id);
        await Promise.all([post.save(), user.save()]);
        res.status(200).send({ message: "Added To Favourites" });
      }
    } else {
      res.status(401).send({ message: "Unauthorized access" });
    }
  } catch {}
};

exports.postComment = async (req, res) => {
  try {
    const { id } = req.params;
    var post = await Post.findById({ _id: id });
    const comment = new Comment({ ...req.body });
    if (req.tokenData && req.tokenData.insId) {
      const institute = await InstituteAdmin.findById({
        _id: req.tokenData.insId,
      });
      comment.author = institute._id;
      comment.authorName = institute.insName;
      comment.authorUserName = institute.name;
      comment.authorPhotoId = institute.photoId;
      comment.authorProfilePhoto = institute.insProfilePhoto;
      comment.authorOneLine = institute.one_line_about;
    } else if (req.tokenData && req.tokenData.userId) {
      var user = await User.findById({ _id: req.tokenData.userId });
      comment.author = user._id;
      comment.authorName = user.userLegalName;
      comment.authorUserName = user.username;
      comment.authorPhotoId = user.photoId;
      comment.authorProfilePhoto = user.profilePhoto;
      comment.authorOneLine = user.one_line_about;
    } else {
      res.status(401).send({ message: "Unauthorized" });
    }
    post.comment.push(comment._id);
    post.commentCount += 1;
    comment.post = post._id;
    await Promise.all([post.save(), comment.save()]);
    var notify = new Notification({});
    var author_user = await User.findOne({ _id: `${post?.author}` });
    var author_ins = await InstituteAdmin.findOne({_id: `${post.author}`})
    if(author_user){
    if (`${comment.author}` === `${author_user?._id}`) {
      notify.notifyContent = `you shared a new comment`;
    } else {
      notify.notifyContent = `${comment.authorName} commented on your post`;
    }
    notify.notifySender = req.tokenData?.userId
      ? req.tokenData.userId
      : req.tokenData?.insId
      ? req.tokenData.insId
      : "";
    notify.notifyReceiever = author_user?._id;
    author_user?.uNotify.push(notify._id);
    notify.user = author_user?._id;
    if (req?.tokenData?.userId) {
      notify.notifyByPhoto = req?.tokenData?.userId;
    } else if (req?.tokenData?.insId) {
      notify.notifyByInsPhoto = req?.tokenData?.insId;
    }
      await Promise.all([notify.save(), author_user.save()]);
      if (author_user?.user_comment_notify === "Enable") {
        invokeFirebaseNotification(
          "Comment",
          notify,
          "New Comment",
          comment.author,
          author_user.deviceToken,
          post._id
        );
      }
    }
    else if(author_ins){
      if (`${comment.author}` === `${author_ins?._id}`) {
        notify.notifyContent = `you shared a new comment`;
      } else {
        notify.notifyContent = `${comment.authorName} commented on your post`;
      }
      notify.notifySender = req.tokenData?.userId
        ? req.tokenData.userId
        : req.tokenData?.insId
        ? req.tokenData.insId
        : "";
      notify.notifyReceiever = author_ins?._id;
      author_ins.iNotify.push(notify._id);
      notify.institute = author_ins?._id;
      if (req?.tokenData?.userId) {
        notify.notifyByPhoto = req?.tokenData?.userId;
      } else if (req?.tokenData?.insId) {
        notify.notifyByInsPhoto = req?.tokenData?.insId;
      }
      await Promise.all([notify.save(), author_ins.save()]);
        invokeFirebaseNotification(
          "Comment",
          notify,
          "New Comment",
          comment.author,
          author_ins.deviceToken,
          post._id
        );
    }
    res.status(201).send({ message: "comment created", comment });
  } catch (e) {
    console.log("UCN", e);
  }
};

exports.retrieveAllUserPosts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const p_types = req.query.p_type ? req.query.p_type : "";
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(id).select(
      "id ageRestrict userPosts userInstituteFollowing"
    );
    // .populate({
    //   path: "userPosts",
    // });
    if (user && user.userPosts.length >= 1) {
      if (p_types !== "") {
        var post = await Post.find({
          $and: [{ _id: { $in: user.userPosts } }, { postType: p_types }],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postQuestion isHelpful needCount authorFollowersCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
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
          })
          .populate({
            path: "new_application",
            select:
              "applicationSeats applicationStartDate applicationEndDate applicationAbout admissionFee applicationName",
            populate: {
              path: "applicationDepartment",
              select: "dName",
            },
          });
      } else {
        //
        if (user.ageRestrict === "Yes") {
          var post = await Post.find({
            $and: [{ author: { $in: user.userInstituteFollowing } }],
          })
            .sort("-createdAt")
            .limit(limit)
            .skip(skip)
            .select(
              "postTitle postText postQuestion isHelpful needCount authorOneLine authorFollowersCount needUser isNeed answerCount tagPeople isUser isInstitute answerUpVoteCount postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postType"
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
            })
            .populate({
              path: "new_application",
              select:
                "applicationSeats applicationStartDate applicationEndDate applicationAbout admissionFee applicationName",
              populate: {
                path: "applicationDepartment",
                select: "dName",
              },
            });
        }
        //
        else {
          var post = await Post.find({
            $and: [{ _id: { $in: user.userPosts } }],
          })
            .sort("-createdAt")
            .limit(limit)
            .skip(skip)
            .select(
              "postTitle postText postQuestion isHelpful needCount authorOneLine authorFollowersCount needUser isNeed answerCount tagPeople isUser isInstitute answerUpVoteCount postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postType"
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
            })
            .populate({
              path: "new_application",
              select:
                "applicationSeats applicationStartDate applicationEndDate applicationAbout admissionFee applicationName",
              populate: {
                path: "applicationDepartment",
                select: "dName",
              },
            });
        }
      }
      const postCount = await Post.find({ _id: { $in: user.userPosts } });
      if (page * limit >= postCount.length) {
      } else {
        var totalPage = page + 1;
      }
      res.status(200).send({
        message: "Success",
        post,
        postCount: postCount.length,
        totalPage: totalPage,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllUserProfilePosts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const p_types = req.query.p_type ? req.query.p_type : "";
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(id).select("id").populate({
      path: "userPosts",
    });
    if (user && user.userPosts.length >= 1) {
      if (p_types !== "") {
        var post = await Post.find({ author: id, postType: p_types })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postDescription isHelpful authorFollowersCount authorOneLine needCount needUser isNeed endUserSave tagPeople isUser isInstitute createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postQuestion answerCount answerUpVoteCount trend_category postType"
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
          })
          .populate({
            path: "new_application",
            select:
              "applicationSeats applicationStartDate applicationEndDate applicationAbout admissionFee applicationName",
            populate: {
              path: "applicationDepartment",
              select: "dName",
            },
          });
      } else {
        var post = await Post.find({ author: id })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postDescription isHelpful authorFollowersCount authorOneLine needCount needUser isNeed endUserSave tagPeople isUser isInstitute createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postQuestion answerCount answerUpVoteCount trend_category postType"
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
          })
          .populate({
            path: "new_application",
            select:
              "applicationSeats applicationStartDate applicationEndDate applicationAbout admissionFee applicationName",
            populate: {
              path: "applicationDepartment",
              select: "dName",
            },
          });
      }
      const postCount = await Post.find({ _id: { $in: user.userPosts } });
      if (page * limit >= postCount.length) {
      } else {
        var totalPage = page + 1;
      }
      res.status(200).send({
        message: "Success",
        post,
        postCount: postCount.length,
        totalPage: totalPage,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

//Check this route for get all child comment that is reply
exports.getComment = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const pid = req.params.id;
    const skip = (page - 1) * limit;
    const insPost = await Post.findById(pid);
    const comment = await Comment.find({
      _id: { $in: insPost.comment },
    })
      .sort("createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "commentDescription createdAt allLikeCount parentCommentLike allChildCommentCount authorOneLine author authorName authorUserName authorPhotoId authorProfilePhoto"
      );
    // .populate({
    //   path: "users",
    //   select: "userLegalName photoId profilePhoto ",
    // });
    res.status(200).send({ message: "Sucess", comment });
  } catch (e) {
    console.log(e);
  }
};

//Check this route for get all child comment that is reply
exports.getCommentChild = async (req, res) => {
  try {
    const { pcid } = req.params;
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const comment = await Comment.findById(pcid)
      .populate({
        path: "childComment",
        select:
          "repliedComment createdAt author authorName authorUserName authorOneLine authorPhotoId authorProfilePhoto",
      })
      .select("allChildCommentCount allLikeCount")
      .lean()
      .exec();
    const userPagination = (circleFilter) => {
      const endIndex = dropItem + itemPerPage;
      const childComment = circleFilter.slice(dropItem, endIndex);
      return childComment;
    };
    if (!comment.childComment.length) {
      res.status(200).send({ message: "no any child", replyComment: [] });
    }
    const replyComment = userPagination(comment.childComment);
    res.status(200).send({ replyComment });
  } catch {}
};

exports.postCommentChild = async (req, res) => {
  try {
    const { pcid } = req.params;
    const { comment, uid } = req.body;
    if (req.tokenData && req.tokenData.userId) {
      const users = await User.findById({ _id: req.tokenData.userId });
      const childComment = new ReplyComment({
        repliedComment: comment,
        author: users._id,
        authorName: users.userLegalName,
        authorUserName: users.username,
        authorPhotoId: users.photoId,
        authorProfilePhoto: users.profilePhoto,
        authorOneLine: users.one_line_about,
        parentComment: pcid,
      });
      const parentComment = await Comment.findById(pcid);
      parentComment.childComment.unshift(childComment._id);
      parentComment.allChildCommentCount += 1;
      await Promise.all([parentComment.save(), childComment.save()]);
      const user = await User.findById(users._id).select(
        "photoId profilePhoto username userLegalName"
      );
      const childReplyComment = {
        _id: childComment._id,
        repliedComment: childComment.repliedComment,
        createdAt: childComment.createdAt,
        author: user._id,
        authorName: user.userLegalName,
        authorUserName: user.username,
        authorPhotoId: user.photoId,
        authorProfilePhoto: user.profilePhoto,
        authorOneLine: user.one_line_about,
      };
      res.status(201).send({
        childReplyComment,
        allChildCommentCount: parentComment.allChildCommentCount,
      });
    } else {
      res.status(401).send({ message: "Unauthorized" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.likeCommentChild = async (req, res) => {
  try {
    const insCommentId = req.params.cid;
    const id = req.params.id;
    const comment = await Comment.findById(insCommentId);
    if (req.tokenData && req.tokenData.userId) {
      if (!comment.parentCommentLike.includes(id)) {
        comment.parentCommentLike.push(id);
        comment.allLikeCount += 1;
        await comment.save();
        res.status(200).send({
          message: "liked by User",
          allLikeCount: comment.allLikeCount,
        });
      } else {
        comment.parentCommentLike.pull(id);
        if (comment.allLikeCount >= 1) {
          comment.allLikeCount -= 1;
        }
        await comment.save();
        res.status(200).send({
          message: "disliked by user",
          allLikeCount: comment.allLikeCount,
        });
      }
    }
    res.status(401).send();
  } catch (e) {
    console.log(`error ${e}`);
  }
};

//====FOR showing the reaction that means who likes the post

//Check this route for get all child comment that is reply
exports.reactionPost = async (req, res) => {
  const { pid } = req.params;
  const getPage = req.params.page ? parseInt(req.params.page) : 1;
  const itemPerPage = req.params.limit ? parseInt(req.params.limit) : 10;
  const dropItem = (getPage - 1) * itemPerPage;
  const circleUserData = await Post.findById(pid)
    .select("endUserLike")
    .lean()
    .exec();
  if (circleUserData.endUserLike.length) {
    const users = await User.find({ _id: { $in: circleUserData.endUserLike } })
      .limit(itemPerPage)
      .skip(dropItem)
      .select("userLegalName photoId username profilePhoto userBio")
      .lean()
      .exec();
    res.status(200).send({
      reactionList: users,
    });
  } else {
    res.status(204).send();
  }
  // const userPagination = (circleFilter) => {
  //   const endIndex = dropItem + itemPerPage;
  //   const user = circleFilter.slice(dropItem, endIndex);
  //   return user;
  // };
  // const reactionList = circleUserData.userlike
  //   ? userPagination(circleUserData.userlike)
  //   : "";
};

// All users list who has circle with that user tag their post
exports.circleList = async (req, res) => {
  try {
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    // const itemPerPageUser = itemPerPage ? itemPerPage - 5 : 5;
    // const itemPerPageInstitute = itemPerPage ? itemPerPage - 5 : 5;
    const dropItemUser = (getPage - 1) * itemPerPage;
    // const dropItemInstitute = (getPage - 1) * itemPerPageInstitute;
    const tagUser = await User.find({
      $or: [
        { userLegalName: { $regex: req.query.search, $options: "i" } },
        { username: { $regex: req.query.search, $options: "i" } },
      ],
      $and: [
        {
          tag_privacy: { $in: ["Every one", "Circle"] },
        },
      ],
    })
      .select(
        "username userLegalName profilePhoto photoId userCircle tag_privacy"
      )
      .limit(itemPerPage)
      .skip(dropItemUser)
      .lean()
      .exec();
    // const tagInstitute = await InstituteAdmin.find({
    //   $or: [
    //     { insName: { $regex: req.query.search, $options: "i" } },
    //     { name: { $regex: req.query.search, $options: "i" } },
    //   ],
    //   $and: [
    //     {
    //       tag_privacy: { $in: ["Every one", "Joined Users"] },
    //     },
    //   ],
    // })
    // .select("insName insProfilePhoto photoId name joinedUserList tag_privacy")
    // .limit(itemPerPageInstitute)
    // .skip(dropItemInstitute)
    // .lean()
    // .exec();
    // console.log(tagUser);
    // const tagInstituteList = suffle_search_list(tagUser, tagInstitute);
    res.status(200).send({
      tagUserList: tagUser,
      // tagUser,
      // tagInstitute,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllUserSavedPosts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(id).select("id").populate({
      path: "user_saved_post",
    });
    if (user && user.user_saved_post.length >= 1) {
      var post = await Post.find({
        $and: [{ _id: { $in: user.user_saved_post } }],
      })
        // .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select(
          "postTitle postText postQuestion isHelpful needCount authorFollowersCount authorOneLine needUser isNeed answerCount tagPeople isUser isInstitute answerUpVoteCount postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postType"
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
        })
        .populate({
          path: "new_application",
          select:
            "applicationSeats applicationStartDate applicationEndDate applicationAbout admissionFee applicationName",
          populate: {
            path: "applicationDepartment",
            select: "dName",
          },
        });
      const postCount = await Post.find({ _id: { $in: user.user_saved_post } });
      if (page * limit >= postCount.length) {
      } else {
        var totalPage = page + 1;
      }
      res.status(200).send({
        message: "Success",
        post,
        postCount: postCount.length,
        totalPage: totalPage,
      });
    } else {
      res.status(200).send({ message: "No Post Found", post: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllUserTagPosts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(id).select("id").populate({
      path: "tag_post",
    });
    if (user && user.tag_post.length >= 1) {
      var post = await Post.find({
        $and: [{ _id: { $in: user.tag_post } }],
      })
        .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select(
          "postTitle postText postQuestion isHelpful needCount authorFollowersCount authorOneLine needUser isNeed answerCount tagPeople isUser isInstitute answerUpVoteCount postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postType"
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
        })
        .populate({
          path: "new_application",
          select:
            "applicationSeats applicationStartDate applicationEndDate applicationAbout admissionFee applicationName",
          populate: {
            path: "applicationDepartment",
            select: "dName",
          },
        });
      const postCount = await Post.find({ _id: { $in: user.tag_post } });
      if (page * limit >= postCount.length) {
      } else {
        var totalPage = page + 1;
      }
      res.status(200).send({
        message: "Success Tag Post",
        post,
        postCount: postCount.length,
        totalPage: totalPage,
      });
    } else {
      res.status(200).send({ message: "No Post Found", post: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllUserReposts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(id).select("id");
    var repost = await Post.find({
      $and: [{ author: `${user._id}` }, { postType: "Repost" }],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "postTitle postText postQuestion isHelpful needCount authorFollowersCount authorOneLine needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postType"
      )

      .populate({
        path: "rePostAnswer",
        populate: {
          path: "post",
          select:
            "postQuestion author authorUserName authorPhotoId authorProfilePhoto isUser answerCount createdAt",
        },
      })
      .populate({
        path: "needMultiple",
        select: "username photoId profilePhoto",
      })
      .populate({
        path: "repostMultiple",
        select: "username photoId profilePhoto",
      })
      .populate({
        path: "new_application",
        select:
          "applicationSeats applicationStartDate applicationEndDate applicationAbout admissionFee applicationName",
        populate: {
          path: "applicationDepartment",
          select: "dName",
        },
      });

    if (repost && repost.length >= 1) {
      res
        .status(200)
        .send({ message: "Success", repost, count: repost.length });
    } else {
      res.status(200).send({ message: "No Post found", repost: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

//for  Edit  functionality

exports.commentEdit = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send comment id to perform task";
    await Comment.findByIdAndUpdate(req.params.cid, req.body);
    res.status(200).send({ message: "Comment Edited successfully👍" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.commentDelete = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send comment id to perform task";
    const comment = await Comment.findById(req.params.cid);
    console.log(comment);
    const post = await Post.findById(comment.post);
    if (post.commentCount >= 1) {
      post.commentCount -= 1;
    }
    await post.save();
    await Comment.findByIdAndDelete(req.params.cid);
    res.status(200).send({ message: "Comment Deleted successfully👍" });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.commentReplyEdit = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send reply comment id to perform task";
    await ReplyComment.findByIdAndUpdate(req.params.cid, req.body);
    res.status(200).send({ message: "Reply comment Edited successfully👍" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.commentReplyDelete = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send reply comment id to perform task";
    const rcommeny = await ReplyComment.findById(req.params.cid);
    const comment = await Comment.findById(rcommeny.parentComment);
    if (comment.allChildCommentCount >= 1) {
      comment.allChildCommentCount -= 1;
    }
    await comment.save();
    await ReplyComment.findByIdAndDelete(req.params.cid);
    res.status(200).send({ message: "Reply comment Deleted successfully👍" });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};
