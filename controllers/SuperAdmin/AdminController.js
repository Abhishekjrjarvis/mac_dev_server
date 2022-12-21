const bcrypt = require("bcryptjs");
const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const axios = require("axios");
const Post = require("../../models/Post");
const Answer = require("../../models/Question/Answer");
const Finance = require("../../models/Finance");
const RePay = require("../../models/Return/RePay");
const { uploadDocFile } = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const smartPhrase = require("../../Service/smartRecoveryPhrase");

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

exports.getRenderAdmin = async (req, res) => {
  res.render("SuperAdmin");
};

exports.retrieveAdminQuery = async (req, res) => {
  try {
    const { adminPassword } = req.body;
    const genPassword = bcrypt.genSaltSync(12);
    const hashPassword = bcrypt.hashSync(adminPassword, genPassword);
    const admin = new Admin({ ...req.body });
    (admin.adminPassword = hashPassword), await admin.save();
    res.redirect("/");
  } catch {}
};

exports.getAdmin = async (req, res) => {
  try {
    const { aid } = req.params;
    const post = await Post.find({}).select("id").lean();
    const admins = await Admin.findById({ _id: aid })
      .select(
        "id postCount instituteCount reportPostQueryCount returnAmount careerCount getTouchCount userCount featureAmount idCardBalance staffCount studentCount playlistCount paymentCount adminName adminUserName photoId profilePhoto"
      )
      .populate({
        path: "staffArray",
        select:
          "staffFirstName staffMiddleName staffJoinDate staffLastName photoId staffProfilePhoto",
        populate: {
          path: "institute",
          select: "insName",
        },
      })
      .populate({
        path: "staffArray",
        select:
          "staffFirstName staffMiddleName staffJoinDate staffLastName photoId staffProfilePhoto",
        populate: {
          path: "user",
          select: "userLegalName username",
        },
      })
      .populate({
        path: "studentArray",
        select:
          "studentFirstName studentMiddleName studentAdmissionDate studentLastName photoId studentProfilePhoto",
        populate: {
          path: "institute",
          select: "insName",
        },
      })
      .populate({
        path: "studentArray",
        select:
          "studentFirstName studentMiddleName studentAdmissionDate studentLastName photoId studentProfilePhoto",
        populate: {
          path: "user",
          select: "userLegalName username",
        },
      })
      .lean();
    res
      .status(200)
      .send({ message: "Success", admins, postCount: post.length });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.retrieveApproveInstituteArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("adminName assignUniversalStatus ApproveInstitute")
      .populate({
        path: "assignUniversal",
        select: "id",
      });

    const institutes = await InstituteAdmin.find({
      _id: { $in: admin.ApproveInstitute },
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "insName name photoId insProfilePhoto status staffCount studentCount isUniversal"
      );
    res
      .status(200)
      .send({ message: "Approve Array", admin: admin, institutes: institutes });
  } catch {}
};

exports.retrievePendingInstituteArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const admin = await Admin.findById({ _id: aid })
      .select("adminName")
      .populate({
        path: "instituteList",
        select:
          "insName name photoId insProfilePhoto status insEmail insPhoneNumber insType insApplyDate",
      })
      .lean();
    res.status(200).send({ message: "Pending Array", admin });
  } catch {}
};

