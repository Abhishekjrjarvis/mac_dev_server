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
    }).select("uNotify");

    const leave = new StudentLeave({
      reason: req.body.reason,
      date: dateArray,
      classes: classes._id,
      student: student._id,
    });
    classes.studentLeave.push(leave._id);
    student.leave.push(leave._id);

    const notify = new Notification({});
    notify.notifyContent = `${student.studentFirstName}${
      student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
    } ${student.studentLastName} requested for a leave check application`;
    notify.notifySender = req.params.sid;
    notify.notifyReceiever = classes._id;
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByStudentPhoto = student._id;

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
          select: "uNotify",
        },
        select: "user",
      })
      .select("student classes status");
    const user = await User.findById(leave.student.user._id);

    const notify = await new Notification({});
    leave.status = req.body.status;
    notify.notifyContent = `Your Leave request has been ${req.body.status} by ${leave.classes.className}`;
    notify.notifySender = leave.classes._id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify);
    notify.user = user._id;
    notify.notifyByClassPhoto = leave.classes._id;

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
      department.studentComplaint.push(complaint._id);
      complaint.department = department._id;
      complaint.institute = department.institute;
      await department.save();
    } else if (classHead !== "") {
      const classes = await Class.findById(classHead).populate({
        path: "department",
        select: "institute",
      });
      classes.studentComplaint.push(complaint._id);
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
    const complaint = await Complaint.findById(req.params.cid).select(
      "complaintType complaintTo complaintContent complaintStatus createdAt"
    );
    res.status(200).send({ message: "one complaint details", complaint });
  } catch (e) {
    console.log(e);
  }
};

exports.OneComplaintReportAdmin = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.cid).select(
      "complaintInsStatus institute"
    );
    if (complaint.complaintInsStatus === "Unsloved") {
      const institute = await InstituteAdmin.findById(
        complaint.institute
      ).select("studentComplaints");
      institute.studentComplaints.push(complaint._id);
      await institute.save();
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
      "studentComplaint"
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
      "leave"
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
    user.uNotify.push(notify._id);
    notify.user = user._id;
    notify.notifyByStaffPhoto = staff._id;

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
          select: "uNotify",
        },
        select: "user",
      })
      .select("staff institute status");
    const user = await User.findById(leave.staff.user._id);

    const notify = await new Notification({});
    leave.status = req.body.status;
    notify.notifyContent = `Your Leave request has been ${req.body.status} by ${leave.institute.insName}`;
    notify.notifySender = leave.institute._id;
    notify.notifyReceiever = user._id;
    user.uNotify.push(notify);
    notify.user = user._id;
    notify.notifyByInsPhoto = leave.institute._id;

    await Promise.all([leave.save(), user.save(), notify.save()]);
    res.status(200).send({ message: `Leave ${req.body.status} by Institute` });
  } catch (e) {
    console.log(e);
  }
};
// exports.getStaffLeave=async (req, res) => {
//     try {
//       const { id } = req.params;
//       const staff = await Staff.findById({ _id: id }).populate({
//         path: "institute",
//       });
//       res.status(200).send({ message: "Staff Leave Data", staff });
//     } catch {}
//   }

//   exports.postStaffLeave=async (req, res) => {
//     try {
//       const { sid, id } = req.params;
//       const staff = await Staff.findById({ _id: sid });
//       const institute = await InstituteAdmin.findById({ _id: id });
//       const leave = await new Leave({ ...req.body });
//       const notify = await new Notification({});
//       institute.leave.push(leave);
//       leave.institute = institute;
//       staff.staffLeave.push(leave);
//       leave.staff = staff;
//       notify.notifyContent = `${staff.staffFirstName}${
//         staff.staffMiddleName ? ` ${staff.staffMiddleName}` : ""
//       } ${staff.staffLastName} requested for a leave check application`;
//       notify.notifySender = sid;
//       notify.notifyReceiever = id;
//       institute.iNotify.push(notify);
//       notify.institute = institute;
//       notify.notifyByStaffPhoto = staff;
//       await staff.save();
//       await leave.save();
//       await institute.save();
//       await notify.save();
//       res
//         .status(200)
//         .send({ message: "request to leave", leave, staff, institute });
//     } catch {
//       console.log(`SomeThing Went Wrong at this EndPoint(/staff/:sid/leave/:id)`);
//     }
//   }

