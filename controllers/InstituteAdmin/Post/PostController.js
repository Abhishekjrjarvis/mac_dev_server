const InstituteAdmin = require("../../../models/InstituteAdmin");
const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Comment = require("../../../models/Comment");
const Poll = require('../../../models/Question/Poll')
const ReplyComment = require("../../../models/ReplyComment/ReplyComment");
const {
  uploadVideo,
  uploadPostImageFile,
} = require("../../../S3Configuration");

const fs = require("fs");
const util = require("util");
const { random_list_generator } = require("../../../Utilities/randomFunction");
const unlinkFile = util.promisify(fs.unlink);

//   try {
//     const page = req.query.page ? parseInt(req.query.page) : 1;
//     const limit = req.query.limit ? parseInt(req.query.limit) : 10;
//     const insId = req.params.id;
//     const skip = (page - 1) * limit;
//     const ins = await InstituteAdmin.findById(insId);
//     const allPostId = [];
//     allPostId.push(...ins.posts);
//     if (ins.following.length) {
//       for (let i = 0; i < ins.following.length; i++) {
//         const element = ins.following[i];
//         const postid = await InstituteAdmin.findById(element);
//         allPostId.push(postid);
//       }
//     }
//     // console.log("THIS IS all post after follower only institute", allPostId);

//     const postdata = await post
//       .find(
//         { _id: { $in: allPostId } }
//         // { createdAt: { $gte: Date.now.toISOString() } }
//       )
//       .sort({ createdAt: -1 })
//       .limit(limit)
//       .skip(skip)
//       .populate({
//         path: "comment",
//         select: "commentDesc createdAt allLikeCount ",
//         populate: {
//           path: "institutes",
//           select: "insName photoId  insProfilePhoto",
//         },
//       })
//       .populate({
//         path: "comment",
//         select: "commentDesc createdAt allLikeCount",
//         populate: {
//           path: "instituteUser",
//           select: "userLegalName photoId profilePhoto ",
//         },
//       })
//       .populate({
//         path: "insLike",
//         select: "insName",
//       })

//       .populate({
//         path: "insUserLike",
//         select: "userLegalName",
//       });

//     res.status(200).send({ message: "staff data", postdata });
//   } catch (e) {
//     console.log(`Error`, e);
//   }
// };

