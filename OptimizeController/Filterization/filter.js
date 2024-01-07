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

    if (sort_query === "Alpha") {
      const sortedA = await sort_student_by_alpha(
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
            Gender: ref?.student?.studentGender ?? "#NA",
            Standard:
              `${remain_list?.fee_structure?.class_master?.className}` ?? "#NA",
            Batch: remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
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

exports.renderUpdate = async (req, res) => {
  const all_student = await Student.find({}).select("remainingFeeList_count");
  for (var ref of all_student) {
    ref.remainingFeeList_count = 1;
    await ref.save();
  }
  res.status(200).send({ message: "updated", access: true });
};

const filterization_app_query = async (arr, type, date) => {
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
    var valid_app = await NewApplication.findById({ _id: aid });
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
    var allot_count = await filterization_app_query(
      valid_app?.allottedApplication,
      "Allot",
      valid_date
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
        "receievedApplication applicationUnit applicationName confirmedApplication allottedApplication applicationHostel"
      )
      .populate({
        path: "receievedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "confirmedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "allottedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
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
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName}`,
            DOB: ref?.student?.studentDOB ?? "#NA",
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
        for (var ref of valid_apply?.receievedApplication) {
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName}`,
            DOB: ref?.student?.studentDOB ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
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
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName}`,
            DOB: ref?.student?.studentDOB ?? "#NA",
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
        for (var ref of valid_apply?.confirmedApplication) {
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName}`,
            DOB: ref?.student?.studentDOB ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
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
      if (valid_apply?.applicationHostel) {
        for (var ref of valid_apply?.allottedApplication) {
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            GRNO: ref?.student?.studentGRNO ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName}`,
            DOB: ref?.student?.studentDOB ?? "#NA",
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
        for (var ref of valid_apply?.allottedApplication) {
          excel_list.push({
            RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
            GRNO: ref?.student?.studentGRNO ?? "#NA",
            Name: `${ref?.student?.studentFirstName} ${
              ref?.student?.studentMiddleName
                ? ref?.student?.studentMiddleName
                : ""
            } ${ref?.student?.studentLastName}`,
            DOB: ref?.student?.studentDOB ?? "#NA",
            Gender: ref?.student?.studentGender ?? "#NA",
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
    } else {
      res.status(200).send({
        message: "No Applications Found",
        access: false,
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
        "receievedApplication applicationUnit applicationName confirmedApplication allottedApplication applicationHostel"
      )
      .populate({
        path: "receievedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "confirmedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      })
      .populate({
        path: "allottedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentPhoneNumber studentParentsPhoneNumber studentDOB student_prn_enroll_number studentAddress studentGRNO studentReligion studentMotherName studentMTongue studentGender studentCastCategory photoId studentProfilePhoto student_hostel_cpi student_programme student_branch student_year student_single_seater_room student_ph",
        },
      });

    if (valid_apply?.applicationUnit) {
      var valid_unit = await HostelUnit.findById({
        _id: valid_apply?.applicationUnit,
      }).select("hostel_unit_name");
    }

    if (
      `${flow}` === "Request_Query" &&
      valid_apply?.receievedApplication?.length > 0
    ) {
      var excel_list = [];
      for (var ref of valid_apply?.receievedApplication) {
        excel_list.push({
          RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
          Name: `${ref?.student?.studentFirstName} ${
            ref?.student?.studentMiddleName
              ? ref?.student?.studentMiddleName
              : ""
          } ${ref?.student?.studentLastName}`,
          DOB: ref?.student?.studentDOB ?? "#NA",
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
          AlternateContactNo: ref?.student?.studentParentsPhoneNumber ?? "#NA",
        });
      }
      var valid_back = await json_to_excel_hostel_application_query(
        excel_list,
        valid_apply?.applicationName,
        valid_unit?.hostel_unit_name,
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
      for (var ref of valid_apply?.confirmedApplication) {
        excel_list.push({
          RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
          Name: `${ref?.student?.studentFirstName} ${
            ref?.student?.studentMiddleName
              ? ref?.student?.studentMiddleName
              : ""
          } ${ref?.student?.studentLastName}`,
          DOB: ref?.student?.studentDOB ?? "#NA",
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
          AlternateContactNo: ref?.student?.studentParentsPhoneNumber ?? "#NA",
        });
      }
      var valid_back = await json_to_excel_hostel_application_query(
        excel_list,
        valid_apply?.applicationName,
        valid_unit?.hostel_unit_name,
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
      for (var ref of valid_apply?.allottedApplication) {
        excel_list.push({
          RegistrationID: ref?.student?.student_prn_enroll_number ?? "#NA",
          GRNO: ref?.student?.studentGRNO ?? "#NA",
          Name: `${ref?.student?.studentFirstName} ${
            ref?.student?.studentMiddleName
              ? ref?.student?.studentMiddleName
              : ""
          } ${ref?.student?.studentLastName}`,
          DOB: ref?.student?.studentDOB ?? "#NA",
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
          AlternateContactNo: ref?.student?.studentParentsPhoneNumber ?? "#NA",
        });
      }
      var valid_back = await json_to_excel_hostel_application_query(
        excel_list,
        valid_apply?.applicationName,
        valid_unit?.hostel_unit_name,
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
    } else {
      res.status(200).send({
        message: "No Applications Found",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

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
            path: "category_master batch_master class_master",
            select: "category_name batchName className",
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
        ],
      })
        .sort({ invoice_count: "1" })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList student_unit",
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
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList student_unit",
          populate: {
            path: "student_unit",
            select: "hostel_unit_name",
          },
        })
        .populate({
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName studentGRNO studentGender remainingFeeList student_unit",
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
              path: "class_master batch_master",
              select: "className batchName",
            },
          })
          .populate({
            path: "appId",
            select: "applicationBatch applicationHostel",
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
      var l_date = new Date(`${l_year}-${l_month}-${l_day}T00:00:00.000Z`);
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
    const { flow } = req?.query
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

      if(flow === "Normal"){
        var classes = await Class.findById({ _id: cid }).select(
          "ApproveStudent className institute"
        );
      }
      else if(flow === "Promote"){
        var classes = await Class.findById({ _id: cid }).select(
          "promoteStudent className institute"
        );
      }
      else{

      }

    if (classes?.ApproveStudent?.length > 0 || classes?.promoteStudent?.length > 0) {
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

    if(flow === "Normal"){
      var searchable = [...classes?.ApproveStudent]

    }
    else if(flow === "Promote"){
      var searchable = [...classes?.promoteStudent]

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
        select: "unique_structure_name applicable_fees total_admission_fees category_master batch_master class_master",
        populate: {
          path: "category_master batch_master class_master",
          select: "category_name batchName className",
        },
      })
      valid_all_students.sort(function (st1, st2) {
        return parseInt(st1?.studentROLLNO) - parseInt(st2?.studentROLLNO);
      });
    var excel_list = [];
    for (var ref of valid_all_students) {
      var struct = ref?.fee_structure ? ref?.fee_structure?._id : ref?.hostel_fee_structure ? ref?.hostel_fee_structure?._id : ""
      var valid_card = await RemainingList.find({ $and: [{ student: `${ref?._id}`}]})
      .populate({
        path: "fee_structure"
      })
      var pending = 0
      var paid = 0
      var applicable_pending = 0
      for (var ele of valid_card) {
        // ref.applicable_fees_pending +=
        //   ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
        //     ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
        //     : 0;
        pending += ele?.remaining_fee
        paid += ele?.paid_fee
        applicable_pending += ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
        ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
        : 0
      }
      if(struct){
        var currentPaid = 0
        var currentRemain = 0
        var currentApplicableRemaining = 0
        var valid_card = await RemainingList.findOne({ $and: [{ fee_structure: `${struct}`},{ student: `${ref?._id}`}]})
        .populate({
          path: "fee_structure"
        })
        currentPaid += valid_card?.paid_fee
        currentRemain += valid_card?.remaining_fee
        currentApplicableRemaining += valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee > 0
        ? valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee
        : 0
      }
      excel_list.push({
        RollNo: ref?.studentROLLNO ?? "NA",
        AbcId: ref?.student_abc_id ?? "#NA",
        GRNO: ref?.studentGRNO ?? "#NA",
        Name: `${ref?.studentFirstName} ${
          ref?.studentMiddleName ? ref?.studentMiddleName : ""
        } ${ref?.studentLastName}` ?? ref?.valid_full_name,
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
        Standard: `${ref?.fee_structure}` ? `${ref?.fee_structure?.class_master?.className}` : `${ref?.hostel_fee_structure}` ? `${ref?.hostel_fee_structure?.class_master?.className}` : "#NA",
        Batch: `${ref?.fee_structure}` ? `${ref?.fee_structure?.batch_master?.batchName}` : `${ref?.hostel_fee_structure}` ? `${ref?.hostel_fee_structure?.batch_master?.batchName}` : "#NA",
        FeeStructure:
        `${ref?.fee_structure}` ? `${ref?.fee_structure?.unique_structure_name}` : `${ref?.hostel_fee_structure}` ? `${ref?.hostel_fee_structure?.unique_structure_name}` : "#NA",
        ActualFees: `${ref?.fee_structure}` ? `${ref?.fee_structure?.total_admission_fees}` : `${ref?.hostel_fee_structure}` ? `${ref?.hostel_fee_structure?.total_admission_fees}` : "0",
        ApplicableFees: `${ref?.fee_structure}` ? `${ref?.fee_structure?.applicable_fees}` : `${ref?.hostel_fee_structure}` ? `${ref?.hostel_fee_structure?.applicable_fees}` : "0",
        CurrentYearPaidFees: currentPaid ?? "0",
        CurrentYearRemainingFees: currentRemain ?? "0",
        CurrentYearApplicableRemainingFees: currentApplicableRemaining ?? "0",
        TotalPaidFees: paid ?? "0",
        TotalRemainingFees: pending ?? "0",
        TotalApplicablePending: applicable_pending ?? "0",
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

exports.renderStudentStatisticsQuery = async(req, res) => {
  try{
    const { bid } = req.params
    const batch_query = await Batch.findById({ _id: bid })

    const classes = await Class.find({ _id: { $in: batch_query?.classroom }})
    var excel_list = []
    for(var val of classes){
      var all_student = await Student.find({ studentClass: val?._id })
      .select("studentGender studentCastCategory studentCast studentReligion student student_ph studentGRNO studentROLLNO valid_full_name studentProfilePhoto photoId")
      var general_m = 0
      var general_f = 0
      var obc_m = 0
      var obc_f = 0
      var sc_m = 0
      var sc_f = 0
      var st_m = 0
      var st_f = 0
      var hindu_m = 0
      var hindu_f = 0
      var muslim_m = 0
      var muslim_f = 0
      var sikh_m = 0
      var sikh_f = 0
      var christian_m = 0
      var christian_f = 0
      var jain_m = 0
      var jain_f = 0
      var parsi_m = 0
      var parsi_f = 0
      var budh_m = 0
      var budh_f = 0
      var jews_m = 0
      var jews_f = 0
      var ph_m = 0
      var ph_f = 0
      var general_m_arr = []
      var general_f_arr = []
      var boy_arr = []
      var girl_arr = []
      var obc_m_arr = []
      var obc_f_arr = []
      var sc_m_arr = []
      var sc_f_arr = []
      var st_m_arr = []
      var st_f_arr = []
      var hindu_m_arr = []
      var hindu_f_arr = []
      var muslim_m_arr = []
      var muslim_f_arr = []
      var sikh_m_arr = []
      var sikh_f_arr = []
      var christian_m_arr = []
      var christian_f_arr = []
      var jain_m_arr = []
      var jain_f_arr = []
      var parsi_m_arr = []
      var parsi_f_arr = []
      var budh_m_arr = []
      var budh_f_arr = []
      var jews_m_arr = []
      var jews_f_arr = []
      var ph_m_arr = []
      var ph_f_arr = []
      var dt_m = 0
      var dt_f = 0
      var dt_m_arr = []
      var dt_f_arr = []
      var sbc_m = 0
      var sbc_f = 0
      var sbc_m_arr = []
      var sbc_f_arr = []
      var ews_m = 0
      var ews_f = 0
      var ews_m_arr = []
      var ews_f_arr = []
      var maratha_m = 0
      var maratha_f = 0
      var maratha_m_arr = []
      var maratha_f_arr = []
      var jk_m = 0
      var jk_f = 0
      var jk_m_arr = []
      var jk_f_arr = []
      var goins_m = 0
      var goins_f = 0
      var goins_m_arr = []
      var goins_f_arr = []
      var nt_m = 0
      var nt_f = 0
      var nt_m_arr = []
      var nt_f_arr = []
      for(var ele of all_student){
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentCastCategory?.toLowerCase() === "general"){
          general_m += 1
          general_m_arr.push(ele)
        }
        else{
          general_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentCastCategory?.toLowerCase() === "general"){
          general_f += 1
          general_f_arr.push(ele)
        }
        else{
          general_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentCastCategory?.toLowerCase() === "obc"){
          obc_m += 1
          obc_m_arr.push(ele)
        }
        else{
          obc_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentCastCategory?.toLowerCase() === "obc"){
          obc_f += 1
          obc_f_arr.push(ele)
        }
        else{
          obc_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentCastCategory?.toLowerCase() === "sc"){
          sc_m += 1
          sc_m_arr.push(ele)
        }
        else{
          sc_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentCastCategory?.toLowerCase() === "sc"){
          sc_f += 1
          sc_f_arr.push(ele)
        }
        else{
          sc_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentCastCategory?.toLowerCase() === "st"){
          st_m += 1
          st_m_arr.push(ele)
        }
        else{
          st_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentCastCategory?.toLowerCase() === "st"){
          st_f += 1
          st_f_arr.push(ele)
        }
        else{
          st_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentCastCategory?.toLowerCase() === "nt-a" || ele?.studentCastCategory?.toLowerCase() === "nt-b" || ele?.studentCastCategory?.toLowerCase() === "nt-c" || ele?.studentCastCategory?.toLowerCase() === "nt-d"){
          nt_m += 1
          nt_m_arr.push(ele)
        }
        else{
          nt_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentCastCategory?.toLowerCase() === "nt-a" || ele?.studentCastCategory?.toLowerCase() === "nt-b" || ele?.studentCastCategory?.toLowerCase() === "nt-c" || ele?.studentCastCategory?.toLowerCase() === "nt-d"){
          nt_f += 1
          nt_f_arr.push(ele)
        }
        else{
          nt_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentReligion?.toLowerCase() === "hindu"){
          hindu_m += 1
          hindu_m_arr.push(ele)
        }
        else{
          hindu_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentReligion?.toLowerCase() === "hindu"){
          hindu_f += 1
          hindu_f_arr.push(ele)
        }
        else{
          hindu_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentReligion?.toLowerCase() === "muslim"){
          muslim_m += 1
          muslim_m_arr.push(ele)
        }
        else{
          muslim_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentReligion?.toLowerCase() === "muslim"){
          muslim_f += 1
          muslim_f_arr.push(ele)
        }
        else{
          muslim_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentReligion?.toLowerCase() === "sikh"){
          sikh_m += 1
          sikh_m_arr.push(ele)
        }
        else{
          sikh_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentReligion?.toLowerCase() === "sikh"){
          sikh_f += 1
          sikh_f_arr.push(ele)
        }
        else{
          sikh_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentReligion?.toLowerCase() === "christian" ){
          christian_m += 1
          christian_m_arr.push(ele)
        }
        else{
          christian_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentReligion?.toLowerCase() === "christian"){
          christian_f += 1
          christian_f_arr.push(ele)
        }
        else{
          christian_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentReligion?.toLowerCase() === "jainism"){
          jain_m += 1
          jain_m_arr.push(ele)
        }
        else{
          jain_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentReligion?.toLowerCase() === "jainism"){
          jain_f += 1
          jain_f_arr.push(ele)
        }
        else{
          jain_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentReligion?.toLowerCase() === "parsi"){
          parsi_m += 1
          parsi_m_arr.push(ele)
        }
        else{
          parsi_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentReligion?.toLowerCase() === "parsi"){
          parsi_f += 1
          parsi_f_arr.push(ele)
        }
        else{
          parsi_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentReligion?.toLowerCase() === "buddhism"){
          budh_m += 1
          budh_m_arr.push(ele)
        }
        else{
          budh_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentReligion?.toLowerCase() === "buddhism"){
          budh_f += 1
          budh_f_arr.push(ele)
        }
        else{
          budh_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.studentReligion?.toLowerCase() === "jews"){
          jews_m += 1
          jews_m_arr.push(ele)
        }
        else{
          jews_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.studentReligion?.toLowerCase() === "jews"){
          jews_f += 1
          jews_f_arr.push(ele)
        }
        else{
          jews_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male" && ele?.student_ph?.toLowerCase() === "yes"){
          ph_m += 1
          ph_m_arr.push(ele)
        }
        else{
          ph_m += 0
        }
        if(ele?.studentGender?.toLowerCase() === "female" && ele?.student_ph?.toLowerCase() === "yes"){
          ph_f += 1
          ph_f_arr.push(ele)
        }
        else{
          ph_f += 0
        }
        if(ele?.studentGender?.toLowerCase() === "male"){
          boy_arr.push(ele)
        }
        if(ele?.studentGender?.toLowerCase() === "female"){
          girl_arr.push(ele)
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
        nt_f_arr: nt_f_arr
      })
    }
    if(excel_list?.length > 0){
      res.status(200).send({ message: "Explore New Student Statistics Query", access: true, excel_list: excel_list})
    }
    else{
      res.status(200).send({ message: "No Student Statistics Query", access: false, excel_list: []})
    }
  }
  catch(e){
    console.log(e)
  }
}

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
      })
      valid_all_students.sort(function (st1, st2) {
        return parseInt(st1?.studentROLLNO) - parseInt(st2?.studentROLLNO);
      });

    // var applicable_os_fees = 0
    // var total_fees = 0
    // var total_os_fees = 0
    // var government_os_fees = 0

    if(batch && depart){
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
      var structure = await FeeStructure.find({ $and: [{ department: depart}, { batch_master: batch}] })
    // var all_app = await NewApplication.find({ $and: [{ applicationDepartment: depart}, { applicationBatch: batch}]})
    for (var ref of valid_all_students) {
    var one_remain = await RemainingList.findOne({  $and: [{ student: ref?._id}, { fee_structure: { $in: structure }}]})
    .populate({
      path: "fee_structure",
      populate: {
        path: "class_master batch_master",
        select: "className batchName"
      }
    })
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
        Name: `${ref?.studentFirstName} ${
          ref?.studentMiddleName ? ref?.studentMiddleName : ""
        } ${ref?.studentLastName}` ?? ref?.valid_full_name,
        DOB: ref?.studentDOB ?? "#NA",
        Gender: ref?.studentGender ?? "#NA",
        TotalFees: one_remain?.applicable_fee ?? 0,
        TotalOutstandingFees: one_remain?.remaining_fee,
        TotalPaidFees: one_remain?.paid_fee,
        TotalApplicableOutstandingFees: one_remain?.paid_fee <= one_remain?.fee_structure?.applicable_fees ? one_remain?.fee_structure?.applicable_fees - one_remain?.paid_fee : 0,
        Standard: `${one_remain?.fee_structure}` ? `${one_remain?.fee_structure?.class_master?.className}` : "#NA",
        Batch: `${one_remain?.fee_structure}` ? `${one_remain?.fee_structure?.batch_master?.batchName}` : "#NA",
        FeeStructure: one_remain?.fee_structure?.unique_structure_name,
        ...result
      });
      result = []
    }
    // console.log(excel_list)
    const data = await json_to_excel_statistics_promote_query(
      excel_list,
    );

    res.status(200).send({
      message: "Explore Statistics with Admission Fee Query",
      access: true,
      data: data,
      // excel_list: excel_list
    });
  }
  else{
    var excel_list = [];
    for (var ref of valid_all_students) {
      excel_list.push({
        RollNo: ref?.studentROLLNO ?? "NA",
        AbcId: ref?.student_abc_id ?? "#NA",
        GRNO: ref?.studentGRNO ?? "#NA",
        Name: `${ref?.studentFirstName} ${
          ref?.studentMiddleName ? ref?.studentMiddleName : ""
        } ${ref?.studentLastName}` ?? ref?.valid_full_name,
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
    const data = await json_to_excel_statistics_promote_query(
      excel_list,
    );

    res.status(200).send({
      message: "Explore Statistics Query",
      access: true,
      data: data
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
  return uniqueArray
}

exports.renderStudentFeesStatisticsQuery = async(req, res) => {
  try{
    const { fid } = req?.params
    if(!fid) 
    return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})
    const { module_type } = req?.query
    const { all_depart, activity_status, batch_status, master, batch, depart, bank, single_student } = req?.body
    var finance = await Finance.findById({ _id: fid})
    .populate({
      path: "deposit_linked_head",
      populate: {
        path: "master"
      }
    })
    .populate({
      path: "deposit_hostel_linked_head",
      populate: {
        path: "master"
      }
    })
    var all_fees = await Fees.find({ _id: { $in: finance?.fees}})
    // var all_master = await FeeMaster.find({ _id: { $in: finance?.fees}})
    var fee_price = 0
    for(var val of all_fees){
      fee_price += val?.feeAmount
    }
    var total_fees = 0
    var total_collect = 0
    var total_pending = 0
    var collect_by_student = 0
    var pending_by_student = 0
    var collect_by_government = 0
    var pending_from_government = 0
    var incomes = 0
    var expenses = 0
    var total_deposits = 0
    var excess_fees = 0
    var total_fees_arr = []
    var total_collect_arr = []
    var total_pending_arr = []
    var collect_by_student_arr = []
    var pending_by_student_arr = []
    var collect_by_government_arr = []
    var pending_from_government_arr = []
    var fees_to_be_collected_student_arr = []
    var fees_to_be_collected_government_arr = []
    var incomes_arr = []
    var expenses_arr = []
    var total_deposits_arr = []
    var excess_fees_arr = []
    var internal_fees = 0
    var internal_os_fees = 0
    var fees_to_be_collected_student = 0
    var fees_to_be_collected_government = 0

    if(module_type === "OVERALL_VIEW"){
      finance.loading_fees = new Date()
      finance.fees_statistics_filter.loading = true
      await finance.save()
      res.status(200).send({ message: "Explore Admission View Query", access: true, excel_list: excel_list, loading: finance?.fees_statistics_filter.loading})
      finance.total_fees = 0
      finance.total_collect = 0
      finance.total_pending = 0
      finance.collect_by_student = 0
      finance.pending_by_student = 0
      finance.collect_by_government = 0
      finance.pending_from_government = 0
      finance.fees_to_be_collected_student = 0
      finance.fees_to_be_collected_government = 0
      finance.incomes = 0
      finance.expenses = 0
      finance.total_deposits = 0
      finance.excess_fees = 0
      finance.internal_fees = 0
      finance.internal_os_fees = 0
      finance.total_fees_arr = []
      finance.total_collect_arr = []
      finance.total_pending_arr = []
      finance.collect_by_student_arr = []
      finance.pending_by_student_arr = []
      finance.collect_by_government_arr = []
      finance.pending_from_government_arr = []
      finance.fees_to_be_collected_student_arr = []
      finance.fees_to_be_collected_government_arr = []

      finance.fees_statistics_filter.batch_level = []
      finance.fees_statistics_filter.batch_all = ""
      finance.fees_statistics_filter.department_level = []
      finance.fees_statistics_filter.department_all = ""
      finance.fees_statistics_filter.bank_level = []
      finance.fees_statistics_filter.master_level = ""
      await finance.save()
      finance.incomes += finance?.financeIncomeCashBalance + finance?.financeIncomeBankBalance
      finance.expenses += finance?.financeExpenseCashBalance + finance?.financeExpenseBankBalance
      finance.total_deposits += finance?.deposit_linked_head?.master?.deposit_amount + finance?.deposit_hostel_linked_head?.master?.deposit_amount
      finance.excess_fees += finance?.deposit_linked_head?.master?.refund_amount + finance?.deposit_hostel_linked_head?.master?.refund_amount
      finance.internal_fees += fee_price
      if(all_depart === "ALL"){
        finance.fees_statistics_filter.department_all = "ALL"
        var departs = await Department.find({ institute: finance?.institute })
        .select("dName batches departmentClassMasters")
        for(var i = 0; i < departs?.length; i++){
          for(var j = 0; j < departs[i]?.batches?.length; j++){
            const one_batch = await Batch.findById({ _id: departs[i]?.batches[j]})
            var classes = await Class.find({ batch: one_batch?._id })
            .select("className classTitle masterClassName")
            for(var cls of classes){
              var all_student = await Student.find({ studentClass: cls?._id })
              for(var ref of all_student){
                var all_remain = await RemainingList.find({ student: ref?._id })
                .populate({
                  path: "fee_structure"
                })
                .populate({
                  path: "student",
                  select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO"
                })
                for(var ele of all_remain){
                  finance.total_fees += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount
                  finance.total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.total_pending += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.collect_by_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + ref?.studentPaidFeeCount
                  finance.pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0 + ref?.studentRemainingFeeCount
                  finance.collect_by_government += ele?.paid_by_government
                  finance.pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                  finance.fees_to_be_collected_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + (ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) + ref?.studentPaidFeeCount + ref?.studentRemainingFeeCount
                  finance.fees_to_be_collected_government += ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees              
                  finance.internal_os_fees += ref?.studentRemainingFeeCount
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
                    total_fees_arr.push(ele?.student)
                  }
                  if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_collect_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_pending_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.applicable_fees > 0){
                    collect_by_student_arr.push(ele?.student)
                  }
                  if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    pending_by_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government > 0){
                    collect_by_government_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    pending_from_government_arr.push(ele?.student)
                  }
                  if((ele?.fee_structure?.applicable_fees + ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    fees_to_be_collected_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    fees_to_be_collected_government_arr.push(ele?.student)
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr)
                finance.total_collect_arr = remove_duplicated(total_collect_arr)
                finance.total_pending_arr = remove_duplicated(total_pending_arr)
                finance.collect_by_student_arr = remove_duplicated(collect_by_student_arr)
                finance.pending_by_student_arr = remove_duplicated(pending_by_student_arr)
                finance.collect_by_government_arr = remove_duplicated(collect_by_government_arr)
                finance.pending_from_government_arr = remove_duplicated(pending_from_government_arr)
                finance.fees_to_be_collected_student_arr = remove_duplicated(fees_to_be_collected_student_arr)
                finance.fees_to_be_collected_government_arr = remove_duplicated(fees_to_be_collected_government_arr)
              }
            }
          }
        }
        await finance.save()
      }
      if(activity_status === "ACTIVE_BATCH"){
        finance.fees_statistics_filter.batch_all = "Active Batch"
        var departs = await Department.find({ institute: finance?.institute })
        .select("dName batches departmentClassMasters departmentSelectBatch")
        for(var i = 0; i < departs?.length; i++){
          if(departs[i]?.departmentSelectBatch){
          const one_batch = await Batch.findById({ _id: departs[i]?.departmentSelectBatch })
            var classes = await Class.find({ batch: one_batch?._id })
            .select("className classTitle masterClassName")
            for(var cls of classes){
              var all_student = await Student.find({ studentClass: cls?._id })
              for(var ref of all_student){
                var all_remain = await RemainingList.find({ student: ref?._id })
                .populate({
                  path: "fee_structure"
                })
                .populate({
                  path: "student",
                  select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO"
                })
                for(var ele of all_remain){
                  finance.total_fees += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount
                  finance.total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.total_pending += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.collect_by_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + ref?.studentPaidFeeCount
                  finance.pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0 + ref?.studentRemainingFeeCount
                  finance.collect_by_government += ele?.paid_by_government
                  finance.pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                  finance.fees_to_be_collected_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + (ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) + ref?.studentPaidFeeCount + ref?.studentRemainingFeeCount
                  finance.fees_to_be_collected_government += ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees              
                  finance.internal_os_fees += ref?.studentRemainingFeeCount
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
                    total_fees_arr.push(ele?.student)
                  }
                  if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_collect_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_pending_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.applicable_fees > 0){
                    collect_by_student_arr.push(ele?.student)
                  }
                  if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    pending_by_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government > 0){
                    collect_by_government_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    pending_from_government_arr.push(ele?.student)
                  }
                  if((ele?.fee_structure?.applicable_fees + ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    fees_to_be_collected_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    fees_to_be_collected_government_arr.push(ele?.student)
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr)
                finance.total_collect_arr = remove_duplicated(total_collect_arr)
                finance.total_pending_arr = remove_duplicated(total_pending_arr)
                finance.collect_by_student_arr = remove_duplicated(collect_by_student_arr)
                finance.pending_by_student_arr = remove_duplicated(pending_by_student_arr)
                finance.collect_by_government_arr = remove_duplicated(collect_by_government_arr)
                finance.pending_from_government_arr = remove_duplicated(pending_from_government_arr)
                finance.fees_to_be_collected_student_arr = remove_duplicated(fees_to_be_collected_student_arr)
                finance.fees_to_be_collected_government_arr = remove_duplicated(fees_to_be_collected_government_arr)
              }
            }
          }
        }
        await finance.save()
      }
      if(activity_status === "ALL_BATCH"){
        finance.fees_statistics_filter.department_all = "All Batch"
        var departs = await Department.find({ institute: finance?.institute })
        .select("dName batches departmentClassMasters")
        for(var i = 0; i < departs?.length; i++){
          for(var j = 0; j < departs[i]?.batches?.length; j++){
            const one_batch = await Batch.findById({ _id: departs[i]?.batches[j]})
            var classes = await Class.find({ batch: one_batch?._id })
            .select("className classTitle masterClassName")
            for(var cls of classes){
              var all_student = await Student.find({ studentClass: cls?._id })
              for(var ref of all_student){
                var all_remain = await RemainingList.find({ student: ref?._id })
                .populate({
                  path: "fee_structure"
                })
                .populate({
                  path: "student",
                  select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO"
                })
                for(var ele of all_remain){
                  finance.total_fees += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount
                  finance.total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.total_pending += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.collect_by_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + ref?.studentPaidFeeCount
                  finance.pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0 + ref?.studentRemainingFeeCount
                  finance.collect_by_government += ele?.paid_by_government
                  finance.pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                  finance.fees_to_be_collected_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + (ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) + ref?.studentPaidFeeCount + ref?.studentRemainingFeeCount
                  finance.fees_to_be_collected_government += ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees              
                  finance.internal_os_fees += ref?.studentRemainingFeeCount
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
                    total_fees_arr.push(ele?.student)
                  }
                  if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_collect_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_pending_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.applicable_fees > 0){
                    collect_by_student_arr.push(ele?.student)
                  }
                  if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    pending_by_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government > 0){
                    collect_by_government_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    pending_from_government_arr.push(ele?.student)
                  }
                  if((ele?.fee_structure?.applicable_fees + ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    fees_to_be_collected_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    fees_to_be_collected_government_arr.push(ele?.student)
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr)
                finance.total_collect_arr = remove_duplicated(total_collect_arr)
                finance.total_pending_arr = remove_duplicated(total_pending_arr)
                finance.collect_by_student_arr = remove_duplicated(collect_by_student_arr)
                finance.pending_by_student_arr = remove_duplicated(pending_by_student_arr)
                finance.collect_by_government_arr = remove_duplicated(collect_by_government_arr)
                finance.pending_from_government_arr = remove_duplicated(pending_from_government_arr)
                finance.fees_to_be_collected_student_arr = remove_duplicated(fees_to_be_collected_student_arr)
                finance.fees_to_be_collected_government_arr = remove_duplicated(fees_to_be_collected_government_arr)
              }
            }
          }
        }
        await finance.save()
      }
      if(all_depart === "PARTICULAR"){
        finance.fees_statistics_filter.department_level.push(depart)
        finance.fees_statistics_filter.batch_all = "All Batch"
        var departs = await Department.findById({ _id: depart })
        .select("dName batches departmentClassMasters")
        if(batch_status === "ALL_BATCH"){
          const one_batch = await Batch.findById({ department: departs?._id })
          for(var ref of one_batch){
          var classes = await Class.find({ batch: ref })
          .select("className classTitle masterClassName")
          for(var cls of classes){
            var all_student = await Student.find({ studentClass: cls?._id })
            for(var ref of all_student){
              var all_remain = await RemainingList.find({ student: ref?._id })
              .populate({
                path: "fee_structure"
              })
              .populate({
                path: "student",
                select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO"
              })
              for(var ele of all_remain){
                finance.total_fees += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount
                  finance.total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.total_pending += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.collect_by_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + ref?.studentPaidFeeCount
                  finance.pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0 + ref?.studentRemainingFeeCount
                  finance.collect_by_government += ele?.paid_by_government
                  finance.pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                  finance.fees_to_be_collected_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + (ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) + ref?.studentPaidFeeCount + ref?.studentRemainingFeeCount
                  finance.fees_to_be_collected_government += ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees              
                  finance.internal_os_fees += ref?.studentRemainingFeeCount
                if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
                  total_fees_arr.push(ele?.student)
                }
                if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                  total_collect_arr.push(ele?.student)
                }
                if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                  total_pending_arr.push(ele?.student)
                }
                if(ele?.fee_structure?.applicable_fees > 0){
                  collect_by_student_arr.push(ele?.student)
                }
                if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                  pending_by_student_arr.push(ele?.student)
                }
                if(ele?.paid_by_government > 0){
                  collect_by_government_arr.push(ele?.student)
                }
                if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                  pending_from_government_arr.push(ele?.student)
                }
                if((ele?.fee_structure?.applicable_fees + ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                  fees_to_be_collected_student_arr.push(ele?.student)
                }
                if(ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                  fees_to_be_collected_government_arr.push(ele?.student)
                }
              }
              finance.total_fees_arr = remove_duplicated(total_fees_arr)
              finance.total_collect_arr = remove_duplicated(total_collect_arr)
              finance.total_pending_arr = remove_duplicated(total_pending_arr)
              finance.collect_by_student_arr = remove_duplicated(collect_by_student_arr)
              finance.pending_by_student_arr = remove_duplicated(pending_by_student_arr)
              finance.collect_by_government_arr = remove_duplicated(collect_by_government_arr)
              finance.pending_from_government_arr = remove_duplicated(pending_from_government_arr)
              finance.fees_to_be_collected_student_arr = remove_duplicated(fees_to_be_collected_student_arr)
              finance.fees_to_be_collected_government_arr = remove_duplicated(fees_to_be_collected_government_arr)
            }
          }
        }
        }
        else if(batch_status === "PARTICULAR_BATCH"){
          finance.fees_statistics_filter.batch_level.push(batch)
          const one_batch = await Batch.findById({ _id: batch })
            var classes = await Class.find({ batch: one_batch?._id })
            .select("className classTitle masterClassName")
            for(var cls of classes){
              var all_student = await Student.find({ studentClass: cls?._id })
              for(var ref of all_student){
                var all_remain = await RemainingList.find({ student: ref?._id })
                .populate({
                  path: "fee_structure"
                })
                .populate({
                  path: "student",
                  select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO"
                })
                for(var ele of all_remain){
                  finance.total_fees += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount
                  finance.total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.total_pending += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.collect_by_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + ref?.studentPaidFeeCount
                  finance.pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0 + ref?.studentRemainingFeeCount
                  finance.collect_by_government += ele?.paid_by_government
                  finance.pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                  finance.fees_to_be_collected_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + (ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) + ref?.studentPaidFeeCount + ref?.studentRemainingFeeCount
                  finance.fees_to_be_collected_government += ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees              
                  finance.internal_os_fees += ref?.studentRemainingFeeCount
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
                    total_fees_arr.push(ele?.student)
                  }
                  if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_collect_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_pending_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.applicable_fees > 0){
                    collect_by_student_arr.push(ele?.student)
                  }
                  if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    pending_by_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government > 0){
                    collect_by_government_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    pending_from_government_arr.push(ele?.student)
                  }
                  if((ele?.fee_structure?.applicable_fees + ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    fees_to_be_collected_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    fees_to_be_collected_government_arr.push(ele?.student)
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr)
                finance.total_collect_arr = remove_duplicated(total_collect_arr)
                finance.total_pending_arr = remove_duplicated(total_pending_arr)
                finance.collect_by_student_arr = remove_duplicated(collect_by_student_arr)
                finance.pending_by_student_arr = remove_duplicated(pending_by_student_arr)
                finance.collect_by_government_arr = remove_duplicated(collect_by_government_arr)
                finance.pending_from_government_arr = remove_duplicated(pending_from_government_arr)
                finance.fees_to_be_collected_student_arr = remove_duplicated(fees_to_be_collected_student_arr)
                finance.fees_to_be_collected_government_arr = remove_duplicated(fees_to_be_collected_government_arr)
              }
            }
        }
        await finance.save()
      }
      if(bank){
        finance.fees_statistics_filter.bank_level.push(bank)
        var departs = await Department.find({ bank_account: bank })
        .select("dName batches departmentClassMasters")
        for(var i = 0; i < departs?.length; i++){
          for(var j = 0; j < departs[i]?.batches?.length; j++){
            const one_batch = await Batch.findById({ _id: departs[i]?.batches[j]})
            var classes = await Class.find({ batch: one_batch?._id })
            .select("className classTitle masterClassName")
            for(var cls of classes){
              var all_student = await Student.find({ studentClass: cls?._id })
              for(var ref of all_student){
                var all_remain = await RemainingList.find({ student: ref?._id })
                .populate({
                  path: "fee_structure"
                })
                .populate({
                  path: "student",
                  select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO"
                })
                for(var ele of all_remain){
                  finance.total_fees += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount
                  finance.total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.total_pending += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  finance.collect_by_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + ref?.studentPaidFeeCount
                  finance.pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0 + ref?.studentRemainingFeeCount
                  finance.collect_by_government += ele?.paid_by_government
                  finance.pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                  finance.fees_to_be_collected_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee) + (ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) + ref?.studentPaidFeeCount + ref?.studentRemainingFeeCount
                  finance.fees_to_be_collected_government += ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees              
                  finance.internal_os_fees += ref?.studentRemainingFeeCount
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
                    total_fees_arr.push(ele?.student)
                  }
                  if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_collect_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_pending_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.applicable_fees > 0){
                    collect_by_student_arr.push(ele?.student)
                  }
                  if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    pending_by_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government > 0){
                    collect_by_government_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    pending_from_government_arr.push(ele?.student)
                  }
                  if((ele?.fee_structure?.applicable_fees + ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    fees_to_be_collected_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government + ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    fees_to_be_collected_government_arr.push(ele?.student)
                  }
                }
                finance.total_fees_arr = remove_duplicated(total_fees_arr)
                finance.total_collect_arr = remove_duplicated(total_collect_arr)
                finance.total_pending_arr = remove_duplicated(total_pending_arr)
                finance.collect_by_student_arr = remove_duplicated(collect_by_student_arr)
                finance.pending_by_student_arr = remove_duplicated(pending_by_student_arr)
                finance.collect_by_government_arr = remove_duplicated(collect_by_government_arr)
                finance.pending_from_government_arr = remove_duplicated(pending_from_government_arr)
                finance.fees_to_be_collected_student_arr = remove_duplicated(fees_to_be_collected_student_arr)
                finance.fees_to_be_collected_government_arr = remove_duplicated(fees_to_be_collected_government_arr)
              }
            }
          }
        }
        await finance.save()
      }
      finance.fees_statistics_filter.loading = false
      await finance.save()
    }
    else if (module_type === "ADMISSION_VIEW"){
      var total_fees = 0
      var total_collect = 0
      var total_pending = 0
      var collect_by_student = 0
      var pending_by_student = 0
      var collect_by_government = 0
      var pending_from_government = 0
      var total_fees_arr = []
      var total_collect_arr = []
      var total_pending_arr = []
      var collect_by_student_arr = []
      var pending_by_student_arr = []
      var collect_by_government_arr = []
      var pending_from_government_arr = []
      var excess_fee = 0
      var excess_fee_arr = []
      var exempted_fee = 0
      var exempted_fee_arr = []
      var excel_list = []
      finance.admission_fees_statistics_filter.batch_level = []
      finance.admission_fees_statistics_filter.batch_all = ""
      finance.admission_fees_statistics_filter.department_level = []
      finance.admission_fees_statistics_filter.department_all = ""
      finance.admission_fees_statistics_filter.bank_level = []
      finance.admission_fees_statistics_filter.master_level = ""
      await finance.save()
      if(all_depart === "ALL"){
        finance.loading_admission_fees = new Date()
        finance.admission_fees_statistics_filter.loading = true
        await finance.save()
        var new_departs = []
        res.status(200).send({ message: "Explore Admission View All Query", access: true, loading: true})
        var departs = await Department.find({ institute: finance?.institute })
        .select("dName batches departmentClassMasters")
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
            const { dp, dName, batch_query, master_query, nest_classes } = departs[i];
            // var nest_obj = Object.assign({}, [...nest_classes])
            obj[dp] = {
              dName: dName,
              batches: batch_query,
              masters: master_query,
              nest_classes
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
        var nest_classes = []
        for(var i = 0; i < departs?.length; i++){
          var batch_query = []
          for(var j = 0; j < departs[i]?.batches?.length; j++){
            var obs = {}
            const one_batch = await Batch.findById({ _id: departs[i]?.batches[j]})
            if(one_batch?._id){
            batch_query.push({
              batchName: one_batch?.batchName,
              _id: one_batch?._id
            })
          }
            var classes = await Class.find({ batch: one_batch?._id })
            .select("className classTitle masterClassName")
            var custom_classes = []
            for(var cls of classes){
              var all_student = await Student.find({ studentClass: cls?._id })
              for(var ref of all_student){
                var all_remain = await RemainingList.find({ student: ref?._id })
                .populate({
                  path: "fee_structure"
                })
                .populate({
                  path: "student",
                  select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO total_paid_fees total_os_fees applicable_os_fees government_os_fees"
                })
                for(var ele of all_remain){
                  total_fees += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount
                  total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  total_pending += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  collect_by_student += ele?.fee_structure?.applicable_fees
                  pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0
                  collect_by_government += ele?.paid_by_government
                  pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                  ele.student.total_paid_fees += ele?.paid_fee
                  ele.student.total_os_fees += ele?.remaining_fee
                  ele.student.applicable_os_fees += ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
                  ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                  : 0
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
                    total_fees_arr.push(ele?.student)
                  }
                  if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_collect_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_pending_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.applicable_fees > 0){
                    collect_by_student_arr.push(ele?.student)
                  }
                  if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    pending_by_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government > 0){
                    collect_by_government_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    pending_from_government_arr.push(ele?.student)
                  }
                }
                total_fees_arr = remove_duplicated(total_fees_arr)
                total_collect_arr = remove_duplicated(total_collect_arr)
                total_pending_arr = remove_duplicated(total_pending_arr)
                collect_by_student_arr = remove_duplicated(collect_by_student_arr)
                pending_by_student_arr = remove_duplicated(pending_by_student_arr)
                collect_by_government_arr = remove_duplicated(collect_by_government_arr)
                pending_from_government_arr = remove_duplicated(pending_from_government_arr)
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
              })
            }
            obs[one_batch?._id] = {
              classes: custom_classes
            }
            nest_classes.push({...obs})
          }
          var master_query = []
          for(var j = 0; j < departs[i]?.departmentClassMasters?.length; j++){
            const one_master = await ClassMaster.findById({ _id: departs[i]?.departmentClassMasters[j]})
            if(one_master?._id){
            master_query.push({
              masterName: one_master?.className,
              _id: one_master?._id
            })
          }
          }
          new_departs.push({
            dName: departs[i]?.dName,
            dp: `dp${i+1}`,
            batch_query: [...batch_query],
            master_query: [...master_query],
            nest_classes: [...nest_classes]
          })
        }
        // console.log(nest_classes)
        var result = await buildStructureObject(new_departs);
        var new_dep_excel = [{...result}]
        var result_1 = await buildStructureObject_1(new_departs);
          excel_list.push({
            depart_row: true,
            batch_row: true,
            master_row: true,
            class_row: true,
            departs: new_dep_excel,
            ...result_1
          })
          finance.admission_fees_statistics_filter.department_all = "All"
        finance.admission_stats = excel_list
        await finance.save()
      }
      if(all_depart === "PARTICULAR"){
          finance.loading_admission_fees = new Date()
          finance.admission_fees_statistics_filter.loading = true
          await finance.save()
          var new_departs = []
          res.status(200).send({ message: "Explore Admission View Particular Batch Query", access: true, loading: true})
          var departs = await Department.find({ institute: finance?.institute })
          .select("dName batches departmentClassMasters")

          departs = departs?.filter((val) => {
            if(`${val?._id}` === `${depart}`) return val
          })
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
              const { dp, dName, batch_query, master_query, nest_classes } = departs[i];
              // var nest_obj = Object.assign({}, [...nest_classes])
              obj[dp] = {
                dName: dName,
                batches: batch_query,
                masters: master_query,
                nest_classes
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
          var nest_classes = []
          for(var i = 0; i < departs?.length; i++){
            var batch_query = []
            var obs = {}
              const one_batch = await Batch.findById({ _id: batch})
              if(one_batch?._id){
              batch_query.push({
                batchName: one_batch?.batchName,
                _id: one_batch?._id
              })
              var classes = await Class.find({ batch: one_batch?._id })
              .select("className classTitle masterClassName ApproveStudent")
              var custom_classes = []
              for(var cls of classes){
                var all_student = await Student.find({ $and: [{ _id: { $in: cls?.ApproveStudent} }]})
                var structure = await FeeStructure.find({ $and: [{ department: depart}, { batch_master: batch}] })
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
                  for(var ref of all_student){
                    var all_remain = await RemainingList.find({  $and: [{ student: ref?._id}, { fee_structure: { $in: structure }}]})
                    .populate({
                      path: "fee_structure"
                    })
                    .populate({
                      path: "student",
                      select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO total_paid_fees total_os_fees applicable_os_fees government_os_fees"
                    })
                    // var all_remain = await RemainingList.find({ student: ref?._id })
                    console.log(all_remain?.length)
                    for(var ele of all_remain){
                      total_fees += ele?.fee_structure?.total_admission_fees
                    total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                    total_pending += ele?.fee_structure?.total_admission_fees - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                    collect_by_student += (ele?.paid_fee >= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees : ele?.paid_fee)
                    pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0
                    collect_by_government += ele?.paid_by_government
                    pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                      ele.student.total_paid_fees += ele?.paid_fee
                    ele.student.total_os_fees += ele?.remaining_fee
                    ele.student.applicable_os_fees += ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
                    ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                    : 0
                    ele.student.government_os_fees += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                    excess_fee += ele?.paid_fee > ele?.fee_structure?.applicable_fees ? ele?.paid_fee - ele?.fee_structure?.applicable_fees : 0
                    exempted_fee += ele?.exempted_fee
                    if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
                      total_fees_arr.push(ele?.student)
                    }
                    if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                      total_collect_arr.push(ele?.student)
                    }
                    if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                      total_pending_arr.push(ele?.student)
                    }
                    if(ele?.fee_structure?.applicable_fees > 0){
                      collect_by_student_arr.push(ele?.student)
                    }
                    if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                      pending_by_student_arr.push(ele?.student)
                    }
                    if(ele?.paid_by_government > 0){
                      collect_by_government_arr.push(ele?.student)
                    }
                    if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                      pending_from_government_arr.push(ele?.student)
                    }
                    if((ele?.paid_fee > ele?.fee_structure?.applicable_fees ? ele?.paid_fee - ele?.fee_structure?.applicable_fees : 0) >= 0){
                      excess_fee_arr.push(ele?.student)
                    }
                    if(ele?.exempted_fee){
                      exempted_fee_arr.push(ele?.student)
                    }
                    }
                    total_fees_arr = remove_duplicated(total_fees_arr)
                    total_collect_arr = remove_duplicated(total_collect_arr)
                    total_pending_arr = remove_duplicated(total_pending_arr)
                    collect_by_student_arr = remove_duplicated(collect_by_student_arr)
                    pending_by_student_arr = remove_duplicated(pending_by_student_arr)
                    collect_by_government_arr = remove_duplicated(collect_by_government_arr)
                    pending_from_government_arr = remove_duplicated(pending_from_government_arr)
                    excess_fee_arr = remove_duplicated(excess_fee_arr)
                    exempted_fee_arr = remove_duplicated(exempted_fee_arr)
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
                  exempted_fee: exempted_fee
                })
                console.log("Enter")
                total_fees = 0
                total_collect = 0
                total_pending = 0
                collect_by_student = 0
                pending_by_student = 0
                collect_by_government = 0
                pending_from_government = 0
                excess_fee = 0
                exempted_fee = 0
                total_fees_arr = []
                total_collect_arr = []
                total_pending_arr = []
                collect_by_student_arr = []
                pending_by_student_arr = []
                collect_by_government_arr = []
                pending_from_government_arr = []
                excess_fee_arr = []
                exempted_fee_arr = []
                console.log("Exit")
              }
              obs[one_batch?._id] = {
                classes: custom_classes
              }
              nest_classes.push({...obs})
            }
            var master_query = []
            for(var j = 0; j < departs[i]?.departmentClassMasters?.length; j++){
              const one_master = await ClassMaster.findById({ _id: departs[i]?.departmentClassMasters[j]})
              if(one_master?._id){
              master_query.push({
                masterName: one_master?.className,
                _id: one_master?._id
              })
            }
            }
            new_departs.push({
              dName: departs[i]?.dName,
              dp: `dp${i+1}`,
              batch_query: [...batch_query],
              master_query: [...master_query],
              nest_classes: [...nest_classes]
            })
          }
          // console.log(nest_classes)
          var result = await buildStructureObject(new_departs);
          var new_dep_excel = [{...result}]
          var result_1 = await buildStructureObject_1(new_departs);
            excel_list.push({
              depart_row: true,
              batch_row: true,
              master_row: true,
              class_row: true,
              departs: new_dep_excel,
              ...result_1
            })
            finance.admission_fees_statistics_filter.department_level.push(depart)
            finance.admission_fees_statistics_filter.batch_level.push(batch)
            // finance.admission_fees_statistics_filter.master_level.push()
          finance.admission_stats = excel_list
          await finance.save()
      }
      if(bank){
        finance.admission_fees_statistics_filter.bank_level.push(bank)
        finance.loading_admission_fees = new Date()
        finance.admission_fees_statistics_filter.loading = true
        await finance.save()
        var new_departs = []
        res.status(200).send({ message: "Explore Admission View Bank Query", access: true, loading: true})
        var departs = await Department.find({ bank_account: bank })
        var departs = await Department.find({ institute: finance?.institute })
        .select("dName batches departmentClassMasters")
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
            const { dp, dName, batch_query, master_query, nest_classes } = departs[i];
            // var nest_obj = Object.assign({}, [...nest_classes])
            obj[dp] = {
              dName: dName,
              batches: batch_query,
              masters: master_query,
              nest_classes
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
        var nest_classes = []
        for(var i = 0; i < departs?.length; i++){
          var batch_query = []
          for(var j = 0; j < departs[i]?.batches?.length; j++){
            var obs = {}
            const one_batch = await Batch.findById({ _id: departs[i]?.batches[j]})
            if(one_batch?._id){
            batch_query.push({
              batchName: one_batch?.batchName,
              _id: one_batch?._id
            })
          }
            var classes = await Class.find({ batch: one_batch?._id })
            .select("className classTitle masterClassName")
            var custom_classes = []
            for(var cls of classes){
              var all_student = await Student.find({ studentClass: cls?._id })
              for(var ref of all_student){
                var all_remain = await RemainingList.find({ student: ref?._id })
                .populate({
                  path: "fee_structure"
                })
                .populate({
                  path: "student",
                  select: "studentFirstName studentMiddleName studentLastName studentGender studentProfilePhoto valid_full_name photoId studentGRNO studentROLLNO total_paid_fees total_os_fees applicable_os_fees government_os_fees"
                })
                for(var ele of all_remain){
                  total_fees += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount
                  total_collect += ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  total_pending += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government
                  collect_by_student += ele?.fee_structure?.applicable_fees
                  pending_by_student += ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0
                  collect_by_government += ele?.paid_by_government
                  pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
                  ele.student.total_paid_fees += ele?.paid_fee
                  ele.student.total_os_fees += ele?.remaining_fee
                  ele.student.applicable_os_fees += ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
                  ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
                  : 0
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount > 0){
                    total_fees_arr.push(ele?.student)
                  }
                  if(ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_collect_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount - ele?.paid_fee + ref?.studentPaidFeeCount + ele?.paid_by_government > 0){
                    total_pending_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.applicable_fees > 0){
                    collect_by_student_arr.push(ele?.student)
                  }
                  if((ele?.paid_fee <= ele?.fee_structure?.applicable_fees ? ele?.fee_structure?.applicable_fees - ele?.paid_fee : 0) > 0){
                    pending_by_student_arr.push(ele?.student)
                  }
                  if(ele?.paid_by_government > 0){
                    collect_by_government_arr.push(ele?.student)
                  }
                  if(ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees > 0){
                    pending_from_government_arr.push(ele?.student)
                  }
                }
                total_fees_arr = remove_duplicated(total_fees_arr)
                total_collect_arr = remove_duplicated(total_collect_arr)
                total_pending_arr = remove_duplicated(total_pending_arr)
                collect_by_student_arr = remove_duplicated(collect_by_student_arr)
                pending_by_student_arr = remove_duplicated(pending_by_student_arr)
                collect_by_government_arr = remove_duplicated(collect_by_government_arr)
                pending_from_government_arr = remove_duplicated(pending_from_government_arr)
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
              })
            }
            obs[one_batch?._id] = {
              classes: custom_classes
            }
            nest_classes.push({...obs})
          }
          var master_query = []
          for(var j = 0; j < departs[i]?.departmentClassMasters?.length; j++){
            const one_master = await ClassMaster.findById({ _id: departs[i]?.departmentClassMasters[j]})
            if(one_master?._id){
            master_query.push({
              masterName: one_master?.className,
              _id: one_master?._id
            })
          }
          }
          new_departs.push({
            dName: departs[i]?.dName,
            dp: `dp${i+1}`,
            batch_query: [...batch_query],
            master_query: [...master_query],
            nest_classes: [...nest_classes]
          })
        }
        // console.log(nest_classes)
        var result = await buildStructureObject(new_departs);
        var new_dep_excel = [{...result}]
        var result_1 = await buildStructureObject_1(new_departs);
          excel_list.push({
            depart_row: true,
            batch_row: true,
            master_row: true,
            class_row: true,
            departs: new_dep_excel,
            ...result_1
          })
          // finance.admission_fees_statistics_filter.bank_level.push(bank)
        finance.admission_stats = excel_list
        await finance.save()
      }
      finance.admission_fees_statistics_filter.loading = false
      await finance.save()

    }
    else{
      res.status(200).send({ message: "Invalid Flow / Module Type Query"})
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.renderOverallStudentFeesStatisticsQuery = async(req, res) => {
  try{
    const { fid } = req?.params
    if(!fid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})
    const one_finance = await Finance.findById({ _id: fid })
    .populate({
      path: "deposit_linked_head"
    })
    .populate({
      path: "deposit_hostel_linked_head"
    })
    one_finance.fees_statistics_filter.loading = false
    await one_finance.save()
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
      fees_to_be_collected_government: one_finance?.fees_to_be_collected_government,
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
      fees_to_be_collected_student_arr: one_finance?.fees_to_be_collected_student_arr,
      fees_to_be_collected_government_arr: one_finance?.fees_to_be_collected_government_arr,
    }

    const fetch_encrypt = await encryptionPayload(fetch_obj)
    res.status(200).send({ 
      encrypt: fetch_encrypt,
      fetch_obj
    })
  }
  catch(e){
    console.log(e)
  }
}

exports.renderOverallStudentAdmissionFeesStatisticsQuery = async(req, res) => {
  try{
    const { fid } = req?.params
    if(!fid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})
    const one_finance = await Finance.findById({ _id: fid })
    one_finance.admission_fees_statistics_filter.loading = false
    await one_finance.save()
    const fetch_obj = {
      message: "Refetched Overall Data For Finance Master Query", 
      access: true,
      excel_list: one_finance?.admission_stats,
      last_update: one_finance?.loading_admission_fees,
      loading_status: one_finance?.admission_fees_statistics_filter?.loading,
      fees_statistics_filter: one_finance?.admission_fees_statistics_filter,
    }

    const fetch_encrypt = await encryptionPayload(fetch_obj)
    res.status(200).send({ 
      encrypt: fetch_encrypt,
      fetch_obj
    })
  }
  catch(e){
    console.log(e)
  }
}
exports.renderFinanceScholarTransactionHistoryQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      timeline,
      timeline_content,
      from,
      to
    } = req.query;

    var total_fees = 0
    var total_collect = 0
    var total_pending = 0
    var collect_by_student = 0
    var pending_by_student = 0
    var collect_by_government = 0
    var pending_from_government = 0
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
          path: "fee_receipt"
        })
        .populate({
          path: "payment_student",
          select: "studentFirstName studentMiddleName studentLastName valid_full_name studentGender"
        })
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
          path: "fee_receipt"
        })
        .populate({
          path: "payment_student",
          select: "studentFirstName studentMiddleName studentLastName valid_full_name studentGender"
        })
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
        if(val?.fee_receipt?.fee_payment_mode === "Government/Scholarship") return val
      })
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
          var qvipleId = await QvipleId.findOne({ user: user?._id })
        }
        const all_remain = await RemainingList.find({ student: `${ref?.payment_student?._id}`})
        .populate({
          path: "fee_structure"
        })
        for(var ele of all_remain){
          total_fees += ele?.fee_structure?.total_admission_fees + ref?.studentRemainingFeeCount
          total_collect += ele?.paid_fee + ref?.studentPaidFeeCount
          total_pending += ele?.remaining_fee + ref?.studentRemainingFeeCount
          collect_by_student += ele?.paid_by_student
          pending_by_student += ele?.admissionRemainFeeCount ?? 0
          collect_by_government += ele?.paid_by_government
          pending_from_government += ele?.fee_structure?.total_admission_fees - ele?.fee_structure?.applicable_fees
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
          OutStandingFromGovernment: pending_from_government
        });
      }
      await scholar_transaction_json_to_excel_query(trans_list, "Scholarship", timeline, id);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderClassStudentQuery = async(req, res) => {
  try{
    const { cid } = req?.params
    const { gr } = req?.body
    if(!cid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})
    
    var classes = await Class.findById({ _id: cid })
    for(var val of gr){
      const all_stu = await Student.findOne({ studentGRNO: `${val}`})
      classes.ApproveStudent.push(all_stu?._id)
    }
    await classes.save()
    res.status(200).send({ message: "Explore All Student Query"})
  }
  catch(e){
    console.log(e)
  }
}

exports.renderInternalFeeHeadsStructureReceiptQuery = async (req, res) => {
  try {
    const { fid } = req.params;
    const {
      timeline,
      timeline_content,
      from,
      to,
    } = req.query;
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
            Gender: ref?.student?.studentGender ?? "#NA",
            Class:
              `${ref?.student?.studentClass?.className}` ?? "#NA",
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
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGRNO studentROLLNO studentGender",
          },
        });
        res.status(200).send({
          message: "Explore Excess Fees Query",
          access: true,
        });
      for (let data of ads_admin?.refundFeeList) {
        if (data.student !== null) {
          filter_refund.push(data);
        }
      }
      var all_refund_list = [...filter_refund];
      var filtered = all_refund_list?.filter((ref) => {
        if (ref?.refund > 0) return ref;
      });
    var excel_list = [];
    filtered.sort(function (st1, st2) {
      return (
        parseInt(st1?.student?.studentROLLNO) -
        parseInt(st2?.student?.studentROLLNO)
      );
    });
    if(filtered?.length > 0){
      for (var val of filtered) {
          excel_list.push({
            RollNo: val?.student?.studentROLLNO ?? "NA",
            GRNO: val?.student?.studentGRNO ?? "#NA",
            Name: `${val?.student?.studentFirstName} ${
              val?.student?.studentMiddleName ? val?.student?.studentMiddleName : ""
            } ${val?.student?.studentLastName}` ?? val?.student?.valid_full_name,
            Gender: val?.student?.studentGender ?? "#NA",
            ExcessFees: val?.refund ?? 0
          });
        }
        const data = await excess_refund_fees_json_query(
          excel_list,
          "Excess Fees",
          aid,
          "Excess Fees List"
        );
    }
    else{
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
    if(all_refund_list?.length > 0){
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
            Name: `${val?.student?.studentFirstName} ${
              val?.student?.studentMiddleName ? val?.student?.studentMiddleName : ""
            } ${val?.student?.studentLastName}` ?? val?.student?.valid_full_name,
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
            FeeMode: val?.fee_receipt?.fee_payment_mode
          });
        }
        // console.log(excel_list)
        const data = await excess_refund_fees_json_query(
          excel_list,
          "Refunded Fees",
          aid,
          "Refunded Fees List"
        );
    }
    else{
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
    var student_arr = []
    var apply = await NewApplication.findById({ _id: aid }).select(
      "reviewApplication"
    );

    if (sort_query === "Alpha") {
      const sortedA = await review_sort_student_by_alpha(
        apply?.reviewApplication,
      );
      apply.reviewApplication = [...sortedA]
      await apply.save()
      res.status(200).send({
        message: "Sorted By Alphabetical Order",
        students: sortedA,
        access: true,
      });
    } else if (sort_query === "Gender") {
      const sortedG = await review_sorted_by_gender(
        apply?.reviewApplication
      );
      apply.reviewApplication = [...sortedG]
      await apply.save()
      res.status(200).send({
        message: "Sorted By Gender Order",
        students: sortedG,
        access: true,
      });
    } else if (sort_query === "Gender_Alpha") {
      const sortedGA = await review_sorted_by_both_gender_and_aplha(
        apply?.reviewApplication
      );
      apply.reviewApplication = [...sortedGA]
      await apply.save()
      res.status(200).send({
        message: "Sorted By Gender & Alpha Order",
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
