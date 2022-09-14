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

//=======================================For the students related controller=========================================

exports.getStudentLeave = async (req, res) => {
  try {
    const student = await Student.findById(req.params.sid)
      .populate({
        path: "leave",
        select: "reason date status",
      })
      .select("_id leave");
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
    notify.notifyContent = `${student.studentFirstName}${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} requested for a leave check application`;
    notify.notifySender = req.params.sid;
    notify.notifyReceiever = user._id;
    notify.notifyType = 'Staff'
    notify.notifyPublisher = classes.classTeacher._id
    user.activity_tab.push(notify._id)
    notify.notifyByStudentPhoto = student._id;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      'Leave Application',
      user._id,
      user.deviceToken,
      'Staff',
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
    res.status(424).send(e);
  }
};

exports.getStudentOneLeaveDetail = async (req, res) => {
  try {
    const studentLeave = await StudentLeave.findById(req.params.lid).select(
      "_id date reason status"
    );
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
    res
      .status(200)
      .send({ message: "All leaves", allLeave: classes.studentLeave });
  } catch (e) {
    console.log(e);
  }
};

exports.oneStudentLeaveProcess = async (req, res) => {
  try {
    const leave = await StudentLeave.findById(req.params.cid)
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
    const user = await User.findById(leave.student.user._id);

    const notify = new StudentNotification({});
    leave.status = req.body.status;
    notify.notifyContent = `Your Leave request has been ${req.body.status} by ${leave.classes.className}`;
    notify.notifySender = leave.classes._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = 'Student'
    notify.notifyPublisher = leave.student._id
    user.activity_tab.push(notify._id)
    notify.notifyByClassPhoto = leave.classes._id;
    //
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      `Leave Application ${req.body.status}`,
      user._id,
      user.deviceToken,
      'Student',
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
      const department = await Department.findById(departmentHead);
      department?.studentComplaint.push(complaint._id);
      complaint.department = department._id;
      complaint.institute = department.institute;
      await department.save();
    } else if (classHead !== "") {
      const classes = await Class.findById(classHead).populate({
        path: "department",
        select: "institute",
      });
      classes?.studentComplaint.push(complaint._id);
      complaint.classes = classes._id;
      complaint.institute = classes.department.institute;
      await classes.save();
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
    res.status(200).send({ message: "one complaint details", complaint });
  } catch (e) {
    console.log(e);
  }
};

exports.OneComplaintReportAdmin = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.cid).select(
      "complaintInsStatus reportAdmin institute"
    );
    if (complaint.reportAdmin === "No") {
      const institute = await InstituteAdmin.findById(
        complaint.institute
      ).select("studentComplaints");
      institute.studentComplaints.push(complaint._id);
      complaint.reportAdmin = "Yes";
      await institute.save();
      await complaint.save();
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
    res.send(424).send({ e });
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
    notify.notifyContent = `${student.studentFirstName}${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} requested for a Transfer. check application status`;
    notify.notifySender = student._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = 'Staff'
    notify.notifyPublisher = classes.classTeacher._id
    user.activity_tab.push(notify._id)
    notify.notifyByStudentPhoto = student._id;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      'Request for Transfer',
      user._id,
      user.deviceToken,
      'Staff',
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
    notify.notifyType = 'Student'
    notify.notifyPublisher = student._id
    user.activity_tab.push(notify._id)
    notify.notifyByClassPhoto = classes._id;
    //
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      `Transfer Request Approved`,
      user._id,
      user.deviceToken,
      'Student',
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
    notify.notifyType = 'Student'
    notify.notifyPublisher = student._id
    user.activity_tab.push(notify._id)
    notify.notifyByClassPhoto = classes._id;
    //
    invokeMemberTabNotification(
      "Student Activity",
      notify,
      'Transfer Request Rejected',
      user._id,
      user.deviceToken,
      'Student',
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
    const staff = await Staff.findById(req.params.sid)
      .populate({
        path: "staffLeave",
        select: "reason date status",
      })
      .select("_id staffLeave");
    res.status(200).send({ message: "All leaves", allLeave: staff.staffLeave });
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

    const institute = await InstituteAdmin.findById(staff.institute).select(
      "leave iNotify"
    );
    const leave = new Leave({
      reason: req.body.reason,
      date: dateArray,
      staff: staff._id,
      institute: institute._id,
    });
    institute.leave.push(leave._id);
    staff.staffLeave.push(leave._id);

    const notify = new Notification({});
    notify.notifyContent = `${staff.staffFirstName}${
      staff.staffMiddleName ? ` ${staff.staffMiddleName}` : ""
    } ${staff.staffLastName} requested for a leave check application`;
    notify.notifySender = req.params.sid;
    notify.notifyReceiever = institute._id;
    institute.iNotify.push(notify._id)
    notify.notifyByStaffPhoto = staff._id;
    //
    invokeMemberTabNotification(
      "Institute Activity",
      notify,
      'Request for Leave',
      institute._id,
      institute.deviceToken,
      'Institute',
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
    res.status(424).send(e);
  }
};

exports.getStaffOneLeaveDetail = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.lid).select(
      "_id date reason status"
    );
    res.status(200).send({ message: "One leave Details", leave: leave });
  } catch (e) {
    console.log(e);
  }
};