//   exports.oneStaffLeaveGrant=async (req, res) => {
//     try {
//       const { id, sid, eid } = req.params;
//       const { status } = req.body;
//       const institute = await InstituteAdmin.findById({ _id: id });
//       const staff = await Staff.findById({ _id: sid }).populate({
//         path: "user",
//       });
//       const user = await User.findById({ _id: `${staff.user._id}` });
//       const leave = await Leave.findById({ _id: eid });
//       const notify = await new Notification({});
//       leave.leaveStatus = status;
//       notify.notifyContent = `Your Leave request has been Approved by ${institute.insName}`;
//       notify.notifySender = id;
//       notify.notifyReceiever = user._id;
//       user.uNotify.push(notify);
//       notify.user = user;
//       notify.notifyByStaffPhoto = staff;
//       await leave.save();
//       await user.save();
//       await notify.save();
//       res.status(200).send({ message: "Leave Granted", leave });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/leave/grant/:eid)`
//       );
//     }
//   }

//   exports.oneStaffLeaveReject=async (req, res) => {
//     try {
//       const { id, sid, eid } = req.params;
//       const { status } = req.body;
//       const institute = await InstituteAdmin.findById({ _id: id });
//       const staff = await Staff.findById({ _id: sid }).populate({
//         path: "user",
//       });
//       const user = await User.findById({ _id: `${staff.user._id}` });
//       const leave = await Leave.findById({ _id: eid });
//       const notify = await new Notification({});
//       leave.leaveStatus = status;
//       notify.notifyContent = `Your Leave request has been Rejected by ${institute.insName}`;
//       notify.notifySender = id;
//       notify.notifyReceiever = user._id;
//       user.uNotify.push(notify);
//       notify.user = user;
//       notify.notifyByStaffPhoto = staff;
//       await leave.save();
//       await user.save();
//       await notify.save();
//       res.status(200).send({ message: "Leave Not Granted", leave });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/leave/reject/:eid)`
//       );
//     }
//   }
// app.get("/staff/:id/detail/leave", async (req, res) => {
//     try {
//       const { id } = req.params;
//       const staff = await Staff.findById({ _id: id }).populate({
//         path: "institute",
//       });
//       res.status(200).send({ message: "Staff Leave Data", staff });
//     } catch {}
//   });

//   app.get("/student/:id/detail/leave", async (req, res) => {
//     try {
//       const { id } = req.params;
//       const student = await Student.findById({ _id: id }).populate({
//         path: "studentClass",
//       });
//       res.status(200).send({ message: "Student Leave Data", student });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/student/:id/detail/leave)`
//       );
//     }
//   });

//   app.post("/staff/:sid/leave/:id", async (req, res) => {
//     try {
//       const { sid, id } = req.params;
//       const staff = await Staff.findById({ _id: sid });
//       const institute = await InstituteAdmin.findById({ _id: id });
//       const leave = await new Leave({ ...req.body });
//       const notify = await new Notification({});
//       institute.leave.push(leave);
//       leave.institute = institute;
//       staff.staffLeave.push(leave);
//       leave.staff = staff;
//       notify.notifyContent = `${staff.staffFirstName}${
//         staff.staffMiddleName ? ` ${staff.staffMiddleName}` : ""
//       } ${staff.staffLastName} requested for a leave check application`;
//       notify.notifySender = sid;
//       notify.notifyReceiever = id;
//       institute.iNotify.push(notify);
//       notify.institute = institute;
//       notify.notifyByStaffPhoto = staff;
//       await staff.save();
//       await leave.save();
//       await institute.save();
//       await notify.save();
//       res
//         .status(200)
//         .send({ message: "request to leave", leave, staff, institute });
//     } catch {
//       console.log(`SomeThing Went Wrong at this EndPoint(/staff/:sid/leave/:id)`);
//     }
//   });

