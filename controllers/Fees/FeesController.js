const Department = require("../../models/Department");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Class = require("../../models/Class");
const Fees = require("../../models/Fees");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Finance = require("../../models/Finance");
const Checklist = require("../../models/Checklist");
const InstituteAdmin = require("../../models/InstituteAdmin");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const BusinessTC = require("../../models/Finance/BToC");
const moment = require("moment");
const Admin = require("../../models/superAdmin");

exports.createFess = async (req, res) => {
  try {
    const { ClassId } = req.body;
    const department = await Department.findById(req.params.did).select(
      "_id ApproveStudent fees institute"
    );
    var feeData = new Fees({ ...req.body });
    department.fees.push(feeData._id);
    feeData.feeDepartment = department._id;
    await department.save();
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] });
      classes.fee.push(feeData._id);
      await Promise.all([classes.save(), feeData.save()]);
    }
    for (let i = 0; i < department.ApproveStudent.length; i++) {
      const student = await Student.findById({
        _id: department.ApproveStudent[i],
      })
        .populate({
          path: "user",
          select: "_id",
        })
        .select("_id");
      const user = await User.findById({ _id: `${student.user._id}` });
      const notify = new StudentNotification({});
      notify.notifyContent = `New ${feeData.feeName} (fee) has been created. check your member's Tab`;
      notify.notify_hi_content = `नवीन ${feeData.feeName} (fee) बनाई गई है। अपना सदस्य टैब देखे |`;
      notify.notify_mr_content = `नवीन ${feeData.feeName} (fee) तयार केली आहे. तुमच्या सदस्याचा टॅब तपासा.`;
      notify.notifySender = department._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      notify.feesId = feeData._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = department._id;
      notify.notifyCategory = "Fee";
      notify.redirectIndex = 5;
      //
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "New Fees",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      //
      await Promise.all([user.save(), notify.save()]);
    }
    res.status(201).send({ message: `${feeData.feeName} Fees Raised` });
    //
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] });
      const student = await Student.find({ studentClass: `${classes._id}` });
      student.forEach(async (st) => {
        st.studentRemainingFeeCount += feeData.feeAmount;
        await st.save();
      });
    }
    const institute = await InstituteAdmin.findById({
      _id: `${department.institute}`,
    }).select("financeDepart");
    const finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    //
    var strength = 0;
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] }).select(
        "ApproveStudent"
      );
      strength += classes.ApproveStudent?.length;
    }
    if (strength > 0) {
      finance.financeRaisedBalance += feeData.feeAmount * strength;
      await finance.save();
    } else {
      finance.financeRaisedBalance += feeData.feeAmount * strength;
      await finance.save();
    }
    //
  } catch (e) {
    console.log(e);
  }
};

exports.getOneFeesDetail = async (req, res) => {
  try {
    const { feesId } = req.params;
    var total = 0;
    const feeData = await Fees.findById({ _id: feesId }).select(
      "feeName feeAmount exemptList offlineStudentsList onlineList createdAt feeDate"
    );

    if (feeData?.offlineStudentsList?.length >= 1) {
      total += feeData?.offlineStudentsList?.length * feeData.feeAmount;
    }
    if (feeData?.onlineList?.length >= 1) {
      total += feeData?.onlineList?.length * feeData.feeAmount;
    }
    // .populate({
    //   path: "feeDepartment",
    //   select: 'dName dTitle'
    // })
    // .populate({
    //   path: "feeStudent",
    //   select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO'
    // })
    // .populate({
    //   path: "offlineStudentsList",
    //   select: 'id'
    // })
    // .populate({
    //   path: "studentExemptList",
    //   select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO'
    // });
    // .populate({
    //   path: "studentsList",
    //   select: 'id'
    // })
    res
      .status(200)
      .send({ message: "Fees Data", feeData, onlineOffline: total });
  } catch {}
};

