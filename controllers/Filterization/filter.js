const Post = require('../../models/Post')
const Poll = require('../../models/Question/Poll')


exports.retrieveByLearnQuery = async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const category = req.query.filter_by ? req.query.filter_by : "";
      const skip = (page - 1) * limit;
      var post = await Post.find({ postType: 'Repost' })
        .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select(
          "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
        )
        .populate({
          path: "rePostAnswer",
          populate: {
            path: 'post',
            select: 'postQuestion authorProfilePhoto authorUserName author authorPhotoId isUser'
          }
        })
        if(post?.length < 1){
            res.status(200).send({ message: 'filter By Learn', filteredLearn: [] })
        }
        else{
            res.status(200).send({ message: 'filter By Learn', filteredLearn: post })
        }
    } catch (e) {
      console.log(e);
    }
};



exports.retrieveByAnswerQuery = async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const category = req.query.filter_by ? req.query.filter_by : "";
      const skip = (page - 1) * limit;
      if(category !== ''){
        var post = await Post.find({ $and: [{ trend_category: `${category}` }, { postType: 'Question' }] })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
          )
      }
      else{
        var post = await Post.find({ postType: 'Question' })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
          )
      }
      if(post?.length < 1){
        res.status(200).send({ message: 'filter By Answer', filteredQuestion: [] })
      }
      else{
          res.status(200).send({ message: 'filter By Answer', filteredQuestion: post })
      }
        
    } catch (e) {
      console.log(e);
    }
};
  


exports.retrieveByParticipateQuery = async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const category = req.query.filter_by ? req.query.filter_by : "";
      const skip = (page - 1) * limit;
      if(category !== ''){
        var post = await Post.find({ $and: [{ trend_category: `${category}` }, { postType: 'Poll' }] })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
          )
          .populate({
            path: "poll_query",
          })
      }
      else{
        var post = await Post.find({ $and: [{ trend_category: `${category}` }, { postType: 'Poll' }] })
        .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select(
          "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
        )
        .populate({
          path: "poll_query",
        })
      }
      if(post?.length < 1){
        res.status(200).send({ message: 'filter By Participate', filteredPoll: [] })
      }
      else{
          res.status(200).send({ message: 'filter By Participate', filteredPoll: post})
      }
    } catch (e) {
      console.log(e);
    }
};