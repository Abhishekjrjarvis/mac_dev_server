const Department = require("../../models/Department");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Class = require("../../models/Class");
const Fees = require("../../models/Fees");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Finance = require('../../models/Finance')
const Checklist = require('../../models/Checklist')
const InstituteAdmin = require('../../models/InstituteAdmin')
const invokeMemberTabNotification = require('../../Firebase/MemberTab')


exports.createFess = async (req, res) => {
  try {
    const { ClassId, feeName, feeAmount, feeDate } = req.body;
    const department = await Department.findById(req.params.did).select(
      "_id ApproveStudent fees institute"
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
      const notify = new StudentNotification({});
      notify.notifyContent = `New ${feeData.feeName} (fee) has been created. check your member's Tab`;
      notify.notifySender = department._id;
      notify.notifyReceiever = user._id;
      notify.notifyType = 'Student'
      notify.notifyPublisher = student._id
      notify.feesId = feeData._id
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = department._id;
      //
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        'New Fees',
        user._id,
        user.deviceToken,
        'Student',
        notify
      );
      //
      await Promise.all([user.save(), notify.save()]);
    }
    res.status(201).send({ message: `${feeData.feeName} Fees Raised` });
    //
    for (let i = 0; i < ClassId.length; i++) {
      const classes = await Class.findById({ _id: ClassId[i] });
      const student = await Student.find({ studentClass: `${classes._id}`})
      student.forEach(async (st) => {
        st.studentRemainingFeeCount += feeData.feeAmount
        await st.save()
      })
    }
    const institute = await InstituteAdmin.findById({_id: `${department.institute}`}).select('financeDepart')
    const finance = await Finance.findById({_id: `${institute.financeDepart[0]}`})
    finance.financeRaisedBalance += feeData.feeAmount
    await finance.save()
    //
  } catch (e){
    console.log(e)
  }
};

exports.getOneFeesDetail = async (req, res) => {
  try {
    const { feesId } = req.params;
    const feeData = await Fees.findById({ _id: feesId })
    .select('feeName feeAmount exemptList offlineStudentsList onlineList createdAt feeDate')
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
      student.studentPaidFeeCount += fData.feeAmount
      student.studentRemainingFeeCount -= fData.feeAmount
      // fData.studentsList.push(student._id);
      // fData.feeStudent = student;
      student.offlineFeeList.push(fData._id);
      fData.offlineStudentsList.push(student._id);
      fData.offlineFee += fData.feeAmount;
      classes.offlineFeeCollection.push({
        fee: fData.feeAmount,
        feeId: fData._id
      })
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
        student.studentPaidFeeCount += fData.feeAmount
        student.studentRemainingFeeCount -= fData.feeAmount
        fData.studentExemptList.push(student._id);
        fData.feeStudent = student;
        student.exemptFeeList.push(fData._id);
        fData.exemptList.push(student._id);
        classes.exemptFee += fData.feeAmount;
        finance.financeExemptBalance += fData.feeAmount
        finance.financeTotalBalance += fData.feeAmount
        classes.exemptFeeCollection.push({
          fee: fData.feeAmount,
          feeId: fData._id
        })
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


exports.retrieveStudentCountQuery = async(req, res) =>{
  try{
    const { sid } = req.params
    var paid = 0
    var unpaid = 0
    const student = await Student.findById({_id: sid})
    .select('studentFirstName')
    .populate({
      path: 'department',
      select: 'id',
      populate: {
        path: 'fees',
        select: 'feeAmount onlineList offlineStudentsList'
      }
    })
    .populate({
      path: 'department',
      select: 'id',
      populate: {
        path: 'checklists',
        select: 'checklistAmount studentsList'
      }
    })
    
    student.department.fees.forEach((fee) => {
      if((fee.onlineList.length >= 1 && fee.onlineList.includes(`${student._id}`)) || (fee.offlineStudentsList.length >= 1 && fee.offlineStudentsList.includes(`${student._id}`))){
      }
      else{
        unpaid += fee.feeAmount
      }
    })
    student.department.checklists.forEach((check) => {
      if(check.studentsList.length >= 1 && check.studentsList.includes(`${student._id}`)){
      }
      else{
      unpaid += check.checklistAmount
      }
    })

    var students = await Student.findById({_id: sid})
    .select('id')
    .populate({
      path: 'onlineFeeList',
      select: 'feeAmount'
    })
    .populate({
      path: 'onlineCheckList',
      select: 'checklistAmount'
    })
    .populate({
      path: 'offlineFeeList',
      select: 'feeAmount'
    })
    .populate({
      path: 'department',
      select: 'fees checklists'
    })
    if(students.offlineFeeList.length >=1){
      students.offlineFeeList.forEach((off) => {
        if(students.department.fees.length >= 1 && students.department.fees.includes(`${off._id}`)){
          paid += off.feeAmount
        }
        else{}
      })
    }
    if(students.onlineFeeList.length >=1){
      students.onlineFeeList.forEach((on) => {
        if(students.department.fees.length >= 1 && students.department.fees.includes(`${on._id}`)){
          paid += on.feeAmount
        }
        else{}
      })
    }
    if(students.onlineCheckList.length >=1){
      students.onlineCheckList.forEach((onc) => {
        if(students.department.checklists.length >= 1 && students.department.checklists.includes(`${onc._id}`)){
          paid += onc.checklistAmount
        }
        else{}
      })
    }
    res.status(200).send({ message: 'Total Paid Fee & Remaining Fee', paid: paid, unpaid: unpaid})
  }
  catch(e){
    console.log(e)
  }
}


exports.retrieveStudentQuery = async(req, res) => {
  try{
    const { sid } = req.params
    const student = await Student.findById({_id: sid})
    .select('id onlineFeeList offlineFeeList exemptFeeList onlineCheckList offlineCheckList studentRemainingFeeCount studentPaidFeeCount')
    .populate({
      path: 'institute',
      select: 'insName'
    })
    .populate({
      path: 'department',
      select: 'fees checklists'
    })
    .populate({
      path: 'user',
      select: 'userLegalName'
    }).lean()
    const fees = await Fees.find({ _id: { $in: student.department.fees}})
    .sort("-createdAt")
    .lean()
    const check = await Checklist.find({_id: { $in: student.department.checklists}})
    .sort("-createdAt")
    .lean()
    var mergePay = [...fees, ...check]
    const institute = await InstituteAdmin.findById({_id: `${student.institute._id}`}).select('financeDepart').lean()
    if(institute && institute.financeDepart.length >=1){
      var finance = await Finance.findById({_id: `${institute?.financeDepart[0]}`}).select('_id').lean()
      res.status(200).send({ message: 'Student Fee and Checklist', student, mergePay: mergePay, financeId: finance?._id})
    }
    else{
      res.status(200).send({ message: 'No Fee Data Available Currently...', mergePay: [] })
    }
  }
  catch(e){
    console.log(e)
  }
}
