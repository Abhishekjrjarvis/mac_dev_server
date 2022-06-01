const InstituteAdmin = require("../models/InstituteAdmin");
const User = require("../models/User");

const post = require("../models/Post");
const userPost = require("../models/userPost");
const Staff = require("../models/Staff");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Comments = require("../models/Comment");
const UserComment = require("../models/UserComment");
const ReplyCommentUser = require("../models/ReplyComment/ReplyCommentUser");

exports.getinsPostCommentInLimit = async (req, res) => {
  try {
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const postId = req.params.id;
    const skip = (page - 1) * limit;
    const insPost = await post.findById(postId);
    // console.log(insPost.comment);
    const comment = await Comments.find({
      _id: { $in: insPost.comment },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "institutes",
        select: "insName photoId  insProfilePhoto",
      })
      .populate({
        path: "childComment",
      })
      .populate({
        path: "instituteUser",
        select: "userLegalName photoId profilePhoto ",
      });
    res.status(200).send({ message: "Sucess", comment });
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.likeComment = async (req, res) => {
  try {
    const insCommentId = req.params.cid;
    const id = req.params.id;
    const comment = await Comments.findById(insCommentId);
    if (req.session.institute) {
      if (!comment.parentCommentLikeInstitute.includes(id)) {
        comment.parentCommentLikeInstitute.push(id);
        comment.allLikeCount = comment.allLikeCount + 1;
        await comment.save();

        res
          .status(200)
          .send({ message: "liked by Institute", count: comment.allLikeCount });
      } else {
        comment.parentCommentLikeInstitute.pull(id);
        comment.allLikeCount = comment.allLikeCount - 1;
        await comment.save();

        res.status(200).send({
          message: "diliked by Institute",
          count: comment.allLikeCount,
        });
      }
    } else if (req.session.user) {
      if (!comment.parentCommentLikeUser.includes(id)) {
        comment.parentCommentLikeUser.push(id);
        comment.allLikeCount = comment.allLikeCount + 1;
        await comment.save();

        res
          .status(200)
          .send({ message: "liked by User", count: comment.allLikeCount });
      } else {
        comment.parentCommentLikeUser.pull(id);
        comment.allLikeCount = comment.allLikeCount - 1;
        await comment.save();

        res
          .status(200)
          .send({ message: "diliked by user", count: comment.allLikeCount });
      }
    }

    res.status(200).send({ message: "login first to like " });
  } catch (e) {
    console.log(`error ${e}`);
  }
};

exports.getTagCircleUser = async (req, res) => {
  try {
    const { uid } = req.params;
    // const search = req.query.search
    //   ? {
    //       $or: [
    //         { userLegalName: { $regex: req.query.search, $options: "i" } },
    //         { username: { $regex: req.query.search, $options: "i" } },
    //       ],
    //     }
    //   : {};
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;
    const tagUser = await User.findById(uid)
      .populate({
        path: "userCircle",
        select: "username userLegalName profilePhoto photoId",
      })
      .select("_id")
      // .limit(itemPerPage)
      // .skip(dropItem)
      .lean()
      .exec();
    // console.log("THis is circle", tagUser);
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
    console.log("THis is circle filter", circleFilter);

    const userPagination = (circleFilter) => {
      const endIndex = dropItem + itemPerPage;
      const user = circleFilter.slice(dropItem, endIndex);
      return user;
    };
    const circleUserData = userPagination(circleFilter);
    res.status(200).send({
      circleUserData,
    });
  } catch {}
};
exports.reactionInstitute = async (req, res) => {
  const { pid } = req.params;
  const getPage = req.params.page ? parseInt(req.params.page) : 1;
  const itemPerPage = req.params.limit ? parseInt(req.params.limit) : 10;
  const dropItem = (getPage - 1) * itemPerPage;
  const circleUserData = await post
    .findById(pid)
    .populate({
      path: "insUserLike",
      select: "userLegalName photoId username profilePhoto userBio",
    })
    .populate({
      path: "insLike",
      select: "insName photoId name insProfilePhoto insAbout",
    })
    .select("_id")

    // .limit(itemPerPage)
    // .skip(dropItem)
    .lean()
    .exec();
  const institutePagination = (circleFilter) => {
    const allLike = [...circleFilter.insUserLike, ...circleFilter.insLike];
    const endIndex = dropItem + itemPerPage;
    const user = allLike.slice(dropItem, endIndex);
    return user;
  };
  const userDataPost =
    circleUserData.insUserLike || circleUserData.insLike
      ? institutePagination(circleUserData)
      : "";
  res.status(200).send({
    userDataPost,
  });
};

exports.reactionUser = async (req, res) => {
  const { pid } = req.params;
  // console.log(req.params.page, req.params.limit);
  const getPage = req.params.page ? parseInt(req.params.page) : 1;
  const itemPerPage = req.params.limit ? parseInt(req.params.limit) : 10;
  const dropItem = (getPage - 1) * itemPerPage;
  const circleUserData = await userPost
    .findById(pid)
    .populate({
      path: "userlike",
      select: "userLegalName photoId username profilePhoto userBio",
    })
    .select("_id")
    // .limit(itemPerPage)
    // .skip(dropItem)
    .lean()
    .exec();

  const userPagination = (circleFilter) => {
    const endIndex = dropItem + itemPerPage;
    const user = circleFilter.slice(dropItem, endIndex);
    return user;
  };
  const userDataPost = circleUserData.userlike
    ? userPagination(circleUserData.userlike)
    : "";
  res.status(200).send({
    userDataPost,
  });
};

exports.searchInstitute = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $or: [
              { insName: { $regex: req.query.search, $options: "i" } },
              { name: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const allInstitutes = await InstituteAdmin.find(search)
        .select("insName insProfilePhoto photoId name")
        .limit(itemPerPage)
        .skip(dropItem)
        .lean()
        .exec();
      if (!allInstitutes.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          allInstitutes,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchUser = async (req, res) => {
  try {
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a string to search" });
    } else {
      const search = req.query.search
        ? {
            $or: [
              { userLegalName: { $regex: req.query.search, $options: "i" } },
              { username: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};
      const getPage = req.query.page ? parseInt(req.query.page) : 1;
      const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
      const dropItem = (getPage - 1) * itemPerPage;
      const user = await User.find(search)
        .limit(itemPerPage)
        .skip(dropItem)
        .select("userLegalName profilePhoto photoId username")
        .lean()
        .exec();
      if (!user.length) {
        res.status(202).send({ message: "Not found any search" });
      } else {
        res.status(200).send({
          user,
        });
      }
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint (/getsearchUser)`);
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).send({
      data: user,
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint (/getUser)`);
  }
};

exports.getUserPost = async (req, res) => {
  try {
    const post = await userPost.findById(req.params.pid);
    res.status(200).send({
      data: post,
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint (/getUser)`);
  }
};

exports.getInsPost = async (req, res) => {
  try {
    const post = await post.findById(req.params.pid);
    res.status(200).send({
      data: post,
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint (/getUser)`);
  }
};

exports.getUserPost = async (req, res) => {
  try {
    const user = await User.findById(req.params.uid);
    const userPosts = [];
    await user.userPosts;
    for (let i = 0; i < user.userPosts.length; i++) {
      const element = user.userPosts[i];
      const posts = await userPost.findById(element);
      userPosts.push(posts);
    }
    res.status(200).send({
      data: userPosts,
    });
  } catch (e) {
    console.log(`${e} SomeThing Went Wrong at this EndPoint (/getUser)`);
  }
};

exports.getInstitutePostInLimit = async (req, res) => {
  try {
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const insId = req.params.id;
    const skip = (page - 1) * limit;
    const ins = await InstituteAdmin.findById(insId);
    const allPostId = [];
    allPostId.push(...ins.posts);
    // console.log("THIS IS all post only institute", allPostId);

    if (ins.following.length) {
      for (let i = 0; i < ins.following.length; i++) {
        const element = ins.following[i];
        const postid = await InstituteAdmin.findById(element);
        allPostId.push(postid);
      }
    }
    // console.log("THIS IS all post after follower only institute", allPostId);

    const postdata = await post
      .find(
        { _id: { $in: allPostId } }
        // { createdAt: { $gte: Date.now.toISOString() } }
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "comment",
        select: "commentDesc createdAt allLikeCount ",
        populate: {
          path: "institutes",
          select: "insName photoId  insProfilePhoto",
        },
      })
      .populate({
        path: "comment",
        select: "commentDesc createdAt allLikeCount",
        populate: {
          path: "instituteUser",
          select: "userLegalName photoId profilePhoto ",
        },
      })
      .populate({
        path: "insLike",
        select: "insName",
      })

      .populate({
        path: "insUserLike",
        select: "userLegalName",
      });

    res.status(200).send({ message: "staff data", postdata });
  } catch (e) {
    console.log(`Error`, e);
  }
};
exports.getAllInsStaffInLimit = async (req, res) => {
  try {
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const insId = req.params.id;
    const skip = (page - 1) * limit;
    const ins = await InstituteAdmin.findById(insId);

    const staff = await Staff.find({ _id: { $in: ins.ApproveStaff } })
      .limit(limit)
      .skip(skip);
    // .select(
    //   "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
    // );
    res.status(200).send({ message: "staff data", staff });
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.getAllInsStudentInLimit = async (req, res) => {
  try {
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const insId = req.params.id;
    const skip = (page - 1) * limit;
    const ins = await InstituteAdmin.findById(insId);

    // console.log("hi student");
    const students = await Student.find({ _id: { $in: ins.ApproveStudent } })
      .limit(limit)
      .skip(skip)
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto"
      );
    res.status(200).send({ message: "Student data", students });
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.getInstituteSavePostInLimit = async (req, res) => {
  try {
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const insId = req.params.id;
    const skip = (page - 1) * limit;
    const ins = await InstituteAdmin.findById(insId);

    const SavePosts = await post
      .find({ _id: { $in: ins.saveInsPost } })
      .limit(limit)
      .skip(skip)
      .populate({ path: "comment", populate: { path: "institutes" } });
    // .select(
    //   "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
    // );
    res.status(200).send({ message: "SavePosts data", SavePosts });
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.getInstituteSelfPostInLimit = async (req, res) => {
  try {
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const insId = req.params.id;
    const skip = (page - 1) * limit;
    const ins = await InstituteAdmin.findById(insId);

    const selfPosts = await post
      .find({ _id: { $in: ins.posts } })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .populate({ path: "comment", populate: { path: "institutes" } })
      .populate({ path: "comment", populate: { path: "instituteUser" } });
    // .select(
    //   "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
    // );
    res.status(200).send({ message: "selfPosts data", selfPosts });
  } catch (e) {
    console.log(`Error`, e);
  }
};

//..............................new..................................//

exports.getUserSelfPostInLimit = async (req, res) => {
  try {
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const insId = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(insId);
    const selfPosts = await post
      .find({ _id: { $in: user.userPosts } })
      .limit(limit)
      .skip(skip)
      .populate({ path: "comment", populate: { path: "institutes" } });
    // .select(
    //   "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
    // );
    res.status(200).send({ message: "selfPosts data", selfPosts });
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.checkStudentinSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid);
    const classIs = await Class.findById(subject.class);
    const data = classIs.ApproveStudent;
    res.status(200).send({
      data,
    });
  } catch (e) {
    console.log(e, `SomeThing Went Wrong at this EndPoint (/getUser)`);
  }
};

exports.getinsPostCommentInLimit = async (req, res) => {
  try {
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const postId = req.params.id;
    const skip = (page - 1) * limit;
    const insPost = await post.findById(postId);
    // console.log(insPost.comment);
    const comment = await Comments.find({
      _id: { $in: insPost.comment },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .populate({
        path: "institutes",
        select: "insName photoId  insProfilePhoto",
      })
      .populate({
        path: "childComment",
      })
      .populate({
        path: "instituteUser",
        select: "userLegalName photoId profilePhoto ",
      });
    // .select(

    //   "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
    // );
    res.status(200).send({ message: "Sucess", comment });
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.getUserPostDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const selfPost = user.userPosts;
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const skip = (page - 1) * limit;
    let followingPost = [];
    let circlePost = [];
    let insPostId = [];
    let studentInsPostsPrivate = [];
    let staffInsPostsPrivate = [];
    let showPrivatePost = [];

    const userFollowing = user.userFollowing;

    if (user.staff) {
      for (let i = 0; i < user.staff.length; i++) {
        const element = user.staff[i];
        const staffDate = await Staff.findById(element);
        const ins = await InstituteAdmin.findById(staffDate.institute);
        studentInsPostsPrivate = studentInsPostsPrivate.concat(ins.posts);
      }
    }
    if (user.student) {
      for (let i = 0; i < user.student.length; i++) {
        const element = user.student[i];
        const studentDate = await Student.findById(element);
        const ins = await InstituteAdmin.findById(studentDate.institute);
        staffInsPostsPrivate = staffInsPostsPrivate.concat(ins.posts);
      }
    }
    showPrivatePost = showPrivatePost.concat(studentInsPostsPrivate);
    showPrivatePost = showPrivatePost.concat(staffInsPostsPrivate);
    if (userFollowing) {
      for (let i = 0; i < userFollowing.length; i++) {
        const element = userFollowing[i];
        const users = await User.findById(element);
        const postArr = [];
        for (let i = 0; i < users.userPosts.length; i++) {
          const element = users.userPosts[i];
          const follPosts = await userPost.findById(element).populate({
            path: "userComment",
            populate: { path: "childComment" },
          });

          if (follPosts) {
            if (follPosts.userPostStatus === "Private") {
            } else {
              postArr.push(element);
            }
          }
        }

        followingPost = followingPost.concat(postArr);
      }
    }
    if (user.userCircle) {
      for (let i = 0; i < user.userCircle.length; i++) {
        const element = user.userCircle[i];
        const users = await User.findById(element);
        circlePost = circlePost.concat(users.userPosts);
      }
    }
    if (user.userInstituteFollowing) {
      for (let i = 0; i < user.userInstituteFollowing.length; i++) {
        const element = user.userInstituteFollowing[i];
        const instituteAdmin = await InstituteAdmin.findById(element);
        insPostId = insPostId.concat(instituteAdmin.posts);
      }
    }
    let userPostsId = [];
    userPostsId = userPostsId.concat(selfPost);
    userPostsId = userPostsId.concat(followingPost);
    userPostsId = userPostsId.concat(circlePost);

    let userPosts = [];
    let insPosts = [];
    let posts = await userPost
      .find({ _id: { $in: userPostsId } })
      .sort({ createdAt: -1 })
      .populate({
        path: "userComment",
        populate: {
          path: "users",
          select: "userLegalName photoId profilePhoto",
        },
      })
      .populate({
        path: "tagPeople",
        select: "userLegalName ",
      })
      .populate({
        path: "userComment",
        populate: {
          path: "childComment",
          populate: {
            path: "author",
            select: "userLegalName photoId profilePhoto",
          },
        },
      })
      .populate({ path: "user", select: "userLegalName photoId profilePhoto" });

    if (insPostId) {
      for (let i = 0; i < insPostId.length; i++) {
        const element = insPostId[i];
        const posts = await post
          .findById(element)
          .populate({
            path: "institute",
            select: "insName photoId  insProfilePhoto",
          })
          .populate({
            path: "comment",
            populate: {
              path: "institutes",
              select: "insName photoId  insProfilePhoto",
            },
          })
          .populate({
            path: "comment",
            populate: {
              path: "childComment",
            },
          })
          .populate({
            path: "comment",
            populate: {
              path: "instituteUser",
              select: "userLegalName photoId profilePhoto ",
            },
          })
          .populate({
            path: "insLike",
            select: "insName",
          })
          .populate({
            path: "insUserLike",
            select: "userLegalName",
          });
        if (posts) {
          if (posts.CreatePostStatus === "Private") {
          } else {
            insPosts.push(posts);
          }
        }
      }
    }
    if (showPrivatePost) {
      for (let i = 0; i < showPrivatePost.length; i++) {
        const element = showPrivatePost[i];
        const insPost = await post
          .findById(element)
          .populate({
            path: "institute",
            select: "insName photoId  insProfilePhoto",
          })

          .populate({
            path: "comment",
            populate: {
              path: "childComment",
            },
          })
          .populate({
            path: "comment",
            select: "commentDesc createdAt ",
            populate: {
              path: "institutes",
              select: "insName photoId  insProfilePhoto",
            },
          })
          .populate({
            path: "comment",
            populate: {
              path: "instituteUser",
              select: "userLegalName photoId profilePhoto ",
            },
          })
          .populate({
            path: "insLike",
            select: "insName",
          })
          .populate({
            path: "insUserLike",
            select: "userLegalName",
          });
        if (insPost) {
          if (insPost.CreatePostStatus === "Private") {
            posts.push(insPost);
          } else {
          }
        }
      }
    }
    posts = posts.concat(userPosts);
    posts = posts.concat(insPosts);
    posts = posts.sort((dateA, dateB) => dateB.createdAt - dateA.createdAt);
    posts = posts.slice(skip, skip + limit);
    res.status(200).send({
      data: posts,
    });
  } catch (e) {
    console.log(
      `${e} SomeThing Went Wrong at this EndPoint (/getUserPostDashboard)`
    );
  }
};
////.....................new ......9 may

exports.likeCommentUser = async (req, res) => {
  try {
    const insCommentId = req.params.cid;
    const id = req.params.id;
    const comment = await UserComment.findById(insCommentId);
    if (!comment.parentCommentLike.includes(id)) {
      comment.parentCommentLike.push(id);
      comment.allLikeCount = comment.allLikeCount + 1;
      await comment.save();
      res
        .status(200)
        .send({ message: "liked by User", count: comment.allLikeCount });
    } else {
      comment.parentCommentLike.pull(id);
      comment.allLikeCount = comment.allLikeCount - 1;
      await comment.save();
      res
        .status(200)
        .send({ message: "diliked by user", count: comment.allLikeCount });
    }
    res
      .status(200)
      .send({ message: "login first to like ", count: comment.allLikeCount });
  } catch (e) {
    console.log(`error ${e}`);
  }
};

exports.getUserPostCommentReplyInLimit = async (req, res) => {
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
    // if()
    // const allComment=[]
    const replyComment = userPagination(comment.childComment);
    res.status(200).send({ replyComment });
  } catch (e) {
    console.log(e);
  }
  // try {
  //   const page = req.params.page * 1 || 1;
  //   const limit = req.params.limit * 1 || 10;
  //   const postId = req.params.id;
  //   const skip = (page - 1) * limit;
  //   const userPostId = await userPost.findById(postId);

  //   const comment = await UserComment.find({
  //     _id: { $in: userPostId.userComment },
  //   }).select("childComment");

  //   for (let i = 0; i < array.length; i++) {
  //     const element = array[i];

  //   }

  //   console.log(comment.childComment);
  //   const replyUserComment = await ReplyCommentUser.find({
  //     _id: { $in: comment.childComment },
  //   })
  //     .sort("-createdAt")
  //     .limit(limit)
  //     .skip(skip)
  //     .populate({
  //       path: "childComment",
  //     })
  //     .populate({
  //       path: "author",
  //       select: "userLegalName photoId profilePhoto ",
  //     });

  //   res.status(200).send({ message: "Sucess", replyUserComment });
  // } catch (e) {
  //   console.log(`Error`, e);
  // }
};
