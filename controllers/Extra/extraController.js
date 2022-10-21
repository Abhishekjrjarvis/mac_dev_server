const User = require('../../models/User')
const InstituteAdmin = require('../../models/InstituteAdmin')
const Admin = require('../../models/superAdmin')
const FeedBack = require('../../models/Feedbacks/Feedback')
const Student = require('../../models/Student')
const Staff = require('../../models/Staff')
const { shuffleArray } = require('../../Utilities/Shuffle')
const Post = require('../../models/Post')

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
    catch{}
}



exports.retrieveRandomInstituteQuery = async(req, res) => {
    try{
        const institute = await InstituteAdmin.find({status: 'Approved'})
        .select('insName name photoId insProfilePhoto status blockStatus')
        var random = Math.floor(Math.random() * institute.length)
        var r_Ins = institute[random]
        res.status(200).send({ message: 'Random Institute', r_Ins})
    }
    catch{}
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
    catch{}
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
    catch{}
}



exports.retrieveBonafideGRNO = async(req, res) => {
  try{
    const { gr, id } = req.params
    var download = true
    const { reason } = req.body
    const student = await Student.findOne({ $and: [{ studentGRNO: `${gr}`}, { institute: id}]})
    .select('studentFirstName studentMiddleName certificateBonaFideCopy studentAdmissionDate studentLastName photoId studentProfilePhoto studentDOB')
    .populate({
      path: 'studentClass',
      select: 'className'
    })
    .populate({
      path: 'batches',
      select: 'batchName'
    })
    .populate({
      path: 'institute',
      select: 'insName insAddress insState insDistrict insPhoneNumber insPincode photoId insProfilePhoto'
    })
    // const institute = await InstituteAdmin.findById({_id: `${student.institute}`})
    student.studentReason = reason
    student.studentBonaStatus = 'Ready'
    if(student.certificateBonaFideCopy.trueCopy){
      if(student.certificateBonaFideCopy.secondCopy){
        if(student.certificateBonaFideCopy.thirdCopy){
          download = false
        }
        else{
          student.certificateBonaFideCopy.thirdCopy = true
          download = true
        }
      }
      else{
        student.certificateBonaFideCopy.secondCopy = true
        download = true
      }
    }
    else{
      student.certificateBonaFideCopy.trueCopy = true
      download = true
    }
    await Promise.all([ student.save() ])
    res.status(200).send({ message: 'Student Bonafide Certificate', student, download})
  }
  catch(e){
    console.log(e)
  }
}


exports.retrieveLeavingGRNO = async(req, res) => {
  try{
    const { gr } = req.params
    var download = true
    const { reason, study, previous, behaviour, remark } = req.body
    const student = await Student.findOne({ $and: [{ studentGRNO: `${gr}`}, { institute: id} ]})
    .select('studentFirstName studentMiddleName certificateLeavingCopy studentAdmissionDate studentReligion studentCast studentCastCategory studentMotherName studentNationality studentBirthPlace studentMTongue studentLastName photoId studentProfilePhoto studentDOB')
    .populate({
      path: 'studentClass',
      select: 'className'
    })
    .populate({
      path: 'batches',
      select: 'batchName'
    })
    .populate({
      path: 'institute',
      select: 'insName insAddress insState insDistrict insAffiliated insEditableText insEditableTexts insPhoneNumber insPincode photoId insProfilePhoto'
    })
    const institute = await InstituteAdmin.findById({_id: `${student.institute._id}`})
    student.studentLeavingBehaviour = behaviour
    student.studentLeavingStudy = study
    student.studentLeavingPrevious = previous
    student.studentLeavingReason = reason
    student.studentLeavingRemark = remark
    student.studentLeavingInsDate = new Date()
    student.studentBookNo = institute.leavingArray.length + 1
    student.studentCertificateNo = institute.leavingArray.length + 1
    student.studentLeavingStatus = 'Ready'
    if(student.certificateLeavingCopy.trueCopy){
      if(student.certificateLeavingCopy.secondCopy){
        if(student.certificateLeavingCopy.thirdCopy){
          download = false
        }
        else{
          student.certificateLeavingCopy.thirdCopy = true
          download = true
        }
      }
      else{
        student.certificateLeavingCopy.secondCopy = true
        download = true
      }
    }
    else{
      student.certificateLeavingCopy.trueCopy = true
      download = true
    }
    await Promise.all([ student.save(), institute.save() ])
    res.status(200).send({ message: 'Student Leaving Certificate', student, download: download})
  }
  catch(e){
    console.log(e)
  }
}

