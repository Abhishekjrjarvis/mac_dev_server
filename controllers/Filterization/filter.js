const Post = require('../../models/Post')
const Income = require('../../models/Income')
const Expense = require('../../models/Expense')
const InstituteAdmin = require('../../models/InstituteAdmin')
const Batch = require('../../models/Batch')
const User = require('../../models/User')

var trendingQuery = (trends, cat, type) => {
  if(cat !== ''){
    trends.forEach((ele, index) => {
      if(index > 2) return 
      ele.hash_trend = `#${index + 1} on trending `
    })
  }
  else{
    if(type === 'Repost'){
      trends.forEach((ele, index) => {
        if(index > 2) return 
        ele.hash_trend = `#${index + 1} on trending`
      })
    }
    else{
      trends.forEach((ele, index) => {
        ele.hash_trend = `#${index + 1} on trending for ${ele.trend_category?.split(" ")[0]}`
      })
    }
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
      const category = req.query.filter_by ? req.query.filter_by : "";
      const skip = (page - 1) * limit;
      var post = await Post.find({ postType: 'Repost' })
        .limit(limit)
        .skip(skip)
        .select("postQuestion isHelpful answerCount answerUpVoteCount authorFollowersCount isUser isInstitute endUserSave trend_category createdAt postStatus commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine ")
        .populate({
          path: "rePostAnswer",
          populate: {
            path: 'post',
            select: 'postQuestion isUser answerCount'
          },
        })
        if(post?.length < 1){
            res.status(200).send({ message: 'filter By Learn', filteredLearn: [] })
        }
        else{
            var order_by_learn = post.sort(sortRepostUpvote('rePostAnswer'))
            var learn_data = trendingQuery(order_by_learn, category, 'Repost')
            res.status(200).send({ message: 'filter By Learn', filteredLearn: learn_data })
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
            "needCount needUser answerCount postQuestion authorFollowersCount answerUpVoteCount isUser isInstitute endUserSave trend_category createdAt postStatus commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine hash_trend"
          )
      }
      else{
        var post = await Post.find({ postType: 'Question' })
          .sort("-needCount")
          .limit(limit)
          .skip(skip)
          .select(
            "needCount needUser answerCount postQuestion answerUpVoteCount isUser isInstitute endUserSave trend_category createdAt postStatus commentCount author authorName authorUserName authorFollowersCount authorPhotoId authorProfilePhoto authorOneLine hash_trend"
          )
      }
      if(data?.length < 1){
        res.status(200).send({ message: 'filter By Answer', filteredQuestion: [] })
      }
      else{
          var data = trendingQuery(post, category, 'Question')
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
            "isUser isInstitute answerCount authorFollowersCount postType endUserSave trend_category createdAt postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike"
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
          "isUser isInstitute answerCount authorFollowersCount postType endUserSave trend_category createdAt postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike"
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
          var data = trendingQuery(order_by_poll, category, 'Poll')
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
    const { type, role } = req.query
    var total = 0
    var filter_student_gender = {
      boyCount: 0,
      girlCount: 0,
      otherCount: 0
    }
    var filter_student_caste = {
      generalCount: 0,
      obcCount: 0,
      scCount: 0,
      stCount: 0,
      ntaCount: 0,
      ntbCount: 0,
      ntcCount: 0,
      ntdCount: 0,
      vjCount: 0
    }
    const filter_ins = await InstituteAdmin.findById({_id: id}).select('batches')
    if(type === 'Active'){
      const filter_batch = await Batch.find({ $and: [{ _id: { $in: filter_ins.batches }}, { activeBatch: 'Active' }]})
      .select('ApproveStudent student_category')

      filter_batch?.forEach((ele) => {
        total += ele?.ApproveStudent?.length
        filter_student_gender.boyCount += ele?.student_category?.boyCount
        filter_student_gender.girlCount += ele?.student_category?.girlCount
        filter_student_gender.otherCount += ele?.student_category?.otherCount
        filter_student_caste.generalCount += ele?.student_category?.generalCount
        filter_student_caste.obcCount += ele?.student_category?.obcCount
        filter_student_caste.scCount += ele?.student_category?.scCount
        filter_student_caste.stCount += ele?.student_category?.stCount
        filter_student_caste.ntaCount += ele?.student_category?.ntaCount
        filter_student_caste.ntbCount += ele?.student_category?.ntbCount
        filter_student_caste.ntcCount += ele?.student_category?.ntcCount
        filter_student_caste.ntdCount += ele?.student_category?.ntdCount
        filter_student_caste.vjCount += ele?.student_category?.vjCount
      })
      if(role === 'Gender'){
        res.status(200).send({ message: 'Filter Active Batch Student Chart gender', filter_student: filter_student_gender, total: total})
      }
      else if(role === 'Caste'){
        res.status(200).send({ message: 'Filter Active Batch Student Chart caste', filter_student: filter_student_caste, total: total})
      }
    }
    else if(type === 'All'){
      const filter_batch = await Batch.find({ _id: { $in: filter_ins.batches } })
      .select('ApproveStudent student_category')
      filter_batch?.forEach((ele) => {
        total += ele?.ApproveStudent?.length
        filter_student_gender.boyCount += ele?.student_category?.boyCount
        filter_student_gender.girlCount += ele?.student_category?.girlCount
        filter_student_gender.otherCount += ele?.student_category?.otherCount
        filter_student_caste.generalCount += ele?.student_category?.generalCount
        filter_student_caste.obcCount += ele?.student_category?.obcCount
        filter_student_caste.scCount += ele?.student_category?.scCount
        filter_student_caste.stCount += ele?.student_category?.stCount
        filter_student_caste.ntaCount += ele?.student_category?.ntaCount
        filter_student_caste.ntbCount += ele?.student_category?.ntbCount
        filter_student_caste.ntcCount += ele?.student_category?.ntcCount
        filter_student_caste.ntdCount += ele?.student_category?.ntdCount
        filter_student_caste.vjCount += ele?.student_category?.vjCount
      })
      if(role === 'Gender'){
        res.status(200).send({ message: 'Filter All Batch Student Chart gender', filter_student: filter_student_gender, total: total})
      }
      else if(role === 'Caste'){
        res.status(200).send({ message: 'Filter All Batch Student Chart caste', filter_student: filter_student_caste, total: total})
      }
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
    const { type, role } = req.query
    var total = 0
    if(type === 'All'){
      const filter_ins = await InstituteAdmin.findById({_id: id}).select('ApproveStaff staff_category')
      total += filter_ins?.ApproveStaff?.length
      if(role === 'Gender'){
        var gender = {
          boyCount: filter_ins?.staff_category?.boyCount,
          girlCount: filter_ins?.staff_category?.girlCount,
          otherCount: filter_ins?.staff_category?.otherCount,
        }
        res.status(200).send({ message: 'Filter All Staff Chart Gender', filter_staff: gender, total: total})
      }
      else if(role === 'Caste'){
        var caste = {
          generalCount: filter_ins?.staff_category?.generalCount,
          obcCount: filter_ins?.staff_category?.obcCount,
          scCount: filter_ins?.staff_category?.scCount,
          stCount: filter_ins?.staff_category?.stCount,
          ntaCount: filter_ins?.staff_category?.ntaCount,
          ntbCount: filter_ins?.staff_category?.ntbCount,
          ntcCount: filter_ins?.staff_category?.ntbCount,
          ntdCount: filter_ins?.staff_category?.ntdCount,
          vjCount: filter_ins?.staff_category?.vjCount,
        }
        res.status(200).send({ message: 'Filter All Staff Chart Caste', filter_staff: caste, total: total})
      }
      var all_filter = {
        boyCount: filter_ins?.staff_category?.boyCount,
        girlCount: filter_ins?.staff_category?.girlCount,
        otherCount: filter_ins?.staff_category?.otherCount,
        generalCount: filter_ins?.staff_category?.generalCount,
        obcCount: filter_ins?.staff_category?.obcCount,
        scCount: filter_ins?.staff_category?.scCount,
        stCount: filter_ins?.staff_category?.stCount,
        ntaCount: filter_ins?.staff_category?.ntaCount,
        ntbCount: filter_ins?.staff_category?.ntbCount,
        ntcCount: filter_ins?.staff_category?.ntcCount,
        ntdCount: filter_ins?.staff_category?.ntdCount,
        vjCount: filter_ins?.staff_category?.vjCount,
      }
      if(role == undefined){
        res.status(200).send({ message: 'Filter All Staff Chart All', filter_staff: all_filter, total: total})
      }
    }
    else{
      res.status(404).send({ message: 'Are you looking something else in Data'})
    }
  }
  catch(e){
    console.log(e)
  }
}