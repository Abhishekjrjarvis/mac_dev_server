const Admin = require("../../models/superAdmin");
const InstituteAdmin = require("../../models/InstituteAdmin");
const User = require("../../models/User");
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
const Notification = require("../../models/notification");
const Status = require("../../models/Admission/status");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");

function generateAccessToken(username, userId, userPassword) {
  return jwt.sign(
    { username, userId, userPassword },
    process.env.TOKEN_SECRET,
    { expiresIn: "1y" }
  );
}

function generateAccessInsToken(name, insId, insPassword) {
  return jwt.sign({ name, insId, insPassword }, process.env.TOKEN_SECRET, {
    expiresIn: "1y",
  });
}

function generateAccessAdminToken(adminUserName, adminId, adminPassword) {
  return jwt.sign(
    { adminUserName, adminId, adminPassword },
    process.env.TOKEN_SECRET,
    { expiresIn: "1y" }
  );
}

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
        // console.log("messsage Sent Successfully", res.data);
      } else {
        // console.log("something went wrong");
      }
    });
  return OTP;
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
        // console.log("messsage Sent Successfully", res.data);
      } else {
        // console.log("something went wrong");
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
if (p_month <= 10) {
  p_month = `0${p_month}`;
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
          username: username,
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
      username: username,
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
        res.status(200).send({ message: "Otp verified", user });
        await OTPCode.findByIdAndDelete(valid_otp_user?._id);
      } else {
        console.log("Invalid OTP By User F");
      }
    } else if (institute) {
      const valid_otp_ins = await OTPCode.findOne({
        otp_number: `${institute?.insPhoneNumber}`,
      });
      if (
        req.body.userOtpCode &&
        req.body.userOtpCode === `${valid_otp_ins?.otp_code}`
      ) {
        res.status(200).send({ message: "Otp verified", institute });
        await OTPCode.findByIdAndDelete(valid_otp_ins?._id);
      } else {
        console.log("Invalid OTP By Institute F");
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
    const { email } = req.body;
    const check_ins = await InstituteAdmin.findOne({ insEmail: email }).select(
      "id"
    );
    const check_user = await User.findOne({ userEmail: email }).select("id");
    const check_admin = await Admin.findOne({ adminEmail: email }).select("id");
    var flag_email = false;
    if (check_ins) {
      flag_email = true;
      res
        .status(200)
        .send({ message: "Email Already Registered", flag: flag_email });
    } else if (check_user) {
      flag_email = true;
      res
        .status(200)
        .send({ message: "Email Already Registered", flag: flag_email });
    } else if (check_admin) {
      flag_email = true;
      res
        .status(200)
        .send({ message: "Email Already Registered", flag: flag_email });
    } else {
      res.status(200).send({ message: "Valid Email", flag: flag_email });
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
          message: `Ins Username Rejected for next update is available at ${moment(
            new Date(check_ins.next_date).toISOString()
          ).format("MMM Do YY")} 😀👍`,
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
          message: `User Username Rejected for next update is available at ${moment(
            new Date(check_user.next_date).toISOString()
          ).format("MMM Do YY")} 😀👍`,
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
    if (req.query.u_name.trim() === "") {
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

      if (one_ins)
        res.status(202).send({
          message: "Username already exists 🙄",
          seen: true,
          username: one_ins,
        });
      else if (one_user)
        res.status(202).send({
          message: "Username already exists 🙄",
          seen: true,
          username: one_user,
        });
      else {
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
    if (req.query.search.trim() === "") {
      res.status(202).send({ message: "Please Provide a code to search" });
    } else {
      if (req.query.author === "Student") {
        var classes = await Class.findOne({
          classCode: req.query.search,
        }).select("classCode classTitle className");
        var one_ins = await InstituteAdmin.findOne({
          classCodeList: { $in: [req.query.search] },
        })
          .select("insName insProfilePhoto photoId classCodeList")
          .lean()
          .exec();
      } else if (req.query.author === "Staff") {
        var one_ins = await InstituteAdmin.findOne({
          staffJoinCode: req.query.search,
        })
          .select("insName insProfilePhoto photoId staffJoinCode")
          .lean()
          .exec();
      } else {
      }
    }
    if (one_ins)
      res.status(202).send({
        message: "Check All Details 🔍",
        seen: true,
        one_ins,
        classes,
      });
    else {
      res.status(200).send({
        message: "this code does not exists in lake 🔍",
        seen: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const random_password = () => {
  const upperCase = ["A", "B", "C", "D", "E", "F", "G", "H", "Z"];
  const lowerCase = ["i", "j", "k", "l", "m", "n", "o", "p", "W"];
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
  const exp = [".", "_", "@", "#", "$", "!", "%", "&", "*"];
  const u_1 = Math.floor(Math.random() * 9);
  const u_2 = Math.floor(Math.random() * 9);
  const u_3 = Math.floor(Math.random() * 9);
  const u_4 = Math.floor(Math.random() * 9);
  const u_5 = Math.floor(Math.random() * 9);
  const u_6 = Math.floor(Math.random() * 9);
  const u_7 = Math.floor(Math.random() * 9);
  const u_8 = Math.floor(Math.random() * 9);
  const u_9 = Math.floor(Math.random() * 9);
  const userExp = `${lowerCase[u_1]}${upperCase[u_2]}${digits[u_3]}${upperCase[u_4]}${exp[u_6]}${digits[u_5]}${lowerCase[u_8]}${exp[u_7]}${exp[u_9]}`;
  return userExp;
};

const filter_unique_username = async (name, dob) => {
  const new_query = `${dob?.substring(5, 7)}${dob?.substring(8, 10)}`.split("");
  const shuffle_date = shuffleArray(new_query);
  const combined_name = `${name}_${shuffle_date.join("")}`;
  const username = combined_name;
  const existAdmin = await Admin.findOne({ adminUserName: username });
  const existInstitute = await InstituteAdmin.findOne({ name: username });
  const existUser = await User.findOne({ username: username });
  if (existAdmin) {
    const combined_name_one = `${name}_${new_query}`.split("");
    const username_one = shuffleArray(combined_name_one);
    const valid_username_one = {
      username: username_one.join(""),
      password: random_password(),
      exist: false,
    };
    return valid_username_one;
  } else if (existInstitute) {
    const combined_name_two = `${name}_${new_query}`.split("");
    const username_two = shuffleArray(combined_name_two);
    const valid_username_two = {
      username: username_two.join(""),
      password: random_password(),
      exist: false,
    };
    return valid_username_two;
  } else if (existUser) {
    const combined_name_three = `${name}_${new_query}`.split("");
    const username_three = shuffleArray(combined_name_three);
    const valid_username_three = {
      username: username_three.join(""),
      password: random_password(),
      exist: false,
    };
    return valid_username_three;
  } else {
    const valid_username = {
      username: username,
      password: random_password(),
      exist: false,
    };
    return valid_username;
  }
};

exports.retrieveDirectJoinQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { sample_pic } = req.body;
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
        userLegalName: req.body.studentFirstName,
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
      if (req?.files) {
        for (let file of req.files) {
          let count = 1;
          if (count === 1) {
            const width = 200;
            const height = 200;
            const results = await uploadFile(file, width, height);
            student.photoId = "0";
            student.studentProfilePhoto = results.key;
            user.profilePhoto = results.key;
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
      notify.notifyContent = `${student.studentFirstName}${
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
    const { sample_pic } = req.body;
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
        userLegalName: req.body.staffFirstName,
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
      if (req?.files) {
        for (let file of req.files) {
          let count = 1;
          if (count === 1) {
            const width = 200;
            const height = 200;
            const results = await uploadFile(file, width, height);
            staff.photoId = "0";
            staff.staffProfilePhoto = results.key;
            user.profilePhoto = results.key;
            count = count + 1;
          } else if (count === 2) {
            const results = await uploadDocFile(file);
            staff.staffAadharFrontCard = results.key;
            count = count + 1;
          } else {
            const results = await uploadDocFile(file);
            staff.staffAadharBackCard = results.key;
          }
          await unlinkFile(file.path);
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
      aStatus.content = `Your application for joining as staff in ${institute.insName} is filled successfully.Tap here to see username ${user?.username}`;
      user.applicationStatus.push(aStatus._id);
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
