const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Batch = require("../../models/Batch");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Subject = require("../../models/Subject");
const SubjectMaster = require("../../models/SubjectMaster");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const StudentPreviousData = require("../../models/StudentPreviousData");

const {
  todayDate,
  classCodeFunction,
} = require("../../Utilities/timeComparison");

exports.preformedStructure = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.bid).populate({
      path: "classroom",
      populate: {
        path: "subject",
      },
    });
    const department = await Department.findById(batch?.department);
    const institute = await InstituteAdmin.findById(batch?.institute);
    const identicalBatch = new Batch({
      batchName: req.body?.batchName,
      institute: batch?.institute,
      department: batch?.department,
      batchStaff: batch?.batchStaff,
      classCount: batch?.classCount,
    });
    department?.batches.push(identicalBatch._id);
    department.batchCount += 1;
    for (let oneClass of batch?.classroom) {
      const code = await classCodeFunction();
      const date = await todayDate();
      const staff = await Staff.findById(oneClass?.classTeacher);
      const identicalClass = new Class({
        classCode: code,
        className: oneClass?.className,
        classTitle: oneClass?.classTitle,
        subjectCount: oneClass?.subjectCount,
        masterClassName: oneClass?.masterClassName,
        classHeadTitle: oneClass?.classHeadTitle,
        institute: oneClass?.institute,
        batch: identicalBatch?._id,
        department: oneClass?.department,
        classStartDate: date,
        classTeacher: oneClass?.classTeacher,
      });

      institute?.classRooms.push(identicalClass._id);
      institute?.classCodeList.push(code);
      department?.class.push(identicalClass._id);
      department.classCount += 1;
      staff?.staffClass.push(identicalClass._id);
      staff.staffDesignationCount += 1;
      staff.recentDesignation = identicalClass?.classHeadTitle;
      identicalBatch?.classroom.push(identicalClass._id);
      for (let oneSubject of oneClass?.subject) {
        const subjectMaster = await SubjectMaster.findById(
          oneSubject?.subjectMasterName
        );
        const sujectStaff = await Staff.findById(
          oneSubject?.subjectTeacherName
        );

        const identicalSubject = new Subject({
          subjectName: oneSubject?.subjectName,
          subjectTitle: oneSubject?.subjectTitle,
          subjectTeacherName: oneSubject?.subjectTeacherName,
          subjectMasterName: oneSubject?.subjectMasterName,
          class: identicalClass._id,
          institute: batch?.institute,
        });
        sujectStaff?.staffSubject.push(identicalSubject._id);
        sujectStaff.staffDesignationCount += 1;
        sujectStaff.recentDesignation = identicalSubject?.subjectTitle;
        subjectMaster?.subjects.push(identicalSubject._id);
        subjectMaster.subjectCount += 1;
        identicalClass?.subject.push(identicalSubject?._id);
        await Promise.all([
          identicalSubject.save(),
          sujectStaff.save(),
          subjectMaster.save(),
        ]);
      }
      await Promise.all([identicalClass.save(), staff.save()]);
    }

    await Promise.all([
      identicalBatch.save(),
      department.save(),
      institute.save(),
    ]);
    res.status(200).send({ message: "Identical Batch Created Successfully" });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectComplete = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid);
    if (subject.subjectStatus !== "Completed") {
      subject.subjectStatus = req.body?.subjectStatus;
      const staff = await Staff.findById(subject?.subjectTeacherName).select(
        "staffSubject previousStaffSubject"
      );
      staff.previousStaffSubject?.push(staff?.staffSubject);
      staff.staffSubject.pull(req.params.sid);
      await Promise.all([staff.save(), subject.save()]);
      res.status(200).send({ message: "Subject is Completed" });
    } else res.status(200).send({ message: "Subject is already Completed" });
  } catch (e) {
    console.log(e);
  }
};

exports.allDepartment = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid);
    const institute = await InstituteAdmin.findById(classes.institute)
      .populate({
        path: "depart",
        populate: {
          path: "batches",
          match: { _id: { $ne: classes.batch } },
          select: "batchName",
        },
        select: "dName batches",
      })
      .select("_id depart")
      .lean()
      .exec();
    res
      .status(200)
      .send({ message: "All departments list", departmets: institute?.depart });
  } catch (e) {
    console.log(e);
  }
};

exports.allClasses = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.bid)
      .populate({
        path: "classroom",
        select: "classTitle",
      })
      .select("classroom")
      .lean()
      .exec();

    res
      .status(200)
      .send({ message: "All classes list", classes: batch?.classroom });
  } catch (e) {
    console.log(e);
  }
};

