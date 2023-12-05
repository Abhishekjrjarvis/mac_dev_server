const InstituteAdmin = require("../../models/InstituteAdmin");
const Student = require("../../models/Student");
const Class = require("../../models/Class");
const Department = require("../../models/Department");
const User = require("../../models/User");
const StudentLeave = require("../../models/StudentLeave");
const Complaint = require("../../models/Complaint");
const StaffComplaint = require("../../models/StaffComplaint");
const Notification = require("../../models/notification");
const Leave = require("../../models/Leave");
const Staff = require("../../models/Staff");
const Finance = require("../../models/Finance");
const Batch = require("../../models/Batch");
const Subject = require("../../models/Subject");
const Transfer = require("../../models/Transfer");
const StudentTransfer = require("../../models/StudentTransfer");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeFirebaseNotification = require("../../Firebase/firebase");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");
const FinanceModerator = require("../../models/Moderator/FinanceModerator");
const AdmissionModerator = require("../../models/Moderator/AdmissionModerator");
const Mentor = require("../../models/MentorMentee/mentor");
const EventManager = require("../../models/Event/eventManager");
const Alumini = require("../../models/Alumini/Alumini");
const Hostel = require("../../models/Hostel/hostel");
const HostelUnit = require("../../models/Hostel/hostelUnit");
const Library = require("../../models/Library/Library");
const Admission = require("../../models/Admission/Admission");
const Transport = require("../../models/Transport/transport");
const Vehicle = require("../../models/Transport/vehicle");

//=======================================For the students related controller=========================================

exports.getStudentLeave = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "leave",
        select: "reason date status",
      })
      .select("_id leave");
    // const aEncrypt = await encryptionPayload(student.leave);
    res.status(200).send({ message: "All leaves", allLeave: student.leave });
  } catch (e) {
    console.log(e);
  }
};