//   app.post("/student/:sid/leave/:id", async (req, res) => {
//     try {
//       const { sid, id } = req.params;
//       const student = await Student.findById({ _id: sid });
//       const classes = await Class.findById({ _id: id }).populate({
//         path: "classTeacher",
//         populate: {
//           path: "user",
//         },
//       });
//       const user = await User.findById({
//         _id: `${classes.classTeacher.user._id}`,
//       });
//       const leave = await new StudentLeave({ ...req.body });
//       const notify = await new Notification({});
//       classes.studentLeave.push(leave);
//       leave.fromClass = classes;
//       student.leave.push(leave);
//       leave.student = student;
//       notify.notifyContent = `${student.studentFirstName}${
//         student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
//       } ${student.studentLastName} requested for a leave check application`;
//       notify.notifySender = sid;
//       notify.notifyReceiever = id;
//       user.uNotify.push(notify);
//       notify.user = user;
//       notify.notifyByStudentPhoto = student;
//       await classes.save();
//       await student.save();
//       await leave.save();
//       await user.save();
//       await notify.save();
//       res
//         .status(200)
//         .send({ message: "request to leave", leave, student, classes });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/student/:sid/leave/:id)`
//       );
//     }
//   });

//   app.post("/ins/:id/staff/:sid/leave/grant/:eid", async (req, res) => {
//     try {
//       const { id, sid, eid } = req.params;
//       const { status } = req.body;
//       const institute = await InstituteAdmin.findById({ _id: id });
//       const staff = await Staff.findById({ _id: sid }).populate({
//         path: "user",
//       });
//       const user = await User.findById({ _id: `${staff.user._id}` });
//       const leave = await Leave.findById({ _id: eid });
//       const notify = await new Notification({});
//       leave.leaveStatus = status;
//       notify.notifyContent = `Your Leave request has been Approved by ${institute.insName}`;
//       notify.notifySender = id;
//       notify.notifyReceiever = user._id;
//       user.uNotify.push(notify);
//       notify.user = user;
//       notify.notifyByStaffPhoto = staff;
//       await leave.save();
//       await user.save();
//       await notify.save();
//       res.status(200).send({ message: "Leave Granted", leave });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/leave/grant/:eid)`
//       );
//     }
//   });

//   app.post("/class/:id/student/:sid/leave/grant/:eid", async (req, res) => {
//     try {
//       const { id, sid, eid } = req.params;
//       const { status } = req.body;
//       const classes = await Class.findById({ _id: id });
//       const student = await Student.findById({ _id: sid }).populate({
//         path: "user",
//       });
//       const user = await User.findById({ _id: `${student.user._id}` });
//       const leave = await StudentLeave.findById({ _id: eid });
//       const notify = await new Notification({});
//       leave.leaveStatus = status;
//       notify.notifyContent = `Your Leave request has been Approved by ${classes.className}`;
//       notify.notifySender = id;
//       notify.notifyReceiever = user._id;
//       user.uNotify.push(notify);
//       notify.user = user;
//       notify.notifyByStudentPhoto = student;
//       await leave.save();
//       await user.save();
//       await notify.save();
//       res.status(200).send({ message: "Leave Granted", leave });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/class/:id/student/leave/grant/:eid)`
//       );
//     }
//   });

//   app.post("/ins/:id/staff/:sid/leave/reject/:eid", async (req, res) => {
//     try {
//       const { id, sid, eid } = req.params;
//       const { status } = req.body;
//       const institute = await InstituteAdmin.findById({ _id: id });
//       const staff = await Staff.findById({ _id: sid }).populate({
//         path: "user",
//       });
//       const user = await User.findById({ _id: `${staff.user._id}` });
//       const leave = await Leave.findById({ _id: eid });
//       const notify = await new Notification({});
//       leave.leaveStatus = status;
//       notify.notifyContent = `Your Leave request has been Rejected by ${institute.insName}`;
//       notify.notifySender = id;
//       notify.notifyReceiever = user._id;
//       user.uNotify.push(notify);
//       notify.user = user;
//       notify.notifyByStaffPhoto = staff;
//       await leave.save();
//       await user.save();
//       await notify.save();
//       res.status(200).send({ message: "Leave Not Granted", leave });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/leave/reject/:eid)`
//       );
//     }
//   });