exports.promoteStudent = async (req, res) => {
  try {
    const { departmentId, batchId, classId } = req.body;
    const classes = await Class.findById(classId);
    const batch = await Batch.findById(batchId);
    const department = await Department.findById(departmentId);
    let roll = classes.ApproveStudent?.length;
    for (let stu of req.body?.students) {
      const student = await Student.findById(stu);
      const previousData = new StudentPreviousData({
        class: student?.studentClass,
        batch: student?.batches,
        department: department,
        institute: institute,
        behaviour: student?.studentBehaviour,
        subjectMarks: student?.subjectMarks,
        exams: student?.exams,
        finalReport: student?.finalReport,
        testSet: student?.testSet,
        studentFee: studentFee,
        attendDate: attendDate,
        checklist: checklist,
        onlineFeeList: onlineFeeList,
        onlineCheckList: onlineCheckList,
        offlineFeeList: offlineFeeList,
        offlineCheckList: offlineCheckList,
        complaints: complaints,
        studentChecklist: studentChecklist,
        leave: leave,
        transfer: transfer,
        paymentList: paymentList,
        studentExemptFee: studentExemptFee,
        exemptFeeList: exemptFeeList,
        student: student._id,
      });
      // await previousData.save();
      student?.previousYearData?.push(previousData._id);
      student.studentClass = classId;
      student.studentCode = classes.classCode;
      student.department = departmentId;
      student.batches = batchId;
      student.studentBehaviour = "";
      student.studentROLLNO = roll;
      student.subjectMarks = [];
      student.exams = [];
      student.finalReportStatus = "No";
      student.finalReport = [];
      student.testSet = [];
      student.studentFee = [];
      student.attendDate = [];
      student.checklist = [];
      student.onlineFeeList = [];
      student.onlineCheckList = [];
      student.offlineFeeList = [];
      student.offlineCheckList = [];
      student.complaints = [];
      student.studentChecklist = [];
      student.leave = [];
      student.transfer = [];
      student.paymentList = [];
      student.applyList = [];
      student.studentExemptFee = [];
      student.exemptFeeList = [];
      roll += 1;
      if (classes?.ApproveStudent?.includes(student._id)) {
      } else {
        classes?.ApproveStudent.push(student._id);
      }
      if (batch?.ApproveStudent?.includes(student._id)) {
      } else {
        batch?.ApproveStudent.push(student._id);
      }
      if (department?.ApproveStudent?.includes(student._id)) {
      } else {
        department?.ApproveStudent.push(student._id);
      }
      // await student.save();
    }

    // await Promise.all([classes.save(), batch.save(), department.save()]);

    res
      .status(200)
      .send({ message: "All students promoted to next selected class" });
  } catch (e) {
    console.log(e);
  }
};

exports.getclassComplete = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "subject",
        select: "subjectStatus",
      })
      .select("subject")
      .lean()
      .exec();
    let flag = false;

    for (let sub of classes?.subject) {
      if (sub.subjectStatus === "Completed") flag = true;
      else {
        flag = false;
        break;
      }
    }
    if (flag) {
      res.status(200).send({
        message: "All subject is completed",
        flag,
      });
    } else {
      res.status(200).send({
        message: "Can not completed class due to all subject is not completed",
        flag,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.classComplete = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "subject",
        select: "subjectStatus",
      })
      .select("ApproveStudent subject classTeacher");
    if (classes.classStatus !== "Completed") {
      let flag = false;

      for (let sub of classes?.subject) {
        if (sub.subjectStatus === "Completed") flag = true;
        else {
          flag = false;
          break;
        }
      }

      if (flag) {
        classes.classStatus = req.body.classStatus;
        for (let stu of classes?.ApproveStudent) {
          const student = await Student.findById(stu);
          const previousData = new StudentPreviousData({
            class: student?.studentClass,
            batch: student?.batches,
            department: student?.department,
            institute: student?.institute,
            behaviour: student?.studentBehaviour,
            subjectMarks: student?.subjectMarks,
            exams: student?.exams,
            finalReport: student?.finalReport,
            testSet: student?.testSet,
            studentFee: student?.studentFee,
            attendDate: student?.attendDate,
            checklist: student?.checklist,
            onlineFeeList: student?.onlineFeeList,
            onlineCheckList: student?.onlineCheckList,
            offlineFeeList: student?.offlineFeeList,
            offlineCheckList: student?.offlineCheckList,
            complaints: student?.complaints,
            studentChecklist: student?.studentChecklist,
            leave: student?.leave,
            transfer: student?.transfer,
            paymentList: student?.paymentList,
            studentExemptFee: student?.studentExemptFee,
            exemptFeeList: student?.exemptFeeList,
            student: student._id,
          });
          // await previousData.save();
          student?.previousYearData?.push(previousData._id);
          student.studentClass = "";
          student.studentCode = "";
          student.department = "";
          student.batches = "";
          student.studentBehaviour = "";
          student.studentROLLNO = 0;
          student.subjectMarks = [];
          student.exams = [];
          student.finalReportStatus = "No";
          student.finalReport = [];
          student.testSet = [];
          student.studentFee = [];
          student.attendDate = [];
          student.checklist = [];
          student.onlineFeeList = [];
          student.onlineCheckList = [];
          student.offlineFeeList = [];
          student.offlineCheckList = [];
          student.complaints = [];
          student.studentChecklist = [];
          student.leave = [];
          student.transfer = [];
          student.paymentList = [];
          student.applyList = [];
          student.studentExemptFee = [];
          student.exemptFeeList = [];

          // await student.save();
        }
        const staff = await Staff.findById(classes?.classTeacher).select(
          "staffClass previousStaffClass"
        );
        staff.previousStaffClass?.push(staff?.staffClass);
        staff.staffClass.pull(req.params.sid);
        // await Promise.all([staff.save(), classes.save()]);
        res.status(200).send({
          message: "Class is completed",
        });
      } else {
        res.status(200).send({
          message:
            "Can not completed class due to all subject is not completed",
        });
      }
    } else {
      res.status(200).send({ message: "already class is completed" });
    }
  } catch (e) {
    console.log(e);
  }
};
