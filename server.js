require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
// const bcrypt = require('bcrypt')
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const { isApproved, isLoggedIn } = require("./middleware");
// const data = require("./Verify.js");
// const client = require("twilio")(data.ACCOUNTSID, data.AUTHTOKEN);
const InstituteChat = require("./models/InstituteChat");
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const moment = require("moment");
const axios = require("axios");
const Admin = require("./models/superAdmin");
const InstituteAdmin = require("./models/InstituteAdmin");
const InsAnnouncement = require("./models/InsAnnouncement");
const User = require("./models/User");
const Post = require("./models/Post");
const UserPost = require("./models/userPost");
const Staff = require("./models/Staff");
const Comment = require("./models/Comment");
const UserComment = require("./models/UserComment");
const Department = require("./models/Department");
const Batch = require("./models/Batch");
const Class = require("./models/Class");
const Subject = require("./models/Subject");
const Student = require("./models/Student");
const Checklist = require("./models/Checklist");
const Fees = require("./models/Fees");
const Behaviour = require("./models/Behaviour");
const Attendence = require("./models/Attendence");
const AttendenceDate = require("./models/AttendenceDate");
const StaffAttendence = require("./models/StaffAttendence");
const StaffAttendenceDate = require("./models/StaffAttendenceDate");
const UserAnnouncement = require("./models/UserAnnouncement");
const SubjectMaster = require("./models/SubjectMaster");
const ClassMaster = require("./models/ClassMaster");
const Exam = require("./models/Exam");
const Conversation = require("./models/Conversation");
const GroupConversation = require("./models/GroupConversation");
const Holiday = require("./models/Holiday");
const Finance = require("./models/Finance");
const Income = require("./models/Income");
const Expense = require("./models/Expense");
const Sport = require("./models/Sport");
const SportClass = require("./models/SportClass");
const SportEvent = require("./models/SportEvent");
const SportEventMatch = require("./models/SportEventMatch");
const SportTeam = require("./models/SportTeam");
const Leave = require("./models/Leave");
const StudentLeave = require("./models/StudentLeave");
const StudentTransfer = require("./models/StudentTransfer");
const Transfer = require("./models/Transfer");
const UserSupport = require("./models/UserSupport");
const InstituteSupport = require("./models/InstituteSupport");
const Complaint = require("./models/Complaint");
const Field = require("./models/Field");
const Report = require("./models/Report");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const Role = require("./models/Role");
const {
  uploadFile,
  uploadVideo,
  uploadDocFile,
  getFileStream,
  deleteFile,
} = require("./S3Configuration");

const update = require("./controllers/update");
// =========== Ankush Model ==========

const ELearning = require("./models/ELearning");
const Playlist = require("./models/Playlist");
const Video = require("./models/Video");
const Resource = require("./models/Resource");
const Topic = require("./models/Topic");
const { getVideoDurationInSeconds } = require("get-video-duration");
const Library = require("./models/Library");
const Book = require("./models/Book");
const Issue = require("./models/Issue");
const Collect = require("./models/Collect");
const VideoComment = require("./models/VideoComment");
const ResourcesKey = require("./models/ResourcesKey");

// ========= Vaibhav Model ========

const AdmissionAdmin = require("./models/AdmissionAdmin");
const DepartmentApplication = require("./models/DepartmentApplication");
const PreAppliedStudent = require("./models/PreAppliedStudent");

//===========Vaibhav MCQ ================

const McqTestSets = require("./models/McqTestSets");
const McqQuestions = require("./models/McqQuestions");
const ScheduleTestSets = require("./models/ScheduleTestSets");

const Feedback = require("./models/Feedback");
const Payment = require("./models/Payment");
const PlaylistPayment = require("./models/PlaylistPayment");
const IdCardPayment = require("./models/IdCardPayment");
const ApplyPayment = require("./models/ApplyPayment");
const payment = require("./routes/paymentRoute");
const uploadRoute = require("./routes/UploadContent/index");
const elearningRoute = require("./routes/Elearning/index");
const libraryRoute = require("./routes/Library/index");
const searchRoute = require("./routes/Search/index");
const commentReplyRoute = require("./routes/ReplyComment/index");

//===========Vaibhav Extra-Curriculam ================
const Elections = require("./models/Elections");

//=========== Vaibhav Department & Class Profile ================

// const FormDetails = require("./models/FormDetails")

//FOR THE NEW API FOR APP

const newCode = require("./controllers/new");
// Notification

const Notification = require("./models/notification");
// const { notify } = require("./routes/conversations");
const { validate } = require("./models/UserComment");

const updateNew = require("./routes/Update/updateRoute");
const paymentNew = require("./routes/Payment/paymentRoute");
const adminNew = require("./routes/SuperAdmin/adminRoute");
const instituteNew = require("./routes/InstituteAdmin/instituteRoute");
const authNew = require("./routes/Authentication/authRoute");
const financeNew = require("./routes/Finance/financeRoute");
const sportNew = require("./routes/Sport/sportRoute");
const miscellaneousNew = require("./routes/Miscellaneous/miscellaneousRoute");
const newAppApiNew = require("./routes/NewApi/newRoute");
const userNew = require("./routes/User/userRoute");
const availNew = require("./routes/Attendence/indexRoute");

const landingNew = require('./routes/LandingRoute/indexRoute')
const notifyNew = require('./routes/Notification/push-notification-route')
const chatNew = require('./routes/Chat/chatRoute')
const messageNew = require('./routes/Chat/messageRoute')

// =============IMPORT INSTITUTE POST ROUTER====================
const institutePostRoute = require("./routes/InstituteAdmin/Post/PostRoute");
const userPostRoute = require("./routes/User/Post/PostRoute");
const superAdminPostRoute = require("./routes/SuperAdmin/Post/PostRoute");
const classRoute = require("./routes/Class/classRoute");
const checklistRoute = require("./routes/Checklist/checklistRoute");
const examRoute = require("./routes/Exam/examRoute");
const dburl = `${process.env.DB_URL2}`;
// const dburl = `${process.env.DB_URL}`;
// const dburl = `mongodb://127.0.0.1:27017/Erp_app`;

// 62b9476c59fb91a51211ee9c - Development
// 62bdc9658b4155f336e7960e - Production

mongoose
  .connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((data) => {
    console.log("Database Successfully Connected...");
  })
  .catch((e) => {
    console.log("Something Went Wrong...", e);
  });

// FOR SWAGGER API DOCS

const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerJSDocs = YAML.load("./api.yaml");
// ===============================================

app.set("view engine", "ejs");
app.set("/views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    // origin: "http://18.205.27.165",
    origin: ["http://18.205.27.165","http://localhost:3000"],
    // origin: "http://localhost:3000",
    // origin: "http://qviple.com",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

const secret = "Thisismysecret";
// `${process.env.SECRET}` ||

const store = new MongoStore({
  mongoUrl: dburl,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("some", e);
});

app.use(cookieParser());
app.use(
  session({
    name: "SessionID",
    store,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: Date.now() + 30 * 86400 * 1000,
    },
  })
);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerJSDocs));
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
// app.use("/api/v1", payment);
app.use("/api/v1/search", searchRoute);
app.use("/comment/reply/v1", commentReplyRoute);
app.use("/api/v1/all-images", uploadRoute);
app.use("/api/v1/elearning", elearningRoute);
app.use("/api/v1/library", libraryRoute);
app.use("/api/v1/comment/reply", commentReplyRoute);
app.use("/api/v1/class", classRoute);
app.use("/api/v1/checklist", checklistRoute);
app.use("/api/v1/exam", examRoute);
// app.use("/all-images/v1", uploadRoute);
// app.use("/elearning/v1", elearningRoute);
// app.use("/library/v1", libraryRoute);
// app.use("/search/v1", searchRoute);

// ==================== API ENDPOINTS =======================

// All Payment related APi to Qviple
app.use("/api/v1", paymentNew);

// All Super Admin Api related to Qviple
app.use("/api/v1/admin", adminNew);

// All Institute Admin Api related to Qviple
app.use("/api/v1/ins", instituteNew);

//ALL Institute Post Api Related to Qviple
app.use("/api/v1/ins/post", institutePostRoute);

// All Super Admin Post Api Related to Qviple
app.use("/api/v1/admin/post", superAdminPostRoute);

// All Authentication Api related to Qviple
app.use("/api/v1/auth", authNew);

// All Finance Api related to Qviple
app.use("/api/v1/finance", financeNew);

// All Sport Api related to Qviple
app.use("/api/v1/sport", sportNew);

// Approx All Data regarding to Qviple
app.use("/api/v1/all", miscellaneousNew);

// All Update and Delete Api related to Qviple
app.use("/api/v1/update", updateNew);

// All App Api Restructured related to Qviple
app.use("/api/v1/new", newAppApiNew);

// All User Api related to Qviple
app.use("/api/v1/user", userNew);

//ALL User Post Api Related to Qviple
app.use("/api/v1/user/post", userPostRoute);
// ===========================================================
// All Attendence Api related to Qviple
app.use("/api/v1/attendance", availNew);

// All Landing Api related to Qviple
app.use("/api/v1/landing", landingNew);

// Push Notification Through Flutter By Node
app.use("/api/v1/notification", notifyNew);

// Chat Related to Qviple
app.use('/api/v1/chat', chatNew)

// Message from Chat related to Qviple
app.use('/api/v1/message', messageNew)

// Super Admin Routes


app.get("/", async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.send(admins._id);
  } catch {
    console.log(`SomeThing went wrong at this endPoint(/)`);
  }
});

app.get("/ins/:id/dash/post/page/:p/size/:limit", async (req, res) => {
  try {
    const { id, p, limit } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("insName photoId insProfilePhoto ")
      .populate({
        path: "posts",
        select:
          "CreateInsPost CreateImage imageId CreateVideo insLike insUserLike institute CreatePostStatus createdAt",
        populate: {
          path: "comment",
          select: "commentDesc createdAt",
          populate: {
            path: "institutes",
            select: "insName photoId insProfilePhoto",
          },
          // populate: {
          //   path: 'instituteUser',
          //   select: 'userLegalName photoId profilePhoto'
          // }
        },
      })
      .lean()
      .exec();
    var start_index = (p - 1) * limit;
    var end_index = p * limit;
    const posts = institute.posts.slice(start_index, end_index);
    // console.log(posts.length)
    res.status(200).send({ message: "Limit Post Ins", institute, posts });
  } catch {}
});

app.get("/depart/:did", isLoggedIn, async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did })
      .select(
        "dName dTitle dAbout dEmail dPhoneNumber dSpeaker dVicePrinciple dAdminClerk dStudentPresident photo photoId cover coverId"
      )
      .populate({
        path: "dHead",
        select: "staffFirstName staffMiddleName staffLastName",
      })
      .populate({
        path: "departmentSelectBatch",
        select: "batchName classroom",
      })
      .lean()
      .exec();
    res
      .status(200)
      .send({ message: "Limit Data of Department Batch", department });
  } catch {}
});

app.get("/depart/batch/:did", isLoggedIn, async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did })
      .select("dOperatingAdmin")
      .populate({
        path: "dHead",
        select: "staffFirstName staffMiddleName staffLastName",
      })
      .populate({
        path: "batches",
        select: "batchName batchStatus createdAt",
      })
      .lean()
      .exec();
    res.status(200).send({ message: "Limit Data of Batches", department });
  } catch {}
});

app.get("/ins/:id/staff", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("insName insAbout photoId insProfilePhoto")
      .populate({
        path: "ApproveStaff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        populate: {
          path: "user",
          select: "userLegalName",
        },
      })
      .lean()
      .exec();
    res.status(200).send({ message: "Limit Data of One Staff", institute });
  } catch {}
});

app.get("/ins/:id/student", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("insName insAbout photoId insProfilePhoto")
      .populate({
        path: "ApproveStudent",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
        populate: {
          path: "user",
          select: "userLegalName",
        },
      })
      .lean()
      .exec();
    res.status(200).send({ message: "Limit Data of One Student", institute });
  } catch {}
});

app.get("/ins/:id/search/profile", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .select(
        "insName name followers photoId coverId ApproveStudent ApproveStaff insProfilePhoto insProfileCoverPhoto following userFollowersList insOperatingAdmin insTrusty insPrinciple insStudentPresident insAdminClerk"
      )
      .populate({
        path: "posts",
        select:
          "CreateInsPost CreateImage imageId CreateVideo insLike insUserLike institute CreatePostStatus createdAt",
        populate: {
          path: "comment",
          select: "commentDesc createdAt",
          populate: {
            path: "institutes",
            select: "insName photoId insProfilePhoto",
          },
          populate: {
            path: "instituteUser",
            select: "userLegalName photoId profilePhoto",
          },
        },
      })
      .populate({
        path: "announcement",
        select: "insAnnPhoto insAnnTitle",
      })
      .lean()
      .exec();
    res
      .status(200)
      .send({ message: "Limit Data of Search Institute Profile", institute });
  } catch {}
});
app.get("/super-admin", (req, res) => {
  res.render("SuperAdmin");
});

// Super Admin Creation
app.post("/super-admin", async (req, res) => {
  const {
    adminPhoneNumber,
    adminEmail,
    adminPassword,
    adminUserName,
    adminName,
    adminGender,
    adminDateOfBirth,
    adminCity,
    adminBio,
    adminState,
    adminCountry,
    adminAddress,
    adminAadharCard,
  } = req.body;
  const genPassword = bcrypt.genSaltSync(12);
  const hashPassword = bcrypt.hashSync(adminPassword, genPassword);
  const institute = await InstituteAdmin.find({});
  const admin = new Admin({
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
});

// Get Super Admin Data

// Repay By Super Admin To Institute Admin

app.post("/admin/:aid/ins/:id/repay", async (req, res) => {
  try {
    const { aid, id } = req.params;
    const { amount } = req.body;
    const admin = await Admin.findById({ _id: aid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const notify = new Notification({});
    institute.insBankBalance = institute.insBankBalance - amount;
    institute.adminRepayAmount = institute.adminRepayAmount + amount;
    notify.notifyContent = `Super Admin re-pay Rs. ${amount} to you`;
    notify.notifySender = aid;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
    await institute.save();
    await notify.save();
    res.status(200).send({ message: "Amount Transferred" });
  } catch {}
});

app.get("/all/referral/ins/detail", async (req, res) => {
  try {
    const institute = await InstituteAdmin.find({});
    res.status(200).send({ message: "institute detail", institute });
  } catch {
    console.log(
      `SomeThing went wrong at this endPoint(/all/referral/ins/detail)`
    );
  }
});

app.get("/admindashboard/:id", async (req, res) => {
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
  } catch {
    console.log(`SomeThing went wrong at this endPoint(/admindashboard/:id)`);
  }
});

// Get All User for Institute Referals

app.get("/all/user/referal", async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).send({ message: "User Referal Data", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/user/referal)`);
  }
});

// Institute Approval By Super Admin

app.post("/admin/:aid/approve/ins/:id", async (req, res) => {
  try {
    const { aid, id } = req.params;
    const {
      referalPercentage,
      insFreeLastDate,
      insPaymentLastDate,
      userID,
      status,
    } = req.body;
    // console.log(referalPercentage)
    const admin = await Admin.findById({ _id: aid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: userID });
    const rInstitute = await InstituteAdmin.findById({ _id: userID });
    const notify = await new Notification({});
    const chat = new InstituteChat({
      chatName: institute.insName,
      groupAdmin: institute,
    });
    // chat.staffs.push(institute._id)
    institute.chatAdmin = chat;
    institute.joinChat.push(chat);
    admin.ApproveInstitute.push(institute);
    admin.instituteCount += 1;
    admin.instituteList.pull(id);
    institute.insFreeLastDate = insFreeLastDate;
    institute.insPaymentLastDate = insPaymentLastDate;
    institute.status = status;
    if (user) {
      admin.referals.push(user);
      user.InstituteReferals.push(institute);
      user.referalPercentage =
        user.referalPercentage + parseInt(referalPercentage);
      institute.AllUserReferral.push(user);
      await user.save();
      await institute.save();
    } else if (rInstitute) {
      admin.referalsIns.push(rInstitute);
      rInstitute.instituteReferral.push(institute);
      rInstitute.referalPercentage =
        rInstitute.referalPercentage + parseInt(referalPercentage);
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
    await chat.save();
    await institute.save();
    await notify.save();
    await admin.save();
    res.status(200).send({
      message: `Congrats for Approval ${institute.insName}`,
      admin,
      institute,
    });
  } catch (e) {}
});

// Reject Institute By Super Admin

app.post("/admin/:aid/reject/ins/:id", isLoggedIn, async (req, res) => {
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
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
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
      `SomeThing Went Wrong at this EndPoint(/admin/:aid/reject/ins/:id)`
    );
  }
});

// Institute Admin Routes

app.get("/user/:id/chat", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id }).populate({
      path: "joinChat",
      populate: {
        path: "users",
        select: "userLegalName",
      },
    });
    res.status(200).send({ message: "Joined Chat", user });
  } catch {}
});

// Institute Creation
//for global user admin "${process.env.SuperAdmin_ID${process.env.S_ADMIN_ID}"
//for local my system "${process.env.SuperAdmin_ID}"

app.post("/ins-register", async (req, res) => {
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
        const institute = await new InstituteAdmin({ ...req.body });
        institute.photoId = "1";
        institute.coverId = "2";
        admins.instituteList.push(institute);
        await admins.save();
        await institute.save();
        res.status(201).send({ message: "Institute", institute });
      }
    }
  } catch (e) {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-register)`, e);
  }
});

app.get("/ins-register/doc/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins-register/doc/:key)`
    );
  }
});

//======================================================================//
// app.get("/ins-register/doc/:key", upload.single("file"), async (req, res) => {
//   const key = req.params.key;
//   const readStream = getFileStream(key);
//   readStream.pipe(res);
// });
//=====================================================================//
app.post("/ins-register/doc/:id", upload.single("file"), async (req, res) => {
  console.log(req.params, req.file);
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
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins-register/doc/:id)`,
      e
    );
  }
});

// Create Institute Password
app.post("/create-password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { insPassword, insRePassword } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const genPass = await bcrypt.genSaltSync(12);
    const hashPass = await bcrypt.hashSync(insPassword, genPass);
    if (insPassword === insRePassword) {
      institute.insPassword = hashPass;
      await institute.save();
      req.session.institute = institute;
      res
        .status(200)
        .send({ message: "Password successfully created...", institute });
    } else {
      res.send({ message: "Invalid Combination" });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/create-password/:id)`);
  }
});

// Get Login Credentials of Super Admin & Institute Admin & User

app.get("/ins-login", (req, res) => {
  try {
    if (req.session.institute || req.session.user || req.session.admin) {
      res.send({
        loggedIn: true,
        User: req.session.institute || req.session.user || req.session.admin,
      });
    } else {
      res.send({ loggedIn: false });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-login)`);
  }
});

var d_date = new Date();
var d_a_date = d_date.getDate();
var d_a_month = d_date.getMonth() + 1;
var d_a_year = d_date.getFullYear();
if (d_a_month <= 10) {
  d_a_month = `0${d_a_month}`;
}
var deactivate_date = `${d_a_year}-${d_a_month}-${d_a_date}`;

// Login Route
app.post("/ins-login", async (req, res) => {
  try {
    const { insUserName, insPassword } = req.body;
    const institute = await InstituteAdmin.findOne({ name: `${insUserName}` });
    const user = await User.findOne({ username: `${insUserName}` });
    const admin = await Admin.findOne({ adminUserName: `${insUserName}` });
    if (institute) {
      const checkPass = await bcrypt.compareSync(
        insPassword,
        institute.insPassword
      );
      if (checkPass) {
        req.session.institute = institute;
        res
          .status(200)
          .send({ message: "Successfully LoggedIn as a Institute", institute });
      } else {
        res.send({ message: "Invalid Credentials" });
      }
    } else if (admin) {
      const checkAdminPass = await bcrypt.compareSync(
        insPassword,
        admin.adminPassword
      );
      if (checkAdminPass) {
        req.session.admin = admin;
        res
          .status(200)
          .send({ message: "Successfully LoggedIn as a Super Admin", admin });
      } else {
        res.send({ message: "Invalid Credentials" });
      }
    } else {
      if (user) {
        const checkUserPass = await bcrypt.compareSync(
          insPassword,
          user.userPassword
        );
        if (checkUserPass) {
          if (
            user.activeStatus === "Deactivated" &&
            user.activeDate >= deactivate_date
          ) {
            user.activeStatus = "Activated";
            user.activeDate = "";
            await user.save();
            req.session.user = user;
            res
              .status(200)
              .send({ message: "Successfully LoggedIn as a User", user });
          } else if (user.activeStatus === "Activated") {
            req.session.user = user;
            res
              .status(200)
              .send({ message: "Successfully LoggedIn as a User", user });
          } else {
          }
        } else {
          res.send({ message: "Invalid Credentials" });
        }
      } else {
        res.send({ message: "Invalid End User" });
      }
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(ins-login")`);
  }
});

// Logout Handler

app.get("/ins-logout", (req, res) => {
  try {
    res.clearCookie("SessionID", { path: "/" });
    res.status(200).send({ message: "Successfully Logout" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-logout)`);
  }
});

// Get All Data From Institute Collections

app.get("/insdashboard", async (req, res) => {
  try {
    const institute = await InstituteAdmin.find({});
    res.status(200).send({ message: "All Institute List", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/insdashboard)`);
  }
});

app.get("/all/ins/limit", async (req, res) => {
  try {
    const institute = await InstituteAdmin.find({})
      .select("insName photoId insProfilePhoto status")
      .lean()
      .exec();
    res.status(200).send({ message: "Limit Ins", institute });
  } catch {}
});

app.get("/all/user/limit", async (req, res) => {
  try {
    const user = await User.find({})
      .select("userLegalName username photoId profilePhoto")
      .lean()
      .exec();
    res.status(200).send({ message: "Limit Ins", user });
  } catch {}
});

app.get("/all/staff/limit", async (req, res) => {
  try {
    const staff = await Staff.find({})
      .select(
        "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
      )
      .lean()
      .exec();
    res.status(200).send({ message: "Limit Ins", staff });
  } catch {}
});

app.get("/insdashboard/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({
        path: "posts",
        populate: {
          path: "comment",
          populate: {
            path: "institutes",
          },
        },
      })
      .populate("announcement")
      .populate("staff")
      .populate({
        path: "ApproveStaff",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "depart",
        populate: {
          path: "dHead",
        },
      })
      .populate("followers")
      .populate("following")
      .populate("classRooms")
      .populate("student")
      .populate("ApproveStudent")
      .populate({
        path: "saveInsPost",
        populate: {
          path: "institute",
        },
      })
      .populate({
        path: "posts",
        populate: {
          path: "insLike",
        },
      })
      .populate("userFollowersList")
      .populate({
        path: "posts",
        populate: {
          path: "insUserLike",
        },
      })
      .populate("financeDepart")
      .populate("sportDepart")
      .populate("addInstitute")
      .populate("addInstituteUser")
      .populate({
        path: "leave",
        populate: {
          path: "staff",
        },
      })
      .populate({
        path: "transfer",
        populate: {
          path: "staff",
        },
      })
      .populate({
        path: "chatAdmin",
      })
      .populate("joinChat")
      .populate({
        path: "studentComplaints",
        populate: {
          path: "student",
        },
      })
      .populate({
        path: "groupConversation",
      })
      .populate("idCardField")
      .populate("idCardBatch")
      .populate("AllUserReferral")
      .populate("AllInstituteReferral")
      .populate("instituteReferral")
      .populate({
        path: "supportIns",
        populate: {
          path: "institute",
        },
      })
      .populate({
        path: "posts",
        populate: {
          path: "comment",
          populate: {
            path: "instituteUser",
          },
        },
      })
      .populate("userReferral")
      .populate("insAdmissionAdmin");
    res.status(200).send({ message: "Your Institute", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/insdashboard/:id)`);
  }
});

// All Post From Institute

app.get("/insdashboard/:id/ins-post", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    res.render("post", { institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post)`
    );
  }
});

app.get("/insdashboard/:id/notify", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id })
      .populate({
        path: "iNotify",
        populate: {
          path: "notifyByPhoto",
          select: "photo profilePhoto",
        },
      })
      .populate({
        path: "iNotify",
        populate: {
          path: "notifyByInsPhoto",
          select: "photoId insProfilePhoto",
        },
      })
      .populate({
        path: "iNotify",
        populate: {
          path: "notifyByStaffPhoto",
          select: "photoId staffProfilePhoto",
        },
      })
      .populate({
        path: "iNotify",
        populate: {
          path: "notifyByStudentPhoto",
          select: "photoId studentProfilePhoto",
        },
      })
      .populate({
        path: "iNotify",
        populate: {
          path: "notifyByDepartPhoto",
          select: "photoId photo",
        },
      });
    res.status(200).send({ message: "Notification send", institute });
  } catch {}
});

app.get("/userdashboard/:id/notify", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .populate({
        path: "uNotify",
        populate: {
          path: "notifyByPhoto",
          select: "photoId profilePhoto",
        },
      })
      .populate({
        path: "uNotify",
        populate: {
          path: "notifyByInsPhoto",
          select: "photoId insProfilePhoto",
        },
      })
      .populate({
        path: "uNotify",
        populate: {
          path: "notifyByStaffPhoto",
          select: "photoId staffProfilePhoto",
        },
      })
      .populate({
        path: "uNotify",
        populate: {
          path: "notifyByStudentPhoto",
          select: "photoId studentProfilePhoto",
        },
      })
      .populate({
        path: "uNotify",
        populate: {
          path: "notifyByDepartPhoto",
          select: "photoId photo",
        },
      });
    res.status(200).send({ message: "Notification send", user });
  } catch {}
});

app.post("/read/notify/ins/:rid", async (req, res) => {
  try {
    const { rid } = req.params;
    const read = await Notification.findById({ _id: rid });
    read.notifyReadStatus = "Read";
    await read.save();
    res.status(200).send({ message: "updated" });
  } catch {}
});

app.post("/read/notify/user/:rid", async (req, res) => {
  try {
    const { rid } = req.params;
    const read = await Notification.findById({ _id: rid });
    read.notifyReadStatus = "Read";
    await read.save();
    res.status(200).send({ message: "updated" });
  } catch {}
});

app.delete("/ins/:id/notify/:nid/delete", async (req, res) => {
  try {
    const { id, nid } = req.params;
    const institute = await InstituteAdmin.findByIdAndUpdate(id, {
      $pull: { iNotify: nid },
    });
    const notify = await Notification.findByIdAndDelete({ _id: nid });
    res.status(200).send({ message: "Deleted" });
  } catch {}
});

app.post("/ins/:id/notify/:nid/hide", async (req, res) => {
  try {
    const { id, nid } = req.params;
    const notify = await Notification.findById({ _id: nid });
    notify.notifyVisibility = "hide";
    await notify.save();
    res.status(200).send({ message: "Hide" });
  } catch {}
});

app.delete("/user/:id/notify/:nid/delete", async (req, res) => {
  try {
    const { id, nid } = req.params;
    const user = await User.findByIdAndUpdate(id, { $pull: { uNotify: nid } });
    const notify = await Notification.findByIdAndDelete({ _id: nid });
    res.status(200).send({ message: "Deleted" });
  } catch {}
});

app.post("/user/:id/notify/:nid/hide", async (req, res) => {
  try {
    const { id, nid } = req.params;
    const notify = await Notification.findById({ _id: nid });
    notify.notifyVisibility = "hide";
    await notify.save();
    res.status(200).send({ message: "Hide" });
  } catch {}
});

// Institute Post Route
app.post(
  "/insdashboard/:id/ins-post",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
      const { id } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id });
      const post = new Post({ ...req.body });
      post.imageId = "1";
      institute.posts.push(post);
      post.institute = institute._id;
      await institute.save();
      await post.save();
      res.status(200).send({ message: "Your Institute", institute });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post)`
      );
    }
  }
);

app.post(
  "/insdashboard/:id/ins-post/image",
  isLoggedIn,
  isApproved,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const results = await uploadDocFile(file);
      const institute = await InstituteAdmin.findById({ _id: id });
      const post = new Post({ ...req.body });
      post.imageId = "0";
      post.CreateImage = results.Key;
      // console.log("Tis is institute : ", post);
      institute.posts.push(post);
      post.institute = institute._id;
      await institute.save();
      await post.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Your Institute", institute });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post/image)`
      );
    }
  }
);

app.get("/insdashboard/ins-post/images/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/ins-post/images/:key)`
    );
  }
});

////////////////////FOR THE VIDEO UPLOAD///////////////////////////
app.post(
  "/insdashboard/:id/ins-post/video",
  isLoggedIn,
  isApproved,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const results = await uploadVideo(file);
      const institute = await InstituteAdmin.findById({ _id: id });
      const post = new Post({ ...req.body });
      post.CreateVideo = results.Key;
      post.imageId = "1";
      institute.posts.push(post);
      post.institute = institute._id;
      await institute.save();
      await post.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Your Institute", institute });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post/video)`
      );
    }
  }
);

app.get("/insdashboard/ins-post/video/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/ins-post/video/:key)`
    );
  }
});

app.put(
  "/insdashboard/:id/ins-post/:uid/update",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, uid } = req.params;
      const { CreatePostStatus } = req.body;
      const post = await Post.findById({ _id: uid });
      post.CreatePostStatus = CreatePostStatus;
      await post.save();
      res.status(200).send({ message: "visibility change", post });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post/:uid/update)`
      );
    }
  }
);

app.delete("/insdashboard/:id/ins-post/:uid", isLoggedIn, async (req, res) => {
  try {
    const { id, uid } = req.params;
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { posts: uid } });
    await InstituteAdmin.findByIdAndUpdate(id, { $pull: { saveInsPost: uid } });
    await Post.findByIdAndDelete({ _id: uid });
    res.status(200).send({ message: "deleted Post" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-post/:uid)`
    );
  }
});

app.post("/ins/phone/info/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { insPhoneNumber } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insPhoneNumber = insPhoneNumber;
    await institute.save();
    res.status(200).send({ message: "Mobile No Updated", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/phone/info/:id)`);
  }
});

app.patch("/ins/personal/info/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
    await institute.save();
    res.status(200).send({ message: "Personal Info Updated", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/personal/info/:id)`
    );
  }
});

// Institute Display Data
app.post("/insprofiledisplay/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insOperatingAdmin = req.body.insOperatingAdmin;
    institute.insPrinciple = req.body.insPrinciple;
    institute.insStudentPresident = req.body.insStudentPresident;
    institute.insTrusty = req.body.insTrusty;
    institute.insAdminClerk = req.body.insAdminClerk;
    await institute.save();
    res
      .status(200)
      .send({ message: "Institute Profile Display Updated", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insprofiledisplay/:id)`
    );
  }
});

app.get("/allstaff", async (req, res) => {
  try {
    const staff = await Staff.find({});
    res.status(200).send({ message: "staff data", staff });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/allstaff)`);
  }
});

// Institute Profile About Data
////////////////////////////////////

app.post("/insprofileabout/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.insEstdDate = req.body.insEstdDate;
    institute.insAffiliated = req.body.insAffiliated;
    institute.insAchievement = req.body.insAchievement;
    institute.insEditableText = req.body.insEditableText;
    institute.insEditableTexts = req.body.insEditableTexts;
    await institute.save();
    res
      .status(200)
      .send({ message: "Institute Profile About Updated", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/insprofileabout/:id)`);
  }
});

app.get("/insprofileabout/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insprofileabout/photo/:key)`
    );
  }
});

app.post(
  "/insprofileabout/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const width = 200;
      const height = 200;
      const results = await uploadFile(file, width, height);
      const institute = await InstituteAdmin.findById({ _id: id });
      // console.log("This is file url: ", results);
      institute.insProfilePhoto = results.key;
      institute.photoId = "0";

      await institute.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Successfully photo change" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insprofileabout/photo/:id)`
      );
    }
  }
);

app.get("/insprofileabout/coverphoto/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insprofileabout/coverphoto/:key)`
    );
  }
});

app.post(
  "/insprofileabout/coverphoto/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const width = 900;
      const height = 260;
      const results = await uploadFile(file, width, height);
      const institute = await InstituteAdmin.findById({ _id: id });
      institute.insProfileCoverPhoto = results.key;
      institute.coverId = "0";
      await institute.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Successfully cover photo change" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/insprofileabout/coverphoto/:id)`
      );
    }
  }
);
//////////////////////////////////////////////
// Institute Announcements Data
app.post("/ins-announcement/:id", isLoggedIn, isApproved, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const announcements = await new InsAnnouncement({ ...req.body });
    institute.announcement.push(announcements);
    announcements.institute = institute;
    await institute.save();
    await announcements.save();
    res.status(200).send({ message: "Successfully Created", announcements });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-announcement/:id)`);
  }
});

app.post(
  "/ins/announcement/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const announcements = await InsAnnouncement.findById({ _id: sid });
      announcements.insAnnPhoto = results.key;
      await announcements.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/announcement/:id)`
      );
    }
  }
);

app.get("/ins/announcement/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/announcement/photo/:key)`
    );
  }
});

// Institute Announcement Details
app.get("/ins-announcement-detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await InsAnnouncement.findById({ _id: id }).populate(
      "institute"
    );
    res.status(200).send({ message: "Announcement Detail", announcement });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins-announcement-detail/:id)`
    );
  }
});

// Institute Data Departments
app.get("/insdashboard/:id/ins-department", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    res.render("Department", { institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/ins-department)`
    );
  }
});

app.post("/ins/:id/student/certificate", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { sid, studentReason, studentCertificateDate } = req.body;
    const student = await Student.findById({ _id: sid });
    student.studentReason = studentReason;
    student.studentCertificateDate = studentCertificateDate;
    await student.save();
    res.status(200).send({ message: "student certificate ready", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/student/certificate)`
    );
  }
});

app.post(
  "/ins/:id/student/leaving/certificate",
  isLoggedIn,
  async (req, res) => {
    try {
      const {
        sid,
        studentLeavingInsDate,
        studentLeavingStudy,
        studentLeavingRemark,
        studentLeavingBehaviour,
        studentLeavingReason,
        studentBookNo,
        studentCertificateNo,
      } = req.body;
      const student = await Student.findById({ _id: sid });
      student.studentLeavingReason = studentLeavingReason;
      student.studentLeavingInsDate = studentLeavingInsDate;
      student.studentLeavingStudy = studentLeavingStudy;
      student.studentLeavingBehaviour = studentLeavingBehaviour;
      student.studentLeavingRemark = studentLeavingRemark;
      student.studentBookNo = studentBookNo;
      student.studentCertificateNo = studentCertificateNo;
      await student.save();
      res
        .status(200)
        .send({ message: "student leaving certificate ready", student });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/student/leaving/certificate)`
      );
    }
  }
);

// Search Institute For Follow

app.post("/search/ins-dashboard", isLoggedIn, async (req, res) => {
  let name = req.body.insSearch.trim();
  try {
    const institute = await InstituteAdmin.findOne({ insName: name });
    res.status(200).send({ message: "Search Institute", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/search/ins-dashboard)`);
  }
});

// Institute Staff Joining

// app.post("/search/:uid/insdashboard/data/:id", async (req, res) => {
//   try {
//     const { uid, id } = req.params;
//     const institute = await InstituteAdmin.findById({ _id: id });
//     const user = await User.findById({ _id: uid });
//     // const staffData = await new Staff({ ...req.body });
//     institute.staff.push(staffData);
//     user.staff.push(staffData);
//     institute.joinedPost.push(user);
//     if (institute.userFollowersList.includes(uid)) {
//       res.status(200).send({ message: "You Already Following This Institute" });
//     } else {
//       user.userInstituteFollowing.push(id);
//       institute.userFollowersList.push(uid);
//     }
//     staffData.institute = institute;
//     staffData.user = user;
//     await user.save();
//     await institute.save();
//     await staffData.save();
//     res.status(200).send({ message: "staff code", institute, user, staffData });
//   } catch (e) {
//     console.log(
//       `SomeThing Went Wrong at this EndPoint(/search/:uid/insdashboard/data/:id)`,
//       e
//     );
//   }
// });

app.post("/search/:uid/insdashboard/data/:id", async (req, res) => {
  try {
    const { uid, id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: uid });
    // const staffData = await new Staff({ ...req.body });
    // institute.staff.push(staffData);
    // user.staff.push(staffData);
    // institute.joinedPost.push(user);
    // if (institute.userFollowersList.includes(uid)) {
    //   res.status(200).send({ message: "You Already Following This Institute" });
    // } else {
    //   user.userInstituteFollowing.push(id);
    //   institute.userFollowersList.push(uid);
    // }
    // staffData.institute = institute;
    // staffData.user = user;
    // await user.save();
    // await institute.save();
    // await staffData.save();
    res.status(200).send({ message: "staff code", institute, user, staffData });
  } catch (e) {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/:uid/insdashboard/data/:id)`,
      e
    );
  }
});

// Institute Staff Joining Form Details
app.post(
  "/search/insdashboard/:iid/staffdata/:sid",
  // isLoggedIn,
  async (req, res) => {
    try {
      const { uid, id } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id });
      const user = await User.findById({ _id: uid });
      const staff = await new Staff({ ...req.body });
      institute.staff.push(staff);
      user.staff.push(staff);
      institute.joinedPost.push(user);
      if (institute.userFollowersList.includes(uid)) {
        res
          .status(200)
          .send({ message: "You Already Following This Institute" });
      } else {
        user.userInstituteFollowing.push(id);
        institute.userFollowersList.push(uid);
      }
      staff.institute = institute;
      staff.user = user;
      await user.save();
      await institute.save();
      await staffData.save();
      const notify = await new Notification({});
      staff.photoId = "1";
      notify.notifyContent = `${staff.staffFirstName}${
        staff.staffMiddleName ? ` ${staff.staffMiddleName}` : ""
      } ${staff.staffLastName} has been applied for role of Staff`;
      notify.notifySender = sid;
      notify.notifyReceiever = institute._id;
      institute.iNotify.push(notify);
      notify.institute = institute;
      notify.notifyByStaffPhoto = staff;
      await staff.save();
      await institute.save();
      await notify.save();
      res.status(200).send({ message: "Staff Info", staff });
    } catch (e) {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/:sid)`,
        e
      );
    }
  }
);

app.get("/search/insdashboard/staffdata/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/photo/:key)`
    );
  }
});