//   app.post("/class/:id/student/:sid/leave/reject/:eid", async (req, res) => {
//     try {
//       const { id, sid, eid } = req.params;
//       const { status } = req.body;
//       const classes = await Class.findById({ _id: id });
//       const student = await Student.findById({ _id: sid }).populate({
//         path: "user",
//       });
//       const user = await User.findById({ _id: `${student.user._id}` });
//       const leave = await StudentLeave.findById({ _id: eid });
//       const notify = await new Notification({});
//       leave.leaveStatus = status;
//       notify.notifyContent = `Your Leave request has been Rejected by ${classes.className}`;
//       notify.notifySender = id;
//       notify.notifyReceiever = user._id;
//       user.uNotify.push(notify);
//       notify.user = user;
//       notify.notifyByStudentPhoto = student;
//       await leave.save();
//       await user.save();
//       await notify.save();
//       res.status(200).send({ message: "Leave Not Granted", leave });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/class/:id/student/leave/reject/:eid)`
//       );
//     }
//   });

// app.post("/student/:sid/complaint", async (req, res) => {
//     try {
//       const { sid } = req.params;
//       const { complaintHead, complaintType, complaintContent } = req.body;
//       const department = await Department.findOne({ _id: complaintHead });
//       const classes = await Class.findOne({ _id: complaintHead });
//       if (department) {
//         const student = await Student.findById({ _id: sid });
//         const complaint = await new Complaint({
//           complaintType: complaintType,
//           complaintContent: complaintContent,
//         });
//         student.complaints.push(complaint);
//         complaint.student = student;
//         department.studentComplaint.push(complaint);
//         complaint.department = department;
//         await student.save();
//         await department.save();
//         await complaint.save();
//         res
//           .status(200)
//           .send({ message: "Request To Department", complaint, student });
//       } else if (classes) {
//         const student = await Student.findById({ _id: sid });
//         const complaint = await new Complaint({
//           complaintType: complaintType,
//           complaintContent: complaintContent,
//         });
//         student.complaints.push(complaint);
//         complaint.student = student;
//         classes.studentComplaint.push(complaint);
//         complaint.classes = classes;
//         await student.save();
//         await classes.save();
//         await complaint.save();
//         res.status(200).send({ message: "Request To Class", complaint, student });
//       } else {
//       }
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/student/:sid/complaint)`
//       );
//     }
//   });

//   app.post("/student/complaint/reply/:id", async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { status } = req.body;
//       const complaint = await Complaint.findById({ _id: id });
//       complaint.complaintStatus = status;
//       await complaint.save();
//       res.status(200).send({ message: "Complaint Resolevd", complaint });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/student/complaint/reply/:id)`
//       );
//     }
//   });

//   app.post("/student/complaint/:id/institute/:iid", async (req, res) => {
//     try {
//       const { id, iid } = req.params;
//       const { status } = req.body;
//       const complaint = await Complaint.findById({ _id: id });
//       const institute = await InstituteAdmin.findById({ _id: iid });
//       institute.studentComplaints.push(complaint);
//       complaint.institute = institute;
//       complaint.complaintInsStatus = status;
//       await institute.save();
//       await complaint.save();
//       res
//         .status(200)
//         .send({ message: "Report To Institute", complaint, institute });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/student/complaint/:id/institute/:iid)`
//       );
//     }
//   });

//   app.post("/staff/:sid/transfer/:id", async (req, res) => {
//     try {
//       const { sid, id } = req.params;
//       const staff = await Staff.findById({ _id: sid });
//       const institute = await InstituteAdmin.findById({ _id: id });
//       const transfer = await new Transfer({ ...req.body });
//       institute.transfer.push(transfer);
//       transfer.institute = institute;
//       staff.staffTransfer.push(transfer);
//       transfer.staff = staff;
//       await institute.save();
//       await staff.save();
//       await transfer.save();
//       res
//         .status(200)
//         .send({ message: "request to transfer", transfer, staff, institute });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/staff/:sid/transfer/:id)`
//       );
//     }
//   });

