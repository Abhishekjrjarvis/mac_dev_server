const Post = require("../../models/Post");
const Income = require("../../models/Income");
const Expense = require("../../models/Expense");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Batch = require("../../models/Batch");
const User = require("../../models/User");
const Class = require("../../models/Class");
const Admission = require("../../models/Admission/Admission");
const Student = require("../../models/Student");
const Finance = require("../../models/Finance");
const Department = require("../../models/Department");
const ClassMaster = require("../../models/ClassMaster");
const RemainingList = require("../../models/Admission/RemainingList");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const HostelUnit = require("../../models/Hostel/hostelUnit");
const {
  json_to_excel_query,
  transaction_json_to_excel_query,
  fee_heads_json_to_excel_query,
  fee_heads_receipt_json_to_excel_query,
  json_to_excel_hostel_application_query,
  json_to_excel_admission_application_query,
  json_to_excel_hostel_query,
  fee_heads_receipt_json_to_excel_repay_query,
  json_to_excel_normal_student_promote_query,
  json_to_excel_statistics_promote_query,
  scholar_transaction_json_to_excel_query,
  internal_fee_heads_receipt_json_to_excel_query,
  excess_refund_fees_json_query,
  certificate_json_query,
  json_to_excel_structure_code_query,
  json_to_excel_timetable_export_query,
  json_to_excel_non_applicable_fees_export_query,
  json_to_excel_deposit_export_query,
  fee_heads_receipt_json_to_excel_daybook_query,
  json_to_excel_slip_export_query,
  json_to_excel_admission_subject_application_query,
  json_to_excel_admission_query,
  json_to_excel_student_applicable_outstanding_query,
} = require("../../Custom/JSONToExcel");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const NewApplication = require("../../models/Admission/NewApplication");
const {
  custom_date_time_reverse,
  custom_year_reverse,
  custom_month_reverse,
  day_month_year_bifurgate,
  custom_date_time,
  custom_date_time_reverse_db,
} = require("../../helper/dayTimer");
const moment = require("moment");
const FeeStructure = require("../../models/Finance/FeesStructure");
const Hostel = require("../../models/Hostel/hostel");
const Notification = require("../../models/notification");
const RePay = require("../../models/Return/RePay");
const invokeSpecificRegister = require("../../Firebase/specific");
const BankAccount = require("../../models/Finance/BankAccount");
const Admin = require("../../models/superAdmin");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const QvipleId = require("../../models/Universal/QvipleId");
const Fees = require("../../models/Fees");
const { handle_NAN } = require("../../Handler/customError");
const CertificateQuery = require("../../models/Certificate/CertificateQuery");
const { remove_duplicated_arr } = require("../../helper/functions");
const Library = require("../../models/Library/Library");
const ClassTimetable = require("../../models/Timetable/ClassTimetable");
const FeesCategory = require("../../models/Finance/FeesCategory");
const FeeMaster = require("../../models/Finance/FeeMaster");
const DayBook = require("../../models/Finance/DayBook");
const PayrollModule = require("../../models/Finance/Payroll/PayrollModule");
const PaySlip = require("../../models/Finance/Payroll/PaySlip");
const daybookData = require("../../AjaxRequest/daybookData");
const bankDaybook = require("../../scripts/bankDaybook");
const { nested_document_limit } = require("../../helper/databaseFunction");
const SubjectGroupSelect = require("../../models/Admission/Optional/SubjectGroupSelect");
const SubjectMaster = require("../../models/SubjectMaster");
const admissionIntakeReport = require("../../scripts/admissionIntakeReport");
const miscellaneousBankDaybook = require("../../scripts/miscellaneousBankDaybook");
const hostelBankDaybook = require("../../scripts/hostelBankDaybook");
const combinedBankDaybook = require("../../scripts/combinedBankDaybook");
const Staff = require("../../models/Staff");

var trendingQuery = (trends, cat, type, page) => {
  if (cat !== "" && page === 1) {
    trends.forEach((ele, index) => {
      if (index > 2) return;
      ele.hash_trend = `#${index + 1} on trending `;
    });
  } else {
    if (type === "Repost" && page === 1) {
      trends.forEach((ele, index) => {
        if (index > 2) return;
        ele.hash_trend = `#${index + 1} on trending`;
      });
    } else {
      if (page === 1) {
        trends.forEach((ele, index) => {
          ele.hash_trend = `#${index + 1} on trending for ${
            ele.trend_category?.split(" ")[0]
          }`;
        });
      }
    }
  }
  return trends;
};

var sortRepostUpvote = (rePost) => {
  return function (f_Re, s_Re) {
    return (
      (f_Re[rePost]?.upVoteCount < s_Re[rePost]?.upVoteCount) -
      (f_Re[rePost]?.upVoteCount > s_Re[rePost]?.upVoteCount)
    );
  };
};

var sortPollVote = (poll) => {
  return function (f_Po, s_Po) {
    return (
      (f_Po[poll]?.total_votes < s_Po[poll]?.total_votes) -
      (f_Po[poll]?.total_votes > s_Po[poll]?.total_votes)
    );
  };
};

exports.retrieveByLearnQuery = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const category = req.query.filter_by ? req.query.filter_by : "";
    const skip = (page - 1) * limit;
    var post = await Post.find({ postType: "Repost" })
      .limit(limit)
      .skip(skip)
      .select(
        "postQuestion isHelpful is_hashtag answerCount answerUpVoteCount authorFollowersCount isUser isInstitute endUserSave trend_category createdAt postStatus commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine "
      )
      .populate({
        path: "rePostAnswer",
        populate: {
          path: "post",
          select: "postQuestion isUser answerCount",
        },
      })
      .populate({
        path: "hash_tag",
        select: "hashtag_name hashtag_profile_photo",
      });
    if (post?.length < 1) {
      res.status(200).send({ message: "filter By Learn", filteredLearn: [] });
    } else {
      var order_by_learn = post.sort(sortRepostUpvote("rePostAnswer"));
      var learn_data = trendingQuery(order_by_learn, category, "Repost", page);
      // const learnEncrypt = await encryptionPayload(learn_data);
      res
        .status(200)
        .send({ message: "filter By Learn", filteredLearn: learn_data });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveByAnswerQuery = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const category = req.query.filter_by ? req.query.filter_by : "";
    const skip = (page - 1) * limit;
    if (category !== "") {
      var post = await Post.find({
        $and: [{ trend_category: `${category}` }, { postType: "Question" }],
      })
        .sort("-needCount")
        .limit(limit)
        .skip(skip)
        .select(
          "needCount needUser is_hashtag answerCount postQuestion authorFollowersCount answerUpVoteCount isUser isInstitute endUserSave trend_category createdAt postStatus commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine hash_trend"
        )
        .populate({
          path: "hash_tag",
          select: "hashtag_name hashtag_profile_photo",
        });
    } else {
      var post = await Post.find({ postType: "Question" })
        .sort("-needCount")
        .limit(limit)
        .skip(skip)
        .select(
          "needCount needUser is_hashtag answerCount postQuestion answerUpVoteCount isUser isInstitute endUserSave trend_category createdAt postStatus commentCount author authorName authorUserName authorFollowersCount authorPhotoId authorProfilePhoto authorOneLine hash_trend"
        )
        .populate({
          path: "hash_tag",
          select: "hashtag_name hashtag_profile_photo",
        });
    }
    if (data?.length < 1) {
      res
        .status(200)
        .send({ message: "filter By Answer", filteredQuestion: [] });
    } else {
      var data = trendingQuery(post, category, "Question", page);
      // const answerEncrypt = await encryptionPayload(data);
      res
        .status(200)
        .send({ message: "filter By Answer", filteredQuestion: data });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveByParticipateQuery = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const category = req.query.filter_by ? req.query.filter_by : "";
    const skip = (page - 1) * limit;
    if (category !== "") {
      var post = await Post.find({
        $and: [{ trend_category: `${category}` }, { postType: "Poll" }],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "isUser isInstitute answerCount is_hashtag authorFollowersCount postType endUserSave trend_category createdAt postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike"
        )
        .populate({
          path: "poll_query",
        })
        .populate({
          path: "hash_tag",
          select: "hashtag_name hashtag_profile_photo",
        });
    } else {
      var post = await Post.find({ postType: "Poll" })
        .limit(limit)
        .skip(skip)
        .select(
          "isUser isInstitute answerCount is_hashtag authorFollowersCount postType endUserSave trend_category createdAt postStatus likeCount commentCount author authorName authorUserName authorPhotoId authorProfilePhoto authorOneLine endUserLike"
        )
        .populate({
          path: "poll_query",
        })
        .populate({
          path: "hash_tag",
          select: "hashtag_name hashtag_profile_photo",
        });
    }
    if (post?.length < 1) {
      res
        .status(200)
        .send({ message: "filter By Participate", filteredPoll: [] });
    } else {
      var order_by_poll = post.sort(sortPollVote("poll_query"));
      var data = trendingQuery(order_by_poll, category, "Poll", page);
      // const pollEncrypt = await encryptionPayload(data);
      res
        .status(200)
        .send({ message: "filter By Participate", filteredPoll: data });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.filterByDate = async (req, res) => {
  try {
    const { g_month, year, l_month } = req.query;
    const user = await User.find({
      created_at: {
        $gte: new Date(`${year}-${g_month}-01T00:00:00.000Z`),
        $lt: new Date(`${year}-${l_month}-01T00:00:00.000Z`),
      },
    }).select("userLegalName username");
    // const userEncrypt = await encryptionPayload(user);
    res.status(200).send({ message: "user", filter: user });
  } catch (e) {
    console.log(e);
  }
};

exports.filterByDateIncomes = async (req, res) => {
  try {
    const { g_month, year, l_month, fid } = req.query;
    var cash = 0;
    var bank = 0;
    const incomes = await Income.find({
      $and: [
        {
          createdAt: {
            $gte: new Date(`${year}-${g_month}-01T00:00:00.000Z`),
            $lt: new Date(`${year}-${l_month}-01T00:00:00.000Z`),
          },
        },
        { finances: fid },
      ],
    });
    if (incomes?.length >= 1) {
      incomes.forEach((val) => {
        if (`${val?.incomeAccount}` === "By Cash") {
          cash += val?.incomeAmount;
        }
        if (`${val?.incomeAccount}` === "By Bank") {
          bank += val?.incomeAmount;
        }
      });
    }
    var stats = {
      cash: cash,
      bank: bank,
      total: cash + bank,
    };
    if (incomes?.length >= 1) {
      // Add Another Encryption
      res
        .status(200)
        .send({ message: "Filter Incomes", f_incomes: incomes, stats: stats });
    } else {
      res.status(200).send({
        message: "user",
        f_incomes: [],
        stats: { cash: 0, bank: 0, total: 0 },
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.filterByDateExpenses = async (req, res) => {
  try {
    const { g_month, year, l_month, fid } = req.query;
    var cash = 0;
    var bank = 0;
    const expenses = await Expense.find({
      $and: [
        {
          createdAt: {
            $gte: new Date(`${year}-${g_month}-01T00:00:00.000Z`),
            $lt: new Date(`${year}-${l_month}-01T00:00:00.000Z`),
          },
        },
        { finances: fid },
      ],
    });
    if (expenses?.length >= 1) {
      expenses.forEach((val) => {
        if (`${val?.expenseAccount}` === "By Cash") {
          cash += val?.expenseAmount;
        }
        if (`${val?.expenseAccount}` === "By Bank") {
          bank += val?.expenseAmount;
        }
      });
    }
    var stats = {
      cash: cash,
      bank: bank,
      total: cash + bank,
    };
    if (expenses?.length >= 1) {
      // Add Another Encryption
      res.status(200).send({
        message: "Filter Expenses",
        f_expenses: expenses,
        stats: stats,
      });
    } else {
      res.status(200).send({
        message: "user",
        f_expenses: [],
        stats: { cash: 0, bank: 0, total: 0 },
      });
    }
  } catch (e) {
    console.log(e);
  }
};
// Add Another Encryption
exports.retrieveByActiveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, role } = req.query;
    var total = 0;
    var filter_student_gender = {
      boyCount: 0,
      girlCount: 0,
      otherCount: 0,
    };
    var filter_student_caste = {
      generalCount: 0,
      obcCount: 0,
      scCount: 0,
      stCount: 0,
      ntaCount: 0,
      ntbCount: 0,
      ntcCount: 0,
      ntdCount: 0,
      vjCount: 0,
    };
    const filter_ins = await InstituteAdmin.findById({ _id: id }).select(
      "batches"
    );
    if (type === "Active") {
      const filter_batch = await Batch.find({
        $and: [{ _id: { $in: filter_ins.batches } }, { activeBatch: "Active" }],
      }).select("ApproveStudent student_category");

      filter_batch?.forEach((ele) => {
        total += ele?.ApproveStudent?.length;
        filter_student_gender.boyCount += ele?.student_category?.boyCount;
        filter_student_gender.girlCount += ele?.student_category?.girlCount;
        filter_student_gender.otherCount += ele?.student_category?.otherCount;
        filter_student_caste.generalCount +=
          ele?.student_category?.generalCount;
        filter_student_caste.obcCount += ele?.student_category?.obcCount;
        filter_student_caste.scCount += ele?.student_category?.scCount;
        filter_student_caste.stCount += ele?.student_category?.stCount;
        filter_student_caste.ntaCount += ele?.student_category?.ntaCount;
        filter_student_caste.ntbCount += ele?.student_category?.ntbCount;
        filter_student_caste.ntcCount += ele?.student_category?.ntcCount;
        filter_student_caste.ntdCount += ele?.student_category?.ntdCount;
        filter_student_caste.vjCount += ele?.student_category?.vjCount;
      });
      if (role === "Gender") {
        res.status(200).send({
          message: "Filter Active Batch Student Chart gender",
          filter_student: filter_student_gender,
          total: total,
        });
      } else if (role === "Caste") {
        res.status(200).send({
          message: "Filter Active Batch Student Chart caste",
          filter_student: filter_student_caste,
          total: total,
        });
      }
    } else if (type === "All") {
      const filter_batch = await Batch.find({
        _id: { $in: filter_ins.batches },
      }).select("ApproveStudent student_category");
      filter_batch?.forEach((ele) => {
        total += ele?.ApproveStudent?.length;
        filter_student_gender.boyCount += ele?.student_category?.boyCount;
        filter_student_gender.girlCount += ele?.student_category?.girlCount;
        filter_student_gender.otherCount += ele?.student_category?.otherCount;
        filter_student_caste.generalCount +=
          ele?.student_category?.generalCount;
        filter_student_caste.obcCount += ele?.student_category?.obcCount;
        filter_student_caste.scCount += ele?.student_category?.scCount;
        filter_student_caste.stCount += ele?.student_category?.stCount;
        filter_student_caste.ntaCount += ele?.student_category?.ntaCount;
        filter_student_caste.ntbCount += ele?.student_category?.ntbCount;
        filter_student_caste.ntcCount += ele?.student_category?.ntcCount;
        filter_student_caste.ntdCount += ele?.student_category?.ntdCount;
        filter_student_caste.vjCount += ele?.student_category?.vjCount;
      });
      if (role === "Gender") {
        res.status(200).send({
          message: "Filter All Batch Student Chart gender",
          filter_student: filter_student_gender,
          total: total,
        });
      } else if (role === "Caste") {
        res.status(200).send({
          message: "Filter All Batch Student Chart caste",
          filter_student: filter_student_caste,
          total: total,
        });
      }
    } else {
      res
        .status(404)
        .send({ message: "Are you looking something else in Data" });
    }
  } catch (e) {
    console.log(e);
  }
};
// Add Another Encryption
exports.retrieveByActiveStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, role } = req.query;
    var total = 0;
    if (type === "All") {
      const filter_ins = await InstituteAdmin.findById({ _id: id }).select(
        "ApproveStaff staff_category"
      );
      total += filter_ins?.ApproveStaff?.length;
      if (role === "Gender") {
        var gender = {
          boyCount: filter_ins?.staff_category?.boyCount,
          girlCount: filter_ins?.staff_category?.girlCount,
          otherCount: filter_ins?.staff_category?.otherCount,
        };
        res.status(200).send({
          message: "Filter All Staff Chart Gender",
          filter_staff: gender,
          total: total,
        });
      } else if (role === "Caste") {
        var caste = {
          generalCount: filter_ins?.staff_category?.generalCount,
          obcCount: filter_ins?.staff_category?.obcCount,
          scCount: filter_ins?.staff_category?.scCount,
          stCount: filter_ins?.staff_category?.stCount,
          ntaCount: filter_ins?.staff_category?.ntaCount,
          ntbCount: filter_ins?.staff_category?.ntbCount,
          ntcCount: filter_ins?.staff_category?.ntbCount,
          ntdCount: filter_ins?.staff_category?.ntdCount,
          vjCount: filter_ins?.staff_category?.vjCount,
        };
        res.status(200).send({
          message: "Filter All Staff Chart Caste",
          filter_staff: caste,
          total: total,
        });
      }
      var all_filter = {
        boyCount: filter_ins?.staff_category?.boyCount,
        girlCount: filter_ins?.staff_category?.girlCount,
        otherCount: filter_ins?.staff_category?.otherCount,
        generalCount: filter_ins?.staff_category?.generalCount,
        obcCount: filter_ins?.staff_category?.obcCount,
        scCount: filter_ins?.staff_category?.scCount,
        stCount: filter_ins?.staff_category?.stCount,
        ntaCount: filter_ins?.staff_category?.ntaCount,
        ntbCount: filter_ins?.staff_category?.ntbCount,
        ntcCount: filter_ins?.staff_category?.ntcCount,
        ntdCount: filter_ins?.staff_category?.ntdCount,
        vjCount: filter_ins?.staff_category?.vjCount,
      };
      if (role == undefined) {
        res.status(200).send({
          message: "Filter All Staff Chart All",
          filter_staff: all_filter,
          total: total,
        });
      }
    } else {
      res
        .status(404)
        .send({ message: "Are you looking something else in Data" });
    }
  } catch (e) {
    console.log(e);
  }
};

const sort_student_by_alpha_query = async (arr, day, month, year) => {
  var send_filter = [];
  const students = await Student.find({
    _id: { $in: arr },
  })
    .sort({ studentFName: 1, studentMName: 1, studentLName: 1 })
    .select("_id");

  for (let i = 0; i < students.length; i++) {
    const stu = await Student.findById({ _id: students[i]._id })
      .select(
        "leave studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO"
      )
      .populate({
        path: "leave",
        match: {
          date: { $in: [`${day}/${month}/${year}`] },
        },
        select: "date",
      })
      .populate({
        path: "user",
        select: "userLegalName username",
      });
    stu.studentROLLNO = i + 1;
    await stu.save();
    send_filter.push(stu);
  }
  return send_filter;
};

const sort_student_by_alpha_last_query = async (arr, day, month, year) => {
  var send_filter = [];
  const students = await Student.find({
    _id: { $in: arr },
  })
    .sort({ studentLName: 1, studentFName: 1, studentMName: 1 })
    .select("_id");

  for (let i = 0; i < students.length; i++) {
    const stu = await Student.findById({ _id: students[i]._id })
      .select(
        "leave studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO"
      )
      .populate({
        path: "leave",
        match: {
          date: { $in: [`${day}/${month}/${year}`] },
        },
        select: "date",
      })
      .populate({
        path: "user",
        select: "userLegalName username",
      });
    stu.studentROLLNO = i + 1;
    await stu.save();
    send_filter.push(stu);
  }
  return send_filter;
};

const sort_student_by_alpha = async (arr, day, month, year) => {
  var send_filter = [];
  const students = await Student.find({
    _id: { $in: arr },
  })
    .sort({ studentFirstName: 1, studentMiddleName: 1, studentLastName: 1 })
    .select("_id");

  for (let i = 0; i < students.length; i++) {
    const stu = await Student.findById({ _id: students[i]._id })
      .select(
        "leave studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO"
      )
      .populate({
        path: "leave",
        match: {
          date: { $in: [`${day}/${month}/${year}`] },
        },
        select: "date",
      })
      .populate({
        path: "user",
        select: "userLegalName username",
      });
    stu.studentROLLNO = i + 1;
    await stu.save();
    send_filter.push(stu);
  }
  return send_filter;
};

const sort_student_by_alpha_last = async (arr, day, month, year) => {
  var send_filter = [];
  const students = await Student.find({
    _id: { $in: arr },
  })
    .sort({ studentLastName: 1, studentFirstName: 1, studentMiddleName: 1 })
    .select("_id");

  for (let i = 0; i < students.length; i++) {
    const stu = await Student.findById({ _id: students[i]._id })
      .select(
        "leave studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO"
      )
      .populate({
        path: "leave",
        match: {
          date: { $in: [`${day}/${month}/${year}`] },
        },
        select: "date",
      })
      .populate({
        path: "user",
        select: "userLegalName username",
      });
    stu.studentROLLNO = i + 1;
    await stu.save();
    send_filter.push(stu);
  }
  return send_filter;
};

const sorted_by_gender = async (arr, day, month, year) => {
  var sorted_data = [];
  const studentFemale = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Female" }],
  }).select("_id");
  const studentMale = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Male" }],
  }).select("_id");

  const studentOther = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Other" }],
  }).select("_id");
  const data = [...studentFemale, ...studentMale, ...studentOther];
  for (let i = 0; i < data.length; i++) {
    const stu = await Student.findById({ _id: data[i]._id })
      .select(
        "leave studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO"
      )
      .populate({
        path: "leave",
        match: {
          date: { $in: [`${day}/${month}/${year}`] },
        },
        select: "date",
      })
      .populate({
        path: "user",
        select: "userLegalName username",
      });
    stu.studentROLLNO = i + 1;
    await stu.save();
    sorted_data.push(stu);
  }
  return sorted_data;
};

const sorted_by_both_gender_and_aplha = async (arr, day, month, year) => {
  var sorted_ga = [];
  const studentFemale = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Female" }],
  })
    .sort({ studentFirstName: 1, studentMiddleName: 1, studentLastName: 1 })
    .select("_id");
  const studentMale = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Male" }],
  })
    .sort({ studentFirstName: 1, studentMiddleName: 1, studentLastName: 1 })
    .select("_id");

  const studentOther = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Other" }],
  })
    .sort({ studentFirstName: 1, studentMiddleName: 1, studentLastName: 1 })
    .select("_id");

  var data = [...studentFemale, ...studentMale, ...studentOther];
  for (let i = 0; i < data.length; i++) {
    const stu = await Student.findById({ _id: data[i]._id })
      .select(
        "leave studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO"
      )
      .populate({
        path: "leave",
        match: {
          date: { $in: [`${day}/${month}/${year}`] },
        },
        select: "date",
      })
      .populate({
        path: "user",
        select: "userLegalName username",
      });
    stu.studentROLLNO = i + 1;
    await stu.save();
    sorted_ga.push(stu);
  }
  return sorted_ga;
};
// Add Another Encryption
exports.retrieveApproveCatalogArrayFilter = async (req, res) => {
  try {
    const { cid } = req.params;
    const { sort_query } = req.query;
    const currentDate = new Date();
    const currentDateLocalFormat = currentDate.toISOString().split("-");
    const day =
      +currentDateLocalFormat[2].split("T")[0] > 9
        ? +currentDateLocalFormat[2].split("T")[0]
        : `0${+currentDateLocalFormat[2].split("T")[0]}`;
    const month =
      +currentDateLocalFormat[1] > 9
        ? +currentDateLocalFormat[1]
        : `0${+currentDateLocalFormat[1]}`;
    const year = +currentDateLocalFormat[0];
    // const regExpression = new RegExp(`${day}\/${month}\/${year}$`);
    const classes = await Class.findById({ _id: cid }).select(
      "className classStatus classTitle exams ApproveStudent"
    );
    for (let ele of classes?.ApproveStudent) {
      const stu = await Student.findById({ _id: `${ele}` }).select(
        "studentFName studentMName studentLName studentFirstName studentMiddleName studentLastName studentFatherName"
      );
      stu.studentFName = stu?.studentFirstName?.trim()?.toLowerCase();
      stu.studentMName =
        stu?.studentMiddleName?.trim()?.toLowerCase() ??
        studentFatherName?.trim()?.toLowerCase();
      stu.studentLName = stu?.studentLastName?.trim()?.toLowerCase();
      await stu.save();
    }
    if (sort_query === "Alpha") {
      const sortedA = await sort_student_by_alpha_query(
        classes.ApproveStudent,
        day,
        month,
        year
      );
      res.status(200).send({
        message: "Sorted By Alphabetical Order",
        classes,
        students: sortedA,
        access: true,
      });
    } else if (sort_query === "Alpha_Last") {
      const sortedA = await sort_student_by_alpha_last_query(
        classes.ApproveStudent,
        day,
        month,
        year
      );
      res.status(200).send({
        message: "Sorted By Alphabetical Order",
        classes,
        students: sortedA,
        access: true,
      });
    } else if (sort_query === "Gender") {
      const sortedG = await sorted_by_gender(
        classes.ApproveStudent,
        day,
        month,
        year
      );
      res.status(200).send({
        message: "Sorted By Gender Order",
        classes,
        students: sortedG,
        access: true,
      });
    } else if (sort_query === "Gender_Alpha") {
      const sortedGA = await sorted_by_both_gender_and_aplha(
        classes.ApproveStudent,
        day,
        month,
        year
      );
      res.status(200).send({
        message: "Sorted By Gender & Alpha Order",
        classes,
        students: sortedGA,
        access: true,
      });
    } else {
      res
        .status(200)
        .send({ message: "You're breaking sorting rules 😡", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrievePendingFeeFilter = async (req, res) => {
  try {
    const { aid } = req.params;
    const { gender, category, is_all, all_depart, batch_status } = req.query;
    const { depart, batch, master, fee_struct } = req.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid }).select(
      "remainingFee institute"
    );

    var valid_all = is_all === "false" ? false : true;

    var institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    }).select("depart");
    if (all_depart === "All") {
      var sorted_batch = [];

      if (batch_status === "All") {
        var all_department = await Department.find({
          _id: { $in: institute?.depart },
        }).select("batches");
        for (var ref of all_department) {
          sorted_batch.push(...ref?.batches);
        }
      } else if (batch_status === "Current") {
        var all_department = await Department.find({
          _id: { $in: institute?.depart },
        }).select("departmentSelectBatch");
        for (var ref of all_department) {
          sorted_batch.push(ref?.departmentSelectBatch);
        }
      }
      var all_students = await Student.find({
        $and: [
          { batches: { $in: sorted_batch } },
          { admissionRemainFeeCount: valid_all ? { $gte: 0 } : { $gt: 0 } },
        ],
      })
        .select(
          "studentClass batches department studentGender studentCastCategory"
        )
        .populate({
          path: "fee_structure",
        });
    } else if (all_depart === "Particular") {
      var all_students = await Student.find({
        $and: [
          { _id: { $in: ads_admin?.remainingFee } },
          { admissionRemainFeeCount: valid_all ? { $gte: 0 } : { $gt: 0 } },
        ],
      })
        .select(
          "studentClass batches department studentGender studentCastCategory"
        )
        .populate({
          path: "fee_structure",
        });
      if (depart) {
        all_students = all_students?.filter((ref) => {
          if (`${ref?.department}` === `${depart}`) return ref;
        });
      }
      if (batch) {
        all_students = all_students?.filter((ref) => {
          if (`${ref?.batches}` === `${batch}`) return ref;
        });
      }
      if (master?.length > 0) {
        var select_classes = [];
        const all_master = await ClassMaster.find({
          _id: { $in: master },
        }).select("classDivision");

        for (var ref of all_master) {
          select_classes.push(...ref?.classDivision);
        }
        all_students = all_students?.filter((ref) => {
          if (select_classes?.includes(`${ref?.studentClass}`)) return ref;
        });
      }
    }

    if (category) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.studentCastCategory}` === `${category}`) return ref;
      });
    }

    if (gender) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.studentGender}` === `${gender}`) return ref;
      });
    }

    if (fee_struct) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.fee_structure?.category_master}` === `${fee_struct}`)
          return ref;
      });
    }

    var sorted_list = [];
    for (var ref of all_students) {
      sorted_list.push(ref?._id);
    }

    if (sorted_list?.length > 0) {
      res.status(200).send({
        message: "Explore New Excel Exports Wait for Some Time To Process",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        access: false,
      });
    }

    const valid_all_students = await Student.find({ _id: { $in: sorted_list } })
      .sort({ remainingFeeList_count: -1 })
      .select(
        "studentFirstName studentMiddleName remainingFeeList_count studentLastName studentDOB studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto admissionRemainFeeCount"
      )
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      })
      .populate({
        path: "fee_structure",
        select: "structure_name unique_structure_name applicable_fees",
      })
      .populate({
        path: "remainingFeeList",
        populate: {
          path: "batchId",
          select: "batchName",
        },
      })
      .populate({
        path: "remainingFeeList",
        populate: {
          path: "appId",
          select: "applicationName",
        },
      })
      .populate({
        path: "remainingFeeList",
        populate: {
          path: "fee_structure",
          select:
            "structure_name unique_structure_name category_master total_admission_fees one_installments applicable_fees class_master batch_master",
          populate: {
            path: "category_master batch_master class_master",
            select: "category_name batchName className",
          },
        },
      });
    // console.log(valid_all_students)
    valid_all_students.sort(function (st1, st2) {
      return (
        parseInt(st1?.studentGRNO?.slice(1)) -
        parseInt(st2?.studentGRNO?.slice(1))
      );
    });
    // const buildObject = async (arr) => {
    //   const obj = {};
    //   for (let i = 0; i < arr.length; i++) {
    //     const { amount, price, paymode, mode } = arr[i];
    //     obj[amount] = price;
    //     obj[paymode] = mode;
    //   }
    //   return obj;
    // };
    var excel_list = [];
    var remain_array = [];
    for (var ref of valid_all_students) {
      for (var val of ref?.remainingFeeList) {
        // for (var num of val?.remaining_array) {
        //   var i = 0;
        //   if (num.status === "Paid") {
        //     remain_array.push({
        //       amount: `${i + 1}-Payment`,
        //       price: num?.remainAmount,
        //       paymode: `${i + 1}-Mode`,
        //       mode: num?.mode,
        //     });
        //   }
        //   i = val?.remaining_array?.length - i + 1;
        // }
        // var result = await buildObject(remain_array);

        excel_list.push({
          GRNO: ref?.studentGRNO ?? "#NA",
          Name: `${ref?.studentFirstName} ${
            ref?.studentMiddleName ? ref?.studentMiddleName : ""
          } ${ref?.studentLastName}`,
          DOB: ref?.studentDOB ?? "#NA",
          FirstName: ref?.studentFirstName ?? "#NA",
          FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
          LastName: ref?.studentLastName ?? "#NA",
          Gender: ref?.studentGender ?? "#NA",
          Caste: ref?.studentCastCategory ?? "#NA",
          Religion: ref?.studentReligion ?? "#NA",
          MotherName: `${ref?.studentMotherName}` ?? "#NA",
          Department: `${ref?.department?.dName}` ?? "#NA",
          Class:
            `${ref?.studentClass?.className}-${ref?.studentClass.classTitle}` ??
            "#NA",
          Batch: `${val?.fee_structure?.batch_master?.batchName}` ?? "#NA",
          ActualFees: `${val?.fee_structure?.total_admission_fees}` ?? "0",
          ApplicableFees: `${val?.fee_structure?.applicable_fees}` ?? "0",
          TotalRemainingFees: `${val?.remaining_fee}` ?? "0",
          ApplicationName: `${val?.appId?.applicationName}` ?? "#NA",
          TotalPaidFees: `${val?.paid_fee}` ?? "0",
          TotalApplicableRemaining:
            `${val?.fee_structure?.applicable_fees}` - `${val?.paid_fee}` > 0
              ? `${val?.fee_structure?.applicable_fees}` - `${val?.paid_fee}`
              : 0,
          PaidByStudent: `${val?.paid_by_student}`,
          PaidByGovernment: `${val?.paid_by_government}`,
          Standard: `${val?.fee_structure?.class_master?.className}`,
          FeeStructure:
            `${val?.fee_structure?.category_master?.category_name}` ?? "#NA",
          Address: `${ref?.studentAddress}` ?? "#NA",
          // ...result,
        });
        // remain_array = [];
      }
    }
    await json_to_excel_query(
      excel_list,
      all_depart,
      batch_status,
      category,
      gender,
      valid_all,
      aid
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderFinanceTransactionHistoryQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tab_flow,
      timeline,
      timeline_content,
      from,
      to,
      fee_type,
      fee_mode,
    } = req.query;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    var valid_timeline = timeline === "false" ? false : true;
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    if (timeline_content === "Past Week") {
      const week = custom_date_time_reverse(7);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Month") {
      const week = custom_month_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Year") {
      const week = custom_year_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    }
    if (tab_flow === "BY_DATE") {
      if (valid_timeline) {
        const g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
        const l_date = new Date(`${l_year}-${l_month}-01T00:00:00.000Z`);
        var order = await OrderPayment.find({
          $and: [
            {
              created_at: {
                $gte: g_date,
                $lte: l_date,
              },
            },
            {
              payment_to_end_user_id: `${id}`,
            },
          ],
        });
        res.status(200).send({
          message: `Explore TimeLine ${timeline_content} Query`,
          access: true,
        });
      } else {
        var g_year = new Date(`${from}`).getFullYear();
        var l_year = new Date(`${to}`).getFullYear();
        var g_day = new Date(`${from}`).getDate();
        var l_day = new Date(`${to}`).getDate();
        var g_month = new Date(`${from}`).getMonth() + 1;
        if (g_month < 10) {
          g_month = `0${g_month}`;
        }
        var l_month = new Date(`${to}`).getMonth() + 1;
        if (l_month < 10) {
          l_month = `0${l_month}`;
        }
        if (g_day < 10) {
          g_day = `0${g_day}`;
        }
        if (l_day < 10) {
          l_day = `0${l_day}`;
        }
        const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
        const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
        var order = await OrderPayment.find({
          $and: [
            {
              created_at: {
                $gte: g_date,
                $lte: l_date,
              },
            },
            {
              payment_to_end_user_id: `${id}`,
            },
          ],
        });
        res.status(200).send({
          message: "Explore Date From To Query",
          access: true,
          order,
        });
      }
    } else if (tab_flow === "BY_FEE_TYPE") {
      var g_year = new Date(`${from}`).getFullYear();
      var l_year = new Date(`${to}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
      var order = await OrderPayment.find({
        $and: [
          {
            created_at: {
              $gte: g_date,
              $lte: l_date,
            },
          },
          {
            payment_to_end_user_id: `${id}`,
          },
        ],
        $or: [{ payment_module_type: { $regex: fee_type, $options: "i" } }],
      });
      if (fee_mode) {
        order = order?.filter((ref) => {
          if (ref?.payment_mode === fee_mode) return ref;
        });
      }
      res.status(200).send({
        message: "Explore Fee Type From To Query",
        access: true,
      });
    } else if (tab_flow === "BY_EXPENSES") {
      if (valid_timeline) {
        const g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
        const l_date = new Date(`${l_year}-${l_month}-01T00:00:00.000Z`);
        var order = await OrderPayment.find({
          $and: [
            {
              created_at: {
                $gte: g_date,
                $lte: l_date,
              },
            },
            {
              payment_to_end_user_id: `${id}`,
            },
            {
              payment_module_type: "Expense",
            },
          ],
        });
        res.status(200).send({
          message: `Explore Expenses TimeLine ${timeline_content} Query`,
          access: true,
        });
      } else {
        var g_year = new Date(`${from}`).getFullYear();
        var l_year = new Date(`${to}`).getFullYear();
        var g_day = new Date(`${from}`).getDate();
        var l_day = new Date(`${to}`).getDate();
        var g_month = new Date(`${from}`).getMonth() + 1;
        if (g_month < 10) {
          g_month = `0${g_month}`;
        }
        if (g_day < 10) {
          g_day = `0${g_day}`;
        }
        var l_month = new Date(`${to}`).getMonth() + 1;
        if (l_month < 10) {
          l_month = `0${l_month}`;
        }
        if (l_day < 10) {
          l_day = `0${l_day}`;
        }
        const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
        const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
        var order = await OrderPayment.find({
          $and: [
            {
              created_at: {
                $gte: g_date,
                $lte: l_date,
              },
            },
            {
              payment_to_end_user_id: `${id}`,
            },
            {
              payment_module_type: "Expense",
            },
          ],
        });
        res.status(200).send({
          message: "Explore Expenses From To Query",
          access: true,
          order,
        });
      }
    } else if (tab_flow === "BY_INCOMES") {
      if (valid_timeline) {
        const g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
        const l_date = new Date(`${l_year}-${l_month}-01T00:00:00.000Z`);
        var order = await OrderPayment.find({
          $and: [
            {
              created_at: {
                $gte: g_date,
                $lte: l_date,
              },
            },
            {
              payment_to_end_user_id: `${id}`,
            },
            {
              payment_module_type: "Income",
            },
          ],
        });
        res.status(200).send({
          message: `Explore Incomes TimeLine ${timeline_content} Query`,
          access: true,
        });
      } else {
        var g_year = new Date(`${from}`).getFullYear();
        var l_year = new Date(`${to}`).getFullYear();
        var g_day = new Date(`${from}`).getDate();
        var l_day = new Date(`${to}`).getDate();
        var g_month = new Date(`${from}`).getMonth() + 1;
        if (g_month < 10) {
          g_month = `0${g_month}`;
        }
        var l_month = new Date(`${to}`).getMonth() + 1;
        if (l_month < 10) {
          l_month = `0${l_month}`;
        }
        if (g_day < 10) {
          g_day = `0${g_day}`;
        }
        if (l_day < 10) {
          l_day = `0${l_day}`;
        }
        const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
        const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
        var order = await OrderPayment.find({
          $and: [
            {
              created_at: {
                $gte: g_date,
                $lte: l_date,
              },
            },
            {
              payment_to_end_user_id: `${id}`,
            },
            {
              payment_module_type: "Income",
            },
          ],
        });
        res.status(200).send({
          message: "Explore Incomes Date From To Query",
          access: true,
        });
      }
    } else {
      res.status(200).send({ message: "Invalid Flow", access: false });
    }
    if (order?.length > 0) {
      var trans_list = [];
      order = order?.filter((val) => {
        if (val?.payment_amount > 0) return val;
      });
      order.sort(function (st1, st2) {
        return (
          parseInt(st1?.payment_invoice_number) -
          parseInt(st2?.payment_invoice_number)
        );
      });

      for (var ref of order) {
        if (ref?.payment_by_end_user_id) {
          var user = await User.findById({
            _id: ref?.payment_by_end_user_id,
          }).select("userLegalName");
        }
        trans_list.push({
          InvoiceNumber: ref?.payment_invoice_number ?? "#NA",
          Name: user?.userLegalName
            ? user?.userLegalName
            : ref?.payment_by_end_user_id_name,
          PaymentAmount: ref?.payment_amount ?? "#NA",
          PaymentType: ref?.payment_module_type ?? "#NA",
          PaymentMode:
            ref?.payment_mode === "By Bank" && ref?.razorpay_signature
              ? "Payment Gateway"
              : ref?.payment_mode ?? "#NA",
          PaymentStatus: ref?.payment_status ?? "#NA",
          PaymentDate: moment(ref?.created_at).format("LL") ?? "#NA",
        });
      }
      await transaction_json_to_excel_query(trans_list, tab_flow, timeline, id);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeHeadsStructureQuery = async (req, res) => {
  try {
    const { fsid } = req.params;
    const { depart, appId } = req.query;
    if (!fsid && !depart && !appId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_structure = await FeeStructure.findById({ _id: fsid })
      .select("structure_name unique_structure_name category_master finance")
      .populate({
        path: "category_master",
        select: "category_name",
      });
    const all_students = await Student.find({
      $and: [{ fee_structure: fsid }, { department: depart }],
    })
      .select(
        "studentFirstName studentMiddleName studentLastName studentGRNO studentGender active_fee_heads remainingFeeList"
      )
      .populate({
        path: "fee_structure",
        select:
          "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
        populate: {
          path: "category_master",
          select: "category_name",
        },
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      });

    if (all_students?.length > 0) {
      res.status(200).send({
        message: "Explore Fee Heads Structure Query",
        access: true,
      });
      var head_list = [];
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { HeadsName, PaidHeadFees } = arr[i];
          obj[HeadsName] = PaidHeadFees;
        }
        return obj;
      };
      for (var ref of all_students) {
        var head_array = [];
        var remain_list = await RemainingList.findOne({
          $and: [{ _id: { $in: ref?.remainingFeeList } }, { appId: appId }],
        });
        for (var val of ref?.active_fee_heads) {
          if (`${val?.appId}` === appId) {
            head_array.push({
              HeadsName: val?.head_name,
              PaidHeadFees: val?.paid_fee,
            });
          }
        }
        var result = await buildStructureObject(head_array);
        if (result && remain_list) {
          head_list.push({
            GRNO: ref?.studentGRNO ?? "#NA",
            Name:
              `${ref?.studentFirstName} ${
                ref?.studentMiddleName ? ref?.studentMiddleName : ""
              } ${ref?.studentLastName}` ?? "#NA",
            Gender: ref?.studentGender ?? "#NA",
            FirstName: ref?.studentFirstName ?? "#NA",
            FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
            LastName: ref?.studentLastName ?? "#NA",
            TotalFees: ref?.fee_structure?.total_admission_fees ?? "0",
            ApplicableFees: ref?.fee_structure?.applicable_fees ?? "0",
            TotalPaidFees: remain_list?.paid_fee,
            RemainingFees: remain_list?.remaining_fee,
            Class:
              `${ref?.studentClass?.className}-${ref?.studentClass?.classTitle}` ??
              "#NA",
            Batch: ref?.batches?.batchName ?? "#NA",
            ...result,
          });
        }
        head_array = [];
      }

      await fee_heads_json_to_excel_query(
        head_list,
        one_structure?.structure_name,
        one_structure?.category_master?.category_name,
        one_structure?.finance
      );
    } else {
      res.status(200).send({
        message: "No Fee Heads Structure Query",
        access: false,
        all_students: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeHeadsStructureReceiptQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const {
      fsid,
      timeline,
      timeline_content,
      from,
      to,
      bank,
      all_depart,
      batch_status,
    } = req.query;
    const { depart, batch, master } = req?.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var valid_timeline = timeline === "false" ? false : true;
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    if (timeline_content === "Past Week") {
      const week = custom_date_time_reverse(7);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Month") {
      const week = custom_month_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Year") {
      const week = custom_year_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    }
    var sorted_array = [];
    const finance = await Finance.findById({ _id: fid }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select("insName depart");

    // if (all_depart === "All") {
    //   var sorted_batch = [];
    //   if (batch_status === "All") {
    //     var all_department = await Department.find({
    //       _id: { $in: institute?.depart },
    //     }).select("batches");
    //     for (var ref of all_department) {
    //       sorted_batch.push(...ref?.batches);
    //     }
    //   } else if (batch_status === "Current") {
    //     var all_department = await Department.find({
    //       _id: { $in: institute?.depart },
    //     }).select("departmentSelectBatch");
    //     for (var ref of all_department) {
    //       sorted_batch.push(ref?.departmentSelectBatch);
    //     }
    //   }
    //   var all_students = await Student.find({
    //     $and: [{ batches: { $in: sorted_batch } }],
    //   })
    //     .select("studentClass batches department")
    //     .populate({
    //       path: "fee_structure",
    //     });
    //   console.log(all_students?.length);
    // } else if (all_depart === "Particular") {
    //   var all_students = await Student.find({
    //     institute: institute?._id,
    //   })
    //     .select("studentClass batches department")
    //     .populate({
    //       path: "fee_structure",
    //     });
    //   if (depart) {
    //     all_students = all_students?.filter((ref) => {
    //       if (`${ref?.department}` === `${depart}`) return ref;
    //     });
    //   }
    //   if (batch) {
    //     all_students = all_students?.filter((ref) => {
    //       if (`${ref?.batches}` === `${batch}`) return ref;
    //     });
    //   }
    //   if (master?.length > 0) {
    //     var select_classes = [];
    //     const all_master = await ClassMaster.find({
    //       _id: { $in: master },
    //     }).select("classDivision");

    //     for (var ref of all_master) {
    //       select_classes.push(...ref?.classDivision);
    //     }
    //     all_students = all_students?.filter((ref) => {
    //       if (select_classes?.includes(`${ref?.studentClass}`)) return ref;
    //     });
    //   }
    // }

    // if (fsid && depart) {
    //   var all_students = await Student.find({
    //     $and: [{ institute: institute?._id }, { studentStatus: "Approved" }],
    //     $or: [
    //       {
    //         fee_structure: fsid,
    //       },
    //       {
    //         department: depart,
    //       },
    //     ],
    //   }).select("_id fee_receipt");
    // } else {
    //   var all_students = await Student.find({
    //     $and: [{ institute: institute?._id }, { studentStatus: "Approved" }],
    //   }).select("_id fee_receipt");
    // }
    // for (var ref of all_students) {
    //   sorted_array.push(ref?._id);
    // }
    // console.log(sorted_array?.length);
    if (valid_timeline) {
      const g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-01T00:00:00.000Z`);
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_ADMISSION",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
          populate: {
            path: "fee_structure",
            select:
              "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationDepartment",
          populate: {
            path: "applicationDepartment",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();

      if (bank) {
        all_receipts = all_receipts?.filter((val) => {
          if (
            `${val?.application?.applicationDepartment?.bank_account?._id}` ===
            `${bank}`
          )
            return val;
        });
      }
      if (all_depart === "All") {
      } else if (all_depart === "Particular" && depart) {
        all_receipts = all_receipts?.filter((val) => {
          if (`${val?.application?.applicationDepartment?._id}` === `${depart}`)
            return val;
        });
      }
    } else {
      var g_year = new Date(`${from}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_year = new Date(`${to}`).getFullYear();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_ADMISSION",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentGRNO studentGender remainingFeeList",
          populate: {
            path: "fee_structure",
            select:
              "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentGRNO studentGender remainingFeeList",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentGRNO studentGender remainingFeeList",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationDepartment",
          populate: {
            path: "applicationDepartment",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();
      if (bank) {
        all_receipts = all_receipts?.filter((val) => {
          if (
            `${val?.application?.applicationDepartment?.bank_account?._id}` ===
            `${bank}`
          )
            return val;
        });
      }
      if (all_depart === "All") {
      } else if (all_depart === "Particular" && depart) {
        all_receipts = all_receipts?.filter((val) => {
          if (`${val?.application?.applicationDepartment?._id}` === `${depart}`)
            return val;
        });
      }
    }
    if (all_receipts?.length > 0) {
      res.status(200).send({
        message: "Explore Fee Receipt Heads Structure Query",
        access: true,
        all_receipts,
        count: all_receipts?.length,
      });
      all_receipts.sort(function (st1, st2) {
        return parseInt(st1?.invoice_count) - parseInt(st2?.invoice_count);
      });
      var head_list = [];
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { HeadsName, PaidHeadFees } = arr[i];
          obj[HeadsName] = PaidHeadFees;
        }
        return obj;
      };
      for (var ref of all_receipts) {
        var remain_list = await RemainingList.findOne({
          $and: [
            { student: ref?.student?._id },
            { appId: ref?.application?._id },
          ],
        })
          .populate({
            path: "fee_structure",
            select:
              "applicable_fees total_admission_fees class_master batch_master unique_structure_name",
            populate: {
              path: "class_master batch_master department",
              select: "className batchName dName",
            },
          })
          .populate({
            path: "appId",
            select: "applicationDepartment applicationBatch applicationName",
            populate: {
              path: "applicationDepartment applicationBatch",
              select: "dName batchName",
            },
          });
        var head_array = [];
        if (ref?.fee_heads?.length > 0) {
          for (var val of ref?.fee_heads) {
            if (`${val?.appId}` === `${ref?.application?._id}`) {
              head_array.push({
                HeadsName: val?.head_name,
                PaidHeadFees: val?.original_paid,
              });
            }
            // if (bank) {
            //   const bank_acc = await BankAccount.findById({ _id: bank })
            //   if (bank_acc?.bank_account_type === "Society") {
            //     if (`${val?.appId}` === `${ref?.application?._id}` && val?.is_society == true) {
            //       head_array.push({
            //         HeadsName: val?.head_name,
            //         PaidHeadFees: val?.original_paid,
            //       });
            //     }
            //   }
            //   else {
            //     if (`${val?.appId}` === `${ref?.application?._id}` && val?.is_society == false) {
            //       head_array.push({
            //         HeadsName: val?.head_name,
            //         PaidHeadFees: val?.original_paid,
            //       });
            //     }
            //   }
            // }
            // else {
            //   if (`${val?.appId}` === `${ref?.application?._id}` && val?.is_society == false) {
            //     head_array.push({
            //       HeadsName: val?.head_name,
            //       PaidHeadFees: val?.original_paid,
            //     });
            //   }
            // }
          }
        }
        if (remain_list?.paid_fee - remain_list?.applicable_fee > 0) {
          if (`${val?.appId}` === `${ref?.application?._id}`) {
            head_array.push({
              HeadsName: "Excess Fees",
              PaidHeadFees: remain_list?.paid_fee - remain_list?.applicable_fee,
            });
          }
        }
        if (ref?.fee_heads?.length > 0) {
          var result = await buildStructureObject(head_array);
        }
        if (result) {
          head_list.push({
            ReceiptNumber: ref?.invoice_count ?? "0",
            ReceiptDate: moment(ref?.created_at).format("DD-MM-YYYY") ?? "NA",
            TransactionAmount: ref?.fee_payment_amount ?? "0",
            TransactionDate:
              moment(ref?.fee_transaction_date).format("DD-MM-YYYY") ?? "NA",
            TransactionMode: ref?.fee_payment_mode ?? "#NA",
            BankName: ref?.fee_bank_name ?? "#NA",
            BankHolderName: ref?.fee_bank_holder ?? "#NA",
            BankUTR: ref?.fee_utr_reference ?? "#NA",
            GRNO: ref?.student?.studentGRNO ?? "#NA",
            Name:
              `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName
                  : ""
              } ${ref?.student?.studentLastName}` ?? "#NA",
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            Standard:
              `${remain_list?.fee_structure?.class_master?.className}` ?? "#NA",
            Department:
              `${remain_list?.fee_structure?.department?.dName}` ?? "#NA",
            Batch: remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
            ApplicationName: `${remain_list?.appId?.applicationName}` ?? "#NA",
            FeeStructure:
              remain_list?.fee_structure?.unique_structure_name ?? "#NA",
            TotalFees: remain_list?.fee_structure?.total_admission_fees ?? "0",
            ApplicableFees: remain_list?.fee_structure?.applicable_fees ?? "0",
            PaidByStudent: remain_list?.paid_fee,
            PaidByGovernment: remain_list?.paid_by_government,
            TotalPaidFees: remain_list?.paid_fee,
            ApplicableOutstanding:
              remain_list?.fee_structure?.applicable_fees -
                remain_list?.paid_fee >
              0
                ? remain_list?.fee_structure?.applicable_fees -
                  remain_list?.paid_fee
                : 0,
            TotalOutstanding: remain_list?.remaining_fee,
            Remark: remain_list?.remark ?? "#NA",
            DepartmentBankName:
              ref?.application?.applicationDepartment?.bank_account
                ?.finance_bank_name ?? "#NA",
            DepartmentBankAccountNumber:
              ref?.application?.applicationDepartment?.bank_account
                ?.finance_bank_account_number ?? "#NA",
            DepartmentBankAccountHolderName:
              ref?.application?.applicationDepartment?.bank_account
                ?.finance_bank_account_name ?? "#NA",
            Narration: `Being Fees Received By ${
              ref?.fee_payment_mode
            } Date ${moment(ref?.fee_transaction_date).format(
              "DD-MM-YYYY"
            )} Rs. ${ref?.fee_payment_amount} out of Rs. ${
              ref?.student.fee_structure?.total_admission_fees
            } Paid By ${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName} (${
              ref?.student.fee_structure?.category_master?.category_name
            }) Towards Fees For ${ref?.student?.studentClass?.className}-${
              ref?.student?.studentClass?.classTitle
            } For Acacdemic Year ${ref?.student?.batches?.batchName}.`,
            ...result,
          });
          result = [];
        }
        head_array = [];
      }

      await fee_heads_receipt_json_to_excel_query(
        head_list,
        institute?.insName,
        institute?._id,
        bank,
        from,
        to
      );
    } else {
      res.status(200).send({
        message: "No Fee Receipt Heads Structure Query",
        access: false,
        all_students: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderUpdate = async (req, res) => {
  const all_student = await Student.find({}).select("remainingFeeList_count");
  for (var ref of all_student) {
    ref.remainingFeeList_count = 1;
    await ref.save();
  }
  res.status(200).send({ message: "updated", access: true });
};

const filterization_app_query = async (arr, type, date, appId) => {
  try {
    var list = [];
    if (type === "Request") {
      var req_count = 0;
      arr?.filter((val) => {
        var valid_val = moment(val?.apply_on).format("YYYY-MM-DD");
        if (`${date}` === `${valid_val}`) {
          req_count += 1;
          list.push(val?.student);
        }
      });
      return { req_count: req_count, list: list };
    } else if (type === "Select") {
      var sel_count = 0;
      arr?.filter((val) => {
        var valid_val = moment(val?.select_on).format("YYYY-MM-DD");
        if (`${date}` === `${valid_val}`) {
          sel_count += 1;
          list.push(val?.student);
        }
      });
      return { sel_count: sel_count, list: list };
    } else if (type === "Confirm") {
      var conf_count = 0;
      arr?.filter((val) => {
        var valid_val = moment(val?.apply_on).format("YYYY-MM-DD");
        if (`${date}` === `${valid_val}`) {
          conf_count += 1;
          list.push(val?.student);
        }
      });
      return { conf_count: conf_count, list: list };
    } else if (type === "Fees") {
      var fees_count = 0;
      arr?.filter((val) => {
        var valid_val = moment(val?.apply_on).format("YYYY-MM-DD");
        if (`${date}` === `${valid_val}`) {
          fees_count += 1;
          list.push(val?.student);
        }
      });
      return { fees_count: fees_count, list: list };
    } else if (type === "Allot") {
      var all_count = 0;
      arr?.filter((val) => {
        var valid_val = moment(val?.allot_on).format("YYYY-MM-DD");
        if (`${date}` === `${valid_val}`) {
          all_count += 1;
          list.push(val?.student);
        }
      });
      return { all_count: all_count, list: list };
    } else if (type === "Review") {
      var rev_count = 0;
      for (let val of arr) {
        for (let ele of val?.student_application_obj) {
          if (`${ele?.app}` === `${appId}` && ele?.flow == "confirm_by") {
            var valid_val = moment(ele?.created_at).format("YYYY-MM-DD");
            if (`${date}` === `${valid_val}`) {
              if (list?.includes(val)) {
              } else {
                rev_count += 1;
                list.push(val);
              }
            }
          }
        }
      }
      return { rev_count: rev_count, list: list };
    } else if (type === "Cancel") {
      var can_count = 0;
      arr?.filter((val) => {
        var valid_val = moment(val?.cancel_on).format("YYYY-MM-DD");
        if (`${date}` === `${valid_val}`) {
          can_count += 1;
          list.push(val?.student);
        }
      });
      return { can_count: can_count, list: list };
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderApplicationFilterByDateCollectionQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { valid_date } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    // var val_date = custom_date_time(0);
    // var valid_date = valid_date_query ? valid_date_query : val_date;
    var valid_app = await NewApplication.findById({ _id: aid }).populate({
      path: "reviewApplication",
      select: "student_application_obj",
    });
    var request_count = await filterization_app_query(
      valid_app?.receievedApplication,
      "Request",
      valid_date
    );
    var select_count = await filterization_app_query(
      valid_app?.selectedApplication,
      "Select",
      valid_date
    );
    var confirm_count = await filterization_app_query(
      valid_app?.confirmedApplication,
      "Confirm",
      valid_date
    );
    var fee_collect_count = await filterization_app_query(
      valid_app?.FeeCollectionApplication,
      "Fees",
      valid_date
    );
    var allot_count = await filterization_app_query(
      valid_app?.allottedApplication,
      "Allot",
      valid_date
    );
    var review_count = await filterization_app_query(
      valid_app?.reviewApplication,
      "Review",
      valid_date,
      valid_app?._id
    );
    var cancel_count = await filterization_app_query(
      valid_app?.cancelApplication,
      "Cancel",
      valid_date
    );
    var day_arr = [
      ...confirm_count?.list,
      ...allot_count?.list,
      ...select_count?.list,
      ...review_count?.list,
    ];
    var all_remain = await RemainingList.find({ student: day_arr }).populate({
      path: "fee_structure",
    });
    var paid = 0;
    var remain = 0;
    var applicable_pending = 0;
    for (var ref of all_remain) {
      paid += ref?.paid_fee;
      remain += ref?.remaining_fee;
      applicable_pending +=
        ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0
          ? ref?.fee_structure?.applicable_fees - ref?.paid_fee
          : 0;
    }
    var day_wise = {
      request_count: request_count?.req_count,
      select_count: select_count?.sel_count,
      confirm_count: confirm_count?.conf_count,
      allot_count: allot_count?.all_count,
      cancel_count: cancel_count?.can_count,
      review_count: review_count?.rev_count,
      fee_collect_count: fee_collect_count?.fees_count,
      paid: paid,
      remain: remain,
      applicable_pending: applicable_pending,
      // confirm_list: c_query,
      // allot_list: a_query,
      // select_list: s_query,
      // request_list: r_query
    };
    res.status(200).send({
      message: "Explore All Filterization Method Day Wise Collection",
      access: true,
      day_wise,
    });
  } catch (e) {
    // console.log(e);
  }
};

exports.renderApplicationListQuery = async (req, res) => {
  try {
    const { appId } = req.params;
    const { flow } = req.query;
    if (!appId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_apply = await NewApplication.findById({ _id: appId })
      .select(
        "receievedApplication applicationUnit applicationName confirmedApplication allottedApplication applicationHostel admissionAdmin subject_selected_group"
      )
      .populate({
        path: "receievedApplication",
        populate: {
          path: "student",
          // select:
          //   "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "selectedApplication",
        populate: {
          path: "student",
          // select:
          //   "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "FeeCollectionApplication",
        populate: {
          path: "student",
          // select:
          //   "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "reviewApplication",
        populate: {
          path: "student_optional_subject major_subject nested_subject",
          select: "subjectName",
        },
        // select: "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph"
      })
      .populate({
        path: "confirmedApplication",
        populate: {
          path: "student",
          populate: {
            path: "student_optional_subject major_subject nested_subject",
            select: "subjectName",
          },
        },
      })
      .populate({
        path: "allottedApplication",
        populate: {
          path: "student",
          populate: {
            path: "student_optional_subject major_subject nested_subject",
            select: "subjectName",
          },
        },
      });

    if (
      `${flow}` === "Request_Query" &&
      valid_apply?.receievedApplication?.length > 0
    ) {
      var excel_list = [];
      if (valid_apply?.applicationHostel) {
        for (var ref of valid_apply?.receievedApplication) {
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            "ABC ID": ref?.student?.student_abc_id ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName}`,
            DOB:
              moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
              "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CPI: ref?.student?.student_hostel_cpi ?? "#NA",
            Programme: ref?.student?.student_programme ?? "#NA",
            Branch: ref?.student?.student_branch ?? "#NA",
            Year: ref?.student?.student_year ?? "#NA",
            SingleSeaterRoom: ref?.student?.student_single_seater_room ?? "#NA",
            PhysicallyHandicapped: ref?.student?.student_ph ?? "#NA",
            Caste: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
          });
        }
      } else {
        var numss = {};
        for (var ref of valid_apply?.receievedApplication) {
          if (ref?.student?.studentFirstName != "") {
            if (ref?.student?.student_dynamic_field?.length > 0) {
              for (let ele of ref?.student?.student_dynamic_field) {
                // numss.push(
                //   [ele?.key]: ele?.value,
                // );
                numss[ele?.key] = ele?.value;
              }
            }
            excel_list.push({
              RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
              "ABC ID": ref?.student?.student_abc_id ?? "#NA",
              Name: `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName ??
                    ref?.student?.studentFatherName
                  : ""
              } ${ref?.student?.studentLastName}`,
              FirstName: ref?.student?.studentFirstName ?? "#NA",
              FatherName:
                ref?.student?.studentFatherName ??
                ref?.student?.studentMiddleName,
              LastName: ref?.student?.studentLastName ?? "#NA",
              DOB:
                moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
                "#NA",
              Gender: ref?.student?.studentGender ?? "#NA",
              CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
              Religion: ref?.student?.studentReligion ?? "#NA",
              MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
              ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
              Address: `${ref?.student?.studentAddress}` ?? "#NA",
              AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
              ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
              AlternateContactNo:
                ref?.student?.studentParentsPhoneNumber ?? "#NA",
              NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
              NameAsCertificate: ref?.student?.studentNameAsCertificate,
              BirthPlace: ref?.student?.studentBirthPlace,
              Religion: ref?.student?.studentReligion,
              Caste: ref?.student?.studentCast,
              Nationality: ref?.student?.studentNationality,
              RationCard: ref?.student?.studentFatherRationCardColor,
              BloodGroup: ref?.student?.student_blood_group,
              AadharNumber: ref?.student?.studentAadharNumber,
              PhoneNumber: ref?.student?.studentPhoneNumber,
              Email: ref?.student?.studentEmail,
              ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
              CurrentAddress: ref?.student?.studentCurrentAddress,
              CurrentPinCode: ref?.student?.studentCurrentPincode,
              CurrentState: ref?.student?.studentCurrentState,
              CurrentDistrict: ref?.student?.studentCurrentDistrict,
              Address: ref?.student?.studentAddress,
              PinCode: ref?.student?.studentPincode,
              State: ref?.student?.studentState,
              District: ref?.student?.studentDistrict,
              ParentsName: ref?.student?.studentParentsName,
              ParentsEmail: ref?.student?.studentParentsEmail,
              ParentsOccupation: ref?.student?.studentParentsOccupation,
              ParentsOfficeAddress: ref?.student?.studentParentsAddress,
              ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
              SeatType: ref?.student?.student_seat_type,
              PhysicallyHandicapped: ref?.student?.student_ph_type,
              DefencePersonnel: ref?.student?.student_defence_personnel_word,
              MaritalStatus: ref?.student?.student_marital_status,
              PreviousBoard: ref?.student?.student_board_university,
              PreviousSchool: ref?.student?.studentPreviousSchool,
              UniversityCourse: ref?.student?.student_university_courses,
              PassingYear: ref?.student?.student_year,
              PreviousClass: ref?.student?.student_previous_class,
              PreviousMarks: ref?.student?.student_previous_marks,
              PreviousPercentage: ref?.student?.student_previous_percentage,
              SeatNo: ref?.student?.student_previous_section,
              StandardMOP: ref?.student?.month_of_passing,
              StandardYOP: ref?.student?.year_of_passing,
              StandardPercentage: ref?.student?.percentage,
              StandardNameOfInstitute: ref?.student?.name_of_institute,
              HSCMOP: ref?.student?.hsc_month,
              HSCYOP: ref?.student?.hsc_year,
              HSCPercentage: ref?.student?.hsc_percentage,
              HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
              HSCBoard: ref?.student?.hsc_board,
              HSCCandidateType: ref?.student?.hsc_candidate_type,
              HSCVocationalType: ref?.student?.hsc_vocational_type,
              HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
              HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
              HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
              HSCPCMTotal: ref?.student?.hsc_pcm_total,
              HSCGrandTotal: ref?.student?.hsc_grand_total,
              FormNo: ref?.student?.form_no,
              QviplePayId: ref?.student?.qviple_student_pay_id,
              ...numss,
            });
          }
        }
      }
      // var valid_back = null;
      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
          excel_list,
          count: excel_list?.length,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
          // excel_list: excel_list,
        });
      }
    } else if (
      `${flow}` === "Docs_Query" &&
      valid_apply?.selectedApplication?.length > 0
    ) {
      var excel_list = [];
      var numss = {};
      for (var ref of valid_apply?.selectedApplication) {
        if (ref?.student?.studentFirstName != "") {
          for (let ele of ref?.student?.student_dynamic_field) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numss[ele?.key] = ele?.value;
          }
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            "ABC ID": ref?.student?.student_abc_id ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName ??
                  ref?.student?.studentFatherName
                : ""
            } ${ref?.student?.studentLastName}`,
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            DOB:
              moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
              "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
            NameAsCertificate: ref?.student?.studentNameAsCertificate,
            BirthPlace: ref?.student?.studentBirthPlace,
            Religion: ref?.student?.studentReligion,
            Caste: ref?.student?.studentCast,
            Nationality: ref?.student?.studentNationality,
            RationCard: ref?.student?.studentFatherRationCardColor,
            BloodGroup: ref?.student?.student_blood_group,
            AadharNumber: ref?.student?.studentAadharNumber,
            PhoneNumber: ref?.student?.studentPhoneNumber,
            Email: ref?.student?.studentEmail,
            ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
            CurrentAddress: ref?.student?.studentCurrentAddress,
            CurrentPinCode: ref?.student?.studentCurrentPincode,
            CurrentState: ref?.student?.studentCurrentState,
            CurrentDistrict: ref?.student?.studentCurrentDistrict,
            Address: ref?.student?.studentAddress,
            PinCode: ref?.student?.studentPincode,
            State: ref?.student?.studentState,
            District: ref?.student?.studentDistrict,
            ParentsName: ref?.student?.studentParentsName,
            ParentsEmail: ref?.student?.studentParentsEmail,
            ParentsOccupation: ref?.student?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.student?.studentParentsAddress,
            ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
            SeatType: ref?.student?.student_seat_type,
            PhysicallyHandicapped: ref?.student?.student_ph_type,
            DefencePersonnel: ref?.student?.student_defence_personnel_word,
            MaritalStatus: ref?.student?.student_marital_status,
            PreviousBoard: ref?.student?.student_board_university,
            PreviousSchool: ref?.student?.studentPreviousSchool,
            UniversityCourse: ref?.student?.student_university_courses,
            PassingYear: ref?.student?.student_year,
            PreviousClass: ref?.student?.student_previous_class,
            PreviousMarks: ref?.student?.student_previous_marks,
            PreviousPercentage: ref?.student?.student_previous_percentage,
            SeatNo: ref?.student?.student_previous_section,
            StandardMOP: ref?.student?.month_of_passing,
            StandardYOP: ref?.student?.year_of_passing,
            StandardPercentage: ref?.student?.percentage,
            StandardNameOfInstitute: ref?.student?.name_of_institute,
            HSCMOP: ref?.student?.hsc_month,
            HSCYOP: ref?.student?.hsc_year,
            HSCPercentage: ref?.student?.hsc_percentage,
            HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
            HSCBoard: ref?.student?.hsc_board,
            HSCCandidateType: ref?.student?.hsc_candidate_type,
            HSCVocationalType: ref?.student?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
            HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.student?.hsc_pcm_total,
            HSCGrandTotal: ref?.student?.hsc_grand_total,
            FormNo: ref?.student?.form_no,
            QviplePayId: ref?.student?.qviple_student_pay_id,
            ...numss,
          });
        }
      }

      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
        });
      }
    } else if (
      `${flow}` === "Fees_Query" &&
      valid_apply?.FeeCollectionApplication?.length > 0
    ) {
      var excel_list = [];
      var numss = {};
      for (var ref of valid_apply?.FeeCollectionApplication) {
        if (ref?.student?.studentFirstName != "") {
          for (let ele of ref?.student?.student_dynamic_field) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numss[ele?.key] = ele?.value;
          }
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            "ABC ID": ref?.student?.student_abc_id ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName ??
                  ref?.student?.studentFatherName
                : ""
            } ${ref?.student?.studentLastName}`,
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            DOB:
              moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
              "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
            NameAsCertificate: ref?.student?.studentNameAsCertificate,
            BirthPlace: ref?.student?.studentBirthPlace,
            Religion: ref?.student?.studentReligion,
            Caste: ref?.student?.studentCast,
            Nationality: ref?.student?.studentNationality,
            RationCard: ref?.student?.studentFatherRationCardColor,
            BloodGroup: ref?.student?.student_blood_group,
            AadharNumber: ref?.student?.studentAadharNumber,
            PhoneNumber: ref?.student?.studentPhoneNumber,
            Email: ref?.student?.studentEmail,
            ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
            CurrentAddress: ref?.student?.studentCurrentAddress,
            CurrentPinCode: ref?.student?.studentCurrentPincode,
            CurrentState: ref?.student?.studentCurrentState,
            CurrentDistrict: ref?.student?.studentCurrentDistrict,
            Address: ref?.student?.studentAddress,
            PinCode: ref?.student?.studentPincode,
            State: ref?.student?.studentState,
            District: ref?.student?.studentDistrict,
            ParentsName: ref?.student?.studentParentsName,
            ParentsEmail: ref?.student?.studentParentsEmail,
            ParentsOccupation: ref?.student?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.student?.studentParentsAddress,
            ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
            SeatType: ref?.student?.student_seat_type,
            PhysicallyHandicapped: ref?.student?.student_ph_type,
            DefencePersonnel: ref?.student?.student_defence_personnel_word,
            MaritalStatus: ref?.student?.student_marital_status,
            PreviousBoard: ref?.student?.student_board_university,
            PreviousSchool: ref?.student?.studentPreviousSchool,
            UniversityCourse: ref?.student?.student_university_courses,
            PassingYear: ref?.student?.student_year,
            PreviousClass: ref?.student?.student_previous_class,
            PreviousMarks: ref?.student?.student_previous_marks,
            PreviousPercentage: ref?.student?.student_previous_percentage,
            SeatNo: ref?.student?.student_previous_section,
            StandardMOP: ref?.student?.month_of_passing,
            StandardYOP: ref?.student?.year_of_passing,
            StandardPercentage: ref?.student?.percentage,
            StandardNameOfInstitute: ref?.student?.name_of_institute,
            HSCMOP: ref?.student?.hsc_month,
            HSCYOP: ref?.student?.hsc_year,
            HSCPercentage: ref?.student?.hsc_percentage,
            HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
            HSCBoard: ref?.student?.hsc_board,
            HSCCandidateType: ref?.student?.hsc_candidate_type,
            HSCVocationalType: ref?.student?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
            HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.student?.hsc_pcm_total,
            HSCGrandTotal: ref?.student?.hsc_grand_total,
            FormNo: ref?.student?.form_no,
            QviplePayId: ref?.student?.qviple_student_pay_id,
            ...numss,
          });
        }
      }

      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
        });
      }
    } else if (
      `${flow}` === "Confirm_Query" &&
      valid_apply?.confirmedApplication?.length > 0
    ) {
      var excel_list = [];
      if (valid_apply?.applicationHostel) {
        for (var ref of valid_apply?.confirmedApplication) {
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            "ABC ID": ref?.student?.student_abc_id ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName}`,
            DOB:
              moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
              "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CPI: ref?.student?.student_hostel_cpi ?? "#NA",
            Programme: ref?.student?.student_programme ?? "#NA",
            Branch: ref?.student?.student_branch ?? "#NA",
            Year: ref?.student?.student_year ?? "#NA",
            SingleSeaterRoom: ref?.student?.student_single_seater_room ?? "#NA",
            PhysicallyHandicapped: ref?.student?.student_ph ?? "#NA",
            Caste: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
          });
        }
      } else {
        var numss = {};
        for (var ref of valid_apply?.confirmedApplication) {
          if (ref?.student?.studentFirstName != "") {
            for (let ele of ref?.student?.student_dynamic_field) {
              // numss.push(
              //   [ele?.key]: ele?.value,
              // );
              numss[ele?.key] = ele?.value;
            }
            excel_list.push({
              RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
              "ABC ID": ref?.student?.student_abc_id ?? "#NA",
              Name: `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName ??
                    ref?.student?.studentFatherName
                  : ""
              } ${ref?.student?.studentLastName}`,
              FirstName: ref?.student?.studentFirstName ?? "#NA",
              FatherName:
                ref?.student?.studentFatherName ??
                ref?.student?.studentMiddleName,
              LastName: ref?.student?.studentLastName ?? "#NA",
              DOB:
                moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
                "#NA",
              Gender: ref?.student?.studentGender ?? "#NA",
              CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
              Religion: ref?.student?.studentReligion ?? "#NA",
              MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
              ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
              Address: `${ref?.student?.studentAddress}` ?? "#NA",
              AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
              ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
              AlternateContactNo:
                ref?.student?.studentParentsPhoneNumber ?? "#NA",
              NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
              NameAsCertificate: ref?.student?.studentNameAsCertificate,
              BirthPlace: ref?.student?.studentBirthPlace,
              Religion: ref?.student?.studentReligion,
              Caste: ref?.student?.studentCast,
              Nationality: ref?.student?.studentNationality,
              RationCard: ref?.student?.studentFatherRationCardColor,
              BloodGroup: ref?.student?.student_blood_group,
              AadharNumber: ref?.student?.studentAadharNumber,
              PhoneNumber: ref?.student?.studentPhoneNumber,
              Email: ref?.student?.studentEmail,
              ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
              CurrentAddress: ref?.student?.studentCurrentAddress,
              CurrentPinCode: ref?.student?.studentCurrentPincode,
              CurrentState: ref?.student?.studentCurrentState,
              CurrentDistrict: ref?.student?.studentCurrentDistrict,
              Address: ref?.student?.studentAddress,
              PinCode: ref?.student?.studentPincode,
              State: ref?.student?.studentState,
              District: ref?.student?.studentDistrict,
              ParentsName: ref?.student?.studentParentsName,
              ParentsEmail: ref?.student?.studentParentsEmail,
              ParentsOccupation: ref?.student?.studentParentsOccupation,
              ParentsOfficeAddress: ref?.student?.studentParentsAddress,
              ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
              SeatType: ref?.student?.student_seat_type,
              PhysicallyHandicapped: ref?.student?.student_ph_type,
              DefencePersonnel: ref?.student?.student_defence_personnel_word,
              MaritalStatus: ref?.student?.student_marital_status,
              PreviousBoard: ref?.student?.student_board_university,
              PreviousSchool: ref?.student?.studentPreviousSchool,
              UniversityCourse: ref?.student?.student_university_courses,
              PassingYear: ref?.student?.student_year,
              PreviousClass: ref?.student?.student_previous_class,
              PreviousMarks: ref?.student?.student_previous_marks,
              PreviousPercentage: ref?.student?.student_previous_percentage,
              SeatNo: ref?.student?.student_previous_section,
              StandardMOP: ref?.student?.month_of_passing,
              StandardYOP: ref?.student?.year_of_passing,
              StandardPercentage: ref?.student?.percentage,
              StandardNameOfInstitute: ref?.student?.name_of_institute,
              HSCMOP: ref?.student?.hsc_month,
              HSCYOP: ref?.student?.hsc_year,
              HSCPercentage: ref?.student?.hsc_percentage,
              HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
              HSCBoard: ref?.student?.hsc_board,
              HSCCandidateType: ref?.student?.hsc_candidate_type,
              HSCVocationalType: ref?.student?.hsc_vocational_type,
              HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
              HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
              HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
              HSCPCMTotal: ref?.student?.hsc_pcm_total,
              HSCGrandTotal: ref?.student?.hsc_grand_total,
              FormNo: ref?.student?.form_no,
              QviplePayId: ref?.student?.qviple_student_pay_id,
              ...numss,
            });
          }
        }
      }
      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
        });
      }
    } else if (
      `${flow}` === "Review_Query" &&
      valid_apply?.reviewApplication?.length > 0
    ) {
      const ads_admin = await Admission.findById({
        _id: `${valid_apply?.admissionAdmin}`,
      });
      const all_group_select = await SubjectGroupSelect.find({
        $and: [{ subject_group: { $in: valid_apply?.subject_selected_group } }],
      })
        .populate({
          path: "compulsory_subject",
          select: "subjectName",
        })
        .populate({
          path: "optional_subject",
          populate: {
            path: "optional_subject_options optional_subject_options_or.options",
            select: "subjectName",
          },
        })
        .populate({
          path: "fixed_subject",
          populate: {
            path: "fixed_subject_options",
            select: "subjectName",
          },
        });
      var subject_list = [];
      for (let ele of all_group_select) {
        subject_list.push(...ele?.compulsory_subject);
      }
      for (let ele of all_group_select) {
        for (let val of ele?.fixed_subject) {
          subject_list.push(...val?.fixed_subject_options);
        }
      }
      for (let ele of all_group_select) {
        for (let val of ele?.optional_subject) {
          subject_list.push(...val?.optional_subject_options);
        }
        for (let val of ele?.optional_subject) {
          for (let stu of val?.optional_subject_options_or) {
            subject_list.push(...stu?.options);
          }
        }
      }
      var excel_list = [];
      var numss = {};
      var numsss = {};
      for (var ref of valid_apply?.reviewApplication) {
        if (ref?.studentFirstName != "") {
          for (let ele of ref?.student_dynamic_field) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numss[ele?.key] = ele?.value;
          }
          var nums_queue = {};
          for (let stu of subject_list) {
            ref.student_dynamic_subject.push({
              subjectName: stu?.subjectName,
              status: "No",
              _id: stu?._id,
            });
          }
          for (let ele of ref.student_dynamic_subject) {
            for (let val of ref?.student_optional_subject) {
              if (`${ele?._id}` === `${val?._id}`) {
                nums_queue[ele?.subjectName] = "Yes";
                ele.status = "Yes";
              }
            }
          }
          for (let val of ref.student_dynamic_subject) {
            for (let ele of ref?.major_subject) {
              if (`${val?._id}` === `${ele?._id}`) {
                nums_queue[val?.subjectName] = "Yes";
                ele.status = "Yes";
              }
            }
          }
          if (ref?.nested_subject?.length > 0) {
            for (let val of ref.student_dynamic_subject) {
              for (let ele of ref?.nested_subject) {
                if (`${val?._id}` === `${ele?._id}`) {
                  nums_queue[val?.subjectName] = "Yes";
                  ele.status = "Yes";
                }
              }
            }
          }
          for (let ele of ref?.student_dynamic_subject) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numsss[ele?.subjectName] = ele?.status;
          }
          // console.log(numsss)
          excel_list.push({
            RegistrationID: ref?.student_prn_enroll_number ?? "#NA",
            "ABC ID": ref?.student?.student_abc_id ?? "#NA",
            Name: `${ref?.studentFirstName} ${
              ref?.studentMiddleName
                ? ref?.studentMiddleName ?? ref?.studentFatherName
                : ""
            } ${ref?.studentLastName}`,
            FirstName: ref?.studentFirstName ?? "#NA",
            FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
            LastName: ref?.studentLastName ?? "#NA",
            DOB: moment(ref?.student_expand_DOB).format("DD/MM/YYYY") ?? "#NA",
            Gender: ref?.studentGender ?? "#NA",
            CasteCategory: ref?.studentCastCategory ?? "#NA",
            Religion: ref?.studentReligion ?? "#NA",
            MotherName: `${ref?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.studentPhoneNumber ?? "#NA",
            AlternateContactNo: ref?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.studentNameAsMarksheet,
            NameAsCertificate: ref?.studentNameAsCertificate,
            BirthPlace: ref?.studentBirthPlace,
            Religion: ref?.studentReligion,
            Caste: ref?.studentCast,
            Nationality: ref?.studentNationality,
            RationCard: ref?.studentFatherRationCardColor,
            BloodGroup: ref?.student_blood_group,
            AadharNumber: ref?.studentAadharNumber,
            PhoneNumber: ref?.studentPhoneNumber,
            Email: ref?.studentEmail,
            ParentsPhoneNumber: ref?.studentParentsPhoneNumber,
            CurrentAddress: ref?.studentCurrentAddress,
            CurrentPinCode: ref?.studentCurrentPincode,
            CurrentState: ref?.studentCurrentState,
            CurrentDistrict: ref?.studentCurrentDistrict,
            Address: ref?.studentAddress,
            PinCode: ref?.studentPincode,
            State: ref?.studentState,
            District: ref?.studentDistrict,
            ParentsName: ref?.studentParentsName,
            ParentsEmail: ref?.studentParentsEmail,
            ParentsOccupation: ref?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.studentParentsAddress,
            ParentsAnnualIncome: ref?.studentParentsAnnualIncom,
            SeatType: ref?.student_seat_type,
            PhysicallyHandicapped: ref?.student_ph_type,
            DefencePersonnel: ref?.student_defence_personnel_word,
            MaritalStatus: ref?.student_marital_status,
            PreviousBoard: ref?.student_board_university,
            PreviousSchool: ref?.studentPreviousSchool,
            UniversityCourse: ref?.student_university_courses,
            PassingYear: ref?.student_year,
            PreviousClass: ref?.student_previous_class,
            PreviousMarks: ref?.student_previous_marks,
            PreviousPercentage: ref?.student_previous_percentage,
            SeatNo: ref?.student_previous_section,
            StandardMOP: ref?.month_of_passing,
            StandardYOP: ref?.year_of_passing,
            StandardPercentage: ref?.percentage,
            StandardNameOfInstitute: ref?.name_of_institute,
            HSCMOP: ref?.hsc_month,
            HSCYOP: ref?.hsc_year,
            HSCPercentage: ref?.hsc_percentage,
            HSCNameOfInstitute: ref?.hsc_name_of_institute,
            HSCBoard: ref?.hsc_board,
            HSCCandidateType: ref?.hsc_candidate_type,
            HSCVocationalType: ref?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.hsc_physics_marks,
            HSCChemistryMarks: ref?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.hsc_pcm_total,
            HSCGrandTotal: ref?.hsc_grand_total,
            FormNo: ref?.form_no,
            QviplePayId: ref?.qviple_student_pay_id,
            ...numss,
            ...numsss,
          });
        }
      }

      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
        });
      }
    } else if (
      `${flow}` === "Allot_Query" &&
      valid_apply?.allottedApplication?.length > 0
    ) {
      var excel_list = [];
      const all_group_select = await SubjectGroupSelect.find({
        $and: [{ subject_group: { $in: valid_apply?.subject_selected_group } }],
      })
        .populate({
          path: "compulsory_subject",
          select: "subjectName",
        })
        .populate({
          path: "optional_subject",
          populate: {
            path: "optional_subject_options optional_subject_options_or.options",
            select: "subjectName",
          },
        })
        .populate({
          path: "fixed_subject",
          populate: {
            path: "fixed_subject_options",
            select: "subjectName",
          },
        });
      var subject_list = [];
      for (let ele of all_group_select) {
        subject_list.push(...ele?.compulsory_subject);
      }
      for (let ele of all_group_select) {
        for (let val of ele?.fixed_subject) {
          subject_list.push(...val?.fixed_subject_options);
        }
      }
      for (let ele of all_group_select) {
        for (let val of ele?.optional_subject) {
          subject_list.push(...val?.optional_subject_options);
        }
        for (let val of ele?.optional_subject) {
          for (let stu of val?.optional_subject_options_or) {
            subject_list.push(...stu?.options);
          }
        }
      }
      var numss = {};
      var numsss = {};
      for (var ref of valid_apply?.allottedApplication) {
        if (ref?.student?.studentFirstName != "") {
          for (let ele of ref?.student?.student_dynamic_field) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numss[ele?.key] = ele?.value;
          }
          var nums_queue = {};
          for (let stu of subject_list) {
            ref.student.student_dynamic_subject.push({
              subjectName: stu?.subjectName,
              status: "No",
              _id: stu?._id,
            });
          }
          for (let ele of ref?.student?.student_dynamic_subject) {
            for (let val of ref?.student?.student_optional_subject) {
              if (`${ele?._id}` === `${val?._id}`) {
                nums_queue[ele?.subjectName] = "Yes";
                ele.status = "Yes";
              }
            }
          }
          for (let val of ref?.student?.student_dynamic_subject) {
            for (let ele of ref?.student?.major_subject) {
              if (`${val?._id}` === `${ele?._id}`) {
                nums_queue[val?.subjectName] = "Yes";
                ele.status = "Yes";
              }
            }
          }
          if (ref?.nested_subject?.length > 0) {
            for (let val of ref?.student?.student_dynamic_subject) {
              for (let ele of ref?.student?.nested_subject) {
                if (`${val?._id}` === `${ele?._id}`) {
                  nums_queue[val?.subjectName] = "Yes";
                  ele.status = "Yes";
                }
              }
            }
          }
          for (let ele of ref?.student?.student_dynamic_subject) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numsss[ele?.subjectName] = ele?.status;
          }
          excel_list.push({
            RegistrationID: ref?.student?.studentGRNO ?? "#NA",
            "ABC ID": ref?.student?.student_abc_id ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName ??
                  ref?.student?.studentFatherName
                : ""
            } ${ref?.student?.studentLastName}`,
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            DOB: ref?.student?.studentDOB ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.student?.createdAt).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
            NameAsCertificate: ref?.student?.studentNameAsCertificate,
            BirthPlace: ref?.student?.studentBirthPlace,
            Religion: ref?.student?.studentReligion,
            Caste: ref?.student?.studentCast,
            Nationality: ref?.student?.studentNationality,
            RationCard: ref?.student?.studentFatherRationCardColor,
            BloodGroup: ref?.student?.student_blood_group,
            AadharNumber: ref?.student?.studentAadharNumber,
            PhoneNumber: ref?.student?.studentPhoneNumber,
            Email: ref?.student?.studentEmail,
            ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
            CurrentAddress: ref?.student?.studentCurrentAddress,
            CurrentPinCode: ref?.student?.studentCurrentPincode,
            CurrentState: ref?.student?.studentCurrentState,
            CurrentDistrict: ref?.student?.studentCurrentDistrict,
            Address: ref?.student?.studentAddress,
            PinCode: ref?.student?.studentPincode,
            State: ref?.student?.studentState,
            District: ref?.student?.studentDistrict,
            ParentsName: ref?.student?.studentParentsName,
            ParentsEmail: ref?.student?.studentParentsEmail,
            ParentsOccupation: ref?.student?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.student?.studentParentsAddress,
            ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
            SeatType: ref?.student?.student_seat_type,
            PhysicallyHandicapped: ref?.student?.student_ph_type,
            DefencePersonnel: ref?.student?.student_defence_personnel_word,
            MaritalStatus: ref?.student?.student_marital_status,
            PreviousBoard: ref?.student?.student_board_university,
            PreviousSchool: ref?.student?.studentPreviousSchool,
            UniversityCourse: ref?.student?.student_university_courses,
            PassingYear: ref?.student?.student_year,
            PreviousClass: ref?.student?.student_previous_class,
            PreviousMarks: ref?.student?.student_previous_marks,
            PreviousPercentage: ref?.student?.student_previous_percentage,
            SeatNo: ref?.student?.student_previous_section,
            StandardMOP: ref?.student?.month_of_passing,
            StandardYOP: ref?.student?.year_of_passing,
            StandardPercentage: ref?.student?.percentage,
            StandardNameOfInstitute: ref?.student?.name_of_institute,
            HSCMOP: ref?.student?.hsc_month,
            HSCYOP: ref?.student?.hsc_year,
            HSCPercentage: ref?.student?.hsc_percentage,
            HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
            HSCBoard: ref?.student?.hsc_board,
            HSCCandidateType: ref?.student?.hsc_candidate_type,
            HSCVocationalType: ref?.student?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
            HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.student?.hsc_pcm_total,
            HSCGrandTotal: ref?.student?.hsc_grand_total,
            FormNo: ref?.student?.form_no,
            QviplePayId: ref?.student?.qviple_student_pay_id,
            ...numss,
            ...numsss,
          });
        }
      }
      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// exports.renderHostelApplicationListQuery = async (req, res) => {
//   try {
//     const { appId } = req.params;
//     const { flow } = req.query;
//     if (!appId)
//       return res.status(200).send({
//         message: "Their is a bug need to fixed immediately",
//         access: false,
//       });

//     var valid_apply = await NewApplication.findById({ _id: appId })
//       .select(
//         "receievedApplication applicationUnit applicationName confirmedApplication allottedApplication applicationHostel"
//       )
//       .populate({
//         path: "receievedApplication",
//         populate: {
//           path: "student",
//           select:
//             "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
//         },
//       })
//       .populate({
//         path: "confirmedApplication",
//         populate: {
//           path: "student",
//           select:
//             "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
//         },
//       })
//       .populate({
//         path: "allottedApplication",
//         populate: {
//           path: "student",
//           select:
//             "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
//         },
//       });

//     if (valid_apply?.applicationUnit) {
//       var valid_unit = await HostelUnit.findById({
//         _id: valid_apply?.applicationUnit,
//       }).select("hostel_unit_name");
//     }

//     if (
//       `${flow}` === "Request_Query" &&
//       valid_apply?.receievedApplication?.length > 0
//     ) {
//       var excel_list = [];
//       for (var ref of valid_apply?.receievedApplication) {
//         excel_list.push({
//           RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
//           Name: `${ref?.student?.studentFirstName} ${
//             ref?.student?.studentMiddleName
//               ? ref?.student?.studentMiddleName
//               : ""
//           } ${ref?.student?.studentLastName}`,
//           DOB: ref?.student?.studentDOB ?? "#NA",
//           Gender: ref?.student?.studentGender ?? "#NA",
//           CPI: ref?.student?.student_hostel_cpi ?? "#NA",
//           Programme: ref?.student?.student_programme ?? "#NA",
//           Branch: ref?.student?.student_branch ?? "#NA",
//           Year: ref?.student?.student_year ?? "#NA",
//           SingleSeaterRoom: ref?.student?.student_single_seater_room ?? "#NA",
//           PhysicallyHandicapped: ref?.student?.student_ph ?? "#NA",
//           Caste: ref?.student?.studentCastCategory ?? "#NA",
//           Religion: ref?.student?.studentReligion ?? "#NA",
//           MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
//           ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
//           Address: `${ref?.student?.studentAddress}` ?? "#NA",
//           AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
//           ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
//           AlternateContactNo: ref?.student?.studentParentsPhoneNumber ?? "#NA",
//         });
//       }
//       var valid_back = await json_to_excel_hostel_application_query(
//         excel_list,
//         valid_apply?.applicationName,
//         valid_unit?.hostel_unit_name,
//         appId,
//         flow
//       );
//       if (valid_back?.back) {
//         res.status(200).send({
//           message: "Explore New Excel On Hostel Export TAB",
//           access: true,
//         });
//       } else {
//         res.status(200).send({
//           message: "No New Excel Exports ",
//           access: false,
//         });
//       }
//     } else if (
//       `${flow}` === "Confirm_Query" &&
//       valid_apply?.confirmedApplication?.length > 0
//     ) {
//       var excel_list = [];
//       for (var ref of valid_apply?.confirmedApplication) {
//         excel_list.push({
//           RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
//           Name: `${ref?.student?.studentFirstName} ${
//             ref?.student?.studentMiddleName
//               ? ref?.student?.studentMiddleName
//               : ""
//           } ${ref?.student?.studentLastName}`,
//           DOB: ref?.student?.studentDOB ?? "#NA",
//           Gender: ref?.student?.studentGender ?? "#NA",
//           CPI: ref?.student?.student_hostel_cpi ?? "#NA",
//           Programme: ref?.student?.student_programme ?? "#NA",
//           Branch: ref?.student?.student_branch ?? "#NA",
//           Year: ref?.student?.student_year ?? "#NA",
//           SingleSeaterRoom: ref?.student?.student_single_seater_room ?? "#NA",
//           PhysicallyHandicapped: ref?.student?.student_ph ?? "#NA",
//           Caste: ref?.student?.studentCastCategory ?? "#NA",
//           Religion: ref?.student?.studentReligion ?? "#NA",
//           MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
//           ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
//           Address: `${ref?.student?.studentAddress}` ?? "#NA",
//           AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
//           ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
//           AlternateContactNo: ref?.student?.studentParentsPhoneNumber ?? "#NA",
//         });
//       }
//       var valid_back = await json_to_excel_hostel_application_query(
//         excel_list,
//         valid_apply?.applicationName,
//         valid_unit?.hostel_unit_name,
//         appId,
//         flow
//       );
//       if (valid_back?.back) {
//         res.status(200).send({
//           message: "Explore New Excel On Hostel Export TAB",
//           access: true,
//         });
//       } else {
//         res.status(200).send({
//           message: "No New Excel Exports ",
//           access: false,
//         });
//       }
//     } else if (
//       `${flow}` === "Allot_Query" &&
//       valid_apply?.allottedApplication?.length > 0
//     ) {
//       var excel_list = [];
//       for (var ref of valid_apply?.allottedApplication) {
//         excel_list.push({
//           RegistrationID: ref?.student?.studentGRNO ?? "#NA",
//           GRNO: ref?.student?.studentGRNO ?? "#NA",
//           Name: `${ref?.student?.studentFirstName} ${
//             ref?.student?.studentMiddleName
//               ? ref?.student?.studentMiddleName
//               : ""
//           } ${ref?.student?.studentLastName}`,
//           DOB: ref?.student?.studentDOB ?? "#NA",
//           Gender: ref?.student?.studentGender ?? "#NA",
//           CPI: ref?.student?.student_hostel_cpi ?? "#NA",
//           Programme: ref?.student?.student_programme ?? "#NA",
//           Branch: ref?.student?.student_branch ?? "#NA",
//           Year: ref?.student?.student_year ?? "#NA",
//           SingleSeaterRoom: ref?.student?.student_single_seater_room ?? "#NA",
//           PhysicallyHandicapped: ref?.student?.student_ph ?? "#NA",
//           Caste: ref?.student?.studentCastCategory ?? "#NA",
//           Religion: ref?.student?.studentReligion ?? "#NA",
//           MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
//           ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
//           Address: `${ref?.student?.studentAddress}` ?? "#NA",
//           AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
//           ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
//           AlternateContactNo: ref?.student?.studentParentsPhoneNumber ?? "#NA",
//         });
//       }
//       var valid_back = await json_to_excel_hostel_application_query(
//         excel_list,
//         valid_apply?.applicationName,
//         valid_unit?.hostel_unit_name,
//         appId,
//         flow
//       );
//       if (valid_back?.back) {
//         res.status(200).send({
//           message: "Explore New Excel On Hostel Export TAB",
//           access: true,
//         });
//       } else {
//         res.status(200).send({
//           message: "No New Excel Exports ",
//           access: false,
//         });
//       }
//     } else {
//       res.status(200).send({
//         message: "No Applications Found",
//         access: false,
//       });
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };

exports.retrieveHostelPendingFeeFilterQuery = async (req, res) => {
  try {
    const { hid } = req.params;
    const { gender, category, is_all, all_depart } = req.query;
    const { depart, fee_struct } = req.body;
    if (!hid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ads_admin = await Hostel.findById({ _id: hid }).select(
      "remainingFee institute units"
    );

    var valid_all = is_all === "false" ? false : true;

    if (all_depart === "All") {
      // var sorted_batch = [];
      // const institute = await InstituteAdmin.findById({
      //   _id: `${ads_admin?.institute}`,
      // }).select("depart");

      // if (batch_status === "All") {
      //   var all_department = await Department.find({
      //     _id: { $in: institute?.depart },
      //   }).select("batches");
      //   for (var ref of all_department) {
      //     sorted_batch.push(...ref?.batches);
      //   }
      // } else if (batch_status === "Current") {
      //   var all_department = await Department.find({
      //     _id: { $in: institute?.depart },
      //   }).select("departmentSelectBatch");
      //   for (var ref of all_department) {
      //     sorted_batch.push(ref?.departmentSelectBatch);
      //   }
      // }
      var all_students = await Student.find({
        $and: [
          { student_unit: { $in: ads_admin?.units } },
          { hostelRemainFeeCount: valid_all ? { $gte: 0 } : { $gt: 0 } },
        ],
      })
        .select("studentGender studentCastCategory student_unit")
        .populate({
          path: "hostel_fee_structure",
        });
    } else if (all_depart === "Particular") {
      var all_students = await Student.find({
        $and: [
          { _id: { $in: ads_admin?.remainingFee } },
          { hostelRemainFeeCount: valid_all ? { $gte: 0 } : { $gt: 0 } },
        ],
      })
        .select("student_unit studentGender studentCastCategory")
        .populate({
          path: "hostel_fee_structure",
        });
      if (depart) {
        all_students = all_students?.filter((ref) => {
          if (`${ref?.student_unit}` === `${depart}`) return ref;
        });
      }
    }

    if (category) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.studentCastCategory}` === `${category}`) return ref;
      });
    }

    if (gender) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.studentGender}` === `${gender}`) return ref;
      });
    }

    if (fee_struct) {
      all_students = all_students?.filter((ref) => {
        if (`${ref?.hostel_fee_structure?.category_master}` === `${fee_struct}`)
          return ref;
      });
    }

    var sorted_list = [];
    for (var ref of all_students) {
      sorted_list.push(ref?._id);
    }

    if (sorted_list?.length > 0) {
      res.status(200).send({
        message: "Explore New Excel Exports Wait for Some Time To Process",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        access: false,
      });
    }

    const valid_all_students = await Student.find({ _id: { $in: sorted_list } })
      .sort({ remainingFeeList_count: -1 })
      .select(
        "studentFirstName studentMiddleName remainingFeeList_count studentLastName studentDOB studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto hostelRemainFeeCount"
      )
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      })
      .populate({
        path: "hostel_fee_structure",
        select: "structure_name unique_structure_name applicable_fees",
      })
      .populate({
        path: "remainingFeeList",
        populate: {
          path: "batchId",
          select: "batchName",
        },
      })
      .populate({
        path: "remainingFeeList",
        populate: {
          path: "appId",
          select: "applicationName",
        },
      })
      .populate({
        path: "remainingFeeList",
        populate: {
          path: "fee_structure",
          select:
            "structure_name unique_structure_name category_master total_admission_fees one_installments applicable_fees class_master batch_master",
          populate: {
            path: "category_master batch_master class_master department",
            select: "category_name batchName className dName",
          },
        },
      });
    // valid_all_students.sort(function (st1, st2) {
    //   return (
    //     parseInt(st1?.studentGRNO?.slice(1)) -
    //     parseInt(st2?.studentGRNO?.slice(1))
    //   );
    // });
    // const buildObject = async (arr) => {
    //   const obj = {};
    //   for (let i = 0; i < arr.length; i++) {
    //     const { amount, price, paymode, mode } = arr[i];
    //     obj[amount] = price;
    //     obj[paymode] = mode;
    //   }
    //   return obj;
    // };
    var excel_list = [];
    var remain_array = [];
    for (var ref of valid_all_students) {
      for (var val of ref?.remainingFeeList) {
        // for (var num of val?.remaining_array) {
        //   var i = 0;
        //   if (num.status === "Paid") {
        //     remain_array.push({
        //       amount: `${i + 1}-Payment`,
        //       price: num?.remainAmount,
        //       paymode: `${i + 1}-Mode`,
        //       mode: num?.mode,
        //     });
        //   }
        //   i = val?.remaining_array?.length - i + 1;
        // }
        // var result = await buildObject(remain_array);

        excel_list.push({
          GRNO: ref?.studentGRNO ?? "#NA",
          Name: `${ref?.studentFirstName} ${
            ref?.studentMiddleName ? ref?.studentMiddleName : ""
          } ${ref?.studentLastName}`,
          FirstName: ref?.studentFirstName ?? "#NA",
          FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
          LastName: ref?.studentLastName ?? "#NA",
          DOB: ref?.studentDOB ?? "#NA",
          Gender: ref?.studentGender ?? "#NA",
          Caste: ref?.studentCastCategory ?? "#NA",
          Religion: ref?.studentReligion ?? "#NA",
          MotherName: `${ref?.studentMotherName}` ?? "#NA",
          Batch: `${val?.fee_structure?.batch_master?.batchName}` ?? "#NA",
          ActualFees: `${val?.fee_structure?.total_admission_fees}` ?? "0",
          ApplicableFees: `${val?.fee_structure?.applicable_fees}` ?? "0",
          TotalRemainingFees: `${val?.remaining_fee}` ?? "0",
          ApplicationName: `${val?.appId?.applicationName}` ?? "#NA",
          TotalPaidFees: `${val?.paid_fee}` ?? "0",
          TotalApplicableRemaining:
            `${val?.fee_structure?.applicable_fees}` - `${val?.paid_fee}` > 0
              ? `${val?.fee_structure?.applicable_fees}` - `${val?.paid_fee}`
              : 0,
          PaidByStudent: `${val?.paid_by_student}`,
          PaidByGovernment: `${val?.paid_by_government}`,
          Standard: `${val?.fee_structure?.class_master?.className}`,
          FeeStructure:
            `${val?.fee_structure?.category_master?.category_name}` ?? "#NA",
          Department: `${val?.fee_structure?.department?.dName}` ?? "#NA",
          Address: `${ref?.studentAddress}` ?? "#NA",
          // ...result,
        });
        // remain_array = [];
      }
    }
    await json_to_excel_hostel_query(
      excel_list,
      all_depart,
      category,
      gender,
      valid_all,
      hid
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelFeeHeadsStructureReceiptQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { fsid, depart, timeline, timeline_content, from, to } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var valid_timeline = timeline === "false" ? false : true;
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    if (timeline_content === "Past Week") {
      const week = custom_date_time_reverse(7);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Month") {
      const week = custom_month_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Year") {
      const week = custom_year_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    }
    var sorted_array = [];
    const finance = await Finance.findById({ _id: fid }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select("insName");
    // if (fsid && depart) {
    //   var all_students = await Student.find({
    //     $and: [{ institute: institute?._id }, { studentStatus: "Approved" }],
    //     $or: [
    //       {
    //         fee_structure: fsid,
    //       },
    //       {
    //         department: depart,
    //       },
    //     ],
    //   }).select("_id fee_receipt");
    // } else {
    //   var all_students = await Student.find({
    //     $and: [{ institute: institute?._id }, { studentStatus: "Approved" }],
    //   }).select("_id fee_receipt");
    // }
    // for (var ref of all_students) {
    //   sorted_array.push(ref?._id);
    // }
    if (valid_timeline) {
      const g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-01T00:00:00.000Z`);
      var all_receipts = await FeeReceipt.find({
        $and: [
          // { student: { $in: sorted_array } },
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lte: l_date,
            },
          },
          {
            receipt_generated_from: "BY_HOSTEL_MANAGER",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department student_unit",
          populate: {
            path: "hostel_fee_structure",
            select:
              "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department student_unit",
          populate: {
            path: "student_unit",
            select: "hostel_unit_name",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department student_unit",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationHostel",
          populate: {
            path: "applicationHostel",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();

      if (fsid) {
        all_receipts = all_receipts?.filter((val) => {
          if (`${val?.student?.hostel_fee_structure?._id}` === `${fsid}`)
            return val;
        });
      }
      if (depart) {
        all_receipts = all_receipts?.filter((val) => {
          if (`${val?.student?.student_unit?._id}` === `${depart}`) return val;
        });
      }
    } else {
      var g_year = new Date(`${from}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_year = new Date(`${to}`).getFullYear();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
      var all_receipts = await FeeReceipt.find({
        $and: [
          // { student: { $in: sorted_array } },
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lte: l_date,
            },
          },
          {
            receipt_generated_from: "BY_HOSTEL_MANAGER",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentGRNO studentGender remainingFeeList student_unit",
          populate: {
            path: "hostel_fee_structure",
            select:
              "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentGRNO studentGender remainingFeeList student_unit",
          populate: {
            path: "student_unit",
            select: "hostel_unit_name",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentGRNO studentGender remainingFeeList student_unit",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationHostel",
          populate: {
            path: "applicationHostel",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();
    }
    if (all_receipts?.length > 0) {
      res.status(200).send({
        message: "Explore Fee Receipt Heads Structure Query",
        access: true,
        all_receipts,
        count: all_receipts?.length,
      });
      all_receipts.sort(function (st1, st2) {
        return parseInt(st1?.invoice_count) - parseInt(st2?.invoice_count);
      });
      var head_list = [];
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { HeadsName, PaidHeadFees } = arr[i];
          obj[HeadsName] = PaidHeadFees;
        }
        return obj;
      };
      for (var ref of all_receipts) {
        var remain_list = await RemainingList.findOne({
          $and: [{ student: ref?.student }, { appId: ref?.application }],
        })
          .populate({
            path: "fee_structure",
            select:
              "applicable_fees total_admission_fees class_master batch_master unique_structure_name",
            populate: {
              path: "class_master batch_master department",
              select: "className batchName dName",
            },
          })
          .populate({
            path: "appId",
            select: "applicationBatch applicationHostel applicationName",
            populate: {
              path: "applicationBatch applicationHostel",
              select: "batchName",
            },
          });
        var head_array = [];
        if (ref?.fee_heads?.length > 0) {
          for (var val of ref?.fee_heads) {
            head_array.push({
              HeadsName: val?.head_name,
              PaidHeadFees: val?.original_paid,
            });
          }
        }
        if (remain_list?.paid_fee - remain_list?.applicable_fee > 0) {
          head_array.push({
            HeadsName: "Excess Fees",
            PaidHeadFees: remain_list?.paid_fee - remain_list?.applicable_fee,
          });
        }
        if (ref?.fee_heads?.length > 0) {
          var result = await buildStructureObject(head_array);
        }
        if (result) {
          head_list.push({
            ReceiptNumber: ref?.invoice_count ?? "0",
            ReceiptDate: moment(ref?.created_at).format("DD-MM-YYYY") ?? "NA",
            TransactionAmount: ref?.fee_payment_amount ?? "0",
            TransactionDate:
              moment(ref?.fee_transaction_date).format("DD-MM-YYYY") ?? "NA",
            TransactionMode: ref?.fee_payment_mode ?? "#NA",
            BankName: ref?.fee_bank_name ?? "#NA",
            BankHolderName: ref?.fee_bank_holder ?? "#NA",
            BankUTR: ref?.fee_utr_reference ?? "#NA",
            GRNO: ref?.student?.studentGRNO ?? "#NA",
            Name:
              `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName
                  : ""
              } ${ref?.student?.studentLastName}` ?? "#NA",
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            Standard:
              `${remain_list?.fee_structure?.class_master?.className}` ?? "#NA",
            Batch: remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
            Department: remain_list?.fee_structure?.department?.dName ?? "#NA",
            ApplicationName: remain_list?.appId?.applicationName ?? "#NA",
            FeeStructure:
              remain_list?.fee_structure?.unique_structure_name ?? "#NA",
            TotalFees: remain_list?.fee_structure?.total_admission_fees ?? "0",
            ApplicableFees: remain_list?.fee_structure?.applicable_fees ?? "0",
            PaidByStudent: remain_list?.paid_by_student,
            PaidByGovernment: remain_list?.paid_by_government,
            TotalPaidFees: remain_list?.paid_fee,
            ApplicableOutstanding:
              remain_list?.fee_structure?.applicable_fees -
                remain_list?.paid_fee >
              0
                ? remain_list?.fee_structure?.applicable_fees -
                  remain_list?.paid_fee
                : 0,
            TotalOutstanding: remain_list?.remaining_fee,
            Remark: remain_list?.remark ?? "#NA",
            HostelBankName:
              ref?.application?.applicationHostel?.bank_account
                ?.finance_bank_name ?? "#NA",
            HostelBankAccountNumber:
              ref?.application?.applicationHostel?.bank_account
                ?.finance_bank_account_number ?? "#NA",
            HostelBankAccountHolderName:
              ref?.application?.applicationHostel?.bank_account
                ?.finance_bank_account_name ?? "#NA",
            Narration: `Being Fees Received By ${
              ref?.fee_payment_mode
            } Date ${moment(ref?.fee_transaction_date).format(
              "DD-MM-YYYY"
            )} Rs. ${ref?.fee_payment_amount} out of Rs. ${
              ref?.student.hostel_fee_structure?.total_admission_fees
            } Paid By ${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName} (${
              ref?.student.hostel_fee_structure?.category_master?.category_name
            }) Towards Fees For ${ref?.student?.student_unit?.hostel_unit_name}
            }`,
            ...result,
          });
          result = [];
        }
        head_array = [];
      }

      await fee_heads_receipt_json_to_excel_query(
        head_list,
        institute?.insName,
        institute?._id
      );
    } else {
      res.status(200).send({
        message: "No Fee Receipt Heads Structure Query",
        access: false,
        all_students: [],
        // head_list,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeHeadsStructureReceiptRePayPriceQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { fsid, depart, timeline, timeline_content, from, to, bank } =
      req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var valid_timeline = timeline === "false" ? false : true;
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    var sorted_array = [];
    const finance = await Finance.findById({ _id: fid });
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    if (valid_timeline) {
      var g_year = new Date(`${from}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_year = new Date(`${to}`).getFullYear();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          {
            created_at: {
              $gte: g_date,
              $lte: l_date,
            },
          },
          {
            receipt_generated_from: "BY_ADMISSION",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "application",
          select: "applicationDepartment",
          populate: {
            path: "applicationDepartment",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();
      if (bank) {
        all_receipts = all_receipts?.filter((val) => {
          if (
            `${val?.application?.applicationDepartment?.bank_account?._id}` ===
            `${bank}`
          )
            return val;
        });
      }
    }
    var valid_pay = ["Fee Receipt Not Generated", "Payment Gateway / Online"];
    all_receipts = all_receipts?.filter((val) => {
      if (valid_pay?.includes(`${val?.fee_payment_mode}`)) return val;
    });

    if (all_receipts?.length > 0) {
      var price = 0;
      all_receipts?.map((val) => {
        price += val?.fee_payment_amount;
      });
      res.status(200).send({
        message: "Explore Fee Receipt Heads Structure Query",
        access: true,
        count: all_receipts?.length,
        price: price,
        all_receipts,
      });
    } else {
      res.status(200).send({
        message: "No Fee Receipt Heads Structure Query",
        access: false,
        count: 0,
        price: 0,
        // head_list,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeHeadsStructureReceiptRePayQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { fsid, depart, timeline, timeline_content, from, to, bank } =
      req.query;
    const { txnId, message, t_amount, p_amount } = req.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var valid_timeline = timeline === "false" ? false : true;
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    var sorted_array = [];
    const admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const finance = await Finance.findById({ _id: fid }).populate({
      path: "financeHead",
      select: "user",
    });
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    });
    if (valid_timeline) {
      var g_year = new Date(`${from}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_year = new Date(`${to}`).getFullYear();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      var g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
      date.setDate(date.getDate() + 1);
      let l_dates = date.getDate();
      if (l_dates < 10) {
        l_dates = `0${l_dates}`;
      }
      var l_months = l_month;
      let list1 = ["01", "03", "05", "07", "08", "10", "12"];
      let list2 = ["04", "06", "09", "11"];
      let list3 = ["02"];
      let g_days = l_months?.toString();
      if (g_day == 30 && list2?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (g_day >= 31 && list1?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      var l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          {
            created_at: {
              $gte: g_date,
              $lte: l_date,
            },
          },
          {
            receipt_generated_from: "BY_ADMISSION",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
          populate: {
            path: "fee_structure",
            select:
              "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationDepartment",
          populate: {
            path: "applicationDepartment",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();
      if (bank) {
        all_receipts = all_receipts?.filter((val) => {
          if (
            `${val?.application?.applicationDepartment?.bank_account?._id}` ===
            `${bank}`
          )
            return val;
        });
      }
    }
    if (all_receipts?.length > 0) {
      res.status(200).send({
        message: "Explore Fee Receipt Heads Structure Query",
        access: true,
        count: all_receipts?.length,
      });
      all_receipts.sort(function (st1, st2) {
        return parseInt(st1?.invoice_count) - parseInt(st2?.invoice_count);
      });
      const financeUser = await User.findById({
        _id: `${finance?.financeHead?.user}`,
      });
      var price = p_amount ? parseInt(p_amount) : 0;
      const notify = new Notification({});
      const repay = new RePay({});
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
      notify.notifyReceiever = institute?._id;
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
      if (bank) {
        var account = await BankAccount.findById({ _id: `${bank}` });
        for (var ref of account?.departments) {
          var department = await Department.findById({
            _id: `${ref}`,
          });
          if (department?.due_repay >= price) {
            department.due_repay -= price;
          }
          if (department?.total_repay >= price) {
            department.total_repay -= price;
          }
          price =
            account.due_repay >= price
              ? account.due_repay - price
              : price - account.due_repay;
          repay.bank_account.push(account?._id);
          repay.bank_account_count += 1;
          await department.save();
        }
        if (account?.due_repay >= price) {
          account.due_repay -= price;
        }
        if (account?.total_repay >= price) {
          account.total_repay -= price;
        }
        await account.save();
      }
      repay.bank_account.push(account?._id);
      repay.bank_account_count += 1;
      repay.settlement_date = `${g_date} To ${l_date} Settlement`;
      await Promise.all([
        institute.save(),
        notify.save(),
        admin.save(),
        repay.save(),
        finance.save(),
        financeUser.save(),
      ]);
      var head_list = [];
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { HeadsName, PaidHeadFees } = arr[i];
          obj[HeadsName] = PaidHeadFees;
        }
        return obj;
      };
      for (var ref of all_receipts) {
        var remain_list = await RemainingList.findOne({
          $and: [{ student: ref?.student }, { appId: ref?.application }],
        })
          .populate({
            path: "fee_structure",
            select:
              "applicable_fees total_admission_fees class_master batch_master unique_structure_name",
            populate: {
              path: "class_master batch_master",
              select: "className batchName",
            },
          })
          .populate({
            path: "appId",
            select: "applicationDepartment applicationBatch",
            populate: {
              path: "applicationDepartment applicationBatch",
              select: "dName batchName",
            },
          });
        var head_array = [];
        if (ref?.fee_heads?.length > 0) {
          for (var val of ref?.fee_heads) {
            head_array.push({
              HeadsName: val?.head_name,
              PaidHeadFees: val?.original_paid,
            });
          }
        }
        if (remain_list?.paid_fee - remain_list?.applicable_fee > 0) {
          head_array.push({
            HeadsName: "Excess Fees",
            PaidHeadFees: remain_list?.paid_fee - remain_list?.applicable_fee,
          });
        }
        if (ref?.fee_heads?.length > 0) {
          var result = await buildStructureObject(head_array);
        }
        if (result) {
          head_list.push({
            ReceiptNumber: ref?.invoice_count ?? "0",
            ReceiptDate: moment(ref?.created_at).format("DD-MM-YYYY") ?? "NA",
            TransactionAmount: ref?.fee_payment_amount ?? "0",
            TransactionDate:
              moment(ref?.fee_transaction_date).format("DD-MM-YYYY") ?? "NA",
            TransactionMode: ref?.fee_payment_mode ?? "#NA",
            BankName: ref?.fee_bank_name ?? "#NA",
            BankHolderName: ref?.fee_bank_holder ?? "#NA",
            BankUTR: ref?.fee_utr_reference ?? "#NA",
            GRNO: ref?.student?.studentGRNO ?? "#NA",
            Name:
              `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName
                  : ""
              } ${ref?.student?.studentLastName}` ?? "#NA",
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            Standard:
              `${remain_list?.fee_structure?.class_master?.className}` ?? "#NA",
            Batch: remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
            FeeStructure:
              remain_list?.fee_structure?.unique_structure_name ?? "#NA",
            TotalFees: remain_list?.fee_structure?.total_admission_fees ?? "0",
            ApplicableFees: remain_list?.fee_structure?.applicable_fees ?? "0",
            PaidByStudent: remain_list?.paid_by_student,
            PaidByGovernment: remain_list?.paid_by_government,
            TotalPaidFees: remain_list?.paid_fee,
            ApplicableOutstanding:
              remain_list?.fee_structure?.applicable_fees -
                remain_list?.paid_fee >
              0
                ? remain_list?.fee_structure?.applicable_fees -
                  remain_list?.paid_fee
                : 0,
            TotalOutstanding: remain_list?.remaining_fee,
            Remark: remain_list?.remark ?? "#NA",
            DepartmentBankName:
              ref?.application?.applicationDepartment?.bank_account
                ?.finance_bank_name ?? "#NA",
            DepartmentBankAccountNumber:
              ref?.application?.applicationDepartment?.bank_account
                ?.finance_bank_account_number ?? "#NA",
            DepartmentBankAccountHolderName:
              ref?.application?.applicationDepartment?.bank_account
                ?.finance_bank_account_name ?? "#NA",
            Narration: `Being Fees Received By ${
              ref?.fee_payment_mode
            } Date ${moment(ref?.fee_transaction_date).format(
              "DD-MM-YYYY"
            )} Rs. ${ref?.fee_payment_amount} out of Rs. ${
              ref?.student.fee_structure?.total_admission_fees
            } Paid By ${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName} (${
              ref?.student.fee_structure?.category_master?.category_name
            }) Towards Fees For ${ref?.student?.studentClass?.className}-${
              ref?.student?.studentClass?.classTitle
            } For Acacdemic Year ${ref?.student?.batches?.batchName}.`,
            ...result,
          });
          result = [];
        }
        head_array = [];
      }

      await fee_heads_receipt_json_to_excel_repay_query(
        head_list,
        institute?.insName,
        repay?._id
      );
      invokeSpecificRegister(
        "Specific Notification",
        `Qviple Super Admin re-pay Rs. ${p_amount} to you`,
        "Qviple Repayment",
        financeUser._id,
        financeUser.deviceToken
      );
    } else {
      res.status(200).send({
        message: "No Fee Receipt Heads Structure Query",
        access: false,
        count: 0,
        // head_list,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNormalStudentQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { flow } = req?.query;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "Normal") {
      var classes = await Class.findById({ _id: cid }).select(
        "ApproveStudent className institute"
      );
    } else if (flow === "Promote") {
      var classes = await Class.findById({ _id: cid }).select(
        "promoteStudent className institute"
      );
    } else {
    }

    if (
      classes?.ApproveStudent?.length > 0 ||
      classes?.promoteStudent?.length > 0
    ) {
      res.status(200).send({
        message: `Explore New ${flow} Excel Exports Wait for Some Time To Process`,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        access: false,
      });
    }

    if (flow === "Normal") {
      var searchable = [...classes?.ApproveStudent];
    } else if (flow === "Promote") {
      var searchable = [...classes?.promoteStudent];
    }
    const valid_all_students = await Student.find({ _id: { $in: searchable } })
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      })
      .populate({
        path: "fee_structure hostel_fee_structure",
        select:
          "unique_structure_name applicable_fees total_admission_fees category_master batch_master class_master",
        populate: {
          path: "category_master batch_master class_master department",
          select: "category_name batchName className dName",
        },
      });
    valid_all_students.sort(function (st1, st2) {
      return parseInt(st1?.studentROLLNO) - parseInt(st2?.studentROLLNO);
    });
    var excel_list = [];
    for (var ref of valid_all_students) {
      var struct = ref?.fee_structure
        ? ref?.fee_structure?._id
        : ref?.hostel_fee_structure
        ? ref?.hostel_fee_structure?._id
        : "";
      var valid_card = await RemainingList.find({
        $and: [{ student: `${ref?._id}` }],
      })
        .populate({
          path: "fee_structure",
        })
        .populate({
          path: "applicable_card government_card",
        })
        .populate({
          path: "appId",
          select: "applicationName",
        });
      var pending = 0;
      var paid = 0;
      var applicable_pending = 0;
      var gov_pending = 0;
      for (var ele of valid_card) {
        // ref.applicable_fees_pending +=
        //   ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
        //     ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
        //     : 0;
        pending +=
          ele?.applicable_card?.remaining_fee +
          ele?.government_card?.remaining_fee;
        paid += ele?.applicable_card?.paid_fee + ele?.government_card?.paid_fee;
        gov_pending += ele?.government_card?.remaining_fee;
        applicable_pending +=
          ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
            ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
            : 0;
      }
      if (struct) {
        var currentPaid = 0;
        var currentRemain = 0;
        var currentApplicableRemaining = 0;
        var currentGovernmentPending = 0;
        var valid_card = await RemainingList.findOne({
          $and: [{ fee_structure: `${struct}` }, { student: `${ref?._id}` }],
        })
          .populate({
            path: "fee_structure",
          })
          .populate({
            path: "applicable_card government_card",
          })
          .populate({
            path: "appId",
            select: "applicationName",
          });
        currentPaid += valid_card?.applicable_card?.paid_fee;
        currentRemain +=
          valid_card?.applicable_card?.remaining_fee +
          valid_card?.government_card?.remaining_fee;
        currentGovernmentPending += valid_card?.government_card?.remaining_fee;
        currentApplicableRemaining +=
          valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee > 0
            ? valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee
            : 0;
      }
      excel_list.push({
        RollNo: ref?.studentROLLNO ?? "NA",
        AbcId: ref?.student_abc_id ?? "#NA",
        GRNO: ref?.studentGRNO ?? "#NA",
        Name:
          `${ref?.studentFirstName} ${
            ref?.studentMiddleName ? ref?.studentMiddleName : ""
          } ${ref?.studentLastName}` ?? ref?.valid_full_name,
        FirstName: ref?.studentFirstName ?? "#NA",
        FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
        LastName: ref?.studentLastName ?? "#NA",
        DOB: ref?.studentDOB ?? "#NA",
        Gender: ref?.studentGender ?? "#NA",
        Caste: ref?.studentCast ?? "#NA",
        Religion: ref?.studentReligion ?? "#NA",
        Nationality: `${ref?.studentNationality}` ?? "#NA",
        MotherName: `${ref?.studentMotherName}` ?? "#NA",
        MotherTongue: `${ref?.studentMTongue}` ?? "#NA",
        CastCategory: `${ref?.studentCastCategory}` ?? "#NA",
        PreviousSchool: `${ref?.studentPreviousSchool}` ?? "#NA",
        Address: `${ref?.studentAddress}` ?? "#NA",
        ParentsName: `${ref?.studentParentsName}` ?? "#NA",
        ParentsPhoneNumber: `${ref?.studentParentsPhoneNumber}` ?? "#NA",
        ParentsOccupation: `${ref?.studentParentsOccupation}` ?? "#NA",
        ParentsIncome: `${ref?.studentParentsAnnualIncom}` ?? "#NA",
        BloodGroup: `${ref?.student_blood_group}` ?? "#NA",
        Email: `${ref?.studentEmail}` ?? "#NA",
        GateScore: `${ref?.student_gate_score}` ?? "#NA",
        GateYear: `${ref?.student_gate_year}` ?? "#NA",
        InstituteDegree: `${ref?.student_degree_institute}` ?? "#NA",
        InstituteDegreeYear: `${ref?.student_degree_year}` ?? "#NA",
        CPIPercentage: `${ref?.student_percentage_cpi}` ?? "#NA",
        StudentProgramme: `${ref?.student_programme}` ?? "#NA",
        StudentBranch: `${ref?.student_branch}` ?? "#NA",
        SingleSeater: `${ref?.student_single_seater_room}` ?? "#NA",
        PhysicallyChallenged: `${ref?.student_ph}` ?? "#NA",
        ProfileCompletion: `${ref?.profile_percentage}` ?? "0",
        Department: ref?.fee_structure?.department?.dName ?? "#NA",
        // ApplicationName: ref?.fee_structure?.department?.dName ?? "#NA",
        Standard: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.class_master?.className}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.class_master?.className}`
          : "#NA",
        Batch: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.batch_master?.batchName}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.batch_master?.batchName}`
          : "#NA",
        FeeStructure: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.unique_structure_name}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.unique_structure_name}`
          : "#NA",
        ActualFees: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.total_admission_fees}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.total_admission_fees}`
          : "0",
        ApplicableFees: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.applicable_fees}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.applicable_fees}`
          : "0",
        CurrentYearPaidFees: currentPaid ?? "0",
        CurrentYearRemainingFees: currentRemain ?? "0",
        CurrentYearApplicableRemainingFees: currentApplicableRemaining ?? "0",
        CurrentYearGovernmentRemainingFees: currentGovernmentPending ?? "0",
        TotalPaidFees: paid ?? "0",
        TotalRemainingFees: pending ?? "0",
        TotalApplicablePending: applicable_pending ?? "0",
        GovernmentOutstanding: gov_pending ?? "0",
      });
    }
    await json_to_excel_normal_student_promote_query(
      excel_list,
      classes?.institute,
      classes?.className,
      flow
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentStatisticsQuery = async (req, res) => {
  try {
    const { bid } = req.params;
    const batch_query = await Batch.findById({ _id: bid });

    const classes = await Class.find({ _id: { $in: batch_query?.classroom } });
    var excel_list = [];
    for (var val of classes) {
      var all_student = await Student.find({ studentClass: val?._id }).select(
        "studentGender studentCastCategory studentCast studentReligion student student_ph studentGRNO studentROLLNO valid_full_name studentProfilePhoto photoId"
      );
      var general_m = 0;
      var general_f = 0;
      var obc_m = 0;
      var obc_f = 0;
      var sc_m = 0;
      var sc_f = 0;
      var st_m = 0;
      var st_f = 0;
      var hindu_m = 0;
      var hindu_f = 0;
      var muslim_m = 0;
      var muslim_f = 0;
      var sikh_m = 0;
      var sikh_f = 0;
      var christian_m = 0;
      var christian_f = 0;
      var jain_m = 0;
      var jain_f = 0;
      var parsi_m = 0;
      var parsi_f = 0;
      var budh_m = 0;
      var budh_f = 0;
      var jews_m = 0;
      var jews_f = 0;
      var ph_m = 0;
      var ph_f = 0;
      var general_m_arr = [];
      var general_f_arr = [];
      var boy_arr = [];
      var girl_arr = [];
      var obc_m_arr = [];
      var obc_f_arr = [];
      var sc_m_arr = [];
      var sc_f_arr = [];
      var st_m_arr = [];
      var st_f_arr = [];
      var hindu_m_arr = [];
      var hindu_f_arr = [];
      var muslim_m_arr = [];
      var muslim_f_arr = [];
      var sikh_m_arr = [];
      var sikh_f_arr = [];
      var christian_m_arr = [];
      var christian_f_arr = [];
      var jain_m_arr = [];
      var jain_f_arr = [];
      var parsi_m_arr = [];
      var parsi_f_arr = [];
      var budh_m_arr = [];
      var budh_f_arr = [];
      var jews_m_arr = [];
      var jews_f_arr = [];
      var ph_m_arr = [];
      var ph_f_arr = [];
      var dt_m = 0;
      var dt_f = 0;
      var dt_m_arr = [];
      var dt_f_arr = [];
      var sbc_m = 0;
      var sbc_f = 0;
      var sbc_m_arr = [];
      var sbc_f_arr = [];
      var ews_m = 0;
      var ews_f = 0;
      var ews_m_arr = [];
      var ews_f_arr = [];
      var maratha_m = 0;
      var maratha_f = 0;
      var maratha_m_arr = [];
      var maratha_f_arr = [];
      var jk_m = 0;
      var jk_f = 0;
      var jk_m_arr = [];
      var jk_f_arr = [];
      var goins_m = 0;
      var goins_f = 0;
      var goins_m_arr = [];
      var goins_f_arr = [];
      var nt_m = 0;
      var nt_f = 0;
      var nt_m_arr = [];
      var nt_f_arr = [];
      for (var ele of all_student) {
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentCastCategory?.toLowerCase() === "general"
        ) {
          general_m += 1;
          general_m_arr.push(ele);
        } else {
          general_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentCastCategory?.toLowerCase() === "general"
        ) {
          general_f += 1;
          general_f_arr.push(ele);
        } else {
          general_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentCastCategory?.toLowerCase() === "obc"
        ) {
          obc_m += 1;
          obc_m_arr.push(ele);
        } else {
          obc_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentCastCategory?.toLowerCase() === "obc"
        ) {
          obc_f += 1;
          obc_f_arr.push(ele);
        } else {
          obc_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentCastCategory?.toLowerCase() === "sc"
        ) {
          sc_m += 1;
          sc_m_arr.push(ele);
        } else {
          sc_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentCastCategory?.toLowerCase() === "sc"
        ) {
          sc_f += 1;
          sc_f_arr.push(ele);
        } else {
          sc_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentCastCategory?.toLowerCase() === "st"
        ) {
          st_m += 1;
          st_m_arr.push(ele);
        } else {
          st_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentCastCategory?.toLowerCase() === "st"
        ) {
          st_f += 1;
          st_f_arr.push(ele);
        } else {
          st_f += 0;
        }
        if (
          (ele?.studentGender?.toLowerCase() === "male" &&
            ele?.studentCastCategory?.toLowerCase() === "nt-a") ||
          ele?.studentCastCategory?.toLowerCase() === "nt-b" ||
          ele?.studentCastCategory?.toLowerCase() === "nt-c" ||
          ele?.studentCastCategory?.toLowerCase() === "nt-d"
        ) {
          nt_m += 1;
          nt_m_arr.push(ele);
        } else {
          nt_m += 0;
        }
        if (
          (ele?.studentGender?.toLowerCase() === "female" &&
            ele?.studentCastCategory?.toLowerCase() === "nt-a") ||
          ele?.studentCastCategory?.toLowerCase() === "nt-b" ||
          ele?.studentCastCategory?.toLowerCase() === "nt-c" ||
          ele?.studentCastCategory?.toLowerCase() === "nt-d"
        ) {
          nt_f += 1;
          nt_f_arr.push(ele);
        } else {
          nt_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "hindu"
        ) {
          hindu_m += 1;
          hindu_m_arr.push(ele);
        } else {
          hindu_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "hindu"
        ) {
          hindu_f += 1;
          hindu_f_arr.push(ele);
        } else {
          hindu_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "muslim"
        ) {
          muslim_m += 1;
          muslim_m_arr.push(ele);
        } else {
          muslim_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "muslim"
        ) {
          muslim_f += 1;
          muslim_f_arr.push(ele);
        } else {
          muslim_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "sikh"
        ) {
          sikh_m += 1;
          sikh_m_arr.push(ele);
        } else {
          sikh_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "sikh"
        ) {
          sikh_f += 1;
          sikh_f_arr.push(ele);
        } else {
          sikh_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "christian"
        ) {
          christian_m += 1;
          christian_m_arr.push(ele);
        } else {
          christian_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "christian"
        ) {
          christian_f += 1;
          christian_f_arr.push(ele);
        } else {
          christian_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "jainism"
        ) {
          jain_m += 1;
          jain_m_arr.push(ele);
        } else {
          jain_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "jainism"
        ) {
          jain_f += 1;
          jain_f_arr.push(ele);
        } else {
          jain_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "parsi"
        ) {
          parsi_m += 1;
          parsi_m_arr.push(ele);
        } else {
          parsi_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "parsi"
        ) {
          parsi_f += 1;
          parsi_f_arr.push(ele);
        } else {
          parsi_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "buddhism"
        ) {
          budh_m += 1;
          budh_m_arr.push(ele);
        } else {
          budh_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "buddhism"
        ) {
          budh_f += 1;
          budh_f_arr.push(ele);
        } else {
          budh_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "jews"
        ) {
          jews_m += 1;
          jews_m_arr.push(ele);
        } else {
          jews_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "jews"
        ) {
          jews_f += 1;
          jews_f_arr.push(ele);
        } else {
          jews_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.student_ph?.toLowerCase() === "yes"
        ) {
          ph_m += 1;
          ph_m_arr.push(ele);
        } else {
          ph_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.student_ph?.toLowerCase() === "yes"
        ) {
          ph_f += 1;
          ph_f_arr.push(ele);
        } else {
          ph_f += 0;
        }
        if (ele?.studentGender?.toLowerCase() === "male") {
          boy_arr.push(ele);
        }
        if (ele?.studentGender?.toLowerCase() === "female") {
          girl_arr.push(ele);
        }
      }
      excel_list.push({
        className: `${val?.className}-${val?.classTitle}`,
        strength: val?.ApproveStudent?.length,
        boy: val?.boyCount,
        boy_arr: boy_arr,
        girl: val?.girlCount,
        girl_arr: girl_arr,
        general_m: general_m,
        general_f: general_f,
        obc_m: obc_m,
        obc_f: obc_f,
        sc_m: sc_m,
        sc_f: sc_f,
        st_m: st_m,
        st_f: st_f,
        hindu_m: hindu_m,
        hindu_f: hindu_f,
        muslim_m: muslim_m,
        muslim_f: muslim_f,
        sikh_m: sikh_m,
        sikh_f: sikh_f,
        christian_m: christian_m,
        christian_f: christian_f,
        jain_m: jain_m,
        jain_f: jain_f,
        parsi_m: parsi_m,
        parsi_f: parsi_f,
        budh_m: budh_m,
        budh_f: budh_f,
        jews_m: jews_m,
        jews_f: jews_f,
        ph_m: ph_m,
        ph_f: ph_f,
        general_m_arr: general_m_arr,
        general_f_arr: general_f_arr,
        obc_m_arr: obc_m_arr,
        obc_f_arr: obc_f_arr,
        sc_m_arr: sc_m_arr,
        sc_f_arr: sc_f_arr,
        st_m_arr: st_m_arr,
        st_f_arr: st_f_arr,
        hindu_m_arr: hindu_m_arr,
        hindu_f_arr: hindu_f_arr,
        muslim_m_arr: muslim_m_arr,
        muslim_f_arr: muslim_f_arr,
        sikh_m_arr: sikh_m_arr,
        sikh_f_arr: sikh_f_arr,
        christian_m_arr: christian_m_arr,
        christian_f_arr: christian_f_arr,
        jain_m_arr: jain_m_arr,
        jain_f_arr: jain_f_arr,
        parsi_m_arr: parsi_m_arr,
        parsi_f_arr: parsi_f_arr,
        budh_m_arr: budh_m_arr,
        budh_f_arr: budh_f_arr,
        jews_m_arr: jews_m_arr,
        jews_f_arr: jews_f_arr,
        ph_m_arr: ph_m_arr,
        ph_f_arr: ph_f_arr,
        dt_m: dt_m,
        dt_f: dt_f,
        dt_m_arr: dt_m_arr,
        dt_f_arr: dt_f_arr,
        sbc_m: sbc_m,
        sbc_f: sbc_f,
        sbc_m_arr: sbc_m_arr,
        sbc_f_arr: sbc_f_arr,
        ews_m: ews_m,
        ews_f: ews_f,
        ews_m_arr: ews_m_arr,
        ews_f_arr: ews_f_arr,
        maratha_m: maratha_m,
        maratha_f: maratha_f,
        maratha_m_arr: maratha_m_arr,
        maratha_f_arr: maratha_f_arr,
        jk_m: jk_m,
        jk_f: jk_f,
        jk_m_arr: jk_m_arr,
        jk_f_arr: jk_f_arr,
        goins_m: goins_m,
        goins_f: goins_f,
        goins_m_arr: goins_m_arr,
        goins_f_arr: goins_f_arr,
        nt_m: nt_m,
        nt_f: nt_f,
        nt_m_arr: nt_m_arr,
        nt_f_arr: nt_f_arr,
      });
    }
    if (excel_list?.length > 0) {
      res.status(200).send({
        message: "Explore New Student Statistics Query",
        access: true,
        excel_list: excel_list,
      });
    } else {
      res.status(200).send({
        message: "No Student Statistics Query",
        access: false,
        excel_list: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentStatisticsUniversalQuery = async (req, res) => {
  try {
    const { bid } = req.params;
    const batch_query = await Batch.findById({ _id: bid });

    const classes = await Class.find({
      batch: { $in: batch_query?.merged_batches },
    });
    var excel_list = [];
    for (var val of classes) {
      var all_student = await Student.find({ studentClass: val?._id }).select(
        "studentGender studentCastCategory studentCast studentReligion student student_ph studentGRNO studentROLLNO valid_full_name studentProfilePhoto photoId"
      );
      var general_m = 0;
      var general_f = 0;
      var obc_m = 0;
      var obc_f = 0;
      var sc_m = 0;
      var sc_f = 0;
      var st_m = 0;
      var st_f = 0;
      var hindu_m = 0;
      var hindu_f = 0;
      var muslim_m = 0;
      var muslim_f = 0;
      var sikh_m = 0;
      var sikh_f = 0;
      var christian_m = 0;
      var christian_f = 0;
      var jain_m = 0;
      var jain_f = 0;
      var parsi_m = 0;
      var parsi_f = 0;
      var budh_m = 0;
      var budh_f = 0;
      var jews_m = 0;
      var jews_f = 0;
      var ph_m = 0;
      var ph_f = 0;
      var general_m_arr = [];
      var general_f_arr = [];
      var boy_arr = [];
      var girl_arr = [];
      var obc_m_arr = [];
      var obc_f_arr = [];
      var sc_m_arr = [];
      var sc_f_arr = [];
      var st_m_arr = [];
      var st_f_arr = [];
      var hindu_m_arr = [];
      var hindu_f_arr = [];
      var muslim_m_arr = [];
      var muslim_f_arr = [];
      var sikh_m_arr = [];
      var sikh_f_arr = [];
      var christian_m_arr = [];
      var christian_f_arr = [];
      var jain_m_arr = [];
      var jain_f_arr = [];
      var parsi_m_arr = [];
      var parsi_f_arr = [];
      var budh_m_arr = [];
      var budh_f_arr = [];
      var jews_m_arr = [];
      var jews_f_arr = [];
      var ph_m_arr = [];
      var ph_f_arr = [];
      var dt_m = 0;
      var dt_f = 0;
      var dt_m_arr = [];
      var dt_f_arr = [];
      var sbc_m = 0;
      var sbc_f = 0;
      var sbc_m_arr = [];
      var sbc_f_arr = [];
      var ews_m = 0;
      var ews_f = 0;
      var ews_m_arr = [];
      var ews_f_arr = [];
      var maratha_m = 0;
      var maratha_f = 0;
      var maratha_m_arr = [];
      var maratha_f_arr = [];
      var jk_m = 0;
      var jk_f = 0;
      var jk_m_arr = [];
      var jk_f_arr = [];
      var goins_m = 0;
      var goins_f = 0;
      var goins_m_arr = [];
      var goins_f_arr = [];
      var nt_m = 0;
      var nt_f = 0;
      var nt_m_arr = [];
      var nt_f_arr = [];
      for (var ele of all_student) {
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentCastCategory?.toLowerCase() === "general"
        ) {
          general_m += 1;
          general_m_arr.push(ele);
        } else {
          general_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentCastCategory?.toLowerCase() === "general"
        ) {
          general_f += 1;
          general_f_arr.push(ele);
        } else {
          general_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentCastCategory?.toLowerCase() === "obc"
        ) {
          obc_m += 1;
          obc_m_arr.push(ele);
        } else {
          obc_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentCastCategory?.toLowerCase() === "obc"
        ) {
          obc_f += 1;
          obc_f_arr.push(ele);
        } else {
          obc_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentCastCategory?.toLowerCase() === "sc"
        ) {
          sc_m += 1;
          sc_m_arr.push(ele);
        } else {
          sc_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentCastCategory?.toLowerCase() === "sc"
        ) {
          sc_f += 1;
          sc_f_arr.push(ele);
        } else {
          sc_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentCastCategory?.toLowerCase() === "st"
        ) {
          st_m += 1;
          st_m_arr.push(ele);
        } else {
          st_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentCastCategory?.toLowerCase() === "st"
        ) {
          st_f += 1;
          st_f_arr.push(ele);
        } else {
          st_f += 0;
        }
        if (
          (ele?.studentGender?.toLowerCase() === "male" &&
            ele?.studentCastCategory?.toLowerCase() === "nt-a") ||
          ele?.studentCastCategory?.toLowerCase() === "nt-b" ||
          ele?.studentCastCategory?.toLowerCase() === "nt-c" ||
          ele?.studentCastCategory?.toLowerCase() === "nt-d"
        ) {
          nt_m += 1;
          nt_m_arr.push(ele);
        } else {
          nt_m += 0;
        }
        if (
          (ele?.studentGender?.toLowerCase() === "female" &&
            ele?.studentCastCategory?.toLowerCase() === "nt-a") ||
          ele?.studentCastCategory?.toLowerCase() === "nt-b" ||
          ele?.studentCastCategory?.toLowerCase() === "nt-c" ||
          ele?.studentCastCategory?.toLowerCase() === "nt-d"
        ) {
          nt_f += 1;
          nt_f_arr.push(ele);
        } else {
          nt_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "hindu"
        ) {
          hindu_m += 1;
          hindu_m_arr.push(ele);
        } else {
          hindu_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "hindu"
        ) {
          hindu_f += 1;
          hindu_f_arr.push(ele);
        } else {
          hindu_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "muslim"
        ) {
          muslim_m += 1;
          muslim_m_arr.push(ele);
        } else {
          muslim_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "muslim"
        ) {
          muslim_f += 1;
          muslim_f_arr.push(ele);
        } else {
          muslim_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "sikh"
        ) {
          sikh_m += 1;
          sikh_m_arr.push(ele);
        } else {
          sikh_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "sikh"
        ) {
          sikh_f += 1;
          sikh_f_arr.push(ele);
        } else {
          sikh_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "christian"
        ) {
          christian_m += 1;
          christian_m_arr.push(ele);
        } else {
          christian_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "christian"
        ) {
          christian_f += 1;
          christian_f_arr.push(ele);
        } else {
          christian_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "jainism"
        ) {
          jain_m += 1;
          jain_m_arr.push(ele);
        } else {
          jain_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "jainism"
        ) {
          jain_f += 1;
          jain_f_arr.push(ele);
        } else {
          jain_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "parsi"
        ) {
          parsi_m += 1;
          parsi_m_arr.push(ele);
        } else {
          parsi_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "parsi"
        ) {
          parsi_f += 1;
          parsi_f_arr.push(ele);
        } else {
          parsi_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "buddhism"
        ) {
          budh_m += 1;
          budh_m_arr.push(ele);
        } else {
          budh_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "buddhism"
        ) {
          budh_f += 1;
          budh_f_arr.push(ele);
        } else {
          budh_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.studentReligion?.toLowerCase() === "jews"
        ) {
          jews_m += 1;
          jews_m_arr.push(ele);
        } else {
          jews_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.studentReligion?.toLowerCase() === "jews"
        ) {
          jews_f += 1;
          jews_f_arr.push(ele);
        } else {
          jews_f += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "male" &&
          ele?.student_ph?.toLowerCase() === "yes"
        ) {
          ph_m += 1;
          ph_m_arr.push(ele);
        } else {
          ph_m += 0;
        }
        if (
          ele?.studentGender?.toLowerCase() === "female" &&
          ele?.student_ph?.toLowerCase() === "yes"
        ) {
          ph_f += 1;
          ph_f_arr.push(ele);
        } else {
          ph_f += 0;
        }
        if (ele?.studentGender?.toLowerCase() === "male") {
          boy_arr.push(ele);
        }
        if (ele?.studentGender?.toLowerCase() === "female") {
          girl_arr.push(ele);
        }
      }
      excel_list.push({
        className: `${val?.className}-${val?.classTitle}`,
        strength: val?.ApproveStudent?.length,
        boy: val?.boyCount,
        boy_arr: boy_arr,
        girl: val?.girlCount,
        girl_arr: girl_arr,
        general_m: general_m,
        general_f: general_f,
        obc_m: obc_m,
        obc_f: obc_f,
        sc_m: sc_m,
        sc_f: sc_f,
        st_m: st_m,
        st_f: st_f,
        hindu_m: hindu_m,
        hindu_f: hindu_f,
        muslim_m: muslim_m,
        muslim_f: muslim_f,
        sikh_m: sikh_m,
        sikh_f: sikh_f,
        christian_m: christian_m,
        christian_f: christian_f,
        jain_m: jain_m,
        jain_f: jain_f,
        parsi_m: parsi_m,
        parsi_f: parsi_f,
        budh_m: budh_m,
        budh_f: budh_f,
        jews_m: jews_m,
        jews_f: jews_f,
        ph_m: ph_m,
        ph_f: ph_f,
        general_m_arr: general_m_arr,
        general_f_arr: general_f_arr,
        obc_m_arr: obc_m_arr,
        obc_f_arr: obc_f_arr,
        sc_m_arr: sc_m_arr,
        sc_f_arr: sc_f_arr,
        st_m_arr: st_m_arr,
        st_f_arr: st_f_arr,
        hindu_m_arr: hindu_m_arr,
        hindu_f_arr: hindu_f_arr,
        muslim_m_arr: muslim_m_arr,
        muslim_f_arr: muslim_f_arr,
        sikh_m_arr: sikh_m_arr,
        sikh_f_arr: sikh_f_arr,
        christian_m_arr: christian_m_arr,
        christian_f_arr: christian_f_arr,
        jain_m_arr: jain_m_arr,
        jain_f_arr: jain_f_arr,
        parsi_m_arr: parsi_m_arr,
        parsi_f_arr: parsi_f_arr,
        budh_m_arr: budh_m_arr,
        budh_f_arr: budh_f_arr,
        jews_m_arr: jews_m_arr,
        jews_f_arr: jews_f_arr,
        ph_m_arr: ph_m_arr,
        ph_f_arr: ph_f_arr,
        dt_m: dt_m,
        dt_f: dt_f,
        dt_m_arr: dt_m_arr,
        dt_f_arr: dt_f_arr,
        sbc_m: sbc_m,
        sbc_f: sbc_f,
        sbc_m_arr: sbc_m_arr,
        sbc_f_arr: sbc_f_arr,
        ews_m: ews_m,
        ews_f: ews_f,
        ews_m_arr: ews_m_arr,
        ews_f_arr: ews_f_arr,
        maratha_m: maratha_m,
        maratha_f: maratha_f,
        maratha_m_arr: maratha_m_arr,
        maratha_f_arr: maratha_f_arr,
        jk_m: jk_m,
        jk_f: jk_f,
        jk_m_arr: jk_m_arr,
        jk_f_arr: jk_f_arr,
        goins_m: goins_m,
        goins_f: goins_f,
        goins_m_arr: goins_m_arr,
        goins_f_arr: goins_f_arr,
        nt_m: nt_m,
        nt_f: nt_f,
        nt_m_arr: nt_m_arr,
        nt_f_arr: nt_f_arr,
      });
    }
    if (excel_list?.length > 0) {
      res.status(200).send({
        message: "Explore New Student Statistics Query",
        access: true,
        excel_list: excel_list,
        count: excel_list?.length,
      });
    } else {
      res.status(200).send({
        message: "No Student Statistics Query",
        access: false,
        excel_list: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentStatisticsExcelQuery = async (req, res) => {
  try {
    const { all_arr, batch, depart } = req.body;
    if (!all_arr)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_all_students = await Student.find({ _id: { $in: all_arr } })
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      });
    valid_all_students.sort(function (st1, st2) {
      return parseInt(st1?.studentROLLNO) - parseInt(st2?.studentROLLNO);
    });

    // var applicable_os_fees = 0
    // var total_fees = 0
    // var total_os_fees = 0
    // var government_os_fees = 0

    if (batch && depart) {
      var excel_list = [];
      var head_list = [];
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { HeadsName, PaidHeadFees } = arr[i];
          obj[HeadsName] = PaidHeadFees;
        }
        return obj;
      };
      var structure = await FeeStructure.find({
        $and: [{ department: depart }, { batch_master: batch }],
      });
      // var all_app = await NewApplication.find({ $and: [{ applicationDepartment: depart}, { applicationBatch: batch}]})
      for (var ref of valid_all_students) {
        var one_remain = await RemainingList.findOne({
          $and: [{ student: ref?._id }, { fee_structure: { $in: structure } }],
        })
          .populate({
            path: "fee_structure",
            populate: {
              path: "class_master batch_master",
              select: "className batchName",
            },
          })
          .populate({
            path: "applicable_card government_card",
          });
        var head_array = [];
        if (ref?.active_fee_heads?.length > 0) {
          for (var val of ref?.active_fee_heads) {
            if (`${val?.appId}` === `${one_remain?.appId}`) {
              head_array.push({
                HeadsName: val?.head_name,
                PaidHeadFees: val?.paid_fee,
              });
            }
          }
        }
        if (one_remain?.paid_fee - one_remain?.applicable_fee > 0) {
          if (`${val?.appId}` === `${one_remain?.appId}`) {
            head_array.push({
              HeadsName: "Excess Fees",
              PaidHeadFees: one_remain?.paid_fee - one_remain?.applicable_fee,
            });
          }
        }
        if (ref?.active_fee_heads?.length > 0) {
          var result = await buildStructureObject(head_array);
        }
        excel_list.push({
          RollNo: ref?.studentROLLNO ?? "NA",
          AbcId: ref?.student_abc_id ?? "#NA",
          GRNO: ref?.studentGRNO ?? "#NA",
          Name:
            `${ref?.studentFirstName} ${
              ref?.studentMiddleName ? ref?.studentMiddleName : ""
            } ${ref?.studentLastName}` ?? ref?.valid_full_name,
          FirstName: ref?.studentFirstName ?? "#NA",
          FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
          LastName: ref?.studentLastName ?? "#NA",
          DOB: ref?.studentDOB ?? "#NA",
          Gender: ref?.studentGender ?? "#NA",
          TotalApplicableFees: one_remain?.applicable_card?.applicable_fee ?? 0,
          TotalGovernmentApplicableFees:
            one_remain?.government_card?.applicable_fee ?? 0,
          TotalFees:
            one_remain?.applicable_card?.applicable_fee +
              one_remain?.government_card?.applicable_fee ?? 0,
          ApplicablePaidFees: one_remain?.applicable_card?.paid_fee ?? 0,
          GovernmentApplicablePaidFees:
            one_remain?.government_card?.paid_fee ?? 0,
          TotalPaidFees:
            one_remain?.applicable_card?.paid_fee +
            one_remain?.government_card?.paid_fee,
          TotalApplicableOutstandingFees:
            one_remain?.applicable_card?.remaining_fee,
          TotalGovernmentOutstandingFees:
            one_remain?.government_card?.remaining_fee,
          TotalOutstandingFees:
            one_remain?.applicable_card?.remaining_fee +
            one_remain?.government_card?.remaining_fee,
          Standard: `${one_remain?.fee_structure}`
            ? `${one_remain?.fee_structure?.class_master?.className}`
            : "#NA",
          Batch: `${one_remain?.fee_structure}`
            ? `${one_remain?.fee_structure?.batch_master?.batchName}`
            : "#NA",
          FeeStructure: one_remain?.fee_structure?.unique_structure_name,
          ...result,
        });
        result = [];
      }
      // console.log(excel_list)
      const data = await json_to_excel_statistics_promote_query(excel_list);

      res.status(200).send({
        message: "Explore Statistics with Admission Fee Query",
        access: true,
        data: data,
        // excel_list: excel_list
      });
    } else {
      var excel_list = [];
      for (var ref of valid_all_students) {
        excel_list.push({
          RollNo: ref?.studentROLLNO ?? "NA",
          AbcId: ref?.student_abc_id ?? "#NA",
          GRNO: ref?.studentGRNO ?? "#NA",
          Name:
            `${ref?.studentFirstName} ${
              ref?.studentMiddleName ? ref?.studentMiddleName : ""
            } ${ref?.studentLastName}` ?? ref?.valid_full_name,
          FirstName: ref?.studentFirstName ?? "#NA",
          FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
          LastName: ref?.studentLastName ?? "#NA",
          DOB: ref?.studentDOB ?? "#NA",
          Gender: ref?.studentGender ?? "#NA",
          Caste: ref?.studentCast ?? "#NA",
          Religion: ref?.studentReligion ?? "#NA",
          Nationality: `${ref?.studentNationality}` ?? "#NA",
          MotherName: `${ref?.studentMotherName}` ?? "#NA",
          MotherTongue: `${ref?.studentMTongue}` ?? "#NA",
          CastCategory: `${ref?.studentCastCategory}` ?? "#NA",
          PreviousSchool: `${ref?.studentPreviousSchool}` ?? "#NA",
          Address: `${ref?.studentAddress}` ?? "#NA",
          ParentsName: `${ref?.studentParentsName}` ?? "#NA",
          ParentsPhoneNumber: `${ref?.studentParentsPhoneNumber}` ?? "#NA",
          ParentsOccupation: `${ref?.studentParentsOccupation}` ?? "#NA",
          ParentsIncome: `${ref?.studentParentsAnnualIncom}` ?? "#NA",
          BloodGroup: `${ref?.student_blood_group}` ?? "#NA",
          Email: `${ref?.studentEmail}` ?? "#NA",
          GateScore: `${ref?.student_gate_score}` ?? "#NA",
          GateYear: `${ref?.student_gate_year}` ?? "#NA",
          InstituteDegree: `${ref?.student_degree_institute}` ?? "#NA",
          InstituteDegreeYear: `${ref?.student_degree_year}` ?? "#NA",
          CPIPercentage: `${ref?.student_percentage_cpi}` ?? "#NA",
          StudentProgramme: `${ref?.student_programme}` ?? "#NA",
          StudentBranch: `${ref?.student_branch}` ?? "#NA",
          SingleSeater: `${ref?.student_single_seater_room}` ?? "#NA",
          PhysicallyChallenged: `${ref?.student_ph}` ?? "#NA",
          ProfileCompletion: `${ref?.profile_percentage}` ?? "0",
          // Standard: `${ref?.fee_structure}` ? `${ref?.fee_structure?.class_master?.className}` : `${ref?.hostel_fee_structure}` ? `${ref?.hostel_fee_structure?.class_master?.className}` : "#NA",
          // Batch: `${ref?.fee_structure}` ? `${ref?.fee_structure?.batch_master?.batchName}` : `${ref?.hostel_fee_structure}` ? `${ref?.hostel_fee_structure?.batch_master?.batchName}` : "#NA",
        });
        // result = []
      }
      // console.log(excel_list)
      const data = await json_to_excel_statistics_promote_query(excel_list);

      res.status(200).send({
        message: "Explore Statistics Query",
        access: true,
        data: data,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const remove_duplicated = (arr) => {
  jsonObject = arr.map(JSON.stringify);
  uniqueSet = new Set(jsonObject);
  uniqueArray = Array.from(uniqueSet).map(JSON.parse);
  return uniqueArray;
};

exports.renderStudentFeesStatisticsQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const { module_type } = req?.query;
    const {
      all_depart,
      activity_status,
      batch_status,
      master,
      batch,
      depart,
      bank,
      single_student,
    } = req?.body;
    var finance = await Finance.findById({ _id: fid })
      .populate({
        path: "deposit_linked_head",
        populate: {
          path: "master",
        },
      })
      .populate({
        path: "deposit_hostel_linked_head",
        populate: {
          path: "master",
        },
      });
    var all_fees = await Fees.find({ _id: { $in: finance?.fees } });
    // var all_master = await FeeMaster.find({ _id: { $in: finance?.fees}})
    var fee_price = 0;
    for (var val of all_fees) {
      fee_price += val?.feeAmount;
    }
    var total_fees = 0;
    var total_collect = 0;
    var total_pending = 0;
    var collect_by_student = 0;
    var pending_by_student = 0;
    var collect_by_government = 0;
    var pending_from_government = 0;
    var incomes = 0;
    var expenses = 0;
    var total_deposits = 0;
    var excess_fees = 0;
    var total_fees_arr = [];
    var total_collect_arr = [];
    var total_pending_arr = [];
    var collect_by_student_arr = [];
    var pending_by_student_arr = [];
    var collect_by_government_arr = [];
    var pending_from_government_arr = [];
    var fees_to_be_collected_student_arr = [];
    var fees_to_be_collected_government_arr = [];
    var incomes_arr = [];
    var expenses_arr = [];
    var total_deposits_arr = [];
    var excess_fees_arr = [];
    var internal_fees = 0;
    var internal_os_fees = 0;
    var fees_to_be_collected_student = 0;
    var fees_to_be_collected_government = 0;

    if (module_type === "OVERALL_VIEW") {
      finance.loading_fees = new Date();
      finance.fees_statistics_filter.loading = true;
      await finance.save();
      res.status(200).send({
        message: "Explore Admission View Query",
        access: true,
        excel_list: excel_list,
        loading: finance?.fees_statistics_filter.loading,
      });
      finance.total_fees = 0;
      finance.total_collect = 0;
      finance.total_pending = 0;
      finance.collect_by_student = 0;
      finance.pending_by_student = 0;
      finance.collect_by_government = 0;
      finance.pending_from_government = 0;
      finance.fees_to_be_collected_student = 0;
      finance.fees_to_be_collected_government = 0;
      finance.incomes = 0;
      finance.expenses = 0;
      finance.total_deposits = 0;
      finance.excess_fees = 0;
      finance.internal_fees = 0;
      finance.internal_os_fees = 0;
      finance.total_fees_arr = [];
      finance.total_collect_arr = [];
      finance.total_pending_arr = [];
      finance.collect_by_student_arr = [];
      finance.pending_by_student_arr = [];
      finance.collect_by_government_arr = [];
      finance.pending_from_government_arr = [];
      finance.fees_to_be_collected_student_arr = [];
      finance.fees_to_be_collected_government_arr = [];

      finance.fees_statistics_filter.batch_level = [];
      finance.fees_statistics_filter.batch_all = "";
      finance.fees_statistics_filter.department_level = [];
      finance.fees_statistics_filter.department_all = "";
      finance.fees_statistics_filter.bank_level = [];
      finance.fees_statistics_filter.master_level = "";
      await finance.save();
      finance.incomes +=
        finance?.financeIncomeCashBalance + finance?.financeIncomeBankBalance;
      finance.expenses +=
        finance?.financeExpenseCashBalance + finance?.financeExpenseBankBalance;
      finance.total_deposits +=
        finance?.deposit_linked_head?.master?.deposit_amount +
        finance?.deposit_hostel_linked_head?.master?.deposit_amount;
      finance.excess_fees +=
        finance?.deposit_linked_head?.master?.refund_amount +
        finance?.deposit_hostel_linked_head?.master?.refund_amount;
      finance.internal_fees += fee_price;
      if (all_depart === "ALL") {
        finance.fees_statistics_filter.department_all = "ALL";
        var departs = await Department.find({
          institute: finance?.institute,
        }).select("dName batches departmentClassMasters");
        for (var i = 0; i < departs?.length; i++) {
          for (var j = 0; j < departs[i]?.batches?.length; j++) {
            const one_batch = await Batch.findById({
              _id: departs[i]?.batches[j],
            });
            var classes = await Class.find({ batch: one_batch?._id }).select(
              "className classTitle masterClassName"
            );
            for (var cls of classes) {
              var all_student = await Student.find({ studentClass: cls?._id });
              for (var ref of all_student) {
                var all_remain = await RemainingList.find({ student: ref?._id })
                  .populate({
                    path: "fee_structure",
                  })
                  .populate({
                    path: "student",
                    select:
                      "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO",
                  });
                for (var ele of all_remain) {
                  finance.total_fees +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount;
                  finance.total_collect +=
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.total_pending +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount -
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.collect_by_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) + ref?.studentPaidFeeCount;
                  finance.pending_by_student +=
                    ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0 + ref?.studentRemainingFeeCount;
                  finance.collect_by_government += ele?.paid_by_government;
                  finance.pending_from_government +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.fees_to_be_collected_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) +
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) +
                    ref?.studentPaidFeeCount +
                    ref?.studentRemainingFeeCount;
                  finance.fees_to_be_collected_government +=
                    ele?.paid_by_government +
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.internal_os_fees += ref?.studentRemainingFeeCount;
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount >
                    0
                  ) {
                    total_fees_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_collect_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount -
                      ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_pending_arr.push(ele?.student);
                  }
                  if (ele?.fee_structure?.applicable_fees > 0) {
                    collect_by_student_arr.push(ele?.student);
                  }
                  if (
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    pending_by_student_arr.push(ele?.student);
                  }
                  if (ele?.paid_by_government > 0) {
                    collect_by_government_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    pending_from_government_arr.push(ele?.student);
                  }
                  if (
                    (ele?.fee_structure?.applicable_fees + ele?.paid_fee <=
                    ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    fees_to_be_collected_student_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_by_government +
                      ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    fees_to_be_collected_government_arr.push(ele?.student);
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr);
                finance.total_collect_arr =
                  remove_duplicated(total_collect_arr);
                finance.total_pending_arr =
                  remove_duplicated(total_pending_arr);
                finance.collect_by_student_arr = remove_duplicated(
                  collect_by_student_arr
                );
                finance.pending_by_student_arr = remove_duplicated(
                  pending_by_student_arr
                );
                finance.collect_by_government_arr = remove_duplicated(
                  collect_by_government_arr
                );
                finance.pending_from_government_arr = remove_duplicated(
                  pending_from_government_arr
                );
                finance.fees_to_be_collected_student_arr = remove_duplicated(
                  fees_to_be_collected_student_arr
                );
                finance.fees_to_be_collected_government_arr = remove_duplicated(
                  fees_to_be_collected_government_arr
                );
              }
            }
          }
        }
        await finance.save();
      }
      if (activity_status === "ACTIVE_BATCH") {
        finance.fees_statistics_filter.batch_all = "Active Batch";
        var departs = await Department.find({
          institute: finance?.institute,
        }).select("dName batches departmentClassMasters departmentSelectBatch");
        for (var i = 0; i < departs?.length; i++) {
          if (departs[i]?.departmentSelectBatch) {
            const one_batch = await Batch.findById({
              _id: departs[i]?.departmentSelectBatch,
            });
            var classes = await Class.find({ batch: one_batch?._id }).select(
              "className classTitle masterClassName"
            );
            for (var cls of classes) {
              var all_student = await Student.find({ studentClass: cls?._id });
              for (var ref of all_student) {
                var all_remain = await RemainingList.find({ student: ref?._id })
                  .populate({
                    path: "fee_structure",
                  })
                  .populate({
                    path: "student",
                    select:
                      "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO",
                  });
                for (var ele of all_remain) {
                  finance.total_fees +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount;
                  finance.total_collect +=
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.total_pending +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount -
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.collect_by_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) + ref?.studentPaidFeeCount;
                  finance.pending_by_student +=
                    ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0 + ref?.studentRemainingFeeCount;
                  finance.collect_by_government += ele?.paid_by_government;
                  finance.pending_from_government +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.fees_to_be_collected_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) +
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) +
                    ref?.studentPaidFeeCount +
                    ref?.studentRemainingFeeCount;
                  finance.fees_to_be_collected_government +=
                    ele?.paid_by_government +
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.internal_os_fees += ref?.studentRemainingFeeCount;
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount >
                    0
                  ) {
                    total_fees_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_collect_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount -
                      ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_pending_arr.push(ele?.student);
                  }
                  if (ele?.fee_structure?.applicable_fees > 0) {
                    collect_by_student_arr.push(ele?.student);
                  }
                  if (
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    pending_by_student_arr.push(ele?.student);
                  }
                  if (ele?.paid_by_government > 0) {
                    collect_by_government_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    pending_from_government_arr.push(ele?.student);
                  }
                  if (
                    (ele?.fee_structure?.applicable_fees + ele?.paid_fee <=
                    ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    fees_to_be_collected_student_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_by_government +
                      ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    fees_to_be_collected_government_arr.push(ele?.student);
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr);
                finance.total_collect_arr =
                  remove_duplicated(total_collect_arr);
                finance.total_pending_arr =
                  remove_duplicated(total_pending_arr);
                finance.collect_by_student_arr = remove_duplicated(
                  collect_by_student_arr
                );
                finance.pending_by_student_arr = remove_duplicated(
                  pending_by_student_arr
                );
                finance.collect_by_government_arr = remove_duplicated(
                  collect_by_government_arr
                );
                finance.pending_from_government_arr = remove_duplicated(
                  pending_from_government_arr
                );
                finance.fees_to_be_collected_student_arr = remove_duplicated(
                  fees_to_be_collected_student_arr
                );
                finance.fees_to_be_collected_government_arr = remove_duplicated(
                  fees_to_be_collected_government_arr
                );
              }
            }
          }
        }
        await finance.save();
      }
      if (activity_status === "ALL_BATCH") {
        finance.fees_statistics_filter.department_all = "All Batch";
        var departs = await Department.find({
          institute: finance?.institute,
        }).select("dName batches departmentClassMasters");
        for (var i = 0; i < departs?.length; i++) {
          for (var j = 0; j < departs[i]?.batches?.length; j++) {
            const one_batch = await Batch.findById({
              _id: departs[i]?.batches[j],
            });
            var classes = await Class.find({ batch: one_batch?._id }).select(
              "className classTitle masterClassName"
            );
            for (var cls of classes) {
              var all_student = await Student.find({ studentClass: cls?._id });
              for (var ref of all_student) {
                var all_remain = await RemainingList.find({ student: ref?._id })
                  .populate({
                    path: "fee_structure",
                  })
                  .populate({
                    path: "student",
                    select:
                      "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO",
                  });
                for (var ele of all_remain) {
                  finance.total_fees +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount;
                  finance.total_collect +=
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.total_pending +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount -
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.collect_by_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) + ref?.studentPaidFeeCount;
                  finance.pending_by_student +=
                    ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0 + ref?.studentRemainingFeeCount;
                  finance.collect_by_government += ele?.paid_by_government;
                  finance.pending_from_government +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.fees_to_be_collected_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) +
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) +
                    ref?.studentPaidFeeCount +
                    ref?.studentRemainingFeeCount;
                  finance.fees_to_be_collected_government +=
                    ele?.paid_by_government +
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.internal_os_fees += ref?.studentRemainingFeeCount;
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount >
                    0
                  ) {
                    total_fees_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_collect_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount -
                      ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_pending_arr.push(ele?.student);
                  }
                  if (ele?.fee_structure?.applicable_fees > 0) {
                    collect_by_student_arr.push(ele?.student);
                  }
                  if (
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    pending_by_student_arr.push(ele?.student);
                  }
                  if (ele?.paid_by_government > 0) {
                    collect_by_government_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    pending_from_government_arr.push(ele?.student);
                  }
                  if (
                    (ele?.fee_structure?.applicable_fees + ele?.paid_fee <=
                    ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    fees_to_be_collected_student_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_by_government +
                      ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    fees_to_be_collected_government_arr.push(ele?.student);
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr);
                finance.total_collect_arr =
                  remove_duplicated(total_collect_arr);
                finance.total_pending_arr =
                  remove_duplicated(total_pending_arr);
                finance.collect_by_student_arr = remove_duplicated(
                  collect_by_student_arr
                );
                finance.pending_by_student_arr = remove_duplicated(
                  pending_by_student_arr
                );
                finance.collect_by_government_arr = remove_duplicated(
                  collect_by_government_arr
                );
                finance.pending_from_government_arr = remove_duplicated(
                  pending_from_government_arr
                );
                finance.fees_to_be_collected_student_arr = remove_duplicated(
                  fees_to_be_collected_student_arr
                );
                finance.fees_to_be_collected_government_arr = remove_duplicated(
                  fees_to_be_collected_government_arr
                );
              }
            }
          }
        }
        await finance.save();
      }
      if (all_depart === "PARTICULAR") {
        finance.fees_statistics_filter.department_level.push(depart);
        finance.fees_statistics_filter.batch_all = "All Batch";
        var departs = await Department.findById({ _id: depart }).select(
          "dName batches departmentClassMasters"
        );
        if (batch_status === "ALL_BATCH") {
          const one_batch = await Batch.findById({ department: departs?._id });
          for (var ref of one_batch) {
            var classes = await Class.find({ batch: ref }).select(
              "className classTitle masterClassName"
            );
            for (var cls of classes) {
              var all_student = await Student.find({ studentClass: cls?._id });
              for (var ref of all_student) {
                var all_remain = await RemainingList.find({ student: ref?._id })
                  .populate({
                    path: "fee_structure",
                  })
                  .populate({
                    path: "student",
                    select:
                      "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO",
                  });
                for (var ele of all_remain) {
                  finance.total_fees +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount;
                  finance.total_collect +=
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.total_pending +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount -
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.collect_by_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) + ref?.studentPaidFeeCount;
                  finance.pending_by_student +=
                    ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0 + ref?.studentRemainingFeeCount;
                  finance.collect_by_government += ele?.paid_by_government;
                  finance.pending_from_government +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.fees_to_be_collected_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) +
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) +
                    ref?.studentPaidFeeCount +
                    ref?.studentRemainingFeeCount;
                  finance.fees_to_be_collected_government +=
                    ele?.paid_by_government +
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.internal_os_fees += ref?.studentRemainingFeeCount;
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount >
                    0
                  ) {
                    total_fees_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_collect_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount -
                      ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_pending_arr.push(ele?.student);
                  }
                  if (ele?.fee_structure?.applicable_fees > 0) {
                    collect_by_student_arr.push(ele?.student);
                  }
                  if (
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    pending_by_student_arr.push(ele?.student);
                  }
                  if (ele?.paid_by_government > 0) {
                    collect_by_government_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    pending_from_government_arr.push(ele?.student);
                  }
                  if (
                    (ele?.fee_structure?.applicable_fees + ele?.paid_fee <=
                    ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    fees_to_be_collected_student_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_by_government +
                      ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    fees_to_be_collected_government_arr.push(ele?.student);
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr);
                finance.total_collect_arr =
                  remove_duplicated(total_collect_arr);
                finance.total_pending_arr =
                  remove_duplicated(total_pending_arr);
                finance.collect_by_student_arr = remove_duplicated(
                  collect_by_student_arr
                );
                finance.pending_by_student_arr = remove_duplicated(
                  pending_by_student_arr
                );
                finance.collect_by_government_arr = remove_duplicated(
                  collect_by_government_arr
                );
                finance.pending_from_government_arr = remove_duplicated(
                  pending_from_government_arr
                );
                finance.fees_to_be_collected_student_arr = remove_duplicated(
                  fees_to_be_collected_student_arr
                );
                finance.fees_to_be_collected_government_arr = remove_duplicated(
                  fees_to_be_collected_government_arr
                );
              }
            }
          }
        } else if (batch_status === "PARTICULAR_BATCH") {
          finance.fees_statistics_filter.batch_level.push(batch);
          const one_batch = await Batch.findById({ _id: batch });
          var classes = await Class.find({ batch: one_batch?._id }).select(
            "className classTitle masterClassName"
          );
          for (var cls of classes) {
            var all_student = await Student.find({ studentClass: cls?._id });
            for (var ref of all_student) {
              var all_remain = await RemainingList.find({ student: ref?._id })
                .populate({
                  path: "fee_structure",
                })
                .populate({
                  path: "student",
                  select:
                    "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO",
                });
              for (var ele of all_remain) {
                finance.total_fees +=
                  ele?.fee_structure?.total_admission_fees +
                  ref?.studentRemainingFeeCount;
                finance.total_collect +=
                  ele?.paid_fee +
                  ref?.studentPaidFeeCount +
                  ele?.paid_by_government;
                finance.total_pending +=
                  ele?.fee_structure?.total_admission_fees +
                  ref?.studentRemainingFeeCount -
                  ele?.paid_fee +
                  ref?.studentPaidFeeCount +
                  ele?.paid_by_government;
                finance.collect_by_student +=
                  (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                    ? ele?.fee_structure?.applicable_fees
                    : ele?.paid_fee) + ref?.studentPaidFeeCount;
                finance.pending_by_student +=
                  ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                    ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                    : 0 + ref?.studentRemainingFeeCount;
                finance.collect_by_government += ele?.paid_by_government;
                finance.pending_from_government +=
                  ele?.fee_structure?.total_admission_fees -
                  ele?.fee_structure?.applicable_fees;
                finance.fees_to_be_collected_student +=
                  (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                    ? ele?.fee_structure?.applicable_fees
                    : ele?.paid_fee) +
                  (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                    ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                    : 0) +
                  ref?.studentPaidFeeCount +
                  ref?.studentRemainingFeeCount;
                finance.fees_to_be_collected_government +=
                  ele?.paid_by_government +
                  ele?.fee_structure?.total_admission_fees -
                  ele?.fee_structure?.applicable_fees;
                finance.internal_os_fees += ref?.studentRemainingFeeCount;
                if (
                  ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount >
                  0
                ) {
                  total_fees_arr.push(ele?.student);
                }
                if (
                  ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government >
                  0
                ) {
                  total_collect_arr.push(ele?.student);
                }
                if (
                  ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount -
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government >
                  0
                ) {
                  total_pending_arr.push(ele?.student);
                }
                if (ele?.fee_structure?.applicable_fees > 0) {
                  collect_by_student_arr.push(ele?.student);
                }
                if (
                  (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                    ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                    : 0) > 0
                ) {
                  pending_by_student_arr.push(ele?.student);
                }
                if (ele?.paid_by_government > 0) {
                  collect_by_government_arr.push(ele?.student);
                }
                if (
                  ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees >
                  0
                ) {
                  pending_from_government_arr.push(ele?.student);
                }
                if (
                  (ele?.fee_structure?.applicable_fees + ele?.paid_fee <=
                  ele?.fee_structure?.applicable_fees
                    ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                    : 0) > 0
                ) {
                  fees_to_be_collected_student_arr.push(ele?.student);
                }
                if (
                  ele?.paid_by_government +
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees >
                  0
                ) {
                  fees_to_be_collected_government_arr.push(ele?.student);
                }
              }
              finance.total_fees_arr = remove_duplicated(total_fees_arr);
              finance.total_collect_arr = remove_duplicated(total_collect_arr);
              finance.total_pending_arr = remove_duplicated(total_pending_arr);
              finance.collect_by_student_arr = remove_duplicated(
                collect_by_student_arr
              );
              finance.pending_by_student_arr = remove_duplicated(
                pending_by_student_arr
              );
              finance.collect_by_government_arr = remove_duplicated(
                collect_by_government_arr
              );
              finance.pending_from_government_arr = remove_duplicated(
                pending_from_government_arr
              );
              finance.fees_to_be_collected_student_arr = remove_duplicated(
                fees_to_be_collected_student_arr
              );
              finance.fees_to_be_collected_government_arr = remove_duplicated(
                fees_to_be_collected_government_arr
              );
            }
          }
        }
        await finance.save();
      }
      if (bank) {
        finance.fees_statistics_filter.bank_level.push(bank);
        var departs = await Department.find({ bank_account: bank }).select(
          "dName batches departmentClassMasters"
        );
        for (var i = 0; i < departs?.length; i++) {
          for (var j = 0; j < departs[i]?.batches?.length; j++) {
            const one_batch = await Batch.findById({
              _id: departs[i]?.batches[j],
            });
            var classes = await Class.find({ batch: one_batch?._id }).select(
              "className classTitle masterClassName"
            );
            for (var cls of classes) {
              var all_student = await Student.find({ studentClass: cls?._id });
              for (var ref of all_student) {
                var all_remain = await RemainingList.find({ student: ref?._id })
                  .populate({
                    path: "fee_structure",
                  })
                  .populate({
                    path: "student",
                    select:
                      "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO",
                  });
                for (var ele of all_remain) {
                  finance.total_fees +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount;
                  finance.total_collect +=
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.total_pending +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount -
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  finance.collect_by_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) + ref?.studentPaidFeeCount;
                  finance.pending_by_student +=
                    ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0 + ref?.studentRemainingFeeCount;
                  finance.collect_by_government += ele?.paid_by_government;
                  finance.pending_from_government +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.fees_to_be_collected_student +=
                    (ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee) +
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) +
                    ref?.studentPaidFeeCount +
                    ref?.studentRemainingFeeCount;
                  finance.fees_to_be_collected_government +=
                    ele?.paid_by_government +
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  finance.internal_os_fees += ref?.studentRemainingFeeCount;
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount >
                    0
                  ) {
                    total_fees_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_collect_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount -
                      ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_pending_arr.push(ele?.student);
                  }
                  if (ele?.fee_structure?.applicable_fees > 0) {
                    collect_by_student_arr.push(ele?.student);
                  }
                  if (
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    pending_by_student_arr.push(ele?.student);
                  }
                  if (ele?.paid_by_government > 0) {
                    collect_by_government_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    pending_from_government_arr.push(ele?.student);
                  }
                  if (
                    (ele?.fee_structure?.applicable_fees + ele?.paid_fee <=
                    ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    fees_to_be_collected_student_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_by_government +
                      ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    fees_to_be_collected_government_arr.push(ele?.student);
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr);
                finance.total_collect_arr =
                  remove_duplicated(total_collect_arr);
                finance.total_pending_arr =
                  remove_duplicated(total_pending_arr);
                finance.collect_by_student_arr = remove_duplicated(
                  collect_by_student_arr
                );
                finance.pending_by_student_arr = remove_duplicated(
                  pending_by_student_arr
                );
                finance.collect_by_government_arr = remove_duplicated(
                  collect_by_government_arr
                );
                finance.pending_from_government_arr = remove_duplicated(
                  pending_from_government_arr
                );
                finance.fees_to_be_collected_student_arr = remove_duplicated(
                  fees_to_be_collected_student_arr
                );
                finance.fees_to_be_collected_government_arr = remove_duplicated(
                  fees_to_be_collected_government_arr
                );
              }
            }
          }
        }
        await finance.save();
      }
      finance.fees_statistics_filter.loading = false;
      await finance.save();
    } else if (module_type === "ADMISSION_VIEW") {
      var total_fees = 0;
      var total_collect = 0;
      var total_pending = 0;
      var collect_by_student = 0;
      var pending_by_student = 0;
      var collect_by_government = 0;
      var pending_from_government = 0;
      var total_fees_arr = [];
      var total_collect_arr = [];
      var total_pending_arr = [];
      var collect_by_student_arr = [];
      var pending_by_student_arr = [];
      var collect_by_government_arr = [];
      var pending_from_government_arr = [];
      var excess_fee = 0;
      var excess_fee_arr = [];
      var exempted_fee = 0;
      var exempted_fee_arr = [];
      var excel_list = [];
      finance.admission_fees_statistics_filter.batch_level = [];
      finance.admission_fees_statistics_filter.batch_all = "";
      finance.admission_fees_statistics_filter.department_level = [];
      finance.admission_fees_statistics_filter.department_all = "";
      finance.admission_fees_statistics_filter.bank_level = [];
      finance.admission_fees_statistics_filter.master_level = "";
      await finance.save();
      if (all_depart === "ALL") {
        finance.loading_admission_fees = new Date();
        finance.admission_fees_statistics_filter.loading = true;
        await finance.save();
        var new_departs = [];
        res.status(200).send({
          message: "Explore Admission View All Query",
          access: true,
          loading: true,
        });
        var departs = await Department.find({
          institute: finance?.institute,
        }).select("dName batches departmentClassMasters");
        const buildStructureObject = async (departs) => {
          var obj = {};
          for (let i = 0; i < departs.length; i++) {
            const { dp, dName } = departs[i];
            obj[dp] = dName;
          }
          return obj;
        };
        const buildStructureObject_1 = async (departs) => {
          var obj = {};
          for (let i = 0; i < departs.length; i++) {
            const { dp, dName, batch_query, master_query, nest_classes } =
              departs[i];
            // var nest_obj = Object.assign({}, [...nest_classes])
            obj[dp] = {
              dName: dName,
              batches: batch_query,
              masters: master_query,
              nest_classes,
              // batches: batch_query?.map((val, index) => {
              //   const { bp, batchName, dp } = val;
              //   nest_obj[bp] = batchName
              //   nest_obj[dp] = dp
              //   nest_obj = {}
              //   return nest_obj
              // })
            };
          }
          return obj;
        };
        var nest_classes = [];
        for (var i = 0; i < departs?.length; i++) {
          var batch_query = [];
          for (var j = 0; j < departs[i]?.batches?.length; j++) {
            var obs = {};
            const one_batch = await Batch.findById({
              _id: departs[i]?.batches[j],
            });
            if (one_batch?._id) {
              batch_query.push({
                batchName: one_batch?.batchName,
                _id: one_batch?._id,
              });
            }
            var classes = await Class.find({ batch: one_batch?._id }).select(
              "className classTitle masterClassName"
            );
            var custom_classes = [];
            for (var cls of classes) {
              var all_student = await Student.find({ studentClass: cls?._id });
              for (var ref of all_student) {
                var all_remain = await RemainingList.find({ student: ref?._id })
                  .populate({
                    path: "fee_structure",
                  })
                  .populate({
                    path: "student",
                    select:
                      "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO total_paid_fees total_os_fees applicable_os_fees government_os_fees",
                  });
                for (var ele of all_remain) {
                  total_fees +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount;
                  total_collect +=
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  total_pending +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount -
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  collect_by_student += ele?.fee_structure?.applicable_fees;
                  pending_by_student +=
                    ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0;
                  collect_by_government += ele?.paid_by_government;
                  pending_from_government +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  ele.student.total_paid_fees += ele?.paid_fee;
                  ele.student.total_os_fees += ele?.remaining_fee;
                  ele.student.applicable_os_fees +=
                    ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0;
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount >
                    0
                  ) {
                    total_fees_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_collect_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount -
                      ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_pending_arr.push(ele?.student);
                  }
                  if (ele?.fee_structure?.applicable_fees > 0) {
                    collect_by_student_arr.push(ele?.student);
                  }
                  if (
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    pending_by_student_arr.push(ele?.student);
                  }
                  if (ele?.paid_by_government > 0) {
                    collect_by_government_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    pending_from_government_arr.push(ele?.student);
                  }
                }
                total_fees_arr = remove_duplicated(total_fees_arr);
                total_collect_arr = remove_duplicated(total_collect_arr);
                total_pending_arr = remove_duplicated(total_pending_arr);
                collect_by_student_arr = remove_duplicated(
                  collect_by_student_arr
                );
                pending_by_student_arr = remove_duplicated(
                  pending_by_student_arr
                );
                collect_by_government_arr = remove_duplicated(
                  collect_by_government_arr
                );
                pending_from_government_arr = remove_duplicated(
                  pending_from_government_arr
                );
              }
              custom_classes.push({
                className: `${cls?.className}-${cls?.classTitle}`,
                _id: cls?._id,
                total_fees: total_fees,
                total_collect: total_collect,
                total_pending: total_pending,
                collect_by_student: collect_by_student,
                pending_by_student: pending_by_student,
                collect_by_government: collect_by_government,
                pending_from_government: pending_from_government,
                classMaster: cls?.masterClassName,
                total_fees_arr: total_fees_arr,
                total_collect_arr: total_collect_arr,
                total_pending_arr: total_pending_arr,
                collect_by_student_arr: collect_by_student_arr,
                pending_by_student_arr: pending_by_student_arr,
                collect_by_government_arr: collect_by_government_arr,
                pending_from_government_arr: pending_from_government_arr,
              });
            }
            obs[one_batch?._id] = {
              classes: custom_classes,
            };
            nest_classes.push({ ...obs });
          }
          var master_query = [];
          for (var j = 0; j < departs[i]?.departmentClassMasters?.length; j++) {
            const one_master = await ClassMaster.findById({
              _id: departs[i]?.departmentClassMasters[j],
            });
            if (one_master?._id) {
              master_query.push({
                masterName: one_master?.className,
                _id: one_master?._id,
              });
            }
          }
          new_departs.push({
            dName: departs[i]?.dName,
            dp: `dp${i + 1}`,
            batch_query: [...batch_query],
            master_query: [...master_query],
            nest_classes: [...nest_classes],
          });
        }
        // console.log(nest_classes)
        var result = await buildStructureObject(new_departs);
        var new_dep_excel = [{ ...result }];
        var result_1 = await buildStructureObject_1(new_departs);
        excel_list.push({
          depart_row: true,
          batch_row: true,
          master_row: true,
          class_row: true,
          departs: new_dep_excel,
          ...result_1,
        });
        finance.admission_fees_statistics_filter.department_all = "All";
        finance.admission_stats = excel_list;
        await finance.save();
      }
      if (all_depart === "PARTICULAR") {
        finance.loading_admission_fees = new Date();
        finance.admission_fees_statistics_filter.loading = true;
        await finance.save();
        var new_departs = [];
        res.status(200).send({
          message: "Explore Admission View Particular Batch Query",
          access: true,
          loading: true,
        });
        var departs = await Department.find({
          institute: finance?.institute,
        }).select("dName batches departmentClassMasters");

        departs = departs?.filter((val) => {
          if (`${val?._id}` === `${depart}`) return val;
        });
        const buildStructureObject = async (departs) => {
          var obj = {};
          for (let i = 0; i < departs.length; i++) {
            const { dp, dName } = departs[i];
            obj[dp] = dName;
          }
          return obj;
        };
        const buildStructureObject_1 = async (departs) => {
          var obj = {};
          for (let i = 0; i < departs.length; i++) {
            const { dp, dName, batch_query, master_query, nest_classes } =
              departs[i];
            // var nest_obj = Object.assign({}, [...nest_classes])
            obj[dp] = {
              dName: dName,
              batches: batch_query,
              masters: master_query,
              nest_classes,
              // batches: batch_query?.map((val, index) => {
              //   const { bp, batchName, dp } = val;
              //   nest_obj[bp] = batchName
              //   nest_obj[dp] = dp
              //   nest_obj = {}
              //   return nest_obj
              // })
            };
          }
          return obj;
        };
        var nest_classes = [];
        for (var i = 0; i < departs?.length; i++) {
          var batch_query = [];
          var obs = {};
          const one_batch = await Batch.findById({ _id: batch });
          if (one_batch?._id) {
            batch_query.push({
              batchName: one_batch?.batchName,
              _id: one_batch?._id,
            });
            var classes = await Class.find({ batch: one_batch?._id }).select(
              "className classTitle masterClassName ApproveStudent"
            );
            var custom_classes = [];
            for (var cls of classes) {
              var all_student = await Student.find({
                $and: [{ _id: { $in: cls?.ApproveStudent } }],
              });
              var structure = await FeeStructure.find({
                $and: [{ department: depart }, { batch_master: batch }],
              });
              // var all_app = await NewApplication.find({})
              // console.log(all_app?.length)
              // if(all_app?.length <= 0){
              //   for(var ref of all_student){
              //     var all_remain = await RemainingList.find({  $and: [{ student: ref?._id}, { batchId: batch}]})
              //     .populate({
              //       path: "fee_structure"
              //     })
              //     .populate({
              //       path: "student",
              //       select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO total_paid_fees total_os_fees applicable_os_fees government_os_fees"
              //     })
              //     // var all_remain = await RemainingList.find({ student: ref?._id })
              //     // console.log(all_remain?.length)
              //     for(var ele of all_remain){
              //       total_fees += ele?.fee_structure?.total_admission_fees
              //     total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
              //     total_pending += ele?.fee_structure?.total_admission_fees - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
              //     collect_by_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee)
              //     pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0
              //     collect_by_government += ele?.paid_by_government
              //     pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
              //       ele.student.total_paid_fees += ele?.paid_fee
              //     ele.student.total_os_fees += ele?.remaining_fee
              //     ele.student.applicable_os_fees += ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
              //     ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
              //     : 0
              //     ele.student.government_os_fees += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
              //     if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
              //       total_fees_arr.push(ele?.student)
              //     }
              //     if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
              //       total_collect_arr.push(ele?.student)
              //     }
              //     if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
              //       total_pending_arr.push(ele?.student)
              //     }
              //     if(ele?.fee_structure?.applicable_fees > 0){
              //       collect_by_student_arr.push(ele?.student)
              //     }
              //     if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
              //       pending_by_student_arr.push(ele?.student)
              //     }
              //     if(ele?.paid_by_government > 0){
              //       collect_by_government_arr.push(ele?.student)
              //     }
              //     if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
              //       pending_from_government_arr.push(ele?.student)
              //     }
              //     }
              //     total_fees_arr = remove_duplicated(total_fees_arr)
              //     total_collect_arr = remove_duplicated(total_collect_arr)
              //     total_pending_arr = remove_duplicated(total_pending_arr)
              //     collect_by_student_arr = remove_duplicated(collect_by_student_arr)
              //     pending_by_student_arr = remove_duplicated(pending_by_student_arr)
              //     collect_by_government_arr = remove_duplicated(collect_by_government_arr)
              //     pending_from_government_arr = remove_duplicated(pending_from_government_arr)
              //   }
              // }
              // else{
              for (var ref of all_student) {
                var all_remain = await RemainingList.find({
                  $and: [
                    { student: ref?._id },
                    { fee_structure: { $in: structure } },
                  ],
                })
                  .populate({
                    path: "fee_structure",
                  })
                  .populate({
                    path: "student",
                    select:
                      "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO total_paid_fees total_os_fees applicable_os_fees government_os_fees",
                  });
                // var all_remain = await RemainingList.find({ student: ref?._id })
                console.log(all_remain?.length);
                for (var ele of all_remain) {
                  total_fees += ele?.fee_structure?.total_admission_fees;
                  total_collect +=
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  total_pending +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  collect_by_student +=
                    ele?.paid_fee >= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees
                      : ele?.paid_fee;
                  pending_by_student +=
                    ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0;
                  collect_by_government += ele?.paid_by_government;
                  pending_from_government +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  ele.student.total_paid_fees += ele?.paid_fee;
                  ele.student.total_os_fees += ele?.remaining_fee;
                  ele.student.applicable_os_fees +=
                    ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0;
                  ele.student.government_os_fees +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  excess_fee +=
                    ele?.paid_fee > ele?.fee_structure?.applicable_fees
                      ? ele?.paid_fee - ele?.fee_structure?.applicable_fees
                      : 0;
                  exempted_fee += ele?.exempted_fee;
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount >
                    0
                  ) {
                    total_fees_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_collect_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount -
                      ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_pending_arr.push(ele?.student);
                  }
                  if (ele?.fee_structure?.applicable_fees > 0) {
                    collect_by_student_arr.push(ele?.student);
                  }
                  if (
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    pending_by_student_arr.push(ele?.student);
                  }
                  if (ele?.paid_by_government > 0) {
                    collect_by_government_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    pending_from_government_arr.push(ele?.student);
                  }
                  if (
                    (ele?.paid_fee > ele?.fee_structure?.applicable_fees
                      ? ele?.paid_fee - ele?.fee_structure?.applicable_fees
                      : 0) >= 0
                  ) {
                    excess_fee_arr.push(ele?.student);
                  }
                  if (ele?.exempted_fee) {
                    exempted_fee_arr.push(ele?.student);
                  }
                }
                total_fees_arr = remove_duplicated(total_fees_arr);
                total_collect_arr = remove_duplicated(total_collect_arr);
                total_pending_arr = remove_duplicated(total_pending_arr);
                collect_by_student_arr = remove_duplicated(
                  collect_by_student_arr
                );
                pending_by_student_arr = remove_duplicated(
                  pending_by_student_arr
                );
                collect_by_government_arr = remove_duplicated(
                  collect_by_government_arr
                );
                pending_from_government_arr = remove_duplicated(
                  pending_from_government_arr
                );
                excess_fee_arr = remove_duplicated(excess_fee_arr);
                exempted_fee_arr = remove_duplicated(exempted_fee_arr);
              }
              // }
              custom_classes.push({
                className: `${cls?.className}-${cls?.classTitle}`,
                _id: cls?._id,
                total_fees: total_fees,
                total_collect: total_collect,
                total_pending: total_pending,
                collect_by_student: collect_by_student,
                pending_by_student: pending_by_student,
                collect_by_government: collect_by_government,
                pending_from_government: pending_from_government,
                classMaster: cls?.masterClassName,
                total_fees_arr: total_fees_arr,
                total_collect_arr: total_collect_arr,
                total_pending_arr: total_pending_arr,
                collect_by_student_arr: collect_by_student_arr,
                pending_by_student_arr: pending_by_student_arr,
                collect_by_government_arr: collect_by_government_arr,
                pending_from_government_arr: pending_from_government_arr,
                excess_fee_arr: excess_fee_arr,
                exempted_fee_arr: exempted_fee_arr,
                excess_fee: excess_fee,
                exempted_fee: exempted_fee,
              });
              console.log("Enter");
              total_fees = 0;
              total_collect = 0;
              total_pending = 0;
              collect_by_student = 0;
              pending_by_student = 0;
              collect_by_government = 0;
              pending_from_government = 0;
              excess_fee = 0;
              exempted_fee = 0;
              total_fees_arr = [];
              total_collect_arr = [];
              total_pending_arr = [];
              collect_by_student_arr = [];
              pending_by_student_arr = [];
              collect_by_government_arr = [];
              pending_from_government_arr = [];
              excess_fee_arr = [];
              exempted_fee_arr = [];
              console.log("Exit");
            }
            obs[one_batch?._id] = {
              classes: custom_classes,
            };
            nest_classes.push({ ...obs });
          }
          var master_query = [];
          for (var j = 0; j < departs[i]?.departmentClassMasters?.length; j++) {
            const one_master = await ClassMaster.findById({
              _id: departs[i]?.departmentClassMasters[j],
            });
            if (one_master?._id) {
              master_query.push({
                masterName: one_master?.className,
                _id: one_master?._id,
              });
            }
          }
          new_departs.push({
            dName: departs[i]?.dName,
            dp: `dp${i + 1}`,
            batch_query: [...batch_query],
            master_query: [...master_query],
            nest_classes: [...nest_classes],
          });
        }
        // console.log(nest_classes)
        var result = await buildStructureObject(new_departs);
        var new_dep_excel = [{ ...result }];
        var result_1 = await buildStructureObject_1(new_departs);
        excel_list.push({
          depart_row: true,
          batch_row: true,
          master_row: true,
          class_row: true,
          departs: new_dep_excel,
          ...result_1,
        });
        finance.admission_fees_statistics_filter.department_level.push(depart);
        finance.admission_fees_statistics_filter.batch_level.push(batch);
        // finance.admission_fees_statistics_filter.master_level.push()
        finance.admission_stats = excel_list;
        await finance.save();
      }
      if (bank) {
        finance.admission_fees_statistics_filter.bank_level.push(bank);
        finance.loading_admission_fees = new Date();
        finance.admission_fees_statistics_filter.loading = true;
        await finance.save();
        var new_departs = [];
        res.status(200).send({
          message: "Explore Admission View Bank Query",
          access: true,
          loading: true,
        });
        var departs = await Department.find({ bank_account: bank });
        var departs = await Department.find({
          institute: finance?.institute,
        }).select("dName batches departmentClassMasters");
        const buildStructureObject = async (departs) => {
          var obj = {};
          for (let i = 0; i < departs.length; i++) {
            const { dp, dName } = departs[i];
            obj[dp] = dName;
          }
          return obj;
        };
        const buildStructureObject_1 = async (departs) => {
          var obj = {};
          for (let i = 0; i < departs.length; i++) {
            const { dp, dName, batch_query, master_query, nest_classes } =
              departs[i];
            // var nest_obj = Object.assign({}, [...nest_classes])
            obj[dp] = {
              dName: dName,
              batches: batch_query,
              masters: master_query,
              nest_classes,
              // batches: batch_query?.map((val, index) => {
              //   const { bp, batchName, dp } = val;
              //   nest_obj[bp] = batchName
              //   nest_obj[dp] = dp
              //   nest_obj = {}
              //   return nest_obj
              // })
            };
          }
          return obj;
        };
        var nest_classes = [];
        for (var i = 0; i < departs?.length; i++) {
          var batch_query = [];
          for (var j = 0; j < departs[i]?.batches?.length; j++) {
            var obs = {};
            const one_batch = await Batch.findById({
              _id: departs[i]?.batches[j],
            });
            if (one_batch?._id) {
              batch_query.push({
                batchName: one_batch?.batchName,
                _id: one_batch?._id,
              });
            }
            var classes = await Class.find({ batch: one_batch?._id }).select(
              "className classTitle masterClassName"
            );
            var custom_classes = [];
            for (var cls of classes) {
              var all_student = await Student.find({ studentClass: cls?._id });
              for (var ref of all_student) {
                var all_remain = await RemainingList.find({ student: ref?._id })
                  .populate({
                    path: "fee_structure",
                  })
                  .populate({
                    path: "student",
                    select:
                      "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO total_paid_fees total_os_fees applicable_os_fees government_os_fees",
                  });
                for (var ele of all_remain) {
                  total_fees +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount;
                  total_collect +=
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  total_pending +=
                    ele?.fee_structure?.total_admission_fees +
                    ref?.studentRemainingFeeCount -
                    ele?.paid_fee +
                    ref?.studentPaidFeeCount +
                    ele?.paid_by_government;
                  collect_by_student += ele?.fee_structure?.applicable_fees;
                  pending_by_student +=
                    ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0;
                  collect_by_government += ele?.paid_by_government;
                  pending_from_government +=
                    ele?.fee_structure?.total_admission_fees -
                    ele?.fee_structure?.applicable_fees;
                  ele.student.total_paid_fees += ele?.paid_fee;
                  ele.student.total_os_fees += ele?.remaining_fee;
                  ele.student.applicable_os_fees +=
                    ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0;
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount >
                    0
                  ) {
                    total_fees_arr.push(ele?.student);
                  }
                  if (
                    ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_collect_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees +
                      ref?.studentRemainingFeeCount -
                      ele?.paid_fee +
                      ref?.studentPaidFeeCount +
                      ele?.paid_by_government >
                    0
                  ) {
                    total_pending_arr.push(ele?.student);
                  }
                  if (ele?.fee_structure?.applicable_fees > 0) {
                    collect_by_student_arr.push(ele?.student);
                  }
                  if (
                    (ele?.paid_fee <= ele?.fee_structure?.applicable_fees
                      ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                      : 0) > 0
                  ) {
                    pending_by_student_arr.push(ele?.student);
                  }
                  if (ele?.paid_by_government > 0) {
                    collect_by_government_arr.push(ele?.student);
                  }
                  if (
                    ele?.fee_structure?.total_admission_fees -
                      ele?.fee_structure?.applicable_fees >
                    0
                  ) {
                    pending_from_government_arr.push(ele?.student);
                  }
                }
                total_fees_arr = remove_duplicated(total_fees_arr);
                total_collect_arr = remove_duplicated(total_collect_arr);
                total_pending_arr = remove_duplicated(total_pending_arr);
                collect_by_student_arr = remove_duplicated(
                  collect_by_student_arr
                );
                pending_by_student_arr = remove_duplicated(
                  pending_by_student_arr
                );
                collect_by_government_arr = remove_duplicated(
                  collect_by_government_arr
                );
                pending_from_government_arr = remove_duplicated(
                  pending_from_government_arr
                );
              }
              custom_classes.push({
                className: `${cls?.className}-${cls?.classTitle}`,
                _id: cls?._id,
                total_fees: total_fees,
                total_collect: total_collect,
                total_pending: total_pending,
                collect_by_student: collect_by_student,
                pending_by_student: pending_by_student,
                collect_by_government: collect_by_government,
                pending_from_government: pending_from_government,
                classMaster: cls?.masterClassName,
                total_fees_arr: total_fees_arr,
                total_collect_arr: total_collect_arr,
                total_pending_arr: total_pending_arr,
                collect_by_student_arr: collect_by_student_arr,
                pending_by_student_arr: pending_by_student_arr,
                collect_by_government_arr: collect_by_government_arr,
                pending_from_government_arr: pending_from_government_arr,
              });
            }
            obs[one_batch?._id] = {
              classes: custom_classes,
            };
            nest_classes.push({ ...obs });
          }
          var master_query = [];
          for (var j = 0; j < departs[i]?.departmentClassMasters?.length; j++) {
            const one_master = await ClassMaster.findById({
              _id: departs[i]?.departmentClassMasters[j],
            });
            if (one_master?._id) {
              master_query.push({
                masterName: one_master?.className,
                _id: one_master?._id,
              });
            }
          }
          new_departs.push({
            dName: departs[i]?.dName,
            dp: `dp${i + 1}`,
            batch_query: [...batch_query],
            master_query: [...master_query],
            nest_classes: [...nest_classes],
          });
        }
        // console.log(nest_classes)
        var result = await buildStructureObject(new_departs);
        var new_dep_excel = [{ ...result }];
        var result_1 = await buildStructureObject_1(new_departs);
        excel_list.push({
          depart_row: true,
          batch_row: true,
          master_row: true,
          class_row: true,
          departs: new_dep_excel,
          ...result_1,
        });
        // finance.admission_fees_statistics_filter.bank_level.push(bank)
        finance.admission_stats = excel_list;
        await finance.save();
      }
      finance.admission_fees_statistics_filter.loading = false;
      await finance.save();
    } else {
      res.status(200).send({ message: "Invalid Flow / Module Type Query" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOverallStudentFeesStatisticsQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_finance = await Finance.findById({ _id: fid })
      .populate({
        path: "deposit_linked_head",
      })
      .populate({
        path: "deposit_hostel_linked_head",
      });
    one_finance.fees_statistics_filter.loading = false;
    await one_finance.save();
    const fetch_obj = {
      message: "Refetched Overall Data For Finance Master Query",
      access: true,
      total_fees: one_finance?.total_fees,
      total_collect: one_finance?.total_collect,
      total_pending: one_finance?.total_pending,
      collect_by_student: one_finance?.collect_by_student,
      pending_by_student: one_finance?.pending_by_student,
      collect_by_government: one_finance?.collect_by_government,
      pending_from_government: one_finance?.pending_from_government,
      fees_to_be_collected_student: one_finance?.fees_to_be_collected_student,
      fees_to_be_collected_government:
        one_finance?.fees_to_be_collected_government,
      internal_fees: one_finance?.internal_fees,
      internal_os_fees: one_finance?.internal_os_fees,
      last_update: one_finance?.loading_fees,
      loading_status: one_finance?.fees_statistics_filter?.loading,
      incomes: one_finance?.incomes,
      expenses: one_finance?.expenses,
      total_deposits: one_finance?.total_deposits ?? 0,
      excess_fees: one_finance?.excess_fees ?? 0,
      fees_statistics_filter: one_finance?.fees_statistics_filter,
      total_fees_arr: one_finance?.total_fees_arr,
      total_collect_arr: one_finance?.total_collect_arr,
      total_pending_arr: one_finance?.total_pending_arr,
      collect_by_student_arr: one_finance?.collect_by_student_arr,
      pending_by_student_arr: one_finance?.pending_by_student_arr,
      collect_by_government_arr: one_finance?.collect_by_government_arr,
      pending_from_government_arr: one_finance?.pending_from_government_arr,
      fees_to_be_collected_student_arr:
        one_finance?.fees_to_be_collected_student_arr,
      fees_to_be_collected_government_arr:
        one_finance?.fees_to_be_collected_government_arr,
    };

    const fetch_encrypt = await encryptionPayload(fetch_obj);
    res.status(200).send({
      encrypt: fetch_encrypt,
      fetch_obj,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOverallStudentAdmissionFeesStatisticsQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    const one_finance = await Finance.findById({ _id: fid });
    one_finance.admission_fees_statistics_filter.loading = false;
    await one_finance.save();
    const fetch_obj = {
      message: "Refetched Overall Data For Finance Master Query",
      access: true,
      excel_list: one_finance?.admission_stats,
      last_update: one_finance?.loading_admission_fees,
      loading_status: one_finance?.admission_fees_statistics_filter?.loading,
      fees_statistics_filter: one_finance?.admission_fees_statistics_filter,
    };

    const fetch_encrypt = await encryptionPayload(fetch_obj);
    res.status(200).send({
      encrypt: fetch_encrypt,
      fetch_obj,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.renderFinanceScholarTransactionHistoryQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeline, timeline_content, from, to } = req.query;

    var total_fees = 0;
    var total_collect = 0;
    var total_pending = 0;
    var collect_by_student = 0;
    var pending_by_student = 0;
    var collect_by_government = 0;
    var pending_from_government = 0;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    var valid_timeline = timeline === "false" ? false : true;
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    if (timeline_content === "Past Week") {
      const week = custom_date_time_reverse(7);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Month") {
      const week = custom_month_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Year") {
      const week = custom_year_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    }
    if (valid_timeline) {
      const g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-01T00:00:00.000Z`);
      var order = await OrderPayment.find({
        $and: [
          {
            created_at: {
              $gte: g_date,
              $lte: l_date,
            },
          },
          {
            payment_to_end_user_id: `${id}`,
          },
        ],
      })
        .populate({
          path: "fee_receipt",
        })
        .populate({
          path: "payment_student",
          select:
            "studentFirstName studentMiddleName studentLastName valid_full_name studentGender",
        });
      res.status(200).send({
        message: `Explore TimeLine ${timeline_content} Query`,
        access: true,
      });
    } else {
      var g_year = new Date(`${from}`).getFullYear();
      var l_year = new Date(`${to}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
      var order = await OrderPayment.find({
        $and: [
          {
            created_at: {
              $gte: g_date,
              $lte: l_date,
            },
          },
          {
            payment_to_end_user_id: `${id}`,
          },
        ],
      })
        .populate({
          path: "fee_receipt",
        })
        .populate({
          path: "payment_student",
          select:
            "studentFirstName studentMiddleName studentLastName valid_full_name studentGender",
        });
      res.status(200).send({
        message: "Explore Date From To Query",
        access: true,
        // order,
      });
    }
    if (order?.length > 0) {
      var trans_list = [];
      order = order?.filter((val) => {
        if (val?.payment_amount > 0) return val;
      });
      order = order?.filter((val) => {
        if (val?.fee_receipt?.fee_payment_mode === "Government/Scholarship")
          return val;
      });
      order.sort(function (st1, st2) {
        return (
          parseInt(st1?.payment_invoice_number) -
          parseInt(st2?.payment_invoice_number)
        );
      });

      for (var ref of order) {
        if (ref?.payment_by_end_user_id) {
          var user = await User.findById({
            _id: ref?.payment_by_end_user_id,
          }).select("userLegalName");
          var qvipleId = await QvipleId.findOne({ user: user?._id });
        }
        const all_remain = await RemainingList.find({
          student: `${ref?.payment_student?._id}`,
        }).populate({
          path: "fee_structure",
        });
        for (var ele of all_remain) {
          total_fees +=
            ele?.fee_structure?.total_admission_fees +
            ref?.studentRemainingFeeCount;
          total_collect += ele?.paid_fee + ref?.studentPaidFeeCount;
          total_pending += ele?.remaining_fee + ref?.studentRemainingFeeCount;
          collect_by_student += ele?.paid_by_student;
          pending_by_student += ele?.admissionRemainFeeCount ?? 0;
          collect_by_government += ele?.paid_by_government;
          pending_from_government +=
            ele?.fee_structure?.total_admission_fees -
            ele?.fee_structure?.applicable_fees;
        }
        trans_list.push({
          QvipleId: qvipleId?.qviple_id,
          ReceiptNumber: ref?.payment_invoice_number ?? "#NA",
          ReceiptDate: ref?.created_at ?? "#NA",
          Name: user?.userLegalName
            ? user?.userLegalName
            : ref?.payment_by_end_user_id_name,
          PaymentAmount: ref?.payment_amount ?? "#NA",
          Gender: ref?.payment_student?.studentGender,
          PaymentType: ref?.payment_module_type ?? "#NA",
          PaymentMode: ref?.fee_receipt?.fee_payment_mode,
          PaymentStatus: ref?.payment_status ?? "#NA",
          PaymentDate: moment(ref?.created_at).format("LL") ?? "#NA",
          TotalFees: total_fees,
          TotalCollect: total_collect,
          TotalOutstanding: total_pending,
          CollectionFromStudent: collect_by_student,
          OutStandingFromStudent: pending_by_student,
          CollectionFromGovernment: collect_by_government,
          OutStandingFromGovernment: pending_from_government,
        });
      }
      await scholar_transaction_json_to_excel_query(
        trans_list,
        "Scholarship",
        timeline,
        id
      );
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderClassStudentQuery = async (req, res) => {
  try {
    const { cid } = req?.params;
    const { gr } = req?.body;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var classes = await Class.findById({ _id: cid });
    for (var val of gr) {
      const all_stu = await Student.findOne({ studentGRNO: `${val}` });
      classes.ApproveStudent.push(all_stu?._id);
    }
    await classes.save();
    res.status(200).send({ message: "Explore All Student Query" });
  } catch (e) {
    console.log(e);
  }
};

exports.renderInternalFeeHeadsStructureReceiptQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { timeline, timeline_content, from, to } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var valid_timeline = timeline === "false" ? false : true;
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    if (timeline_content === "Past Week") {
      const week = custom_date_time_reverse(7);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Month") {
      const week = custom_month_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Year") {
      const week = custom_year_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    }
    const finance = await Finance.findById({ _id: fid }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select("insName depart");
    if (valid_timeline) {
      const g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-01T00:00:00.000Z`);
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_FINANCE_MANAGER",
          },
          {
            visible_status: "Not Hide",
          },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender studentPaidFeeCount studentRemainingFeeCount department",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender studentPaidFeeCount studentRemainingFeeCount department",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "internal_fees",
          populate: {
            path: "fees",
            select: "feeName",
          },
        })
        .lean()
        .exec();
    } else {
      var g_year = new Date(`${from}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_year = new Date(`${to}`).getFullYear();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_FINANCE_MANAGER",
          },
          {
            visible_status: "Not Hide",
          },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender studentPaidFeeCount studentRemainingFeeCount remainingFeeList",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender studentPaidFeeCount studentRemainingFeeCount remainingFeeList",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "internal_fees",
          populate: {
            path: "fees",
            select: "feeName",
          },
        })
        .lean()
        .exec();
    }
    if (all_receipts?.length > 0) {
      res.status(200).send({
        message: "Explore Fee Receipt Heads Structure Query",
        access: true,
        all_receipts,
        count: all_receipts?.length,
      });
      all_receipts.sort(function (st1, st2) {
        return parseInt(st1?.invoice_count) - parseInt(st2?.invoice_count);
      });
      var head_list = [];
      for (var ref of all_receipts) {
        head_list.push({
          ReceiptNumber: ref?.invoice_count ?? "0",
          ReceiptDate: moment(ref?.created_at).format("DD-MM-YYYY") ?? "NA",
          TransactionAmount: ref?.fee_payment_amount ?? "0",
          TransactionDate:
            moment(ref?.fee_transaction_date).format("DD-MM-YYYY") ?? "NA",
          TransactionMode: ref?.fee_payment_mode ?? "#NA",
          BankName: ref?.fee_bank_name ?? "#NA",
          BankHolderName: ref?.fee_bank_holder ?? "#NA",
          BankUTR: ref?.fee_utr_reference ?? "#NA",
          GRNO: ref?.student?.studentGRNO ?? "#NA",
          Name:
            `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName}` ?? "#NA",
          FirstName: ref?.student?.studentFirstName ?? "#NA",
          FatherName:
            ref?.student?.studentFatherName ?? ref?.student?.studentMiddleName,
          LastName: ref?.student?.studentLastName ?? "#NA",
          Gender: ref?.student?.studentGender ?? "#NA",
          Class: `${ref?.student?.studentClass?.className}` ?? "#NA",
          Batch: ref?.student?.batches?.batchName ?? "#NA",
          TotalPaidFees: ref?.student?.studentPaidFeeCount,
          TotalOutstanding: ref?.student?.studentRemainingFeeCount,
          FeesType: `${ref?.internal_fees?.fees?.feeName}`,
          FeesAmount: `${ref?.internal_fees?.internal_fee_amount}`,
          Narration: `Being Fees Received By ${
            ref?.fee_payment_mode
          } Date ${moment(ref?.fee_transaction_date).format(
            "DD-MM-YYYY"
          )} Rs. ${ref?.fee_payment_amount} out of Rs. ${
            ref?.internal_fees?.internal_fee_amount
          } Paid By ${ref?.student?.studentFirstName} ${
            ref?.student?.studentMiddleName
              ? ref?.student?.studentMiddleName
              : ""
          } ${ref?.student?.studentLastName}.`,
        });
      }

      await internal_fee_heads_receipt_json_to_excel_query(
        head_list,
        institute?.insName,
        institute?._id
      );
    } else {
      res.status(200).send({
        message: "No Fee Receipt Heads Structure Query",
        access: false,
        all_students: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentExcessFeesExcelQuery = async (req, res) => {
  try {
    const { aid } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var filter_refund = [];
    var ads_admin = await Admission.findById({ _id: aid })
      .select("refundCount")
      .populate({
        path: "refundFeeList",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO remainingFeeList refund",
          populate: {
            path: "remainingFeeList",
            select: "applicable_card government_card",
            populate: {
              path: "applicable_card government_card",
              select: "paid_fee applicable_fee",
            },
          },
        },
      });
    // res.status(200).send({
    //   message: "Explore Excess Fees Query",
    //   access: true,
    // });
    for (let data of ads_admin?.refundFeeList) {
      if (data.student !== null) {
        filter_refund.push(data);
      }
    }
    var all_refund_list = [...filter_refund];
    for (var stu of all_refund_list) {
      for (var val of stu?.student?.remainingFeeList) {
        stu.student.refund +=
          (val?.applicable_card?.paid_fee > val?.applicable_card?.applicable_fee
            ? val?.applicable_card?.paid_fee -
              val?.applicable_card?.applicable_fee
            : 0) +
          (val?.government_card?.paid_fee > val?.government_card?.applicable_fee
            ? val?.government_card?.paid_fee -
              val?.government_card?.applicable_fee
            : 0);
      }
      stu.refund = stu.student.refund;
    }
    var filtered = [...all_refund_list];
    // var filtered = ?.filter((ref) => {
    //   if (ref?.refund > 0) return ref;
    // });
    var excel_list = [];
    filtered.sort(function (st1, st2) {
      return (
        parseInt(st1?.student?.studentROLLNO) -
        parseInt(st2?.student?.studentROLLNO)
      );
    });
    if (filtered?.length > 0) {
      for (var val of filtered) {
        excel_list.push({
          RollNo: val?.student?.studentROLLNO ?? "NA",
          GRNO: val?.student?.studentGRNO ?? "#NA",
          Name:
            `${val?.student?.studentFirstName} ${
              val?.student?.studentMiddleName
                ? val?.student?.studentMiddleName
                : ""
            } ${val?.student?.studentLastName}` ??
            val?.student?.valid_full_name,
          Gender: val?.student?.studentGender ?? "#NA",
          ExcessFees: val?.refund ?? 0,
        });
      }
      const data = await excess_refund_fees_json_query(
        excel_list,
        "Excess Fees",
        aid,
        "Excess Fees List"
      );
      res.status(200).send({
        message: "Explore Excess Fees Query",
        access: true,
        filtered,
      });
    } else {
      res.status(200).send({
        message: "No Excess Fees Data Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderStudentRefundFeesExcelQuery = async (req, res) => {
  try {
    const { aid } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var filter_refund = [];
    var ads_admin = await Admission.findById({ _id: aid })
      .select("refundedCount")
      .populate({
        path: "refundedFeeList",
        populate: {
          path: "student fee_receipt",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO studentROLLNO fee_payment_mode refund_status invoice_count fee_bank_name fee_bank_holder fee_utr_reference fee_payment_acknowledge fee_payment_amount fee_transaction_date ",
        },
      });
    res.status(200).send({
      message: "Explore Refunded Fees Query",
      access: true,
    });
    for (let data of ads_admin?.refundedFeeList) {
      if (data.student !== null) {
        filter_refund.push(data);
      }
    }
    var all_refund_list = [...filter_refund];
    all_refund_list.sort(function (st1, st2) {
      return (
        parseInt(st1?.student?.studentROLLNO) -
        parseInt(st2?.student?.studentROLLNO)
      );
    });
    var excel_list = [];
    if (all_refund_list?.length > 0) {
      for (var val of all_refund_list) {
        // var one_remain = await RemainingList.find({  $and: [{ student: ref?.student?._id}]})
        // .populate({
        //   path: "fee_structure",
        //   populate: {
        //     path: "class_master batch_master",
        //     select: "className batchName"
        //   }
        // })
        // .populate({
        //   path: "student",
        // })
        // for(var val of one_remain){
        //   if(val?.paid_fee > val?.fee_structure?.applicable_fees){

        //   }
        // }
        excel_list.push({
          RollNo: val?.student?.studentROLLNO ?? "NA",
          GRNO: val?.student?.studentGRNO ?? "#NA",
          ReceiptNumber: val?.fee_receipt?.invoice_count ?? "#NA",
          // Standard: `${val?.fee_structure}` ? `${val?.fee_structure?.class_master?.className}` : "#NA",
          // Batch: `${val?.fee_structure}` ? `${val?.fee_structure?.batch_master?.batchName}` : "#NA",
          // FeeStructure: val?.fee_structure?.unique_structure_name,
          Name:
            `${val?.student?.studentFirstName} ${
              val?.student?.studentMiddleName
                ? val?.student?.studentMiddleName
                : ""
            } ${val?.student?.studentLastName}` ??
            val?.student?.valid_full_name,
          Gender: val?.student?.studentGender ?? "#NA",
          // TotalFees: val?.applicable_fee ?? 0,
          // ApplicableFees: val?.fee_structure?.applicable_fees,
          // TotalOutstandingFees: val?.remaining_fee,
          // TotalPaidFees: val?.paid_fee,
          // TotalApplicableOutstandingFees: val?.paid_fee <= val?.fee_structure?.applicable_fees ? val?.fee_structure?.applicable_fees - val?.paid_fee : 0,
          // PaidByStudent: val?.paid_by_student,
          // PaidByGovernment: val?.paid_by_government,
          RefundedFees: val?.fee_receipt?.fee_payment_amount ?? 0,
          TransactionDate: val?.fee_receipt?.fee_transaction_date ?? "#NA",
          FeeMode: val?.fee_receipt?.fee_payment_mode,
        });
      }
      // console.log(excel_list)
      const data = await excess_refund_fees_json_query(
        excel_list,
        "Refunded Fees",
        aid,
        "Refunded Fees List"
      );
    } else {
      res.status(200).send({
        message: "No Refunded Fees Data Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const review_sort_student_by_alpha = async (arr) => {
  var send_filter = [];
  const students = await Student.find({
    _id: { $in: arr },
  })
    .sort({ studentFirstName: 1, studentMiddleName: 1, studentLastName: 1 })
    .select("_id");

  for (let i = 0; i < students.length; i++) {
    const stu = await Student.findById({ _id: students[i]._id })
      .select(
        "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto studentROLLNO studentGender studentPhoneNumber studentParentsPhoneNumber studentEmail application_print fee_receipt paidFeeList"
      )
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "user",
        select: "userLegalName username userPhoneNumber userEmail",
      });
    await stu.save();
    send_filter.push(stu?._id);
  }
  return send_filter;
};

const review_sort_student_by_alpha_last = async (arr) => {
  var send_filter = [];
  const students = await Student.find({
    _id: { $in: arr },
  })
    .sort({ studentLastName: 1, studentFirstName: 1, studentMiddleName: 1 })
    .select("_id");

  for (let i = 0; i < students.length; i++) {
    const stu = await Student.findById({ _id: students[i]._id })
      .select(
        "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto studentROLLNO studentGender studentPhoneNumber studentParentsPhoneNumber studentEmail application_print fee_receipt paidFeeList"
      )
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "user",
        select: "userLegalName username userPhoneNumber userEmail",
      });
    await stu.save();
    send_filter.push(stu?._id);
  }
  return send_filter;
};

const review_sort_student_by_alpha_query = async (arr) => {
  var send_filter = [];
  const students = await Student.find({
    _id: { $in: arr },
  })
    .sort({ studentFName: 1, studentMName: 1, studentLName: 1 })
    .select("_id");

  for (let i = 0; i < students.length; i++) {
    const stu = await Student.findById({ _id: students[i]._id })
      .select(
        "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto studentROLLNO studentGender studentPhoneNumber studentParentsPhoneNumber studentEmail application_print fee_receipt paidFeeList"
      )
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "user",
        select: "userLegalName username userPhoneNumber userEmail",
      });
    await stu.save();
    send_filter.push(stu?._id);
  }
  return send_filter;
};

const review_sort_student_by_alpha_last_query = async (arr) => {
  var send_filter = [];
  const students = await Student.find({
    _id: { $in: arr },
  })
    .sort({ studentLName: 1, studentFName: 1, studentMName: 1 })
    .select("_id");

  for (let i = 0; i < students.length; i++) {
    const stu = await Student.findById({ _id: students[i]._id })
      .select(
        "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto studentROLLNO studentGender studentPhoneNumber studentParentsPhoneNumber studentEmail application_print fee_receipt paidFeeList"
      )
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "user",
        select: "userLegalName username userPhoneNumber userEmail",
      });
    await stu.save();
    send_filter.push(stu?._id);
  }
  return send_filter;
};

const review_sorted_by_gender = async (arr) => {
  var sorted_data = [];
  const studentFemale = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Female" }],
  }).select("_id");
  const studentMale = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Male" }],
  }).select("_id");

  const studentOther = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Other" }],
  }).select("_id");
  const data = [...studentFemale, ...studentMale, ...studentOther];
  for (let i = 0; i < data.length; i++) {
    const stu = await Student.findById({ _id: data[i]._id })
      .select(
        "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto studentROLLNO studentGender studentPhoneNumber studentParentsPhoneNumber studentEmail application_print fee_receipt paidFeeList"
      )
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "user",
        select: "userLegalName username userPhoneNumber userEmail",
      });
    await stu.save();
    sorted_data.push(stu?._id);
  }
  return sorted_data;
};

const review_sorted_by_both_gender_and_aplha = async (arr) => {
  var sorted_ga = [];
  const studentFemale = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Female" }],
  })
    .sort({ studentFirstName: 1, studentMiddleName: 1, studentLastName: 1 })
    .select("_id");
  const studentMale = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Male" }],
  })
    .sort({ studentFirstName: 1, studentMiddleName: 1, studentLastName: 1 })
    .select("_id");

  const studentOther = await Student.find({
    $and: [{ _id: { $in: arr } }, { studentGender: "Other" }],
  })
    .sort({ studentFirstName: 1, studentMiddleName: 1, studentLastName: 1 })
    .select("_id");

  var data = [...studentFemale, ...studentMale, ...studentOther];
  for (let i = 0; i < data.length; i++) {
    const stu = await Student.findById({ _id: data[i]._id })
      .select(
        "studentFirstName studentMiddleName studentLastName valid_full_name photoId studentProfilePhoto studentROLLNO studentGender studentPhoneNumber studentParentsPhoneNumber studentEmail application_print fee_receipt paidFeeList"
      )
      .populate({
        path: "fee_structure",
      })
      .populate({
        path: "user",
        select: "userLegalName username userPhoneNumber userEmail",
      });
    await stu.save();
    sorted_ga.push(stu?._id);
  }
  return sorted_ga;
};

exports.renderReviewApplicationFilter = async (req, res) => {
  try {
    const { aid } = req.params;
    const { sort_query } = req.query;
    var student_arr = [];
    var apply = await NewApplication.findById({ _id: aid }).select(
      "reviewApplication"
    );

    if (sort_query === "Alpha") {
      const sortedA = await review_sort_student_by_alpha(
        apply?.reviewApplication
      );
      apply.reviewApplication = [];
      await apply.save();
      apply.reviewApplication = [...sortedA];
      await apply.save();
      res.status(200).send({
        message: "Sorted By Alphabetical Order",
        students: sortedA,
        apply: apply?.reviewApplication,
        access: true,
      });
    } else if (sort_query === "Alpha_Last") {
      const sortedA = await review_sort_student_by_alpha_last(
        apply?.reviewApplication
      );
      apply.reviewApplication = [];
      await apply.save();
      apply.reviewApplication = [...sortedA];
      await apply.save();
      res.status(200).send({
        message: "Sorted By Alphabetical Surname Order",
        students: sortedA,
        apply: apply?.reviewApplication,
        access: true,
      });
    } else if (sort_query === "Gender") {
      const sortedG = await review_sorted_by_gender(apply?.reviewApplication);
      apply.reviewApplication = [];
      await apply.save();
      apply.reviewApplication = [...sortedG];
      await apply.save();
      res.status(200).send({
        message: "Sorted By Gender Order",
        students: sortedG,
        apply: apply?.reviewApplication,
        access: true,
      });
    } else if (sort_query === "Gender_Alpha") {
      const sortedGA = await review_sorted_by_both_gender_and_aplha(
        apply?.reviewApplication
      );
      apply.reviewApplication = [];
      await apply.save();
      apply.reviewApplication = [...sortedGA];
      await apply.save();
      res.status(200).send({
        message: "Sorted By Gender & Alpha Order",
        students: sortedGA,
        apply: apply?.reviewApplication,
        access: true,
      });
    } else {
      res
        .status(200)
        .send({ message: "You're breaking sorting rules 😡", access: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderCertificateFilterQuery = async (req, res) => {
  try {
    const { id } = req.query;
    const { flow } = req?.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var excel_list = [];
    var ins = await InstituteAdmin.findById({ _id: id });
    if (flow === "Request") {
      var all_cert = await CertificateQuery.find({
        $and: [{ institute: ins?._id }, { certificate_status: "Requested" }],
      }).populate({
        path: "student",
      });
      if (all_cert?.length > 0) {
        res.status(200).send({
          message: "Explore Requested Certificate Query",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No Requested Certificate Query",
          access: false,
        });
      }
      if (all_cert?.length > 0) {
        for (var val of all_cert) {
          excel_list.push({
            RollNo: val?.student?.studentROLLNO ?? "NA",
            GRNO: val?.student?.studentGRNO ?? "#NA",
            Name:
              `${val?.student?.studentFirstName} ${
                val?.student?.studentMiddleName
                  ? val?.student?.studentMiddleName
                  : ""
              } ${val?.student?.studentLastName}` ??
              val?.student?.valid_full_name,
            Gender: val?.student?.studentGender ?? "#NA",
            Type: val?.is_original,
            Status: val?.certificate_status ?? "#NA",
            // PaymentMode: val?.fee_receipt?.fee_payment_mode
          });
        }
        const data = await certificate_json_query(
          excel_list,
          "Request-Certificate",
          id,
          "Requested Certificate List"
        );
      }
    } else if (flow === "Issued") {
      var all_cert = await CertificateQuery.find({
        $and: [{ institute: ins?._id }, { certificate_status: "Issued" }],
      });
      if (all_cert?.length > 0) {
        res.status(200).send({
          message: "Explore Issued Certificate Query",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No Issued Certificate Query",
          access: false,
        });
      }
      if (all_cert?.length > 0) {
        for (var val of all_cert) {
          excel_list.push({
            RollNo: val?.student?.studentROLLNO ?? "NA",
            GRNO: val?.student?.studentGRNO ?? "#NA",
            Name:
              `${val?.student?.studentFirstName} ${
                val?.student?.studentMiddleName
                  ? val?.student?.studentMiddleName
                  : ""
              } ${val?.student?.studentLastName}` ??
              val?.student?.valid_full_name,
            Gender: val?.student?.studentGender ?? "#NA",
            Type: val?.is_original,
            Status: val?.certificate_status ?? "#NA",
            // PaymentMode: val?.fee_receipt?.fee_payment_mode
          });
        }
        const data = await certificate_json_query(
          excel_list,
          "Issued-Certificate",
          id,
          "Issued Certificate List"
        );
      }
    } else {
      res.status(200).send({
        message: "No Certificate Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllStudentMessageQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { all_depart, batch_status, master, depart, batch, category } =
      req?.body;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    var ads_admin = await InstituteAdmin.findById({ _id: id });
    if (all_depart === "ALL") {
      var arr = [];
      var all_dept = await Department.find({ institute: ads_admin?._id });
      var all_student = await Student.find({ department: { $in: all_dept } })
        .select(
          "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory"
        )
        .populate({
          path: "user",
          select: "deviceToken userEmail",
        })
        .populate({
          path: "institute",
          select: "insName",
        });
      // var all_remain = await RemainingList.find({ student: { $in: all_student } })
      // .populate({
      //   path: "fee_structure"
      // })
      // .populate({
      //   path: "student",
      //   select: "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO",
      //   populate: {
      //     path: "user",
      //     select: "userEmail deviceToken"
      //   }
      // })
      // for(var ref of all_remain){
      //   if(ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0){
      //     arr.push(ref?.student)
      //   }
      // }
      // all_student = remove_duplicated_arr(arr)
      if (category) {
        all_student = all_student?.filter((cls) => {
          if (`${cls?.studentCastCategory}` === `${category}`) return cls;
        });
      }
      res.status(200).send({
        message: "Explore All Department Student Query",
        access: true,
        all_student: all_student,
        count: all_student?.length,
      });
    } else if (all_depart === "PARTICULAR") {
      if (batch_status === "ALL_BATCH") {
        var arr = [];
        var valid_dept = await Department.findById({ _id: depart });
        const all_classes = await Class.find({
          masterClassName: { $in: master },
        });
        if (all_classes?.length > 0) {
          var all_student = await Student.find({
            $and: [
              { department: valid_dept?._id },
              { batches: { $in: valid_dept?.batches } },
              { studentClass: { $in: all_classes } },
            ],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory"
            )
            .populate({
              path: "user",
              select: "deviceToken userEmail",
            })
            .populate({
              path: "institute",
              select: "insName",
            });
          var all_remain = await RemainingList.find({
            student: { $in: all_student },
          })
            .populate({
              path: "fee_structure",
            })
            .populate({
              path: "student",
              select:
                "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory",
              populate: {
                path: "user",
                select: "userEmail deviceToken",
              },
            });
          // for(var ref of all_remain){
          //   if(ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0){
          //     arr.push(ref?.student)
          //   }
          // }
          // all_student = remove_duplicated_arr(arr)
          if (category) {
            all_student = all_student?.filter((cls) => {
              if (`${cls?.studentCastCategory}` === `${category}`) return cls;
            });
          }
          res.status(200).send({
            message: "Explore All For All Batch With Standard Student Query",
            access: true,
            all_student: all_student,
            count: all_student?.length,
          });
        }
        var all_student = await Student.find({
          $and: [
            { department: valid_dept?._id },
            { batches: { $in: valid_dept?.batches } },
          ],
        })
          .select(
            "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory"
          )
          .populate({
            path: "user",
            select: "deviceToken userEmail",
          })
          .populate({
            path: "institute",
            select: "insName",
          });
        var all_remain = await RemainingList.find({
          student: { $in: all_student },
        })
          .populate({
            path: "fee_structure",
          })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory",
            populate: {
              path: "user",
              select: "userEmail deviceToken",
            },
          });
        // for(var ref of all_remain){
        //   if(ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0){
        //     arr.push(ref?.student)
        //   }
        // }
        // all_student = remove_duplicated_arr(arr)
        if (category) {
          all_student = all_student?.filter((cls) => {
            if (`${cls?.studentCastCategory}` === `${category}`) return cls;
          });
        }
        res.status(200).send({
          message: "Explore All Student For All Batch Query",
          access: true,
          all_student: all_student,
          count: all_student?.length,
        });
      } else if (batch_status === "PARTICULAR_BATCH") {
        var arr = [];
        const all_classes = await Class.find({
          masterClassName: { $in: master },
        });
        if (all_classes?.length > 0) {
          var all_student = await Student.find({
            $and: [
              { department: depart },
              { batches: batch },
              { studentClass: { $in: all_classes } },
            ],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory"
            )
            .populate({
              path: "user",
              select: "deviceToken userEmail",
            })
            .populate({
              path: "institute",
              select: "insName",
            });
          var all_remain = await RemainingList.find({
            student: { $in: all_student },
          })
            .populate({
              path: "fee_structure",
            })
            .populate({
              path: "student",
              select:
                "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory",
              populate: {
                path: "user",
                select: "userEmail deviceToken",
              },
            });
          // for(var ref of all_remain){
          //   if(ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0){
          //     arr.push(ref?.student)
          //   }
          // }
          // all_student = remove_duplicated_arr(arr)
          // let nums = []
          // for (let ele of all_student) {
          //   nums.push(ele?._id)
          // }
          if (category) {
            all_student = all_student?.filter((cls) => {
              if (`${cls?.studentCastCategory}` === `${category}`) return cls;
            });
          }
          res.status(200).send({
            message:
              "Explore All For Particular Batch with Standard Student Query",
            access: true,
            all_student: all_student,
            count: all_student?.length,
          });
        } else {
          var all_student = await Student.find({
            $and: [{ department: depart }, { batches: batch }],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory"
            )
            .populate({
              path: "user",
              select: "deviceToken userEmail",
            })
            .populate({
              path: "institute",
              select: "insName",
            });
          var all_remain = await RemainingList.find({
            student: { $in: all_student },
          })
            .populate({
              path: "fee_structure",
            })
            .populate({
              path: "student",
              select:
                "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory",
              populate: {
                path: "user",
                select: "userEmail deviceToken",
              },
            });
          // for(var ref of all_remain){
          //   if(ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0){
          //     arr.push(ref?.student)
          //   }
          // }
          // all_student = remove_duplicated_arr(arr)
          if (category) {
            all_student = all_student?.filter((cls) => {
              if (`${cls?.studentCastCategory}` === `${category}`) return cls;
            });
          }
          res.status(200).send({
            message: "Explore All For Particular Batch Student Query",
            access: true,
            all_student: all_student,
            count: all_student?.length,
          });
        }
      }
      if (!batch_status) {
        var arr = [];
        var valid_dept = await Department.findById({ _id: depart });
        const all_classes = await Class.find({
          masterClassName: { $in: master },
        });
        if (all_classes?.length > 0) {
          var all_student = await Student.find({
            $and: [
              { department: valid_dept?._id },
              { studentClass: { $in: all_classes } },
            ],
          })
            .select(
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory"
            )
            .populate({
              path: "user",
              select: "deviceToken userEmail",
            })
            .populate({
              path: "institute",
              select: "insName",
            });
        }
        var all_student = await Student.find({
          $and: [{ department: valid_dept?._id }],
        })
          .select(
            "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory"
          )
          .populate({
            path: "user",
            select: "deviceToken userEmail",
          })
          .populate({
            path: "institute",
            select: "insName",
          });

        var all_remain = await RemainingList.find({
          student: { $in: all_student },
        })
          .populate({
            path: "fee_structure",
          })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName valid_full_name studentProfilePhoto photoId studentGRNO studentCastCategory",
            populate: {
              path: "user",
              select: "userEmail deviceToken",
            },
          });
        // for(var ref of all_remain){
        //   if(ref?.fee_structure?.applicable_fees - ref?.paid_fee > 0){
        //     arr.push(ref?.student)
        //   }
        // }
        // all_student = remove_duplicated_arr(arr)
        console.log("Alert");
        if (category) {
          all_student = all_student?.filter((cls) => {
            if (`${cls?.studentCastCategory}` === `${category}`) return cls;
          });
        }
        res.status(200).send({
          message: "Explore All Student Query",
          access: true,
          all_student: all_student,
          count: all_student?.length,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderFilterByDepartmentQuery = async (req, res) => {
  try {
    const { lid } = req?.params;
    const { department, clear_status } = req?.body;
    if (!lid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var lib = await Library.findById({ _id: lid });
    if (department?.length > 0) {
      for (var val of department) {
        if (lib.filter_by.department?.includes(`${val}`)) {
        } else {
          lib.filter_by.department.push(val);
        }
      }
      await lib.save();
    }
    if (clear_status === "CLEAR_FILTER") {
      lib.filter_by.department = [];
      await lib.save();
    }
    res
      .status(200)
      .send({ message: "Explore new department Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderFeeStructureQuery = async (req, res) => {
  try {
    const { did } = req.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var depart = await Department.findById({ _id: did });

    var all_struct = await FeeStructure.find({ department: depart?._id })
      .populate({
        path: "class_master",
        select: "className",
      })
      .populate({
        path: "batch_master",
        select: "batchName",
      })
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "category_master",
        select: "category_name",
      });
    var excel_list = [];
    for (var ref of all_struct) {
      excel_list.push({
        StructureCode: ref?.fee_structure_code ?? "NA",
        Category: ref?.category_master?.category_name ?? "#NA",
        Batch: ref?.batch_master?.batchName ?? "#NA",
        Standard: ref?.class_master?.className ?? "#NA",
        TotalFees: ref?.total_admission_fees ?? 0,
        ApplicableFees: ref?.applicable_fees ?? 0,
        GovernmentFees:
          ref?.total_admission_fees >= ref?.applicable_fees
            ? ref?.total_admission_fees - ref?.applicable_fees
            : 0,
      });
    }
    const data = await json_to_excel_structure_code_query(
      depart?.dName,
      excel_list
    );
    res.status(200).send({
      message: "Explore Structure Export Query",
      access: true,
      data: data,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderTimeTableFilterByDepartmentQuery = async (req, res) => {
  try {
    const { did } = req?.params;
    if (!did)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var one_depart = await Department.findById({ _id: did }).select(
      "class dName"
    );

    var all_classes = await ClassTimetable.find({
      class: { $in: one_depart?.class },
    }).populate({
      path: "schedule",
      populate: {
        path: "subject",
        populate: {
          path: "selected_batch_query",
          select: "batchName",
        },
      },
    });

    var excel_list = [];
    for (var val of all_classes) {
      for (var ele of val?.schedule) {
        excel_list.push({
          Subject: ele?.subject?.subjectName ?? "#NA",
          SubjectStatus: ele?.subject?.subject_category ?? "#NA",
          SubjectBatch: ele?.subject?.selected_batch_query?.batchName ?? "#NA",
          Monday: val?.day === "Monday" ? `${ele?.from}-${ele?.to}` : "#NA",
          Tuesday: val?.day === "Tuesday" ? `${ele?.from}-${ele?.to}` : "#NA",
          Wednesday:
            val?.day === "Wednesday" ? `${ele?.from}-${ele?.to}` : "#NA",
          Thursday: val?.day === "Thursday" ? `${ele?.from}-${ele?.to}` : "#NA",
          Friday: val?.day === "Friday" ? `${ele?.from}-${ele?.to}` : "#NA",
          Saturday: val?.day === "Saturday" ? `${ele?.from}-${ele?.to}` : "#NA",
          Sunday: val?.day === "Sunday" ? `${ele?.from}-${ele?.to}` : "#NA",
        });
      }
    }

    const data = await json_to_excel_timetable_export_query(
      one_depart?.dName,
      excel_list
    );
    res.status(200).send({
      message: "Explore Timetable Export Query",
      access: true,
      data: data,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNonApplicableFeesQuery = async (req, res) => {
  try {
    const { frid } = req?.params;
    if (!frid)
      return res.status(200).send({
        message: "Thier is a bug need to fixed immediately",
        access: false,
      });
    var one_category = await FeesCategory.findById({ _id: frid });
    var all_struct = await FeeStructure.find({
      category_master: `${one_category?._id}`,
    });
    var excel_list = [];
    if (one_category?.scholarship_applicable) {
      var card = await RemainingList.find({
        fee_structure: { $in: all_struct },
      })
        .populate({
          path: "student",
          select: "studentGRNO",
        })
        .populate({
          path: "fee_structure",
          select: "batch_master unique_structure_name",
          populate: {
            path: "batch_master",
            select: "batchName",
          },
        });
      for (var val of card) {
        if (val?.scholar_ship_number) {
        } else {
          excel_list.push({
            GRNO: val?.student?.studentGRNO ?? "#NA",
            Batch: val?.fee_structure?.batch_master?.batchName ?? "#NA",
            FeeStructure: val?.fee_structure?.unique_structure_name ?? "#NA",
            Remark: val?.remark ?? "#NA",
            ScholarNumber: val?.scholar_ship_number ?? "#NA",
          });
        }
      }
      const data = await json_to_excel_non_applicable_fees_export_query(
        one_category?.category_name,
        excel_list
      );
      res.status(200).send({
        message: "Explore Non Applicable Fees Query",
        access: true,
        data: data,
      });
    } else {
      res.status(200).send({
        message: "Scholarship Not Applicable Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllDepositQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res.status(200).send({
        message: "Thier is a bug need to fixed immediately",
        access: false,
      });
    var fine = await Finance.findById({ _id: fid });
    var new_master = await FeeMaster.findOne({
      $and: [
        { finance: fine },
        {
          master_name: "Deposit Fees",
        },
        {
          master_status: "Linked",
        },
      ],
    });
    var excel_list = [];
    if (new_master?._id) {
      var all_student = await Student.find({
        _id: { $in: new_master?.paid_student },
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentGRNO deposit_pending_amount studentFatherName"
        )
        .populate({
          path: "department",
          select: "dName",
        });
      for (var val of all_student) {
        var name = `${val?.studentFirstName} ${
          val?.studentMiddleName ? val?.studentMiddleName : ""
        } ${val?.studentLastName}`;
        excel_list.push({
          GRNO: val?.studentGRNO ?? "#NA",
          Name: name ?? "#NA",
          FirstName: val?.studentFirstName ?? "#NA",
          FatherName: val?.studentFatherName ?? val?.studentMiddleName,
          LastName: val?.studentLastName ?? "#NA",
          DepositAmount: val?.deposit_pending_amount ?? "#NA",
          Department: val?.department?.dName ?? "#NA",
        });
      }
      const data = await json_to_excel_deposit_export_query(
        "Deposit",
        excel_list
      );
      res.status(200).send({
        message: "Explore Deposit Fees Query",
        access: true,
        data: data,
      });
    } else {
      res.status(200).send({
        message: "No Deposit Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllRefundDepositQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res.status(200).send({
        message: "Thier is a bug need to fixed immediately",
        access: false,
      });
    var fine = await Finance.findById({ _id: fid });
    var new_master = await FeeMaster.findOne({
      $and: [
        { finance: fine },
        {
          master_name: "Deposit Fees",
        },
        {
          master_status: "Linked",
        },
      ],
    });
    var excel_list = [];
    if (new_master?._id) {
      var all_student = await Student.find({
        _id: { $in: new_master?.refund_student },
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentGRNO deposit_pending_amount studentFatherName"
        )
        .populate({
          path: "department",
          select: "dName",
        });
      for (var val of all_student) {
        var name = `${val?.studentFirstName} ${
          val?.studentMiddleName ? val?.studentMiddleName : ""
        } ${val?.studentLastName}`;
        excel_list.push({
          GRNO: val?.studentGRNO ?? "#NA",
          Name: name ?? "#NA",
          FirstName: val?.studentFirstName ?? "#NA",
          FatherName: val?.studentFatherName ?? val?.studentMiddleName,
          LastName: val?.studentLastName ?? "#NA",
          RefundAmount: val?.deposit_refund_amount ?? "#NA",
          Department: val?.department?.dName ?? "#NA",
        });
      }
      const data = await json_to_excel_deposit_export_query(
        "Refund Deposit",
        excel_list
      );
      res.status(200).send({
        message: "Explore Refund Deposit Fees Query",
        access: true,
        data: data,
      });
    } else {
      res.status(200).send({
        message: "No Refund Deposit Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllExemptionQuery = async (req, res) => {
  try {
    const { fid } = req?.params;
    if (!fid)
      return res.status(200).send({
        message: "Thier is a bug need to fixed immediately",
        access: false,
      });
    var finance = await Finance.findById({ _id: fid });
    var all_exempt = await FeeReceipt.find({
      _id: { $in: finance?.exempt_receipt },
    })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
        populate: {
          path: "fee_structure",
          select:
            "category_master structure_name unique_structure_name applicable_fees",
          populate: {
            path: "category_master",
            select: "category_name",
          },
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName studentFatherName photoId studentProfilePhoto admissionPaidFeeCount admissionRemainFeeCount hostelRemainFeeCount hostelPaidFeeCount",
        populate: {
          path: "batches",
          select: "batchName",
        },
      })
      .populate({
        path: "application",
        select: "applicationName",
      });
    var excel_list = [];
    if (all_exempt?.length > 0) {
      for (var val of all_exempt) {
        var name = `${val?.student?.studentFirstName} ${
          val?.student?.studentMiddleName ? val?.student?.studentMiddleName : ""
        } ${val?.student?.studentLastName}`;
        excel_list.push({
          GRNO: val?.student?.studentGRNO ?? "#NA",
          Name: name ?? "#NA",
          FirstName: val?.studentFirstName ?? "#NA",
          FatherName: val?.studentFatherName ?? val?.studentMiddleName,
          LastName: val?.studentLastName ?? "#NA",
          ExemptAmount: val?.fee_payment_amount ?? 0,
          InvoiceNumber: val?.invoice_count ?? "#NA",
        });
      }
      const data = await json_to_excel_deposit_export_query(
        "Exemption",
        excel_list
      );
      res.status(200).send({
        message: "Explore Exemption / UnRecovered Fees Query",
        access: true,
        data: data,
      });
    } else {
      res.status(200).send({
        message: "No Exemption / UnRecovered Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderCancelExportQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const {
      fsid,
      timeline,
      timeline_content,
      from,
      to,
      bank,
      all_depart,
      batch_status,
    } = req.query;
    const { depart, batch, master } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var valid_timeline = timeline === "false" ? false : true;
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    if (timeline_content === "Past Week") {
      const week = custom_date_time_reverse(7);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Month") {
      const week = custom_month_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    } else if (timeline_content === "Past Year") {
      const week = custom_year_reverse(1);
      var g_year = new Date(`${week}`).getFullYear();
      var l_year = new Date().getFullYear();
      var g_month = new Date(`${week}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      var l_month = new Date().getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
    }
    var sorted_array = [];
    var finance = await Admission.findById({ _id: aid }).select("institute");
    var institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select("insName depart financeDepart");
    // console.log(institute?.financeDepart?.[0])

    if (valid_timeline) {
      const g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-01T00:00:00.000Z`);
      // console.log(institute?.financeDepart?.[0])
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: institute?.financeDepart?.[0] },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_ADMISSION",
          },
          {
            refund_status: "Refunded",
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
          populate: {
            path: "fee_structure",
            select:
              "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationDepartment",
          populate: {
            path: "applicationDepartment",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();

      if (bank) {
        all_receipts = all_receipts?.filter((val) => {
          if (
            `${val?.application?.applicationDepartment?.bank_account?._id}` ===
            `${bank}`
          )
            return val;
        });
      }
      if (all_depart === "All") {
      } else if (all_depart === "Particular" && depart) {
        all_receipts = all_receipts?.filter((val) => {
          if (`${val?.application?.applicationDepartment?._id}` === `${depart}`)
            return val;
        });
      }
    } else {
      var g_year = new Date(`${from}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_year = new Date(`${to}`).getFullYear();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
      // console.log(institute?.financeDepart?.[0])
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: institute?.financeDepart?.[0] },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_ADMISSION",
          },
          {
            refund_status: "Refunded",
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList",
          populate: {
            path: "fee_structure",
            select:
              "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
            populate: {
              path: "category_master",
              select: "category_name",
            },
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList",
          populate: {
            path: "studentClass",
            select: "className classTitle",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList",
          populate: {
            path: "batches",
            select: "batchName",
          },
        })
        .populate({
          path: "application",
          select: "applicationDepartment",
          populate: {
            path: "applicationDepartment",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();
      if (bank) {
        all_receipts = all_receipts?.filter((val) => {
          if (
            `${val?.application?.applicationDepartment?.bank_account?._id}` ===
            `${bank}`
          )
            return val;
        });
      }
      if (all_depart === "All") {
      } else if (all_depart === "Particular" && depart) {
        all_receipts = all_receipts?.filter((val) => {
          if (`${val?.application?.applicationDepartment?._id}` === `${depart}`)
            return val;
        });
      }
    }
    if (all_receipts?.length > 0) {
      res.status(200).send({
        message: "Explore Fee Receipt Heads Structure Query",
        access: true,
        all_receipts,
        count: all_receipts?.length,
      });
      all_receipts.sort(function (st1, st2) {
        return parseInt(st1?.invoice_count) - parseInt(st2?.invoice_count);
      });
      var head_list = [];
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { HeadsName, PaidHeadFees } = arr[i];
          obj[HeadsName] = PaidHeadFees;
        }
        return obj;
      };
      for (var ref of all_receipts) {
        var remain_list = await RemainingList.findOne({
          $and: [{ student: ref?.student }, { appId: ref?.application }],
        })
          .populate({
            path: "fee_structure",
            select:
              "applicable_fees total_admission_fees class_master batch_master unique_structure_name",
            populate: {
              path: "class_master batch_master",
              select: "className batchName",
            },
          })
          .populate({
            path: "appId",
            select: "applicationDepartment applicationBatch",
            populate: {
              path: "applicationDepartment applicationBatch",
              select: "dName batchName",
            },
          })
          .populate({
            path: "applicable_card",
          });
        var head_array = [];
        if (ref?.fee_heads?.length > 0) {
          for (var val of ref?.fee_heads) {
            if (`${val?.appId}` === `${ref?.application?._id}`) {
              head_array.push({
                HeadsName: val?.head_name,
                PaidHeadFees: val?.paid_fee,
              });
            }
          }
        }
        if (
          remain_list?.applicable_card?.paid_fee -
            remain_list?.applicable_card?.applicable_fee >
          0
        ) {
          if (`${val?.appId}` === `${ref?.application?._id}`) {
            head_array.push({
              HeadsName: "Excess Fees",
              PaidHeadFees:
                remain_list?.applicable_card?.paid_fee -
                remain_list?.applicable_card?.applicable_fee,
            });
          }
        }
        if (`${val?.appId}` === `${ref?.application?._id}`) {
          head_array.push({
            HeadsName: "Cancellation & Refund Charges",
            PaidHeadFees:
              remain_list?.applicable_card?.paid_fee - ref?.fee_payment_amount,
          });
        }
        if (ref?.fee_heads?.length > 0) {
          var result = await buildStructureObject(head_array);
        }
        if (result) {
          head_list.push({
            ReceiptNumber: ref?.invoice_count ?? "0",
            ReceiptDate: moment(ref?.created_at).format("DD-MM-YYYY") ?? "NA",
            TransactionAmount: ref?.fee_payment_amount ?? "0",
            TransactionDate:
              moment(ref?.fee_transaction_date).format("DD-MM-YYYY") ?? "NA",
            TransactionMode: ref?.fee_payment_mode ?? "#NA",
            BankName: ref?.fee_bank_name ?? "#NA",
            BankHolderName: ref?.fee_bank_holder ?? "#NA",
            BankUTR: ref?.fee_utr_reference ?? "#NA",
            GRNO: ref?.student?.studentGRNO ?? "#NA",
            Name:
              `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName
                  : ""
              } ${ref?.student?.studentLastName}` ?? "#NA",
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            Standard:
              `${remain_list?.fee_structure?.class_master?.className}` ?? "#NA",
            Batch: remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
            FeeStructure:
              remain_list?.fee_structure?.unique_structure_name ?? "#NA",
            TotalFees: remain_list?.fee_structure?.total_admission_fees ?? "0",
            ApplicableFees: remain_list?.fee_structure?.applicable_fees ?? "0",
            TotalPaidFees: remain_list?.paid_fee,
            TotalOutstanding: remain_list?.remaining_fee,
            Remark: remain_list?.remark ?? "#NA",
            DepartmentBankName:
              ref?.application?.applicationDepartment?.bank_account
                ?.finance_bank_name ?? "#NA",
            DepartmentBankAccountNumber:
              ref?.application?.applicationDepartment?.bank_account
                ?.finance_bank_account_number ?? "#NA",
            DepartmentBankAccountHolderName:
              ref?.application?.applicationDepartment?.bank_account
                ?.finance_bank_account_name ?? "#NA",
            Narration: `Being Fees Refunded By ${
              ref?.fee_payment_mode
            } Date ${moment(ref?.fee_transaction_date).format(
              "DD-MM-YYYY"
            )} Rs. ${ref?.fee_payment_amount} out of Rs. ${
              ref?.student.fee_structure?.total_admission_fees
            } to ${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName} (${
              ref?.student.fee_structure?.category_master?.category_name
            }) Towards Fees For ${ref?.student?.studentClass?.className}-${
              ref?.student?.studentClass?.classTitle
            } For Acacdemic Year ${ref?.student?.batches?.batchName}.`,
            ...result,
          });
          result = [];
        }
        head_array = [];
      }

      await fee_heads_receipt_json_to_excel_query(
        head_list,
        institute?.insName,
        institute?._id
      );
    } else {
      res.status(200).send({
        message: "No Fee Receipt Heads Structure Query",
        access: false,
        all_students: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDayBookReceipt = async () => {
  try {
    const all_finance = await Finance.find({});
    for (var fid of all_finance) {
      var g_year;
      var l_year;
      var g_month;
      var l_month;

      var sorted_array = [];
      let exist = custom_date_time_reverse_db(1);
      const db_exist = await DayBook.findOne({
        $and: [
          { finance: fid?._id },
          { db_file_date: { $regex: `${exist}`, $options: "i" } },
          { db_file_type: "DAYBOOK_RECEIPT" },
        ],
      });
      if (db_exist?.db_status === "GENERATED") {
        console.log("DBG");
      } else {
        var db = new DayBook({});
        const admin = await Admin.findById({
          _id: `${process.env.S_ADMIN_ID}`,
        });
        const finance = await Finance.findById({ _id: fid?._id }).populate({
          path: "financeHead",
          select: "user",
        });
        const institute = await InstituteAdmin.findById({
          _id: `${finance?.institute}`,
        });
        const date = new Date(new Date());
        date.setDate(date.getDate() - 1);
        var g_year = new Date().getFullYear();
        var g_day = new Date().getDate();
        var l_year = date.getFullYear();
        var l_day = date.getDate();
        var g_month = new Date().getMonth() + 1;
        if (g_month < 10) {
          g_month = `0${g_month}`;
        }
        if (g_day < 10) {
          g_day = `0${g_day}`;
        }
        var l_month = date.getMonth() + 1;
        if (l_month < 10) {
          l_month = `0${l_month}`;
        }
        if (l_day < 10) {
          l_day = `0${l_day}`;
        }
        var g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
        var l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid?._id },
            {
              created_at: {
                $gte: l_date,
                $lte: g_date,
              },
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
          ],
        })
          .sort({ invoice_count: "1" })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
            populate: {
              path: "fee_structure",
              select:
                "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
            populate: {
              path: "studentClass",
              select: "className classTitle",
            },
          })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
            populate: {
              path: "batches",
              select: "batchName",
            },
          })
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
        if (all_receipts?.length > 0) {
          all_receipts.sort(function (st1, st2) {
            return parseInt(st1?.invoice_count) - parseInt(st2?.invoice_count);
          });
          const financeUser = await User.findById({
            _id: `${finance?.financeHead?.user}`,
          });
          var p_amount = 0;
          for (var val of all_receipts) {
            p_amount += val?.fee_payment_amount;
          }
          const notify = new Notification({});
          db.finance = finance?._id;
          db.db_file_date = custom_date_time_reverse_db(1);
          notify.notifyContent = `New DayBook Generated with Rs. ${p_amount}`;
          notify.notifySender = institute._id;
          notify.notifyCategory = `${institute?.name}-DayBook-${db?.db_file_date}`;
          notify.notifyReceiever = institute?._id;
          institute.iNotify.push(notify._id);
          financeUser.uNotify.push(notify._id);
          notify.institute = institute._id;
          notify.notifyBySuperAdminPhoto =
            "https://qviple.com/images/newLogo.svg";
          finance.day_book.push(db?._id);
          finance.day_book_count += 1;
          db.db_amount = p_amount;
          db.db_status = "GENERATED";
          await Promise.all([
            institute.save(),
            notify.save(),
            db.save(),
            finance.save(),
            financeUser.save(),
          ]);
          var head_list = [];
          const buildStructureObject = async (arr) => {
            var obj = {};
            for (let i = 0; i < arr.length; i++) {
              const { HeadsName, PaidHeadFees } = arr[i];
              obj[HeadsName] = PaidHeadFees;
            }
            return obj;
          };
          for (var ref of all_receipts) {
            var remain_list = await RemainingList.findOne({
              $and: [{ student: ref?.student }, { appId: ref?.application }],
            })
              .populate({
                path: "fee_structure",
                select:
                  "applicable_fees total_admission_fees class_master batch_master unique_structure_name",
                populate: {
                  path: "class_master batch_master",
                  select: "className batchName",
                },
              })
              .populate({
                path: "appId",
                select: "applicationDepartment applicationBatch",
                populate: {
                  path: "applicationDepartment applicationBatch",
                  select: "dName batchName",
                },
              });
            var head_array = [];
            if (ref?.fee_heads?.length > 0) {
              for (var val of ref?.fee_heads) {
                head_array.push({
                  HeadsName: val?.head_name,
                  PaidHeadFees: val?.original_paid,
                });
              }
            }
            if (remain_list?.paid_fee - remain_list?.applicable_fee > 0) {
              head_array.push({
                HeadsName: "Excess Fees",
                PaidHeadFees:
                  remain_list?.paid_fee - remain_list?.applicable_fee,
              });
            }
            if (ref?.fee_heads?.length > 0) {
              var result = await buildStructureObject(head_array);
            }
            if (result) {
              head_list.push({
                ReceiptNumber: ref?.invoice_count ?? "0",
                ReceiptDate:
                  moment(ref?.created_at).format("DD-MM-YYYY") ?? "NA",
                TransactionAmount: ref?.fee_payment_amount ?? "0",
                TransactionDate:
                  moment(ref?.fee_transaction_date).format("DD-MM-YYYY") ??
                  "NA",
                TransactionMode: ref?.fee_payment_mode ?? "#NA",
                BankName: ref?.fee_bank_name ?? "#NA",
                BankHolderName: ref?.fee_bank_holder ?? "#NA",
                BankUTR: ref?.fee_utr_reference ?? "#NA",
                GRNO: ref?.student?.studentGRNO ?? "#NA",
                Name:
                  `${ref?.student?.studentFirstName} ${
                    ref?.student?.studentMiddleName
                      ? ref?.student?.studentMiddleName
                      : ""
                  } ${ref?.student?.studentLastName}` ?? "#NA",
                FirstName: ref?.student?.studentFirstName ?? "#NA",
                FatherName:
                  ref?.student?.studentFatherName ??
                  ref?.student?.studentMiddleName,
                LastName: ref?.student?.studentLastName ?? "#NA",
                Gender: ref?.student?.studentGender ?? "#NA",
                Standard:
                  `${remain_list?.fee_structure?.class_master?.className}` ??
                  "#NA",
                Batch:
                  remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
                FeeStructure:
                  remain_list?.fee_structure?.unique_structure_name ?? "#NA",
                TotalFees:
                  remain_list?.fee_structure?.total_admission_fees ?? "0",
                ApplicableFees:
                  remain_list?.fee_structure?.applicable_fees ?? "0",
                PaidByStudent: remain_list?.paid_by_student,
                PaidByGovernment: remain_list?.paid_by_government,
                TotalPaidFees: remain_list?.paid_fee,
                ApplicableOutstanding:
                  remain_list?.fee_structure?.applicable_fees -
                    remain_list?.paid_fee >
                  0
                    ? remain_list?.fee_structure?.applicable_fees -
                      remain_list?.paid_fee
                    : 0,
                TotalOutstanding: remain_list?.remaining_fee,
                Remark: remain_list?.remark ?? "#NA",
                DepartmentBankName:
                  ref?.application?.applicationDepartment?.bank_account
                    ?.finance_bank_name ?? "#NA",
                DepartmentBankAccountNumber:
                  ref?.application?.applicationDepartment?.bank_account
                    ?.finance_bank_account_number ?? "#NA",
                DepartmentBankAccountHolderName:
                  ref?.application?.applicationDepartment?.bank_account
                    ?.finance_bank_account_name ?? "#NA",
                Narration: `Being Fees Received By ${
                  ref?.fee_payment_mode
                } Date ${moment(ref?.fee_transaction_date).format(
                  "DD-MM-YYYY"
                )} Rs. ${ref?.fee_payment_amount} out of Rs. ${
                  ref?.student.fee_structure?.total_admission_fees
                } Paid By ${ref?.student?.studentFirstName} ${
                  ref?.student?.studentMiddleName
                    ? ref?.student?.studentMiddleName
                    : ""
                } ${ref?.student?.studentLastName} (${
                  ref?.student.fee_structure?.category_master?.category_name
                }) Towards Fees For ${ref?.student?.studentClass?.className}-${
                  ref?.student?.studentClass?.classTitle
                } For Acacdemic Year ${ref?.student?.batches?.batchName}.`,
                ...result,
              });
              result = [];
            }
            head_array = [];
          }

          await fee_heads_receipt_json_to_excel_daybook_query(
            head_list,
            db?._id,
            "DAYBOOK_RECEIPT"
          );
          invokeSpecificRegister(
            "Specific Notification",
            `Qviple Send New DayBook with ${p_amount} to you`,
            `${institute?.name}`,
            financeUser._id,
            financeUser.deviceToken
          );
        } else {
          console.log("No Fee Receipt Heads Structure Query");
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderDayBookPayment = async () => {
  try {
    const all_finance = await Finance.find({});
    for (var fid of all_finance) {
      var g_year;
      var l_year;
      var g_month;
      var l_month;

      let exist = custom_date_time_reverse_db(1);
      const db_exist = await DayBook.findOne({
        $and: [
          { finance: fid?._id },
          { db_file_date: { $regex: `${exist}`, $options: "i" } },
          { db_file_type: "DAYBOOK_PAYMENTS" },
        ],
      });
      if (db_exist?.db_status === "GENERATED") {
        console.log("DBG");
      } else {
        var db = new DayBook({});
        var sorted_array = [];
        const admin = await Admin.findById({
          _id: `${process.env.S_ADMIN_ID}`,
        });
        const finance = await Finance.findById({ _id: fid?._id }).populate({
          path: "financeHead",
          select: "user",
        });
        const institute = await InstituteAdmin.findById({
          _id: `${finance?.institute}`,
        });
        const date = new Date(new Date());
        date.setDate(date.getDate() - 1);
        var g_year = new Date().getFullYear();
        var g_day = new Date().getDate();
        var l_year = date.getFullYear();
        var l_day = date.getDate();
        var g_month = new Date().getMonth() + 1;
        if (g_month < 10) {
          g_month = `0${g_month}`;
        }
        if (g_day < 10) {
          g_day = `0${g_day}`;
        }
        var l_month = date.getMonth() + 1;
        if (l_month < 10) {
          l_month = `0${l_month}`;
        }
        if (l_day < 10) {
          l_day = `0${l_day}`;
        }
        var g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
        var l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid?._id },
            {
              created_at: {
                $gte: l_date,
                $lte: g_date,
              },
            },
            {
              refund_status: "Refunded",
            },
            {
              visible_status: "Not Hide",
            },
          ],
        })
          .sort({ invoice_count: "1" })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
            populate: {
              path: "fee_structure",
              select:
                "structure_name unique_structure_name category_master total_admission_fees applicable_fees",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
            populate: {
              path: "studentClass",
              select: "className classTitle",
            },
          })
          .populate({
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList department",
            populate: {
              path: "batches",
              select: "batchName",
            },
          })
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
        if (all_receipts?.length > 0) {
          all_receipts.sort(function (st1, st2) {
            return parseInt(st1?.invoice_count) - parseInt(st2?.invoice_count);
          });
          const financeUser = await User.findById({
            _id: `${finance?.financeHead?.user}`,
          });
          var p_amount = 0;
          for (var val of all_receipts) {
            p_amount += val?.fee_payment_amount;
          }
          const notify = new Notification({});
          db.finance = finance?._id;
          db.db_file_date = custom_date_time_reverse_db(1);
          finance.day_book.push(db?._id);
          finance.day_book_count += 1;
          db.db_amount = p_amount;
          notify.notifyContent = `New DayBook Generated with Rs. ${p_amount}`;
          notify.notifySender = institute._id;
          notify.notifyCategory = `${institute?.name}-DayBook-${db?.db_file_date}`;
          notify.notifyReceiever = institute?._id;
          institute.iNotify.push(notify._id);
          financeUser.uNotify.push(notify._id);
          notify.institute = institute._id;
          notify.notifyBySuperAdminPhoto =
            "https://qviple.com/images/newLogo.svg";
          await Promise.all([
            institute.save(),
            notify.save(),
            db.save(),
            finance.save(),
            financeUser.save(),
          ]);
          var head_list = [];
          const buildStructureObject = async (arr) => {
            var obj = {};
            for (let i = 0; i < arr.length; i++) {
              const { HeadsName, PaidHeadFees } = arr[i];
              obj[HeadsName] = PaidHeadFees;
            }
            return obj;
          };
          for (var ref of all_receipts) {
            var remain_list = await RemainingList.findOne({
              $and: [{ student: ref?.student }, { appId: ref?.application }],
            })
              .populate({
                path: "fee_structure",
                select:
                  "applicable_fees total_admission_fees class_master batch_master unique_structure_name",
                populate: {
                  path: "class_master batch_master",
                  select: "className batchName",
                },
              })
              .populate({
                path: "appId",
                select: "applicationDepartment applicationBatch",
                populate: {
                  path: "applicationDepartment applicationBatch",
                  select: "dName batchName",
                },
              });
            var head_array = [];
            if (ref?.fee_heads?.length > 0) {
              for (var val of ref?.fee_heads) {
                head_array.push({
                  HeadsName: val?.head_name,
                  PaidHeadFees: val?.original_paid,
                });
              }
            }
            if (remain_list?.paid_fee - remain_list?.applicable_fee > 0) {
              head_array.push({
                HeadsName: "Excess Fees",
                PaidHeadFees:
                  remain_list?.paid_fee - remain_list?.applicable_fee,
              });
            }
            if (ref?.fee_heads?.length > 0) {
              var result = await buildStructureObject(head_array);
            }
            if (result) {
              head_list.push({
                ReceiptNumber: ref?.invoice_count ?? "0",
                ReceiptDate:
                  moment(ref?.created_at).format("DD-MM-YYYY") ?? "NA",
                TransactionAmount: ref?.fee_payment_amount ?? "0",
                TransactionDate:
                  moment(ref?.fee_transaction_date).format("DD-MM-YYYY") ??
                  "NA",
                TransactionMode: ref?.fee_payment_mode ?? "#NA",
                BankName: ref?.fee_bank_name ?? "#NA",
                BankHolderName: ref?.fee_bank_holder ?? "#NA",
                BankUTR: ref?.fee_utr_reference ?? "#NA",
                GRNO: ref?.student?.studentGRNO ?? "#NA",
                Name:
                  `${ref?.student?.studentFirstName} ${
                    ref?.student?.studentMiddleName
                      ? ref?.student?.studentMiddleName
                      : ""
                  } ${ref?.student?.studentLastName}` ?? "#NA",
                FirstName: ref?.student?.studentFirstName ?? "#NA",
                FatherName:
                  ref?.student?.studentFatherName ??
                  ref?.student?.studentMiddleName,
                LastName: ref?.student?.studentLastName ?? "#NA",
                Gender: ref?.student?.studentGender ?? "#NA",
                Standard:
                  `${remain_list?.fee_structure?.class_master?.className}` ??
                  "#NA",
                Batch:
                  remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
                FeeStructure:
                  remain_list?.fee_structure?.unique_structure_name ?? "#NA",
                TotalFees:
                  remain_list?.fee_structure?.total_admission_fees ?? "0",
                ApplicableFees:
                  remain_list?.fee_structure?.applicable_fees ?? "0",
                PaidByStudent: remain_list?.paid_by_student,
                PaidByGovernment: remain_list?.paid_by_government,
                TotalPaidFees: remain_list?.paid_fee,
                ApplicableOutstanding:
                  remain_list?.fee_structure?.applicable_fees -
                    remain_list?.paid_fee >
                  0
                    ? remain_list?.fee_structure?.applicable_fees -
                      remain_list?.paid_fee
                    : 0,
                TotalOutstanding: remain_list?.remaining_fee,
                Remark: remain_list?.remark ?? "#NA",
                DepartmentBankName:
                  ref?.application?.applicationDepartment?.bank_account
                    ?.finance_bank_name ?? "#NA",
                DepartmentBankAccountNumber:
                  ref?.application?.applicationDepartment?.bank_account
                    ?.finance_bank_account_number ?? "#NA",
                DepartmentBankAccountHolderName:
                  ref?.application?.applicationDepartment?.bank_account
                    ?.finance_bank_account_name ?? "#NA",
                Narration: `Being Fees Received By ${
                  ref?.fee_payment_mode
                } Date ${moment(ref?.fee_transaction_date).format(
                  "DD-MM-YYYY"
                )} Rs. ${ref?.fee_payment_amount} out of Rs. ${
                  ref?.student.fee_structure?.total_admission_fees
                } Paid By ${ref?.student?.studentFirstName} ${
                  ref?.student?.studentMiddleName
                    ? ref?.student?.studentMiddleName
                    : ""
                } ${ref?.student?.studentLastName} (${
                  ref?.student.fee_structure?.category_master?.category_name
                }) Towards Fees For ${ref?.student?.studentClass?.className}-${
                  ref?.student?.studentClass?.classTitle
                } For Acacdemic Year ${ref?.student?.batches?.batchName}.`,
                ...result,
              });
              result = [];
            }
            head_array = [];
          }

          await fee_heads_receipt_json_to_excel_daybook_query(
            head_list,
            db?._id,
            "DAYBOOK_PAYMENTS"
          );
          invokeSpecificRegister(
            "Specific Notification",
            `Qviple Send New DayBook with ${p_amount} to you`,
            `${institute?.name}`,
            financeUser._id,
            financeUser.deviceToken
          );
        } else {
          console.log("No Fee Receipt Heads Structure Query");
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllDayBookReceipt = async (req, res) => {
  try {
    const { fid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const fn = await Finance.findById({ _id: fid }).select("day_book");

    const all_db = await DayBook.find({
      $and: [
        { _id: { $in: fn?.day_book } },
        { db_file_type: "DAYBOOK_RECEIPT" },
      ],
    })
      .sort({ db_created: -1 })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "finance",
        select: "institute",
        populate: {
          path: "institute",
          select: "insName name photoId insProfilePhoto",
        },
      });

    if (all_db?.length > 0) {
      res.status(200).send({
        message: "Explore All Day Book Receipts Query",
        access: true,
        all_db: [], //all_db,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllDayBookPayment = async (req, res) => {
  try {
    const { fid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const fn = await Finance.findById({ _id: fid }).select("day_book");

    const all_db = await DayBook.find({
      $and: [
        { _id: { $in: fn?.day_book } },
        { db_file_type: "DAYBOOK_PAYMENTS" },
      ],
    })
      .sort({ db_created: -1 })
      .limit(limit)
      .skip(skip)
      .populate({
        path: "finance",
        select: "institute",
        populate: {
          path: "institute",
          select: "insName name photoId insProfilePhoto",
        },
      });

    if (all_db?.length > 0) {
      res.status(200).send({
        message: "Explore All Day Book Payments Query",
        access: true,
        all_db: [], //all_db,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllSlipQuery = async (req, res) => {
  try {
    const { pid } = req?.params;
    const { month, year } = req?.body;
    if (!pid)
      return res.status(200).send({
        message: "Thier is a bug need to fixed immediately",
        access: false,
      });
    var payroll = await PayrollModule.findById({ _id: pid });
    var all_slip = await PaySlip.find({
      $and: [
        { _id: { $in: payroll?.pay_slip } },
        { month: month },
        { year: year },
      ],
    }).populate({
      path: "staff",
      select:
        "staffFirstName staffMiddleName staffLastName staffPanNumber staff_grant_status",
    });
    var excel_list = [];
    if (all_slip?.length > 0) {
      for (var val of all_slip) {
        var name = `${val?.staff?.staffFirstName} ${
          val?.staff?.staffMiddleName ? val?.staff?.staffMiddleName : ""
        } ${val?.staff?.staffLastName}`;
        excel_list.push({
          Month: val?.month,
          Year: val?.year,
          PAN: val?.staff?.staffPanNumber ?? "#NA",
          Name: name ?? "#NA",
          NetPrice: val?.net_payable ?? "#NA",
          GrantStatus: val?.staff?.staff_grant_status,
        });
      }
      const data = await json_to_excel_slip_export_query("PAYSLIP", excel_list);
      res.status(200).send({
        message: "Explore Salary Slip Fees Query",
        access: true,
        data: data,
      });
    } else {
      res.status(200).send({
        message: "No Salary Slip Query",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

// exports.renderStudentStatisticsExcelQuery = async (req, res) => {
//   try {
//     const { hid } = req?.query
//     // const { all_arr, batch, depart } = req.body;
//     // if (!all_arr)
//     //   return res.status(200).send({
//     //     message: "Their is a bug need to fixed immediately",
//     //     access: false,
//     //   });
//     var hostel = await Hostel.findById({ _id: hid })
//     var valid_all_students = await Student.find({ hostel_fee_structure: { $in: hostel?.fees_structures } })
//     .populate({
//       path: "student_bed_number",
//       populate: {
//         path: "hostelRoom",
//         select: "room_name hostelUnit",
//         populate: {
//           path: "hostelUnit",
//           select: "hostel_unit_name"
//         }
//       }
//     })
//     // var applicable_os_fees = 0
//     // var total_fees = 0
//     // var total_os_fees = 0
//     // var government_os_fees = 0
//     var excel_list = [];
//     var head_list = [];
//       const buildStructureObject = async (arr) => {
//         var obj = {};
//         for (let i = 0; i < arr.length; i++) {
//           const { HeadsName, PaidHeadFees } = arr[i];
//           obj[HeadsName] = PaidHeadFees;
//         }
//         return obj;
//       };
//     // var all_app = await NewApplication.find({ $and: [{ applicationDepartment: depart}, { applicationBatch: batch}]})
//     for (var ref of valid_all_students) {
//     var one_remain = await RemainingList.findOne({  $and: [{ student: ref?._id}, { fee_structure: { $in: hostel?.fees_structures }}]})
//     .populate({
//       path: "fee_structure",
//       populate: {
//         path: "class_master batch_master",
//         select: "className batchName"
//       }
//     })
//     var head_array = [];
//         if (ref?.active_fee_heads?.length > 0) {
//           for (var val of ref?.active_fee_heads) {
//             if (`${val?.appId}` === `${one_remain?.appId}`) {
//               head_array.push({
//                 HeadsName: val?.head_name,
//                 PaidHeadFees: val?.paid_fee,
//               });
//             }
//           }
//         }
//         if (one_remain?.paid_fee - one_remain?.applicable_fee > 0) {
//           if (`${val?.appId}` === `${one_remain?.appId}`) {
//             head_array.push({
//               HeadsName: "Excess Fees",
//               PaidHeadFees: one_remain?.paid_fee - one_remain?.applicable_fee,
//             });
//           }
//         }
//         if (ref?.active_fee_heads?.length > 0) {
//           var result = await buildStructureObject(head_array);
//         }
//       excel_list.push({
//         RollNo: ref?.studentROLLNO ?? "NA",
//         AbcId: ref?.student_abc_id ?? "#NA",
//         GRNO: ref?.studentGRNO ?? "#NA",
//         Name: `${ref?.studentFirstName} ${
//           ref?.studentMiddleName ? ref?.studentMiddleName : ""
//         } ${ref?.studentLastName}` ?? ref?.valid_full_name,
//         DOB: ref?.studentDOB ?? "#NA",
//         Gender: ref?.studentGender ?? "#NA",
//         BedNumber: ref?.student_bed_number?.bed_number ?? "#NA",
//         RoomName: ref?.student_bed_number?.hostelRoom?.room_name ?? "#NA",
//         UnitName: ref?.student_bed_number?.hostelRoom?.hostelUnit?.hostel_unit_name ?? "#NA",
//         TotalFees: one_remain?.applicable_fee ?? 0,
//         TotalOutstandingFees: one_remain?.remaining_fee,
//         TotalPaidFees: one_remain?.paid_fee,
//         TotalApplicableOutstandingFees: one_remain?.paid_fee <= one_remain?.fee_structure?.applicable_fees ? one_remain?.fee_structure?.applicable_fees - one_remain?.paid_fee : 0,
//         Standard: `${one_remain?.fee_structure}` ? `${one_remain?.fee_structure?.class_master?.className}` : "#NA",
//         Batch: `${one_remain?.fee_structure}` ? `${one_remain?.fee_structure?.batch_master?.batchName}` : "#NA",
//         FeeStructure: one_remain?.fee_structure?.unique_structure_name,
//         ...result
//       });
//       result = []
//     }
//     // console.log(excel_list)
//     const data = await json_to_excel_statistics_promote_query(
//       excel_list,
//     );

//     res.status(200).send({
//       message: "Explore Statistics with Admission Fee Query",
//       access: true,
//       data: data,
//       // excel_list: excel_list
//     });
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.renderClassWiseQuery = async (req, res) => {
//   try {
//     const all_classes = await Class.find({})

//     // for (var cls of all_classes) {
//     //   var all_student = await Student.find({ studentClass: cls?._id })
//     // }
//   }
//   catch (e) {
//     console.log(e)
//   }
// }

// exports.renderReviewShuffledStudentQuery = async(req, res) => {
//   try{
//     const { cid, shuffle_arr } = req.body;
//     if (!shuffle_arr?.length)
//       return res.status(200).send({
//         message: "Their is a bug need to fixed immediatley",
//         access: false,
//       });
//       if(shuffle_arr?.length > 0){
//       const classes = await Class.findById({ _id: cid })
//       classes.ApproveStudent = []
//       await classes.save()
//       var i = 0
//       for(var val of shuffle_arr){
//         classes.ApproveStudent.push(val)
//         const student = await Student.findById({ _id: `${val}`})
//         student.studentROLLNO = i + 1
//         i += 1
//         await student.save()
//       }
//       classes.shuffle_on = true
//       await classes.save()
//       res.status(200).send({ message: "Explore Class Wise Shuffling Query", access: true})
//     }
//   }
//   catch(e){
//     console.log(e)
//   }
// }

exports.renderTallyPriceQuery = async (req, res) => {
  // try {
  //   var { arr } = req.body;
  //   const { search } = req.query;
  //   var list = [];
  //   var all_apps = await NewApplication.find({ _id: { $in: arr } });
  //   for (var ref of all_apps) {
  //     ref?.confirmedApplication?.filter((val) => {
  //       var valid_val = moment(val?.apply_on).format("YYYY-MM-DD");
  //       if (`2023-08-14` === `${valid_val}`) {
  //         list.push(val?.student);
  //       }
  //       if (`2023-08-15` === `${valid_val}`) {
  //         list.push(val?.student);
  //       }
  //       if (`2023-08-16` === `${valid_val}`) {
  //         list.push(val?.student);
  //       }
  //       if (`2023-08-17` === `${valid_val}`) {
  //         list.push(val?.student);
  //       }
  //     });
  //   }
  //   var total = 0;
  //   if (search) {
  //     var all_remain = await RemainingList.find({ student: { $in: list } })
  //       .select("paid_fee")
  //       .populate({
  //         path: "student",
  //         match: {
  //           studentFirstName: { $regex: `${search}`, $options: "i" },
  //         },
  //         select: "studentFirstName valid_full_name fee_receipt",
  //       });
  //     // .populate({
  //     //   path: "fee_receipts",
  //     // });
  //   } else {
  //     var all_remain = await RemainingList.find({ student: { $in: list } })
  //       .select("paid_fee")
  //       .populate({
  //         path: "student",
  //         select: "studentFirstName valid_full_name fee_receipt",
  //       });
  //     // .populate({
  //     //   path: "fee_receipts",
  //     // });
  //   }
  //   for (var val of all_remain) {
  //     total += val?.paid_fee;
  //   }
  //   var calc = [];
  //   // for (var val of all_remain) {
  //   //   if (val?.student?.fee_receipt?.length > 1) {
  //   //     calc.push(val?.student?._id);
  //   //   }
  //   // }
  //   var all_exist = await FeeReceipt.find({ student: { $in: list } }).select(
  //     "student"
  //   );
  //   for (var ref of all_exist) {
  //     calc.push(ref?.student);
  //   }
  //   var u_arr = [...new Set(calc)];
  //   var data = {
  //     total: total,
  //     // pay: total - calc,
  //     // all_remain,
  //     // all_exist,
  //     u_arr: u_arr?.length,
  //     calc: calc?.length,
  //   };
  //   res
  //     .status(200)
  //     .send({ message: "Explore All TALLY", access: true, data: data });
  // } catch (e) {
  //   console.log(e);
  // }
};

exports.render_daybook_heads_wise = async (req, res) => {
  try {
    const { fid } = req.params;
    const { from, to, bank, payment_type, staff } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    res.status(200).send({
      message: "Explore Day Book Heads Query",
      access: true,
    });
    await bankDaybook(fid, from, to, bank, payment_type, "", staff);
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    var sorted_array = [];
    const bank_acc = await BankAccount.findById({ _id: bank });
    const finance = await Finance.findById({ _id: fid }).select("institute");
    if (bank_acc?.bank_account_type === "Society") {
      var all_struct = await FeeStructure.find({
        $and: [{ finance: finance?._id }, { document_update: false }],
      });
    } else {
      var all_struct = await FeeStructure.find({
        $and: [
          { department: { $in: bank_acc?.departments } },
          { document_update: false },
        ],
      });
    }
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select(
      "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
    );

    var g_year = new Date(`${from}`).getFullYear();
    var g_day = new Date(`${from}`).getDate();
    var l_year = new Date(`${to}`).getFullYear();
    var l_day = new Date(`${to}`).getDate();
    var g_month = new Date(`${from}`).getMonth() + 1;
    if (g_month < 10) {
      g_month = `0${g_month}`;
    }
    if (g_day < 10) {
      g_day = `0${g_day}`;
    }
    var l_month = new Date(`${to}`).getMonth() + 1;
    if (l_month < 10) {
      l_month = `0${l_month}`;
    }
    if (l_day < 10) {
      l_day = `0${l_day}`;
    }
    const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
    const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
    date.setDate(date.getDate() + 1);
    let l_dates = date.getDate();
    if (l_dates < 10) {
      l_dates = `0${l_dates}`;
    }
    var l_months = l_month;
    let list1 = ["01", "03", "05", "07", "08", "10", "12"];
    let list2 = ["04", "06", "09", "11"];
    let list3 = ["02"];
    let g_days = l_months?.toString();
    let l_days = l_months?.toString();
    if (g_day == 30 && list2?.includes(String(g_days))) {
      date.setMonth(date.getMonth() + 1);
      var l_months = date.getMonth();
      if (l_months < 10) {
        l_months = `0${l_months}`;
      }
    }
    if (g_day == 31) {
      if (g_day >= 31 && list1?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
    } else {
      if (l_day == 31 && list1?.includes(String(l_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
    }
    const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
    // console.log(l_date, g_date, l_months);
    if (payment_type) {
      if (payment_type == "BOTH") {
        var all_receipts_set = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              created_at: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_ADMISSION",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
          )
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
        var all_receipts = all_receipts_set?.filter((val) => {
          if (
            `${val?.fee_payment_mode}` === "By Cash" ||
            `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
            `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
            `${val?.fee_payment_mode}` === "Cheque" ||
            `${val?.fee_payment_mode}` === "Net Banking" ||
            `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
            `${val?.fee_payment_mode}` === "UPI Transfer" ||
            `${val?.fee_payment_mode}` === "Demand Draft"
          ) {
            return val;
          }
        });
      } else if (payment_type == "CASH_BANK") {
        var all_receipts_set = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              created_at: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_ADMISSION",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
          )
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
        var all_receipts = all_receipts_set?.filter((val) => {
          if (
            `${val?.fee_payment_mode}` === "By Cash" ||
            `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
            `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
            `${val?.fee_payment_mode}` === "Cheque" ||
            `${val?.fee_payment_mode}` === "Net Banking" ||
            `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
            `${val?.fee_payment_mode}` === "UPI Transfer" ||
            `${val?.fee_payment_mode}` === "Demand Draft"
          ) {
            return val;
          }
        });
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              created_at: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_ADMISSION",
            },
            {
              refund_status: "No Refund",
            },
            {
              fee_payment_mode: payment_type,
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
          )
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
      }
    } else {
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_ADMISSION",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select("fee_heads application fee_payment_mode")
        .populate({
          path: "application",
          select: "applicationDepartment",
          populate: {
            path: "applicationDepartment",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();
    }
    // console.log(all_receipts)
    if (bank_acc?.bank_account_type === "Society") {
    } else {
      all_receipts = all_receipts?.filter((val) => {
        if (
          `${val?.application?.applicationDepartment?.bank_account?._id}` ===
          `${bank}`
        )
          return val;
      });
    }
    let heads_queue = [];
    if (bank_acc?.bank_account_type === "Society") {
      for (let ele of all_struct) {
        for (let val of ele?.applicable_fees_heads) {
          if (val?.is_society == true) {
            if (heads_queue?.includes(`${val?.master}`)) {
            } else {
              heads_queue.push(val?.master);
            }
          }
        }
      }
    } else {
      for (let ele of all_struct) {
        for (let val of ele?.applicable_fees_heads) {
          if (val?.is_society == false) {
            if (heads_queue?.includes(`${val?.master}`)) {
            } else {
              heads_queue.push(val?.master);
            }
          }
        }
      }
    }
    const all_master = await FeeMaster.find({
      _id: { $in: heads_queue },
    }).select("master_name");
    var obj = {};
    var nest_obj = [];
    for (let ele of all_master) {
      obj["head_name"] = ele?.master_name;
      obj["head_amount"] = 0;
      obj["cash_head_amount"] = 0;
      obj["pg_head_amount"] = 0;
      obj["bank_head_amount"] = 0;
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }
    // var t = 0
    var t = [];
    var l = [];
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
        if (payment_type == "BOTH") {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (ele?.fee_payment_mode == "By Cash") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Net Banking") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "UPI Transfer") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Cheque") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Demand Draft") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          }
        } else if (payment_type == "CASH_BANK") {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (ele?.fee_payment_mode == "By Cash") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Net Banking") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "UPI Transfer") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Cheque") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Demand Draft") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          }
        } else {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                  // if (val?.master == "6654be24e36490a31bccd1db") {
                  //   t.push(`${val?.original_paid}`);
                  // }
                  // if (val?.master == "6654be3de36490a31bccd257") {
                  //   l.push(`${val?.original_paid}`);
                  // }
                  // t+= val?.original_paid
                }
              }
            }
          }
        }
      }
      // nest_obj.push({
      //   head_name: "Total Fees",
      //   head_amount: t
      // })
      all_receipts.sort(function (st1, st2) {
        return (
          parseInt(st1?.invoice_count?.substring(14)) -
          parseInt(st2?.invoice_count?.substring(14))
        );
      });
      // res.status(200).send({
      //   message: "Explore Day Book Heads Query",
      //   access: true,
      //   all_receipts: all_receipts?.length,
      //   //   t: t,
      //   //   tl: t?.length,
      //   //  l:l,
      //   //  ll:l?.length
      //   results: nest_obj,
      //   range: `${all_receipts[0]?.invoice_count?.substring(
      //     14
      //   )} To ${all_receipts[
      //     all_receipts?.length - 1
      //   ]?.invoice_count?.substring(14)}`,
      //   // account_info: bank_acc,
      //   // day_range_from: from,
      //   // day_range_to: to,
      //   // ins_info: institute,
      // });
    } else {
      // res.status(200).send({
      //   message: "No Day Book Heads Query",
      //   access: false,
      //   results: [],
      // });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_daybook_query = async (req, res) => {
  try {
    const { baid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { type } = req?.query;
    if (!baid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const bank_acc = await BankAccount.findById({ _id: baid }).populate({
      path: "day_book",
      populate: {
        path: "bank",
        select:
          "finance_bank_account_number finance_bank_name finance_bank_account_name",
      },
    });

    if (type) {
      var book = bank_acc?.day_book?.filter((ele) => {
        if (`${ele?.types}` === `${type}`) return ele;
      });
    } else {
      var book = bank_acc?.day_book?.filter((ele) => {
        if (`${ele?.types}` === `Normal Other Fees`) {
          return;
        } else {
          return ele;
        }
      });
    }

    if (type) {
      var all_daybook = await nested_document_limit(
        page,
        limit,
        book?.reverse()
      );
    } else {
      var all_daybook = await nested_document_limit(
        page,
        limit,
        book?.reverse()
      );
    }

    res.status(200).send({
      message: "Explore All Day Book Query",
      access: true,
      all_daybook: all_daybook,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_daybook_edit_query = async (req, res) => {
  try {
    const { baid } = req?.params;
    const { dbid, excel_file_name } = req?.body;
    if (!baid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const bank_acc = await BankAccount.findById({ _id: baid });
    for (let ele of bank_acc?.day_book) {
      if (`${ele?._id}` === `${dbid}`) {
        ele.excel_file_name = excel_file_name
          ? excel_file_name
          : ele?.excel_file_name;
      }
    }

    await bank_acc.save();

    res
      .status(200)
      .send({ message: "Explore One Day Book Edit Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_daybook_delete_query = async (req, res) => {
  try {
    const { baid } = req?.params;
    const { dbid } = req?.body;
    if (!baid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const bank_acc = await BankAccount.findById({ _id: baid });
    for (let ele of bank_acc?.day_book) {
      if (`${ele?._id}` === `${dbid}`) {
        bank_acc.day_book.pull(ele?._id);
      }
    }

    await bank_acc.save();

    res
      .status(200)
      .send({ message: "Explore One Day Book Delete Query", access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.render_admission_intake_set_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const bank_acc = await Admission.findById({ _id: aid }).select(
      "admission_intake_set"
    );

    const all_daybook = await nested_document_limit(
      page,
      limit,
      bank_acc?.admission_intake_set?.reverse()
    );

    res.status(200).send({
      message: "Explore All Day Book Query",
      access: true,
      admission_intake_set: all_daybook,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_admission_intake_set_edit_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    const { dbid, excel_file_name } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const bank_acc = await Admission.findById({ _id: aid });
    for (let ele of bank_acc?.admission_intake_set) {
      if (`${ele?._id}` === `${dbid}`) {
        ele.excel_file_name = excel_file_name
          ? excel_file_name
          : ele?.excel_file_name;
      }
    }

    await bank_acc.save();

    res.status(200).send({
      message: "Explore One Admission Intake Edit Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.render_admission_intake_set_delete_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    const { dbid } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const bank_acc = await Admission.findById({ _id: aid });
    for (let ele of bank_acc?.admission_intake_set) {
      if (`${ele?._id}` === `${dbid}`) {
        bank_acc.admission_intake_set.pull(ele?._id);
      }
    }

    await bank_acc.save();

    res.status(200).send({
      message: "Explore One Admission Intake Delete Query",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.fee_master_linking = async (req, res) => {
  try {
    const nums = [
      "6654d392f2effce6154532c5",
      "66586df0e1e16049583466a0",
      "665abc19e1e16049583b8141",
      "665acfc4e1e16049583bca8f",
      "665ad324e1e16049583bd5a8",
      "665ec6b6fe80b4410e5aa92d",
      "665eea2cfe80b4410e5b433b",
      "665eed56fe80b4410e5b4eff",
      "665efdd7fe80b4410e5b8a74",
      "665fffa2f8bc7a5d88f1d0c7",
      "6660077ef8bc7a5d88f1f0ba",
      "66600a2af8bc7a5d88f1fb46",
      "666038f1f8bc7a5d88f2cc42",
      "66603103f8bc7a5d88f2a70e",
      "66602995f8bc7a5d88f27fd7",
      "6660256cf8bc7a5d88f26c69",
      "666017c7f8bc7a5d88f22f3b",
    ];
    const all = await FeeReceipt.find({ _id: { $in: nums } }).select(
      "fee_heads fee_structure"
    );
    const struct = [];
    for (let ele of all) {
      if (struct?.includes(`${ele?.fee_structure}`)) {
      } else {
        struct.push(ele?.fee_structure);
      }
    }
    const all_struct = await FeeStructure.find({ _id: { $in: struct } });
    var heads_queue = [];
    for (let ele of all_struct) {
      for (let val of ele?.applicable_fees_heads) {
        if (heads_queue?.includes(`${val?.master}`)) {
        } else {
          heads_queue.push(val?.master);
        }
      }
    }

    const all_master = await FeeMaster.find({
      _id: { $in: heads_queue },
    }).select("master_name");
    var obj = {};
    var nest_obj = [];
    for (let ele of all_master) {
      obj["head_name"] = ele?.master_name;
      obj["head_amount"] = 0;
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }

    for (let ele of all) {
      for (let val of ele?.fee_heads) {
        for (let ads of nest_obj) {
          if (`${ads?.head_name}` === `${val?.head_name}`) {
            val.master = ads?._id;
            // t+= val?.original_paid
          }
          // }
        }
      }
      await ele.save();
    }

    res.status(200).send({ message: "Explore", all: all });
  } catch (e) {
    console.log(e);
  }
};

exports.render_subject_application_export = async (req, res) => {
  try {
    const { sid, aid } = req?.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const one_subject = await SubjectMaster.findById({ _id: sid });
    const apply = await NewApplication.findById({ _id: aid });
    // const nums = [aid]
    // const all_user = await User.find({ applyApplication: { $in: nums } })
    let numss = [];
    for (let ele of apply?.confirmedApplication) {
      numss.push(ele?.student);
    }
    for (let ele of apply?.allottedApplication) {
      numss.push(ele?.student);
    }
    let subject_num = [...numss, ...apply?.reviewApplication];
    const all_student = await Student.find({ _id: { $in: subject_num } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .populate({
        path: "student_optional_subject",
        select: "subjectName",
      })
      .populate({
        path: "major_subject",
        select: "subjectName",
      })
      .populate({
        path: "nested_subject",
        select: "subjectName",
      });
    res
      .status(200)
      .send({ message: "Explore All Students Master Query", access: true });

    var n = [];
    for (let val of all_student) {
      for (let ele of val?.student_optional_subject) {
        if (`${ele?._id}` === `${one_subject?._id}`) n.push(val);
      }
      for (let val of all_student) {
        for (let ele of val?.major_subject) {
          if (`${ele?._id}` === `${one_subject?._id}`) {
            n.push(val);
          }
        }
      }
      for (let val of all_student) {
        for (let ele of val?.nested_subject) {
          if (`${ele?._id}` === `${one_subject?._id}`) {
            n.push(val);
          }
        }
      }
    }
    const unique = [...new Set(n.map((item) => item._id))];
    const all = await Student.find({ _id: { $in: unique } })
      .select(
        "studentFirstName studentMiddleName studentFatherName studentLastName student_abc_id studentProfilePhoto photoId studentGender studentPhoneNumber studentEmail studentROLLNO studentGRNO"
      )
      .populate({
        path: "user",
        select: "userLegalName username",
      });
    var excel_list = [];
    for (let ele of all) {
      excel_list.push({
        GRNO: ele?.studentGRNO ?? "#NA",
        "ABC ID": ele?.student_abc_id ?? "",
        Name: `${ele?.studentFirstName} ${ele?.studentFatherName} ${ele?.studentLastName}`,
        DOB: moment(ele?.student_expand_DOB).format("DD/MM/YYYY") ?? "#NA",
        FirstName: ele?.studentFirstName ?? "#NA",
        FatherName: ele?.studentFatherName ?? "#NA",
        LastName: ele?.studentLastName ?? "#NA",
        Gender: ele?.studentGender,
        Email: ele?.studentEmail,
        PhoneNumber: ele?.studentPhoneNumber,
      });
    }
    var valid_back = await json_to_excel_admission_subject_application_query(
      excel_list,
      one_subject?.subjectName,
      aid
    );
    if (valid_back?.back) {
      res.status(200).send({
        message: "Explore New Excel On Subject Export TAB",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const removeDuplicates = async (books) => {
  // Declare a new array
  let newArray = [];

  // Declare an empty object
  let uniqueObject = {};

  // Loop for the array elements
  for (let i in books) {
    // Extract the title
    objTitle = books[i]["name"];

    // Use the title as the index
    uniqueObject[objTitle] = books[i];
  }

  // Loop to push unique object into array
  for (i in uniqueObject) {
    if (uniqueObject[i]?.value) {
      newArray.push(uniqueObject[i]);
    }
  }

  // Display the unique objects
  return newArray;
};

exports.render_app_intake_query = async (req, res) => {
  try {
    const { aid } = req?.params;
    const { bid } = req?.body;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    await admissionIntakeReport(aid, bid);
    res.status(200).send({ message: "Admission Intake Query", access: true });
    const ads_admin = await Admission.findById({ _id: aid }).populate({
      path: "institute",
      select:
        "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAffiliated affliatedLogo",
    });
    const batch = await Batch.findById({ _id: bid });
    const apply = await NewApplication.find({
      $and: [
        { _id: { $in: ads_admin?.newApplication } },
        { applicationTypeStatus: "Normal Application" },
        { applicationBatch: { $in: batch?.merged_batches } },
      ],
    })
      // const apply = await NewApplication.find({ $and: [{ _id: { $in: ads_admin?.newApplication } }, { applicationTypeStatus: "Normal Application" }] })
      .select("applicationName admission_intake_data_set admission_intake");

    const all_student = await Student.find({
      "student_form_flow.did": { $in: ads_admin?.newApplication },
    });
    var ds = [];
    for (let ele of all_student) {
      for (let val of apply) {
        if (`${val?._id}` === `${ele?.student_form_flow?.did}`) {
          if (ele?.intake_type == "CAP") {
            val.admission_intake_data_set.ad_th_cap += 1;
          } else if (ele?.intake_type == "AGAINST_CAP") {
            val.admission_intake_data_set.ad_th_ag_cap += 1;
          } else if (ele?.intake_type == "IL") {
            val.admission_intake_data_set.ad_th_il += 1;
          } else if (ele?.intake_type == "EWS") {
            val.admission_intake_data_set.ad_th_ews += 1;
          } else if (ele?.intake_type == "TFWS") {
            val.admission_intake_data_set.ad_th_tfws += 1;
          }
          val.admission_intake_data_set.total_intake =
            val?.admission_intake?.total_intake ?? 0;
          val.admission_intake_data_set.cap_intake =
            val?.admission_intake?.cap_intake ?? 0;
          val.admission_intake_data_set.il_intake =
            val?.admission_intake?.il_intake ?? 0;
          val.admission_intake_data_set.grand_total =
            val?.admission_intake_data_set?.ad_th_cap +
            val?.admission_intake_data_set?.ad_th_ag_cap +
            val?.admission_intake_data_set?.ad_th_il +
            val?.admission_intake_data_set?.ad_th_ews +
            val?.admission_intake_data_set?.ad_th_tfws;
        }
        if (val?._id != null) {
          ds.push({
            name: val?.applicationName,
            value: val?.admission_intake_data_set,
            _id: val?._id,
          });
        }
      }
    }
    const all = await removeDuplicates(ds);
    // if (all?.length > 0) {
    //   res.status(200).send({
    //     message: "Explore New App Intake",
    //     access: true,
    //     data_set: all,
    //     ads_admin: ads_admin?.institute,
    //     batch: batch?.batchName
    //   });
    // } else {
    //   res.status(200).send({
    //     message: "No New Excel Exports ",
    //     access: false,
    //     data_set: []
    //   });
    // }
  } catch (e) {
    console.log(e);
  }
};

// exports.render_daybook_heads_wise_excel_query = async (req, res) => {
//   try {
//     const { fid } = req.params;
//     const { from, to, bank, payment_type } = req.query;
//     if (!fid)
//       return res.status(200).send({
//         message: "Their is a bug need to fixed immediatley",
//         access: false,
//       });
//     var g_year;
//     var l_year;
//     var g_month;
//     var l_month;

//     var sorted_array = [];
//     const bank_acc = await BankAccount.findById({ _id: bank });
//     const finance = await Finance.findById({ _id: fid }).select("institute");
//     if (bank_acc?.bank_account_type === "Society") {
//       var all_struct = await FeeStructure.find({
//         $and: [{finance: finance?._id}, { document_update: false}],
//       });
//     }
//     else {
//       var all_struct = await FeeStructure.find({
//         $and: [{department: { $in: bank_acc?.departments }}, { document_update: false}],
//       });
//     }
//     const institute = await InstituteAdmin.findById({
//       _id: `${finance?.institute}`,
//     }).select(
//       "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
//     );

//     var g_year = new Date(`${from}`).getFullYear();
//     var g_day = new Date(`${from}`).getDate();
//     var l_year = new Date(`${to}`).getFullYear();
//     var l_day = new Date(`${to}`).getDate();
//     var g_month = new Date(`${from}`).getMonth() + 1;
//     if (g_month < 10) {
//       g_month = `0${g_month}`;
//     }
//     if (g_day < 10) {
//       g_day = `0${g_day}`;
//     }
//     var l_month = new Date(`${to}`).getMonth() + 1;
//     if (l_month < 10) {
//       l_month = `0${l_month}`;
//     }
//     if (l_day < 10) {
//       l_day = `0${l_day}`;
//     }
//     const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
//     const l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
//     if (payment_type) {
//       var all_receipts = await FeeReceipt.find({
//         $and: [
//           { finance: fid },
//           // { fee_flow: "FEE_HEADS" },
//           {
//             created_at: {
//               $gte: g_date,
//               $lt: l_date,
//             },
//           },
//           {
//             receipt_generated_from: "BY_ADMISSION",
//           },
//           {
//             refund_status: "No Refund",
//           },
//           {
//             fee_payment_mode: payment_type,
//           },
//           // { student: { $in: sorted_array } },
//         ],
//       })
//         .sort({ invoice_count: "1" })
//         .select("fee_heads application")
//         .populate({
//           path: "application",
//           select: "applicationDepartment",
//           populate: {
//             path: "applicationDepartment",
//             select: "bank_account",
//             populate: {
//               path: "bank_account",
//               select:
//                 "finance_bank_account_number finance_bank_name finance_bank_account_name",
//             },
//           },
//         })
//         .lean()
//         .exec();
//     } else {
//       var all_receipts = await FeeReceipt.find({
//         $and: [
//           { finance: fid },
//           // { fee_flow: "FEE_HEADS" },
//           {
//             created_at: {
//               $gte: g_date,
//               $lt: l_date,
//             },
//           },
//           {
//             receipt_generated_from: "BY_ADMISSION",
//           },
//           {
//             refund_status: "No Refund",
//           },
//           // { student: { $in: sorted_array } },
//         ],
//       })
//         .sort({ invoice_count: "1" })
//         .select("fee_heads application")
//         .populate({
//           path: "application",
//           select: "applicationDepartment",
//           populate: {
//             path: "applicationDepartment",
//             select: "bank_account",
//             populate: {
//               path: "bank_account",
//               select:
//                 "finance_bank_account_number finance_bank_name finance_bank_account_name",
//             },
//           },
//         })
//         .lean()
//         .exec();
//     }
//     // console.log(all_receipts)
//     if (bank_acc?.bank_account_type === "Society") {

//     }
//     else{
//       all_receipts = all_receipts?.filter((val) => {
//         if (
//           `${val?.application?.applicationDepartment?.bank_account?._id}` ===
//           `${bank}`
//         )
//           return val;
//       });
//     }
//     let heads_queue = [];
//     if (bank_acc?.bank_account_type === "Society") {
//       for (let ele of all_struct) {
//         for (let val of ele?.applicable_fees_heads) {
//           if (val?.is_society == true) {
//             if (heads_queue?.includes(`${val?.master}`)) {
//             } else {
//               heads_queue.push(val?.master);
//             }
//           }
//         }
//       }
//     } else {
//       for (let ele of all_struct) {
//         for (let val of ele?.applicable_fees_heads) {
//           if (val?.is_society == false) {
//             if (heads_queue?.includes(`${val?.master}`)) {
//             } else {
//               heads_queue.push(val?.master);
//             }
//           }
//         }
//       }
//     }
//     const all_master = await FeeMaster.find({
//       _id: { $in: heads_queue },
//     }).select("master_name");
//     var obj = {};
//     var nest_obj = [];
//     for (let ele of all_master) {
//       obj["head_name"] = ele?.master_name;
//       obj["head_amount"] = 0;
//       obj["_id"] = ele?._id;
//       nest_obj.push(obj);
//       obj = {};
//     }
//     // var t = 0
//     if (all_receipts?.length > 0) {
//       for (let ele of all_receipts) {
//         for (let val of ele?.fee_heads) {
//           for (let ads of nest_obj) {
//             if (bank_acc?.bank_account_type === "Society") {
//               if (`${ads?._id}` === `${val?.master}` && val?.is_society == true) {
//                 ads.head_amount += val?.original_paid;
//                 // t+= val?.original_paid
//               }
//             }
//             else {
//               if (`${ads?._id}` === `${val?.master}` && val?.is_society == false) {
//                 ads.head_amount += val?.original_paid;
//                 // t+= val?.original_paid
//               }
//             }
//           }
//         }
//       }
//       // nest_obj.push({
//       //   head_name: "Total Fees",
//       //   head_amount: t
//       // })
//       res.status(200).send({
//         message: "Explore Day Book Heads Query",
//         access: true,
//         // all_receipts,
//         results: nest_obj,
//         // account_info: bank_acc,
//         // day_range_from: from,
//         // day_range_to: to,
//         // ins_info: institute,
//       });
//     } else {
//       res.status(200).send({
//         message: "No Day Book Heads Query",
//         access: false,
//         results: [],
//       });
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };
// var data = "2023-08-28T11:22:55.743+00:00";
// var from = "2023-07-01";
// var to = "2023-08-28";

// var da = () => {
//   if (
//     `${moment(data).format("YYYY-MM-DD")}` >= `${from}` &&
//     `${moment(data).format("YYYY-MM-DD")}` <= `${to}`
//   ) {
//     return true;
//   } else {
//     return false;
//   }
// };

// console.log(da());
// console.log(moment("2023-08-06T11:39:18.835Z").format("YYYY-MM-DD"));
exports.renderApplicationCombinedListQuery = async (req, res) => {
  try {
    const { appId } = req.params;
    const { flow } = req.query;
    if (!appId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var ads_admin = await Admission.findById({ _id: appId });
    var all_apps = await NewApplication.find({
      $and: [
        { _id: { $in: ads_admin?.newApplication } },
        { applicationTypeStatus: "Normal Application" },
      ],
    })
      .select(
        "receievedApplication applicationUnit applicationName confirmedApplication allottedApplication applicationHostel admissionAdmin subject_selected_group"
      )
      .populate({
        path: "receievedApplication",
        populate: {
          path: "student",
          // select:
          //   "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "selectedApplication",
        populate: {
          path: "student",
          // select:
          //   "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "FeeCollectionApplication",
        populate: {
          path: "student",
          // select:
          //   "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "reviewApplication",
        populate: {
          path: "student_optional_subject major_subject nested_subject",
          select: "subjectName",
        },
        // select: "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph"
      })
      .populate({
        path: "confirmedApplication",
        populate: {
          path: "student",
          populate: {
            path: "student_optional_subject major_subject nested_subject",
            select: "subjectName",
          },
        },
      })
      .populate({
        path: "allottedApplication",
        populate: {
          path: "student",
          populate: {
            path: "student_optional_subject major_subject nested_subject studentClass",
            select: "subjectName className classTitle",
          },
        },
      });

    var excel_list = [];
    for (let valid_apply of all_apps) {
      if (
        `${flow}` === "Request_Query" &&
        valid_apply?.receievedApplication?.length > 0
      ) {
        var numss = {};
        for (var ref of valid_apply?.receievedApplication) {
          if (ref?.student?.studentFirstName != "") {
            if (ref?.student?.student_dynamic_field?.length > 0) {
              for (let ele of ref?.student?.student_dynamic_field) {
                // numss.push(
                //   [ele?.key]: ele?.value,
                // );
                numss[ele?.key] = ele?.value;
              }
            }
            excel_list.push({
              RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
              "ABC ID": ref?.student?.student_abc_id ?? "#NA",
              Name: `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName ??
                    ref?.student?.studentFatherName
                  : ""
              } ${ref?.student?.studentLastName}`,
              DOB:
                moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
                "#NA",
              Gender: ref?.student?.studentGender ?? "#NA",
              CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
              Religion: ref?.student?.studentReligion ?? "#NA",
              MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
              ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
              Address: `${ref?.student?.studentAddress}` ?? "#NA",
              AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
              ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
              AlternateContactNo:
                ref?.student?.studentParentsPhoneNumber ?? "#NA",
              NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
              NameAsCertificate: ref?.student?.studentNameAsCertificate,
              BirthPlace: ref?.student?.studentBirthPlace,
              Religion: ref?.student?.studentReligion,
              Caste: ref?.student?.studentCast,
              Nationality: ref?.student?.studentNationality,
              RationCard: ref?.student?.studentFatherRationCardColor,
              BloodGroup: ref?.student?.student_blood_group,
              AadharNumber: ref?.student?.studentAadharNumber,
              PhoneNumber: ref?.student?.studentPhoneNumber,
              Email: ref?.student?.studentEmail,
              ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
              CurrentAddress: ref?.student?.studentCurrentAddress,
              CurrentPinCode: ref?.student?.studentCurrentPincode,
              CurrentState: ref?.student?.studentCurrentState,
              CurrentDistrict: ref?.student?.studentCurrentDistrict,
              Address: ref?.student?.studentAddress,
              PinCode: ref?.student?.studentPincode,
              State: ref?.student?.studentState,
              District: ref?.student?.studentDistrict,
              ParentsName: ref?.student?.studentParentsName,
              ParentsEmail: ref?.student?.studentParentsEmail,
              ParentsOccupation: ref?.student?.studentParentsOccupation,
              ParentsOfficeAddress: ref?.student?.studentParentsAddress,
              ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
              SeatType: ref?.student?.student_seat_type,
              PhysicallyHandicapped: ref?.student?.student_ph_type,
              DefencePersonnel: ref?.student?.student_defence_personnel_word,
              MaritalStatus: ref?.student?.student_marital_status,
              PreviousBoard: ref?.student?.student_board_university,
              PreviousSchool: ref?.student?.studentPreviousSchool,
              UniversityCourse: ref?.student?.student_university_courses,
              PassingYear: ref?.student?.student_year,
              PreviousClass: ref?.student?.student_previous_class,
              PreviousMarks: ref?.student?.student_previous_marks,
              PreviousPercentage: ref?.student?.student_previous_percentage,
              SeatNo: ref?.student?.student_previous_section,
              StandardMOP: ref?.student?.month_of_passing,
              StandardYOP: ref?.student?.year_of_passing,
              StandardPercentage: ref?.student?.percentage,
              StandardNameOfInstitute: ref?.student?.name_of_institute,
              HSCMOP: ref?.student?.hsc_month,
              HSCYOP: ref?.student?.hsc_year,
              HSCPercentage: ref?.student?.hsc_percentage,
              HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
              HSCBoard: ref?.student?.hsc_board,
              HSCCandidateType: ref?.student?.hsc_candidate_type,
              HSCVocationalType: ref?.student?.hsc_vocational_type,
              HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
              HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
              HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
              HSCPCMTotal: ref?.student?.hsc_pcm_total,
              HSCGrandTotal: ref?.student?.hsc_grand_total,
              FormNo: ref?.student?.form_no,
              QviplePayId: ref?.student?.qviple_student_pay_id,
              ...numss,
            });
          }
        }
        // var valid_back = null;
      } else if (
        `${flow}` === "Docs_Query" &&
        valid_apply?.selectedApplication?.length > 0
      ) {
        var numss = {};
        for (var ref of valid_apply?.selectedApplication) {
          if (ref?.student?.studentFirstName != "") {
            if (ref?.student?.student_dynamic_field?.length > 0) {
              for (let ele of ref?.student?.student_dynamic_field) {
                // numss.push(
                //   [ele?.key]: ele?.value,
                // );
                numss[ele?.key] = ele?.value;
              }
            }
            excel_list.push({
              RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
              "ABC ID": ref?.student?.student_abc_id ?? "#NA",
              Name: `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName ??
                    ref?.student?.studentFatherName
                  : ""
              } ${ref?.student?.studentLastName}`,
              DOB:
                moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
                "#NA",
              Gender: ref?.student?.studentGender ?? "#NA",
              CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
              Religion: ref?.student?.studentReligion ?? "#NA",
              MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
              ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
              Address: `${ref?.student?.studentAddress}` ?? "#NA",
              AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
              ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
              AlternateContactNo:
                ref?.student?.studentParentsPhoneNumber ?? "#NA",
              NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
              NameAsCertificate: ref?.student?.studentNameAsCertificate,
              BirthPlace: ref?.student?.studentBirthPlace,
              Religion: ref?.student?.studentReligion,
              Caste: ref?.student?.studentCast,
              Nationality: ref?.student?.studentNationality,
              RationCard: ref?.student?.studentFatherRationCardColor,
              BloodGroup: ref?.student?.student_blood_group,
              AadharNumber: ref?.student?.studentAadharNumber,
              PhoneNumber: ref?.student?.studentPhoneNumber,
              Email: ref?.student?.studentEmail,
              ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
              CurrentAddress: ref?.student?.studentCurrentAddress,
              CurrentPinCode: ref?.student?.studentCurrentPincode,
              CurrentState: ref?.student?.studentCurrentState,
              CurrentDistrict: ref?.student?.studentCurrentDistrict,
              Address: ref?.student?.studentAddress,
              PinCode: ref?.student?.studentPincode,
              State: ref?.student?.studentState,
              District: ref?.student?.studentDistrict,
              ParentsName: ref?.student?.studentParentsName,
              ParentsEmail: ref?.student?.studentParentsEmail,
              ParentsOccupation: ref?.student?.studentParentsOccupation,
              ParentsOfficeAddress: ref?.student?.studentParentsAddress,
              ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
              SeatType: ref?.student?.student_seat_type,
              PhysicallyHandicapped: ref?.student?.student_ph_type,
              DefencePersonnel: ref?.student?.student_defence_personnel_word,
              MaritalStatus: ref?.student?.student_marital_status,
              PreviousBoard: ref?.student?.student_board_university,
              PreviousSchool: ref?.student?.studentPreviousSchool,
              UniversityCourse: ref?.student?.student_university_courses,
              PassingYear: ref?.student?.student_year,
              PreviousClass: ref?.student?.student_previous_class,
              PreviousMarks: ref?.student?.student_previous_marks,
              PreviousPercentage: ref?.student?.student_previous_percentage,
              SeatNo: ref?.student?.student_previous_section,
              StandardMOP: ref?.student?.month_of_passing,
              StandardYOP: ref?.student?.year_of_passing,
              StandardPercentage: ref?.student?.percentage,
              StandardNameOfInstitute: ref?.student?.name_of_institute,
              HSCMOP: ref?.student?.hsc_month,
              HSCYOP: ref?.student?.hsc_year,
              HSCPercentage: ref?.student?.hsc_percentage,
              HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
              HSCBoard: ref?.student?.hsc_board,
              HSCCandidateType: ref?.student?.hsc_candidate_type,
              HSCVocationalType: ref?.student?.hsc_vocational_type,
              HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
              HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
              HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
              HSCPCMTotal: ref?.student?.hsc_pcm_total,
              HSCGrandTotal: ref?.student?.hsc_grand_total,
              FormNo: ref?.student?.form_no,
              QviplePayId: ref?.student?.qviple_student_pay_id,
              ...numss,
            });
          }
        }
      } else if (
        `${flow}` === "Fees_Query" &&
        valid_apply?.FeeCollectionApplication?.length > 0
      ) {
        var numss = {};
        for (var ref of valid_apply?.FeeCollectionApplication) {
          if (ref?.student?.studentFirstName != "") {
            if (ref?.student?.student_dynamic_field?.length > 0) {
              for (let ele of ref?.student?.student_dynamic_field) {
                // numss.push(
                //   [ele?.key]: ele?.value,
                // );
                numss[ele?.key] = ele?.value;
              }
            }
            excel_list.push({
              RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
              "ABC ID": ref?.student?.student_abc_id ?? "#NA",
              Name: `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName ??
                    ref?.student?.studentFatherName
                  : ""
              } ${ref?.student?.studentLastName}`,
              DOB:
                moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
                "#NA",
              Gender: ref?.student?.studentGender ?? "#NA",
              CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
              Religion: ref?.student?.studentReligion ?? "#NA",
              MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
              ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
              Address: `${ref?.student?.studentAddress}` ?? "#NA",
              AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
              ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
              AlternateContactNo:
                ref?.student?.studentParentsPhoneNumber ?? "#NA",
              NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
              NameAsCertificate: ref?.student?.studentNameAsCertificate,
              BirthPlace: ref?.student?.studentBirthPlace,
              Religion: ref?.student?.studentReligion,
              Caste: ref?.student?.studentCast,
              Nationality: ref?.student?.studentNationality,
              RationCard: ref?.student?.studentFatherRationCardColor,
              BloodGroup: ref?.student?.student_blood_group,
              AadharNumber: ref?.student?.studentAadharNumber,
              PhoneNumber: ref?.student?.studentPhoneNumber,
              Email: ref?.student?.studentEmail,
              ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
              CurrentAddress: ref?.student?.studentCurrentAddress,
              CurrentPinCode: ref?.student?.studentCurrentPincode,
              CurrentState: ref?.student?.studentCurrentState,
              CurrentDistrict: ref?.student?.studentCurrentDistrict,
              Address: ref?.student?.studentAddress,
              PinCode: ref?.student?.studentPincode,
              State: ref?.student?.studentState,
              District: ref?.student?.studentDistrict,
              ParentsName: ref?.student?.studentParentsName,
              ParentsEmail: ref?.student?.studentParentsEmail,
              ParentsOccupation: ref?.student?.studentParentsOccupation,
              ParentsOfficeAddress: ref?.student?.studentParentsAddress,
              ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
              SeatType: ref?.student?.student_seat_type,
              PhysicallyHandicapped: ref?.student?.student_ph_type,
              DefencePersonnel: ref?.student?.student_defence_personnel_word,
              MaritalStatus: ref?.student?.student_marital_status,
              PreviousBoard: ref?.student?.student_board_university,
              PreviousSchool: ref?.student?.studentPreviousSchool,
              UniversityCourse: ref?.student?.student_university_courses,
              PassingYear: ref?.student?.student_year,
              PreviousClass: ref?.student?.student_previous_class,
              PreviousMarks: ref?.student?.student_previous_marks,
              PreviousPercentage: ref?.student?.student_previous_percentage,
              SeatNo: ref?.student?.student_previous_section,
              StandardMOP: ref?.student?.month_of_passing,
              StandardYOP: ref?.student?.year_of_passing,
              StandardPercentage: ref?.student?.percentage,
              StandardNameOfInstitute: ref?.student?.name_of_institute,
              HSCMOP: ref?.student?.hsc_month,
              HSCYOP: ref?.student?.hsc_year,
              HSCPercentage: ref?.student?.hsc_percentage,
              HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
              HSCBoard: ref?.student?.hsc_board,
              HSCCandidateType: ref?.student?.hsc_candidate_type,
              HSCVocationalType: ref?.student?.hsc_vocational_type,
              HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
              HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
              HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
              HSCPCMTotal: ref?.student?.hsc_pcm_total,
              HSCGrandTotal: ref?.student?.hsc_grand_total,
              FormNo: ref?.student?.form_no,
              QviplePayId: ref?.student?.qviple_student_pay_id,
              ...numss,
            });
          }
        }
      } else if (
        `${flow}` === "Confirm_Query" &&
        valid_apply?.confirmedApplication?.length > 0
      ) {
        var numss = {};
        for (var ref of valid_apply?.confirmedApplication) {
          if (ref?.student?.studentFirstName != "") {
            if (ref?.student?.student_dynamic_field?.length > 0) {
              for (let ele of ref?.student?.student_dynamic_field) {
                // numss.push(
                //   [ele?.key]: ele?.value,
                // );
                numss[ele?.key] = ele?.value;
              }
            }
            excel_list.push({
              RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
              "ABC ID": ref?.student?.student_abc_id ?? "#NA",
              Name: `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName ??
                    ref?.student?.studentFatherName
                  : ""
              } ${ref?.student?.studentLastName}`,
              DOB:
                moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
                "#NA",
              Gender: ref?.student?.studentGender ?? "#NA",
              CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
              Religion: ref?.student?.studentReligion ?? "#NA",
              MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
              ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
              Address: `${ref?.student?.studentAddress}` ?? "#NA",
              AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
              ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
              AlternateContactNo:
                ref?.student?.studentParentsPhoneNumber ?? "#NA",
              NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
              NameAsCertificate: ref?.student?.studentNameAsCertificate,
              BirthPlace: ref?.student?.studentBirthPlace,
              Religion: ref?.student?.studentReligion,
              Caste: ref?.student?.studentCast,
              Nationality: ref?.student?.studentNationality,
              RationCard: ref?.student?.studentFatherRationCardColor,
              BloodGroup: ref?.student?.student_blood_group,
              AadharNumber: ref?.student?.studentAadharNumber,
              PhoneNumber: ref?.student?.studentPhoneNumber,
              Email: ref?.student?.studentEmail,
              ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
              CurrentAddress: ref?.student?.studentCurrentAddress,
              CurrentPinCode: ref?.student?.studentCurrentPincode,
              CurrentState: ref?.student?.studentCurrentState,
              CurrentDistrict: ref?.student?.studentCurrentDistrict,
              Address: ref?.student?.studentAddress,
              PinCode: ref?.student?.studentPincode,
              State: ref?.student?.studentState,
              District: ref?.student?.studentDistrict,
              ParentsName: ref?.student?.studentParentsName,
              ParentsEmail: ref?.student?.studentParentsEmail,
              ParentsOccupation: ref?.student?.studentParentsOccupation,
              ParentsOfficeAddress: ref?.student?.studentParentsAddress,
              ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
              SeatType: ref?.student?.student_seat_type,
              PhysicallyHandicapped: ref?.student?.student_ph_type,
              DefencePersonnel: ref?.student?.student_defence_personnel_word,
              MaritalStatus: ref?.student?.student_marital_status,
              PreviousBoard: ref?.student?.student_board_university,
              PreviousSchool: ref?.student?.studentPreviousSchool,
              UniversityCourse: ref?.student?.student_university_courses,
              PassingYear: ref?.student?.student_year,
              PreviousClass: ref?.student?.student_previous_class,
              PreviousMarks: ref?.student?.student_previous_marks,
              PreviousPercentage: ref?.student?.student_previous_percentage,
              SeatNo: ref?.student?.student_previous_section,
              StandardMOP: ref?.student?.month_of_passing,
              StandardYOP: ref?.student?.year_of_passing,
              StandardPercentage: ref?.student?.percentage,
              StandardNameOfInstitute: ref?.student?.name_of_institute,
              HSCMOP: ref?.student?.hsc_month,
              HSCYOP: ref?.student?.hsc_year,
              HSCPercentage: ref?.student?.hsc_percentage,
              HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
              HSCBoard: ref?.student?.hsc_board,
              HSCCandidateType: ref?.student?.hsc_candidate_type,
              HSCVocationalType: ref?.student?.hsc_vocational_type,
              HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
              HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
              HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
              HSCPCMTotal: ref?.student?.hsc_pcm_total,
              HSCGrandTotal: ref?.student?.hsc_grand_total,
              FormNo: ref?.student?.form_no,
              QviplePayId: ref?.student?.qviple_student_pay_id,
              ...numss,
            });
          }
        }
      } else if (
        `${flow}` === "Review_Query" &&
        valid_apply?.reviewApplication?.length > 0
      ) {
        const ads_admin = await Admission.findById({
          _id: `${valid_apply?.admissionAdmin}`,
        });
        const all_group_select = await SubjectGroupSelect.find({
          $and: [
            { subject_group: { $in: valid_apply?.subject_selected_group } },
          ],
        })
          .populate({
            path: "compulsory_subject",
            select: "subjectName",
          })
          .populate({
            path: "optional_subject",
            populate: {
              path: "optional_subject_options optional_subject_options_or.options",
              select: "subjectName",
            },
          })
          .populate({
            path: "fixed_subject",
            populate: {
              path: "fixed_subject_options",
              select: "subjectName",
            },
          });
        var subject_list = [];
        for (let ele of all_group_select) {
          subject_list.push(...ele?.compulsory_subject);
        }
        for (let ele of all_group_select) {
          for (let val of ele?.fixed_subject) {
            subject_list.push(...val?.fixed_subject_options);
          }
        }
        for (let ele of all_group_select) {
          for (let val of ele?.optional_subject) {
            subject_list.push(...val?.optional_subject_options);
          }
          for (let val of ele?.optional_subject) {
            for (let stu of val?.optional_subject_options_or) {
              subject_list.push(...stu?.options);
            }
          }
        }
        var numss = {};
        var numsss = {};
        for (var ref of valid_apply?.reviewApplication) {
          if (ref?.studentFirstName != "") {
            for (let ele of ref?.student_dynamic_field) {
              // numss.push(
              //   [ele?.key]: ele?.value,
              // );
              numss[ele?.key] = ele?.value;
            }
            var nums_queue = {};
            for (let stu of subject_list) {
              ref.student_dynamic_subject.push({
                subjectName: stu?.subjectName,
                status: "No",
                _id: stu?._id,
              });
            }
            for (let ele of ref.student_dynamic_subject) {
              for (let val of ref?.student_optional_subject) {
                if (`${ele?._id}` === `${val?._id}`) {
                  nums_queue[ele?.subjectName] = "Yes";
                  ele.status = "Yes";
                }
              }
            }
            for (let val of ref.student_dynamic_subject) {
              for (let ele of ref?.major_subject) {
                if (`${val?._id}` === `${ele?._id}`) {
                  nums_queue[val?.subjectName] = "Yes";
                  ele.status = "Yes";
                }
              }
            }
            if (ref?.nested_subject?.length > 0) {
              for (let val of ref.student_dynamic_subject) {
                for (let ele of ref?.nested_subject) {
                  if (`${val?._id}` === `${ele?._id}`) {
                    nums_queue[val?.subjectName] = "Yes";
                    ele.status = "Yes";
                  }
                }
              }
            }
            for (let ele of ref?.student_dynamic_subject) {
              // numss.push(
              //   [ele?.key]: ele?.value,
              // );
              numsss[ele?.subjectName] = ele?.status;
            }
            // console.log(numsss)
            excel_list.push({
              RegistrationID: ref?.student_prn_enroll_number ?? "#NA",
              "ABC ID": ref?.student?.student_abc_id ?? "#NA",
              Name: `${ref?.studentFirstName} ${
                ref?.studentMiddleName
                  ? ref?.studentMiddleName ?? ref?.studentFatherName
                  : ""
              } ${ref?.studentLastName}`,
              DOB:
                moment(ref?.student_expand_DOB).format("DD/MM/YYYY") ?? "#NA",
              Gender: ref?.studentGender ?? "#NA",
              CasteCategory: ref?.studentCastCategory ?? "#NA",
              Religion: ref?.studentReligion ?? "#NA",
              MotherName: `${ref?.studentMotherName}` ?? "#NA",
              ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
              Address: `${ref?.studentAddress}` ?? "#NA",
              AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
              ContactNo: ref?.studentPhoneNumber ?? "#NA",
              AlternateContactNo: ref?.studentParentsPhoneNumber ?? "#NA",
              NameAsMarksheet: ref?.studentNameAsMarksheet,
              NameAsCertificate: ref?.studentNameAsCertificate,
              BirthPlace: ref?.studentBirthPlace,
              Religion: ref?.studentReligion,
              Caste: ref?.studentCast,
              Nationality: ref?.studentNationality,
              RationCard: ref?.studentFatherRationCardColor,
              BloodGroup: ref?.student_blood_group,
              AadharNumber: ref?.studentAadharNumber,
              PhoneNumber: ref?.studentPhoneNumber,
              Email: ref?.studentEmail,
              ParentsPhoneNumber: ref?.studentParentsPhoneNumber,
              CurrentAddress: ref?.studentCurrentAddress,
              CurrentPinCode: ref?.studentCurrentPincode,
              CurrentState: ref?.studentCurrentState,
              CurrentDistrict: ref?.studentCurrentDistrict,
              Address: ref?.studentAddress,
              PinCode: ref?.studentPincode,
              State: ref?.studentState,
              District: ref?.studentDistrict,
              ParentsName: ref?.studentParentsName,
              ParentsEmail: ref?.studentParentsEmail,
              ParentsOccupation: ref?.studentParentsOccupation,
              ParentsOfficeAddress: ref?.studentParentsAddress,
              ParentsAnnualIncome: ref?.studentParentsAnnualIncom,
              SeatType: ref?.student_seat_type,
              PhysicallyHandicapped: ref?.student_ph_type,
              DefencePersonnel: ref?.student_defence_personnel_word,
              MaritalStatus: ref?.student_marital_status,
              PreviousBoard: ref?.student_board_university,
              PreviousSchool: ref?.studentPreviousSchool,
              UniversityCourse: ref?.student_university_courses,
              PassingYear: ref?.student_year,
              PreviousClass: ref?.student_previous_class,
              PreviousMarks: ref?.student_previous_marks,
              PreviousPercentage: ref?.student_previous_percentage,
              SeatNo: ref?.student_previous_section,
              StandardMOP: ref?.month_of_passing,
              StandardYOP: ref?.year_of_passing,
              StandardPercentage: ref?.percentage,
              StandardNameOfInstitute: ref?.name_of_institute,
              HSCMOP: ref?.hsc_month,
              HSCYOP: ref?.hsc_year,
              HSCPercentage: ref?.hsc_percentage,
              HSCNameOfInstitute: ref?.hsc_name_of_institute,
              HSCBoard: ref?.hsc_board,
              HSCCandidateType: ref?.hsc_candidate_type,
              HSCVocationalType: ref?.hsc_vocational_type,
              HSCPhysicsMarks: ref?.hsc_physics_marks,
              HSCChemistryMarks: ref?.hsc_chemistry_marks,
              HSCMathematicsMarks: ref?.hsc_mathematics_marks,
              HSCPCMTotal: ref?.hsc_pcm_total,
              HSCGrandTotal: ref?.hsc_grand_total,
              FormNo: ref?.form_no,
              QviplePayId: ref?.qviple_student_pay_id,
              ...numss,
              ...numsss,
            });
          }
        }
      } else if (
        `${flow}` === "Allot_Query" &&
        valid_apply?.allottedApplication?.length > 0
      ) {
        var numss = {};
        for (var ref of valid_apply?.allottedApplication) {
          if (ref?.student?.studentFirstName != "") {
            if (ref?.student?.student_dynamic_field?.length > 0) {
              for (let ele of ref?.student?.student_dynamic_field) {
                // numss.push(
                //   [ele?.key]: ele?.value,
                // );
                numss[ele?.key] = ele?.value;
              }
            }
            excel_list.push({
              RegistrationID: ref?.student?.studentGRNO ?? "#NA",
              "ABC ID": ref?.student?.student_abc_id ?? "#NA",
              Name: `${ref?.student?.studentFirstName} ${
                ref?.student?.studentMiddleName
                  ? ref?.student?.studentMiddleName ??
                    ref?.student?.studentFatherName
                  : ""
              } ${ref?.student?.studentLastName}`,
              FirstName: ref?.student?.studentFirstName ?? "#NA",
              FatherName:
                ref?.student?.studentFatherName ??
                ref?.student?.studentMiddleName,
              LastName: ref?.student?.studentLastName ?? "#NA",
              DOB:
                moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
                "#NA",
              Gender: ref?.student?.studentGender ?? "#NA",
              CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
              Class: `${ref?.student?.studentClass?.className}-${ref?.student?.studentClass?.classTitle}`,
              ROLLNO: ref?.student?.studentROLLNO,
              Religion: ref?.student?.studentReligion ?? "#NA",
              MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
              ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
              Address: `${ref?.student?.studentAddress}` ?? "#NA",
              AppliedOn: `${moment(ref?.student?.createdAt).format("LL")}`,
              ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
              AlternateContactNo:
                ref?.student?.studentParentsPhoneNumber ?? "#NA",
              NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
              NameAsCertificate: ref?.student?.studentNameAsCertificate,
              BirthPlace: ref?.student?.studentBirthPlace,
              Religion: ref?.student?.studentReligion,
              Caste: ref?.student?.studentCast,
              Nationality: ref?.student?.studentNationality,
              RationCard: ref?.student?.studentFatherRationCardColor,
              BloodGroup: ref?.student?.student_blood_group,
              AadharNumber: ref?.student?.studentAadharNumber,
              PhoneNumber: ref?.student?.studentPhoneNumber,
              Email: ref?.student?.studentEmail,
              ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
              CurrentAddress: ref?.student?.studentCurrentAddress,
              CurrentPinCode: ref?.student?.studentCurrentPincode,
              CurrentState: ref?.student?.studentCurrentState,
              CurrentDistrict: ref?.student?.studentCurrentDistrict,
              Address: ref?.student?.studentAddress,
              PinCode: ref?.student?.studentPincode,
              State: ref?.student?.studentState,
              District: ref?.student?.studentDistrict,
              ParentsName: ref?.student?.studentParentsName,
              ParentsEmail: ref?.student?.studentParentsEmail,
              ParentsOccupation: ref?.student?.studentParentsOccupation,
              ParentsOfficeAddress: ref?.student?.studentParentsAddress,
              ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
              SeatType: ref?.student?.student_seat_type,
              PhysicallyHandicapped: ref?.student?.student_ph_type,
              DefencePersonnel: ref?.student?.student_defence_personnel_word,
              MaritalStatus: ref?.student?.student_marital_status,
              PreviousBoard: ref?.student?.student_board_university,
              PreviousSchool: ref?.student?.studentPreviousSchool,
              UniversityCourse: ref?.student?.student_university_courses,
              PassingYear: ref?.student?.student_year,
              PreviousClass: ref?.student?.student_previous_class,
              PreviousMarks: ref?.student?.student_previous_marks,
              PreviousPercentage: ref?.student?.student_previous_percentage,
              SeatNo: ref?.student?.student_previous_section,
              StandardMOP: ref?.student?.month_of_passing,
              StandardYOP: ref?.student?.year_of_passing,
              StandardPercentage: ref?.student?.percentage,
              StandardNameOfInstitute: ref?.student?.name_of_institute,
              HSCMOP: ref?.student?.hsc_month,
              HSCYOP: ref?.student?.hsc_year,
              HSCPercentage: ref?.student?.hsc_percentage,
              HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
              HSCBoard: ref?.student?.hsc_board,
              HSCCandidateType: ref?.student?.hsc_candidate_type,
              HSCVocationalType: ref?.student?.hsc_vocational_type,
              HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
              HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
              HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
              HSCPCMTotal: ref?.student?.hsc_pcm_total,
              HSCGrandTotal: ref?.student?.hsc_grand_total,
              FormNo: ref?.student?.form_no,
              QviplePayId: ref?.student?.qviple_student_pay_id,
              ...numss,
            });
          }
        }
      }
      // else {
      //   res.status(200).send({
      //     message: "No Applications Found",
      //     access: false,
      //   });
      // }
    }
    var valid_back = await json_to_excel_admission_query(
      excel_list,
      "Combined Apps",
      appId,
      flow
    );
    if (valid_back?.back) {
      res.status(200).send({
        message: "Explore New Excel On Hostel Export TAB",
        access: true,
        excel_list: excel_list?.length,
      });
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        access: false,
        // excel_list: excel_list,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderHostelApplicationListQuery = async (req, res) => {
  try {
    const { appId } = req.params;
    const { flow } = req.query;
    if (!appId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_apply = await NewApplication.findById({ _id: appId })
      .select(
        "receievedApplication applicationUnit applicationName confirmedApplication allottedApplication applicationHostel hostelAdmin"
      )
      .populate({
        path: "receievedApplication",
        populate: {
          path: "student",
          // select:
          //   "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "selectedApplication",
        populate: {
          path: "student",
          // select:
          //   "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "FeeCollectionApplication",
        populate: {
          path: "student",
          // select:
          //   "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "reviewApplication",
        populate: {
          path: "student_optional_subject major_subject nested_subject",
          select: "subjectName",
        },
        // select: "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph"
      })
      .populate({
        path: "confirmedApplication",
        populate: {
          path: "student",
          populate: {
            path: "student_optional_subject major_subject nested_subject",
            select: "subjectName",
          },
        },
      });
    // .populate({
    //   path: "allottedApplication",
    //   populate: {
    //     path: "student",
    //     populate: {
    //       path: "student_optional_subject major_subject nested_subject",
    //       select: "subjectName"
    //     }
    //   },
    // });

    if (
      `${flow}` === "Request_Query" &&
      valid_apply?.receievedApplication?.length > 0
    ) {
      var excel_list = [];
      var numss = {};
      for (var ref of valid_apply?.receievedApplication) {
        if (ref?.student?.studentFirstName != "") {
          for (let ele of ref?.student?.student_dynamic_field) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numss[ele?.key] = ele?.value;
          }
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName ??
                  ref?.student?.studentFatherName
                : ""
            } ${ref?.student?.studentLastName}`,
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            DOB: ref?.student?.studentDOB ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
            NameAsCertificate: ref?.student?.studentNameAsCertificate,
            BirthPlace: ref?.student?.studentBirthPlace,
            Religion: ref?.student?.studentReligion,
            Caste: ref?.student?.studentCast,
            Nationality: ref?.student?.studentNationality,
            RationCard: ref?.student?.studentFatherRationCardColor,
            BloodGroup: ref?.student?.student_blood_group,
            AadharNumber: ref?.student?.studentAadharNumber,
            PhoneNumber: ref?.student?.studentPhoneNumber,
            Email: ref?.student?.studentEmail,
            ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
            CurrentAddress: ref?.student?.studentCurrentAddress,
            CurrentPinCode: ref?.student?.studentCurrentPincode,
            CurrentState: ref?.student?.studentCurrentState,
            CurrentDistrict: ref?.student?.studentCurrentDistrict,
            Address: ref?.student?.studentAddress,
            PinCode: ref?.student?.studentPincode,
            State: ref?.student?.studentState,
            District: ref?.student?.studentDistrict,
            ParentsName: ref?.student?.studentParentsName,
            ParentsEmail: ref?.student?.studentParentsEmail,
            ParentsOccupation: ref?.student?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.student?.studentParentsAddress,
            ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
            SeatType: ref?.student?.student_seat_type,
            PhysicallyHandicapped: ref?.student?.student_ph_type,
            DefencePersonnel: ref?.student?.student_defence_personnel_word,
            MaritalStatus: ref?.student?.student_marital_status,
            PreviousBoard: ref?.student?.student_board_university,
            PreviousSchool: ref?.student?.studentPreviousSchool,
            UniversityCourse: ref?.student?.student_university_courses,
            PassingYear: ref?.student?.student_year,
            PreviousClass: ref?.student?.student_previous_class,
            PreviousMarks: ref?.student?.student_previous_marks,
            PreviousPercentage: ref?.student?.student_previous_percentage,
            SeatNo: ref?.student?.student_previous_section,
            StandardMOP: ref?.student?.month_of_passing,
            StandardYOP: ref?.student?.year_of_passing,
            StandardPercentage: ref?.student?.percentage,
            StandardNameOfInstitute: ref?.student?.name_of_institute,
            HSCMOP: ref?.student?.hsc_month,
            HSCYOP: ref?.student?.hsc_year,
            HSCPercentage: ref?.student?.hsc_percentage,
            HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
            HSCBoard: ref?.student?.hsc_board,
            HSCCandidateType: ref?.student?.hsc_candidate_type,
            HSCVocationalType: ref?.student?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
            HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.student?.hsc_pcm_total,
            HSCGrandTotal: ref?.student?.hsc_grand_total,
            FormNo: ref?.student?.form_no,
            QviplePayId: ref?.student?.qviple_student_pay_id,
            ...numss,
          });
        }
      }
      // var valid_back = null;
      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
          excel_list,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
          // excel_list: excel_list,
        });
      }
    } else if (
      `${flow}` === "Docs_Query" &&
      valid_apply?.selectedApplication?.length > 0
    ) {
      var excel_list = [];
      var numss = {};
      for (var ref of valid_apply?.selectedApplication) {
        if (ref?.student?.studentFirstName != "") {
          for (let ele of ref?.student?.student_dynamic_field) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numss[ele?.key] = ele?.value;
          }
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName ??
                  ref?.student?.studentFatherName
                : ""
            } ${ref?.student?.studentLastName}`,
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            DOB: ref?.student?.studentDOB ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
            NameAsCertificate: ref?.student?.studentNameAsCertificate,
            BirthPlace: ref?.student?.studentBirthPlace,
            Religion: ref?.student?.studentReligion,
            Caste: ref?.student?.studentCast,
            Nationality: ref?.student?.studentNationality,
            RationCard: ref?.student?.studentFatherRationCardColor,
            BloodGroup: ref?.student?.student_blood_group,
            AadharNumber: ref?.student?.studentAadharNumber,
            PhoneNumber: ref?.student?.studentPhoneNumber,
            Email: ref?.student?.studentEmail,
            ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
            CurrentAddress: ref?.student?.studentCurrentAddress,
            CurrentPinCode: ref?.student?.studentCurrentPincode,
            CurrentState: ref?.student?.studentCurrentState,
            CurrentDistrict: ref?.student?.studentCurrentDistrict,
            Address: ref?.student?.studentAddress,
            PinCode: ref?.student?.studentPincode,
            State: ref?.student?.studentState,
            District: ref?.student?.studentDistrict,
            ParentsName: ref?.student?.studentParentsName,
            ParentsEmail: ref?.student?.studentParentsEmail,
            ParentsOccupation: ref?.student?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.student?.studentParentsAddress,
            ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
            SeatType: ref?.student?.student_seat_type,
            PhysicallyHandicapped: ref?.student?.student_ph_type,
            DefencePersonnel: ref?.student?.student_defence_personnel_word,
            MaritalStatus: ref?.student?.student_marital_status,
            PreviousBoard: ref?.student?.student_board_university,
            PreviousSchool: ref?.student?.studentPreviousSchool,
            UniversityCourse: ref?.student?.student_university_courses,
            PassingYear: ref?.student?.student_year,
            PreviousClass: ref?.student?.student_previous_class,
            PreviousMarks: ref?.student?.student_previous_marks,
            PreviousPercentage: ref?.student?.student_previous_percentage,
            SeatNo: ref?.student?.student_previous_section,
            StandardMOP: ref?.student?.month_of_passing,
            StandardYOP: ref?.student?.year_of_passing,
            StandardPercentage: ref?.student?.percentage,
            StandardNameOfInstitute: ref?.student?.name_of_institute,
            HSCMOP: ref?.student?.hsc_month,
            HSCYOP: ref?.student?.hsc_year,
            HSCPercentage: ref?.student?.hsc_percentage,
            HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
            HSCBoard: ref?.student?.hsc_board,
            HSCCandidateType: ref?.student?.hsc_candidate_type,
            HSCVocationalType: ref?.student?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
            HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.student?.hsc_pcm_total,
            HSCGrandTotal: ref?.student?.hsc_grand_total,
            FormNo: ref?.student?.form_no,
            QviplePayId: ref?.student?.qviple_student_pay_id,
            ...numss,
          });
        }
      }

      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
        });
      }
    } else if (
      `${flow}` === "Fees_Query" &&
      valid_apply?.FeeCollectionApplication?.length > 0
    ) {
      var excel_list = [];
      var numss = {};
      for (var ref of valid_apply?.FeeCollectionApplication) {
        if (ref?.student?.studentFirstName != "") {
          for (let ele of ref?.student?.student_dynamic_field) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numss[ele?.key] = ele?.value;
          }
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName ??
                  ref?.student?.studentFatherName
                : ""
            } ${ref?.student?.studentLastName}`,
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            DOB: ref?.student?.studentDOB ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
            NameAsCertificate: ref?.student?.studentNameAsCertificate,
            BirthPlace: ref?.student?.studentBirthPlace,
            Religion: ref?.student?.studentReligion,
            Caste: ref?.student?.studentCast,
            Nationality: ref?.student?.studentNationality,
            RationCard: ref?.student?.studentFatherRationCardColor,
            BloodGroup: ref?.student?.student_blood_group,
            AadharNumber: ref?.student?.studentAadharNumber,
            PhoneNumber: ref?.student?.studentPhoneNumber,
            Email: ref?.student?.studentEmail,
            ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
            CurrentAddress: ref?.student?.studentCurrentAddress,
            CurrentPinCode: ref?.student?.studentCurrentPincode,
            CurrentState: ref?.student?.studentCurrentState,
            CurrentDistrict: ref?.student?.studentCurrentDistrict,
            Address: ref?.student?.studentAddress,
            PinCode: ref?.student?.studentPincode,
            State: ref?.student?.studentState,
            District: ref?.student?.studentDistrict,
            ParentsName: ref?.student?.studentParentsName,
            ParentsEmail: ref?.student?.studentParentsEmail,
            ParentsOccupation: ref?.student?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.student?.studentParentsAddress,
            ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
            SeatType: ref?.student?.student_seat_type,
            PhysicallyHandicapped: ref?.student?.student_ph_type,
            DefencePersonnel: ref?.student?.student_defence_personnel_word,
            MaritalStatus: ref?.student?.student_marital_status,
            PreviousBoard: ref?.student?.student_board_university,
            PreviousSchool: ref?.student?.studentPreviousSchool,
            UniversityCourse: ref?.student?.student_university_courses,
            PassingYear: ref?.student?.student_year,
            PreviousClass: ref?.student?.student_previous_class,
            PreviousMarks: ref?.student?.student_previous_marks,
            PreviousPercentage: ref?.student?.student_previous_percentage,
            SeatNo: ref?.student?.student_previous_section,
            StandardMOP: ref?.student?.month_of_passing,
            StandardYOP: ref?.student?.year_of_passing,
            StandardPercentage: ref?.student?.percentage,
            StandardNameOfInstitute: ref?.student?.name_of_institute,
            HSCMOP: ref?.student?.hsc_month,
            HSCYOP: ref?.student?.hsc_year,
            HSCPercentage: ref?.student?.hsc_percentage,
            HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
            HSCBoard: ref?.student?.hsc_board,
            HSCCandidateType: ref?.student?.hsc_candidate_type,
            HSCVocationalType: ref?.student?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
            HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.student?.hsc_pcm_total,
            HSCGrandTotal: ref?.student?.hsc_grand_total,
            FormNo: ref?.student?.form_no,
            QviplePayId: ref?.student?.qviple_student_pay_id,
            ...numss,
          });
        }
      }

      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
        });
      }
    } else if (
      `${flow}` === "Confirm_Query" &&
      valid_apply?.confirmedApplication?.length > 0
    ) {
      var excel_list = [];
      var numss = {};
      for (var ref of valid_apply?.confirmedApplication) {
        if (ref?.student?.studentFirstName != "") {
          for (let ele of ref?.student?.student_dynamic_field) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numss[ele?.key] = ele?.value;
          }
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName ??
                  ref?.student?.studentFatherName
                : ""
            } ${ref?.student?.studentLastName}`,
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            DOB: ref?.student?.studentDOB ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
            NameAsCertificate: ref?.student?.studentNameAsCertificate,
            BirthPlace: ref?.student?.studentBirthPlace,
            Religion: ref?.student?.studentReligion,
            Caste: ref?.student?.studentCast,
            Nationality: ref?.student?.studentNationality,
            RationCard: ref?.student?.studentFatherRationCardColor,
            BloodGroup: ref?.student?.student_blood_group,
            AadharNumber: ref?.student?.studentAadharNumber,
            PhoneNumber: ref?.student?.studentPhoneNumber,
            Email: ref?.student?.studentEmail,
            ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
            CurrentAddress: ref?.student?.studentCurrentAddress,
            CurrentPinCode: ref?.student?.studentCurrentPincode,
            CurrentState: ref?.student?.studentCurrentState,
            CurrentDistrict: ref?.student?.studentCurrentDistrict,
            Address: ref?.student?.studentAddress,
            PinCode: ref?.student?.studentPincode,
            State: ref?.student?.studentState,
            District: ref?.student?.studentDistrict,
            ParentsName: ref?.student?.studentParentsName,
            ParentsEmail: ref?.student?.studentParentsEmail,
            ParentsOccupation: ref?.student?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.student?.studentParentsAddress,
            ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
            SeatType: ref?.student?.student_seat_type,
            PhysicallyHandicapped: ref?.student?.student_ph_type,
            DefencePersonnel: ref?.student?.student_defence_personnel_word,
            MaritalStatus: ref?.student?.student_marital_status,
            PreviousBoard: ref?.student?.student_board_university,
            PreviousSchool: ref?.student?.studentPreviousSchool,
            UniversityCourse: ref?.student?.student_university_courses,
            PassingYear: ref?.student?.student_year,
            PreviousClass: ref?.student?.student_previous_class,
            PreviousMarks: ref?.student?.student_previous_marks,
            PreviousPercentage: ref?.student?.student_previous_percentage,
            SeatNo: ref?.student?.student_previous_section,
            StandardMOP: ref?.student?.month_of_passing,
            StandardYOP: ref?.student?.year_of_passing,
            StandardPercentage: ref?.student?.percentage,
            StandardNameOfInstitute: ref?.student?.name_of_institute,
            HSCMOP: ref?.student?.hsc_month,
            HSCYOP: ref?.student?.hsc_year,
            HSCPercentage: ref?.student?.hsc_percentage,
            HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
            HSCBoard: ref?.student?.hsc_board,
            HSCCandidateType: ref?.student?.hsc_candidate_type,
            HSCVocationalType: ref?.student?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
            HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.student?.hsc_pcm_total,
            HSCGrandTotal: ref?.student?.hsc_grand_total,
            FormNo: ref?.student?.form_no,
            QviplePayId: ref?.student?.qviple_student_pay_id,
            ...numss,
          });
        }
      }
      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
        });
      }
    } else if (
      `${flow}` === "Review_Query" &&
      valid_apply?.reviewApplication?.length > 0
    ) {
      // const all_group_select = await SubjectGroupSelect.find({ $and: [{ subject_group: { $in: valid_apply?.subject_selected_group } }] })
      // .populate({
      //   path: "compulsory_subject",
      //   select: "subjectName",
      // })
      // .populate({
      //   path: "optional_subject",
      //   populate: {
      //     path: "optional_subject_options optional_subject_options_or.options",
      //     select: "subjectName",
      //   }
      // })
      // .populate({
      //   path: "fixed_subject",
      //   populate: {
      //     path: "fixed_subject_options",
      //     select: "subjectName",
      //   }
      // })
      // var subject_list = []
      // for (let ele of all_group_select) {
      //   subject_list.push(...ele?.compulsory_subject)
      // }
      // for (let ele of all_group_select) {
      //   for (let val of ele?.fixed_subject) {
      //     subject_list.push(...val?.fixed_subject_options)
      //   }
      // }
      // for (let ele of all_group_select) {
      //   for (let val of ele?.optional_subject) {
      //     subject_list.push(...val?.optional_subject_options)
      //   }
      //   for (let val of ele?.optional_subject) {
      //     for (let stu of val?.optional_subject_options_or) {
      //       subject_list.push(...stu?.options)
      //     }
      //   }
      // }
      var excel_list = [];
      var numss = {};
      // var numsss = {};
      for (var ref of valid_apply?.reviewApplication) {
        if (ref?.studentFirstName != "") {
          for (let ele of ref?.student_dynamic_field) {
            // numss.push(
            //   [ele?.key]: ele?.value,
            // );
            numss[ele?.key] = ele?.value;
          }
          // var nums_queue = {};
          // for (let stu of subject_list) {
          //   ref.student_dynamic_subject.push({
          //     subjectName: stu?.subjectName,
          //     status: "No",
          //     _id: stu?._id
          //   })
          // }
          // for (let ele of ref.student_dynamic_subject) {
          //   for (let val of ref?.student_optional_subject) {
          //     if (`${ele?._id}` === `${val?._id}`) {
          //       nums_queue[ele?.subjectName] = "Yes"
          //       ele.status = "Yes"
          //     }
          //   }
          // }
          // for (let val of ref.student_dynamic_subject) {
          //   for (let ele of ref?.major_subject) {
          //     if (`${val?._id}` === `${ele?._id}`) {
          //       nums_queue[val?.subjectName] = "Yes"
          //       ele.status = "Yes"
          //     }
          //   }
          // }
          // if (ref?.nested_subject?.length > 0) {
          //   for (let val of ref.student_dynamic_subject) {
          //     for (let ele of ref?.nested_subject) {
          //       if (`${val?._id}` === `${ele?._id}`) {
          //         nums_queue[val?.subjectName] = "Yes"
          //         ele.status = "Yes"
          //       }
          //     }
          //   }
          // }
          // for (let ele of ref?.student_dynamic_subject) {
          //   // numss.push(
          //   //   [ele?.key]: ele?.value,
          //   // );
          //   numsss[ele?.subjectName] = ele?.status;
          // }
          // console.log(numsss)
          excel_list.push({
            RegistrationID: ref?.student_prn_enroll_number ?? "#NA",
            Name: `${ref?.studentFirstName} ${
              ref?.studentMiddleName
                ? ref?.studentMiddleName ?? ref?.studentFatherName
                : ""
            } ${ref?.studentLastName}`,
            FirstName: ref?.studentFirstName ?? "#NA",
            FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
            LastName: ref?.studentLastName ?? "#NA",
            DOB: ref?.studentDOB ?? "#NA",
            Gender: ref?.studentGender ?? "#NA",
            CasteCategory: ref?.studentCastCategory ?? "#NA",
            Religion: ref?.studentReligion ?? "#NA",
            MotherName: `${ref?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
            ContactNo: ref?.studentPhoneNumber ?? "#NA",
            AlternateContactNo: ref?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.studentNameAsMarksheet,
            NameAsCertificate: ref?.studentNameAsCertificate,
            BirthPlace: ref?.studentBirthPlace,
            Religion: ref?.studentReligion,
            Caste: ref?.studentCast,
            Nationality: ref?.studentNationality,
            RationCard: ref?.studentFatherRationCardColor,
            BloodGroup: ref?.student_blood_group,
            AadharNumber: ref?.studentAadharNumber,
            PhoneNumber: ref?.studentPhoneNumber,
            Email: ref?.studentEmail,
            ParentsPhoneNumber: ref?.studentParentsPhoneNumber,
            CurrentAddress: ref?.studentCurrentAddress,
            CurrentPinCode: ref?.studentCurrentPincode,
            CurrentState: ref?.studentCurrentState,
            CurrentDistrict: ref?.studentCurrentDistrict,
            Address: ref?.studentAddress,
            PinCode: ref?.studentPincode,
            State: ref?.studentState,
            District: ref?.studentDistrict,
            ParentsName: ref?.studentParentsName,
            ParentsEmail: ref?.studentParentsEmail,
            ParentsOccupation: ref?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.studentParentsAddress,
            ParentsAnnualIncome: ref?.studentParentsAnnualIncom,
            SeatType: ref?.student_seat_type,
            PhysicallyHandicapped: ref?.student_ph_type,
            DefencePersonnel: ref?.student_defence_personnel_word,
            MaritalStatus: ref?.student_marital_status,
            PreviousBoard: ref?.student_board_university,
            PreviousSchool: ref?.studentPreviousSchool,
            UniversityCourse: ref?.student_university_courses,
            PassingYear: ref?.student_year,
            PreviousClass: ref?.student_previous_class,
            PreviousMarks: ref?.student_previous_marks,
            PreviousPercentage: ref?.student_previous_percentage,
            SeatNo: ref?.student_previous_section,
            StandardMOP: ref?.month_of_passing,
            StandardYOP: ref?.year_of_passing,
            StandardPercentage: ref?.percentage,
            StandardNameOfInstitute: ref?.name_of_institute,
            HSCMOP: ref?.hsc_month,
            HSCYOP: ref?.hsc_year,
            HSCPercentage: ref?.hsc_percentage,
            HSCNameOfInstitute: ref?.hsc_name_of_institute,
            HSCBoard: ref?.hsc_board,
            HSCCandidateType: ref?.hsc_candidate_type,
            HSCVocationalType: ref?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.hsc_physics_marks,
            HSCChemistryMarks: ref?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.hsc_pcm_total,
            HSCGrandTotal: ref?.hsc_grand_total,
            FormNo: ref?.form_no,
            QviplePayId: ref?.qviple_student_pay_id,
            ...numss,
            // ...numsss
          });
        }
      }

      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
        });
      } else {
        res.status(200).send({
          message: "No New Excel Exports ",
          access: false,
        });
      }
    }
    // else if (
    //   `${flow}` === "Allot_Query" &&
    //   valid_apply?.allottedApplication?.length > 0
    // ) {
    //   var excel_list = [];
    //   if (valid_apply?.applicationHostel) {
    //     for (var ref of valid_apply?.allottedApplication) {
    //       excel_list.push({
    //         RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
    //         GRNO: ref?.student?.studentGRNO ?? "#NA",
    //         Name: `${ref?.student?.studentFirstName} ${ref?.student?.studentMiddleName
    //             ? ref?.student?.studentMiddleName
    //             : ""
    //           } ${ref?.student?.studentLastName}`,
    //         DOB: ref?.student?.studentDOB ?? "#NA",
    //         Gender: ref?.student?.studentGender ?? "#NA",
    //         CPI: ref?.student?.student_hostel_cpi ?? "#NA",
    //         Programme: ref?.student?.student_programme ?? "#NA",
    //         Branch: ref?.student?.student_branch ?? "#NA",
    //         Year: ref?.student?.student_year ?? "#NA",
    //         SingleSeaterRoom: ref?.student?.student_single_seater_room ?? "#NA",
    //         PhysicallyHandicapped: ref?.student?.student_ph ?? "#NA",
    //         Caste: ref?.student?.studentCastCategory ?? "#NA",
    //         Religion: ref?.student?.studentReligion ?? "#NA",
    //         MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
    //         ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
    //         Address: `${ref?.student?.studentAddress}` ?? "#NA",
    //         AppliedOn: `${moment(ref?.apply_on).format("LL")}`,
    //         ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
    //         AlternateContactNo:
    //           ref?.student?.studentParentsPhoneNumber ?? "#NA",
    //       });
    //     }
    //   }
    //   else {
    //     const all_group_select = await SubjectGroupSelect.find({ $and: [{ subject_group: { $in: valid_apply?.subject_selected_group } }] })
    //       .populate({
    //         path: "compulsory_subject",
    //         select: "subjectName",
    //       })
    //       .populate({
    //         path: "optional_subject",
    //         populate: {
    //           path: "optional_subject_options optional_subject_options_or.options",
    //           select: "subjectName",
    //         }
    //       })
    //       .populate({
    //         path: "fixed_subject",
    //         populate: {
    //           path: "fixed_subject_options",
    //           select: "subjectName",
    //         }
    //       })
    //     var subject_list = []
    //     for (let ele of all_group_select) {
    //       subject_list.push(...ele?.compulsory_subject)
    //     }
    //     for (let ele of all_group_select) {
    //       for (let val of ele?.fixed_subject) {
    //         subject_list.push(...val?.fixed_subject_options)
    //       }
    //     }
    //     for (let ele of all_group_select) {
    //       for (let val of ele?.optional_subject) {
    //         subject_list.push(...val?.optional_subject_options)
    //       }
    //       for (let val of ele?.optional_subject) {
    //         for (let stu of val?.optional_subject_options_or) {
    //           subject_list.push(...stu?.options)
    //         }
    //       }
    //     }
    //     var numss = {};
    //     var numsss = {};
    //     for (var ref of valid_apply?.allottedApplication) {
    //       if (ref?.student?.studentFirstName != "") {
    //         for (let ele of ref?.student?.student_dynamic_field) {
    //           // numss.push(
    //           //   [ele?.key]: ele?.value,
    //           // );
    //           numss[ele?.key] = ele?.value;
    //         }
    //         var nums_queue = {};
    //         for (let stu of subject_list) {
    //           ref.student.student_dynamic_subject.push({
    //             subjectName: stu?.subjectName,
    //             status: "No",
    //             _id: stu?._id
    //           })
    //         }
    //         for (let ele of ref?.student?.student_dynamic_subject) {
    //           for (let val of ref?.student?.student_optional_subject) {
    //             if (`${ele?._id}` === `${val?._id}`) {
    //               nums_queue[ele?.subjectName] = "Yes"
    //               ele.status = "Yes"
    //             }
    //           }
    //         }
    //         for (let val of ref?.student?.student_dynamic_subject) {
    //           for (let ele of ref?.student?.major_subject) {
    //             if (`${val?._id}` === `${ele?._id}`) {
    //               nums_queue[val?.subjectName] = "Yes"
    //               ele.status = "Yes"
    //             }
    //           }
    //         }
    //         if (ref?.nested_subject?.length > 0) {
    //           for (let val of ref?.student?.student_dynamic_subject) {
    //             for (let ele of ref?.student?.nested_subject) {
    //               if (`${val?._id}` === `${ele?._id}`) {
    //                 nums_queue[val?.subjectName] = "Yes"
    //                 ele.status = "Yes"
    //               }
    //             }
    //           }
    //         }
    //         for (let ele of ref?.student?.student_dynamic_subject) {
    //           // numss.push(
    //           //   [ele?.key]: ele?.value,
    //           // );
    //           numsss[ele?.subjectName] = ele?.status;
    //         }
    //         excel_list.push({
    //           RegistrationID: ref?.student?.studentGRNO ?? "#NA",
    //           Name: `${ref?.student?.studentFirstName} ${ref?.student?.studentMiddleName
    //             ? ref?.student?.studentMiddleName ??
    //             ref?.student?.studentFatherName
    //             : ""
    //             } ${ref?.student?.studentLastName}`,
    //           DOB: ref?.student?.studentDOB ?? "#NA",
    //           Gender: ref?.student?.studentGender ?? "#NA",
    //           CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
    //           Religion: ref?.student?.studentReligion ?? "#NA",
    //           MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
    //           ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
    //           Address: `${ref?.student?.studentAddress}` ?? "#NA",
    //           AppliedOn: `${moment(ref?.student?.createdAt).format("LL")}`,
    //           ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
    //           AlternateContactNo:
    //             ref?.student?.studentParentsPhoneNumber ?? "#NA",
    //           NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
    //           NameAsCertificate: ref?.student?.studentNameAsCertificate,
    //           BirthPlace: ref?.student?.studentBirthPlace,
    //           Religion: ref?.student?.studentReligion,
    //           Caste: ref?.student?.studentCast,
    //           Nationality: ref?.student?.studentNationality,
    //           RationCard: ref?.student?.studentFatherRationCardColor,
    //           BloodGroup: ref?.student?.student_blood_group,
    //           AadharNumber: ref?.student?.studentAadharNumber,
    //           PhoneNumber: ref?.student?.studentPhoneNumber,
    //           Email: ref?.student?.studentEmail,
    //           ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
    //           CurrentAddress: ref?.student?.studentCurrentAddress,
    //           CurrentPinCode: ref?.student?.studentCurrentPincode,
    //           CurrentState: ref?.student?.studentCurrentState,
    //           CurrentDistrict: ref?.student?.studentCurrentDistrict,
    //           Address: ref?.student?.studentAddress,
    //           PinCode: ref?.student?.studentPincode,
    //           State: ref?.student?.studentState,
    //           District: ref?.student?.studentDistrict,
    //           ParentsName: ref?.student?.studentParentsName,
    //           ParentsEmail: ref?.student?.studentParentsEmail,
    //           ParentsOccupation: ref?.student?.studentParentsOccupation,
    //           ParentsOfficeAddress: ref?.student?.studentParentsAddress,
    //           ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
    //           SeatType: ref?.student?.student_seat_type,
    //           PhysicallyHandicapped: ref?.student?.student_ph_type,
    //           DefencePersonnel: ref?.student?.student_defence_personnel_word,
    //           MaritalStatus: ref?.student?.student_marital_status,
    //           PreviousBoard: ref?.student?.student_board_university,
    //           PreviousSchool: ref?.student?.studentPreviousSchool,
    //           UniversityCourse: ref?.student?.student_university_courses,
    //           PassingYear: ref?.student?.student_year,
    //           PreviousClass: ref?.student?.student_previous_class,
    //           PreviousMarks: ref?.student?.student_previous_marks,
    //           PreviousPercentage: ref?.student?.student_previous_percentage,
    //           SeatNo: ref?.student?.student_previous_section,
    //           StandardMOP: ref?.student?.month_of_passing,
    //           StandardYOP: ref?.student?.year_of_passing,
    //           StandardPercentage: ref?.student?.percentage,
    //           StandardNameOfInstitute: ref?.student?.name_of_institute,
    //           HSCMOP: ref?.student?.hsc_month,
    //           HSCYOP: ref?.student?.hsc_year,
    //           HSCPercentage: ref?.student?.hsc_percentage,
    //           HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
    //           HSCBoard: ref?.student?.hsc_board,
    //           HSCCandidateType: ref?.student?.hsc_candidate_type,
    //           HSCVocationalType: ref?.student?.hsc_vocational_type,
    //           HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
    //           HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
    //           HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
    //           HSCPCMTotal: ref?.student?.hsc_pcm_total,
    //           HSCGrandTotal: ref?.student?.hsc_grand_total,
    //           FormNo: ref?.student?.form_no,
    //           QviplePayId: ref?.student?.qviple_student_pay_id,
    //           ...numss,
    //           ...numsss
    //         });
    //       }
    //     }
    //     var valid_back = await json_to_excel_admission_application_query(
    //       excel_list,
    //       valid_apply?.applicationName,
    //       appId,
    //       flow
    //     );
    //     if (valid_back?.back) {
    //       res.status(200).send({
    //         message: "Explore New Excel On Hostel Export TAB",
    //         access: true,
    //       });
    //     } else {
    //       res.status(200).send({
    //         message: "No New Excel Exports ",
    //         access: false,
    //       });
    //     }
    //   }
    //   res.status(200).send({
    //     message: "No Applications Found",
    //     access: false,
    //   });
    // }
  } catch (e) {
    console.log(e);
  }
};

exports.render_other_fees_daybook_heads_wise = async (req, res) => {
  try {
    const { fid } = req.params;
    const { from, to, bank, payment_type, staff } = req.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    res.status(200).send({
      message: "Explore Day Book Heads Query",
      access: true,
    });
    await miscellaneousBankDaybook(
      fid,
      from,
      to,
      bank,
      payment_type,
      "",
      staff
    );
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    let pg = ["Payment Gateway - PG", "By Cash", "Payment Gateway / Online"];
    var sorted_array = [];
    const bank_acc = await BankAccount.findById({ _id: bank });
    const finance = await Finance.findById({ _id: fid }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select(
      "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
    );

    var g_year = new Date(`${from}`).getFullYear();
    var g_day = new Date(`${from}`).getDate();
    var l_year = new Date(`${to}`).getFullYear();
    var l_day = new Date(`${to}`).getDate();
    var g_month = new Date(`${from}`).getMonth() + 1;
    if (g_month < 10) {
      g_month = `0${g_month}`;
    }
    if (g_day < 10) {
      g_day = `0${g_day}`;
    }
    var l_month = new Date(`${to}`).getMonth() + 1;
    if (l_month < 10) {
      l_month = `0${l_month}`;
    }
    if (l_day < 10) {
      l_day = `0${l_day}`;
    }
    const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
    const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
    date.setDate(date.getDate() + 1);
    let l_dates = date.getDate();
    if (l_dates < 10) {
      l_dates = `0${l_dates}`;
    }
    const l_date = new Date(`${l_year}-${l_month}-${l_dates}T00:00:00.000Z`);
    if (payment_type) {
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_FINANCE_MANAGER",
          },
          {
            refund_status: "No Refund",
          },
          {
            fee_payment_mode: payment_type,
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select("fee_heads other_fees")
        .populate({
          path: "other_fees",
          select: "bank_account fees_heads",
          populate: {
            path: "bank_account",
            select:
              "finance_bank_account_number finance_bank_name finance_bank_account_name",
          },
        })
        .lean()
        .exec();
    } else {
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_FINANCE_MANAGER",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select("fee_heads other_fees")
        .populate({
          path: "other_fees",
          select: "bank_account fees_heads",
          populate: {
            path: "bank_account",
            select:
              "finance_bank_account_number finance_bank_name finance_bank_account_name",
          },
        })
        .lean()
        .exec();
    }
    // console.log(all_receipts)
    all_receipts = all_receipts?.filter((val) => {
      if (val?.other_fees?._id) return val;
    });
    if (bank_acc?.bank_account_type === "Society") {
    } else {
      all_receipts = all_receipts?.filter((val) => {
        if (`${val?.other_fees?.bank_account?._id}` === `${bank}`) return val;
      });
    }
    let heads_queue = [];
    for (let i of all_receipts) {
      for (let j of i?.other_fees?.fees_heads) {
        heads_queue.push(j?.master);
      }
    }
    const unique = [...new Set(heads_queue.map((item) => item))];
    const all_master = await FeeMaster.find({
      _id: { $in: unique },
    }).select("master_name");
    var obj = {};
    var nest_obj = [];
    for (let ele of all_master) {
      obj["head_name"] = ele?.master_name;
      obj["head_amount"] = 0;
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
        if (ele?.fee_heads?.length > 0) {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                  console.log(ads.head_amount);
                }
              }
            }
          }
        } else {
          console.log("NO");
        }
      }
      // nest_obj.push({
      //   head_name: "Total Fees",
      //   head_amount: t
      // })
      // let n = []
      // for (let ele of all_receipts) {
      //   n.push(ele?.fee_payment_amount)
      // }
      // res.status(200).send({
      //   message: "Explore Other Fees Day Book Heads Query",
      //   access: true,
      //   all_receipts: all_receipts?.length,
      // //   t: t,
      // //   tl: t?.length,
      // //  l:l,
      // //  ll:l?.length
      //   results: nest_obj,
      //   // account_info: bank_acc,
      //   // day_range_from: from,
      //   // day_range_to: to,
      //   // ins_info: institute,
      // });
    } else {
      // res.status(200).send({
      //   message: "No Day Book Heads Query",
      //   access: false,
      //   results: [],
      // });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderApplicationAllottedListQuery = async (req, res) => {
  try {
    const { appId } = req.params;
    const { flow } = req.query;
    if (!appId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_apply = await NewApplication.findById({ _id: appId })
      .select(
        "receievedApplication applicationUnit applicationName confirmedApplication allottedApplication applicationHostel admissionAdmin subject_selected_group"
      )
      .populate({
        path: "allottedApplication",
        populate: {
          path: "student",
          populate: {
            path: "student_optional_subject major_subject nested_subject student_single_subject",
            select: "subjectName",
          },
        },
      });

    if (valid_apply?.allottedApplication?.length > 0) {
      var excel_list = [];
      const all_group_select = await SubjectGroupSelect.find({
        $and: [{ subject_group: { $in: valid_apply?.subject_selected_group } }],
      })
        .populate({
          path: "compulsory_subject",
          select: "subjectName",
        })
        .populate({
          path: "optional_subject",
          populate: {
            path: "optional_subject_options optional_subject_options_or.options",
            select: "subjectName",
          },
        })
        .populate({
          path: "fixed_subject",
          populate: {
            path: "fixed_subject_options",
            select: "subjectName",
          },
        });
      var subject_list = [];
      for (let ele of all_group_select) {
        subject_list.push(...ele?.compulsory_subject);
      }
      for (let ele of all_group_select) {
        for (let val of ele?.fixed_subject) {
          subject_list.push(...val?.fixed_subject_options);
        }
      }
      for (let ele of all_group_select) {
        for (let val of ele?.optional_subject) {
          subject_list.push(...val?.optional_subject_options);
        }
        for (let val of ele?.optional_subject) {
          for (let stu of val?.optional_subject_options_or) {
            subject_list.push(...stu?.options);
          }
        }
      }
      var numss = {};
      var numsss = {};
      for (var ref of valid_apply?.allottedApplication) {
        if (ref?.student?.studentFirstName != "") {
          for (let ele of ref?.student?.student_dynamic_field) {
            numss[ele?.key] = ele?.value;
          }
          var nums_queue = {};
          for (let stu of subject_list) {
            ref.student.student_dynamic_subject.push({
              subjectName: stu?.subjectName,
              status: "No",
              _id: stu?._id,
            });
          }
          for (let ele of ref?.student?.student_dynamic_subject) {
            for (let val of ref?.student?.student_optional_subject) {
              if (`${ele?._id}` === `${val?._id}`) {
                ref.student.student_single_subject.push(val?.subjectName);
              }
            }
          }
          for (let val of ref?.student?.student_dynamic_subject) {
            for (let ele of ref?.student?.major_subject) {
              if (`${val?._id}` === `${ele?._id}`) {
                ref.student.student_single_subject.push(val?.subjectName);
              }
            }
          }
          if (ref?.nested_subject?.length > 0) {
            for (let val of ref?.student?.student_dynamic_subject) {
              for (let ele of ref?.student?.nested_subject) {
                if (`${val?._id}` === `${ele?._id}`) {
                  ref.student.student_single_subject.push(val?.subjectName);
                }
              }
            }
          }
          for (let val of ref?.student?.student_optional_subject) {
            if (
              ref.student.student_single_subject?.includes(
                `${val?.subjectName}`
              )
            ) {
            } else {
              ref.student.student_single_subject.push(val?.subjectName);
            }
          }
          const unique = [
            ...new Set(
              ref?.student?.student_single_subject.map((item) => item)
            ),
          ];
          excel_list.push({
            RegistrationID: ref?.student?.studentGRNO ?? "#NA",
            "ABC ID": ref?.student?.student_abc_id ?? "",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName ??
                  ref?.student?.studentFatherName
                : ""
            } ${ref?.student?.studentLastName}`,
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            DOB:
              moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
              "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.student?.createdAt).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
            NameAsCertificate: ref?.student?.studentNameAsCertificate,
            BirthPlace: ref?.student?.studentBirthPlace,
            Religion: ref?.student?.studentReligion,
            Caste: ref?.student?.studentCast,
            Nationality: ref?.student?.studentNationality,
            RationCard: ref?.student?.studentFatherRationCardColor,
            BloodGroup: ref?.student?.student_blood_group,
            AadharNumber: ref?.student?.studentAadharNumber,
            PhoneNumber: ref?.student?.studentPhoneNumber,
            Email: ref?.student?.studentEmail,
            ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
            CurrentAddress: ref?.student?.studentCurrentAddress,
            CurrentPinCode: ref?.student?.studentCurrentPincode,
            CurrentState: ref?.student?.studentCurrentState,
            CurrentDistrict: ref?.student?.studentCurrentDistrict,
            Address: ref?.student?.studentAddress,
            PinCode: ref?.student?.studentPincode,
            State: ref?.student?.studentState,
            District: ref?.student?.studentDistrict,
            ParentsName: ref?.student?.studentParentsName,
            ParentsEmail: ref?.student?.studentParentsEmail,
            ParentsOccupation: ref?.student?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.student?.studentParentsAddress,
            ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
            SeatType: ref?.student?.student_seat_type,
            PhysicallyHandicapped: ref?.student?.student_ph_type,
            DefencePersonnel: ref?.student?.student_defence_personnel_word,
            MaritalStatus: ref?.student?.student_marital_status,
            PreviousBoard: ref?.student?.student_board_university,
            PreviousSchool: ref?.student?.studentPreviousSchool,
            UniversityCourse: ref?.student?.student_university_courses,
            PassingYear: ref?.student?.student_year,
            PreviousClass: ref?.student?.student_previous_class,
            PreviousMarks: ref?.student?.student_previous_marks,
            PreviousPercentage: ref?.student?.student_previous_percentage,
            SeatNo: ref?.student?.student_previous_section,
            StandardMOP: ref?.student?.month_of_passing,
            StandardYOP: ref?.student?.year_of_passing,
            StandardPercentage: ref?.student?.percentage,
            StandardNameOfInstitute: ref?.student?.name_of_institute,
            HSCMOP: ref?.student?.hsc_month,
            HSCYOP: ref?.student?.hsc_year,
            HSCPercentage: ref?.student?.hsc_percentage,
            HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
            HSCBoard: ref?.student?.hsc_board,
            HSCCandidateType: ref?.student?.hsc_candidate_type,
            HSCVocationalType: ref?.student?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
            HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.student?.hsc_pcm_total,
            HSCGrandTotal: ref?.student?.hsc_grand_total,
            FormNo: ref?.student?.form_no,
            QviplePayId: ref?.student?.qviple_student_pay_id,
            ...numss,
            ...unique,
          });
        }
      }
      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
          excel_list,
        });
      }
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_hostel_daybook_heads_wise = async (req, res) => {
  try {
    const { fid } = req.params;
    const { from, to, bank, payment_type, hid, staff } = req.query;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    res.status(200).send({
      message: "Explore Day Book Heads Query",
      access: true,
    });
    await hostelBankDaybook(fid, hid, from, to, bank, payment_type, "", staff);
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    var sorted_array = [];
    const bank_acc = await BankAccount.findById({ _id: bank });
    const finance = await Finance.findById({ _id: fid }).select("institute");
    const hostel = await Hostel.findById({ _id: hid }).select("institute");
    var all_struct = await FeeStructure.find({
      $and: [{ hostel: hostel?._id }, { document_update: false }],
    });
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select(
      "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
    );

    var g_year = new Date(`${from}`).getFullYear();
    var g_day = new Date(`${from}`).getDate();
    var l_year = new Date(`${to}`).getFullYear();
    var l_day = new Date(`${to}`).getDate();
    var g_month = new Date(`${from}`).getMonth() + 1;
    if (g_month < 10) {
      g_month = `0${g_month}`;
    }
    if (g_day < 10) {
      g_day = `0${g_day}`;
    }
    var l_month = new Date(`${to}`).getMonth() + 1;
    if (l_month < 10) {
      l_month = `0${l_month}`;
    }
    if (l_day < 10) {
      l_day = `0${l_day}`;
    }
    const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
    const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
    date.setDate(date.getDate() + 1);
    let l_dates = date.getDate();
    if (l_dates < 10) {
      l_dates = `0${l_dates}`;
    }
    const l_date = new Date(`${l_year}-${l_month}-${l_dates}T00:00:00.000Z`);
    if (payment_type) {
      if (payment_type == "BOTH") {
        var all_receipts_set = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              created_at: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_HOSTEL_MANAGER",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
          )
          .populate({
            path: "application",
            select: "hostelAdmin",
            populate: {
              path: "hostelAdmin",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
        var all_receipts = all_receipts_set?.filter((val) => {
          if (
            `${val?.fee_payment_mode}` === "By Cash" ||
            `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
            `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
            `${val?.fee_payment_mode}` === "Cheque" ||
            `${val?.fee_payment_mode}` === "Net Banking" ||
            `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
            `${val?.fee_payment_mode}` === "UPI Transfer" ||
            `${val?.fee_payment_mode}` === "Demand Draft"
          ) {
            return val;
          }
        });
      } else if (payment_type == "CASH_BANK") {
        var all_receipts_set = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              created_at: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_HOSTEL_MANAGER",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
          )
          .populate({
            path: "application",
            select: "hostelAdmin",
            populate: {
              path: "hostelAdmin",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
        var all_receipts = all_receipts_set?.filter((val) => {
          if (
            `${val?.fee_payment_mode}` === "By Cash" ||
            `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
            `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
            `${val?.fee_payment_mode}` === "Cheque" ||
            `${val?.fee_payment_mode}` === "Net Banking" ||
            `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
            `${val?.fee_payment_mode}` === "UPI Transfer" ||
            `${val?.fee_payment_mode}` === "Demand Draft"
          ) {
            return val;
          }
        });
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              created_at: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_HOSTEL_MANAGER",
            },
            {
              refund_status: "No Refund",
            },
            {
              fee_payment_mode: payment_type,
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
          )
          .populate({
            path: "application",
            select: "hostelAdmin",
            populate: {
              path: "hostelAdmin",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
      }
    } else {
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_HOSTEL_MANAGER",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select("fee_heads application fee_payment_mode")
        .populate({
          path: "application",
          select: "hostelAdmin",
          populate: {
            path: "hostelAdmin",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();
    }
    // console.log(all_receipts)
    all_receipts = all_receipts?.filter((val) => {
      if (`${val?.application?.hostelAdmin?.bank_account?._id}` === `${bank}`)
        return val;
    });
    let heads_queue = [];
    for (let ele of all_struct) {
      for (let val of ele?.applicable_fees_heads) {
        if (val?.is_society == false) {
          if (heads_queue?.includes(`${val?.master}`)) {
          } else {
            heads_queue.push(val?.master);
          }
        }
      }
    }
    const all_master = await FeeMaster.find({
      _id: { $in: heads_queue },
    }).select("master_name");
    var obj = {};
    var nest_obj = [];
    for (let ele of all_master) {
      obj["head_name"] = ele?.master_name;
      obj["head_amount"] = 0;
      obj["cash_head_amount"] = 0;
      obj["pg_head_amount"] = 0;
      obj["bank_head_amount"] = 0;
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }
    // var t = 0
    var t = [];
    var l = [];
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
        if (payment_type == "BOTH") {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (ele?.fee_payment_mode == "By Cash") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.cash_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.pg_head_amount += val?.original_paid;
                  // if (val?.master == "6654be24e36490a31bccd1db") {
                  //   t.push(`${val?.original_paid}`);
                  // }
                  // if (val?.master == "6654be3de36490a31bccd257") {
                  //   l.push(`${val?.original_paid}`);
                  // }
                  // t+= val?.original_paid
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.pg_head_amount += val?.original_paid;
                  // if (val?.master == "6654be24e36490a31bccd1db") {
                  //   t.push(`${val?.original_paid}`);
                  // }
                  // if (val?.master == "6654be3de36490a31bccd257") {
                  //   l.push(`${val?.original_paid}`);
                  // }
                  // t+= val?.original_paid
                }
              }
              if (ele?.fee_payment_mode == "Net Banking") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "UPI Transfer") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "Cheque") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "Demand Draft") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (
                `${ads?._id}` === `${val?.master}` &&
                val?.is_society == false
              ) {
                ads.head_amount += val?.original_paid;
              }
            }
          }
        } else if (payment_type == "CASH_BANK") {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (ele?.fee_payment_mode == "By Cash") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.cash_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                  // if (val?.master == "6654be24e36490a31bccd1db") {
                  //   t.push(`${val?.original_paid}`);
                  // }
                  // if (val?.master == "6654be3de36490a31bccd257") {
                  //   l.push(`${val?.original_paid}`);
                  // }
                  // t+= val?.original_paid
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                  // if (val?.master == "6654be24e36490a31bccd1db") {
                  //   t.push(`${val?.original_paid}`);
                  // }
                  // if (val?.master == "6654be3de36490a31bccd257") {
                  //   l.push(`${val?.original_paid}`);
                  // }
                  // t+= val?.original_paid
                }
              }
              if (ele?.fee_payment_mode == "Net Banking") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "UPI Transfer") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "Cheque") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (ele?.fee_payment_mode == "Demand Draft") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.bank_head_amount += val?.original_paid;
                }
              }
              if (
                `${ads?._id}` === `${val?.master}` &&
                val?.is_society == false
              ) {
                ads.head_amount += val?.original_paid;
              }
            }
          }
        } else {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (
                `${ads?._id}` === `${val?.master}` &&
                val?.is_society == false
              ) {
                ads.head_amount += val?.original_paid;
                // if (val?.master == "6654be24e36490a31bccd1db") {
                //   t.push(`${val?.original_paid}`);
                // }
                // if (val?.master == "6654be3de36490a31bccd257") {
                //   l.push(`${val?.original_paid}`);
                // }
                // t+= val?.original_paid
              }
            }
          }
        }
      }
      // nest_obj.push({
      //   head_name: "Total Fees",
      //   head_amount: t
      // })
      all_receipts.sort(function (st1, st2) {
        return (
          parseInt(st1?.invoice_count?.substring(14)) -
          parseInt(st2?.invoice_count?.substring(14))
        );
      });
      // res.status(200).send({
      //   message: "Explore Day Book Heads Query",
      //   access: true,
      //   all_receipts: all_receipts?.length,
      // //   t: t,
      // //   tl: t?.length,
      // //  l:l,
      // //  ll:l?.length
      //   results: nest_obj,
      //   range: `${all_receipts[0]?.invoice_count?.substring(14)} To ${all_receipts[all_receipts?.length - 1]?.invoice_count?.substring(14)}`
      //   // account_info: bank_acc,
      //   // day_range_from: from,
      //   // day_range_to: to,
      //   // ins_info: institute,
      // });
    } else {
      // res.status(200).send({
      //   message: "No Day Book Heads Query",
      //   access: false,
      //   results: [],
      // });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNormalApplicableOutStandingStudentQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { flow } = req?.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    if (flow === "APPLICABLE_OS") {
      var ads_admin = await Admission.findById({ _id: aid }).select(
        "remainingFee institute"
      );
    } else if (flow === "TOTAL_OS") {
      var ads_admin = await Admission.findById({ _id: aid }).select(
        "remainingFee institute"
      );
    }
    var institute = await InstituteAdmin.findById({
      _id: ads_admin?.institute,
    }).select("financeDepart");

    if (ads_admin?.remainingFee?.length > 0) {
      res.status(200).send({
        message: `Explore New ${flow} Excel Exports Wait for Some Time To Process`,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        access: false,
      });
    }
    const valid_all_students = await Student.find({
      _id: { $in: ads_admin?.remainingFee },
    }).populate({
      path: "fee_structure hostel_fee_structure",
      select:
        "unique_structure_name applicable_fees total_admission_fees category_master batch_master class_master",
      populate: {
        path: "category_master batch_master class_master",
        select: "category_name batchName className",
      },
    });
    valid_all_students.sort(function (st1, st2) {
      return parseInt(st1?.studentROLLNO) - parseInt(st2?.studentROLLNO);
    });
    var excel_list = [];
    for (var ref of valid_all_students) {
      var struct = ref?.fee_structure
        ? ref?.fee_structure?._id
        : ref?.hostel_fee_structure
        ? ref?.hostel_fee_structure?._id
        : "";
      var valid_card = await RemainingList.find({
        $and: [{ student: `${ref?._id}` }],
      })
        .populate({
          path: "fee_structure",
        })
        .populate({
          path: "applicable_card government_card",
        });
      var pending = 0;
      var paid = 0;
      var applicable_pending = 0;
      var gov_pending = 0;
      if (flow === "TOTAL_OS") {
        for (var ele of valid_card) {
          // ref.applicable_fees_pending +=
          //   ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
          //     ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
          //     : 0;
          pending +=
            ele?.applicable_card?.remaining_fee +
            ele?.government_card?.remaining_fee;
          paid +=
            ele?.applicable_card?.paid_fee + ele?.government_card?.paid_fee;
          gov_pending += ele?.government_card?.remaining_fee;
          applicable_pending +=
            ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
              ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
              : 0;
        }
        if (struct) {
          var currentPaid = 0;
          var currentRemain = 0;
          var currentApplicableRemaining = 0;
          var currentGovernmentPending = 0;
          var valid_card = await RemainingList.findOne({
            $and: [{ fee_structure: `${struct}` }, { student: `${ref?._id}` }],
          })
            .populate({
              path: "fee_structure",
            })
            .populate({
              path: "applicable_card government_card",
            });
          currentPaid += valid_card?.applicable_card?.paid_fee;
          currentRemain +=
            valid_card?.applicable_card?.remaining_fee +
            valid_card?.government_card?.remaining_fee;
          currentGovernmentPending +=
            valid_card?.government_card?.remaining_fee;
          currentApplicableRemaining +=
            valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee >
            0
              ? valid_card?.fee_structure?.applicable_fees -
                valid_card?.paid_fee
              : 0;
        }
        excel_list.push({
          RollNo: ref?.studentROLLNO ?? "NA",
          AbcId: ref?.student_abc_id ?? "#NA",
          GRNO: ref?.studentGRNO ?? "#NA",
          Name:
            `${ref?.studentFirstName} ${
              ref?.studentMiddleName ? ref?.studentMiddleName : ""
            } ${ref?.studentLastName}` ?? ref?.valid_full_name,
          FirstName: ref?.studentFirstName ?? "#NA",
          FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
          LastName: ref?.studentLastName ?? "#NA",
          Standard: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.class_master?.className}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.class_master?.className}`
            : "#NA",
          Batch: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.batch_master?.batchName}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.batch_master?.batchName}`
            : "#NA",
          FeeStructure: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.unique_structure_name}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.unique_structure_name}`
            : "#NA",
          ActualFees: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.total_admission_fees}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.total_admission_fees}`
            : "0",
          ApplicableFees: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.applicable_fees}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.applicable_fees}`
            : "0",
          CurrentYearPaidFees: currentPaid ?? "0",
          CurrentYearRemainingFees: currentRemain ?? "0",
          CurrentYearApplicableRemainingFees: currentApplicableRemaining ?? "0",
          CurrentYearGovernmentRemainingFees: currentGovernmentPending ?? "0",
          TotalPaidFees: paid ?? "0",
          TotalRemainingFees: pending ?? "0",
          TotalApplicablePending: applicable_pending ?? "0",
          GovernmentOutstanding: gov_pending ?? "0",
        });
      } else if (flow === "APPLICABLE_OS") {
        for (var ele of valid_card) {
          // ref.applicable_fees_pending +=
          //   ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
          //     ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
          //     : 0;
          pending += ele?.applicable_card?.remaining_fee;
          paid += ele?.applicable_card?.paid_fee;
          applicable_pending +=
            ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
              ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
              : 0;
        }
        if (struct) {
          var currentPaid = 0;
          var currentRemain = 0;
          var currentApplicableRemaining = 0;
          var currentGovernmentPending = 0;
          var valid_card = await RemainingList.findOne({
            $and: [{ fee_structure: `${struct}` }, { student: `${ref?._id}` }],
          })
            .populate({
              path: "fee_structure",
            })
            .populate({
              path: "applicable_card government_card",
            });
          currentPaid += valid_card?.applicable_card?.paid_fee;
          currentRemain += valid_card?.applicable_card?.remaining_fee;
          currentApplicableRemaining +=
            valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee >
            0
              ? valid_card?.fee_structure?.applicable_fees -
                valid_card?.paid_fee
              : 0;
        }
        excel_list.push({
          RollNo: ref?.studentROLLNO ?? "NA",
          AbcId: ref?.student_abc_id ?? "#NA",
          GRNO: ref?.studentGRNO ?? "#NA",
          Name:
            `${ref?.studentFirstName} ${
              ref?.studentMiddleName ? ref?.studentMiddleName : ""
            } ${ref?.studentLastName}` ?? ref?.valid_full_name,
          FirstName: ref?.studentFirstName ?? "#NA",
          FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
          LastName: ref?.studentLastName ?? "#NA",
          Standard: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.class_master?.className}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.class_master?.className}`
            : "#NA",
          Batch: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.batch_master?.batchName}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.batch_master?.batchName}`
            : "#NA",
          FeeStructure: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.unique_structure_name}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.unique_structure_name}`
            : "#NA",
          ActualFees: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.total_admission_fees}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.total_admission_fees}`
            : "0",
          ApplicableFees: `${ref?.fee_structure}`
            ? `${ref?.fee_structure?.applicable_fees}`
            : `${ref?.hostel_fee_structure}`
            ? `${ref?.hostel_fee_structure?.applicable_fees}`
            : "0",
          CurrentYearPaidFees: currentPaid ?? "0",
          CurrentYearRemainingFees: currentRemain ?? "0",
          CurrentYearApplicableRemainingFees: currentApplicableRemaining ?? "0",
          // CurrentYearGovernmentRemainingFees: currentGovernmentPending ?? "0",
          TotalPaidFees: paid ?? "0",
          TotalRemainingFees: pending ?? "0",
          TotalApplicablePending: applicable_pending ?? "0",
          // GovernmentOutstanding: gov_pending ?? "0",
        });
      }
    }
    console.log(excel_list?.length);
    await json_to_excel_student_applicable_outstanding_query(
      excel_list,
      institute?._id,
      flow
    );
  } catch (e) {
    console.log(e);
  }
};

exports.render_admin_daybook_heads_wise = async (req, res) => {
  try {
    const { fid } = req.params;
    const { from, to, bank, payment_type, hid, flow } = req.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    if (flow === "NORMAL") {
      var sorted_array = [];
      const bank_acc = await BankAccount.findById({ _id: bank });
      const finance = await Finance.findById({ _id: fid }).select("institute");
      if (bank_acc?.bank_account_type === "Society") {
        var all_struct = await FeeStructure.find({
          $and: [{ finance: finance?._id }, { document_update: false }],
        });
      } else {
        var all_struct = await FeeStructure.find({
          $and: [
            { department: { $in: bank_acc?.departments } },
            { document_update: false },
          ],
        });
      }
      const institute = await InstituteAdmin.findById({
        _id: `${finance?.institute}`,
      }).select(
        "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
      );

      var g_year = new Date(`${from}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_year = new Date(`${to}`).getFullYear();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
      date.setDate(date.getDate() + 1);
      let l_dates = date.getDate();
      if (l_dates < 10) {
        l_dates = `0${l_dates}`;
      }
      var l_months = l_month;
      let list1 = ["01", "03", "05", "07", "08", "10", "12"];
      let list2 = ["04", "06", "09", "11"];
      let list3 = ["02"];
      let g_days = l_months?.toString();
      let l_days = l_months?.toString();
      if (g_day == 30 && list2?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (g_day >= 31 && list1?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (g_day == 30 && l_day == 30) {
      } else if (g_day == 31 && l_day == 31) {
      } else {
        if (l_day == 30 && list2?.includes(String(l_days))) {
          date.setMonth(date.getMonth() + 1);
          var l_months = date.getMonth();
          if (l_months < 10) {
            l_months = `0${l_months}`;
          }
        }
        if (l_day >= 31 && list1?.includes(String(l_days))) {
          date.setMonth(date.getMonth() + 1);
          var l_months = date.getMonth();
          if (l_months < 10) {
            l_months = `0${l_months}`;
          }
        }
      }
      const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
      if (payment_type) {
        if (payment_type == "Total") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                created_at: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_ADMISSION",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
            )
            .populate({
              path: "application",
              select: "applicationDepartment",
              populate: {
                path: "applicationDepartment",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else if (payment_type == "Cash / Bank") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                created_at: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_ADMISSION",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
            )
            .populate({
              path: "application",
              select: "applicationDepartment",
              populate: {
                path: "applicationDepartment",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else {
          var all_receipts = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                created_at: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_ADMISSION",
              },
              {
                refund_status: "No Refund",
              },
              {
                fee_payment_mode: payment_type,
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
            )
            .populate({
              path: "application",
              select: "applicationDepartment",
              populate: {
                path: "applicationDepartment",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
        }
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              created_at: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_ADMISSION",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select("fee_heads application fee_payment_mode")
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
      }
      // console.log(all_receipts)
      if (bank_acc?.bank_account_type === "Society") {
      } else {
        all_receipts = all_receipts?.filter((val) => {
          if (
            `${val?.application?.applicationDepartment?.bank_account?._id}` ===
            `${bank}`
          )
            return val;
        });
      }
      let heads_queue = [];
      if (bank_acc?.bank_account_type === "Society") {
        for (let ele of all_struct) {
          for (let val of ele?.applicable_fees_heads) {
            if (val?.is_society == true) {
              if (heads_queue?.includes(`${val?.master}`)) {
              } else {
                heads_queue.push(val?.master);
              }
            }
          }
        }
      } else {
        for (let ele of all_struct) {
          for (let val of ele?.applicable_fees_heads) {
            if (val?.is_society == false) {
              if (heads_queue?.includes(`${val?.master}`)) {
              } else {
                heads_queue.push(val?.master);
              }
            }
          }
        }
      }
      const all_master = await FeeMaster.find({
        _id: { $in: heads_queue },
      }).select("master_name");
      var obj = {};
      var nest_obj = [];
      for (let ele of all_master) {
        obj["head_name"] = ele?.master_name;
        obj["head_amount"] = 0;
        obj["cash_head_amount"] = 0;
        obj["pg_head_amount"] = 0;
        obj["bank_head_amount"] = 0;
        obj["_id"] = ele?._id;
        nest_obj.push(obj);
        obj = {};
      }
      // var t = 0
      var t = [];
      var l = [];
      if (all_receipts?.length > 0) {
        for (let ele of all_receipts) {
          if (payment_type == "Total") {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (ele?.fee_payment_mode == "By Cash") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.cash_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.cash_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.pg_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.pg_head_amount += val?.original_paid;
                      // if (val?.master == "6654be24e36490a31bccd1db") {
                      //   t.push(`${val?.original_paid}`);
                      // }
                      // if (val?.master == "6654be3de36490a31bccd257") {
                      //   l.push(`${val?.original_paid}`);
                      // }
                      // t+= val?.original_paid
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.pg_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.pg_head_amount += val?.original_paid;
                      // if (val?.master == "6654be24e36490a31bccd1db") {
                      //   t.push(`${val?.original_paid}`);
                      // }
                      // if (val?.master == "6654be3de36490a31bccd257") {
                      //   l.push(`${val?.original_paid}`);
                      // }
                      // t+= val?.original_paid
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Net Banking") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "UPI Transfer") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Cheque") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Demand Draft") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.head_amount += val?.original_paid;
                  }
                }
              }
            }
          } else if (payment_type == "Cash / Bank") {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (ele?.fee_payment_mode == "By Cash") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.cash_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.cash_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // if (val?.master == "6654be24e36490a31bccd1db") {
                      //   t.push(`${val?.original_paid}`);
                      // }
                      // if (val?.master == "6654be3de36490a31bccd257") {
                      //   l.push(`${val?.original_paid}`);
                      // }
                      // t+= val?.original_paid
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // if (val?.master == "6654be24e36490a31bccd1db") {
                      //   t.push(`${val?.original_paid}`);
                      // }
                      // if (val?.master == "6654be3de36490a31bccd257") {
                      //   l.push(`${val?.original_paid}`);
                      // }
                      // t+= val?.original_paid
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Net Banking") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "UPI Transfer") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Cheque") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (ele?.fee_payment_mode == "Demand Draft") {
                  if (bank_acc?.bank_account_type === "Society") {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == true
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                      // t+= val?.original_paid
                    }
                  } else {
                    if (
                      `${ads?._id}` === `${val?.master}` &&
                      val?.is_society == false
                    ) {
                      ads.bank_head_amount += val?.original_paid;
                    }
                  }
                }
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.head_amount += val?.original_paid;
                  }
                }
              }
            }
          } else {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
            }
          }
        }
        // nest_obj.push({
        //   head_name: "Total Fees",
        //   head_amount: t
        // })
        all_receipts.sort(function (st1, st2) {
          return (
            parseInt(st1?.invoice_count?.substring(14)) -
            parseInt(st2?.invoice_count?.substring(14))
          );
        });
        res.status(200).send({
          message: "Explore Day Book Heads Query",
          access: true,
          all_receipts: all_receipts?.length,
          results: nest_obj,
        });
      } else {
        res.status(200).send({
          message: "No Day Book Heads Query",
          access: false,
          results: [],
        });
      }
    } else if (flow === "HOSTEL") {
      var sorted_array = [];
      const bank_acc = await BankAccount.findById({ _id: bank });
      const finance = await Finance.findById({ _id: fid }).select("institute");
      const hostel = await Hostel.findById({ _id: hid }).select("institute");
      var all_struct = await FeeStructure.find({
        $and: [{ hostel: hostel?._id }, { document_update: false }],
      });
      const institute = await InstituteAdmin.findById({
        _id: `${finance?.institute}`,
      }).select(
        "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
      );

      var g_year = new Date(`${from}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_year = new Date(`${to}`).getFullYear();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
      date.setDate(date.getDate() + 1);
      let l_dates = date.getDate();
      if (l_dates < 10) {
        l_dates = `0${l_dates}`;
      }
      var l_months = l_month;
      let list1 = ["01", "03", "05", "07", "08", "10", "12"];
      let list2 = ["04", "06", "09", "11"];
      let list3 = ["02"];
      let g_days = l_months?.toString();
      let l_days = l_months?.toString();
      if (g_day == 30 && list2?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (g_day >= 31 && list1?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (g_day == 30 && l_day == 30) {
      } else if (g_day == 31 && l_day == 31) {
      } else {
        if (l_day == 30 && list2?.includes(String(l_days))) {
          date.setMonth(date.getMonth() + 1);
          var l_months = date.getMonth();
          if (l_months < 10) {
            l_months = `0${l_months}`;
          }
        }
        if (l_day >= 31 && list1?.includes(String(l_days))) {
          date.setMonth(date.getMonth() + 1);
          var l_months = date.getMonth();
          if (l_months < 10) {
            l_months = `0${l_months}`;
          }
        }
      }
      const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
      if (payment_type) {
        if (payment_type == "Total") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                created_at: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_HOSTEL_MANAGER",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
            )
            .populate({
              path: "application",
              select: "hostelAdmin",
              populate: {
                path: "hostelAdmin",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else if (payment_type == "Cash / Bank") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                created_at: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_HOSTEL_MANAGER",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
            )
            .populate({
              path: "application",
              select: "hostelAdmin",
              populate: {
                path: "hostelAdmin",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else {
          var all_receipts = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                created_at: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_HOSTEL_MANAGER",
              },
              {
                refund_status: "No Refund",
              },
              {
                fee_payment_mode: payment_type,
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
            )
            .populate({
              path: "application",
              select: "hostelAdmin",
              populate: {
                path: "hostelAdmin",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
        }
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              created_at: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_HOSTEL_MANAGER",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select("fee_heads application fee_payment_mode")
          .populate({
            path: "application",
            select: "hostelAdmin",
            populate: {
              path: "hostelAdmin",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
      }
      // console.log(all_receipts)
      all_receipts = all_receipts?.filter((val) => {
        if (`${val?.application?.hostelAdmin?.bank_account?._id}` === `${bank}`)
          return val;
      });
      let heads_queue = [];
      for (let ele of all_struct) {
        for (let val of ele?.applicable_fees_heads) {
          if (val?.is_society == false) {
            if (heads_queue?.includes(`${val?.master}`)) {
            } else {
              heads_queue.push(val?.master);
            }
          }
        }
      }
      const all_master = await FeeMaster.find({
        _id: { $in: heads_queue },
      }).select("master_name");
      var obj = {};
      var nest_obj = [];
      for (let ele of all_master) {
        obj["head_name"] = ele?.master_name;
        obj["head_amount"] = 0;
        obj["cash_head_amount"] = 0;
        obj["pg_head_amount"] = 0;
        obj["bank_head_amount"] = 0;
        obj["_id"] = ele?._id;
        nest_obj.push(obj);
        obj = {};
      }
      // var t = 0
      var t = [];
      var l = [];
      if (all_receipts?.length > 0) {
        for (let ele of all_receipts) {
          if (payment_type == "Total") {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (ele?.fee_payment_mode == "By Cash") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
                if (ele?.fee_payment_mode == "Net Banking") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "UPI Transfer") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Cheque") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Demand Draft") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          } else if (payment_type == "Cash / Bank") {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (ele?.fee_payment_mode == "By Cash") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
                if (ele?.fee_payment_mode == "Net Banking") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "UPI Transfer") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Cheque") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Demand Draft") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          } else {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          }
        }
        all_receipts.sort(function (st1, st2) {
          return (
            parseInt(st1?.invoice_count?.substring(14)) -
            parseInt(st2?.invoice_count?.substring(14))
          );
        });
        res.status(200).send({
          message: "Explore Day Book Heads Query",
          access: true,
          all_receipts: all_receipts?.length,
          results: nest_obj,
        });
      } else {
        res.status(200).send({
          message: "No Day Book Heads Query",
          access: false,
          results: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllStudentApplicableOutStandingStudentQuery = async (
  req,
  res
) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });
    var ads_admin = await Admission.findById({ _id: aid }).select("institute");
    var institute = await InstituteAdmin.findById({
      _id: ads_admin?.institute,
    }).select("financeDepart ApproveStudent");

    if (institute?.ApproveStudent?.length > 0) {
      res.status(200).send({
        message: `Explore New Excel Exports Wait for Some Time To Process`,
        access: true,
      });
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        access: false,
      });
    }
    const valid_all_students = await Student.find({
      _id: { $in: institute?.ApproveStudent },
    }).populate({
      path: "fee_structure hostel_fee_structure",
      select:
        "unique_structure_name applicable_fees total_admission_fees category_master batch_master class_master",
      populate: {
        path: "category_master batch_master class_master",
        select: "category_name batchName className",
      },
    });
    valid_all_students.sort(function (st1, st2) {
      return parseInt(st1?.studentROLLNO) - parseInt(st2?.studentROLLNO);
    });
    var excel_list = [];
    for (var ref of valid_all_students) {
      var struct = ref?.fee_structure
        ? ref?.fee_structure?._id
        : ref?.hostel_fee_structure
        ? ref?.hostel_fee_structure?._id
        : "";
      var valid_card = await RemainingList.find({
        $and: [{ student: `${ref?._id}` }],
      })
        .populate({
          path: "fee_structure",
        })
        .populate({
          path: "applicable_card government_card",
        });
      var pending = 0;
      var paid = 0;
      var applicable_pending = 0;
      var gov_pending = 0;
      for (var ele of valid_card) {
        // ref.applicable_fees_pending +=
        //   ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
        //     ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
        //     : 0;
        pending +=
          ele?.applicable_card?.remaining_fee +
          ele?.government_card?.remaining_fee;
        paid += ele?.applicable_card?.paid_fee + ele?.government_card?.paid_fee;
        gov_pending += ele?.government_card?.remaining_fee;
        applicable_pending += ele?.applicable_card?.applicable_fee;
      }
      if (struct) {
        var currentPaid = 0;
        var currentRemain = 0;
        var currentApplicableRemaining = 0;
        var currentGovernmentPending = 0;
        var valid_card = await RemainingList.findOne({
          $and: [{ fee_structure: `${struct}` }, { student: `${ref?._id}` }],
        })
          .populate({
            path: "fee_structure",
          })
          .populate({
            path: "applicable_card government_card",
          });
        currentPaid += valid_card?.applicable_card?.paid_fee;
        currentRemain +=
          valid_card?.applicable_card?.remaining_fee +
          valid_card?.government_card?.remaining_fee;
        currentGovernmentPending += valid_card?.government_card?.remaining_fee;
        currentApplicableRemaining +=
          valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee > 0
            ? valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee
            : 0;
      }
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { BatchName, Fees } = arr[i];
          obj[BatchName] = Fees;
        }
        return obj;
      };
      var all_remain = await RemainingList.find({
        $and: [{ student: ref?._id }],
      })
        .populate({
          path: "fee_structure",
          populate: {
            path: "batch_master",
          },
        })
        .populate({
          path: "appId",
        })
        .populate({
          path: "applicable_card government_card",
        });
      var pusher = [];
      let total_actual = 0;
      let total_applicable = 0;
      for (var query of all_remain) {
        pusher.push({
          BatchName: `${query?.fee_structure?.batch_master?.batchName}-PaidFees`,
          Fees:
            query?.applicable_card?.paid_fee + query?.government_card?.paid_fee,
        });
        pusher.push({
          BatchName: `${query?.fee_structure?.batch_master?.batchName}-RemainingFees`,
          Fees:
            query?.applicable_card?.remaining_fee +
            query?.government_card?.remaining_fee,
        });
        pusher.push({
          BatchName: `${query?.fee_structure?.batch_master?.batchName}-ApplicableRemainingFees`,
          Fees:
            query?.fee_structure?.applicable_fees - query?.paid_fee > 0
              ? query?.fee_structure?.applicable_fees - query?.paid_fee
              : 0,
        });
        pusher.push({
          BatchName: `${query?.fee_structure?.batch_master?.batchName}-GovernmentRemainingFees`,
          Fees: query?.government_card?.remaining_fee,
        });
        pusher.push({
          BatchName: `${query?.fee_structure?.batch_master?.batchName}-Remark`,
          Fees: query?.remark,
        });
        total_applicable += query?.fee_structure?.applicable_fees;
        total_actual += query?.fee_structure?.total_admission_fees;
      }
      if (pusher?.length > 0) {
        var result = await buildStructureObject(pusher);
      }
      excel_list.push({
        RollNo: ref?.studentROLLNO ?? "NA",
        AbcId: ref?.student_abc_id ?? "#NA",
        GRNO: ref?.studentGRNO ?? "#NA",
        Name:
          `${ref?.studentFirstName} ${
            ref?.studentMiddleName ? ref?.studentMiddleName : ""
          } ${ref?.studentLastName}` ?? ref?.valid_full_name,
        FirstName: ref?.studentFirstName ?? "#NA",
        FatherName: ref?.studentFatherName ?? ref?.studentMiddleName,
        LastName: ref?.studentLastName ?? "#NA",
        Standard: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.class_master?.className}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.class_master?.className}`
          : "#NA",
        Batch: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.batch_master?.batchName}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.batch_master?.batchName}`
          : "#NA",
        FeeStructure: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.unique_structure_name}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.unique_structure_name}`
          : "#NA",
        ActualFees: total_actual,
        // `${ref?.fee_structure}`
        // ? `${ref?.fee_structure?.total_admission_fees}`
        // : `${ref?.hostel_fee_structure}`
        // ? `${ref?.hostel_fee_structure?.total_admission_fees}`
        // : "0",
        ApplicableFees: total_applicable,
        // `${ref?.fee_structure}`
        // ? `${ref?.fee_structure?.applicable_fees}`
        // : `${ref?.hostel_fee_structure}`
        // ? `${ref?.hostel_fee_structure?.applicable_fees}`
        // : "0",
        // CurrentYearPaidFees: currentPaid ?? "0",
        // CurrentYearRemainingFees: currentRemain ?? "0",
        // CurrentYearApplicableRemainingFees: currentApplicableRemaining ?? "0",
        // CurrentYearGovernmentRemainingFees: currentGovernmentPending ?? "0",
        TotalPaidFees: paid ?? "0",
        TotalRemainingFees: pending ?? "0",
        TotalApplicablePending: applicable_pending ?? "0",
        GovernmentOutstanding: gov_pending ?? "0",
        ...result,
      });
      result = [];
      console.log("GEN");
    }
    await json_to_excel_student_applicable_outstanding_query(
      excel_list,
      institute?._id,
      "Admission Fees"
    );
  } catch (e) {
    console.log(e);
  }
};

const normal_daybook = async (from, to, bank, payment_type, fid) => {
  try {
    var g_year;
    var l_year;
    var g_month;
    var l_month;
    var sorted_array = [];
    const bank_acc = await BankAccount.findById({ _id: bank }).select(
      "-day_book"
    );
    const finance = await Finance.findById({ _id: fid }).select("institute");
    if (bank_acc?.bank_account_type === "Society") {
      var all_struct = await FeeStructure.find({
        $and: [{ finance: finance?._id }, { document_update: false }],
      });
    } else {
      var all_struct = await FeeStructure.find({
        $and: [
          { department: { $in: bank_acc?.departments } },
          { document_update: false },
        ],
      });
    }
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select(
      "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
    );

    var g_year = new Date(`${from}`).getFullYear();
    var g_day = new Date(`${from}`).getDate();
    var l_year = new Date(`${to}`).getFullYear();
    var l_day = new Date(`${to}`).getDate();
    var g_month = new Date(`${from}`).getMonth() + 1;
    if (g_month < 10) {
      g_month = `0${g_month}`;
    }
    if (g_day < 10) {
      g_day = `0${g_day}`;
    }
    var l_month = new Date(`${to}`).getMonth() + 1;
    if (l_month < 10) {
      l_month = `0${l_month}`;
    }
    if (l_day < 10) {
      l_day = `0${l_day}`;
    }
    const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
    const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
    date.setDate(date.getDate() + 1);
    let l_dates = date.getDate();
    if (l_dates < 10) {
      l_dates = `0${l_dates}`;
    }
    var l_months = l_month;
    let list1 = ["01", "03", "05", "07", "08", "10", "12"];
    let list2 = ["04", "06", "09", "11"];
    let list3 = ["02"];
    let g_days = l_months?.toString();
    if (g_day == 30 && list2?.includes(String(g_days))) {
      date.setMonth(date.getMonth() + 1);
      var l_months = date.getMonth();
      if (l_months < 10) {
        l_months = `0${l_months}`;
      }
    }
    if (g_day >= 31 && list1?.includes(String(g_days))) {
      date.setMonth(date.getMonth() + 1);
      var l_months = date.getMonth();
      if (l_months < 10) {
        l_months = `0${l_months}`;
      }
    }
    const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
    if (payment_type) {
      if (payment_type == "Total") {
        var all_receipts_set = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_ADMISSION",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
          )
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
        var all_receipts = all_receipts_set?.filter((val) => {
          if (
            `${val?.fee_payment_mode}` === "By Cash" ||
            `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
            `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
            `${val?.fee_payment_mode}` === "Cheque" ||
            `${val?.fee_payment_mode}` === "Net Banking" ||
            `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
            `${val?.fee_payment_mode}` === "UPI Transfer" ||
            `${val?.fee_payment_mode}` === "Demand Draft"
          ) {
            return val;
          }
        });
      } else if (payment_type == "Cash / Bank") {
        var all_receipts_set = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_ADMISSION",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
          )
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
        var all_receipts = all_receipts_set?.filter((val) => {
          if (
            `${val?.fee_payment_mode}` === "By Cash" ||
            `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
            `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
            `${val?.fee_payment_mode}` === "Cheque" ||
            `${val?.fee_payment_mode}` === "Net Banking" ||
            `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
            `${val?.fee_payment_mode}` === "UPI Transfer" ||
            `${val?.fee_payment_mode}` === "Demand Draft"
          ) {
            return val;
          }
        });
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_ADMISSION",
            },
            {
              refund_status: "No Refund",
            },
            {
              fee_payment_mode: payment_type,
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select(
            "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
          )
          .populate({
            path: "application",
            select: "applicationDepartment",
            populate: {
              path: "applicationDepartment",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
      }
    } else {
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            fee_transaction_date: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_ADMISSION",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select("fee_heads application fee_payment_mode")
        .populate({
          path: "application",
          select: "applicationDepartment",
          populate: {
            path: "applicationDepartment",
            select: "bank_account",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          },
        })
        .lean()
        .exec();
    }
    // console.log(all_receipts)
    if (bank_acc?.bank_account_type === "Society") {
    } else {
      all_receipts = all_receipts?.filter((val) => {
        if (
          `${val?.application?.applicationDepartment?.bank_account?._id}` ===
          `${bank}`
        )
          return val;
      });
    }
    let heads_queue = [];
    if (bank_acc?.bank_account_type === "Society") {
      for (let ele of all_struct) {
        for (let val of ele?.applicable_fees_heads) {
          if (val?.is_society == true) {
            if (heads_queue?.includes(`${val?.master}`)) {
            } else {
              heads_queue.push(val?.master);
            }
          }
        }
      }
    } else {
      for (let ele of all_struct) {
        for (let val of ele?.applicable_fees_heads) {
          if (val?.is_society == false) {
            if (heads_queue?.includes(`${val?.master}`)) {
            } else {
              heads_queue.push(val?.master);
            }
          }
        }
      }
    }
    const all_master = await FeeMaster.find({
      _id: { $in: heads_queue },
    }).select("master_name");
    var obj = {};
    var nest_obj = [];
    for (let ele of all_master) {
      obj["head_name"] = ele?.master_name;
      obj["head_amount"] = 0;
      obj["cash_head_amount"] = 0;
      obj["pg_head_amount"] = 0;
      obj["bank_head_amount"] = 0;
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }
    // var t = 0
    var t = [];
    var l = [];
    console.log("ND", all_receipts?.length);
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
        if (payment_type == "Total") {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (ele?.fee_payment_mode == "By Cash") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Net Banking") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "UPI Transfer") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Cheque") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Demand Draft") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          }
        } else if (payment_type == "Cash / Bank") {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (ele?.fee_payment_mode == "By Cash") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Net Banking") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "UPI Transfer") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Cheque") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Demand Draft") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          }
        } else {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                  // if (val?.master == "6654be24e36490a31bccd1db") {
                  //   t.push(`${val?.original_paid}`);
                  // }
                  // if (val?.master == "6654be3de36490a31bccd257") {
                  //   l.push(`${val?.original_paid}`);
                  // }
                  // t+= val?.original_paid
                }
              }
            }
          }
        }
      }
      // nest_obj.push({
      //   head_name: "Total Fees",
      //   head_amount: t
      // })
      all_receipts.sort(function (st1, st2) {
        return (
          parseInt(st1?.invoice_count?.substring(14)) -
          parseInt(st2?.invoice_count?.substring(14))
        );
      });

      return {
        message: "Explore Day Book Heads Query",
        access: true,
        all_receipts: all_receipts?.length,
        results: nest_obj,
        range: `${all_receipts[0]?.invoice_count?.substring(
          14
        )} To ${all_receipts[
          all_receipts?.length - 1
        ]?.invoice_count?.substring(14)}`,
        account_info: bank_acc,
        day_range_from: from,
        day_range_to: to,
        ins_info: institute,
      };
    } else {
      return {
        message: "No Other Fees Day Book Heads Query",
        access: true,
        all_receipts: 0,
        results: [],
        account_info: bank_acc,
        day_range_from: from,
        day_range_to: to,
        ins_info: institute,
        range: "",
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const hostel_daybook = async (from, to, bank, payment_type, hid, fid) => {
  try {
    var g_year;
    var l_year;
    var g_month;
    var l_month;
    var sorted_array = [];
    if (hid) {
      const bank_acc = await BankAccount.findById({ _id: bank }).select(
        "-day_book"
      );
      const finance = await Finance.findById({ _id: fid }).select("institute");
      const hostel = await Hostel.findById({ _id: hid }).select("institute");
      var all_struct = await FeeStructure.find({
        $and: [{ hostel: hostel?._id }, { document_update: false }],
      });
      const institute = await InstituteAdmin.findById({
        _id: `${finance?.institute}`,
      }).select(
        "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
      );

      var g_year = new Date(`${from}`).getFullYear();
      var g_day = new Date(`${from}`).getDate();
      var l_year = new Date(`${to}`).getFullYear();
      var l_day = new Date(`${to}`).getDate();
      var g_month = new Date(`${from}`).getMonth() + 1;
      if (g_month < 10) {
        g_month = `0${g_month}`;
      }
      if (g_day < 10) {
        g_day = `0${g_day}`;
      }
      var l_month = new Date(`${to}`).getMonth() + 1;
      if (l_month < 10) {
        l_month = `0${l_month}`;
      }
      if (l_day < 10) {
        l_day = `0${l_day}`;
      }
      const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
      const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
      date.setDate(date.getDate() + 1);
      let l_dates = date.getDate();
      if (l_dates < 10) {
        l_dates = `0${l_dates}`;
      }
      var l_months = l_month;
      let list1 = ["01", "03", "05", "07", "08", "10", "12"];
      let list2 = ["04", "06", "09", "11"];
      let list3 = ["02"];
      let g_days = l_months?.toString();
      if (g_day == 30 && list2?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      if (g_day >= 31 && list1?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
      const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
      if (payment_type) {
        if (payment_type == "Total") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_HOSTEL_MANAGER",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
            )
            .populate({
              path: "application",
              select: "hostelAdmin",
              populate: {
                path: "hostelAdmin",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else if (payment_type == "Cash / Bank") {
          var all_receipts_set = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_HOSTEL_MANAGER",
              },
              {
                refund_status: "No Refund",
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
            )
            .populate({
              path: "application",
              select: "hostelAdmin",
              populate: {
                path: "hostelAdmin",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
          var all_receipts = all_receipts_set?.filter((val) => {
            if (
              `${val?.fee_payment_mode}` === "By Cash" ||
              `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
              `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
              `${val?.fee_payment_mode}` === "Cheque" ||
              `${val?.fee_payment_mode}` === "Net Banking" ||
              `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
              `${val?.fee_payment_mode}` === "UPI Transfer" ||
              `${val?.fee_payment_mode}` === "Demand Draft"
            ) {
              return val;
            }
          });
        } else {
          var all_receipts = await FeeReceipt.find({
            $and: [
              { finance: fid },
              // { fee_flow: "FEE_HEADS" },
              {
                fee_transaction_date: {
                  $gte: g_date,
                  $lt: l_date,
                },
              },
              {
                receipt_generated_from: "BY_HOSTEL_MANAGER",
              },
              {
                refund_status: "No Refund",
              },
              {
                fee_payment_mode: payment_type,
              },
              {
                visible_status: "Not Hide",
              },
              // { student: { $in: sorted_array } },
            ],
          })
            .sort({ invoice_count: "1" })
            .select(
              "fee_heads application fee_payment_mode invoice_count fee_payment_amount"
            )
            .populate({
              path: "application",
              select: "hostelAdmin",
              populate: {
                path: "hostelAdmin",
                select: "bank_account",
                populate: {
                  path: "bank_account",
                  select:
                    "finance_bank_account_number finance_bank_name finance_bank_account_name",
                },
              },
            })
            .lean()
            .exec();
        }
      } else {
        console.log("ENTER", g_date, l_date);
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_HOSTEL_MANAGER",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select("fee_heads application fee_payment_mode")
          .populate({
            path: "application",
            select: "hostelAdmin",
            populate: {
              path: "hostelAdmin",
              select: "bank_account",
              populate: {
                path: "bank_account",
                select:
                  "finance_bank_account_number finance_bank_name finance_bank_account_name",
              },
            },
          })
          .lean()
          .exec();
      }
      // console.log(all_receipts)
      all_receipts = all_receipts?.filter((val) => {
        if (`${val?.application?.hostelAdmin?.bank_account?._id}` === `${bank}`)
          return val;
      });
      let heads_queue = [];
      for (let ele of all_struct) {
        for (let val of ele?.applicable_fees_heads) {
          if (val?.is_society == false) {
            if (heads_queue?.includes(`${val?.master}`)) {
            } else {
              heads_queue.push(val?.master);
            }
          }
        }
      }
      const all_master = await FeeMaster.find({
        _id: { $in: heads_queue },
      }).select("master_name");
      var obj = {};
      var nest_obj = [];
      for (let ele of all_master) {
        obj["head_name"] = ele?.master_name;
        obj["head_amount"] = 0;
        obj["cash_head_amount"] = 0;
        obj["pg_head_amount"] = 0;
        obj["bank_head_amount"] = 0;
        obj["_id"] = ele?._id;
        nest_obj.push(obj);
        obj = {};
      }
      // var t = 0
      var t = [];
      var l = [];
      console.log("HH", all_receipts?.length);
      if (all_receipts?.length > 0) {
        for (let ele of all_receipts) {
          if (payment_type == "Total") {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (ele?.fee_payment_mode == "By Cash") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
                if (ele?.fee_payment_mode == "Net Banking") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "UPI Transfer") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Cheque") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Demand Draft") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          } else if (payment_type == "Cash / Bank") {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (ele?.fee_payment_mode == "By Cash") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
                if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
                if (ele?.fee_payment_mode == "Net Banking") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "UPI Transfer") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Cheque") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (ele?.fee_payment_mode == "Demand Draft") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          } else {
            for (let val of ele?.fee_heads) {
              for (let ads of nest_obj) {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          }
        }
        all_receipts.sort(function (st1, st2) {
          return (
            parseInt(st1?.invoice_count?.substring(14)) -
            parseInt(st2?.invoice_count?.substring(14))
          );
        });
        return {
          message: "Explore Day Book Heads Query",
          access: true,
          all_receipts: all_receipts?.length,
          results: nest_obj,
          range: `${all_receipts[0]?.invoice_count?.substring(
            14
          )} To ${all_receipts[
            all_receipts?.length - 1
          ]?.invoice_count?.substring(14)}`,
          account_info: bank_acc,
          day_range_from: from,
          day_range_to: to,
          ins_info: institute,
        };
      } else {
        return {
          message: "No Other Fees Day Book Heads Query",
          access: true,
          all_receipts: 0,
          results: [],
          account_info: {},
          day_range_from: null,
          day_range_to: null,
          ins_info: {},
          range: "",
        };
      }
    } else {
      return {
        message: "No Other Fees Day Book Heads Query",
        access: true,
        all_receipts: 0,
        results: [],
        account_info: {},
        day_range_from: from,
        day_range_to: to,
        ins_info: "",
        range: "",
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const miscellanous_daybook = async (from, to, bank, payment_type, fid) => {
  try {
    var g_year;
    var l_year;
    var g_month;
    var l_month;
    let pg = ["Payment Gateway - PG", "By Cash", "Payment Gateway / Online"];
    var sorted_array = [];
    const bank_acc = await BankAccount.findById({ _id: bank }).select(
      "-day_book"
    );
    const finance = await Finance.findById({ _id: fid }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select(
      "insName name photoId insProfilePhoto insAddress insState insDistrict insPincode insAbout insAffiliated"
    );

    var g_year = new Date(`${from}`).getFullYear();
    var g_day = new Date(`${from}`).getDate();
    var l_year = new Date(`${to}`).getFullYear();
    var l_day = new Date(`${to}`).getDate();
    var g_month = new Date(`${from}`).getMonth() + 1;
    if (g_month < 10) {
      g_month = `0${g_month}`;
    }
    if (g_day < 10) {
      g_day = `0${g_day}`;
    }
    var l_month = new Date(`${to}`).getMonth() + 1;
    if (l_month < 10) {
      l_month = `0${l_month}`;
    }
    if (l_day < 10) {
      l_day = `0${l_day}`;
    }
    const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
    const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
    date.setDate(date.getDate() + 1);
    let l_dates = date.getDate();
    if (l_dates < 10) {
      l_dates = `0${l_dates}`;
    }
    const l_date = new Date(`${l_year}-${l_month}-${l_dates}T00:00:00.000Z`);
    if (payment_type) {
      if (payment_type === "Total") {
        var all_receipts_set = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_FINANCE_MANAGER",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select("fee_heads other_fees fee_payment_mode")
          .populate({
            path: "other_fees",
            select: "bank_account fees_heads",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          })
          .lean()
          .exec();

        console.log(all_receipts_set?.length);
        all_receipts = all_receipts_set?.filter((val) => {
          if (
            `${val?.fee_payment_mode}` === "By Cash" ||
            `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
            `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
            `${val?.fee_payment_mode}` === "Cheque" ||
            `${val?.fee_payment_mode}` === "Net Banking" ||
            `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
            `${val?.fee_payment_mode}` === "NEFT/RTGS/IMPS" ||
            `${val?.fee_payment_mode}` === "IMPS/NEFT/RTGS" ||
            `${val?.fee_payment_mode}` === "UPI Transfer" ||
            `${val?.fee_payment_mode}` === "Demand Draft"
          ) {
            return val;
          }
        });
      } else if (payment_type === "Cash / Bank") {
        var all_receipts_set = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_FINANCE_MANAGER",
            },
            {
              refund_status: "No Refund",
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select("fee_heads other_fees fee_payment_mode")
          .populate({
            path: "other_fees",
            select: "bank_account fees_heads",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          })
          .lean()
          .exec();

        all_receipts = all_receipts_set?.filter((val) => {
          if (
            `${val?.fee_payment_mode}` === "By Cash" ||
            `${val?.fee_payment_mode}` === "Payment Gateway / Online" ||
            `${val?.fee_payment_mode}` === "Payment Gateway - PG" ||
            `${val?.fee_payment_mode}` === "Cheque" ||
            `${val?.fee_payment_mode}` === "Net Banking" ||
            `${val?.fee_payment_mode}` === "RTGS/NEFT/IMPS" ||
            `${val?.fee_payment_mode}` === "UPI Transfer" ||
            `${val?.fee_payment_mode}` === "Demand Draft"
          ) {
            return val;
          }
        });
      } else {
        var all_receipts = await FeeReceipt.find({
          $and: [
            { finance: fid },
            // { fee_flow: "FEE_HEADS" },
            {
              fee_transaction_date: {
                $gte: g_date,
                $lt: l_date,
              },
            },
            {
              receipt_generated_from: "BY_FINANCE_MANAGER",
            },
            {
              refund_status: "No Refund",
            },
            {
              fee_payment_mode: payment_type,
            },
            {
              visible_status: "Not Hide",
            },
            // { student: { $in: sorted_array } },
          ],
        })
          .sort({ invoice_count: "1" })
          .select("fee_heads other_fees fee_payment_mode fee_payment_amount")
          .populate({
            path: "other_fees",
            select: "bank_account fees_heads",
            populate: {
              path: "bank_account",
              select:
                "finance_bank_account_number finance_bank_name finance_bank_account_name",
            },
          })
          .lean()
          .exec();
        console.log(all_receipts?.length, "iueqioueoiqueu");
      }
    } else {
      var all_receipts = await FeeReceipt.find({
        $and: [
          { finance: fid },
          // { fee_flow: "FEE_HEADS" },
          {
            fee_transaction_date: {
              $gte: g_date,
              $lt: l_date,
            },
          },
          {
            receipt_generated_from: "BY_FINANCE_MANAGER",
          },
          {
            refund_status: "No Refund",
          },
          {
            visible_status: "Not Hide",
          },
          // { student: { $in: sorted_array } },
        ],
      })
        .sort({ invoice_count: "1" })
        .select("fee_heads other_fees fee_payment_mode fee_payment_amount")
        .populate({
          path: "other_fees",
          select: "bank_account fees_heads",
          populate: {
            path: "bank_account",
            select:
              "finance_bank_account_number finance_bank_name finance_bank_account_name",
          },
        })
        .lean()
        .exec();
    }
    console.log(all_receipts?.length);
    all_receipts = all_receipts?.filter((val) => {
      if (val?.other_fees?._id) return val;
    });
    if (bank_acc?.bank_account_type === "Society") {
    } else {
      all_receipts = all_receipts?.filter((val) => {
        if (`${val?.other_fees?.bank_account?._id}` === `${bank}`) return val;
      });
    }
    // console.log(all_receipts?.length);
    let heads_queue = [];
    for (let i of all_receipts) {
      for (let j of i?.other_fees?.fees_heads) {
        heads_queue.push(j?.master);
      }
    }
    const unique = [...new Set(heads_queue.map((item) => item))];
    const all_master = await FeeMaster.find({
      _id: { $in: unique },
    }).select("master_name");
    var obj = {};
    var nest_obj = [];
    for (let ele of all_master) {
      obj["head_name"] = ele?.master_name;
      obj["head_amount"] = 0;
      obj["cash_head_amount"] = 0;
      obj["pg_head_amount"] = 0;
      obj["bank_head_amount"] = 0;
      obj["_id"] = ele?._id;
      nest_obj.push(obj);
      obj = {};
    }
    var total = 0;
    console.log("MM", all_receipts?.length);
    if (all_receipts?.length > 0) {
      for (let ele of all_receipts) {
        if (payment_type == "Total") {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (ele?.fee_payment_mode == "By Cash") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.pg_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Net Banking") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "UPI Transfer") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                console.log(ele?.fee_payment_mode);
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Cheque") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Demand Draft") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          }
        } else if (payment_type == "Cash / Bank") {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (ele?.fee_payment_mode == "By Cash") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.cash_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway / Online") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Payment Gateway - PG") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // if (val?.master == "6654be24e36490a31bccd1db") {
                    //   t.push(`${val?.original_paid}`);
                    // }
                    // if (val?.master == "6654be3de36490a31bccd257") {
                    //   l.push(`${val?.original_paid}`);
                    // }
                    // t+= val?.original_paid
                  }
                }
              }
              if (ele?.fee_payment_mode == "Net Banking") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "UPI Transfer") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "RTGS/NEFT/IMPS") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Cheque") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (ele?.fee_payment_mode == "Demand Draft") {
                if (bank_acc?.bank_account_type === "Society") {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == true
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                    // t+= val?.original_paid
                  }
                } else {
                  if (
                    `${ads?._id}` === `${val?.master}` &&
                    val?.is_society == false
                  ) {
                    ads.bank_head_amount += val?.original_paid;
                  }
                }
              }
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                }
              }
            }
          }
        } else {
          for (let val of ele?.fee_heads) {
            for (let ads of nest_obj) {
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == true
                ) {
                  ads.head_amount += val?.original_paid;
                  // t+= val?.original_paid
                }
              } else {
                if (
                  `${ads?._id}` === `${val?.master}` &&
                  val?.is_society == false
                ) {
                  ads.head_amount += val?.original_paid;
                  // if (val?.master == "6654be24e36490a31bccd1db") {
                  //   t.push(`${val?.original_paid}`);
                  // }
                  // if (val?.master == "6654be3de36490a31bccd257") {
                  //   l.push(`${val?.original_paid}`);
                  // }
                  // t+= val?.original_paid
                } else {
                  console.log(ele?._id);
                }
              }
            }
          }
        }
      }
      // nest_obj.push({
      //   head_name: "Total Fees",
      //   head_amount: t
      // })
      // let n = []
      // for (let ele of all_receipts) {
      //   n.push(ele?.fee_payment_amount)
      // }
      // res.status(200).send({
      //   message: "Explore Other Fees Day Book Heads Query",
      //   access: true,
      //   all_receipts: all_receipts?.length,
      //   results: nest_obj,
      // account_info: bank_acc,
      // day_range_from: from,
      // day_range_to: to,
      // ins_info: institute,
      // });
      for (let ele of all_receipts) {
        if (ele?.fee_heads?.[0]?.is_society == true) {
          console.log(ele?._id);
        } else {
          total += ele?.fee_payment_amount;
        }
      }
      return {
        message: "Explore Other Fees Day Book Heads Query",
        access: true,
        all_receipts: all_receipts?.length,
        results: nest_obj,
        account_info: bank_acc,
        day_range_from: from,
        day_range_to: to,
        ins_info: institute,
        range: "",
        total: total,
      };
    } else {
      return {
        message: "No Other Fees Day Book Heads Query",
        access: true,
        all_receipts: 0,
        results: [],
        account_info: {},
        day_range_from: null,
        day_range_to: null,
        ins_info: {},
        range: "",
      };
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_combined_daybook_heads_wise = async (req, res) => {
  try {
    const { fid } = req.params;
    const { from, to, bank, payment_type, flow, hid, staff } = req.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    let key = await combinedBankDaybook(
      fid,
      from,
      to,
      bank,
      payment_type,
      flow,
      staff
    );
    res.status(200).send({
      message: "Explore New Combined DayBook",
      access: true,
      flow: flow ?? "",
      key: key ?? "",
    });
    // const banks = await BankAccount.find({ finance: fid });
    // let hbank;
    // let hostel;
    // for (let ele of banks) {
    //   if (`${ele?.hostel}`) {
    //     hbank = ele?._id;
    //     hostel = ele?.hostel;
    //   }
    // }
    // let data_1 = await normal_daybook(from, to, bank, payment_type, fid);
    // let data_2 = await hostel_daybook(
    //   from,
    //   to,
    //   hbank,
    //   payment_type,
    //   hostel,
    //   fid
    // );
    // console.log(from, to, bank, payment_type, fid);
    // let data_3 = await miscellanous_daybook(from, to, bank, payment_type, fid);
    // let combine = [data_1, data_2, data_3];
    // let combines = [];
    // for (let cls of combine) {
    //   combines.push({
    //     results: cls?.results,
    //     range: cls?.range,
    //     total: cls?.total ?? 0,
    //   });
    // }
    // const valid_bank = await BankAccount.findById({ _id: bank }).select(
    //   "-day_book"
    // );
    // res.status(200).send({
    //   message: "Combined Daybook",
    //   access: true,
    //   combines,
    //   day_range_from: from,
    //   day_range_to: to,
    //   ins_info: data_1?.ins_info,
    //   account_info: valid_bank ?? "",
    // });
  } catch (e) {
    console.log(e);
  }
};

exports.renderApplicationDSEAllottedListQuery = async (req, res) => {
  try {
    const { appId } = req.params;
    const { flow } = req.query;
    if (!appId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_apply = await NewApplication.findById({ _id: appId })
      .select(
        "receievedApplication applicationUnit applicationName confirmedApplication allottedApplication applicationHostel admissionAdmin subject_selected_group"
      )
      .populate({
        path: "allottedApplication",
        populate: {
          path: "student",
          populate: {
            path: "student_optional_subject major_subject nested_subject student_single_subject",
            select: "subjectName",
          },
        },
      });

    if (valid_apply?.allottedApplication?.length > 0) {
      var excel_list = [];
      const all_group_select = await SubjectGroupSelect.find({
        $and: [{ subject_group: { $in: valid_apply?.subject_selected_group } }],
      })
        .populate({
          path: "compulsory_subject",
          select: "subjectName",
        })
        .populate({
          path: "optional_subject",
          populate: {
            path: "optional_subject_options optional_subject_options_or.options",
            select: "subjectName",
          },
        })
        .populate({
          path: "fixed_subject",
          populate: {
            path: "fixed_subject_options",
            select: "subjectName",
          },
        });
      var subject_list = [];
      for (let ele of all_group_select) {
        subject_list.push(...ele?.compulsory_subject);
      }
      for (let ele of all_group_select) {
        for (let val of ele?.fixed_subject) {
          subject_list.push(...val?.fixed_subject_options);
        }
      }
      for (let ele of all_group_select) {
        for (let val of ele?.optional_subject) {
          subject_list.push(...val?.optional_subject_options);
        }
        for (let val of ele?.optional_subject) {
          for (let stu of val?.optional_subject_options_or) {
            subject_list.push(...stu?.options);
          }
        }
      }
      var numss = {};
      var numsss = {};
      for (var ref of valid_apply?.allottedApplication) {
        if (ref?.student?.studentFirstName != "") {
          for (let ele of ref?.student?.student_dynamic_field) {
            numss[ele?.key] = ele?.value;
          }
          var nums_queue = {};
          for (let stu of subject_list) {
            ref.student.student_dynamic_subject.push({
              subjectName: stu?.subjectName,
              status: "No",
              _id: stu?._id,
            });
          }
          console.log(ref?.student?.student_dynamic_subject);
          // for (let ele of ref?.student?.student_dynamic_subject) {
          //   for (let val of ref?.student?.student_optional_subject) {
          //     if (`${ele?._id}` === `${val?._id}`) {
          //       ref.student.student_single_subject.push(val?.subjectName);
          //     }
          //   }
          // }
          for (let val of ref?.student?.student_dynamic_subject) {
            for (let ele of ref?.student?.major_subject) {
              if (`${val?._id}` === `${ele?._id}`) {
                ref.student.student_single_subject.push(val?.subjectName);
              }
            }
          }
          // if (ref?.nested_subject?.length > 0) {
          //   for (let val of ref?.student?.student_dynamic_subject) {
          //     for (let ele of ref?.student?.nested_subject) {
          //       if (`${val?._id}` === `${ele?._id}`) {
          //         ref.student.student_single_subject.push(val?.subjectName);
          //       }
          //     }
          //   }
          // }
          for (let val of ref?.student?.major_subject) {
            if (
              ref.student.student_single_subject?.includes(
                `${val?.subjectName}`
              )
            ) {
            } else {
              ref.student.student_single_subject.push(val?.subjectName);
            }
          }
          const unique = [
            ...new Set(
              ref?.student?.student_single_subject.map((item) => item)
            ),
          ];
          excel_list.push({
            RegistrationID: ref?.student?.studentGRNO ?? "#NA",
            "ABC ID": ref?.student?.student_abc_id ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName ??
                  ref?.student?.studentFatherName
                : ""
            } ${ref?.student?.studentLastName}`,
            FirstName: ref?.student?.studentFirstName ?? "#NA",
            FatherName:
              ref?.student?.studentFatherName ??
              ref?.student?.studentMiddleName,
            LastName: ref?.student?.studentLastName ?? "#NA",
            DOB:
              moment(ref?.student?.student_expand_DOB).format("DD/MM/YYYY") ??
              "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
            CasteCategory: ref?.student?.studentCastCategory ?? "#NA",
            Religion: ref?.student?.studentReligion ?? "#NA",
            MotherName: `${ref?.student?.studentMotherName}` ?? "#NA",
            ApplicationName: `${valid_apply?.applicationName}` ?? "#NA",
            Address: `${ref?.student?.studentAddress}` ?? "#NA",
            AppliedOn: `${moment(ref?.student?.createdAt).format("LL")}`,
            ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
            AlternateContactNo:
              ref?.student?.studentParentsPhoneNumber ?? "#NA",
            NameAsMarksheet: ref?.student?.studentNameAsMarksheet,
            NameAsCertificate: ref?.student?.studentNameAsCertificate,
            BirthPlace: ref?.student?.studentBirthPlace,
            Religion: ref?.student?.studentReligion,
            Caste: ref?.student?.studentCast,
            Nationality: ref?.student?.studentNationality,
            RationCard: ref?.student?.studentFatherRationCardColor,
            BloodGroup: ref?.student?.student_blood_group,
            AadharNumber: ref?.student?.studentAadharNumber,
            PhoneNumber: ref?.student?.studentPhoneNumber,
            Email: ref?.student?.studentEmail,
            ParentsPhoneNumber: ref?.student?.studentParentsPhoneNumber,
            CurrentAddress: ref?.student?.studentCurrentAddress,
            CurrentPinCode: ref?.student?.studentCurrentPincode,
            CurrentState: ref?.student?.studentCurrentState,
            CurrentDistrict: ref?.student?.studentCurrentDistrict,
            Address: ref?.student?.studentAddress,
            PinCode: ref?.student?.studentPincode,
            State: ref?.student?.studentState,
            District: ref?.student?.studentDistrict,
            ParentsName: ref?.student?.studentParentsName,
            ParentsEmail: ref?.student?.studentParentsEmail,
            ParentsOccupation: ref?.student?.studentParentsOccupation,
            ParentsOfficeAddress: ref?.student?.studentParentsAddress,
            ParentsAnnualIncome: ref?.student?.studentParentsAnnualIncom,
            SeatType: ref?.student?.student_seat_type,
            PhysicallyHandicapped: ref?.student?.student_ph_type,
            DefencePersonnel: ref?.student?.student_defence_personnel_word,
            MaritalStatus: ref?.student?.student_marital_status,
            PreviousBoard: ref?.student?.student_board_university,
            PreviousSchool: ref?.student?.studentPreviousSchool,
            UniversityCourse: ref?.student?.student_university_courses,
            PassingYear: ref?.student?.student_year,
            PreviousClass: ref?.student?.student_previous_class,
            PreviousMarks: ref?.student?.student_previous_marks,
            PreviousPercentage: ref?.student?.student_previous_percentage,
            SeatNo: ref?.student?.student_previous_section,
            StandardMOP: ref?.student?.month_of_passing,
            StandardYOP: ref?.student?.year_of_passing,
            StandardPercentage: ref?.student?.percentage,
            StandardNameOfInstitute: ref?.student?.name_of_institute,
            HSCMOP: ref?.student?.hsc_month,
            HSCYOP: ref?.student?.hsc_year,
            HSCPercentage: ref?.student?.hsc_percentage,
            HSCNameOfInstitute: ref?.student?.hsc_name_of_institute,
            HSCBoard: ref?.student?.hsc_board,
            HSCCandidateType: ref?.student?.hsc_candidate_type,
            HSCVocationalType: ref?.student?.hsc_vocational_type,
            HSCPhysicsMarks: ref?.student?.hsc_physics_marks,
            HSCChemistryMarks: ref?.student?.hsc_chemistry_marks,
            HSCMathematicsMarks: ref?.student?.hsc_mathematics_marks,
            HSCPCMTotal: ref?.student?.hsc_pcm_total,
            HSCGrandTotal: ref?.student?.hsc_grand_total,
            FormNo: ref?.student?.form_no,
            QviplePayId: ref?.student?.qviple_student_pay_id,
            ...numss,
            ...unique,
          });
        }
      }
      var valid_back = await json_to_excel_admission_application_query(
        excel_list,
        valid_apply?.applicationName,
        appId,
        flow
      );
      if (valid_back?.back) {
        res.status(200).send({
          message: "Explore New Excel On Hostel Export TAB",
          access: true,
          excel_list,
        });
      }
    } else {
      res.status(200).send({
        message: "No New Excel Exports ",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.render_all_cashier_query = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ins = await InstituteAdmin.findById({ _id: id }).select(
      "cash_authority_list"
    );

    const all_staff = await Staff.find({
      _id: { $in: ins?.cash_authority_list },
    }).select(
      "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
    );

    if (all_staff?.length > 0) {
      res.status(200).send({
        message: "Explore All Staff / Cashier Data set",
        access: true,
        all_staff: all_staff,
      });
    } else {
      res.status(200).send({
        message: "No Staff / Cashier Data set",
        access: false,
        all_staff: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

const date_for_all_functions = (from, to) => {
  try {
    var g_year;
    var l_year;
    var g_month;
    var l_month;

    var g_year = new Date(`${from}`).getFullYear();
    var g_day = new Date(`${from}`).getDate();
    var l_year = new Date(`${to}`).getFullYear();
    var l_day = new Date(`${to}`).getDate();
    var g_month = new Date(`${from}`).getMonth() + 1;
    if (g_month < 10) {
      g_month = `0${g_month}`;
    }
    if (g_day < 10) {
      g_day = `0${g_day}`;
    }
    var l_month = new Date(`${to}`).getMonth() + 1;
    if (l_month < 10) {
      l_month = `0${l_month}`;
    }
    if (l_day < 10) {
      l_day = `0${l_day}`;
    }
    const g_date = new Date(`${g_year}-${g_month}-${g_day}T00:00:00.000Z`);
    const date = new Date(new Date(`${l_year}-${l_month}-${l_day}`));
    date.setDate(date.getDate() + 1);
    let l_dates = date.getDate();
    if (l_dates < 10) {
      l_dates = `0${l_dates}`;
    }
    var l_months = l_month;
    let list1 = ["01", "03", "05", "07", "08", "10", "12"];
    let list2 = ["04", "06", "09", "11"];
    let list3 = ["02"];
    let g_days = l_months?.toString();
    let l_days = l_months?.toString();
    if (g_day == 30 && list2?.includes(String(g_days))) {
      date.setMonth(date.getMonth() + 1);
      var l_months = date.getMonth();
      if (l_months < 10) {
        l_months = `0${l_months}`;
      }
    }
    if (g_day == 31) {
      if (g_day >= 31 && list1?.includes(String(g_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
    } else {
      if (l_day == 31 && list1?.includes(String(l_days))) {
        date.setMonth(date.getMonth() + 1);
        var l_months = date.getMonth();
        if (l_months < 10) {
          l_months = `0${l_months}`;
        }
      }
    }
    const l_date = new Date(`${l_year}-${l_months}-${l_dates}T00:00:00.000Z`);
    return {
      l_date: l_date,
      g_date: g_date,
    };
  } catch (e) {
    console.log(e);
  }
};

exports.universal_batch_all_department = async (req, res) => {
  try {
    const { uid } = req?.params;
    if (!uid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const uni = await Batch.findById({ _id: uid }).select("merged_batches");

    const all_depart = await Department.find({
      batches: { $in: uni?.merged_batches },
    }).select("dName dTitle");

    if (all_depart?.length > 0) {
      res.status(200).send({
        message: "Explore All Department By Universal Batch",
        access: true,
        all_depart: all_depart,
      });
    } else {
      res.status(200).send({
        message: "No Department By Universal Batch",
        access: false,
        all_depart: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderNormalAdmissionFeesStudentQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { from, to, bank } = req.query;
    const { depart, batch } = req?.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select("insName depart");

    const batches = await Batch.findById({ _id: `${batch}` }).select(
      "merged_batches"
    );

    let by_date = date_for_all_functions(from, to);
    var all_receipts = await FeeReceipt.find({
      $and: [
        { finance: fid },
        {
          created_at: {
            $gte: by_date?.g_date,
            $lte: by_date?.l_date,
          },
        },
        {
          receipt_generated_from: "BY_ADMISSION",
        },
        {
          refund_status: "No Refund",
        },
        {
          visible_status: "Not Hide",
        },
        {
          set_off_status: "Not Set off",
        },
      ],
    })
      .sort({ invoice_count: "1" })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName studentStatus studentPhoneNumber studentFatherName studentGRNO studentGender remainingFeeList",
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName studentStatus studentPhoneNumber studentFatherName studentGRNO studentGender remainingFeeList",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName studentStatus studentPhoneNumber studentFatherName studentGRNO studentGender remainingFeeList",
        populate: {
          path: "batches",
          select: "batchName",
        },
      })
      .populate({
        path: "application",
        select: "applicationDepartment applicationName applicationBatch",
        populate: {
          path: "applicationDepartment",
          select: "bank_account",
          populate: {
            path: "bank_account",
            select:
              "finance_bank_account_number finance_bank_name finance_bank_account_name",
          },
        },
      })
      .lean()
      .exec();
    if (bank) {
      var bank_acc = await BankAccount.findById({ _id: bank });
      if (bank_acc?.bank_account_type === "Society") {
      } else {
        all_receipts = all_receipts?.filter((val) => {
          if (
            `${val?.application?.applicationDepartment?.bank_account?._id}` ===
            `${bank}`
          )
            return val;
        });
      }
    }
    if (depart?.length > 0) {
      all_receipts = all_receipts?.filter((val) => {
        if (depart?.includes(`${val?.application?.applicationDepartment?._id}`))
          return val;
      });
    }
    if (batch) {
      all_receipts = all_receipts?.filter((val) => {
        if (
          batches?.merged_batches?.includes(
            `${val?.application?.applicationBatch}`
          )
        )
          return val;
      });
    }

    all_receipts = all_receipts?.filter((cls) => {
      if (
        `${cls?.student?.studentStatus}` == "Approved" &&
        cls?.student?.studentGRNO
      )
        return cls;
    });
    if (all_receipts?.length > 0) {
      res.status(200).send({
        message: "Explore Admission Fee Register Receipt Heads Structure Query",
        access: true,
        count: all_receipts?.length,
      });
      var head_list = [];
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { HeadsName, PaidHeadFees } = arr[i];
          obj[HeadsName] = PaidHeadFees;
        }
        return obj;
      };
      let i = 0;
      for (var ref of all_receipts) {
        let normal = 0;
        let society = 0;
        var op = await OrderPayment.findOne({ fee_receipt: ref?._id }).select(
          "paytm_query"
        );
        if (ref?.student?.studentFirstName) {
          console.log("ENTER", i);
          i += 1;
          var remain_list = await RemainingList.findOne({
            $and: [
              { fee_structure: `${ref?.fee_structure}` },
              { student: ref?.student?._id },
              // { appId: ref?.application?._id },
            ],
          })
            .select("fee_structure appId")
            .populate({
              path: "fee_structure",
              select:
                "applicable_fees total_admission_fees class_master batch_master unique_structure_name category_master",
              populate: {
                path: "class_master batch_master category_master department",
                select: "className batchName category_name dName",
              },
            })
            .populate({
              path: "appId",
              select: "applicationDepartment applicationBatch applicationName",
              populate: {
                path: "applicationDepartment applicationBatch",
                select: "dName batchName",
              },
            })
            .populate({
              path: "applicable_card government_card",
              select: "paid_fee remaining_fee applicable_fee remaining_array",
            });
          var head_array = [];
          if (ref?.fee_heads?.length > 0) {
            for (var val of ref?.fee_heads) {
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${val?.appId}` === `${remain_list?.appId?._id}` &&
                  val?.master &&
                  val?.is_society == true
                ) {
                  const head = await FeeMaster.findById({ _id: val?.master });
                  head_array.push({
                    HeadsName: head?.master_name,
                    PaidHeadFees: val?.paid_fee,
                  });
                  society += val?.paid_fee;
                }
              } else {
                if (
                  `${val?.appId}` === `${remain_list?.appId?._id}` &&
                  val?.master &&
                  val?.is_society == false
                ) {
                  const head = await FeeMaster.findById({ _id: val?.master });
                  head_array.push({
                    HeadsName: head?.master_name,
                    PaidHeadFees: val?.paid_fee,
                  });
                  normal += val?.paid_fee;
                }
              }
            }
          }
          if (
            remain_list?.applicable_card?.paid_fee -
              remain_list?.applicable_card?.applicable_fee >
            0
          ) {
            if (`${val?.appId}` === `${remain_list?.appId?._id}`) {
              head_array.push({
                HeadsName: "Excess Fees",
                PaidHeadFees:
                  remain_list?.applicable_card?.paid_fee -
                  remain_list?.applicable_card?.applicable_fee,
              });
            }
          }
          if (ref?.fee_heads?.length > 0) {
            var result = await buildStructureObject(head_array);
          }
          let stats;
          if (remain_list) {
            for (let cls of remain_list?.applicable_card?.remaining_array) {
              if (`${cls?.fee_receipt}` === `${ref?._id}`) {
                stats = cls?.revert_status ?? "NA";
              }
            }
          }
          if (result) {
            head_list.push({
              // ReceiptNumber: bank
              //   ? bank_acc?.bank_account_type === "Society"
              //     ? ref?.society_invoice_count
              //     : ref?.invoice_count
              //   : ref?.invoice_count ?? "0",
              // ReceiptDate: moment(ref?.created_at).format("DD-MM-YYYY") ?? "NA",
              // TransactionAmount: ref?.fee_payment_amount ?? "0",
              // BankTxnValue: bank
              //   ? bank_acc?.bank_account_type === "Society"
              //     ? society
              //     : normal
              //   : normal,
              // TransactionDate:
              //   moment(ref?.fee_transaction_date).format("DD-MM-YYYY") ?? "NA",
              // TransactionMode: ref?.fee_payment_mode ?? "#NA",
              // BankName: ref?.fee_bank_name ?? "#NA",
              // BankHolderName: ref?.fee_bank_holder ?? "#NA",
              // BankUTR:
              //   op?.paytm_query?.length > 0
              //     ? op?.paytm_query?.[0]?.BANKTXNID
              //     : ref?.fee_utr_reference ?? "#NA",
              GRNO: ref?.student?.studentGRNO ?? "",
              Name:
                `${ref?.student?.studentLastName} ${
                  ref?.student?.studentFirstName
                } ${
                  ref?.student?.studentMiddleName
                    ? ref?.student?.studentMiddleName
                    : ""
                }` ?? "#NA",
              FirstName: ref?.student?.studentFirstName ?? "#NA",
              MiddleName:
                ref?.student?.studentMiddleName ??
                ref?.student?.studentFatherName,
              LastName: ref?.student?.studentLastName ?? "#NA",
              Gender: ref?.student?.studentGender ?? "#NA",
              ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
              Standard:
                `${remain_list?.fee_structure?.class_master?.className}` ??
                "#NA",
              Department:
                `${remain_list?.fee_structure?.department?.dName}` ?? "#NA",
              Batch:
                remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
              ApplicationName:
                `${remain_list?.appId?.applicationName}` ?? "#NA",
              FeeStructure:
                remain_list?.fee_structure?.unique_structure_name ?? "#NA",
              TotalFees:
                remain_list?.applicable_card?.applicable_fee +
                  remain_list?.government_card?.applicable_fee ?? 0,
              ApplicableFees: remain_list?.applicable_card?.applicable_fee ?? 0,
              GovernmentFees: remain_list?.government_card?.applicable_fee ?? 0,
              TotalPaidFees:
                remain_list?.applicable_card?.paid_fee +
                  remain_list?.government_card?.paid_fee ?? 0,
              ApplicablePaidFees: remain_list?.applicable_card?.paid_fee ?? 0,
              GovernmentPaidFees: remain_list?.government_card?.paid_fee ?? 0,
              TotalOutstandingFees:
                remain_list?.applicable_card?.remaining_fee +
                  remain_list?.government_card?.remaining_fee ?? 0,
              ApplicableOutstandingFees:
                remain_list?.applicable_card?.remaining_fee ?? 0,
              GovernmentOutstandingFees:
                remain_list?.government_card?.remaining_fee ?? 0,
              Remark: remain_list?.remark ?? "#NA",
              DepartmentBankName:
                ref?.application?.applicationDepartment?.bank_account
                  ?.finance_bank_name ?? "#NA",
              DepartmentBankAccountNumber:
                ref?.application?.applicationDepartment?.bank_account
                  ?.finance_bank_account_number ?? "#NA",
              DepartmentBankAccountHolderName:
                ref?.application?.applicationDepartment?.bank_account
                  ?.finance_bank_account_name ?? "#NA",
              Card_Status: stats ?? "NA",
              ...result,
            });
            result = [];
          }
          head_array = [];
          stats = "";
        }
      }

      // console.log(head_list);
      const key = "Name";

      const arrayUniqueByKey = [
        ...new Map(head_list.map((item) => [item[key], item])).values(),
      ];
      await fee_heads_receipt_json_to_excel_query(
        arrayUniqueByKey,
        institute?.insName,
        institute?._id,
        bank,
        from,
        to,
        "",
        "",
        "Admission Fee Reg."
      );
    } else {
      res.status(200).send({
        message: "No Admission Fee Register Receipt Heads Structure Query",
        access: false,
        all_students: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fees_data = async (req, res) => {
  try {
    const all_receipt = await FeeReceipt.find({}).select(
      "fee_structure student"
    );
    let nums = [];
    let i = 0;
    for (let ele of all_receipt) {
      if (ele?.fee_structure) {
        var remain_list = await RemainingList.findOne({
          $and: [
            { fee_structure: `${ele?.fee_structure}` },
            { student: ele?.student },
          ],
        });
        if (remain_list?._id) {
        } else {
          nums.push(ele?._id);
        }
      }
      console.log(i);
      i += 1;
    }
    res
      .status(200)
      .send({ message: "DONE", access: true, nums, count: nums?.length });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdmissionFeesRegisterQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const { from, to, bank } = req.query;
    const { depart, batch } = req?.body;
    if (!fid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const finance = await Finance.findById({ _id: fid }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${finance?.institute}`,
    }).select("insName depart");

    const batches = await Batch.findById({ _id: `${batch}` }).select(
      "merged_batches"
    );

    let by_date = date_for_all_functions(from, to);
    var all_receipts = await FeeReceipt.find({
      $and: [
        { finance: fid },
        {
          created_at: {
            $gte: by_date?.g_date,
            $lte: by_date?.l_date,
          },
        },
        {
          receipt_generated_from: "BY_ADMISSION",
        },
        {
          refund_status: "No Refund",
        },
        {
          visible_status: "Not Hide",
        },
        {
          set_off_status: "Not Set off",
        },
      ],
    })
      .sort({ invoice_count: "1" })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentFatherName studentGRNO studentGender remainingFeeList",
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentFatherName studentGRNO studentGender remainingFeeList",
        populate: {
          path: "studentClass",
          select: "className classTitle",
        },
      })
      .populate({
        path: "student",
        select:
          "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentFatherName studentGRNO studentGender remainingFeeList",
        populate: {
          path: "batches",
          select: "batchName",
        },
      })
      .populate({
        path: "application",
        select: "applicationDepartment applicationName applicationBatch",
        populate: {
          path: "applicationDepartment",
          select: "bank_account",
          populate: {
            path: "bank_account",
            select:
              "finance_bank_account_number finance_bank_name finance_bank_account_name",
          },
        },
      })
      .lean()
      .exec();
    if (bank) {
      var bank_acc = await BankAccount.findById({ _id: bank });
      if (bank_acc?.bank_account_type === "Society") {
      } else {
        all_receipts = all_receipts?.filter((val) => {
          if (
            `${val?.application?.applicationDepartment?.bank_account?._id}` ===
            `${bank}`
          )
            return val;
        });
      }
    }
    if (depart?.length > 0) {
      all_receipts = all_receipts?.filter((val) => {
        if (depart?.includes(`${val?.application?.applicationDepartment?._id}`))
          return val;
      });
    }

    if (batch) {
      all_receipts = all_receipts?.filter((val) => {
        if (
          batches?.merged_batches?.includes(
            `${val?.application?.applicationBatch}`
          )
        )
          return val;
      });
    }

    if (all_receipts?.length > 0) {
      res.status(200).send({
        message: "Explore Admission Fee Register Receipt Heads Structure Query",
        access: true,
        count: all_receipts?.length,
      });
      var head_list = [];
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { HeadsName, PaidHeadFees } = arr[i];
          obj[HeadsName] = PaidHeadFees;
        }
        return obj;
      };
      for (var ref of all_receipts) {
        let normal = 0;
        let society = 0;
        var op = await OrderPayment.findOne({ fee_receipt: ref?._id }).select(
          "paytm_query"
        );
        if (ref?.student?.studentFirstName) {
          console.log("ENTER");
          var remain_list = await RemainingList.findOne({
            $and: [
              { fee_structure: `${ref?.fee_structure}` },
              { student: ref?.student?._id },
              // { appId: ref?.application?._id },
            ],
          })
            .select("fee_structure appId")
            .populate({
              path: "fee_structure",
              select:
                "applicable_fees total_admission_fees class_master batch_master unique_structure_name category_master",
              populate: {
                path: "class_master batch_master category_master department",
                select: "className batchName category_name dName",
              },
            })
            .populate({
              path: "appId",
              select: "applicationDepartment applicationBatch applicationName",
              populate: {
                path: "applicationDepartment applicationBatch",
                select: "dName batchName",
              },
            })
            .populate({
              path: "applicable_card government_card",
              select: "paid_fee remaining_fee applicable_fee remaining_array",
            });
          var head_array = [];
          if (ref?.fee_heads?.length > 0) {
            for (var val of ref?.fee_heads) {
              if (bank_acc?.bank_account_type === "Society") {
                if (
                  `${val?.appId}` === `${remain_list?.appId?._id}` &&
                  val?.master &&
                  val?.is_society == true
                ) {
                  const head = await FeeMaster.findById({ _id: val?.master });
                  head_array.push({
                    HeadsName: head?.master_name,
                    PaidHeadFees: val?.original_paid,
                  });
                  society += val?.original_paid;
                }
              } else {
                if (
                  `${val?.appId}` === `${remain_list?.appId?._id}` &&
                  val?.master &&
                  val?.is_society == false
                ) {
                  const head = await FeeMaster.findById({ _id: val?.master });
                  head_array.push({
                    HeadsName: head?.master_name,
                    PaidHeadFees: val?.original_paid,
                  });
                  normal += val?.original_paid;
                }
              }
            }
          }
          if (
            remain_list?.applicable_card?.paid_fee -
              remain_list?.applicable_card?.applicable_fee >
            0
          ) {
            if (`${val?.appId}` === `${remain_list?.appId?._id}`) {
              head_array.push({
                HeadsName: "Excess Fees",
                PaidHeadFees:
                  remain_list?.applicable_card?.paid_fee -
                  remain_list?.applicable_card?.applicable_fee,
              });
            }
          }
          if (ref?.fee_heads?.length > 0) {
            var result = await buildStructureObject(head_array);
          }
          let stats;
          if (remain_list) {
            for (let cls of remain_list?.applicable_card?.remaining_array) {
              if (`${cls?.fee_receipt}` === `${ref?._id}`) {
                stats = cls?.revert_status ?? "NA";
              }
            }
          }
          if (result) {
            head_list.push({
              // ReceiptNumber: bank
              //   ? bank_acc?.bank_account_type === "Society"
              //     ? ref?.society_invoice_count
              //     : ref?.invoice_count
              //   : ref?.invoice_count ?? "0",
              // ReceiptDate: moment(ref?.created_at).format("DD-MM-YYYY") ?? "NA",
              // TransactionAmount: ref?.fee_payment_amount ?? "0",
              // BankTxnValue: bank
              //   ? bank_acc?.bank_account_type === "Society"
              //     ? society
              //     : normal
              //   : normal,
              // TransactionDate:
              //   moment(ref?.fee_transaction_date).format("DD-MM-YYYY") ?? "NA",
              // TransactionMode: ref?.fee_payment_mode ?? "#NA",
              // BankName: ref?.fee_bank_name ?? "#NA",
              // BankHolderName: ref?.fee_bank_holder ?? "#NA",
              // BankUTR:
              //   op?.paytm_query?.length > 0
              //     ? op?.paytm_query?.[0]?.BANKTXNID
              //     : ref?.fee_utr_reference ?? "#NA",
              GRNO: ref?.student?.studentGRNO ?? "#NA",
              Name:
                `${ref?.student?.studentLastName} ${
                  ref?.student?.studentFirstName
                } ${
                  ref?.student?.studentMiddleName
                    ? ref?.student?.studentMiddleName
                    : ""
                }` ?? "#NA",
              FirstName: ref?.student?.studentFirstName ?? "#NA",
              MiddleName:
                ref?.student?.studentMiddleName ??
                ref?.student?.studentFatherName,
              LastName: ref?.student?.studentLastName ?? "#NA",
              Gender: ref?.student?.studentGender ?? "#NA",
              ContactNo: ref?.student?.studentPhoneNumber ?? "#NA",
              Standard:
                `${remain_list?.fee_structure?.class_master?.className}` ??
                "#NA",
              Department:
                `${remain_list?.fee_structure?.department?.dName}` ?? "#NA",
              Batch:
                remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
              ApplicationName:
                `${remain_list?.appId?.applicationName}` ?? "#NA",
              FeeStructure:
                remain_list?.fee_structure?.unique_structure_name ?? "#NA",
              TotalFees:
                remain_list?.applicable_card?.applicable_fee +
                  remain_list?.government_card?.applicable_fee ?? 0,
              ApplicableFees: remain_list?.applicable_card?.applicable_fee ?? 0,
              GovernmentFees: remain_list?.government_card?.applicable_fee ?? 0,
              TotalPaidFees:
                remain_list?.applicable_card?.paid_fee +
                  remain_list?.government_card?.paid_fee ?? 0,
              ApplicablePaidFees: remain_list?.applicable_card?.paid_fee ?? 0,
              GovernmentPaidFees: remain_list?.government_card?.paid_fee ?? 0,
              TotalOutstandingFees:
                remain_list?.applicable_card?.remaining_fee +
                  remain_list?.government_card?.remaining_fee ?? 0,
              ApplicableOutstandingFees:
                remain_list?.applicable_card?.remaining_fee ?? 0,
              GovernmentOutstandingFees:
                remain_list?.government_card?.remaining_fee ?? 0,
              Remark: remain_list?.remark ?? "#NA",
              Card_Status: stats ?? "NA",
              DepartmentBankName:
                ref?.application?.applicationDepartment?.bank_account
                  ?.finance_bank_name ?? "#NA",
              DepartmentBankAccountNumber:
                ref?.application?.applicationDepartment?.bank_account
                  ?.finance_bank_account_number ?? "#NA",
              DepartmentBankAccountHolderName:
                ref?.application?.applicationDepartment?.bank_account
                  ?.finance_bank_account_name ?? "#NA",
              ...result,
            });
            result = [];
          }
          head_array = [];
          stats = "";
        }
      }

      // console.log(head_list);
      await fee_heads_receipt_json_to_excel_query(
        head_list,
        institute?.insName,
        institute?._id,
        bank,
        from,
        to,
        "",
        "",
        "Admission Fee Reg."
      );
    } else {
      res.status(200).send({
        message: "No Admission Fee Register Receipt Heads Structure Query",
        access: false,
        all_students: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.dob_query = async (req, res) => {
  try {
    const { id } = req?.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    const ins = await InstituteAdmin.findById({ _id: id }).select(
      "ApproveStudent"
    );

    const all_student = await Student.find({
      _id: { $in: ins?.ApproveStudent },
    });

    let i = 0;
    for (let ele of all_student) {
      if (ele?.studentDOB) {
        ele.student_expand_DOB = new Date(`${ele?.studentDOB}`);
        await ele.save();
      }
      console.log(i);
      i += 1;
    }
    res.status(200).send({ message: "DOB Query", access: true });
  } catch (e) {
    console.log(e);
  }
};
