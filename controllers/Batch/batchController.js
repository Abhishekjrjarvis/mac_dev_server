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
const { designation_alarm } = require("../../WhatsAppSMS/payload");

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
      // console.log("this is class", oneClass);
      const code = await classCodeFunction();
      const date = await todayDate();

      // console.log("this is staff", staff);

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
      identicalBatch?.classroom.push(identicalClass._id);
      if (req?.body?.with_designation === "Yes") {
        const staff = await Staff.findById(oneClass?.classTeacher);
        const class_user = await User.findById({ _id: `${staff?.user}` });
        staff?.staffClass.push(identicalClass._id);
        staff.staffDesignationCount += 1;
        staff.recentDesignation = identicalClass?.classHeadTitle;
        staff.designation_array.push({
          role: "Class Teacher",
          role_id: identicalClass?._id,
        });
        const notify = new Notification({});
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
        await Promise.all([notify.save(), class_user.save(), staff.save()]);
      }

      for (let oneSubject of oneClass?.subject) {
        const subjectMaster = await SubjectMaster.findById(
          oneSubject?.subjectMasterName
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
        subjectMaster?.subjects.push(identicalSubject._id);
        subjectMaster.subjectCount += 1;
        identicalClass?.subject.push(identicalSubject?._id);
        if (req?.body?.with_designation === "Yes") {
          const sujectStaff = await Staff.findById(
            oneSubject?.subjectTeacherName
          );
          const subject_user = await User.findById({
            _id: `${sujectStaff?.user}`,
          });
          sujectStaff?.staffSubject.push(identicalSubject._id);
          sujectStaff.staffDesignationCount += 1;
          sujectStaff.recentDesignation = identicalSubject?.subjectTitle;
          sujectStaff.designation_array.push({
            role: "Subject Teacher",
            role_id: identicalSubject?._id,
          });
          const notify_subject = new Notification({});
          notify_subject.notifyContent = `you got the designation of ${identicalSubject.subjectName} as ${identicalSubject.subjectTitle}`;
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
          await Promise.all([
            notify_subject.save(),
            sujectStaff.save(),
            subject_user.save(),
          ]);
        }

        await Promise.all([identicalSubject.save(), subjectMaster.save()]);
      }
      await Promise.all([identicalClass.save(), classMaster.save()]);
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
    // console.log("thisfbsdnag snfbbnbn");
    for (let stu of req.body?.students) {
      const student = await Student.findById(stu);
      const user = await User.findById({ _id: `${student.user}` });
      const previousData = new StudentPreviousData({
        studentCode: student.studentCode,
        studentClass: student.studentClass,
        student: student._id,
        batches: student.batches,
        studentROLLNO: student.studentROLLNO,
        studentBehaviour: student.studentBehaviour,
        department: student.department,
        institute: student.institute,

        //here some also doubt
        notification: student.notification,

        subjectMarks: student.subjectMarks,
        exams: student.exams,
        finalReportStatus: student.finalReportStatus,
        finalReport: student.finalReport,
        testSet: student.testSet,
        assignments: student.assignments,
        totalAssignment: student.totalAssignment,
        submittedAssignment: student.submittedAssignment,
        incompletedAssignment: student.incompletedAssignment,
        completedAssignment: student.completedAssignment,
        studentFee: student.studentFee,
        attendDate: student.attendDate,
        allottedChecklist: student.allottedChecklist,
        onlineFeeList: student.onlineFeeList,
        onlineCheckList: student.onlineCheckList,
        offlineFeeList: student.offlineFeeList,
        sportClass: student.sportClass,
        sportTeam: student.sportTeam,
        extraPoints: student.extraPoints,
        sportEvent: student.sportEvent,
        studentSportsEventMatch: student.studentSportsEventMatch,
        complaints: student?.complaints,
        leave: student?.leave,
        studentExemptFee: student?.studentExemptFee,
        exemptFeeList: student?.exemptFeeList,
        studentRemainingFeeCount: student?.studentRemainingFeeCount,
        studentPaidFeeCount: student?.studentPaidFeeCount,
        studentAdmissionDate: student?.studentAdmissionDate,
        borrow: student?.borrow,
        deposite: student?.deposite,
        sportEventCount: student?.sportEventCount,
        admissionRemainFeeCount: student?.admissionRemainFeeCount,
        admissionPaidFeeCount: student?.admissionPaidFeeCount,
        paidFeeList: student?.paidFeeList,
        refundAdmission: student?.refundAdmission,
        remainingFeeList: student?.remainingFeeList,
        remainingFeeList_count: student?.remainingFeeList_count,
        fee_structure: student?.fee_structure,
        active_fee_heads: student?.active_fee_heads,
        certificateBonaFideCopy: student?.certificateBonaFideCopy,
        certificateLeavingCopy: student?.certificateLeavingCopy,
        dailyUpdate: student?.dailyUpdate,
        student_biometric_id: student?.student_biometric_id,
        election_candidate: student?.election_candidate,
        participate_event: student?.participate_event,
        checkList_participate_event: student?.checkList_participate_event,
        participate_result: student?.participate_result,
        backlog: student?.backlog,
        vehicle: student?.vehicle,
        vehicleRemainFeeCount: student?.vehicleRemainFeeCount,
        vehiclePaidFeeCount: student?.vehiclePaidFeeCount,
        vehicle_payment_status: student?.vehicle_payment_status,
        active_routes: student?.active_routes,
        query_count: student?.query_count,
        mentor: student?.mentor,
        queries: student?.queries,
        total_query: student?.total_query,
        feed_back_count: student?.feed_back_count,
        deposit_pending_amount: student?.deposit_pending_amount,
        deposit_refund_amount: student?.deposit_refund_amount,
        refund_deposit: student?.refund_deposit,
        form_status: student?.form_status,
        fee_receipt: student?.fee_receipt,
      });
      // console.log(previousData);
      const notify = new StudentNotification({});
      notify.notifyContent = `${student.studentFirstName} ${
        student.studentMiddleName ? student.studentMiddleName : ""
      } ${student.studentLastName} Your Report Card is Ready `;
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
      student.attendDate = [];
      student.sportClass = [];
      student.sportTeam = [];
      student.extraPoints = 0;
      student.sportEvent = [];
      student.studentSportsEventMatch = [];
      student.complaints = [];
      student.leave = [];
      student.studentAdmissionDate = "";
      student.borrow = [];
      student.deposite = [];
      student.sportEventCount = 0;

      // here assign new fee st
      student.fee_structure = null;
      student.active_fee_heads = [];
      /////
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

      //============== here some confusion for biometric id -> Ok we will resolve it...
      student.student_biometric_id = "";
      student.election_candidate = [];
      student.participate_event = [];
      student.participate_result = [];
      student.vehicle = null;
      student.routes = [];
      student.active_routes = null;
      student.query_count = 0;
      student.mentor = null;
      student.queries = [];
      student.total_query = 0;
      student.feed_back_count = 0;
      student.deposit_pending_amount = 0;
      student.deposit_refund_amount = 0;
      student.refund_deposit = [];
      student.form_status = "Not Filled";
      student.fee_receipt = [];
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
      // previousclasses?.ApproveStudent?.pull(stu);
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

exports.classUncomplete = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid) throw "Please call api with proper knowledge.....";
    const classes = await Class.findById(req.params.cid);
    classes.classStatus = "UnCompleted";
    const class_teacher = await Staff.findById(classes?.classTeacher);
    class_teacher.previousStaffClass.pull(classes._id);
    class_teacher.staffClass.push(classes._id);
    await Promise.all([class_teacher.save(), classes.save()]);
    res.status(200).send({
      message: "Class unlock successfully...",
      classStatus: class_teacher.classStatus,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
      classStatus: null,
    });
    console.log(e);
  }
};