app.post(
  "/search/insdashboard/staffdata/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const width = 200;
      const height = 200;
      const results = await uploadFile(file, width, height);
      const staff = await Staff.findById({ _id: sid });
      staff.staffProfilePhoto = results.key;
      staff.photoId = "0";
      await staff.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/photo/:id)`
      );
    }
  }
);

app.post(
  "/search/insdashboard/staffdata/doc/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const staff = await Staff.findById({ _id: sid });
      staff.staffDocuments = results.key;
      await staff.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/doc/:id)`
      );
    }
  }
);
app.post(
  "/search/insdashboard/staffdata/adh/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const staff = await Staff.findById({ _id: sid });
      staff.staffAadharCard = results.key;
      await staff.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/adh/:id)`
      );
    }
  }
);

// Institute Post For Like
app.post("/post/like", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findById({ _id: postId });
    const institute_session = req.session.institute;
    const user_session = req.session.user;
    if (institute_session) {
      if (
        post.insLike.length >= 1 &&
        post.insLike.includes(String(institute_session._id))
      ) {
        // console.log("You already liked it");
      } else {
        post.insLike.push(institute_session._id);
        await post.save();
        res.status(200).send({ message: "Added To Likes", post });
      }
    } else if (user_session) {
      if (
        post.insUserLike.length >= 1 &&
        post.insUserLike.includes(String(user_session._id))
      ) {
        // console.log("You already liked it user");
      } else {
        post.insUserLike.push(user_session._id);
        await post.save();
        // const allLike=[...post.insUserLike,...post.insLike]
        res.status(200).send({ message: "Added To Likes", post });
      }
    } else {
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/post/like)`);
  }
});

app.post("/ins/save/post", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findById({ _id: postId });
    const institute_session = req.session.institute;
    const user_session = req.session.user;
    if (institute_session) {
      const institute = await InstituteAdmin.findById({
        _id: institute_session._id,
      });
      institute.saveInsPost.push(post);
      await institute.save();
      res.status(200).send({ message: "Added To Favourites", institute });
    } else if (user_session) {
      const user = await User.findById({ _id: user_session._id });
      user.saveUserInsPost.push(post);
      await user.save();
      res.status(200).send({ message: "Added To Favourites", user });
    } else {
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/save/post)`);
  }
});

app.post("/ins/unsave/post", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findById({ _id: postId });
    const institute_session = req.session.institute;
    const user_session = req.session.user;
    if (institute_session) {
      const institute = await InstituteAdmin.findById({
        _id: institute_session._id,
      });
      institute.saveInsPost.pull(postId);
      await institute.save();
      res.status(200).send({ message: "Remove To Favourites", institute });
    } else if (user_session) {
      const user = await User.findById({ _id: user_session._id });
      user.saveUserInsPost.pull(postId);
      await user.save();
      console.log(user.saveUserInsPost);
      res.status(200).send({ message: "Remove To Favourites", user });
    } else {
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/unsave/post)`);
  }
});

app.post("/post/unlike", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const post = await Post.findById({ _id: postId });
    const institute_session = req.session.institute;
    const user_session = req.session.user;
    if (institute_session) {
      post.insLike.pull(institute_session._id);
      await post.save();
      res.status(200).send({ message: "Removed from Likes", post });
    } else if (user_session) {
      post.insUserLike.pull(user_session._id);
      await post.save();
      res.status(200).send({ message: "Removed from Likes", post });
    } else {
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/post/unlike)`);
  }
});

// Institute Post For Comments
app.post("/post/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById({ _id: id });
    const comment = await new Comment({ ...req.body });
    if (req.session.institute) {
      // comment.institutes.push(req.session.institute._id)
      comment.institutes = req.session.institute;
    } else {
      // comment.instituteUser.push(req.session.user._id)
      comment.instituteUser = req.session.user;
    }
    post.comment.push(comment);
    comment.post = post;
    await post.save();
    await comment.save();

    const newPostData = await Post.findById({ _id: id })
      .populate({
        path: "comment",
        populate: {
          path: "instituteUser",
          select: "userLegalName photoId profilePhoto",
        },
      })
      .populate({
        path: "comment",

        populate: {
          path: "institutes",
          select: "insName photoId insProfilePhoto",
        },
      });
    res
      .status(200)
      .send({ message: "Successfully Commented", post, newPostData });
  } catch (e) {}
});

// Institute For Staff Approval

app.get("/ins-data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate({
      path: "groupConversation",
    });
    res.send(institute);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-data/:id)`);
  }
});

app.post(
  "/ins/:id/staff/approve/:sid/user/:uid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, sid, uid } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id }).populate({
        path: "chatAdmin",
      });
      const chat = await InstituteChat.findById({
        _id: `${institute.chatAdmin._id}`,
      });
      const notify = await new Notification({});
      const staffs = await Staff.findById({ _id: sid });
      const user = await User.findById({ _id: uid });
      staffs.staffStatus = req.body.status;
      institute.ApproveStaff.push(staffs);
      institute.staff.pull(sid);
      staffs.staffROLLNO = institute.ApproveStaff.length;
      chat.users.push(user._id);
      staffs.joinChat = chat;
      user.joinChat.push(chat);
      notify.notifyContent = `Congrats ${staffs.staffFirstName} ${
        staffs.staffMiddleName ? `${staffs.staffMiddleName}` : ""
      } ${staffs.staffLastName} for joined as a staff at ${institute.insName}`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      institute.iNotify.push(notify);
      notify.institute = institute;
      user.uNotify.push(notify);
      notify.user = user;
      notify.notifyByStaffPhoto = staffs;
      await chat.save();
      await staffs.save();
      await institute.save();
      await user.save();
      await notify.save();
      res.status(200).send({
        message: `Welcome To The Institute ${staffs.staffFirstName} ${staffs.staffLastName}`,
        institute,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/approve/:sid)`
      );
    }
  }
);

app.post(
  "/ins/:id/staff/reject/:sid/user/:uid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, sid, uid } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id });
      const staffs = await Staff.findById({ _id: sid });
      const user = await User.findById({ _id: uid });
      staffs.staffStatus = req.body.status;
      // institute.ApproveStaff.push(staffs)
      institute.staff.pull(sid);
      notify.notifyContent = `your request for the role of staff is rejected contact at connect@qviple.com`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify);
      notify.user = user;
      notify.notifyPid = "1";
      notify.notifyPhoto = institute.insProfilePhoto;
      await institute.save();
      await staffs.save();
      await user.save();
      await notify.save();
      res.status(200).send({
        message: `Application Rejected ${staffs.staffFirstName} ${staffs.staffLastName}`,
        institute,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/reject/:sid)`
      );
    }
  }
);

// Institute Department Creation

app.post(
  "/ins/:id/new-department",
  // isLoggedIn,
  // isApproved,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { sid } = req.body;
      const staff = await Staff.findById({ _id: sid }).populate({
        path: "user",
      });
      const user = await User.findById({ _id: `${staff.user._id}` });
      const institute = await InstituteAdmin.findById({ _id: id });
      const department = await new Department({ ...req.body });
      const notify = await new Notification({});
      institute.depart.push(department);
      department.institute = institute;
      staff.staffDepartment.push(department);
      department.dHead = staff;
      notify.notifyContent = `you got the designation of ${department.dName} as Head`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify);
      notify.user = user;
      notify.notifyByInsPhoto = institute;
      await institute.save();
      await staff.save();
      await department.save();
      await user.save();
      await notify.save();
      res.status(200).send({
        message: "Successfully Created Department",
        department,
        staff,
        institute,
      });
    } catch (e) {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/new-department)`,
        e
      );
    }
  }
);

app.get("/departmentimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/departmentimage/photo/:key)`
    );
  }
});
app.post(
  "/departmentimage/photo/:did",
  upload.single("file"),
  async (req, res) => {
    try {
      const { did } = req.params;
      const department = await Department.findById({ _id: did });
      if (department.photo) {
        await deleteFile(department.photo);
      }
      const width = 200;
      const height = 200;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      department.photo = results.key;
      department.photoId = "0";
      await department.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/departmentimage/photo/:did)`
      );
    }
  }
);

app.get("/departmentimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/departmentimage/cover/:key)`
    );
  }
});
app.post(
  "/departmentimage/coverphoto/:did",
  upload.single("file"),
  async (req, res) => {
    try {
      const { did } = req.params;
      const department = await Department.findById({ _id: did });
      if (department.cover) {
        await deleteFile(department.cover);
      }
      const width = 820;
      const height = 250;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      department.cover = results.key;
      department.coverId = "0";
      await department.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/departmentimage/coverphoto/:did)`
      );
    }
  }
);

app.get("/classimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/classimage/photo/:key)`
    );
  }
});
app.post("/classimage/photo/:cid", upload.single("file"), async (req, res) => {
  try {
    const { cid } = req.params;
    const clas = await Class.findById({ _id: cid });
    if (clas.photo) {
      await deleteFile(clas.photo);
    }
    const width = 200;
    const height = 200;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    clas.photo = results.key;
    clas.photoId = "0";
    await clas.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/classimage/photo/:cid)`
    );
  }
});

app.get("/classimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/classimage/cover/:key)`
    );
  }
});
app.post(
  "/classimage/coverphoto/:cid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { cid } = req.params;
      const clas = await Class.findById({ _id: cid });
      if (clas.cover) {
        await deleteFile(clas.cover);
      }
      const width = 820;
      const height = 250;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      clas.cover = results.key;
      clas.coverId = "0";
      await clas.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/classimage/coverphoto/:cid)`
      );
    }
  }
);

////////////FOR THE FINANCE AND SPORTS/////////////////////////////

app.get("/financeimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/financeimage/photo/:key)`
    );
  }
});
app.post(
  "/financeimage/photo/:fid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { fid } = req.params;
      const finance = await Finance.findById({ _id: fid });
      if (finance.photo) {
        await deleteFile(finance.photo);
      }
      const width = 200;
      const height = 200;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      finance.photo = results.key;
      finance.photoId = "0";
      await finance.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/financeimage/photo/:fid)`
      );
    }
  }
);

app.get("/financeimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/financeimage/cover/:key)`
    );
  }
});
app.post(
  "/financeimage/coverphoto/:fid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { fid } = req.params;
      const finance = await Finance.findById({ _id: fid });
      if (finance.cover) {
        await deleteFile(finance.cover);
      }
      const width = 820;
      const height = 250;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      finance.cover = results.key;
      finance.coverId = "0";
      await finance.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/financeimage/coverphoto/:fid)`
      );
    }
  }
);
app.get("/sportimage/photo/:key", async (req, res) => {
  try {
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportimage/photo/:key)`
    );
  }
  const key = req.params.key;
  const readStream = getFileStream(key);
  readStream.pipe(res);
});
app.post("/sportimage/photo/:sid", upload.single("file"), async (req, res) => {
  try {
    const { sid } = req.params;
    const sport = await Sport.findById({ _id: sid });
    if (sport.photo) {
      await deleteFile(sport.photo);
    }
    const width = 200;
    const height = 200;
    const file = req.file;
    const results = await uploadFile(file, width, height);
    sport.photo = results.key;
    sport.photoId = "0";
    await sport.save();
    await unlinkFile(file.path);
    res.status(201).send({ message: "updated photo" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportimage/photo/:sid)`
    );
  }
});

app.get("/sportimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportimage/cover/:key)`
    );
  }
});
app.post(
  "/sportimage/coverphoto/:sid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { sid } = req.params;
      const sport = await Sport.findById({ _id: sid });
      if (sport.cover) {
        await deleteFile(sport.cover);
      }
      const width = 820;
      const height = 250;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      sport.cover = results.key;
      sport.coverId = "0";
      await sport.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/sportimage/coverphoto/:sid)`
      );
    }
  }
);
app.get("/sportclassimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportclassimage/photo/:key)`
    );
  }
});
app.post(
  "/sportclassimage/photo/:scid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { scid } = req.params;
      const sportClass = await SportClass.findById({ _id: scid });
      if (sportClass.photo) {
        await deleteFile(sportClass.photo);
      }
      const width = 200;
      const height = 200;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      sportClass.photo = results.key;
      sportClass.photoId = "0";
      await sportClass.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/sportclassimage/photo/:scid)`
      );
    }
  }
);

app.get("/sportclassimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sportclassimage/cover/:key)`
    );
  }
});
app.post(
  "/sportclassimage/coverphoto/:scid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { scid } = req.params;
      const sportClass = await SportClass.findById({ _id: scid });
      if (sportClass.cover) {
        await deleteFile(sportClass.cover);
      }
      const width = 820;
      const height = 250;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      sportClass.cover = results.key;
      sportClass.coverId = "0";
      await sportClass.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/sportclassimage/coverphoto/:scid)`
      );
    }
  }
);

// Institute Search for follow Institute Profile

app.post("/ins-search-profile", isLoggedIn, async (req, res) => {
  try {
    const institute = await InstituteAdmin.findOne({
      insName: req.body.insSearchProfile,
    });
    res.status(200).send({ message: "Search Institute Here", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins-search-profile)`);
  }
});

app.post("/ins/staff/code", async (req, res) => {
  try {
    const { InsId, code } = req.body;
    const institute = await InstituteAdmin.findById({ _id: InsId });
    institute.staffJoinCode = code;
    await institute.save();
    res.status(200).send({ message: "staff joining code", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/staff/code)`);
  }
});

app.post("/ins/class/code", async (req, res) => {
  try {
    const { classId, code, settings, startDate, studentRepresentative } =
      req.body;
    const classes = await Class.findById({ _id: classId });
    classes.classCode = code;
    classes.classStartDate = startDate.startDate;
    classes.studentRepresentative = studentRepresentative.cstudent;
    classes.finalReportsSettings = settings;
    await classes.save();
    res.status(200).send({ message: "class settings save", classes });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/class/code)`);
  }
});

// Institute To Institute Follow Handler

app.put("/follow-ins", async (req, res) => {
  try {
    const institutes = await InstituteAdmin.findById({
      _id: req.session.institute._id,
    });
    const sinstitute = await InstituteAdmin.findById({
      _id: req.body.followId,
    });

    if (institutes.following.includes(req.body.followId)) {
      res.status(200).send({ message: "You Already Following This Institute" });
    } else {
      const notify = await new Notification({});
      sinstitute.followers.push(req.session.institute._id);
      institutes.following.push(req.body.followId);
      notify.notifyContent = `${institutes.insName} started to following you`;
      notify.notifyReceiever = sinstitute._id;
      sinstitute.iNotify.push(notify);
      notify.institute = sinstitute;
      notify.notifyByInsPhoto = institutes;
      await institutes.save();
      await sinstitute.save();
      await notify.save();
      res.status(200).send({ message: "Following This Institute" });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/follow-ins)`);
  }
});

app.put("/unfollow-ins", async (req, res) => {
  try {
    const institutes = await InstituteAdmin.findById({
      _id: req.session.institute._id,
    });
    const sinstitute = await InstituteAdmin.findById({
      _id: req.body.followId,
    });

    if (institutes.following.includes(req.body.followId)) {
      sinstitute.followers.pull(req.session.institute._id);
      institutes.following.pull(req.body.followId);
      await sinstitute.save();
      await institutes.save();
      res.status(200).send({ message: "UnFollow This Institute" });
    } else {
      res.status(200).send({ message: "You Already UnFollow This Institute" });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/unfollow-ins)`);
  }
});

// Depreceated Currently No Use

// Institute Department Data

app.get("/department/:did", async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did })
      .populate({ path: "dHead" })
      .populate("batches")
      .populate({
        path: "departmentSelectBatch",
        populate: {
          path: "classroom",
          populate: {
            path: "ApproveStudent",
          },
        },
      })
      .populate({
        path: "userBatch",
      });

    // console.log(department);
    res.status(200).send({ message: "Department Data", department });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/department/:did)`);
  }
});

// Institute Batch in Department

app.post("/:did/batch-select/:bid", isLoggedIn, async (req, res) => {
  try {
    const { did, bid } = req.params;
    const department = await Department.findById({ _id: did });
    const batches = await Batch.findById({ _id: bid });
    department.departmentSelectBatch = batches._id;
    department.userBatch = batches._id;
    await department.save();
    res.status(200).send({ message: "Batch Detail Data", batches, department });
  } catch {}
});

// Institute Batch Class Data

app.get("/batch/class/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid }).populate("classroom");
    res.status(200).send({ message: "Classes Are here", batch });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/batch/class/:bid)`);
  }
});

// Institute New Batch Creation

app.post("/addbatch/:did/ins/:id", isLoggedIn, async (req, res) => {
  try {
    const { did, id } = req.params;
    // console.log(req.body);
    const department = await Department.findById({ _id: did });
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await new Batch({ ...req.body });
    department.batches.push(batch);
    batch.department = department;
    batch.institute = institute;
    // console.log(batch);
    await department.save();
    await batch.save();
    res.status(200).send({ message: "batch data", batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/addbatch/:did/ins/:id)`
    );
  }
});

app.get("/search/insdashboard/staffdata/adh/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/insdashboard/staffdata/adh/:key)`
    );
  }
});

app.get("/search/insdashboard/studentdata/adh/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/adh/:key)`
    );
  }
});

// / Master Class Creator Route
// Get all ClassMaster Data
app.get("/ins/:id/departmentmasterclass/:did", async (req, res) => {
  try {
    const { id, did } = req.params;
    const classMaster = await ClassMaster.find({ department: did });
    res.status(200).send({ message: "ClassMaster Are here", classMaster });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/departmentmasterclass/:did)`
    );
  }
});
// Create Master Class Data
app.post(
  "/ins/:id/departmentmasterclass/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, did } = req.params;
      const { classTitle, className } = req.body;
      const institute = await InstituteAdmin.findById({ _id: id });
      const department = await Department.findById({ _id: did });
      const classroomMaster = await new ClassMaster({
        className: className,
        classTitle: classTitle,
        institute: institute._id,
        department: did,
      });
      department.departmentClassMasters.push(classroomMaster);
      await classroomMaster.save();
      await department.save();
      res.status(200).send({
        message: "Successfully Created MasterClasses",
        classroomMaster,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/departmentmasterclass/:did/batch/:bid)`
      );
    }
  }
);

var classRandomCodeHandler = () => {
  const c_1 = Math.floor(Math.random() * 9) + 1;
  const c_2 = Math.floor(Math.random() * 9) + 1;
  const c_3 = Math.floor(Math.random() * 9) + 1;
  const c_4 = Math.floor(Math.random() * 9) + 1;
  var r_class_code = `${c_1}${c_2}${c_3}${c_4}`;
  return r_class_code;
};

var result = classRandomCodeHandler();

app.post("/ins/:id/department/:did/batch/:bid", async (req, res) => {
  try {
    const { id, did, bid } = req.params;
    const { sid, classTitle, className, classCode, classHeadTitle, mcId } =
      req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const masterClass = await ClassMaster.findById({ _id: mcId });
    const mCName = masterClass.className;
    const batch = await Batch.findById({ _id: bid });
    const staff = await Staff.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${staff.user._id}` });
    const depart = await Department.findById({ _id: did }).populate({
      path: "dHead",
    });
    if (institute.classCodeList.includes(`${result}`)) {
    } else {
      const notify = await new Notification({});
      institute.classCodeList.push(classCode);
      const classRoom = await new Class({
        masterClassName: mcId,
        className: mCName,
        classTitle: classTitle,
        classHeadTitle: classHeadTitle,
        classCode: `${result}`,
      });
      institute.classRooms.push(classRoom._id);
      classRoom.institute = institute._id;
      batch.classroom.push(classRoom._id);
      masterClass.classDivision.push(classRoom._id);
      if (String(depart.dHead._id) == String(staff._id)) {
      } else {
        depart.departmentChatGroup.push(staff._id);
      }
      classRoom.batch = batch._id;
      batch.batchStaff.push(staff._id);
      staff.batches = batch._id;
      staff.staffClass.push(classRoom._id);
      classRoom.classTeacher = staff._id;
      depart.class.push(classRoom._id);
      classRoom.department = depart._id;
      notify.notifyContent = `you got the designation of ${classRoom.className} as Class Teacher`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = institute._id;
      await Promise.all([
        institute.save(),
        batch.save(),
        masterClass.save(),
        staff.save(),
        classRoom.save(),
        depart.save(),
        user.save(),
        notify.save(),
      ]);
      res.status(200).send({
        message: "Successfully Created Class",
        classRoom,
      });
    }
  } catch (e) {}
});

// Get all Exam Data
app.get("/exam/:did/batch/:bid", async (req, res) => {
  try {
    const { did, bid } = req.params;
    console.log(bid);
    const exams = await Exam.find({ examForDepartment: did })
      .populate("examForClass")
      .populate("subject");
    // let exams = examsList.filter((e) => {
    //   return e.batch === bid;
    // });
    res.status(200).send({ message: "All Exam Data", exams });
  } catch {
    console.log("somethin went wrong /exam/:did/batch/:bid");
  }
});

// Get all Exam From Subject
app.get("/exam/subject/:suid", async (req, res) => {
  try {
    const { suid } = req.params;
    const subjectText = await Subject.findById({ _id: suid });
    let examList = subjectText.subjectExams;
    let subExamList = [];
    for (let i = 0; i < examList.length; i++) {
      const exam = await Exam.findById({ _id: examList[i] }).select(
        "_id examName examType examWeight examMode "
      );
      subExamList.push(exam);
    }
    res.status(200).send({ message: "Subject Exam List", subExamList });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/exam/subject/:suid)`);
  }
});

// Route For Exam Creation
app.post(
  "/department/:did/function/exam/creation/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { did, bid } = req.params;
      const { subject, examName, examType, examMode, examWeight } = req.body;

      if (examMode === "Offline") {
        const batch = await Batch.findById({ _id: bid });
        const depart = await Department.findById({ _id: did });

        const newExam = await new Exam({
          examName: examName,
          examType: examType,
          examMode: examMode,
          examWeight: examWeight,
          batch: batch._id,
          examForDepartment: depart._id,
          examForClass: [],
          subject: [],
        });

        for (let i = 0; i < subject.length; i++) {
          let d = subject[i].classId;
          let classCheck = newExam.examForClass.includes(d);
          if (classCheck === true) {
          } else {
            newExam.examForClass.push(d);
          }
        }

        for (let i = 0; i < subject.length; i++) {
          let d = await SubjectMaster.find({
            department: did,
            batch: bid,
            subjectName: subject[i].examSubName,
          });
          const subExamTime = new Date(subject[i].examSubDate);
          let hour = subject[i].examSubTime.slice(0, 2);
          let min = subject[i].examSubTime.slice(3, 5);
          subExamTime.setHours(hour, min, 00);
          let Sub = {
            subMasterId: d[0]._id,
            classId: subject[i].classId,
            subjectName: subject[i].examSubName,
            totalMarks: subject[i].examSubTotalMarks,
            examDate: subExamTime,
            subjectMarksStatus: "Not Updated",
          };
          newExam.subject.push(Sub);
        }

        batch.batchExam.push(newExam);
        depart.departmentExam.push(newExam);
        await newExam.save();
        await batch.save();
        await depart.save();

        // Push Exam In ClassRoom
        let studentList = [];
        let arry = [];
        for (let i = 0; i < newExam.examForClass.length; i++) {
          // Push Exam in ClassRoom
          const classRoomData = await Class.findById({
            _id: newExam.examForClass[i],
          }).populate({
            path: "subject",
            populate: {
              path: "subjectMasterName",
            },
          });

          classRoomData.classExam.push(newExam._id);
          classRoomData.save();

          // For Exam save in Subject
          let exSub = classRoomData.subject;
          let subAre = [];
          for (let j = 0; j < newExam.subject.length; j++) {
            let subjectObj = exSub.filter((e) => {
              return e.subjectName == newExam.subject[j].subjectName;
            });
            for (let k = 0; k < subjectObj.length; k++) {
              let d = subjectObj[k];
              subAre.push(d);
            }
          }
          for (let i = 0; i < subAre.length; i++) {
            arry.push(subAre[i]);
          }
          // find Class room Approve student and Push Exam in each student
          let stud = classRoomData.ApproveStudent;
          for (let i = 0; i < stud.length; i++) {
            let data = stud[i];
            studentList.push(data);
          }
        }
        // Exam Push in Student Model
        for (let i = 0; i < studentList.length; i++) {
          stuData = await Student.findById({ _id: studentList[i] });
          const user = await User.findById({ _id: stuData.user });
          const notify = await new Notification({});
          studDataUpdate = {
            examId: newExam._id,
            allSubjectMarksStatus: "Not Updated",
            examWeight: examWeight,
            subjectMarks: newExam.subject,
          };
          for (let i = 0; i < newExam.subject.length; i++) {
            const user = await User.findById({ _id: stuData.user });
            const notify = await new Notification({});
            notify.notifyContent = `Your ${
              newExam.examName
            } Exam is Shaduled on ${moment(newExam.subject[i].examDate).format(
              "DD-MMM-YYYY"
            )} at ${moment(newExam.subject[i].examDate).format(
              "LT"
            )} for subject ${newExam.subject[i].subjectName}.`;
            notify.notifySender = newExam.examForDepartment;
            notify.notifyByDepartPhoto = newExam.examForDepartment;
            notify.notifyReceiever = stuData._id;
            notify.user = stuData.user;
            user.uNotify.push(notify);
            await notify.save();
            await user.save();
          }

          stuData.studentMarks.push(studDataUpdate);
          await stuData.save();
        }
        // Exam Push in Subject Model
        for (let i = 0; i < arry.length; i++) {
          let subId = arry[i]._id;
          sub = await Subject.findById({ _id: subId });
          sub.subjectExams.push(newExam._id);
          sub.save();
        }
      } else {
        const batch = await Batch.findById({ _id: bid });
        const depart = await Department.findById({ _id: did });

        const newExam = await new Exam({
          examName: examName,
          examType: examType,
          examMode: examMode,
          examWeight: examWeight,
          batch: batch._id,
          examForDepartment: depart._id,
          examForClass: [],
          subject: [],
        });

        for (let i = 0; i < subject.length; i++) {
          let d = subject[i].classId;
          let classCheck = newExam.examForClass.includes(d);
          if (classCheck === true) {
          } else {
            newExam.examForClass.push(d);
          }
        }
        for (let i = 0; i < subject.length; i++) {
          let d = await SubjectMaster.find({
            department: did,
            batch: bid,
            subjectName: subject[i].examSubName,
          });
          const subExamTime = new Date(subject[i].examSubDate);
          let hour = subject[i].examSubTime.slice(0, 2);
          let min = subject[i].examSubTime.slice(3, 5);
          subExamTime.setHours(hour, min, 00);
          let Sub = {
            subMasterId: d[0]._id,
            classId: subject[i].classId,
            subjectName: subject[i].examSubName,
            totalMarks: subject[i].examSubTotalMarks,
            testSet: subject[i].examTestSetId,
            testSetSolTime: subject[i].examSubTestSolTime,
            examDate: subExamTime,
            subjectMarksStatus: "Not Updated",
          };
          newExam.subject.push(Sub);
        }

        batch.batchExam.push(newExam);
        depart.departmentExam.push(newExam);

        await newExam.save();
        await batch.save();
        await depart.save();

        // Push Exam In ClassRoom
        let studentList = [];
        let arry = [];
        for (let i = 0; i < newExam.examForClass.length; i++) {
          // Push Exam in ClassRoom
          const classRoomData = await Class.findById({
            _id: newExam.examForClass[i],
          }).populate({
            path: "subject",
            populate: {
              path: "subjectMasterName",
            },
          });
          classRoomData.classExam.push(newExam._id);
          await classRoomData.save();
          // For Exam save in Subject
          let exSub = classRoomData.subject;
          let subAre = [];
          let subFilter = newExam.subject.filter((ct) => {
            return (ct.classId = classRoomData._id);
          });
          for (let j = 0; j < subFilter.length; j++) {
            let subjectObj = exSub.filter((e) => {
              return e.subjectName == subFilter[j].subjectName;
            });
            for (let k = 0; k < subjectObj.length; k++) {
              let d = subjectObj[k];
              subAre.push(d);
            }
          }
          for (let i = 0; i < subAre.length; i++) {
            arry.push(subAre[i]);
          }
          // find Class room Approve student and Push Exam in each student
          let stud = classRoomData.ApproveStudent;
          for (let i = 0; i < stud.length; i++) {
            let data = stud[i];
            studentList.push(data);
          }
        }

        //  Schadule Exam For Test
        const SchaduleList = [];
        for (let i = 0; i < newExam.examForClass.length; i++) {
          const classText1 = await Class.findById({
            _id: newExam.examForClass[i],
          });
          let subFilter = newExam.subject.filter((ct) => {
            return (ct.classId = newExam.examForClass[i]);
          });
          for (let j = 0; j < subFilter.length; j++) {
            const examCurrentSub = subFilter[j];
            const scheduleTestSet = await new ScheduleTestSets({
              testSubjectMaster: examCurrentSub.subMasterId,
              testClassMaster: classText1.masterClassName,
              examId: newExam._id,
              testSet: examCurrentSub.testSet,
              testSetExamName: `${examName}-${examCurrentSub.subjectName}`,
              testSetSolTime: examCurrentSub.testSetSolTime,
              testTakenDate: examCurrentSub.examDate,
            });
            SchaduleList.push(scheduleTestSet);
            await scheduleTestSet.save();
          }
        }
        // Exam Push in Student Model
        for (let i = 0; i < studentList.length; i++) {
          stuData = await Student.findById({ _id: studentList[i] }).populate(
            "studentClass"
          );
          let subFilter = newExam.subject.filter((ct) => {
            return (ct.classId = stuData.studentClass._id);
          });
          studDataUpdate = {
            examId: newExam._id,
            allSubjectMarksStatus: "Not Updated",
            examWeight: examWeight,
            subjectMarks: subFilter,
          };

          let shadFilterClass = SchaduleList.filter((ct) => {
            return (ct.testClassMaster = stuData.studentClass.masterClassName);
          });
          for (let i = 0; i < subFilter.length; i++) {
            let examCurrentSub = subFilter[i];
            const user = await User.findById({ _id: stuData.user });
            const notify = await new Notification({});
            notify.notifyContent = `Your ${
              newExam.examName
            } Exam is Shaduled Online on ${moment(
              examCurrentSub.examDate
            ).format("DD-MMM-YYYY")} at ${moment(
              examCurrentSub.examDate
            ).format("LT")} for subject ${newExam.subject[i].subjectName}.`;
            notify.notifySender = newExam.examForDepartment;
            notify.notifyByDepartPhoto = newExam.examForDepartment;
            notify.notifyReceiever = stuData._id;
            notify.user = stuData.user;
            user.uNotify.push(notify);
            await notify.save();
            await user.save();
          }
          stuData.studentMarks.push(studDataUpdate);
          for (let j = 0; j < shadFilterClass.length; j++) {
            let testSetExam = {
              scheduleTestSet: shadFilterClass[j]._id,
              testSetType: "Exam",
              testExamId: newExam._id,
              testSetTime: shadFilterClass[j].testTakenDate,
              testQue: [],
            };
            stuData.testSet.push(testSetExam);
          }
          await stuData.save();
        }
        // Exam Push in Subject Model
        for (let i = 0; i < arry.length; i++) {
          let subId = arry[i]._id;
          sub = await Subject.findById({ _id: subId });
          sub.subjectExams.push(newExam._id);
          sub.save();
        }
      }
      res.status(200).send({ message: "Successfully Created Exam" });
    } catch {
      console.log(
        "something went wrong (/department/:did/function/exam/creation/batch/:bid)"
      );
    }
  }
);

// Code Fr Get Subject and class Details
// Code For Get Class Details
app.get("/class-detail/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classData = await Class.findById({ _id: cid })
      .populate("ApproveStudent")
      .populate("classExam")
      .populate("attendence")
      .populate("subject")
      .populate("institute");

    res.status(200).send({ message: " Subject & class Data", classData });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/class-detail/:cid)`);
  }
});

app.get("/subject-detail/:suid", async (req, res) => {
  try {
    const { suid } = req.params;
    const subData = await Subject.findById({ _id: suid }).populate("class");
    let classId = subData.class._id;
    classData = await Class.findById({ _id: classId }).populate(
      "ApproveStudent"
    );
    res
      .status(200)
      .send({ message: " Subject & class Data", subData, classData });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/subject-detail/:suid)`);
  }
});

app.get("/subject-detail/:suid", async (req, res) => {
  try {
    const { suid } = req.params;
    const subData = await Subject.findById({ _id: suid }).populate("class");
    let classId = subData.class._id;
    classData = await Class.findById({ _id: classId }).populate(
      "ApproveStudent"
    );
    res
      .status(200)
      .send({ message: " Subject & class Data", subData, classData });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/subject-detail/:suid)`);
  }
});

app.get("/subject-detail-student/:suid/exam/:eid", async (req, res) => {
  try {
    const { suid, eid } = req.params;
    const subjectData = await Subject.findById({ _id: suid }).populate("class");
    let classId = subjectData.class._id;
    classData = await Class.findById({ _id: classId }).populate(
      "ApproveStudent"
    );
    let stData = classData.ApproveStudent;

    function indIndex(arraytosearch, valuetosearch) {
      for (var i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i].examId == valuetosearch) {
          return i;
        }
      }
      return null;
    }
    function subIndex(arraytosearch, valuetosearch) {
      for (var i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i].subjectName == valuetosearch) {
          return i;
        }
      }
      return null;
    }
    const studentList = [];

    for (let i = 0; i < stData.length; i++) {
      let stExams = stData[i].studentMarks;
      let examIndex = indIndex(stExams, eid);
      let examSubList = stExams[examIndex].subjectMarks;
      let examSubIndex = subIndex(examSubList, subjectData.subjectName);
      let subtoUpdate = stExams[examIndex].subjectMarks[examSubIndex];

      let newSt = {
        _id: stData[i]._id,
        studentROLLNO: stData[i].studentROLLNO,
        studentFirstName: stData[i].studentFirstName,
        studentMiddleName: stData[i].studentMiddleName,
        studentLastName: stData[i].studentLastName,
        marksStatus: subtoUpdate.subjectMarksStatus,
        obtainMarks: subtoUpdate.obtainMarks,
      };
      studentList.push(newSt);
    }
    res.status(200).send({ message: " Subject & class Data", studentList });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/subject-detail-student/:suid/exam/:eid)`
    );
  }
});

// Marks Submit and Save of Student
// Marks Submit and Save of Student
app.post("/student/:sid/marks/:eid/:eSubid", async (req, res) => {
  try {
    const { sid, eid, eSubid } = req.params;
    const { obtainedMarks } = req.body;

    const student = await Student.findById({ _id: sid });
    const examData = await Exam.findById({ _id: eid });
    const subjectData = await Subject.findById({ _id: eSubid });

    let examListOfStudent = student.studentMarks;

    let exId = {};
    for (let i = 0; i < examListOfStudent.length; i++) {
      if (examListOfStudent[i].examId == eid) {
        exId = examListOfStudent[i];
      }
    }

    function indIndex(arraytosearch, valuetosearch) {
      for (var i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i].examId == valuetosearch) {
          return i;
        }
      }
      return null;
    }
    let examIndex = indIndex(examListOfStudent, eid);
    // // // Find Exam Subject in List of Exam Subjects

    let examSubList = examListOfStudent[examIndex].subjectMarks;

    function subIndex(arraytosearch, valuetosearch) {
      for (var i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i].subjectName == valuetosearch) {
          return i;
        }
      }
      return null;
    }

    let examSubIndex = subIndex(examSubList, subjectData.subjectName);

    student.studentMarks[examIndex].subjectMarks[examSubIndex].obtainMarks =
      obtainedMarks;
    student.studentMarks[examIndex].subjectMarks[
      examSubIndex
    ].subjectMarksStatus = "Updated";
    await student.save();

    // Check Exam Status To be Updated:-

    const studentData2 = await Student.findById({ _id: sid });

    examSubList2 = studentData2.studentMarks[examIndex].subjectMarks;
    subLisLength = examSubList2.length;
    filterExamSubListUpdate = examSubList2.filter((e) => {
      return e.subjectMarksStatus === "Updated";
    });
    filterListLength = filterExamSubListUpdate.length;

    if (subLisLength === filterListLength) {
      studentData2.studentMarks[examIndex].allSubjectMarksStatus = "Updated";
      studentData2.save();
    } else {
      console.log(`All Subject Status of Exam are Not Updated`);
    }

    // Update Final Report Status in Student Profile
    const studentData3 = await Student.findById({ _id: sid });

    examList2 = studentData2.studentMarks;
    exLisLength = examList2.length;
    filterExamSubListUpdate = examList2.filter((e) => {
      return e.allSubjectMarksStatus === "Updated";
    });
    filterListLength2 = filterExamSubListUpdate.length;
    if (exLisLength === filterListLength2) {
      studentData3.studentFinalReportFinalizedStatus = "Ready";
      studentData3.save();
    } else {
    }

    res.status(200).send({ message: "Successfully Marks Save" });
  } catch {
    console.log("some thing went wrong /student/:sid/marks/:eid/:eSubid");
  }
});

app.get("/class/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .populate({ path: "classTeacher" })
      .populate({
        path: "batch",
      })
      .populate("subject");
    res.status(200).send({ message: "create class data", classes });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/class/:cid)`);
  }
});

// Institute Subject Creation In Class
app.post(
  "/ins/:id/department/:did/batch/:bid/class/:cid/subject",
  async (req, res) => {
    try {
      const { id, cid, bid, did } = req.params;
      const { sid, subjectTitle, subjectName, msid } = req.body;
      const institute = await InstituteAdmin.findById({ _id: id });
      const classes = await Class.findById({ _id: cid }).populate({
        path: "classTeacher",
      });
      const subjectMaster = await SubjectMaster.findById({ _id: msid });
      const batch = await Batch.findById({ _id: bid });
      const staff = await Staff.findById({ _id: sid }).populate({
        path: "user",
      });
      const user = await User.findById({ _id: `${staff.user._id}` });
      const depart = await Department.findById({ _id: did }).populate({
        path: "dHead",
      });
      const notify = await new Notification({});
      const subject = await new Subject({
        subjectTitle: subjectTitle,
        subjectName: subjectMaster.subjectName,
        subjectMasterName: subjectMaster._id,
      });
      classes.subject.push(subject._id);
      subjectMaster.subjects.push(subject._id);
      subject.class = classes._id;
      if (String(classes.classTeacher._id) == String(staff._id)) {
      } else {
        batch.batchStaff.push(staff._id);
        staff.batches = batch._id;
      }
      if (String(depart.dHead._id) == String(staff._id)) {
      } else {
        depart.departmentChatGroup.push(staff._id);
      }
      staff.staffSubject.push(subject._id);
      subject.subjectTeacherName = staff._id;
      notify.notifyContent = `you got the designation of ${subject.subjectName} as Subject Teacher`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByInsPhoto = institute._id;
      await subjectMaster.save();
      await classes.save();
      await batch.save();
      await staff.save();
      await subject.save();
      await depart.save();
      await user.save();
      await notify.save();
      res.status(200).send({
        message: "Successfully Created Subject",
        subject,
      });
    } catch {}
  }
);

// Institute Student Joining Procedure

app.post(
  "/search/:uid/insdashboard/data/student/:id",
  isLoggedIn,
  async (req, res) => {
    try {
      const { uid, id } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id });
      const user = await User.findById({ _id: uid });
      const studentData = await new Student({ ...req.body });
      const classes = await Class.findOne({ classCode: req.body.studentCode });
      institute.student.push(studentData);
      studentData.institute = institute;
      user.student.push(studentData);
      institute.joinedPost.push(user);
      studentData.user = user;
      classes.student.push(studentData);
      studentData.studentClass = classes;
      await user.save();
      await institute.save();
      await classes.save();
      await studentData.save();
      res.status(200).send({
        message: "student code",
        institute,
        user,
        studentData,
        classes,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/:uid/insdashboard/data/student/:id)`
      );
    }
  }
);

