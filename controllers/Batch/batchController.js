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
const Notification = require("../../models/notification");
const {
  todayDate,
  classCodeFunction,
} = require("../../Utilities/timeComparison");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const invokeFirebaseNotification = require("../../Firebase/firebase");
const User = require("../../models/User");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const { designation_alarm } = require("../../WhatsAppSMS/payload")

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
      const class_user = await User.findById({ _id: `${staff?.user}` });
      const classMaster = await ClassMaster.findById(oneClass?.masterClassName);
      const notify = new Notification({});
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
      notify.notifyContent = `you got the designation of ${identicalClass.className} as ${identicalClass.classHeadTitle}`;
      notify.notifySender = oneClass?.institute;
      notify.notifyReceiever = class_user._id;
      notify.notifyCategory = "Class Designation";
      class_user.uNotify.push(notify._id);
      notify.user = class_user._id;
      notify.notifyByInsPhoto = institute._id;
      invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        institute.insName,
        class_user._id,
        class_user.deviceToken
      );
      designation_alarm(
        class_user?.userPhoneNumber,
        "CLASS",
        institute?.sms_lang,
        identicalClass.className,
        identicalClass.classHeadTitle,
        ""
      );
      for (let oneSubject of oneClass?.subject) {
        const subjectMaster = await SubjectMaster.findById(
          oneSubject?.subjectMasterName
        );
        const sujectStaff = await Staff.findById(
          oneSubject?.subjectTeacherName
        );
        const subject_user = await User.findById({
          _id: `${sujectStaff?.user}`,
        });
        const notify_subject = new Notification({});
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
        notify_subject.notifyContent = `you got the designation of ${identicalSubject.subjectName} of ${identicalClass?.className} as ${identicalSubject.subjectTitle}`;
        notify_subject.notifySender = batch?.institute;
        notify_subject.notifyReceiever = subject_user._id;
        notify.notifyCategory = "Subject Designation";
        subject_user.uNotify.push(notify_subject._id);
        notify_subject.user = subject_user._id;
        notify_subject.notifyByInsPhoto = institute._id;
        invokeFirebaseNotification(
          "Designation Allocation",
          notify_subject,
          institute.insName,
          subject_user._id,
          subject_user.deviceToken
        );
        designation_alarm(
          subject_user?.userPhoneNumber,
          "SUBJECT",
          institute?.sms_lang,
          identicalSubject.subjectName,
          identicalSubject.subjectTitle,
          identicalClass?.classTitle
        );
        await Promise.all([
          identicalSubject.save(),
          sujectStaff.save(),
          subjectMaster.save(),
          notify_subject.save(),
          subject_user.save(),
        ]);
      }
      await Promise.all([
        identicalClass.save(),
        classMaster.save(),
        notify.save(),
        class_user.save(),
        staff.save(),
      ]);
    }

    await Promise.all([
      identicalBatch.save(),
      department.save(),
      institute.save(),
    ]);
    // const batchEncrypt = await encryptionPayload(identicalBatch?._id);
    res.status(200).send({
      message: "Identical Batch Created Successfully",
      batchId: identicalBatch?._id,
    });
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
    // const subjectEncrypt = await encryptionPayload(subject);
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
    const options = {
      sort: {
        createdAt: -1,
      },
    };
    const institute = await InstituteAdmin.findById(classes.institute)
      .populate({
        path: "depart",
        populate: {
          path: "batches",
          options,
          match: { _id: { $ne: classes.batch } },
          select: "batchName createdAt",
        },
        select: "dName dTitle photo dHead batches",
      })
      .populate({
        path: "depart",
        populate: {
          path: "dHead",
          select:
            "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto",
        },
        select: "dName dTitle photo dHead batches",
      })
      .select("_id depart")
      .lean()
      .exec();

    // const departEncrypt = await encryptionPayload(institute?.depart);
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

    // const classesEncrypt = await encryptionPayload(batch?.classroom);
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
      const user = await User.findById({ _id: `${student.user}` });
      const previousData = new StudentPreviousData({
        studentCode: student.studentCode,
        class: student?.studentClass,
        student: student?._id,
        batch: student?.batches,
        studentROLLNO: student.studentROLLNO,
        behaviour: student?.studentBehaviour,
        department: student?.department,
        institute: student?.institute,
        notification: student?.notification,
        subjectMarks: student?.subjectMarks,
        exams: student?.exams,
        finalReportStatus: student?.finalReportStatus,
        finalReport: student?.finalReport,
        testSet: student?.testSet,
        assignments: student?.assignments,
        totalAssignment: student?.totalAssignment,
        submittedAssignment: student?.submittedAssignment,
        incompletedAssignment: student?.incompletedAssignment,
        completedAssignment: student?.completedAssignment,
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
        studentExemptFee: student?.studentExemptFee,
        exemptFeeList: student?.exemptFeeList,
        studentRemainingFeeCount: student?.studentRemainingFeeCount,
        studentPaidFeeCount: student?.studentPaidFeeCount,
        library: student?.library,
        studentAdmissionDate: student?.studentAdmissionDate,
        borrow: student?.borrow,
        deposite: student?.deposite,
        sportEventCount: student?.sportEventCount,
        admissionRemainFeeCount: student?.admissionRemainFeeCount,
        admissionPaymentStatus: student?.admissionPaymentStatus,
        refundAdmission: student?.refundAdmission,
        remainingFeeList: student?.remainingFeeList,
        certificateBonaFideCopy: student?.certificateBonaFideCopy,
        certificateLeavingCopy: student?.certificateLeavingCopy,
        dailyUpdate: student?.dailyUpdate,
        student_biometric_id: student?.student_biometric_id,
        election_candidate: student?.election_candidate,
        participate_event: student?.participate_event,
      });
      // console.log(previousData);
      const notify = new StudentNotification({});
      notify.notifyContent = `${student.studentFirstName} ${student.studentMiddleName ? student.studentMiddleName : ""} ${student.studentLastName} Your Report Card is Ready `;
      notify.notifySender = classes._id;
      notify.notifyReceiever = user._id;
      notify.classId = classes._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      user.activity_tab.push(notify._id);
      notify.notifyByClassPhoto = classes._id;
      notify.notifyCategory = "Report Card";
      notify.redirectIndex = 20;
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "View Report Card",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([
        student.save(),
        notify.save(),
        user.save(),
        previousData.save(),
      ]);
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
      student.assignments = [];
      student.totalAssignment = 0;
      student.submittedAssignment = 0;
      student.incompletedAssignment = 0;
      student.completedAssignment = 0;
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
      student.studentRemainingFeeCount = 0;
      student.studentPaidFeeCount = 0;
      student.library = null;
      student.studentAdmissionDate = "";
      student.borrow = [];
      student.deposite = [];
      student.sportEventCount = 0;
      student.admissionRemainFeeCount = 0;
      student.admissionPaymentStatus = [];
      student.refundAdmission = [];
      student.remainingFeeList = [];
      student.certificateBonaFideCopy = {
        trueCopy: false,
        secondCopy: false,
        thirdCopy: false,
      };
      student.certificateLeavingCopy = {
        trueCopy: false,
        secondCopy: false,
        thirdCopy: false,
      };
      student.dailyUpdate = [];
      student.student_biometric_id = "";
      student.election_candidate = [];
      student.participate_event = [];
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
    // const classStatusEncrypt = await encryptionPayload(classes?.classStatus);
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