exports.feesPaidByStudent = async (req, res) => {
  try {
    const { cid, id } = req.params;
    var { offlineQuery, exemptQuery } = req.body;
    var off_status = "Pending";
    var exe_status = "Pending";
    var classes = await Class.findById({ _id: cid });
    var fData = await Fees.findById({ _id: id });
    const s_admin = await Admin.findById({
      _id: `${process.env.S_ADMIN_ID}`,
    }).select("invoice_count");
    var institute = await InstituteAdmin.findById({
      _id: `${classes.institute}`,
    });
    var finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    if (offlineQuery?.length > 0) {
      offlineQuery.forEach(async (off) => {
        const student = await Student.findById({ _id: `${off}` });
        const user = await User.findById({ _id: `${student.user}` });
        if (
          fData.studentsList.length >= 1 &&
          fData.studentsList.includes(String(student._id))
        ) {
        } else {
          student.studentPaidFeeCount += fData.feeAmount;
          if (student.studentRemainingFeeCount > 0) {
            student.studentRemainingFeeCount -= fData.feeAmount;
          }
          student.offlineFeeList.push(fData._id);
          fData.offlineStudentsList.push(student._id);
          fData.offlineFee += fData.feeAmount;
          classes.offlineFeeCollection.push({
            fee: fData.feeAmount,
            feeId: fData._id,
          });
          const order = new OrderPayment({});
          order.payment_module_type = "Internal Fees";
          order.payment_to_end_user_id = institute._id;
          order.payment_by_end_user_id = user._id;
          order.payment_module_id = fData._id;
          order.payment_amount = fData.feeAmount;
          order.payment_status = "Captured";
          order.payment_flag_to = "Credit";
          order.payment_flag_by = "Debit";
          order.payment_mode = "Offline";
          order.payment_fee = fData._id;
          order.payment_from = student._id;
          s_admin.invoice_count += 1;
          order.payment_invoice_number = s_admin.invoice_count;
          user.payment_history.push(order._id);
          institute.payment_history.push(order._id);
          await Promise.all([student.save(), user.save(), order.save()]);
        }
      });
      if (fData?.gstSlab > 0) {
        var business_data = new BusinessTC({});
        business_data.b_to_c_month = new Date().toISOString();
        business_data.b_to_c_i_slab = parseInt(fData?.gstSlab) / 2;
        business_data.b_to_c_s_slab = parseInt(fData?.gstSlab) / 2;
        business_data.finance = finance._id;
        finance.gst_format.b_to_c.push(business_data?._id);
        business_data.b_to_c_total_amount = fData.feeAmount;
        await Promise.all([business_data.save()]);
      }
      off_status = "Done";
      await Promise.all([
        fData.save(),
        classes.save(),
        finance.save(),
        institute.save(),
        s_admin.save(),
      ]);
    }
    if (exemptQuery?.length > 0) {
      exemptQuery.forEach(async (exe) => {
        const student = await Student.findById({ _id: `${exe}` });
        if (
          fData.studentExemptList.length >= 1 &&
          fData.studentExemptList.includes(String(student._id))
        ) {
        } else {
          student.studentPaidFeeCount += fData.feeAmount;
          if (student.studentRemainingFeeCount > 0) {
            student.studentRemainingFeeCount -= fData.feeAmount;
          }
          student.exemptFeeList.push(fData._id);
          fData.exemptList.push(student._id);
          classes.exemptFee += fData.feeAmount;
          finance.financeExemptBalance += fData.feeAmount;
          classes.exemptFeeCollection.push({
            fee: fData.feeAmount,
            feeId: fData._id,
          });
          await student.save();
        }
      });
      exe_status = "Done";
      await Promise.all([fData.save(), classes.save(), finance.save()]);
    }
    await Promise.all([fData.save(), finance.save(), classes.save()]);
    if (off_status === "Done" || exe_status === "Done") {
      res.status(200).send({
        message: "Wait for Operation Complete",
        fee_paid_status: true,
      });
    } else {
      res
        .status(404)
        .send({ message: "No Operation Complete", fee_paid_status: false });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStudentFeeStatus = async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById({ _id: studentId }).select(
      "studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto"
    );
    res.status(200).send({ message: "Student Detail Data", student });
  } catch {}
};

exports.retrieveDepartmentFeeArray = async (req, res) => {
  try {
    const { did } = req.params;
    const depart = await Department.findById({ _id: did })
      .select("dName")
      .populate({
        path: "fees",
        select: "feeName feeAmount feeDate createdAt",
      });
    res.status(200).send({ message: "Department Fee Data ", depart });
  } catch {}
};

exports.retrieveClassFeeArray = async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .select("className classStatus")
      .populate({
        path: "ApproveStudent",
        select:
          "studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto onlineFeeList offlineFeeList",
      })
      .populate({
        path: "institute",
        select: "id",
        populate: {
          path: "financeDepart",
          select: "id",
          populate: {
            path: "classRoom",
            select: "id",
          },
        },
      })
      .populate({
        path: "fee",
        select: "feeName feeAmount feeDate",
      });
    res.status(200).send({ message: "Class Fee Data ", classes });
  } catch {}
};