app.post("/all/account/switch", async (req, res) => {
  try {
    const { userPhoneNumber } = req.body;
    const user = await User.find({ userPhoneNumber: userPhoneNumber });
    res.status(200).send({ message: "Switch Account Data", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/account/switch)`);
  }
});

app.post("/all/account/switch/user", async (req, res) => {
  try {
    const { userPhoneNumber } = req.body;
    const user = await User.find({ userPhoneNumber: userPhoneNumber });
    const institute = await InstituteAdmin.find({
      insPhoneNumber: userPhoneNumber,
    });
    res.status(200).send({ message: "Switch Account Data", user, institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/account/switch/user)`
    );
  }
});

app.post("/switchUser/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    const institute = await InstituteAdmin.findOne({ _id: id });
    if (user) {
      req.session.user = user;
      res.status(200).send({ message: "data", user });
    } else if (institute) {
      req.session.institute = institute;
      res.status(200).send({ message: "data", institute });
    } else {
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/switchUser/:id)`);
  }
});

app.post("/switchUser/ins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    const institute = await InstituteAdmin.findOne({ _id: id });
    if (user) {
      req.session.user = user;
      res.status(200).send({ message: "data", user });
    } else if (institute) {
      req.session.institute = institute;
      res.status(200).send({ message: "data", institute });
    } else {
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/switchUser/ins/:id)`);
  }
});

// Institute Student Joining Form

app.post(
  "/search/insdashboard/:iid/studentdata/:sid/class/:cid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { iid, sid, cid } = req.params;
      const student = await Student.findById({ _id: sid });
      const institute = await InstituteAdmin.findById({ _id: iid });
      const classes = await Class.findById({ _id: cid }).populate({
        path: "classTeacher",
        populate: {
          path: "user",
        },
      });
      const user = await User.findById({
        _id: `${classes.classTeacher.user._id}`,
      });
      const notify = await new Notification({});
      student.studentFirstName = req.body.studentFirstName;
      student.studentMiddleName = req.body.studentMiddleName;
      student.studentLastName = req.body.studentLastName;
      student.studentDOB = req.body.studentDOB;
      student.studentGender = req.body.studentGender;
      student.studentNationality = req.body.studentNationality;
      student.studentMTongue = req.body.studentMTongue;
      student.studentCast = req.body.studentCast;
      student.studentCastCategory = req.body.studentCastCategory;
      student.studentReligion = req.body.studentReligion;
      student.studentBirthPlace = req.body.studentBirthPlace;
      student.studentDistrict = req.body.studentDistrict;
      student.studentState = req.body.studentState;
      student.studentAddress = req.body.studentAddress;
      student.studentPhoneNumber = req.body.studentPhoneNumber;
      student.studentAadharNumber = req.body.studentAadharNumber;
      student.studentParentsName = req.body.studentParentsName;
      student.studentParentsPhoneNumber = req.body.studentParentsPhoneNumber;
      student.studentDocuments = req.body.studentDocuments;
      student.studentAadharCard = req.body.studentAadharCard;
      student.photoId = "1";
      notify.notifyContent = `${student.studentFirstName}${
        student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
      } ${student.studentLastName} has been applied as student of ${
        classes.className
      } in ${institute.insName}`;
      notify.notifySender = cid;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify);
      notify.user = user;
      notify.notifyByStudentPhoto = student;
      await student.save();
      await user.save();
      await notify.save();
      res.status(200).send({ message: "Student Info", student });
    } catch (e) {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/:sid)`
      );
    }
  }
);
app.get("/search/insdashboard/studentdata/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/photo/:key)`
    );
  }
});
app.post(
  "/search/insdashboard/studentdata/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const width = 200;
      const height = 200;
      const results = await uploadFile(file, width, height);
      const student = await Student.findById({ _id: sid });
      student.studentProfilePhoto = results.key;
      student.photoId = "0";

      await student.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/photo/:id)`
      );
    }
  }
);

app.post(
  "/search/insdashboard/studentdata/doc/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const student = await Student.findById({ _id: sid });
      student.studentDocuments = results.key;
      await student.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/doc/:id)`
      );
    }
  }
);

app.post(
  "/search/insdashboard/studentdata/adh/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const student = await Student.findById({ _id: sid });
      student.studentAadharCard = results.key;
      await student.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/search/insdashboard/studentdata/adh/:id)`
      );
    }
  }
);

var date = new Date();
var p_date = date.getDate();
var p_month = date.getMonth() + 1;
var p_year = date.getFullYear();
if (p_month <= 10) {
  p_month = `0${p_month}`;
}
var c_date = `${p_year}-${p_month}-${p_date}`;

// Institute Student Approval By Class Teacher

app.post(
  "/ins/:id/student/:cid/approve/:sid/depart/:did/batch/:bid",
  async (req, res) => {
    try {
      const { id, sid, cid, did, bid } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id });
      const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
      const student = await Student.findById({ _id: sid }).populate({
        path: "user",
      });
      const user = await User.findById({ _id: `${student.user._id}` });
      const classes = await Class.findById({ _id: cid });
      const depart = await Department.findById({ _id: did });
      const batch = await Batch.findById({ _id: bid });
      const notify = await new Notification({});
      student.studentStatus = req.body.status;
      institute.ApproveStudent.push(student);
      admins.studentCount += 1;
      institute.student.pull(sid);
      if (c_date <= institute.insFreeLastDate) {
        institute.insFreeCredit = institute.insFreeCredit + 1;
      }
      classes.ApproveStudent.push(student);
      classes.studentCount += 1;
      classes.student.pull(sid);
      student.studentGRNO = classes.ApproveStudent.length;
      student.studentROLLNO = classes.ApproveStudent.length;
      depart.ApproveStudent.push(student);
      depart.studentCount += 1;
      student.department = depart;
      batch.ApproveStudent.push(student);
      student.batches = batch;
      notify.notifyContent = `${student.studentFirstName}${
        student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
      } ${student.studentLastName} joined as a Student of Class ${
        classes.className
      } of ${batch.batchName}`;
      notify.notifySender = cid;
      notify.notifyReceiever = user._id;
      institute.iNotify.push(notify);
      notify.institute = institute;
      user.uNotify.push(notify);
      notify.user = user;
      notify.notifyByStudentPhoto = student;
      await Promise.all([
        admins.save(),
        classes.save(),
        depart.save(),
        batch.save(),
        student.save(),
        institute.save(),
        user.save(),
        notify.save(),
      ]);
      res.status(200).send({
        message: `Welcome To The Institute ${student.studentFirstName} ${student.studentLastName}`,
        classes: classes._id,
      });
    } catch (e) {
      console.log(e);
    }
  }
);

app.post("/ins/:id/student/:cid/reject/:sid", isLoggedIn, async (req, res) => {
  try {
    const { id, sid, cid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const student = await Student.findById({ _id: sid });
    const classes = await Class.findById({ _id: cid });
    student.studentStatus = req.body.status;
    institute.student.pull(sid);
    classes.student.pull(sid);
    await Promise.all([institute.save(), classes.save(), student.save()]);
    res.status(200).send({
      message: `Application Rejected ${student.studentFirstName} ${student.studentLastName}`,
      classes: classes._id,
    });
  } catch (e) {
    console.log(e);
  }
});

app.post("/student/report/finilized/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { examList, marksTotal, stBehaviourData } = req.body;
    try {
      const student = await Student.findById({ _id: id });

      const finalreport = {
        finalObtainTotal: marksTotal.finalExToObtain,
        finalMarksTotalTotal: marksTotal.finalExToTo,
        OtherMarksObtainTotal: marksTotal.otherExObtain,
        OtherMarksTotalTotal: marksTotal.otherExToTo,
        FinalObtainMarksTotal: marksTotal.finalToObtain,
        FinalTotalMarksTotal: marksTotal.finalToTo,
        SubjectWiseMarks: [],
      };

      for (let i = 0; i < examList.length; i++) {
        let finalSubRe = {
          subName: examList[i].subName,
          finalExamObtain: examList[i].finalExamObtainMarks,
          finalExamTotal: examList[i].finalExamTotalMarks,
          otherExamObtain: examList[i].OtherExamTotalObtainMarks,
          otherExamTotal: examList[i].OtherExamTotalMarks,
          finalObtainTotal: examList[i].finalObtainTotal,
          finalTotalTotal: examList[i].finalTotalTotal,
        };
        // console.log(finalSubRe)
        finalreport.SubjectWiseMarks.push(finalSubRe);
      }
      // console.log(finalreport)
      student.studentFinalReportData = finalreport;
      (student.studentFinalReportFinalizedStatus = "Finalized"),
        await student.save();
      res
        .status(200)
        .send({ message: "Student Final Report is Ready.", student });
    } catch {}
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/report/finilized/:id)`
    );
  }
});

// Get Batch Details class and Subject data
app.get("/ins/:id/allclassdata/:did/batch/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid })
      .populate({
        path: "subjectMasters",
        populate: {
          path: "subjects",
        },
      })
      .populate({
        path: "classroom",
      });
    let classList = [];
    let subjectList = [];
    for (var i = 0; i < batch.subjectMasters.length; i++) {
      let subMaster = {
        _id: batch.subjectMasters[i]._id,
        subjectName: batch.subjectMasters[i].subjectName,
      };
      subjectList.push(subMaster);
    }
    for (var i = 0; i < batch.classroom.length; i++) {
      if (batch.classroom[i].classStatus === "UnLocked") {
        let classData = {
          _id: batch.classroom[i]._id,
          className: `${batch.classroom[i].className} - ${batch.classroom[i].classTitle}`,
          classMaster: batch.classroom[i].masterClassName,
        };
        classList.push(classData);
      }
    }
    const batchData = {
      classList: classList,
      subjectList: subjectList,
    };

    res.status(200).send({
      message: "Batch Details class and Subject data",
      batchData,
    });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/allclassdata/:did/batch/:bid)`
    );
  }
});

// get all Master Subject Data

app.get("/ins/:id/departmentmastersubject/:did", async (req, res) => {
  try {
    const { id, did } = req.params;
    const subjectMaster = await SubjectMaster.find({ department: did });
    res.status(200).send({ message: "SubjectMaster Are here", subjectMaster });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/departmentmastersubject/:did)`
    );
  }
});

// Create Master Subject data
app.post(
  "/ins/:id/departmentmastersubject/:did/batch/:bid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, did, bid } = req.params;
      const { subjectName } = req.body;
      const institute = await InstituteAdmin.findById({ _id: id });
      const departmentData = await Department.findById({ _id: did });
      const batchData = await Batch.findById({ _id: bid });
      const subjectMaster = await new SubjectMaster({
        subjectName: subjectName,
        institute: institute._id,
        batch: bid,
        department: did,
      });
      await departmentData.departmentSubjectMasters.push(subjectMaster._id);
      await batchData.subjectMasters.push(subjectMaster._id);
      await Promise.all([
        departmentData.save(),
        batchData.save(),
        subjectMaster.save(),
      ]);
      res.status(200).send({
        message: "Successfully Created Master Subject",
        subjectMaster,
      });
    } catch {}
  }
);

app.get("/:id/roleData/:rid", async (req, res) => {
  const { id, rid } = req.params;
  try {
    const staff = await Staff.findOne({ _id: rid });
    const student = await Student.findOne({ _id: rid });
    if (staff) {
      res.status(200).send({ message: "staff", staff });
    } else if (student) {
      res.status(200).send({ message: "student", student });
    } else {
      res.status(200).send({ message: "error" });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/:id/roleData/:rid`);
  }
});

// Get all Exam From a Class

app.get("/exam/class/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const classroom = await Class.findById({ _id: cid }).populate({
      path: "classExam",
    });
    const classExamList = classroom.classExam;

    res.status(200).send({ message: "Classroom Exam List", classExamList });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/exam/class/:cid)`);
  }
});

app.get("/exam/:eid", async (req, res) => {
  try {
    const { eid } = req.params;
    const exam = await Exam.findById({ _id: eid }).populate({
      path: "examForClass",
    });
    res.status(200).send({ message: " exam data", exam });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/exam/:eid)`);
  }
});

// Staff Data

app.get("/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById({ _id: id })
      .populate("user")
      .populate("institute");
    res.status(200).send({ message: "Staff Data To Member", staff });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staff/:id)`);
  }
});

app.get("/student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById({ _id: id })
      .populate("user")
      .populate("institute");
    res.status(200).send({ message: "Student Data To Member", student });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/student/:id)`);
  }
});

// for finding Staff By Id

app.post("/:id/staffdetaildata", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;
    try {
      const staff = await Staff.findById({ _id: staffId });
      const user = await User.findById({ _id: id });
      const role = await new Role({
        userSelectStaffRole: staff,
      });
      user.role = role;
      await role.save();
      await user.save();
      res.status(200).send({ message: "Staff Detail Data", staff, role });
    } catch {}
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/:id/staffdetaildata)`);
  }
});

// Student Detail Data

app.post("/:id/studentdetaildata", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const student = await Student.findById({ _id: studentId });
    const user = await User.findById({ _id: id });
    const role = await new Role({
      userSelectStudentRole: student,
    });
    user.role = role;
    await role.save();
    await user.save();
    res.status(200).send({ message: "Student Detail Data", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/:id/studentdetaildata)`
    );
  }
});

app.get("/studentdetaildata/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById({ _id: id })
      .populate("studentFee")
      .populate({
        path: "studentMarks",
        populate: {
          path: "subjectMarks",
          populate: {
            path: "subMasterId",
          },
        },
      })
      .populate({
        path: "studentMarks",
        populate: {
          path: "examId",
        },
      })
      .populate("studentClass")
      .populate("attendDate")
      .populate("studentBehaviourStatus");

    const behaviour = await Behaviour.find({ studentName: id });
    res
      .status(200)
      .send({ message: "Student Detail Data", student, behaviour });
  } catch {
    console.log("some thing went wrong /studentdetaildata/:id ");
  }
});
// Student Status Updated

app.post("/student/status", isLoggedIn, async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById({ _id: studentId })
      .populate("studentFee")
      .populate("offlineFeeList");
    res.status(200).send({ message: "Student Detail Data", student });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/student/status)`);
  }
});

// Staff Designation Data in members tab at User
// Staff Designation Data in members tab at User
app.get("/staffdesignationdata/:sid", isLoggedIn, async (req, res) => {
  try {
    const { sid } = req.params;
    const staff = await Staff.findById({ _id: sid })
      .populate("staffDepartment")
      .populate({
        path: "staffClass",
        populate: {
          path: "batch",
        },
      })
      .populate({
        path: "staffAdmissionAdmin",
        populate: {
          path: "institute",
          populate: {
            path: "depart",
            populate: {
              path: "batches",
            },
          },
        },
      })
      .populate({
        path: "staffSubject",
        populate: {
          path: "class",
          populate: {
            path: "batch",
          },
        },
      })
      .populate({
        path: "institute",
        // populate: {
        //   path: "batch",
        // },
      })
      .populate({
        path: "elearning",
      })
      .populate({
        path: "library",
      })
      .populate("financeDepartment")
      .populate("sportDepartment")
      .populate("staffSportClass")
      // .populate("staffAdmissionAdmin")
      .populate({
        path: "staffAdmissionAdmin",
        populate: {
          path: "adAdminName",
        },
      });
    res.status(200).send({ message: "Staff Designation Data", staff });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staffdesignationdata/:sid)`
    );
  }
});

// Student Designation Data in members Tab at users

app.get("/studentdesignationdata/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const student = await Student.findById({ _id: sid })
      .populate({
        path: "studentClass",
        populate: {
          path: "ApproveStudent",
        },
      })
      .populate({
        path: "studentClass",
        populate: {
          path: "batch",
        },
      })
      .populate({
        path: "institute",
      })
      .populate({
        path: "user",
      })
      .populate("checklist")
      .populate({
        path: "department",
        populate: {
          path: "fees",
        },
      })
      .populate({
        path: "studentMarks",
        populate: {
          path: "examId",
        },
      })
      .populate("studentFee")
      .populate({
        path: "department",
        populate: {
          path: "checklists",
        },
      })
      .populate({
        path: "sportEvent",
        populate: {
          path: "sportEventMatch",
          populate: {
            path: "sportEventMatchClass",
            populate: {
              path: "sportStudent",
            },
          },
        },
      })
      .populate("complaints");
    // .populate('studentAttendence')
    res.status(200).send({ message: "Student Designation Data", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/studentdesignationdata/:sid)`
    );
  }
});

// Staff Department Info

app.get("/staffdepartment/:did", async (req, res) => {
  try {
    const { did } = req.params;
    const department = await Department.findById({ _id: did })
      .populate("batches")
      .populate({
        path: "dHead",
      })
      .populate({
        path: "institute",
      })
      .populate("checklists")
      .populate({ path: "userBatch", populate: "classroom" })
      .populate({
        path: "studentComplaint",
        populate: {
          path: "student",
        },
      });
    res.status(200).send({ message: "Department Profile Data", department });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staffdepartment/:did)`);
  }
});

//Staff Class Info
app.get("/staffclass/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .populate("subject")
      .populate("student")
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "onlineFeeList",
        },
      })
      .populate({
        path: "institute",
        populate: {
          path: "financeDepart",
          populate: {
            path: "classRoom",
          },
        },
      })
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "offlineFeeList",
        },
      })
      .populate({
        path: "batch",
      })
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "onlineCheckList",
        },
      })
      .populate({
        path: "classTeacher",
      })
      .populate("fee")
      .populate("department")
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "offlineCheckList",
        },
      })
      .populate("receieveFee")
      .populate("checklist")
      .populate("submitFee")
      .populate({
        path: "studentComplaint",
        populate: {
          path: "student",
        },
      })
      .populate({
        path: "studentLeave",
        populate: {
          path: "student",
        },
      })
      .populate({
        path: "studentTransfer",
        populate: {
          path: "student",
        },
      })
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "exemptFeeList",
        },
      });
    res.status(200).send({ message: "Class Profile Data", classes });
  } catch (e) {}
});

app.get("/staffclass/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const classes = await Class.findById({ _id: sid })
      .populate("subject")
      .populate("student")
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "onlineFeeList",
        },
      })
      .populate({
        path: "institute",
        populate: {
          path: "financeDepart",
          populate: {
            path: "classRoom",
          },
        },
      })
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "offlineFeeList",
        },
      })
      .populate({
        path: "batch",
      })
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "onlineCheckList",
        },
      })
      .populate({
        path: "classTeacher",
      })
      .populate("fee")
      .populate("department")
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "offlineCheckList",
        },
      })
      .populate("receieveFee")
      .populate("checklist")
      .populate("submitFee")
      .populate({
        path: "studentComplaint",
        populate: {
          path: "student",
        },
      })
      .populate({
        path: "studentLeave",
        populate: {
          path: "student",
        },
      })
      .populate({
        path: "studentTransfer",
        populate: {
          path: "student",
        },
      });
    res.status(200).send({ message: "Class Profile Data", classes });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staffclass/:sid)`);
  }
});

// Staff Subject Info

app.get("/staffsubject/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const subject = await Subject.findById({ _id: sid })
      .populate({
        path: "subjectTeacherName",
      })
      .populate({
        path: "class",
      })
      .populate({
        path: "institute",
      });
    res.status(200).send({ message: "Subject Profile Data", subject });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staffsubject/:sid)`);
  }
});

// Staff Department Batch Data

app.post("/:did/department/batch", isLoggedIn, async (req, res) => {
  try {
    const { did } = req.params;
    const { BatchId } = req.body;
    const batch = await Batch.findById({ _id: BatchId })
      .populate("classroom")
      .populate("batchStaff");
    const department = await Department.findById({ _id: did });
    department.userBatch = batch;
    await department.save();
    res.status(200).send({ message: "Batch Class Data", batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/:did/department/batch)`
    );
  }
});

// Staff Batch Detail Data
app.get("/batch-detail/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid })
      .populate("classroom")
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "batches",
        },
      })
      .populate("batchStaff")
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "department",
        },
      })
      .populate({
        path: "institute",
      })
      .populate({
        path: "ApproveStudent",
        populate: {
          path: "studentClass",
        },
      });
    res.status(200).send({ message: "Batch Data", batch });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/batch-detail/:bid)`);
  }
});

// ================ Batch Unlock Vaibhav ===================

app.post("/batch-unlock/:bid", isLoggedIn, async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid });
    batch.batchStatus = "UnLocked";
    await batch
      .save()(res)
      .status(200)
      .send({ message: "Batch Successfully Unlocked" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/batch-unlock/:bid)`);
  }
});

// ================= Identical Batch vaibhav ================

app.post("/add-identical-batch/:did/ins/:id", isLoggedIn, async (req, res) => {
  try {
    const { did, id } = req.params;
    const { batchData } = req.body;
    const department = await Department.findById({ _id: did });
    const institute = await InstituteAdmin.findById({ _id: id });
    const BatchText = await Batch.findById({ _id: batchData.identicalBatch })
      .populate({
        path: "classroom",
      })
      .populate({
        path: "subjectMasters",
      });
    const batchTextNew = await new Batch({
      batchName: batchData.batchName,
    });
    const StaffRandomCodeHandler = () => {
      let rand1 = Math.floor(Math.random() * 5) + 1;
      let rand2 = Math.floor(Math.random() * 5) + 1;
      let rand3 = Math.floor(Math.random() * 5) + 1;
      let rand4 = Math.floor(Math.random() * 5) + 1;
      let rand5 = Math.floor(Math.random() * 5) + 1;
      return `${rand1}${rand2}${rand3}${rand4}${rand5}`;
    };
    for (let i = 0; i < BatchText.classroom.length; i++) {
      const classroomOld = await Class.findById({
        _id: BatchText.classroom[i]._id,
      }).populate({
        path: "subject",
      });
      const masterClass = await ClassMaster.findById({
        _id: classroomOld.masterClassName,
      });
      const staffClass01 = await Staff.findById({
        _id: classroomOld.classTeacher,
      });
      const classRoom = await new Class({
        masterClassName: classroomOld.masterClassName,
        className: classroomOld.className,
        classTitle: classroomOld.classTitle,
        classHeadTitle: classroomOld.classHeadTitle,
        classCode: `C-${StaffRandomCodeHandler()}`,
      });
      institute.classRooms.push(classRoom);
      classRoom.institute = institute;
      batchTextNew.classroom.push(classRoom);
      masterClass.classDivision.push(classRoom);
      if (String(department.dHead._id) == String(staffClass01._id)) {
      } else {
        department.departmentChatGroup.push(staffClass01);
      }
      classRoom.batch = batchTextNew;
      batchTextNew.batchStaff.push(staffClass01);
      staffClass01.batches = batchTextNew;
      staffClass01.staffClass.push(classRoom);
      classRoom.classTeacher = staffClass01;
      department.class.push(classRoom);
      classRoom.department = department;
      for (let j = 0; j < classroomOld.subject.length; j++) {
        const subjectOld = await Subject.findById({
          _id: classroomOld.subject[j]._id,
        });
        const subjectMaster = await SubjectMaster.findById({
          _id: subjectOld.subjectMasterName,
        });
        const staffSub01 = await Staff.findById({
          _id: subjectOld.subjectTeacherName,
        });
        const subject = await new Subject({
          subjectTitle: subjectOld.subjectTitle,
          subjectName: subjectOld.subjectName,
          subjectMasterName: subjectOld.subjectMasterName,
        });
        classRoom.subject.push(subject);
        subjectMaster.subjects.push(subject);
        subject.class = classRoom;
        if (String(classRoom.classTeacher) == String(staffSub01._id)) {
        } else {
          batchTextNew.batchStaff.push(staffSub01);
          staffSub01.batches = batchTextNew;
        }
        if (String(department.dHead._id) == String(staffSub01._id)) {
        } else {
          department.departmentChatGroup.push(staffSub01);
        }
        staffSub01.staffSubject.push(subject);
        subject.subjectTeacherName = staffSub01;
        await subjectMaster.save();
        await classRoom.save();
        await staffSub01.save();
        await subject.save();
        await department.save();
      }
      await staffClass01.save();
      await masterClass.save();
      await classRoom.save();
    }
    department.batches.push(batchTextNew);
    batchTextNew.department = department;
    batchTextNew.institute = institute;
    await department.save();
    await batchTextNew.save();
    res.status(200).send({ message: "Identical Batch Created Successfully" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/add-identical-batch/:did/ins/:id)`
    );
  }
});

// Staff Batch Class Data

app.post("/batch/class", isLoggedIn, async (req, res) => {
  try {
    const { ClassId } = req.body;
    const classes = await Class.findById({ _id: ClassId }).populate("subject");
    res.status(200).send({ message: "Class Data", classes });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/batch/class)`);
  }
});

app.get("/holiday/:did", async (req, res) => {
  try {
    const { did } = req.params;
    const depart = await Department.findById({ _id: did }).populate("holiday");
    res.status(200).send({ message: "holiday data", depart });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/holiday/:did)`);
  }
});

// Staff Class Info Updated at Users End

app.post("/staff/class-info/:cid", isLoggedIn, async (req, res) => {
  try {
    const { cid } = req.params;
    const { classAbout, classDisplayPerson, classStudentTotal } = req.body;
    const classInfo = await Class.findById({ _id: cid });
    classInfo.classAbout = classAbout;
    classInfo.classDisplayPerson = classDisplayPerson;
    classInfo.classStudentTotal = classStudentTotal;
    await classInfo.save();
    res.status(200).send({ message: "Class Info Updated", classInfo });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/class-info/:cid)`
    );
  }
});

// Staff Checklist in Department Updated

app.post("/department-class/fee/:did", async (req, res) => {
  try {
    const { did } = req.params;
    const { ClassId, feeName, feeAmount, feeDate } = req.body;
    const department = await Department.findById({ _id: did }).populate(
      "ApproveStudent"
    );
    var feeData = await new Fees({
      feeName: feeName,
      feeAmount: feeAmount,
      feeDate: feeDate,
    });
    department.fees.push(feeData);
    feeData.feeDepartment = department;
    await department.save();
    for (let i = 0; i < ClassId.length; i++) {
      var classes = await Class.findById({ _id: ClassId[i].classId });
      classes.fee.push(feeData);
      feeData.feeClass = classes;
      await classes.save();
      await feeData.save();
    }
    for (let i = 0; i < department.ApproveStudent.length; i++) {
      var student = await Student.findById({
        _id: department.ApproveStudent[i]._id,
      }).populate({
        path: "user",
      });
      const user = await User.findById({ _id: `${student.user._id}` });
      var notify = await new Notification({});
      notify.notifyContent = `New ${feeData.feeName} (fee) has been created. check your member's Tab`;
      notify.notifySender = did;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify);
      notify.user = user;
      notify.notifyByDepartPhoto = department;
      await user.save();
      await notify.save();
    }
    res
      .status(200)
      .send({ message: "Fees Raised", department, classes, feeData });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department-class/fee/:did)`
    );
  }
});

app.get("/fees/:feesId", isLoggedIn, async (req, res) => {
  try {
    const { feesId } = req.params;
    const feeData = await Fees.findById({ _id: feesId })
      .populate({
        path: "feeStudent",
      })
      .populate("studentsList")
      .populate({
        path: "feeDepartment",
      })
      .populate("offlineStudentsList")
      .populate("studentExemptList");
    res.status(200).send({ message: "Fees Data", feeData });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/fees/:feesId)`);
  }
});

app.post("/class/:cid/student/:sid/fee/:id", isLoggedIn, async (req, res) => {
  try {
    const { cid, sid, id } = req.params;
    const { status } = req.body;
    const classes = await Class.findById({ _id: cid });
    const student = await Student.findById({ _id: sid });
    const fData = await Fees.findById({ _id: id });
    if (
      fData.studentsList.length >= 1 &&
      fData.studentsList.includes(String(student._id))
    ) {
      res.status(200).send({
        message: `${student.studentFirstName} paid the ${fData.feeName}`,
      });
    } else {
      try {
        student.studentFee.push(fData);
        fData.feeStatus = status;
        fData.studentsList.push(student);
        fData.feeStudent = student;
        student.offlineFeeList.push(fData);
        fData.offlineStudentsList.push(student);
        fData.offlineFee += fData.feeAmount;
        await student.save();
        await fData.save();
        res.status(200).send({
          message: `${fData.feeName} received by ${student.studentFirstName}`,
          fData,
          student,
        });
      } catch {}
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/student/:sid/fee/:id)`
    );
  }
});

app.post(
  "/class/:cid/student/:sid/exempt/fee/:id",
  isLoggedIn,
  async (req, res) => {
    try {
      const { cid, sid, id } = req.params;
      const { status } = req.body;
      const classes = await Class.findById({ _id: cid });
      const student = await Student.findById({ _id: sid });
      const fData = await Fees.findById({ _id: id });
      if (
        fData.studentExemptList.length >= 1 &&
        fData.studentExemptList.includes(String(student._id))
      ) {
        res.status(200).send({
          message: `${student.studentFirstName} paid the ${fData.feeName}`,
        });
      } else {
        try {
          student.studentExemptFee.push(fData);
          fData.feeStatus = status;
          fData.studentExemptList.push(student);
          fData.feeStudent = student;
          student.exemptFeeList.push(fData);
          fData.exemptList.push(student);
          classes.exemptFee += fData.feeAmount;
          await student.save();
          await fData.save();
          await classes.save();
          res.status(200).send({
            message: `${fData.feeName} received by ${student.studentFirstName}`,
            fData,
            student,
          });
        } catch {}
      }
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/class/:cid/student/:sid/fee/:id)`
      );
    }
  }
);

app.post("/class/:cid/student/:sid/behaviour", isLoggedIn, async (req, res) => {
  try {
    const { cid, sid } = req.params;
    const classes = await Class.findById({ _id: cid });
    const student = await Student.findById({ _id: sid });
    const bData = await new Behaviour({ ...req.body });
    bData.studentName = student;
    classes.studentBehaviour.push(bData);
    student.studentBehaviourReportStatus = "Ready";
    bData.className = classes;
    await classes.save();
    await student.save();
    await bData.save();
    res.status(200).send({
      message: `${student.studentFirstName}'s Behaviour Report is ${student.studentBehaviourReportStatus}`,
      classes,
      bData,
    });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/student/:sid/behaviour)`
    );
  }
});

app.post("/class/:cid/student/attendence", isLoggedIn, async (req, res) => {
  try {
    const { cid, sid } = req.params;
    const dLeave = await Holiday.findOne({
      dDate: { $eq: `${req.body.attendDate}` },
    });
    if (dLeave) {
      res.status(200).send({
        message: "Today will be holiday Provided by department Admin",
      });
    } else {
      const existAttend = await AttendenceDate.findOne({
        attendDate: { $eq: `${req.body.attendDate}` },
      });
      if (existAttend) {
        res.status(200).send({ message: "Attendence Alreay Exists" });
      } else {
        const classes = await Class.findById({ _id: cid });
        const attendReg = await new Attendence({});
        const attendDate = await new AttendenceDate({ ...req.body });
        attendDate.className = classes;
        attendReg.className = classes;
        await attendDate.save();
        await attendReg.save();
        res.status(200).send({
          message: "Attendence Register is Ready",
          attendDate,
          attendReg,
        });
      }
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/student/attendence)`
    );
  }
});

app.post("/department/:did/staff/attendence", isLoggedIn, async (req, res) => {
  try {
    const { did } = req.params;
    const dLeaves = await Holiday.findOne({
      dDate: { $eq: `${req.body.staffAttendDate}` },
    });
    if (dLeaves) {
      res.status(200).send({
        message: "Today will be holiday Provided by department Admin",
      });
    } else {
      const existSAttend = await StaffAttendenceDate.findOne({
        staffAttendDate: { $eq: `${req.body.staffAttendDate}` },
      });
      if (existSAttend) {
        res.status(200).send({ message: "Attendence Alreay Exists" });
      } else {
        const department = await Department.findById({ _id: did });
        const staffAttendReg = await new StaffAttendence({});
        const staffAttendDate = await new StaffAttendenceDate({ ...req.body });
        staffAttendDate.department = department;
        staffAttendReg.department = department;
        await staffAttendDate.save();
        await staffAttendReg.save();
        res.status(200).send({
          message: "Staff Attendence Register is Ready",
          staffAttendDate,
          staffAttendReg,
        });
      }
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department/:did/staff/attendence)`
    );
  }
});

app.post(
  "/student/:sid/attendence/:aid/present/:rid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { sid, aid, rid } = req.params;
      const student = await Student.findById({ _id: sid });
      const attendDates = await AttendenceDate.findById({ _id: aid });
      const attendReg = await Attendence.findById({ _id: rid });
      try {
        if (
          attendDates.presentStudent.length >= 1 &&
          attendDates.presentStudent.includes(String(student._id))
        ) {
          res.status(200).send({ message: "Already Marked Present" });
        } else {
          if (
            attendDates.absentStudent &&
            attendDates.absentStudent.includes(String(student._id))
          ) {
            attendDates.absentStudent.pull(student._id);
            // console.log(attendDates.absentStudent)
            // console.log('marked as present')
            attendDates.presentStudent.push(student);
            attendDates.presentstudents = student;
            await attendDates.save();
            res.status(200).send({ message: "finally marked present" });
          } else {
            attendDates.presentStudent.push(student);
            attendDates.presentstudents = student;
            student.attendDate.push(attendDates);
            student.attendenceReg = attendReg;
            attendReg.attendenceDate.push(attendDates);
            await attendDates.save();
            await student.save();
            await attendReg.save();
            res.status(200).send({
              message: `${student.studentFirstName} is ${req.body.status} on that day`,
              attendDates,
              student,
              attendReg,
            });
          }
        }
      } catch {
        res.status(400).send({ error: "Not Success" });
      }
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/student/:sid/attendence/:aid/present/:rid)`
      );
    }
  }
);

app.post(
  "/student/:sid/attendence/:aid/absent/:rid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { sid, aid, rid } = req.params;
      const student = await Student.findById({ _id: sid });
      const attendDates = await AttendenceDate.findById({ _id: aid });
      const attendReg = await Attendence.findById({ _id: rid });
      try {
        if (
          attendDates.absentStudent.length >= 1 &&
          attendDates.absentStudent.includes(String(student._id))
        ) {
          res.status(200).send({ message: "Already Marked Absent" });
        } else {
          if (
            attendDates.presentStudent &&
            attendDates.presentStudent.includes(String(student._id))
          ) {
            attendDates.presentStudent.pull(student._id);
            // console.log(attendDates.presentStudent)
            // console.log('marked as absent')
            attendDates.absentStudent.push(student);
            attendDates.absentstudents = student;
            await attendDates.save();
            res.status(200).send({ message: "finally marked absent" });
          } else {
            attendDates.absentStudent.push(student);
            attendDates.absentstudents = student;
            student.attendDate.push(attendDates);
            student.attendenceReg = attendReg;
            attendReg.attendenceDate.push(attendDates);
            await attendDates.save();
            await student.save();
            await attendReg.save();
            res.status(200).send({
              message: `${student.studentFirstName} is ${req.body.status} on that day`,
              attendDates,
              student,
              attendReg,
            });
          }
        }
      } catch {
        res.status(400).send({ error: "Not Success" });
      }
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/student/:sid/attendence/:aid/absent/:rid)`
      );
    }
  }
);

app.post(
  "/staff/:sid/attendence/:aid/present/:rid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { sid, aid, rid } = req.params;
      const staff = await Staff.findById({ _id: sid });
      const staffAttendDates = await StaffAttendenceDate.findById({ _id: aid });
      const staffAttendReg = await StaffAttendence.findById({ _id: rid });
      try {
        if (
          staffAttendDates.presentStaff.length >= 1 &&
          staffAttendDates.presentStaff.includes(String(staff._id))
        ) {
          res.status(200).send({ message: "Already Marked Present" });
        } else {
          if (
            staffAttendDates.absentStaff &&
            staffAttendDates.absentStaff.includes(String(staff._id))
          ) {
            staffAttendDates.absentStaff.pull(staff._id);
            // console.log(staffAttendDates.absentStudent)
            // console.log('marked as present')
            staffAttendDates.presentStaff.push(staff);
            staffAttendDates.presentstaffs = staff;
            await staffAttendDates.save();
            res.status(200).send({ message: "finally marked present" });
          } else {
            staffAttendDates.presentStaff.push(staff);
            staffAttendDates.presentstaffs = staff;
            staff.attendDates.push(staffAttendDates);
            staff.attendenceRegs = staffAttendReg;
            staffAttendReg.staffAttendenceDate.push(staffAttendDates);
            await staffAttendDates.save();
            await staff.save();
            await staffAttendReg.save();
            res.status(200).send({
              message: `${staff.staffFirstName} is ${req.body.status} on that day`,
              staffAttendDates,
              staff,
              staffAttendReg,
            });
          }
        }
      } catch {
        res.status(400).send({ error: "Not Success" });
      }
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/staff/:sid/attendence/:aid/present/:rid)`
      );
    }
  }
);

