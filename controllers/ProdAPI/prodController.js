const Post = require('../../models/Post')
const Poll = require('../../models/Question/Poll')

exports.allPosts = async(req, res) => {
    try{
        const post = await Post.find({ $and: [{ postType: 'Repost'}, { authorUserName: 'ankush123'}]})
        .select('id authorUserName postType trend_category')
        .sort('-createdAt')
        .lean()
        .exec()
        res.status(200).send({ message: 'All Post Id', allIds: post, count: post?.length})
    }
    catch{

    }
}

exports.allPolls = async(req, res) => {
    try{
        // const { query } = req.query
        const poll = await Poll.find({})
        .select('id poll_status duration_date poll_question')
        .lean()
        .exec()
        res.status(200).send({ message: 'All Poll Id', allIds: poll, count: poll?.length})
    }
    catch{

    }
}