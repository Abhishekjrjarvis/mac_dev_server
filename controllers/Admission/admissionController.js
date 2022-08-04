const InstituteAdmin = require('../../models/InstituteAdmin')
const Staff = require('../../models/Staff')
const Admission = require('../../models/Admission/Admission')
const User = require('../../models/User')
const Notification = require('../../models/notification')
const NewApplication = require('../../models/Admission/NewApplication')
const Student = require('../../models/Student')
const Status = require('../../models/Admission/status')
const Finance = require('../../models/Finance')
const { uploadDocFile, uploadFile } = require('../../S3Configuration')
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);


exports.retrieveAdmissionAdminHead = async(req, res) =>{
    try{
        const { id, sid } = req.params;
        const institute = await InstituteAdmin.findById({ _id: id });
        const staff = await Staff.findById({ _id: sid })
        const user = await User.findById({ _id: `${staff.user}` });
        const admission = new Admission({});
        const notify = new Notification({})
        staff.admissionDepartment.push(admission._id);
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
    catch{

    }
}

exports.retrieveAdmissionDetailInfo = async(req, res) =>{
    try{
        const { aid } = req.params
        const admission = await Admission.findById({_id: aid})
        .select('admissionAdminEmail admissionAdminPhoneNumber admissionAdminAbout photoId coverId admissionProfilePhoto admissionCoverPhoto')
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
    student.selectApplication.push(apply._id)
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
      res.status(204).send({ message: 'Amount can not be greater than Admission Fee'})
    }
    else{
      if(amount < apply.applicationFee){
        admission.remainingFee.push(student._id)
        student.applicationPaymentStatus.push({
          applicationId: apply._id,
          status: 'Pending',
          installment: 'Installment',
          fee: amount
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
      apply.confirmedApplication.push(student._id)
      student.confirmApplication.push(apply._id)
      status.content = `You have been selected for ${apply.applicationName}. Confirm your admission`
      status.applicationId = apply._id
      user.applicationStatus.push(status._id)
      await Promise.all([ admission.save(), apply.save(), student.save(), finance.save()])
      res.status(200).send({ message: 'Paid Offline Fee and confirm', student: student.applicationPaymentStatus})
    }
  }
  catch{

  }
}

// exports.retrieveConfirmAdmissionApplication = async(req, res) =>{
//   try{
//     const { sid, aid } = req.params
//     const apply = await NewApplication.findById({_id: aid})
//     const student = await Student.findById({_id: sid})
//     const user = await User.findById({_id: `${student.user}`})
//     const status = new Status({})
//     apply.selectedApplication.push(student._id)
//     student.selectApplication.push(apply._id)
//     status.content = `You have been selected for ${apply.applicationName}. Confirm your admission`
//     status.applicationId = apply._id
//     user.applicationStatus.push(status._id)
//     await Promise.all([ apply.save(), student.save(), user.save(), status.save() ])
//     res.status(200).send({ message: `congrats ${student.studentFirstName} `, status})
//   }
//   catch{

//   }
// }