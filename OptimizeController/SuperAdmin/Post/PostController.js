const InstituteAdmin = require("../../../models/InstituteAdmin");
const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Comment = require("../../../models/Comment");
const ReplyComment = require("../../../models/ReplyComment/ReplyComment");
const Admin = require('../../../models/superAdmin')
const {
  uploadVideo,
  uploadPostImageFile,
} = require("../../../S3Configuration");

const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);

exports.postWithText = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: id })
    .populate({ path: 'users', select: 'userPosts' })
    .populate({ path: 'ApproveInstitute', select: 'posts' })
    var post = new Post({ ...req.body });
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
    admin.posts.push(post._id);
    admin.postCount += 1
    post.author = admin._id;
    post.authorName = admin.adminName
    post.authorUserName = admin.adminUserName
    post.authorPhotoId = admin.photoId
    post.authorProfilePhoto = admin.profilePhoto
    if(post.postStatus === 'Anyone'){
    admin.users.forEach(async (el)  =>{
      el.userPosts.push(post._id)
      await el.save()
    })
    admin.ApproveInstitute.forEach(async (el)  =>{
      el.posts.push(post._id)
      await el.save()
    })
    }
    else if(post.postStatus === 'Private'){
      admin.ApproveInstitute.forEach(async (el)  =>{
        el.posts.push(post._id)
        await el.save()
      })
    } else{}
    await Promise.all([admin.save(), post.save()]);
    res.status(201).send({ message: "post is create", post });
  } catch {}
};

exports.postWithImage = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: id })
    .populate({ path: 'users', select: 'userPosts' })
    .populate({ path: 'ApproveInstitute', select: 'posts' })
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
    admin.posts.push(post._id);
    admin.postCount += 1
    post.author = admin._id;
    post.authorName = admin.adminName
    post.authorUserName = admin.adminUserName
    post.authorPhotoId = admin.photoId
    post.authorProfilePhoto = admin.profilePhoto
    if(post.postStatus === 'Anyone'){
      admin.users.forEach(async (el)  =>{
        el.userPosts.push(post._id)
        await el.save()
      })
      admin.ApproveInstitute.forEach(async (el)  =>{
        el.posts.push(post._id)
        await el.save()
      })
    } else if(post.postStatus === 'Private'){
        admin.ApproveInstitute.forEach(async (el)  =>{
          el.posts.push(post._id)
          await el.save()
        })
    } else{}
    await Promise.all([admin.save(), post.save()]);
    res.status(201).send({ message: "post is create" });
  } catch {}
};

exports.postWithVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: id })
    .populate({ path: 'users', select: 'userPosts' })
    .populate({ path: 'ApproveInstitute', select: 'posts' })
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
    admin.posts.push(post._id);
    admin.postCount += 1
    post.author = admin._id;
    post.authorName = admin.adminName
    post.authorUserName = admin.adminUserName
    post.authorPhotoId = admin.photoId
    post.authorProfilePhoto = admin.profilePhoto
    if(post.postStatus === 'Anyone'){
      admin.users.forEach(async (el)  =>{
        el.userPosts.push(post._id)
        await el.save()
      })
      admin.ApproveInstitute.forEach(async (el)  =>{
        el.posts.push(post._id)
        await el.save()
      })
    } else if(post.postStatus === 'Private'){
        admin.ApproveInstitute.forEach(async (el)  =>{
          el.posts.push(post._id)
          await el.save()
        })
    } else{}
    await Promise.all([admin.save(), post.save()]);
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
    await Admin.findByIdAndUpdate(id, { $pull: { posts: pid } });
    await Admin.findByIdAndUpdate(id, { $pull: { saveAdminPost: pid } });
    await Post.findByIdAndDelete({ _id: pid });
    res.status(200).send({ message: "post deleted" });
  } catch {}
};

