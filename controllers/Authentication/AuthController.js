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
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
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
} = require("../../helper/multipleStatus");
const { whats_app_sms_payload } = require("../../WhatsAppSMS/payload");

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
        console.log("messsage Sent Successfully", res.data);
      } else {
        console.log("something went wrong");
      }
    });
  return OTP;
};

const directESMSQuery = async (mob, sName, iName, cName) => {
  const e_message = `Hi ${sName}. You are studying in ${cName} of ${iName}. Login by downloading app 'Qviple Community' through link: https://play.google.com/store/apps/details?id=com.mithakalminds.qviple - From Qviple`;
  const url = `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=${e_message}&senderid=QVIPLE&accusage=6&entityid=1701164286216096677&tempid=1707167282706976266`;
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

exports.getOtpAtUser = async (req, res) => {
  try {
    const { userPhoneNumber, status } = req.body;
    if (userPhoneNumber) {
      if (status === "Not Verified") {
        await OTPCode.deleteMany({ otp_number: userPhoneNumber });
        const code = await generateOTP(userPhoneNumber);
        const otpCode = new OTPCode({
          otp_number: userPhoneNumber,
          otp_code: `${code}`,
        });
        await otpCode.save();
        // const uPhoneEncrypt = await encryptionPayload(userPhoneNumber);
        res.status(200).send({
          message: "code will be send to registered mobile number",
          userPhoneNumber,
        });
      } else {
        res.send({ message: "User will be verified..." });
      }
    } else {
      res.send({ message: "Invalid Phone No." });
    }
  } catch (e) {
    console.log(`Error`, e.message);
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
        console.log("messsage Sent Successfully", res.data);
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
    if (insPhoneNumber) {
      if (status === "Not Verified") {
        await OTPCode.deleteMany({ otp_number: insPhoneNumber });
        const code = await generateInsOTP(insPhoneNumber);
        const otpCode = new OTPCode({
          otp_number: insPhoneNumber,
          otp_code: `${code}`,
        });
        await otpCode.save();
        // const iPhoneEncrypt = await encryptionPayload(insPhoneNumber);
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
    const all_account = await User.find({ userPhoneNumber: id }).select(
      "userLegalName username profilePhoto userPassword"
    );

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
    if (
      req.body.userOtpCode &&
      req.body.userOtpCode === `${valid_otp?.otp_code}`
    ) {
      var userStatus = "approved";
      // Add Another Encryption
      res.send({
        message: "OTP verified",
        id,
        userStatus,
        accounts: account_linked,
        count: account_linked?.length,
      });
      await OTPCode.findByIdAndDelete(valid_otp?._id);
    } else {
      res.send({ message: "Invalid OTP" });
    }
  } catch (e) {
    console.log(`Error`, e.message);
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
    const { userLegalName, userGender, userDateOfBirth, username, sample_pic } =
      req.body;
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
        var user = new User({
          userLegalName: userLegalName,
          userGender: userGender,
          userDateOfBirth: userDateOfBirth,
          username: username?.trim(),
          userStatus: "Approved",
          userPhoneNumber: id,
          photoId: "0",
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
      if (checkPass) {
        //
        if (
          institute.activeStatus === "Deactivated" &&
          institute.activeDate <= deactivate_date
        ) {
          institute.activeStatus = "Activated";
          institute.activeDate = "";
          await institute.save();
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
          });
        } else if (institute.activeStatus === "Activated") {
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
          user.userPassword
        );
        if (checkUserPass) {
          if (
            user.activeStatus === "Deactivated" &&
            user.activeDate <= deactivate_date
          ) {
            user.activeStatus = "Activated";
            user.activeDate = "";
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
        userPhoneNumber: id,
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
        student,
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
        userPhoneNumber: id,
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
        userPhoneNumber: id,
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
      const apply = await NewApplication.findById({ _id: aid });
      const admission = await Admission.findById({
        _id: `${apply.admissionAdmin}`,
      }).select("institute");
      const institute = await InstituteAdmin.findById({
        _id: `${admission.institute}`,
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
      status.content = `You have applied for ${apply.applicationName} has been filled successfully.Stay updated to check status of your application.Tap here to see username ${user?.username}`;
      status.applicationId = apply._id;
      user.student.push(student._id);
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

exports.retrieveInstituteDirectJoinQuery = async (req, res) => {
  try {
    const { id, cid } = req.params;
    const { sample_pic, fileArray } = req.body;
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
        userPhoneNumber: id,
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

      const classes = await Class.findById({ _id: cid });
      const batch = await Batch.findById({ _id: `${classes?.batch}` });
      const depart = await Department.findById({ _id: `${batch?.department}` });
      const institute = await InstituteAdmin.findById({
        _id: `${depart?.institute}`,
      });
      const student = new Student({ ...req.body });
      student.studentCode = classes.classCode;
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
      student.studentStatus = req.body.status;
      institute.ApproveStudent.push(student._id);
      admins.studentArray.push(student._id);
      admins.studentCount += 1;
      institute.studentCount += 1;
      classes.strength += 1;
      classes.ApproveStudent.push(student._id);
      classes.studentCount += 1;
      student.studentGRNO = `Q${institute.ApproveStudent.length}`;
      student.studentROLLNO = classes.ApproveStudent.length;
      student.studentClass = classes._id;
      student.studentAdmissionDate = new Date().toISOString();
      depart.ApproveStudent.push(student._id);
      depart.studentCount += 1;
      student.department = depart._id;
      batch.ApproveStudent.push(student._id);
      student.batches = batch._id;
      student.batchCount += 1;
      notify.notifyContent = `${student.studentFirstName} ${student.studentMiddleName ? ` ${student.studentMiddleName}` : ""} ${student.studentLastName} joined as a Student of Class ${classes.className} of ${batch.batchName}`;
      notify.notifySender = cid;
      notify.notifyReceiever = user._id;
      notify.notifyCategory = "Approve Student";
      institute.iNotify.push(notify._id);
      notify.institute = institute._id;
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByStudentPhoto = student._id;
      aStatus.content = `Welcome to ${institute.insName}. Your application for joining as student  has been accepted by ${institute.insName}. Enjoy your learning in ${classes.className} - ${classes.classTitle}.`;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      invokeFirebaseNotification(
        "Student Approval",
        notify,
        institute.insName,
        user._id,
        user.deviceToken
      );
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
      } else if (institute.sms_lang === "hi") {
        await directHSMSQuery(
          user?.userPhoneNumber,
          `${student.studentFirstName} ${
            student.studentMiddleName ? student.studentMiddleName : ""
          } ${student.studentLastName}`,
          institute?.insName,
          classes?.classTitle
        );
      } else if (institute.sms_lang === "mr") {
        await directMSMSQuery(
          user?.userPhoneNumber,
          `${student.studentFirstName} ${
            student.studentMiddleName ? student.studentMiddleName : ""
          } ${student.studentLastName}`,
          institute?.insName,
          classes?.classTitle
        );
      } else {
      }
      res.status(200).send({
        message: `Direct Institute Account Creation Process Completed ${student.studentFirstName} ${student.studentLastName} 😀✨`,
        status: true,
      });
      const studentName = `${student.studentFirstName} ${student.studentMiddleName ? ` ${student.studentMiddleName}` : ""} ${student.studentLastName}`
      await whats_app_sms_payload(user?.userPhoneNumber, studentName, institute?.insName, classes?.className, "ADSIS", institute?.insType, 0, 0, institute?.sms_lang)
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

exports.retrieveInstituteDirectJoinStaffQuery = async (req, res) => {
  try {
    const { id, insId } = req.params;
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
        userPhoneNumber: id,
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
      notify.notifyContent = `Congrats ${staff.staffFirstName} ${staff.staffMiddleName ? `${staff.staffMiddleName}` : ""} ${staff.staffLastName} for joined as a staff at ${institute.insName}`;
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
      invokeFirebaseNotification(
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
      res.status(200).send({
        message: "Direct Institute Account Creation Process Completed 😀✨",
        status: true,
      });
      const staffName = `${staff.staffFirstName} ${staff.staffMiddleName ? `${staff.staffMiddleName}` : ""} ${staff.staffLastName}`
      await whats_app_sms_payload(user?.userPhoneNumber, staffName, institute?.insName, null, "ADMIS", institute?.insType, 0, 0, institute?.sms_lang)
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

exports.renderDirectAppJoinConfirmQuery = async (req, res) => {
  try {
    const { id, aid } = req.params;
    const { existingUser } = req.query;
    const { sample_pic, fileArray, type, mode, amount } = req.body;
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
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    if (!existingUser) {
      var valid = await filter_unique_username(
        req.body.studentFirstName,
        req.body.studentDOB
      );
    }
    if (!existingUser) {
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
          userPhoneNumber: id,
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
      var user = await User.findById({ _id: `${existingUser}` });
    }
    const student = new Student({ ...req.body });
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
    user.student.push(student._id);
    user.applyApplication.push(apply._id);
    student.user = user._id;
    await insert_multiple_status(apply, user, institute, student?._id);
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
      admission
    );
    if (institute.userFollowersList.includes(user?._id)) {
    } else {
      user.userInstituteFollowing.push(institute._id);
      user.followingUICount += 1;
      institute.userFollowersList.push(user?._id);
      institute.followersCount += 1;
    }
    await insert_multiple_status(apply, user, institute, student?._id);
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
    });
    await ignite_multiple_alarm(user);
    const studentName = `${student?.studentFirstName} ${student?.studentMiddleName ? studentMiddleName : ""} ${student?.studentLastName}`
    await whats_app_sms_payload(user?.userPhoneNumber, studentName, institute?.insName, null, "ASCAS", institute?.insType, student.admissionPaidFeeCount, student.admissionRemainFeeCount, institute?.sms_lang)
  } catch (e) {
    console.log(e);
  }
};

exports.renderSelectAccountQuery = async (req, res) => {
  try {
    const valid_key = handle_undefined(req.query.phoneKey);
    if (!valid_key)
      return res
        .status(200)
        .send({
          message: "Their is a bug need to fix immediately 😡",
          access: false,
        });
    const all_account = await User.find({ userPhoneNumber: valid_key }).select(
      "userLegalName username profilePhoto userPassword"
    );
    if (all_account?.length > 0) {
      res
        .status(200)
        .send({
          message: "Lot's of choices select one 😁",
          access: true,
          all_account,
        });
    } else {
      res
        .status(200)
        .send({
          message: "No choices left create one 😁",
          access: false,
          all_account: [],
        });
    }
  } catch (e) {
    console.log(e);
  }
};

