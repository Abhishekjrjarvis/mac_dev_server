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
const {
  uploadDocFile,
  uploadFile,
  uploadPostImageFile,
} = require("../../S3Configuration");
const fs = require("fs");
const util = require("util");
const unlinkFile = util.promisify(fs.unlink);
const invokeFirebaseNotification = require("../../Firebase/firebase");
const Post = require("../../models/Post");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
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
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionDetailInfo = async (req, res) => {
  try {
    const { aid } = req.params;
    // const is_cache = await connect_redis_hit(`Admission-Detail-${aid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Detail Admission Admin from Cache 🙌",
    //     answer: is_cache.admission,
    //   });
    const admission = await Admission.findById({ _id: aid })
      .select(
        "admissionAdminEmail admissionAdminPhoneNumber completedCount remainingFee admissionAdminAbout photoId coverId photo queryCount newAppCount cover offlineFee onlineFee remainingFeeCount"
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
    res.status(200).send({
      message: "All Detail Admission Admin from DB 🙌",
      // admission: cached.admission,
      admission: admission,
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
    req.body.admissionFee = parseInt(req.body.admissionFee);
    req.body.applicationSeats = req.body.applicationSeats
      ? parseInt(req.body.applicationSeats)
      : 0;
    var admission = await Admission.findById({ _id: aid });
    var institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const newApply = new NewApplication({ ...req.body });
    if (req.file) {
      const file = req.file;
      const results = await uploadPostImageFile(file);
      newApply.applicationPhoto = results.key;
      newApply.photoId = "0";
    }
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
    newApply.one_installments = req.body.one_installments
      ? JSON.parse(req.body.one_installments)
      : newApply.one_installments;
    newApply.two_installments = req.body.two_installments
      ? JSON.parse(req.body.two_installments)
      : newApply.two_installments;
    newApply.three_installments = req.body.three_installments
      ? JSON.parse(req.body.three_installments)
      : newApply.three_installments;
    newApply.four_installments = req.body.four_installments
      ? JSON.parse(req.body.four_installments)
      : newApply.four_installments;
    newApply.five_installments = req.body.five_installments
      ? JSON.parse(req.body.five_installments)
      : newApply.five_installments;
    newApply.six_installments = req.body.six_installments
      ? JSON.parse(req.body.six_installments)
      : newApply.six_installments;
    newApply.seven_installments = req.body.seven_installments
      ? JSON.parse(req.body.seven_installments)
      : newApply.seven_installments;
    newApply.eight_installments = req.body.eight_installments
      ? JSON.parse(req.body.eight_installments)
      : newApply.eight_installments;
    newApply.nine_installments = req.body.nine_installments
      ? JSON.parse(req.body.nine_installments)
      : newApply.nine_installments;
    newApply.ten_installments = req.body.ten_installments
      ? JSON.parse(req.body.ten_installments)
      : newApply.ten_installments;
    newApply.eleven_installments = req.body.eleven_installments
      ? JSON.parse(req.body.eleven_installments)
      : newApply.eleven_installments;
    newApply.tweleve_installments = req.body.tweleve_installments
      ? JSON.parse(req.body.tweleve_installments)
      : newApply.tweleve_installments;
    newApply.total_installments = req.body.total_installments;
    newApply.admissionProcess = `1. Apply for admission from here (Below)
    2. Fill Required form and submit application
    3. Wait for approval from School/College/Tution (you will get notify on Qviple) After Approval
    4. Confirm Your application by paying fees online OR you can opt for offline fees as well.
    5. After payment, your admission will be confirmed
    6. Visit school/college with required documents for verification and submission of original documents e.g. Leaving Certificate. (For tuition and coaching verification is not necessary)
    7. After documents verification, you will be allotted class
    8. Enjoy you Learning..`;
    await Promise.all([admission.save(), newApply.save(), institute.save()]);
    if (req.file) {
      await unlinkFile(req.file?.path);
    }
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
      ? JSON.parse(req.body?.optionalSubject)
      : [];
    for (let fileObject in req.files) {
      for (let singleFile of req.files[fileObject]) {
        if (fileObject === "file") {
          const width = 200;
          const height = 200;
          const results = await uploadFile(singleFile, width, height);
          student.photoId = "0";
          student.studentProfilePhoto = results.Key;
          await unlinkFile(singleFile.path);
        } else {
          const uploadedFile = await file_to_aws(singleFile);
          if (fileObject === "addharFrontCard")
            student.studentAadharFrontCard = uploadedFile.documentKey;
          else if (fileObject === "addharBackCard")
            student.studentAadharBackCard = uploadedFile.documentKey;
          else if (fileObject === "bankPassbook")
            student.studentBankPassbook = uploadedFile.documentKey;
          else if (fileObject === "casteCertificate")
            student.studentCasteCertificatePhoto = uploadedFile.documentKey;
          else {
            student.studentDocuments.push({
              documentName: fileObject,
              documentKey: uploadedFile.documentKey,
              documentType: uploadedFile.documentType,
            });
          }
        }
      }
    }
    if (studentOptionalSubject?.length > 0) {
      student.studentOptionalSubject?.push(...studentOptionalSubject);
    }
    status.content = `You have applied for ${apply.applicationName} has been filled successfully.Stay updated to check status of your application.`;
    status.applicationId = apply._id;
    user.student.push(student._id);
    user.applyApplication.push(apply._id);
    student.user = user._id;
    user.applicationStatus.push(status._id);
    apply.receievedApplication.push({
      student: student._id,
      fee_remain: apply.admissionFee,
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
    if (!sid && !aid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        select_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    for (let app of apply.receievedApplication) {
      if (`${app.student}` === `${student._id}`) {
        apply.receievedApplication.pull(app._id);
      } else {
      }
    }
    apply.selectedApplication.push({
      student: student._id,
      fee_remain: apply.admissionFee,
    });
    apply.selectCount += 1;
    student.admissionRemainFeeCount += apply.admissionFee;
    status.content = `You have been selected for ${apply.applicationName}. Confirm your admission`;
    status.applicationId = apply._id;
    status.for_selection = "Yes";
    status.studentId = student._id;
    status.admissionFee = apply.admissionFee;
    user.applicationStatus.push(status._id);
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
    const student = await Student.findById({ _id: sid });
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
          ele.payment_status = "offline";
        }
      });
      await apply.save();
    }
    (status.payMode = "offline"), (status.isPaid = "Not Paid");
    status.for_selection = "No";
    aStatus.content = `Your admission is on hold please visit ${institute.insName}, ${institute.insDistrict}. with required fees or contact institute if neccessory`;
    aStatus.applicationId = apply._id;
    user.applicationStatus.push(aStatus._id);
    await Promise.all([status.save(), aStatus.save(), user.save()]);
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

const add_all_installment = async (arg1, arg2, arg3, amount) => {
  try {
    if (arg1.two_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount:
          arg1.one_installments.fees - amount + arg1.two_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Second Installment",
        isEnable: true,
        dueDate: arg1.two_installments.dueDate,
      });
    }
    if (arg1.three_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.three_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Third Installment",
        dueDate: arg1.three_installments.dueDate,
      });
    }
    if (arg1.four_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.four_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Four Installment",
        dueDate: arg1.four_installments.dueDate,
      });
    }
    if (arg1.five_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.five_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Five Installment",
        dueDate: arg1.five_installments.dueDate,
      });
    }
    if (arg1.six_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount:
          arg1.one_installments.fees - amount + arg1.six_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Six Installment",
        dueDate: arg1.six_installments.dueDate,
      });
    }
    if (arg1.seven_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.seven_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Seven Installment",
        dueDate: arg1.seven_installments.dueDate,
      });
    }
    if (arg1.eight_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.eight_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Eight Installment",
        dueDate: arg1.eight_installments.dueDate,
      });
    }
    if (arg1.nine_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.nine_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Nine Installment",
        dueDate: arg1.nine_installments.dueDate,
      });
    }
    if (arg1.ten_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.ten_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Ten Installment",
        dueDate: arg1.ten_installments.dueDate,
      });
    }
    if (arg1.eleven_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.eleven_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Eleven Installment",
        dueDate: arg1.eleven_installments.dueDate,
      });
    }
    if (arg1.tweleve_installments.fees > 0) {
      arg3.remainingFeeList.push({
        remainAmount: arg1.tweleve_installments.fees,
        appId: arg1._id,
        status: "Not Paid",
        instituteId: arg2,
        installmentValue: "Tweleve Installment",
        dueDate: arg1.tweleve_installments.dueDate,
      });
    }
    await arg3.save();
  } catch {}
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
    const student = await Student.findById({ _id: sid });
    const user = await User.findById({ _id: `${student.user}` });
    const status = new Status({});
    const order = new OrderPayment({});
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
    if (price && price > apply.admissionFee && finance?._id !== "") {
      res.status(404).send({
        message:
          "I think you are lost in this process take a break check finance Or Price",
        status: false,
      });
    } else {
      if (price < apply.admissionFee) {
        admission.remainingFee.push(student._id);
        if (student.admissionRemainFeeCount <= apply.admissionFee) {
          student.admissionRemainFeeCount =
            student.admissionRemainFeeCount - price;
        }
        apply.remainingFee += apply.admissionFee - price;
        admission.remainingFeeCount += apply.admissionFee - price;
        student.remainingFeeList.push({
          remainAmount: price,
          appId: apply._id,
          status: "Paid",
          instituteId: institute._id,
          installmentValue: "First Installment",
          mode: mode,
          isEnable: true,
        });
        await add_all_installment(apply, institute._id, student, price);
      } else if (price == apply.admissionFee) {
        student.remainingFeeList.push({
          remainAmount: price,
          appId: apply._id,
          status: "Paid",
          instituteId: institute._id,
          installmentValue: "No Installment",
          mode: mode,
          isEnable: true,
        });
        if (student.admissionRemainFeeCount >= apply.admissionFee) {
          student.admissionRemainFeeCount -= apply.admissionFee;
        }
      }
      if (apply.total_installments == "1") {
        finance.financeExemptBalance +=
          apply.one_installments.fees == price
            ? 0
            : apply.one_installments.fees - price;
        admission.remainingFee.pull(student._id);
      }
      if (mode === "Offline") {
        admission.offlineFee += price;
        apply.collectedFeeCount += price;
        apply.offlineFee += price;
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
      for (let app of apply.selectedApplication) {
        if (`${app.student}` === `${student._id}`) {
          app.payment_status = mode;
          app.install_type =
            apply.admissionFee == price
              ? "One Time Fees Paid"
              : "First Installment Paid";
        } else {
        }
      }
      student.admissionPaidFeeCount += price;
      student.paidFeeList.push({
        paidAmount: price,
        appId: apply._id,
      });
      status.content = `Welcome to Institute ${institute.insName}, ${institute.insDistrict}.
      Your seat has been confirmed, You will be alloted your class shortly, Stay Update!`;
      status.applicationId = apply._id;
      user.applicationStatus.push(status._id);
      await Promise.all([
        admission.save(),
        apply.save(),
        student.save(),
        finance.save(),
        user.save(),
        order.save(),
        institute.save(),
        s_admin.save(),
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
    }
  } catch (e) {
    console.log(e);
  }
};

exports.cancelAdmissionApplication = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount } = req.body;
    if (!sid && !aid && !amount)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        refund_status: false,
      });
    var price = parseInt(amount);
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
    if (
      price &&
      price > apply.admissionFee &&
      price <= finance.financeTotalBalance &&
      price <= admission.offlineFee
    ) {
      res.status(200).send({
        message: "insufficient Balance in Finance Department to make refund",
      });
    } else {
      apply.cancelCount += 1;
      if (apply.offlineFee >= price) {
        apply.offlineFee -= price;
      }
      if (apply.collectedFeeCount >= price) {
        apply.collectedFeeCount -= price;
      }
      if (admission.offlineFee >= price) {
        admission.offlineFee -= price;
      }
      if (finance.financeAdmissionBalance >= price) {
        finance.financeAdmissionBalance -= price;
      }
      if (finance.financeTotalBalance >= price) {
        finance.financeTotalBalance -= price;
      }
      aStatus.content = `Your application for ${apply?.applicationDepartment?.dName} has been rejected. Best Of Luck for next time`;
      aStatus.applicationId = apply._id;
      user.applicationStatus.push(aStatus._id);
      student.admissionRemainFeeCount = 0;
      if (student.admissionPaidFeeCount > 0) {
        student.admissionPaidFeeCount -= price;
      }
      student.refundAdmission.push({
        refund_status: "Refund",
        refund_reason: "Cancellation of Admission",
        refund_amount: price,
      });
      for (var pay of student.paidFeeList) {
        if (`${pay.appId}` === `${apply._id}`) {
          if (pay.paidAmount >= price) {
            pay.paidAmount -= price;
          }
        }
      }
      const filter_student_install = student?.remainingFeeList.filter((stu) => {
        if (`${stu.appId}` === `${apply._id}` && stu.status === "Not Paid")
          return stu;
      });
      for (var can = 0; can < filter_student_install.length; can++) {
        student?.remainingFeeList.pull(filter_student_install[can]);
      }
      await Promise.all([
        apply.save(),
        student.save(),
        finance.save(),
        admission.save(),
        aStatus.save(),
        user.save(),
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
          if (admission.remainingFeeCount >= price) {
            admission.remainingFeeCount -= price;
          }
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
        student.studentGRNO = `Q${institute.ApproveStudent.length}`;
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
        ]);
        if (student.studentGender === "Male") {
          classes.boyCount += 1;
          batch.student_category.boyCount += 1;
        } else if (student.studentGender === "Female") {
          classes.girlCount += 1;
          batch.student_category.girlCount += 1;
        } else {
          classes.otherCount += 1;
          batch.student_category.otherCount += 1;
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

const second_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_two = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Second Installment"
        ) {
          ele.status = "Paid";
          flex_two = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Third Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_two;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "2") {
      kwargs.financeExemptBalance +=
        arg2.two_installments.fees == amount
          ? 0
          : arg2.two_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
      if (
        arg2.two_installments.fees != amount &&
        arg1.admissionRemainFeeCount >= amount
      ) {
        // arg1.admissionRemainFeeCount -= amount;
      }
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const third_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_three = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Third Installment"
        ) {
          ele.status = "Paid";
          flex_three = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Four Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_three;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "3") {
      kwargs.financeExemptBalance +=
        arg2.three_installments.fees == amount
          ? 0
          : arg2.three_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.three_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const four_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_four = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Four Installment"
        ) {
          ele.status = "Paid";
          flex_four = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Five Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_four;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "4") {
      kwargs.financeExemptBalance +=
        arg2.four_installments.fees == amount
          ? 0
          : arg2.four_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.four_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const five_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_five = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Five Installment"
        ) {
          ele.status = "Paid";
          flex_five = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Six Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_five;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "5") {
      kwargs.financeExemptBalance +=
        arg2.five_installments.fees == amount
          ? 0
          : arg2.five_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.five_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const six_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_six = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Six Installment"
        ) {
          ele.status = "Paid";
          flex_six = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Seven Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_six;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "6") {
      kwargs.financeExemptBalance +=
        arg2.six_installments.fees == amount
          ? 0
          : arg2.six_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.six_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch (e) {
    console.log(e);
  }
};

const seven_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_seven = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Seven Installment"
        ) {
          ele.status = "Paid";
          flex_seven = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eight Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_seven;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "7") {
      kwargs.financeExemptBalance +=
        arg2.seven_installments.fees == amount
          ? 0
          : arg2.seven_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.seven_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const eight_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_eight = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eight Installment"
        ) {
          ele.status = "Paid";
          flex_eight = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Nine Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_eight;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "8") {
      kwargs.financeExemptBalance +=
        arg2.eight_installments.fees == amount
          ? 0
          : arg2.eight_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.eight_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const nine_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_nine = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Nine Installment"
        ) {
          ele.status = "Paid";
          flex_nine = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Ten Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_nine;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "9") {
      kwargs.financeExemptBalance +=
        arg2.nine_installments.fees == amount
          ? 0
          : arg2.nine_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.nine_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const ten_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_ten = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Ten Installment"
        ) {
          ele.status = "Paid";
          flex_ten = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eleven Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_ten;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "10") {
      kwargs.financeExemptBalance +=
        arg2.ten_installments.fees == amount
          ? 0
          : arg2.ten_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.ten_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const eleven_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    var flex_eleven = 0;
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Eleven Installment"
        ) {
          ele.status = "Paid";
          flex_eleven = ele.remainAmount - amount;
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Tweleve Installment"
        ) {
          ele.remainAmount = ele.remainAmount + flex_eleven;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "11") {
      kwargs.financeExemptBalance +=
        arg2.eleven_installments.fees == amount
          ? 0
          : arg2.eleven_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.eleven_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

const tweleve_payable = async (arg1, arg2, mode, amount, arg4, kwargs) => {
  try {
    if (arg1?.remainingFeeList?.length > 0) {
      arg1?.remainingFeeList.forEach(async (ele) => {
        if (
          arg4?.newApplication?.includes(`${ele.appId}`) &&
          ele.installmentValue == "Tweleve Installment"
        ) {
          ele.status = "Paid";
          ele.remainAmount = amount;
          ele.mode = mode;
          ele.originalFee = arg2.admissionFee;
          ele.isEnable = true;
        }
      });
    }
    if (arg2.total_installments == "12") {
      kwargs.financeExemptBalance +=
        arg2.tweleve_installments.fees == amount
          ? 0
          : arg2.tweleve_installments.fees - amount;
      arg4.remainingFee.pull(arg1._id);
    }
    if (
      arg2.tweleve_installments.fees != amount &&
      arg1.admissionRemainFeeCount >= amount
    ) {
      // arg1.admissionRemainFeeCount -= amount;
    }
    await Promise.all([arg1.save(), kwargs.save(), arg4.save()]);
  } catch {}
};

// const exempt_offline = async (arg, kwargs, amount) => {
//   try {
//     if (arg.total_installments == "2") {
//       kwargs.financeExemptBalance +=
//         arg.two_installments.fees == amount
//           ? 0
//           : arg.two_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "3") {
//       kwargs.financeExemptBalance +=
//         arg.three_installments.fees == amount
//           ? 0
//           : arg.three_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "4") {
//       kwargs.financeExemptBalance +=
//         arg.four_installments.fees == amount
//           ? 0
//           : arg.four_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "5") {
//       kwargs.financeExemptBalance +=
//         arg.five_installments.fees == amount
//           ? 0
//           : arg.five_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "6") {
//       kwargs.financeExemptBalance +=
//         arg.six_installments.fees == amount
//           ? 0
//           : arg.six_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "7") {
//       kwargs.financeExemptBalance +=
//         arg.seven_installments.fees == amount
//           ? 0
//           : arg.seven_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "8") {
//       kwargs.financeExemptBalance +=
//         arg.eight_installments.fees == amount
//           ? 0
//           : arg.eight_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "9") {
//       kwargs.financeExemptBalance +=
//         arg.nine_installments.fees == amount
//           ? 0
//           : arg.nine_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "10") {
//       kwargs.financeExemptBalance +=
//         arg.ten_installments.fees == amount
//           ? 0
//           : arg.ten_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "11") {
//       kwargs.financeExemptBalance +=
//         arg.eleven_installments.fees == amount
//           ? 0
//           : arg.eleven_installments.fees - amount;
//       await kwargs.save();
//     } else if (arg.total_installments == "12") {
//       kwargs.financeExemptBalance +=
//         arg.tweleve_installments.fees == amount
//           ? 0
//           : arg.tweleve_installments.fees - amount;
//       await kwargs.save();
//     } else {
//     }
//   } catch {}
// };

const render_installment = async (
  type,
  student,
  apply,
  mode,
  price,
  admin_ins,
  finance
) => {
  try {
    if (type === "Second Installment") {
      await second_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Third Installment") {
      await third_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Four Installment") {
      await four_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Five Installment") {
      await five_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Six Installment") {
      await six_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Seven Installment") {
      await seven_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Eight Installment") {
      await eight_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Nine Installment") {
      await nine_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Ten Installment") {
      await ten_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Eleven Installment") {
      await eleven_payable(student, apply, mode, price, admin_ins, finance);
    } else if (type === "Tweleve Installment") {
      await tweleve_payable(student, apply, mode, price, admin_ins, finance);
    } else {
    }
  } catch {}
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
    var student = await Student.findById({ _id: sid }).select(
      "user admissionRemainFeeCount admissionPaidFeeCount remainingFeeList paidFeeList"
    );
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
    const notify = new StudentNotification({});
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
    await render_installment(
      type,
      student,
      apply,
      mode,
      price,
      admin_ins,
      finance
    );
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
      finance.financeTotalBalance += price;
      finance.financeAdmissionBalance += price;
      finance.financeSubmitBalance += price;
    } else {
    }
    // await exempt_offline(apply, finance, price);
    for (var stu of student.paidFeeList) {
      if (`${stu.appId}` === `${apply._id}`) {
        stu.paidAmount += price;
      }
    }
    await Promise.all([
      admin_ins.save(),
      student.save(),
      apply.save(),
      finance.save(),
      institute.save(),
      order.save(),
      s_admin.save(),
    ]);
    res.status(200).send({
      message: "Balance Pool increasing with price Operation complete",
      paid: true,
      // admission: admin_ins,
      // app: apply,
      // student: student,
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
        "applicationName applicationType applicationAbout admissionProcess applicationEndDate applicationStartDate admissionFee applicationPhoto photoId applicationSeats receievedCount selectCount confirmCount applicationStatus cancelCount allotCount onlineFee offlineFee remainingFee collectedFeeCount total_installments one_installments two_installments"
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
    if (student.admissionRemainFeeCount >= apply.admissionFee) {
      student.admissionRemainFeeCount -= apply.admissionFee;
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
    // const is_cache = await connect_redis_hit(`One-Student-AppFees-${sid}`);
    // if (is_cache?.hit)
    //   return res.status(200).send({
    //     message: "All Admission Fees of One Student from Cache 🙌",
    //     allDB: is_cache.ins_depart?.depart,
    //   });
    const student = await Student.findById({ _id: sid }).select(
      "remainingFeeList"
    );

    if (student?.remainingFeeList?.length > 0) {
      // const arrayEncrypt = await encryptionPayload(student?.remainingFeeList);
      // const cached = await connect_redis_miss(
      //   `One-Student-AppFees-${sid}`,
      //   student?.remainingFeeList
      // );
      res.status(200).send({
        message: "All Admission Fees",
        get: true,
        // array: cached.student?.remainingFeeList,
        array: student?.remainingFeeList,
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
    const { mode, type } = req.query;
    if (!sid && !aid && !mode && !type)
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
    });
    apply.confirmCount += 1;
    status.content = `Welcome to ${institute.insName}, ${institute.insDistrict}.
      Please visit with Required Documents to confirm your admission`;
    status.applicationId = apply._id;
    user.applicationStatus.push(status._id);
    await Promise.all([apply.save(), user.save()]);
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
