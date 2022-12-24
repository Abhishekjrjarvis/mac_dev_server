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
    const admission = await Admission.findById({ _id: aid })
      .select(
        "admissionAdminEmail admissionAdminPhoneNumber remainingFee admissionAdminAbout photoId coverId photo queryCount newAppCount cover offlineFee onlineFee remainingFeeCount completedCount"
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
    res.status(200).send({ message: "Admission Detail", admission });
  } catch {}
};

exports.retieveAdmissionAdminAllApplication = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
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
      res.status(200).send({
        message: "Ongoing Application Lets Explore",
        ongoing,
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
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
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
      res.status(200).send({
        message: "Completed Application Lets Explore",
        completed,
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
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
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
      res.status(200).send({
        message: "Completed Application Lets Explore",
        completed,
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
    req.body.applicationSeats = parseInt(req.body.applicationSeats);
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
    admission.newApplication.push(newApply._id);
    admission.newAppCount += 1;
    newApply.admissionAdmin = admission._id;
    institute.admissionCount += 1;
    newApply.one_installments = JSON.parse(req.body.one_installments);
    newApply.two_installments = JSON.parse(req.body.two_installments);
    newApply.three_installments = JSON.parse(req.body.three_installments);
    newApply.four_installments = JSON.parse(req.body.four_installments);
    newApply.five_installments = JSON.parse(req.body.five_installments);
    newApply.six_installments = JSON.parse(req.body.six_installments);
    newApply.seven_installments = JSON.parse(req.body.seven_installments);
    newApply.eight_installments = JSON.parse(req.body.eight_installments);
    newApply.nine_installments = JSON.parse(req.body.nine_installments);
    newApply.ten_installments = JSON.parse(req.body.ten_installments);
    newApply.eleven_installments = JSON.parse(req.body.eleven_installments);
    newApply.tweleve_installments = JSON.parse(req.body.tweleve_installments);
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
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { id } = req.params;
    const skip = (page - 1) * limit;
    const ins_apply = await InstituteAdmin.findById({ _id: id }).select(
      "admissionDepart"
    );
    if (ins_apply?.admissionDepart?.length > 0) {
      const apply = await Admission.findById({
        _id: `${ins_apply?.admissionDepart[0]}`,
      });
      const newApp = await NewApplication.find({
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

      // if(newApp?.length > 0){
      res.status(200).send({
        message: "Lets begin new year journey",
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
    for (let file of req.files) {
      let count = 1;
      if (count === 1) {
        const width = 200;
        const height = 200;
        const results = await uploadFile(file, width, height);
        student.photoId = "0";
        student.studentProfilePhoto = results.key;
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
    status.content = `You have applied for ${apply.applicationName} has been filled successfully.
      Stay updated to check status of your application.`;
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
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid })
      .limit(limit)
      .skip(skip)
      .select("receievedCount")
      .populate({
        path: "receievedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
        },
      });

    if (apply?.receievedApplication?.length > 0) {
      res.status(200).send({
        message:
          "Lots of Request arrived make sure you come up with Tea and Snack",
        request: apply,
      });
    } else {
      res
        .status(200)
        .send({ message: "Go To Outside for Dinner", request: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllSelectApplication = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid })
      .limit(limit)
      .skip(skip)
      .select("selectCount")
      .populate({
        path: "selectedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
        },
      });

    if (apply?.selectedApplication?.length > 0) {
      res.status(200).send({
        message:
          "Lots of Selection required make sure you come up with Tea and Snack",
        select: apply,
      });
    } else {
      res.status(200).send({ message: "Go To Outside for Dinner", select: [] });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchAllConfirmApplication = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid })
      .limit(limit)
      .skip(skip)
      .select("confirmCount")
      .populate({
        path: "confirmedApplication",
        populate: {
          path: "student",
          select:
            "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto",
        },
      });

    if (apply?.confirmedApplication?.length > 0) {
      res.status(200).send({
        message:
          "Lots of Confirmation and class allot required make sure you come up with Tea and Snack",
        confirm: apply,
      });
    } else {
      res
        .status(200)
        .send({ message: "Go To Outside for Dinner", confirm: [] });
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

exports.payOfflineAdmissionFee = async (req, res) => {
  try {
    const { sid, aid } = req.params;
    const { amount, tAmount, mode } = req.body;
    if (!sid && !aid && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        confirm_status: false,
      });
    var price = parseInt(amount);
    var tPrice = parseInt(tAmount);
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
    order.payment_to_end_user_id = admission?._id;
    order.payment_by_end_user_id = user._id;
    order.payment_module_id = apply._id;
    order.payment_amount = price;
    order.payment_status = "Captured";
    order.payment_flag_to = "Credit";
    order.payment_flag_by = "Debit";
    order.payment_mode = "Offline";
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
          remainAmount: apply.admissionFee - price,
          appId: apply._id,
          status: "Not Paid",
          instituteId: institute._id,
        });
        student.admissionPaymentStatus.push({
          applicationId: apply._id,
          status: "Pending",
          mode: mode,
          installment: "Installment",
          firstInstallment: price,
          secondInstallment: tPrice,
          fee: apply.admissionFee,
        });
      } else if (price == apply.admissionFee) {
        student.admissionPaymentStatus.push({
          applicationId: apply._id,
          status: "Paid",
          mode: mode,
          installment: "No Installment",
          fee: price,
        });
        if (student.admissionRemainFeeCount >= apply.admissionFee) {
          student.admissionRemainFeeCount -= apply.admissionFee;
        }
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
          apply.selectedApplication.pull(app._id);
        } else {
        }
      }
      apply.confirmedApplication.push({
        student: student._id,
        fee_remain:
          apply.admissionFee >= price ? apply.admissionFee - price : 0,
        payment_status: mode,
        paid_status: apply.admissionFee - price == 0 ? "Paid" : "Not Paid",
      });
      apply.confirmCount += 1;
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
      res
        .status(200)
        .send({ message: "Look like a party mood", confirm_status: true });
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
      student.admissionPaymentStatus.splice({
        applicationId: apply._id,
      });
      if (student.admissionRemainFeeCount >= price) {
        student.admissionRemainFeeCount -= price;
      }
      student.refundAdmission.push({
        refund_status: "Refund",
        refund_reason: "Cancellation of Admission",
        refund_amount: price,
      });
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

exports.retrieveAdmissionApplicationClass = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
    const skip = (page - 1) * limit;
    const apply = await NewApplication.findById({ _id: aid });
    const batch = await Batch.findById({ _id: `${apply.applicationBatch}` });
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
      res.status(200).send({
        message: "Front & Back Benchers at one place",
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
    const { sid, aid, cid } = req.params;
    if (!sid && !aid && !cid)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        allot_status: false,
      });
    const apply = await NewApplication.findById({ _id: aid });
    const admins = await Admin.findById({ _id: `${process.env.S_ADMIN_ID}` });
    const admission = await Admission.findById({
      _id: `${apply.admissionAdmin}`,
    }).select("institute");
    const institute = await InstituteAdmin.findById({
      _id: `${admission.institute}`,
    });
    const depart = await Department.findById({
      _id: `${apply.applicationDepartment}`,
    });
    const batch = await Batch.findById({ _id: `${apply.applicationBatch}` });
    const classes = await Class.findById({ _id: cid });
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
      paid_status: student.admissionRemainFeeCount == 0 ? "Paid" : "Not Paid",
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
    res.status(200).send({
      message: `Distribute sweets to all family members ${student.studentFirstName} `,
      allot_status: true,
    });
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
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveAdmissionRemainingArray = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const { aid } = req.params;
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
      res.status(200).send({
        message: "Its a party time",
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
    const { amount, mode } = req.body;
    if (!sid && !aid && !appId && !amount && !mode)
      return res.status(200).send({
        message: "Their is a bug need to fix immediately 😡",
        paid: false,
      });
    var price = parseInt(amount);
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var admin_ins = await Admission.findById({ _id: aid });
    var student = await Student.findById({ _id: sid }).select(
      "admissionPaymentStatus user admissionRemainFeeCount remainingFeeList"
    );
    var institute = await InstituteAdmin.findById({
      _id: `${admin_ins.institute}`,
    }).select("insName financeDepart gstSlab payment_history");
    var finance = await Finance.findById({
      _id: `${institute?.financeDepart[0]}`,
    });
    var user = await User.findById({ _id: `${student.user}` }).select(
      "deviceToken payment_history"
    );
    var apply = await NewApplication.findById({ _id: appId });
    const order = new OrderPayment({});
    order.payment_module_type = "Admission Fees";
    order.payment_to_end_user_id = admin_ins._id;
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
    if (student?.admissionPaymentStatus?.length > 0) {
      student?.admissionPaymentStatus.forEach(async (ele) => {
        if (admin_ins?.newApplication?.includes(`${ele.applicationId}`)) {
          if (price === ele.fee - ele.firstInstallment) {
            ele.status = "Paid";
            ele.mode = mode;
            ele.secondInstallment = price;
            ele.fee = ele.firstInstallment + ele.secondInstallment - ele.fee;
          }
        }
      });
    }
    if (student?.remainingFeeList?.length > 0) {
      student?.remainingFeeList.forEach(async (ele) => {
        if (admin_ins?.newApplication?.includes(`${ele.appId}`)) {
          ele.status = "Paid";
        }
      });
    }
    if (admin_ins?.remainingFeeCount >= price) {
      admin_ins.remainingFeeCount -= price;
    }
    if (student?.admissionRemainFeeCount >= price) {
      student.admissionRemainFeeCount -= price;
    }
    admin_ins.remainingFee.pull(student._id);
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
    });
    invokeMemberTabNotification(
      "Admission Status",
      `Payment Installment paid Successfully `,
      "Application Status",
      user._id,
      user.deviceToken
    );
    if (apply?.allottedApplication?.length > 0) {
      apply?.allottedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
          if (apply?.remainingFee >= price) {
            apply.remainingFee -= price;
          }
        }
      });
      await apply.save();
    }
    if (apply?.confirmedApplication?.length > 0) {
      apply?.confirmedApplication.forEach((ele) => {
        if (`${ele.student}` === `${student._id}`) {
          ele.fee_remain = ele.fee_remain >= price ? ele.fee_remain - price : 0;
          ele.paid_status = "Paid";
          ele.second_pay_mode = mode;
          if (apply?.remainingFee >= price) {
            apply.remainingFee -= price;
          }
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
    res.status(200).send({ message: "All Application", apply });
  } catch {}
};

exports.retrieveOneApplicationQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const oneApply = await NewApplication.findById({ _id: aid })
      .select(
        "applicationName applicationType applicationAbout admissionProcess applicationEndDate applicationStartDate admissionFee applicationPhoto photoId applicationSeats receievedCount selectCount confirmCount applicationStatus cancelCount allotCount onlineFee offlineFee remainingFee collectedFeeCount"
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
    res.status(200).send({
      message: "Sit with a paper and pen to note down all details carefully",
      oneApply,
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
          path: "batches",
          select: "batchName",
        },
      });

    if (ins_depart?.depart?.length > 0) {
      res.status(200).send({
        message: "All Department with batch",
        allDB: ins_depart?.depart,
      });
    } else {
      res
        .status(404)
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
    const student = await Student.findById({ _id: sid }).select(
      "remainingFeeList"
    );

    if (student?.remainingFeeList?.length > 0) {
      res.status(200).send({
        message: "All Admission Fees",
        get: true,
        array: student?.remainingFeeList,
        student: student,
      });
    } else {
      res.status(200).send({
        message: "No Admission Fees",
        get: false,
        array: [],
        student: student,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