exports.postLike = async (req, res) => {
  try {
    const { pid } = req.params;
    const post = await Post.findById({ _id: pid });
    const admin_session = req.tokenData && req.tokenData.adminId ? req.tokenData.adminId : ''
    const institute_session = req.tokenData && req.tokenData.insId ? req.tokenData.insId : ''
    const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''

    if (institute_session) {
      if (
        post.endUserLike.length >= 1 &&
        post.endUserLike.includes(String(institute.session))
      ) {
        post.endUserLike.pull(institute.session);
        if (post.likeCount >= 1) {
          post.likeCount -= 1;
        }
        await post.save();
        res
          .status(200)
          .send({ message: "Removed from Likes", likeCount: post.likeCount });
      } else {
        post.endUserLike.push(institute.session);
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
    } else if (admin_session) {
        if (
          post.endUserLike.length >= 1 &&
          post.endUserLike.includes(String(admin_session))
        ) {
          post.endUserLike.pull(admin_session);
          if (post.likeCount >= 1) {
            post.likeCount -= 1;
          }
          await post.save();
          res
            .status(200)
            .send({ message: "Removed from Likes", likeCount: post.likeCount });
        } else {
          post.endUserLike.push(admin_session);
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
    const admin_session = req.tokenData && req.tokenData.adminId ? req.tokenData.adminId : ''
    const institute_session = req.tokenData && req.tokenData.insId ? req.tokenData.insId : ''
    const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''
    if (institute_session) {
      if (
        post.endUserSave.length >= 1 &&
        post.endUserSave.includes(institute_session)
      ) {
        post.endUserSave.pull(institute_session);
        await post.save();
        res.status(200).send({ message: "Removed from Favourites" });
      } else {
        post.endUserSave.push(institute_session);
        await post.save();
        res.status(200).send({ message: "Added To Favourites" });
      }
    } else if (user_session) {
      if (
        post.endUserSave.length >= 1 &&
        post.endUserSave.includes(user_session)
      ) {
        post.endUserSave.pull(user_session);
        await post.save();
        res.status(200).send({ message: "Remove To Favourites" });
      } else {
        post.endUserSave.push(user_session);
        await post.save();
        res.status(200).send({ message: "Added To Favourites" });
      }
    } else if (admin_session) {
        if (
          post.endUserSave.length >= 1 &&
          post.endUserSave.includes(admin_session)
        ) {
          post.endUserSave.pull(admin_session);
          await post.save();
          res.status(200).send({ message: "Remove To Favourites" });
        } else {
          post.endUserSave.push(admin_session);
          await post.save();
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
    } else if (req.tokenData && req.tokenData.adminId) {
      const admin = await Admin.findById({_id: req.tokenData.adminId})
      comment.author = admin._id;
      comment.authorName = admin.adminName
      comment.authorUserName = admin.adminUserName
      comment.authorPhotoId = admin.photoId
      comment.authorProfilePhoto = admin.profilePhoto
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
      const admin = await Admin.findById(id)
      .select('id')
      .populate({
        path: 'saveAdminPost'
      })
      const post = await Post.find({
        _id: { $in: admin.posts },
      })
        .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select("postTitle postText postDescription createdAt postImage endUserSave postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike")
        .populate({
          path: 'tagPeople',
          select: 'userLegalName username photoId profilePhoto'
        })
      const postCount = await Post.find({author: admin._id})
      if(page * limit >= postCount.length){
        // console.log('There no page exists')
      }
      else{
        var totalPage = page + 1
        // console.log('Enough data for ', page + 1)
      }
      res.status(200).send({ message: "Success", postCount: postCount.length, totalPage: totalPage, post: postCount });
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
    var rUser = req.tokenData && req.tokenData.userId
    var rInstitute = req.tokenData && req.tokenData.insId
    var rAdmin = req.tokenData && req.tokenData.adminId
    const institute = await InstituteAdmin.findById({_id: rInstitute})
    const users = await User.findById({_id: rUser})
    const admins = await Admin.findById({_id: rAdmin})
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
    } else if (admins) {
        const childComment = new ReplyComment({
          repliedComment: comment,
          author: admins._id,
          authorName: admins.adminName,
          authorUserName: admins.adminUserName,
          authorPhotoId: admins.photoId,
          authorProfilePhoto: admins.profilePhoto,
          parentComment: pcid,
        });
        const parentComment = await Comment.findById(pcid);
        parentComment.childComment.unshift(childComment._id);
        parentComment.allChildCommentCount += 1;
        await Promise.all([parentComment.save(), childComment.save()]);
        const admin = await Admin.findById({_id: admins._id}).select("photoId profilePhoto adminUserName adminName")
        const childReplyComment = {
          _id: childComment._id,
          repliedComment: childComment.repliedComment,
          createdAt: childComment.createdAt,
          author: admin._id,
          authorName: admin.adminName,
          authorUserName: admin.adminUserName,
          authorPhotoId: admin.photoId,
          authorProfilePhoto: admin.profilePhoto,
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
    } else if (req.tokenData && req.tokenData.adminId) {
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
