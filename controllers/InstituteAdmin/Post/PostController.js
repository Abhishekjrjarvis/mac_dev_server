const InstituteAdmin = require("../../../models/InstituteAdmin");
const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Comment = require("../../../models/Comment");
const Poll = require("../../../models/Question/Poll");
const ReplyComment = require("../../../models/ReplyComment/ReplyComment");
const {
  uploadVideo,
  uploadPostImageFile,
} = require("../../../S3Configuration");

const fs = require("fs");
const util = require("util");
// const { random_list_generator } = require("../../../Utilities/randomFunction");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../../Firebase/firebase");
const Notification = require("../../../models/notification");
// const encryptionPayload = require("../../../Utilities/Encrypt/payload");

exports.postWithText = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" })
      .populate({ path: "joinedUserList" });
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
    institute.posts.push(post._id);
    institute.postCount += 1;
    post.author = institute._id;
    post.authorName = institute.insName;
    post.authorUserName = institute.name;
    post.authorPhotoId = institute.photoId;
    post.authorProfilePhoto = institute.insProfilePhoto;
    post.authorOneLine = institute.one_line_about;
    post.authorFollowersCount = institute.followersCount;
    post.isInstitute = "institute";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([institute.save(), post.save()]);
    // const postEncrypt = await encryptionPayload(post);
    res.status(201).send({ message: "post is create", post });
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
    if (Array.isArray(req.body?.people)) {
      if (post?.tagPeople?.length) {
        for (let instit of req.body?.people) {
          const institTag = await InstituteAdmin.findById(instit.tagId)
            .populate({ path: "followers" })
            .populate({ path: "userFollowersList" });
          // .populate({ path: "joinedUserList" });
          if (institTag?.posts.includes(post._id)) {
          } else {
            institTag.posts?.push(post._id);
          }
          institTag.tag_post?.push(post._id);
          if (post.postStatus === "Anyone") {
            institTag?.followers?.forEach(async (ele) => {
              if (ele?.posts?.includes(post._id)) {
              } else {
                ele.posts.push(post._id);
                await ele.save();
              }
            });
            institTag?.userFollowersList?.forEach(async (ele) => {
              if (ele?.userPosts?.includes(post._id)) {
              } else {
                ele.userPosts.push(post._id);
                await ele.save();
              }
            });
          }
          await institTag.save();
        }
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
    institute.posts.push(post._id);
    institute.postCount += 1;
    post.author = institute._id;
    post.authorName = institute.insName;
    post.authorUserName = institute.name;
    post.authorPhotoId = institute.photoId;
    post.authorProfilePhoto = institute.insProfilePhoto;
    post.authorOneLine = institute.one_line_about;
    post.authorFollowersCount = institute.followersCount;
    post.isInstitute = "institute";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([institute.save(), post.save()]);
    // const postEncrypt = await encryptionPayload(post);
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
    if (Array.isArray(taggedPeople)) {
      if (post?.tagPeople?.length) {
        for (let instit of taggedPeople) {
          const institTag = await InstituteAdmin.findById(instit.tagId)
            .populate({ path: "followers" })
            .populate({ path: "userFollowersList" });
          if (institTag?.posts.includes(post._id)) {
          } else {
            institTag.posts?.push(post._id);
          }
          institTag.tag_post?.push(post._id);
          if (post.postStatus === "Anyone") {
            institTag?.followers?.forEach(async (ele) => {
              if (ele?.posts?.includes(post._id)) {
              } else {
                ele.posts.push(post._id);
                await ele.save();
              }
            });
            institTag?.userFollowersList?.forEach(async (ele) => {
              if (ele?.userPosts?.includes(post._id)) {
              } else {
                ele.userPosts.push(post._id);
                await ele.save();
              }
            });
          }
          await institTag.save();
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.postWithImageAPK = async (req, res) => {
  try {
    const { id } = req.params;
    const { postImageCount } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" })
      .populate({ path: "joinedUserList" });
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
    for (var i = 1; i <= parseInt(postImageCount); i++) {
      var fileValue = req?.files[`file${i}`];
      for (let file of fileValue) {
        const results = await uploadPostImageFile(file);
        post.postImage.push(results.Key);
        await unlinkFile(file.path);
      }
    }
    post.imageId = "0";
    institute.posts.push(post._id);
    institute.postCount += 1;
    post.author = institute._id;
    post.authorName = institute.insName;
    post.authorUserName = institute.name;
    post.authorPhotoId = institute.photoId;
    post.authorProfilePhoto = institute.insProfilePhoto;
    post.authorOneLine = institute.one_line_about;
    post.authorFollowersCount = institute.followersCount;
    post.isInstitute = "institute";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([institute.save(), post.save()]);
    // const postEncrypt = await encryptionPayload(post);
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
    if (Array.isArray(taggedPeople)) {
      if (post?.tagPeople?.length) {
        for (let instit of taggedPeople) {
          const institTag = await InstituteAdmin.findById(instit.tagId)
            .populate({ path: "followers" })
            .populate({ path: "userFollowersList" });
          if (institTag?.posts.includes(post._id)) {
          } else {
            institTag.posts?.push(post._id);
          }
          institTag.tag_post?.push(post._id);
          if (post.postStatus === "Anyone") {
            institTag?.followers?.forEach(async (ele) => {
              if (ele?.posts?.includes(post._id)) {
              } else {
                ele.posts.push(post._id);
                await ele.save();
              }
            });
            institTag?.userFollowersList?.forEach(async (ele) => {
              if (ele?.userPosts?.includes(post._id)) {
              } else {
                ele.userPosts.push(post._id);
                await ele.save();
              }
            });
          }
          await institTag.save();
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.postWithVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({ path: "followers" })
      .populate({ path: "userFollowersList" })
      .populate({ path: "joinedUserList" });
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
    post.postVideo.key = results.Key;
    post.postVideo.extension = req?.file?.mimeType;
    post.imageId = "1";
    institute.posts.push(post._id);
    institute.postCount += 1;
    post.author = institute._id;
    post.authorName = institute.insName;
    post.authorUserName = institute.name;
    post.authorPhotoId = institute.photoId;
    post.authorProfilePhoto = institute.insProfilePhoto;
    post.authorOneLine = institute.one_line_about;
    post.authorFollowersCount = institute.followersCount;
    post.isInstitute = "institute";
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([institute.save(), post.save()]);
    await unlinkFile(file.path);
    // const postEncrypt = await encryptionPayload(post);
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
    if (Array.isArray(taggedPeople)) {
      if (post?.tagPeople?.length) {
        for (let instit of taggedPeople) {
          const institTag = await InstituteAdmin.findById(instit.tagId)
            .populate({ path: "followers" })
            .populate({ path: "userFollowersList" });
          if (institTag?.posts.includes(post._id)) {
          } else {
            institTag.posts?.push(post._id);
          }
          institTag.tag_post?.push(post._id);
          if (post.postStatus === "Anyone") {
            institTag?.followers?.forEach(async (ele) => {
              if (ele?.posts?.includes(post._id)) {
              } else {
                ele.posts.push(post._id);
                await ele.save();
              }
            });
            institTag?.userFollowersList?.forEach(async (ele) => {
              if (ele?.userPosts?.includes(post._id)) {
              } else {
                ele.userPosts.push(post._id);
                await ele.save();
              }
            });
          }
          await institTag.save();
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
    res.status(200).send({ message: "visibility change 👓" });
    //
    const post_visible = await Post.findById({ _id: pid }).select("postStatus");
    const author = await InstituteAdmin.findById({ _id: `${post.author}` })
      .select("id isUniversal")
      .populate({ path: "followers", select: "posts" })
      .populate({ path: "userFollowersList", select: "userPosts" })
      .populate({ path: "joinedUserList", select: "userPosts" });
    if (author.isUniversal === "Not Assigned") {
      if (author.followers.length >= 1) {
        if (post_visible.postStatus === "Anyone") {
          author.followers.forEach(async (ele) => {
            if (ele?.posts?.includes(`${post_visible._id}`)) {
            } else {
              ele.posts.push(post_visible._id);
              await ele.save();
            }
          });
        } else if (post_visible.postStatus === "Private") {
          author.followers.forEach(async (ele) => {
            if (ele?.posts?.includes(`${post_visible._id}`)) {
              ele.posts.pull(post_visible._id);
              await ele.save();
            } else {
            }
          });
        }
      }
      if (author.userFollowersList.length >= 1) {
        if (post_visible.postStatus === "Anyone") {
          author.userFollowersList.forEach(async (ele) => {
            if (ele?.userPosts?.includes(`${post_visible._id}`)) {
            } else {
              ele.userPosts.push(post_visible._id);
              await ele.save();
            }
          });
        } else if (post_visible.postStatus === "Private") {
          if (author.joinedUserList.length >= 1) {
            author.joinedUserList.forEach(async (ele) => {
              if (ele?.userPosts?.includes(`${post_visible._id}`)) {
              } else {
                ele.userPosts.push(post_visible._id);
                await ele.save();
              }
            });
          }
          author.userFollowersList.forEach(async (ele) => {
            if (ele?.userPosts?.includes(`${post_visible._id}`)) {
              ele.userPosts.pull(post_visible._id);
              await ele.save();
            } else {
            }
          });
        }
      }
    } else if (author.isUniversal === "Universal") {
      const all = await InstituteAdmin.find({ status: "Approved" }).select(
        "posts"
      );
      const user = await User.find({ userStatus: "Approved" }).select(
        "userPosts"
      );
      if (post_visible.postStatus === "Anyone") {
        all.forEach(async (el) => {
          if (el._id !== author._id) {
            if (el?.posts?.includes(`${post_visible._id}`)) {
            } else {
              el.posts.push(post_visible._id);
              await el.save();
            }
          }
        });
        user.forEach(async (el) => {
          if (el?.userPosts?.includes(`${post_visible._id}`)) {
          } else {
            el.userPosts.push(post_visible._id);
            await el.save();
          }
        });
      }
      if (post_visible.postStatus === "Private") {
        all.forEach(async (el) => {
          if (el._id !== author._id) {
            if (el?.posts?.includes(`${post_visible._id}`)) {
            } else {
              el.posts.push(post_visible._id);
              await el.save();
            }
          }
        });
        user.forEach(async (el) => {
          if (author?.joinedUserList?.includes(`${el}`)) {
            if (el?.userPosts?.includes(`${post_visible._id}`)) {
            } else {
              el.userPosts.push(post_visible._id);
              await el.save();
            }
          } else {
            if (el?.userPosts?.includes(`${post_visible._id}`)) {
              el.userPosts.pull(post_visible._id);
              await el.save();
            } else {
            }
          }
        });
      }
    }
    //
  } catch (e) {
    console.log(e);
  }
};

exports.postWithDeleted = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).select(
      "postCount pollCount isUniversal"
    );
    const post = await Post.findById({ _id: pid })
      .select("postType")
      .populate({ path: "poll_query", select: "id" });
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { posts: pid } });
    await InstituteAdmin.findByIdAndUpdate(id, {
      $pull: { institute_saved_post: pid },
    });
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { tag_post: pid } });
    if (institute.postCount >= 1) {
      institute.postCount -= 1;
    }
    if (post && post.postType === "Poll" && post.poll_query !== "") {
      await Poll.findByIdAndDelete(post?.poll_query?._id);
      if (institute.pollCount >= 1) {
        institute.pollCount -= 1;
      }
    }
    await Post.findByIdAndDelete({ _id: pid });
    await institute.save();
    res.status(200).send({ message: "Deletion Operation Completed 🙄🙄" });
    //
    const deleted_ins_post = await InstituteAdmin.findById({
      _id: institute?._id,
    })
      .select("isUniversal")
      .populate({
        path: "followers",
        select: "posts institute_saved_post tag_post",
      })
      .populate({
        path: "userFollowersList",
        select: "userPosts user_saved_post tag_post",
      })
      .populate({
        path: "joinedUserList",
        select: "userPosts user_saved_post tag_post",
      });

    if (deleted_ins_post?.isUniversal === "Universal") {
      const all_ins = await InstituteAdmin.find({}).select(
        "posts institute_saved_post tag_post"
      );
      const all_user = await User.find({}).select(
        "userPosts user_saved_post tag_post"
      );
      all_ins?.forEach(async (ins) => {
        if (ins?.posts?.includes(`${post._id}`)) {
          ins?.posts?.pull(post._id);
          await ins.save();
        }
        if (ins?.institute_saved_post?.includes(`${post._id}`)) {
          ins?.institute_saved_post?.pull(post._id);
          await ins.save();
        }
        if (ins?.tag_post?.includes(`${post._id}`)) {
          ins?.tag_post?.pull(post._id);
          await ins.save();
        }
      });
      all_user?.forEach(async (user) => {
        if (user?.userPosts?.includes(`${post._id}`)) {
          user?.userPosts?.pull(post._id);
          await user.save();
        }
        if (user?.user_saved_post?.includes(`${post._id}`)) {
          user?.user_saved_post?.pull(post._id);
          await user.save();
        }
        if (user?.tag_post?.includes(`${post._id}`)) {
          user?.tag_post?.pull(post._id);
          await user.save();
        }
      });
    } else if (deleted_ins_post?.isUniversal === "Not Assigned") {
      deleted_ins_post?.followers?.forEach(async (del_ins) => {
        if (del_ins?.posts?.includes(`${post?._id}`)) {
          del_ins?.posts?.pull(post._id);
          await del_ins.save();
        }
        if (del_ins?.institute_saved_post?.includes(`${post?._id}`)) {
          del_ins?.institute_saved_post?.pull(post._id);
          await del_ins.save();
        }
        if (del_ins?.tag_post?.includes(`${post?._id}`)) {
          del_ins?.tag_post?.pull(post._id);
          await del_ins.save();
        }
      });
      deleted_ins_post?.userFollowersList?.forEach(async (del_user) => {
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
      deleted_ins_post?.joinedUserList?.forEach(async (del_suser) => {
        if (del_suser?.userPosts?.includes(`${post?._id}`)) {
          del_suser?.userPosts?.pull(post._id);
          await del_suser.save();
        }
        if (del_suser?.user_saved_post?.includes(`${post?._id}`)) {
          del_suser?.user_saved_post?.pull(post._id);
          await del_suser.save();
        }
        if (del_suser?.tag_post?.includes(`${post?._id}`)) {
          del_suser?.tag_post?.pull(post._id);
          await del_suser.save();
        }
      });
    } else {
    }
    //
  } catch (e) {
    console.log(e);
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
        // const likeEncrypt = await encryptionPayload(post.likeCount);
        res
          .status(200)
          .send({ message: "Removed from Likes", likeCount: post.likeCount });
      } else {
        post.endUserLike.push(institute_session);
        post.likeCount += 1;
        await post.save();
        // const likeEncrypt = await encryptionPayload(post.likeCount);
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
        // const likeEncrypt = await encryptionPayload(post.likeCount);
        res
          .status(200)
          .send({ message: "Removed from Likes", likeCount: post.likeCount });
      } else {
        post.endUserLike.push(user_session);
        post.likeCount += 1;
        await post.save();
        // const likeEncrypt = await encryptionPayload(post.likeCount);
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
        institute?.institute_saved_post?.pull(post._id);
        await Promise.all([post.save(), institute.save()]);
        res.status(200).send({ message: "Removed from Favourites" });
      } else {
        post.endUserSave.push(institute_session);
        institute?.institute_saved_post?.push(post._id);
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
  } catch (e) {
    console.log(e);
  }
};

exports.postComment = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById({ _id: id });
    if (post.comment_turned === "Off")
      return res
        .status(200)
        .send({ message: "Comments are turned off", off: true });
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
      const user = await User.findById({ _id: req.tokenData.userId });
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
    // const commentEncrypt = await encryptionPayload(comment);
    res.status(201).send({ message: "comment created", comment });
    var notify = new Notification({});
    var author_ins = await InstituteAdmin.findById({ _id: `${post.author}` });
    if (`${comment.author}` === `${author_ins._id}`) {
      notify.notifyContent = `you shared a new comment`;
    } else {
      notify.notifyContent = `${comment.authorName} commented on your post`;
      notify.notify_hi_content = `${comment.authorName} ने आपकी पोस्ट पर कमेन्ट की |`;
      notify.notify_mr_content = `${comment.authorName} ने तुमच्या पोस्टवर कमेन्ट केली`;
    }
    notify.notifySender = req.tokenData?.userId
      ? req.tokenData.userId
      : req.tokenData?.insId
      ? req.tokenData.insId
      : "";
    notify.notifyReceiever = author_ins._id;
    notify.notifyCategory = "Comment";
    author_ins.iNotify.push(notify._id);
    notify.institute = author_ins._id;
    if (req?.tokenData?.userId) {
      notify.notifyByPhoto = req?.tokenData?.userId;
    } else if (req?.tokenData?.insId) {
      notify.notifyByInsPhoto = req?.tokenData?.insId;
    }
    if (`${comment.author}` === `${author_ins._id}`) {
    } else {
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
  } catch (e) {
    console.log("ICN", e);
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
            "postTitle postText postDescription comment_turned isHelpful questionCount pollCount needCount needUser isNeed needUser postQuestion authorFollowersCount authorOneLine tagPeople answerCount answerUpVoteCount isUser isInstitute postType trend_category endUserSave createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
          )
          .populate({
            path: "poll_query",
          })
          .populate({
            path: "new_application",
            select:
              "applicationSeats applicationStartDate applicationPhoto photoId applicationEndDate applicationAbout applicationStatus admissionFee applicationName",
            populate: {
              path: "applicationDepartment",
              select: "dName",
            },
          })
          .populate({
            path: "new_announcement",
            select: "insAnnTitle insAnnDescription",
          });
      } else {
        var post = await Post.find({
          $and: [{ _id: { $in: institute.posts } }],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postDescription comment_turned isHelpful needCount questionCount pollCount needUser isNeed postQuestion authorOneLine authorFollowersCount tagPeople answerCount answerUpVoteCount isUser isInstitute postType trend_category endUserSave createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
          )
          .populate({
            path: "poll_query",
          })
          .populate({
            path: "new_application",
            select:
              "applicationSeats applicationStartDate applicationPhoto photoId applicationEndDate applicationAbout applicationStatus admissionFee applicationName",
            populate: {
              path: "applicationDepartment",
              select: "dName",
            },
          })
          .populate({
            path: "new_announcement",
            select: "insAnnTitle insAnnDescription",
          });
      }
      if (institute.posts.length >= 1) {
        const postCount = await Post.find({ _id: { $in: institute.posts } });
        if (page * limit >= postCount.length) {
        } else {
          var totalPage = page + 1;
        }
        // Add Another Encryption
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
        "postTitle postText postDescription comment_turned isHelpful needCount questionCount pollCount needUser isNeed postQuestion authorOneLine authorFollowersCount tagPeople answerCount answerUpVoteCount isUser isInstitute postType trend_category endUserSave createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
      )
      .populate({
        path: "poll_query",
      })
      .populate({
        path: "new_application",
        select:
          "applicationSeats applicationStartDate applicationPhoto photoId applicationEndDate applicationAbout applicationStatus admissionFee applicationName",
        populate: {
          path: "applicationDepartment",
          select: "dName",
        },
      })
      .populate({
        path: "new_announcement",
        select: "insAnnTitle insAnnDescription",
      });
    if (institute && institute?.posts?.length >= 1) {
      var postCount = await Post.find({ _id: { $in: institute.posts } });
      if (page * limit >= postCount.length) {
      } else {
        var totalPage = page + 1;
      }
      // Add Another Encryption
      res.status(200).send({
        message: "Success",
        post,
        postCount: postCount.length,
        totalPage: totalPage,
      });
    } else {
      res.status(200).send({
        message: "Failure",
        post,
        postCount: postCount?.length ?? 0,
        totalPage: totalPage ?? 0,
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
    // const commentEncrypt = await encryptionPayload(comment);
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
      res.status(204).send({ message: "no any child" });
    }
    const replyComment = userPagination(comment.childComment);
    // const commentEncrypt = await encryptionPayload(replyComment);
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
        authorOneLine: institute.one_line_about,
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
        authorOneLine: institutes.one_line_about,
      };
      // Add Another Encryption
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
        authorOneLine: users.one_line_about,
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
        authorOneLine: user.one_line_about,
      };
      // Add Another Encryption
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
        // const likeEncrypt = await encryptionPayload(comment.allLikeCount);
        res.status(200).send({
          message: "liked by Institute",
          allLikeCount: comment.allLikeCount,
        });
      } else {
        comment.parentCommentLike.pull(id);
        if (comment.allLikeCount >= 1) {
          comment.allLikeCount -= 1;
        }
        await comment.save();
        // const likeEncrypt = await encryptionPayload(comment.allLikeCount);
        res.status(200).send({
          message: "diliked by Institute",
          allLikeCount: comment.allLikeCount,
        });
      }
    } else if (req.tokenData && req.tokenData.userId) {
      if (!comment.parentCommentLike.includes(id)) {
        comment.parentCommentLike.push(id);
        comment.allLikeCount += 1;
        await comment.save();
        // const likeEncrypt = await encryptionPayload(comment.allLikeCount);
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
        // const likeEncrypt = await encryptionPayload(comment.allLikeCount);
        res.status(200).send({
          message: "diliked by user",
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
  // const reactionEncrypt = await encryptionPayload(reactionList);
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
      .select("insName insProfilePhoto photoId name tag_privacy")
      .limit(itemPerPage)
      .skip(dropItem)
      .lean()
      .exec();

    // const tagInstituteList = random_list_generator(tagInstitute);
    // const tagEncrypt = await encryptionPayload(tagInstitute);
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
          "postTitle postText postDescription isHelpful needCount needUser questionCount pollCount isNeed endUserSave authorOneLine authorFollowersCount tagPeople createdAt postType postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
        )
        .populate({
          path: "poll_query",
        })
        .populate({
          path: "new_application",
          select:
            "applicationSeats applicationStartDate applicationPhoto photoId applicationEndDate applicationAbout applicationStatus admissionFee applicationName",
          populate: {
            path: "applicationDepartment",
            select: "dName",
          },
        })
        .populate({
          path: "new_announcement",
          select: "insAnnTitle insAnnDescription",
        });
      if (institute.institute_saved_post.length >= 1) {
        const postCount = await Post.find({
          _id: { $in: institute.institute_saved_post },
        });
        if (page * limit >= postCount.length) {
        } else {
          var totalPage = page + 1;
        }
        // Add Another Encryption
        res.status(200).send({
          message: "Success",
          post: post.reverse(),
          postCount: postCount.length,
          totalPage: totalPage,
        });
      }
    } else {
      res.status(204).send({ message: "No Posts Yet...", post: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveTagAllPosts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const id = req.params.id;
    const skip = (page - 1) * limit;
    const institute = await InstituteAdmin.findById(id)
      .select("id")
      .populate({ path: "tag_post" });
    if (institute && institute.tag_post.length >= 1) {
      const post = await Post.find({
        _id: { $in: institute.tag_post },
      })
        .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select(
          "postTitle postText postDescription isHelpful needCount needUser questionCount pollCount isNeed endUserSave tagPeople authorFollowersCount authorOneLine createdAt postType postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto endUserLike"
        )
        .populate({
          path: "poll_query",
        })
        .populate({
          path: "new_application",
          select:
            "applicationSeats applicationStartDate applicationPhoto photoId applicationEndDate applicationAbout applicationStatus admissionFee applicationName",
          populate: {
            path: "applicationDepartment",
            select: "dName",
          },
        })
        .populate({
          path: "new_announcement",
          select: "insAnnTitle insAnnDescription",
        });
      if (institute.tag_post.length >= 1) {
        const postCount = await Post.find({
          _id: { $in: institute.tag_post },
        });
        if (page * limit >= postCount.length) {
        } else {
          var totalPage = page + 1;
        }
        // Add Another Encryption
        res.status(200).send({
          message: "Success Tag Post",
          post,
          postCount: postCount.length,
          totalPage: totalPage,
        });
      }
    } else {
      res.status(204).send({ message: "No Posts Yet...", post: [] });
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
    const post = await Post.findById(comment.post);
    if (post.commentCount >= 1) {
      post.commentCount -= 1;
    }
    await post.save();
    await Comment.findByIdAndDelete(req.params.cid);
    res.status(200).send({ message: "Comment Deleted successfully👍" });
  } catch (e) {
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
