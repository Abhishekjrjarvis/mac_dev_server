const bcrypt = require('bcryptjs')
const Admin = require('../../models/superAdmin')
const InstituteAdmin = require('../../models/InstituteAdmin')
const User = require('../../models/User')
const Notification = require('../../models/notification')
const axios = require("axios");
const {
  uploadDocFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const smartPhrase = require('../../smartRecoveryPhrase')


var AdminOTP = "";

const generateAdminOTP = async (mob) => {
  let rand1 = Math.floor(Math.random() * 9) + 1;
  let rand2 = Math.floor(Math.random() * 9) + 1;
  let rand3 = Math.floor(Math.random() * 9) + 1;
  let rand4 = Math.floor(Math.random() * 9) + 1;
  AdminOTP = `${rand1}${rand2}${rand3}${rand4}`;
  const data = axios
    .post(
      `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=Welcome to Qviple, Your Qviple account verification OTP is ${AdminOTP} Mithkal Minds Pvt Ltd.&senderid=QVIPLE&accusage=6`
    )
    .then((res) => {
      if ((res && res.data.includes("success")) || res.data.includes("sent")) {
        console.log("messsage Sent Successfully");
      } else {
        console.log("something went wrong");
      }
    })
    .catch(() => {});
};



exports.getAdmin = async(req, res) =>{
    try {
        const { aid } = req.params
        const admins = await Admin.findById({ _id: aid})
        .select('id postCount instituteCount userCount staffCount studentCount playlistCount paymentCount adminName adminUserName photoId profilePhoto')
        .populate({
          path: 'staffArray',
          select: 'staffFirstName staffMiddleName staffJoinDate staffLastName photoId staffProfilePhoto',
          populate: {
            path: 'institute',
            select: 'insName'
          }
        }) 
        .populate({
          path: 'staffArray',
          select: 'staffFirstName staffMiddleName staffJoinDate staffLastName photoId staffProfilePhoto',
          populate: {
            path: 'user',
            select: 'userLegalName username'
          }
        })
        .populate({
          path: 'studentArray',
          select: 'studentFirstName studentMiddleName studentAdmissionDate studentLastName photoId studentProfilePhoto',
          populate: {
            path: 'institute',
            select: 'insName'
          }
        }) 
        .populate({
          path: 'studentArray',
          select: 'studentFirstName studentMiddleName studentAdmissionDate studentLastName photoId studentProfilePhoto',
          populate: {
            path: 'user',
            select: 'userLegalName username'
          }
        })
        res.status(200).send({ message: 'Success', admins });
    } catch(e) {
        console.log(`Error`, e.message);
    }
}


exports.retrieveApproveInstituteArray = async(req, res) =>{
  try{
    const { aid } = req.params
    const admin = await Admin.findById({ _id: aid})
    .select('adminName')
    .populate({
      path: 'ApproveInstitute',
      select: 'insName name photoId insProfilePhoto status staffCount studentCount isUniversal'
    })
    .populate({
      path: 'assignUniversal'
    })
    res.status(200).send({ message: 'Approve Array', admin})
  }
  catch{

  }
}


exports.retrievePendingInstituteArray = async(req, res) =>{
  try{
    const { aid } = req.params
    const admin = await Admin.findById({ _id: aid})
    .select('adminName')
    .populate({
      path: 'instituteList',
      select: 'insName name photoId insProfilePhoto status insEmail insPhoneNumber insType insApplyDate'
    })
    res.status(200).send({ message: 'Pending Array', admin})
  }
  catch{

  }
}



exports.retrieveUserArray = async(req, res) =>{
  try{
    const { aid } = req.params
    const admin = await Admin.findById({ _id: aid})
    .select('adminName')
    .populate({
      path: 'users',
      select: 'userLegalName username photoId profilePhoto userAddress userDateOfBirth userGender userEmail userPhoneNumber '
    })
    res.status(200).send({ message: 'Pending Array', admin})
  }
  catch{

  }
}



exports.retrieveUniversalInstitute = async(req, res) =>{
  try{
    const { aid } = req.params
    const { id } = req.body
    const admin = await Admin.findById({ _id: aid})
    const institute = await InstituteAdmin.findById({_id: id})
    const notify = new Notification({})
    admin.assignUniversal = institute
    institute.isUniversal = "Universal"
    notify.notifyContent = "Congrats for the Designation of Universal at Qviple 🎉✨🎉✨";
    notify.notifySender = admin._id;
    notify.notifyReceiever = institute._id;
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyBySuperAdminPhoto = "https://qviple.com/images/newLogo-text-icon.svg";
    await Promise.all([ admin.save(), institute.save(), notify.save() ])
  }
  catch(e){
    console.log(e)
  }
}



exports.getSuperAdmin = async(req, res) =>{
    res.render('SuperAdmin')
}


exports.sendOtpToAdmin = async(req, res) =>{
    try{
        generateAdminOTP(req.body.adminPhoneNumber).then((data) =>{
            res.status(200).send({ message: 'OTP send', adminPhoneNumber: req.body.adminPhoneNumber})
        })
    }
    catch{

    }
}


exports.getVerifySuperAdmin = async(req, res) =>{
    try{
        if (req.body.adminCode && req.body.adminCode === `${AdminOTP}`) {
            var adminStatus = "Verified";
            res.status(200).send({ message: 'Verified', status: adminStatus})
          } else {
            res.status(404).send({ message: 'Invalid OTP'})
          }
    }
    catch(e){
      console.log(e)
    }
}





exports.updateSuperAdmin = async(req, res) =>{
  try {
        const file = req.file;
        const results = await uploadDocFile(file);
        const genPassword = bcrypt.genSaltSync(12);
        const hashPassword = bcrypt.hashSync(adminPassword, genPassword);
        const admin = new Admin({ ...req.body });
        admin.adminAadharCard = results.key;
        admin.adminPassword = hashPassword
        admin.photoId = "1";
        await Promise.all([admin.save()]);
        await unlinkFile(file.path);
        res.status(201).send({ message: "Admin", admin });
  } catch (e) {
    console.log(`Error`, e);
  }
}


exports.retrieveRecoveryPhrase = async(req, res) =>{
  try{
    const adminPhrase = smartPhrase()
    if(adminPhrase){
      res.status(200).send({ message: 'Success', adminPhrase})
    }
    else{
      res.status(404).send({ message: 'Failure'})
    }
  }
  catch{

  }
}


exports.getAll = async(req, res) =>{
    try{
        const { id } = req.params;
        const admin = await Admin.findById({ _id: id }).populate({
            path: "ApproveInstitute",
            populate: {
            path: "financeDepart",
            },
        })
        .populate("RejectInstitute")
        .populate("instituteList")
        .populate("users")
        .populate({
            path: "instituteIdCardBatch",
            populate: {
                path: "institute",
            },
        })
        .populate({
            path: "reportList",
            populate: {
                path: "reportInsPost",
                populate: {
                    path: "institute",
                },
            },
            })
            .populate({
                path: "instituteIdCardBatch",
                populate: {
                   path: "ApproveStudent",
                },
            })
            .populate("blockedUsers")
            .populate({
                path: "reportList",
                populate: {
                    path: "reportBy",
                },
            }).populate({
                path: "reportList",
                populate: {
                    path: "reportUserPost",
                    populate: {
                      path: "user",
                },
            },
            })
            .populate("idCardPrinting")
            .populate("idCardPrinted")
            .populate({
                path: "feedbackList",
                populate: {
                    path: "user",
                },
            });
        res.status(200).send({ message: "Admin Detail", admin });       
    }
    catch{

    }
}


exports.getApproveIns = async(req, res) =>{
    try {
        const { aid, id } = req.params;
        const { charges } = req.body
        const admin = await Admin.findById({ _id: aid });
        const institute = await InstituteAdmin.findById({ _id: id });
        const notify = await new Notification({});
        admin.ApproveInstitute.push(institute._id);
        admin.instituteCount += 1
        admin.requestInstituteCount -= 1
        admin.instituteList.pull(id);
        institute.status = "Approved";
        institute.unlockAmount = charges
        notify.notifyContent = "Approval For Super Admin is successfull";
        notify.notifySender = aid;
        notify.notifyReceiever = id;
        institute.iNotify.push(notify._id);
        notify.institute = institute._id;
        notify.notifyBySuperAdminPhoto = "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
        await Promise.all([
           institute.save(),
           notify.save(),
           admin.save()
        ])
        res.status(200).send({
          message: `Congrats for Approval ${institute.insName}`,
          admin: admin._id
        });
      } catch (e) {console.log('Error', e.message)}
}


exports.getRejectIns = async(req, res) =>{
    try {
        const { aid, id } = req.params;
        const admin = await Admin.findById({ _id: aid });
        const institute = await InstituteAdmin.findById({ _id: id });
        const notify = await new Notification({});

        admin.RejectInstitute.push(institute._id);
        admin.instituteList.pull(id);
        institute.status = "Rejected";
        notify.notifyContent = `Rejected from Super Admin Contact at connect@qviple.com`;
        notify.notifySender = aid;
        notify.notifyReceiever = id;
        institute.iNotify.push(notify._id);
        notify.institute = institute._id;
        notify.notifyBySuperAdminPhoto = "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
        await Promise.all([
           admin.save(),
           institute.save(),
           notify.save()
        ])
        res.status(200).send({
          message: `Application Rejected ${institute.insName}`,
          admin: admin._id
        });
      } catch {
        console.log(
          `Error`, e.message
        );
      }
}


exports.getReferralIns = async(req, res) =>{
    try {
        const institute = await InstituteAdmin.find({});
        res.status(200).send({ message: "institute detail", institute });
    } catch(e) {
        console.log(
          `Error`, e.message
        );
    }
}


exports.getReferralUser = async(req, res) =>{
    try {
      const user = await User.find({});
      res.status(200).send({ message: "User Referal Data", user });
    } catch(e) {
      console.log(`Error`, e.message);
    }
}


exports.retrieveLandingPageCount = async(req, res) =>{
  try{
    const admin = await Admin.findById({_id: `${process.env.S_ADMIN_ID}`})
    .select('instituteCount userCount studentCount staffCount')
    res.status(200).send({ message: 'Success', admin})
  }
  catch(e){
    console.log(e)
  }
}


exports.retrieveOneInstitute = async(req, res) =>{
  try{
    const { id } = req.params
    const institute = await InstituteAdmin.findById({_id: id})
    .select('insName name insAbout insAddress insEmail insPhoneNumber status insMode unlockAmount insType insPincode insState insDistrict insDocument')
    .populate({
      path: 'initialReferral',
      select: 'userLegalName username photoId profilePhoto'
    })
    res.status(200).send({ message: 'One Institute', institute})
  }
  catch(e){
    console.log(e)
  }
}


exports.verifyInstituteBankDetail = async(req, res) =>{
  try{
    const { aid, id } = req.params
    var admin = await Admin.findById({_id: aid})
    var regExp = "^[A-Z]{4}[0][A-Z0-9]{6}$"
    var institute = await InstituteAdmin.findById({_id: id})
    if(institute.bankAccountNumber.length >=9 && institute.bankIfscCode.length >=1 && institute.bankIfscCode.match(regExp)){
      institute.paymentBankStatus = 'verified'
      const notify = new Notification({})
      notify.notifyContent = ` ${institute.insName} congrats for payment bank verification was successfull`
      notify.notifySender = admin._id;
      notify.notifyReceiever = institute._id;
      institute.iNotify.push(notify._id);
      notify.notifyPid = "1";
      notify.notifyBySuperAdminPhoto = "https://qviple.com/images/newLogo.svg"
      await Promise.all([ institute.save(), notify.save()])
      res.status(200).send({ message: 'Verification Done' })
    }
    else{
      institute.paymentBankStatus = 'Not Verified'
      const notify = new Notification({})
      notify.notifyContent = ` ${institute.insName} your payment bank verification was unsuccessfull due to Incorrect Bank Data`
      notify.notifySender = admin._id;
      notify.notifyReceiever = institute._id;
      institute.iNotify.push(notify._id);
      notify.notifyPid = "1";
      notify.notifyBySuperAdminPhoto = "https://qviple.com/images/newLogo.svg"
      await Promise.all([ institute.save(), notify.save()])
      res.status(422).send({ message: 'Invalid Payment Bank Credentials' })
    }
  }
  catch(e){
    console.log(e)
  }
}



exports.retrieveApproveInstituteActivate = async(req, res) => {
  try{
    const { aid } = req.params
    const admin = await Admin.findById({_id: aid})
    .select('activateAccount')
    const institute = await InstituteAdmin.find({ activateStatus: 'Activated'})
    .select('createdAt activateDate insName name unlockAmount photoId insProfilePhoto')
    .populate({
      path: 'initialReferral',
      select: 'username userLegalName photoId profilePhoto'
    })
    res.status(200).send({ message: 'Activate Query ', institute, admin})
  }
  catch{

  }
}