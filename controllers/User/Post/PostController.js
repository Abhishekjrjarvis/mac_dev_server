const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Comment = require("../../../models/Comment");
const InstituteAdmin = require("../../../models/InstituteAdmin")
const ReplyComment = require("../../../models/ReplyComment/ReplyComment");
const {
  uploadPostImageFile,
  uploadVideo,
} = require("../../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

exports.postWithText = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
    .populate({ path: 'userFollowers'})
    .populate({ path: 'userCircle'})
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
    user.userPosts.push(post._id);
    user.postCount += 1
    post.author = user._id;
    post.authorName = user.userLegalName
    post.authorUserName = user.username
    post.authorPhotoId = user.photoId
    post.authorProfilePhoto = user.profilePhoto
    post.isUser = 'user'
    await Promise.all([user.save(), post.save()]);
    res.status(201).send({ message: "post is create" });
    if(user.userFollowers.length >= 1){
      if(post.postStatus === 'Anyone'){
        user.userFollowers.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
      }else{}
    }
    if(user.userCircle.length >= 1){
        user.userCircle.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
    }
  } catch {}
};

exports.postWithImage = async (req, res) => {
  try {
    const { id } = req.params;
    const post = new Post({ ...req.body });
    const user = await User.findById({ _id: id })
    .populate({ path: 'userFollowers'})
    .populate({ path: 'userCircle'})
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
    user.userPosts.push(post._id);
    user.postCount += 1
    post.author = user._id;
    post.authorName = user.userLegalName
    post.authorUserName = user.username
    post.authorPhotoId = user.photoId
    post.authorProfilePhoto = user.profilePhoto
    post.isUser = 'user'
    await Promise.all([user.save(), post.save()]);
    res.status(201).send({ message: "post is create" });
    if(user.userFollowers.length >= 1){
      if(post.postStatus === 'Anyone'){
        user.userFollowers.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
      }else{}
    }
    if(user.userCircle.length >= 1){
        user.userCircle.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
    }
  } catch {}
};

exports.postWithVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
    .populate({ path: 'userFollowers'})
    .populate({ path: 'userCircle'})
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
    user.userPosts.push(post._id);
    user.postCount += 1
    post.author = user._id;
    post.authorName = user.userLegalName
    post.authorUserName = user.username
    post.authorPhotoId = user.photoId
    post.authorProfilePhoto = user.profilePhoto
    post.isUser = 'user'
    await Promise.all([user.save(), post.save()]);
    await unlinkFile(file.path);
    res.status(201).send({ message: "post created" });
    if(user.userFollowers.length >= 1){
      if(post.postStatus === 'Anyone'){
        user.userFollowers.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
      }else{}
    }
    if(user.userCircle.length >= 1){
        user.userCircle.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
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
  } catch {}
};

exports.postWithDeleted = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const user = await User.findById({ _id: id})
    await User.findByIdAndUpdate(id, { $pull: { userPosts: pid } });
    await Post.findByIdAndDelete({ _id: pid });
    user.postCount -= 1
    await user.save()
    res.status(200).send({ message: "post deleted" });
  } catch {}
};

exports.postLike = async (req, res) => {
  try {
    const { pid } = req.params;
    const post = await Post.findById({ _id: pid });
    const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''
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
  } catch(e) {
    console.log(e)
  }
};

exports.postSave = async (req, res) => {
  try {
    const { pid } = req.params;
    const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''
    if (user_session) {
      // const user = await User.findById({ _id: user_session });
      const post = await Post.findById({_id: pid})
      if (post.endUserSave.length >= 1 && post.endUserSave.includes(user_session)) {
        post.endUserSave.pull(user_session);
        await post.save();
        res.status(200).send({ message: "Remove To Favourites" });
      } else {
        post.endUserSave.push(user_session);
        await post.save();
        res.status(200).send({ message: "Added To Favourites" });
      }
    } else {
      res.status(401).send({ message: 'Unauthorized access'});
    }
  } catch {}
};