app.post(
  "/staff/:sid/attendence/:aid/absent/:rid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { sid, aid, rid } = req.params;
      const staff = await Staff.findById({ _id: sid });
      const staffAttendDates = await StaffAttendenceDate.findById({ _id: aid });
      const staffAttendReg = await StaffAttendence.findById({ _id: rid });
      try {
        if (
          staffAttendDates.absentStaff.length >= 1 &&
          staffAttendDates.absentStaff.includes(String(staff._id))
        ) {
          res.status(200).send({ message: "Already Marked Absent" });
        } else {
          if (
            staffAttendDates.presentStaff &&
            staffAttendDates.presentStaff.includes(String(staff._id))
          ) {
            staffAttendDates.presentStaff.pull(staff._id);
            // console.log(staffAttendDates.presentStudent)
            // console.log('marked as absent')
            staffAttendDates.absentStaff.push(staff);
            staffAttendDates.absentstaffs = staff;
            await staffAttendDates.save();
            res.status(200).send({ message: "finally marked absent" });
          } else {
            staffAttendDates.absentStaff.push(staff);
            staffAttendDates.absentstaffs = staff;
            staff.attendDates.push(staffAttendDates);
            staff.attendenceRegs = staffAttendReg;
            staffAttendReg.staffAttendenceDate.push(staffAttendDates);
            await staffAttendDates.save();
            await staff.save();
            await staffAttendReg.save();
            res.status(200).send({
              message: `${staff.staffFirstName} is ${req.body.status} on that day`,
              staffAttendDates,
              staff,
              staffAttendReg,
            });
          }
        }
      } catch {
        res.status(400).send({ error: "Not Success" });
      }
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/staff/:sid/attendence/:aid/absent/:rid)`
      );
    }
  }
);

app.post("/attendence/detail", isLoggedIn, async (req, res) => {
  try {
    const attendDates = await AttendenceDate.findOne({
      attendDate: { $gte: `${req.body.attendDate}` },
    })
      .populate("presentStudent")
      .populate("absentStudent");
    res.status(200).send({ message: "Attendence on that day", attendDates });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/attendence/detail)`);
  }
});

app.post("/attendence/status/student/:sid", isLoggedIn, async (req, res) => {
  try {
    const { sid } = req.params;
    const { dateStatus } = req.body;
    const attendStatus = await AttendenceDate.findOne({
      attendDate: dateStatus,
    });
    if (attendStatus) {
      if (
        attendStatus.presentStudent.length >= 1 &&
        attendStatus.presentStudent.includes(String(sid))
      ) {
        res
          .status(200)
          .send({ message: "Present", status: "Present", attendStatus });
      } else if (
        attendStatus.absentStudent.length >= 1 &&
        attendStatus.absentStudent.includes(String(sid))
      ) {
        res
          .status(200)
          .send({ message: "Absent", status: "Absent", attendStatus });
      } else {
      }
    } else {
      res
        .status(200)
        .send({ message: "Not Marking", status: "Not Marking", attendStatus });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/attendence/status/student/:sid)`
    );
  }
});

app.post("/staff/attendence", isLoggedIn, async (req, res) => {
  try {
    const staffDates = await StaffAttendenceDate.findOne({
      staffAttendDate: { $gte: `${req.body.staffAttendDate}` },
    })
      .populate("presentStaff")
      .populate("absentStaff");
    res.status(200).send({ message: "Attendence on that day", staffDates });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staff/attendence)`);
  }
});

app.post("/attendence/status/staff/:sid", isLoggedIn, async (req, res) => {
  try {
    const { sid } = req.params;
    const { dateStatus } = req.body;
    const attendStatus = await StaffAttendenceDate.findOne({
      staffAttendDate: dateStatus,
    });
    if (attendStatus) {
      if (
        attendStatus.presentStaff.length >= 1 &&
        attendStatus.presentStaff.includes(String(sid))
      ) {
        res
          .status(200)
          .send({ message: "Present", status: "Present", attendStatus });
      } else if (
        attendStatus.absentStaff.length >= 1 &&
        attendStatus.absentStaff.includes(String(sid))
      ) {
        res
          .status(200)
          .send({ message: "Absent", status: "Absent", attendStatus });
      } else {
      }
    } else {
      res
        .status(200)
        .send({ message: "Not Marking", status: "Not Marking", attendStatus });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/attendence/status/staff/:sid)`
    );
  }
});

app.post("/department/holiday/:did", isLoggedIn, async (req, res) => {
  try {
    const { did } = req.params;
    const { dateStatus } = req.body;
    const depart = await Department.findById({ _id: did });
    const staffDate = await StaffAttendenceDate.findOne({
      staffAttendDate: { $eq: `${dateStatus}` },
    });
    const classDate = await AttendenceDate.findOne({
      attendDate: { $eq: `${dateStatus}` },
    });
    if (staffDate && staffDate !== "undefined") {
      res.status(200).send({ message: "Count as a no holiday", staffDate });
    } else if (classDate && classDate !== "undefined") {
      res.status(200).send({ message: "Count as a no holiday", classDate });
    } else {
      const leave = await new Holiday({
        dDate: dateStatus,
        dHolidayReason: req.body.dateData.dHolidayReason,
      });
      depart.holiday.push(leave);
      leave.department = depart;
      await depart.save();
      await leave.save();
      res.status(200).send({ message: "Holiday Marked ", leave, depart });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department/holiday/:did)`
    );
  }
});

// ========================= Finance Department =========================

app.post(
  "/ins/:id/staff/:sid/finance",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
      const { id, sid } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id });
      const staff = await Staff.findById({ _id: sid }).populate({
        path: "user",
      });
      const user = await User.findById({ _id: `${staff.user._id}` });
      const finance = new Finance({});
      const notify = new Notification({});
      staff.financeDepartment.push(finance);
      finance.financeHead = staff;
      institute.financeDepart.push(finance);
      finance.institute = institute;
      notify.notifyContent = `you got the designation of ${finance.financeName} as Finance Manager`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify);
      notify.user = user;
      notify.notifyPid = "1";
      notify.notifyByInsPhoto = institute;
      // console.log(finance)
      await institute.save();
      await staff.save();
      await finance.save();
      await user.save();
      await notify.save();
      res.status(200).send({
        message: "Successfully Assigned Staff",
        finance,
        staff,
        institute,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/:sid/finance)`
      );
    }
  }
);

app.post(
  "/finance/:fid/add/bank/details/:id",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
      const { fid, id } = req.params;
      const {
        bankAccountHolderName,
        bankAccountNumber,
        bankIfscCode,
        bankAccountPhoneNumber,
      } = req.body;
      const finance = await Finance.findById({ _id: fid });
      const institute = await InstituteAdmin.findById({ _id: id });
      institute.bankAccountHolderName = bankAccountHolderName;
      institute.bankAccountNumber = bankAccountNumber;
      institute.bankIfscCode = bankIfscCode;
      institute.bankAccountPhoneNumber = bankAccountPhoneNumber;
      await institute.save();
      res.status(200).send({ message: "bank detail updated" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/finance/:fid/add/bank/details/:id)`
      );
    }
  }
);

app.post("/finance/ins/bank/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    institute.bankAccountHolderName = "";
    institute.bankAccountNumber = "";
    institute.bankIfscCode = "";
    institute.bankAccountPhoneNumber = "";
    await institute.save();
    res.status(200).send({ message: "Bank Details Removed" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/finance/ins/bank/:id)`);
  }
});

app.patch(
  "/finance/:fid/bank/details/:id/update",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id } = req.params;
      const institute = await InstituteAdmin.findByIdAndUpdate(id, req.body);
      await institute.save();
      res.status(200).send({ message: "bank detail updated" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/finance/:fid/bank/details/:id/update)`
      );
    }
  }
);

app.get("/finance/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const finance = await Finance.findById({ _id: id })
      .populate({
        path: "financeHead",
      })
      .populate({
        path: "institute",
      })
      .populate("expenseDepartment")
      .populate({
        path: "classRoom",
        populate: {
          path: "classTeacher",
        },
      })
      .populate({
        path: "classRoom",
        populate: {
          path: "receieveFee",
        },
      })
      .populate("incomeDepartment")
      .populate("submitClassRoom");
    res.status(200).send({ message: "finance data", finance });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/finance/detail/:id)`);
  }
});

app.post("/staff/finance-info/:fid", isLoggedIn, async (req, res) => {
  try {
    const { fid } = req.params;
    const { financeAbout, financeEmail, financePhoneNumber } = req.body;
    const financeInfo = await Finance.findById({ _id: fid });
    financeInfo.financeAbout = financeAbout;
    financeInfo.financeEmail = financeEmail;
    financeInfo.financePhoneNumber = financePhoneNumber;
    await financeInfo.save();
    res.status(200).send({ message: "Finance Info Updates", financeInfo });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/finance-info/:fid)`
    );
  }
});

// ================================== Income part ==================================
app.post("/staff/:sid/finance/:fid/income", async (req, res) => {
  try {
    const { sid, fid } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const finance = await Finance.findById({ _id: fid });
    const incomes = await new Income({ ...req.body });
    finance.incomeDepartment.push(incomes);
    incomes.finances = finance;
    if (req.body.incomeAccount === "By Cash") {
      finance.financeIncomeCashBalance =
        finance.financeIncomeCashBalance + incomes.incomeAmount;
    } else if (req.body.incomeAccount === "By Bank") {
      finance.financeIncomeBankBalance =
        finance.financeIncomeBankBalance + incomes.incomeAmount;
    }
    // console.log(finance.financeBankBalance)
    await finance.save();
    await incomes.save();
    res.status(200).send({ message: "Add New Income", finance, incomes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/:sid/finance/:fid/income)`
    );
  }
});

app.post(
  "/finance/income/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const incomes = await Income.findById({ _id: sid });
      incomes.incomeAck = results.key;
      await incomes.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(`SomeThing Went Wrong at this EndPoint(/finance/income/:id)`);
    }
  }
);

app.get("/finance/income/ack/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/income/ack/:key)`
    );
  }
});

app.post("/all/incomes", async (req, res) => {
  try {
    const { queryStatus } = req.body;
    const income = await Income.find({ incomeAccount: queryStatus });
    res.status(200).send({ message: "cash data", income });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/incomes)`);
  }
});

app.post("/all/bank/incomes", async (req, res) => {
  try {
    const { queryStatus } = req.body;
    const income = await Income.find({ incomeAccount: queryStatus });
    res.status(200).send({ message: "bank data", income });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/bank/incomes)`);
  }
});

// ======================== Expense Part ========================

app.post("/staff/:sid/finance/:fid/expense", isLoggedIn, async (req, res) => {
  try {
    const { sid, fid } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const finance = await Finance.findById({ _id: fid });
    const expenses = await new Expense({ ...req.body });
    finance.expenseDepartment.push(expenses);
    expenses.finances = finance;
    if (req.body.expenseAccount === "By Cash") {
      finance.financeExpenseCashBalance =
        finance.financeExpenseCashBalance + expenses.expenseAmount;
    } else if (req.body.expenseAccount === "By Bank") {
      finance.financeExpenseBankBalance =
        finance.financeExpenseBankBalance + expenses.expenseAmount;
    }
    await finance.save();
    await expenses.save();
    res.status(200).send({ message: "Add New Expense", finance, expenses });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/:sid/finance/:fid/expense)`
    );
  }
});

app.post(
  "/finance/expense/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const sid = req.params.id;
      const file = req.file;
      const results = await uploadDocFile(file);
      const expenses = await Expense.findById({ _id: sid });
      expenses.expenseAck = results.key;
      await expenses.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/finance/expense/:id)`
      );
    }
  }
);

app.get("/finance/expense/ack/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/expense/ack/:key)`
    );
  }
});

app.post("/all/expenses", async (req, res) => {
  try {
    const { queryStatus } = req.body;
    const expense = await Expense.find({ expenseAccount: queryStatus });
    res.status(200).send({ message: "cash data", expense });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/expenses)`);
  }
});

app.post("/all/bank/expenses", async (req, res) => {
  try {
    const { queryStatus } = req.body;
    const expense = await Expense.find({ expenseAccount: queryStatus });
    res.status(200).send({ message: "bank data", expense });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/bank/expenses)`);
  }
});

// app.post("/student/:sid/fee/:id/online", isLoggedIn, async (req, res) => {
//   const { sid, id } = req.params;
//   const { status } = req.body;
//   const student = await Student.findById({ _id: sid });
//   const fData = await Fees.findById({ _id: id });
//   if (
//     fData.studentsList.length >= 1 &&
//     fData.studentsList.includes(String(student._id))
//   ) {
//     res.status(200).send({
//       message: `${student.studentFirstName} paid the ${fData.feeName}`,
//     });
//   } else {
//     try {
//       student.studentFee.push(fData);
//       fData.feeStatus = status;
//       fData.studentsList.push(student);
//       fData.feeStudent = student;
//       student.onlineFeeList.push(fData);
//       await student.save();
//       await fData.save();
//       res.status(200).send({
//         message: `${fData.feeName} received by ${student.studentFirstName}`,
//         fData,
//         student,
//       });
//     } catch {}
//   }
// });

//

app.post("/finance/all/fee/online/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const finance = await Finance.findById({ _id: id }).populate({
      path: "institute",
      populate: {
        path: "ApproveStudent",
      },
    });
    res
      .status(200)
      .send({ message: "all class data at finance manager", finance });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/all/fee/online/:id)`
    );
  }
});

app.post("/class/:cid/total/online/fee", async (req, res) => {
  try {
    const { cid } = req.params;
    const { fee } = req.body;
    const classes = await Class.findById({ _id: cid });
    classes.onlineTotalFee = fee;
    await classes.save();
    res.status(200).send({ message: "class online total", classes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/total/online/fee)`
    );
  }
});

app.post("/class/:cid/total/offline/fee", async (req, res) => {
  try {
    const { cid } = req.params;
    const { fee } = req.body;
    const classes = await Class.findById({ _id: cid });
    classes.offlineTotalFee = fee;
    await classes.save();
    res.status(200).send({ message: "class offline total", classes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/total/offline/fee)`
    );
  }
});

app.post("/class/:cid/total/collected/fee", async (req, res) => {
  try {
    const { cid } = req.params;
    const { fee } = req.body;
    const classes = await Class.findById({ _id: cid });
    classes.classTotalCollected = fee;
    await classes.save();
    res.status(200).send({ message: "class offline total", classes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:cid/total/collected/fee)`
    );
  }
});

app.get("/finance/:fid/class/collect", async (req, res) => {
  try {
    const { fid } = req.params;
    const finance = await Finance.findById({ _id: fid })
      .populate({
        path: "institute",
        populate: {
          path: "ApproveStudent",
          populate: {
            path: "onlineCheckList",
          },
        },
      })
      .populate({
        path: "institute",
        populate: {
          path: "classRooms",
        },
      })
      .populate({
        path: "institute",
        populate: {
          path: "ApproveStudent",
          populate: {
            path: "onlineFeeList",
          },
        },
      });
    res.status(200).send({ message: "Class Data", finance });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/class/collect)`
    );
  }
});

// fee submit requested

app.post("/finance/:fid/class/:cid/fee/:id/receieve", async (req, res) => {
  try {
    const { fid, cid, id } = req.params;
    const { amount } = req.body;
    const finance = await Finance.findById({ _id: fid });
    const classes = await Class.findById({ _id: cid });
    const fee = await Fees.findById({ _id: id });
    finance.classRoom.push(classes);
    classes.receieveFee.push(fee);
    // classes.classTotalCollected = amount
    await finance.save();
    await classes.save();
    res.status(200).send({ message: "class submitted Data", finance });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/class/:cid/fee/:id/receieve)`
    );
  }
});

// fee submitted

app.post("/finance/:fid/class/:cid/fee/:id/submit", async (req, res) => {
  try {
    const { fid, cid, id } = req.params;
    const { fee } = req.body;
    const finance = await Finance.findById({ _id: fid });
    const classes = await Class.findById({ _id: cid }).populate(
      "ApproveStudent"
    );
    const fees = await Fees.findById({ _id: id });
    finance.classRoom.pull(classes);
    finance.submitClassRoom.push(classes);
    classes.receieveFee.pull(fees);
    classes.submitFee.push(fees);
    finance.financeSubmitBalance += fees.offlineFee;
    fees.offlineFee = 0;
    await classes.save();
    await finance.save();
    await fees.save();
    res.status(200).send({ message: "finance class submitted Data", finance });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/class/:cid/fee/:id/submi)`
    );
  }
});

// fee incorrect

app.post("/finance/:fid/class/:cid/fee/incorrect", async (req, res) => {
  try {
    const { fid, cid } = req.params;
    const finance = await Finance.findById({ _id: fid });
    const classes = await Class.findById({ _id: cid });
    finance.classRoom.pull(classes);
    finance.pendingClassRoom.push(classes);
    await finance.save();
    res.status(200).send({ message: "class submitted Data", finance });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/class/:cid/fee/incorrect)`
    );
  }
});

app.post("/finance/:fid/online/payment/updated", async (req, res) => {
  // console.log(req.params, req.body)
  try {
    const { fid } = req.params;
    const { balance } = req.body;
    const finance = await Finance.findById({ _id: fid });
    finance.financeBankBalance = balance;
    await finance.save();
    res.status(200).send({ message: "balance", finance });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/finance/:fid/online/payment/updated)`
    );
  }
});

// ============================== Sport Department ==============================

app.post(
  "/ins/:id/staff/:sid/sport",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
      const { id, sid } = req.params;
      const institute = await InstituteAdmin.findById({ _id: id });
      const staff = await Staff.findById({ _id: sid });
      const sport = await new Sport({});
      staff.sportDepartment.push(sport);
      sport.sportHead = staff;
      institute.sportDepart.push(sport);
      sport.institute = institute;
      // console.log(finance)
      await institute.save();
      await staff.save();
      await sport.save();
      res.status(200).send({
        message: "Successfully Assigned Staff",
        sport,
        staff,
        institute,
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/:sid/sport)`
      );
    }
  }
);

app.get("/sport/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sport = await Sport.findById({ _id: id })
      .populate({
        path: "sportHead",
      })
      .populate({
        path: "institute",
      })
      .populate({
        path: "sportClass",
        populate: {
          path: "sportStudent",
        },
      })
      .populate("sportEvent");
    res.status(200).send({ message: "sport data", sport });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/sport/detail/:id)`);
  }
});

app.post("/ins/:id/sport/:sid/class", async (req, res) => {
  try {
    const { id, sid } = req.params;
    const { staffId, sportClassName } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const sport = await Sport.findById({ _id: sid });
    const staff = await Staff.findById({ _id: staffId });
    const sportClasses = await new SportClass({
      sportClassName: sportClassName,
    });
    sport.sportClass.push(sportClasses);
    sportClasses.sportClassHead = staff;
    institute.sportClassDepart.push(sportClasses);
    sportClasses.institute = institute;
    staff.staffSportClass.push(sportClasses);
    sportClasses.sportDepartment = sport;
    await sport.save();
    await institute.save();
    await staff.save();
    await sportClasses.save();
    res.status(200).send({
      message: "Successfully Created Sport Class",
      sport,
      staff,
      sportClasses,
    });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/sport/:sid/class)`
    );
  }
});

app.post("/sport/:sid/event", async (req, res) => {
  try {
    const { sid } = req.params;
    const sport = await Sport.findById({ _id: sid });
    const student = await Student.find({});
    const event = await new SportEvent({ ...req.body });
    sport.sportEvent.push(event);
    event.sportDepartment = sport;
    await sport.save();
    await event.save();
    for (let i = 0; i < student.length; i++) {
      student[i].sportEvent.push(event);
      await student[i].save();
    }
    res.status(200).send({ message: "Event Created", sport, event });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/sport/:sid/event)`);
  }
});

app.post("/sport/info/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const { sportName, sportEmail, sportAbout, sportPhoneNumber } = req.body;
    const sport = await Sport.findById({ _id: sid });
    sport.sportName = sportName;
    sport.sportEmail = sportEmail;
    sport.sportAbout = sportAbout;
    sport.sportPhoneNumber = sportPhoneNumber;
    await sport.save();
    res.status(200).send({ message: "Sport Department Info Updated" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/sport/info/:sid)`);
  }
});

app.get("/event/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const event = await SportEvent.findById({ _id: id })
      .populate({
        path: "sportEventMatch",
        populate: {
          path: "sportEventMatchClass",
          populate: {
            path: "sportStudent",
          },
        },
      })
      .populate({
        path: "sportDepartment",
      })
      .populate({
        path: "sportEventMatch",
        populate: {
          path: "sportEvent",
        },
      })
      .populate({
        path: "sportEventMatch",
        populate: {
          path: "sportWinner",
        },
      })
      .populate({
        path: "sportEventMatch",
        populate: {
          path: "sportWinnerTeam",
        },
      })
      .populate({
        path: "sportEventMatch",
        populate: {
          path: "sportRunner",
        },
      })
      .populate({
        path: "sportEventMatch",
        populate: {
          path: "sportRunnerTeam",
        },
      });
    res.status(200).send({ message: "Event Detail", event });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/event/detail/:id)`);
  }
});

app.post("/event/:eid/match", async (req, res) => {
  try {
    const { eid } = req.params;
    const {
      sportEventMatchName,
      sportEventMatchClass,
      sportEventMatchCategory,
      sportEventMatchCategoryLevel,
      sportEventMatchDate,
      sportInPlayer1,
      sportInPlayer2,
      sportTPlayer1,
      sportTPlayer2,
      sportPlayerFree,
    } = req.body;
    const event = await SportEvent.findById({ _id: eid });
    const classes = await SportClass.findById({
      _id: `${sportEventMatchClass}`,
    });
    var match = await new SportEventMatch({
      sportEventMatchName: sportEventMatchName,
      sportEventMatchCategory: sportEventMatchCategory,
      sportEventMatchDate: sportEventMatchDate,
      sportEventMatchCategoryLevel: sportEventMatchCategoryLevel,
    });
    match.sportEventMatchClass = classes;
    event.sportEventMatch.push(match);
    match.sportEvent = event;
    await event.save();
    await match.save();
    if (sportInPlayer1 !== "" && sportInPlayer2 !== "") {
      const student1 = await Student.findById({ _id: `${sportInPlayer1}` });
      const student2 = await Student.findById({ _id: `${sportInPlayer2}` });
      // student1.sportEventMatch.push(match);
      match.sportPlayer1 = student1;
      // student2.sportEventMatch.push(match);
      match.sportPlayer2 = student2;
      // await student1.save();
      // await student2.save();
      await match.save();
    } else if (sportTPlayer1 !== "" && sportTPlayer2 !== "") {
      const Team1 = await SportTeam.findById({ _id: `${sportTPlayer1}` });
      const Team2 = await SportTeam.findById({ _id: `${sportTPlayer2}` });
      // Team1.sportEventMatch.push(match);
      match.sportTeam1 = Team1;
      // Team2.sportEventMatch.push(match);
      match.sportTeam2 = Team2;
      // await Team1.save();
      // await Team2.save();
      await match.save();
    } else if (sportPlayerFree.length >= 1) {
      for (let i = 0; i < sportPlayerFree.length; i++) {
        const student = await Student.findById({
          _id: sportPlayerFree[i].studentId,
        });
        // student.sportEventMatch.push(match);
        match.sportFreePlayer.push(student);
        // await student.save();
        await match.save();
      }
    }
    res.status(200).send({ message: "Match Created", event, match });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/event/:eid/match)`);
  }
});

app.post("/event/:eid/inter/match", async (req, res) => {
  try {
    const { eid } = req.params;
    const {
      sportEventMatchName,
      sportEventMatchClass,
      sportEventMatchCategory,
      sportEventMatchCategoryLevel,
      sportEventMatchDate,
      sportPlayer,
      sportTeam,
      sportPlayerFree,
    } = req.body;
    const event = await SportEvent.findById({ _id: eid });
    const classes = await SportClass.findById({
      _id: `${sportEventMatchClass}`,
    });
    var match = await new SportEventMatch({
      sportEventMatchName: sportEventMatchName,
      sportEventMatchCategory: sportEventMatchCategory,
      sportEventMatchDate: sportEventMatchDate,
      sportEventMatchCategoryLevel: sportEventMatchCategoryLevel,
    });
    match.sportEventMatchClass = classes;
    event.sportEventMatch.push(match);
    match.sportEvent = event;
    await event.save();
    await match.save();
    if (sportPlayer !== "") {
      const student1 = await Student.findById({ _id: `${sportPlayer}` });
      // student1.sportEventMatch.push(match);
      match.sportPlayer1 = student1;
      // await student1.save();
      await match.save();
    } else if (sportTeam !== "") {
      const Team1 = await SportTeam.findById({ _id: `${sportTeam}` });
      // Team1.sportEventMatch.push(match);
      match.sportTeam1 = Team1;
      // await Team1.save();
      await match.save();
    } else if (sportPlayerFree.length >= 1) {
      for (let i = 0; i < sportPlayerFree.length; i++) {
        const student = await Student.findById({
          _id: sportPlayerFree[i].studentId,
        });
        // student.sportEventMatch.push(match);
        match.sportFreePlayer.push(student);
        // await student.save();
        await match.save();
      }
    }
    res.status(200).send({ message: "Match Created", event, match });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/event/:eid/inter/match)`
    );
  }
});

app.get("/sport/class/detail/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await SportClass.findById({ _id: cid })
      .populate("sportStudent")
      .populate({
        path: "sportClassHead",
      })
      .populate({
        path: "institute",
      })
      .populate({
        path: "sportDepartment",
      })
      .populate("sportTeam");
    res.status(200).send({ message: "Sport Class Data", classes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/detail/:cid)`
    );
  }
});

app.post("/sport/class/:cid/student/:sid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await SportClass.findById({ _id: cid });
    const student = await Student.findById({ _id: sid });
    classes.sportStudent.push(student);
    student.sportClass = classes;
    await classes.save();
    await student.save();
    res
      .status(200)
      .send({ message: "Student added to sports class", classes, student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/:cid/student/:sid)`
    );
  }
});

app.post("/sport/class/info/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const { sportClassEmail, sportClassAbout, sportClassPhoneNumber } =
      req.body;
    const classes = await SportClass.findById({ _id: sid });
    classes.sportClassEmail = sportClassEmail;
    classes.sportClassAbout = sportClassAbout;
    classes.sportClassPhoneNumber = sportClassPhoneNumber;
    await classes.save();
    res.status(200).send({ message: "Sport Class Info Updated" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/info/:sid)`
    );
  }
});

app.get("/ins/approve/student/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate(
      "ApproveStudent"
    );
    res.status(200).send({ message: "Approve Institute Data", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/approve/student/:id)`
    );
  }
});

app.post("/sport/class/:cid/student/:id/add", async (req, res) => {
  try {
    const { cid, id } = req.params;
    const classes = await SportClass.findById({ _id: cid });
    const student = await Student.findById({ _id: id });
    classes.sportStudent.push(student);
    student.sportClass = classes;
    await classes.save();
    await student.save();
    res.status(200).send({ message: "Student Added" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/:cid/student/:id/add)`
    );
  }
});

app.post("/sport/class/:cid/student/:id/remove", async (req, res) => {
  try {
    const { cid, id } = req.params;
    const classes = await SportClass.findById({ _id: cid });
    const student = await Student.findById({ _id: id });
    classes.sportStudent.pull(student);
    student.sportClass = "";
    await classes.save();
    await student.save();
    res.status(200).send({ message: "Student Removed" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/:cid/student/:id/remove)`
    );
  }
});

app.post("/sport/class/:cid/team", async (req, res) => {
  try {
    const { cid } = req.params;
    const { sportClassTeamName, sportStudentData } = req.body;
    const classes = await SportClass.findById({ _id: cid });
    var team = await new SportTeam({ sportClassTeamName: sportClassTeamName });
    for (let i = 0; i < sportStudentData.length; i++) {
      const student = await Student.findById({
        _id: sportStudentData[i].studentId,
      });
      team.sportTeamStudent.push(student);
      student.sportTeam = team;
      await team.save();
      await student.save();
    }
    classes.sportTeam.push(team);
    team.sportClass = classes;
    await classes.save();
    await team.save();
    res.status(200).send({ message: "Team Created", classes, team });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/class/:cid/team)`
    );
  }
});

app.get("/match/detail/:mid", async (req, res) => {
  try {
    const { mid } = req.params;
    const match = await SportEventMatch.findById({ _id: mid })
      .populate("sportFreePlayer")
      .populate({
        path: "sportEvent",
      })
      .populate({
        path: "sportPlayer1",
      })
      .populate({
        path: "sportTeam1",
      })
      .populate({
        path: "sportPlayer2",
      })
      .populate({
        path: "sportTeam2",
      })
      .populate({
        path: "sportEventMatchClass",
      });
    res.status(200).send({ message: "Match Data", match });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/match/detail/:mid)`);
  }
});

app.post("/match/:mid/update/individual", async (req, res) => {
  try {
    const { mid } = req.params;
    const { studentWinner, studentRunner } = req.body;
    const match = await SportEventMatch.findById({ _id: mid });
    const student1 = await Student.findById({ _id: `${studentWinner}` });
    const student2 = await Student.findById({ _id: `${studentRunner}` });
    match.sportWinner = student1;
    match.sportRunner = student2;
    match.matchStatus = "Completed";
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      student1.extraPoints += 25;
      student2.extraPoints += 15;
      await student1.save();
      await student2.save();
    }
    await match.save();
    res.status(200).send({ message: "Match Result Updated", match });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/individual)`
    );
  }
});

app.post("/match/:mid/update/inter/individual", async (req, res) => {
  try {
    const { mid } = req.params;
    const { studentPlayer, studentRankTitle, studentOpponentPlayer } = req.body;
    const match = await SportEventMatch.findById({ _id: mid });
    const student = await Student.findById({ _id: `${studentPlayer}` });
    match.sportOpponentPlayer = studentOpponentPlayer;
    match.matchStatus = "Completed";
    match.rankMatch = studentRankTitle;
    student.rankTitle = studentRankTitle;
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      if (studentRankTitle === "Winner") {
        student.extraPoints += 40;
        await student.save();
      } else if (studentRankTitle === "Runner") {
        student.extraPoints += 25;
        await student.save();
      }
    }
    await match.save();
    await student.save();
    res.status(200).send({ message: "Match Result Updated", match });
  } catch {}
  try {
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/inter/individual)`
    );
  }
});

app.post("/match/:mid/update/team", async (req, res) => {
  try {
    const { mid } = req.params;
    const { teamWinner, teamRunner } = req.body;
    const match = await SportEventMatch.findById({ _id: mid });
    const team1 = await SportTeam.findById({ _id: `${teamWinner}` }).populate(
      "sportTeamStudent"
    );
    const team2 = await SportTeam.findById({ _id: `${teamRunner}` }).populate(
      "sportTeamStudent"
    );
    match.sportWinnerTeam = team1;
    match.sportRunnerTeam = team2;
    match.matchStatus = "Completed";
    await match.save();
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      team1.teamPoints += 25;
      team2.teamPoints += 15;
      await team1.save();
      await team2.save();
      for (let i = 0; i < team1.sportTeamStudent.length; i++) {
        const student1 = await Student.findById({
          _id: team1.sportTeamStudent[i]._id,
        });
        student1.extraPoints += 25;
        await student1.save();
      }
      for (let i = 0; i < team2.sportTeamStudent.length; i++) {
        const student2 = await Student.findById({
          _id: team2.sportTeamStudent[i]._id,
        });
        student2.extraPoints += 15;
        await student2.save();
      }
    }
    res.status(200).send({ message: "Match Result Updated", match });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/team)`
    );
  }
});

app.post("/match/:mid/update/inter/team", async (req, res) => {
  try {
    const { mid } = req.params;
    const { teamPlayer, studentRankTitle, teamOpponentPlayer } = req.body;
    const match = await SportEventMatch.findById({ _id: mid });
    const team = await SportTeam.findById({ _id: `${teamPlayer}` }).populate(
      "sportTeamStudent"
    );
    match.sportOpponentPlayer = teamOpponentPlayer;
    match.matchStatus = "Completed";
    match.rankMatch = studentRankTitle;
    team.rankTitle = studentRankTitle;
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      if (studentRankTitle === "Winner") {
        team.teamPoints += 40;
        await team.save();
        for (let i = 0; i < team.sportTeamStudent.length; i++) {
          const student = await Student.findById({
            _id: team.sportTeamStudent[i]._id,
          });
          student.extraPoints += 40;
          await student.save();
        }
      } else if (studentRankTitle === "Runner") {
        team.teamPoints += 25;
        await team.save();
        for (let i = 0; i < team.sportTeamStudent.length; i++) {
          const student = await Student.findById({
            _id: team.sportTeamStudent[i]._id,
          });
          student.extraPoints += 25;
          await student.save();
        }
      }
    }
    await match.save();
    await team.save();
    res.status(200).send({ message: "Match Result Updated", match });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/inter/team)`
    );
  }
});

app.post("/match/:mid/update/free", async (req, res) => {
  try {
    const { mid } = req.params;
    const { studentWinner, studentRunner, studentParticipants } = req.body;
    var match = await SportEventMatch.findById({ _id: mid });
    const student1 = await Student.findById({ _id: `${studentWinner}` });
    const student2 = await Student.findById({ _id: `${studentRunner}` });
    match.sportWinner = student1;
    match.sportRunner = student2;
    match.matchStatus = "Completed";
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      student1.extraPoints += 25;
      student2.extraPoints += 15;
      await student1.save();
      await student2.save();
    }
    await match.save();
    if (studentParticipants.length >= 1) {
      for (let i = 0; i < studentParticipants.length; i++) {
        const student = await Student.findById({
          _id: studentParticipants[i].studentId,
        });
        match.sportParticipants.push(student);
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          student.extraPoints += 5;
          await student.save();
        }
        await match.save();
      }
    }
    res.status(200).send({ message: "Match Free Updated", match });
  } catch {}
  try {
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/free)`
    );
  }
});

app.post("/match/:mid/update/inter/free", async (req, res) => {
  try {
    const { mid } = req.params;
    const {
      studentPlayer,
      studentRankTitle,
      studentParticipants,
      studentOpponentPlayer,
    } = req.body;
    var match = await SportEventMatch.findById({ _id: mid });
    const student = await Student.findById({ _id: `${studentPlayer}` });
    match.sportOpponentPlayer = studentOpponentPlayer;
    match.rankMatch = studentRankTitle;
    match.matchStatus = "Completed";
    student.rankTitle = studentRankTitle;
    if (match.sportEventMatchCategoryLevel === "Final Match") {
      if (studentRankTitle === "Winner") {
        student.extraPoints += 40;
        await student.save();
      } else if (studentRankTitle === "Runner") {
        student.extraPoints += 25;
        await student.save();
      }
    }
    await match.save();
    await student.save();
    if (studentParticipants.length >= 1) {
      for (let i = 0; i < studentParticipants.length; i++) {
        const student = await Student.findById({
          _id: studentParticipants[i].studentId,
        });
        match.sportInterParticipants.push(student);
        if (match.sportEventMatchCategoryLevel === "Final Match") {
          student.extraPoints += 5;
          await student.save();
        }
        await match.save();
      }
    }
    res.status(200).send({ message: "Match Free Updated", match });
  } catch {}
  try {
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/match/:mid/update/inter/free)`
    );
  }
});

// ============================ Leave And Transfer ===============================

app.get("/staff/:id/detail/leave", async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById({ _id: id }).populate({
      path: "institute",
    });
    res.status(200).send({ message: "Staff Leave Data", staff });
  } catch {}
});

app.get("/student/:id/detail/leave", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById({ _id: id }).populate({
      path: "studentClass",
    });
    res.status(200).send({ message: "Student Leave Data", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:id/detail/leave)`
    );
  }
});

app.post("/staff/:sid/leave/:id", async (req, res) => {
  try {
    const { sid, id } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const leave = await new Leave({ ...req.body });
    const notify = await new Notification({});
    institute.leave.push(leave);
    leave.institute = institute;
    staff.staffLeave.push(leave);
    leave.staff = staff;
    notify.notifyContent = `${staff.staffFirstName}${
      staff.staffMiddleName ? ` ${staff.staffMiddleName}` : ""
    } ${staff.staffLastName} requested for a leave check application`;
    notify.notifySender = sid;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyByStaffPhoto = staff;
    await staff.save();
    await leave.save();
    await institute.save();
    await notify.save();
    res
      .status(200)
      .send({ message: "request to leave", leave, staff, institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/staff/:sid/leave/:id)`);
  }
});

app.post("/student/:sid/leave/:id", async (req, res) => {
  try {
    const { sid, id } = req.params;
    const student = await Student.findById({ _id: sid });
    const classes = await Class.findById({ _id: id }).populate({
      path: "classTeacher",
      populate: {
        path: "user",
      },
    });
    const user = await User.findById({
      _id: `${classes.classTeacher.user._id}`,
    });
    const leave = await new StudentLeave({ ...req.body });
    const notify = await new Notification({});
    classes.studentLeave.push(leave);
    leave.fromClass = classes;
    student.leave.push(leave);
    leave.student = student;
    notify.notifyContent = `${student.studentFirstName}${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} requested for a leave check application`;
    notify.notifySender = sid;
    notify.notifyReceiever = id;
    user.uNotify.push(notify);
    notify.user = user;
    notify.notifyByStudentPhoto = student;
    await classes.save();
    await student.save();
    await leave.save();
    await user.save();
    await notify.save();
    res
      .status(200)
      .send({ message: "request to leave", leave, student, classes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/leave/:id)`
    );
  }
});

app.post("/ins/:id/staff/:sid/leave/grant/:eid", async (req, res) => {
  try {
    const { id, sid, eid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${staff.user._id}` });
    const leave = await Leave.findById({ _id: eid });
    const notify = await new Notification({});
    leave.leaveStatus = status;
    notify.notifyContent = `Your Leave request has been Approved by ${institute.insName}`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify);
    notify.user = user;
    notify.notifyByStaffPhoto = staff;
    await leave.save();
    await user.save();
    await notify.save();
    res.status(200).send({ message: "Leave Granted", leave });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/leave/grant/:eid)`
    );
  }
});

app.post("/class/:id/student/:sid/leave/grant/:eid", async (req, res) => {
  try {
    const { id, sid, eid } = req.params;
    const { status } = req.body;
    const classes = await Class.findById({ _id: id });
    const student = await Student.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${student.user._id}` });
    const leave = await StudentLeave.findById({ _id: eid });
    const notify = await new Notification({});
    leave.leaveStatus = status;
    notify.notifyContent = `Your Leave request has been Approved by ${classes.className}`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify);
    notify.user = user;
    notify.notifyByStudentPhoto = student;
    await leave.save();
    await user.save();
    await notify.save();
    res.status(200).send({ message: "Leave Granted", leave });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:id/student/leave/grant/:eid)`
    );
  }
});

