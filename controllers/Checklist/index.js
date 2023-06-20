const Checklist = require("../../models/Checklist");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Notification = require("../../models/notification");
const StudentNotification = require("../../models/Marks/StudentNotification");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Finance = require("../../models/Finance");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const InternalFees = require("../../models/RazorPay/internalFees");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.viewDepartment = async (req, res) => {
  const department = await Department.findById(req.params.did);
  // const dEncrypt = await encryptionPayload(department);
  res.status(200).send({ department });
};

exports.getAllChecklistClass = async (req, res) => {
  try {
    // const page = req.query.page ? parseInt(req.query.page) : 1;
    // const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    // const skip = (page - 1) * limit;
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "checklist",
        select: "checklistName checklistAmount createdAt",
      })
      .select("checklist")
      .lean()
      .exec();
    // .limit(limit)
    // .skip(skip);
    // const checkEncrypt = await encryptionPayload(classes.checklist);
    res
      .status(200)
      .send({ message: "checklist data", checklist: classes.checklist });
  } catch {}
};
exports.createChecklist = async (req, res) => {
  try {
    const { did } = req.params;
    const { ClassId } = req.body;
    const department = await Department.findById({ _id: did }).select(
      "institute checklists ApproveStudent"
    );

    var check = new Checklist({ ...req.body });
    department.checklists.push(check._id);
    check.checklistDepartment = department._id;

    await department.save();
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] });
      classes.checklist.push(check._id);
      await classes.save();
      await check.save();
    }
    for (let i = 0; i < department.ApproveStudent.length; i++) {
      const student = await Student.findById({
        _id: department.ApproveStudent[i]._id,
      }).populate({
        path: "user",
        select: "_id",
      });
      const user = await User.findById({ _id: `${student.user._id}` });
      const notify = new StudentNotification({});
      notify.notifyContent = `New ${check.checklistName} (checklist) has been created. check your member's Tab`;
      notify.notify_hi_content = `नवीन ${check.checklistName} बनाई गई है। अपना सदस्य टैब देखे |`;
      notify.notify_mr_content = `नवीन ${check.checklistName} तयार केली आहे. तुमच्या सदस्याचा टॅब तपासा.`;
      notify.notifySender = did;
      notify.notifyReceiever = user._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      notify.checklistId = check._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = department._id;
      notify.notifyCategory = "Checklist";
      notify.redirectIndex = 2;
      //
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "New Checklist",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      //
      await Promise.all([user.save(), notify.save()]);
    }
    // const cEncrypt = await encryptionPayload(check);
    res.status(201).send({ message: "Checklist Created", checklist: check });
    //
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] });
      const student = await Student.find({ studentClass: `${classes._id}` });
      if (check?.checklistFees === "Yes") {
        for (var ref of student) {
          const new_internal = new InternalFees({});
          new_internal.internal_fee_type = "Checklist";
          new_internal.internal_fee_amount = check.checklistAmount;
          new_internal.checklist = check?._id;
          new_internal.internal_fee_reason = check?.checklistName;
          new_internal.student = ref?._id;
          new_internal.department = department?._id;
          ref.studentRemainingFeeCount += check.checklistAmount;
          ref.internal_fees_query.push(new_internal?._id);
          check.studentsList.push(ref?._id);
          await Promise.all([ref.save(), new_internal.save(), check.save()]);
        }
      } else {
        for (var ref of student) {
          check.studentsList.push(ref?._id);
          await check.save();
        }
      }
    }
    const institute = await InstituteAdmin.findById({
      _id: `${department.institute}`,
    }).select("financeDepart");
    const finance = await Finance.findById({
      _id: `${institute.financeDepart[0]}`,
    });
    //
    var strength = 0;
    if (check?.checklistFees === "Yes") {
      for (let i = 0; i < ClassId.length; i++) {
        const classes = await Class.findById({ _id: ClassId[i] }).select(
          "ApproveStudent"
        );
        strength += classes.ApproveStudent?.length;
      }
      if (strength > 0) {
        finance.financeRaisedBalance += check.checklistAmount * strength;
        await finance.save();
      } else {
        finance.financeRaisedBalance += check.checklistAmount * strength;
        await finance.save();
      }
    } else {
    }
    //
  } catch (e) {
    console.log(e);
  }
};

