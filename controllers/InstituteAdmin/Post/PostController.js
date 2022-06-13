const InstituteAdmin = require("../../../models/InstituteAdmin");
const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Comment = require("../../../models/Comment");
const ReplyComment = require("../../../models/ReplyComment/ReplyComment");
const {
  uploadVideo,
  uploadPostImageFile,
} = require("../../../S3Configuration");

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

// exports.getPost = async (req, res) => {
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
    const institute = await InstituteAdmin.findById({ _id: id });
    const post = new Post({ ...req.body });
    if (Array.isArray(req.body.people)) {
      for (let val of req.body.people) {
        post.tagPeople.push(val);
      }
    } else {
      const tag = req.body.people.split(",");
      for (let val of tag) {
        post.tagPeople.push(val);
      }
    }
    post.imageId = "1";
    institute.posts.push(post._id);
    institute.postCount += 1
    post.author = institute._id;
    post.authorName = institute.insName
    post.authorUserName = institute.name
    post.authorPhotoId = institute.photoId
    post.authorProfilePhoto = institute.insProfilePhoto
    await Promise.all([institute.save(), post.save()]);
    res.status(201).send({ message: "post is create", post });
  } catch {}
};

exports.postWithImage = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const post = new Post({ ...req.body });

    if (Array.isArray(req.body.people)) {
      for (let val of req.body.people) {
        post.tagPeople.push(val);
      }
    } else {
      const tag = req.body.people.split(",");
      for (let val of tag) {
        post.tagPeople.push(val);
      }
    }
    for (let file of req.files) {
      const results = await uploadPostImageFile(file);
      post.postImage.push(results.Key);
      await unlinkFile(file.path);
    }
    post.imageId = "0";
    institute.posts.push(post._id);
    institute.postCount += 1
    post.author = institute._id;
    post.authorName = institute.insName
    post.authorUserName = institute.name
    post.authorPhotoId = institute.photoId
    post.authorProfilePhoto = institute.insProfilePhoto
    await Promise.all([institute.save(), post.save()]);
    res.status(201).send({ message: "post is create" });
  } catch {}
};

exports.postWithVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const post = new Post({ ...req.body });
    if (Array.isArray(req.body.people)) {
      for (let val of req.body.people) {
        post.tagPeople.push(val);
      }
    } else {
      const tag = req.body.people.split(",");
      for (let val of tag) {
        post.tagPeople.push(val);
      }
    }
    const file = req.file;
    const results = await uploadVideo(file);
    post.postVideo = results.Key;
    post.imageId = "1";
    institute.posts.push(post._id);
    institute.postCount += 1
    post.author = institute._id;
    post.authorName = institute.insName
    post.authorUserName = institute.name
    post.authorPhotoId = institute.photoId
    post.authorProfilePhoto = institute.insProfilePhoto
    await Promise.all([institute.save(), post.save()]);
    await unlinkFile(file.path);
    res.status(201).send({ message: "post created" });
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
  } catch {}
};

exports.postWithDeleted = async (req, res) => {
  try {
    const { id, pid } = req.params;
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { posts: pid } });
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { saveInsPost: pid } });
    await Post.findByIdAndDelete({ _id: pid });
    res.status(200).send({ message: "post deleted" });
  } catch {}
};

exports.postLike = async (req, res) => {
  try {
    const { pid } = req.params;
    const post = await Post.findById({ _id: pid });
    const institute_session = req.session.institute;
    const user_session = req.session.user;

    if (institute_session) {
      if (
        post.endUserLike.length >= 1 &&
        post.endUserLike.includes(String(institute_session._id))
      ) {
        post.endUserLike.pull(institute_session._id);
        if (post.likeCount >= 1) {
          post.likeCount -= 1;
        }
        await post.save();
        res
          .status(200)
          .send({ message: "Removed from Likes", likeCount: post.likeCount });
      } else {
        post.endUserLike.push(institute_session._id);
        post.likeCount += 1;
        await post.save();
        res
          .status(200)
          .send({ message: "Added To Likes", likeCount: post.likeCount });
      }
    } else if (user_session) {
      if (
        post.endUserLike.length >= 1 &&
        post.endUserLike.includes(String(user_session._id))
      ) {
        post.endUserLike.pull(user_session._id);
        if (post.likeCount >= 1) {
          post.likeCount -= 1;
        }
        await post.save();
        res
          .status(200)
          .send({ message: "Removed from Likes", likeCount: post.likeCount });
      } else {
        post.endUserLike.push(user_session._id);
        post.likeCount += 1;
        await post.save();
        res
          .status(200)
          .send({ message: "Added To Likes", likeCount: post.likeCount });
      }
    } else {
      res.status(401).send();
    }
  } catch {}
};

exports.postSave = async (req, res) => {
  try {
    const { pid } = req.params;
    const institute_session = req.session.institute;
    const user_session = req.session.user;
    if (institute_session) {
      const institute = await InstituteAdmin.findById({
        _id: institute_session._id,
      });
      if (
        institute.saveInsPost.length >= 1 &&
        institute.saveInsPost.includes(pid)
      ) {
        institute.saveInsPost.pull(pid);
        await institute.save();
        res.status(200).send({ message: "Removed from Favourites" });
      } else {
        institute.saveInsPost.push(pid);
        await institute.save();
        res.status(200).send({ message: "Added To Favourites" });
      }
    } else if (user_session) {
      const user = await User.findById({ _id: user_session._id });
      if (
        user.saveUserInsPost.length >= 1 &&
        user.saveUserInsPost.includes(pid)
      ) {
        user.saveUserInsPost.pull(pid);
        await user.save();
        res.status(200).send({ message: "Remove To Favourites" });
      } else {
        user.saveUserInsPost.push(pid);
        await user.save();
        res.status(200).send({ message: "Added To Favourites" });
      }
    } else {
      res.status(401).send();
    }
  } catch {}
};

