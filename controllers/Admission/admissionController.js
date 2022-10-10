const InstituteAdmin = require('../../models/InstituteAdmin')
const Staff = require('../../models/Staff')
const Admission = require('../../models/Admission/Admission')
const Inquiry = require('../../models/Admission/Inquiry')
const User = require('../../models/User')
const Notification = require('../../models/notification')
const NewApplication = require('../../models/Admission/NewApplication')
const Student = require('../../models/Student')
const Status = require('../../models/Admission/status')
const Finance = require('../../models/Finance')
const Batch = require('../../models/Batch')
const Department = require('../../models/Department')
const Class = require('../../models/Class')
const Admin = require('../../models/superAdmin')
const { uploadDocFile, uploadFile } = require('../../S3Configuration')
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require('../../Firebase/firebase')
const Post = require('../../models/Post')


exports.retrieveAdmissionAdminHead = async(req, res) =>{
    try{
        const { id, sid } = req.params;
        const institute = await InstituteAdmin.findById({ _id: id });
        const staff = await Staff.findById({ _id: sid })
        const user = await User.findById({ _id: `${staff.user}` });
        const admission = new Admission({});
        const notify = new Notification({})
        staff.admissionDepartment.push(admission._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = 'Admission Admin';
        admission.admissionAdminHead = staff._id;
        institute.admissionDepart.push(admission._id);
        institute.admissionStatus = 'Enable'
        admission.institute = institute._id;
        notify.notifyContent = `you got the designation of Admission Admin 🎉🎉`;
        notify.notifySender = id;
        notify.notifyReceiever = user._id;
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyPid = "1";
        notify.notifyByInsPhoto = institute._id;
        invokeFirebaseNotification(
          "Designation Allocation",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([
        institute.save(),
        staff.save(),
        admission.save(),
        user.save(),
        notify.save()
        ])
        res.status(200).send({
          message: "Successfully Assigned Staff",
          admission: admission._id,
          status: true
        });
    }
    catch(e){
      console.log(e)
    }
}

exports.retrieveAdmissionDetailInfo = async(req, res) =>{
    try{
        const { aid } = req.params
        const admission = await Admission.findById({_id: aid})
        .select('admissionAdminEmail admissionAdminPhoneNumber admissionAdminAbout photoId coverId photo queryCount newAppCount cover offlineFee onlineFee')
        .populate({
            path: 'admissionAdminHead',
            select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
        })
        .populate({
          path: 'remainingFee',
          select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto'
        })
        res.status(200).send({ message: 'Admission Detail', admission})
    }
    catch{

    }
}

exports.retieveAdmissionAdminAllApplication = async(req, res) => {
  try{
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params
    const skip = (page - 1) * limit;
    const apply = await Admission.findById({_id: aid})
    .select('newApplication')
    const ongoing = await NewApplication.find({ $and: [{_id: { $in: apply.newApplication}}, {applicationStatus: 'Ongoing'}]})
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .select('applicationName applicationEndDate applicationStatus applicationSeats')
    .populate({
      path: 'applicationDepartment',
      select: 'dName photoId photo'
    })

    if(ongoing?.length > 0){
      res.status(200).send({ message: 'Ongoing Application Lets Explore', ongoing, ongoingCount: ongoing?.length})
    }
    else{
      res.status(200).send({ message: 'Dark side in depth nothing to find', ongoing: []})
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.retieveAdmissionAdminAllCApplication = async(req, res) => {
  try{
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params
    const skip = (page - 1) * limit;
    const apply = await Admission.findById({_id: aid})
    .select('newApplication')
    const completed = await NewApplication.find({ $and: [{_id: { $in: apply.newApplication}}, {applicationStatus: 'Completed'}]})
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .select('applicationName applicationEndDate applicationStatus applicationSeats')
    .populate({
      path: 'applicationDepartment',
      select: 'dName photoId photo'
    })

    if(completed?.length > 0){
      res.status(200).send({ message: 'Completed Application Lets Explore', completed, completedCount: completed?.length})
    }
    else{
      res.status(200).send({ message: 'Dark side in depth nothing to find', completed: []})
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.fetchAdmissionQuery = async(req, res) =>{
    try{
        const { aid } = req.params
        await Admission.findByIdAndUpdate(aid, req.body)
        res.status(200).send({ message: 'Admission Info Updated'})
    }
    catch{

    }
}

exports.retrieveAdmissionNewApplication = async(req, res) =>{
    try{
        const { aid } = req.params
        const admission = await Admission.findById({_id: aid })
        const institute = await InstituteAdmin.findById({_id: `${admission.institute}`})
        const newApply = new NewApplication({...req.body})
        admission.newApplication.push(newApply._id)
        admission.newAppCount += 1
        newApply.admissionAdmin = admission._id
        await Promise.all([ admission.save(), newApply.save() ])
        res.status(200).send({ message: 'New Application is ongoing 👍', status: true})
        const post = new Post({})
        post.imageId = "1";
        institute.posts.push(post._id);
        institute.postCount += 1;
        post.author = institute._id;
        post.authorName = institute.insName;
        post.authorUserName = institute.name;
        post.authorPhotoId = institute.photoId;
        post.authorProfilePhoto = institute.insProfilePhoto;
        post.authorOneLine = institute.one_line_about;
        post.authorFollowersCount = institute.followersCount
        post.isInstitute = "institute";
        post.postType = 'Application'
        post.new_application = newApply._id
        post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
        await Promise.all([ post.save(), institute.save() ])
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
          if (post.postStatus === "Private") {
            all.forEach(async (el) => {
              if (el._id !== institute._id) {
                el.posts.push(post._id);
                await el.save();
              }
            });
          }
        }
    }
    catch(e){
      console.log(e)
    }
}


exports.fetchAdmissionApplicationArray = async(req, res) =>{
  try{
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params
    const skip = (page - 1) * limit;
    const ins_apply = await InstituteAdmin.findById({_id: id})
    .select('admissionDepart')
    const apply = await Admission.findById({_id: `${ins_apply?.admissionDepart[0]}`})
    const newApp = await NewApplication.find({ $and: [{_id: { $in: apply?.newApplication }}, {applicationStatus: 'Ongoing' }]})
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .select('applicationName applicationEndDate')
    .populate({
      path: 'applicationDepartment',
      select: 'dName'
    })

    if(newApp?.length > 0){
      res.status(200).send({ message: 'Lets begin new year journey', allApp: newApp, allAppCount: newApp?.length})
    }
    else{
      res.status(404).send({ message: 'get a better lens to find what you need 🔍', allApp: []})
    }
  }
  catch{

  }
}

exports.retrieveAdmissionReceievedApplication = async (req, res) => {
    try {
      const { uid, aid } = req.params;
      const user = await User.findById({ _id: uid });
      const student = new Student({ ...req.body });
      const apply = await NewApplication.findById({_id: aid})
      const status = new Status({})
      for (let file of req.files) {
        let count = 1;
        if (count === 1) {
          const width = 200;
          const height = 200;
          const results = await uploadFile(file, width, height);
          student.photoId = "0";
          student.studentProfilePhoto = results.key;
          count = count + 1;
        } else if (count === 2) {
          const results = await uploadDocFile(file);
          student.studentAadharFrontCard = results.key;
          count = count + 1;
        } else {
          const results = await uploadDocFile(file);
          student.studentAadharBackCard = results.key;
        }
        await unlinkFile(file.path);
      }
      status.content = `You have applied for ${apply.applicationName} has been filled successfully.
      Stay updated to check status of your application.`
      status.applicationId = apply._id
      user.student.push(student._id);
      user.applyApplication.push(apply._id)
      student.user = user._id;
      user.applicationStatus.push(status._id)
      apply.receievedApplication.push({
        student: student._id,
        fee_remain: apply.admissionFee,
      })
      apply.receievedCount += 1
      await Promise.all([
        student.save(),
        user.save(),
        status.save(),
        apply.save()
      ]);
      res.status(201).send({ message: "Taste a bite of sweets till your application is selected", student });
    } catch (e) {
      console.log(e);
    }
  };


exports.retrieveAdmissionSelectedApplication = async(req, res) =>{
  try{
    const { sid, aid } = req.params
    const apply = await NewApplication.findById({_id: aid})
    const student = await Student.findById({_id: sid})
    const user = await User.findById({_id: `${student.user}`})
    const status = new Status({})
    apply.selectedApplication.push({
      student: student._id,
      fee_remain: apply.admissionFee,
    })
    apply.selectCount += 1
    apply.receievedApplication.pull({
      student: student._id,
      fee_remain: apply.admissionFee,
    })
    status.content = `You have been selected for ${apply.applicationName}. Confirm your admission`
    status.applicationId = apply._id
    user.applicationStatus.push(status._id)
    await Promise.all([ apply.save(), student.save(), user.save(), status.save() ])
    res.status(200).send({ message: `congrats ${student.studentFirstName} `, status})
  }
  catch(e){
    console.log(e)
  }
}


exports.payOfflineAdmissionFee = async(req, res) =>{
  try{
    const { sid, aid } = req.params
    const { amount } = req.body
    const apply = await NewApplication.findById({_id: aid})
    const admission = await Admission.findById({_id: `${apply.admissionAdmin}`})
    const institute = await InstituteAdmin.findById({_id: `${admission.institute}`})
    const finance = await Finance.findById({_id: `${institute.financeDepart[0]}`})
    const student = await Student.findById({_id: sid})
    const user = await User.findById({_id: `${student.user}`})
    const status = new Status({})
    if(amount && amount > apply.admissionFee && finance?._id !== ''){
      res.status(404).send({ message: 'I think you are lost in this process take a break check finance Or Amount', status: false})
    }
    else{
      if(amount < apply.admissionFee){
        admission.remainingFee.push(student._id)
        student.admissionRemainFeeCount += (apply.admissionFee - amount)
        apply.remainingFee += (apply.admissionFee - amount)
        student.admissionPaymentStatus.push({
          applicationId: apply._id,
          status: 'Pending',
          installment: 'Installment',
          firstInstallment: amount,
          secondInstallment: apply.admissionFee - amount
        })
      }
      else if(amount == apply.admissionFee){
        student.admissionPaymentStatus.push({
          applicationId: apply._id,
          status: 'offline',
          installment: 'No Installment',
          fee: amount
        })
      }
      admission.offlineFee += amount
      apply.offlineFee += amount
      finance.financeAdmissionBalance += amount
      finance.financeTotalBalance += amount
      apply.selectedApplication.pull({
        student: student._id,
        fee_remain: apply.admissionFee,
      })
      apply.confirmedApplication.push({
        student: student._id,
        fee_remain: apply.admissionFee,
        payment_status: 'offline'
      })
      apply.confirmCount += 1
      status.content = `Welcome to Institute ${institute.insName}, ${institute.insDistrict}.
      Your seat has been confirmed, You will be alloted your class shortly, Stay Update!`
      status.applicationId = apply._id
      user.applicationStatus.push(status._id)
      await Promise.all([ admission.save(), apply.save(), student.save(), finance.save()])
      res.status(200).send({ message: 'Paid Offline Fee and confirm', student: student.applicationPaymentStatus})
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.cancelAdmissionApplication = async(req, res) =>{
  try{
    const { sid, aid } = req.params
    const { amount } = req.body
    const student = await Student.findById({_id: sid})
    const apply = await NewApplication.findById({_id: aid})
    const admission = await Admission.findById({_id: `${apply.admissionAdmin}`})
    const institute = await InstituteAdmin.findById({_id: `${admission.institute}`})
    const finance = await Finance.findById({_id: `${institute.financeDepart[0]}`})
    if(amount && amount > apply.admissionFee && amount < apply.offlineFee && amount < admission.offlineFee && amount < finance.financeAdmissionBalance){
      res.status(200).send({ message: 'Amount can not be greater than Admission Application'})
    }
    else{
      apply.confirmedApplication.pull({
        student: student._id,
        fee_remain: apply.admissionFee,
      })
      apply.cancelCount += 1
      apply.offlineFee -= amount
      admission.offlineFee -= amount
      finance.financeAdmissionBalance -= amount
      student.refundApplication.push({
        applicationId: apply._id,
        status: 'Refunded',
        amount: amount
      })
      await Promise.all([ apply.save(), student.save(), finance.save(), admission.save()])
      res.status(200).send({ message: 'Refund of Admission', student: student.refundApplication })
    }
  }
  catch{

  }
}

exports.retrieveAdmissionApplicationClass = async(req, res) =>{
  try{
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({_id: aid})
    const batch = await Batch.findById({_id: `${apply.applicationBatch}`})
    const classes = await Class.find({ $and: [{ _id: { $in: batch?.classroom}}, {classStatus: 'UnCompleted'}]})
    .sort('-strength')
    .limit(limit)
    .skip(skip)
    .select('className classTitle boyCount girlCount photoId photo')
    if(classes?.length > 0){
      res.status(200).send({ message: 'Front & Back Benchers at one place', classes: classes})
    }
    else{
      res.status(404).send({ message: 'Renovation at classes', classes: []})
    }
  }
  catch{

  }
}

exports.retrieveClassAllotQuery = async(req, res) =>{
  var date = new Date();
  var p_date = date.getDate();
  var p_month = date.getMonth() + 1;
  var p_year = date.getFullYear();
  if (p_month <= 10) {
    p_month = `0${p_month}`;
  }
  var c_date = `${p_year}-${p_month}-${p_date}`;
  try{
    const { sid, aid, cid } = req.params
    const apply = await NewApplication.findById({_id: aid})
    const admins = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
    const admission = await Admission.findById({_id: `${apply.admissionAdmin}`}).select('institute')
    const institute = await InstituteAdmin.findById({_id: `${admission.institute}`})
    const depart = await Department.findById({_id: `${apply.applicationDepartment}`})
    const batch = await Batch.findById({_id: `${apply.applicationBatch}`})
    const classes = await Class.findById({_id: cid})
    const student = await Student.findById({_id: sid})
    const user = await User.findById({_id: `${student.user}`})
    const notify = new Notification({})
    const aStatus = new Status({})
    apply.confirmedApplication.pull(student._id)
    apply.allotCount += 1
    // student.confirmApplication.pull(apply._id)
    student.studentStatus = 'Approved'
    institute.ApproveStudent.push(student._id);
    admins.studentArray.push(student._id);
    admins.studentCount += 1;
    institute.studentCount += 1
    if(student.studentGender === 'Male'){
      classes.boyCount += 1
    }
    else if(student.studentGender === 'Female'){
      classes.girlCount += 1
    }
    classes.strength += 1
    classes.ApproveStudent.push(student._id);
    classes.studentCount += 1;
    student.studentGRNO = classes.ApproveStudent.length;
    student.studentROLLNO = classes.ApproveStudent.length;
    student.studentClass = classes._id;
    student.studentAdmissionDate = c_date;
    depart.ApproveStudent.push(student._id);
    depart.studentCount += 1;
    student.department = depart._id;
    batch.ApproveStudent.push(student._id);
    student.batches = batch._id;
    notify.notifyContent = `${student.studentFirstName}${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} joined as a Student of Class ${
      classes.className
    } of ${batch.batchName}`;
    notify.notifySender = classes._id
    notify.notifyReceiever = user._id;
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    invokeFirebaseNotification(
      "Student Approval",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    aStatus.content = `Class Alloted`
    aStatus.applicationId = apply._id
    user.applicationStatus.push(aStatus._id)
    await Promise.all([ 
      apply.save(),
      student.save(), 
      user.save(), 
      aStatus.save(), 
      admins.save(), 
      institute.save(), 
      classes.save(), 
      depart.save(), 
      batch.save(), 
      notify.save() 
    ])
    res.status(200).send({ message: `congrats ${student.studentFirstName} `, aStatus, classes: student.studentClass})
  }
  catch(e){
    console.log(e)
  }
}



exports.completeAdmissionApplication = async(req, res) =>{
  try{
    const { aid } = req.params
    const apply = await NewApplication.findById({_id: aid})
    apply.applicationStatus = 'Completed'
    await Promise.all([ apply.save()])
    res.status(200).send({ message: 'Completed Application'})
  }
  catch{

  }
}

exports.retrieveAdmissionApplicationStatus = async(req, res) =>{
  try{
    const { status } = req.query
    const apply = await NewApplication.find({applicationStatus: `${status}`})
    .select('applicationName applicationSeats applicationStatus applicationEndDate')
    .populate({
      path: 'applicationDepartment',
      select: 'dName'
    })
    res.status(200).send({ message: 'All Application', apply})
  }
  catch{

  }
}


exports.retrieveOneApplicationQuery = async(req, res) =>{
  try{
    const { aid } = req.params
    const oneApply = await NewApplication.findById({_id: aid})
    .select('applicationName applicationStartDate admissionFee applicationSeats receievedCount selectCount confirmCount cancelCount allotCount onlineFee offlineFee remainingFee collectedFeeCount')
    .populate({
      path: 'applicationDepartment',
      select: 'dName'
    })
    .populate({
      path: 'applicationBatch',
      select: 'batchName'
    })
    .lean()
    .exec()
    res.status(200).send({ message: 'One Application', oneApply})
  }
  catch{

  }
}

exports.retrieveUserInquiryProcess = async(req, res) =>{
  try{
    const { aid, uid } = req.params
    const app = await Admission.findById({_id: aid})
    const user = await User.findById({_id: uid})
    const ask = new Inquiry({...req.body})
    ask.user = user._id
    ask.reasonExplanation.push({
      content: req.body?.content,
      replyBy: req.body?.replyBy
    })
    app.inquiryList.push(ask._id)
    app.queryCount += 1
    user.inquiryList.push(ask._id)
    await Promise.all([ app.save(), user.save(), ask.save() ])
    res.status(200).send({ message: 'Raised an inquiry '})
  }
  catch(e){
    console.log(e)
  }
}

exports.retrieveUserInquiryArray = async(req, res) =>{
  try{
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params
    const skip = (page - 1) * limit;
    const app = await Admission.findById({_id: aid})
    .select('id inquiryList')
    
    const ask = await Inquiry.find({ _id: { $in: app.inquiryList }})
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)

    if(ask?.length >= 1){
      res.status(200).send({ message: 'Get List of Inquiry', i_list: ask })
    }
    else{
      res.status(200).send({ message: 'Looking for a inquiry List', i_list: [] })
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.retrieveInquiryReplyQuery = async(req, res) => {
  try{
    const { qid } = req.params
    const { author } = req.query
    const ask_query = await Inquiry.findById({_id: qid })
    if(`${author}` === 'User'){
      ask_query.reasonExplanation.push({
        content: req.body?.content,
        replyBy: `${author}`
      })
      await ask_query.save()
      res.status(200).send({ message: `Ask By ${author}` })
    }
    else if(`${author}` === 'Admin'){
      ask_query.reasonExplanation.push({
        content: req.body?.content,
        replyBy: `${author}`
      })
      await ask_query.save()
      res.status(200).send({ message: `Reply By ${author}` })
    }
    else{
      res.status(200).send({ message: 'Lost in space'})
    }
  }
  catch(e){
    console.log(e)
  }
}