app.post("/ins/:id/staff/:sid/leave/reject/:eid", async (req, res) => {
  try {
    const { id, sid, eid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${staff.user._id}` });
    const leave = await Leave.findById({ _id: eid });
    const notify = await new Notification({});
    leave.leaveStatus = status;
    notify.notifyContent = `Your Leave request has been Rejected by ${institute.insName}`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify);
    notify.user = user;
    notify.notifyByStaffPhoto = staff;
    await leave.save();
    await user.save();
    await notify.save();
    res.status(200).send({ message: "Leave Not Granted", leave });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/leave/reject/:eid)`
    );
  }
});

app.post("/class/:id/student/:sid/leave/reject/:eid", async (req, res) => {
  try {
    const { id, sid, eid } = req.params;
    const { status } = req.body;
    const classes = await Class.findById({ _id: id });
    const student = await Student.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${student.user._id}` });
    const leave = await StudentLeave.findById({ _id: eid });
    const notify = await new Notification({});
    leave.leaveStatus = status;
    notify.notifyContent = `Your Leave request has been Rejected by ${classes.className}`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify);
    notify.user = user;
    notify.notifyByStudentPhoto = student;
    await leave.save();
    await user.save();
    await notify.save();
    res.status(200).send({ message: "Leave Not Granted", leave });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:id/student/leave/reject/:eid)`
    );
  }
});

app.post("/staff/:sid/transfer/:id", async (req, res) => {
  try {
    const { sid, id } = req.params;
    const staff = await Staff.findById({ _id: sid });
    const institute = await InstituteAdmin.findById({ _id: id });
    const transfer = await new Transfer({ ...req.body });
    institute.transfer.push(transfer);
    transfer.institute = institute;
    staff.staffTransfer.push(transfer);
    transfer.staff = staff;
    await institute.save();
    await staff.save();
    await transfer.save();
    res
      .status(200)
      .send({ message: "request to transfer", transfer, staff, institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staff/:sid/transfer/:id)`
    );
  }
});

app.post("/student/:sid/transfer/:id", async (req, res) => {
  try {
    const { sid, id } = req.params;
    const student = await Student.findById({ _id: sid });
    const classes = await Class.findById({ _id: id }).populate({
      path: "classTeacher",
      populate: {
        path: "user",
      },
    });
    const user = await User.findById({
      _id: `${classes.classTeacher.user._id}`,
    });
    const transfer = await new StudentTransfer({ ...req.body });
    const notify = await new Notification({});
    classes.studentTransfer.push(transfer);
    transfer.fromClass = classes;
    student.transfer.push(transfer);
    transfer.student = student;
    notify.notifyContent = `${student.studentFirstName}${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} requested for a Transfer check application`;
    notify.notifySender = sid;
    notify.notifyReceiever = id;
    user.uNotify.push(notify);
    notify.user = user;
    notify.notifyByStudentPhoto = student;
    await classes.save();
    await student.save();
    await transfer.save();
    await user.save();
    await notify.save();
    res
      .status(200)
      .send({ message: "request to transfer", transfer, student, classes });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/transfer/:id)`
    );
  }
});

app.post("/ins/:id/staff/:sid/transfer/:ssid/grant/:eid", async (req, res) => {
  try {
    const { id, sid, ssid, eid } = req.params;
    const { status } = req.body;
    var institute = await InstituteAdmin.findById({ _id: id }).populate({
      path: "depart",
      populate: {
        path: "batches",
        populate: {
          path: "batchStaff",
        },
      },
    });
    var staffNew = await Staff.findById({ _id: sid });
    var transfer = await Transfer.findById({ _id: eid });
    var transferStaff = await Staff.findById({ _id: ssid })
      .populate("staffDepartment")
      .populate("staffClass")
      .populate("staffSubject")
      .populate("financeDepartment")
      .populate("library")
      .populate("staffAdmissionAdmin");
    // .populate("sportDepartment")
    // .populate("staffSportClass")
    // .populate("elearning")
    transfer.transferStatus = status;
    await transfer.save();
    for (let i = 0; i < transferStaff.staffDepartment.length; i++) {
      const department = await Department.findById({
        _id: transferStaff.staffDepartment[i]._id,
      });
      staffNew.staffDepartment.push(department);
      department.dHead = staffNew;
      transferStaff.staffDepartment.pull(department);
      await staffNew.save();
      await department.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.staffClass.length; i++) {
      const classes = await Class.findById({
        _id: transferStaff.staffClass[i]._id,
      });
      staffNew.staffClass.push(classes);
      classes.classTeacher = staffNew;
      transferStaff.staffClass.pull(classes);
      await staffNew.save();
      await classes.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.staffSubject.length; i++) {
      const subject = await Subject.findById({
        _id: transferStaff.staffSubject[i]._id,
      });
      staffNew.staffSubject.push(subject);
      subject.subjectTeacherName = staffNew;
      transferStaff.staffSubject.pull(subject);
      await staffNew.save();
      await subject.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.financeDepartment.length; i++) {
      const finance = await Finance.findById({
        _id: transferStaff.financeDepartment[i]._id,
      });
      staffNew.financeDepartment.push(finance);
      finance.financeHead = staffNew;
      transferStaff.financeDepartment.pull(finance);
      await staffNew.save();
      await finance.save();
      await transferStaff.save();
    }
    // for (let i = 0; i < transferStaff.sportDepartment.length; i++) {
    //   const sport = await Sport.findById({
    //     _id: transferStaff.sportDepartment[i]._id,
    //   });
    //   staffNew.sportDepartment.push(sport);
    //   sport.sportHead = staffNew;
    //   transferStaff.sportDepartment.pull(sport);
    //   await staffNew.save();
    //   await sport.save();
    //   await transferStaff.save();
    // }
    // for (let i = 0; i < transferStaff.staffSportClass.length; i++) {
    //   const sportClass = await SportClass.findById({
    //     _id: transferStaff.staffSportClass[i]._id,
    //   });
    //   staffNew.staffSportClass.push(sportClass);
    //   sportClass.sportClassHead = staffNew;
    //   transferStaff.staffSportClass.pull(sportClass);
    //   await staffNew.save();
    //   await sportClass.save();
    //   await transferStaff.save();
    // }
    // for (let i = 0; i < transferStaff.elearning.length; i++) {
    //   const elearn = await ELearning.findById({
    //     _id: transferStaff.elearning[i]._id,
    //   });
    //   staffNew.elearning.push(elearn);
    //   elearn.elearningHead = staffNew;
    //   transferStaff.elearning.pull(elearn);
    //   await staffNew.save();
    //   await elearn.save();
    //   await transferStaff.save();
    // }
    for (let i = 0; i < transferStaff.library.length; i++) {
      const libr = await Library.findById({
        _id: transferStaff.library[i]._id,
      });
      staffNew.library.push(libr);
      libr.libraryHead = staffNew;
      transferStaff.library.pull(libr);
      await staffNew.save();
      await libr.save();
      await transferStaff.save();
    }
    for (let i = 0; i < transferStaff.staffAdmissionAdmin.length; i++) {
      const sAdmin = await AdmissionAdmin.findById({
        _id: transferStaff.staffAdmissionAdmin[i]._id,
      });
      staffNew.staffAdmissionAdmin.push(sAdmin);
      sAdmin.adAdminNameHead = staffNew;
      transferStaff.staffAdmissionAdmin.pull(sAdmin);
      await staffNew.save();
      await sAdmin.save();
      await transferStaff.save();
    }
    if (
      institute.ApproveStaff.length >= 1 &&
      institute.ApproveStaff.includes(String(transferStaff._id))
    ) {
      institute.ApproveStaff.pull(transferStaff._id);
      transferStaff.institute = "";
      await institute.save();
      await transferStaff.save();
    } else {
      console.log("Not To Leave");
    }
    for (let i = 0; i < institute.depart.length; i++) {
      const depart = await Department.findById({
        _id: institute.depart[i]._id,
      });
      depart.departmentChatGroup.pull(transferStaff);
      depart.departmentChatGroup.push(staffNew);
      await depart.save();
    }
    for (let i = 0; i < institute.depart.length; i++) {
      for (let j = 0; j < i.batches.length; j++) {
        const batchData = await Batch.findById({ _id: i.batches[j]._id });
        batchData.batchStaff.pull(transferStaff);
        batchData.batchStaff.push(staffNew);
        staffNew.batches = batchData;
        await batchData.save();
        await staffNew.save();
      }
    }
    res
      .status(200)
      .send({ message: "Transfer Granted", staffNew, transferStaff, transfer });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/:sid/transfer/:ssid/grant/:eid)`
    );
  }
});

app.post(
  "/class/:id/student/:sid/transfer/grant/:eid/department/:did/batch/:bid",
  async (req, res) => {
    try {
      const { id, sid, eid, did, bid } = req.params;
      const { status } = req.body;
      const classes = await Class.findById({ _id: id });
      var student = await Student.findById({ _id: sid }).populate({
        path: "user",
      });
      const user = await User.findById({ _id: `${student.user._id}` });
      var transfer = await StudentTransfer.findById({ _id: eid });
      const department = await Department.findById({ _id: did }).populate({
        path: "institute",
      });
      const institute = await InstituteAdmin.findById({
        _id: `${department.institute._id}`,
      });
      const batch = await Batch.findById({ _id: bid });
      const notify = await new Notification({});
      transfer.transferStatus = status;
      classes.ApproveStudent.pull(student);
      department.ApproveStudent.pull(student);
      student.department = "";
      batch.ApproveStudent.pull(student);
      notify.notifyContent = `Your Transfer request has been Approved by ${institute.insName} from ${classes.className}`;
      notify.notifySender = id;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify);
      notify.user = user;
      notify.notifyByStudentPhoto = student;
      await transfer.save();
      await classes.save();
      await department.save();
      await student.save();
      await batch.save();
      await user.save();
      await notify.save();
      res.status(200).send({ message: "Transfer Granted", classes, transfer });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/class/:id/student/:sid/transfer/grant/:eid/department/:did/batch/:bid)`
      );
    }
  }
);

app.post("/ins/:id/staff/transfer/reject/:eid", async (req, res) => {
  try {
    const { id, eid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const transfer = await Transfer.findById({ _id: eid });
    transfer.transferStatus = status;
    await transfer.save();
    res.status(200).send({ message: "Transfer Not Granted", transfer });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/transfer/reject/:eid)`
    );
  }
});

app.post("/class/:id/student/:sid/transfer/reject/:eid", async (req, res) => {
  try {
    const { id, sid, eid } = req.params;
    const { status } = req.body;
    const classes = await Class.findById({ _id: id });
    const student = await Student.findById({ _id: sid }).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${student.user._id}` });
    const transfer = await StudentTransfer.findById({ _id: eid });
    const notify = await new Notification({});
    transfer.transferStatus = status;
    notify.notifyContent = `Your Transfer request has been Rejected by ${classes.className}`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify);
    notify.user = user;
    notify.notifyByStudentPhoto = student;
    await transfer.save();
    await user.save();
    await notify.save();
    res.status(200).send({ message: "Transfer Not Granted", transfer });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/class/:id/student/transfer/reject/:eid)`
    );
  }
});

app.post("/student/:sid/complaint", async (req, res) => {
  try {
    const { sid } = req.params;
    const { complaintHead, complaintType, complaintContent } = req.body;
    const department = await Department.findOne({ _id: complaintHead });
    const classes = await Class.findOne({ _id: complaintHead });
    if (department) {
      const student = await Student.findById({ _id: sid });
      const complaint = await new Complaint({
        complaintType: complaintType,
        complaintContent: complaintContent,
      });
      student.complaints.push(complaint);
      complaint.student = student;
      department.studentComplaint.push(complaint);
      complaint.department = department;
      await student.save();
      await department.save();
      await complaint.save();
      res
        .status(200)
        .send({ message: "Request To Department", complaint, student });
    } else if (classes) {
      const student = await Student.findById({ _id: sid });
      const complaint = await new Complaint({
        complaintType: complaintType,
        complaintContent: complaintContent,
      });
      student.complaints.push(complaint);
      complaint.student = student;
      classes.studentComplaint.push(complaint);
      complaint.classes = classes;
      await student.save();
      await classes.save();
      await complaint.save();
      res.status(200).send({ message: "Request To Class", complaint, student });
    } else {
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/complaint)`
    );
  }
});

app.post("/student/complaint/reply/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const complaint = await Complaint.findById({ _id: id });
    complaint.complaintStatus = status;
    await complaint.save();
    res.status(200).send({ message: "Complaint Resolevd", complaint });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/complaint/reply/:id)`
    );
  }
});

app.post("/student/complaint/:id/institute/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const { status } = req.body;
    const complaint = await Complaint.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: iid });
    institute.studentComplaints.push(complaint);
    complaint.institute = institute;
    complaint.complaintInsStatus = status;
    await institute.save();
    await complaint.save();
    res
      .status(200)
      .send({ message: "Report To Institute", complaint, institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/complaint/:id/institute/:iid)`
    );
  }
});

app.post("/ins/:id/add/field", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const field = await new Field({ ...req.body });
    institute.idCardField.push(field);
    field.institute = institute;
    await institute.save();
    await field.save();
    res.status(200).send({ message: "field added" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/:id/add/field)`);
  }
});

// app.post("/ins/:id/id-card/export", async (req, res) => {
//   // console.log(req.params, req.body)
//   // , fieldText
//   try {
//     const { id } = req.params;
//     const { batchId } = req.body;
//     const institute = await InstituteAdmin.findById({ _id: id });
//     const admin = await Admin.findById({ _id: "${process.env.S_ADMIN_ID}"  });
//     var batch = await Batch.findById({ _id: batchId });
//     if (
//       admin.instituteIdCardBatch.length >= 1 &&
//       admin.instituteIdCardBatch.includes(String(batchId))
//     ) {
//       console.log("yes");
//     } else {
//       institute.idCardBatch.push(batch);
//       admin.instituteIdCardBatch.push(batch);
//       await institute.save();
//       await admin.save();
//       res.status(200).send({ message: "export data", batch, institute, admin });
//     }
//   } catch {}
// });

app.post("/user/:id/user-post/:uid/report", async (req, res) => {
  try {
    const { id, uid } = req.params;
    const { reportStatus } = req.body;
    const user = await User.findById({ _id: id });
    const post = await UserPost.findById({ _id: uid });
    const admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}
`,
    });
    const report = await new Report({ reportStatus: reportStatus });
    admin.reportList.push(report);
    report.reportUserPost = post;
    report.reportBy = user;
    await admin.save();
    await report.save();
    res.status(200).send({ message: "reported", report });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/user-post/:uid/report)`
    );
  }
});

app.post("/ins/:id/ins-post/:uid/report", async (req, res) => {
  try {
    const { id, uid } = req.params;
    const { reportStatus } = req.body;
    const user = await User.findById({ _id: id });
    const post = await Post.findById({ _id: uid });
    const admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}
`,
    });
    const report = await new Report({ reportStatus: reportStatus });
    admin.reportList.push(report);
    report.reportInsPost = post;
    report.reportBy = user;
    await admin.save();
    await report.save();
    res.status(200).send({ message: "reported", report });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/ins-post/:uid/report)`
    );
  }
});

app.patch("/sport/:sid/event/:eid/update", isLoggedIn, async (req, res) => {
  console.log(req.body);
  try {
    const { sid, eid } = req.params;
    const event = await SportEvent.findByIdAndUpdate(eid, req.body);
    await event.save();
    res.status(200).send({ message: "Event Updated", event });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/:sid/event/:eid/update)`
    );
  }
});

app.delete("/sport/:sid/event/:eid/delete", async (req, res) => {
  try {
    const { sid, eid } = req.params;
    var student = await Student.find({});
    for (let i = 0; i < student.length; i++) {
      if (
        student[i].sportEvent.length >= 1 &&
        student[i].sportEvent.includes(String(eid))
      ) {
        console.log("match");
        student[i].sportEvent.pull(eid);
        await student[i].save();
      } else {
      }
    }
    const sport = await Sport.findByIdAndUpdate(sid, {
      $pull: { sportEvent: eid },
    });
    const event = await SportEvent.findByIdAndDelete({ _id: eid });
    res.status(200).send({ message: "Deleted Event", sport, event });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/sport/:sid/event/:eid/delete)`
    );
  }
});

app.post("/ins/:id/id-card/:bid/send/print", async (req, res) => {
  try {
    const { id, bid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}
`,
    });
    const notify = await new Notification({});
    admin.idCardPrinting.push(batch);
    batch.idCardStatus = status;
    notify.notifyContent = `Id Card for ${batch.batchName} is send for Printing`;
    notify.notifySender = admin._id;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyPid = "1";
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
    await admin.save();
    await batch.save();
    await institute.save();
    await notify.save();
    res.status(200).send({ message: "Send for Printing", admin, batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/id-card/:bid/send/print)`
    );
  }
});

app.post("/ins/:id/id-card/:bid/un-send/print", async (req, res) => {
  try {
    const { id, bid } = req.params;
    // const { status } = req.body
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}
`,
    });
    const notify = await new Notification({});
    admin.idCardPrinting.pull(batch);
    batch.idCardStatus = "";
    notify.notifyContent = `Id Card for ${batch.batchName} is not send for Printing Contact at connect@qviple.com`;
    notify.notifySender = admin._id;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
    await admin.save();
    await batch.save();
    await institute.save();
    await notify.save();
    res.status(200).send({ message: "Un Send for Printing", admin, batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/id-card/:bid/un-send/print)`
    );
  }
});

app.post("/ins/:id/id-card/:bid/done", async (req, res) => {
  try {
    const { id, bid } = req.params;
    const { status } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const batch = await Batch.findById({ _id: bid });
    const admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}
`,
    });
    const notify = await new Notification({});
    admin.idCardPrinted.push(batch);
    admin.idCardPrinting.pull(batch);
    batch.idCardStatus = status;
    notify.notifyContent = `Id Card for ${batch.batchName} is being Printed`;
    notify.notifySender = admin._id;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyBySuperAdminPhoto =
      "https://qviple.com/static/media/Mithkal_icon.043e3412.png";
    await admin.save();
    await batch.save();
    await institute.save();
    await notify.save();
    res.status(200).send({ message: "Id Card Printed", admin, batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/id-card/:bid/done)`
    );
  }
});

app.delete("/event/:eid/match/:mid/delete", async (req, res) => {
  try {
    const { eid, mid } = req.params;
    const event = await SportEvent.findById({ _id: eid });
    event.sportEventMatch.pull(mid);
    await event.save();
    const match = await SportEventMatch.findByIdAndDelete({ _id: mid });
    res.status(200).send({ message: "Deleted Event", sport, event });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/event/:eid/match/:mid/delete)`
    );
  }
});

app.post("/user/:id/credit/transfer", async (req, res) => {
  try {
    const { id } = req.params;
    const { transferCredit, transferIns } = req.body;
    const user = await User.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: `${transferIns}` });
    const notify = await new Notification({});
    institute.transferCredit =
      institute.transferCredit + parseInt(transferCredit);
    user.referalPercentage = user.referalPercentage - parseInt(transferCredit);
    institute.userReferral.push(user);
    user.transferInstitute.push(institute);
    notify.notifyContent = `${user.userLegalName} transfer ${transferCredit} points to you`;
    notify.notifySender = id;
    notify.notifyReceiever = institute._id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyByPhoto = user;
    await user.save();
    await institute.save();
    await notify.save();
    res.status(200).send({ message: "transfer", user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/credit/transfer)`
    );
  }
});

app.post("/ins/:id/support", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const support = await new InstituteSupport({ ...req.body });
    institute.supportIns.push(support);
    support.institute = institute;
    await institute.save();
    await support.save();
    res.status(200).send({ message: "Successfully Updated", institute });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/:id/support)`);
  }
});

app.get("/all/ins/support", async (req, res) => {
  try {
    const support = await InstituteSupport.find({}).populate({
      path: "institute",
    });
    res.status(200).send({ message: "all institute support data", support });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/ins/support)`);
  }
});

app.get("/all/user/support", async (req, res) => {
  try {
    const userSupport = await UserSupport.find({}).populate({
      path: "user",
    });
    res
      .status(200)
      .send({ message: "all institute userSupport data", userSupport });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/user/support)`);
  }
});

app.post("/user/:id/support/:sid/reply", async (req, res) => {
  try {
    const { id, sid } = req.params;
    const { queryReply } = req.body;
    const reply = await UserSupport.findById({ _id: sid });
    reply.queryReply = queryReply;
    await reply.save();
    res.status(200).send({ message: "reply", reply });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/support/:sid/reply)`
    );
  }
});

app.post("/ins/:id/support/:sid/reply", async (req, res) => {
  try {
    const { id, sid } = req.params;
    const { queryReply } = req.body;
    const institute = await InstituteAdmin.findById({ _id: id });
    const reply = await InstituteSupport.findById({ _id: sid });
    const notify = await new Notification({});
    reply.queryReply = queryReply;
    notify.notifyContent = `${reply.body} ${reply.queryReply}`;
    notify.notifyReceiever = id;
    institute.iNotify.push(notify);
    notify.institute = institute;
    notify.notifyByInsPhoto = institute;
    await reply.save();
    await institute.save();
    await notify.save();
    res.status(200).send({ message: "reply", reply });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/support/:sid/reply)`
    );
  }
});

app.post("/user/:id/support", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    const support = await new UserSupport({ ...req.body });
    user.support.push(support);
    support.user = user;
    await user.save();
    await support.save();
    res.status(200).send({ message: "Successfully Updated", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/:id/support)`);
  }
});

// ========================== Payment Portal ===========================

app.get("/student/detail/:sid/payment", async (req, res) => {
  try {
    const { sid } = req.params;
    const student = await Student.findById({ _id: sid });
    res
      .status(200)
      .send({ message: "Student Data For Payment Portal", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/detail/:sid/payment)`
    );
  }
});

app.get("/fee/detail/:fid/payment", async (req, res) => {
  try {
    const { fid } = req.params;
    const fee = await Fees.findById({ _id: fid });
    const checklist = await Checklist.findById({ _id: fid });
    if (fee) {
      res.status(200).send({ message: "Fee Data For Payment Portal", fee });
    } else if (checklist) {
      res
        .status(200)
        .send({ message: "Checklist Data For Payment Portal", checklist });
    } else {
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/fee/detail/:fid/payment)`
    );
  }
});

app.get("/admin/all/payment/day", async (req, res) => {
  try {
    const payment = await Payment.find({});
    res.status(200).send({ message: "Data", payment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admin/all/payment/day)`
    );
  }
});

app.get("/all/student/list/data", async (req, res) => {
  try {
    const student = await Student.find({}).populate({
      path: "institute",
    });
    res.status(200).send({ message: "Student data", student });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/student/list/data)`
    );
  }
});

app.get("/all/user/list/data", async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).send({ message: "User data", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/user/list/data)`);
  }
});

app.get("/admin/all/e-content/payment/day", async (req, res) => {
  try {
    const ePayment = await PlaylistPayment.find({});
    res.status(200).send({ message: "Data", ePayment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint("/admin/all/e-content/payment/day)`
    );
  }
});

app.get("/all/playlist/list/data", async (req, res) => {
  try {
    const playlist = await Playlist.find({}).populate({
      path: "elearning",
      populate: {
        path: "elearningHead",
      },
    });
    res.status(200).send({ message: "playlist data", playlist });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/playlist/list/data)`
    );
  }
});

app.get("/all/payment/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.find({ userId: `${id}` });
    res.status(200).send({ message: "pay", payment });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/payment/user/:id)`);
  }
});

app.get("/all/e-content/payment/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const ePayment = await PlaylistPayment.find({ userId: `${id}` });
    res.status(200).send({ message: "pay", ePayment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/e-content/payment/user/:id)`
    );
  }
});

app.get("/all/fee/list/payment", async (req, res) => {
  try {
    const fee = await Fees.find({});
    res.status(200).send({ message: "Fee data", fee });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/fee/list/payment)`);
  }
});

app.get("/all/checklist/list/payment", async (req, res) => {
  try {
    const checklist = await Checklist.find({});
    res.status(200).send({ message: "checklist data", checklist });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/checklist/list/payment)`
    );
  }
});

app.get("/all/institute/list/data", async (req, res) => {
  try {
    const institute = await InstituteAdmin.find({});
    res.status(200).send({ message: "Institute data", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/institute/list/data)`
    );
  }
});

app.get("/all/batch/list/data", async (req, res) => {
  try {
    const batch = await Batch.find({});
    res.status(200).send({ message: "Batch data", batch });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/batch/list/data)`);
  }
});

app.get("/admin/all/id-card/payment/day", async (req, res) => {
  try {
    const iPayment = await IdCardPayment.find({});
    res.status(200).send({ message: "Data", iPayment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admin/all/id-card/payment/day)`
    );
  }
});

app.get("/all/video/list/data", async (req, res) => {
  try {
    const video = await Video.find({});
    res.status(200).send({ message: "Video Data", video });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/all/video/list/data)`);
  }
});

app.post("/user/:id/deactivate/account", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ddate } = req.body;
    const user = await User.findById({ _id: id });
    user.activeStatus = status;
    user.activeDate = ddate;
    await user.save();
    res.clearCookie("SessionID", { path: "/" });
    res.status(200).send({ message: "Deactivated Account", user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/deactivate/account)`
    );
  }
});

app.post("/user/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById({ _id: "623b803ab9b2954fcea8328e" });
    const user = await User.findById({ _id: id });
    const feed = await new Feedback({});
    feed.rating = req.body.rating;
    feed.bestPart = req.body.bestPart;
    feed.worstPart = req.body.worstPart;
    feed.suggestion = req.body.suggestion;
    feed.user = user;
    admin.feedbackList.push(feed);
    await feed.save();
    await admin.save();
    res.status(200).send({ message: "Feedback" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/feedback/:id)`);
  }
});

app.post("/feedback/remind/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { remindDate } = req.body;
    const user = await User.findById({ _id: id });
    user.remindLater = remindDate;
    await user.save();
    res.status(200).send({ message: "Remind me Later" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/feedback/remind/:id)`);
  }
});

app.get("/all/application/payment/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const aPayment = await ApplyPayment.find({ userId: `${id}` });
    res.status(200).send({ message: "Data", aPayment });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/application/payment/user/:id)`
    );
  }
});

app.get("/all/application/list/data", async (req, res) => {
  try {
    const application = await DepartmentApplication.find({});
    res.status(200).send({ message: "Application Data", application });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/all/application/list/data)`
    );
  }
});

//===================FOR THE USER ORUTE ONLY=============================

var OTP = "";

const generateOTP = async (mob) => {
  let rand1 = Math.floor(Math.random() * 9) + 1;
  let rand2 = Math.floor(Math.random() * 9) + 1;
  let rand3 = Math.floor(Math.random() * 9) + 1;
  let rand4 = Math.floor(Math.random() * 9) + 1;
  OTP = `${rand1}${rand2}${rand3}${rand4}`;
  const data = axios
    .post(
      `http://mobicomm.dove-sms.com//submitsms.jsp?user=Mithkal&key=4c3168d558XX&mobile=+91${mob}&message=Welcome to Qviple, Your Qviple account verification OTP is ${OTP} Mithkal Minds Pvt Ltd.&senderid=QVIPLE&accusage=6`
    )
    .then((res) => {
      if ((res && res.data.includes("success")) || res.data.includes("sent")) {
        console.log("messsage Sent Successfully");
      } else {
        console.log("something went wrong");
      }
    });
};

app.post("/user-detail", async (req, res) => {
  try {
    const { userPhoneNumber, status } = req.body;
    // console.log(req.body);
    if (userPhoneNumber) {
      if (status === "Not Verified") {
        // client.verify
        //   .services(data.SERVICEID)
        //   .verifications.create({
        //     to: `+91${userPhoneNumber}`,
        //     channel: "sms",
        //   })
        generateOTP(userPhoneNumber).then((data) => {
          res.status(200).send({
            message: "code will be send to registered mobile number",
            userPhoneNumber,
          });
        });
      } else {
        res.send({ message: "User will be verified..." });
      }
    } else {
      res.send({ message: "Invalid Phone No." });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user-detail)`);
  }
});

app.post("/user-detail-verify/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.userOtpCode && req.body.userOtpCode === OTP) {
      console.log("Valid OTP");
      var userStatus = "approved";
      res.send({ message: "OTP verified", id, userStatus });
    } else {
      res.send({ message: "Invalid OTP" });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user-detail-verify/:id)`
    );
  }
});

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

app.post("/profile-creation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const {
      userLegalName,
      userGender,
      userAddress,
      userBio,
      userDateOfBirth,
      username,
      status,
    } = req.body;
    const existAdmin = await Admin.findOne({ adminUserName: username });
    const existInstitute = await InstituteAdmin.findOne({ name: username });
    const existUser = await User.findOne({ username: username });
    if (existAdmin) {
      res.status(200).send({ message: "Username already exists" });
    } else if (existInstitute) {
      res.status(200).send({ message: "Username already exists" });
    } else {
      // const users = await User.findOne({ $or: [{ username: req.body.username }, { userPhoneNumber: req.body.userPhoneNumber } ]})
      if (existUser) {
        res.send({ message: "Username already exists" });
      } else {
        const user = await new User({
          userLegalName: userLegalName,
          userGender: userGender,
          userAddress: userAddress,
          userBio: userBio,
          userDateOfBirth: userDateOfBirth,
          username: username,
          userStatus: "Approved",
          userPhoneNumber: id,
          photoId: "1",
          coverId: "2",
          createdAt: c_date,
          remindLater: rDate,
        });
        admins.users.push(user);
        await admins.save();
        await user.save();
        res
          .status(200)
          .send({ message: "Profile Successfully Created...", user });
      }
    }
  } catch (e) {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/profile-creation/:id)`,
      e
    );
  }
});

app.get("/create-user-password", (req, res) => {
  try {
    res.render("CreateUserPassword");
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/create-user-password)`);
  }
});

app.post("/create-user-password/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userPassword, userRePassword } = req.body;
    const user = await User.findById({ _id: id });
    const genUserPass = await bcrypt.genSaltSync(12);
    const hashUserPass = await bcrypt.hashSync(
      req.body.userPassword,
      genUserPass
    );
    if (user) {
      if (userPassword === userRePassword) {
        user.userPassword = hashUserPass;
        await user.save();
        req.session.user = user;
        res.send({ message: "Password successfully created...", user });
      } else {
        res.send({ message: "Invalid Password Combination" });
      }
    } else {
      res.send({ message: "Invalid User" });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/create-user-password/:id)`
    );
  }
});

app.get("/userdashboard", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).send({ message: "All User List", users });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/userdashboard)`);
  }
});

app.get("/userdashboard/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .populate({
        path: "userPosts",
        populate: {
          path: "userComment",
          populate: {
            path: "users",
          },
        },
        populate: {
          path: "tagPeople",
          select: "userLegalName photoId profilePhoto",
        },
      })
      .populate({
        path: "staff",
        populate: {
          path: "institute",
        },
      })
      .populate({
        path: "userPosts",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "student",
        populate: {
          path: "institute",
        },
      })
      .populate({
        path: "userFollowers",
        populate: {
          path: "userPosts",
          populate: {
            path: "userComment",
            populate: {
              path: "users",
            },
          },
        },
      })
      .populate({
        path: "userInstituteFollowing",
        populate: {
          path: "announcement",
        },
      })
      .populate("announcement")
      .populate({
        path: "student",
        populate: {
          path: "studentClass",
        },
      })
      .populate({
        path: "saveUsersPost",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "userPosts",
        populate: {
          path: "userlike",
        },
      })
      .populate("InstituteReferals")
      .populate({
        path: "staff",
        populate: {
          path: "staffAdmissionAdmin",
        },
      })
      .populate({
        path: "saveUserInsPost",
        populate: {
          path: "institute",
        },
      })
      .populate({
        path: "role",
        populate: {
          path: "userSelectStaffRole",
        },
      })
      .populate("InstituteReferals")
      .populate({
        path: "role",
        populate: {
          path: "userSelectStudentRole",
        },
      })
      .populate({
        path: "userInstituteFollowing",
        populate: {
          path: "posts",
          populate: {
            path: "institute",
          },
        },
      })
      .populate({
        path: "userFollowing",
        populate: {
          path: "userPosts",
          populate: {
            path: "userComment",
            populate: {
              path: "users",
            },
          },
        },
      })
      .populate({
        path: "staff",
        populate: {
          path: "staffDepartment",
        },
      })
      .populate({
        path: "userInstituteFollowing",
        populate: {
          path: "posts",
          populate: {
            path: "comment",
            populate: {
              path: "instituteUser",
            },
          },
        },
      })
      .populate({
        path: "staff",
        populate: {
          path: "staffClass",
        },
      })
      .populate({
        path: "userInstituteFollowing",
        populate: {
          path: "posts",
          populate: {
            path: "comment",
            populate: {
              path: "institutes",
            },
          },
        },
      })
      .populate({
        path: "userCircle",
        populate: {
          path: "userPosts",
          populate: {
            path: "userComment",
            populate: {
              path: "users",
            },
          },
        },
      })
      .populate({
        path: "staff",
        populate: {
          path: "staffSubject",
        },
      })
      .populate({
        path: "userCircle",
        populate: {
          path: "userPosts",
          populate: {
            path: "user",
          },
        },
      })
      .populate("addUser")
      .populate({
        path: "staff",
        populate: {
          path: "financeDepartment",
        },
      })
      .populate("addUserInstitute")
      .populate({
        path: "staff",
        populate: {
          path: "sportDepartment",
        },
      })
      .populate({
        path: "student",
        populate: {
          path: "studentClass",
          populate: {
            path: "ApproveStudent",
          },
        },
      })
      .populate({
        path: "staff",
        populate: {
          path: "staffSportClass",
        },
      })
      .populate({
        path: "support",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "staff",
        populate: {
          path: "elearning",
        },
      })
      .populate("videoPurchase")
      .populate({
        path: "staff",
        populate: {
          path: "library",
        },
      })
      .populate("InstituteReferals")
      .populate("admissionPaymentList");
    res.status(200).send({ message: "Your User", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/userdashboard/:id)`);
  }
});

app.get("/userdashboard/:id/user-post", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    res.render("userPost", { user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post)`
    );
  }
});

app.post("/userdashboard/:id/user-post", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    const post = new UserPost({ ...req.body });
    post.imageId = "1";
    user.userPosts.push(post);
    post.user = user._id;
    await user.save();
    await post.save();
    res.status(200).send({ message: "Post Successfully Created", user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post)`
    );
  }
});

app.post(
  "/userdashboard/:id/user-post/image",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const results = await uploadDocFile(file);
      const user = await User.findById({ _id: id });
      const post = new UserPost({ ...req.body });
      const tag = req.body.people.split(",");
      for (let val of tag) {
        post.tagPeople.push(val);
      }
      post.imageId = "0";
      post.userCreateImage = results.Key;
      // console.log("this is fronted post data : ", post);
      user.userPosts.push(post);
      post.user = user._id;
      await user.save();
      await post.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Post Successfully Created", user });
    } catch (e) {
      console.log(e);
    }
  }
);

app.post(
  "/userdashboard/:id/user-post/image",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const results = await uploadDocFile(file);
      const user = await User.findById({ _id: id });
      const post = new UserPost({ ...req.body });
      post.imageId = "0";
      post.userCreateImage = results.Key;
      // console.log("this is fronted post data : ", post);
      user.userPosts.push(post);
      post.user = user._id;
      await user.save();
      await post.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Post Successfully Created", user });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post/image)`
      );
    }
  }
);

app.get("/userdashboard/user-post/images/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userdashboard/user-post/images/:key)`
    );
  }
});

////////////FOR THE VIDEO UPLOAD//////////////////////////////////

app.post(
  "/userdashboard/:id/user-post/video",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const results = await uploadVideo(file);
      const user = await User.findById({ _id: id });
      const post = new UserPost({ ...req.body });
      const tag = req.body.people.split(",");
      for (let val of tag) {
        post.tagPeople.push(val);
      }
      post.userCreateVideo = results.Key;
      post.imageId = "1";
      user.userPosts.push(post);
      post.user = user._id;
      await user.save();
      await post.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Post Successfully Created", user });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post/video)`
      );
    }
  }
);

app.get("/userdashboard/user-post/video/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userdashboard/user-post/video/:key)`
    );
  }
});
////////////////////////////

app.put(
  "/userdashboard/:id/user-post/:uid/update",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, uid } = req.params;
      const { userPostStatus } = req.body;
      const userpost = await UserPost.findById({ _id: uid });
      userpost.userPostStatus = userPostStatus;
      await userpost.save();
      res.status(200).send({ message: "visibility change", userpost });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post/:uid/update)`
      );
    }
  }
);

app.delete(
  "/userdashboard/:id/user-post/:uid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, uid } = req.params;
      await User.findByIdAndUpdate(id, { $pull: { userPosts: uid } });
      await User.findByIdAndUpdate(id, { $pull: { saveUsersPost: uid } });
      await UserPost.findByIdAndDelete({ _id: uid });
      res.status(200).send({ message: "deleted Post" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userdashboard/:id/user-post/:uid)`
      );
    }
  }
);

////////////////////////////

app.post("/userprofileabout/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    user.userAbout = req.body.userAbout;
    user.userCity = req.body.userCity;
    user.userState = req.body.userState;
    user.userCountry = req.body.userCountry;
    user.userHobbies = req.body.userHobbies;
    user.userEducation = req.body.userEducation;
    await user.save();
    res.status(200).send({ message: "About Updated", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/userprofileabout/:id)`);
  }
});
app.get("/userprofileabout/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userprofileabout/photo/:key)`
    );
  }
});

app.post(
  "/userprofileabout/photo/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const width = 200;
      const height = 200;
      const results = await uploadFile(file, width, height);
      // console.log("Uploaded photo in aws");
      const user = await User.findById({ _id: id });
      user.profilePhoto = results.key;
      user.photoId = "0";
      await user.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Successfully photo change" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userprofileabout/photo/:id)`
      );
    }
  }
);
app.get("/userprofileabout/coverphoto/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/userprofileabout/coverphoto/:key)`
    );
  }
});

