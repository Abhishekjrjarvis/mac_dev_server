const bcrypt = require('bcryptjs')
const Admin = require('../../models/superAdmin')
const InstituteAdmin = require('../../models/InstituteAdmin')
const User = require('../../models/User')
const Notification = require('../../models/notification')


exports.getAdmin = async(req, res) =>{
    try {
        const admins = await Admin.find({});
        res.send(admins._id);
    } catch(e) {
        console.log(`Error`, e.message);
    }
}

exports.getSuperAdmin = async(req, res) =>{
    res.render('SuperAdmin')
}


exports.updateSuperAdmin = async(req, res) =>{
    try{
        const { adminPhoneNumber, adminEmail, adminPassword, adminUserName, adminName, adminGender, adminDateOfBirth,
              adminCity, adminBio, adminState, adminCountry, adminAddress, adminAadharCard, } = req.body;
        const genPassword = await bcrypt.genSaltSync(12);
        const hashPassword = await bcrypt.hashSync(adminPassword, genPassword);
        const admin = await new Admin({
            adminPhoneNumber: adminPhoneNumber,
            adminEmail: adminEmail,
            adminPassword: hashPassword,
            adminName: adminName,
            adminGender: adminGender,
            adminDateOfBirth: adminDateOfBirth,
            adminCity: adminCity,
            adminState: adminState,
            adminCountry: adminCountry,
            adminBio: adminBio,
            adminAddress: adminAddress,
            adminAadharCard: adminAadharCard,
            adminUserName: adminUserName,
        });
        await admin.save();
        res.redirect("/");
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
        const { referalPercentage, insFreeLastDate, insPaymentLastDate, userID, status} = req.body;

        const admin = await Admin.findById({ _id: aid });
        const institute = await InstituteAdmin.findById({ _id: id });
        const user = await User.findById({ _id: userID });
        const rInstitute = await InstituteAdmin.findById({ _id: userID });
        const notify = await new Notification({});
    
        admin.ApproveInstitute.push(institute);
        admin.instituteList.pull(id);
        institute.insFreeLastDate = insFreeLastDate;
        institute.insPaymentLastDate = insPaymentLastDate;
        institute.status = status;

        if (user) {
          admin.referals.push(user);
          user.InstituteReferals.push(institute);
          user.referalPercentage = user.referalPercentage + parseInt(referalPercentage);
          institute.AllUserReferral.push(user);
          await user.save();
          await institute.save();

        } else if (rInstitute) {
          admin.referalsIns.push(rInstitute);
          rInstitute.instituteReferral.push(institute);
          rInstitute.referalPercentage = rInstitute.referalPercentage + parseInt(referalPercentage);
          institute.AllInstituteReferral.push(rInstitute);
          await rInstitute.save();
          await institute.save();
        }

        notify.notifyContent = "Approval For Super Admin is successfull";
        notify.notifySender = aid;
        notify.notifyReceiever = id;
        institute.iNotify.push(notify);
        notify.institute = institute;
        notify.notifyByInsPhoto = institute;
        await institute.save();
        await notify.save();
        await admin.save();
        res.status(200).send({
          message: `Congrats for Approval ${institute.insName}`,
          admin,
          institute,
        });
      } catch (e) {console.log('Error', e.message)}
}


exports.getRejectIns = async(req, res) =>{
    try {
        const { aid, id } = req.params;
        const { rejectReason, status } = req.body;

        const admin = await Admin.findById({ _id: aid });
        const institute = await InstituteAdmin.findById({ _id: id });
        const notify = await new Notification({});

        admin.RejectInstitute.push(institute);
        admin.instituteList.pull(id);
        institute.status = status;
        institute.rejectReason = rejectReason;
        notify.notifyContent = `Rejected from Super Admin Contact at connect@qviple.com`;
        notify.notifySender = aid;
        notify.notifyReceiever = id;
        institute.iNotify.push(notify);
        notify.institute = institute;
        notify.notifyByInsPhoto = institute;

        await admin.save();
        await institute.save();
        await notify.save();
        res.status(200).send({
          message: `Application Rejected ${institute.insName}`,
          admin,
          institute,
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