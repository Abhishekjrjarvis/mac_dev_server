const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
const Admission = require("../../models/Admission/Admission");
const NewApplication = require("../../models/Admission/NewApplication");
const bcrypt = require("bcryptjs");
const {
  getFileStream,
  uploadDocFile,
  uploadFile,
  deleteFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const BankAccount = require("../../models/Finance/BankAccount");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const payment_modal_activate = require("./AuthFunction");
const Referral = require("../../models/QCoins/Referral");
const QRCode = require("qrcode");
const moment = require("moment");
const invokeSpecificRegister = require("../../Firebase/specific");
const Finance = require("../../models/Finance");
const Answer = require("../../models/Question/Answer");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const ReplyComment = require("../../models/ReplyComment/ReplyComment");
const AnswerReply = require("../../models/Question/AnswerReply");
const OTPCode = require("../../models/OTP/otp");
const { shuffleArray } = require("../../Utilities/Shuffle");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const Class = require("../../models/Class");
const StudentNotification = require("../../models/Marks/StudentNotification");
const { file_to_aws } = require("../../Utilities/uploadFileAws");
const Notification = require("../../models/notification");
const Status = require("../../models/Admission/status");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const {
  random_password,
  filter_unique_username,
  generateAccessAdminToken,
  generateAccessInsToken,
  generateAccessToken,
  send_email_authentication,
  generateAccessDesignationToken,
} = require("../../helper/functions");

const { user_date_of_birth } = require("../../helper/dayTimer");
const { studentsListQuery, ClassIds } = require("../../addons");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const { randomSixCode } = require("../../Service/close");
const Department = require("../../models/Department");
const Batch = require("../../models/Batch");
const Subject = require("../../models/Subject");
const { universal_account_creation_feed } = require("../../Post/globalFeed");
const { student_form_loop } = require("../../helper/studentLoop");
const {
  ignite_multiple_alarm,
  fee_reordering,
  insert_multiple_status,
  fee_reordering_direct_student,
  fee_reordering_direct_student_payload,
  fee_reordering_direct_student_payload_exist_query,
} = require("../../helper/multipleStatus");
const {
  whats_app_sms_payload,
  email_sms_payload_query,
} = require("../../WhatsAppSMS/payload");
const { handle_undefined } = require("../../Handler/customError");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const FeeStructure = require("../../models/Finance/FeesStructure");
const RemainingList = require("../../models/Admission/RemainingList");
const Hostel = require("../../models/Hostel/hostel");

const generateQR = async (encodeData, Id) => {
  try {
    const institute = await InstituteAdmin.findById({ _id: Id });
    var data = await QRCode.toDataURL(encodeData);
    institute.profileQRCode = data;
    await institute.save();
  } catch (e) {
    console.log(e);
  }
};

const show_specific_activity = async (query) => {
  try {
    var data = `Welcome ${query?.insName}/${query?.name} with contact ${query?.insEmail}/${query?.insPhoneNumber} with delievering content ${query?.insMode} as ${query?.insType} placed on ${query?.insAddress}
     in ${query?.insDistrict} in ${query?.insState} with postal code ${query?.insPincode} at Qviple Platform.`;
    const users_query = [
      "630f4b86e5a48ad50a9617a1",
      "630f6d19a8d864c2234fe4cc",
    ];
    for (let i = 0; i < users_query?.length; i++) {
      var user = await User.findById({ _id: users_query[i] }).select(
        "deviceToken"
      );
      invokeSpecificRegister(
        "Specific Notification",
        data,
        "New Institute Welcome",
        user._id,
        user.deviceToken
      );
    }
    return "Done 👍";
  } catch (e) {
    console.log(e);
  }
};

exports.getRegisterIns = async (req, res) => {
  try {
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const existInstitute = await InstituteAdmin.findOne({
      name: req.body.name,
    });
    const existAdmin = await Admin.findOne({ adminUserName: req.body.name });
    const existUser = await User.findOne({ username: req.body.name });
    if (existAdmin) {
      res.status(200).send({ message: "Username already exists" });
    } else if (existUser) {
      res.status(200).send({ message: "Username already exists" });
    } else {
      if (existInstitute) {
        res.send({ message: "Institute Existing with this Username" });
      } else {
        const institute = new InstituteAdmin({ ...req.body });
        institute.staffJoinCode = await randomSixCode();
        if (req.body.userId !== "") {
          const user = await User.findOne({ username: req.body.userId });
          if (user) {
            var refCoins = new Referral({ referralEarnStatus: "Earned" });
            refCoins.referralBy = institute._id;
            institute.referralArray.push(refCoins._id);
            institute.initialReferral = user._id;
            refCoins.referralTo = user._id;
            user.referralArray.push(refCoins._id);
            user.referralStatus = "Granted";
            user.paymentStatus = "Not Paid";
            await Promise.all([refCoins.save(), user.save()]);
          }
        }
        institute.photoId = "1";
        institute.coverId = "2";
        institute.insProfilePhoto = "institute-default-avatar.svg";
        institute.profileURL = `https://qviple.com/q/${institute.name}/profile`;
        // institute.modal_activate = payment_modal_activate();
        institute.next_date = `${new Date().getFullYear()}-${
          new Date().getMonth() + 1 < 10
            ? `0${new Date().getMonth() + 1}`
            : new Date().getMonth() + 1
        }-${
          new Date().getDate() < 10
            ? `0${new Date().getDate()}`
            : new Date().getDate()
        }`;
        admins.instituteList.push(institute);
        admins.requestInstituteCount += 1;
        await Promise.all([admins.save(), institute.save()]);
        // const iEncrypt = await encryptionPayload(institute);
        res.status(201).send({ message: "Institute", institute });
        const uInstitute = await InstituteAdmin.findOne({
          isUniversal: "Universal",
        });
        if (uInstitute && uInstitute.posts.length >= 1) {
          uInstitute.posts.forEach(async (ele) => {
            institute.posts.push(ele);
          });
          await institute.save();
        }
        generateQR(
          `https://qviple.com/q/${institute.name}/profile`,
          institute._id
        );
      }
    }
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.getDocIns = async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(`Error`, e.message);
  }
};

exports.getUpDocIns = async (req, res) => {
  try {
    const id = req.params.id;
    const file = req.file;
    const results = await uploadDocFile(file);
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insDocument = results.key;
    await institute.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Uploaded" });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.getPassIns = async (req, res) => {
  try {
    const { id } = req.params;
    const { insPassword, insRePassword } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const genPass = bcrypt.genSaltSync(12);
    const hashPass = bcrypt.hashSync(insPassword, genPass);
    if (insPassword === insRePassword) {
      institute.insPassword = hashPass;
      await institute.save();
      const token = generateAccessInsToken(
        institute?.name,
        institute?._id,
        institute?.insPassword
      );
      // const iPassEncrypt = await encryptionPayload(institute);
      res.json({ token: `Bearer ${token}`, institute: institute, login: true });
    } else {
      res.send({ message: "Invalid Combination", login: false });
    }
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

var r_date = new Date();
var r_l_date = new Date(r_date);
r_l_date.setDate(r_l_date.getDate() + 21);
var r_l_day = r_l_date.getDate();
var r_l_month = r_l_date.getMonth() + 1;
var r_l_year = r_l_date.getFullYear();
if (r_l_month < 10) {
  r_l_month = `0${r_l_month}`;
}
var rDate = `${r_l_year}-${r_l_month}-${r_l_day}`;

const generateOTP = async (mob) => {
  let rand1 = Math.floor(Math.random() * 9) + 1;
  let rand2 = Math.floor(Math.random() * 9) + 1;
  let rand3 = Math.floor(Math.random() * 9) + 1;
  let rand4 = Math.floor(Math.random() * 9) + 1;
  OTP = `${rand1}${rand2}${rand3}${rand4}`;
  axios
    .post(
      `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=Welcome to Qviple, Your Qviple account verification OTP is ${OTP} Mithkal Minds Pvt Ltd.&senderid=QVIPLE&accusage=6`
    )
    .then((res) => {
      if ((res && res.data.includes("success")) || res.data.includes("sent")) {
        console.log("USER - messsage Sent Successfully", res.data);
      } else {
        console.log("something went wrong");
      }
    });
  return OTP;
};

const directESMSQuery = (mob, valid_sname, valid_iname) => {
  var sName = `${valid_sname?.slice(0, 30)}`;
  var iName = `${valid_iname?.slice(0, 30)}`;
  const e_message = `Hi ${sName}. "Qviple" is ERP Software of ${iName}. You are requested to login to your account with your mobile number(On which this SMS is received) to stay updated about your fees, exams and events of your school or college. Login by downloading app 'Qviple Community' from playstore or through link: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - From "Qviple"`;
  const url = `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=${e_message}&senderid=QVIPLE&accusage=1&entityid=1701164286216096677&tempid=1707168309247841573`;
  axios
    .post(url)
    .then((res) => {
      if ((res && res.data.includes("success")) || res.data.includes("sent")) {
        console.log("E-messsage Sent Successfully", res.data);
      } else {
        console.log("E-something went wrong");
      }
    })
    .catch((e) => {
      console.log(e);
    });
  return true;
};

// console.log(directESMSQuery(8329911939, "Pankaj Singh", "Qviple Officials"));

const directHSMSQuery = async (mob, sName, iName, cName) => {
  const e_message = `${sName}, आप ${iName} के ${cName} में पढ़ रहे हैं। लिंक के माध्यम से 'Qviple Community' ऐप डाउनलोड करके लॉग इन करें: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - Qviple से`;
  const encodeURL = encodeURI(e_message);
  const url = `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=${encodeURL}&senderid=QVIPLE&accusage=6&entityid=1701164286216096677&tempid=1707167283483347066&unicode=1`;
  axios
    .get(url)
    .then((res) => {
      if ((res && res.data.includes("success")) || res.data.includes("sent")) {
        console.log("H-messsage Sent Successfully", res.data);
      } else {
        console.log("H-something went wrong");
      }
    })
    .catch((e) => {
      console.log(e);
    });
  return true;
};

const directMSMSQuery = async (mob, sName, iName, cName) => {
  const e_message = `${sName}, तुम्ही ${iName} मधील ${cName} मध्ये शिकत आहात. लिंकद्वारे 'Qviple Community' app डाउनलोड करून लॉग इन करा: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - Qviple`;
  const encodeURL = encodeURI(e_message);
  const url = `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=${encodeURL}&senderid=QVIPLE&accusage=6&entityid=1701164286216096677&tempid=1707167283508579573&unicode=1`;
  axios
    .get(url)
    .then((res) => {
      if ((res && res.data.includes("success")) || res.data.includes("sent")) {
        console.log("M-messsage Sent Successfully", res.data);
      } else {
        console.log("M-something went wrong");
      }
    })
    .catch((e) => {
      console.log(e);
    });
  return true;
};

const directESMSStaffQuery = (mob, valid_sname, valid_iname) => {
  var sName = `${valid_sname?.slice(0, 30)}`;
  var iName = `${valid_iname?.slice(0, 30)}`;
  const e_message = `Hi ${sName}. "Qviple" is ERP Software of ${iName}. You are requested to login to your account with your mobile number(On which this SMS is received) to stay updated about your fees, exams and events of your school or college. Login by downloading app 'Qviple Community' from playstore or through link: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - From "Qviple"`;
  const url = `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=${e_message}&senderid=QVIPLE&accusage=1&entityid=1701164286216096677&tempid=1707168309247841573`;
  axios
    .post(url)
    .then((res) => {
      if ((res && res.data.includes("success")) || res.data.includes("sent")) {
        console.log("E-messsage Sent Successfully", res.data);
      } else {
        console.log("E-something went wrong");
      }
    })
    .catch((e) => {
      console.log(e);
    });
  return true;
};

// console.log(directESMSStaffQuery(7007023972, "Ankush Singh", "Qviple Backlog"));

// console.log(
//   directESMSStaffQuery(7007023972, "Abhishek Singh", "Qviple Official")
// );

// console.log(directESMSQuery(7007023972, "Pankaj Bharat Phad", "6th-class", "Qviple Official"))

// const directHSMSStaffQuery = async (mob, sName, iName, cName) => {
//   const e_message = `${sName}, आप ${iName} के ${cName} में पढ़ रहे हैं। लिंक के माध्यम से 'Qviple Community' ऐप डाउनलोड करके लॉग इन करें: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - Qviple से`;
//   const encodeURL = encodeURI(e_message);
//   const url = `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=${encodeURL}&senderid=QVIPLE&accusage=6&entityid=1701164286216096677&tempid=1707167283483347066&unicode=1`;
//   axios
//     .get(url)
//     .then((res) => {
//       if ((res && res.data.includes("success")) || res.data.includes("sent")) {
//         console.log("H-messsage Sent Successfully", res.data);
//       } else {
//         console.log("H-something went wrong");
//       }
//     })
//     .catch((e) => {
//       console.log(e);
//     });
//   return true;
// };

exports.getOtpAtUser = async (req, res) => {
  try {
    const { userPhoneNumber, status } = req.body;
    const valid_phone = !userPhoneNumber?.includes("@")
      ? userPhoneNumber?.length === 10
        ? parseInt(userPhoneNumber)
        : ""
      : "";
    if (!valid_phone) {
      var valid_email = userPhoneNumber?.includes("@")
        ? userPhoneNumber
        : false;
    }
    if (valid_phone) {
      if (status === "Not Verified") {
        var valid_user = parseInt(userPhoneNumber);
        await OTPCode.deleteMany({ otp_number: valid_user });
        const code = await generateOTP(valid_user);
        const otpCode = new OTPCode({
          otp_number: valid_user,
          otp_code: `${code}`,
        });
        await otpCode.save();
        // const uPhoneEncrypt = await encryptionPayload(valid_user);
        res.status(200).send({
          message: "code will be send to registered mobile number",
          userPhoneNumber,
        });
      } else {
        res.send({ message: "User will be verified..." });
      }
    } else if (valid_email) {
      if (status === "Not Verified") {
        await OTPCode.deleteMany({ otp_email: userPhoneNumber });
        const code = await send_email_authentication(userPhoneNumber);
        const otpCode = new OTPCode({
          otp_email: userPhoneNumber,
          otp_code: `${code}`,
        });
        // console.log(code);
        await otpCode.save();
        // const uPhoneEncrypt = await encryptionPayload(userPhoneNumber);
        res.status(200).send({
          message: "code will be send to entered Email",
          userPhoneNumber,
        });
      } else {
        res.send({ message: "User will be verified..." });
      }
    } else {
      res.send({ message: "Invalid Phone No." });
    }
  } catch (e) {
    console.log(`Error`, e);
  }
};

const generateInsOTP = async (mob) => {
  let rand1 = Math.floor(Math.random() * 9) + 1;
  let rand2 = Math.floor(Math.random() * 9) + 1;
  let rand3 = Math.floor(Math.random() * 9) + 1;
  let rand4 = Math.floor(Math.random() * 9) + 1;
  InsOTP = `${rand1}${rand2}${rand3}${rand4}`;
  axios
    .post(
      `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=Welcome to Qviple, Your Qviple account verification OTP is ${InsOTP} Mithkal Minds Pvt Ltd.&senderid=QVIPLE&accusage=6`
    )
    .then((res) => {
      if ((res && res.data.includes("success")) || res.data.includes("sent")) {
        console.log("INS - messsage Sent Successfully", res.data);
      } else {
        console.log("something went wrong");
      }
    })
    .catch(() => {});
  return InsOTP;
};

exports.getOtpAtIns = async (req, res) => {
  try {
    const { insPhoneNumber, status } = req.body;
    var valid_ins = parseInt(insPhoneNumber);
    if (insPhoneNumber) {
      if (status === "Not Verified") {
        await OTPCode.deleteMany({ otp_number: valid_ins });
        const code = await generateInsOTP(valid_ins);
        const otpCode = new OTPCode({
          otp_number: valid_ins,
          otp_code: `${code}`,
        });
        await otpCode.save();
        // const iPhoneEncrypt = await encryptionPayload(valid_ins);
        res.status(200).send({
          message: "code will be send to registered mobile number",
          insPhoneNumber,
        });
      } else {
        res.send({ message: "Institute Phone Number will be verified..." });
      }
    } else {
      res.send({ message: "Invalid Phone No." });
    }
  } catch {
    console.log(e);
  }
};

exports.verifyOtpByUser = async (req, res) => {
  try {
    var account_linked = [];
    const { id } = req.params;
    const valid_otp = await OTPCode.findOne({ otp_number: `${id}` });
    const valid_otp_email = await OTPCode.findOne({ otp_email: `${id}` });
    if (valid_otp) {
      var all_account = await User.find({ userPhoneNumber: id }).select(
        "userLegalName username profilePhoto userPassword"
      );
      if (all_account?.length > 0) {
        for (let all of all_account) {
          const token = generateAccessToken(
            all?.username,
            all?._id,
            all?.userPassword
          );
          account_linked.push({
            user: all,
            login: true,
            token: `Bearer ${token}`,
          });
        }
      }
    } else if (valid_otp_email) {
      // var low_id = id?.toLowerCase();
      // var high_id = id?.toUpperCase();
      var all_account_email = await User.find({
        userEmail: { $regex: id, $options: "i" },
      }).select("userLegalName username profilePhoto userPassword");
      if (all_account_email?.length > 0) {
        for (let all of all_account_email) {
          const token = generateAccessToken(
            all?.username,
            all?._id,
            all?.userPassword
          );
          account_linked.push({
            user: all,
            login: true,
            token: `Bearer ${token}`,
          });
        }
      }
    } else {
    }
    if (
      (req.body.userOtpCode &&
        req.body.userOtpCode === `${valid_otp?.otp_code}`) ||
      (req.body.userOtpCode &&
        req.body.userOtpCode === `${valid_otp_email?.otp_code}`)
    ) {
      var userStatus = "approved";
      // Add Another Encryption
      res.status(200).send({
        message: "OTP verified",
        id,
        userStatus,
        accounts: account_linked,
        count: account_linked?.length,
        access: true,
      });
      if (valid_otp) {
        await OTPCode.findByIdAndDelete(valid_otp?._id);
      } else if (valid_otp_email) {
        await OTPCode.findByIdAndDelete(valid_otp_email?._id);
      } else {
      }
    } else {
      res.status(200).send({
        message: "Invalid OTP",
        access: false,
        accounts: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.verifyOtpByIns = async (req, res) => {
  try {
    const { id } = req.params;
    const valid_otp = await OTPCode.findOne({ otp_number: `${id}` });
    if (
      req.body.insOtpCode &&
      req.body.insOtpCode === `${valid_otp?.otp_code}`
    ) {
      var insMobileStatus = "approved";
      // Add Another Encryption
      res.send({ message: "OTP verified", id, insMobileStatus });
      await OTPCode.findByIdAndDelete(valid_otp?._id);
    } else {
      res.send({ message: "Invalid OTP" });
    }
  } catch {
    console.log(e);
  }
};

var date = new Date();
var p_date = date.getDate();
var p_month = date.getMonth() + 1;
var p_year = date.getFullYear();
if (p_month < 10) {
  p_month = `0${p_month}`;
}
if (p_date < 10) {
  p_date = `0${p_date}`;
}
var c_date = `${p_year}-${p_month}-${p_date}`;
//
var month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
//

exports.profileByUser = async (req, res) => {
  try {
    const { id } = req.params;
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const {
      userLegalName,
      userGender,
      userDateOfBirth,
      username,
      sample_pic,
      userEmail,
    } = req.body;
    const existAdmin = await Admin.findOne({ adminUserName: username });
    const existInstitute = await InstituteAdmin.findOne({ name: username });
    const existUser = await User.findOne({ username: username });
    if (existAdmin) {
      res.status(200).send({ message: "Username already exists" });
    } else if (existInstitute) {
      res.status(200).send({ message: "Username already exists" });
    } else {
      if (existUser) {
        res.send({ message: "Username already exists" });
      } else {
        const valid_phone = !id?.includes("@")
          ? id?.length === 10
            ? parseInt(id)
            : ""
          : "";
        if (!valid_phone) {
          var valid_email = id?.includes("@") ? id : false;
        }
        var user = new User({
          userLegalName: userLegalName,
          userGender: userGender,
          userDateOfBirth: userDateOfBirth,
          username: username?.trim(),
          userStatus: "Approved",
          userPhoneNumber: valid_phone ? id : 0,
          photoId: "0",
          userEmail: valid_email ? id : "",
          coverId: "2",
          remindLater: rDate,
          next_date: c_date,
        });
        if (req.file) {
          var width = 200;
          var height = 200;
          var file = req.file;
          var results = await uploadFile(file, width, height);
          user.profilePhoto = results.key;
        } else {
          user.profilePhoto = sample_pic;
        }
        admins.users.push(user);
        admins.userCount += 1;
        await Promise.all([admins.save(), user.save()]);
        if (req.file) {
          await unlinkFile(req.file.path);
        }
        const token = generateAccessToken(user?.username, user?._id);
        // const uLoginEncrypt = await encryptionPayload(user);
        res.status(200).send({
          message: "Profile Successfully Created...",
          user,
          token: `Bearer ${token}`,
        });
        var uInstitute = await InstituteAdmin.findOne({
          isUniversal: "Universal",
        })
          .select("id userFollowersList followersCount")
          .populate({ path: "posts" });
        if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
          const post = await Post.find({
            _id: { $in: uInstitute.posts },
            postStatus: "Anyone",
          });
          post.forEach(async (ele) => {
            user.userPosts.push(ele);
          });
          await user.save();
        }
        //
        var b_date = user.userDateOfBirth.slice(8, 10);
        var b_month = user.userDateOfBirth.slice(5, 7);
        var b_year = user.userDateOfBirth.slice(0, 4);
        if (b_date > p_date) {
          p_date = p_date + month[b_month - 1];
          p_month = p_month - 1;
        }
        if (b_month > p_month) {
          p_year = p_year - 1;
          p_month = p_month + 12;
        }
        var get_cal_year = p_year - b_year;
        if (get_cal_year > 13) {
          user.ageRestrict = "No";
        } else {
          user.ageRestrict = "Yes";
        }
        await user.save();
        //
        if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
        } else {
          uInstitute.userFollowersList.push(user._id);
          uInstitute.followersCount += 1;
          user.userInstituteFollowing.push(uInstitute._id);
          user.followingUICount += 1;
          await Promise.all([uInstitute.save(), user.save()]);
          const posts = await Post.find({ author: `${uInstitute._id}` });
          posts.forEach(async (ele) => {
            ele.authorFollowersCount = uInstitute.followersCount;
            await ele.save();
          });
        }
        //
      }
    }
  } catch (e) {
    console.log(`Error`, e);
  }
};

exports.profileByGoogle = async (req, res) => {
  var date = new Date();
  var p_date = date.getDate();
  var p_month = date.getMonth() + 1;
  var p_year = date.getFullYear();
  if (p_month <= 10) {
    p_month = `0${p_month}`;
  }
  var c_date = `${p_year}-${p_month}-${p_date}`;
  try {
    const {
      userGender,
      userLegalName,
      username,
      userEmail,
      userDateOfBirth,
      pic_url,
    } = req.body;
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const user = new User({
      userLegalName: userLegalName,
      userGender: userGender,
      userDateOfBirth: userDateOfBirth,
      username: username?.trim(),
      userStatus: "Approved",
      userEmail: userEmail,
      google_avatar: pic_url,
      photoId: "0",
      coverId: "2",
      createdAt: c_date,
      remindLater: rDate,
    });
    admins.users.push(user);
    admins.userCount += 1;
    await Promise.all([admins.save(), user.save()]);
    const token = generateAccessToken(user?.username, user?._id);
    res.status(200).send({
      message: "Profile Successfully Created...",
      user,
      token: `Bearer ${token}`,
    });
    const uInstitute = await InstituteAdmin.findOne({
      isUniversal: "Universal",
    }).populate({ path: "posts" });
    if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
      const post = await Post.find({
        _id: { $in: uInstitute.posts },
        postStatus: "Anyone",
      });
      post.forEach(async (ele) => {
        user.userPosts.push(ele);
      });
      await user.save();
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { userPassword, userRePassword } = req.body;
    const user = await User.findById({ _id: id });
    const genUserPass = bcrypt.genSaltSync(12);
    const hashUserPass = bcrypt.hashSync(req.body.userPassword, genUserPass);
    if (user) {
      if (userPassword === userRePassword) {
        user.userPassword = hashUserPass;
        await user.save();
        const token = generateAccessToken(
          user?.username,
          user?._id,
          user?.userPassword
        );
        // const uPassEncrypt = await encryptionPayload(user);
        res.json({ token: `Bearer ${token}`, user: user, login: true });
      } else {
        res.send({ message: "Invalid Password Combination", login: false });
      }
    } else {
      res.send({ message: "Invalid User", login: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.forgotPasswordSendOtp = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username: username });
    const institute = await InstituteAdmin.findOne({ name: username });
    if (user) {
      if (user?.userPhoneNumber) {
        await OTPCode.deleteMany({ otp_number: user.userPhoneNumber });
        const code = await generateOTP(user.userPhoneNumber);
        const otpCode = new OTPCode({
          otp_number: user.userPhoneNumber,
          otp_code: `${code}`,
        });
        await otpCode.save();
        // const fEncrypt = await encryptionPayload(user);
        res.status(200).send({
          message: "code will be send to registered mobile number",
          user,
        });
      } else if (user?.userEmail) {
        await OTPCode.deleteMany({ otp_email: user?.userEmail });
        const code = await send_email_authentication(user?.userEmail);
        const otpCode = new OTPCode({
          otp_email: user?.userEmail,
          otp_code: `${code}`,
        });
        await otpCode.save();
        // const fEncrypt = await encryptionPayload(user);
        res.status(200).send({
          message: "code will be send to registered email",
          user,
        });
      } else {
      }
    } else if (institute) {
      await OTPCode.deleteMany({ otp_number: institute.insPhoneNumber });
      const code = await generateOTP(institute.insPhoneNumber);
      const otpCode = new OTPCode({
        otp_number: institute.insPhoneNumber,
        otp_code: `${code}`,
      });
      await otpCode.save();
      // const fEncrypt = await encryptionPayload(institute);
      res.status(200).send({
        message: "code will be send to registered mobile number",
        institute,
      });
    } else {
      res.status(200).send({ message: "Invalid Username" });
    }
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const { fid } = req.params;
    const user = await User.findById({ _id: fid });
    const institute = await InstituteAdmin.findById({ _id: fid });
    if (user) {
      const valid_otp_user = await OTPCode.findOne({
        otp_number: `${user?.userPhoneNumber}`,
      });
      if (
        req.body.userOtpCode &&
        req.body.userOtpCode === `${valid_otp_user?.otp_code}`
      ) {
        // const oEncrypt = await encryptionPayload(user);
        res.status(200).send({ message: "Otp verified", user, access: true });
        await OTPCode.findByIdAndDelete(valid_otp_user?._id);
      } else {
        res.status(200).send({ message: "Invalid OTP", access: false });
      }
    } else if (institute) {
      const valid_otp_ins = await OTPCode.findOne({
        otp_number: `${institute?.insPhoneNumber}`,
      });
      if (
        req.body.userOtpCode &&
        req.body.userOtpCode === `${valid_otp_ins?.otp_code}`
      ) {
        // const oEncrypt = await encryptionPayload(institute);
        res
          .status(200)
          .send({ message: "Otp verified", institute, access: true });
        await OTPCode.findByIdAndDelete(valid_otp_ins?._id);
      } else {
        res.status(200).send({ message: "Invalid OTP", access: false });
      }
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getNewPassword = async (req, res) => {
  try {
    const { rid } = req.params;
    const { userPassword, userRePassword } = req.body;
    const user = await User.findById({ _id: rid });
    const institute = await InstituteAdmin.findById({ _id: rid });
    const genUserPass = bcrypt.genSaltSync(12);
    const hashUserPass = bcrypt.hashSync(req.body.userPassword, genUserPass);
    if (user) {
      if (userPassword === userRePassword) {
        user.userPassword = hashUserPass;
        await user.save();
        // const nEncrypt = await encryptionPayload(user);
        res
          .status(200)
          .send({ message: "Password Changed Successfully", user });
      } else {
        res.status(200).send({ message: "Invalid Password Combination" });
      }
    } else if (institute) {
      if (userPassword === userRePassword) {
        institute.insPassword = hashUserPass;
        await institute.save();
        // const nEncrypt = await encryptionPayload(institute);
        res
          .status(200)
          .send({ message: "Password Changed Successfully", institute });
      } else {
        res.status(200).send({ message: "Invalid Password Combination" });
      }
    } else {
    }
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

module.exports.getLogin = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
      res.status(401).send({ message: "Invalid Token" });
    } else {
      jwt.verify(token, `${process.env.TOKEN_SECRET}`, function (err, decoded) {
        if (err) {
          res.status(401).send({ message: "UnAuthorized User", status: false });
        } else {
          res.status(200).send({
            message: "Authorized User",
            status: true,
            token: token,
            user: decoded.userId,
            institute: decoded.insId,
            admin: decoded.adminId,
          });
        }
      });
    }
  } catch (e) {
    console.log(`Error`, e);
  }
};

module.exports.authentication = async (req, res) => {
  var d_date = new Date();
  var d_a_date = d_date.getDate();
  var d_a_month = d_date.getMonth() + 1;
  var d_a_year = d_date.getFullYear();
  if (d_a_date <= 9) {
    d_a_date = `0${d_a_date}`;
  }
  if (d_a_month < 10) {
    d_a_month = `0${d_a_month}`;
  }
  var deactivate_date = `${d_a_year}-${d_a_month}-${d_a_date}`;
  try {
    const { insUserName, insPassword } = req.body;
    const institute = await InstituteAdmin.findOne({ name: `${insUserName}` });
    const user = await User.findOne({ username: `${insUserName}` });
    const admin = await Admin.findOne({ adminUserName: `${insUserName}` });

    if (institute) {
      const checkPass = bcrypt.compareSync(insPassword, institute.insPassword);
      if (institute?.social_media_password_query) {
        var checkUserSocialPass = bcrypt.compareSync(
          insPassword,
          institute?.social_media_password_query
        );
      }
      if (checkPass || checkUserSocialPass) {
        //
        if (
          institute.activeStatus === "Deactivated" &&
          institute.activeDate <= deactivate_date
        ) {
          institute.activeStatus = "Activated";
          institute.activeDate = "";
          institute.last_login = new Date();
          await institute.save();
          institute.insPassword = institute?.insPassword
            ? institute?.insPassword
            : institute?.social_media_password_query;
          const token = generateAccessInsToken(
            institute?.name,
            institute?._id,
            institute?.insPassword
          );
          // const loginEncrypt = await encryptionPayload(institute);
          res.json({
            token: `Bearer ${token}`,
            institute: institute,
            login: true,
            main_role: institute?.social_media_password_query
              ? "SOCIAL_MEDIA_HANDLER"
              : "MAIN_ADMIN",
          });
        } else if (institute.activeStatus === "Activated") {
          institute.last_login = new Date();
          await institute.save();
          institute.insPassword = institute?.insPassword
            ? institute?.insPassword
            : institute?.social_media_password_query;
          const token = generateAccessInsToken(
            institute?.name,
            institute?._id,
            institute?.insPassword
          );
          // const loginEncrypt = await encryptionPayload(institute);
          res.json({
            token: `Bearer ${token}`,
            institute: institute,
            login: true,
            main_role: institute?.social_media_password_query
              ? "SOCIAL_MEDIA_HANDLER"
              : "MAIN_ADMIN",
          });
        } else {
          res.status(401).send({ message: "Unauthorized", login: false });
        }
        //
      } else {
        res.send({ message: "Invalid Credentials", login: false });
      }
    } else if (admin) {
      const checkAdminPass = bcrypt.compareSync(
        insPassword,
        admin.adminPassword
      );
      if (checkAdminPass) {
        const token = generateAccessAdminToken(
          admin?.username,
          admin?._id,
          admin?.userPassword
        );
        // const loginEncrypt = await encryptionPayload(admin);
        res.json({ token: `Bearer ${token}`, admin: admin, login: true });
      } else {
        res.send({ message: "Invalid Credentials", login: false });
      }
    } else {
      if (user) {
        const checkUserPass = bcrypt.compareSync(
          insPassword,
          user?.userPassword
        );
        if (checkUserPass) {
          if (
            user.activeStatus === "Deactivated" &&
            user.activeDate <= deactivate_date
          ) {
            user.activeStatus = "Activated";
            user.activeDate = "";
            user.last_login = new Date();
            await user.save();
            const token = generateAccessToken(
              user?.username,
              user?._id,
              user?.userPassword
            );
            // const loginEncrypt = await encryptionPayload(user);
            res.json({
              token: `Bearer ${token}`,
              user: user,
              login: true,
            });
          } else if (user.activeStatus === "Activated") {
            const token = generateAccessToken(
              user?.username,
              user?._id,
              user?.userPassword
            );
            // const loginEncrypt = await encryptionPayload(user);
            res.json({
              token: `Bearer ${token}`,
              user: user,
              login: true,
              is_developer: user?.is_developer,
            });
            user.last_login = new Date();
            await user.save();
          } else {
            res.status(401).send({ message: "Unauthorized", login: false });
          }
        } else {
          res.send({ message: "Invalid Credentials", login: false });
        }
      } else {
        res.send({ message: "Invalid End User", login: false });
      }
    }
  } catch (e) {
    console.log(`Error`, e);
  }
};

module.exports.authenticationGoogle = async (req, res) => {
  try {
    const { email, googleAuthToken } = req.body;
    const user = await User.findOne({ userEmail: email }).select(
      "userLegalName username userEmail deviceToken profilePhoto photoId google_avatar"
    );
    if (user) {
      const token = generateAccessToken(user?.username, user?._id);
      res.status(200).send({
        message: "successfully signed In",
        sign_in: true,
        user: user,
        token: `Bearer ${token}`,
        g_AuthToken: googleAuthToken,
      });
    } else {
      res.status(200).send({ message: "Failed to signed In", sign_in: false });
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports.getLogout = async (req, res) => {
  try {
    res.clearCookie("SessionID", { path: "/" });
    res.status(200).send({ message: "Successfully Logout" });
  } catch (e) {
    console.log(`Error`, e.message);
  }
};

exports.retrieveEmailRedundantQuery = async (req, res) => {
  try {
    const { email } = req.query;
    const check_ins = await InstituteAdmin.findOne({ insEmail: email }).select(
      "id"
    );
    const check_user = await User.findOne({ userEmail: email }).select("id");
    const check_admin = await Admin.findOne({ adminEmail: email }).select("id");
    var flag_email = false;
    if (check_ins) {
      flag_email = true;
      res.status(200).send({
        message: "Email Already Registered",
        flag: flag_email,
        valid_flag: { flag: true, emailId: check_ins?._id },
      });
    } else if (check_user) {
      flag_email = true;
      res.status(200).send({
        message: "Email Already Registered",
        flag: flag_email,
        valid_flag: { flag: true, emailId: check_user?._id },
      });
    } else if (check_admin) {
      flag_email = true;
      res.status(200).send({
        message: "Email Already Registered",
        flag: flag_email,
        valid_flag: { flag: true, emailId: check_admin?._id },
      });
    } else {
      res.status(200).send({
        message: "Valid Email",
        flag: flag_email,
        valid_flag: { flag: false, emailId: "" },
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUsernameEditQuery = async (req, res) => {
  try {
    var date = `${new Date().getFullYear()}-${
      new Date().getMonth() + 1 < 10
        ? `0${new Date().getMonth() + 1}`
        : new Date().getMonth() + 1
    }-${
      new Date().getDate() < 10
        ? `0${new Date().getDate()}`
        : new Date().getDate()
    }`;
    const { o_name, n_name } = req.query;
    const check_ins = await InstituteAdmin.findOne({ name: o_name }).select(
      "id next_date"
    );
    const check_user = await User.findOne({ username: o_name }).select(
      "id next_date"
    );
    const check_admin = await Admin.findOne({ adminUserName: o_name }).select(
      "id"
    );
    if (check_ins) {
      if (check_ins?.next_date <= date) {
        check_ins.name = n_name;
        check_ins.next_date =
          payment_modal_activate.check_username_edit_query();
        await check_ins.save();
        res.status(200).send({
          message: "Ins Username Granted for next update 😀👍",
          flag: true,
        });
        const post = await Post.find({ author: `${check_ins._id}` });
        post.forEach(async (ele) => {
          ele.authorUserName = check_ins.name;
          await ele.save();
        });
        const comment = await Comment.find({ author: `${check_ins._id}` });
        comment.forEach(async (com) => {
          com.authorUserName = check_ins.name;
          await com.save();
        });
        const replyComment = await ReplyComment.find({
          author: `${check_ins._id}`,
        });
        replyComment.forEach(async (reply) => {
          reply.authorUserName = check_ins.name;
          await reply.save();
        });
      } else {
        res.status(200).send({
          message: `You will be able to change your username once in 45 days. next change available at ${moment(
            new Date(check_ins.next_date).toISOString()
          ).format("MMM Do YYYY")} 😀👍`,
          flag: false,
        });
      }
    } else if (check_user) {
      if (check_user?.next_date <= date) {
        check_user.username = n_name;
        check_user.next_date =
          payment_modal_activate.check_username_edit_query();
        await check_user.save();
        res.status(200).send({
          message: "User Username Granted for next update 😀👍",
          flag: true,
        });
        const post = await Post.find({ author: `${check_user._id}` });
        post.forEach(async (ele) => {
          ele.authorUserName = check_user.username;
          await ele.save();
        });
        const comment = await Comment.find({ author: `${check_user._id}` });
        comment.forEach(async (com) => {
          com.authorUserName = check_user.username;
          await com.save();
        });
        const replyComment = await ReplyComment.find({
          author: `${check_user._id}`,
        });
        replyComment.forEach(async (reply) => {
          reply.authorUserName = check_user.username;
          await reply.save();
        });
        const answers = await Answer.find({ author: `${check_user._id}` });
        answers.forEach(async (ans) => {
          ans.authorUserName = check_user.username;
          await ans.save();
        });
        const answerReply = await AnswerReply.find({
          author: `${check_user._id}`,
        });
        answerReply.forEach(async (ansRep) => {
          ansRep.authorUserName = check_user.username;
          await ansRep.save();
        });
      } else {
        res.status(200).send({
          message: `You will be able to change your username once in 45 days. next change available at ${moment(
            new Date(check_user.next_date).toISOString()
          ).format("MMM Do YYYY")} 😀👍`,
          flag: false,
        });
      }
    } else if (check_admin) {
      res.status(200).send({
        message: "Admin Username Granted for next update 😀👍",
        flag: true,
      });
    } else {
      res
        .status(200)
        .send({ message: "Nothing found here to save 🙄", flag: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.searchByUsernameQuery = async (req, res) => {
  try {
    if (req.query.u_name?.trim() === "") {
      res.status(202).send({ message: "Please Provide a username to search" });
    } else {
      const one_ins = await InstituteAdmin.findOne({
        name: req.query.u_name,
      })
        .select("name")
        .lean()
        .exec();

      const one_user = await User.findOne({
        username: req.query.u_name,
      })
        .select("username")
        .lean()
        .exec();

      if (one_ins) {
        // const insEncrypt = await encryptionPayload(one_ins);
        res.status(202).send({
          message: "Username already exists 🙄",
          seen: true,
          username: one_ins,
        });
      } else if (one_user) {
        // const userEncrypt = await encryptionPayload(one_user);
        res.status(202).send({
          message: "Username already exists 🙄",
          seen: true,
          username: one_user,
        });
      } else {
        res.status(200).send({
          message: "this username does not exists in lake 🔍",
          seen: false,
        });
      }
    }
  } catch (e) {
    console.log(e.kind);
  }
};

exports.searchByClassCode = async (req, res) => {
  try {
    if (req.query.search?.trim() === "") {
      res.status(202).send({ message: "Please Provide a code to search" });
    } else {
      if (req.query.author === "Student") {
        var classes = await Class.findOne({
          classCode: req.query.search,
        })
          .populate({
            path: "subject",
            match: {
              subjectOptional: { $eq: "Optional" },
            },
            select: "subjectName",
          })
          .select(
            "classCode classStatus classTitle className optionalSubjectCount"
          );
        var one_ins = await InstituteAdmin.findOne({
          classCodeList: { $in: [req.query.search] },
        })
          .select("insName name insProfilePhoto photoId classCodeList")
          .lean()
          .exec();
      } else if (req.query.author === "Staff") {
        var one_ins = await InstituteAdmin.findOne({
          staffJoinCode: req.query.search,
        })
          .select("insName name insProfilePhoto photoId staffJoinCode")
          .lean()
          .exec();
      } else {
      }
    }
    if (one_ins) {
      // Add Another Encryption
      res.status(200).send({
        message: "Check All Details 🔍",
        seen: true,
        one_ins,
        classes: classes?.classStatus === "UnCompleted" ? classes : null,
      });
    } else {
      res.status(200).send({
        message: "this code does not exists in lake 🔍",
        seen: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveDirectJoinQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { sample_pic, fileArray } = req.body;
    var valid_phone = `${id}`;
    var valid_email = valid_phone?.includes("@");
    if (
      !id &&
      !req.body.studentCode &&
      !req.body.studentFirstName &&
      !req.body.studentLastName &&
      !req.body.studentGender &&
      !req.body.studentDOB
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const valid = await filter_unique_username(
      req.body.studentFirstName,
      req.body.studentDOB
    );
    if (!valid?.exist) {
      const genUserPass = bcrypt.genSaltSync(12);
      const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
      var user = new User({
        userLegalName: `${req.body.studentFirstName} ${
          req.body.studentMiddleName ? req.body.studentMiddleName : ""
        } ${req.body.studentLastName ? req.body.studentLastName : ""}`,
        userGender: req.body.studentGender,
        userDateOfBirth: req.body.studentDOB,
        username: valid?.username,
        userStatus: "Approved",
        userPhoneNumber: valid_email ? 0 : id,
        userEmail: valid_email ? id : null,
        userPassword: hashUserPass,
        photoId: "0",
        coverId: "2",
        remindLater: rDate,
        next_date: c_date,
      });
      admins.users.push(user);
      admins.userCount += 1;
      await Promise.all([admins.save(), user.save()]);
      var uInstitute = await InstituteAdmin.findOne({
        isUniversal: "Universal",
      })
        .select("id userFollowersList followersCount")
        .populate({ path: "posts" });
      if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
        const post = await Post.find({
          _id: { $in: uInstitute.posts },
          postStatus: "Anyone",
        });
        post.forEach(async (ele) => {
          user.userPosts.push(ele);
        });
        await user.save();
      }
      //
      var b_date = user.userDateOfBirth.slice(8, 10);
      var b_month = user.userDateOfBirth.slice(5, 7);
      var b_year = user.userDateOfBirth.slice(0, 4);
      if (b_date > p_date) {
        p_date = p_date + month[b_month - 1];
        p_month = p_month - 1;
      }
      if (b_month > p_month) {
        p_year = p_year - 1;
        p_month = p_month + 12;
      }
      var get_cal_year = p_year - b_year;
      if (get_cal_year > 13) {
        user.ageRestrict = "No";
      } else {
        user.ageRestrict = "Yes";
      }
      await user.save();
      //
      if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
      } else {
        uInstitute.userFollowersList.push(user._id);
        uInstitute.followersCount += 1;
        user.userInstituteFollowing.push(uInstitute._id);
        user.followingUICount += 1;
        await Promise.all([uInstitute.save(), user.save()]);
        const posts = await Post.find({ author: `${uInstitute._id}` });
        posts.forEach(async (ele) => {
          ele.authorFollowersCount = uInstitute.followersCount;
          await ele.save();
        });
      }
      const classes = await Class.findOne({ classCode: req.body.studentCode });
      const institute = await InstituteAdmin.findById({
        _id: `${classes?.institute}`,
      });
      const student = new Student({ ...req.body });
      student.valid_full_name = `${student?.studentFirstName} ${
        student?.studentMiddleName ?? ""
      } ${student?.studentLastName}`;
      const classStaff = await Staff.findById({
        _id: `${classes.classTeacher}`,
      });
      const classUser = await User.findById({ _id: `${classStaff.user}` });
      const studentOptionalSubject = req.body?.optionalSubject
        ? req.body?.optionalSubject
        : [];
      for (var file of fileArray) {
        if (file.name === "file") {
          student.photoId = "0";
          student.studentProfilePhoto = file.key;
          user.profilePhoto = file.key;
        } else if (file.name === "addharFrontCard")
          student.studentAadharFrontCard = file.key;
        else if (file.name === "addharBackCard")
          student.studentAadharBackCard = file.key;
        else if (file.name === "bankPassbook")
          student.studentBankPassbook = file.key;
        else if (file.name === "casteCertificate")
          student.studentCasteCertificatePhoto = file.key;
        else {
          student.studentDocuments.push({
            documentName: file.name,
            documentKey: file.key,
            documentType: file.type,
          });
        }
      }
      if (studentOptionalSubject?.length > 0) {
        student.studentOptionalSubject.push(...studentOptionalSubject);
      }
      if (sample_pic) {
        user.profilePhoto = sample_pic;
        student.photoId = "0";
        student.studentProfilePhoto = sample_pic;
      }

      const notify = new StudentNotification({});
      const aStatus = new Status({});
      institute.student.push(student._id);
      user.student.push(student._id);
      user.is_mentor = true;
      institute.joinedPost.push(user._id);
      classes.student.push(student._id);
      student.studentClass = classes._id;
      if (institute.userFollowersList.includes(user?._id)) {
      } else {
        user.userInstituteFollowing.push(institute?._id);
        user.followingUICount += 1;
        institute.userFollowersList.push(user?._id);
        institute.followersCount += 1;
      }
      student.institute = institute._id;
      student.user = user._id;
      notify.notifyContent = `${student.studentFirstName} ${
        student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
      } ${student.studentLastName} has been applied for role of student`;
      notify.notifySender = student._id;
      notify.notifyReceiever = classUser._id;
      institute.iNotify.push(notify._id);
      notify.notifyType = "Staff";
      notify.notifyPublisher = classStaff._id;
      classUser.activity_tab.push(notify._id);
      notify.notifyByStudentPhoto = student._id;
      notify.notifyCategory = "Student Request";
      notify.redirectIndex = 9;
      notify.classId = classes?._id;
      notify.departmentId = classes?.department;
      notify.batchId = classes?.batch;
      aStatus.content = `Your application for joining as student in ${institute.insName} is filled successfully. Stay updated to check status of your application.Tap here to see username ${user?.username}`;
      aStatus.see_secure = true;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      aStatus.student = student._id;
      //
      invokeMemberTabNotification(
        "Staff Activity",
        notify,
        "Request for Joining",
        classUser._id,
        classUser.deviceToken,
        "Staff",
        notify
      );
      //
      await Promise.all([
        student.save(),
        institute.save(),
        user.save(),
        classes.save(),
        notify.save(),
        aStatus.save(),
        classUser.save(),
      ]);
      const token = generateAccessToken(
        user?.username,
        user?._id,
        user?.userPassword
      );
      res.status(200).send({
        message: "Account Creation Process Completed 😀✨",
        user,
        token: `Bearer ${token}`,
        login: true,
        student: student?._id,
      });
    } else {
      res.status(200).send({
        message: "Bug in the direct joining process 😡",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveDirectJoinStaffQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { sample_pic, fileArray } = req.body;
    var valid_phone = `${id}`;
    var valid_email = valid_phone?.includes("@");
    if (
      !id &&
      !req.body.staffCode &&
      !req.body.staffFirstName &&
      !req.body.staffLastName &&
      !req.body.staffGender &&
      !req.body.staffDOB
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const valid = await filter_unique_username(
      req.body.staffFirstName,
      req.body.staffDOB
    );
    if (!valid?.exist) {
      const genUserPass = bcrypt.genSaltSync(12);
      const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
      var user = new User({
        userLegalName: `${req.body.staffFirstName} ${
          req.body.staffMiddleName ? req.body.staffMiddleName : ""
        } ${req.body.staffLastName ? req.body.staffLastName : ""}`,
        userGender: req.body.staffGender,
        userDateOfBirth: req.body.staffDOB,
        username: valid?.username,
        userStatus: "Approved",
        userPhoneNumber: valid_email ? 0 : id,
        userEmail: valid_email ? id : null,
        userPassword: hashUserPass,
        photoId: "0",
        coverId: "2",
        remindLater: rDate,
        next_date: c_date,
      });
      admins.users.push(user);
      admins.userCount += 1;
      await Promise.all([admins.save(), user.save()]);
      var uInstitute = await InstituteAdmin.findOne({
        isUniversal: "Universal",
      })
        .select("id userFollowersList followersCount")
        .populate({ path: "posts" });
      if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
        const post = await Post.find({
          _id: { $in: uInstitute.posts },
          postStatus: "Anyone",
        });
        post.forEach(async (ele) => {
          user.userPosts.push(ele);
        });
        await user.save();
      }
      //
      var b_date = user.userDateOfBirth.slice(8, 10);
      var b_month = user.userDateOfBirth.slice(5, 7);
      var b_year = user.userDateOfBirth.slice(0, 4);
      if (b_date > p_date) {
        p_date = p_date + month[b_month - 1];
        p_month = p_month - 1;
      }
      if (b_month > p_month) {
        p_year = p_year - 1;
        p_month = p_month + 12;
      }
      var get_cal_year = p_year - b_year;
      if (get_cal_year > 13) {
        user.ageRestrict = "No";
      } else {
        user.ageRestrict = "Yes";
      }
      await user.save();
      //
      if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
      } else {
        uInstitute.userFollowersList.push(user._id);
        uInstitute.followersCount += 1;
        user.userInstituteFollowing.push(uInstitute._id);
        user.followingUICount += 1;
        await Promise.all([uInstitute.save(), user.save()]);
        const posts = await Post.find({ author: `${uInstitute._id}` });
        posts.forEach(async (ele) => {
          ele.authorFollowersCount = uInstitute.followersCount;
          await ele.save();
        });
      }
      const institute = await InstituteAdmin.findOne({
        staffJoinCode: req.body.staffCode,
      });
      const staff = new Staff({ ...req.body });
      for (var file of fileArray) {
        if (file.name === "file") {
          staff.photoId = "0";
          staff.staffProfilePhoto = file.key;
          user.profilePhoto = file.key;
        } else if (file.name === "addharFrontCard")
          staff.staffAadharFrontCard = file.key;
        else if (file.name === "addharBackCard")
          staff.staffAadharBackCard = file.key;
        else if (file.name === "bankPassbook")
          staff.staffBankPassbook = file.key;
        else if (file.name === "casteCertificate")
          staff.staffCasteCertificatePhoto = file.key;
        else {
          staff.staffDocuments.push({
            documentName: file.name,
            documentKey: file.key,
            documentType: file.type,
          });
        }
      }
      if (sample_pic) {
        user.profilePhoto = sample_pic;
        staff.photoId = "0";
        staff.staffProfilePhoto = sample_pic;
      }
      const notify = new Notification({});
      const aStatus = new Status({});
      institute.staff.push(staff._id);
      user.staff.push(staff._id);
      user.is_mentor = true;
      institute.joinedPost.push(user._id);
      if (institute.userFollowersList.includes(user?._id)) {
      } else {
        user.userInstituteFollowing.push(institute?._id);
        user.followingUICount += 1;
        institute.userFollowersList.push(user?._id);
        institute.followersCount += 1;
      }
      staff.institute = institute._id;
      staff.staffApplyDate = new Date().toISOString();
      staff.user = user._id;
      notify.notifyContent = `${staff.staffFirstName}${
        staff.staffMiddleName ? ` ${staff.staffMiddleName}` : ""
      } ${staff.staffLastName} has been applied for role of Staff`;
      notify.notifySender = staff._id;
      notify.notifyReceiever = institute._id;
      institute.iNotify.push(notify._id);
      notify.institute = institute._id;
      notify.notifyByStaffPhoto = staff._id;
      notify.notifyCategory = "Request Staff";
      aStatus.content = `Your application for joining as staff in ${institute.insName} is filled successfully.Tap here to see username ${user?.username}`;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      aStatus.see_secure = true;
      aStatus.staff = staff._id;
      await Promise.all([
        staff.save(),
        institute.save(),
        user.save(),
        notify.save(),
        aStatus.save(),
      ]);
      const token = generateAccessToken(
        user?.username,
        user?._id,
        user?.userPassword
      );
      res.status(200).send({
        message: "Account Creation Process Completed 😀✨",
        user,
        token: `Bearer ${token}`,
        login: true,
        staff,
      });
    } else {
      res.status(200).send({
        message: "Bug in the direct joining process 😡",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveDirectJoinAdmissionQuery = async (req, res) => {
  try {
    const { id, aid } = req.params;
    const { sample_pic, fileArray } = req.body;
    var valid_phone = `${id}`;
    var valid_email = valid_phone?.includes("@");
    if (
      !id &&
      !aid &&
      !req.body.studentFirstName &&
      !req.body.studentLastName &&
      !req.body.studentGender &&
      !req.body.studentDOB
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const valid = await filter_unique_username(
      req.body.studentFirstName,
      req.body.studentDOB
    );
    if (!valid?.exist) {
      const genUserPass = bcrypt.genSaltSync(12);
      const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
      var user = new User({
        userLegalName: `${req.body.studentFirstName} ${
          req.body.studentMiddleName ? req.body.studentMiddleName : ""
        } ${req.body.studentLastName ? req.body.studentLastName : ""}`,
        userGender: req.body.studentGender,
        userDateOfBirth: req.body.studentDOB,
        username: valid?.username,
        userStatus: "Approved",
        userPhoneNumber: valid_email ? 0 : id,
        userEmail: valid_email ? id : null,
        userPassword: hashUserPass,
        photoId: "0",
        coverId: "2",
        remindLater: rDate,
        next_date: c_date,
      });
      admins.users.push(user);
      admins.userCount += 1;
      await Promise.all([admins.save(), user.save()]);
      var uInstitute = await InstituteAdmin.findOne({
        isUniversal: "Universal",
      })
        .select("id userFollowersList followersCount")
        .populate({ path: "posts" });
      if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
        const post = await Post.find({
          _id: { $in: uInstitute.posts },
          postStatus: "Anyone",
        });
        post.forEach(async (ele) => {
          user.userPosts.push(ele);
        });
        await user.save();
      }
      //
      var b_date = user.userDateOfBirth.slice(8, 10);
      var b_month = user.userDateOfBirth.slice(5, 7);
      var b_year = user.userDateOfBirth.slice(0, 4);
      if (b_date > p_date) {
        p_date = p_date + month[b_month - 1];
        p_month = p_month - 1;
      }
      if (b_month > p_month) {
        p_year = p_year - 1;
        p_month = p_month + 12;
      }
      var get_cal_year = p_year - b_year;
      if (get_cal_year > 13) {
        user.ageRestrict = "No";
      } else {
        user.ageRestrict = "Yes";
      }
      await user.save();
      //
      if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
      } else {
        uInstitute.userFollowersList.push(user._id);
        uInstitute.followersCount += 1;
        user.userInstituteFollowing.push(uInstitute._id);
        user.followingUICount += 1;
        await Promise.all([uInstitute.save(), user.save()]);
        const posts = await Post.find({ author: `${uInstitute._id}` });
        posts.forEach(async (ele) => {
          ele.authorFollowersCount = uInstitute.followersCount;
          await ele.save();
        });
      }
      const student = new Student({ ...req.body });
      student.valid_full_name = `${student?.studentFirstName} ${
        student?.studentMiddleName ?? ""
      } ${student?.studentLastName}`;
      const apply = await NewApplication.findById({ _id: aid });
      const admission = await Admission.findById({
        _id: `${apply.admissionAdmin}`,
      }).select("institute");
      const institute = await InstituteAdmin.findById({
        _id: `${admission.institute}`,
      });
      var filtered_account = await BankAccount.findOne({
        departments: { $in: apply?.applicationDepartment },
      });
      const status = new Status({});
      const studentOptionalSubject = req.body?.optionalSubject
        ? req.body?.optionalSubject
        : [];
      for (var file of fileArray) {
        if (file.name === "file") {
          student.photoId = "0";
          student.studentProfilePhoto = file.key;
          user.profilePhoto = file.key;
        } else if (file.name === "addharFrontCard")
          student.studentAadharFrontCard = file.key;
        else if (file.name === "addharBackCard")
          student.studentAadharBackCard = file.key;
        else if (file.name === "bankPassbook")
          student.studentBankPassbook = file.key;
        else if (file.name === "casteCertificate")
          student.studentCasteCertificatePhoto = file.key;
        else {
          student.studentDocuments.push({
            documentName: file.name,
            documentKey: file.key,
            documentType: file.type,
          });
        }
      }
      if (studentOptionalSubject?.length > 0) {
        student.studentOptionalSubject.push(...studentOptionalSubject);
      }
      if (sample_pic) {
        user.profilePhoto = sample_pic;
        student.photoId = "0";
        student.studentProfilePhoto = sample_pic;
      }
      status.content = `Your application for ${apply?.applicationName} have been filled successfully.

Below is the admission process:
1. You will get notified here after your selection or rejection from the institute. ( In case there is no notification within 3 working days, visit or contact the admission department)

2.After selection, confirm from your side and start the admission process.

3.After confirmation from your side, visit the institute with the required documents and applicable fees. (You will get Required documents and application fees information on your selection from the institute side. (Till then check our standard required documents and fee structures)

4.Payment modes available for fee payment: 
Online: UPI, Debit Card, Credit Card, Net banking & other payment apps (Phonepe, Google pay, Paytm)

5.After submission and verification of documents, you are required to pay application admission fees.

6. Pay application admission fees and your admission will be confirmed and complete.

7. For cancellation and refund, contact the admission department.

Note: Stay tuned for further updates.`;
      status.applicationId = apply._id;
      status.document_visible = true;
      status.student = student._id;
      status.finance = institute?.financeDepart?.[0];
      user.student.push(student._id);
      status.bank_account = filtered_account?._id;
      user.applyApplication.push(apply._id);
      student.user = user._id;
      user.applicationStatus.push(status._id);
      status.instituteId = institute._id;
      apply.receievedApplication.push({
        student: student._id,
        fee_remain: apply.admissionFee,
      });
      apply.receievedCount += 1;
      if (institute.userFollowersList.includes(user?._id)) {
      } else {
        user.userInstituteFollowing.push(institute._id);
        user.followingUICount += 1;
        institute.userFollowersList.push(user?._id);
        institute.followersCount += 1;
      }
      await Promise.all([
        student.save(),
        user.save(),
        status.save(),
        apply.save(),
        institute.save(),
      ]);
      invokeMemberTabNotification(
        "Admission Status",
        status.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      const token = generateAccessToken(
        user?.username,
        user?._id,
        user?.userPassword
      );
      res.status(200).send({
        message:
          "Account Creation Process Completed & message: Taste a bite of sweets till your application is selected, 😀✨",
        user,
        token: `Bearer ${token}`,
        login: true,
        student: student?._id,
      });
    } else {
      res.status(200).send({
        message: "Bug in the direct joining process 😡",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveDirectJoinHostelQuery = async (req, res) => {
  try {
    const { id, aid } = req.params;
    const { sample_pic, fileArray } = req.body;
    var valid_phone = `${id}`;
    var valid_email = valid_phone?.includes("@");
    if (
      !id &&
      !aid &&
      !req.body.studentFirstName &&
      !req.body.studentLastName &&
      !req.body.studentGender &&
      !req.body.studentDOB
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const valid = await filter_unique_username(
      req.body.studentFirstName,
      req.body.studentDOB
    );
    if (!valid?.exist) {
      const genUserPass = bcrypt.genSaltSync(12);
      const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
      var user = new User({
        userLegalName: `${req.body.studentFirstName} ${
          req.body.studentMiddleName ? req.body.studentMiddleName : ""
        } ${req.body.studentLastName ? req.body.studentLastName : ""}`,
        userGender: req.body.studentGender,
        userDateOfBirth: req.body.studentDOB,
        username: valid?.username,
        userStatus: "Approved",
        userPhoneNumber: valid_email ? 0 : id,
        userEmail: valid_email ? id : null,
        userPassword: hashUserPass,
        photoId: "0",
        coverId: "2",
        remindLater: rDate,
        next_date: c_date,
      });
      admins.users.push(user);
      admins.userCount += 1;
      await Promise.all([admins.save(), user.save()]);
      var uInstitute = await InstituteAdmin.findOne({
        isUniversal: "Universal",
      })
        .select("id userFollowersList followersCount")
        .populate({ path: "posts" });
      if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
        const post = await Post.find({
          _id: { $in: uInstitute.posts },
          postStatus: "Anyone",
        });
        post.forEach(async (ele) => {
          user.userPosts.push(ele);
        });
        await user.save();
      }
      //
      var b_date = user.userDateOfBirth.slice(8, 10);
      var b_month = user.userDateOfBirth.slice(5, 7);
      var b_year = user.userDateOfBirth.slice(0, 4);
      if (b_date > p_date) {
        p_date = p_date + month[b_month - 1];
        p_month = p_month - 1;
      }
      if (b_month > p_month) {
        p_year = p_year - 1;
        p_month = p_month + 12;
      }
      var get_cal_year = p_year - b_year;
      if (get_cal_year > 13) {
        user.ageRestrict = "No";
      } else {
        user.ageRestrict = "Yes";
      }
      await user.save();
      //
      if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
      } else {
        uInstitute.userFollowersList.push(user._id);
        uInstitute.followersCount += 1;
        user.userInstituteFollowing.push(uInstitute._id);
        user.followingUICount += 1;
        await Promise.all([uInstitute.save(), user.save()]);
        const posts = await Post.find({ author: `${uInstitute._id}` });
        posts.forEach(async (ele) => {
          ele.authorFollowersCount = uInstitute.followersCount;
          await ele.save();
        });
      }
      const student = new Student({ ...req.body });
      student.valid_full_name = `${student?.studentFirstName} ${
        student?.studentMiddleName ?? ""
      } ${student?.studentLastName}`;
      const apply = await NewApplication.findById({ _id: aid });
      const one_hostel = await Hostel.findById({
        _id: `${apply.hostelAdmin}`,
      }).select("institute");
      const institute = await InstituteAdmin.findById({
        _id: `${one_hostel?.institute}`,
      });
      var filtered_account = await BankAccount.findOne({
        departments: { $in: apply?.applicationDepartment },
      });
      const status = new Status({});
      const studentOptionalSubject = req.body?.optionalSubject
        ? req.body?.optionalSubject
        : [];
      for (var file of fileArray) {
        if (file.name === "file") {
          student.photoId = "0";
          student.studentProfilePhoto = file.key;
          user.profilePhoto = file.key;
        } else if (file.name === "addharFrontCard")
          student.studentAadharFrontCard = file.key;
        else if (file.name === "addharBackCard")
          student.studentAadharBackCard = file.key;
        else if (file.name === "bankPassbook")
          student.studentBankPassbook = file.key;
        else if (file.name === "casteCertificate")
          student.studentCasteCertificatePhoto = file.key;
        else {
          student.studentDocuments.push({
            documentName: file.name,
            documentKey: file.key,
            documentType: file.type,
          });
        }
      }
      if (studentOptionalSubject?.length > 0) {
        student.studentOptionalSubject.push(...studentOptionalSubject);
      }
      if (sample_pic) {
        user.profilePhoto = sample_pic;
        student.photoId = "0";
        student.studentProfilePhoto = sample_pic;
      }
      status.content = `Your application for ${apply?.applicationName} have been filled successfully.

Below is the admission process:
1. You will get notified here after your selection or rejection from the institute. ( In case there is no notification within 3 working days, visit or contact the admission department)

2.After selection, confirm from your side and start the admission process.

3.After confirmation from your side, visit the institute with the required documents and applicable fees. (You will get Required documents and application fees information on your selection from the institute side. (Till then check our standard required documents and fee structures)

4.Payment modes available for fee payment: 
Online: UPI, Debit Card, Credit Card, Net banking & other payment apps (Phonepe, Google pay, Paytm)

5.After submission and verification of documents, you are required to pay application admission fees.

6. Pay application admission fees and your admission will be confirmed and complete.

7. For cancellation and refund, contact the admission department.

Note: Stay tuned for further updates.`;
      status.applicationId = apply._id;
      status.document_visible = true;
      status.student = student._id;
      status.finance = institute?.financeDepart?.[0];
      user.student.push(student._id);
      status.bank_account = filtered_account?._id;
      user.applyApplication.push(apply._id);
      status.flow_status = "Hostel Application";
      student.user = user._id;
      user.applicationStatus.push(status._id);
      status.instituteId = institute._id;
      apply.receievedApplication.push({
        student: student._id,
        fee_remain: 0,
      });
      apply.receievedCount += 1;
      if (institute.userFollowersList.includes(user?._id)) {
      } else {
        user.userInstituteFollowing.push(institute._id);
        user.followingUICount += 1;
        institute.userFollowersList.push(user?._id);
        institute.followersCount += 1;
      }
      await Promise.all([
        student.save(),
        user.save(),
        status.save(),
        apply.save(),
        institute.save(),
      ]);
      invokeMemberTabNotification(
        "Hostel Admission Status",
        status.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      const token = generateAccessToken(
        user?.username,
        user?._id,
        user?.userPassword
      );
      res.status(200).send({
        message:
          "Account Creation Process Completed & message: Taste a bite of sweets till your application is selected, 😀✨",
        user,
        token: `Bearer ${token}`,
        login: true,
        student: student?._id,
      });
    } else {
      res.status(200).send({
        message: "Bug in the direct joining process 😡",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInstituteDirectJoinQuery = async (req, res) => {
  try {
    const { id, cid } = req.params;
    const { existingUser } = req.query;
    var valid_phone = `${id}`;
    var valid_email = valid_phone?.includes("@");
    var existing = await handle_undefined(existingUser);
    const { sample_pic, fileArray, batch_set, is_remain, fee_struct } =
      req.body;
    if (
      !id &&
      !cid &&
      !req.body.studentFirstName &&
      !req.body.studentLastName &&
      !req.body.studentGender &&
      !req.body.studentDOB
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    if (!existing) {
      var valid = await filter_unique_username(
        req.body.studentFirstName,
        req.body.studentDOB
      );
    }
    if (!existing) {
      if (!valid?.exist) {
        const genUserPass = bcrypt.genSaltSync(12);
        const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
        var user = new User({
          userLegalName: `${req.body.studentFirstName} ${
            req.body.studentMiddleName ? req.body.studentMiddleName : ""
          } ${req.body.studentLastName ? req.body.studentLastName : ""}`,
          userGender: req.body.studentGender,
          userDateOfBirth: req.body.studentDOB,
          username: valid?.username,
          userStatus: "Approved",
          userPhoneNumber: valid_email ? 0 : id,
          userEmail: valid_email ? id : null,
          userPassword: hashUserPass,
          photoId: "0",
          coverId: "2",
          remindLater: rDate,
          next_date: c_date,
        });
        admins.users.push(user);
        admins.userCount += 1;
        await Promise.all([admins.save(), user.save()]);
        var uInstitute = await InstituteAdmin.findOne({
          isUniversal: "Universal",
        })
          .select("id userFollowersList followersCount")
          .populate({ path: "posts" });
        if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
          const post = await Post.find({
            _id: { $in: uInstitute.posts },
            postStatus: "Anyone",
          });
          post.forEach(async (ele) => {
            user.userPosts.push(ele);
          });
          await user.save();
        }
        //
        var b_date = user.userDateOfBirth?.slice(8, 10);
        var b_month = user.userDateOfBirth?.slice(5, 7);
        var b_year = user.userDateOfBirth?.slice(0, 4);
        if (b_date > p_date) {
          p_date = p_date + month[b_month - 1];
          p_month = p_month - 1;
        }
        if (b_month > p_month) {
          p_year = p_year - 1;
          p_month = p_month + 12;
        }
        var get_cal_year = p_year - b_year;
        if (get_cal_year > 13) {
          user.ageRestrict = "No";
        } else {
          user.ageRestrict = "Yes";
        }
        await user.save();
        //
        if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
        } else {
          uInstitute.userFollowersList.push(user._id);
          uInstitute.followersCount += 1;
          user.userInstituteFollowing.push(uInstitute._id);
          user.followingUICount += 1;
          await Promise.all([uInstitute.save(), user.save()]);
          const posts = await Post.find({ author: `${uInstitute._id}` });
          posts.forEach(async (ele) => {
            ele.authorFollowersCount = uInstitute.followersCount;
            await ele.save();
          });
        }
      }
    } else {
      var user = await User.findById({ _id: `${existing}` });
    }
    const classes = await Class.findById({ _id: cid });
    const batch = await Batch.findById({ _id: `${classes?.batch}` });
    const depart = await Department.findById({ _id: `${batch?.department}` });
    const institute = await InstituteAdmin.findById({
      _id: `${depart?.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    const student = new Student({ ...req.body });
    student.valid_full_name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    student.studentCode = classes.classCode;
    const studentOptionalSubject = req.body?.optionalSubject
      ? req.body?.optionalSubject
      : [];
    for (var file of fileArray) {
      if (file.name === "file") {
        student.photoId = "0";
        student.studentProfilePhoto = file.key;
        // user.profilePhoto = file.key;
      } else if (file.name === "addharFrontCard")
        student.studentAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        student.studentAadharBackCard = file.key;
      else if (file.name === "bankPassbook")
        student.studentBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        student.studentCasteCertificatePhoto = file.key;
      else {
        student.studentDocuments.push({
          documentName: file.name,
          documentKey: file.key,
          documentType: file.type,
        });
      }
    }
    if (studentOptionalSubject?.length > 0) {
      student.studentOptionalSubject.push(...studentOptionalSubject);
    }
    if (sample_pic) {
      user.profilePhoto = sample_pic;
      student.photoId = "0";
      student.studentProfilePhoto = sample_pic;
    }
    for (let subjChoose of student?.studentOptionalSubject) {
      const subject = await Subject.findById(subjChoose);
      subject.optionalStudent.push(student?._id);
      await subject.save();
    }
    const notify = new StudentNotification({});
    const aStatus = new Status({});
    user.student.push(student._id);
    user.is_mentor = true;
    institute.joinedPost.push(user._id);
    if (institute.userFollowersList.includes(user?._id)) {
    } else {
      user.userInstituteFollowing.push(institute?._id);
      user.followingUICount += 1;
      institute.userFollowersList.push(user?._id);
      institute.followersCount += 1;
    }
    student.institute = institute._id;
    student.user = user._id;
    student.studentStatus = "Approved";
    institute.ApproveStudent.push(student._id);
    admins.studentArray.push(student._id);
    admins.studentCount += 1;
    institute.studentCount += 1;
    classes.strength += 1;
    classes.ApproveStudent.push(student._id);
    classes.studentCount += 1;
    student.studentGRNO = `${
      institute?.gr_initials ? institute?.gr_initials : ""
    }${depart?.gr_initials ?? ""}${institute.ApproveStudent.length}`;
    student.studentROLLNO = classes.ApproveStudent.length;
    student.studentClass = classes._id;
    student.studentAdmissionDate = new Date().toISOString();
    depart.ApproveStudent.push(student._id);
    depart.studentCount += 1;
    student.department = depart._id;
    batch.ApproveStudent.push(student._id);
    student.batches = batch._id;
    student.batchCount += 1;
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} joined as a Student of Class ${
      classes.className
    } of ${batch.batchName}`;
    notify.notifySender = cid;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Approve Student";
    institute.iNotify.push(notify._id);
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    aStatus.content = `Welcome to ${institute.insName}. Your application for joining as student  has been accepted by ${institute.insName}. Enjoy your learning in ${classes.className} - ${classes.classTitle}.`;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    aStatus.student = student._id;
    student.fee_structure =
      is_remain === "No" ? fee_struct : batch_set[0]?.fee_struct;
    await student.save();
    await invokeFirebaseNotification(
      "Student Approval",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    if (batch_set?.length > 0) {
      await fee_reordering_direct_student(
        student,
        institute,
        batch_set,
        user,
        finance
      );
    }
    await Promise.all([
      admins.save(),
      classes.save(),
      depart.save(),
      batch.save(),
      student.save(),
      institute.save(),
      user.save(),
      notify.save(),
      aStatus.save(),
    ]);
    if (student.studentGender === "Male") {
      classes.boyCount += 1;
      batch.student_category.boyCount += 1;
    } else if (student.studentGender === "Female") {
      classes.girlCount += 1;
      batch.student_category.girlCount += 1;
    } else if (student.studentGender === "Other") {
      classes.otherCount += 1;
      batch.student_category.otherCount += 1;
    } else {
    }
    if (student.studentCastCategory === "General") {
      batch.student_category.generalCount += 1;
    } else if (student.studentCastCategory === "OBC") {
      batch.student_category.obcCount += 1;
    } else if (student.studentCastCategory === "SC") {
      batch.student_category.scCount += 1;
    } else if (student.studentCastCategory === "ST") {
      batch.student_category.stCount += 1;
    } else if (student.studentCastCategory === "NT-A") {
      batch.student_category.ntaCount += 1;
    } else if (student.studentCastCategory === "NT-B") {
      batch.student_category.ntbCount += 1;
    } else if (student.studentCastCategory === "NT-C") {
      batch.student_category.ntcCount += 1;
    } else if (student.studentCastCategory === "NT-D") {
      batch.student_category.ntdCount += 1;
    } else if (student.studentCastCategory === "VJ") {
      batch.student_category.vjCount += 1;
    } else {
    }
    await Promise.all([classes.save(), batch.save()]);
    if (institute.sms_lang === "en") {
      await directESMSQuery(
        user?.userPhoneNumber,
        `${student.studentFirstName} ${
          student.studentMiddleName ? student.studentMiddleName : ""
        } ${student.studentLastName}`,
        institute?.insName,
        classes?.classTitle
      );
    }
    // else if (institute.sms_lang === "hi") {
    //   await directHSMSQuery(
    //     user?.userPhoneNumber,
    //     `${student.studentFirstName} ${
    //       student.studentMiddleName ? student.studentMiddleName : ""
    //     } ${student.studentLastName}`,
    //     institute?.insName,
    //     classes?.classTitle
    //   );
    // }
    // else if (institute.sms_lang === "mr" || institute.sms_lang === "mt") {
    //   await directMSMSQuery(
    //     user?.userPhoneNumber,
    //     `${student.studentFirstName} ${
    //       student.studentMiddleName ? student.studentMiddleName : ""
    //     } ${student.studentLastName}`,
    //     institute?.insName,
    //     classes?.classTitle
    //   );
    // } else {
    // }
    res.status(200).send({
      message: `Direct Institute Account Creation Process Completed ${student.studentFirstName} ${student.studentLastName} 😀✨`,
      status: true,
      student: student?._id,
    });
    const studentName = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName}`;
    whats_app_sms_payload(
      user?.userPhoneNumber,
      studentName,
      institute?.insName,
      classes?.className,
      "ADSIS",
      institute?.insType,
      0,
      0,
      institute?.sms_lang
    );
    if (user?.userEmail) {
      await email_sms_payload_query(
        user?.userEmail,
        studentName,
        institute,
        "ADSIS",
        institute?.insType,
        0,
        0,
        institute?.sms_lang
      );
    }
  } catch (e) {
    console.log(e);
  }
};

// var ns = {insName: "SKD Academy Inter College", insEmail: "skd@gmail.com"}
// console.log(email_sms_payload_query(
//   "yelpcamp44@gmail.com",
//   "Abhishek Singh",
//   ns,
//   "ADSIS",
//   "School",
//   0,
//   0,
//   "en"
// ))

exports.retrieveInstituteDirectJoinStaffQuery = async (req, res) => {
  try {
    const { id, insId } = req.params;
    const { existingUser } = req.query;
    var valid_phone = `${id}`;
    var valid_email = valid_phone?.includes("@");
    var existing = await handle_undefined(existingUser);
    const { sample_pic, fileArray } = req.body;
    if (
      !id &&
      !insId &&
      !req.body.staffFirstName &&
      !req.body.staffLastName &&
      !req.body.staffGender &&
      !req.body.staffDOB
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    if (!existing) {
      var valid = await filter_unique_username(
        req.body.staffFirstName,
        req.body.staffDOB
      );
    }
    if (!existing) {
      if (!valid?.exist) {
        const genUserPass = bcrypt.genSaltSync(12);
        const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
        var user = new User({
          userLegalName: `${req.body.staffFirstName} ${
            req.body.staffMiddleName ? req.body.staffMiddleName : ""
          } ${req.body.staffLastName ? req.body.staffLastName : ""}`,
          userGender: req.body.staffGender,
          userDateOfBirth: req.body.staffDOB,
          username: valid?.username,
          userStatus: "Approved",
          userPhoneNumber: valid_email ? 0 : id,
          userEmail: valid_email ? id : null,
          userPassword: hashUserPass,
          photoId: "0",
          coverId: "2",
          remindLater: rDate,
          next_date: c_date,
        });
        admins.users.push(user);
        admins.userCount += 1;
        await Promise.all([admins.save(), user.save()]);
        var uInstitute = await InstituteAdmin.findOne({
          isUniversal: "Universal",
        })
          .select("id userFollowersList followersCount")
          .populate({ path: "posts" });
        if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
          const post = await Post.find({
            _id: { $in: uInstitute.posts },
            postStatus: "Anyone",
          });
          post.forEach(async (ele) => {
            user.userPosts.push(ele);
          });
          await user.save();
        }
        //
        var b_date = user.userDateOfBirth?.slice(8, 10);
        var b_month = user.userDateOfBirth?.slice(5, 7);
        var b_year = user.userDateOfBirth?.slice(0, 4);
        if (b_date > p_date) {
          p_date = p_date + month[b_month - 1];
          p_month = p_month - 1;
        }
        if (b_month > p_month) {
          p_year = p_year - 1;
          p_month = p_month + 12;
        }
        var get_cal_year = p_year - b_year;
        if (get_cal_year > 13) {
          user.ageRestrict = "No";
        } else {
          user.ageRestrict = "Yes";
        }
        await user.save();
        //
        if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
        } else {
          uInstitute.userFollowersList.push(user._id);
          uInstitute.followersCount += 1;
          user.userInstituteFollowing.push(uInstitute._id);
          user.followingUICount += 1;
          await Promise.all([uInstitute.save(), user.save()]);
          const posts = await Post.find({ author: `${uInstitute._id}` });
          posts.forEach(async (ele) => {
            ele.authorFollowersCount = uInstitute.followersCount;
            await ele.save();
          });
        }
      }
    } else {
      var user = await User.findById({ _id: `${existing}` });
    }
    const institute = await InstituteAdmin.findById({
      _id: insId,
    });
    const staff = new Staff({ ...req.body });
    for (var file of fileArray) {
      if (file.name === "file") {
        staff.photoId = "0";
        staff.staffProfilePhoto = file.key;
        user.profilePhoto = file.key;
      } else if (file.name === "addharFrontCard")
        staff.staffAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        staff.staffAadharBackCard = file.key;
      else if (file.name === "bankPassbook") staff.staffBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        staff.staffCasteCertificatePhoto = file.key;
      else {
        staff.staffDocuments.push({
          documentName: file.name,
          documentKey: file.key,
          documentType: file.type,
        });
      }
    }
    if (sample_pic) {
      user.profilePhoto = sample_pic;
      staff.photoId = "0";
      staff.staffProfilePhoto = sample_pic;
    }

    const notify = new Notification({});
    const aStatus = new Status({});
    user.staff.push(staff._id);
    user.is_mentor = true;
    institute.joinedPost.push(user._id);
    if (institute.userFollowersList.includes(user?._id)) {
    } else {
      user.userInstituteFollowing.push(institute?._id);
      user.followingUICount += 1;
      institute.userFollowersList.push(user?._id);
      institute.followersCount += 1;
    }
    staff.institute = institute._id;
    staff.staffApplyDate = new Date().toISOString();
    staff.user = user._id;
    staff.staffStatus = "Approved";
    institute.ApproveStaff.push(staff._id);
    institute.staffCount += 1;
    admins.staffArray.push(staff._id);
    admins.staffCount += 1;
    institute.joinedUserList.push(user._id);
    staff.staffROLLNO = institute.ApproveStaff.length;
    staff.staffJoinDate = new Date().toISOString();
    notify.notifyContent = `Congrats ${staff.staffFirstName} ${
      staff.staffMiddleName ? `${staff.staffMiddleName}` : ""
    } ${staff.staffLastName} for joined as a staff at ${institute.insName}`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Approve Staff";
    institute.iNotify.push(notify._id);
    notify.institute = institute._id;
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByStaffPhoto = staff._id;
    aStatus.content = `Welcome to ${institute.insName}.Your application for joining as staff  has been accepted by ${institute.insName}.`;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    aStatus.staff = staff._id;
    await invokeFirebaseNotification(
      "Staff Approval",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      staff.save(),
      institute.save(),
      admins.save(),
      user.save(),
      notify.save(),
      aStatus.save(),
    ]);
    if (institute.isUniversal === "Not Assigned") {
      const post = await Post.find({ author: institute._id });
      post.forEach(async (pt) => {
        if (user.userPosts.length >= 1 && user.userPosts.includes(String(pt))) {
        } else {
          user.userPosts.push(pt);
        }
      });
      await user.save();
    } else {
    }
    if (staff.staffGender === "Male") {
      institute.staff_category.boyCount += 1;
    } else if (staff.staffGender === "Female") {
      institute.staff_category.girlCount += 1;
    } else if (staff.staffGender === "Other") {
      institute.staff_category.otherCount += 1;
    } else {
    }
    if (staff.staffCastCategory === "General") {
      institute.staff_category.generalCount += 1;
    } else if (staff.staffCastCategory === "OBC") {
      institute.staff_category.obcCount += 1;
    } else if (staff.staffCastCategory === "SC") {
      institute.staff_category.scCount += 1;
    } else if (staff.staffCastCategory === "ST") {
      institute.staff_category.stCount += 1;
    } else if (staff.staffCastCategory === "NT-A") {
      institute.staff_category.ntaCount += 1;
    } else if (staff.staffCastCategory === "NT-B") {
      institute.staff_category.ntbCount += 1;
    } else if (staff.staffCastCategory === "NT-C") {
      institute.staff_category.ntcCount += 1;
    } else if (staff.staffCastCategory === "NT-D") {
      institute.staff_category.ntdCount += 1;
    } else if (staff.staffCastCategory === "VJ") {
      institute.staff_category.vjCount += 1;
    } else {
    }
    await Promise.all([institute.save()]);
    res.status(200).send({
      message: "Direct Institute Account Creation Process Completed 😀✨",
      status: true,
    });
    var staffName = `${staff.staffFirstName} ${
      staff.staffMiddleName ? `${staff.staffMiddleName}` : ""
    } ${staff.staffLastName}`;
    await directESMSStaffQuery(
      user?.userPhoneNumber,
      staffName,
      institute?.insName
    );
    whats_app_sms_payload(
      user?.userPhoneNumber,
      staffName,
      institute?.insName,
      null,
      "ADMIS",
      institute?.insType,
      0,
      0,
      institute?.sms_lang
    );
    if (user?.userEmail) {
      await email_sms_payload_query(
        user?.userEmail,
        staffName,
        institute,
        "ADMIS",
        institute?.insType,
        0,
        0,
        institute?.sms_lang
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDirectAppJoinConfirmQuery = async (req, res) => {
  try {
    const { id, aid } = req.params;
    const { existingUser } = req.query;
    var valid_phone = `${id}`;
    var valid_email = valid_phone?.includes("@");
    var existing = await handle_undefined(existingUser);
    const { sample_pic, fileArray, type, mode, amount, fee_struct } = req.body;
    if (
      !id &&
      !aid &&
      !req.body.studentFirstName &&
      !req.body.studentLastName &&
      !req.body.studentGender &&
      !req.body.studentDOB &&
      !type &&
      !mode &&
      !amount
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const apply = await NewApplication.findById({ _id: aid });
    var new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.fee_transaction_date = new Date(
      `${req.body?.transaction_date}`
    );
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    const structure = await FeeStructure.findById({ _id: fee_struct });
    if (!existing) {
      var valid = await filter_unique_username(
        req.body.studentFirstName,
        req.body.studentDOB
      );
    }
    if (!existing) {
      if (!valid?.exist) {
        const genUserPass = bcrypt.genSaltSync(12);
        const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
        var user = new User({
          userLegalName: `${req.body.studentFirstName} ${
            req.body.studentMiddleName ? req.body.studentMiddleName : ""
          } ${req.body.studentLastName ? req.body.studentLastName : ""}`,
          userGender: req.body.studentGender,
          userDateOfBirth: req.body.studentDOB,
          username: valid?.username,
          userStatus: "Approved",
          userPhoneNumber: valid_email ? 0 : id,
          userEmail: valid_email ? id : null,
          userPassword: hashUserPass,
          photoId: "0",
          coverId: "2",
          remindLater: rDate,
          next_date: c_date,
        });
        admins.users.push(user);
        admins.userCount += 1;
        await Promise.all([admins.save(), user.save()]);
        await universal_account_creation_feed(user);
        await user_date_of_birth(user);
      } else {
      }
    } else {
      var user = await User.findById({ _id: `${existing}` });
    }
    const student = new Student({ ...req.body });
    student.valid_full_name = `${student?.studentFirstName} ${
      student?.studentMiddleName ?? ""
    } ${student?.studentLastName}`;
    const studentOptionalSubject = req.body?.optionalSubject
      ? req.body?.optionalSubject
      : [];
    for (var file of fileArray) {
      if (file.name === "file") {
        student.photoId = "0";
        student.studentProfilePhoto = file.key;
        user.profilePhoto = file.key;
      } else if (file.name === "addharFrontCard")
        student.studentAadharFrontCard = file.key;
      else if (file.name === "addharBackCard")
        student.studentAadharBackCard = file.key;
      else if (file.name === "bankPassbook")
        student.studentBankPassbook = file.key;
      else if (file.name === "casteCertificate")
        student.studentCasteCertificatePhoto = file.key;
      else {
        student.studentDocuments.push({
          documentName: file.name,
          documentKey: file.key,
          documentType: file.type,
        });
      }
    }
    if (studentOptionalSubject?.length > 0) {
      student.studentOptionalSubject.push(...studentOptionalSubject);
    }
    if (sample_pic) {
      // user.profilePhoto = sample_pic;
      student.photoId = "0";
      student.studentProfilePhoto = sample_pic;
    }
    user.student.push(student._id);
    user.applyApplication.push(apply._id);
    student.user = user._id;
    student.fee_structure = fee_struct;
    await student.save();
    await insert_multiple_status(
      apply,
      user,
      institute,
      student?._id,
      finance,
      structure,
      new_receipt
    );
    apply.receievedCount += 1;
    apply.selectCount += 1;
    apply.confirmCount += 1;
    await fee_reordering(
      type,
      mode,
      parseInt(amount),
      student,
      apply,
      institute,
      finance,
      admission,
      admins,
      new_receipt,
      user
    );
    if (institute.userFollowersList.includes(user?._id)) {
    } else {
      user.userInstituteFollowing.push(institute._id);
      user.followingUICount += 1;
      institute.userFollowersList.push(user?._id);
      institute.followersCount += 1;
    }
    // await insert_multiple_status(apply, user, institute, student?._id);
    await Promise.all([
      student.save(),
      user.save(),
      apply.save(),
      institute.save(),
      admission.save(),
      finance.save(),
    ]);
    res.status(200).send({
      message:
        "Account Creation Process Completed & message: Taste a bite of sweets till your application is selected, 😀✨",
      access: true,
      student: student?._id,
    });
    await ignite_multiple_alarm(user);
    const studentName = `${student?.studentFirstName} ${
      student?.studentMiddleName ? student?.studentMiddleName : ""
    } ${student?.studentLastName}`;
    whats_app_sms_payload(
      user?.userPhoneNumber,
      studentName,
      institute?.insName,
      null,
      "ASCAS",
      institute?.insType,
      student.admissionPaidFeeCount,
      student.admissionRemainFeeCount,
      institute?.sms_lang
    );
    if (user?.userEmail) {
      await email_sms_payload_query(
        user?.userEmail,
        studentName,
        institute,
        "ASCAS",
        institute?.insType,
        student.admissionPaidFeeCount,
        student.admissionRemainFeeCount,
        institute?.sms_lang
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderSelectAccountQuery = async (req, res) => {
  try {
    const valid_key = await handle_undefined(req.query.phoneKey);
    if (!valid_key)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const all_account = await User.find({ userPhoneNumber: valid_key }).select(
      "userLegalName username profilePhoto"
    );
    const all_account_email = await User.find({ userEmail: valid_key }).select(
      "userLegalName username profilePhoto"
    );
    if (all_account?.length > 0) {
      res.status(200).send({
        message: "Lot's of choices select one 😁",
        access: true,
        all_account,
      });
    } else if (all_account_email?.length > 0) {
      res.status(200).send({
        message: "Lot's of choices select one 😁",
        access: true,
        all_account_email,
      });
    } else {
      res.status(200).send({
        message: "No choices left create one 😁",
        access: false,
        all_account: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInstituteDirectJoinQueryPayload = async (
  cid,
  student_array
) => {
  try {
    for (var query of student_array) {
      var maleAvatar = [
        "3D2.jpg",
        "3D4.jpg",
        "3D6.jpg",
        "3D19.jpg",
        "3D20.jpg",
        "3D26.jpg",
        "3D21.jpg",
        "3D12.jpg",
      ];
      var femaleAvatar = [
        "3D1.jpg",
        "3D3.jpg",
        "3D10.jpg",
        "3D11.jpg",
        "3D14.jpg",
        "3D15.jpg",
        "3D22.jpg",
        "3D31.jpg",
      ];
      const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
      const valid = await filter_unique_username(
        query.studentFirstName,
        query.studentDOB
      );
      if (!valid?.exist) {
        const genUserPass = bcrypt.genSaltSync(12);
        const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
        var user = new User({
          userLegalName: `${query.studentFirstName} ${
            query.studentMiddleName ? query.studentMiddleName : ""
          } ${query.studentLastName ? query.studentLastName : ""}`,
          userGender: query.studentGender,
          userDateOfBirth: query?.studentDOB ?? null,
          username: valid?.username,
          userStatus: "Approved",
          userPhoneNumber: query?.userPhoneNumber
            ? parseInt(query?.userPhoneNumber)
            : 0,
          userEmail: query?.userEmail,
          userPassword: hashUserPass,
          photoId: "0",
          coverId: "2",
          remindLater: rDate,
          next_date: c_date,
        });
        admins.users.push(user);
        admins.userCount += 1;
        await Promise.all([admins.save(), user.save()]);
        var uInstitute = await InstituteAdmin.findOne({
          isUniversal: "Universal",
        })
          .select("id userFollowersList followersCount")
          .populate({ path: "posts" });
        if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
          const post = await Post.find({
            _id: { $in: uInstitute.posts },
            postStatus: "Anyone",
          });
          post.forEach(async (ele) => {
            user.userPosts.push(ele);
          });
          await user.save();
        }
        //
        var valid_dob = await handle_undefined(user?.userDateOfBirth);
        if (valid_dob) {
          var b_date = user.userDateOfBirth?.slice(8, 10);
          var b_month = user.userDateOfBirth?.slice(5, 7);
          var b_year = user.userDateOfBirth?.slice(0, 4);
          if (b_date > p_date) {
            p_date = p_date + month[b_month - 1];
            p_month = p_month - 1;
          }
          if (b_month > p_month) {
            p_year = p_year - 1;
            p_month = p_month + 12;
          }
          var get_cal_year = p_year - b_year;
          if (get_cal_year > 13) {
            user.ageRestrict = "No";
          } else {
            user.ageRestrict = "Yes";
          }
        } else {
          user.ageRestrict = "No";
        }
        await user.save();
        //
        if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
        } else {
          uInstitute.userFollowersList.push(user._id);
          uInstitute.followersCount += 1;
          user.userInstituteFollowing.push(uInstitute._id);
          user.followingUICount += 1;
          await Promise.all([uInstitute.save(), user.save()]);
          const posts = await Post.find({ author: `${uInstitute._id}` });
          posts.forEach(async (ele) => {
            ele.authorFollowersCount = uInstitute.followersCount;
            await ele.save();
          });
        }

        const classes = await Class.findById({ _id: cid });
        const batch = await Batch.findById({ _id: `${classes?.batch}` });
        const depart = await Department.findById({
          _id: `${batch?.department}`,
        });
        const institute = await InstituteAdmin.findById({
          _id: `${depart?.institute}`,
        });
        var finance = await Finance.findById({
          _id: `${institute?.financeDepart[0]}`,
        });
        const student = new Student({ ...query });
        student.valid_full_name = `${student?.studentFirstName} ${
          student?.studentMiddleName ?? ""
        } ${student?.studentLastName}`;
        student.studentCode = classes.classCode;
        const studentOptionalSubject = query?.optionalSubject
          ? query?.optionalSubject
          : [];
        for (var file of query?.fileArray) {
          if (file.name === "file") {
            student.photoId = "0";
            student.studentProfilePhoto = file.key;
            user.profilePhoto = file.key;
          } else if (file.name === "addharFrontCard")
            student.studentAadharFrontCard = file.key;
          else if (file.name === "addharBackCard")
            student.studentAadharBackCard = file.key;
          else if (file.name === "bankPassbook")
            student.studentBankPassbook = file.key;
          else if (file.name === "casteCertificate")
            student.studentCasteCertificatePhoto = file.key;
          else {
            student.studentDocuments.push({
              documentName: file.name,
              documentKey: file.key,
              documentType: file.type,
            });
          }
        }
        if (studentOptionalSubject?.length > 0) {
          student.studentOptionalSubject.push(...studentOptionalSubject);
        }
        if (student?.studentGender?.toLowerCase() === "male") {
          user.profilePhoto = maleAvatar[Math.floor(Math.random() * 8)];
          student.studentProfilePhoto =
            maleAvatar[Math.floor(Math.random() * 8)];
        } else if (student?.studentGender?.toLowerCase() === "female") {
          user.profilePhoto = femaleAvatar[Math.floor(Math.random() * 8)];
          student.studentProfilePhoto =
            femaleAvatar[Math.floor(Math.random() * 8)];
        } else {
        }
        for (let subjChoose of student?.studentOptionalSubject) {
          const subject = await Subject.findById(subjChoose);
          subject.optionalStudent.push(student?._id);
          await subject.save();
        }
        const notify = new StudentNotification({});
        const aStatus = new Status({});
        user.student.push(student._id);
        user.is_mentor = true;
        institute.joinedPost.push(user._id);
        if (institute.userFollowersList.includes(user?._id)) {
        } else {
          user.userInstituteFollowing.push(institute?._id);
          user.followingUICount += 1;
          institute.userFollowersList.push(user?._id);
          institute.followersCount += 1;
        }
        student.institute = institute._id;
        student.user = user._id;
        student.studentStatus = "Approved";
        institute.ApproveStudent.push(student._id);
        admins.studentArray.push(student._id);
        admins.studentCount += 1;
        institute.studentCount += 1;
        classes.strength += 1;
        classes.ApproveStudent.push(student._id);
        classes.studentCount += 1;
        student.studentGRNO = query?.studentGRNO;
        student.studentROLLNO = classes.ApproveStudent.length;
        student.studentClass = classes._id;
        // student.studentAdmissionDate = new Date().toISOString();
        depart.ApproveStudent.push(student._id);
        depart.studentCount += 1;
        student.department = depart._id;
        batch.ApproveStudent.push(student._id);
        student.batches = batch._id;
        student.batchCount += 1;
        notify.notifyContent = `${student.studentFirstName} ${
          student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
        } ${student.studentLastName} joined as a Student of Class ${
          classes.className
        } of ${batch.batchName}`;
        notify.notifySender = cid;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Approve Student";
        institute.iNotify.push(notify._id);
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByStudentPhoto = student._id;
        aStatus.content = `Welcome to ${institute.insName}. Your application for joining as student  has been accepted by ${institute.insName}. Enjoy your learning in ${classes.className} - ${classes.classTitle}.`;
        user.applicationStatus.push(aStatus._id);
        aStatus.instituteId = institute._id;
        aStatus.student = student._id;
        student.fee_structure =
          query?.is_remain === "No"
            ? query?.fee_struct
            : query?.batch_set[0]?.fee_struct;
        await student.save();
        await invokeFirebaseNotification(
          "Student Approval",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        if (query?.batch_set?.length > 0) {
          await fee_reordering_direct_student_payload(
            student,
            institute,
            query?.batch_set,
            user,
            finance
          );
        }
        await Promise.all([
          admins.save(),
          classes.save(),
          depart.save(),
          batch.save(),
          student.save(),
          institute.save(),
          user.save(),
          notify.save(),
          aStatus.save(),
        ]);
        if (student.studentGender === "Male") {
          classes.boyCount += 1;
          batch.student_category.boyCount += 1;
        } else if (student.studentGender === "Female") {
          classes.girlCount += 1;
          batch.student_category.girlCount += 1;
        } else if (student.studentGender === "Other") {
          classes.otherCount += 1;
          batch.student_category.otherCount += 1;
        } else {
        }
        if (student.studentCastCategory === "General") {
          batch.student_category.generalCount += 1;
        } else if (student.studentCastCategory === "OBC") {
          batch.student_category.obcCount += 1;
        } else if (student.studentCastCategory === "SC") {
          batch.student_category.scCount += 1;
        } else if (student.studentCastCategory === "ST") {
          batch.student_category.stCount += 1;
        } else if (student.studentCastCategory === "NT-A") {
          batch.student_category.ntaCount += 1;
        } else if (student.studentCastCategory === "NT-B") {
          batch.student_category.ntbCount += 1;
        } else if (student.studentCastCategory === "NT-C") {
          batch.student_category.ntcCount += 1;
        } else if (student.studentCastCategory === "NT-D") {
          batch.student_category.ntdCount += 1;
        } else if (student.studentCastCategory === "VJ") {
          batch.student_category.vjCount += 1;
        } else {
        }
        await Promise.all([classes.save(), batch.save()]);
        if (process.env.AUTH_SMS_EMAIL_FLOW) {
          if (institute.sms_lang === "en") {
            if (user?.userPhoneNumber) {
              await directESMSQuery(
                user?.userPhoneNumber,
                `${student.studentFirstName} ${
                  student.studentMiddleName ? student.studentMiddleName : ""
                } ${student.studentLastName}`,
                institute?.insName,
                classes?.classTitle
              );
            }
          }
        }
        // else if (institute.sms_lang === "hi") {
        //   await directHSMSQuery(
        //     user?.userPhoneNumber,
        //     `${student.studentFirstName} ${
        //       student.studentMiddleName ? student.studentMiddleName : ""
        //     } ${student.studentLastName}`,
        //     institute?.insName,
        //     classes?.classTitle
        //   );
        // }
        // else if (institute.sms_lang === "mr" || institute.sms_lang === "mt") {
        //   await directMSMSQuery(
        //     user?.userPhoneNumber,
        //     `${student.studentFirstName} ${
        //       student.studentMiddleName ? student.studentMiddleName : ""
        //     } ${student.studentLastName}`,
        //     institute?.insName,
        //     classes?.classTitle
        //   );
        // } else {
        // }
        const studentName = `${student.studentFirstName} ${
          student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
        } ${student.studentLastName}`;
        whats_app_sms_payload(
          user?.userPhoneNumber,
          studentName,
          institute?.insName,
          classes?.className,
          "ADSIS",
          institute?.insType,
          0,
          0,
          institute?.sms_lang
        );
        if (process.env.AUTH_SMS_EMAIL_FLOW) {
          if (user?.userEmail) {
            await email_sms_payload_query(
              user?.userEmail,
              studentName,
              institute,
              "ADSIS",
              institute?.insType,
              0,
              0,
              institute?.sms_lang
            );
          }
          // return true;
        }
      } else {
        console.log("Problem in Account Creation");
        // return false
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAdmissionNewPassQuery = async (req, res) => {
  try {
    const { faid } = req.params;
    const { flow } = req.query;
    const { old_pass, new_pass } = req.body;
    if (!faid && !flow)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "Finance_Login") {
      var finance = await Finance.findById({ _id: faid });
      const compare_pass = bcrypt.compareSync(
        old_pass,
        finance.designation_password
      );
      if (compare_pass) {
        const new_user_pass = bcrypt.genSaltSync(12);
        const hash_user_pass = bcrypt.hashSync(new_pass, new_user_pass);
        finance.designation_password = hash_user_pass;
        finance.designation_status = "Locked";
        await finance.save();
        res.status(200).send({
          message: "Explore New Finance Designation Password",
          access: true,
          finance: finance?._id,
        });
      } else {
        res.status(200).send({
          message: "Password Does'nt match",
          access: false,
          finance: finance?._id,
        });
      }
    } else if (flow === "Admission_Login") {
      var admission = await Admission.findById({ _id: faid });
      const compare_pass = bcrypt.compareSync(
        old_pass,
        admission.designation_password
      );
      if (compare_pass) {
        const new_user_pass = bcrypt.genSaltSync(12);
        const hash_user_pass = bcrypt.hashSync(new_pass, new_user_pass);
        admission.designation_password = hash_user_pass;
        admission.designation_status = "Locked";
        await admission.save();
        res.status(200).send({
          message: "Explore New Admission Designation Password",
          access: true,
          admission: admission?._id,
        });
      } else {
        res.status(200).send({
          message: "Password Does'nt match",
          access: false,
          admission: admission?._id,
        });
      }
    } else {
      res.status(200).send({ message: "You lost in space", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAdmissionNewProtectionQuery = async (req, res) => {
  try {
    const { faid } = req.params;
    const { flow } = req.query;
    if (!faid && !flow)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "Finance_Login") {
      const finance = await Finance.findById({ _id: faid });
      finance.enable_protection = !finance.enable_protection;
      await finance.save();
      res.status(200).send({
        message: `Finance Password Protection ${
          finance?.enable_protection ? "Enable" : "Disbale"
        }`,
        access: true,
      });
    } else if (flow === "Admission_Login") {
      const ads_admin = await Admission.findById({ _id: faid });
      ads_admin.enable_protection = !ads_admin.enable_protection;
      await ads_admin.save();
      res.status(200).send({
        message: `Admission Password Protection ${
          ads_admin?.enable_protection ? "Enable" : "Disbale"
        }`,
        access: true,
      });
    } else {
      res.status(200).send({ message: "You lost in space", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceAdmissionDesignationLoginQuery = async (req, res) => {
  try {
    const { flow, protected_pin, flowId } = req.body;
    if (!flow && !protected_pin)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "Finance_Login") {
      var finance = await Finance.findById({ _id: flowId });
      const check_finance = bcrypt.compareSync(
        protected_pin,
        finance.designation_password
      );
      if (check_finance) {
        finance.designation_status = "Locked";
        await finance.save();
        const finance_token = await generateAccessDesignationToken(
          finance?.designation_status,
          finance?.designation_password
        );
        res.status(200).send({
          message: "Explore Your Unlocked Account",
          access: true,
          token: `Bearer ${finance_token}`,
          finance: finance?._id,
        });
      } else {
        res.status(200).send({
          message: "Designation Access Deneied",
          access: false,
          token: null,
        });
      }
    } else if (flow === "Admission_Login") {
      var admission = await Admission.findById({ _id: flowId });
      const check_admission = bcrypt.compareSync(
        protected_pin,
        admission.designation_password
      );
      if (check_admission) {
        admission.designation_status = "Locked";
        await admission.save();
        const admission_token = await generateAccessDesignationToken(
          admission?.designation_status,
          admission?.designation_password
        );
        res.status(200).send({
          message: "Explore Your Unlocked Account",
          access: true,
          token: `Bearer ${admission_token}`,
          admission: admission?._id,
        });
      } else {
        res.status(200).send({
          message: "Designation Access Deneied",
          access: false,
          token: null,
        });
      }
    } else {
      res.status(200).send({
        message: "Bi-Directional Flow Breaked",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInstituteDirectJoinStaffAutoQuery = async (
  insId,
  staff_array
) => {
  try {
    for (var ref of staff_array) {
      var maleAvatar = [
        "3D2.jpg",
        "3D4.jpg",
        "3D6.jpg",
        "3D19.jpg",
        "3D20.jpg",
        "3D26.jpg",
        "3D21.jpg",
        "3D12.jpg",
      ];
      var femaleAvatar = [
        "3D1.jpg",
        "3D3.jpg",
        "3D10.jpg",
        "3D11.jpg",
        "3D14.jpg",
        "3D15.jpg",
        "3D22.jpg",
        "3D31.jpg",
      ];
      const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
      const valid = await filter_unique_username(
        ref?.staffFirstName,
        ref?.staffDOB
      );
      if (!valid?.exist) {
        const genUserPass = bcrypt.genSaltSync(12);
        const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
        var user = new User({
          userLegalName: `${ref?.staffFirstName} ${
            ref?.staffMiddleName ? ref?.staffMiddleName : ""
          } ${ref?.staffLastName ? ref?.staffLastName : ""}`,
          userGender: ref?.staffGender,
          userDateOfBirth: ref?.staffDOB ?? "",
          username: valid?.username,
          userStatus: "Approved",
          userPhoneNumber: ref?.userPhoneNumber ?? 0,
          userEmail: ref?.userEmail ?? "",
          userPassword: hashUserPass,
          photoId: "0",
          coverId: "2",
          remindLater: rDate,
          next_date: c_date,
        });
        admins.users.push(user);
        admins.userCount += 1;
        await Promise.all([admins.save(), user.save()]);
        var uInstitute = await InstituteAdmin.findOne({
          isUniversal: "Universal",
        })
          .select("id userFollowersList followersCount")
          .populate({ path: "posts" });
        if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
          const post = await Post.find({
            _id: { $in: uInstitute.posts },
            postStatus: "Anyone",
          });
          post.forEach(async (ele) => {
            user.userPosts.push(ele);
          });
          await user.save();
        }
        //
        var b_date = user.userDateOfBirth?.slice(8, 10);
        var b_month = user.userDateOfBirth?.slice(5, 7);
        var b_year = user.userDateOfBirth?.slice(0, 4);
        if (b_date > p_date) {
          p_date = p_date + month[b_month - 1];
          p_month = p_month - 1;
        }
        if (b_month > p_month) {
          p_year = p_year - 1;
          p_month = p_month + 12;
        }
        var get_cal_year = p_year - b_year;
        if (get_cal_year > 13) {
          user.ageRestrict = "No";
        } else {
          user.ageRestrict = "Yes";
        }
        await user.save();
        //
        if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
        } else {
          uInstitute.userFollowersList.push(user._id);
          uInstitute.followersCount += 1;
          user.userInstituteFollowing.push(uInstitute._id);
          user.followingUICount += 1;
          await Promise.all([uInstitute.save(), user.save()]);
          const posts = await Post.find({ author: `${uInstitute._id}` });
          posts.forEach(async (ele) => {
            ele.authorFollowersCount = uInstitute.followersCount;
            await ele.save();
          });
        }
        const institute = await InstituteAdmin.findById({
          _id: insId,
        });
        const staff = new Staff({
          staffFirstName: ref?.staffFirstName,
          staffMiddleName: ref?.staffMiddleName,
          staffLastName: ref?.staffLastName,
          staffDOB: ref?.staffDOB,
          staffGender: ref?.staffGender,
          staffMotherName: ref?.staffMotherName,
          staffPhoneNumber: ref?.staffPhoneNumber,
          staffNationality: ref?.staffNationality,
          staffReligion: ref?.staffReligion,
          staffCast: ref?.staffCast,
          staffCastCategory: ref?.staffCastCategory,
          staffMTongue: ref?.staffMTongue,
          staffAddress: ref?.staffAddress,
          staffAadharNumber: ref?.staffAadharNumber,
          staffPanNumber: ref?.staffPanNumber,
        });
        staff.photoId = "0";
        if (staff?.staffGender?.toLowerCase() === "male") {
          staff.staffProfilePhoto = maleAvatar[Math.floor(Math.random() * 8)];
          user.profilePhoto = maleAvatar[Math.floor(Math.random() * 8)];
        } else if (staff?.staffGender?.toLowerCase() === "female") {
          staff.staffProfilePhoto = femaleAvatar[Math.floor(Math.random() * 8)];
          user.profilePhoto = femaleAvatar[Math.floor(Math.random() * 8)];
        } else {
        }
        for (var file of ref?.fileArray) {
          if (file.name === "file") {
          } else if (file.name === "addharFrontCard")
            staff.staffAadharFrontCard = file.key;
          else if (file.name === "addharBackCard")
            staff.staffAadharBackCard = file.key;
          else if (file.name === "bankPassbook")
            staff.staffBankPassbook = file.key;
          else if (file.name === "casteCertificate")
            staff.staffCasteCertificatePhoto = file.key;
          else {
            staff.staffDocuments.push({
              documentName: file.name,
              documentKey: file.key,
              documentType: file.type,
            });
          }
        }
        if (ref?.sample_pic) {
          user.profilePhoto = ref?.sample_pic;
          staff.photoId = "0";
          staff.staffProfilePhoto = ref?.sample_pic;
        }

        const notify = new Notification({});
        const aStatus = new Status({});
        user.staff.push(staff._id);
        user.is_mentor = true;
        institute.joinedPost.push(user._id);
        if (institute.userFollowersList.includes(user?._id)) {
        } else {
          user.userInstituteFollowing.push(institute?._id);
          user.followingUICount += 1;
          institute.userFollowersList.push(user?._id);
          institute.followersCount += 1;
        }
        staff.institute = institute._id;
        staff.staffApplyDate = new Date().toISOString();
        staff.user = user._id;
        staff.staffStatus = "Approved";
        institute.ApproveStaff.push(staff._id);
        institute.staffCount += 1;
        admins.staffArray.push(staff._id);
        admins.staffCount += 1;
        institute.joinedUserList.push(user._id);
        staff.staffROLLNO = ref?.code
          ? ref?.code
          : institute.ApproveStaff.length;
        staff.staffJoinDate = new Date().toISOString();
        notify.notifyContent = `Congrats ${staff.staffFirstName} ${
          staff.staffMiddleName ? `${staff.staffMiddleName}` : ""
        } ${staff.staffLastName} for joined as a staff at ${institute.insName}`;
        notify.notifySender = institute._id;
        notify.notifyReceiever = user._id;
        notify.notifyCategory = "Approve Staff";
        institute.iNotify.push(notify._id);
        notify.institute = institute._id;
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByStaffPhoto = staff._id;
        aStatus.content = `Welcome to ${institute.insName}.Your application for joining as staff  has been accepted by ${institute.insName}.`;
        user.applicationStatus.push(aStatus._id);
        aStatus.instituteId = institute._id;
        aStatus.staff = staff?._id;
        await invokeFirebaseNotification(
          "Staff Approval",
          notify,
          institute.insName,
          user._id,
          user.deviceToken
        );
        await Promise.all([
          staff.save(),
          institute.save(),
          admins.save(),
          user.save(),
          notify.save(),
          aStatus.save(),
        ]);
        if (institute.isUniversal === "Not Assigned") {
          const post = await Post.find({ author: institute._id });
          post.forEach(async (pt) => {
            if (
              user.userPosts.length >= 1 &&
              user.userPosts.includes(String(pt))
            ) {
            } else {
              user.userPosts.push(pt);
            }
          });
          await user.save();
        } else {
        }
        if (staff.staffGender === "Male") {
          institute.staff_category.boyCount += 1;
        } else if (staff.staffGender === "Female") {
          institute.staff_category.girlCount += 1;
        } else if (staff.staffGender === "Other") {
          institute.staff_category.otherCount += 1;
        } else {
        }
        if (staff.staffCastCategory === "General") {
          institute.staff_category.generalCount += 1;
        } else if (staff.staffCastCategory === "OBC") {
          institute.staff_category.obcCount += 1;
        } else if (staff.staffCastCategory === "SC") {
          institute.staff_category.scCount += 1;
        } else if (staff.staffCastCategory === "ST") {
          institute.staff_category.stCount += 1;
        } else if (staff.staffCastCategory === "NT-A") {
          institute.staff_category.ntaCount += 1;
        } else if (staff.staffCastCategory === "NT-B") {
          institute.staff_category.ntbCount += 1;
        } else if (staff.staffCastCategory === "NT-C") {
          institute.staff_category.ntcCount += 1;
        } else if (staff.staffCastCategory === "NT-D") {
          institute.staff_category.ntdCount += 1;
        } else if (staff.staffCastCategory === "VJ") {
          institute.staff_category.vjCount += 1;
        } else {
        }
        await Promise.all([institute.save()]);
        const staffName = `${staff.staffFirstName} ${
          staff.staffMiddleName ? `${staff.staffMiddleName}` : ""
        } ${staff.staffLastName}`;
        whats_app_sms_payload(
          user?.userPhoneNumber,
          staffName,
          institute?.insName,
          null,
          "ADMIS",
          institute?.insType,
          0,
          0,
          institute?.sms_lang
        );
        if (user?.userEmail) {
          await email_sms_payload_query(
            user?.userEmail,
            staffName,
            institute,
            "ADMIS",
            institute?.insType,
            0,
            0,
            institute?.sms_lang
          );
        }
      } else {
        console.log("Bug in the direct joining process");
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneInstituteAllStudentQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { all_students } = req.body;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_class = await Class.findById({ _id: cid });
    var one_depart = await Department.findById({
      _id: `${one_class?.department}`,
    });
    var one_batch = await Batch.findById({ _id: `${one_class?.batch}` });
    var one_ins = await InstituteAdmin.findById({
      _id: `${one_depart?.institute}`,
    });
    var admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var admission = await Admission.findById({
      _id: `${one_ins?.admissionDepart[0]}`,
    });
    var finance = await Finance.findById({
      _id: `${one_ins?.financeDepart[0]}`,
    });
    res
      .status(200)
      .send({ message: "Deletion Operation Completed", access: true });
    for (var ref of all_students) {
      var one_student = await Student.findById({ _id: `${ref}` });
      var one_user = await User.findById({ _id: `${one_student?.user}` });
      if (one_user?.staff?.length > 0) {
      } else {
        one_depart.ApproveStudent.pull(one_student?._id);
        if (one_depart?.studentCount > 0) {
          one_depart.studentCount -= 1;
        }
        one_batch.ApproveStudent.pull(one_student?._id);
        one_class.ApproveStudent.pull(one_student?._id);
        if (one_class?.studentCount > 0) {
          one_class.studentCount -= 1;
        }
        if (one_class?.strength > 0) {
          one_class.strength -= 1;
        }
        if (one_student?.studentGender === "Male") {
          if (one_batch.student_category.boyCount > 0) {
            one_batch.student_category.boyCount -= 1;
            if (one_class?.boyCount > 0) {
              one_class.boyCount -= 1;
            }
          }
        } else if (one_student?.studentGender === "Female") {
          if (one_batch.student_category.girlCount > 0) {
            one_batch.student_category.girlCount -= 1;
            if (one_class?.girlCount > 0) {
              one_class.girlCount -= 1;
            }
          }
        } else if (one_student?.studentGender === "Other") {
          if (one_batch.student_category.otherCount > 0) {
            one_batch.student_category.otherCount -= 1;
            if (one_class?.otherCount > 0) {
              one_class.otherCount -= 1;
            }
          }
        }
        var all_apps = await NewApplication.find({
          _id: { $in: one_user?.applyApplication },
        });
        for (var app of all_apps) {
          var all_remain_list = await RemainingList.find({
            $and: [{ student: one_student?._id }, { appId: app?._id }],
          });
          for (var remain of all_remain_list) {
            await RemainingList.findByIdAndDelete(remain?._id);
          }
          var all_receipts = await FeeReceipt.find({
            $and: [{ student: one_student?._id }, { application: app?._id }],
          });
          for (var receipt of all_receipts) {
            await FeeReceipt.findByIdAndDelete(receipt?._id);
          }
          if (one_student?.admissionRemainFeeCount > 0) {
            if (app?.remainingFee > 0) {
              app.remainingFee -= one_student?.admissionRemainFeeCount;
            }
          }
          app.deleted_student_fee += one_student.admissionPaidFeeCount;
          for (var rec of app?.receievedApplication) {
            if (`${rec?.student}` === `${one_student?._id}`) {
              app.receievedApplication.pull(rec?._id);
              if (rec?.receievedCount > 0) {
                rec.receievedCount -= 1;
              }
            }
          }
          for (var rec of app?.selectedApplication) {
            if (`${rec?.student}` === `${one_student?._id}`) {
              app.selectedApplication.pull(rec?._id);
              if (rec?.selectCount > 0) {
                rec.selectCount -= 1;
              }
            }
          }
          for (var rec of app?.confirmedApplication) {
            if (`${rec?.student}` === `${one_student?._id}`) {
              app.confirmedApplication.pull(rec?._id);
              if (rec?.confirmCount > 0) {
                rec.confirmCount -= 1;
              }
            }
          }
          for (var rec of app?.allottedApplication) {
            if (`${rec?.student}` === `${one_student?._id}`) {
              app.allottedApplication.pull(rec?._id);
              if (rec?.allotCount > 0) {
                rec.allotCount -= 1;
              }
            }
          }
          for (var rec of app?.cancelApplication) {
            if (`${rec?.student}` === `${one_student?._id}`) {
              app.cancelApplication.pull(rec?._id);
              if (rec?.cancelCount > 0) {
                rec.cancelCount -= 1;
              }
            }
          }
          var all_status = await Status.find({ applicationId: app?._id });
          for (var status of all_status) {
            await Status.findByIdAndDelete(status?._id);
          }
          await app.save();
        }
        admission.remainingFee.pull(one_student?._id);
        if (one_student?.admissionRemainFeeCount > 0) {
          if (admission.remainingFeeCount > 0) {
            admission.remainingFeeCount -= one_student?.admissionRemainFeeCount;
          }
        }
        admission.deleted_student_fee += one_student.admissionPaidFeeCount;
        if (one_student?.admissionPaidFeeCount > 0) {
          if (finance?.financeTotalBalance > 0) {
            finance.financeTotalBalance -= one_student?.admissionPaidFeeCount;
          }
        }
        var all_notification = await StudentNotification.find({
          notifyReceiever: `${one_user?._id}`,
        });
        for (var notify of all_notification) {
          await StudentNotification.findByIdAndDelete(notify?._id);
        }
        one_ins.ApproveStudent.pull(one_student?._id);
        if (one_ins?.studentCount > 0) {
          one_ins.studentCount -= 1;
        }
        admin.studentArray.pull(one_student?._id);
        if (admin?.studentCount > 0) {
          admin.studentCount -= 1;
        }
        if (`${one_ins?.isUniversal}` === "Not Assigned") {
          if (one_ins?.userFollowersList?.includes(`${one_user?._id}`)) {
            one_ins.userFollowersList.pull(one_user?._id);
            if (one_ins?.followersCount > 0) {
              one_ins.followersCount -= 1;
            }
          }
          var universal = await InstituteAdmin.findOne({
            isUniversal: "Universal",
          });
          if (universal?.userFollowersList?.includes(`${one_user?._id}`)) {
            universal.userFollowersList.pull(one_user?._id);
            if (universal?.followersCount > 0) {
              universal.followersCount -= 1;
            }
          }
          await universal.save();
        }
        if (`${one_ins?.isUniversal}` === "Universal") {
          if (one_ins?.userFollowersList?.includes(`${one_user?._id}`)) {
            one_ins.userFollowersList.pull(one_user?._id);
            if (one_ins?.followersCount > 0) {
              one_ins.followersCount -= 1;
            }
          }
        }
        if (one_ins?.joinedUserList?.includes(`${one_user?._id}`)) {
          one_ins.joinedUserList.pull(one_user?._id);
        }
        if (one_ins?.joinedPost?.includes(`${one_user?._id}`)) {
          one_ins.joinedPost.pull(one_user?._id);
        }
        // if (one_student?.studentProfilePhoto) {
        //   await deleteFile(one_student?.studentProfilePhoto);
        // }
        // if (one_user?.profilePhoto) {
        //   await deleteFile(one_user?.profilePhoto);
        // }
        var all_post = await Post.find({ author: `${one_user?._id}` });
        for (var ref of all_post) {
          await Post.findByIdAndDelete(ref?._id);
        }
        var all_answer = await Answer.find({ author: `${one_user?._id}` });
        for (var ref of all_answer) {
          await Answer.findByIdAndDelete(ref?._id);
        }
        await Student.findByIdAndDelete(one_student?._id);
        await User.findByIdAndDelete(one_user?._id);
      }
    }
    await Promise.all([
      admission.save(),
      one_batch.save(),
      one_depart.save(),
      one_class.save(),
      finance.save(),
      one_ins.save(),
      admin.save(),
    ]);
    // res.status(200).send({ message: "Deletion Operation Completed", access: true})
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUnApprovedDirectJoinQuery = async (id, student_array) => {
  try {
    var maleAvatar = [
      "3D2.jpg",
      "3D4.jpg",
      "3D6.jpg",
      "3D19.jpg",
      "3D20.jpg",
      "3D26.jpg",
      "3D21.jpg",
      "3D12.jpg",
      "3D13.jpg",
    ];
    var femaleAvatar = [
      "3D1.jpg",
      "3D3.jpg",
      "3D10.jpg",
      "3D11.jpg",
      "3D14.jpg",
      "3D15.jpg",
      "3D22.jpg",
      "3D31.jpg",
      "3D24.jpg",
    ];
    for (var ref of student_array) {
      // console.log("INSERTED");
      const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
      const valid = await filter_unique_username(
        ref?.studentFirstName,
        ref?.studentDOB
      );
      if (!valid?.exist) {
        const genUserPass = bcrypt.genSaltSync(12);
        const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
        var user = new User({
          userLegalName: `${ref?.studentFirstName} ${
            ref?.studentMiddleName ? ref?.studentMiddleName : ""
          } ${ref?.studentLastName ? ref?.studentLastName : ""}`,
          userGender: ref?.studentGender,
          userDateOfBirth: ref?.studentDOB,
          username: valid?.username,
          userStatus: "Not Approved",
          userPhoneNumber: ref?.userPhoneNumber,
          userPassword: hashUserPass,
          userEmail: ref?.userEmail,
          photoId: "0",
          coverId: "2",
          remindLater: rDate,
          next_date: c_date,
        });
        admins.users.push(user);
        admins.userCount += 1;
        await Promise.all([admins.save(), user.save()]);
        var uInstitute = await InstituteAdmin.findOne({
          isUniversal: "Universal",
        })
          .select("id userFollowersList followersCount")
          .populate({ path: "posts" });
        if (uInstitute && uInstitute.posts && uInstitute.posts.length >= 1) {
          const post = await Post.find({
            _id: { $in: uInstitute.posts },
            postStatus: "Anyone",
          });
          post.forEach(async (ele) => {
            user.userPosts.push(ele);
          });
          await user.save();
        }
        //
        if (user?.userDateOfBirth) {
          var b_date = user.userDateOfBirth.slice(8, 10);
          var b_month = user.userDateOfBirth.slice(5, 7);
          var b_year = user.userDateOfBirth.slice(0, 4);
          if (b_date > p_date) {
            p_date = p_date + month[b_month - 1];
            p_month = p_month - 1;
          }
          if (b_month > p_month) {
            p_year = p_year - 1;
            p_month = p_month + 12;
          }
          var get_cal_year = p_year - b_year;
          if (get_cal_year > 13) {
            user.ageRestrict = "No";
          } else {
            user.ageRestrict = "Yes";
          }
        }
        await user.save();
        //
        if (uInstitute?.userFollowersList?.includes(`${user._id}`)) {
        } else {
          uInstitute.userFollowersList.push(user._id);
          uInstitute.followersCount += 1;
          user.userInstituteFollowing.push(uInstitute._id);
          user.followingUICount += 1;
          await Promise.all([uInstitute.save(), user.save()]);
          const posts = await Post.find({ author: `${uInstitute._id}` });
          posts.forEach(async (ele) => {
            ele.authorFollowersCount = uInstitute.followersCount;
            await ele.save();
          });
        }
        const institute = await InstituteAdmin.findById({
          _id: id,
        });
        const student = new Student({
          studentFirstName: ref?.studentFirstName,
          studentMiddleName: ref?.studentMiddleName,
          studentLastName: ref?.studentLastName,
          studentDOB: ref?.studentDOB,
          studentGender: ref?.studentGender,
          studentMotherName: ref?.studentMotherName,
          studentCast: ref?.studentCast,
          studentCastCategory: ref?.studentCastCategory,
          studentReligion: ref?.studentReligion,
          studentNationality: ref?.studentNationality,
          studentAddress: ref.studentAddress,
          studentDOB: ref.studentDOB,
          studentMTongue: ref.studentMTongue,
          student_prn_enroll_number: ref.student_prn_enroll_number,
        });
        student.valid_full_name = `${student?.studentFirstName} ${
          student?.studentMiddleName ?? ""
        } ${student?.studentLastName}`;
        if (student?.studentGender?.toLowerCase() === "male") {
          student.studentProfilePhoto =
            maleAvatar[Math.floor(Math.random() * 8)];
          user.profilePhoto = maleAvatar[Math.floor(Math.random() * 8)];
        } else if (student?.studentGender?.toLowerCase() === "female") {
          student.studentProfilePhoto =
            femaleAvatar[Math.floor(Math.random() * 8)];
          user.profilePhoto = femaleAvatar[Math.floor(Math.random() * 8)];
        } else {
        }
        const aStatus = new Status({});
        institute.UnApprovedStudent.push(student._id);
        institute.un_approved_student_count += 1;
        user.student.push(student._id);
        user.is_mentor = true;
        institute.joinedPost.push(user._id);
        if (institute.userFollowersList.includes(user?._id)) {
        } else {
          user.userInstituteFollowing.push(institute?._id);
          user.followingUICount += 1;
          institute.userFollowersList.push(user?._id);
          institute.followersCount += 1;
        }
        student.user = user._id;
        aStatus.content = `Your application for joining as student in ${institute.insName} is filled successfully. Stay updated to check status of your application.Tap here to see username ${user?.username}`;
        aStatus.see_secure = true;
        user.applicationStatus.push(aStatus._id);
        aStatus.instituteId = institute._id;
        aStatus.student = student._id;
        await Promise.all([
          student.save(),
          institute.save(),
          user.save(),
          aStatus.save(),
        ]);
        // res.status(200).send({
        //   message: "Account Creation Process Completed 😀✨",
        //   access: true
        // });
      } else {
        console.log("Bug in the direct un-approved joining process 😡");
        // res.status(200).send({
        //   message: "Bug in the direct joining process 😡",
        //   access: false,
        // });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInstituteDirectJoinPayloadFeesQuery = async (
  aid,
  student_array
) => {
  try {
    for (var query of student_array) {
      if (query?.GRNO) {
        var student = await Student.findOne({ studentGRNO: `${query?.GRNO}` });
        var user = await User.findById({ _id: `${student?.user}` });
        const ads_admin = await Admission.findById({ _id: aid });
        const institute = await InstituteAdmin.findById({
          _id: `${ads_admin?.institute}`,
        });
        var finance = await Finance.findById({
          _id: `${institute?.financeDepart[0]}`,
        });
        student.fee_structure =
          query?.is_remain === "No"
            ? query?.fee_struct
            : query?.batch_set[0]?.fee_struct;
        await student.save();
        if (query?.batch_set?.length > 0) {
          await fee_reordering_direct_student_payload_exist_query(
            student,
            institute,
            query?.batch_set,
            user,
            finance
          );
        }
        await Promise.all([student.save(), institute.save(), user.save()]);
      } else {
        console.log("Problem in Account Creation");
        // return false
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// exports.renderAllStudentQuery = async (req, res) => {
//   try {
//     const { id } = req.params;
//     var all_student = await Student.find({ institute: id });
//     for (var ref of all_student) {
//       ref.valid_full_name = `${ref?.studentFirstName} ${
//         ref?.studentMiddleName ?? ""
//       } ${ref?.studentLastName}`;
//       await ref.save();
//     }
//     res
//       .status(200)
//       .send({ message: "Explore All Saved Student Name", access: true });
//   } catch (e) {
//     console.log(e);
//   }
// };