app.post(
  "/userprofileabout/coverphoto/:id",
  isLoggedIn,
  upload.single("file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file;
      const width = 900;
      const height = 260;
      const results = await uploadFile(file, width, height);
      const user = await User.findById({ _id: id });
      user.profileCoverPhoto = results.key;
      user.coverId = "0";

      await user.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "Successfully cover photo change" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/userprofileabout/coverphoto/:id)`
      );
    }
  }
);

////////////////////////////////

app.post("/user/post/like", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const userpost = await UserPost.findById({ _id: postId });
    const user_sessions = req.session.user;
    const institute_sessions = req.session.institute;
    if (user_sessions) {
      if (
        userpost.userlike.length >= 0 &&
        userpost.userlike.includes(String(user_sessions._id))
      ) {
        // console.log("You already liked it");
        // console.log(userpost.userlike.length);
        // console.log(userpost.userlike.includes(String(user_sessions._id)));
      } else {
        userpost.userlike.push(user_sessions._id);
        await userpost.save();
        res.status(200).send({ message: "Added To Likes", userpost });
      }
    } else if (institute_sessions) {
      if (
        userpost.userlikeIns.length >= 1 &&
        userpost.userlikeIns.includes(String(institute_sessions._id))
      ) {
        // console.log("You already liked it institute");
      } else {
        userpost.userlikeIns.push(institute_sessions._id);
        await userpost.save();
        res.status(200).send({ message: "Added To Likes", userpost });
      }
    } else {
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/post/like)`);
  }
});

app.post("/user/post/unlike", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const userpost = await UserPost.findById({ _id: postId });
    const user_sessions = req.session.user;
    const institute_sessions = req.session.institute;
    if (user_sessions) {
      userpost.userlike.pull(user_sessions._id);
      await userpost.save();
      // console.log("delete");
      res.status(200).send({ message: "Removed from Likes", userpost });
    } else if (institute_sessions) {
      userpost.userlikeIns.pull(institute_sessions._id);
      await userpost.save();
      res.status(200).send({ message: "Removed from Likes", userpost });
    } else {
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/post/unlike)`);
  }
});

app.post("/user/post/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.params, req.body);
    const userpost = await UserPost.findById({ _id: id }).populate({
      path: "userComment",
      populate: {
        path: "users",
        select: "userLegalName photoId profilePhoto",
      },
    });
    const usercomment = await new UserComment({ ...req.body });
    if (req.session.institute) {
      // usercomment.userInstitute.push(req.session.institute._id)
      usercomment.userInstitute = req.session.institute;
    } else {
      // usercomment.users.push(req.session.user._id)
      usercomment.users = req.session.user;
    }
    userpost.userComment.push(usercomment);
    usercomment.userpost = userpost;
    await userpost.save();
    await usercomment.save();
    const newUserpostData = await UserPost.findById({ _id: id }).populate({
      path: "userComment",
      populate: {
        path: "users",
        select: "userLegalName photoId profilePhoto",
      },
    });
    res
      .status(200)
      .send({ message: "Successfully Commented", userpost, newUserpostData });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/post/comments/:id)`
    );
  }
});

app.put("/user/follow-ins/institute", async (req, res) => {
  try {
    const user = await User.findById({ _id: req.session.user._id });
    const sinstitute = await InstituteAdmin.findById({
      _id: req.body.InsfollowId,
    });
    // user.userInstituteFollowing.pull(req.body.InsfollowId, 2)
    // sinstitute.userFollowersList.pull(req.session.user._id)
    // await user.save()
    // await sinstitute.save()

    if (sinstitute.userFollowersList.includes(req.session.user._id)) {
      res.status(200).send({ message: "You Already Following This Institute" });
    } else {
      const notify = await new Notification({});
      sinstitute.userFollowersList.push(req.session.user._id);
      user.userInstituteFollowing.push(req.body.InsfollowId);
      notify.notifyContent = `${user.userLegalName} started to following you`;
      notify.notifySender = user._id;
      notify.notifyReceiever = sinstitute._id;
      sinstitute.iNotify.push(notify);
      notify.institute = sinstitute;
      notify.notifyByPhoto = user;
      await user.save();
      await sinstitute.save();
      await notify.save();
      res.status(200).send({ message: "Following This Institute" });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/follow-ins/institute)`
    );
  }
});

app.put("/user/unfollow/institute", async (req, res) => {
  try {
    const user = await User.findById({ _id: req.session.user._id });
    const sinstitute = await InstituteAdmin.findById({
      _id: req.body.InsfollowId,
    });

    if (sinstitute.userFollowersList.includes(req.session.user._id)) {
      user.userInstituteFollowing.pull(req.body.InsfollowId);
      sinstitute.userFollowersList.pull(req.session.user._id);
      await user.save();
      await sinstitute.save();
    } else {
      res.status(200).send({ message: "You Already Unfollow This Institute" });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/unfollow/institute)`
    );
  }
});

app.post("/user-search-profile", isLoggedIn, async (req, res) => {
  try {
    // console.log(req.body
    const user = await User.findOne({
      userLegalName: req.body.userSearchProfile,
    });
    res.status(200).send({ message: "Search User Here", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user-search-profile)`);
  }
});

app.put("/user/follow-ins", async (req, res) => {
  try {
    const user = await User.findById({ _id: req.session.user._id });
    const suser = await User.findById({ _id: req.body.userFollowId });

    // if(user.userCircle.includes(req.body.userFollowId) && suser.userCircle.includes(req.session.user._id)){
    //     res.status(200).send({ message: 'You are Already In a Circle You Will not follow'})
    // }
    // else{
    if (user.userFollowing.includes(req.body.userFollowId)) {
      res.status(200).send({ message: "You Already Following This User" });
    } else {
      const notify = await new Notification({});
      suser.userFollowers.push(req.session.user._id);
      user.userFollowing.push(req.body.userFollowId);
      notify.notifyContent = `${user.userLegalName} started to following you`;
      notify.notifySender = user._id;
      notify.notifyReceiever = suser._id;
      suser.uNotify.push(notify);
      notify.user = suser;
      notify.notifyByPhoto = user;
      await user.save();
      await suser.save();
      await notify.save();
      res.status(200).send({ message: " Following This User" });
    }
    // }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/follow-ins)`);
  }
});

app.put("/user/circle-ins", async (req, res) => {
  try {
    const user = await User.findById({ _id: req.session.user._id });
    const suser = await User.findById({ _id: req.body.followId });

    if (
      user.userCircle.includes(req.body.followId) &&
      suser.userCircle.includes(req.session.user._id)
    ) {
      res.status(200).send({ message: "You are Already In a Circle" });
    } else {
      const newConversation = new Conversation({
        members: [req.session.user._id, req.body.followId],
      });
      try {
        const savedConversation = await newConversation.save();
        user.conversation = newConversation;
        suser.conversation = newConversation;
        await user.save();
        await suser.save();
        res.status(200).json(savedConversation);
      } catch (err) {
        res.status(500).json(err);
      }
      try {
        const notify = await new Notification({});
        suser.userFollowing.pull(req.session.user._id);
        user.userFollowers.pull(req.body.followId);
        suser.userCircle.push(req.session.user._id);
        user.userCircle.push(req.body.followId);
        notify.notifyContent = `${user.userLegalName} has been added to your circle`;
        notify.notifySender = user._id;
        notify.notifyReceiever = suser._id;
        suser.uNotify.push(notify);
        notify.user = suser;
        notify.notifyByPhoto = user;
        await user.save();
        await suser.save();
        await notify.save();
      } catch {
        res.status(500).send({ error: "error" });
      }
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/circle-ins)`);
  }
});

app.put("/user/uncircle-ins", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById({ _id: req.session.user._id });
    const suser = await User.findById({ _id: req.body.followId });

    if (
      user.userCircle.includes(req.body.followId) &&
      suser.userCircle.includes(req.session.user._id)
    ) {
      try {
        user.userCircle.pull(req.body.followId);
        suser.userCircle.pull(req.session.user._id);
        user.userFollowers.push(req.body.followId);
        suser.userFollowing.push(req.session.user._id);
        user.conversation = "";
        suser.conversation = "";
        // console.log(id, ids)
        // console.log(suser, user.userFollowing)
        await user.save();
        await suser.save();
      } catch {
        res.status(500).send({ error: "error" });
      }
    } else {
      res.status(200).send({ message: "You are Not In a Circle" });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/uncircle-ins)`);
  }
});

app.post("/user/forgot", async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username: username });
    const institute = await InstituteAdmin.findOne({ name: username });
    if (user) {
      generateOTP(user.userPhoneNumber).then((data) => {
        res.status(200).send({
          message: "code will be send to registered mobile number",
          user,
        });
      });
    } else if (institute) {
      generateOTP(institute.insPhoneNumber).then((data) => {
        res.status(200).send({
          message: "code will be send to registered mobile number",
          institute,
        });
      });
    } else {
      res.status(200).send({ message: "Invalid Username" });
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/forgot)`);
  }
});

app.post("/user/forgot/:fid", async (req, res) => {
  try {
    const { fid } = req.params;
    const user = await User.findById({ _id: fid });
    const institute = await InstituteAdmin.findById({ _id: fid });
    if (user) {
      if (req.body.userOtpCode && req.body.userOtpCode === OTP) {
        console.log("Valid OTP By User F");
        res.status(200).send({ message: "Otp verified", user });
      } else {
        console.log("Invalid OTP By User F");
      }
    } else if (institute) {
      if (req.body.userOtpCode && req.body.userOtpCode === OTP) {
        console.log("Valid OTP By Institute F");
        res.status(200).send({ message: "Otp verified", institute });
      } else {
        console.log("Invalid OTP By Institute F");
      }
    } else {
    }
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/forgot/:fid)`);
  }
});

app.post("/user/reset/password/:rid", async (req, res) => {
  try {
    const { rid } = req.params;
    const { userPassword, userRePassword } = req.body;
    const user = await User.findById({ _id: rid });
    const institute = await InstituteAdmin.findById({ _id: rid });
    const genUserPass = await bcrypt.genSaltSync(12);
    const hashUserPass = await bcrypt.hashSync(
      req.body.userPassword,
      genUserPass
    );
    if (user) {
      if (userPassword === userRePassword) {
        user.userPassword = hashUserPass;
        // console.log(user.userPassword);
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
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/reset/password/:rid)`
    );
  }
});

app.post("/user-announcement/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    const announcements = await new UserAnnouncement({ ...req.body });
    user.announcement.push(announcements);
    announcements.user = user;
    await user.save();
    await announcements.save();
    res.status(200).send({ message: "Successfully Created" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user-announcement/:id)`
    );
  }
});

// Institute Announcement Details
app.get("/user-announcement-detail/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await UserAnnouncement.findById({ _id: id }).populate(
      "user"
    );
    res.status(200).send({ message: "Announcement Detail", announcement });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user-announcement-detail/:id)`
    );
  }
});

app.post("/user/save/post", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const user = await User.findById({ _id: req.session.user._id });
    const userPostsData = await UserPost.findById({ _id: postId });
    user.saveUsersPost.push(userPostsData);
    await user.save();
    res.status(200).send({ message: "Added To favourites", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/save/post)`);
  }
});

app.post("/user/unsave/post", isLoggedIn, async (req, res) => {
  try {
    const { postId } = req.body;
    const user = await User.findById({ _id: req.session.user._id });
    const userPostsData = await UserPost.findById({ _id: postId });
    user.saveUsersPost.pull(postId);
    await user.save();
    res.status(200).send({ message: "Remove To favourites", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/unsave/post)`);
  }
});

app.post("/user/phone/info/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { userPhoneNumber } = req.body;
    const user = await User.findById({ _id: id });
    user.userPhoneNumber = userPhoneNumber;
    await user.save();
    res.status(200).send({ message: "Mobile No Updated", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/phone/info/:id)`);
  }
});

app.patch("/user/personal/info/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, req.body);
    await user.save();
    res.status(200).send({ message: "Personal Info Updated", user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/personal/info/:id)`
    );
  }
});

app.post("/user/:id/add/ins/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const user = await User.findById({ _id: id });
    const institute = await InstituteAdmin.findById({ _id: iid });
    user.addUserInstitute.push(institute);
    institute.addInstituteUser.push(user);
    await user.save();
    await institute.save();
    res.status(200).send({ message: "Added", user, institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/add/ins/:iid)`
    );
  }
});

app.post("/user/:id/add/user/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const user = await User.findById({ _id: id });
    const userNew = await User.findById({ _id: iid });
    user.addUser.push(userNew);
    userNew.addUser.push(user);
    await user.save();
    await userNew.save();
    res.status(200).send({ message: "Added", user, userNew });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/add/user/:iid)`
    );
  }
});

app.post("/ins/:id/add/ins/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const instituteNew = await InstituteAdmin.findById({ _id: iid });
    institute.addInstitute.push(instituteNew);
    instituteNew.addInstitute.push(institute);
    await institute.save();
    await instituteNew.save();
    res.status(200).send({ message: "Added", institute, instituteNew });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/ins/:id/add/ins/:iid)`);
  }
});

app.post("/ins/:id/add/user/:iid", async (req, res) => {
  try {
    const { id, iid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const user = await User.findById({ _id: iid });
    institute.addInstituteUser.push(user);
    user.addUserInstitute.push(institute);
    await institute.save();
    await user.save();
    res.status(200).send({ message: "Added", institute, user });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/ins/:id/add/user/:iid)`
    );
  }
});

////////////////////////////////////////////////////////////
//////////////////////////////////

////////////////////////////THIS IS E CONTENT API////////////////////////

// =========================================================== FOR ALL E CONTENT ROUTE =================================================
app.get("/insdashboard/:id/e-content", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate(
      "elearning"
    );
    res.status(200).send({ message: "data is fetched", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/e-content)`
    );
  }
});

app.post("/insdashboard/:id/e-content", async (req, res) => {
  try {
    const insId = req.params.id;
    const { sid } = req.body;
    const institute = await InstituteAdmin.findById({ _id: insId });
    const staff = await Staff.findById({ _id: sid });
    const elearning = new ELearning({
      elearningHead: sid,
      institute: insId,
      photoId: "1",
      coverId: "2",
    });
    institute.elearningActivate = "Activated";
    institute.elearning = elearning._id;
    staff.elearning.push(elearning._id);
    await institute.save();
    await staff.save();
    await elearning.save();
    res.status(200).send({ message: "E Learning is successfully is updated" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/e-content)`
    );
  }
});

app.get("/insdashboard/:id/e-content/info", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const elearning = await ELearning.findById({
      _id: institute.elearning,
    })
      .populate("elearningHead")
      .populate("playlist");
    res
      .status(200)
      .send({ message: "E Learning is successfully is updated", elearning });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/e-content/info)`
    );
  }
});

////////////FOR AS THE USER ONLY////////////////////
app.get("/playlist", async (req, res) => {
  try {
    const playlist = await Playlist.find({}).populate({
      path: "topic",
      populate: {
        path: "video",
      },
    });
    res.status(200).send({ message: "fetched all details", playlist });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist)`);
  }
});

/////////////FOR THE USER SIDE//////////////////////

app.get("/e-content/:eid", async (req, res) => {
  try {
    const { eid } = req.params;
    const elearning = await ELearning.findById({ _id: eid }).populate({
      path: "institute",
      populate: {
        path: "classRooms",
      },
    });
    res
      .status(200)
      .send({ message: "E Learning is successfully is updated", elearning });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/e-content/:eid)`);
  }
});

app.post("/e-content/:eid", async (req, res) => {
  try {
    const { eid } = req.params;
    const {
      emailId,
      phoneNumber,
      vision,
      mission,
      about,
      award,
      achievement,
      activities,
    } = req.body;
    const elearning = await ELearning.findById({
      _id: eid,
    });
    elearning.emailId = emailId;
    elearning.phoneNumber = phoneNumber;
    elearning.vision = vision;
    elearning.mission = mission;
    elearning.about = about;
    elearning.award = award;
    elearning.achievement = achievement;
    elearning.activities = activities;
    await elearning.save();
    res
      .status(200)
      .send({ message: "E Learning is successfully is updated", elearning });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/e-content/:eid)`);
  }
});

app.get("/e-content/:eid/:photo", async (req, res) => {
  try {
    const photo = req.params.photo;
    const readStream = getFileStream(photo);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/e-content/:eid/:photo)`
    );
  }
});

app.post("/e-content/:eid/photo", upload.single("file"), async (req, res) => {
  try {
    const { eid } = req.params;
    const file = req.file;
    const elearning = await ELearning.findById({ _id: eid });
    if (elearning.photo) {
      await deleteFile(elearning.photo);
    }
    const width = 200;
    const height = 200;
    const results = await uploadFile(file, width, height);
    elearning.photoId = "0";
    elearning.photo = results.key;
    await elearning.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Photo is uploades" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/e-content/:eid/photo)`);
  }
});

app.get("/e-content/:eid/:cover", async (req, res) => {
  try {
    const cover = req.params.cover;
    const readStream = getFileStream(cover);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/e-content/:eid/:cover)`
    );
  }
});

app.post("/e-content/:eid/cover", upload.single("file"), async (req, res) => {
  try {
    const { eid } = req.params;
    const file = req.file;
    const elearning = await ELearning.findById({ _id: eid });
    if (elearning.cover) {
      await deleteFile(elearning.cover);
    }
    const width = 1000;
    const height = 260;
    const results = await uploadFile(file, width, height);
    // console.log(results);
    elearning.coverId = "0";
    elearning.cover = results.key;
    await elearning.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Photo is uploades" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/e-content/:eid/cover)`);
  }
});

///////////////////////////////////FOR MAKING THE PLAYLIST FUNCTIONALITY////////////////////////////
app.get("/:eid/playlist", async (req, res) => {
  try {
    const { eid } = req.params;
    const elearning = await ELearning.findById({ _id: eid }).populate({
      path: "playlist",
    });
    res.status(200).send({ message: "All playlist is fetched", elearning });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/:eid/playlist)`);
  }
});

app.post("/:eid/playlist/create", upload.single("file"), async (req, res) => {
  try {
    const { eid } = req.params;
    const file = req.file;
    const width = 300;
    const height = 160;
    const results = await uploadFile(file, width, height);
    const playlist = new Playlist(req.body);
    const elearning = await ELearning.findById({ _id: eid });
    const classMe = await Class.findById({ _id: req.body.class });
    elearning.playlist.push(playlist._id);
    classMe.playlist.push(playlist._id);
    playlist.photo = results.key;
    playlist.elearning = eid;
    await classMe.save();
    await elearning.save();
    await playlist.save();
    await unlinkFile(file.path);
    res
      .status(200)
      .send({ message: "playlist is created successfully", playlist });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/:eid/playlist/create)`);
  }
});

app.get("/playlist/thumbnail/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/playlist/thumbnail/:key)`
    );
  }
});

app.get("/playlist/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid })
      .populate({
        path: "elearning",
        populate: {
          path: "institute",
          populate: {
            path: "classRooms",
          },
        },
      })
      .populate({
        path: "class",
      })
      .populate({
        path: "elearning",
        populate: {
          path: "institute",
          populate: {
            path: "financeDepart",
          },
        },
      });
    res.status(200).send({ message: "Single playlist is fetched", playlist });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid)`);
  }
});

app.patch("/playlist/:pid/edit", async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findByIdAndUpdate(pid, req.body);
    playlist.save();
    res.status(201).send({ message: "Edited Successfull" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid/edit)`);
  }
});

app.put("/playlist/:pid/edit", upload.single("file"), async (req, res) => {
  try {
    const { pid } = req.params;
    const file = req.file;
    const playlist = await Playlist.findByIdAndUpdate(pid, req.body);
    if (playlist.photo) {
      await deleteFile(playlist.photo);
    }
    const width = 300;
    const height = 160;
    const results = await uploadFile(file, width, height);
    playlist.photo = results.key;
    await playlist.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Edited Successfull" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid/edit)`);
  }
});

app.delete("/playlist/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid });
    const elearning = await ELearning.findById({ _id: playlist.elearning });
    elearning.playlist.pull(pid);
    for (let cls of playlist.class) {
      const clas = await Class.findById({ _id: cls });
      clas.playlist.pull(pid);
      await clas.save();
    }
    for (let join of playlist.joinNow) {
      const user = await User.findById({ _id: join });
      user.playlistJoin.pull(pid);
      await user.save();
    }
    for (let top of playlist.topic) {
      const topic = await Topic.findById({ _id: top });
      for (let vid of topic.video) {
        const video = await Video.findById({ _id: vid });
        for (let reso of video.resource) {
          const resource = await Resource.findById({ _id: reso });
          for (let keys of resource.resourceKeys) {
            const resKey = await ResourcesKey.findById({ _id: keys });
            if (resKey.resourceKey) {
              await deleteFile(resKey.resourceKey);
            }
            await ResourcesKey.deleteOne({ _id: keys });
          }
          await Resource.deleteOne({ _id: reso });
        }

        for (let vlik of video.userLike) {
          const user = await User.findById({ _id: vlik });
          user.videoLike.pull(vid);
        }
        for (let vsav of video.userSave) {
          const user = await User.findById({ _id: vsav });
          user.userSave.pull(vid);
        }
        for (let ucom of video.userComment) {
          await VideoComment.deleteOne({ _id: ucom });
        }

        if (video.video) {
          await deleteFile(video.video);
        }
        await Video.deleteOne({ _id: vid });
      }

      await Topic.deleteOne({ _id: top });
    }

    if (playlist.photo) {
      await deleteFile(playlist.photo);
    }
    await Playlist.deleteOne({ _id: pid });
    // await Playlist.findByIdAndDelete({ _id: pid });
    await elearning.save();
    res.status(201).send({ message: "playlist is deleted:" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid)`);
  }
});

//////////////////FOR THE TOPIC ADD AND RETRIEVE /////////////////
app.get("/playlist/:pid/topic", async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid }).populate({
      path: "topic",
      populate: {
        path: "video",
      },
    });

    res.status(200).send({ message: "playlist is fetched ", playlist });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid/topic)`);
  }
});

app.post("/playlist/:pid/topic", async (req, res) => {
  try {
    const { pid } = req.params;
    const topic = new Topic(req.body);
    const playlist = await Playlist.findById({ _id: pid });
    playlist.topic.push(topic._id);
    topic.playlist = pid;
    await topic.save();
    await playlist.save();
    res.status(200).send({ message: "topic is Created " });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid/topic)`);
  }
});

//////////////////////////////FOR THE UPLOAD VIDEO/////////////////////

app.post("/topic/:tid/upload", upload.single("file"), async (req, res) => {
  try {
    const { tid } = req.params;
    const file = req.file;
    const fileStream = fs.createReadStream(file.path);
    const videoTime = await getVideoDurationInSeconds(fileStream);
    const time = new Date(videoTime * 1000).toISOString().slice(116);
    const timeInHour = videoTime / 3600;
    const results = await uploadVideo(file);
    const { name, price, access } = req.body;
    const topic = await Topic.findById({ _id: tid }).populate({
      path: "playlist",
    });
    const playlist = await Playlist.findById({ _id: topic.playlist._id });
    const videoName =
      topic.playlist.name + " | " + topic.topicName + " | " + name;
    const videoKey = results.Key;
    const video = new Video({
      name: videoName,
      videoName: file.originalname,
      access: access,
      video: videoKey,
      price: price,
      topic: tid,
      videoTime: time,
      fileName: name,
    });
    topic.video.push(video._id);
    playlist.time = playlist.time + timeInHour;
    playlist.lecture = playlist.lecture + 1;
    await playlist.save();
    await topic.save();
    await video.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "video is uploaded " });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/topic/:tid/upload)`);
  }
});

app.get("/oneVideo/:vid", async (req, res) => {
  try {
    const { vid } = req.params;
    const video = await Video.findById({ _id: vid }).populate({
      path: "resource",
      populate: {
        path: "resourceKeys",
      },
    });
    res.status(200).send({ message: "video fetched", video });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/oneVideo/:vid)`);
  }
});

app.patch("/oneVideo/:vid", async (req, res) => {
  try {
    const { vid } = req.params;
    const video = await Video.findByIdAndUpdate(vid, req.body.formData);
    await video.save();
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/oneVideo/:vid)`);
  }
});
app.put("/oneVideo/:vid", upload.single("file"), async (req, res) => {
  try {
    const { vid } = req.params;
    const file = req.file;
    const video = await Video.findById({ _id: vid });
    const fileStream = fs.createReadStream(file.path);
    const videoTime = await getVideoDurationInSeconds(fileStream);
    const time = new Date(videoTime * 1000).toISOString().slice(116);
    video.videoTime = time;
    video.videoName = file.originalname;
    video.name = req.body.name;
    video.price = req.body.price;
    video.access = req.body.access;
    video.fileName = req.body.name;
    await deleteFile(video.video);
    const results = await uploadVideo(file);
    video.video = results.Key;
    await video.save();
    res.status(201).send({ message: "video updated successfully" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/oneVideo/:vid)`);
  }
});

app.delete("/oneVideo/:vid", async (req, res) => {
  try {
    const { vid } = req.params;
    const video = await Video.findById({ _id: vid });
    const topic = await Topic.findById({ _id: video.topic });
    topic.video.pull(vid);
    for (let like of video.userLike) {
      const user = await User.findById({ _id: like });
      user.videoLike.pull(vid);
      await user.save();
    }

    for (let sav of video.userSave) {
      const user = await User.findById({ _id: sav });
      user.videoSave.pull(vid);
      await user.save();
    }

    for (let sav of video.userComment) {
      await VideoComment.deleteOne({ _id: sav });
    }
    await deleteFile(video.video);
    await topic.save();
    await Video.deleteOne({ _id: vid });
    res.status(201).send({ message: "video is deleted" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/oneVideo/:vid)`);
  }
});
app.get("/video/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const readStream = await getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/video/:key)`);
  }
});
/////////////////////////////EXTRACT ALL VIDEO FROM PLAYLIST/////////////////////

app.get("/playlist/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const playlist = await Playlist.findById({ _id: pid }).populate({
      path: "video",
    });
    res.status(200).send({ message: "all video is fetched", playlist });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/:pid)`);
  }
});

app.get("/playlist/video/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/playlist/video/:key)`);
  }
});

////////////////////FOR THE RESOURCES ONLY ////////////////////////////////

app.post("/video/:vid/resource", upload.array("file"), async (req, res) => {
  try {
    const { vid } = req.params;
    const resource = new Resource({ name: req.body.name });
    for (let file of req.files) {
      const results = await uploadDocFile(file);
      const fileKey = new ResourcesKey({ resourceName: file.originalname });
      fileKey.resourceKey = results.key;
      resource.resourceKeys.push(fileKey._id);
      await fileKey.save();
      await unlinkFile(file.path);
    }
    const video = await Video.findById({ _id: vid });
    video.resource = resource._id;
    await video.save();
    await resource.save();
    res.status(200).send({ message: "Resources is added" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/video/:vid/resource)`);
  }
});

app.get("/resource/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/resource/:key)`);
  }
});

//////////////////////FOR USER SIDE LIKE AND SAVE FUNCTIONALITY////////////

app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(201).send({ message: "data is fetched", user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/:id)`);
  }
});
app.get("/video/:vid/comment", async (req, res) => {
  try {
    const { vid } = req.params;
    const comment = await Video.findById({ _id: vid })
      .populate({
        path: "userComment",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "userComment",
        populate: {
          path: "video",
        },
      });
    res.status(200).send({ message: "comment is fetched", comment });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/video/:vid/comment)`);
  }
});

app.post("/:id/video/:vid/comment", async (req, res) => {
  try {
    const { id, vid } = req.params;
    // console.log(req.body);
    const comment = new VideoComment(req.body);
    const video = await Video.findById({ _id: vid });
    video.userComment.push(comment._id);
    comment.user = id;
    comment.video = vid;
    await video.save();
    await comment.save();
    res.status(200).send({ message: "commented" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/:id/video/:vid/comment)`
    );
  }
});
app.get("/video/alllike/:vid", async (req, res) => {
  try {
    const { vid } = req.params;
    const like = await Video.findById({ _id: vid });
    res.status(200).send({ message: "all liked fetched", like });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/video/alllike/:vid)`);
  }
});

app.post("/user/:id/video/:vid/like", async (req, res) => {
  try {
    const { vid } = req.params;
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    const video = await Video.findById({ _id: vid });
    video.userLike.push(id);
    user.videoLike.push(vid);
    await user.save();
    await video.save();
    res.status(200).send({ message: "Like video" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/like)`
    );
  }
});
app.post("/user/:id/video/:vid/unlike", async (req, res) => {
  try {
    const { id, vid } = req.params;
    const video = await Video.findById({ _id: vid });
    const user = await User.findById({ _id: id });
    user.videoLike.pull(vid);
    video.userLike.pull(id);
    await user.save();
    await video.save();
    res.status(200).send({ message: "unLike video" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/unlike)`
    );
  }
});

app.get("/video/allbookmark/:vid", async (req, res) => {
  try {
    const { vid } = req.params;
    const bookmark = await Video.findById({ _id: vid });
    res.status(200).send({ message: "all saved fetched", bookmark });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/video/allbookmark/:vid)`
    );
  }
});
app.post("/user/:id/video/:vid/bookmark", async (req, res) => {
  try {
    const { id, vid } = req.params;
    const user = await User.findById({ _id: id });
    const video = await Video.findById({ _id: vid });
    video.userSave.push(id);
    user.videoSave.push(vid);
    await user.save();
    await video.save();
    res.status(200).send({ message: "Save video" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/bookmark)`
    );
  }
});
app.post("/user/:id/video/:vid/unbookmark", async (req, res) => {
  try {
    const { id, vid } = req.params;
    // console.log(id, vid);
    const video = await Video.findById({ _id: vid });
    const user = await User.findById({ _id: id });
    user.videoSave.pull(vid);
    video.userSave.pull(id);
    // console.log(video.userSave);
    await user.save();
    await video.save();
    res.status(200).send({ message: "unSave video" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/unbookmark)`
    );
  }
});

app.post("/user/:id/video/:vid/watch", async (req, res) => {
  try {
    const { id, vid } = req.params;
    const user = await User.findById({ _id: id });
    user.watchLater.push(vid);
    await user.save();
    res.status(201).send({ message: "video gone to watch later" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/video/:vid/watch)`
    );
  }
});

//////////////////////////FOR USER SIDE ALL SAVE AND LIKE Functionality///////////////

app.get("/user/:id/userside", async (req, res) => {
  try {
    const { id } = req.params;
    const userSide = await User.findById({ _id: id })
      .populate({
        path: "videoLike",
        populate: {
          path: "topic",
          populate: {
            path: "playlist",
          },
        },
      })
      .populate({
        path: "watchLater",
        populate: {
          path: "topic",
          populate: {
            path: "playlist",
          },
        },
      })
      .populate({
        path: "videoSave",
        populate: {
          path: "topic",
          populate: {
            path: "playlist",
          },
        },
      })
      .populate({
        path: "playlistJoin",
      });
    res.status(200).send({ message: "all detail fetched", userSide });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/:id/userside)`);
  }
});

///////////User PLAYLIST JOIN////////////////////
// app.post("/user/:id/playlist/:pid/join", async (req, res) => {
//   const { id, pid } = req.params;
//   const playlist = await Playlist.findById({ _id: pid });
//   const user = await User.findById({ _id: id });
//   playlist.joinNow.push(id);
//   playlist.salse = playlist.salse + 1;
//   playlist.enroll = playlist.enroll + 1;
//   user.playlistJoin.push(pid);
//   await user.save();
//   await playlist.save();
//   res.status(200).send({ message: "you have joined playlist" });
// });

//////////////////////////FOR LIBRARY ////////////////////////////////

app.get("/insdashboard/:id/library", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id }).populate(
      "library"
    );
    res.status(200).send({ message: "data is fetched", institute });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/library)`
    );
  }
});

app.post("/insdashboard/:id/library", async (req, res) => {
  try {
    const insId = req.params.id;
    const { sid } = req.body;
    const institute = await InstituteAdmin.findById({ _id: insId });
    const staff = await Staff.findById({ _id: sid });
    const library = new Library({
      libraryHead: sid,
      institute: insId,
      photoId: "1",
      coverId: "2",
    });
    institute.libraryActivate = "Activated";
    institute.library = library._id;
    staff.library.push(library._id);
    await institute.save();
    await staff.save();
    await library.save();
    res.status(200).send({ message: "Library is successfully is updated" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/library)`
    );
  }
});

app.get("/insdashboard/:id/library/info", async (req, res) => {
  try {
    const { id } = req.params;
    const institute = await InstituteAdmin.findById({ _id: id });
    const library = await Library.findById({
      _id: institute.library,
    })
      .populate("libraryHead")
      .populate("books");
    res
      .status(200)
      .send({ message: "Library is successfully is updated", library });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/insdashboard/:id/library/info)`
    );
  }
});

app.get("/library/allbook", async (req, res) => {
  try {
    const library = await Book.find({});
    res.status(200).send({ message: "fetched", library });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/allbook)`);
  }
});
/////////////FOR THE USER SIDE//////////////////////

app.get("/library/:lid", async (req, res) => {
  try {
    const { lid } = req.params;
    const library = await Library.findById({ _id: lid })
      .populate({
        path: "members",
      })
      .populate({
        path: "books",
      })
      .populate({
        path: "issues",
        populate: {
          path: "book",
        },
      })
      .populate({
        path: "issues",
        populate: {
          path: "member",
        },
      })
      .populate({
        path: "collects",
        populate: {
          path: "book",
        },
      })
      .populate({
        path: "collects",
        populate: {
          path: "member",
        },
      })
      .populate({
        path: "institute",
        populate: {
          path: "ApproveStudent",
        },
      });
    res
      .status(200)
      .send({ message: "Library is successfully is fetched", library });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid)`);
  }
});

app.post("/library/:lid/about", async (req, res) => {
  try {
    const { lid } = req.params;
    const { emailId, phoneNumber, about } = req.body;
    console.log(req.body);
    const library = await Library.findById({
      _id: lid,
    });
    library.emailId = emailId;
    library.phoneNumber = phoneNumber;
    library.about = about;
    await library.save();
    res.status(200).send({ message: "Library is successfully is updated" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/about)`);
  }
});

app.get("/library/:lid/:photo", async (req, res) => {
  try {
    const photo = req.params.photo;
    const readStream = getFileStream(photo);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/:photo)`);
  }
});
app.post("/library/:lid/photo", upload.single("file"), async (req, res) => {
  try {
    const { lid } = req.params;
    const file = req.file;
    const library = await Library.findById({ _id: lid });
    if (library.photo) {
      await deleteFile(library.photo);
    }
    const width = 200;
    const height = 200;
    const results = await uploadFile(file, width, height);
    library.photoId = "0";
    library.photo = results.key;
    await library.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Photo is uploades" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/photo)`);
  }
});
app.get("/library/:lid/:cover", async (req, res) => {
  try {
    const cover = req.params.cover;
    const readStream = getFileStream(cover);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/:cover)`);
  }
});

app.post("/library/:lid/cover", upload.single("file"), async (req, res) => {
  try {
    const { lid } = req.params;
    const file = req.file;
    const library = await Library.findById({ _id: lid });
    if (library.cover) {
      await deleteFile(library.cover);
    }
    const width = 1000;
    const height = 260;
    const results = await uploadFile(file, width, height);
    library.coverId = "0";
    library.cover = results.key;
    await library.save();
    await unlinkFile(file.path);
    res.status(200).send({ message: "Photo is uploades" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/cover)`);
  }
});

////////////////////FOR THE LIBRARY BOOKS ONLY ///////////////////////

app.post(
  "/library/:lid/create-book",
  upload.single("file"),
  async (req, res) => {
    try {
      const { lid } = req.params;
      const file = req.file;
      const width = 150;
      const height = 150;
      const results = await uploadFile(file, width, height);
      const book = new Book(req.body);
      const library = await Library.findById({ _id: lid });
      library.books.push(book._id);
      book.library = lid;
      book.photo = results.key;
      book.photoId = "0";
      await library.save();
      await book.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "book is created" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/library/:lid/create-book)`
      );
    }
  }
);

app.get("/book/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint()`);
  }
});

app.get("/onebook/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const book = await Book.findById({ _id: bid });
    res.status(200).send({ message: "fetched", book });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/onebook/:bid)`);
  }
});
app.patch("/library/:lid/edit-book/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const book = await Book.findByIdAndUpdate(bid, req.body);
    await book.save();
    res.status(201).send({ message: "book is updated updated" });
  } catch {
    console.log(
      "Some thing went wrong on this api /library/:lid/edit-book/:bid"
    );
  }
});
app.put(
  "/library/:lid/edit-book/:bid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { bid } = req.params;
      const {
        bookName,
        author,
        totalPage,
        language,
        publication,
        price,
        totalCopies,
        shellNumber,
      } = req.body;
      const file = req.file;
      const width = 150;
      const height = 150;
      const book = await Book.findById({ _id: bid });
      if (book.photo) {
        await deleteFile(book.photo);
      }
      const results = await uploadFile(file, width, height);
      book.photo = results.key;
      book.bookName = bookName;
      book.author = author;
      book.totalPage = totalPage;
      book.language = language;
      book.publication = publication;
      book.totalCopies = totalCopies;
      book.shellNumber = shellNumber;
      book.price = price;
      await book.save();
      await unlinkFile(file.path);
      res.status(200).send({ message: "book is updated" });
    } catch {
      console.log(
        "some thin went wrong on this api /library/:lid/edit-book/:bid"
      );
    }
  }
);

app.delete("/library/:lid/book/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const book = await Book.findById({ _id: bid });
    if (book.totalCopies > 0) {
      book.totalCopies = book.totalCopies - 1;
      await book.save();
    }
    // const library = await Library.findById({ _id: lid });
    // await deleteFile(book.photo);
    // await Book.deleteOne({ _id: bid });
    // library.books.pull(bid);
    // await library.save();
    res.status(200).send({ message: "book is deleted" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/library/:lid/book/:bid)`
    );
  }
});

app.post("/library/:lid/issue", async (req, res) => {
  try {
    const { lid } = req.params;
    const { member, book } = req.body;
    // console.log(req.body);
    const library = await Library.findById({ _id: lid });
    const student = await Student.findById({ _id: member });
    const bookData = await Book.findById({ _id: book });
    const issue = new Issue(req.body);
    student.borrow.push(issue._id);
    library.issues.push(issue._id);
    if (library.members.includes(member)) {
    } else {
      library.members.push(member);
    }
    issue.library = lid;
    bookData.totalCopies = bookData.totalCopies - 1;
    await student.save();
    await library.save();
    await issue.save();
    await bookData.save();
    res.status(200).send({ message: "book is issued" });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/library/:lid/issue)`);
  }
});

///////////////////FOR COLLECT THE BOOK/////////////////////

app.post("/library/:lid/collect/:cid", async (req, res) => {
  try {
    const { lid, cid } = req.params;
    const issue = await Issue.findById({ _id: cid });
    const library = await Library.findById({ _id: lid });
    const book = await Book.findById({ _id: issue.book });
    const collect = new Collect({
      book: issue.book,
      member: issue.member,
      library: issue.library,
    });
    const student = await Student.findById({ _id: issue.member });
    student.deposite.push(collect._id);
    student.borrow.pull(cid);
    library.issues.pull(cid);
    library.collects.push(collect._id);
    collect.library = lid;
    book.totalCopies = book.totalCopies + 1;
    await book.save();
    await student.save();
    await library.save();
    await collect.save();
    res.status(200).send({ message: "book is collected" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/library/:lid/collect/:cid)`
    );
  }
});

