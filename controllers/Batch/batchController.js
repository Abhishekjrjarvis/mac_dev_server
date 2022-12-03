const Department = require("../../models/Department");
const Class = require("../../models/Class");
const Batch = require("../../models/Batch");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Subject = require("../../models/Subject");
const SubjectMaster = require("../../models/SubjectMaster");
const ClassMaster = require("../../models/ClassMaster");
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
    // console.log(batch);
    // console.log(batch.classroom);
    // console.log(batch.classroom.subject);
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
      const classMaster = await ClassMaster.findById(oneClass?.masterClassName);
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
        finalReportsSettings: oneClass?.finalReportsSettings,
      });

      classMaster?.classDivision.push(identicalClass._id);
      classMaster.classCount += 1;
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
          setting: oneSubject?.setting,
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
      await Promise.all([
        identicalClass.save(),
        classMaster.save(),
        staff.save(),
      ]);
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

exports.subjectUpdateSetting = async (req, res) => {
  try {
    await Subject.findByIdAndUpdate(req.params.sid, req.body);
    res
      .status(200)
      .send({ message: "Subject setting is changed successfully 👏🤞" });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectSetting = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.sid)
      .select("setting subjectStatus")
      .lean()
      .exec();
    res.status(200).send({ message: "get subject setting", subject });
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
        "staffSubject previousStaffSubject staffDesignationCount"
      );
      staff.staffDesignationCount -= 1;
      staff.previousStaffSubject?.push(req.params.sid);
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
    const previousclasses = await Class.findById(req.params.cid);
    const classes = await Class.findById(classId);
    const batch = await Batch.findById(batchId);
    const department = await Department.findById(departmentId);
    let roll = classes.ApproveStudent?.length + 1;
    for (let stu of req.body?.students) {
      const student = await Student.findById(stu);
      const previousData = new StudentPreviousData({
        class: student?.studentClass,
        batch: student?.batches,
        department: student?.department,
        institute: student?.institute,
        studentROLLNO: student?.studentROLLNO,
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
      // console.log(previousData);
      await previousData.save();
      student?.previousYearData?.push(previousData._id);
      student.studentClass = classId;
      student.studentCode = classes.classCode;
      student.department = departmentId;
      student.batches = batchId;
      //here how to give the null in objectID
      student.studentBehaviour = null;
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

      previousclasses?.promoteStudent?.push(stu);
      previousclasses?.ApproveStudent?.pull(stu);
      classes.studentCount += 1;
      await student.save();

      if (student.studentGender === "Male") {
        classes.boyCount += 1;
        batch.student_category.boyCount += 1;
      } else if (student.studentGender === "Female") {
        classes.girlCount += 1;
        batch.student_category.girlCount += 1;
      } else {
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
    }

    await Promise.all([
      classes.save(),
      previousclasses.save(),
      batch.save(),
      department.save(),
    ]);

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
      .select("classStatus")
      .lean()
      .exec();
    res.status(200).send({
      message: "All subject is completed",
      classStatus: classes?.classStatus,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.classComplete = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid);
    if (classes.classStatus !== "Completed") {
      for (let subId of classes?.subject) {
        const subject = await Subject.findById(subId);
        if (subject.subjectStatus !== "Completed") {
          subject.subjectStatus = "Completed";
          const subStaff = await Staff.findById(
            subject?.subjectTeacherName
          ).select("staffSubject previousStaffSubject staffDesignationCount");
          if (subStaff.staffDesignationCount >= 1) {
            subStaff.staffDesignationCount -= 1;
          }
          subStaff.previousStaffSubject?.push(subject._id);
          subStaff.staffSubject.pull(subject._id);
          await Promise.all([subStaff.save(), subject.save()]);
        }
      }
      classes.classStatus = req.body.classStatus;
      const staff = await Staff.findById(classes?.classTeacher).select(
        "staffClass previousStaffClass"
      );
      if (staff.staffDesignationCount >= 1) {
        staff.staffDesignationCount -= 1;
      }
      staff.previousStaffClass?.push(req.params.cid);
      staff.staffClass.pull(req.params.cid);
      await Promise.all([staff.save(), classes.save()]);
      res.status(200).send({
        message: "Class is completed",
      });
    } else {
      res.status(200).send({ message: "already class is completed" });
    }
  } catch (e) {
    console.log(e);
  }
};
