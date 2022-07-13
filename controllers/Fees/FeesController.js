const Department = require("../../models/Department");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Class = require("../../models/Class");
const Fees = require("../../models/Fees");
const Notification = require("../../models/notification");

exports.createFess = async (req, res) => {
  try {
    const { ClassId, feeName, feeAmount, feeDate } = req.body;
    const department = await Department.findById(req.params.did).select(
      "_id ApproveStudent"
    );
    var feeData = await new Fees({
      feeName: feeName,
      feeAmount: feeAmount,
      feeDate: feeDate,
    });
    department.fees.push(feeData._id);
    feeData.feeDepartment = department._id;
    await department.save();
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] });
      classes.fee.push(feeData._id);
      feeData.feeClass = classes._id;
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
      const notify = new Notification({});
      notify.notifyContent = `New ${feeData.feeName} (fee) has been created. check your member's Tab`;
      notify.notifySender = department._id;
      notify.notifyReceiever = user._id;
      user.uNotify.push(notify._id);
      notify.user = user._id;
      notify.notifyByDepartPhoto = department._id;
      await Promise.all([user.save(), notify.save()]);
    }
    res.status(201).send({ message: "Fees Raised" });
  } catch {}
};

exports.getOneFeesDetail = async (req, res) => {
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
  } catch {}
};

exports.feesPaidByStudent = async (req, res) => {
  try {
    const { sid, id } = req.params;
    const { status } = req.body;
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
    }
  } catch {}
};

exports.exemptFeesPaidByStudent = async (req, res) => {
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
  } catch {}
};
