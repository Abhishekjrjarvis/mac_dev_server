const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
const userPost = require("../../models/userPost");
const post = require("../../models/Post");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");

exports.searchIns = async (req, res) => {
  try {
    const ins = await InstituteAdmin.find({});
    ins.insPassword;
    res.status(200).send({
      data: ins,
    });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint (/getsearchIns)`);
  }
};

exports.searchUser = async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).send({
      data: user,
    });
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
    await user.userPosts;
    console.log(user.userPosts);
    const userPosts = await userPost.find({ _id: { $in: user.userPosts } });
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
    const postIds = ins.posts;

    for (let i = 0; i < ins.following.length; i++) {
      const element = ins.following[i];
      const postid = await InstituteAdmin.findById(element);
      postIds.push(postid);
    }
    const postdata = await post
      .find(
        { _id: { $in: postIds } }
        // { createdAt: { $gte: Date.now.toISOString() } }
      )
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
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
        select: "commentDesc createdAt ",
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
      .sort({ createdAt: -1 })
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
        select: "commentDesc createdAt ",
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
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
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
        select: "commentDesc createdAt ",
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
    const userId = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(userId);
    const selfPosts = await userPost
      .find({ _id: { $in: user.userPosts } })
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate({ path: "userComment", populate: { path: "users" } });
    res.status(200).send({ message: "selfPosts data", selfPosts });
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.getUserSavePostInLimit = async (req, res) => {
  try {
    const page = req.params.page * 1 || 1;
    const limit = req.params.limit * 1 || 10;
    const userId = req.params.id;
    const skip = (page - 1) * limit;
    const user = await User.findById(userId);
    const userSavePosts = await userPost
      .find({ _id: { $in: user.saveUsersPost } })
      .sort({ createdAt: -1 })
      .populate({ path: "userComment", populate: { path: "users" } });

    const insSavePosts = await post
      .find({ _id: { $in: user.saveUserInsPost } })
      .sort({ createdAt: -1 })
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
        select: "commentDesc createdAt ",
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

    let savePosts = userSavePosts;
    savePosts = savePosts.concat(insSavePosts);
    // const posts = institute.posts.slice(skip, skip + limit);
    savePosts = savePosts.slice(skip, skip + limit);
    savePosts = savePosts.sort(
      (dateA, dateB) => dateB.createdAt - dateA.createdAt
    );
    res.status(200).send({ message: "InsSavePosts data", savePosts });
  } catch (e) {
    console.log(`Error`, e);
  }
};
//..............................Done..................................//

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
    console.log(user.staff);

    for (let i = 0; i < user.staff.length; i++) {
      const element = user.staff[i];
      const staffDate = await Staff.findById(element);
      const ins = await InstituteAdmin.findById(staffDate.institute);
      studentInsPostsPrivate = studentInsPostsPrivate.concat(ins.posts);
    }

    for (let i = 0; i < user.student.length; i++) {
      const element = user.student[i];
      const studentDate = await Student.findById(element);
      const ins = await InstituteAdmin.findById(studentDate.institute);
      staffInsPostsPrivate = staffInsPostsPrivate.concat(ins.posts);
    }

    showPrivatePost = showPrivatePost.concat(studentInsPostsPrivate);
    showPrivatePost = showPrivatePost.concat(staffInsPostsPrivate);

    for (let i = 0; i < userFollowing.length; i++) {
      const element = userFollowing[i];
      const users = await User.findById(element);
      const postArr = [];
      for (let i = 0; i < users.userPosts.length; i++) {
        const element = users.userPosts[i];
        const follPosts = await userPost
          .findById(element)
          .populate({ path: "userComment", populate: { path: "users" } });
        if (follPosts.userPostStatus === "Private") {
        } else {
          postArr.push(element);
        }
      }

      followingPost = followingPost.concat(postArr);
    }
    for (let i = 0; i < user.userCircle.length; i++) {
      const element = user.userCircle[i];
      const users = await User.findById(element);
      circlePost = circlePost.concat(users.userPosts);
    }

    for (let i = 0; i < user.userInstituteFollowing.length; i++) {
      const element = user.userInstituteFollowing[i];
      const instituteAdmin = await InstituteAdmin.findById(element);
      insPostId = insPostId.concat(instituteAdmin.posts);
    }
    let userPostsId = [];
    userPostsId = userPostsId.concat(selfPost);
    userPostsId = userPostsId.concat(followingPost);
    userPostsId = userPostsId.concat(circlePost);

    let userPosts = [];
    let insPosts = [];
    let posts = await userPost
      .find({ _id: { $in: user.saveUsersPost } })
      .sort({ createdAt: -1 })
      .populate({ path: "userComment", populate: { path: "users" } });


    for (let i = 0; i < insPostId.length; i++) {
      const element = insPostId[i];
      const posts = await post
        .findById(element)
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
          select: "commentDesc createdAt ",
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
      if (posts.CreatePostStatus === "Private") {
      } else {
        insPosts.push(posts);
      }
    }

    for (let i = 0; i < showPrivatePost.length; i++) {
      const element = showPrivatePost[i];
      const insPost = await post
        .findById(element)
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
          select: "commentDesc createdAt ",
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
      if (insPost.CreatePostStatus === "Private") {
        posts.push(insPost);
      } else {
      }
    }

    posts = posts.concat(userPosts);
    posts = posts.concat(insPosts);
    posts = posts.slice(skip, skip + limit);
    posts = posts.sort((dateA, dateB) => dateB.createdAt - dateA.createdAt);
    res.status(200).send({
      data: posts,
    });
  } catch (e) {
    console.log(
      `${e} SomeThing Went Wrong at this EndPoint (/getUserPostDashboard)`
    );
  }
};