exports.postWithText = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" })
      .populate({ path: "joinedUserList" });
    const post = new Post({ ...req.body });
    if (Array.isArray(req.body.people)) {
      for (let val of req.body?.people) {
        post.tagPeople.push({
          tagId: val.tagId,
          tagUserName: val.tagUserName,
          tagType: val.tagType,
        });
      }
    }
    post.imageId = "1";
    institute.posts.push(post._id);
    institute.postCount += 1;
    post.author = institute._id;
    post.authorName = institute.insName;
    post.authorUserName = institute.name;
    post.authorPhotoId = institute.photoId;
    post.authorProfilePhoto = institute.insProfilePhoto;
    post.isInstitute = "institute";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`
    await Promise.all([institute.save(), post.save()]);
    res.status(201).send({ message: "post is create", post });
    if (institute.isUniversal === "Not Assigned") {
      if (institute.followers.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.followers.forEach(async (ele) => {
            ele.posts.push(post._id);
            await ele.save();
          });
        } else {
        }
      }
      if (institute.userFollowersList.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.userFollowersList.forEach(async (ele) => {
            ele.userPosts.push(post._id);
            await ele.save();
          });
        } else {
          if (institute.joinedUserList.length >= 1) {
            institute.joinedUserList.forEach(async (ele) => {
              ele.userPosts.push(post._id);
              await ele.save();
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
    if (Array.isArray(req.body?.people)) {
      for (let instit of req.body?.people) {
        const institTag = await InstituteAdmin.findById(instit.tagId);
        if (institTag?.posts.includes(post._id)) {
        } else {
          institTag.posts?.push(post._id);
        }
        institTag.tag_post?.push(post._id);
        await institTag.save();
      }
    }
  } catch {}
};

exports.postWithImage = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" })
      .populate({ path: "joinedUserList" });
    const post = new Post({ ...req.body });

    if (Array.isArray(req.body.people)) {
      for (let val of req.body?.people) {
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
    institute.posts.push(post._id);
    institute.postCount += 1;
    post.author = institute._id;
    post.authorName = institute.insName;
    post.authorUserName = institute.name;
    post.authorPhotoId = institute.photoId;
    post.authorProfilePhoto = institute.insProfilePhoto;
    post.isInstitute = "institute";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`
    await Promise.all([institute.save(), post.save()]);
    res.status(201).send({ message: "post is create", post });
    if (institute.isUniversal === "Not Assigned") {
      if (institute.followers.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.followers.forEach(async (ele) => {
            ele.posts.push(post._id);
            await ele.save();
          });
        } else {
        }
      }
      if (institute.userFollowersList.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.userFollowersList.forEach(async (ele) => {
            ele.userPosts.push(post._id);
            await ele.save();
          });
        } else {
          if (institute.joinedUserList.length >= 1) {
            institute.joinedUserList.forEach(async (ele) => {
              ele.userPosts.push(post._id);
              await ele.save();
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
    if (Array.isArray(req.body.people)) {
      for (let instit of req.body?.people) {
        const institTag = await InstituteAdmin.findById(instit.tagId);
        if (institTag?.posts.includes(post._id)) {
        } else {
          institTag.posts?.push(post._id);
        }
        institTag.tag_post?.push(post._id);
        await institTag.save();
      }
    }
  } catch {}
};

exports.postWithVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" })
      .populate({ path: "joinedUserList" });
    const post = new Post({ ...req.body });
    if (Array.isArray(req.body.people)) {
      for (let val of req.body?.people) {
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
    institute.posts.push(post._id);
    institute.postCount += 1;
    post.author = institute._id;
    post.authorName = institute.insName;
    post.authorUserName = institute.name;
    post.authorPhotoId = institute.photoId;
    post.authorProfilePhoto = institute.insProfilePhoto;
    post.isInstitute = "institute";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`
    await Promise.all([institute.save(), post.save()]);
    await unlinkFile(file.path);
    res.status(201).send({ message: "post created", post });
    if (institute.isUniversal === "Not Assigned") {
      if (institute.followers.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.followers.forEach(async (ele) => {
            ele.posts.push(post._id);
            await ele.save();
          });
        } else {
        }
      }
      if (institute.userFollowersList.length >= 1) {
        if (post.postStatus === "Anyone") {
          institute.userFollowersList.forEach(async (ele) => {
            ele.userPosts.push(post._id);
            await ele.save();
          });
        } else {
          if (institute.joinedUserList.length >= 1) {
            institute.joinedUserList.forEach(async (ele) => {
              ele.userPosts.push(post._id);
              await ele.save();
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
    if (Array.isArray(req.body.people)) {
      for (let instit of req.body.people) {
        const institTag = await InstituteAdmin.findById(instit.tagId);
        if (institTag?.posts.includes(post._id)) {
        } else {
          institTag.posts?.push(post._id);
        }
        institTag.tag_post?.push(post._id);
        await institTag.save();
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
    res.status(200).send({ message: "visibility change 👓" });
  } catch (e) {
    console.log(e);
  }
};

exports.postWithDeleted = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const post = await Post.findById({_id: pid})
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { posts: pid } });
    institute.postCount -= 1;
    if(post && post.postType === 'Poll'){
      post.poll_query = ''
      await Poll.findByIdAndDelete({_id: `${post.poll_query}`})
      institute.pollCount -= 1
      await post.save()
    }
    await Post.findByIdAndDelete({ _id: pid });
    await institute.save();
    res.status(200).send({ message: "post deleted 🙄🙄" });
  } catch(e){
    console.log(e)
  }
};

exports.postLike = async (req, res) => {
  try {
    const { pid } = req.params;
    const post = await Post.findById({ _id: pid });
    const institute_session =
      req.tokenData && req.tokenData.insId ? req.tokenData.insId : "";
    const user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    if (institute_session) {
      if (
        post.endUserLike.length >= 1 &&
        post.endUserLike.includes(String(institute_session))
      ) {
        post.endUserLike.pull(institute_session);
        if (post.likeCount >= 1) {
          post.likeCount -= 1;
        }
        await post.save();
        res
          .status(200)
          .send({ message: "Removed from Likes", likeCount: post.likeCount });
      } else {
        post.endUserLike.push(institute_session);
        post.likeCount += 1;
        await post.save();
        res
          .status(200)
          .send({ message: "Added To Likes", likeCount: post.likeCount });
      }
    } else if (user_session) {
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
    const institute_session =
      req.tokenData && req.tokenData.insId ? req.tokenData.insId : "";
    const user_session =
      req.tokenData && req.tokenData.userId ? req.tokenData.userId : "";
    const post = await Post.findById({ _id: pid });
    if (institute_session) {
      const institute = await InstituteAdmin.findById({
        _id: `${institute_session}`,
      });
      if (
        post.endUserSave.length >= 1 &&
        post.endUserSave.includes(institute_session)
      ) {
        post.endUserSave.pull(institute_session);
        institute.institute_saved_post.pull(post._id);
        await Promise.all([post.save(), institute.save()]);
        res.status(200).send({ message: "Removed from Favourites" });
      } else {
        post.endUserSave.push(institute_session);
        institute.institute_saved_post.push(post._id);
        await Promise.all([post.save(), institute.save()]);
        res.status(200).send({ message: "Added To Favourites" });
      }
    } else if (user_session) {
      const user = await User.findById({ _id: `${user_session}` });
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
    const post = await Post.findById({ _id: id });
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
    } else if (req.tokenData && req.tokenData.userId) {
      const user = await User.findById({ _id: req.tokenData.userId });
      comment.author = user._id;
      comment.authorName = user.userLegalName;
      comment.authorUserName = user.username;
      comment.authorPhotoId = user.photoId;
      comment.authorProfilePhoto = user.profilePhoto;
    } else {
      res.status(401).send({ message: "Unauthorized" });
    }
    post.comment.push(comment._id);
    post.commentCount += 1;
    comment.post = post._id;
    await Promise.all([post.save(), comment.save()]);
    res.status(201).send({ message: "comment created", comment });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllPosts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const p_types = req.query.p_type ? req.query.p_type : "";
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.findById(id)
      .select("id")
      .populate({ path: "posts" });
    if (institute && institute.posts.length >= 1) {
      if (p_types !== "") {
        var post = await Post.find({
          $and: [{ _id: { $in: institute.posts } }, { postType: p_types }],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postDescription postQuestion answerCount answerUpVoteCount isUser isInstitute postType trend_category endUserSave createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
          )
          .populate({
            path: "poll_query",
          });
      } else {
        var post = await Post.find({
          $and: [{ _id: { $in: institute.posts } }],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postDescription postQuestion answerCount answerUpVoteCount isUser isInstitute postType trend_category endUserSave createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
          )
          .populate({
            path: "poll_query",
          });
      }
      if (institute.posts.length >= 1) {
        const postCount = await Post.find({ _id: { $in: institute.posts } });
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
    } else {
      res.status(204).send({ message: "No Posts Yet..." });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retreiveAllProfilePosts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.findById(id)
      .select("id ")
      .populate({ path: "posts" });
    const post = await Post.find({ author: id })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "postTitle postText postDescription postQuestion answerCount answerUpVoteCount isUser isInstitute postType trend_category endUserSave createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
      )
      .populate({
        path: "poll_query",
      });
    if (institute && institute.posts.length >= 1) {
      const postCount = await Post.find({ _id: { $in: institute.posts } });
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
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "commentDescription createdAt allLikeCount allChildCommentCount author authorName authorUserName authorPhotoId authorProfilePhoto"
      );
    res.status(200).send({ message: "Sucess", comment });
  } catch (e) {
    console.log(e);
  }
};

//Check this route for get all child comment that is reply
exports.getCommentChild = async (req, res) => {
  try {
    const { pcid } = req.params;
    console.log(pcid);
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const comment = await Comment.findById(pcid)
      .populate({
        path: "childComment",
        select:
          "repliedComment createdAt author authorName authorUserName authorPhotoId authorProfilePhoto",
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
      res.status(204).send({ message: "no any child" });
    }
    const replyComment = userPagination(comment.childComment);
    res.status(200).send({ replyComment });
  } catch (e) {
    console.log(e);
  }
};

exports.postCommentChild = async (req, res) => {
  try {
    const { pcid } = req.params;
    const { comment, uid } = req.body;
    if (req.tokenData && req.tokenData.insId) {
      const institute = await InstituteAdmin.findById({
        _id: req.tokenData.insId,
      });
      const childComment = new ReplyComment({
        repliedComment: comment,
        author: institute._id,
        authorName: institute.insName,
        authorUserName: institute.name,
        authorPhotoId: institute.photoId,
        authorProfilePhoto: institute.insProfilePhoto,
        parentComment: pcid,
      });
      const parentComment = await Comment.findById(pcid);
      parentComment.childComment.unshift(childComment._id);
      parentComment.allChildCommentCount += 1;
      await Promise.all([parentComment.save(), childComment.save()]);
      const institutes = await InstituteAdmin.findById(
        req.tokenData.insId
      ).select("photoId insProfilePhoto name insName");
      const childReplyComment = {
        _id: childComment._id,
        repliedComment: childComment.repliedComment,
        createdAt: childComment.createdAt,
        author: institutes._id,
        authorName: institutes.insName,
        authorUserName: institutes.name,
        authorPhotoId: institutes.photoId,
        authorProfilePhoto: institutes.insProfilePhoto,
      };
      res.status(201).send({
        childReplyComment,
        commentCount: parentComment.allChildCommentCount,
      });
    } else if (req.tokenData && req.tokenData.userId) {
      const users = await User.findById({ _id: req.tokenData.userId });
      const childComment = new ReplyComment({
        repliedComment: comment,
        author: users._id,
        authorName: users.userLegalName,
        authorUserName: users.username,
        authorPhotoId: users.photoId,
        authorProfilePhoto: users.profilePhoto,
        parentComment: pcid,
      });
      const parentComment = await Comment.findById(pcid);
      parentComment.childComment.unshift(childComment._id);
      parentComment.allChildCommentCount += 1;
      await Promise.all([parentComment.save(), childComment.save()]);
      const user = await User.findById({ _id: req.tokenData.userId }).select(
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
      };
      res.status(201).send({
        childReplyComment,
        commentCount: parentComment.allChildCommentCount,
      });
    } else {
      res.status(401).send({ message: "Unauthorized" });
    }
  } catch (e) {
    console.log(e.message);
  }
};

exports.likeCommentChild = async (req, res) => {
  try {
    const insCommentId = req.params.cid;
    const id = req.params.id;
    const comment = await Comment.findById(insCommentId);
    if (req.tokenData && req.tokenData.insId) {
      if (!comment.parentCommentLike.includes(id)) {
        comment.parentCommentLike.push(id);
        comment.allLikeCount += 1;
        await comment.save();

        res
          .status(200)
          .send({ message: "liked by Institute", count: comment.allLikeCount });
      } else {
        comment.parentCommentLike.pull(id);
        comment.allLikeCount -= 1;
        await comment.save();

        res.status(200).send({
          message: "diliked by Institute",
          count: comment.allLikeCount,
        });
      }
    } else if (req.tokenData && req.tokenData.userId) {
      if (!comment.parentCommentLike.includes(id)) {
        comment.parentCommentLike.push(id);
        comment.allLikeCount += 1;
        await comment.save();
        res
          .status(200)
          .send({ message: "liked by User", count: comment.allLikeCount });
      } else {
        comment.parentCommentLike.pull(id);
        comment.allLikeCount -= 1;
        await comment.save();
        res
          .status(200)
          .send({ message: "diliked by user", count: comment.allLikeCount });
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
  const getPage = req.query.page ? parseInt(req.query.page) : 1;
  const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
  const dropItem = (getPage - 1) * itemPerPage;
  const circleUserData = await Post.findById(pid)
    .populate({
      path: "insUserLike",
      select: "userLegalName photoId username profilePhoto userBio",
    })
    .populate({
      path: "insLike",
      select: "insName photoId name insProfilePhoto insAbout",
    })
    .select("_id")
    .lean()
    .exec();
  const institutePagination = (circleFilter) => {
    const allLike = [...circleFilter.insUserLike, ...circleFilter.insLike];
    const endIndex = dropItem + itemPerPage;
    const user = allLike.slice(dropItem, endIndex);
    return user;
  };
  const reactionList =
    circleUserData.insUserLike || circleUserData.insLike
      ? institutePagination(circleUserData)
      : "";
  res.status(200).send({
    reactionList,
  });
};

// All users list who has following institute with that tag their post

exports.circleList = async (req, res) => {
  try {
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const tagInstitute = await InstituteAdmin.find({
      $or: [
        { insName: { $regex: req.query.search, $options: "i" } },
        { name: { $regex: req.query.search, $options: "i" } },
      ],
      $and: [
        {
          tag_privacy: { $in: ["Every one"] },
        },
      ],
    })
      .select("insName insProfilePhoto photoId name")
      .limit(itemPerPage)
      .skip(dropItem)
      .lean()
      .exec();

    // const tagInstituteList = random_list_generator(tagInstitute);
    res.status(200).send({
      tagInstituteList: tagInstitute,
    });
  } catch {}
};

exports.retrieveSavedAllPosts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.findById(id)
      .select("id")
      .populate({ path: "institute_saved_post" });
    if (institute && institute.institute_saved_post.length >= 1) {
      const post = await Post.find({
        _id: { $in: institute.institute_saved_post },
      })
        // .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select(
          "postTitle postText postDescription endUserSave createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
        )
        .populate({
          path: "tagPeople",
          select: "userLegalName username photoId profilePhoto",
        });
      if (institute.institute_saved_post.length >= 1) {
        const postCount = await Post.find({
          _id: { $in: institute.institute_saved_post },
        });
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
    } else {
      res.status(204).send({ message: "No Posts Yet..." });
    }
  } catch (e) {
    console.log(e);
  }
};