exports.retrieveCertificateStatus = async(req, res) =>{
  try{
    const { gr, type } = req.params
    const student = await Student.findOne({ studentGRNO: `${gr}`})
    const institute = await InstituteAdmin.findById({_id: `${student.institute}`})
    if(type === 'Bona'){
      student.studentBonaStatus = 'Downloaded True Copy'
      institute.bonaArray.push(student._id)
      await Promise.all([ student.save(), institute.save()])
      res.status(200).send({ message: 'Downloaded True Copy'})
    }
    else if(type === 'Leaving'){
      student.studentLeavingStatus = 'Downloaded True Copy'
      institute.leavingArray.push(student._id)
      await Promise.all([ student.save(), institute.save()])
      res.status(200).send({ message: 'Downloaded True Copy'})
    }
    else{
      res.status(204).send({ message: 'Looking for a new Keyword...'})
    }
  }
  catch{

  }
}


exports.retrieveUserBirthPrivacy = async(req, res) =>{
  try{
    const { uid } = req.params
    const { birthStatus, addressStatus, circleStatus, tagStatus } = req.body
    const user = await User.findById({_id: uid})
    if(birthStatus !== ''){
      user.user_birth_privacy = birthStatus
    }
    if(addressStatus !== ''){
      user.user_address_privacy = addressStatus
    }
    if(circleStatus !== ''){
      user.user_circle_privacy = circleStatus
    }
    if(tagStatus !== ''){
      user.tag_privacy = tagStatus
    }
    await user.save()
    res.status(200).send({ message: `Privacy Updated`})
  }
  catch(e){
    console.log(e)
  }
}


exports.retrieveInstituteBirthPrivacy = async(req, res) =>{
  try{
    const { id } = req.params
    const { staffStatus, contactStatus, emailStatus, tagStatus } = req.body
    const institute = await InstituteAdmin.findById({_id: id})
    if(staffStatus !== ''){
      institute.staff_privacy = staffStatus
    }
    if(contactStatus !== ''){
      institute.contact_privacy = contactStatus
    }
    if(emailStatus !== ''){
      institute.email_privacy = emailStatus
    }
    if(tagStatus !== ''){
      institute.tag_privacy = tagStatus
    }
    await institute.save()
    res.status(200).send({ message: `Privacy Updated Institute`})
  }
  catch(e){
    console.log(e)
  }
}



exports.retrieveUserUpdateNotification = async(req, res) =>{
  try{
    const { uid } = req.params
    const { follower_notify, comment_notify, answer_notify, institute_notify } = req.body
    const user = await User.findById({_id: uid})
    if(follower_notify !== ''){
      user.user_follower_notify = follower_notify
    }
    if(comment_notify !== ''){
      user.user_comment_notify = comment_notify
    }
    if(answer_notify !== ''){
      user.user_answer_notify = answer_notify
    }
    if(institute_notify !== ''){
      user.user_institute_notify = institute_notify
    }
    await user.save()
    res.status(200).send({ message: `Update Notification Updated`})
  }
  catch(e){
    console.log(e)
  }
}

exports.retrieveCommentFeatureQuery = async(req, res) => {
  try{
    const { pid } = req.params
    await Post.findByIdAndUpdate(pid, req.body)
    res.status(200).send({ message: `Comments are turned ${post.comment_turned}`, turned: true})
  }
  catch(e){
    console.log(e)
  }
}

exports.retrieveMergeStaffStudent = async(req, res) => {
  try{
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { id } = req.params
    const merge_ins = await InstituteAdmin.findById({_id: id})
    .select('id ApproveStaff ApproveStudent')

    const staff = await Staff.find({ _id: { $in: merge_ins.ApproveStaff }})
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .select('id')
    .populate({
      path: 'user',
      select: 'userLegalName username photoId profilePhoto'
    })

    const student = await Student.find({ _id: { $in: merge_ins.ApproveStudent }})
    .limit(limit)
    .skip(skip)
    .select('id')
    .populate({
      path: 'user',
      select: 'userLegalName username photoId profilePhoto'
    })

    var mergeArray = [...staff, ...student]
    var get_array = shuffleArray(mergeArray)
    res.status(200).send({ message: 'Shuffle Staff Student Collection', get_array})
  }
  catch(e){
    console.log(e)
  }
}


