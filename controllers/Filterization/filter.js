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
const {
  json_to_excel_query,
  transaction_json_to_excel_query,
  fee_heads_json_to_excel_query,
  fee_heads_receipt_json_to_excel_query,
} = require("../../Custom/JSONToExcel");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const {
  custom_date_time_reverse,
  custom_year_reverse,
  custom_month_reverse,
} = require("../../helper/dayTimer");
const moment = require("moment");
const FeeStructure = require("../../models/Finance/FeesStructure");

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

    if (all_depart === "All") {
      var sorted_batch = [];
      const institute = await InstituteAdmin.findById({
        _id: `${ads_admin?.institute}`,
      }).select("depart");

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
            "structure_name unique_structure_name category_master total_admission_fees one_installments applicable_fees",
          populate: {
            path: "category_master",
            select: "category_name",
          },
        },
      });
    valid_all_students.sort(function (st1, st2) {
      return (
        parseInt(st1?.studentGRNO?.slice(1)) -
        parseInt(st2?.studentGRNO?.slice(1))
      );
    });
    const buildObject = async (arr) => {
      const obj = {};
      for (let i = 0; i < arr.length; i++) {
        const { amount, price, paymode, mode } = arr[i];
        obj[amount] = price;
        obj[paymode] = mode;
      }
      return obj;
    };
    var excel_list = [];
    var remain_array = [];
    for (var ref of valid_all_students) {
      for (var val of ref?.remainingFeeList) {
        for (var num of val?.remaining_array) {
          var i = 0;
          if (num.status === "Paid") {
            remain_array.push({
              amount: `${i + 1}-Payment`,
              price: num?.remainAmount,
              paymode: `${i + 1}-Mode`,
              mode: num?.mode,
            });
          }
          i = val?.remaining_array?.length - i + 1;
        }
        var result = await buildObject(remain_array);

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
          Class:
            `${ref?.studentClass?.className}-${ref?.studentClass.classTitle}` ??
            "#NA",
          Batch: `${val?.batchId?.batchName}` ?? "#NA",
          ActualFees: `${val?.fee_structure?.total_admission_fees}` ?? "0",
          ApplicableFees: `${val?.applicable_fee}` ?? "0",
          RemainingFees: `${val?.remaining_fee}` ?? "0",
          ApplicationName: `${val?.appId?.applicationName}` ?? "#NA",
          TotalPaidFees: `${val?.paid_fee}` ?? "0",
          FeeStructure:
            `${val?.fee_structure?.category_master?.category_name}` ?? "#NA",
          ...result,
          Address: `${ref?.studentAddress}` ?? "#NA",
        });
        remain_array = [];
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
    if (fsid && depart) {
      var all_students = await Student.find({
        $and: [{ institute: institute?._id }, { studentStatus: "Approved" }],
        $or: [
          {
            fee_structure: fsid,
          },
          {
            department: depart,
          },
        ],
      }).select("_id fee_receipt");
    } else {
      var all_students = await Student.find({
        $and: [{ institute: institute?._id }, { studentStatus: "Approved" }],
      }).select("_id fee_receipt");
    }
    for (var ref of all_students) {
      sorted_array.push(ref?._id);
    }
    if (valid_timeline) {
      const g_date = new Date(`${g_year}-${g_month}-01T00:00:00.000Z`);
      const l_date = new Date(`${l_year}-${l_month}-01T00:00:00.000Z`);
      var all_receipts = await FeeReceipt.find({
        $and: [
          { student: { $in: sorted_array } },
          { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
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
          { student: { $in: sorted_array } },
          // { fee_flow: "FEE_HEADS" },
          {
            created_at: {
              $gte: g_date,
              $lt: l_date,
            },
          },
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
    }
    if (all_receipts?.length > 0) {
      res.status(200).send({
        message: "Explore Fee Receipt Heads Structure Query",
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
      for (var ref of all_receipts) {
        var remain_list = await RemainingList.findOne({
          $and: [{ student: ref?.student }, { appId: ref?.application }],
        })
          .populate({
            path: "fee_structure",
            select: "applicable_fees total_admission_fees class_master batch_master unique_structure_name",
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
        if(ref?.fee_heads?.length > 0){
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
        if(ref?.fee_heads?.length > 0){
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
            TotalFees: remain_list?.fee_structure?.total_admission_fees ?? "0",
            ApplicableFees: remain_list?.fee_structure?.applicable_fees ?? "0",
            TotalPaidFees: remain_list?.paid_fee,
            RemainingFees: remain_list?.remaining_fee,
            PaidByStudent: remain_list?.paid_by_student,
            PaidByGovernment: remain_list?.paid_by_government,
            Standard:
              `${remain_list?.fee_structure?.class_master?.className}` ?? "#NA",
            Batch: remain_list?.fee_structure?.batch_master?.batchName ?? "#NA",
            FeeStructure: remain_list?.fee_structure?.unique_structure_name ?? "#NA",
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