exports.postComment = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById({ _id: id });
    const comment = new Comment({ ...req.body });
    if (req.session.institute) {
      comment.author = req.session.institute._id;
      comment.authorName = req.session.institute.insName
      comment.authorUserName = req.session.institute.name
      comment.authorPhotoId = req.session.institute.photoId
      comment.authorProfilePhoto = req.session.institute.insProfilePhoto
    } else if (req.session.user) {
      comment.author = req.session.user._id;
      comment.authorName = req.session.user.userLegalName
      comment.authorUserName = req.session.user.username
      comment.authorPhotoId = req.session.user.photoId
      comment.authorProfilePhoto = req.session.user.profilePhoto
    } else {
      res.status(401).send();
    }
    post.comment.push(comment._id);
    post.commentCount += 1;
    comment.post = post._id;
    await Promise.all([post.save(), comment.save()]);
    res.status(201).send({ message: "comment created", comment });
  } catch {}
};


exports.retrieveAllPosts = async(req, res) =>{
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const id = req.params.id;
      const skip = (page - 1) * limit;
      const institute = await InstituteAdmin.findById(id);
      const post = await Post.find({
        _id: { $in: institute.posts },
      })
        .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select("postTitle postText postDescription createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto")
      const postCount = await Post.find({author: institute._id})
      if(page * limit >= postCount.length){
        // console.log('There no page exists')
      }
      else{
        var totalPage = page + 1
        // console.log('Enough data for ', page + 1)
      }
      res.status(200).send({ message: "Success", post, postCount: postCount.length, totalPage: totalPage });
    } catch(e) {
      console.log(e)
    }
}


exports.retreiveAllProfilePosts = async(req, res) =>{
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.findById(id);
    const post = await Post.find({
      _id: { $in: institute.posts },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select("postTitle postText postDescription createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto")
    const postCount = await Post.find({author: institute._id})
    if(page * limit >= postCount.length){
    }
    else{
      var totalPage = page + 1
    }
    res.status(200).send({ message: "Success", post, postCount: postCount.length, totalPage: totalPage });
  } catch(e) {
    console.log(e)
  }
}


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
      .select("commentDescription createdAt allLikeCount allChildCommentCount author authorName authorUserName authorPhotoId authorProfilePhoto")
    res.status(200).send({ message: "Sucess", comment });
  } catch(e) {
    console.log(e)
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
        select: "repliedComment createdAt author authorName authorUserName authorPhotoId authorProfilePhoto",
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
  } catch(e) {
    console.log(e)
  }
};

exports.postCommentChild = async (req, res) => {
  try {
    const { pcid } = req.params;
    const { comment, uid } = req.body;
    var rUser = req.session.user && req.session.user._id
    var rInstitute = req.session.institute && req.session.institute._id
    const institute = await InstituteAdmin.findById({_id: rInstitute})
    const users = await User.findById({_id: rUser})
    if (institute) {
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
      const institute = await InstituteAdmin.findById(uid).select("photoId insProfilePhoto name insName")
      const childReplyComment = {
        _id: childComment._id,
        repliedComment: childComment.repliedComment,
        createdAt: childComment.createdAt,
        author: institute._id,
        authorName: institute.insName,
        authorUserName: institute.name,
        authorPhotoId: institute.photoId,
        authorProfilePhoto: institute.insProfilePhoto,
      };
      res.status(201).send({
        childReplyComment,
        commentCount: parentComment.allChildCommentCount,
      });
    } else if (users) {
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
      const user = await User.findById({_id: users._id}).select("photoId profilePhoto username userLegalName")
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
      res.status(401).send();
    }
  } catch(e) {
    console.log(e)
  }
};

exports.likeCommentChild = async (req, res) => {
  try {
    const insCommentId = req.params.cid;
    const id = req.params.id;
    const comment = await Comment.findById(insCommentId);
    if (req.session.institute) {
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
    } else if (req.session.user) {
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
    const { uid } = req.params;
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const tagUser = await InstituteAdmin.findById(uid)
      .populate({
        path: "userFollowersList",
        select: "username userLegalName profilePhoto photoId",
      })
      .select("_id")
      .lean()
      .exec();
    const circleFilter =
      tagUser.userFollowersList &&
      tagUser.userFollowersList.filter((user) => {
        if (
          user.username.toLowerCase().includes(req.query.search.trim()) ||
          user.userLegalName.toLowerCase().includes(req.query.search.trim())
        ) {
          return user;
        } else {
          return "";
        }
      });
    const userPagination = (circleFilter) => {
      const endIndex = dropItem + itemPerPage;
      const user = circleFilter.slice(dropItem, endIndex);
      return user;
    };
    const tagList = userPagination(circleFilter);
    res.status(200).send({
      tagList,
    });
  } catch {}
};
