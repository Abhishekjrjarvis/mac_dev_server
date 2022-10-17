const Post = require('../../models/Post')
const Poll = require('../../models/Question/Poll')
const Income = require('../../models/Income')
const Expense = require('../../models/Expense')
const InstituteAdmin = require('../../models/InstituteAdmin')
const Batch = require('../../models/Batch')

var trendingQuery = (trends, cat) => {
  if(cat !== ''){
    trends.forEach((ele, index) => {
      ele.hash_trend = `#${index + 1} on trending for ${ele.trend_category}`
    })
  }
  else{
    trends.forEach((ele, index) => {
      ele.hash_trend = `#${index + 1} on trending`
    })
  }
  return trends
}

var sortRepostUpvote = (rePost) => {
  return function(f_Re, s_Re) {
    return (f_Re[rePost]?.upVoteCount < s_Re[rePost]?.upVoteCount) - (f_Re[rePost]?.upVoteCount > s_Re[rePost]?.upVoteCount)
  };
}

var sortPollVote = (poll) => {
  return function(f_Po, s_Po) {
    return (f_Po[poll]?.total_votes < s_Po[poll]?.total_votes) - (f_Po[poll]?.total_votes > s_Po[poll]?.total_votes)
  };
}

exports.retrieveByLearnQuery = async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const skip = (page - 1) * limit;
      var post = await Post.find({ postType: 'Repost' })
        .limit(limit)
        .skip(skip)
        .select("postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType")
        .populate({
          path: "rePostAnswer",
          populate: {
            path: 'post',
            select: 'postQuestion authorProfilePhoto authorUserName author authorPhotoId isUser'
          },
        })
        if(post?.length < 1){
            res.status(200).send({ message: 'filter By Learn', filteredLearn: [] })
        }
        else{
            post.sort(sortRepostUpvote('rePostAnswer'))
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
          .sort("-needCount")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType hash_trend"
          )
      }
      else{
        var post = await Post.find({ postType: 'Question' })
          .sort("-needCount")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType hash_trend"
          )
      }
      if(data?.length < 1){
        res.status(200).send({ message: 'filter By Answer', filteredQuestion: [] })
      }
      else{
          var data = trendingQuery(post, category)
          res.status(200).send({ message: 'filter By Answer', filteredQuestion: data})
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
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
          )
          .populate({
            path: "poll_query"
          })
      }
      else{
        var post = await Post.find({ postType: 'Poll' })
        .limit(limit)
        .skip(skip)
        .select(
          "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
        )
        .populate({
          path: "poll_query"
        })
      }
      if(post?.length < 1){
        res.status(200).send({ message: 'filter By Participate', filteredPoll: [] })
      }
      else{
          var order_by_poll = post.sort(sortPollVote('poll_query'))
          var data = trendingQuery(order_by_poll, category)
          res.status(200).send({ message: 'filter By Participate', filteredPoll: data})
      }
    } catch (e) {
      console.log(e);
    }
};

exports.filterByDate = async(req, res) => {
  try{
    const { g_month, year, l_month } = req.query
    const user = await User.find({
      created_at: {
          $gte: new Date(`${year}-${g_month}-01T00:00:00.000Z`),
          $lt: new Date(`${year}-${l_month}-01T00:00:00.000Z`)
      }
    }).select('userLegalName username')
  res.status(200).send({ message: 'user', filter: user})
  }
  catch(e){
    console.log(e)
  }
}

