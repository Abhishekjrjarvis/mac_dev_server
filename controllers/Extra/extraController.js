const User = require('../../models/User')
const InstituteAdmin = require('../../models/InstituteAdmin')
const Admin = require('../../models/superAdmin')
const FeedBack = require('../../models/Feedbacks/Feedback')

exports.validateUserAge = async(req, res) =>{
    try{
        const { uid } = req.params
        const user = await User.findById({_id: uid})
        if(user.ageRestrict === 'Yes'){
        var date = new Date()
        var p_date = date.getDate();
        var p_month = date.getMonth() + 1;
        if (p_month < 10) {
            p_month = parseInt(`0${p_month}`);
        }
        var p_year = date.getFullYear();
        var month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var b_date = user.userDateOfBirth.slice(8, 10)
        var b_month = user.userDateOfBirth.slice(5, 7)
        var b_year = user.userDateOfBirth.slice(0, 4)

        if (b_date > p_date) {
            p_date = p_date + month[b_month - 1];
            p_month = p_month - 1;
        }

        if (b_month > p_month) {
            p_year = p_year - 1;
            p_month = p_month + 12;
        }

        var get_cal_year = p_year - b_year;
            if(get_cal_year > 13){
                user.ageRestrict = 'No'
                await user.save()
            }
        res.status(200).send({ message: 'Age Restriction Disabled ', restrict: user.ageRestrict})
        }else if(user.ageRestrict === 'No'){
            user.ageRestrict = 'Yes'
            await user.save()
            res.status(200).send({ message: 'Age Restriction Enabled', restrict: user.ageRestrict})
        }
        
    }
    catch(e){
        console.log(e)
    }
}


exports.retrieveAgeRestrict = async(req, res) =>{
    try{
        const { uid } = req.params
        const user = await User.findById({_id: uid})
        res.status(200).send({ message: 'Get Age Rstrict', status: user.ageRestrict})
    }
    catch(e){
        console.log(e)
    }
}



exports.retrieveRandomInstituteQuery = async(req, res) => {
    try{
        const institute = await InstituteAdmin.find({status: 'Approved'})
        .select('insName name photoId insProfilePhoto status')
        var random = Math.floor(Math.random() * institute.length)
        var r_Ins = institute[random]
        res.status(200).send({ message: 'Random Institute', r_Ins})
    }
    catch(e){
        console.log(e)
    }
}

exports.retrieveReferralQuery = async(req, res) => {
    try{
      const { uid } = req.params
      const user = await User.findById({_id: uid})
      .select('id userCommission userEarned')
      .populate({
        path: 'referralArray',
        populate: {
          path: 'referralBy',
          select: 'unlockAmount activateStatus insName name'
        }
      })
      res.status(200).send({ message: 'Referral', user})
    }
    catch{
  
    }
  }


  exports.retrieveFeedBackUser = async(req, res) => {
    try{
      const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
      const user = await User.findById({_id: req.body.userId})
      const feed = new FeedBack({...req.body})
      feed.feedBy = user._id
      admin.feedbackArray.push(feed._id)
      await Promise.all([ feed.save(), admin.save()])
      res.status(200).send({ message: `Thanks for feedback ${user.username}`})
    }
    catch(e){
        console.log(e)
    }
}