exports.postComment = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById({ _id: id });
    const comment = new Comment({ ...req.body });
    if (req.tokenData && req.tokenData.insId) {
      const institute = await InstituteAdmin.findById({_id: req.tokenData.insId})
      comment.author = institute._id;
      comment.authorName = institute.insName
      comment.authorUserName = institute.name
      comment.authorPhotoId = institute.photoId
      comment.authorProfilePhoto = institute.insProfilePhoto
    } else if (req.tokenData && req.tokenData.userId) {
      const user = await User.findById({_id: req.tokenData.userId})
      comment.author = user._id;
      comment.authorName = user.userLegalName
      comment.authorUserName = user.username
      comment.authorPhotoId = user.photoId
      comment.authorProfilePhoto = user.profilePhoto
    } else {
      res.status(401).send({ message: 'Unauthorized'});
    }
    post.comment.push(comment._id);
    post.commentCount += 1;
    comment.post = post._id;
    await Promise.all([post.save(), comment.save()]);
    res.status(201).send({ message: "comment created", comment });
  } catch(e) {
    console.log(e)
  }
};


exports.retrieveAllUserPosts = async(req, res) =>{
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    // const p_types = req.query.p_type ? req.query.p_type : ''
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(id)
    .select('id')
    .populate({
      path: 'userPosts',
    })
    if(user && user.userPosts.length >=1){
    const post = await Post.find({ $and: [
    {_id: { $in: user.userPosts }}
    ]})
    .sort("-createdAt")
    .limit(limit)
    .skip(skip)
    .select("postTitle postText postQuestion answerCount answerUpVoteCount postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postType")
    .populate({
      path: 'tagPeople',
      select: 'userLegalName username photoId profilePhoto'
    })
    .populate({
      path: 'poll_query'
    })
    const postCount = await Post.find({_id: { $in: user.userPosts }})
    if(page * limit >= postCount.length){
    }
    else{
      var totalPage = page + 1
    }
    res.status(200).send({ message: "Success", post, postCount: postCount.length, totalPage: totalPage, });
    }
  } catch(e) {
    console.log(e)
  }
}


exports.retrieveAllUserProfilePosts = async(req, res) =>{
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    // const p_types = req.query.p_type ? req.query.p_type : ''
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(id)
    .select('id')
    .populate({
      path: 'userPosts',
    })
    if(user && user.userPosts.length >=1){
    const post = await Post.find({author: id})
    .sort("-createdAt")
    .limit(limit)
    .skip(skip)
    .select("postTitle postText postDescription endUserSave createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike postQuestion answerCount answerUpVoteCount trend_category postType")
    .populate({
        path: 'tagPeople',
        select: 'userLegalName username photoId profilePhoto'
    })
    .populate({
      path: 'poll_query'
    })
    const postCount = await Post.find({_id: { $in: user.userPosts }})
    if(page * limit >= postCount.length){
    }
    else{
      var totalPage = page + 1
    }
    res.status(200).send({ message: "Success", post, postCount: postCount.length, totalPage: totalPage, });
    }
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
      .select("commentDescription createdAt allLikeCount allChildCommentCount author authorName authorUserName authorPhotoId authorProfilePhoto");
    // .populate({
    //   path: "users",
    //   select: "userLegalName photoId profilePhoto ",
    // });
    res.status(200).send({ message: "Sucess", comment });
  } catch {}
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
  } catch {}
};

exports.postCommentChild = async (req, res) => {
  try {
    const { pcid } = req.params;
    const { comment, uid } = req.body;
    if (req.tokenData && req.tokenData.userId) {
      const users = await User.findById({_id: req.tokenData.userId}) 
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
      const user = await User.findById(users._id).select("photoId profilePhoto username userLegalName")
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
        allChildCommentCount: parentComment.allChildCommentCount,
      });
    } else {
      res.status(401).send({ message: 'Unauthorized'});
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
    const { uid } = req.params;
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const tagUser = await User.findById(uid)
      .populate({
        path: "userCircle",
        select: "username userLegalName profilePhoto photoId",
      })
      .select("_id")
      .lean()
      .exec();
    const circleFilter =
      tagUser.userCircle &&
      tagUser.userCircle.filter((user) => {
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
