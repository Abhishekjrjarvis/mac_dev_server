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
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const invokeSpecificRegister = require("../../Firebase/specific");
const SubDomain = require("../../models/Domain/sub-domain");
const Department = require("../../models/Department");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const BankAccount = require("../../models/Finance/BankAccount");
const { generate_random_code } = require("../../helper/functions");

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
        console.log("Super Admin - messsage Sent Successfully");
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
    // var valid_invoice = `${
    //   new Date().getMonth() + 1
    // }${new Date().getFullYear()}0`;
    // admin.invoice_count += parseInt(valid_invoice);
    admin.adminPassword = hashPassword;
    await admin.save();
    res.redirect("/");
  } catch {}
};

exports.getAdmin = async (req, res) => {
  try {
    // const is_cache = await connect_redis_hit(`q-admin-dash`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "Admin Dashboard Retrieve from Cache 🙌",
    //     admins: is_cache.admins,
    //     postCount: is_cache.postCount,
    //   });
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
    // const admin_query = {
    //   admins: admins,
    //   postCount: post?.length,
    // };
    // const adminEncrypt = await encryptionPayload(admin_query);
    // const cached = await connect_redis_miss(`q-admin-dash`, admin_query);
    res.status(200).send({
      message: "Admin Dashboard Retrieve from DB",
      // admins: cached.admins,
      // postCount: cached.postCount,
      admins: admins,
      postCount: post?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveApproveInstituteArray = async (req, res) => {
  try {
    // const is_cache = await connect_redis_hit(`q-admin-approve-ins-array`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "Approve Array Retrieve from Cache 🙌",
    //     admin: is_cache.admin,
    //     institutes: is_cache.institutes,
    //   });
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
    // const all_ins = {
    //   admin: admin,
    //   institutes: institutes,
    // };
    // const all_encrypt = await encryptionPayload(all_ins)
    // const cached = await connect_redis_miss(
    //   `q-admin-approve-ins-array`,
    //   all_ins
    // );
    res.status(200).send({
      message: "Approve Array Retreieve from DB",
      // admin: cached.admin,
      // institutes: cached.institutes,
      admin: admin,
      institutes: institutes,
    });
  } catch (e) {
    console.log(e);
  }
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
    // const aEncrypt = await encryptionPayload(admin);
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
    // const uEncrypt = await encryptionPayload(users);
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
    notify.notifyCategory = "Universal Designation";
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
    // const adminEncrypt = await encryptionPayload(admin);
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
    notify.notifyCategory = "Approve Institute";
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
    const code = await generate_random_code();
    institute.random_institute_code = `${code}`;
    await Promise.all([institute.save(), notify.save(), admin.save()]);
    // const adsEncrypt = await encryptionPayload(admin._id);
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
    notify.notifyCategory = "Reject Institute";
    notify.notifyReceiever = id;
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
    await Promise.all([admin.save(), institute.save(), notify.save()]);
    // const adEncrypt = await encryptionPayload(admin._id);
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
    // const iEncrypt = await encryptionPayload(institute);
    res.status(200).send({ message: "institute detail", institute });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getReferralUser = async (req, res) => {
  try {
    const user = await User.find({});
    // const userEncrypt = await encryptionPayload(user);
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
    // const adminEncrypt = await encryptionPayload(admin);
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
    // const oEncrypt = await encryptionPayload(institute);
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
      notify.notifyCategory = "Bank Detail";
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
      notify.notifyCategory = "Bank Detail";
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
      notify.notifyCategory = "Bank Detail";
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
    // Add Another Encryption
    res.status(200).send({ message: "Activate Query ", institute, admin });
  } catch {}
};

exports.retrieveApproveInstituteActivateVolume = async (req, res) => {
  try {
    const { aid } = req.params;
    const admin = await Admin.findById({ _id: aid }).select("activateAccount");
    const institute = await InstituteAdmin.find({ activateStatus: "Activated" })
      .select(
        "createdAt insName name photoId insProfilePhoto bankAccountHolderName paymentBankStatus bankAccountNumber bankIfscCode bankAccountPhoneNumber bankAccountType paymentBankStatus insBankBalance adminRepayAmount payout_pool"
      )
      .populate({
        path: "getReturn",
        populate: {
          path: "institute",
          select: "insName",
        },
      });
    // Add Another Encryption
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
    // const uEncrypt = await encryptionPayload(user);
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
    // const gEncrypt = await encryptionPayload(admin);
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
    // const cEncrypt = await encryptionPayload(admin);
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
    // const adsEncrypt = await encryptionPayload(admin);
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
    // const adEncrypt = await encryptionPayload(admin);
    res.status(200).send({ message: "Notification Data", admin });
  } catch {}
};

exports.retrieveNotificationCountQuery = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` })
      .select("id aNotify")
      .lean();
    // const nEncrypt = await encryptionPayload(admin.aNotify.length);
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
    const { uid } = req.params;
    const { txnId, message, t_amount, p_amount, bank_array } = req.body;
    if (!uid && !t_amount && p_amount)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const institute = await InstituteAdmin.findById({ _id: uid });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    const financeUser = await User.findById({
      _id: `${finance?.financeHead?.user}`,
    });
    var price = p_amount ? parseInt(p_amount) : 0;
    const notify = new Notification({});
    const repay = new RePay({});
    if (institute?.payout_pool >= p_amount) {
      institute.payout_pool -= p_amount;
    }
    if (institute.adminRepayAmount >= p_amount) {
      institute.adminRepayAmount -= p_amount;
    }
    institute.insBankBalance += p_amount;
    finance.financeBankBalance = finance.financeBankBalance + p_amount;
    finance.financeTotalBalance = finance.financeTotalBalance + p_amount;
    if (admin.returnAmount >= p_amount) {
      admin.returnAmount -= p_amount;
    }
    notify.notifyContent = `Qviple Super Admin re-pay Rs. ${p_amount} to you as settlement in (Primary A/C)`;
    notify.notifySender = admin._id;
    notify.notifyCategory = "Qviple Repayment";
    notify.notifyReceiever = uid;
    institute.iNotify.push(notify._id);
    financeUser.uNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyBySuperAdminPhoto = "https://qviple.com/images/newLogo.svg";
    repay.repayAmount = p_amount;
    (repay.repayStatus = "Transferred"), (repay.txnId = txnId);
    repay.message = message;
    repay.institute = institute._id;
    admin.repayArray.push(repay._id);
    institute.getReturn.push(repay._id);
    if (req.body?.bank_array?.length > 0) {
      for (var ref of bank_array) {
        var account = await BankAccount.findById({ _id: `${ref}` });
        var depart = await Department.findById({
          _id: `${account?.department}`,
        });
        if (account?.due_repay >= price) {
          account.due_repay -= price;
        }
        if (account?.total_repay >= price) {
          account.total_repay -= price;
        }
        if (depart?.due_repay >= price) {
          depart.due_repay -= price;
        }
        if (depart?.total_repay >= price) {
          depart.total_repay -= price;
        }
        price =
          account.due_repay >= price
            ? account.due_repay - price
            : price - account.due_repay;
        repay.bank_account.push(account?._id);
        repay.bank_account_count += 1;
        await Promise.all([depart.save(), account.save()]);
      }
    }
    await Promise.all([
      institute.save(),
      notify.save(),
      admin.save(),
      repay.save(),
      finance.save(),
      financeUser.save(),
    ]);
    // const insEncrypt = await encryptionPayload(institute);
    res.status(200).send({
      message: "T-3 Days Payment Payout Done 😀",
      status: true,
      // pay_flow,
      // pay_ins,
    });
    invokeSpecificRegister(
      "Specific Notification",
      `Qviple Super Admin re-pay Rs. ${p_amount} to you`,
      "Qviple Repayment",
      financeUser._id,
      financeUser.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveRepayDepartmentAmount = async (req, res) => {
  try {
    const { did, baid } = req.params;
    const { txnId, message, t_amount, p_amount } = req.body;
    if (!did && !t_amount && !p_amount && !baid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const depart = await Department.findById({ _id: did });
    const account = await BankAccount.findById({ _id: baid });
    const institute = await InstituteAdmin.findById({
      _id: `${depart?.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    }).populate({
      path: "financeHead",
      select: "user",
    });
    const financeUser = await User.findById({
      _id: `${finance?.financeHead?.user}`,
    });
    const notify = new Notification({});
    const repay = new RePay({});
    if (institute?.payout_pool >= p_amount) {
      institute.payout_pool -= p_amount;
    }
    if (institute.adminRepayAmount >= p_amount) {
      institute.adminRepayAmount -= p_amount;
    }
    institute.insBankBalance += p_amount;
    finance.financeBankBalance = finance.financeBankBalance + p_amount;
    finance.financeTotalBalance = finance.financeTotalBalance + p_amount;
    if (admin.returnAmount >= p_amount) {
      admin.returnAmount -= p_amount;
    }
    notify.notifyContent = `Qviple Super Admin re-pay Rs. ${p_amount} to you as settlement in ${
      account?.finance_bank_name ?? ""
    } (Secondary A/C)`;
    notify.notifySender = admin._id;
    notify.notifyCategory = "Qviple Repayment";
    notify.notifyReceiever = uid;
    institute.iNotify.push(notify._id);
    financeUser.uNotify.push(notify._id);
    notify.institute = institute._id;
    notify.notifyBySuperAdminPhoto = "https://qviple.com/images/newLogo.svg";
    repay.repayAmount = p_amount;
    (repay.repayStatus = "Transferred"), (repay.txnId = txnId);
    repay.message = message;
    repay.institute = institute._id;
    admin.repayArray.push(repay._id);
    institute.getReturn.push(repay._id);
    if (account?.due_repay >= p_amount) {
      account.due_repay -= p_amount;
    }
    if (account?.total_repay >= p_amount) {
      account.total_repay -= p_amount;
    }
    if (depart?.due_repay >= p_amount) {
      depart.due_repay -= p_amount;
    }
    if (depart?.total_repay >= p_amount) {
      depart.total_repay -= p_amount;
    }
    repay.bank_account.push(account?._id);
    repay.bank_account_count += 1;
    await Promise.all([
      institute.save(),
      notify.save(),
      admin.save(),
      repay.save(),
      finance.save(),
      financeUser.save(),
      depart.save(),
      account.save(),
    ]);
    // const insEncrypt = await encryptionPayload(institute);
    res.status(200).send({
      message: "T-3 Days Payment Payout Done 😀",
      status: true,
      // pay_flow,
      // pay_ins,
    });
    invokeSpecificRegister(
      "Specific Notification",
      `Qviple Super Admin re-pay Rs. ${p_amount} to you`,
      "Qviple Repayment",
      financeUser._id,
      financeUser.deviceToken
    );
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
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "repayAmount repayStatus message txnId createdAt bank_account_count"
      )
      .populate({
        path: "institute",
        select:
          "insName bankAccountHolderName bankAccountNumber bankIfscCode bankAccountPhoneNumber bankAccountType bank_status",
      })
      .populate({
        path: "bank_account",
      });
    if (get_return?.length > 0) {
      // const adminEncrypt = await encryptionPayload(get_return);
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
    // Add Another Encryption
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
    // Add Another Encryption
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
    // const pEncrypt = await encryptionPayload(post);
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
    // Add Another Encryption
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
        "insName photoId insProfilePhoto status blockStatus application_fee_charges one_line_about bankAccountNumber bankAccountHolderName bankIfscCode bankAccountType bankAccountPhoneNumber paymentBankStatus questionCount pollCount insEditableText insEditableTexts coverId insRegDate departmentCount announcementCount admissionCount insType insMode insAffiliated joinedCount staffCount studentCount insProfileCoverPhoto followersCount name followingCount postCount insAbout insEmail insAddress insEstdDate createdAt insPhoneNumber insAchievement "
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
    // const insEncrypt = await encryptionPayload(institute);
    res.status(200).send({ message: "One Institute Profile Data", institute });
  } catch (e) {
    console.log(e);
  }
};

exports.uploadAdmissionApplicationCharges = async (req, res) => {
  try {
    const { id } = req.params;
    const { charges } = req.body;
    if (!id && !charges)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley 😡",
        access: false,
      });
    const one_institute = await InstituteAdmin.findById({ _id: id });
    one_institute.application_fee_charges = parseInt(charges);
    await one_institute.save();
    res.status(200).send({ message: "New Charges Available 👍", access: true });
  } catch (e) {}
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

exports.renderAddSubDomainQuery = async (req, res) => {
  try {
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const domain = new SubDomain({ ...req.body });
    admin.sub_domain_count += 1;
    admin.sub_domain_array.push(domain?._id);
    await Promise.all([admin.save(), domain.save()]);
    res
      .status(200)
      .send({ message: "Explore New Sub Domain Landing Page", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllSubDomainArray = async (req, res) => {
  try {
    const admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("sub_domain_array");
    const all_domain = await SubDomain.find({
      $and: [{ _id: { $in: admin?.sub_domain_array } }, { status: "Allotted" }],
    }).populate({
      path: "link_up",
      select: "insName name photoId profilePhoto",
    });
    if (all_domain?.length > 0) {
      res.status(200).send({
        message: "Explore All Sub Domains",
        access: true,
        all_domain: all_domain,
      });
    } else {
      res.status(200).send({
        message: "No Sub Domains",
        access: false,
        all_domain: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderSubDomainHostQuery = async (req, res) => {
  try {
    const { filter_by } = req.query;
    if (!filter_by)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("sub_domain_array");
    const all_domain = await SubDomain.findOne({
      $and: [
        { _id: { $in: admin?.sub_domain_array } },
        { sub_domain_path: { $regex: filter_by, $options: "i" } },
      ],
    }).populate({
      path: "link_up",
      select: "insName name photoId profilePhoto",
    });
    if (all_domain) {
      res.status(200).send({
        message: "Explore One Domain With Institute",
        access: true,
        all_domain: all_domain,
      });
    } else {
      res.status(200).send({
        message: "You are lost in space",
        access: false,
        all_domain: null,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderLinkSubDomainQuery = async (req, res) => {
  try {
    const { sdid } = req.params;
    const { insId } = req.query;
    if (!sdid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_domain = await SubDomain.findById({ _id: sdid });
    const one_institute = await InstituteAdmin.findById({ _id: insId });

    one_domain.link_up = one_institute?._id;
    one_institute.sub_domain = one_domain?._id;
    one_institute.sub_domain_link_up_status = "Linked";
    one_domain.status = "Allotted and Linked";

    await Promise.all([one_domain.save(), one_institute.save()]);
    res.status(200).send({ message: "Successfully Linked Up", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllBankAccountQuery = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    // var one_institute = await InstituteAdmin.findById({ _id: id})
    var all_depart = await Department.find({ $and: [{ institute: id }] })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "bank_account",
      });
    if (all_depart?.length > 0) {
      res.status(200).send({
        message: "Explore All Bank Accounts For Repayment",
        access: true,
        all_depart: all_depart,
      });
    } else {
      res.status(200).send({
        message: "No Bank Accounts For Repayment",
        access: false,
        all_depart: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllRepayBankAccountQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var all = [];
    var one_institute = await InstituteAdmin.findById({ _id: id });
    var all_account = await BankAccount.find({
      $and: [{ department: { $in: one_institute?.depart } }],
    });
    var hostel_account = await BankAccount.find({
      hostel: `${one_institute?.hostelDepart?.[0]}`,
    });
    var trans_account = await BankAccount.find({
      transport: `${one_institute?.transportDepart?.[0]}`,
    });
    var lib_account = await BankAccount.find({
      library: `${one_institute?.library?.[0]}`,
    });
    all.push(
      ...all_account,
      ...hostel_account,
      ...trans_account,
      ...lib_account
    );
    if (all?.length > 0) {
      res.status(200).send({
        message: "Explore All Bank Accounts For Repayment",
        access: true,
        all_account: all,
      });
    } else {
      res.status(200).send({
        message: "No Bank Accounts For Repayment",
        access: false,
        all_account: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAutoPayoutsQuery = async (req, res) => {
  try {
    var date = new Date(new Date().setDate(new Date().getDate() - 3));
    var all_ins = await InstituteAdmin.find({}).select(
      "payment_history partial_pay_amount payout_pool"
    );

    for (var pay_ins of all_ins) {
      var payout_price = 0;
      const pay_flow = await OrderPayment.find({
        $and: [
          { _id: { $in: pay_ins?.payment_history } },
          {
            created_at: {
              $lte: date,
            },
          },
          {
            payout_enable: "Not Paid",
          },
        ],
      }).select(
        "payment_module_type payment_amount payment_mode payout_enable"
      );

      for (var flow of pay_flow) {
        if (
          flow?.payment_module_type === "Fees" &&
          flow?.payment_mode === "By Bank"
        ) {
          payout_price += flow?.payment_amount;
          flow.payout_enable = "Paid";
          await flow.save();
        }
        if (
          flow?.payment_module_type === "Admission" &&
          flow?.payment_mode === "By Bank"
        ) {
          payout_price += flow?.payment_amount;
          flow.payout_enable = "Paid";
          await flow.save();
        }
        // if (
        //   flow?.payment_module_type === "Admission" &&
        //   flow?.payment_mode === "By Bank"
        // ) {
        //   payout_price += flow?.payment_amount;
        //   flow.payout_enable = "Paid";
        //   await flow.save();
        // }
      }
      pay_ins.payout_pool += payout_price;
      await pay_ins.save();
      payout_price = 0;
    }
    // const insEncrypt = await encryptionPayload(institute);
    // res.status(200).send({
    //   message: "T-3 Days Payment Payout Settelled 😀",
    //   access: true,
    // });
  } catch (e) {
    console.log(e);
  }
};

// exports.renderPayoutsPaid = async (req, res) => {
//   try {
//     const { pid } = req.params;
//     const { t_amount, p_amount } = req.body;
//     if (!pid)
//       return res.status(200).send({
//         message: "Their is a bug need to fix immediately 😡",
//         access: false,
//       });
//     const date = new Date(new Date().setDate(new Date().getDate() - 2));
//     const pay_ins = await InstituteAdmin.findById({ _id: pid }).select(
//       "payment_history partial_pay_amount adminRepayAmount"
//     );

//     const pay_flow = await OrderPayment.find({
//       $and: [
//         { _id: { $in: pay_ins?.payment_history } },
//         {
//           created_at: {
//             $lte: date,
//           },
//         },
//         {
//           payout_enable: "Not Paid",
//         },
//       ],
//     }).select("payment_module_type payment_amount payout_enable payment_mode");

//     for (var flow of pay_flow) {
//       if (
//         flow?.payment_module_type === "Fees" &&
//         flow?.payment_mode === "By Bank"
//       ) {
//         flow.payout_enable = "Paid";
//         await flow.save();
//       }
//       if (
//         flow?.payment_module_type === "Admission" &&
//         flow?.payment_mode === "By Bank"
//       ) {
//         flow.payout_enable = "Paid";
//         await flow.save();
//       }
//     }
//     pay_ins.partial_pay_amount +=
//       t_amount - p_amount - pay_ins.partial_pay_amount;
//     if (pay_ins.adminRepayAmount > p_amount) {
//       pay_ins.adminRepayAmount -= p_amount;
//     }
//     await pay_ins.save();
//     // const insEncrypt = await encryptionPayload(institute);
//     res.status(200).send({
//       message: "T-2 Days Payment Payout Done 😀",
//       access: true,
//       pay_flow,
//       pay_ins,
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

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