exports.filterByDateIncomes = async(req, res) => {
  try{
    const { g_month, year, l_month, fid } = req.query
    var cash = 0
    var bank = 0
    const incomes = await Income.find({
      $and: [{
        createdAt: {
          $gte: new Date(`${year}-${g_month}-01T00:00:00.000Z`),
          $lt: new Date(`${year}-${l_month}-01T00:00:00.000Z`)
      }},
      {finances: fid}
      ]
    })
    if(incomes?.length >=1 ){
      incomes.forEach((val) => {
        if(`${val?.incomeAccount}` === 'By Cash'){
          cash += val?.incomeAmount
        }
        if(`${val?.incomeAccount}` === 'By Bank'){
          bank += val?.incomeAmount
        }
      })
    }
    var stats = {
      cash: cash,
      bank: bank,
      total: cash + bank
    }
    if(incomes?.length >= 1){
      res.status(200).send({ message: 'Filter Incomes', f_incomes: incomes, stats: stats})
    }
    else{
      res.status(200).send({ message: 'user', f_incomes: [], stats: { cash: 0, bank: 0, total: 0}})
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.filterByDateExpenses = async(req, res) => {
  try{
    const { g_month, year, l_month, fid } = req.query
    var cash = 0
    var bank = 0
    const expenses = await Expense.find({
      $and: [{
        createdAt: {
          $gte: new Date(`${year}-${g_month}-01T00:00:00.000Z`),
          $lt: new Date(`${year}-${l_month}-01T00:00:00.000Z`)
      }},
      {finances: fid}
      ]
    })
    if(expenses?.length >=1 ){
      expenses.forEach((val) => {
        if(`${val?.expenseAccount}` === 'By Cash'){
          cash += val?.expenseAmount
        }
        if(`${val?.expenseAccount}` === 'By Bank'){
          bank += val?.expenseAmount
        }
      })
    }
    var stats = {
      cash: cash,
      bank: bank,
      total: cash + bank
    }
    if(expenses?.length >= 1){
      res.status(200).send({ message: 'Filter Expenses', f_expenses: expenses, stats: stats})
    }
    else{
      res.status(200).send({ message: 'user', f_expenses: [], stats: { cash: 0, bank: 0, total: 0}})
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.retrieveByActiveStudent = async(req, res) => {
  try{
    const { id } = req.params
    const { type } = req.query
    var total = 0
    var filter_student = {
      boyCount: 0,
      girlCount: 0,
      otherCount: 0,
      generalCount: 0,
      obcCount: 0,
      scCount: 0,
      stCount: 0,
      ntaCount: 0,
      ntbCount: 0,
      ntcCount: 0
    }
    const filter_ins = await InstituteAdmin.findById({_id: id}).select('batches')
    if(type === 'Active'){
      const filter_batch = await Batch.find({ $and: [{ _id: { $in: filter_ins.batches }}, { activeBatch: 'Active' }]})
      .select('ApproveStudent student_category')

      filter_batch?.forEach((ele) => {
        total += ele?.ApproveStudent?.length
        filter_student.boyCount += ele?.student_category?.boyCount
        filter_student.girlCount += ele?.student_category?.girlCount
        filter_student.otherCount += ele?.student_category?.otherCount
        filter_student.generalCount += ele?.student_category?.generalCount
        filter_student.obcCount += ele?.student_category?.obcCount
        filter_student.scCount += ele?.student_category?.scCount
        filter_student.stCount += ele?.student_category?.stCount
        filter_student.ntaCount += ele?.student_category?.ntaCount
        filter_student.ntbCount += ele?.student_category?.ntbCount
        filter_student.ntcCount += ele?.student_category?.ntcCount
      })
      res.status(200).send({ message: 'Filter Active Batch Student Chart', filter_student: filter_student, total: total})
    }
    else if(type === 'All'){
      const filter_batch = await Batch.find({ _id: { $in: filter_ins.batches } })
      .select('ApproveStudent student_category')
      filter_batch?.forEach((ele) => {
        total += ele?.ApproveStudent?.length
        filter_student.boyCount += ele?.student_category?.boyCount
        filter_student.girlCount += ele?.student_category?.girlCount
        filter_student.otherCount += ele?.student_category?.otherCount
        filter_student.generalCount += ele?.student_category?.generalCount
        filter_student.obcCount += ele?.student_category?.obcCount
        filter_student.scCount += ele?.student_category?.scCount
        filter_student.stCount += ele?.student_category?.stCount
        filter_student.ntaCount += ele?.student_category?.ntaCount
        filter_student.ntbCount += ele?.student_category?.ntbCount
        filter_student.ntcCount += ele?.student_category?.ntcCount
      })
      res.status(200).send({ message: 'Filter All Batch Student Chart', filter_student: filter_student, total: total})
    }
    else{
      res.status(404).send({ message: 'Are you looking something else in Data'})
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.retrieveByActiveStaff = async(req, res) => {
  try{
    const { id } = req.params
    const { type } = req.query
    var total = 0
    if(type === 'All'){
      const filter_ins = await InstituteAdmin.findById({_id: id}).select('ApproveStaff staff_category')
      total += filter_ins?.ApproveStaff?.length
      res.status(200).send({ message: 'Filter All Staff Chart', filter_staff: filter_ins?.staff_category, total: total})
    }
    else{
      res.status(404).send({ message: 'Are you looking something else in Data'})
    }
  }
  catch(e){
    console.log(e)
  }
}