//   app.post("/student/:sid/transfer/:id", async (req, res) => {
//     try {
//       const { sid, id } = req.params;
//       const student = await Student.findById({ _id: sid });
//       const classes = await Class.findById({ _id: id }).populate({
//         path: "classTeacher",
//         populate: {
//           path: "user",
//         },
//       });
//       const user = await User.findById({
//         _id: `${classes.classTeacher.user._id}`,
//       });
//       const transfer = await new StudentTransfer({ ...req.body });
//       const notify = await new Notification({});
//       classes.studentTransfer.push(transfer);
//       transfer.fromClass = classes;
//       student.transfer.push(transfer);
//       transfer.student = student;
//       notify.notifyContent = `${student.studentFirstName}${
//         student.studentMiddleName ? ` ${student.studentMiddleName}` : ""
//       } ${student.studentLastName} requested for a Transfer check application`;
//       notify.notifySender = sid;
//       notify.notifyReceiever = id;
//       user.uNotify.push(notify);
//       notify.user = user;
//       notify.notifyByStudentPhoto = student;
//       await classes.save();
//       await student.save();
//       await transfer.save();
//       await user.save();
//       await notify.save();
//       res
//         .status(200)
//         .send({ message: "request to transfer", transfer, student, classes });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/student/:sid/transfer/:id)`
//       );
//     }
//   });

//   app.post("/ins/:id/staff/:sid/transfer/:ssid/grant/:eid", async (req, res) => {
//     try {
//       const { id, sid, ssid, eid } = req.params;
//       const { status } = req.body;
//       var institute = await InstituteAdmin.findById({ _id: id }).populate({
//         path: "depart",
//         populate: {
//           path: "batches",
//           populate: {
//             path: "batchStaff",
//           },
//         },
//       });
//       var staffNew = await Staff.findById({ _id: sid });
//       var transfer = await Transfer.findById({ _id: eid });
//       var transferStaff = await Staff.findById({ _id: ssid })
//         .populate("staffDepartment")
//         .populate("staffClass")
//         .populate("staffSubject")
//         .populate("financeDepartment")

//       transfer.transferStatus = status;
//       await transfer.save();
//       for (let i = 0; i < transferStaff.staffDepartment.length; i++) {
//         const department = await Department.findById({
//           _id: transferStaff.staffDepartment[i]._id,
//         });
//         staffNew.staffDepartment.push(department);
//         department.dHead = staffNew;
//         transferStaff.staffDepartment.pull(department);
//         await staffNew.save();
//         await department.save();
//         await transferStaff.save();
//       }
//       for (let i = 0; i < transferStaff.staffClass.length; i++) {
//         const classes = await Class.findById({
//           _id: transferStaff.staffClass[i]._id,
//         });
//         staffNew.staffClass.push(classes);
//         classes.classTeacher = staffNew;
//         transferStaff.staffClass.pull(classes);
//         await staffNew.save();
//         await classes.save();
//         await transferStaff.save();
//       }
//       for (let i = 0; i < transferStaff.staffSubject.length; i++) {
//         const subject = await Subject.findById({
//           _id: transferStaff.staffSubject[i]._id,
//         });
//         staffNew.staffSubject.push(subject);
//         subject.subjectTeacherName = staffNew;
//         transferStaff.staffSubject.pull(subject);
//         await staffNew.save();
//         await subject.save();
//         await transferStaff.save();
//       }
//       for (let i = 0; i < transferStaff.financeDepartment.length; i++) {
//         const finance = await Finance.findById({
//           _id: transferStaff.financeDepartment[i]._id,
//         });
//         staffNew.financeDepartment.push(finance);
//         finance.financeHead = staffNew;
//         transferStaff.financeDepartment.pull(finance);
//         await staffNew.save();
//         await finance.save();
//         await transferStaff.save();
//       }
//       if (
//         institute.ApproveStaff.length >= 1 &&
//         institute.ApproveStaff.includes(String(transferStaff._id))
//       ) {
//         institute.ApproveStaff.pull(transferStaff._id);
//         transferStaff.institute = "";
//         await institute.save();
//         await transferStaff.save();
//       } else {
//         console.log("Not To Leave");
//       }
//       for (let i = 0; i < institute.depart.length; i++) {
//         const depart = await Department.findById({
//           _id: institute.depart[i]._id,
//         });
//         depart.departmentChatGroup.pull(transferStaff);
//         depart.departmentChatGroup.push(staffNew);
//         await depart.save();
//       }
//       for (let i = 0; i < institute.depart.length; i++) {
//         for (let j = 0; j < i.batches.length; j++) {
//           const batchData = await Batch.findById({ _id: i.batches[j]._id });
//           batchData.batchStaff.pull(transferStaff);
//           batchData.batchStaff.push(staffNew);
//           staffNew.batches = batchData;
//           await batchData.save();
//           await staffNew.save();
//         }
//       }
//       res
//         .status(200)
//         .send({ message: "Transfer Granted", staffNew, transferStaff, transfer });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/:sid/transfer/:ssid/grant/:eid)`
//       );
//     }
//   });