/////////FOR BORROW BOOK/////////////////////////////

app.get("/user/:id/borrow", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id }).populate({
      path: "student",
    });
    res.status(200).send({ user });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/user/:id/borrow)`);
  }
});
app.get("/student/:id/borrow", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById({ _id: id })
      .populate({
        path: "borrow",
        populate: {
          path: "book",
        },
      })
      .populate({
        path: "deposite",
        populate: {
          path: "book",
        },
      });
    res.status(200).send({ student });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/student/:id/borrow)`);
  }
});

// ============================ Vaibhav Admission Part ===========================
// institute Admission Admin Allotting

// Is Rought per status wapas nahi jaa raha hai...(important)
app.post(
  "/ins/:id/new-admission-admin",
  isLoggedIn,
  isApproved,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { sid } = req.body;
      const staff = await Staff.findById({ _id: sid });
      const institute = await InstituteAdmin.findById({ _id: id });
      const admissionAdmin = await new AdmissionAdmin({ ...req.body });

      institute.insAdmissionAdmin = admissionAdmin;
      institute.insAdmissionAdminStatus = "Alloted";
      admissionAdmin.institute = institute;
      admissionAdmin.adAdminName = staff;
      staff.staffAdmissionAdmin.push(admissionAdmin);
      await institute.save();
      await staff.save();
      await admissionAdmin.save();

      res.status(200).send({
        message: "Successfully Assigned Staff",
      });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/ins/:id/new-admission-admin)`
      );
    }
  }
);

app.get("/application/:aid/payment/success", async (req, res) => {
  try {
    const { aid } = req.params;
    const apply = await DepartmentApplication.findById({ _id: aid }).populate(
      "applicationFeePayment"
    );
    res.status(200).send({ message: "Application fee", apply });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/application/:aid/payment/success)`
    );
  }
});

app.get("/admission-applications-details/:sid", async (req, res) => {
  // console.log("/admission-applications-details/:sid");
  const { sid } = req.params;
  try {
    if (sid) {
      const staffText = await Staff.findById({ _id: sid });
      adId = staffText.staffAdmissionAdmin[0];
      const adAdminData = await AdmissionAdmin.findById({ _id: adId })
        .populate({
          path: "departmentApplications",
          populate: {
            path: "applicationForDepartment",
            populate: {
              path: "batches",
            },
          },
        })
        .populate("institute")
        .populate("adAdminName")
        // .populate("applicationForDepartment")
        .populate({
          path: "departmentApplications",
          populate: {
            path: "studentData",
            // populate: {
            // path: "studentDetails",
            // populate: {
            //   path: "userId"
            // },
            // },
          },
        })
        .populate({
          path: "departmentApplications",
          populate: {
            path: "applicationFeePayment",
          },
        });
      res
        .status(200)
        .send({ message: "Department Application List", adAdminData });
    } else {
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-applications-details/:sid)`
    );
  }
});

// // find Admission Admin form ins Id
app.get("/admission-applications/details/:iid", async (req, res) => {
  try {
    const { iid } = req.params;
    const institute = await InstituteAdmin.findById({ _id: iid });
    function dateCheck(y, x, z) {
      let status;
      if (x <= y || y >= z) {
        if (z >= y && y > x) {
          status = 2;
        } else if (y > z) {
          status = 3;
        } else {
          status = 1;
        }
      } else if (x > y) {
        status = 1;
      } else if (y > z) {
        status = 3;
      }
      return status;
    }
    if (institute.insAdmissionAdmin) {
      const adAdminData = await AdmissionAdmin.findById({
        _id: institute.insAdmissionAdmin._id,
      })
        .select("departmentApplications")
        .populate({
          path: "departmentApplications",
          populate: {
            path: "batch",
          },
        })
        .populate({
          path: "departmentApplications",
          populate: {
            path: "applicationForDepartment",
          },
        })
        .populate({
          path: "departmentApplications",
          populate: {
            path: "applicationFeePayment",
          },
        });
      let todayDate = moment(new Date()).format();
      let appList = [];
      for (let i = 0; i < adAdminData.departmentApplications.length; i++) {
        for (
          let j = 0;
          j < adAdminData.departmentApplications[i].rounds.length;
          j++
        ) {
          let appStatus = dateCheck(
            todayDate,
            moment(
              adAdminData.departmentApplications[i].rounds[j]
                .applicationStartDate
            ).format(),
            moment(
              adAdminData.departmentApplications[i].rounds[j]
                .applicationLastDate
            ).format()
          );
          let appObj = {
            _id: adAdminData.departmentApplications[i]._id,
            appStatus: appStatus,
            roundName:
              adAdminData.departmentApplications[i].rounds[j].roundName,
            applicationSDate: moment(
              adAdminData.departmentApplications[i].rounds[j]
                .applicationStartDate
            ).format(),
            applicationLDate: moment(
              adAdminData.departmentApplications[i].rounds[j]
                .applicationLastDate
            ).format(),
            applicationName:
              adAdminData.departmentApplications[i].applicationTitle,
            departmentName:
              adAdminData.departmentApplications[i].applicationForDepartment
                .dName,
            avilableSeats: adAdminData.departmentApplications[i].availableSeats,
          };
          appList.push(appObj);
        }
      }
      res.status(200).send({ message: "Applications List Detail", appList });
    } else {
      res.status(204).send({ message: "Applications Details Not Found" });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-applications/details/:iid)`
    );
  }
});

app.get("/admission-applications-apply-details/:aid/", async (req, res) => {
  try {
    const { aid } = req.params;
    const application = await DepartmentApplication.findById({
      _id: aid,
    }).select(
      "applicationTitle availableSeats managementSeats  admissionProcessDetails applicationForDepartment applicationFee admissionFee rounds formDetails applicationFeePayment admissionAdminName "
    );

    res.status(200).send({ message: "Applications Detail", application });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-applications/details/:aid/)`
    );
  }
});
app.post("/admission-application/:sid", isLoggedIn, async (req, res) => {
  try {
    // console.log("/admission-application/:sid");
    const { sid } = req.params;
    const { applicationData } = req.body;
    const newApplication = await new DepartmentApplication(applicationData);
    const staffText = await Staff.findById({ _id: sid });
    const adAdminText = await AdmissionAdmin.findById({
      _id: staffText.staffAdmissionAdmin[0],
    });
    await adAdminText.departmentApplications.push(newApplication._id);
    await newApplication.save();
    await adAdminText.save();
    res.status(200).send({ message: "Application Save Successfully" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-application/:sid)`
    );
  }
});

app.post(
  "/admission-application/:aid/student-apply/:id",
  upload.array("file"),
  isLoggedIn,
  async (req, res) => {
    try {
      const { aid, id } = req.params;
      const newPreStudent = await new PreAppliedStudent(req.body);
      for (let file of req.files) {
        const results = await uploadDocFile(file);
        newPreStudent.studentAttachDocuments.push({
          docFieldName: file.originalname,
          docImagePath: results.key,
        });
        await unlinkFile(file.path);
      }
      const userText = await User.findById({ _id: id });
      const dAppliText = await DepartmentApplication.findById({
        _id: aid,
      }).populate({
        path: "applicationForDepartment",
        populate: {
          path: "institute",
        },
      });

      const appForAppli = {
        appName: aid,
        appUpdates: [],
      };
      const notify = `You have applied in ${dAppliText.applicationForDepartment.institute.insName} for ${dAppliText.applicationForDepartment.dName} Department admission application. Stay Updated to check status for your application.`;
      const notiObj = {
        notificationType: 1,
        notification: notify,
      };
      await appForAppli.appUpdates.push(notiObj);
      newPreStudent.applicationForApply = aid;
      newPreStudent.userId = id;
      await userText.preAppliedStudent.push(newPreStudent._id);
      await userText.appliedForApplication.push(appForAppli);
      const studentDataObj = {
        studentStatus: "Applied",
        studentDetails: newPreStudent._id,
      };
      dAppliText.admissionAdminName =
        dAppliText.applicationForDepartment.institute.insAdmissionAdmin;
      await dAppliText.studentData.push(studentDataObj);
      await dAppliText.save();
      await newPreStudent.save();
      await userText.save();
      res
        .status(200)
        .send({ message: "Application Applied Successfully", studentDataObj });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/:aid/student-apply/:id)`
      );
    }
  }
);

app.get("/user/:id/applied-application-details/:aid", async (req, res) => {
  const { id, aid } = req.params;
  const ActApplication = await DepartmentApplication.findById({
    _id: aid,
  })
    .populate({
      path: "applicationForDepartment",
      populate: {
        path: "institute",
      },
    })
    .populate("admissionFeePayment");
  res
    .status(200)
    .send({ message: "Student Applied Application Details", ActApplication });
});

app.get("/batch/class/student/:bid", async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid }).populate({
      path: "classroom",
      populate: {
        path: "ApproveStudent",
      },
    });
    res.status(200).send({ message: "Classes Are here", batch });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/batch/class/student/:bid)`
    );
  }
});

app.get("/user/:id/applied-application/:aid", async (req, res) => {
  // try {
  const { id, aid } = req.params;
  const user = await User.findById({ _id: id }).populate({
    path: "appliedForApplication",
    populate: {
      path: "appName",
      populate: {
        path: "applicationForDepartment",
      },
      populate: {
        path: "rounds",
      },
      populate: {
        path: "studentData",
      },
    },
  });
  let appList = user.appliedForApplication;
  console.log(appList);
  let filter = appList.find((x) => {
    return (x.appName._id = aid);
  });
  console.log(filter);
  const appData = filter;
  res.status(200).send({
    message: "Student Applied Application List",
    appData,
    id,
  });
  // } catch {
  //   console.log(
  //     `SomeThing Went Wrong at this EndPoint(/user/:id/applied-application)`
  //   );
  // }
});

// app.get("/user/:id/applied-application", async (req, res) => {
//   try {
//     console.log("/user/:id/applied-application");
//     const { id } = req.params;
//     const user = await User.findById({ _id: id }).populate({
//       path: "appliedForApplication",
//       populate: {
//         path: "appName",
//         populate: {
//           path: "applicationForDepartment",
//         },
//         populate: {
//           path: "rounds",
//         },
//         populate: {
//           path: "studentData",
//         },
//       },
//     });
//     let applicationList = user.appliedForApplication;
//     res.status(200).send({
//       message: "Student Applied Application List",
//       applicationList,
//       id,
//     });
//   } catch {
//     console.log(
//       `SomeThing Went Wrong at this EndPoint(/user/:id/applied-application)`
//     );
//   }
// });

app.get("/user/:id/applied-applications/", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id })
      .populate({
        path: "appliedForApplication",
        populate: {
          path: "appName",
          populate: {
            path: "applicationForDepartment",
          },
          populate: {
            path: "rounds",
          },
          populate: {
            path: "studentData",
          },
        },
      })
      .select(
        "appliedForApplication appName applicationForDepartment rounds studentData"
      );

    let appData = user.appliedForApplication;
    res.status(200).send({
      message: "Student Applied Application",
      appData,
    });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/applied-applications/)`
    );
  }
});

app.post(
  "/admission-application/confirm-student-auto/:aid",
  async (req, res) => {
    try {
      const { aid } = req.params;
      const { qualifyStudentList, actRound } = req.body;
      const dAppliText = await DepartmentApplication.findById({
        _id: aid,
      }).populate({
        path: "applicationForDepartment",
        populate: {
          path: "institute",
        },
      });
      const appStList = dAppliText.studentData;
      for (let i = 0; i < qualifyStudentList.length; i++) {
        const index = appStList.findIndex(
          (x) => x.studentDetails == qualifyStudentList[i].studentDetails._id
        );
        dAppliText.studentData[index].studentStatus = "Selected";
        dAppliText.studentData[index].studentSelectedRound = actRound.roundName;
        const userText = await User.findById({
          _id: qualifyStudentList[i].studentDetails.userId,
        });
        const notiObj = {
          notificationType: 2,
          notification: `You have been selected in ${
            dAppliText.applicationForDepartment.institute.insName
          } for ${dAppliText.applicationForDepartment.dName} in ${
            actRound.roundName
          }. Confirm your admission or floor to next round Last Date to action is ${moment(
            actRound.candidateSelectionLastDate
          ).format("DD/MM/YYYY")}.`,
          actonBtnText: "Pay & confirm",
          deActBtnText: "Float",
        };
        const indexofApp = userText.appliedForApplication.findIndex(
          (x) => (x.appName = dAppliText._id)
        );
        userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
        await userText.save();
      }
      dAppliText.autoUpdateProcess.selectionStatus = "Updated";
      await dAppliText.save();
      console.log("working Application");
      res
        .status(200)
        .send({ message: "Student Move to Selected SuccessFully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/confirm-student-auto/:aid)`
      );
    }
  }
);

app.get("/admission-preapplied/student-details/:aid", async (req, res) => {
  try {
    const { aid } = req.params;
    const application = await DepartmentApplication.findById({ _id: aid });
    const preAppliedStudent = await PreAppliedStudent.find({
      applicationForApply: aid,
    }).populate("userId");
    let studentDataText = application.studentData;
    for (let i = 0; i < studentDataText.length; i++) {
      let currStudent = studentDataText[i];
      let findPreAppSt = await PreAppliedStudent.find({
        _id: currStudent.studentDetails,
      }).populate("userId");
      studentDataText[i].studentDetails = findPreAppSt[0];
    }
    const preAppliedStList = studentDataText;
    res.status(200).send({
      message: "Admission Application Applied Student List Detail",
      preAppliedStList,
    });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-preapplied/student-details/:aid)`
    );
  }
});
app.post("/admission-application/select-student/:aid", async (req, res) => {
  try {
    const { aid } = req.params;
    const { stId, actRound } = req.body;

    const dAppliText = await DepartmentApplication.findById({ _id: aid })
      .populate({
        path: "studentData",
        populate: {
          path: "studentDetails",
          populate: {
            path: "userId",
          },
        },
      })
      .populate({
        path: "applicationForDepartment",
        populate: {
          path: "institute",
        },
      });
    const appStList = dAppliText.studentData;
    const preStudNum = appStList.findIndex((x) => x.studentDetails._id == stId);
    dAppliText.studentData[preStudNum].studentStatus = "Selected";
    dAppliText.studentData[preStudNum].studentSelectedRound =
      actRound.roundName;
    const uid = appStList[preStudNum].studentDetails.userId._id;
    const userText = await User.findById({
      _id: uid,
    });
    const notiObj = {
      notificationType: 2,
      notification: `You have been selected in ${
        dAppliText.applicationForDepartment.institute.insName
      } 
    for ${dAppliText.applicationForDepartment.dName} Department in ${
        actRound.roundName
      }. 
    Confirm your admission or float to next round Last Date to action is 
    ${moment(actRound.candidateSelectionLastDate).format("DD/MM/YYYY")}.`,
      actonBtnText: "Pay & confirm",
      deActBtnText: "Float",
    };
    const indexofApp = userText.appliedForApplication.findIndex(
      (x) => (x.appName = dAppliText._id)
    );
    userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
    await userText.save();
    await dAppliText.save();
    res.status(200).send({ message: "Student Selected SuccessFully" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-application/select-student/:aid)`
    );
  }
});

app.post(
  "/admission-application/applicationfee-payed-student/:aid/:id",
  async (req, res) => {
    try {
      const { aid, id } = req.params;
      const { actRound } = req.body;
      const dAppliText = await DepartmentApplication.findById({ _id: aid })
        .populate({
          path: "studentData",
          populate: {
            path: "studentDetails",
            populate: {
              path: "userId",
            },
          },
        })
        .populate({
          path: "applicationForDepartment",
          populate: {
            path: "institute",
          },
        });
      const appStList = dAppliText.studentData;
      const preStudNum = appStList.findIndex(
        (x) => x.studentDetails.userId._id == id
      );
      dAppliText.studentData[preStudNum].studentStatus = "AdPayed";
      dAppliText.studentData[preStudNum].admissionFeeStatus = "Payed";
      // dAppliText.studentData[preStudNum].studentSelectedRound = actRound.roundName;
      const userText = await User.findById({
        _id: appStList[preStudNum].studentDetails.userId._id,
      });
      const notiObj = {
        notificationType: 1,
        notification: `Your admission have been confirmed. Please visit ${
          dAppliText.applicationForDepartment.institute.insName
        } with Required Documents to confirm your seat. Last Date for document submission -
          ${moment(actRound.candidateSelectionLastDate).format("DD/MM/YYYY")}.`,
        // actonBtnText: "Pay & confirm",
        // deActBtnText: "Float",
      };
      const indexofApp = userText.appliedForApplication.findIndex(
        (x) => (x.appName = dAppliText._id)
      );

      userText.appliedForApplication[indexofApp].appUpdates.pop();
      userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);

      await userText.save();
      await dAppliText.save();

      res
        .status(200)
        .send({ message: "Student Application Fee Payed SuccessFully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/applicationfee-payed-student/:aid/:id)`
      );
    }
  }
);

app.post(
  "/admission-application/application-floated-student/:aid/:id",
  async (req, res) => {
    try {
      const { aid, id } = req.params;
      const { actRound } = req.body;
      const dAppliText = await DepartmentApplication.findById({ _id: aid })
        .populate({
          path: "studentData",
          populate: {
            path: "studentDetails",
            populate: {
              path: "userId",
            },
          },
        })
        .populate({
          path: "applicationForDepartment",
          populate: {
            path: "institute",
          },
        });
      const appStList = dAppliText.studentData;
      const preStudNum = appStList.findIndex(
        (x) => x.studentDetails.userId._id == id
      );

      let roundList = dAppliText.rounds;
      let actRondIndex = roundList.findIndex(
        (x) => x.roundName == actRound.roundName
      );

      // notiObj;
      if (actRondIndex + 1 == roundList.length) {
        dAppliText.studentData[preStudNum].studentStatus = "Reserve";
        notiObj = {
          notificationType: 3,
          notification: `You can not be floated to next round becouse of this is last round for Application
        would you like to want apply through Menegment Seats.`,
          actonBtnText: "Apply in Reserve",
          deActBtnText: "Cancel",
        };
      } else {
        dAppliText.studentData[preStudNum].studentStatus = "Floated";
        dAppliText.studentData[preStudNum].studentFloatedTo = `${
          roundList[actRondIndex + 1].roundName
        }`;
        notiObj = {
          notificationType: 1,
          notification: `You have been floated to second round as of your confirmaction.`,
        };
      }

      const userText = await User.findById({
        _id: appStList[preStudNum].studentDetails.userId._id,
      });
      const indexofApp = userText.appliedForApplication.findIndex(
        (x) => (x.appName = dAppliText._id)
      );

      userText.appliedForApplication[indexofApp].appUpdates.pop();
      userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);

      await userText.save();
      await dAppliText.save();

      res.status(200).send({ message: "Student float SuccessFully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/application-floated-student/:aid/:id)`
      );
    }
  }
);
app.post("/admission-application/confirm-lc-student/:aid", async (req, res) => {
  try {
    const { aid } = req.params;
    const { stId, actRound } = req.body;
    const dAppliText = await DepartmentApplication.findById({ _id: aid })
      .populate({
        path: "studentData",
        populate: {
          path: "studentDetails",
          populate: {
            path: "userId",
          },
        },
      })
      .populate({
        path: "applicationForDepartment",
        populate: {
          path: "institute",
        },
      });
    const appStList = dAppliText.studentData;
    const preStudNum = appStList.findIndex((x) => x.studentDetails._id == stId);
    dAppliText.studentData[preStudNum].studentStatus = "Confirmed";
    dAppliText.studentData[preStudNum].studentSelectedRound =
      actRound.roundName;
    const userText = await User.findById({
      _id: appStList[preStudNum].studentDetails.userId._id,
    });
    const notiObj = {
      notificationType: 1,
      notification: `Welcome to ${dAppliText.applicationForDepartment.institute.insName}.
    your seat has been confirmed. You will be alloted your class, stay updated.`,
    };
    const indexofApp = userText.appliedForApplication.findIndex(
      (x) => (x.appName = dAppliText._id)
    );
    userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
    await userText.save();
    await dAppliText.save();
    res.status(200).send({ message: "Student Confirmed SuccessFully" });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-application/confirm-lc-student/:aid)`
    );
  }
});
var date = new Date();
var p_date = date.getDate();
var p_month = date.getMonth() + 1;
var p_year = date.getFullYear();
if (p_month <= 10) {
  p_month = `0${p_month}`;
}
var c_date = `${p_year}-${p_month}-${p_date}`;

app.post(
  "/admission-application/:aid/class-allot-student/:stid",
  async (req, res) => {
    try {
      const { aid, stid } = req.params;
      const { classAllotData } = req.body;
      const dAppliText = await DepartmentApplication.findById({ _id: aid })
        .populate({
          path: "studentData",
          populate: {
            path: "studentDetails",
            populate: {
              path: "userId",
            },
          },
        })
        .populate({
          path: "applicationForDepartment",
          populate: {
            path: "institute",
          },
        });
      const batch = await Batch.findById({ _id: dAppliText.batch });
      const depart = await Department.findById({
        _id: dAppliText.applicationForDepartment._id,
      });
      const institute = await InstituteAdmin.findById({
        _id: dAppliText.applicationForDepartment.institute._id,
      });
      const classText = await Class.findById({ _id: classAllotData.classId });
      const StText = await PreAppliedStudent.findById({ _id: stid });
      console.log(StText);
      const studentData = await new Student({
        studentProfilePhoto: StText.studentAttachDocuments[0].docImagePath,
        photoId: "0",
        studentFirstName: StText.studentFirstName,
        studentMiddleName: StText.studentMiddleName,
        studentLastName: StText.studentLastName,
        studentDOB: StText.studentDOB,
        studentGender: StText.studentGender,
        studentNationality: StText.studentNationality,
        studentMTongue: StText.studentMTongue,
        studentCast: StText.studentCast,
        studentCastCategory: StText.studentCastCategory,
        studentReligion: StText.studentReligion,
        studentBirthPlace: StText.studentBirthPlace,
        studentDistrict: StText.studentDistrict,
        studentState: StText.studentState,
        studentAddress: StText.studentAddress,
        studentPhoneNumber: StText.studentPhoneNumber,
        studentParentsName: StText.studentParentsName,
        studentParentsPhoneNumber: StText.studentParentsPhoneNumber,
        studentDocuments: StText.studentAttachDocuments[1].docImagePath,
        studentMothersName: StText.studentPName,
        studentAadharNumber: StText.studentAadharNumber,
      });

      const appStList = dAppliText.studentData;
      const preStudNum = appStList.findIndex(
        (x) => x.studentDetails._id == stid
      );

      dAppliText.studentData[preStudNum].studentStatus = "Class Alloted";
      const userText = await User.findById({
        _id: appStList[preStudNum].studentDetails.userId._id,
      });
      const notiObj = {
        notificationType: 1,
        notification: `Welcome to ${classText.className} - ${classText.classTitle}, Enjoy Your Journey.`,
      };
      const indexofApp = userText.appliedForApplication.findIndex(
        (x) => (x.appName = dAppliText._id)
      );
      userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
      let adAdmin = await AdmissionAdmin.findById({
        _id: dAppliText.admissionAdminName,
      });
      let previousApprovedSt = adAdmin.feeCollection.totalAdmissionApprove;
      adAdmin.feeCollection.totalAdmissionApprove = Number(
        previousApprovedSt + 1
      );

      if (c_date <= institute.insFreeLastDate) {
        institute.insFreeCredit = institute.insFreeCredit + 1;
      }

      institute.ApproveStudent.push(studentData);
      studentData.institute = institute;
      studentData.studentClass = classText;
      userText.student.push(studentData);
      depart.ApproveStudent.push(studentData);
      studentData.user = userText;
      classText.ApproveStudent.push(studentData);
      studentData.studentGRNO = classText.ApproveStudent.length;
      studentData.studentROLLNO = classText.ApproveStudent.length;
      studentData.department = depart;
      batch.ApproveStudent.push(studentData);
      studentData.batches = batch;

      await institute.save();
      await depart.save();
      await classText.save();
      await studentData.save();
      await userText.save();
      await dAppliText.save();
      res.status(200).send({ message: "Student Class Alloted SuccessFully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/:aid/class-allot-student/:stid)`
      );
    }
  }
);
app.post(
  "/admission-application/class-allot-cancel-student/:aid",
  async (req, res) => {
    try {
      const { aid } = req.params;
      const { stId, actRound } = req.body;
      const dAppliText = await DepartmentApplication.findById({ _id: aid })
        .populate({
          path: "studentData",
          populate: {
            path: "studentDetails",
            populate: {
              path: "userId",
            },
          },
        })
        .populate({
          path: "applicationForDepartment",
          populate: {
            path: "institute",
          },
        });
      const appStList = dAppliText.studentData;
      const preStudNum = appStList.findIndex(
        (x) => x.studentDetails._id == stId
      );
      dAppliText.studentData[preStudNum].studentStatus = "Cancelled";
      const userText = await User.findById({
        _id: appStList[preStudNum].studentDetails.userId._id,
      });
      // const notiObj = {
      //   notificationType: 1,
      //   notification: `Welcome to ${dAppliText.applicationForDepartment.institute.insName}.
      //               your seat has been confirmed. You will be alloted your class, stay updated.`,
      // };
      const indexofApp = userText.appliedForApplication.findIndex(
        (x) => (x.appName = dAppliText._id)
      );
      userText.appliedForApplication[indexofApp].appUpdates.push(notiObj);
      await userText.save();
      await dAppliText.save();
      res
        .status(200)
        .send({ message: "Student Application Canciled SuccessFully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/admission-application/class-allot-cancel-student/:aid)`
      );
    }
  }
);

/////////////FOR IMAGE AND ALL FILE UPLOAD///////////////////////

app.get("/staffadminssionalldata/:sid", async (req, res) => {
  try {
    const { sid } = req.params;
    const admissionAdmin = await AdmissionAdmin.findById({ _id: sid });
    res.status(201).send({ message: "all data fetched", admissionAdmin });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/staffadminssionalldata/:sid)`
    );
  }
});

app.get("/staffadminssionimage/photo/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log("some thing went /staffadminssionimage/photo/:key");
  }
});
app.post(
  "/staffadminssionimage/photo/:aid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { aid } = req.params;
      const admissionAdmin = await AdmissionAdmin.findById({ _id: aid });
      if (admissionAdmin.photo) {
        await deleteFile(admissionAdmin.photo);
      }
      const width = 200;
      const height = 200;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      admissionAdmin.photo = results.key;
      admissionAdmin.photoId = "0";
      await admissionAdmin.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log("some thing went /staffadminssionimage/photo/:aid");
    }
  }
);

app.get("/staffadminssionimage/cover/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log("some thing went /staffadminssionimage/cover/:key");
  }
});
app.post(
  "/staffadminssionimage/coverphoto/:aid",
  upload.single("file"),
  async (req, res) => {
    try {
      const { aid } = req.params;
      const admissionAdmin = await AdmissionAdmin.findById({ _id: aid });
      if (admissionAdmin.cover) {
        await deleteFile(admissionAdmin.cover);
      }
      const width = 840;
      const height = 250;
      const file = req.file;
      const results = await uploadFile(file, width, height);
      admissionAdmin.cover = results.key;
      admissionAdmin.coverId = "0";
      await admissionAdmin.save();
      await unlinkFile(file.path);
      res.status(201).send({ message: "updated photo" });
    } catch {
      console.log("some thing went /staffadminssionimage/coverphoto/:aid");
    }
  }
);

// / Department Batch Class and Subject Lock and Student Premote Rought Start Here

// Staff Section Batch Class Subject Lock rought start here
app.post("/staff/subject-lock/:suid", async (req, res) => {
  try {
    const { suid } = req.params;
    const subjectText = await Subject.findById({ _id: suid });
    subjectText.subjectStatus = "Locked";
    await subjectText.save();
    res.status(200).send({ message: "Subject Status Locked SuccessFully" });
  } catch {
    console.log("/staff/subject-lock/:suid");
  }
});

app.post("/staff/class-lock/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const classText = await Class.findById({ _id: cid });
    let studentList = classText.ApproveStudent;
    for (let i = 0; i < studentList.length; i++) {
      let stDataText = await Student.findById({ _id: studentList[i] });
      stDataText.studentPremoteStatus = "Not Promoted";
      await stDataText.save();
    }
    classText.classStatus = "Locked";
    await classText.save();
    console.log("Class Status Locked SuccessFully");
    res.status(200).send({ message: "Class Status Locked SuccessFully" });
  } catch {}
});

app.post("/staff/batch-lock/:bid", async (req, res) => {
  console.log("staff/batch-lock/:bid");
  const { bid } = req.params;
  const batchText = await Batch.findById({ _id: bid });
  batchText.batchStatus = "Locked";
  await batchText.save();
  console.log("Batch Status Locked SuccessFully");
  res.status(200).send({ message: "Batch Status Locked SuccessFully" });
});

// Student Promote Rought

app.post("/class-promote/allStudent/:cid", async (req, res) => {
  const { cid } = req.params;
  const { d } = req.body;

  const classText = await Class.findById({ _id: d.promoteClassId });

  const instituteText = await InstituteAdmin.findById({
    _id: classText.institute,
  });

  const adAdmin = await AdmissionAdmin.findById({
    _id: instituteText.insAdmissionAdmin,
  });

  let studentList = d.studentList;
  for (let i = 0; i < studentList.length; i++) {
    let stDataText = await Student.findById({ _id: studentList[i]._id });
    const preYearData = {
      classId: stDataText.studentClass,
      studentMarks: stDataText.studentMarks,
      studentFinalReportData: stDataText.studentFinalReportData,
      studentBehaviourStatus: stDataText.studentBehaviourStatus,
    };
    stDataText.previousClassData.push(preYearData);
    stDataText.studentClass = d.promoteClassId;
    stDataText.studentPremoteStatus = "Promoted";
    stDataText.studentMarks = [];
    stDataText.studentBehaviourReportStatus = "Not Ready";
    stDataText.studentBehaviourStatus = null;
    stDataText.studentStatus = "Approved";
    stDataText.studentFinalReportFinalizedStatus = "Not Ready";
    stDataText.studentFinalReportData = [];

    await stDataText.save();

    classText.ApproveStudent.push(stDataText);
    let count = adAdmin.feeCollection.totalAdmissionApprove;

    adAdmin.feeCollection.totalAdmissionApprove = count + 1;
  }
  await classText.save();
  await adAdmin.save();
  console.log("Student Premoted SuccessFully");
  res.status(200).send({ message: "Students Premoted SuccessFully" });
});

app.get("/admission-admin/detail/:aaid", async (req, res) => {
  try {
    const { aaid } = req.params;
    console.log(aaid);
    const admissionAdmin = await AdmissionAdmin.findById({ _id: aaid })
      .populate("adAdminName")
      .populate({
        path: "institute",
        populate: {
          path: "financeDepart",
        },
        populate: {
          path: "depart",
          populate: {
            path: "batches",
          },
          populate: {
            path: "class",
          },
        },
      });
    res.status(200).send({ admissionAdmin });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission-admin/detials/:aaid)`
    );
  }
});

app.post(
  "/staff/admission-admin-info/:aid/set-info",
  isLoggedIn,
  async (req, res) => {
    try {
      const { aid } = req.params;
      const admissionInfoData = req.body;
      console.log(admissionInfoData);
      const admissionAdmin = await AdmissionAdmin.findById({ _id: aid });
      admissionAdmin.contactNumber = admissionInfoData.admissionPhoneNumber;
      admissionAdmin.emailId = admissionInfoData.admissionEmail;
      admissionAdmin.about = admissionInfoData.admissionAbout;
      await admissionAdmin.save();
      res.status(200);
      // .send(admissionAdmin);
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/staff/admission-admin-info/:aid)`
      );
    }
  }
);

app.get("/admission/admin/:aid/payment/success", async (req, res) => {
  try {
    const { aid } = req.params;
    const adAdmin = await AdmissionAdmin.findById({ _id: aid }).populate({
      path: "institute",
      populate: {
        path: "financeDepart",
      },
    });
    res.status(200).send({ message: "Data", adAdmin });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/admission/admin/:aid/payment/success)`
    );
  }
});

// Department Batch Class and Subject Lock and Student Premote Rought Start Here

// ============================ Vaibhav Extra-Curricular ===========================

app.get("/department-elections-details/:did", async (req, res) => {
  try {
    const { did } = req.params;
    if (did) {
      const departmentText = await Department.findById({ _id: did });
      const deptEle = departmentText.deptElections;
      const departmentElections = [];
      for (let i = 0; i < deptEle.length; i++) {
        const ele = await Elections.findById({ _id: deptEle[i] }).select(
          " _id positionName electionDate"
        );
        departmentElections.push(ele);
      }
      res
        .status(200)
        .send({ message: "All Elections Details", departmentElections });
    }
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department-elections-details/:did)`
    );
  }
});

app.get("/elections-details/:eid", async (req, res) => {
  try {
    const { eid } = req.params;
    const electionText1 = await Elections.findById({ _id: eid });
    function arryFilter(arraytosearch, valuetosearch) {
      let list = [];
      for (var i = 0; i < arraytosearch.length; i++) {
        if (`${arraytosearch[i].votedTo}` === `${valuetosearch}`) {
          list.push(arraytosearch[i]);
        }
      }
      return list;
    }
    let todayDate = new Date();
    if (
      moment(todayDate).format() >
      moment(electionText1.electionVotingLDate).format()
    ) {
      let winnerDataText = {
        winner: { _id: "", name: "" },
        runnerUp: { _id: "", name: "" },
        runnerUp2: { _id: "", name: "" },
      };
      if (electionText1.electionResult === false) {
        let candiList = [];
        let allVote = electionText1.voteCount;
        for (let i = 0; i < electionText1.candidates.length; i++) {
          let candiId = electionText1.candidates[i].studentName;
          const student = await Student.findById({ _id: candiId });
          let voteFilter = arryFilter(allVote, candiId);
          let member = {
            candidateId: candiId,
            candidateName: `${student.studentFirstName} ${student.studentMiddleName} ${student.studentLastName}`,
            candidateVote: voteFilter.length,
          };
          candiList.push(member);
        }
        let filterVoteList = candiList
          .sort((a, b) => a.candidateVote - b.candidateVote)
          .reverse();
        electionText1.winnerCandidates.winner = filterVoteList[0].candidateId;
        electionText1.winnerCandidates.runnerUp2 =
          filterVoteList[2].candidateId;
        electionText1.winnerCandidates.runnerUp = filterVoteList[1].candidateId;

        winnerDataText.winner._id = filterVoteList[0].candidateId;
        winnerDataText.winner.name = filterVoteList[0].candidateName;
        winnerDataText.runnerUp._id = filterVoteList[1].candidateId;
        winnerDataText.runnerUp.name = filterVoteList[1].candidateName;
        winnerDataText.runnerUp2._id = filterVoteList[2].candidateId;
        winnerDataText.runnerUp2.name = filterVoteList[2].candidateName;
        electionText1.electionResult = true;
        await electionText1.save();
      }
    }
    const electionText = await Elections.findById({ _id: eid })
      .populate({
        path: "winnerCandidates",
        populate: {
          path: "winner",
        },
      })
      .populate({
        path: "candidates",
        populate: {
          path: "studentName",
        },
        populate: {
          path: "supportiveMember",
        },
      })
      .select(
        " _id positionName electionResult applicationSDate applicationLDate electionVotingSDate electionVotingLDate winnerCandidates candidates totalVoters voteCount "
      );

    let electionData = {
      _id: electionText._id,
      positionName: electionText.positionName,
      applicationSDate: electionText.applicationSDate,
      applicationLDate: electionText.applicationLDate,
      electionVotingSDate: electionText.electionVotingSDate,
      electionVotingLDate: electionText.electionVotingLDate,
      totalVoters: electionText.totalVoters,
      winner: "",
      voteCount: Number(electionText.voteCount.length),
      candidates: [],
    };
    if (electionText.electionResult === true) {
      winnerData = {
        _id: electionText.winnerCandidates.winner._id,
        name: `${electionText.winnerCandidates.winner.studentFirstName} ${electionText.winnerCandidates.winner.studentMiddleName} ${electionText.winnerCandidates.winner.studentLastName}`,
      };
      electionData.winner = winnerData;
    }
    for (let i = 0; i < electionText.candidates.length; i++) {
      let candidateList = electionText.candidates;
      const student = await Student.findById({
        _id: candidateList[i].studentName,
      });
      let candidate = {
        selectionStatus: candidateList[i].selectionStatus,
        studentId: candidateList[i].studentName._id,
        photoId: student.photoId,
        candidateProfile: student.studentProfilePhoto,
        candidateName: `${student.studentFirstName} ${student.studentMiddleName} ${student.studentLastName}`,
        tagLine: candidateList[i].tagLine,
        vote: candidateList[i].vote,
        supportiveMember: [],
      };
      for (let j = 0; j < candidateList[i].supportiveMember.length; j++) {
        let supprotiveMember = candidateList[i].supportiveMember[j];
        let member = {
          MemberName: `${supprotiveMember.studentFirstName} ${supprotiveMember.studentMiddleName} ${supprotiveMember.studentLastName}`,
        };
        candidate.supportiveMember.push(member);
      }
      electionData.candidates.push(candidate);
    }
    res.status(200).send({ message: "Elections Details", electionData });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/elections-details/:eid)`
    );
  }
});