exports.postStudentLeave = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentDateLocalFormat = currentDate.toISOString().split("-");
    const dateArray = [];
    req.body.dates.forEach((dat) => {
      const fdate = dat?.split("/");
      const classyear = +fdate[2] > +currentDateLocalFormat[0];
      const year = +fdate[2] === +currentDateLocalFormat[0];
      const classmonth = +fdate[1] > +currentDateLocalFormat[1];
      const month = +fdate[1] === +currentDateLocalFormat[1];
      const day = +fdate[0] >= +currentDateLocalFormat[2].split("T")[0];
      if (classyear) {
        dateArray.push(dat);
      } else if (year) {
        if (classmonth) {
          dateArray.push(dat);
        } else if (month) {
          if (day) {
            dateArray.push(dat);
          }
        } else {
        }
      } else {
      }
    });

    if (dateArray?.length === 0) {
      throw "Please select date range today to next all dates";
    }
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "studentClass",
        select: "studentClass",
      })
      .select("leave studentFirstName studentMiddleName studentLastName");

    const classes = await Class.findById(student.studentClass)
      .populate({
        path: "classTeacher",
        populate: {
          path: "user",
        },
      })
      .select("studentLeave classTeacher");

    const user = await User.findById({
      _id: `${classes.classTeacher.user._id}`,
    }).select("uNotify activity_tab");

    const leave = new StudentLeave({
      reason: req.body.reason,
      date: dateArray,
      classes: classes._id,
      student: student._id,
    });
    classes.studentLeave.push(leave._id);
    student.leave.push(leave._id);

    const notify = new StudentNotification({});
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} requested for a leave check application`;
    notify.notifySender = req.params.sid;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Staff";
    notify.notifyPublisher = classes.classTeacher._id;
    user.activity_tab.push(notify._id);
    notify.notifyByStudentPhoto = student._id;
    notify.notifyCategory = "Leave";
    notify.redirectIndex = 10;
    notify.classId = classes?._id;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      "Leave Application",
      user._id,
      user.deviceToken,
      "Staff",
      notify
    );
    //
    await Promise.all([
      classes.save(),
      student.save(),
      leave.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(201).send({ message: "request to leave" });
  } catch (e) {
    console.log(e);
  }
};

exports.getStudentOneLeaveDetail = async (req, res) => {
  try {
    const studentLeave = await StudentLeave.findById(req.params.lid).select(
      "_id date reason status"
    );
    // const leaveEncrypt = await encryptionPayload(studentLeave);
    res.status(200).send({ message: "One leave Details", leave: studentLeave });
  } catch (e) {
    console.log(e);
  }
};

exports.getStudentOneLeaveDelete = async (req, res) => {
  try {
    const studentLeave = await StudentLeave.findById(req.params.lid).select(
      "_id student classes"
    );
    const classes = await Class.findById(studentLeave.classes).select(
      "studentLeave"
    );
    classes.studentLeave.pull(req.params.lid);
    const student = await Student.findById(studentLeave.student).select(
      "leave"
    );
    student.leave.pull(req.params.lid);
    await Promise.all([classes.save(), student.save()]);
    await StudentLeave.findByIdAndDelete(req.params.lid);
    res.status(200).send({ message: "One leave deleted" });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllStudentLeaveClass = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "studentLeave",
        populate: {
          path: "student",
          select:
            "studentProfilePhoto studentFirstName studentMiddleName studentLastName",
        },
        select: "reason date status student",
      })
      .select("_id studentLeave");
    // const cEncrypt = await encryptionPayload(classes.studentLeave);
    res
      .status(200)
      .send({ message: "All leaves", allLeave: classes.studentLeave });
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentLeaveProcess = async (req, res) => {
  try {
    const { status } = req.body;
    let leave = await StudentLeave.findById(req.params.cid)
      .populate({
        path: "classes",
        select: "className",
      })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "uNotify activity_tab",
        },
        select: "user",
      })
      .select("student classes status");
    leave.status = status;
    const user = await User.findById(leave?.student?.user._id);

    const notify = new StudentNotification({});
    notify.notifyContent = `Your Leave request has been ${req.body.status} by ${leave.classes.className}`;
    notify.notifySender = leave.classes._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = leave.student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByClassPhoto = leave.classes._id;
    notify.notifyCategory = "Leave Status";
    notify.redirectIndex = 10;
    //
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      `Leave Application ${req.body.status}`,
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
    //
    await Promise.all([leave.save(), user.save(), notify.save()]);
    res
      .status(200)
      .send({ message: `Leave ${req.body.status} by Class Teacher` });
  } catch (e) {
    console.log(e);
  }
};

exports.studentComplaintDestination = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "studentClass",
        populate: {
          path: "department",
          select: "dTitle _id",
        },
        select: "_id classHeadTitle",
      })
      .select("_id studentClass");
    // const titleEncrypt = await encryptionPayload(student);
    res.status(200).send({
      message: "Class Head Tilte and Department head title",
      title: student,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.studentComplaint = async (req, res) => {
  try {
    const { classHead, departmentHead } = req.body;
    const student = await Student.findById(req.params.sid);
    const complaint = new Complaint({
      complaintType: req.body.complaintType,
      complaintContent: req.body.complaintContent,
      student: student._id,
      complaintTo: req.body.complaintTo,
    });
    if (departmentHead !== "") {
      const notify = new StudentNotification({});
      const department = await Department.findById(departmentHead);
      const dStaff = await Staff.findById({ _id: `${department?.dHead}` });
      const dUser = await User.findById({ _id: `${dStaff?.user}` });
      department?.studentComplaint.push(complaint._id);
      complaint.department = department._id;
      complaint.institute = department.institute;
      notify.notifyContent = `${student?.studentFirstName} ${student?.studentLastName} raised a complaint.`;
      notify.notifySender = student._id;
      notify.notifyReceiever = dUser._id;
      notify.notifyType = "Staff";
      notify.notifyPublisher = dStaff._id;
      dUser.activity_tab.push(notify._id);
      notify.notifyByStudentPhoto = student._id;
      notify.notifyCategory = "Department Complaint";
      notify.redirectIndex = 15;
      //
      invokeMemberTabNotification(
        "Staff Activity",
        notify,
        "Raise Complaint",
        dUser._id,
        dUser.deviceToken,
        "Staff",
        notify
      );
      await Promise.all([department.save(), dUser.save(), notify.save()]);
    } else if (classHead !== "") {
      const notify = new StudentNotification({});
      const classes = await Class.findById(classHead).populate({
        path: "department",
        select: "institute",
      });
      const cStaff = await Staff.findById({ _id: `${classes?.classTeacher}` });
      const cUser = await User.findById({ _id: `${cStaff?.user}` });
      classes?.studentComplaint.push(complaint._id);
      complaint.classes = classes._id;
      complaint.institute = classes.department.institute;
      notify.notifyContent = `${student?.studentFirstName} ${student?.studentLastName} raised a complaint.`;
      notify.notifySender = student._id;
      notify.notifyReceiever = cUser._id;
      notify.notifyType = "Staff";
      notify.notifyPublisher = cStaff._id;
      cUser.activity_tab.push(notify._id);
      notify.notifyByStudentPhoto = student._id;
      notify.notifyCategory = "Class Complaint";
      notify.redirectIndex = 15;
      //
      invokeMemberTabNotification(
        "Staff Activity",
        notify,
        "Raise Complaint",
        cUser._id,
        cUser.deviceToken,
        "Staff",
        notify
      );
      await Promise.all([classes.save(), cUser.save(), notify.save()]);
    } else {
    }
    student.complaints.push(complaint._id);
    await Promise.all([student.save(), complaint.save()]);

    res.status(201).send({ message: "Request complaint" });
  } catch (e) {
    console.log(e);
  }
};

exports.studentAllComplaint = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "complaints",
        select: "complaintType complaintTo complaintStatus createdAt",
      })
      .select("complaints _id");
    // const complaintEncrypt = await encryptionPayload(student.complaints);
    res
      .status(200)
      .send({ message: "all complaints", complaints: student.complaints });
  } catch (e) {
    console.log(e);
  }
};

exports.OneComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.cid)
      .select(
        "complaintType complaintTo complaintContent complaintStatus complaintInsStatus reportAdmin createdAt"
      )
      .populate({
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
      });
    // const oneEncrypt = await encryptionPayload(complaint);
    res.status(200).send({ message: "one complaint details", complaint });
  } catch (e) {
    console.log(e);
  }
};

exports.OneComplaintReportAdmin = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.cid).select(
      "complaintInsStatus reportAdmin institute student"
    );
    if (complaint.reportAdmin === "No") {
      const institute = await InstituteAdmin.findById(complaint.institute);
      institute.studentComplaints.push(complaint._id);
      complaint.reportAdmin = "Yes";
      const notify = new Notification({});
      notify.notifyContent = `A new complaint is reported by some one`;
      notify.notifySender = complaint.student;
      notify.notifyReceiever = institute._id;
      institute.iNotify.push(notify._id);
      notify.institute = institute._id;
      notify.notifyCategory = "Report Complaint";
      notify.notifyByInsPhoto = institute._id;
      await invokeFirebaseNotification(
        "Designation Allocation",
        notify,
        "Reported Complaint",
        institute._id,
        institute.deviceToken
      );
      await Promise.all([institute.save(), complaint.save(), notify.save()]);
    }
    res.status(201).send({ message: "Complaints to the Admin" });
  } catch (e) {
    console.log(e);
  }
};

exports.classAllComplaint = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid).populate({
      path: "studentComplaint",
      match: {
        complaintStatus: { $eq: `${req.query.status}` },
        // complaintType: "Open",
      },
      populate: {
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
      },
      select: "complaintType complaintTo complaintStatus createdAt",
    });
    // const compEncrypt = await encryptionPayload(classes.studentComplaint);
    res.status(200).send({
      message: "all complaints",
      complaints: classes.studentComplaint,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.departmentAllComplaint = async (req, res) => {
  try {
    const department = await Department.findById(req.params.did).populate({
      path: "studentComplaint",
      match: {
        complaintStatus: { $eq: `${req.query.status}` },
        // complaintType: "Open",
      },
      populate: {
        path: "student",
        select: "studentFirstName studentMiddleName studentLastName",
      },
      select: "complaintType complaintTo complaintStatus createdAt",
    });
    // const departEncrypt = await encryptionPayload(department.studentComplaint);
    res.status(200).send({
      message: "all complaints",
      complaints: department.studentComplaint,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.classComplaintSolve = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.cid);
    if (complaint.complaintStatus === "Solved") {
      throw "Complaints is Already solved";
    }
    complaint.complaintStatus = req.body.status;
    const institute = await InstituteAdmin.findById(complaint.institute);
    if (institute?.studentComplaints?.includes(req.params.cid))
      complaint.complaintInsStatus = req.body.status;

    await complaint.save();
    res.status(200).send({ message: "Complaint Resolevd" });
  } catch (e) {
    console.log(e);
  }
};

exports.OneComplaintDelete = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.cid);

    const student = await Student.findById(complaint.student).select(
      "complaints"
    );
    student.complaints.pull(req.params.cid);
    if (complaint.classes) {
      const classes = await Class.findById(complaint.classes).select(
        "studentComplaint"
      );
      classes.studentComplaint.pull(req.params.cid);
      await classes.save();
    }

    if (complaint.department) {
      const department = await Department.findById(complaint.department).select(
        "studentComplaint"
      );
      department.studentComplaint.pull(req.params.cid);
      await department.save();
    }

    const institute = await InstituteAdmin.findById(complaint.institute).select(
      "studentComplaints"
    );
    if (institute.studentComplaints)
      institute.studentComplaints.pull(req.params.cid);

    await Promise.all([student.save(), institute.save()]);
    await Complaint.findByIdAndDelete(req.params.cid);

    res.status(200).send({ message: "complaint deleted successfully" });
  } catch (e) {
    console.log(e);
  }
};

exports.instituteAllComplaint = async (req, res) => {
  try {
    const institute = await InstituteAdmin.findById(req.params.id)
      .populate({
        path: "studentComplaints",
        match: {
          complaintStatus: { $eq: `${req.query.status}` },
          // complaintType: "Open",
        },
        populate: {
          path: "student",
          select: "studentFirstName studentMiddleName studentLastName",
        },
        select: "complaintType complaintStatus createdAt",
      })
      .select("studentComplaints");
    // const insEncrypt = await encryptionPayload(institute.studentComplaints);
    res.status(200).send({
      message: "all complaints",
      complaints: institute.studentComplaints,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.studentTransferRequested = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid);
    const classes = await Class.findById(student.studentClass).populate({
      path: "classTeacher",
      select: "user",
    });
    const user = await User.findById({
      _id: `${classes.classTeacher.user}`,
    });
    const transfer = new StudentTransfer({
      transferReason: req.body.transferReason,
      fromClass: classes._id,
      student: student._id,
    });
    classes.studentTransfer.push(transfer._id);
    student.transfer.push(transfer._id);
    const notify = new StudentNotification({});
    notify.notifyContent = `${student.studentFirstName} ${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${
      student.studentLastName
    } requested for a Transfer. check application status`;
    notify.notifySender = student._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Staff";
    notify.notifyPublisher = classes.classTeacher._id;
    user.activity_tab.push(notify._id);
    notify.notifyByStudentPhoto = student._id;
    notify.notifyCategory = "Transfer";
    notify.redirectIndex = 11;
    notify.classId = classes?._id;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      "Request for Transfer",
      user._id,
      user.deviceToken,
      "Staff",
      notify
    );
    //
    await Promise.all([
      classes.save(),
      student.save(),
      transfer.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(201).send({ message: "request to transfer" });
  } catch (e) {
    console.log(e);
  }
};

exports.studentTransferApproved = async (req, res) => {
  try {
    const { status } = req.body;
    const transfer = await StudentTransfer.findById(req.params.tid);
    const student = await Student.findById(transfer.student).populate({
      path: "user",
    });
    const classes = await Class.findById(transfer.fromClass);
    const user = await User.findById({ _id: `${student.user._id}` });
    const department = await Department.findById(classes.department);
    const institute = await InstituteAdmin.findById(department.institute);

    const batch = await Batch.findById(classes.batch);
    const notify = new StudentNotification({});
    transfer.transferStatus = status;
    classes.ApproveStudent.pull(student._id);
    department.ApproveStudent.pull(student._id);
    student.department = "";
    batch.ApproveStudent.pull(student._id);
    notify.notifyContent = `Your Transfer request has been Approved by ${institute.insName} from ${classes.className}`;
    notify.notifySender = classes._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByClassPhoto = classes._id;
    notify.notifyCategory = "Transfer Status";
    notify.redirectIndex = 11;
    //
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      `Transfer Request Approved`,
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
    //
    await Promise.all([
      transfer.save(),
      classes.save(),
      department.save(),
      student.save(),
      batch.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(200).send({ message: "Transfer Granted" });
  } catch (e) {
    console.log(e);
  }
};

exports.studentTransferRejected = async (req, res) => {
  try {
    const { status } = req.body;
    const transfer = await StudentTransfer.findById(req.params.tid);
    const classes = await Class.findById(transfer.fromClass);
    const student = await Student.findById(transfer.student).populate({
      path: "user",
    });
    const user = await User.findById({ _id: `${student.user._id}` });
    const notify = new StudentNotification({});
    transfer.transferStatus = status;
    notify.notifyContent = `Your Transfer request has been Rejected by ${classes.className}`;
    notify.notifySender = classes._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Student";
    notify.notifyPublisher = student._id;
    user.activity_tab.push(notify._id);
    notify.notifyByClassPhoto = classes._id;
    notify.notifyCategory = "Transfer Status";
    notify.redirectIndex = 11;
    //
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      "Transfer Request Rejected",
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
    //
    await Promise.all([transfer.save(), user.save(), notify.save()]);
    res.status(200).send({ message: "Transfer Not Granted" });
  } catch (e) {
    console.log(e);
  }
};

exports.classAllTransfer = async (req, res) => {
  try {
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "studentTransfer",
        // match: {
        //   complaintStatus: { $eq: `${req.query.status}` },
        //   // complaintType: "Open",
        // },
        populate: {
          path: "student",
          select: "studentFirstName studentMiddleName studentLastName",
        },
        select: "transferReason createdAt student transferStatus",
      })
      .select("studentTransfer");
    // const transferEncrypt = await encryptionPayload(classes.studentTransfer);
    res.status(200).send({
      message: "all transfers",
      transfers: classes.studentTransfer,
    });
  } catch (e) {
    console.log(e);
  }
};

//=======================================For the staff related controller=========================================

exports.getStaffLeave = async (req, res) => {
  try {
    const { category } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const staff = await Staff.findById(req.params.sid)
    .select("staffLeave")
    if(category){
      var all_leave = await Leave.find({ $and: [{ _id: {$in: staff?.staffLeave } }, { leave_type: `${category}`}]})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    }
    else{
      var all_leave = await Leave.find({ _id: {$in: staff?.staffLeave }})
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    }
    // const lEncrypt = await encryptionPayload(staff.staffLeave);
    res.status(200).send({ message: "All leaves", allLeave: all_leave });
  } catch (e) {
    console.log(e);
  }
};

exports.postStaffLeave = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentDateLocalFormat = currentDate.toISOString().split("-");
    const dateArray = [];
    req.body.dates.forEach((dat) => {
      const fdate = dat?.split("/");
      const classyear = +fdate[2] > +currentDateLocalFormat[0];
      const year = +fdate[2] === +currentDateLocalFormat[0];
      const classmonth = +fdate[1] > +currentDateLocalFormat[1];
      const month = +fdate[1] === +currentDateLocalFormat[1];
      const day = +fdate[0] >= +currentDateLocalFormat[2].split("T")[0];
      if (classyear) {
        dateArray.push(dat);
      } else if (year) {
        if (classmonth) {
          dateArray.push(dat);
        } else if (month) {
          if (day) {
            dateArray.push(dat);
          }
        } else {
        }
      } else {
      }
    });

    if (dateArray?.length === 0) {
      throw "Please select date range today to next all dates";
    }
    const staff = await Staff.findById(req.params.sid)
      .populate({
        path: "staffLeave",
        select: "staffLeave",
      })

      .select(
        "staffLeave user institute staffFirstName staffMiddleName staffLastName"
      );

    const user = await User.findById(staff.user).select("uNotify");

    const institute = await InstituteAdmin.findById(staff.institute);
    const leave = new Leave({
      reason: req.body.reason,
      date: dateArray,
      staff: staff._id,
      institute: institute._id,
    });
    leave.leave_grant = dateArray?.length
    leave.leave_type = req?.body?.leave_type
    institute.leave.push(leave._id);
    staff.staffLeave.push(leave._id);
    if(req?.body?.attach){
      leave.attach = req?.body?.attach
    }
    const notify = new Notification({});
    notify.notifyContent = `${staff.staffFirstName} ${
      staff.staffMiddleName ? ` ${staff.staffMiddleName}` : ""
    } ${staff.staffLastName} requested for a leave check application`;
    notify.notifySender = req.params.sid;
    notify.notifyReceiever = institute._id;
    institute.iNotify.push(notify._id);
    notify.notifyByStaffPhoto = staff._id;
    notify.notifyCategory = "Leave";
    notify.redirectIndex = 10;
    notify.instituteId = institute?._id;
    //
    invokeMemberTabNotification(
      "Institute Activity",
      notify,
      "Request for Leave",
      institute._id,
      institute.deviceToken,
      "Institute",
      notify
    );
    //
    await Promise.all([
      institute.save(),
      staff.save(),
      leave.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(201).send({ message: "request to leave" });
  } catch (e) {
    console.log(e);
  }
};

exports.getStaffOneLeaveDetail = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.lid).select(
      "_id date reason status"
    );
    // const oneLeaveEncrypt = await encryptionPayload(leave);
    res.status(200).send({ message: "One leave Details", leave: leave });
  } catch (e) {
    console.log(e);
  }
};

exports.getStaffOneLeaveDelete = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.lid).select(
      "_id staff institute leave_type"
    );
    const institute = await InstituteAdmin.findById(leave.institute).select(
      "leave"
    );
    institute.leave.pull(req.params.lid);
    const staff = await Staff.findById(leave.staff).select("staffLeave");
    staff.staffLeave.pull(req.params.lid);
    await Leave.findByIdAndDelete(req.params.lid);
    await Promise.all([institute.save(), staff.save()]);
    res.status(200).send({ message: "One leave deleted" });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllStaffLeaveInstitute = async (req, res) => {
  try {
    const { id } = req?.params
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status_query } = req?.query
    if(!id) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})
    const ins = await InstituteAdmin.findById({ _id: id})
    
    var all_leave = await Leave.find({ $and: [{ _id: { $in: ins?.leave }}, { status: `${status_query}`}] })
    .sort({ createdAt: -1})
    .limit(limit)
    .skip(skip)
    .populate({
      path: "staff",
      select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO"
    })
    
    if(all_leave?.length > 0){
      res.status(200).send({ message: "Explore All Leave Query", access: true, all_leave: all_leave})
    }
    else{
      res.status(200).send({ message: "I think you're lost in space", access: true, all_leave: []})
    }
  } catch (e) {
    console.log(e);
  }
};

exports.oneStaffLeaveProcess = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate({
        path: "institute",
        select: "insName",
      })
      .populate({
        path: "staff",
        populate: {
          path: "user",
          select: "uNotify activity_tab",
        },
        select: "user casual_leave medical_leave sick_leave leave_taken",
      })
      .select("staff institute status");
    const user = await User.findById(leave.staff.user._id);

    const notify = new StudentNotification({});
    leave.status = req.body.status;
    if(req?.body?.status === "Issued"){
      leave.granted_on = new Date()
    }
    if(leave?.leave_type === "Casual Leave"){
      if(leave?.staff?.casual_leave > leave?.leave_grant){
        leave.staff.casual_leave -= leave?.leave_grant
      }
    }
    if(leave?.leave_type === "Medical Leave"){
      if(leave?.staff?.medical_leave > leave?.leave_grant){
        leave.staff.medical_leave -= leave?.leave_grant
      }
    }
    if(leave?.leave_type === "Sick Leave"){
      if(leave?.staff?.sick_leave > leave?.leave_grant){
        leave.staff.sick_leave -= leave?.leave_grant
      }
    }
    if(leave?.leave_type === "Compensation Off Leave"){
      if(leave?.staff?.c_off_leave > leave?.leave_grant){
        leave.staff.c_off_leave -= leave?.leave_grant
      }
    }

    leave.staff.leave_taken += leave?.leave_grant
    notify.notifyContent = `Your Leave request has been ${req.body.status} by ${leave.institute.insName}`;
    notify.notifySender = leave.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = "Staff";
    notify.notifyPublisher = leave.staff._id;
    user.activity_tab.push(notify._id);
    notify.notifyByInsPhoto = leave.institute._id;
    notify.notifyCategory = "Leave Status";
    notify.redirectIndex = 10;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      `Leave Application ${req.body.status}`,
      user._id,
      user.deviceToken,
      "Staff",
      notify
    );
    //
    await Promise.all([leave.save(), user.save(), notify.save(), leave.staff.save()]);
    res.status(200).send({ message: `Leave ${req.body.status} by Institute` });
  } catch (e) {
    console.log(e);
  }
};

exports.staffComplaint = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.sid);
    // console.log(staff);
    const complaint = new StaffComplaint({
      complaintType: req.body.complaintType,
      complaintContent: req.body.complaintContent,
      staff: staff._id,
      institute: staff.institute,
    });
    const institute = await InstituteAdmin.findById(staff.institute);
    institute.staffComplaints.push(complaint._id);
    staff.complaints.push(complaint._id);
    await Promise.all([staff.save(), complaint.save(), institute.save()]);
    res.status(201).send({ message: "Request complaint" });
  } catch (e) {
    console.log(e);
  }
};

exports.stafftAllComplaint = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.sid)
      .populate({
        path: "complaints",
        select: "complaintType complaintStatus createdAt complaintContent",
      })
      .select("complaints _id");
    // const sCompEncrypt = await encryptionPayload(staff.complaints);
    res
      .status(200)
      .send({ message: "all complaints", complaints: staff.complaints });
  } catch (e) {
    console.log(e);
  }
};

exports.OneStaffComplaint = async (req, res) => {
  try {
    const complaint = await StaffComplaint.findById(req.params.cid)
      .populate({
        path: "staff",
        select: "staffFirstName staffMiddleName staffLastName",
      })
      .select("complaintType  complaintContent complaintStatus createdAt");
    // const oneCompEncrypt = await encryptionPayload(complaint);
    res.status(200).send({ message: "one complaint details", complaint });
  } catch (e) {
    console.log(e);
  }
};

exports.staffComplaintSolve = async (req, res) => {
  try {
    const complaint = await StaffComplaint.findById(req.params.cid);
    if (complaint.complaintStatus === "Solved") {
      throw "Complaints is Already solved";
    }
    complaint.complaintStatus = req.body.status;
    await complaint.save();
    res.status(200).send({ message: "Complaint Resolevd" });
  } catch (e) {
    console.log(e);
  }
};

exports.staffComplaintDelete = async (req, res) => {
  try {
    const complaint = await StaffComplaint.findById(req.params.cid);

    const staff = await Staff.findById(complaint.staff).select("complaints");
    staff.complaints.pull(req.params.cid);

    const institute = await InstituteAdmin.findById(complaint.institute).select(
      "staffComplaints"
    );
    institute.staffComplaints.pull(req.params.cid);

    await Promise.all([staff.save(), institute.save()]);
    await StaffComplaint.findByIdAndDelete(req.params.cid);
    res.status(200).send({ message: "complaint deleted successfully" });
  } catch (e) {
    console.log(e);
  }
};

exports.instituteStaffAllComplaint = async (req, res) => {
  try {
    const institute = await InstituteAdmin.findById(req.params.id)
      .populate({
        path: "staffComplaints",
        match: {
          complaintStatus: { $eq: `${req.query.status}` },
          // complaintType: "Open",
        },
        populate: {
          path: "staff",
          select: "staffFirstName staffMiddleName staffLastName",
        },
        select: "complaintType complaintStatus createdAt",
      })
      .select("staffComplaints");
    // const iAllCompEncrypt = await encryptionPayload(institute.staffComplaints);
    res.status(200).send({
      message: "all complaints",
      complaints: institute.staffComplaints,
    });
  } catch (e) {
    console.log(e);
  }
};

//For the transfer api related staff and student

exports.staffTransferRequested = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.sid);
    const institute = await InstituteAdmin.findById(staff.institute);
    const transfer = new Transfer({
      transferReason: req.body.transferReason,
      institute: institute._id,
      staff: req.params.sid,
    });
    institute.transfer.push(transfer._id);
    staff.staffTransfer.push(transfer._id);
    await Promise.all([institute.save(), staff.save(), transfer.save()]);
    res.status(201).send({ message: "request to transfer" });
  } catch (e) {
    console.log(e);
  }
};

exports.staffTransferApproved = async (req, res) => {
  try {
    const { status, previousStaff, assignedStaff } = req.body;
    const transfer = await Transfer.findById(req.params.tid);
    const institute = await InstituteAdmin.findById(
      transfer.institute
    ).populate({
      path: "depart",
      populate: {
        path: "batches",
        populate: {
          path: "batchStaff",
        },
      },
    });
    const staffNew = await Staff.findById(assignedStaff);
    const transferStaff = await Staff.findById(previousStaff);
    transfer.transferStatus = status;
    transfer.replaceBystaff = assignedStaff;
    await transfer.save();
    for (let i = 0; i < transferStaff.staffDepartment?.length; i++) {
      const department = await Department.findById(
        transferStaff.staffDepartment[i]
      );
      department.dHead = staffNew?._id;
      staffNew.staffDepartment.push(department._id);
      transferStaff.previousStaffDepartment.push(department._id);
      await department.save();
    }
    for (let i = 0; i < transferStaff.staffClass?.length; i++) {
      const classes = await Class.findById(transferStaff.staffClass[i]);
      classes.classTeacher = staffNew?._id;
      staffNew.staffClass.push(classes._id);
      transferStaff.previousStaffClass.push(classes._id);
      await classes.save();
    }
    for (let i = 0; i < transferStaff.staffSubject?.length; i++) {
      const subject = await Subject.findById(transferStaff.staffSubject[i]);
      subject.subjectTeacherName = staffNew?._id;
      staffNew.staffSubject.push(subject._id);
      transferStaff.previousStaffSubject.push(subject._id);
      await subject.save();
    }
    for (let i = 0; i < transferStaff.financeDepartment?.length; i++) {
      const finance = await Finance.findById(
        transferStaff.financeDepartment[i]
      );
      finance.financeHead = staffNew?._id;
      staffNew.financeDepartment.push(finance._id);
      transferStaff.previousFinanceDepartment.push(finance._id);
      await finance.save();
    }
    for (let i = 0; i < transferStaff.library?.length; i++) {
      const library = await Library.findById(transferStaff.library[i]);
      library.libraryHead = staffNew?._id;
      staffNew.library.push(library._id);
      transferStaff.previousLibrary.push(library._id);
      await library.save();
    }
    for (let i = 0; i < transferStaff.admissionDepartment?.length; i++) {
      const admissionDepartment = await Admission.findById(
        transferStaff.admissionDepartment[i]
      );
      admissionDepartment.admissionAdminHead = staffNew?._id;
      staffNew.admissionDepartment.push(admissionDepartment._id);
      transferStaff.previousAdmissionDepartment.push(admissionDepartment._id);
      await admissionDepartment.save();
    }
    for (let i = 0; i < transferStaff.transportDepartment?.length; i++) {
      const transportDepartment = await Transport.findById(
        transferStaff.transportDepartment[i]
      );
      transportDepartment.transport_manager = staffNew?._id;
      staffNew.transportDepartment.push(transportDepartment._id);
      transferStaff.previousTransportDepartment.push(transportDepartment._id);
      await transportDepartment.save();
    }
    for (let i = 0; i < transferStaff.vehicle?.length; i++) {
      const vehicle = await Vehicle.findById(transferStaff.vehicle[i]);
      vehicle.vehicle_driver = staffNew?._id;
      staffNew.vehicle.push(vehicle._id);
      transferStaff.previousVehicle.push(vehicle._id);
      await vehicle.save();
    }
    for (let i = 0; i < transferStaff.mentorDepartment?.length; i++) {
      const mentorDepartment = await Mentor.findById(
        transferStaff.mentorDepartment[i]
      );
      mentorDepartment.mentor_head = staffNew?._id;
      staffNew.mentorDepartment.push(mentorDepartment._id);
      transferStaff.previousMentor.push(mentorDepartment._id);
      await mentorDepartment.save();
    }
    for (let i = 0; i < transferStaff.eventManagerDepartment?.length; i++) {
      const eventManagerDepartment = await EventManager.findById(
        transferStaff.eventManagerDepartment[i]
      );
      eventManagerDepartment.event_head = staffNew?._id;
      staffNew.eventManagerDepartment.push(eventManagerDepartment._id);
      transferStaff.previousEventManager.push(eventManagerDepartment._id);
      await eventManagerDepartment.save();
    }
    for (let i = 0; i < transferStaff.aluminiDepartment?.length; i++) {
      const aluminiDepartment = await Alumini.findById(
        transferStaff.aluminiDepartment[i]
      );
      aluminiDepartment.alumini_head = staffNew?._id;
      staffNew.aluminiDepartment.push(aluminiDepartment._id);
      transferStaff.previousAlumini.push(aluminiDepartment._id);
      await aluminiDepartment.save();
    }
    for (let i = 0; i < transferStaff.hostelDepartment?.length; i++) {
      const hostelDepartment = await Hostel.findById(
        transferStaff.hostelDepartment[i]
      );
      hostelDepartment.hostel_manager = staffNew?._id;
      staffNew.hostelDepartment.push(hostelDepartment._id);
      transferStaff.previousHostel.push(hostelDepartment._id);
      await hostelDepartment.save();
    }
    for (let i = 0; i < transferStaff.hostelUnitDepartment?.length; i++) {
      const hostelUnitDepartment = await HostelUnit.findById(
        transferStaff.hostelUnitDepartment[i]
      );
      hostelUnitDepartment.hostel_unit_head = staffNew?._id;
      staffNew.hostelUnitDepartment.push(hostelUnitDepartment._id);
      transferStaff.previousHostelUnit.push(hostelUnitDepartment._id);
      await hostelUnitDepartment.save();
    }

    for (
      let i = 0;
      i < transferStaff.admissionModeratorDepartment?.length;
      i++
    ) {
      const admissionModeratorDepartment = await AdmissionModerator.findById(
        transferStaff.admissionModeratorDepartment[i]
      );
      admissionModeratorDepartment.access_staff = staffNew?._id;
      staffNew.admissionModeratorDepartment.push(
        admissionModeratorDepartment._id
      );

      transferStaff.previousAdmissionModerator.push(
        admissionModeratorDepartment._id
      );
      await admissionModeratorDepartment.save();
    }
    for (let i = 0; i < transferStaff.hostelModeratorDepartment?.length; i++) {
      const hostelModeratorDepartment = await AdmissionModerator.findById(
        transferStaff.hostelModeratorDepartment[i]
      );
      hostelModeratorDepartment.access_staff = staffNew?._id;
      staffNew.hostelModeratorDepartment.push(hostelModeratorDepartment._id);
      transferStaff.previousHostelModerator.push(hostelModeratorDepartment._id);
      await hostelModeratorDepartment.save();
    }
    for (let i = 0; i < transferStaff.financeModeratorDepartment?.length; i++) {
      const financeModeratorDepartment = await FinanceModerator.findById(
        transferStaff.financeModeratorDepartment[i]
      );
      financeModeratorDepartment.access_staff = staffNew?._id;
      staffNew.financeModeratorDepartment.push(financeModeratorDepartment._id);

      transferStaff.previousFinanceModerator.push(
        financeModeratorDepartment._id
      );
      await financeModeratorDepartment.save();
    }

    for (
      let i = 0;
      i < transferStaff.instituteModeratorDepartment?.length;
      i++
    ) {
      const instituteModeratorDepartment = await FinanceModerator.findById(
        transferStaff.instituteModeratorDepartment[i]
      );
      instituteModeratorDepartment.access_staff = staffNew?._id;
      staffNew.instituteModeratorDepartment.push(
        instituteModeratorDepartment._id
      );

      transferStaff.previousInstituteModerator.push(
        instituteModeratorDepartment._id
      );
      await instituteModeratorDepartment.save();
    }

    if (institute.ApproveStaff.length >= 1) {
      institute.staffCount -= 1;
      institute.ApproveStaff.pull(transferStaff._id);
      institute.previousApproveStaff.push(transferStaff._id);
      transferStaff.staffDepartment = [];
      transferStaff.staffClass = [];
      transferStaff.staffSubject = [];
      transferStaff.financeDepartment = [];
      transferStaff.library = [];
      transferStaff.admissionDepartment = [];
      transferStaff.transportDepartment = [];
      transferStaff.vehicle = [];
      transferStaff.mentorDepartment = [];
      transferStaff.eventManagerDepartment = [];
      transferStaff.aluminiDepartment = [];
      transferStaff.hostelDepartment = [];
      transferStaff.hostelUnitDepartment = [];
      transferStaff.admissionModeratorDepartment = [];
      transferStaff.hostelModeratorDepartment = [];
      transferStaff.financeModeratorDepartment = [];
      transferStaff.instituteModeratorDepartment = [];
      transferStaff.staff_replacement = "Transfered";
      await Promise.all([
        institute.save(),
        transferStaff.save(),
        staffNew.save(),
      ]);
    } else {
      // console.log("Not To Leave");
    }
    res.status(200).send({ message: "Transfer Granted" });
  } catch (e) {
    console.log(e);
  }
};

exports.staffTransferRejected = async (req, res) => {
  try {
    const { status } = req.body;
    const transfer = await Transfer.findById(req.params.tid);
    transfer.transferStatus = status;
    await transfer.save();
    res.status(200).send({ message: "Transfer Not Granted" });
  } catch (e) {
    console.log(e);
  }
};

exports.instituteStaffAllTransfer = async (req, res) => {
  try {
    const institute = await InstituteAdmin.findById(req.params.id)
      .populate({
        path: "transfer",
        // match: {
        //   complaintStatus: { $eq: `${req.query.status}` },
        //   // complaintType: "Open",
        // },
        populate: {
          path: "staff",
          select:
            "staffFirstName staffMiddleName staffLastName staffProfilePhoto",
        },
        select: "transferReason createdAt staff replaceBystaff transferStatus",
      })
      .populate({
        path: "transfer",
        populate: {
          path: "replaceBystaff",
          select:
            "staffFirstName staffMiddleName staffLastName staffProfilePhoto",
        },
        select: "transferReason createdAt staff replaceBystaff transferStatus",
      })
      .select("transfer");
    // const iTransferEncrypt = await encryptionPayload(institute.transfer);
    res.status(200).send({
      message: "all transfer",
      transfers: institute.transfer,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.renderLeaveConfigQuery = async(req, res) => {
  try{
    const { id } = req.params
    const { c_l, m_l, s_l } = req?.body
    if(!id) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const ins = await InstituteAdmin.findById({ _id: id})
    if(c_l){
      ins.staff_leave_config.casual_leave = c_l
    }
    if(m_l){
      ins.staff_leave_config.medical_leave = m_l
    }
    if(s_l){
      ins.staff_leave_config.sick_leave = s_l
    }
    await ins.save()
    res.status(200).send({ message: "Explore Leave Configuration Query", access: true})
    var all_staff = await Staff.find({ _id: { $in: ins?.ApproveStaff }})
    for(var ref of all_staff){
      ref.casual_leave = ins?.staff_leave_config.casual_leave
      ref.medical_leave = ins?.staff_leave_config.medical_leave
      ref.sick_leave = ins?.staff_leave_config.sick_leave
      await ref.save()
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.renderStaffLeaveConfigQuery = async(req, res) => {
  try{
    const { sid } = req.params
    const { c_l, m_l, s_l } = req?.body
    if(!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const staff = await Staff.findById({ _id: sid})
    if(c_l){
      staff.casual_leave = c_l
    }
    if(m_l){
      staff.medical_leave = m_l
    }
    if(s_l){
      staff.sick_leave = s_l
    }
    await staff.save()
    res.status(200).send({ message: "Explore One Staff Leave Configuration Query", access: true})
  }
  catch(e){
    console.log(e)
  }
}

exports.postStaffCoffLeaveQuery = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentDateLocalFormat = currentDate.toISOString().split("-");
    const dateArray = [];
    req.body.dates.forEach((dat) => {
      const fdate = dat?.split("/");
      const classyear = +fdate[2] > +currentDateLocalFormat[0];
      const year = +fdate[2] === +currentDateLocalFormat[0];
      const classmonth = +fdate[1] > +currentDateLocalFormat[1];
      const month = +fdate[1] === +currentDateLocalFormat[1];
      const day = +fdate[0] >= +currentDateLocalFormat[2].split("T")[0];
      if (classyear) {
        dateArray.push(dat);
      } else if (year) {
        if (classmonth) {
          dateArray.push(dat);
        } else if (month) {
          if (day) {
            dateArray.push(dat);
          }
        } else {
        }
      } else {
      }
    });

    if (dateArray?.length === 0) {
      throw "Please select date range today to next all dates";
    }
    const staff = await Staff.findById(req.params.sid)
      .populate({
        path: "staffLeave",
        select: "staffLeave",
      })

      .select(
        "staffLeave user institute staffFirstName staffMiddleName staffLastName c_off_leave"
      );

    const user = await User.findById(staff.user).select("uNotify");

    const institute = await InstituteAdmin.findById(staff.institute);
    const leave = new Leave({
      reason: req.body.reason,
      date: dateArray,
      staff: staff._id,
      institute: institute._id,
    });
    leave.leave_grant = dateArray?.length
    leave.leave_type = req?.body?.leave_type
    institute.c_off_leave.push(leave._id);
    staff.staffLeave.push(leave._id);
    if(req?.body?.attach){
      leave.attach = req?.body?.attach
    }
    const notify = new Notification({});
    notify.notifyContent = `${staff.staffFirstName} ${
      staff.staffMiddleName ? ` ${staff.staffMiddleName}` : ""
    } ${staff.staffLastName} requested for a leave check application`;
    notify.notifySender = req.params.sid;
    notify.notifyReceiever = institute._id;
    institute.iNotify.push(notify._id);
    notify.notifyByStaffPhoto = staff._id;
    notify.notifyCategory = "Leave";
    notify.redirectIndex = 10;
    notify.instituteId = institute?._id;
    //
    invokeMemberTabNotification(
      "Institute Activity",
      notify,
      "Request for Leave",
      institute._id,
      institute.deviceToken,
      "Institute",
      notify
    );
    //
    await Promise.all([
      institute.save(),
      staff.save(),
      leave.save(),
      user.save(),
      notify.save(),
    ]);
    res.status(201).send({ message: "request to leave" });
  } catch (e) {
    console.log(e);
  }
};

exports.renderStaffCoffLeaveQuery = async(req, res) => {
  try{
    const { id } = req?.params
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    const { status_query } = req?.query
    if(!id) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const ins = await InstituteAdmin.findById({ _id: id})
    var all_leave = await Leave.find({ $and: [{ _id: { $in: ins?.c_off_leave }}, { status: `${status_query}`}] })
    .sort({ createdAt: -1})
    .limit(limit)
    .skip(skip)
    .populate({
      path: "staff",
      select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto valid_full_name staffROLLNO"
    })
    
    if(all_leave?.length > 0){
      res.status(200).send({ message: "Explore All C-Off Leave Query", access: true, all_leave: all_leave})
    }
    else{
      res.status(200).send({ message: "I think you're lost in space", access: true, all_leave: []})
    }
  }
  catch(e){
    console.log(e)
  }
}

exports.renderManageCoffQuery = async(req, res) => {
  try{
    const { lid } = req?.params
    const { sid } = req?.body
    if(!lid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    var one_leave = await Leave.findById({ _id: lid})
    var staff = await Staff.findById({ _id: sid })

    one_leave.status = "Accepted"
    staff.c_off_leave += 1

    await Promise.all([ staff.save(), one_leave.save() ])
    res.status(200).send({ message: "Explore Manage C-off Leave Query"})
  }
  catch(e){
    console.log(e)
  }
}

exports.renderLeaveOverviewQuery = async(req, res) => {
  try{
    const { sid } = req.params
    if(!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const staff = await Staff.findById({ _id: sid })
    .select("casual_leave medical_leave sick_leave off_duty_leave c_off_leave lwp_leave leave_taken")

    var total_leave = staff?.casual_leave + staff?.medical_leave + staff?.sick_leave + staff?.off_duty_leave + staff?.lwp_leave + staff?.c_off_leave
    var leave_taken = staff?.leave_taken

    var overview = {
      total_leave_available: total_leave,
      total_leave_taken: leave_taken
    }

    res.status(200).send({ message: "Explore All Leave Available + Taken Query", access: true, overview: overview, staff: staff })
  }
  catch(e){
    console.log(e)
  }
}

exports.renderLeaveFilterOverviewQuery = async(req, res) => {
  try{
    const { sid } = req.params
    const { category } = req?.query
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    if(!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const staff = await Staff.findById({ _id: sid })
    .select("staffLeave")

    if(category){
      var all_leave = await Leave.find({ $and: [{ _id: { $in: staff?.staffLeave }},  { leave_type: `${category}` }]})
    .limit(limit)
    .skip(skip)
    .populate({
      path: "staff",
      select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
    })
    }
    else{
      var all_leave = await Leave.find({ $and: [{ _id: { $in: staff?.staffLeave }}]})
    .limit(limit)
    .skip(skip)
    .populate({
      path: "staff",
      select: "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto"
    })
    }

    res.status(200).send({ message: "Explore All Leave Available + Taken Query", access: true, all_leave: all_leave })
  }
  catch(e){
    console.log(e)
  }
}