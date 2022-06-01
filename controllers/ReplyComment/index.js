const InstituteAdmin = require("../../models/InstituteAdmin");
const Comment = require("../../models/Comment");
const UserComment = require("../../models/UserComment");
const User = require("../../models/User");
const ReplyCommentInstitute = require("../../models/ReplyComment/ReplyComment");
const ReplyCommentUser = require("../../models/ReplyComment/ReplyCommentUser");

exports.getCommentUser = async (req, res) => {
  try {
    const { pcid } = req.params;
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const comment = await UserComment.findById(pcid)
      .populate({
        path: "childComment",
        select: "repliedComment createdAt",
        populate: {
          path: "author",
          select: "userLegalName photoId profilePhoto",
        },
      })
      .select("_id")
      .lean()
      .exec();
    const userPagination = (circleFilter) => {
      const endIndex = dropItem + itemPerPage;
      const childComment = circleFilter.slice(dropItem, endIndex);
      return childComment;
    };
    const replyComment = userPagination(comment.childComment);
    res.status(200).send({ replyComment });
  } catch (e) {
    console.log(e);
  }
};

exports.postCommentUser = async (req, res) => {
  try {
    const { pcid } = req.params;
    const { comment, uid } = req.body;
    const childComment = new ReplyCommentUser({
      repliedComment: comment,
      author: uid,
      parentComment: pcid,
    });
    const parentComment = await UserComment.findById(pcid);
    parentComment.childComment.unshift(childComment._id);
    parentComment.allChildCommentCount += 1;
    await Promise.all([parentComment.save(), childComment.save()]);
    const user = await User.findById(uid)
      .select("photoId profilePhoto username userLegalName")
      .lean()
      .exec();
    const childReplyComment = {
      _id: childComment._id,
      repliedComment: childComment.repliedComment,
      createdAt: childComment.createdAt,
      author: user,
    };
    res.status(201).send({
      childReplyComment,
      commentCount: parentComment.allChildCommentCount,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getCommentInstitute = async (req, res) => {
  try {
    const { pcid } = req.params;
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const comment = await Comment.findById(pcid)
      .populate({
        path: "childComment",
        select: "repliedComment createdAt",
        populate: {
          path: "authorUser",
          select: "username userLegalName photoId profilePhoto",
        },
      })
      .populate({
        path: "childComment",
        select: "repliedComment createdAt",
        populate: {
          path: "authorInstitue",
          select: "name insName photoId insProfilePhoto",
        },
      })
      .select("allChildCommentCount")
      .lean()
      .exec();
    const userPagination = (circleFilter) => {
      const endIndex = dropItem + itemPerPage;
      const childComment = circleFilter.slice(dropItem, endIndex);
      return childComment;
    };

    const replyComment = userPagination(comment.childComment);
    res.status(200).send({ replyComment });
  } catch (e) {
    console.log(e);
  }
};

exports.postCommentInstitute = async (req, res) => {
  try {
    const { pcid } = req.params;
    const { comment, uid } = req.body;
    // console.log(req.session);
    if (req.session.institute) {
      const childComment = new ReplyCommentInstitute({
        repliedComment: comment,
        authorInstitue: uid,
        parentComment: pcid,
      });
      const parentComment = await Comment.findById(pcid);
      parentComment.childComment.unshift(childComment._id);
      parentComment.allChildCommentCount += 1;
      await Promise.all([parentComment.save(), childComment.save()]);
      const institute = await InstituteAdmin.findById(uid)
        .select("photoId insProfilePhoto name insName")
        .lean()
        .exec();
      const childReplyComment = {
        _id: childComment._id,
        repliedComment: childComment.repliedComment,
        createdAt: childComment.createdAt,
        authorInstitue: institute,
      };
      res.status(201).send({
        childReplyComment,
        commentCount: parentComment.allChildCommentCount,
      });
    } else if (req.session.user) {
      const childComment = new ReplyCommentInstitute({
        repliedComment: comment,
        authorUser: uid,
        parentComment: pcid,
      });
      const parentComment = await Comment.findById(pcid);
      parentComment.childComment.unshift(childComment._id);
      parentComment.allChildCommentCount += 1;
      await Promise.all([parentComment.save(), childComment.save()]);
      const user = await User.findById(uid)
        .select("photoId profilePhoto username userLegalName")
        .lean()
        .exec();
      const childReplyComment = {
        _id: childComment._id,
        repliedComment: childComment.repliedComment,
        createdAt: childComment.createdAt,
        authorUser: user,
      };
      res.status(201).send({
        childReplyComment,
        commentCount: parentComment.allChildCommentCount,
      });
    } else {
      res.status(200).send({ message: "You need to login first" });
    }
  } catch (e) {
    console.log(e);
  }
};

//   exports.postCommentUser = async (req, res) => {
//     try {
//     } catch (e) {
//       console.log(e);
//     }
//   };