app.post("/department-election-creation/:did", isLoggedIn, async (req, res) => {
  try {
    const { did } = req.params;
    const { electionData } = req.body;
    const departmentText = await Department.findById({ _id: did }).populate({
      path: "userBatch",
      populate: {
        path: "classroom",
        populate: {
          path: "ApproveStudent",
        },
      },
    });
    let classrooms = departmentText.userBatch.classroom;
    let studentCount = 0;
    let stList = [];
    for (let i = 0; i < classrooms.length; i++) {
      let students = classrooms[i].ApproveStudent;
      studentCount = Number(studentCount) + Number(students.length);
      for (let j = 0; j < students.length; j++) {
        let student = classrooms[i].ApproveStudent[j]._id;
        stList.push(student);
      }
    }
    const ElectionLDate = new Date(electionData.applicationDate);
    const ElectionSDate = new Date(electionData.applicationDate);
    ElectionSDate.setHours(00, 00, 05);
    ElectionLDate.setDate(ElectionLDate.getDate() + 7);
    ElectionLDate.setHours(23, 59, 59);

    const ElectionVoteingSDate = new Date(electionData.electionDate);
    const ElectionVoteingLDate = new Date(electionData.electionDate);
    ElectionVoteingSDate.setHours(00, 00, 00);
    ElectionVoteingLDate.setHours(23, 59, 59);
    const Election = await new Elections({
      electionForDepartment: did,
      positionName: electionData.positionName,
      applicationSDate: ElectionSDate,
      applicationLDate: ElectionLDate,
      electionVotingSDate: ElectionVoteingSDate,
      electionVotingLDate: ElectionVoteingLDate,
      totalVoters: studentCount,
      voteCount: [],
      candidates: [],
    });

    for (let j = 0; j < stList.length; j++) {
      let student = await Student.findById({ _id: stList[j] });
      let stEle = {
        electionStatus: "Not Applied",
        election: Election._id,
      };
      student.deptElections.push(stEle);
      const notify = await new Notification({});
      notify.notifyContent = `Election For ${
        Election.positionName
      } is Conduct on ${moment(Election.electionDate).format(
        "DD-MMM-YYYY"
      )}. and Application for Election will Starts From ${moment(
        Election.applicationSDate
      ).format("DD-MMM-YYYY")}. Last Date is Apply For Election is ${moment(
        Election.applicationLDate
      ).format("DD-MMM-YYYY")}.`;
      notify.notifySender = did;
      notify.notifyByDepartPhoto = did;
      notify.notifyReceiever = student._id;
      notify.user = student.user;
      const user = await User.findById({ _id: student.user });
      user.uNotify.push(notify);
      await student.save();
      await notify.save();
      await user.save();
    }
    await departmentText.deptElections.push(Election);
    await Election.save();
    await departmentText.save();
    res.status(201).send({ message: "Department Election is Created." });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/department-election-creation/:did)`
    );
  }
});

app.get("/student/:sid/elections-details", async (req, res) => {
  try {
    const { sid } = req.params;
    const dateCheck = (today, start, last) => {
      let status;
      if (start <= today || today >= last) {
        if (last >= today && today > start) {
          status = "Election Open";
        } else if (today > last) {
          status = "Election application Closed";
        } else {
          status = "Election Start soon";
        }
      } else if (start > today) {
        status = "Election Start soon";
      } else if (today > last) {
        status = "Election application Closed";
      }
      return status;
    };
    const studnetText = await Student.findById({ _id: sid });
    const deptEle = studnetText.deptElections;
    const stDeptElections = [];
    let todayDate = new Date();
    for (let i = 0; i < deptEle.length; i++) {
      const ele = await Elections.findById({ _id: deptEle[i].election })
        .populate({
          path: "winnerCandidates",
          populate: {
            path: "winner",
          },
        })
        .populate({
          path: "candidates",
          populate: {
            path: "supportiveMember",
          },
        })
        .populate({
          path: "candidates",
          populate: {
            path: "studentName",
          },
        })
        .select(
          " _id positionName applicationSDate applicationLDate electionVotingSDate electionVotingLDate winnerCandidates candidates electionResult"
        );
      let appPreS = new Date(ele.applicationSDate);
      let appPreL = new Date(ele.applicationLDate);
      let eleL = new Date(ele.electionVotingLDate);
      appPreS.setDate(appPreS.getDate() - 2);
      appPreL.setDate(appPreL.getDate() + 2);
      eleL.setDate(eleL.getDate() + 2);
      let appStatus = dateCheck(
        todayDate,
        ele.applicationSDate,
        ele.electionVotingLDate
      );
      let candidateList = ele.candidates;
      let candiList = [];
      if (
        todayDate < ele.electionVotingLDate &&
        todayDate > ele.applicationLDate
      ) {
        for (let j = 0; j < candidateList.length; j++) {
          let candi = {
            _id: candidateList[j].studentName._id,
            candidateStatus: candidateList[j].selectionStatus,
            candidatePhotoId: candidateList[j].studentName.photoId,
            candidateProfile: candidateList[j].studentName.studentProfilePhoto,
            candidateName: `${candidateList[j].studentName.studentFirstName} ${candidateList[j].studentName.studentMiddleName} ${candidateList[j].studentName.studentLastName}`,
            tagLine: candidateList[j].tagLine,
            memberList: [],
          };
          for (let i = 0; i < candidateList[j].supportiveMember.length; i++) {
            let st = {
              studentId: candidateList[j].supportiveMember[i]._id,
              memberPhotoId: candidateList[j].supportiveMember[i].photoId,
              studentProfile:
                candidateList[j].supportiveMember[i].studentProfilePhoto,
              memberName: `${candidateList[j].supportiveMember[i].studentFirstName} ${candidateList[j].supportiveMember[i].studentMiddleName} ${candidateList[j].supportiveMember[i].studentLastName}`,
            };
            candi.memberList.push(st);
          }
          if (candi.candidateStatus === "Selected") {
            candiList.push(candi);
          }
        }
      }
      let winner;
      if (ele.electionResult === true) {
        winner = {
          stId: ele.winnerCandidates.winner._id,
          photoId: ele.winnerCandidates.winner.photoId,
          winnerProfile: ele.winnerCandidates.winner.studentProfilePhoto,
          name: `${ele.winnerCandidates.winner.studentFirstName} ${ele.winnerCandidates.winner.studentMiddleName} ${ele.winnerCandidates.winner.studentLastName}`,
        };
      } else {
        winner = {
          stId: "",
          name: "",
        };
      }
      let newObj = {
        _id: ele._id,
        eleDateStatus: appStatus,
        twoDaysBefour: appPreS,
        twoDaysAfter: appPreL,
        ele2DaysAfter: eleL,
        status: deptEle[i].electionStatus,
        positionName: ele.positionName,
        applicationSDate: ele.applicationSDate,
        applicationLDate: ele.applicationLDate,
        electionSDate: ele.electionVotingSDate,
        electionLDate: ele.electionVotingLDate,
        eleWinner: winner,
        eleCandidates: candiList,
      };
      stDeptElections.push(newObj);
    }
    res
      .status(200)
      .send({ message: "All Elections in Student", stDeptElections });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/elections-details)`
    );
  }
});

app.post(
  "/student/:sid/election-candidate-apply/election/:eid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { sid, eid } = req.params;
      const { eleApplyData } = req.body;

      const studentText = await Student.findById({ _id: sid });
      const electionText = await Elections.findById({ _id: eid });
      const notify = await new Notification({});

      let eleCandidate = {
        studentName: sid,
        tagLine: eleApplyData.tagLine,
        supportiveMember: [],
      };
      for (let j = 0; j < eleApplyData.supportiveMember.length; j++) {
        let st = eleApplyData.supportiveMember[j].stId;
        eleCandidate.supportiveMember.push(st);
      }
      electionText.candidates.push(eleCandidate);
      function indIndex(arraytosearch, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
          if (arraytosearch[i].election == valuetosearch) {
            return i;
          }
        }
        return null;
      }
      let eleList = studentText.deptElections;
      let eleIndex = indIndex(eleList, eid);
      studentText.deptElections[eleIndex].electionStatus = "Applied";
      notify.notifyContent = `You are Applyed for Position of ${electionText.positionName}. Stay Updated With Us.`;
      notify.notifySender = electionText.electionForDepartment;
      notify.notifyByDepartPhoto = electionText.electionForDepartment;
      notify.notifyReceiever = studentText._id;
      notify.user = studentText.user;
      const user = await User.findById({ _id: studentText.user });
      user.uNotify.push(notify);

      electionText.save();
      studentText.save();
      notify.save();
      user.save();
      res.status(201).send({ message: "Application Applied Successfully." });
      console.log("rought Run SuccessFully");
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/studnet/:sid/election-candidate-apply/election/:eid)`
      );
    }
  }
);

app.get("/election-all-student/:eid", async (req, res) => {
  try {
    const { eid } = req.params;
    const electionText = await Elections.findById({ _id: eid });
    const departmentText = await Department.findById({
      _id: electionText.electionForDepartment,
    }).populate({
      path: "userBatch",
      populate: {
        path: "classroom",
        populate: {
          path: "ApproveStudent",
        },
      },
    });
    let classrooms = departmentText.userBatch.classroom;
    let stList = [];
    for (let i = 0; i < classrooms.length; i++) {
      let students = classrooms[i].ApproveStudent;
      for (let j = 0; j < students.length; j++) {
        let student = {
          stId: classrooms[i].ApproveStudent[j]._id,
          name: `${classrooms[i].ApproveStudent[j].studentFirstName} ${classrooms[i].ApproveStudent[j].studentMiddleName} ${classrooms[i].ApproveStudent[j].studentLastName}`,
        };
        stList.push(student);
      }
    }
    res.status(200).send({ message: "Election ALl Student Arr.", stList });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/election-all-student/:eid)`
    );
  }
});

app.post(
  "/department-election/:eid/student-select/:sid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { eid, sid } = req.params;
      const electionText = await Elections.findById({ _id: eid });
      const studentText = await Student.findById({ _id: sid });
      const user = await User.findById({ _id: studentText.user });
      const notify = await new Notification({});

      function indStELeIndex(arraytosearch, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
          if (arraytosearch[i].election == valuetosearch) {
            return i;
          }
        }
        return null;
      }
      function indEleStIndex(arraytosearch, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
          if (arraytosearch[i].studentName == valuetosearch) {
            return i;
          }
        }
        return null;
      }
      let stEleList = studentText.deptElections;
      let stEleIndex = indStELeIndex(stEleList, eid);
      studentText.deptElections[stEleIndex].electionStatus = "Selected";

      let eleStList = electionText.candidates;
      let eleStIndex = indEleStIndex(eleStList, sid);
      electionText.candidates[eleStIndex].selectionStatus = "Selected";

      notify.notifyContent = `You have been selected for ${
        electionText.positionName
      }. Election campaign are start from ${moment(
        electionText.applicationLDate
      ).format("DD-MMM")} to ${moment(electionText.electionVotingSDate).format(
        "DD-MMM"
      )} till ${moment(electionText.electionVotingLDate).format("LT")}.`;
      notify.notifySender = electionText.electionForDepartment;
      notify.notifyByDepartPhoto = electionText.electionForDepartment;
      notify.notifyReceiever = studentText._id;
      notify.user = studentText.user;
      user.uNotify.push(notify);
      await studentText.save();
      await notify.save();
      await user.save();
      await electionText.save();
      res.status(201).send({ message: `Student Selected Successful.` });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/department-election/:eid/student-select/:sid)`
      );
    }
  }
);

app.post(
  "/department-election/:eid/student-remove/:sid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { eid, sid } = req.params;
      console.log(eid, sid);

      const electionText = await Elections.findById({ _id: eid });
      const studentText = await Student.findById({ _id: sid });
      const user = await User.findById({ _id: studentText.user });
      const notify = await new Notification({});

      function indStELeIndex(arraytosearch, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
          if (arraytosearch[i].election == valuetosearch) {
            return i;
          }
        }
        return null;
      }
      function indEleStIndex(arraytosearch, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
          if (arraytosearch[i].studentName == valuetosearch) {
            return i;
          }
        }
        return null;
      }
      let stEleList = studentText.deptElections;
      let stEleIndex = indStELeIndex(stEleList, eid);
      studentText.deptElections[stEleIndex].electionStatus = "Applied";

      let eleStList = electionText.candidates;
      let eleStIndex = indEleStIndex(eleStList, sid);
      electionText.candidates[eleStIndex].selectionStatus = "Not Selected";

      notify.notifyContent = `You have Not been Selected for ${electionText.positionName} Election.`;
      notify.notifySender = electionText.electionForDepartment;
      notify.notifyByDepartPhoto = electionText.electionForDepartment;
      notify.notifyReceiever = studentText._id;
      notify.user = studentText.user;

      user.uNotify.push(notify);
      await studentText.save();
      await notify.save();
      await user.save();
      await electionText.save();
      res.status(201).send({ message: "Student Remove Successful." });
      console.log("studnet Removed");
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/department-election/:eid/student-remove/:sid)`
      );
    }
  }
);

app.post(
  "/department-election/:eid/vote/:sid",
  isLoggedIn,
  async (req, res) => {
    try {
      const { eid, sid } = req.params;
      const { data } = req.body;

      const electionText = await Elections.findById({ _id: eid });
      const studentText = await Student.findById({ _id: sid });
      const user = await User.findById({ _id: studentText.user });
      const notify = await new Notification({});

      function indStELeIndex(arraytosearch, valuetosearch) {
        for (var i = 0; i < arraytosearch.length; i++) {
          if (arraytosearch[i].election == valuetosearch) {
            return i;
          }
        }
        return null;
      }

      let vote = {
        voterId: sid,
        votedTo: data.candidate,
      };
      electionText.voteCount.push(vote);
      let coteCount = electionText.candidates[data.index.candidateIndex].vote;
      electionText.candidates[data.index.candidateIndex].vote =
        Number(coteCount) + 1;

      let stEleIndex = indStELeIndex(studentText.deptElections, eid);
      studentText.deptElections[stEleIndex].electionStatus = "Voted";

      notify.notifyContent = `Your vote is Successfully cast for ${electionText.positionName}.`;
      notify.notifySender = electionText.electionForDepartment;
      notify.notifyByDepartPhoto = electionText.electionForDepartment;
      notify.notifyReceiever = studentText._id;
      notify.user = studentText.user;

      user.uNotify.push(notify);

      await studentText.save();
      await notify.save();
      await user.save();
      await electionText.save();

      res.status(201).send({ message: "Voted is Successfully Casted." });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/department-election-creation/:did)`
      );
    }
  }
);

/////===============================================
// ============================ Vaibhav MCQ ===========================A

// get All Question Rought
app.get(
  "/user/:id/subject/:suid/mcq/all-questions/",
  isLoggedIn,
  async (req, res) => {
    try {
      const { suid } = req.params;
      const subject = await Subject.findById({ _id: suid }).populate("class");
      const allQue = await McqQuestions.find({
        subjectMaster: subject.subjectMasterName,
        classMaster: subject.class.masterClassName,
      }).select(" _id question");
      res.status(200).send({ message: "All Question of Staff", allQue });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/user/:id/mcq/all-questions/)`
      );
    }
  }
);

app.get("/mcq/question/:qid/", isLoggedIn, async (req, res) => {
  try {
    const { qid } = req.params;
    const Que = await McqQuestions.findById({ _id: qid }).select(
      " _id question questionOptions queSolutionOpt queSolutionText queSolutionImg"
    );
    res.status(200).send({ message: "Que requisted", Que });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/user/:id/staff/:sid/mcq/question/:qid/)`
    );
  }
});

app.post(
  "/user/:id/subject/:suid/mcq/new-question/",
  isLoggedIn,
  async (req, res) => {
    try {
      const { suid } = req.params;
      const { questionData } = req.body;
      const subject = await Subject.findById({ _id: suid }).populate("class");
      const subMaster = await SubjectMaster.findById({
        _id: subject.subjectMasterName,
      });
      const classMaster = await ClassMaster.findById({
        _id: subject.class.masterClassName,
      });

      let arr = [
        questionData.op1,
        questionData.op2,
        questionData.op3,
        questionData.op4,
      ];
      const question = await new McqQuestions({
        subjectMaster: subject.subjectMasterName,
        classMaster: subject.class.masterClassName,
        question: questionData.question,
        questionOptions: arr,
        queSolutionOpt: questionData.correctOpt,
        queSolutionText: questionData.correct,
        queSolutionImg: questionData.img,
      });

      subMaster.subjectQuestions.push(question);
      classMaster.classQuestions.push(question);
      let que = question;
      await subMaster.save();
      await classMaster.save();
      await question.save();
      res.status(200).send({ message: "Que Created Successfully", question });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/user/:id/subject/:suid/mcq/new-question/)`
      );
    }
  }
);

app.get("/question-solution/doc/:key", async (req, res) => {
  try {
    const key = req.params.key;
    const readStream = getFileStream(key);
    readStream.pipe(res);
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/question-solution/doc/:key)`
    );
  }
});

app.post(
  "/question-solution/doc/:id",
  upload.single("file"),
  async (req, res) => {
    try {
      const id = req.params.id;
      console.log(id);
      const file = req.file;
      const results = await uploadDocFile(file);
      const question = await McqQuestions.findById({ _id: id });
      question.queSolutionImg = results.key;
      console.log(results.key);
      await question.save();
      console.log("image saved in Question Schema");
      await unlinkFile(file.path);
      res.status(200).send({ message: "Uploaded" });
      console.log("msg send back");
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/question-solution/doc/:id)`
      );
    }
  }
);

app.get(
  "/user/:id/subject/:suid/mcq/all-test-set/",
  isLoggedIn,
  async (req, res) => {
    try {
      const { suid } = req.params;
      const subject = await Subject.findById({ _id: suid }).populate("class");
      const testSet = await McqTestSets.find({
        testSubjectMaster: subject.subjectMasterName,
        testClassMaster: subject.class.masterClassName,
      }).select(
        " _id testSetName testSetQueCount testSetTotalMarks testSetStatus participatingStudent"
      );
      res.status(200).send({ message: "All TestSet of Subject", testSet });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/user/:id/subject/:suid/mcq/all-test-set/)`
      );
    }
  }
);

app.get(
  "/user/:id/subject/:suid/mcq/all-schedule-test-set/",
  isLoggedIn,
  async (req, res) => {
    try {
      const { suid } = req.params;
      const subject = await Subject.findById({ _id: suid }).populate("class");
      const scheTestSet = await ScheduleTestSets.find({
        testSubjectMaster: subject.subjectMasterName,
        testClassMaster: subject.class.masterClassName,
      }).select(
        " _id testSet testSetExamName testTakenDate  testSetSolTime  participatingStudent scheduleTestStatus "
      );
      const testSets = [];
      for (let i = 0; i < scheTestSet.length; i++) {
        let schdule = scheTestSet[i];
        const testSet2 = await McqTestSets.findById({ _id: schdule.testSet });
        let testData = {
          testStatus: schdule.scheduleTestStatus,
          testSetExamName: schdule.testSetExamName,
          testSetName: testSet2.testSetName,
          testSetTotalMarks: testSet2.testSetTotalMarks,
          questionCount: testSet2.testSetQueCount,
          testSetSolTime: schdule.testSetSolTime,
          testTakenDate: schdule.testTakenDate,
          participatingStudent: schdule.participatingStudent,
        };
        testSets.push(testData);
      }
      res
        .status(200)
        .send({ message: "All Taken TestSet of Subject", testSets });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/user/:id/subject/:suid/mcq/all-schedule-test-set/)`
      );
    }
  }
);

app.get(
  "/class/:cid/subject/:smid/mcq/all-schedule-test-set/",
  isLoggedIn,
  async (req, res) => {
    try {
      const { cid, smid } = req.params;
      const testSet = await ScheduleTestSets.find({
        testSubjectMaster: smid,
        testClassMaster: cid,
      }).select(" _id testSetName participatingStudent ");
      console.log(testSet);
      res.status(200).send({ message: "All TestSet of Subject", testSet });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/class/:cid/subject/:smid/mcq/all-scheduletest-set/)`
      );
    }
  }
);

app.get(
  "/class/:cid/subject/:smid/mcq/all-test-set/",
  isLoggedIn,
  async (req, res) => {
    try {
      const { cid, smid } = req.params;
      const testSet = await McqTestSets.find({
        testSubjectMaster: smid,
        testClassMaster: cid,
      }).select(" _id testSetName testSetTotalMarks");
      res.status(200).send({ message: "All TestSet of Subject", testSet });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/class/:cid/subject/:smid/mcq/all-test-set/)`
      );
    }
  }
);

app.get("/mcq/test-set/:tid", isLoggedIn, async (req, res) => {
  try {
    const { tid } = req.params;
    const testData = await ScheduleTestSets.findById({ _id: tid });
    const queData = await McqTestSets.findById({ _id: testData.testSet });
    let testQue = queData.testQuestions;

    let testDataText = {
      examId: testData.examId,
      testSet: testData.testSet,
      testSetExamName: testData.testSetExamName,
      testTakenDate: testData.testTakenDate,
      testSetSolTime: testData.testSetSolTime,
      testSetTotalMarks: queData.testSetTotalMarks,
      testSetQueCount: testQue.length,
    };

    let queArr = [];
    for (let i = 0; i < testQue.length; i++) {
      const testQueData = await McqQuestions.findById({
        _id: testQue[i].question,
      }).select(" _id question questionOptions ");
      let data = {
        questionId: testQueData._id,
        question: testQueData.question,
        options: testQueData.questionOptions,
        mark: testQue[i].mark,
        queStatus: "",
        selectedAns: "",
      };
      queArr.push(data);
    }
    let data = {
      testData: testDataText,
      queArr: queArr,
    };
    res.status(200).send({ message: "TestSet for Student test", data });
  } catch {
    console.log(`SomeThing Went Wrong at this EndPoint(/mcq/test-set/:tid)`);
  }
});

app.post(
  "/user/:id/subject/:suid/mcq/new-test-set/",
  isLoggedIn,
  async (req, res) => {
    try {
      const { id, suid } = req.params;
      const { testData } = req.body;

      const subject = await Subject.findById({ _id: suid }).populate("class");
      const subMaster = await SubjectMaster.findById({
        _id: subject.subjectMasterName,
      });
      const classMaster = await ClassMaster.findById({
        _id: subject.class.masterClassName,
      });

      let arr = testData.questions;
      let arr2 = [];
      for (let i = 0; i < arr.length; i++) {
        let queData = {
          question: arr[i].queId,
          mark: arr[i].queMark,
        };
        arr2.push(queData);
      }
      const testSet = await new McqTestSets({
        testSubjectMaster: subject.subjectMasterName,
        testClassMaster: subject.class.masterClassName,
        testSetName: testData.testName,
        testSetQueCount: testData.totalQuestions,
        testSetTotalMarks: testData.totalMarks,
        testQuestions: arr2,
      });
      subMaster.subjectTestSets.push(testSet);
      classMaster.classTestSets.push(testSet);
      await testSet.save();
      await subMaster.save();
      await classMaster.save();
      res.status(201).send({ message: "TestSet Created Successfully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/user/:id/staff/:sid/mcq/new-test-set/)`
      );
    }
  }
);

app.post(
  "/user/:id/subject/:suid/mcq/scheduled-test-set/",
  isLoggedIn,
  async (req, res) => {
    try {
      const { suid } = req.params;
      const { shadTestData } = req.body;

      let testDate = new Date(shadTestData.testDate);
      let hour = shadTestData.testTime.slice(0, 2);
      let min = shadTestData.testTime.slice(3, 5);
      testDate.setHours(hour, min, 00);

      const sub = await Subject.findById({ _id: suid }).populate("class");

      const scheduleTestSet = await new ScheduleTestSets({
        testSubjectMaster: sub.subjectMasterName,
        testClassMaster: sub.class.masterClassName,
        testSet: shadTestData.testSetId,
        testSetExamName: shadTestData.testName,
        testSetSolTime: shadTestData.totalTime,
        testTakenDate: testDate,
      });
      let aStudent = sub.class.ApproveStudent;
      for (let i = 0; i < aStudent.length; i++) {
        const stText = await Student.findById({ _id: aStudent[i] });
        let db = {
          scheduleTestSet: scheduleTestSet._id,
          testSetType: "Subject Test",
          testQue: [],
        };
        stText.testSet.push(db);

        const notify = await new Notification({});
        notify.notifyContent = `Your Subject Test ${
          scheduleTestSet.testSetExamName
        } is shedule on ${moment(scheduleTestSet.testTakenDate).format(
          "DD-MMM-YYYY"
        )} at ${moment(scheduleTestSet.testTakenDate).format("LT")}.`;
        notify.notifySender = suid;
        notify.notifyByDepartPhoto = suid;
        notify.notifyReceiever = stText._id;
        notify.user = stText.user;
        const user = await User.findById({ _id: stText.user });
        user.uNotify.push(notify);
        await notify.save();
        await user.save();
        await stText.save();
      }
      await scheduleTestSet.save();
      res.status(201).send({ message: "TestSet Scheduled Successfully" });
    } catch {
      console.log(
        `SomeThing Went Wrong at this EndPoint(/user/:id/subject/:suid/mcq/scheduled-test-set/)`
      );
    }
  }
);

app.get("/student/:sid/all-test-set/", isLoggedIn, async (req, res) => {
  try {
    const { sid } = req.params;
    const studentText = await Student.findById({ _id: sid });
    let getTestList = studentText.testSet;
    let testSetArr = [];
    for (let i = 0; i < getTestList.length; i++) {
      const scheduletest = await ScheduleTestSets.findById({
        _id: getTestList[i].scheduleTestSet,
      }).select(
        " _id testSetExamName testSetStatus testTakenDate testSetSolTime testSet"
      );
      const testSet = await McqTestSets.findById({
        _id: scheduletest.testSet,
      }).select(" _id testSetTotalMarks");
      let testSDate = new Date(scheduletest.testTakenDate);
      let testLDate = new Date(scheduletest.testTakenDate);
      let minite = testLDate.getMinutes();
      testLDate.setMinutes(Number(minite) + Number(testSet.testSetSolTime));
      let boj = {
        _id: scheduletest._id,
        testType: getTestList[i].testSetType,
        testSetStatus: getTestList[i].testStatus,
        studentMarks: getTestList[i].obtainMarks,
        testSetTotalMarks: testSet.testSetTotalMarks,
        testSetExamName: scheduletest.testSetExamName,
        testTakenDate: scheduletest.testTakenDate,
        testEndDate: testLDate,
      };
      testSetArr.push(boj);
    }
    res.status(200).send({ message: "All TestSet of Student", testSetArr });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/all-test-set/)`
    );
  }
});

app.post("/student/:sid/mcq/test-submit/:tid", isLoggedIn, async (req, res) => {
  try {
    const { sid, tid } = req.params;
    const { questions } = req.body;
    const scheduleTest = await ScheduleTestSets.findById({ _id: tid });
    const testSet = await McqTestSets.findById({ _id: scheduleTest.testSet });
    const stText = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: stText.user });
    const notify = await new Notification({});

    function arrSum(newList) {
      let total = [];
      let sum = 0;
      if (!Array.isArray(newList)) return;
      newList.forEach((each) => {
        sum += each;
      });
      total.push(sum);
      return total;
    }
    function indIndex(arraytosearch, valuetosearch) {
      for (var i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i].scheduleTestSet == valuetosearch) {
          return i;
        }
      }
      return null;
    }
    let queArr = [];
    let marks = [];
    for (let i = 0; i < questions.length; i++) {
      const testQue = await McqQuestions.findById({
        _id: questions[i].questionId,
      }).select(" question queSolutionOpt ");
      let db = {
        questionId: questions[i].questionId,
        mark: questions[i].mark,
        selectedAns: questions[i].selectedAns,
      };
      queArr.push(db);
      if (Number(questions[i].selectedAns) === Number(testQue.queSolutionOpt)) {
        marks.push(questions[i].mark);
      }
    }
    let marks2 = arrSum(marks);
    let stTestList = stText.testSet;
    let TestIndex = indIndex(stTestList, tid);
    stText.testSet[TestIndex].testStatus = "Completed";
    stText.testSet[TestIndex].obtainMarks = Number(marks2[0]);
    stText.testSet[TestIndex].testQue = queArr;
    let obj2 = {
      student: sid,
      studentName: `${stText.studentFirstName} ${stText.studentMiddleName} ${stText.studentLastName}`,
      studentMarks: Number(marks2[0]),
    };
    scheduleTest.participatingStudent.push(obj2);

    notify.notifyContent = `Your Subject Test ${scheduleTest.testSetExamName} is Completed Successfully. Your Score is ${marks2} out Of ${testSet.testSetTotalMarks}.`;
    console.log(notify.notifyContent);
    notify.notifySender = stText.studentClass;
    notify.notifyByDepartPhoto = stText.studentClass;
    notify.notifyReceiever = stText._id;
    notify.user = stText.user;
    user.uNotify.push(notify);

    scheduleTest.scheduleTestStatus = "Taken";

    await stText.save();
    await scheduleTest.save();
    await user.save();
    await notify.save();
    res.status(201).send({ message: "Test Submitted Successfully." });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/mcq/test-submit/:tid)`
    );
  }
});

app.post("/student/:sid/mcq/exam-submit/:tid", isLoggedIn, async (req, res) => {
  try {
    const { sid, tid } = req.params;
    const { questions } = req.body;
    const scheduleTest = await ScheduleTestSets.findById({ _id: tid });
    const testSet = await McqTestSets.findById({ _id: scheduleTest.testSet });
    const stText = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: stText.user });
    const notify = await new Notification({});

    function arrSum(newList) {
      let total = [];
      let sum = 0;
      if (!Array.isArray(newList)) return;
      newList.forEach((each) => {
        sum += each;
      });
      total.push(sum);
      return total;
    }
    let queArr = [];
    let marks = [];
    for (let i = 0; i < questions.length; i++) {
      const testQue = await McqQuestions.findById({
        _id: questions[i].questionId,
      }).select(" question queSolutionOpt ");
      let db = {
        questionId: questions[i].questionId,
        mark: questions[i].mark,
        selectedAns: questions[i].selectedAns,
      };
      queArr.push(db);
      if (Number(questions[i].selectedAns) === Number(testQue.queSolutionOpt)) {
        marks.push(questions[i].mark);
      }
    }
    function indIndex(arraytosearch, valuetosearch) {
      console.log("Function Run");
      for (var i = 0; i < arraytosearch.length; i++) {
        if (arraytosearch[i].scheduleTestSet == valuetosearch) {
          return i;
        }
      }
      return null;
    }
    let marks2 = arrSum(marks);
    let stTestList = stText.testSet;
    // let TestIndex = indIndex(stTestList, tid)
    let tIndex = () => {
      for (var i = 0; i < stTestList.length; i++) {
        if (stTestList[i].scheduleTestSet == tid) {
          return i;
        }
      }
      return "Not Found";
    };
    let TestIndex = tIndex();
    stText.testSet[TestIndex].testStatus = "Completed";
    // stText.testSet[TestIndex].obtainMarks = Number(marks2[0]);
    stText.testSet[TestIndex].testQue = queArr;
    console.log(marks2[0]);
    let obj2 = {
      student: sid,
      studentName: `${stText.studentFirstName} ${stText.studentMiddleName} ${stText.studentLastName}`,
      studentMarks: Number(marks2[0]),
    };
    scheduleTest.participatingStudent.push(obj2);

    const student = await Student.findById({ _id: sid });
    const examData = await Exam.findById({ _id: scheduleTest.examId });
    const subjectData = await Subject.find({
      subjectMasterName: scheduleTest.testSubjectMaster,
    });

    let examListOfStudent = stText.studentMarks;

    let exId = {};
    for (let i = 0; i < examListOfStudent.length; i++) {
      if (examListOfStudent[i].examId == scheduleTest.examId) {
        exId = examListOfStudent[i];
      }
    }
    let exIndex = () => {
      for (var i = 0; i < examListOfStudent.length; i++) {
        let exlId = examListOfStudent[i].examId.toString();
        let stestId = scheduleTest.examId.toString();
        if (exlId === stestId) {
          return i;
        }
      }
      return "Not Found";
    };
    let examIndex = exIndex();
    // // // Find Exam Subject in List of Exam Subjects
    let examSubList = examListOfStudent[examIndex].subjectMarks;

    let subjeIndex = () => {
      for (var i = 0; i < examSubList.length; i++) {
        let listSub = examSubList[i].subMasterId.toString();
        let exSub = scheduleTest.testSubjectMaster.toString();
        if (listSub == exSub) {
          return i;
        }
      }
      return "Not Found";
    };
    let examSubIndex = subjeIndex();
    stText.studentMarks[examIndex].subjectMarks[examSubIndex].obtainMarks =
      marks2[0];
    stText.studentMarks[examIndex].subjectMarks[
      examSubIndex
    ].subjectMarksStatus = "Updated";

    console.log(stText.studentMarks[examIndex].subjectMarks[examSubIndex]);
    await stText.save();

    // Check Exam Status To be Updated:-

    const studentData2 = await Student.findById({ _id: sid });

    examSubList2 = studentData2.studentMarks[examIndex].subjectMarks;
    subLisLength = examSubList2.length;
    filterExamSubListUpdate = examSubList2.filter((e) => {
      return e.subjectMarksStatus === "Updated";
    });
    filterListLength = filterExamSubListUpdate.length;

    if (subLisLength === filterListLength) {
      studentData2.studentMarks[examIndex].allSubjectMarksStatus = "Updated";
      studentData2.save();
    }

    // Update Final Report Status in Student Profile
    const studentData3 = await Student.findById({ _id: sid });
    examList2 = studentData2.studentMarks;
    exLisLength = examList2.length;
    filterExamSubListUpdate = examList2.filter((e) => {
      return e.allSubjectMarksStatus === "Updated";
    });
    filterListLength2 = filterExamSubListUpdate.length;
    if (exLisLength === filterListLength2) {
      studentData3.studentFinalReportFinalizedStatus = "Ready";
      studentData3.save();
    }

    notify.notifyContent = `Your Exam ${scheduleTest.testSetExamName} is Completed Successfully.`;
    console.log(notify.notifyContent);
    notify.notifySender = stText.studentClass;
    notify.notifyByDepartPhoto = stText.studentClass;
    notify.notifyReceiever = stText._id;
    notify.user = stText.user;
    user.uNotify.push(notify);
    scheduleTest.scheduleTestStatus = "Taken";

    await stText.save();
    await scheduleTest.save();
    await user.save();
    await notify.save();
    res.status(201).send({ message: "Test Submitted Successfully." });
  } catch {
    console.log(
      `SomeThing Went Wrong at this EndPoint(/student/:sid/mcq/exam-submit/:tid)`
    );
  }
});

///////////////////////FOR THE DEPART AND ALL EDIT AND DELETE//////////////////

app.get("/getDepartment/:did", update.getDepartment);
app.patch("/updateDepartment/:did", update.updateDepartment);
app.delete("/delDepartment/:did", update.delDepartment);

app.patch("/updateClassMaster/:cid", update.updateClassMaster);
app.delete("/delClassMaster/:cid", update.delClassMaster);
//bjbj
app.patch("/updateClass/:cid", update.updateClass);
app.delete("/delClass/:cid", update.delClass);

app.patch("/updateSubjectMaster/:sid", update.updateSubjectMaster);
app.delete("/delSubjectMaster/:sid", update.delSubjectMaster);

app.patch("/updateSubject/:sid", update.updateSubject);
app.delete("/delSubject/:sid", update.delSubject);

app.patch("/updateSubjectTitle/:sid", update.updateSubjectTitle);
app.delete("/delSubjectTitle/:sid", update.delSubjectTitle);

app.patch("/updateChecklist/:cid", update.updateChecklist);
app.delete("/delChecklist/:cid", update.delChecklist);

// updateFees
app.patch("/updateFees/:fid", update.updateFees);
app.patch("/updateHoliday/:hid", update.updateHoliday);
app.delete("/delHoliday/:hid", update.delHoliday);

// updateStudentProfile; updateStaffProfile
app.patch("/updateStudentProfile/:sid", update.updateStudentProfile);
app.patch("/updateStaffProfile/:sid", update.updateStaffProfile);

app.delete("/delBatch/:bid", update.delBatch);
app.patch("/updateBatch/:bid", update.updateBatch);

/////FOR THE NEW ROUTE
app.get("/searchIns", newCode.searchInstitute);
app.get("/searchUser", newCode.searchUser);
app.get("/getUser/:id", newCode.getUser);
app.get("/getUserPost/:uid", newCode.getUserPost);

app.get(
  "/getInstitutePostInLimit/:id/:page/:limit",
  newCode.getInstitutePostInLimit
);

app.get(
  "/getAllInsStaffInLimit/:id/:page/:limit",
  newCode.getAllInsStaffInLimit
);

app.get(
  "/getAllInsStudentInLimit/:id/:page/:limit",
  newCode.getAllInsStudentInLimit
);

app.get(
  "/getInstituteSavePostInLimit/:id/:page/:limit",
  newCode.getInstituteSavePostInLimit
);

app.get(
  "/getInstituteSelfPostInLimit/:id/:page/:limit",
  newCode.getInstituteSelfPostInLimit
);

app.get("/getUserPostDashboard/:id/:page/:limit", newCode.getUserPostDashboard);

app.get("/checkStudentinSubject/:sid", newCode.checkStudentinSubject);
app.get("/reactionUser/:pid/:page/:limit", newCode.reactionUser);
app.get("/reactionInstitute/:pid/:page/:limit", newCode.reactionInstitute);
app.get("/circleser/:uid", newCode.getTagCircleUser);

app.get(
  "/getUserPostCommentReplyInLimit/:pcid/:page/:limit",
  newCode.getUserPostCommentReplyInLimit
);

app.get(
  "/getinsPostCommentInLimit/:id/:page/:limit",
  newCode.getinsPostCommentInLimit
);
app.get("/likeComment/:cid/:id", newCode.likeComment);
app.get("/likeCommentUser/:cid/:id", newCode.likeCommentUser);

// app.get("/getCircleUserInLimit/:id/:page/:limit", newCode.getCircleUserInLimit);
app.get("*", (req, res) => {
  res.status(404).send("Page Not Found...");
});

const port = process.env.PORT || 8080;

const server = app.listen(port, function () {
  console.log("Server listening on port " + port);
});


const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*"
    // methods: ["GET", "POST"]
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    console.log(userData)
    socket.join(userData);
    socket.emit("connected", (data) => {
      console.log(data)
    });
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      // var delievered = true
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData);
  });
});



  // socket.on("support chat", (room) => {
  //   socket.join(room);
  //   console.log("User Joined Room: " + room);
  // });

  // socket.on("support query", (newSupportQuery) => {
  //   var chat = newSupportQuery.chat;
  //   if (!chat.users) return console.log("chat.users not defined");

  //   chat.users.forEach((user) => {
  //     if (user == newSupportQuery.sender) return;
  //     // var delievered = true
  //     socket.in(user).emit("support query recieved", newSupportQuery);
  //   });
  // });
