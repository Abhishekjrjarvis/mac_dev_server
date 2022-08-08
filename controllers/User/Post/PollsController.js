const User = require("../../../models/User");
const Post = require("../../../models/Post");
const Poll = require('../../../models/Question/Poll')

exports.retrievePollQuestionText = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
    .populate({ path: 'userFollowers'})
    .populate({ path: 'userCircle'})
    const post = new Post({ ...req.body });
    var poll = new Poll({ ...req.body })
    for(let i=0; i< req.body.pollAnswer.length; i++){
        poll.poll_answer.push({
            content: req.body.pollAnswer[i].content,
        })
    }
    post.imageId = "1";
    user.userPosts.push(post._id);
    user.pollCount += 1
    post.author = user._id;
    post.authorName = user.userLegalName
    post.authorUserName = user.username
    post.authorPhotoId = user.photoId
    post.authorProfilePhoto = user.profilePhoto
    post.isUser = 'user'
    post.postType = "Poll"
    post.poll_query = poll._id
    await Promise.all([user.save(), post.save(), poll.save()]);
    res.status(201).send({ message: "Poll is create", poll });
    if(user.userFollowers.length >= 1){
        user.userFollowers.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
    }
    if(user.userCircle.length >= 1){
        user.userCircle.forEach(async (ele) => {
          ele.userPosts.push(post._id)
          await ele.save()
        })
    }
  } catch {}
};

exports.pollLike = async (req, res) => {
  try {
    const { pid } = req.params;
    const { answerId } = req.body
    const user_session = req.tokenData && req.tokenData.userId ? req.tokenData.userId : ''
    const post = await Post.findById({ _id: pid });
    const poll = await Poll.findById({ _id: `${post.poll_query}`})
    if(user_session){
        for(let i=0; i< poll.poll_answer.length; i++){
            if(`${poll.poll_answer[i]._id}` === `${answerId}`){
                if ( poll.poll_answer[i].users.length >= 1 && poll.poll_answer[i].users.includes(String(user_session))) {
                    poll.poll_answer[i].users.pull(user_session);
                    poll.userPollCount -= 1
                    poll.poll_answer[i].percent_vote = (poll.poll_answer[i].users.length / poll.userPollCount) * 100
                    if (poll.total_votes >= 1) {
                        poll.total_votes -= 1;
                    }
                    await poll.save();
                    res.status(200).send({ message: "Removed from Poll", voteAtPoll: poll.total_votes });
                } else {
                    poll.poll_answer[i].users.push(user_session);
                    poll.userPollCount += 1
                    poll.poll_answer[i].percent_vote = (poll.poll_answer[i].users.length / poll.userPollCount) * 100
                    poll.total_votes += 1;
                    await poll.save();
                    res.status(200).send({ message: "Added To Poll", voteAtPoll: poll.total_votes });
                }
            }
        }
        for(let i=0; i< poll.poll_answer.length; i++){
          poll.poll_answer[i].percent_vote = (poll.poll_answer[i].users.length / poll.userPollCount) * 100
          await poll.save()
        }
    }
    else {
        res.status(401).send();
    }
  } catch(e) {
    console.log(e)
  }
};

