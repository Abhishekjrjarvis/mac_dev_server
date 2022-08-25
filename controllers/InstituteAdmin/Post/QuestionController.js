const User = require("../../../models/User");
const Post = require("../../../models/Post");
const InstituteAdmin = require('../../../models/InstituteAdmin')
const Poll = require('../../../models/Question/Poll')
const {
  uploadPostImageFile,
} = require("../../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const end_poll = require('../../../Service/close')

exports.postQuestionText = async (req, res) => {
    try {
        const { id } = req.params;
        const institute = await InstituteAdmin.findById({ _id: id })
          .populate({ path: "followers" })
          .populate({ path: "userFollowersList" })
          .populate({ path: "joinedUserList" });
        
        const post = new Post({ ...req.body });
        post.imageId = "1";
        if(req.files && req.files.length >= 1){
            for (let file of req.files) {
                const results = await uploadPostImageFile(file);
                post.postImage.push(results.Key);
                await unlinkFile(file.path);
            }
            post.imageId = "0";
        }
        institute.posts.push(post._id);
        institute.questionCount += 1;
        post.author = institute._id;
        post.authorName = institute.insName;
        post.authorUserName = institute.name;
        post.authorPhotoId = institute.photoId;
        post.authorProfilePhoto = institute.insProfilePhoto;
        post.isInstitute = 'institute'
        post.postType = 'Question'
        post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`
        await Promise.all([institute.save(), post.save()]);
        res.status(201).send({ message: "post Question is created", post });
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
        //   if (post.postStatus === "Private") {
        //     all.forEach(async (el) => {
        //       if (el._id !== institute._id) {
        //         el.posts.push(post._id);
        //         await el.save();
        //       }
        //     });
        //   }
        }
    } catch(e) {
      console.log(e)
    }
  };
  
exports.postQuestionDelete = async (req, res) => {
    try {
      const { id, pid } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id})
      await InstituteAdmin.findByIdAndUpdate(id, { $pull: { posts: pid } });
      await Post.findByIdAndDelete({ _id: pid });
      institute.questionCount -= 1
      await institute.save()
      res.status(200).send({ message: "post question deleted" });
    } catch(e) {
      console.log(e)
    }
  };
  

exports.retrievePollQuestionText = async (req, res) => {
    try {
        const { id } = req.params;
        const institute = await InstituteAdmin.findById({ _id: id })
          .populate({ path: "followers" })
          .populate({ path: "userFollowersList" })
          .populate({ path: "joinedUserList" });
        if(req.body.pollAnswer.length >= 2 && req.body.pollAnswer.length <= 4){
            const post = new Post({ ...req.body });
            var poll = new Poll({ ...req.body })
            for(let i=0; i< req.body.pollAnswer.length; i++){
                poll.poll_answer.push({
                    content: req.body.pollAnswer[i].content,
                })
            }
        post.imageId = "1";
        institute.posts.push(post._id);
        institute.pollCount += 1;
        post.author = institute._id;
        post.authorName = institute.insName;
        post.authorUserName = institute.name;
        post.authorPhotoId = institute.photoId;
        post.authorProfilePhoto = institute.insProfilePhoto;
        post.isInstitute = 'institute'
        post.postType = "Poll"
        post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`
        post.poll_query = poll._id
        poll.duration_date = end_poll(req.body.day)
        await Promise.all([institute.save(), post.save(), poll.save()]);
        res.status(201).send({ message: "poll is created", poll, post });
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
        }
    }
    else{
      res.status(422).send({ message: 'Not Valid Poll Option Min Max Critiriea'})
    }
    } catch (e){
        console.log(e)
    }
  };

