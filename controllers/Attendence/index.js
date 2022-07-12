const Student = require("../../models/Student");
const Class = require("../../models/Class");
const AttendenceDate = require("../../models/AttendenceDate");
const Holiday = require("../../models/Holiday");
const Department = require("../../models/Department");
const InstituteAdmin = require("../../models/InstituteAdmin");
const StaffAttendenceDate = require("../../models/StaffAttendenceDate");
const Staff = require("../../models/Staff");
const Notification = require("../../models/notification");

//THis is route with tested OF STUDENT
exports.viewClassStudent = async (req, res) => {
  const institute = await Student.findById(req.params.sid);
  res.status(200).send({ institute });
};

exports.getAttendClassStudent = async (req, res) => {
  const prevDate = req.query.date;
  let regularexp = "";
  if (prevDate) {
    const previousDate = prevDate.split("/");
    regularexp = new RegExp(
      `${previousDate[0]}\/${previousDate[1]}\/${previousDate[2]}$`
    );
  } else {
    const currentDate = new Date();
    const currentDateLocalFormat = currentDate.toLocaleDateString().split("/");
    const day =
      +currentDateLocalFormat[0] > 9
        ? +currentDateLocalFormat[0]
        : `0${+currentDateLocalFormat[0]}`;
    const month =
      +currentDateLocalFormat[1] > 9
        ? +currentDateLocalFormat[1]
        : `0${+currentDateLocalFormat[1]}`;
    const year = +currentDateLocalFormat[2];

    regularexp = new RegExp(`${day}\/${month}\/${year}$`);
  }

  const classes = await Class.findById(req.params.cid)
    .populate({
      path: "attendenceDate",
      match: {
        attendDate: { $regex: regularexp },
      },
      select:
        "attendDate presentTotal absentTotal presentStudent absentStudent",
    })
    .select("_id")
    .lean()
    .exec();
  res.status(200).send({ classes });
};
exports.markAttendenceClassStudent = async (req, res) => {
  try {
    const { cid } = req.params;
    const dLeave = await Holiday.findOne({
      dDate: { $eq: `${req.body.date}` },
    });

    if (dLeave) {
      res.status(200).send({
        message: "Today will be holiday Provided by department Admin",
      });
    } else {
      const classes = await Class.findById({ _id: cid });
      const startDateClass = classes?.classStartDate?.split("/");
      const currentDate = new Date();
      const currentDateLocalFormat = currentDate
        .toLocaleDateString()
        .split("/");
      const markDate = req.body.date.split("/");
      //this is logic
      // +markDate[0] === +currentDateLocalFormat[0] &&
      // +markDate[1] === +currentDateLocalFormat[1] &&
      // +markDate[2] === +currentDateLocalFormat[2] &&
      // +markDate[2] >= +startDateClass?.[2] &&
      // +markDate[1] >= +startDateClass?.[1] &&
      // +markDate[0] >= +startDateClass?.[0]
      if (
        +markDate[0] === +currentDateLocalFormat[0] &&
        +markDate[1] === +currentDateLocalFormat[1] &&
        +markDate[2] === +currentDateLocalFormat[2] &&
        +markDate[2] >= +startDateClass?.[2] &&
        +markDate[1] >= +startDateClass?.[1] &&
        +markDate[0] >= +startDateClass?.[0]
      ) {
        const attendence = new AttendenceDate({});
        attendence.attendDate = req.body.date;
        attendence.className = classes._id;
        attendence.attendTime = new Date();

        for (let i = 0; i < req.body.present.length; i++) {
          const student = await Student.findById({
            _id: `${req.body.present[i]}`,
          });
          student.attendDate.push(attendence._id);
          attendence.presentStudent.push(student._id);
          await student.save();
        }

        for (let i = 0; i < req.body.absent.length; i++) {
          const student = await Student.findById({
            _id: `${req.body.absent[i]}`,
          });
          student.attendDate.push(attendence._id);
          attendence.absentStudent.push(student._id);
          await student.save();
        }
        classes.attendenceDate.push(attendence._id);
        attendence.presentTotal = req.body.present.length;
        attendence.absentTotal = req.body.absent.length;
        await Promise.all([attendence.save(), classes.save()]);
        res.status(200).send({ message: "Success" });
      } else {
        res.status(200).send({
          message: `Mark attendance after the class start Date after ${classes.classStartDate}`,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.markAttendenceClassStudentUpdate = async (req, res) => {
  try {
    const { said } = req.params;
    const attendance = await AttendenceDate.findOne({
      attendDate: { $eq: `${req.body.date}` },
    });

    if (!attendance) {
      res.status(200).send({
        message: "Attendance not Updated, first make a attendance",
      });
    } else {
      const currentDate = new Date();
      const currentDateLocalFormat = currentDate
        .toLocaleDateString()
        .split("/");
      const markDate = req.body.date.split("/");
      if (
        +markDate[0] === +currentDateLocalFormat[0] &&
        +markDate[1] === +currentDateLocalFormat[1] &&
        +markDate[2] === +currentDateLocalFormat[2]
      ) {
        const studentAttendance = await AttendenceDate.findById(said);
        for (let i = 0; i < req.body.present.length; i++) {
          if (studentAttendance.presentStudent.includes(req.body.present[i])) {
          } else if (
            studentAttendance.absentStudent.includes(req.body.present[i])
          ) {
            studentAttendance.presentStudent.push(req.body.present[i]);
            studentAttendance.absentStudent.pull(req.body.present[i]);
            studentAttendance.presentTotal = ++studentAttendance.presentTotal;
            studentAttendance.absentTotal = --studentAttendance.absentTotal;
          } else {
          }
        }
        for (let i = 0; i < req.body.absent.length; i++) {
          if (studentAttendance.absentStudent.includes(req.body.absent[i])) {
          } else if (
            studentAttendance.presentStudent.includes(req.body.absent[i])
          ) {
            studentAttendance.absentStudent.push(req.body.absent[i]);
            studentAttendance.presentStudent.pull(req.body.absent[i]);
            studentAttendance.presentTotal = --studentAttendance.presentTotal;
            studentAttendance.absentTotal = ++studentAttendance.absentTotal;
          } else {
          }
        }
        await studentAttendance.save();
        res.status(200).send({ message: "Updated attendance" });
      } else {
        res
          .status(200)
          .send({ message: "You can not mark attendance this date" });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAttendStudentById = async (req, res) => {
  try {
    const month = req.query.month;
    const year = req.query.year;
    let days = 0;
    let present = 0;
    let absent = 0;
    const presentArray = [];
    const absentArray = [];
    let regularexp = "";
    if (month) {
      regularexp = new RegExp(`\/${month}\/${year}$`);
    } else {
      regularexp = new RegExp(`\/${year}$`);
    }
    const student = await Student.findById(req.params.sid)
      .select("_id attendDate")
      .populate({
        path: "attendDate",
        match: {
          attendDate: { $regex: regularexp },
        },
        select: "attendDate presentStudent absentStudent",
      });

    if (student) {
      if (student.attendDate) {
        student.attendDate.forEach((day) => {
          if (day.presentStudent.includes(req.params.sid)) {
            present += 1;
            presentArray.push(day.attendDate);
          } else if (day.absentStudent.includes(req.params.sid)) {
            absent += 1;
            absentArray.push(day.attendDate);
          } else {
          }
        });
        days = student.attendDate.length;
      }

      let presentPercentage = ((present * 100) / days).toFixed(2);
      let absentPercentage = ((absent * 100) / days).toFixed(2);
      res.status(200).send({
        message: "Success",
        presentArray,
        absentArray,
        present: presentPercentage,
        absent: absentPercentage,
      });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch (e) {
    console.log(e);
  }
};

//==============================================================================================
//for the Staff Attendance Related Controller

exports.viewInstitute = async (req, res) => {
  const institute = await InstituteAdmin.findById(req.params.id);
  res.status(200).send({ institute });
};

exports.viewInstituteStaff = async (req, res) => {
  const institute = await Staff.findById(req.params.sid);
  res.status(200).send({ institute });
};
exports.markAttendenceDepartmentStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const dLeaves = await Holiday.findOne({
      dDate: { $eq: `${req.body.date}` },
    });

    if (dLeaves) {
      res.status(200).send({
        message: "Attendance not mark Current Date due to Holiday",
      });
    } else {
      const currentDate = new Date();
      const currentDateLocalFormat = currentDate
        .toLocaleDateString()
        .split("/");
      const markDate = req.body.date.split("/");
      if (
        +markDate[0] === +currentDateLocalFormat[0] &&
        +markDate[1] === +currentDateLocalFormat[1] &&
        +markDate[2] === +currentDateLocalFormat[2]
      ) {
        const institute = await InstituteAdmin.findById({ _id: id });
        const staffAttendence = new StaffAttendenceDate({});
        staffAttendence.staffAttendDate = req.body.date;
        staffAttendence.institute = institute._id;
        staffAttendence.staffAttendTime = new Date();
        for (let i = 0; i < req.body.present.length; i++) {
          const staff = await Staff.findById({
            _id: `${req.body.present[i]}`,
          }).populate({
            path: "user",
            select: "_id uNotify",
          });
          staff.attendDates.push(staffAttendence._id);
          const notify = new Notification({});
          notify.notifyContent = `Today is Present`;
          notify.notifySender = id;
          notify.notifyReceiever = staff.user._id;
          staff.user.uNotify.push(notify._id);
          notify.user = staff.user._id;
          notify.notifyByInsPhoto = id;
          staffAttendence.presentStaff.push(staff._id);
          staffAttendence.presentTotal = req.body.present.length;
          await Promise.all([
            staff.save(),
            staffAttendence.save(),
            notify.save(),
            staff.user.save(),
          ]);
        }

        for (let i = 0; i < req.body.absent.length; i++) {
          const staff = await Staff.findById({
            _id: `${req.body.absent[i]}`,
          }).populate({
            path: "user",
            select: "_id uNotify",
          });
          staff.attendDates.push(staffAttendence._id);
          staffAttendence.absentStaff.push(staff._id);
          const notify = new Notification({});
          notify.notifyContent = `Today is Absent`;
          notify.notifySender = id;
          notify.notifyReceiever = staff.user._id;
          staff.user.uNotify.push(notify._id);
          notify.user = staff.user._id;
          notify.notifyByInsPhoto = id;
          staffAttendence.absentTotal = req.body.absent.length;
          await Promise.all([
            staff.save(),
            staffAttendence.save(),
            notify.save(),
            staff.user.save(),
          ]);
        }
        institute.staffAttendance.push(staffAttendence._id);
        await Promise.all([institute.save(), staffAttendence.save()]);
        res.status(201).send({ message: "Success" });
      } else {
        res
          .status(200)
          .send({ message: "You can not mark attendance this date" });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAttendInstituteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const prevDate = req.query.date;
    let regularexp = "";
    if (prevDate) {
      const previousDate = prevDate.split("/");
      regularexp = new RegExp(
        `${previousDate[0]}\/${previousDate[1]}\/${previousDate[2]}$`
      );
    } else {
      const currentDate = new Date();
      const currentDateLocalFormat = currentDate
        .toLocaleDateString()
        .split("/");
      const day =
        +currentDateLocalFormat[0] > 9
          ? +currentDateLocalFormat[0]
          : `0${+currentDateLocalFormat[0]}`;
      const month =
        +currentDateLocalFormat[1] > 9
          ? +currentDateLocalFormat[1]
          : `0${+currentDateLocalFormat[1]}`;
      const year = +currentDateLocalFormat[2];
      regularexp = new RegExp(`${day}\/${month}\/${year}$`);
    }
    const institute = await InstituteAdmin.findById({ _id: id })
      .select("_id")
      .populate({
        path: "staffAttendance",
        match: {
          staffAttendDate: { $regex: regularexp },
        },
        select:
          "staffAttendDate staffAttendTime presentStaff absentStaff absentTotal presentTotal",
      })
      .lean()
      .exec();
    if (institute) {
      res.status(200).send({ message: "Success", institute });
    } else {
      res.status(403).send({ message: "Failure" });
    }
  } catch {}
};

exports.markAttendenceDepartmentStaffUpdate = async (req, res) => {
  try {
    const { said } = req.params;
    const attendance = await StaffAttendenceDate.findOne({
      staffAttendDate: { $eq: `${req.body.date}` },
    });

    if (!attendance) {
      res.status(200).send({
        message: "Attendance not Updated, first make a attendance",
      });
    } else {
      const currentDate = new Date();
      const currentDateLocalFormat = currentDate
        .toLocaleDateString()
        .split("/");
      const markDate = req.body.date.split("/");
      if (
        +markDate[0] === +currentDateLocalFormat[0] &&
        +markDate[1] === +currentDateLocalFormat[1] &&
        +markDate[2] === +currentDateLocalFormat[2]
      ) {
        const staffAttendence = await StaffAttendenceDate.findById(said);
        for (let i = 0; i < req.body.present.length; i++) {
          if (staffAttendence.presentStaff.includes(req.body.present[i])) {
          } else if (
            staffAttendence.absentStaff.includes(req.body.present[i])
          ) {
            staffAttendence.presentStaff.push(req.body.present[i]);
            staffAttendence.absentStaff.pull(req.body.present[i]);
            staffAttendence.presentTotal = ++staffAttendence.presentTotal;
            staffAttendence.absentTotal = --staffAttendence.absentTotal;
          } else {
          }
        }
        for (let i = 0; i < req.body.absent.length; i++) {
          if (staffAttendence.absentStaff.includes(req.body.absent[i])) {
          } else if (
            staffAttendence.presentStaff.includes(req.body.absent[i])
          ) {
            staffAttendence.absentStaff.push(req.body.absent[i]);
            staffAttendence.presentStaff.pull(req.body.absent[i]);
            staffAttendence.presentTotal = --staffAttendence.presentTotal;
            staffAttendence.absentTotal = ++staffAttendence.absentTotal;
          } else {
          }
        }
        await staffAttendence.save();
        res.status(200).send({ message: "Updated attendance" });
      } else {
        res
          .status(200)
          .send({ message: "You can not mark attendance this date" });
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAttendStaffById = async (req, res) => {
  try {
    const month = req.query.month;
    const year = req.query.year;
    let days = 0;
    let present = 0;
    let absent = 0;
    const presentArray = [];
    const absentArray = [];
    let regularexp = "";
    if (month) {
      regularexp = new RegExp(`\/${month}\/${year}$`);
    } else {
      regularexp = new RegExp(`\/${year}$`);
    }
    const staff = await Staff.findById(req.params.sid)
      .select("_id attendDates")
      .populate({
        path: "attendDates",
        match: {
          staffAttendDate: { $regex: regularexp },
        },
        select: "staffAttendDate presentStaff absentStaff",
      });

    if (staff) {
      if (staff.attendDates) {
        staff.attendDates.forEach((day) => {
          if (day.presentStaff.includes(req.params.sid)) {
            present += 1;
            presentArray.push(day.staffAttendDate);
          } else if (day.absentStaff.includes(req.params.sid)) {
            absent += 1;
            absentArray.push(day.staffAttendDate);
          } else {
          }
        });
        days = staff.attendDates.length;
      }

      let presentPercentage = ((present * 100) / days).toFixed(2);
      let absentPercentage = ((absent * 100) / days).toFixed(2);
      res.status(200).send({
        message: "Success",
        presentArray,
        absentArray,
        present: presentPercentage,
        absent: absentPercentage,
      });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

//=====================================================================================================

//==================HOLIDAY=========================

exports.holidayCalendar = async (req, res) => {
  try {
    const { did } = req.params;
    const { dates } = req.body;
    const depart = await Department.findById({ _id: did });
    const currentDate = new Date();
    const adate = currentDate.toLocaleDateString().split("/");
    const leave = new Holiday({
      dHolidayReason: req.body.reason,
    });
    dates.forEach((dat) => {
      const fdate = dat.split("/");
      const year = +fdate[2] >= +adate[2];
      const month = +fdate[1] >= +adate[1];
      const day = +fdate[0] >= +adate[0];
      if (year && month && day) {
        leave.dDate.push(dat);
      } else if (year && month) {
        leave.dDate.push(dat);
      } else if (year) {
        leave.dDate.push(dat);
      } else {
      }
    });
    depart.holiday.push(leave._id);
    leave.department = depart._id;
    await Promise.all([depart.save(), leave.save()]);
    res.status(200).send({ message: "Holiday Marked ", leave });
  } catch {
    res.status(200).send({ message: "previous date not mark as holiday" });
  }
};

exports.fetchHoliday = async (req, res) => {
  try {
    const { did } = req.params;
    const depart = await Department.findById({ _id: did })
      .select("id")
      .populate({
        path: "holiday",
        select: "dDate dHolidayReason",
      })
      .lean()
      .exec();
    if (depart) {
      res.status(200).send({ message: "holiday data", depart });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

// exports.updateHoliday = async (req, res) => {
//   try {
//     const holiday = await Holiday.findById(req.params.hid);
//   } catch {}
// };
exports.delHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.hid);
    const depart = await Department.findById(holiday.department);
    depart.holiday.pull(req.params.hid);
    await Holiday.findByIdAndDelete(req.params.hid);
    await depart.save();
    res.status(200).send({
      message: "deleted",
    });
  } catch (error) {}
};

// ===============================UNUSED ROUTE=====================

// // const Batch = require("../../models/Batch");

// exports.getAttendStudentClass = async (req, res) => {
//   try {
//     const { cid } = req.params;
//     const classes = await Class.findById({ _id: cid })
//       .select("className classTitle classStatus classStartDate")
//       .populate({
//         path: "ApproveStudent",
//         select:
//           "studentFirstName studentMiddleName studentLastName studentROLLNO",
//       })
//       .lean()
//       .exec();
//     if (classes) {
//       res.status(200).send({ message: "Success", classes });
//     } else {
//       res.status(404).send({ message: "Failure" });
//     }
//   } catch {}
// };

// exports.getAttendStudentClassById = async (req, res) => {
//   try {
//     const { cid } = req.params;
//     const classes = await Class.findById({ _id: cid })
//       .select("className classTitle classStatus classStartDate")
//       .populate({
//         path: "ApproveStudent",
//         select: "id",
//       })
//       .lean()
//       .exec();
//     if (classes) {
//       res.status(200).send({ message: "Success", classes });
//     } else {
//       res.status(404).send({ message: "Failure" });
//     }
//   } catch {}
// };

// exports.retrieveAttendenceByDate = async (req, res) => {
//   try {
//     const { cid, date } = req.params;
//     const attend = await AttendenceDate.findOne({
//       $and: [{ className: cid }, { attendDate: date }],
//     })
//       .select(
//         "attendDate presentStudent presentTotal absentStudent absentTotal"
//       )
//       .lean()
//       .exec();
//     if (attend) {
//       res.status(200).send({ message: "Success", attend });
//     } else {
//       res.status(404).send({ message: "Failure" });
//     }
//   } catch {}
// };

// exports.retrieveStudentAttendenceCalendar = async (req, res) => {
//   try {
//     const { sid } = req.params;
//     const { dateStatus } = req.body;
//     const attendStatus = await AttendenceDate.findOne({
//       attendDate: dateStatus,
//     });
//     if (attendStatus) {
//       if (
//         attendStatus.presentStudent.length >= 1 &&
//         attendStatus.presentStudent.includes(String(sid))
//       ) {
//         res.status(200).send({ message: "Present", status: "Present" });
//       } else if (
//         attendStatus.absentStudent.length >= 1 &&
//         attendStatus.absentStudent.includes(String(sid))
//       ) {
//         res.status(200).send({ message: "Absent", status: "Absent" });
//       } else {
//       }
//     } else {
//       res.status(200).send({ message: "Not Marking", status: "Not Marking" });
//     }
//   } catch {}
// };

// //depriciated this function
// exports.retrieveAttendenceByStaffDate = async (req, res) => {
//   try {
//     const { did, date } = req.params;
//     const attend = await StaffAttendenceDate.findOne({
//       $and: [{ department: did }, { staffAttendDate: date }],
//     })
//       .select(
//         "staffAttendDate presentStaff presentTotal absentStaff absentTotal"
//       )
//       .lean()
//       .exec();
//     if (attend) {
//       res.status(200).send({ message: "Success", attend });
//     } else {
//       res.status(404).send({ message: "Failure" });
//     }
//   } catch {}
// };

// exports.retrieveStaffAttendenceCalendar = async (req, res) => {
//   try {
//     const { sid } = req.params;
//     const { dateStatus } = req.body;
//     const attendStatus = await StaffAttendenceDate.findOne({
//       staffAttendDate: dateStatus,
//     });
//     if (attendStatus) {
//       if (
//         attendStatus.presentStaff.length >= 1 &&
//         attendStatus.presentStaff.includes(String(sid))
//       ) {
//         res.status(200).send({ message: "Present", status: "Present" });
//       } else if (
//         attendStatus.absentStaff.length >= 1 &&
//         attendStatus.absentStaff.includes(String(sid))
//       ) {
//         res.status(200).send({ message: "Absent", status: "Absent" });
//       } else {
//       }
//     } else {
//       res.status(200).send({ message: "Not Marking", status: "Not Marking" });
//     }
//   } catch {}
// };

// // exports.holidayCalendar = async (req, res) => {
// //   try {
// //     const { did } = req.params;
// //     const { dateStatus } = req.body;
// //     const depart = await Department.findById({ _id: did });
// //     const staffDate = await StaffAttendenceDate.findOne({
// //       staffAttendDate: { $eq: `${dateStatus}` },
// //     });
// //     const classDate = await AttendenceDate.findOne({
// //       attendDate: { $eq: `${dateStatus}` },
// //     });
// //     if (staffDate && staffDate !== "undefined") {
// //       res.status(200).send({ message: "Count as a no holiday", staffDate });
// //     } else if (classDate && classDate !== "undefined") {
// //       res.status(200).send({ message: "Count as a no holiday", classDate });
// //     } else {
// //       const leave = new Holiday({
// //         dDate: dateStatus,
// //         dHolidayReason: req.body.reason,
// //       });
// //       depart.holiday.push(leave._id);
// //       leave.department = depart._id;
// //       await Promise.all([depart.save(), leave.save()]);
// //       res.status(200).send({ message: "Holiday Marked " });
// //     }
// //   } catch {}
// // };
