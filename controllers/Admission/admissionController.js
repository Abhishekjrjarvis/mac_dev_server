const InstituteAdmin = require("../../models/InstituteAdmin");
const Staff = require("../../models/Staff");
const Admission = require("../../models/Admission/Admission");
const Inquiry = require("../../models/Admission/Inquiry");
const User = require("../../models/User");
const Notification = require("../../models/notification");
const NewApplication = require("../../models/Admission/NewApplication");
const Student = require("../../models/Student");
const Status = require("../../models/Admission/status");
const Finance = require("../../models/Finance");
const Batch = require("../../models/Batch");
const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Admin = require("../../models/superAdmin");
const OrderPayment = require("../../models/RazorPay/orderPayment");
const FeeReceipt = require("../../models/RazorPay/feeReceipt");
const { designation_alarm } = require("../../WhatsAppSMS/payload");
const {
  uploadDocFile,
  uploadFile,
  uploadPostImageFile,
  deleteFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../Firebase/firebase");
const Post = require("../../models/Post");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const bcrypt = require("bcryptjs");
const {
  new_admission_recommend_post,
} = require("../../Service/AutoRefreshBackend");
const BusinessTC = require("../../models/Finance/BToC");
const StudentNotification = require("../../models/Marks/StudentNotification");
const { file_to_aws } = require("../../Utilities/uploadFileAws");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const {
  connect_redis_hit,
  connect_redis_miss,
} = require("../../config/redis-config");
const {
  filter_unique_username,
  generateAccessToken,
} = require("../../helper/functions");
const {
  custom_date_time,
  user_date_of_birth,
  age_calc,
} = require("../../helper/dayTimer");
const {
  add_all_installment,
  render_installment,
  add_total_installment,
  exempt_installment,
  set_fee_head_query,
  remain_one_time_query,
} = require("../../helper/Installment");
const { whats_app_sms_payload } = require("../../WhatsAppSMS/payload");
const {
  render_admission_current_role,
} = require("../Moderator/roleController");
const FeeStructure = require("../../models/Finance/FeesStructure");
const { nested_document_limit } = require("../../helper/databaseFunction");
const RemainingList = require("../../models/Admission/RemainingList");
const { dueDateAlarm } = require("../../Service/alarm");

exports.retrieveAdmissionAdminHead = async (req, res) => {
  try {
    const { id, sid } = req.params;
    if (!sid && !id)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const institute = await InstituteAdmin.findById({ _id: id });
    const staff = await Staff.findById({ _id: sid });
    const user = await User.findById({ _id: `${staff.user}` });
    const admission = new Admission({});
    const notify = new Notification({});
    staff.admissionDepartment.push(admission._id);
    staff.staffDesignationCount += 1;
    staff.recentDesignation = "Admission Admin";
    admission.admissionAdminHead = staff._id;
    institute.admissionDepart.push(admission._id);
    institute.admissionStatus = "Enable";
    admission.institute = institute._id;
    notify.notifyContent = `you got the designation of Admission Admin 🎉🎉`;
    notify.notifySender = id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Admission Designation";
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyPid = "1";
    notify.notifyByInsPhoto = institute._id;
    invokeFirebaseNotification(
      "Designation Allocation",
      notify,
      institute.insName,
      user._id,
      user.deviceToken
    );
    await Promise.all([
      institute.save(),
      staff.save(),
      admission.save(),
      user.save(),
      notify.save(),
    ]);
    // const adsEncrypt = await encryptionPayload(admission._id);
    res.status(200).send({
      message: "Successfully Assigned Staff",
      admission: admission._id,
      status: true,
    });
    designation_alarm(
      user?.userPhoneNumber,
      "ADMISSION",
      institute?.sms_lang,
      "",
      "",
      ""
    );
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionDetailInfo = async (req, res) => {
  try {
    const { aid } = req.params;
    const { sid } = req.query;
    // const is_cache = await connect_redis_hit(`Admission-Detail-${aid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Detail Admission Admin from Cache 🙌",
    //     answer: is_cache.admission,
    //   });
    const admission = await Admission.findById({ _id: aid })
      .select(
        "admissionAdminEmail admissionAdminPhoneNumber moderator_role completedCount exemptAmount requested_status collected_fee remainingFee admissionAdminAbout photoId coverId photo queryCount newAppCount cover offlineFee onlineFee remainingFeeCount"
      )
      .populate({
        path: "admissionAdminHead",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
      })
      .populate({
        path: "institute",
        select: "_id insName insProfilePhoto status",
      });
    // const adsEncrypt = await encryptionPayload(admission);
    // const cached = await connect_redis_miss(
    //   `Admission-Detail-${aid}`,
    //   admission
    // );
    if (req?.query?.sid) {
      var value = await render_admission_current_role(
        admission?.moderator_role,
        sid
      );
    }
    res.status(200).send({
      message: "All Detail Admission Admin from DB 🙌",
      // admission: cached.admission,
      admission: admission,
      roles: req?.query?.sid ? value : "",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retieveAdmissionAdminAllApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(
    //   `Admission-Ongoing-${aid}-${page}`
    // );
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Ongoing Application from Cache 🙌",
    //     ongoing: is_cache.ongoing,
    //     ongoingCount: is_cache.ongoingCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await Admission.findById({ _id: aid }).select(
      "newApplication"
    );
    const ongoing = await NewApplication.find({
      $and: [
        { _id: { $in: apply.newApplication } },
        { applicationStatus: "Ongoing" },
      ],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "applicationName applicationEndDate applicationStatus applicationSeats"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName photoId photo",
      });

    if (ongoing?.length > 0) {
      // Add Another Encryption
      // const bind_ongoing = {
      //   ongoing: ongoing,
      //   ongoingCount: ongoing?.length,
      // };
      // const cached = await connect_redis_miss(
      //   `Admission-Ongoing-${aid}-${page}`,
      //   bind_ongoing
      // );
      res.status(200).send({
        message: "All Ongoing Application from DB 🙌",
        // ongoing: cached.ongoing,
        // ongoingCount: cached.ongoingCount,
        ongoing: ongoing,
        ongoingCount: ongoing?.length,
      });
    } else {
      res
        .status(200)
        .send({ message: "Dark side in depth nothing to find", ongoing: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retieveAdmissionAdminAllCApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(
    //   `Admission-Completed-${aid}-${page}`
    // );
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Completed Application from Cache 🙌",
    //     completed: is_cache.completed,
    //     completedCount: is_cache.completedCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await Admission.findById({ _id: aid }).select(
      "newApplication"
    );
    const completed = await NewApplication.find({
      $and: [
        { _id: { $in: apply.newApplication } },
        { applicationStatus: "Completed" },
      ],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "applicationName applicationEndDate applicationStatus applicationSeats allotCount"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName photoId photo",
      });

    if (completed?.length > 0) {
      // Add Another Encryption
      // const bind_complete = {
      //   completed: completed,
      //   completedCount: completed?.length,
      // };
      // const cached = await connect_redis_miss(
      //   `Admission-Completed-${aid}-${page}`,
      //   bind_complete
      // );
      res.status(200).send({
        message: "All Completed Applicationd from DB 🙌",
        // completed: cached.completed,
        // completedCount: cached.completedCount,
        completed: completed,
        completedCount: completed?.length,
      });
    } else {
      res
        .status(200)
        .send({ message: "Dark side in depth nothing to find", completed: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retieveAdmissionAdminAllCDetailApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(
    //   `Admission-Completed-${aid}-${page}`
    // );
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Completed Application from Cache 🙌",
    //     completed: is_cache.completed,
    //     completedCount: is_cache.completedCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await Admission.findById({ _id: aid }).select(
      "newApplication"
    );
    const completed = await NewApplication.find({
      $and: [
        { _id: { $in: apply.newApplication } },
        { applicationStatus: "Completed" },
      ],
    })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip)
      .select(
        "applicationName applicationStartDate admissionFee applicationSeats receievedCount selectCount confirmCount cancelCount allotCount onlineFee offlineFee remainingFee collectedFeeCount applicationStatus applicationEndDate"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName",
      })
      .populate({
        path: "applicationBatch",
        select: "batchName",
      });

    if (completed?.length > 0) {
      // Add Another Encryption
      // const bind_complete = {
      //   completed: completed,
      //   completedCount: completed?.length,
      // };
      // const cached = await connect_redis_miss(
      //   `Admission-Completed-${aid}-${page}`,
      //   bind_complete
      // );
      res.status(200).send({
        message: "All Completed Applicationd from DB 🙌",
        // completed: cached.completed,
        // completedCount: cached.completedCount,
        completed: completed,
        completedCount: completed?.length,
      });
    } else {
      res
        .status(200)
        .send({ message: "Dark side in depth nothing to find", completed: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAdmissionQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    await Admission.findByIdAndUpdate(aid, req.body);
    res.status(200).send({ message: "Admission Info Updated" });
  } catch {}
};

exports.retrieveAdmissionNewApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const { expand } = req.query;
    req.body.applicationSeats = req.body?.applicationSeats
      ? parseInt(req.body?.applicationSeats)
      : 0;
    var admission = await Admission.findById({ _id: aid });
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const newApply = new NewApplication({ ...req.body });
    // const child = JSON?.parse(req.body.applicationChildTypes);
    // if (child) {
    //   for (var i = 0; i < child.length; i++) {
    //     newApply.applicationChildType.push(child[i]);
    //   }
    // }
    admission.newApplication.push(newApply._id);
    admission.newAppCount += 1;
    newApply.admissionAdmin = admission._id;
    institute.admissionCount += 1;
    await Promise.all([admission.save(), newApply.save(), institute.save()]);
    res
      .status(200)
      .send({ message: "New Application is ongoing 👍", status: true });
    const post = new Post({});
    post.imageId = "1";
    institute.posts.push(post._id);
    institute.postCount += 1;
    post.author = institute._id;
    post.authorName = institute.insName;
    post.authorUserName = institute.name;
    post.authorPhotoId = institute.photoId;
    post.authorProfilePhoto = institute.insProfilePhoto;
    post.authorOneLine = institute.one_line_about;
    post.authorFollowersCount = institute.followersCount;
    post.isInstitute = "institute";
    post.postType = "Application";
    post.new_application = newApply._id;
    post.post_url = `https://qviple.com/q/${post.authorUserName}/profile`;
    await Promise.all([post.save(), institute.save()]);
    new_admission_recommend_post(institute?._id, post?._id, expand);
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAdmissionApplicationArray = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`Institute-All-App-${id}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Institute Application Feed from Cache 🙌",
    //     allApp: is_cache.newApp,
    //     allAppCount: is_cache.allAppCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const ins_apply = await InstituteAdmin.findById({ _id: id }).select(
      "admissionDepart"
    );
    if (ins_apply?.admissionDepart?.length > 0) {
      if (search) {
        const apply = await Admission.findById({
          _id: `${ins_apply?.admissionDepart[0]}`,
        });
        var newApp = await NewApplication.find({
          $and: [
            { _id: { $in: apply?.newApplication } },
            { applicationStatus: "Ongoing" },
          ],
          $or: [
            { applicationParentType: { $regex: search, $options: "i" } },
            {
              applicationChildType: { $in: search },
            },
          ],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select("applicationName applicationEndDate")
          .populate({
            path: "applicationDepartment",
            select: "dName",
          })
          .populate({
            path: "applicationBatch",
            select: "batchName",
          });
      } else {
        const apply = await Admission.findById({
          _id: `${ins_apply?.admissionDepart[0]}`,
        });
        var newApp = await NewApplication.find({
          $and: [
            { _id: { $in: apply?.newApplication } },
            { applicationStatus: "Ongoing" },
          ],
        })
          .sort("-createdAt")
          .limit(limit)
          .skip(skip)
          .select("applicationName applicationEndDate")
          .populate({
            path: "applicationDepartment",
            select: "dName",
          })
          .populate({
            path: "applicationBatch",
            select: "batchName",
          });
      }
      // if(newApp?.length > 0){
      // Add Another Encryption
      // const bind_ins_app = {
      //   allApp: newApp,
      //   allAppCount: newApp?.length,
      // };
      // const cached = await connect_redis_miss(
      //   `Institute-All-App-${id}-${page}`,
      //   bind_ins_app
      // );
      res.status(200).send({
        message: "Lets begin new year journey from DB 🙌",
        // allApp: cached.newApp,
        // allAppCount: cached.allAppCount,
        allApp: newApp,
        allAppCount: newApp?.length,
      });
      // }
    } else {
      res.status(200).send({
        message: "get a better lens to find what you need 🔍",
        allApp: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionReceievedApplication = async (req, res) => {
  try {
    const { uid, aid } = req.params;
    if (!uid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        status: false,
      });
    const user = await User.findById({ _id: uid });
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
    for (var file of req.body?.fileArray) {
      if (file.name === "file") {
        student.photoId = "0";
        student.studentProfilePhoto = file.key;
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
      student.studentOptionalSubject?.push(...studentOptionalSubject);
    }
    status.content = `You have applied for ${apply.applicationName} has been filled successfully.Stay updated to check status of your application.`;
    status.applicationId = apply._id;
    status.instituteId = institute._id;
    user.student.push(student._id);
    user.applyApplication.push(apply._id);
    student.user = user._id;
    user.applicationStatus.push(status._id);
    apply.receievedApplication.push({
      student: student._id,
      fee_remain: 0,
    });
    apply.receievedCount += 1;
    if (institute.userFollowersList.includes(uid)) {
    } else {
      user.userInstituteFollowing.push(institute._id);
      user.followingUICount += 1;
      institute.userFollowersList.push(uid);
      institute.followersCount += 1;
    }
    await Promise.all([
      student.save(),
      user.save(),
      status.save(),
      apply.save(),
      institute.save(),
    ]);
    res.status(201).send({
      message: "Taste a bite of sweets till your application is selected",
      student: student._id,
      status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllRequestApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_request = [];
      var apply = await NewApplication.findById({ _id: aid })
        .select("receievedCount")
        .populate({
          path: "receievedApplication",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      for (let data of apply.receievedApplication) {
        if (data.student !== null) {
          filter_request.push(data);
        }
      }
      if (filter_request?.length > 0) {
        // const requestEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message: "find difficulties with easy search ",
          request: filter_request,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          request: [],
        });
      }
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .limit(limit)
        .skip(skip)
        .select("receievedCount")
        .populate({
          path: "receievedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      if (apply.receievedApplication?.length > 0) {
        // const requestEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Request arrived make sure you come up with Tea and Snack from DB 🙌",
          request: apply.receievedApplication,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          request: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllSelectApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_select = [];
      const apply = await NewApplication.findById({ _id: aid })
        .select("selectCount")
        .populate({
          path: "selectedApplication",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
            populate: {
              path: "fee_structure",
              select: "total_admission_fees one_installments",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      for (let data of apply.selectedApplication) {
        if (data.student !== null) {
          filter_select.push(data);
        }
      }
      if (filter_select?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Selection required make sure you come up with Tea and Snack from DB 🙌",
          select: filter_select,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          select: [],
        });
      }
    } else {
      var apply = await NewApplication.findById({ _id: aid })
        .limit(limit)
        .skip(skip)
        .select("selectCount")
        .populate({
          path: "selectedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
            populate: {
              path: "fee_structure",
              select: "total_admission_fees",
              populate: {
                path: "category_master",
                select: "category_name",
              },
            },
          },
        });
      if (apply?.selectedApplication?.length > 0) {
        // const selectEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Selection required make sure you come up with Tea and Snack from DB 🙌",
          select: apply.selectedApplication,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          select: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllConfirmApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_confirm = [];
      const apply = await NewApplication.findById({ _id: aid })
        .select("confirmCount")
        .populate({
          path: "confirmedApplication",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      for (let data of apply.confirmedApplication) {
        if (data.student !== null) {
          filter_confirm.push(data);
        }
      }
      if (filter_confirm?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: filter_confirm,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    } else {
      const apply = await NewApplication.findById({ _id: aid })
        .limit(limit)
        .skip(skip)
        .select("confirmCount")
        .populate({
          path: "confirmedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      if (apply?.confirmedApplication?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: apply.confirmedApplication,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllConfirmApplicationPayload = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    if (search) {
      const filter_confirm = [];
      const apply = await NewApplication.findById({ _id: aid })
        .select("confirmCount")
        .populate({
          path: "confirmedApplication",
          populate: {
            path: "student",
            match: {
              studentFirstName: { $regex: `${search}`, $options: "i" },
            },
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      for (let data of apply.confirmedApplication) {
        if (data.student !== null) {
          filter_confirm.push(data);
        }
      }
      if (filter_confirm?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: filter_confirm,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    } else {
      const apply = await NewApplication.findById({ _id: aid })
        .select("confirmCount")
        .populate({
          path: "confirmedApplication",
          populate: {
            path: "student",
            select:
              "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
          },
        });
      if (apply?.confirmedApplication?.length > 0) {
        // const confirmEncrypt = await encryptionPayload(apply);
        res.status(200).send({
          message:
            "Lots of Confirmation and class allot required make sure you come up with Tea and Snack from DB 🙌",
          confirm: apply.confirmedApplication,
        });
      } else {
        res.status(200).send({
          message: "Go To Outside for Dinner",
          confirm: [],
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllAllotApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Allot-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Allotted Application Feed from Cache 🙌",
    //     allot: is_cache.apply,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid })
      .limit(limit)
      .skip(skip)
      .select("allotCount")
      .populate({
        path: "allottedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
        },
      });

    if (apply?.allottedApplication?.length > 0) {
      // const allotEncrypt = await encryptionPayload(apply);
      // const cached = await connect_redis_miss(
      //   `All-Allot-App-${aid}-${page}`,
      //   apply
      // );
      res.status(200).send({
        message: "Lots of Allotted Application from DB 😥",
        // allot: cached.apply,
        allot: apply,
      });
    } else {
      res.status(200).send({
        message: "Go To Outside for Dinner",
        allot: { allottedApplication: [] },
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllCancelApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Cancel-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Cancelled Application Feed from Cache 🙌",
    //     cancel: is_cache.apply,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid })
      .limit(limit)
      .skip(skip)
      .select("cancelCount")
      .populate({
        path: "cancelApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName paidFeeList photoId studentProfilePhoto studentGender studentPhoneNumber studentParentsPhoneNumber",
        },
      });

    if (apply?.cancelApplication?.length > 0) {
      // const cancelEncrypt = await encryptionPayload(apply);
      // const cached = await connect_redis_miss(
      //   `All-Cancel-App-${aid}-${page}`,
      //   apply
      // );
      res.status(200).send({
        message: "Lots of Cancel Application from DB 😂😂",
        // cancel: cached.apply,
        cancel: apply,
      });
    } else {
      res.status(200).send({
        message: "Go To Outside for Dinner",
        cancel: { cancelApplication: [] },
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionSelectedApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { fee_struct } = req.body;
    if (!sid && !aid && !fee_struct)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        select_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).select("institute");
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const structure = await FeeStructure.findById({ _id: fee_struct });
    const finance = await Finance.findOne({
      institute: admission_admin?.institute,
    });
    const status = new Status({});
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.receievedApplication.pull(app._id);
      } else {
      }
    }
    apply.selectedApplication.push({
      student: student._id,
      fee_remain: structure.total_admission_fees,
    });
    apply.selectCount += 1;
    status.content = `You have been selected for ${apply.applicationName}. Confirm your admission`;
    status.applicationId = apply._id;
    status.for_selection = "Yes";
    status.studentId = student._id;
    status.admissionFee = structure.total_admission_fees;
    status.instituteId = admission_admin?.institute;
    status.feeStructure = structure?._id;
    student.fee_structure = structure?._id;
    status.finance = finance?._id;
    user.applicationStatus.push(status._id);
    student.active_status.push(status?._id);
    await Promise.all([
      apply.save(),
      student.save(),
      user.save(),
      status.save(),
    ]);
    res.status(200).send({
      message: `congrats ${student.studentFirstName} `,
      select_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionCancelApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).select("institute");
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.receievedApplication.pull(app._id);
      } else {
      }
    }
    if (apply.receievedCount > 0) {
      apply.receievedCount -= 1;
    }
    status.content = `You have been rejected for ${apply.applicationName}. Best of luck for next time `;
    status.applicationId = apply._id;
    status.studentId = student._id;
    user.applicationStatus.push(status._id);
    status.instituteId = admission_admin?.institute;
    await Promise.all([
      apply.save(),
      student.save(),
      user.save(),
      status.save(),
    ]);
    res.status(200).send({
      message: `Best of luck for next time 😥`,
      cancel_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionPayMode = async (req, res) => {
  try {
    const { sid, aid, statusId } = req.params;
    const { fee_payment_mode } = req.body;
    if (!sid && !aid && !statusId && !fee_payment_mode)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley 😒",
        access: false,
      });
    const student = await Student.findById({ _id: sid });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const user = await User.findById({ _id: `${student.user}` });
    const status = await Status.findById({ _id: statusId });
    const aStatus = new Status({});
    const apply = await NewApplication.findById({ _id: aid }).select(
      "selectedApplication admissionAdmin"
    );
    const admin_ins = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    });
    if (apply?.selectedApplication?.length > 0) {
      apply?.selectedApplication?.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.payment_status =
            fee_payment_mode === "By Cash" ? "offline" : "Receipt Requested";
        }
      });
      await apply.save();
    }
    if (fee_payment_mode === "By Cash") {
      status.payMode = "offline";
      status.sub_payment_mode = "By Cash";
    } else {
      status.sub_payment_mode = fee_payment_mode;
      status.payMode = "online";
      var receipt = new FeeReceipt({ ...req.body });
      receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
      receipt.student = student?._id;
      receipt.application = apply?._id;
      receipt.app_status = status?._id;
      status.receipt = receipt?._id;
      receipt.finance = institute?.financeDepart[0];
      if (admin_ins?.request_array?.includes(`${receipt?._id}`)) {
      } else {
        admin_ins.request_array.push(receipt?._id);
        admin_ins.fee_receipt_request.push({
          receipt: receipt?._id,
          status: "Requested",
        });
        status.receipt_status = "Requested";
      }
      s_admin.invoice_count += 1;
      receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${s_admin.invoice_count}`;
      await Promise.all([receipt.save(), s_admin.save()]);
    }
    status.isPaid = "Not Paid";
    status.for_selection = "No";
    aStatus.content = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees or contact institute if neccessory`;
    aStatus.applicationId = apply._id;
    user.applicationStatus.push(aStatus._id);
    aStatus.instituteId = institute._id;
    await Promise.all([
      status.save(),
      aStatus.save(),
      user.save(),
      admin_ins.save(),
    ]);
    res.status(200).send({
      message: "Lets do some excercise visit institute",
      status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      aStatus.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.payOfflineAdmissionFee = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount, mode } = req.body;
    if (!sid && !aid && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        confirm_status: false,
      });
    var price = parseInt(amount);
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    const apply = await NewApplication.findById({ _id: aid });
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const student = await Student.findById({ _id: sid }).populate({
      path: "fee_structure",
    });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    const order = new OrderPayment({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = institute?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    s_admin.invoice_count += 1;
    order.payment_invoice_number = s_admin.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${s_admin.invoice_count}`;
    var total_amount = add_total_installment(student);
    var is_install;
    if (
      price <= student?.fee_structure?.total_admission_fees &&
      price > student?.fee_structure?.one_installments?.fees
    ) {
      is_install = false;
    } else {
      is_install = true;
    }
    if (price > 0 && is_install) {
      admission.remainingFee.push(student._id);
      student.admissionRemainFeeCount += total_amount - price;
      apply.remainingFee += total_amount - price;
      admission.remainingFeeCount += total_amount - price;
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: total_amount,
      });
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "First Installment",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.paid_fee += price;
      new_remainFee.remaining_fee += total_amount - price;
      student.remainingFeeList.push(new_remainFee?._id);
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      await add_all_installment(
        apply,
        institute._id,
        new_remainFee,
        price,
        student
      );
    } else if (price > 0 && !is_install) {
      var new_remainFee = new RemainingList({
        appId: apply._id,
        applicable_fee: student?.fee_structure?.total_admission_fees,
      });
      new_remainFee.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "One Time Fees",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
      });
      new_remainFee.paid_fee += price;
      new_remainFee.remaining_fee +=
        student?.fee_structure?.total_admission_fees - price;
      student.remainingFeeList.push(new_remainFee?._id);
      new_remainFee.student = student?._id;
      new_remainFee.fee_receipts.push(new_receipt?._id);
      admission.remainingFee.push(student._id);
      student.admissionRemainFeeCount +=
        student?.fee_structure?.total_admission_fees - price;
      apply.remainingFee +=
        student?.fee_structure?.total_admission_fees - price;
      admission.remainingFeeCount +=
        student?.fee_structure?.total_admission_fees - price;
      const valid_one_time_fees =
        student?.fee_structure?.total_admission_fees - price == 0
          ? true
          : false;
      if (valid_one_time_fees) {
        admission.remainingFee.pull(student._id);
      } else {
        new_remainFee.remaining_array.push({
          remainAmount: student?.fee_structure?.total_admission_fees - price,
          appId: apply._id,
          status: "Not Paid",
          instituteId: institute._id,
          installmentValue: "One Time Fees Remain",
          isEnable: true,
        });
      }
    }
    if (mode === "Offline") {
      admission.offlineFee += price;
      apply.collectedFeeCount += price;
      apply.offlineFee += price;
      admission.collected_fee += price;
      finance.financeAdmissionBalance += price;
      finance.financeTotalBalance += price;
      finance.financeSubmitBalance += price;
    } else if (mode === "Online") {
      admission.onlineFee += price;
      apply.collectedFeeCount += price;
      apply.onlineFee += price;
      finance.financeAdmissionBalance += price;
      finance.financeTotalBalance += price;
      finance.financeBankBalance += price;
    } else {
    }
    await set_fee_head_query(student, price, apply);
    for (let app of apply.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        app.payment_status = mode;
        if (is_install) {
          app.install_type = "First Installment Paid";
          app.fee_remain = total_amount - price;
        } else {
          app.install_type = "One Time Fees Paid";
          app.fee_remain = student?.fee_structure?.total_admission_fees - price;
        }
      } else {
      }
    }
    student.admissionPaidFeeCount += price;
    student.paidFeeList.push({
      paidAmount: price,
      appId: apply._id,
    });
    status.content = `Welcome to Institute ${institute.insName}, ${institute.insDistrict}.Please visit with Required Documents to confirm your admission`;
    status.applicationId = apply._id;
    user.applicationStatus.push(status._id);
    status.instituteId = institute._id;
    status.document_visible = true;
    await Promise.all([
      admission.save(),
      apply.save(),
      student.save(),
      finance.save(),
      user.save(),
      order.save(),
      institute.save(),
      s_admin.save(),
      new_remainFee.save(),
      new_receipt.save(),
    ]);
    res.status(200).send({
      message: "Look like a party mood",
      confirm_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Admission Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};
// Same Params in body + remain params exist
exports.cancelAdmissionApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount, mode, remainAmount } = req.body;
    if (!sid && !aid && !amount && !remainAmount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        refund_status: false,
      });
    var price = parseInt(amount);
    var s_admin = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const apply = await NewApplication.findById({ _id: aid }).populate({
      path: "applicationDepartment",
      select: "dName",
    });
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    const aStatus = new Status({});
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.refund_status = "Refunded";
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    if (
      price &&
      price > finance.financeTotalBalance &&
      price > admission.offlineFee &&
      price > finance.financeSubmitBalance
    ) {
      res.status(200).send({
        message: "insufficient Balance in Finance Department to make refund",
      });
    } else {
      const order = new OrderPayment({});
      apply.cancelCount += 1;
      if (apply.remainingFee >= parseInt(remainAmount)) {
        apply.remainingFee -= parseInt(remainAmount);
      }
      if (mode === "Offline") {
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeSubmitBalance >= price) {
          finance.financeSubmitBalance -= price;
        }
        if (admission.offlineFee >= price) {
          admission.offlineFee -= price;
        }
        if (admission.collected_fee >= price) {
          admission.collected_fee -= price;
        }
        if (apply.offlineFee >= price) {
          apply.offlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
      } else if (mode === "Online") {
        if (admission.onlineFee >= price) {
          admission.onlineFee -= price;
        }
        if (apply.onlineFee >= price) {
          apply.onlineFee -= price;
        }
        if (apply.collectedFeeCount >= price) {
          apply.collectedFeeCount -= price;
        }
        if (finance.financeAdmissionBalance >= price) {
          finance.financeAdmissionBalance -= price;
        }
        if (finance.financeTotalBalance >= price) {
          finance.financeTotalBalance -= price;
        }
        if (finance.financeBankBalance >= price) {
          finance.financeBankBalance -= price;
        }
      }
      if (admission.remainingFeeCount >= parseInt(remainAmount)) {
        admission.remainingFeeCount -= parseInt(remainAmount);
      }
      aStatus.content = `Your application for ${apply?.applicationDepartment?.dName} has been rejected. Best Of Luck for next time`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      student.admissionRemainFeeCount = 0;
      student.refundAdmission.push({
        refund_status: "Refund",
        refund_reason: "Cancellation of Admission",
        refund_amount: price,
      });
      const all_remain_fee_list = await RemainingList.findOne({
        $and: [{ student: student?._id }, { appId: apply?._id }],
      });
      const filter_student_install =
        all_remain_fee_list?.remaining_array?.filter((stu) => {
          if (`${stu.appId}` === `${apply._id}` && stu.status === "Not Paid")
            return stu;
        });
      for (var can = 0; can < filter_student_install?.length; can++) {
        all_remain_fee_list?.remaining_array.pull(filter_student_install[can]);
      }
      all_remain_fee_list.fee_receipts.push(new_receipt?._id);
      all_remain_fee_list.refund_fee += price;
      if (all_remain_fee_list.paid_fee >= price) {
        all_remain_fee_list.paid_fee -= price;
      }
      all_remain_fee_list.remaining_fee = 0;
      for (var ele of student?.active_fee_heads) {
        if (`${ele?.appId}` === `${apply?._id}`) {
          ele.paid_fee = 0;
          ele.remain_fee = 0;
        }
      }
      all_remain_fee_list.remaining_array.push({
        remainAmount: price,
        appId: apply._id,
        status: "Paid",
        instituteId: institute._id,
        installmentValue: "Cancellation & Refunded",
        mode: mode,
        isEnable: true,
        fee_receipt: new_receipt?._id,
        refund_status: "Refunded",
      });
      order.payment_module_type = "Expense";
      order.payment_to_end_user_id = institute._id;
      order.payment_by_end_user_id = user._id;
      order.payment_module_id = apply._id;
      order.payment_amount = price;
      order.payment_status = "Captured";
      order.payment_flag_to = "Debit";
      order.payment_flag_by = "Credit";
      order.payment_mode = mode;
      order.payment_admission = apply._id;
      order.payment_from = student._id;
      s_admin.invoice_count += 1;
      order.payment_invoice_number = s_admin.invoice_count;
      user.payment_history.push(order._id);
      institute.payment_history.push(order._id);
      new_receipt.invoice_count = `${
        new Date().getMonth() + 1
      }${new Date().getFullYear()}${s_admin.invoice_count}`;
      await Promise.all([
        apply.save(),
        student.save(),
        finance.save(),
        admission.save(),
        aStatus.save(),
        user.save(),
        order.save(),
        institute.save(),
        s_admin.save(),
        all_remain_fee_list.save(),
        new_receipt.save(),
      ]);
      res.status(200).send({
        message: "Refund & Cancellation of Admission",
        refund_status: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
      if (apply.confirmedApplication?.length > 0) {
        for (let app of apply.confirmedApplication) {
          if (`${app.student}` === `${student._id}`) {
            apply.confirmedApplication.pull(app._id);
          } else {
          }
        }
        apply.cancelApplication.push({
          student: student._id,
          payment_status: "Refund",
          refund_amount: price,
        });
        await apply.save();
      }
      if (admission?.remainingFee?.length > 0) {
        if (admission.remainingFee?.includes(`${student._id}`)) {
          admission.remainingFee.pull(student._id);
        }
        await admission.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionApplicationBatch = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Batch-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Application Batches Feed from Cache 🙌",
    //     batch: is_cache.batch,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid });
    const depart = await Department.findById({
      _id: `${apply.applicationDepartment}`,
    });
    var batch = await Batch.find({
      _id: { $in: depart?.batches },
    })
      .sort("createdAt")
      .limit(limit)
      .skip(skip)
      .select("batchName batchStatus createdAt");
    if (batch?.length > 0) {
      // const batchEncrypt = await encryptionPayload(batch);
      // const cached = await connect_redis_miss(
      //   `All-Batch-App-${aid}-${page}`,
      //   batch
      // );
      res.status(200).send({
        message: "Front & Back Benchers at one place from DB 🙌",
        // batch: cached.batch,
        batch: batch,
      });
    } else {
      res.status(200).send({ message: "Renovation at Batches", batch: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionApplicationClass = async (req, res) => {
  try {
    const { aid, bid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Classes-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Application Classes of One Batch Feed from Cache 🙌",
    //     classes: is_cache.classes,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid });
    const batch = await Batch.findById({ _id: bid });
    const { search } = req.query;
    if (search) {
      var classes = await Class.find({
        $and: [
          { _id: { $in: batch?.classroom } },
          { classStatus: "UnCompleted" },
        ],
        $or: [
          { className: { $regex: search, $options: "i" } },
          {
            classTitle: { $regex: search, $options: "i" },
          },
        ],
      }).select("className classTitle boyCount girlCount photoId photo");
    } else {
      var classes = await Class.find({
        $and: [
          { _id: { $in: batch?.classroom } },
          { classStatus: "UnCompleted" },
        ],
      })
        .sort("-strength")
        .limit(limit)
        .skip(skip)
        .select("className classTitle boyCount girlCount photoId photo");
    }
    if (classes?.length > 0) {
      // const classesEncrypt = await encryptionPayload(classes);
      // const cached = await connect_redis_miss(
      //   `All-Classes-App-${aid}-${page}`,
      //   classes
      // );
      res.status(200).send({
        message: "Front & Back Benchers at one place from DB 🙌",
        // classes: cached.classes,
        classes: classes,
      });
    } else {
      res.status(200).send({ message: "Renovation at classes", classes: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveClassAllotQuery = async (req, res) => {
  try {
    const { aid, cid } = req.params;
    if (!aid && !cid && !req.body.dataList)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        allot_status: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    var admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    }).select("institute");
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    var depart = await Department.findById({
      _id: `${apply.applicationDepartment}`,
    });
    var batch = await Batch.findById({ _id: `${apply.applicationBatch}` });
    var classes = await Class.findById({ _id: cid });
    var array = req.body.dataList;
    if (array?.length > 0) {
      for (var sid of array) {
        const student = await Student.findById({ _id: sid });
        const remain_list = await RemainingList.findOne({
          $and: [
            { _id: { $in: student?.remainingFeeList } },
            { appId: apply?._id },
          ],
        });
        const user = await User.findById({ _id: `${student.user}` });
        const notify = new Notification({});
        const aStatus = new Status({});
        for (let app of apply.confirmedApplication) {
          if (`${app.student}` === `${student._id}`) {
            apply.confirmedApplication.pull(app._id);
          } else {
          }
        }
        apply.allottedApplication.push({
          student: student._id,
          payment_status: "offline",
          alloted_class: `${classes.className} - ${classes.classTitle}`,
          alloted_status: "Alloted",
          fee_remain: student.admissionRemainFeeCount,
          paid_status:
            student.admissionRemainFeeCount == 0 ? "Paid" : "Not Paid",
        });
        remain_list.batchId = batch?._id;
        apply.allotCount += 1;
        // student.confirmApplication.pull(apply._id)
        student.studentStatus = "Approved";
        institute.ApproveStudent.push(student._id);
        student.institute = institute._id;
        admins.studentArray.push(student._id);
        admins.studentCount += 1;
        institute.studentCount += 1;
        classes.strength += 1;
        classes.ApproveStudent.push(student._id);
        classes.studentCount += 1;
        student.studentGRNO = `${
          institute?.gr_initials ? institute?.gr_initials : `Q`
        }${institute.ApproveStudent.length}`;
        student.studentROLLNO = classes.ApproveStudent.length;
        student.studentClass = classes._id;
        student.studentAdmissionDate = new Date().toISOString();
        depart.ApproveStudent.push(student._id);
        depart.studentCount += 1;
        student.department = depart._id;
        batch.ApproveStudent.push(student._id);
        student.batches = batch._id;
        notify.notifyContent = `${student.studentFirstName}${
          student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
        } ${student.studentLastName} joined as a Student of Class ${
          classes.className
        } of ${batch.batchName}`;
        notify.notifySender = classes._id;
        notify.notifyReceiever = user._id;
        institute.iNotify.push(notify._id);
        notify.institute = institute._id;
        user.uNotify.push(notify._id);
        notify.user = user._id;
        notify.notifyByStudentPhoto = student._id;
        notify.notifyCategory = "Approve Student";
        aStatus.content = `Welcome to ${depart.dName} ${classes.classTitle} Enjoy your Learning.`;
        aStatus.applicationId = apply._id;
        user.applicationStatus.push(aStatus._id);
        aStatus.instituteId = institute._id;
        await Promise.all([
          apply.save(),
          student.save(),
          user.save(),
          aStatus.save(),
          admins.save(),
          institute.save(),
          classes.save(),
          depart.save(),
          batch.save(),
          notify.save(),
          remain_list.save(),
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
        invokeMemberTabNotification(
          "Admission Status",
          aStatus.content,
          "Application Status",
          user._id,
          user.deviceToken
        );
      }
      res.status(200).send({
        message: `Distribute sweets to all family members`,
        allot_status: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.completeAdmissionApplication = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        complete_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    if (
      apply?.selectedApplication?.length > 0 ||
      apply?.confirmedApplication?.length > 0
    ) {
      res.status(200).send({
        message:
          "Application not to be completed student is in Select  || Confirm ",
        complete_status: false,
      });
    } else {
      const admission = await Admission.findById({
        _id: `${apply.admissionAdmin}`,
      });
      const admission_ins = await InstituteAdmin.findById({
        _id: `${admission.institute}`,
      });
      apply.applicationStatus = "Completed";
      if (admission_ins?.admissionCount > 0) {
        admission_ins.admissionCount -= 1;
      }
      if (admission?.newAppCount > 0) {
        admission.newAppCount -= 1;
      }
      admission.completedCount += 1;
      await Promise.all([apply.save(), admission.save(), admission_ins.save()]);
      res.status(200).send({
        message: "Enjoy your work load is empty go for party",
        complete_status: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionRemainingArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    // const is_cache = await connect_redis_hit(`All-Remain-App-${aid}-${page}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Remaining Array Feed from Cache 🙌",
    //     remain: is_cache.student,
    //     remainCount: is_cache.remainCount,
    //   });
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const admin_ins = await Admission.findById({ _id: aid }).select(
      "remainingFee"
    );
    const student = await Student.find({
      _id: { $in: admin_ins?.remainingFee },
    })
      .sort("-admissionRemainFeeCount")
      .limit(limit)
      .skip(skip)
      .select(
        "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto admissionRemainFeeCount"
      )
      .populate({
        path: "department",
        select: "dName",
      });
    if (student?.length > 0) {
      // Add Another Encryption
      // const bind_remain = {
      //   remain: student,
      //   remainCount: student?.length,
      // };
      // const cached = await connect_redis_miss(
      //   `All-Remain-App-${aid}-${page}`,
      //   bind_remain
      // );
      res.status(200).send({
        message: "Its a party time from DB 🙌",
        // remain: cached.student,
        // remainCount: cached.remainCount,
        remain: student,
        remainCount: student?.length,
      });
    } else {
      res
        .status(200)
        .send({ message: "Account Running out of balance", remain: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentViewRemainingFee = async (req, res) => {
  try {
    const { sid } = req.params;
    const student = await Student.findById({ _id: sid }).select(
      "admissionPaymentStatus"
    );
    // const remainEncrypt = await encryptionPayload(student.admissionPaymentStatus);
    res.status(200).send({
      message: "Remaining fee view",
      remain_fee: student.admissionPaymentStatus,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.paidRemainingFeeStudent = async (req, res) => {
  try {
    const { aid, sid, appId } = req.params;
    const { amount, mode, type } = req.body;
    if (!sid && !aid && !appId && !amount && !mode && !type)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var admin_ins = await Admission.findById({ _id: aid }).populate({
      path: "admissionAdminHead",
      select: "user",
    });
    var student = await Student.findById({ _id: sid });
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    }).select("insName financeDepart gstSlab payment_history");
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history activity_tab"
    );
    var apply = await NewApplication.findById({ _id: appId });
    const new_receipt = new FeeReceipt({ ...req.body });
    new_receipt.student = student?._id;
    new_receipt.application = apply?._id;
    new_receipt.finance = finance?._id;
    new_receipt.fee_transaction_date = new Date(`${req.body.transaction_date}`);
    const notify = new StudentNotification({});
    const remaining_fee_lists = await RemainingList.findOne({
      $and: [{ student: student?._id }, { appId: apply?._id }],
    });
    remaining_fee_lists.fee_receipts.push(new_receipt?._id);
    const order = new OrderPayment({});
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = institute._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = mode;
    order.payment_admission = apply._id;
    order.payment_from = student._id;
    s_admin.invoice_count += 1;
    order.payment_invoice_number = s_admin.invoice_count;
    user.payment_history.push(order._id);
    institute.payment_history.push(order._id);
    new_receipt.invoice_count = `${
      new Date().getMonth() + 1
    }${new Date().getFullYear()}${s_admin.invoice_count}`;
    if (req?.body?.fee_payment_mode === "Exempted/Unrecovered") {
      await exempt_installment(
        req?.body?.fee_payment_mode,
        remaining_fee_lists,
        student,
        admin_ins,
        apply,
        finance,
        price,
        new_receipt
      );
    } else {
      await render_installment(
        type,
        student,
        mode,
        price,
        admin_ins,
        student?.fee_structure,
        remaining_fee_lists,
        new_receipt
      );
      remaining_fee_lists.paid_fee += price;
      if (remaining_fee_lists.remaining_fee >= price) {
        remaining_fee_lists.remaining_fee -= price;
      }
    }
    if (req?.body?.fee_payment_mode === "Government/Scholarship") {
      finance.government_receipt.push(new_receipt?._id);
      finance.government_receipt_count += 1;
    }
    if (admin_ins?.remainingFeeCount >= price) {
      admin_ins.remainingFeeCount -= price;
    }
    if (apply?.remainingFee >= price) {
      apply.remainingFee -= price;
    }
    if (student?.admissionRemainFeeCount >= price) {
      student.admissionRemainFeeCount -= price;
    }
    student.admissionPaidFeeCount += price;
    if (mode === "Online") {
      admin_ins.onlineFee += price;
      apply.onlineFee += price;
      apply.collectedFeeCount += price;
      finance.financeTotalBalance += price;
      finance.financeAdmissionBalance += price;
      finance.financeBankBalance += price;
    } else if (mode === "Offline") {
      admin_ins.offlineFee += price;
      apply.offlineFee += price;
      apply.collectedFeeCount += price;
      admin_ins.collected_fee += price;
      finance.financeTotalBalance += price;
      finance.financeAdmissionBalance += price;
      finance.financeSubmitBalance += price;
    } else {
    }
    await set_fee_head_query(student, price, apply);
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    if (type === "One Time Fees Remain") {
      await remain_one_time_query(
        admin_ins,
        remaining_fee_lists,
        apply,
        institute,
        student,
        price,
        new_receipt
      );
    }
    await Promise.all([
      admin_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
      remaining_fee_lists.save(),
      new_receipt.save(),
    ]);
    res.status(200).send({
      message: "Balance Pool increasing with price Operation complete",
      paid: true,
    });
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? `${student.studentMiddleName} ` : ""
    } ${student.studentLastName} your transaction is successfull for ${
      apply?.applicationName
    } ${price}`;
    notify.notifySender = admin_ins?.admissionAdminHead?.user;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByAdmissionPhoto = admin_ins._id;
    notify.notifyCategory = "Remain Fees";
    notify.redirectIndex = 18;
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Application Status",
      user._id,
      user.deviceToken
    );
    await Promise.all([user.save(), notify.save()]);
    if (apply?.allottedApplication?.length > 0) {
      apply?.allottedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          // ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
          // if (apply?.remainingFee >= price) {
          //   apply.remainingFee -= price;
          // }
        }
      });
      await apply.save();
    }
    if (apply?.confirmedApplication?.length > 0) {
      apply?.confirmedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.fee_remain =
            req?.body?.fee_payment_mode === "Exempted/Unrecovered"
              ? 0
              : ele.fee_remain >= price
              ? ele.fee_remain - price
              : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
          // if (apply?.remainingFee >= price) {
          //   apply.remainingFee -= price;
          // }
        }
      });
      await apply.save();
    }
    if (apply?.gstSlab > 0) {
      var business_data = new BusinessTC({});
      business_data.b_to_c_month = new Date().toISOString();
      business_data.b_to_c_i_slab = parseInt(apply?.gstSlab) / 2;
      business_data.b_to_c_s_slab = parseInt(apply?.gstSlab) / 2;
      business_data.finance = finance._id;
      business_data.b_to_c_name = "Admission Fees";
      finance.gst_format.b_to_c.push(business_data?._id);
      business_data.b_to_c_total_amount = price;
      await Promise.all([finance.save(), business_data.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionApplicationStatus = async (req, res) => {
  try {
    const { status } = req.query;
    const apply = await NewApplication.find({ applicationStatus: `${status}` })
      .select(
        "applicationName applicationSeats applicationStatus applicationEndDate"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName",
      });
    // const adsEncrypt = await encryptionPayload(apply);

    res.status(200).send({ message: "All Application", apply });
  } catch {}
};

exports.retrieveOneApplicationQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    // const is_cache = await connect_redis_hit(`One-Application-Detail-${aid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "One Application Query from Cache 🙌",
    //     answer: is_cache.oneApply,
    //   });
    const oneApply = await NewApplication.findById({ _id: aid })
      .select(
        "applicationName applicationType applicationAbout admissionProcess applicationEndDate applicationStartDate admissionFee applicationPhoto photoId applicationSeats receievedCount selectCount confirmCount applicationStatus cancelCount allotCount onlineFee offlineFee remainingFee collectedFeeCount applicationMaster"
      )
      .populate({
        path: "applicationDepartment",
        select: "dName",
      })
      .populate({
        path: "applicationBatch",
        select: "batchName",
      })
      .populate({
        path: "admissionAdmin",
        select: "_id",
        populate: {
          path: "institute",
          select: "id",
        },
      })
      .lean()
      .exec();
    // const oneEncrypt = await encryptionPayload(oneApply);
    // const cached = await connect_redis_miss(
    //   `One-Application-Detail-${aid}`,
    //   oneApply
    // );
    res.status(200).send({
      message:
        "Sit with a paper and pen to note down all details carefully from DB 🙌",
      // oneApply: cached.oneApply,
      oneApply: oneApply,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserInquiryProcess = async (req, res) => {
  try {
    const { aid, uid } = req.params;
    const app = await Admission.findById({ _id: aid });
    const user = await User.findById({ _id: uid });
    const ask = new Inquiry({ ...req.body });
    ask.user = user._id;
    ask.reasonExplanation.push({
      content: req.body?.content,
      replyBy: req.body?.replyBy,
    });
    app.inquiryList.push(ask._id);
    app.queryCount += 1;
    user.inquiryList.push(ask._id);
    await Promise.all([app.save(), user.save(), ask.save()]);
    res.status(200).send({ message: "Raised an inquiry " });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveUserInquiryArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
    const skip = (page - 1) * limit;
    const app = await Admission.findById({ _id: aid }).select("id inquiryList");

    const ask = await Inquiry.find({ _id: { $in: app.inquiryList } })
      .sort("-createdAt")
      .limit(limit)
      .skip(skip);

    if (ask?.length >= 1) {
      // const iEncrypt = await encryptionPayload(ask);
      res.status(200).send({ message: "Get List of Inquiry", i_list: ask });
    } else {
      res
        .status(200)
        .send({ message: "Looking for a inquiry List", i_list: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveInquiryReplyQuery = async (req, res) => {
  try {
    const { qid } = req.params;
    const { author } = req.query;
    const ask_query = await Inquiry.findById({ _id: qid });
    if (`${author}` === "User") {
      ask_query.reasonExplanation.push({
        content: req.body?.content,
        replyBy: `${author}`,
      });
      await ask_query.save();
      res.status(200).send({ message: `Ask By ${author}` });
    } else if (`${author}` === "Admin") {
      ask_query.reasonExplanation.push({
        content: req.body?.content,
        replyBy: `${author}`,
      });
      await ask_query.save();
      res.status(200).send({ message: `Reply By ${author}` });
    } else {
      res.status(200).send({ message: "Lost in space" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAllDepartmentArray = async (req, res) => {
  try {
    const { aid } = req.params;
    // const is_cache = await connect_redis_hit(`All-Department-App-${aid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Application Department from Cache 🙌",
    //     allDB: is_cache.ins_depart?.depart,
    //   });
    const admin_ins = await Admission.findById({ _id: aid }).select(
      "institute"
    );
    const ins_depart = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    })
      .select("insName")
      .populate({
        path: "depart",
        select: "dName",
        populate: {
          path: "departmentSelectBatch",
          select: "batchName",
        },
      });

    if (ins_depart?.depart?.length > 0) {
      // const departEncrypt = await encryptionPayload(ins_depart?.depart);
      // const cached = await connect_redis_miss(
      //   `All-Department-App-${aid}`,
      //   ins_depart?.depart
      // );
      res.status(200).send({
        message: "All Department with batch from DB 🙌",
        // allDB: cached.ins_depart?.depart,
        allDB: ins_depart?.depart,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Department with No batch", allDB: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStudentCancelAdmissionMode = async (req, res) => {
  try {
    const { statusId, aid, sid } = req.params;
    if (!sid && !aid && !statusId)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const status = await Status.findById({ _id: statusId });
    const apply = await NewApplication.findById({ _id: aid });
    const student = await Student.findById({ _id: sid });
    if (apply?.selectedApplication?.length > 0) {
      apply?.selectedApplication?.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.payment_status = "Cancelled";
        }
      });
      await apply.save();
    }
    status.for_selection = "No";
    if (
      student.admissionRemainFeeCount >=
      student?.fee_structure?.total_admission_fees
    ) {
      student.admissionRemainFeeCount -=
        student?.fee_structure?.total_admission_fees;
    }
    await Promise.all([status.save(), student.save()]);
    res
      .status(200)
      .send({ message: "Cancel Admission Selection", cancel_status: true });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStudentAdmissionFees = async (req, res) => {
  try {
    const { sid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    // const is_cache = await connect_redis_hit(`One-Student-AppFees-${sid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Admission Fees of One Student from Cache 🙌",
    //     allDB: is_cache.ins_depart?.depart,
    //   });
    const student = await Student.findById({ _id: sid }).select(
      "remainingFeeList"
    );
    const all_remain = await RemainingList.find({
      _id: { $in: student?.remainingFeeList },
    })
      .limit(limit)
      .skip(skip)
      .select(
        "applicable_fee remaining_fee exempted_fee paid_fee refund_fee status created_at"
      )
      .populate({
        path: "appId",
        select: "applicationName",
      })
      .populate({
        path: "remaining_array",
        populate: {
          path: "fee_receipt",
        },
      })
      .populate({
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
      })
      .populate({
        path: "batchId",
        select: "batchName",
      });

    if (all_remain?.length > 0) {
      // const arrayEncrypt = await encryptionPayload(all_remain);
      // const cached = await connect_redis_miss(
      //   `One-Student-AppFees-${sid}`,
      //   all_remain
      // );
      res.status(200).send({
        message: "All Admission Fees",
        get: true,
        // array: cached.all_remain,
        array: all_remain,
        // student: student,
      });
    } else {
      res.status(200).send({
        message: "No Admission Fees",
        get: false,
        array: [],
        // student: student,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionCollectDocs = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { mode, type, amount } = req.body;
    if (!sid && !aid && !mode && !type && !amount)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        docs_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    for (let app of apply.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.selectedApplication.pull(app._id);
      } else {
      }
    }
    apply.confirmedApplication.push({
      student: student._id,
      payment_status: mode,
      install_type: type,
      fee_remain: parseInt(amount),
    });
    apply.confirmCount += 1;
    status.content = `Your seat has been confirmed, You will be alloted your class shortly, Stay Update!`;
    status.applicationId = apply._id;
    user.applicationStatus.push(status._id);
    status.instituteId = institute._id;
    await Promise.all([apply.save(), user.save(), status.save()]);
    res.status(200).send({
      message: "Look like a party mood",
      docs_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
    const studentName = `${student?.studentFirstName} ${
      student?.studentMiddleName ? student?.studentMiddleName : ""
    } ${student?.studentLastName}`;
    await whats_app_sms_payload(
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
  } catch (e) {
    console.log(e);
  }
};

exports.oneDepartmentAllClassMaster = async (req, res) => {
  try {
    if (!req.params.did)
      throw new "Please send to department id to perform task"();
    const department = await Department.findById(req.params.did)
      .populate({
        path: "departmentClassMasters",
        select: "className",
      })
      .select("departmentClassMasters")
      .lean()
      .exec();

    if (department.departmentClassMasters?.length) {
      res.status(200).send({
        message: "All list of class master of one department",
        classMasters: department.departmentClassMasters,
      });
    } else {
      res.status(200).send({
        message: "All list of class master of one department is empty",
        classMasters: [],
      });
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
  }
};

exports.renderNewAdminInquiry = async (req, res) => {
  try {
    const { aid } = req.params;
    const file = req.file;
    const { flow_status, uid } = req.query;
    var { sample_pic } = req.body;
    if (!aid && !flow_status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately",
        access: false,
      });
    var apply = await NewApplication.findById({ _id: aid });
    var admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    });
    if (flow_status === "By Admission Admin") {
      const inquiry = new Inquiry({ ...req.body });
      if (sample_pic) {
        inquiry.inquiry_student_photo = sample_pic;
      }
      inquiry.inquiry_application = apply._id;
      inquiry.admissionAdmin = admission_admin._id;
      admission_admin.inquiryList.push(inquiry._id);
      admission_admin.queryCount += 1;
      await Promise.all([admission_admin.save(), inquiry.save()]);
      res.status(200).send({
        message: "New Inquiry By Admission Admin is Coming Ready to Handle",
        access: true,
      });
    } else if (flow_status === "By Existing User") {
      const user = await User.findById({ _id: uid });
      const inquiry = new Inquiry({ ...req.body });
      if (file) {
        var width = 200;
        var height = 200;
        var results = await uploadFile(file, width, height);
        inquiry.inquiry_student_photo = results.key;
      }
      inquiry.inquiry_application = apply._id;
      inquiry.admissionAdmin = admission_admin._id;
      admission_admin.inquiryList.push(inquiry._id);
      admission_admin.queryCount += 1;
      user.inquiryList.push(inquiry._id);
      await Promise.all([admission_admin.save(), inquiry.save(), user.save()]);
      res.status(200).send({
        message: "New Inquiry By Existing User is Coming Ready to Handle",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "You're lost in space contact to ISRO",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllInquiryQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status, search } = req.query;
    if (!aid && !status)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately",
        access: false,
      });
    const admission_admin = await Admission.findById({ _id: aid }).select(
      "inquiryList"
    );
    if (search) {
      var all_inquiry = await Inquiry.find({
        $and: [
          { _id: { $in: admission_admin?.inquiryList } },
          { inquiry_status: status },
        ],
        $or: [{ inquiry_student_name: { $regex: search, $options: "i" } }],
      })
        .select(
          "inquiry_student_name inquiry_status inquiry_student_photo createdAt reviewAt"
        )
        .populate({
          path: "inquiry_application",
          select: "applicationName",
        });
    } else {
      var all_inquiry = await Inquiry.find({
        $and: [
          { _id: { $in: admission_admin?.inquiryList } },
          { inquiry_status: status },
        ],
      })
        .limit(limit)
        .skip(skip)
        .select(
          "inquiry_student_name inquiry_status inquiry_student_photo createdAt reviewAt"
        )
        .populate({
          path: "inquiry_application",
          select: "applicationName",
        });
    }
    if (all_inquiry?.length > 0) {
      res.status(200).send({
        message:
          "Lot's of Inquiry Get Ready for Heavy Load Come up with Refreshment 😥",
        access: true,
        all_inquiry: all_inquiry,
      });
    } else {
      res.status(200).send({
        message: "No Heavy Load Enjoy 😀",
        access: false,
        all_inquiry: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneInquiryQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately",
        access: false,
      });
    const one_inquiry = await Inquiry.findById({
      _id: id,
    })
      .select(
        "inquiry_student_name inquiry_student_gender inquiry_student_dob inquiry_student_address inquiry_student_mobileNo inquiry_student_previous inquiry_student_remark reviewAt createdAt inquiry_student_photo createdAt"
      )
      .populate({
        path: "inquiry_application",
        select: "applicationName",
      });
    const custom_dob = age_calc(one_inquiry.inquiry_student_dob);
    const embed_inquiry = {
      one_inquiry: one_inquiry,
      custom_dob: `${custom_dob?.years} yrs, ${custom_dob?.months} m, ${custom_dob?.days} days`,
    };
    res.status(200).send({
      message: "One Inquiry All Details Read Carefully 😥",
      access: true,
      one_inquiry: embed_inquiry,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderRemarkInquiryQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { remark } = req.body;
    if (!id && !remark)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately",
        access: false,
      });
    const query = await Inquiry.findById({
      _id: id,
    });
    query.inquiry_student_remark = remark;
    query.inquiry_status = "Reviewed";
    query.reviewAt = new Date();
    await query.save();
    res.status(200).send({
      message: "Inquiry Reviewed Successfully 😂",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderNewDirectInquiry = async (req, res) => {
  try {
    const { id, aid } = req.params;
    const { sample_pic } = req.body;
    const file = req.file;
    if (
      !id &&
      !aid &&
      !req.body.inquiry_student_name &&
      !req.body.inquiry_student_gender &&
      !req.body.inquiry_student_dob &&
      !req.body.inquiry_student_address
    )
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const valid = await filter_unique_username(
      req.body.inquiry_student_name,
      req.body.inquiry_student_dob
    );
    if (!valid?.exist) {
      const genUserPass = bcrypt.genSaltSync(12);
      const hashUserPass = bcrypt.hashSync(valid?.password, genUserPass);
      var user = new User({
        userLegalName: req.body.inquiry_student_name,
        userGender: req.body.inquiry_student_gender,
        userDateOfBirth: req.body.inquiry_student_dob,
        username: valid?.username,
        userStatus: "Approved",
        userPhoneNumber: id,
        userPassword: hashUserPass,
        photoId: "0",
        coverId: "2",
        remindLater: custom_date_time(21),
        next_date: custom_date_time(0),
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
      await user_date_of_birth();
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
      const apply = await NewApplication.findById({ _id: aid });
      const admission_admin = await Admission.findById({
        _id: `${apply?.admissionAdmin}`,
      });
      const inquiry = new Inquiry({ ...req.body });
      if (file) {
        var width = 200;
        var height = 200;
        var results = await uploadFile(file, width, height);
        inquiry.inquiry_student_photo = results.key;
        user.profilePhoto = results.key;
      }
      if (sample_pic) {
        user.profilePhoto = sample_pic;
        inquiry.inquiry_student_photo = sample_pic;
      }
      inquiry.inquiry_application = apply._id;
      inquiry.admissionAdmin = admission_admin._id;
      admission_admin.inquiryList.push(inquiry._id);
      admission_admin.queryCount += 1;
      user.inquiryList.push(inquiry._id);
      await Promise.all([admission_admin.save(), inquiry.save(), user.save()]);
      const token = generateAccessToken(
        user?.username,
        user?._id,
        user?.userPassword
      );
      res.status(200).send({
        message:
          "Account Creation Process Completed New Inquiry is Coming Ready to Handle 😀✨",
        user,
        token: `Bearer ${token}`,
        login: true,
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

exports.renderAppEditQuery = async (req, res) => {
  try {
    const { appId } = req.params;
    if (!appId)
      return res.status(200).send({
        message: "There is a bug need to fixed immediately 😡",
        access: false,
      });
    await NewApplication.findByIdAndUpdate(appId, req.body);
    res
      .status(200)
      .send({ message: "You fixed your mistake 😁", access: true });
  } catch (e) {
    console.log(e);
  }
};

const nested_function_app = async (arg) => {
  var flag = false;
  if (arg?.receievedApplication?.length > 0) {
    flag = true;
  } else if (arg?.selectedApplication?.length > 0) {
    flag = true;
  } else if (arg?.confirmedApplication?.length > 0) {
    flag = true;
  } else if (arg?.allottedApplication?.length > 0) {
    flag = true;
  } else if (arg?.cancelApplication?.length > 0) {
    flag = true;
  } else {
    flag = false;
  }
  return flag;
};

exports.renderAppDeleteQuery = async (req, res) => {
  try {
    const { aid, appId } = req.params;
    if (!appId && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately 😡",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid });
    const ads_app = await NewApplication.findById({ _id: appId });
    const institute = await InstituteAdmin.findById({
      _id: `${ads_admin?.institute}`,
    });
    const post = await Post.findOne({ new_application: ads_app?._id });
    const flag_status = await nested_function_app(ads_app);
    if (flag_status) {
      res.status(200).send({
        message:
          "Deletion Operation Denied Some Student Already Applied for this Application 😥",
        access: false,
      });
    } else {
      ads_admin.newApplication.pull(ads_app?._id);
      if (ads_admin?.newAppCount > 0) {
        ads_admin.newAppCount -= 1;
      }
      if (institute?.postCount > 0) {
        institute.postCount -= 1;
      }
      if (institute.admissionCount > 0) {
        institute.admissionCount -= 1;
      }
      institute.posts.pull(post?._id);
      await Promise.all([institute.save(), ads_admin.save()]);
      if (ads_app?.applicationPhoto) {
        await deleteFile(ads_app?.applicationPhoto);
      }
      if (post) {
        await Post.findByIdAndDelete(post?._id);
      }
      await NewApplication.findByIdAndDelete(ads_app?._id);
      res
        .status(200)
        .send({ message: "Deletion Operation Completed 😁", access: true });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllReceiptsQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { filter_by } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    if (filter_by === "ALL_REQUEST") {
      const ads_admin = await Admission.findById({ _id: aid })
        .select("fee_receipt_request")
        .populate({
          path: "fee_receipt_request",
          populate: {
            path: "receipt",
          },
        });

      var all_requests = await nested_document_limit(
        page,
        limit,
        ads_admin?.fee_receipt_request
      );
    } else if (filter_by === "ALL_APPROVE") {
      const ads_admin = await Admission.findById({ _id: aid })
        .select("fee_receipt_approve")
        .populate({
          path: "fee_receipt_approve",
          populate: {
            path: "receipt",
          },
        });

      var all_requests = await nested_document_limit(
        page,
        limit,
        ads_admin?.fee_receipt_approve
      );
    } else if (filter_by === "ALL_REJECT") {
      const ads_admin = await Admission.findById({ _id: aid })
        .select("fee_receipt_reject")
        .populate({
          path: "fee_receipt_reject",
          populate: {
            path: "receipt",
          },
        });

      var all_requests = await nested_document_limit(
        page,
        limit,
        ads_admin?.fee_receipt_reject
      );
    } else {
      var all_requests = [];
    }
    if (all_requests?.length > 0) {
      res.status(200).send({
        message: "Lot's of Receipts Available",
        access: true,
        all_requests: all_requests,
        count: all_requests?.length,
      });
    } else {
      res.status(200).send({
        message: "No Receipts Available",
        access: false,
        all_requests: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneReceiptStatus = async (req, res) => {
  try {
    const { aid, rid } = req.params;
    const { status, reqId } = req.query;
    const { reason } = req.body;
    if (!aid && !rid && !reqId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    var ads_admin = await Admission.findById({ _id: aid });
    var one_receipt = await FeeReceipt.findById({ _id: rid });
    var one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    var one_status = await Status.findById({
      _id: `${one_receipt?.app_status}`,
    });
    if (status === "Approved") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_request.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        status: "Approved",
      });
      one_status.receipt_status = "Approved";
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "Receipt Approved";
        }
      }
    } else if (status === "Rejected") {
      for (var ele of ads_admin?.fee_receipt_request) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_request.pull(reqId);
        }
      }
      ads_admin?.request_array.pull(rid);
      ads_admin.fee_receipt_reject.push({
        receipt: one_receipt?._id,
        status: "Rejected",
        reason: reason,
      });
      one_status.receipt_status = "Rejected";
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "Receipt Rejected";
        }
      }
    } else if (status === "Over_Rejection") {
      for (var ele of ads_admin?.fee_receipt_reject) {
        if (`${ele._id}` === `${reqId}`) {
          ads_admin.fee_receipt_reject.pull(reqId);
        }
      }
      ads_admin.fee_receipt_approve.push({
        receipt: one_receipt?._id,
        status: "Approved",
        over_status: "After Rejection Approved By Admission Admin",
      });
      one_status.receipt_status = "Approved";
      one_receipt.re_apply = false;
      for (var ref of one_app?.selectedApplication) {
        if (`${ref.student}` === `${one_receipt?.student}`) {
          ref.payment_status = "Receipt Approved";
        }
      }
      await one_receipt.save();
    } else {
    }
    await Promise.all([ads_admin.save(), one_status.save(), one_app.save()]);
    res
      .status(200)
      .send({ message: `Receipts ${status} by Admission Admin`, access: true });
  } catch (e) {
    console.log(e);
  }
};

exports.renderOneReceiptReApply = async (req, res) => {
  try {
    const { sid, rid } = req.params;
    if (!sid && !rid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const one_receipt = await FeeReceipt.findByIdAndUpdate(rid, req.body);
    const status = await Status.findById({ _id: sid });
    const one_app = await NewApplication.findById({
      _id: `${one_receipt?.application}`,
    });
    const ads_admin = await Admission.findById({
      _id: `${one_app?.admissionAdmin}`,
    }).select("fee_receipt_reject");
    one_receipt.re_apply = true;
    status.receipt_status = "Requested";
    await Promise.all([status.save(), one_receipt.save()]);
    res
      .status(200)
      .send({ message: "Your Receipts Under Processing", access: "true" });
    for (var ref of one_app?.selectedApplication) {
      if (`${ref.student}` === `${one_receipt?.student}`) {
        ref.payment_status = "Receipt Requested";
      }
    }
    await one_app.save();
    for (var all of ads_admin?.fee_receipt_reject) {
      if (`${all?.receipt}` === `${one_receipt?._id}`) {
        ads_admin.fee_receipt_reject.pull(all?._id);
        ads_admin.fee_receipt_reject.unshift(all?._id);
      }
    }
    await ads_admin.save();
  } catch (e) {
    console.log(e);
  }
};

exports.renderTriggerAlarmQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });

    const ads_admin = await Admission.findById({ _id: aid }).select(
      "alarm_count"
    );

    if (alarm_count > 3) {
      res.status(200).send({
        message:
          "You have only three attempts of sending notification to students for more contact Qviple",
        access: false,
      });
    } else {
      await dueDateAlarm();
      ads_admin.alarm_count += 1;
      await ads_admin.save();
      res.status(200).send({
        message: `Fees Alarm is triggered successfully remaining ${ads_admin.alarm_count} attempts`,
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdminSelectMode = async (req, res) => {
  try {
    const { aid, sid } = req.params;
    if (!aid && !sid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const apply = await NewApplication.findById({ _id: aid }).select(
      "selectedApplication admissionAdmin"
    );
    const student = await Student.findById({ _id: sid });
    const aStatus = new Status({});
    const status = await Status.findOne({
      $and: [{ _id: student?.active_status }, { applicationId: apply?._id }],
    });
    const user = await User.findById({ _id: `${student.user}` });
    const admin_ins = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    });
    const institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    });
    if (status) {
      if (apply?.selectedApplication?.length > 0) {
        apply?.selectedApplication?.forEach((ele) => {
          if (`${ele.student}` === `${student._id}`) {
            ele.payment_status = "offline";
          }
        });
        await apply.save();
      }
      status.payMode = "offline";
      status.sub_payment_mode = "By Cash";
      status.isPaid = "Not Paid";
      status.for_selection = "No";
      aStatus.content = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees or contact institute if neccessory`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      aStatus.instituteId = institute._id;
      // student.active_status.pull(status?._id);
      await Promise.all([
        status.save(),
        aStatus.save(),
        user.save(),
        // student.save(),
      ]);
      res.status(200).send({
        message: "Lets do some excercise visit institute",
        access: true,
      });
      invokeMemberTabNotification(
        "Admission Status",
        aStatus.content,
        "Application Status",
        user._id,
        user.deviceToken
      );
    } else {
      res.status(200).send({
        message: "You lost in space",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAdminStudentCancelSelectQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admission_admin = await Admission.findById({
      _id: `${apply?.admissionAdmin}`,
    }).select("institute");
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    const aStatus = await Status.findOne({
      $and: [{ _id: student?.active_status }, { applicationId: apply?._id }],
    });
    for (let app of apply.selectedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.selectedApplication.pull(app._id);
      } else {
      }
    }
    if (apply.selectCount > 0) {
      apply.selectCount -= 1;
    }
    aStatus.isPaid = "Not Paid";
    aStatus.for_selection = "No";
    status.content = `You admission is cancelled for ${apply.applicationName}. Due to no further activity `;
    status.applicationId = apply._id;
    status.studentId = student._id;
    user.applicationStatus.push(status._id);
    status.instituteId = admission_admin?.institute;
    // student.active_status.pull(aStatus?._id);
    await Promise.all([
      apply.save(),
      // student.save(),
      user.save(),
      status.save(),
      aStatus.save(),
    ]);
    res.status(200).send({
      message: `Best of luck for next time 😥`,
      cancel_status: true,
    });
    invokeMemberTabNotification(
      "Admission Status",
      status.content,
      "Application Status",
      user._id,
      user.deviceToken
    );
  } catch (e) {
    console.log(e);
  }
};

exports.renderInstituteCompletedAppQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { search } = req.query;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        cancel_status: false,
      });

    const ads_admin = await Admission.findById({
      _id: aid,
    }).select("newApplication");

    const all_completed = await NewApplication.find({
      $and: [
        { _id: { $in: ads_admin?.newApplication } },
        { applicationStatus: "Completed" },
      ],
      $or: [{ applicationName: { $regex: search, $options: "i" } }],
    }).select(
      "applicationName applicationDepartment applicationMaster applicationBatch"
    );
    if (all_completed?.length > 0) {
      res.status(200).send({
        message: "Explore All Completed Array",
        access: true,
        all_completed: all_completed,
      });
    } else {
      res.status(200).send({
        message: "Explore All Completed Array",
        access: false,
        all_completed: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditStudentFeeStructureQuery = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { fee_struct } = req.body;
    if (!sid && !aid && !fee_struct)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        access: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const student = await Student.findById({ _id: sid });
    const remain_list = await RemainingList.findOne({
      $and: [
        { _id: { $in: student?.remainingFeeList } },
        { appId: apply?._id },
      ],
    });
    const structure = await FeeStructure.findById({ _id: fee_struct });
    const status = await Status.findOne({
      $and: [{ _id: student?.active_status }, { applicationId: apply?._id }],
    });
    var flag = false;
    if (remain_list) {
      for (var ref of remain_list?.remaining_array) {
        if (`${ref?.appId}` === `${apply?._id}` && ref.status === "Paid") {
          flag = true;
          break;
        } else {
          flag = false;
        }
      }
    }
    if (flag) {
      res.status(200).send({
        message: `Student Already Paid the Fees Sorry Structure Change is not possible`,
        access: true,
      });
    } else {
      for (let app of apply.selectedApplication) {
        if (`${app.student}` === `${student._id}`) {
          app.fee_remain = structure.total_admission_fees;
        }
      }
      status.admissionFee = structure.total_admission_fees;
      status.feeStructure = structure?._id;
      student.fee_structure = structure?._id;
      await Promise.all([apply.save(), student.save(), status.save()]);
      res.status(200).send({
        message: `congrats for new fee structure `,
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderAddDocumentQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { doc_name, doc_key } = req.body;
    if (!aid && !doc_name && !doc_key)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid });
    ads_admin.required_document.push({
      document_name: doc_name,
      document_key: doc_key,
    });
    ads_admin.required_document_count += 1;
    await ads_admin.save();
    res.status(200).send({
      message: "New Document Added to Required Document",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderAllDocumentArray = async (req, res) => {
  try {
    const { aid } = req.params;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    if (!aid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid }).select(
      "required_document"
    );

    const all_docs = await nested_document_limit(
      page,
      limit,
      ads_admin?.required_document
    );
    if (all_docs?.length > 0) {
      res.status(200).send({
        message: "Explore All Documents",
        access: true,
        all_docs: all_docs,
        count: ads_admin?.required_document?.length,
      });
    } else {
      res.status(200).send({
        message: "No Document Available",
        access: false,
        all_docs: [],
        count: 0,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.renderEditDocumentQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { doc } = req.body;
    if (!aid && !doc)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid }).select(
      "required_document"
    );

    for (var ref of ads_admin?.required_document) {
      if (`${ref?._id}` === `${doc?.id}`) {
        ref.document_name = doc.name;
        ref.document_key = doc.newKey;
      }
    }
    if (doc?.oldKey) {
      await deleteFile(doc?.oldKey);
    }
    await ads_admin.save();
    res.status(200).send({
      message: "Document Updated",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderDeleteExistingDocument = async (req, res) => {
  try {
    const { aid, docId } = req.params;
    var old_image;
    if (!aid && !docId)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediatley",
        access: false,
      });
    const ads_admin = await Admission.findById({ _id: aid }).select(
      "required_document"
    );

    for (var ref of ads_admin?.required_document) {
      if (`${ref?._id}` === `${docId}`) {
        old_image = ref?.document_key;
        ads_admin.required_document.pull(ref?._id);
        if (ads_admin?.required_document_count > 0) {
          ads_admin.required_document_count -= 1;
        }
      }
    }

    if (old_image) {
      await deleteFile(old_image);
    }
    await ads_admin.save();
    res.status(200).send({
      message: "Deletion Operation Completed",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};
