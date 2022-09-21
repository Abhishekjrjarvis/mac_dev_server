const Student = require("../../models/Student");
const Class = require("../../models/Class");
const AttendenceDate = require("../../models/AttendenceDate");
const Holiday = require("../../models/Holiday");
const Department = require("../../models/Department");
const InstituteAdmin = require("../../models/InstituteAdmin");
const StaffAttendenceDate = require("../../models/StaffAttendenceDate");
const Staff = require("../../models/Staff");
const Notification = require("../../models/notification");
const StudentNotification = require("../../models/Marks/StudentNotification");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const User = require("../../models/User");

//THis is route with tested OF STUDENT
exports.viewClassStudent = async (req, res) => {
  const institute = await Student.findById(req.params.sid);
  res.status(200).send({ institute });
};

exports.getAttendClassStudent = async (req, res) => {
  const prevDate = req.query.date;
  let regularexp = "";
  if (prevDate) {
    const previousDate = prevDate?.split("/");
    regularexp = new RegExp(
      `${previousDate[0]}\/${previousDate[1]}\/${previousDate[2]}$`
    );
  } else {
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    const currentDateLocalFormat = currentDate.toISOString().split("-");
    const day =
      +currentDateLocalFormat[2].split("T")[0] > 9
        ? +currentDateLocalFormat[2].split("T")[0]
        : `0${+currentDateLocalFormat[2].split("T")[0]}`;
    const month =
      +currentDateLocalFormat[1] > 9
        ? +currentDateLocalFormat[1]
        : `0${+currentDateLocalFormat[1]}`;
    const year = +currentDateLocalFormat[0];
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
    const classes = await Class.findById({ _id: cid });
    const dLeave = await Holiday.findOne({
      department: { $eq: `${classes.department}` },
      dDate: { $eq: `${req.body.date}` },
    });
    const attendanceone = await AttendenceDate.findOne({
      className: { $eq: `${cid}` },
      attendDate: { $eq: `${req.body.date}` },
    });
    if (dLeave || attendanceone) {
      res.status(200).send({
        message:
          "Today will be holiday  Provided by department Admin or already marked attendance",
      });
    } else {
      const startDateClass = classes?.classStartDate?.split("/");
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 5);
      currentDate.setMinutes(currentDate.getMinutes() + 30);
      const currentDateLocalFormat = currentDate.toISOString().split("-");
      const markDate = req.body.date?.split("/");
      //this is logic
      // +markDate[0] === +currentDateLocalFormat[0] &&
      // +markDate[1] === +currentDateLocalFormat[1] &&
      // +markDate[2] === +currentDateLocalFormat[2] &&
      // +markDate[2] >= +startDateClass?.[2] &&
      // +markDate[1] >= +startDateClass?.[1] &&
      // +markDate[0] >= +startDateClass?.[0]
      const classyear = +markDate[2] > +startDateClass?.[2];
      const year = +markDate[2] === +startDateClass?.[2];
      const classmonth = +markDate[1] > +startDateClass?.[1];
      const month = +markDate[1] === +startDateClass?.[1];
      const day = +markDate[0] >= +startDateClass?.[0];
      const fun = () => {
        if (classyear) {
          return true;
        } else if (year) {
          if (classmonth) {
            return true;
          } else if (month) {
            if (day) {
              return true;
            }
          } else {
          }
        } else {
        }
      };
      if (
        +markDate[0] === +currentDateLocalFormat[2].split("T")[0] &&
        +markDate[1] === +currentDateLocalFormat[1] &&
        +markDate[2] === +currentDateLocalFormat[0] &&
        fun()
      ) {
        const attendence = new AttendenceDate({});
        attendence.attendDate = req.body.date;
        attendence.className = classes._id;
        attendence.attendTime = new Date();
        for (let i = 0; i < req.body.present.length; i++) {
          const student = await Student.findById({
            _id: `${req.body.present[i]}`,
          });
          const user = await User.findById({ _id: `${student.user}` });
          const notify = new StudentNotification({});
          notify.notifyContent = `you're present today`;
          notify.notifySender = classes._id;
          notify.notifyReceiever = user._id;
          notify.notifyType = "Student";
          notify.notifyPublisher = student._id;
          notify.notifyByClassPhoto = classes._id;
          user.activity_tab.push(notify._id);
          student.notification.push(notify._id);
          student.attendDate.push(attendence._id);
          attendence.presentStudent.push(student._id);
          //
          invokeMemberTabNotification(
            "Student Activity",
            notify,
            "Mark Attendence",
            user._id,
            user.deviceToken,
            "Student",
            notify
          );
          //
          await Promise.all([student.save(), notify.save(), user.save()]);
        }

        for (let i = 0; i < req.body.absent.length; i++) {
          const student = await Student.findById({
            _id: `${req.body.absent[i]}`,
          });
          const user = await User.findById({ _id: `${student.user}` });
          const notify = new StudentNotification({});
          notify.notifyContent = `you're absent today`;
          notify.notifySender = classes._id;
          notify.notifyReceiever = user._id;
          notify.notifyType = "Student";
          notify.notifyPublisher = student._id;
          notify.notifyByClassPhoto = classes._id;
          user.activity_tab.push(notify._id);
          student.notification.push(notify._id);
          student.attendDate.push(attendence._id);
          attendence.absentStudent.push(student._id);
          //
          invokeMemberTabNotification(
            "Student Activity",
            notify,
            "Mark Attendence",
            user._id,
            user.deviceToken,
            "Student",
            notify
          );
          //
          await Promise.all([student.save(), notify.save(), user.save()]);
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
    console.log(e)
  }
};

exports.markAttendenceClassStudentUpdate = async (req, res) => {
  try {
    const { said } = req.params;
    const attendance = await AttendenceDate.findOne({
      _id: { $eq: `${said}` },
      attendDate: { $eq: `${req.body.date}` },
    });
    if (!attendance) {
      res.status(200).send({
        message: "Attendance not Updated, first make a attendance",
      });
    } else {
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 5);
      currentDate.setMinutes(currentDate.getMinutes() + 30);
      const currentDateLocalFormat = currentDate.toISOString().split("-");
      const markDate = req.body.date?.split("/");
      if (
        +markDate[0] === +currentDateLocalFormat[2].split("T")[0] &&
        +markDate[1] === +currentDateLocalFormat[1] &&
        +markDate[2] === +currentDateLocalFormat[0]
      ) {
        const studentAttendance = await AttendenceDate.findById(said);
        for (let i = 0; i < req.body.present?.length; i++) {
          if (studentAttendance.presentStudent?.includes(req.body.present[i])) {
          } else if (
            studentAttendance.absentStudent?.includes(req.body.present[i])
          ) {
            studentAttendance.presentStudent?.push(req.body.present[i]);
            studentAttendance.absentStudent?.pull(req.body.present[i]);
            studentAttendance.presentTotal += 1;
            studentAttendance.absentTotal -= 1;
            // const student=await Student.findById(req.body.present[i])
            // const notify = new StudentNotification({});
            // notify.notifyContent = `Today is present`;
            // notify.notifySender = studentAttendance.className;
            // notify.notifyReceiever = student._id;
            // notify.notifyByClassPhoto = studentAttendance.className;
            // student.notification.push(notify._id);
            // await Promise.all([student.save(), notify.save()]);
          } else {
          }
        }
        for (let i = 0; i < req.body.absent.length; i++) {
          if (studentAttendance.absentStudent?.includes(req.body.absent[i])) {
          } else if (
            studentAttendance.presentStudent?.includes(req.body.absent[i])
          ) {
            studentAttendance.absentStudent?.push(req.body.absent[i]);
            studentAttendance.presentStudent?.pull(req.body.absent[i]);
            studentAttendance.presentTotal -= 1;
            studentAttendance.absentTotal += 1;
            // const student=await Student.findById(req.body.absent[i])
            // const notify = new StudentNotification({});
            // notify.notifyContent = `Today is absent`;
            // notify.notifySender = studentAttendance.className;
            // notify.notifyReceiever = student._id;
            // notify.notifyByClassPhoto = studentAttendance.className;
            // student.notification.push(notify._id);
            // await Promise.all([student.save(), notify.save()]);
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
      .select("_id attendDate leave studentClass")
      .populate({
        path: "attendDate",
        match: {
          attendDate: { $regex: regularexp },
        },
        select: "attendDate presentStudent absentStudent",
      })
      .populate({
        path: "leave",
        match: {
          date: { $regex: regularexp },
          status: { $eq: "Accepted" },
        },
        select: "date",
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
        takenLeave: student.leave,
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
    // const dLeaves = await Holiday.findOne({
    //   dDate: { $eq: `${req.body.date}` },
    // });
    const attend = await StaffAttendenceDate.findOne({
      institute: { $eq: `${id}` },
      staffAttendDate: { $eq: `${req.body.date}` },
    });
    if (attend) {
      res.status(200).send({
        message:
          "Attendance not mark Current Date due to already marked attendance",
      });
    } else {
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 5);
      currentDate.setMinutes(currentDate.getMinutes() + 30);
      const currentDateLocalFormat = currentDate.toISOString().split("-");
      const markDate = req.body.date?.split("/");
      if (
        +markDate[0] === +currentDateLocalFormat[2].split("T")[0] &&
        +markDate[1] === +currentDateLocalFormat[1] &&
        +markDate[2] === +currentDateLocalFormat[0]
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
            select: "_id uNotify userLegalName deviceToken activity_tab",
          });
          staff.attendDates.push(staffAttendence._id);
          const notify = new StudentNotification({});
          notify.notifyContent = `you're present today`;
          notify.notifySender = id;
          notify.notifyReceiever = staff.user._id;
          notify.notifyType = "Staff";
          notify.notifyPublisher = staff._id;
          staff.user.activity_tab.push(notify._id);
          notify.notifyByInsPhoto = id;
          staffAttendence.presentStaff.push(staff._id);
          staffAttendence.presentTotal = req.body.present.length;
          //
          invokeMemberTabNotification(
            "Staff Activity",
            notify,
            "Mark Attendence",
            staff.user._id,
            staff.user.deviceToken,
            "Staff",
            notify
          );
          //
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
            select: "_id uNotify userLegalName deviceToken activity_tab",
          });
          staff.attendDates.push(staffAttendence._id);
          staffAttendence.absentStaff.push(staff._id);
          const notify = new StudentNotification({});
          notify.notifyContent = `you're absent today`;
          notify.notifySender = id;
          notify.notifyReceiever = staff.user._id;
          notify.notifyType = "Staff";
          notify.notifyPublisher = staff._id;
          staff.user.activity_tab.push(notify._id);
          notify.notifyByInsPhoto = id;
          staffAttendence.absentTotal = req.body.absent.length;
          //
          invokeMemberTabNotification(
            "Staff Activity",
            notify,
            "Mark Attendence",
            staff.user._id,
            staff.user.deviceToken,
            "Staff",
            notify
          );
          //
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
  } catch (e) {}
};

exports.getAttendInstituteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const prevDate = req.query.date;
    let regularexp = "";
    if (prevDate) {
      const previousDate = prevDate?.split("/");
      regularexp = new RegExp(
        `${previousDate[0]}\/${previousDate[1]}\/${previousDate[2]}$`
      );
    } else {
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 5);
      currentDate.setMinutes(currentDate.getMinutes() + 30);
      const currentDateLocalFormat = currentDate.toISOString().split("-");
      const day =
        +currentDateLocalFormat[2].split("T")[0] > 9
          ? +currentDateLocalFormat[2].split("T")[0]
          : `0${+currentDateLocalFormat[2].split("T")[0]}`;
      const month =
        +currentDateLocalFormat[1] > 9
          ? +currentDateLocalFormat[1]
          : `0${+currentDateLocalFormat[1]}`;
      const year = +currentDateLocalFormat[0];
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
    const attendance = await StaffAttendenceDate.findById(said);

    if (!attendance) {
      res.status(200).send({
        message: "Attendance not Updated, first make a attendance",
      });
    } else {
      var currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 5);
      currentDate.setMinutes(currentDate.getMinutes() + 30);
      const currentDateLocalFormat = currentDate.toISOString().split("-");
      const markDate = req.body.date?.split("/");
      if (
        +markDate[0] === +currentDateLocalFormat[2].split("T")[0] &&
        +markDate[1] === +currentDateLocalFormat[1] &&
        +markDate[2] === +currentDateLocalFormat[0]
      ) {
        const staffAttendence = await StaffAttendenceDate.findById(said);
        for (let i = 0; i < req.body.present?.length; i++) {
          if (staffAttendence.presentStaff?.includes(req.body.present[i])) {
          } else if (
            staffAttendence.absentStaff?.includes(req.body.present[i])
          ) {
            staffAttendence.presentStaff?.push(req.body.present[i]);
            staffAttendence.absentStaff?.pull(req.body.present[i]);
            staffAttendence.presentTotal += 1;
            staffAttendence.absentTotal -= 1;
          } else {
            if (req.body.present.includes(req.body.present[i])) {
              staffAttendence.presentStaff?.push(req.body.present[i]);
              staffAttendence.presentTotal += 1;
            } else if (req.body.absent.includes(req.body.absent[i])) {
              staffAttendence.absentStaff?.push(req.body.absent[i]);
              staffAttendence.absentTotal += 1;
            } else {
            }
          }
        }
        for (let i = 0; i < req.body.absent?.length; i++) {
          if (staffAttendence.absentStaff?.includes(req.body.absent[i])) {
          } else if (
            staffAttendence.presentStaff?.includes(req.body.absent[i])
          ) {
            staffAttendence.absentStaff?.push(req.body.absent[i]);
            staffAttendence.presentStaff?.pull(req.body.absent[i]);
            staffAttendence.presentTotal -= 1;
            staffAttendence.absentTotal += 1;
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
      .select("_id attendDates staffLeave")
      .populate({
        path: "attendDates",
        match: {
          staffAttendDate: { $regex: regularexp },
        },

        select: "staffAttendDate presentStaff absentStaff",
      })
      .populate({
        path: "staffLeave",
        match: {
          date: { $regex: regularexp },
          status: { $eq: "Accepted" },
        },
        select: "date",
      });

    if (staff) {
      if (staff.attendDates) {
        staff.attendDates.forEach((day) => {
          if (day.presentStaff?.includes(req.params.sid)) {
            present += 1;
            presentArray.push(day.staffAttendDate);
          } else if (day.absentStaff?.includes(req.params.sid)) {
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
        leaves: staff.staffLeave,
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
    const adate = currentDate.toISOString().split("-");
    const leave = new Holiday({
      dHolidayReason: req.body.reason,
    });
    dates.forEach((dat) => {
      const fdate = dat?.split("/");
      const classyear = +fdate[2] > +adate[0];
      const year = +fdate[2] === +adate[0];
      const classmonth = +fdate[1] > +adate[1];
      const month = +fdate[1] === +adate[1];
      const day = +fdate[0] >= +adate[2].split("T")[0];
      if (classyear) {
        leave.dDate.push(dat);
      } else if (year) {
        if (classmonth) {
          leave.dDate.push(dat);
        } else if (month) {
          if (day) {
            leave.dDate.push(dat);
          }
        } else {
        }
      } else {
      }
      //old ithink not work
      // const fdate = dat?.split("/");
      // const year = +fdate[2] >= +adate[0];
      // const month = +fdate[1] >= +adate[1];
      // const day = +fdate[0] >= +adate[2].split("T")[0];
      // if (year && month && day) {
      //   leave.dDate.push(dat);
      // } else if (year && month) {
      //   leave.dDate.push(dat);
      // } else if (year) {
      //   leave.dDate.push(dat);
      // } else {
      // }
    });
    depart.holiday.push(leave._id);
    leave.department = depart._id;
    //
    for (let i = 0; i < depart.ApproveStudent.length; i++) {
      const student = await Student.findById({
        _id: depart.ApproveStudent[i]._id,
      }).populate({
        path: "user",
        select: "_id",
      });
      const user = await User.findById({ _id: `${student.user._id}` });
      const notify = new StudentNotification({});
      notify.notifyContent = `New Holiday Marked`;
      notify.notifySender = depart._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      notify.notifyReceiever = user._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = depart._id;
      //
      invokeMemberTabNotification(
        "Student Activity",
        notify,
        "New Holiday",
        user._id,
        user.deviceToken,
        "Student",
        notify
      );
      await Promise.all([user.save(), notify.save()]);
    }
    //
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

exports.holidayInClassSide = async (req, res) => {
  try {
    const month = req.query.month;
    const year = req.query.year;
    let regularexp = "";
    if (month) {
      regularexp = new RegExp(`\/${month}\/${year}$`);
    } else {
      regularexp = new RegExp(`\/${year}$`);
    }
    const classes = await Class.findById(req.params.cid).populate({
      path: "department",
      populate: {
        path: "holiday",
        match: {
          dDate: { $regex: regularexp },
        },
      },
    });

    res.status(200).send({ holiday: classes.department.holiday });
  } catch (e) {
    console.log(e);
  }
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


exports.getAttendStaffByIdForMonth = async (req, res) => {
  try {
    const month = req.query.month;
    const year = req.query.year;
    let absentCount = 0;
    let regularexp = "";
    if (month) regularexp = new RegExp(`\/${month}\/${year}$`);

    const staff = await Staff.findById(req.params.sid)
      .select("_id attendDates")
      .populate({
        path: "attendDates",
        match: {
          staffAttendDate: { $regex: regularexp },
        },

        select: "staffAttendDate absentStaff",
      })
      .lean()
      .exec();

    if (staff) {
      if (staff.attendDates) {
        staff.attendDates.forEach((day) => {
          if (day.absentStaff?.includes(req.params.sid)) absentCount += 1;
        });
      }
      res.status(200).send({
        message: "Success",
        absentCount,
      });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch(e) {
    console.log(e)
  }
};