exports.getOneChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.cid)
      .populate({
        path: "studentsList",
        select:
          "photoId studentProfilePhoto studentFirstName studentMiddleName studentLastName studentROLLNO onlineCheckList allottedChecklist",
      })
      .select("_id")
      .lean()
      .exec();
    // const checksEncrypt = await encryptionPayload(checklist);
    res.status(200).send({ message: "Checklist Data", checklist });
  } catch {}
};

exports.studentAssignChecklist = async (req, res) => {
  try {
    const { sid, cid } = req.params;
    const student = await Student.findById({ _id: sid }).populate({
      path: "user",
      select: "_id",
    });
    const user = await User.findById({ _id: `${student.user._id}` });
    const checklist = await Checklist.findById({ _id: cid });
    const notify = new StudentNotification({});
    student.allottedChecklist.push(checklist._id);
    checklist.assignedStudent.push(student._id);
    notify.notifyContent = `${checklist.checklistName} (checklist) Allotted to you check your member's Tab`;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    notify.checklistId = checklist._id;
    notify.notifyReceiever = user._id;
    notify.notifyCategory = "Checklist Allotted";
    user.activity_tab.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;
    await Promise.all([
      student.save(),
      checklist.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(200).send({ message: "checklist Assigned" });
  } catch (e) {
    console.log(e);
  }
};

exports.updateChecklist = async (req, res) => {
  try {
    await Checklist.findByIdAndUpdate(req.params.cid, req.body);
    res.status(200).send({
      message: "checklist is updated succefully",
    });
  } catch {}
};

exports.getAllChecklistDepartment = async (req, res) => {
  try {
    // const page = req.query.page ? parseInt(req.query.page) : 1;
    // const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    // const skip = (page - 1) * limit;
    const department = await Department.findById(req.params.did)
      .populate({
        path: "checklists",
        select: "checklistName checklistAmount createdAt",
      })
      .select("checklists")
      .lean()
      .exec();
    // .limit(limit)
    // .skip(skip);
    // const dCheckEncrypt = await encryptionPayload(department.checklists);
    res.status(200).send({
      message: "checklist data",
      checklist: department.checklists,
    });
  } catch (e) {
    console.log(e);
  }
};

const nested_function_fee = async (arr, fee) => {
  var flag = false;
  const all_students = await Student.find({ studentClass: { $in: arr } });
  for (var nest of all_students) {
    if (nest?.onlineCheckList?.includes(`${fee}`)) {
      flag = true;
      break;
    } else if (nest?.allottedChecklist?.includes(`${fee}`)) {
      flag = true;
      break;
    } else {
      flag = false;
    }
  }
  return flag;
};

exports.renderChecklistDeleteQuery = async (req, res) => {
  try {
    const { did, cid } = req.params;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately 😡",
        access: false,
      });
    const depart = await Department.findById({ _id: did });
    const finance = await Finance.findOne({
      institute: `${depart?.institute}`,
    });
    const checklists = await Checklist.findById({ _id: cid });
    const flag_status = await nested_function_fee(depart.class, cid);
    if (flag_status) {
      res.status(200).send({
        message: "Deletion Operation Denied Some Student Already Paid 😥",
        access: false,
      });
    } else {
      depart.checklists.pull(cid);
      for (var cal of depart.class) {
        const classes = await Class.findById({ _id: cal });
        for (var val of classes?.ApproveStudent) {
          const student = await Student.findById({ _id: val });
          if (student?.studentRemainingFeeCount >= checklists?.feeAmount) {
            student.studentRemainingFeeCount -= checklists.feeAmount;
          }
          if (finance?.financeRaisedBalance >= checklists?.feeAmount) {
            finance.financeRaisedBalance -= checklists.feeAmount;
          }
          await student.save();
        }
        classes.checklist.pull(cid);
        await classes.save();
      }
      await Promise.all([finance.save(), depart.save()]);
      await Checklist.findByIdAndDelete(cid);
      res.status(200).send({
        message: "Deletion Operation Completed 😁",
        access: true,
      });
    }
  } catch (e) {
    console.log(e);
  }
};
