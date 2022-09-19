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
        .select('admissionAdminEmail admissionAdminPhoneNumber admissionAdminAbout photoId coverId admissionProfilePhoto admissionCoverPhoto queryCount')
        .populate({
            path: 'admissionAdminHead',
            select: 'staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto'
        })
        .populate({
            path: 'newApplication'
        })
        res.status(200).send({ message: 'Admission Detail', admission})
    }
    catch{

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
        const newApply = new NewApplication({...req.body})
        admission.newApplication.push(newApply._id)
        newApply.admissionAdmin = admission._id
        await Promise.all([ admission.save(), newApply.save() ])
        res.status(200).send({ message: 'New Application is ongoing'})
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
      apply.receievedApplication.push(student._id)
      apply.receievedCount += 1
      student.applyApplication.push(apply._id)
      await Promise.all([
        student.save(),
        user.save(),
        status.save(),
        apply.save()
      ]);
      res.status(201).send({ message: "student form is applied", student });
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
    apply.selectedApplication.push(student._id)
    apply.selectCount += 1
    student.selectApplication.push(apply._id)
    apply.receievedApplication.pull(student._id)
    student.applyApplication.pull(apply._id)
    status.content = `You have been selected for ${apply.applicationName}. Confirm your admission`
    status.applicationId = apply._id
    user.applicationStatus.push(status._id)
    await Promise.all([ apply.save(), student.save(), user.save(), status.save() ])
    res.status(200).send({ message: `congrats ${student.studentFirstName} `, status})
  }
  catch{

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
    if(amount && amount > apply.applicationFee){
      res.status(200).send({ message: 'Amount can not be greater than Admission Fee'})
    }
    else{
      if(amount < apply.applicationFee){
        admission.remainingFee.push(student._id)
        apply.remainingFee += amount
        student.applicationPaymentStatus.push({
          applicationId: apply._id,
          status: 'Pending',
          installment: 'Installment',
          firstInstallment: amount,
          secondInstallment: apply.applicationFee - amount
        })
      }
      else if(amount == apply.applicationFee){
        student.applicationPaymentStatus.push({
          applicationId: apply._id,
          status: 'paid offline',
          installment: 'No Installment',
          fee: amount
        })
      }
      admission.offlineFee += amount
      apply.offlineFee += amount
      finance.financeAdmissionBalance += amount
      finance.financeCashBalance += amount
      apply.selectedApplication.pull(student._id)
      student.selectApplication.pull(apply._id)
      apply.confirmedApplication.push(student._id)
      apply.confirmCount += 1
      student.confirmApplication.push(apply._id)
      student.applicationStatus.push({
        applicationId: apply._id,
        trackStatus: 'pending'
      })
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
    if(amount && amount > apply.applicationFee){
      res.status(200).send({ message: 'Amount can not be greater than Admission Application'})
    }
    else{
      apply.confirmedApplication.pull(student._id)
      apply.cancelCount += 1
      student.confirmApplication.pull(apply._id)
      apply.offlineFee -= amount
      admission.offlineFee -= amount
      finance.financeCashBalance -= amount
      finance.financeAdmissionBalance -= amount
      student.refundApplication.push({
        applicationId: apply._id,
        status: 'Refunded',
        amount: amount
      })
      student.applicationStatus.push({
        applicationId: apply._id,
        trackStatus: 'cancelled'
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
    const { aid } = req.params
    const apply = await NewApplication.findById({_id: aid})
    const batch = await Batch.findById({_id: `${apply.applicationBatch}`})
    .select('id')
    .populate({
      path: 'classroom',
      select: 'className boyCount girlCount photoId photo'
    })
    res.status(200).send({ message: 'Class Query', classes: batch.classroom})
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
    student.confirmApplication.pull(apply._id)
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
    .select('applicationName applicationStartDate applicationFee applicationSeats receievedCount selectCount confirmCount cancelCount allotCount onlineFee offlineFee remainingFee')
    .populate({
      path: 'applicationDepartment',
      select: 'dName'
    })
    .populate({
      path: 'applicationBatch',
      select: 'batchName'
    })
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