exports.getStaffOneLeaveDelete = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.lid).select(
      "_id staff institute"
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
    const institute = await InstituteAdmin.findById(req.params.id)
      .populate({
        path: "leave",
        populate: {
          path: "staff",
          select:
            "staffProfilePhoto staffFirstName staffMiddleName staffLastName",
        },
        select: "reason date status staff",
      })
      .select("_id leave");
    res.status(200).send({ message: "All leaves", allLeave: institute.leave });
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
        select: "user",
      })
      .select("staff institute status");
    const user = await User.findById(leave.staff.user._id);

    const notify = new StudentNotification({});
    leave.status = req.body.status;
    notify.notifyContent = `Your Leave request has been ${req.body.status} by ${leave.institute.insName}`;
    notify.notifySender = leave.institute._id;
    notify.notifyReceiever = user._id;
    notify.notifyType = 'Staff'
    notify.notifyPublisher = leave.staff._id
    user.activity_tab.push(notify._id)
    notify.notifyByInsPhoto = leave.institute._id;
    //
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      `Leave Application ${req.body.status}`,
      user._id,
      user.deviceToken,
      'Staff',
      notify
    );
    //
    await Promise.all([leave.save(), user.save(), notify.save()]);
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
    res
      .status(200)
      .send({ message: "all complaints", complaints: staff.complaints });
  } catch (e) {
    console.log(e);
  }
};

exports.OneStaffComplaint = async (req, res) => {
  try {
    const complaint = await StaffComplaint.findById(req.params.cid).select(
      "complaintType  complaintContent complaintStatus createdAt"
    );
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
    res.send(424).send({ e });
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
    var transfer = await Transfer.findById(req.params.tid);
    var institute = await InstituteAdmin.findById(transfer.institute).populate({
      path: "depart",
      populate: {
        path: "batches",
        populate: {
          path: "batchStaff",
        },
      },
    });
    var staffNew = await Staff.findById(assignedStaff);
    var transferStaff = await Staff.findById(previousStaff)
      .populate("staffDepartment")
      .populate("staffClass")
      .populate("staffSubject")
      .populate("financeDepartment");

    transfer.transferStatus = status;
    await transfer.save();
    for (let i = 0; i < transferStaff.staffDepartment.length; i++) {
      const department = await Department.findById({
        _id: transferStaff.staffDepartment[i]._id,
      });
      staffNew.staffDepartment.push(department._id);
      department.dHead = staffNew;
      transferStaff.staffDepartment.pull(department._id);
      transferStaff.previousStaffDepartment.push(department._id);
      await Promise.all([
        staffNew.save(),
        department.save(),
        transferStaff.save(),
      ]);
    }
    for (let i = 0; i < transferStaff.staffClass.length; i++) {
      const classes = await Class.findById({
        _id: transferStaff.staffClass[i]._id,
      });
      staffNew.staffClass.push(classes._id);
      classes.classTeacher = staffNew;
      transferStaff.staffClass.pull(classes._id);
      transferStaff.previousStaffClass.push(classes._id);
      await Promise.all([
        staffNew.save(),
        classes.save(),
        transferStaff.save(),
      ]);
    }
    for (let i = 0; i < transferStaff.staffSubject.length; i++) {
      const subject = await Subject.findById({
        _id: transferStaff.staffSubject[i]._id,
      });
      staffNew.staffSubject.push(subject._id);
      subject.subjectTeacherName = staffNew._id;
      transferStaff.staffSubject.pull(subject._id);
      transferStaff.previousStaffSubject.push(subject._id);
      await Promise.all([
        staffNew.save(),
        subject.save(),
        transferStaff.save(),
      ]);
    }
    for (let i = 0; i < transferStaff.financeDepartment.length; i++) {
      const finance = await Finance.findById({
        _id: transferStaff.financeDepartment[i]._id,
      });
      staffNew.financeDepartment.push(finance);
      finance.financeHead = staffNew;
      transferStaff.financeDepartment.pull(finance);

      await Promise.all([
        staffNew.save(),
        finance.save(),
        transferStaff.save(),
      ]);
    }
    if (
      institute.ApproveStaff.length >= 1 &&
      institute.ApproveStaff.includes(String(transferStaff._id))
    ) {
      institute.ApproveStaff.pull(transferStaff._id);
      institute.previousApproveStaff.push(transferStaff._id);
      // transferStaff.institute = "";
      await Promise.all([institute.save(), transferStaff.save()]);
    } else {
      console.log("Not To Leave");
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
        select: "transferReason createdAt staff transferStatus",
      })
      .select("transfer");

    res.status(200).send({
      message: "all transfer",
      transfers: institute.transfer,
    });
  } catch (e) {
    console.log(e);
  }
};