//   app.post(
//     "/class/:id/student/:sid/transfer/grant/:eid/department/:did/batch/:bid",
//     async (req, res) => {
//       try {
//         const { id, sid, eid, did, bid } = req.params;
//         const { status } = req.body;
//         const classes = await Class.findById({ _id: id });
//         var student = await Student.findById({ _id: sid }).populate({
//           path: "user",
//         });
//         const user = await User.findById({ _id: `${student.user._id}` });
//         var transfer = await StudentTransfer.findById({ _id: eid });
//         const department = await Department.findById({ _id: did }).populate({
//           path: "institute",
//         });
//         const institute = await InstituteAdmin.findById({
//           _id: `${department.institute._id}`,
//         });
//         const batch = await Batch.findById({ _id: bid });
//         const notify = await new Notification({});
//         transfer.transferStatus = status;
//         classes.ApproveStudent.pull(student);
//         department.ApproveStudent.pull(student);
//         student.department = "";
//         batch.ApproveStudent.pull(student);
//         notify.notifyContent = `Your Transfer request has been Approved by ${institute.insName} from ${classes.className}`;
//         notify.notifySender = id;
//         notify.notifyReceiever = user._id;
//         user.uNotify.push(notify);
//         notify.user = user;
//         notify.notifyByStudentPhoto = student;
//         await transfer.save();
//         await classes.save();
//         await department.save();
//         await student.save();
//         await batch.save();
//         await user.save();
//         await notify.save();
//         res.status(200).send({ message: "Transfer Granted", classes, transfer });
//       } catch {
//         console.log(
//           `SomeThing Went Wrong at this EndPoint(/class/:id/student/:sid/transfer/grant/:eid/department/:did/batch/:bid)`
//         );
//       }
//     }
//   );

//   app.post("/ins/:id/staff/transfer/reject/:eid", async (req, res) => {
//     try {
//       const { id, eid } = req.params;
//       const { status } = req.body;
//       const institute = await InstituteAdmin.findById({ _id: id });
//       const transfer = await Transfer.findById({ _id: eid });
//       transfer.transferStatus = status;
//       await transfer.save();
//       res.status(200).send({ message: "Transfer Not Granted", transfer });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/ins/:id/staff/transfer/reject/:eid)`
//       );
//     }
//   });

//   app.post("/class/:id/student/:sid/transfer/reject/:eid", async (req, res) => {
//     try {
//       const { id, sid, eid } = req.params;
//       const { status } = req.body;
//       const classes = await Class.findById({ _id: id });
//       const student = await Student.findById({ _id: sid }).populate({
//         path: "user",
//       });
//       const user = await User.findById({ _id: `${student.user._id}` });
//       const transfer = await StudentTransfer.findById({ _id: eid });
//       const notify = await new Notification({});
//       transfer.transferStatus = status;
//       notify.notifyContent = `Your Transfer request has been Rejected by ${classes.className}`;
//       notify.notifySender = id;
//       notify.notifyReceiever = user._id;
//       user.uNotify.push(notify);
//       notify.user = user;
//       notify.notifyByStudentPhoto = student;
//       await transfer.save();
//       await user.save();
//       await notify.save();
//       res.status(200).send({ message: "Transfer Not Granted", transfer });
//     } catch {
//       console.log(
//         `SomeThing Went Wrong at this EndPoint(/class/:id/student/transfer/reject/:eid)`
//       );
//     }
//   });

exports.staffComplaint = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.sid);
    const complaint = new Complaint({
      complaintType: req.body.complaintType,
      complaintContent: req.body.complaintContent,
      staff: staff._id,
      institute: staff.institute,
    });
    const institute = await InstituteAdmin.findById(staff.institute);
    institute.staffComplaints.push(complaint._id);
    staff.complaints.push(complaint > _id);
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
        select: "complaintType complaintStatus createdAt",
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
      "studentComplaint"
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
