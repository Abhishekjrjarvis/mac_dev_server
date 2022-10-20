const Post = require('../../models/Post')
const Poll = require('../../models/Question/Poll')
const User = require('../../models/User')
const InstituteAdmin = require('../../models/InstituteAdmin')

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

const replaceUser = (user) => {
    var updateUser = []
    user.filter((ele) => {
        if(!ele?.user_latitude && !ele?.user_longitude) return
        else{
            return updateUser.push(ele)
        }
    })
    return updateUser
}


exports.allUser = async(req, res) => {
    try{
        const user = await User.find({})
        .select('id user_latitude user_longitude')
        .lean()
        .exec()
        if(user?.length > 0){
            var validLUser = replaceUser(user)
            res.status(200).send({ message: 'All User Id', allIds: validLUser, count: validLUser?.length})
        }
    }
    catch{

    }
}

const replaceIns = (ins) => {
    var updateIns = []
    ins.filter((ele) => {
        if(!ele?.ins_latitude && !ele?.ins_longitude) return
        else{
            return updateIns.push(ele)
        }
    })
    return updateIns
}

exports.allIns = async(req, res) => {
    try{
        const ins = await InstituteAdmin.find({})
        .select('id ins_latitude ins_longitude')
        .lean()
        .exec()
        if(ins?.length > 0){
            var validLIns = replaceIns(ins)
            res.status(200).send({ message: 'All Ins Id', allIds: validLIns, count: validLIns?.length})
        }
    }
    catch{

    }
}