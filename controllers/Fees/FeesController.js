const Department = require("../../models/Department");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Class = require("../../models/Class");
const Fees = require("../../models/Fees");
const Notification = require("../../models/notification");
const Finance = require('../../models/Finance')
const Checklist = require('../../models/Checklist')
const InstituteAdmin = require('../../models/InstituteAdmin')

exports.createFess = async (req, res) => {
  try {
    const { ClassId, feeName, feeAmount, feeDate } = req.body;
    const department = await Department.findById(req.params.did).select(
      "_id ApproveStudent fees"
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
    res.status(201).send({ message: `${feeData.feeName} Fees Raised` });
  } catch (e){
    console.log(e)
  }
};

exports.getOneFeesDetail = async (req, res) => {
  try {
    const { feesId } = req.params;
    const feeData = await Fees.findById({ _id: feesId })
      .populate({
        path: "feeStudent",
        select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO'
      })
      .populate({
        path: "studentsList",
        select: 'id'
      })
      .populate({
        path: "feeDepartment",
        select: 'dName dTitle'
      })
      .populate({
        path: "offlineStudentsList",
        select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO'
      })
      .populate({
        path: "studentExemptList",
        select: 'studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto studentROLLNO'
      });
    res.status(200).send({ message: "Fees Data", feeData });
  } catch {}
};

exports.feesPaidByStudent = async (req, res) => {
  try {
    const { cid, sid, id } = req.params;
    const student = await Student.findById({ _id: sid });
    const classes = await Class.findById({_id: cid})
    const fData = await Fees.findById({ _id: id });
    if (
      fData.studentsList.length >= 1 &&
      fData.studentsList.includes(String(student._id))
    ) {
      res.status(200).send({
        message: `${student.studentFirstName} paid the ${fData.feeName} fee`,
      });
    } else {
      student.studentFee.push(fData._id);
      fData.feeStatus = "Paid";
      fData.studentsList.push(student._id);
      fData.feeStudent = student;
      student.offlineFeeList.push(fData._id);
      fData.offlineStudentsList.push(student._id);
      fData.offlineFee += fData.feeAmount;
      classes.offlineFeeCollection += fData.feeAmount
      await Promise.all([ student.save(), fData.save(), classes.save()])
      res.status(200).send({
        message: `${fData.feeName} fee received by ${student.studentFirstName}`,
      });
    }
  } catch (e){
    console.log(e)
  }
};

exports.exemptFeesPaidByStudent = async (req, res) => {
  try {
    const { cid, sid, id } = req.params;
    const { status } = req.body;
    const classes = await Class.findById({ _id: cid });
    const institute = await InstituteAdmin.findById({_id: `${classes.institute}`})
    const finance = await Finance.findById({_id: `${institute.financeDepart[0]}`})
    const student = await Student.findById({ _id: sid });
    const fData = await Fees.findById({ _id: id });
    if (
      fData.studentExemptList.length >= 1 &&
      fData.studentExemptList.includes(String(student._id))
    ) {
      res.status(200).send({
        message: `${student.studentFirstName} paid the ${fData.feeName} fee (Exempted)`,
      });
    } else {
      try {
        student.studentExemptFee.push(fData._id);
        fData.feeStatus = status;
        fData.studentExemptList.push(student._id);
        fData.feeStudent = student;
        student.exemptFeeList.push(fData._id);
        fData.exemptList.push(student._id);
        classes.exemptFee += fData.feeAmount;
        finance.financeExemptBalance += fData.feeAmount
        await Promise.all([
          student.save(),
          fData.save(),
          classes.save(),
          finance.save()
        ])
        res.status(200).send({
          message: `${fData.feeName} fee received by ${student.studentFirstName} (Exempted)`,
        });
      } catch {}
    }
  } catch(e) {
    console.log(e)
  }
};


exports.retrieveStudentFeeStatus = async(req, res) =>{
  try {
    const { studentId } = req.body;
    const student = await Student.findById({ _id: studentId })
    .select('studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto')
    res.status(200).send({ message: "Student Detail Data", student });
  } catch {
  }
}


exports.retrieveDepartmentFeeArray = async(req, res) =>{
  try{
    const { did } = req.params
    const depart = await Department.findById({_id: did})
    .select('dName')
    .populate({
      path: 'fees',
      select: 'feeName feeAmount feeDate createdAt'
    })
    res.status(200).send({ message: 'Department Fee Data ', depart})
  }
  catch{

  }
}


exports.retrieveClassFeeArray = async(req, res) =>{
  try{
    const { cid } = req.params
    const classes = await Class.findById({_id: cid})
    .select('className classStatus')
    .populate({
      path: 'ApproveStudent',
      select: 'studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto onlineFeeList offlineFeeList'
    })
    .populate({
      path: 'institute',
      select: 'id',
      populate: {
        path: 'financeDepart',
        select: 'id',
        populate: {
          path: 'classRoom',
          select: 'id'
        }
      }
    })
    .populate({
      path: 'fee',
      select: 'feeName feeAmount feeDate'
    })
    res.status(200).send({ message: 'Class Fee Data ', classes})
  }
  catch{

  }
}

exports.retrieveStudentQuery = async(req, res) => {
  try{
    const { sid } = req.params
    const student = await Student.findById({_id: sid})
    .select('id onlineFeeList offlineFeeList exemptFeeList onlineCheckList offlineCheckList')
    .populate({
      path: 'institute',
      select: 'insName'
    })
    .populate({
      path: 'department',
      select: 'fees checklists'
    })
    const fees = await Fees.findById({ _id: { $in: student.department.fees}})
    .sort("-createdAt")
    const check = await Checklist.findById({_id: { $in: student.department.checklists}})
    .sort("-createdAt")
    var mergePay = [...fees, ...check]
    res.status(200).send({ message: 'Student Fee and Checklist', student, mergePay: mergePay, fee: fees, check: check})
  }
  catch{

  }
}