exports.retrieveStudentCountQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    var paid = 0;
    var unpaid = 0;
    const student = await Student.findById({ _id: sid })
      .select("studentFirstName")
      .populate({
        path: "department",
        select: "id",
        populate: {
          path: "fees",
          select: "feeAmount onlineList offlineStudentsList",
        },
      })
      .populate({
        path: "department",
        select: "id",
        populate: {
          path: "checklists",
          select: "checklistAmount studentsList",
        },
      });

    student.department.fees.forEach((fee) => {
      if (
        (fee.onlineList.length >= 1 &&
          fee.onlineList.includes(`${student._id}`)) ||
        (fee.offlineStudentsList.length >= 1 &&
          fee.offlineStudentsList.includes(`${student._id}`))
      ) {
      } else {
        unpaid += fee.feeAmount;
      }
    });
    student.department.checklists.forEach((check) => {
      if (
        check.studentsList.length >= 1 &&
        check.studentsList.includes(`${student._id}`)
      ) {
      } else {
        unpaid += check.checklistAmount;
      }
    });

    var students = await Student.findById({ _id: sid })
      .select("id")
      .populate({
        path: "onlineFeeList",
        select: "feeAmount",
      })
      .populate({
        path: "onlineCheckList",
        select: "checklistAmount",
      })
      .populate({
        path: "offlineFeeList",
        select: "feeAmount",
      })
      .populate({
        path: "department",
        select: "fees checklists",
      });
    if (students.offlineFeeList.length >= 1) {
      students.offlineFeeList.forEach((off) => {
        if (
          students.department.fees.length >= 1 &&
          students.department.fees.includes(`${off._id}`)
        ) {
          paid += off.feeAmount;
        } else {
        }
      });
    }
    if (students.onlineFeeList.length >= 1) {
      students.onlineFeeList.forEach((on) => {
        if (
          students.department.fees.length >= 1 &&
          students.department.fees.includes(`${on._id}`)
        ) {
          paid += on.feeAmount;
        } else {
        }
      });
    }
    if (students.onlineCheckList.length >= 1) {
      students.onlineCheckList.forEach((onc) => {
        if (
          students.department.checklists.length >= 1 &&
          students.department.checklists.includes(`${onc._id}`)
        ) {
          paid += onc.checklistAmount;
        } else {
        }
      });
    }
    res.status(200).send({
      message: "Total Paid Fee & Remaining Fee",
      paid: paid,
      unpaid: unpaid,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.retrieveStudentQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const student = await Student.findById({ _id: sid })
      .select(
        "id onlineFeeList offlineFeeList exemptFeeList studentAdmissionDate admissionRemainFeeCount onlineCheckList offlineCheckList studentRemainingFeeCount studentPaidFeeCount"
      )
      .populate({
        path: "institute",
        select: "insName",
        populate: {
          path: "financeDepart",
          select: "id",
        },
      })
      .populate({
        path: "department",
        select: "fees checklists",
      })
      .populate({
        path: "user",
        select: "userLegalName username",
      })
      .lean();
    var admission_date = moment(student?.studentAdmissionDate).format("l");
    var year = admission_date.substring(6, 10);
    var month = admission_date.substring(0, 2);
    var day = admission_date.substring(3, 5);
    const fees = await Fees.find({
      $and: [
        { _id: { $in: student?.department?.fees } },
        {
          createdAt: {
            $gte: new Date(`${year}-${month}-${day}`),
          },
        },
      ],
    })
      .sort("-createdAt")
      .lean();
    const check = await Checklist.find({
      $and: [
        { _id: { $in: student?.department?.checklists } },
        {
          createdAt: {
            $gte: new Date(`${year}-${month}-${day}`),
          },
        },
      ],
    })
      .sort("-createdAt")
      .lean();
    var mergePay = [...fees, ...check];
    const institute = await InstituteAdmin.findById({
      _id: `${student.institute._id}`,
    })
      .select("financeDepart")
      .lean();
    if (institute && institute.financeDepart.length >= 1) {
      var finance = await Finance.findById({
        _id: `${institute?.financeDepart[0]}`,
      })
        .select("_id")
        .lean();
      res.status(200).send({
        message: "Student Fee and Checklist",
        student,
        mergePay: mergePay,
        financeId: finance?._id,
      });
    } else {
      res
        .status(200)
        .send({ message: "No Fee Data Available Currently...", mergePay: [] });
    }
  } catch (e) {
    console.log(e);
  }
};
