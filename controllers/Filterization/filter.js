const Post = require('../../models/Post')
const Poll = require('../../models/Question/Poll')
const Income = require('../../models/Income')
const Expense = require('../../models/Expense')

exports.retrieveByLearnQuery = async (req, res) => {
    try {
      var options = { sort: { "upVoteCount": "-1" } }
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      // const category = req.query.filter_by ? req.query.filter_by : "";
      const skip = (page - 1) * limit;
      var post = await Post.find({ postType: 'Repost' })
        // .sort("-createdAt")
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
          },
          options
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
          .sort("-needCount")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
          )
      }
      else{
        var post = await Post.find({ postType: 'Question' })
          .sort("-needCount")
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
      var options = { sort: { "total_votes": "-1"}}
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const category = req.query.filter_by ? req.query.filter_by : "";
      const skip = (page - 1) * limit;
      if(category !== ''){
        var post = await Post.find({ $and: [{ trend_category: `${category}` }, { postType: 'Poll' }] })
          // .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select(
            "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
          )
          .populate({
            path: "poll_query",
            options
          })
      }
      else{
        var post = await Post.find({ postType: 'Poll' })
        // .sort("-createdAt")
        .limit(limit)
        .skip(skip)
        .select(
          "postTitle postText postQuestion isHelpful needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
        )
        .populate({
          path: "poll_query",
          options
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