exports.retrieveUserArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("adminName users");

    const users = await User.find({ _id: { $in: admin.users } })
      .sort("-created_at")
      .limit(limit)
      .skip(skip)
      .select(
        "userLegalName username photoId profilePhoto userAddress userDateOfBirth userGender userEmail userPhoneNumber "
      );
    res.status(200).send({ message: "Users Array", users: users });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUniversalInstitute = async (req, res) => {
  try {
    const { aid } = req.params;
    const { id } = req.body;
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const institute = await InstituteAdmin.findById({ _id: id });
    const notify = new Notification({});
    admin.assignUniversal = institute._id;
    admin.assignUniversalStatus = "Assigned";
    institute.isUniversal = "Universal";
    notify.notifyContent =
      "Congrats for the Designation of Universal at Qviple 🎉✨🎉✨";
    notify.notifySender = admin._id;
    notify.notifyReceiever = institute._id;
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/images/newLogo-text-icon.svg";
    await Promise.all([admin.save(), institute.save(), notify.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.getSuperAdmin = async (req, res) => {
  res.render("SuperAdmin");
};

exports.sendOtpToAdmin = async (req, res) => {
  try {
    generateAdminOTP(req.body.adminPhoneNumber).then((data) => {
      res.status(200).send({
        message: "OTP send",
        adminPhoneNumber: req.body.adminPhoneNumber,
      });
    });
  } catch {}
};

exports.getVerifySuperAdmin = async (req, res) => {
  try {
    if (req.body.adminCode && req.body.adminCode === `${AdminOTP}`) {
      var adminStatus = "Verified";
      res.status(200).send({ message: "Verified", status: adminStatus });
    } else {
      res.status(404).send({ message: "Invalid OTP" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.updateSuperAdmin = async (req, res) => {
  try {
    const file = req.file;
    const results = await uploadDocFile(file);
    const genPassword = bcrypt.genSaltSync(12);
    const hashPassword = bcrypt.hashSync(adminPassword, genPassword);
    const admin = new Admin({ ...req.body });
    admin.adminAadharCard = results.key;
    admin.adminPassword = hashPassword;
    admin.photoId = "1";
    await Promise.all([admin.save()]);
    await unlinkFile(file.path);
    res.status(201).send({ message: "Admin", admin });
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.retrieveRecoveryPhrase = async (req, res) => {
  try {
    const adminPhrase = smartPhrase();
    if (adminPhrase) {
      res.status(200).send({ message: "Success", adminPhrase });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getAll = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: id })
      .populate({
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
      })
      .populate({
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
  } catch {}
};

exports.getApproveIns = async (req, res) => {
  try {
    const { aid, id } = req.params;
    const { charges, initialAmount, followersAmount } = req.body;
    var c_amount = parseInt(charges);
    var i_amount = parseInt(initialAmount);
    var f_amount = parseInt(followersAmount);
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const institute = await InstituteAdmin.findById({ _id: id });
    if (institute.initialReferral) {
      var user = await User.findOne({ _id: `${institute.initialReferral}` });
      user.userCommission += c_amount * 0.4;
      await user.save();
    }
    const notify = new Notification({});
    admin.ApproveInstitute.push(institute._id);
    admin.instituteCount += 1;
    admin.requestInstituteCount -= 1;
    admin.instituteList.pull(id);
    institute.status = "Approved";
    institute.unlockAmount = c_amount == null ? 0 : c_amount;
    institute.initial_Unlock_Amount = i_amount;
    institute.followers_critiria = f_amount;
    if (c_amount == 0) {
      admin.activateAccount += 1;
      institute.featurePaymentStatus = "Paid";
      institute.accessFeature = "UnLocked";
      institute.activateStatus = "Activated";
      institute.activateDate = new Date();
    }
    notify.notifyContent =
      "Your institute is verified and approved for further managing operations";
    notify.notifySender = admin._id;
    //
    admin.activateAccount += 1;
    institute.accessFeature = "UnLocked";
    institute.activateStatus = "Activated";
    institute.activateDate = new Date();
    //
    notify.notifyReceiever = id;
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
    await Promise.all([institute.save(), notify.save(), admin.save()]);
    res.status(200).send({
      message: `Congrats for Approval ${institute.insName}`,
      admin: admin._id,
    });
  } catch (e) {
    console.log("Error", e);
  }
};

exports.getRejectIns = async (req, res) => {
  try {
    const { aid, id } = req.params;
    const admin = await Admin.findById({ _id: aid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const notify = new Notification({});

    admin.RejectInstitute.push(institute._id);
    admin.instituteList.pull(id);
    institute.status = "Rejected";
    notify.notifyContent = `Rejected from Super Admin Contact at connect@qviple.com`;
    notify.notifySender = aid;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
    await Promise.all([admin.save(), institute.save(), notify.save()]);
    res.status(200).send({
      message: `Application Rejected ${institute.insName}`,
      admin: admin._id,
    });
  } catch {
    console.log(`Error`, e.message);
  }
};

exports.getReferralIns = async (req, res) => {
  try {
    const institute = await InstituteAdmin.find({});
    res.status(200).send({ message: "institute detail", institute });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getReferralUser = async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).send({ message: "User Referal Data", user });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.retrieveLandingPageCount = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("instituteCount userCount studentCount staffCount")
      .lean();
    res.status(200).send({ message: "Success", admin });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveOneInstitute = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select(
        "insName name insAbout insAddress insEmail insPhoneNumber status insMode unlockAmount insType insPincode insState insDistrict insDocument"
      )
      .populate({
        path: "initialReferral",
        select: "userLegalName username photoId profilePhoto",
      })
      .lean();
    res.status(200).send({ message: "One Institute", institute });
  } catch (e) {
    console.log(e);
  }
};

exports.verifyInstituteBankDetail = async (req, res) => {
  try {
    const { aid, id } = req.params;
    var admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var regExp = "^[A-Z]{4}[0][A-Z0-9]{6}$";
    var institute = await InstituteAdmin.findById({ _id: id });
    // && institute.bankIfscCode.match(regExp)
    if (
      institute.bankAccountNumber.length >= 9 &&
      institute.bankIfscCode.length >= 1 &&
      institute.paymentBankStatus === "verification in progress"
    ) {
      institute.paymentBankStatus = "verified";
      const notify = new Notification({});
      notify.notifyContent = ` ${institute.insName} congrats for payment bank verification was successfull`;
      notify.notifySender = admin._id;
      notify.notifyReceiever = institute._id;
      institute.iNotify.push(notify._id);
      notify.notifyPid = "1";
      notify.notifyBySuperAdminPhoto = "https://qviple.com/images/newLogo.svg";
      await Promise.all([institute.save(), notify.save()]);
      res.status(200).send({ message: "Verification Done", status: true });
    } else if (institute.paymentBankStatus === "verified") {
      institute.paymentBankStatus === "Not Verified";
      const notify = new Notification({});
      notify.notifyContent = ` ${institute.insName} your payment bank verification was unsuccessfull due to Incorrect Bank Data`;
      notify.notifySender = admin._id;
      notify.notifyReceiever = institute._id;
      institute.iNotify.push(notify._id);
      notify.notifyPid = "1";
      notify.notifyBySuperAdminPhoto = "https://qviple.com/images/newLogo.svg";
      await Promise.all([institute.save(), notify.save()]);
      res
        .status(200)
        .send({ message: "Invalid Payment Bank Credentials", status: true });
    } else if (institute.paymentBankStatus === "Not Verified") {
      institute.paymentBankStatus === "verified";
      const notify = new Notification({});
      notify.notifyContent = ` ${institute.insName} your payment bank verification was unsuccessfull due to Incorrect Bank Data`;
      notify.notifySender = admin._id;
      notify.notifyReceiever = institute._id;
      institute.iNotify.push(notify._id);
      notify.notifyPid = "1";
      notify.notifyBySuperAdminPhoto = "https://qviple.com/images/newLogo.svg";
      await Promise.all([institute.save(), notify.save()]);
      res
        .status(200)
        .send({ message: "Invalid Payment Bank Credentials", status: true });
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveApproveInstituteActivate = async (req, res) => {
  try {
    const { aid } = req.params;
    const admin = await Admin.findById({ _id: aid })
      .select("activateAccount")
      .lean();
    const institute = await InstituteAdmin.find({ activateStatus: "Activated" })
      .select(
        "createdAt activateDate insName name unlockAmount photoId insProfilePhoto"
      )
      .populate({
        path: "initialReferral",
        select: "username userLegalName photoId profilePhoto",
      })
      .lean();
    res.status(200).send({ message: "Activate Query ", institute, admin });
  } catch {}
};

exports.retrieveApproveInstituteActivateVolume = async (req, res) => {
  try {
    const { aid } = req.params;
    const admin = await Admin.findById({ _id: aid }).select("activateAccount");
    const institute = await InstituteAdmin.find({ activateStatus: "Activated" })
      .select(
        "createdAt insName name photoId insProfilePhoto bankAccountHolderName paymentBankStatus bankAccountNumber bankIfscCode bankAccountPhoneNumber bankAccountType paymentBankStatus insBankBalance adminRepayAmount"
      )
      .populate({
        path: "getReturn",
        populate: {
          path: "institute",
          select: "insName",
        },
      });
    res.status(200).send({ message: "Activate Query ", institute, admin });
  } catch {}
};

exports.retrieveReferralUserArray = async (req, res) => {
  try {
    const user = await User.find({ referralStatus: "Granted" })
      .select(
        "createdAt userLegalName username photoId profilePhoto referralArray userCommission paymentStatus"
      )
      .lean();
    res.status(200).send({ message: "Referral Query ", user });
  } catch {}
};

exports.retrieveReferralUserPayment = async (req, res) => {
  try {
    const { aid, uid } = req.params;
    const { amount } = req.body;
    const admin = await Admin.findById({ _id: aid });
    const user = await User.findById({ _id: uid });
    admin.featureAmount -= amount;
    user.userCommission -= amount;
    user.userEarned += amount;
    if (user.userCommission === 0) {
      user.paymentStatus = "Paid";
    } else {
      user.paymentStatus = "Pay Left";
    }
    await Promise.all([admin.save(), user.save()]);
    res.status(200).send({ message: "Referral Paid ", status: true });
  } catch {}
};

exports.retrieveGetInTouch = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("id")
      .populate({
        path: "getTouchUsers",
      })
      .lean();
    res.status(200).send({ message: "Get In Touch Data", admin });
  } catch {}
};

exports.retrieveCarrierQuery = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("id")
      .populate({
        path: "careerUserArray",
      })
      .lean();
    res.status(200).send({ message: "Career Data", admin });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveReportQuery = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("id")
      .populate({
        path: "reportList",
        select: "createdAt reportStatus",
        populate: {
          path: "reportBy",
          select: "username userLegalName photoId profilePhoto",
        },
      })
      .populate({
        path: "reportList",
        select: "createdAt reportStatus",
        populate: {
          path: "reportInsPost",
          select: "post_url",
        },
      })
      .lean()
      .exec();
    res.status(200).send({ message: "Report Post Data", admin });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveNotificationQuery = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("id")
      .populate({
        path: "aNotify",
        populate: {
          path: "notifyByInsPhoto",
          select: "photoId insProfilePhoto",
        },
      })
      .lean();
    res.status(200).send({ message: "Notification Data", admin });
  } catch {}
};

exports.retrieveNotificationCountQuery = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("id aNotify")
      .lean();
    res.status(200).send({
      message: "Notification Count Data",
      notifyCount: admin.aNotify.length,
    });
  } catch {}
};

exports.getRecentChatUser = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("id")
      .populate({
        path: "supportUserChat",
        populate: {
          path: "message",
          select: "sender content createdAt isSend",
        },
      })
      .populate({
        path: "supportUserChat",
        populate: {
          path: "latestMessage",
          select: "sender content createdAt isSend",
        },
      })
      .lean()
      .exec();
    res.status(200).send({ message: "User Support Chat", admin });
  } catch {}
};

exports.getRecentChatInstitute = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("id")
      .populate({
        path: "supportInstituteChat",
        populate: {
          path: "message",
          select: "sender content createdAt isSend",
        },
      })
      .populate({
        path: "supportInstituteChat",
        populate: {
          path: "latestMessage",
          select: "sender content createdAt isSend",
        },
      })
      .lean()
      .exec();
    res.status(200).send({ message: "Institute Support Chat", admin });
  } catch {}
};

exports.retrieveRepayInstituteAmount = async (req, res) => {
  try {
    const { aid, uid } = req.params;
    const { amount, txnId, message } = req.body;
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const institute = await InstituteAdmin.findById({ _id: uid });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    const notify = new Notification({});
    const repay = new RePay({});
    institute.adminRepayAmount -= amount;
    institute.insBankBalance += amount;
    finance.financeBankBalance = finance.financeBankBalance + amount;
    finance.financeTotalBalance = finance.financeTotalBalance + amount;
    admin.returnAmount -= amount;
    notify.notifyContent = `Super Admin re-pay Rs. ${amount} to you`;
    notify.notifySender = admin._id;
    notify.notifyReceiever = uid;
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyBySuperAdminPhoto = "https://qviple.com/images/newLogo.svg";
    repay.repayAmount = amount;
    (repay.repayStatus = "Transferred"), (repay.txnId = txnId);
    repay.message = message;
    repay.institute = institute._id;
    admin.repayArray.push(repay._id);
    institute.getReturn.push(repay._id);
    await Promise.all([
      institute.save(),
      notify.save(),
      admin.save(),
      repay.save(),
      finance.save(),
    ]);
    res.status(200).send({ message: "Amount Transferred", status: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInstituteRepayQuery = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).select(
      "id getReturn"
    );

    const get_return = await RePay.find({ _id: { $in: institute?.getReturn } })
      .sort("createdAt")
      .limit(limit)
      .skip(skip)
      .select("repayAmount repayStatus")
      .populate({
        path: "institute",
        select: "insName",
      });
    if (get_return?.length > 0) {
      res.status(200).send({ message: "Repay Array", repay: get_return });
    } else {
      res.status(200).send({ message: "No Repay Array", repay: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveSocialPostCount = async (req, res) => {
  try {
    const postCount = await Post.find({ postType: "Post" }).select("id").lean();

    const questionCount = await Post.find({ postType: "Question" })
      .select("id")
      .lean();

    const pollCount = await Post.find({ postType: "Poll" }).select("id").lean();

    const repostCount = await Post.find({ postType: "Repost" })
      .select("id")
      .lean();

    res.status(200).send({
      message: "Total Posts",
      postCount: postCount?.length,
      questionCount: questionCount?.length,
      pollCount: pollCount?.length,
      repostCount: repostCount?.length,
    });
  } catch {}
};

exports.retrieveSocialLikeCount = async (req, res) => {
  try {
    var total = 0;
    const postCount = await Post.find({}).select("id endUserLike").lean();

    const answerCount = await Answer.find({}).select("id upVote").lean();

    if (postCount?.length >= 1) {
      postCount.forEach(async (post) => {
        total += post?.endUserLike?.length;
      });
    }

    if (answerCount?.length >= 1) {
      answerCount.forEach(async (answer) => {
        total += answer?.upVote?.length;
      });
    }
    res.status(200).send({
      message: "Total Likes",
      likeCount: total,
      postCount: postCount?.length,
    });
  } catch {}
};

exports.retrievePlatformAllPosts = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    var post = await Post.find({})
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "postTitle postText postQuestion isHelpful postBlockStatus needCount needUser isNeed answerCount tagPeople answerUpVoteCount isUser isInstitute postDescription endUserSave postType trend_category createdAt postImage postVideo imageId postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike postType"
      )
      .populate({
        path: "poll_query",
      })
      .populate({
        path: "rePostAnswer",
        populate: {
          path: "post",
          select:
            "postQuestion authorProfilePhoto authorUserName author authorPhotoId isUser",
        },
      });
    res.status(200).send({ message: "All Platform Posts", all: post });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveOneUserQuery = async (req, res) => {
  try {
    const { uid } = req.params;
    var totalUpVote = 0;
    const user = await User.findById({ _id: uid })
      .select(
        "userLegalName photoId questionCount userStatus blockStatus one_line_about userCommission userEarned referralArray answerQuestionCount profilePhoto userBio coverId profileCoverPhoto username followerCount followingUICount circleCount postCount userAbout "
      )
      .lean();
    const answers = await Answer.find({ author: uid });
    for (let up of answers) {
      totalUpVote += up.upVoteCount;
    }
    res
      .status(200)
      .send({ message: "One User Profile Data ", user, upVote: totalUpVote });
  } catch {}
};

exports.retrieveOneInstituteQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select(
        "insName photoId insProfilePhoto status blockStatus one_line_about bankAccountNumber bankAccountHolderName bankIfscCode bankAccountType bankAccountPhoneNumber paymentBankStatus questionCount pollCount insEditableText insEditableTexts coverId insRegDate departmentCount announcementCount admissionCount insType insMode insAffiliated joinedCount staffCount studentCount insProfileCoverPhoto followersCount name followingCount postCount insAbout insEmail insAddress insEstdDate createdAt insPhoneNumber insAchievement "
      )
      .populate({
        path: "displayPersonList",
        populate: {
          path: "displayUser",
          select: "username userLegalName photoId profilePhoto",
        },
      })
      .lean()
      .exec();
    res.status(200).send({ message: "One Institute Profile Data", institute });
  } catch {}
};

exports.retrieveOnePostBlock = async (req, res) => {
  try {
    const { pid } = req.params;
    const post = await Post.findById({ _id: pid });
    if (post.postBlockStatus === "Not Block") {
      post.postBlockStatus = "Blocked";
    } else if (post?.postBlockStatus === "Blocked") {
      post.postBlockStatus = "Not Block";
    } else {
    }
    await post.save();
    res
      .status(200)
      .send({ message: "Post Blocked By Super Admin", status: true });
  } catch {}
};

exports.retrieveOneInstituteBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    if (institute.blockStatus === "UnBlocked") {
      institute.blockStatus = "Blocked";
    } else if (institute.blockStatus === "Blocked") {
      institute.blockStatus = "UnBlocked";
    }
    await institute.save();
    res
      .status(200)
      .send({ message: "Institute Blocked By Super Admin", status: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveOneUserBlock = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById({ _id: uid });
    if (user.blockStatus === "UnBlocked") {
      user.blockStatus = "Blocked";
    } else if (user.blockStatus === "Blocked") {
      user.blockStatus = "UnBlocked";
    }
    await user.save();
    res
      .status(200)
      .send({ message: "User Blocked By Super Admin", status: true });
  } catch (e) {
    console.log(e);
  }
};

// exports.filterByYear = async(req, res) =>{
//   try{
//     const { year } = req.query
//     const users = await User.find({ createdAt: '2022-09-09'})
//     res.status(200).send({ message: 'Dataset of User Activity', users: users.length})
//   }
//   catch(e){
//     console.log(e)
//   }
// }
