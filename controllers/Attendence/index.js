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
const Seating = require("../../models/Exam/seating");
const Exam = require("../../models/Exam");
const {
  getOnlyTime,
  // getOnlyTimeCompare,
} = require("../../Utilities/timeComparison");
const encryptionPayload = require("../../Utilities/Encrypt/payload");
const { notify_attendence_provider } = require("../../helper/dayTimer");
const Subject = require("../../models/Subject");
const moment = require("moment");
const ClassAttendanceTimeSlot = require("../../models/Timetable/ClassAttendanceTimeSlot");
const SubjectLectureDay = require("../../models/Timetable/SubjectLectureDay");
const {
  subject_attendance_json_to_excel,
} = require("../../Custom/JSONToExcel");
//THis is route with tested OF STUDENT
exports.viewClassStudent = async (req, res) => {
  const institute = await Student.findById(req.params.sid);
  // const instituteEncrypt = await encryptionPayload(institute);
  res.status(200).send({ institute });
};

const time_convertor = (data) => {
  let splt = data?.split(" ");
  let nt = splt?.[0]?.split(":");
  let hr = 0;
  let total_min = 0;
  if (splt?.[1] === "Pm" || splt?.[1] === "pm") {
    if (+nt?.[0] === 12) {
      hr = +nt?.[0];
    } else {
      hr = +nt?.[0] + 12;
    }
  } else {
    hr = +nt?.[0];
  }
  total_min = hr * 60 + +nt?.[1];
  return total_min;
};

// const
exports.addClassWeeklyTime = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const classes = await Class.findById(req.params.cid);
    let flag = false;
    let index = 0;
    for (let days of classes?.activeTimeDayWise) {
      if (days.day === req.body.day) {
        flag = true;
        break;
      }
      ++index;
    }
    if (flag) {
      classes.activeTimeDayWise[index].day = req.body?.day;
      classes.activeTimeDayWise[index].from = req.body?.from;
      classes.activeTimeDayWise[index].to = req.body?.to;
      classes.activeTimeDayWise[index].half = req.body?.half;
    } else {
      classes.activeTimeDayWise?.push(req.body);
    }
    await classes.save();
    res.status(200).send({
      message: "Day wise attendance time edited successfully",
      // activeTimeDayWise: classes.activeTimeDayWise,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    // console.log(e);
  }
};

exports.getClassWeeklyTime = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const classes = await Class.findById(req.params.cid)
      .select("activeTimeDayWise")
      .lean()
      .exec();
    const daysTime = {
      day: "",
      from: "",
      to: "",
      half: "",
    };
    for (let days of classes.activeTimeDayWise) {
      if (days.day === req.query.status) {
        daysTime.day = days.day;
        daysTime.from = days.from;
        daysTime.to = days.to;
        daysTime.half = days.half;
      }
    }
    // const daysEncrypt = await encryptionPayload(daysTime);
    res.status(200).send({
      message: "Day wise get attendance time edited successfully",
      daysTime,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    // console.log(e);
  }
};

exports.addClassDateWiseTime = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const classes = await Class.findById(req.params.cid);
    let flag = false;
    let index = 0;
    for (let days of classes?.activeTimeDateWise) {
      const serverDate = new Date(days.date);
      const clientDate = new Date(req.body.date);
      if (serverDate.getTime() === clientDate.getTime()) {
        // console.log("THis is message", serverDate, " + ", clientDate);
        flag = true;
        break;
      }
      ++index;
    }
    if (flag) {
      // classes.activeTimeDateWise[index].day = req.body?.day;
      classes.activeTimeDateWise[index].from = req.body?.from;
      classes.activeTimeDateWise[index].to = req.body?.to;
      classes.activeTimeDateWise[index].half = req.body?.half;
    } else {
      classes.activeTimeDateWise?.push(req.body);
    }
    await classes.save();
    res.status(200).send({
      message: "Date wise attendance time edited successfully",
      // activeTimeDateWise: classes.activeTimeDateWise,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    // console.log(e);
  }
};

exports.getClassDateWiseTime = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const classes = await Class.findById(req.params.cid)
      .select("activeTimeDateWise activeTimeDayWise")
      .lean()
      .exec();
    const daysTime = {
      day: "",
      from: "",
      to: "",
      half: "",
    };
    const clientDate = new Date(req.query.date);
    for (let days of classes.activeTimeDateWise) {
      const serverDate = new Date(days.date);
      if (serverDate.getTime() === clientDate.getTime()) {
        daysTime.day = days.day;
        daysTime.from = days.from;
        daysTime.to = days.to;
        daysTime.half = days.half;
      }
    }
    if (daysTime.day === "") {
      for (let days of classes.activeTimeDayWise) {
        if (days.day === req.query.status) {
          daysTime.day = days.day;
          daysTime.from = days.from;
          daysTime.to = days.to;
          daysTime.half = days.half;
        }
      }
    }
    // const dayEncrypt = await encryptionPayload(daysTime);
    res.status(200).send({
      message: "Day wise get attendance time edited successfully",
      daysTime,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    // console.log(e);
  }
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

  if (classes.attendenceDate?.length > 0) {
    const attend = classes.attendenceDate[0];
    const present = [];
    const absent = [];
    attend?.presentStudent?.forEach((st) => present.push(st.student));
    attend?.absentStudent?.forEach((st) => absent.push(st.student));
    res.status(200).send({
      classes: {
        _id: classes._id,
        attendenceDate: [
          {
            _id: attend?._id,
            presentTotal: attend?.presentTotal,
            absentTotal: attend?.absentTotal,
            presentStudent: present,
            absentStudent: absent,
            attendDate: attend?.attendDate,
          },
        ],
      },
    });
  } else {
    // const classEncrypt = await encryptionPayload(classes);
    res.status(200).send({ classes });
  }
};

exports.render_mark_attendence_query = async (cid, student_array) => {
  try {
    // const attendanceone = await AttendenceDate.findOne({
    //   className: { $eq: `${cid}` },
    //   attendDate: { $eq: `${req.body.date}` },
    // });
    // if(attendanceone){
    // }
    // else{
    //   const attendence = new AttendenceDate({});
    //   attendence.attendDate = req.body.date;
    //   attendence.className = classes._id;
    //   attendence.attendTime = new Date();
    // }
  } catch (e) {
    console.log(e);
  }
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
          "Today will be holiday Provided by department Admin or already marked attendance",
      });
    } else {
      const startDateClass = classes?.classStartDate?.split("/");
      const markDate = req.body.date?.split("/");
      const classyear = +markDate[2] > +startDateClass?.[2];
      const year = +markDate[2] === +startDateClass?.[2];
      const classmonth = +markDate[1] > +startDateClass?.[1];
      const month = +markDate[1] === +startDateClass?.[1];
      const day = +markDate[0] >= +startDateClass?.[0];
      const attendence = new AttendenceDate({});
      attendence.attendDate = req.body.date;
      attendence.className = classes._id;
      attendence.attendTime = new Date();
      await Promise.all([attendence.save(), classes.save()]);
      res
        .status(200)
        .send({ message: "Success", alreadyMark: attendence?._id });
      for (let i = 0; i < req.body.present.length; i++) {
        const student = await Student.findById({
          _id: `${req.body.present[i]}`,
        });
        student.attendDate.push(attendence._id);

        attendence.presentStudent.push({
          student: student._id,
          inTime: getOnlyTime(),
          // status: getOnlyTimeCompare(),
          status: "Present",
        });
        await student.save();
      }

      for (let i = 0; i < req.body.absent.length; i++) {
        const student = await Student.findById({
          _id: `${req.body.absent[i]}`,
        });
        let gettingDate = req.body.date?.split("/");
        let gettingDateMod = new Date(
          `${gettingDate[2]}/${gettingDate[1]}/${gettingDate[0]}`
        );
        let todayeDate = new Date();
        let todayeDateISO = todayeDate;
        let gettingDateISO = gettingDateMod;
        if (todayeDateISO.getDate() === gettingDateISO.getDate()) {
          const user = await User.findById({ _id: `${student.user}` });
          const notify = new StudentNotification({});
          notify.notifyContent = `you're absent ${notify_attendence_provider(
            req.body.date
          )}`;
          notify.notify_hi_content = `आप आज अनुपस्थित हैं |`;
          notify.notify_mr_content = `तुम्ही आज गैरहजर आहात.`;
          notify.notifySender = classes._id;
          notify.notifyReceiever = user._id;
          notify.notifyType = "Student";
          notify.notifyPublisher = student._id;
          notify.notifyCategory = "Student Absent";
          notify.notifyByClassPhoto = classes._id;
          user.activity_tab.push(notify._id);
          student.notification.push(notify._id);
          notify.notifyCategory = "Attendence";
          notify.redirectIndex = 3;
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
          await Promise.all([notify.save(), user.save()]);
        }
        student.attendDate.push(attendence._id);
        attendence.absentStudent.push({
          student: student._id,
          inTime: getOnlyTime(),
          status: "Absent",
        });
        await student.save();
      }
      classes.attendenceDate.push(attendence._id);
      attendence.presentTotal = req.body.present.length;
      attendence.absentTotal = req.body.absent.length;
      await Promise.all([attendence.save(), classes.save()]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.markAttendenceClassStudentUpdate = async (req, res) => {
  try {
    const { said } = req.params;
    const { flow } = req?.query;
    // const attendance = await AttendenceDate.findOne({
    //   _id: { $eq: `${said}` },
    //   attendDate: { $eq: `${req.body.date}` },
    //   attendence_type: `${flow}`,
    // });
    const attendance = await AttendenceDate.findById(said);
    if (!attendance) {
      res.status(200).send({
        message: "Attendance not Updated, first make a attendance",
      });
    } else {
      const studentAttendance = await AttendenceDate.findById(said);
      for (let i = 0; i < req.body.present?.length; i++) {
        let flag = false;
        for (let pre of studentAttendance.presentStudent) {
          if (String(pre.student) === req.body.present[i]) flag = true;
          else flag = false;
        }
        if (!flag) {
          studentAttendance.presentStudent?.push({
            student: req.body.present[i],
            inTime: getOnlyTime(),
            status: "Present",
          });
          let prevLength = studentAttendance.absentStudent.length;
          studentAttendance.absentStudent =
            studentAttendance.absentStudent?.filter(
              (abs) => String(abs.student) !== req.body.present[i]
            );
          let nextLength = studentAttendance.absentStudent.length;

          studentAttendance.presentTotal += 1;
          if (prevLength > nextLength) studentAttendance.absentTotal -= 1;
        }
      }
      for (let i = 0; i < req.body.absent.length; i++) {
        let flag = false;
        for (let abs of studentAttendance.absentStudent) {
          if (String(abs.student) === req.body.absent[i]) flag = true;
          else flag = false;
        }
        if (!flag) {
          studentAttendance.absentStudent?.push({
            student: req.body.absent[i],
            inTime: getOnlyTime(),
            status: "Absent",
          });
          let prevLength = studentAttendance.presentStudent.length;
          studentAttendance.presentStudent =
            studentAttendance.presentStudent?.filter(
              (pre) => String(pre.student) !== req.body.absent[i]
            );
          let nextLength = studentAttendance.presentStudent.length;
          if (prevLength > nextLength) studentAttendance.presentTotal -= 1;
          studentAttendance.absentTotal += 1;
        }
      }
      await studentAttendance.save();
      res.status(200).send({ message: "Updated attendance" });
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
          for (let per of day?.presentStudent) {
            if (String(per.student) === req.params.sid) {
              present += 1;
              presentArray.push(day.attendDate);
            }
          }
          for (let abs of day?.absentStudent) {
            if (String(abs.student) === req.params.sid) {
              absent += 1;
              absentArray.push(day.attendDate);
            }
          }
        });
        days = student.attendDate.length;
      }

      let presentPercentage = ((present * 100) / days).toFixed(2);
      let absentPercentage = ((absent * 100) / days).toFixed(2);
      // Add Another Encryption
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
  // const insQueryEncrypt = await encryptionPayload(institute);
  res.status(200).send({ institute });
};

exports.viewInstituteStaff = async (req, res) => {
  const institute = await Staff.findById(req.params.sid);
  // const insEncrypt = await encryptionPayload(institute);
  res.status(200).send({ institute });
};

exports.addDepartmentWeeklyTime = async (req, res) => {
  try {
    if (!req.params.did) throw "Please send Department id to perform task";
    const department = await Department.findById(req.params.did);
    let flag = false;
    let index = 0;
    for (let days of department?.activeTimeDayWise) {
      if (days.day === req.body.day) {
        flag = true;
        break;
      }
      ++index;
    }
    if (flag) {
      department.activeTimeDayWise[index].day = req.body?.day;
      department.activeTimeDayWise[index].from = req.body?.from;
      department.activeTimeDayWise[index].to = req.body?.to;
      department.activeTimeDayWise[index].half = req.body?.half;
    } else {
      department.activeTimeDayWise?.push(req.body);
    }
    await department.save();
    res.status(200).send({
      message: "Day wise attendance time edited successfully",
      // activeTimeDayWise: department.activeTimeDayWise,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.getDepartmentWeeklyTime = async (req, res) => {
  try {
    if (!req.params.did) throw "Please send Department id to perform task";
    const department = await Department.findById(req.params.did)
      .select("activeTimeDayWise")
      .lean()
      .exec();
    const daysTime = {
      day: "",
      from: "",
      to: "",
      half: "",
    };
    for (let days of department.activeTimeDayWise) {
      if (days.day === req.query.status) {
        daysTime.day = days.day;
        daysTime.from = days.from;
        daysTime.to = days.to;
        daysTime.half = days.half;
      }
    }
    // const dEncrypt = await encryptionPayload(daysTime);
    res.status(200).send({
      message: "Day wise get attendance time edited successfully",
      daysTime,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.addDepartmentDateWiseTime = async (req, res) => {
  try {
    if (!req.params.did) throw "Please send Department id to perform task";
    const department = await Department.findById(req.params.did);
    let flag = false;
    let index = 0;
    for (let days of department?.activeTimeDateWise) {
      const serverDate = new Date(days.date);
      const clientDate = new Date(req.body.date);
      if (serverDate.getTime() === clientDate.getTime()) {
        // console.log("THis is message", serverDate, " + ", clientDate);
        flag = true;
        break;
      }
      ++index;
    }
    if (flag) {
      // classes.activeTimeDateWise[index].day = req.body?.day;
      department.activeTimeDateWise[index].from = req.body?.from;
      department.activeTimeDateWise[index].to = req.body?.to;
      department.activeTimeDateWise[index].half = req.body?.half;
    } else {
      department.activeTimeDateWise?.push(req.body);
    }
    await department.save();
    res.status(200).send({
      message: "Date wise attendance time edited successfully",
      // activeTimeDateWise: classes.activeTimeDateWise,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.getDepartmentDateWiseTime = async (req, res) => {
  try {
    if (!req.params.did) throw "Please send Department id to perform task";
    const department = await Department.findById(req.params.did)
      .select("activeTimeDateWise activeTimeDayWise")
      .lean()
      .exec();
    const daysTime = {
      day: "",
      from: "",
      to: "",
      half: "",
    };
    const clientDate = new Date(req.query.date);
    for (let days of department.activeTimeDateWise) {
      const serverDate = new Date(days.date);
      if (serverDate.getTime() === clientDate.getTime()) {
        daysTime.day = days.day;
        daysTime.from = days.from;
        daysTime.to = days.to;
        daysTime.half = days.half;
      }
    }
    if (daysTime.day === "") {
      for (let days of department.activeTimeDayWise) {
        if (days.day === req.query.status) {
          daysTime.day = days.day;
          daysTime.from = days.from;
          daysTime.to = days.to;
          daysTime.half = days.half;
        }
      }
    }
    // const dateEncrypt = await encryptionPayload(daysTime);
    res.status(200).send({
      message: "Date wise get attendance time edited successfully",
      daysTime,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
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
      // var currentDate = new Date();
      // currentDate.setHours(currentDate.getHours() + 5);
      // currentDate.setMinutes(currentDate.getMinutes() + 30);
      // const currentDateLocalFormat = currentDate.toISOString().split("-");
      // const markDate = req.body.date?.split("/");
      // if (
      //   +markDate[0] === +currentDateLocalFormat[2].split("T")[0] &&
      //   +markDate[1] === +currentDateLocalFormat[1] &&
      //   +markDate[2] === +currentDateLocalFormat[0]
      // ) {
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
        // const notify = new StudentNotification({});
        // notify.notifyContent = `you're present ${notify_attendence_provider(
        //   req.body.date
        // )}`;
        // notify.notify_hi_content = `आप आज उपस्थित हैं |`;
        // notify.notify_mr_content = `तुम्ही आज हजर आहात.`;
        // notify.notifySender = id;
        // notify.notifyReceiever = staff.user._id;
        // notify.notifyType = "Staff";
        // notify.notifyPublisher = staff._id;
        // notify.notifyCategory = "Staff Present";
        // staff.user.activity_tab.push(notify._id);
        // notify.notifyByInsPhoto = id;
        staffAttendence.presentStaff.push({
          staff: staff._id,
          inTime: getOnlyTime(),
          status: "Present",
        });
        // notify.notifyCategory = "Attendence";
        // notify.redirectIndex = 3;
        //
        // invokeMemberTabNotification(
        //   "Staff Activity",
        //   notify,
        //   "Mark Attendence",
        //   staff.user._id,
        //   staff.user.deviceToken,
        //   "Staff",
        //   notify
        // );
        //
        await staff.save();
      }

      for (let i = 0; i < req.body.absent.length; i++) {
        const staff = await Staff.findById({
          _id: `${req.body.absent[i]}`,
        }).populate({
          path: "user",
          select: "_id uNotify userLegalName deviceToken activity_tab",
        });
        staff.attendDates.push(staffAttendence._id);
        staffAttendence.absentStaff.push({
          staff: staff._id,
          inTime: getOnlyTime(),
          status: "Present",
        });
        const notify = new StudentNotification({});
        notify.notifyContent = `you're absent ${notify_attendence_provider(
          req.body.date
        )}`;
        notify.notify_hi_content = `आप आज अनुपस्थित हैं |`;
        notify.notify_mr_content = `तुम्ही आज गैरहजर आहात.`;
        notify.notifySender = id;
        notify.notifyReceiever = staff.user._id;
        notify.notifyType = "Staff";
        notify.notifyPublisher = staff._id;
        staff.user.activity_tab.push(notify._id);
        notify.notifyByInsPhoto = id;
        notify.notifyCategory = "Staff Absent";
        notify.redirectIndex = 3;
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
        await Promise.all([staff.save(), notify.save(), staff.user.save()]);
      }
      institute.staffAttendance.push(staffAttendence._id);
      staffAttendence.presentTotal = req.body.present.length;
      staffAttendence.absentTotal = req.body.absent.length;
      await Promise.all([institute.save(), staffAttendence.save()]);
      res.status(201).send({ message: "Success" });
      // } else {
      //   res
      //     .status(200)
      //     .send({ message: "You can not mark attendance this date" });
      // }
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
    if (institute.staffAttendance?.length > 0) {
      const attend = institute.staffAttendance[0];
      const present = [];
      const absent = [];
      attend?.presentStaff?.forEach((st) => present.push(st.staff));
      attend?.absentStaff?.forEach((st) => absent.push(st.staff));
      res.status(200).send({
        message: "Success",
        institute: {
          _id: institute?._id,
          staffAttendance: [
            {
              _id: attend?._id,
              presentTotal: attend?.presentTotal,
              absentTotal: attend?.absentTotal,
              presentStaff: present,
              absentStaff: absent,
              staffAttendTime: attend?.staffAttendTime,
              staffAttendDate: attend?.staffAttendDate,
            },
          ],
        },
      });
    } else {
      // const insEncrypt = await encryptionPayload(institute);
      res.status(200).send({ message: "Success", institute });
      // res.status(403).send({ message: "Failure" });
    }
    if (!institute) {
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
      // var currentDate = new Date();
      // currentDate.setHours(currentDate.getHours() + 5);
      // currentDate.setMinutes(currentDate.getMinutes() + 30);
      // const currentDateLocalFormat = currentDate.toISOString().split("-");
      // const markDate = req.body.date?.split("/");
      // if (
      //   +markDate[0] === +currentDateLocalFormat[2].split("T")[0] &&
      //   +markDate[1] === +currentDateLocalFormat[1] &&
      //   +markDate[2] === +currentDateLocalFormat[0]
      // ) {
      const staffAttendence = await StaffAttendenceDate.findById(said);
      for (let i = 0; i < req.body.present?.length; i++) {
        let flag = false;
        for (let pre of staffAttendence.presentStaff) {
          if (String(pre.staff) === req.body.present[i]) flag = true;
          else flag = false;
        }
        if (!flag) {
          staffAttendence.presentStaff?.push({
            staff: req.body.present[i],
            inTime: getOnlyTime(),
            status: "Present",
          });
          let prevLength = staffAttendence.absentStaff.length;
          staffAttendence.absentStaff = staffAttendence.absentStaff?.filter(
            (abs) => String(abs.staff) !== req.body.present[i]
          );
          let nextLength = staffAttendence.absentStaff.length;

          staffAttendence.presentTotal += 1;
          if (prevLength > nextLength) staffAttendence.absentTotal -= 1;
        }
        // if (staffAttendence.presentStaff?.includes(req.body.present[i])) {
        // } else if (staffAttendence.absentStaff?.includes(req.body.present[i])) {
        //   staffAttendence.presentStaff?.push(req.body.present[i]);
        //   staffAttendence.absentStaff?.pull(req.body.present[i]);
        //   staffAttendence.presentTotal += 1;
        //   staffAttendence.absentTotal -= 1;
        // } else {
        //   if (req.body.present.includes(req.body.present[i])) {
        //     staffAttendence.presentStaff?.push(req.body.present[i]);
        //     staffAttendence.presentTotal += 1;
        //   } else if (req.body.absent.includes(req.body.absent[i])) {
        //     staffAttendence.absentStaff?.push(req.body.absent[i]);
        //     staffAttendence.absentTotal += 1;
        //   } else {
        //   }
        // }
      }
      for (let i = 0; i < req.body.absent?.length; i++) {
        let flag = false;
        for (let abs of staffAttendence.absentStaff) {
          if (String(abs.staff) === req.body.absent[i]) flag = true;
          else flag = false;
        }
        if (!flag) {
          staffAttendence.absentStaff?.push({
            staff: req.body.absent[i],
            inTime: getOnlyTime(),
            status: "Absent",
          });
          let prevLength = staffAttendence.presentStaff.length;
          staffAttendence.presentStaff = staffAttendence.presentStaff?.filter(
            (pre) => String(pre.staff) !== req.body.absent[i]
          );
          let nextLength = staffAttendence.presentStaff.length;
          if (prevLength > nextLength) staffAttendence.presentTotal -= 1;
          staffAttendence.absentTotal += 1;
        }
        // if (staffAttendence.absentStaff?.includes(req.body.absent[i])) {
        // } else if (staffAttendence.presentStaff?.includes(req.body.absent[i])) {
        //   staffAttendence.absentStaff?.push(req.body.absent[i]);
        //   staffAttendence.presentStaff?.pull(req.body.absent[i]);
        //   staffAttendence.presentTotal -= 1;
        //   staffAttendence.absentTotal += 1;
        // } else {
        // }
      }
      await staffAttendence.save();
      res.status(200).send({ message: "Updated attendance" });
      // } else {
      //   res
      //     .status(200)
      //     .send({ message: "You can not mark attendance this date" });
      // }
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
      })
      .lean()
      .exec();

    if (staff) {
      if (staff.attendDates) {
        staff.attendDates.forEach((day) => {
          for (let per of day?.presentStaff) {
            if (String(per.staff) === req.params.sid) {
              present += 1;
              presentArray.push(day.staffAttendDate);
            }
          }
          for (let abs of day?.absentStaff) {
            if (String(abs.staff) === req.params.sid) {
              absent += 1;
              absentArray.push(day.staffAttendDate);
            }
          }
          // if (day.presentStaff?.includes(req.params.sid)) {
          //   present += 1;
          //   presentArray.push(day.staffAttendDate);
          // } else if (day.absentStaff?.includes(req.params.sid)) {
          //   absent += 1;
          //   absentArray.push(day.staffAttendDate);
          // } else {
          // }
        });
        days = staff.attendDates.length;
      }

      let presentPercentage = ((present * 100) / days).toFixed(2);
      let absentPercentage = ((absent * 100) / days).toFixed(2);
      // Add Another Encryption
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

exports.getAttendStaffByIdForMonth = async (req, res) => {
  try {
    const month = req.query.month;
    const year = req.query.year;
    let absentCount = 0;
    let leaveCount = 0;
    let regularexp = "";
    if (month) regularexp = new RegExp(`\/${month}\/${year}$`);

    const staff = await Staff.findById(req.params.sid)
      .select("_id attendDates staffLeave")
      .populate({
        path: "attendDates",
        match: {
          staffAttendDate: { $regex: regularexp },
        },

        select: "staffAttendDate absentStaff",
      })
      .populate({
        path: "staffLeave",
        match: {
          date: { $regex: regularexp },
          status: { $eq: "Accepted" },
        },
        select: "date",
      })
      .lean()
      .exec();

    if (staff) {
      if (staff.attendDates) {
        staff.attendDates?.forEach((day) => {
          for (let abs of day?.absentStaff) {
            if (String(abs.staff) === req.params.sid) {
              absentCount += 1;
            }
          }
          // if (day.absentStaff?.includes(req.params.sid)) absentCount += 1;
        });
      }
      if (staff.staffLeave) {
        staff?.staffLeave?.forEach((leave) => {
          leaveCount = leaveCount + leave?.date?.length;
        });
      }
      // Add Another Encryption
      res.status(200).send({
        message: "Success",
        absentCount,
        leaveCount,
      });
    } else {
      res.status(200).send({ message: "Failure" });
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
      notify.notify_hi_content = `नई छुट्टी मार्के की गई | `;
      notify.notify_mr_content = `नवीन सुट्टी मार्क केली.`;
      notify.notifySender = depart._id;
      notify.notifyType = "Student";
      notify.notifyPublisher = student._id;
      notify.notifyReceiever = user._id;
      user.activity_tab.push(notify._id);
      notify.notifyByDepartPhoto = depart._id;
      notify.notifyCategory = "Holiday";
      notify.redirectIndex = 4;
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
    // const leaveEncrypt = await encryptionPayload(leave);
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
      // const departEncrypt = await encryptionPayload(depart);
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
    // const holidayEncrypt = await encryptionPayload(classes.department.holiday);
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

//student attendance by subject teacher/

exports.getSubjectStudentList = async (req, res) => {
  try {
    const { sid } = req.params;
    const subjects = await Subject.findById(sid).populate({
      path: "class",
      select: "ApproveStudent",
    });
    const currentDate = new Date();
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
    if (subjects.subjectOptional !== "Mandatory") {
      const mixter_student = await Student.find({
        _id: { $in: subjects.class.ApproveStudent ?? [] },
      })
        .populate({
          path: "leave",
          match: {
            date: { $in: [`${day}/${month}/${year}`] },
          },
          select: "date",
        })
        .populate({
          path: "user",
          select: "userLegalName username",
        })
        .select(
          "studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO leave user studentOptionalSubject student_prn_enroll_number"
        )
        .lean()
        .exec();
      var students = [];
      for (let u_student of mixter_student) {
        if (subjects?.optionalStudent?.includes(u_student?._id)) {
          students.push(u_student);
        }
        // if (u_student?.studentOptionalSubject?.includes(subjects?._id)) {
        //   students.push(u_student);
        // }
      }
      students.sort(function (st1, st2) {
        return parseInt(st1.studentROLLNO) - parseInt(st2.studentROLLNO);
      });
    } else {
      var mixter_student = await Student.find({
        _id: { $in: subjects.class.ApproveStudent ?? [] },
      })
        .populate({
          path: "leave",
          match: {
            date: { $in: [`${day}/${month}/${year}`] },
          },
          select: "date",
        })
        .populate({
          path: "user",
          select: "userLegalName username",
        })
        .select(
          "studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentBehaviour finalReportStatus studentGender studentGRNO studentOptionalSubject leave user student_prn_enroll_number"
        )
        .lean()
        .exec();
      var students = [];
      if (subjects?.optionalStudent?.length > 0) {
        for (let u_student of mixter_student) {
          // for (let ele of subjects?.optionalStudent) {
          if (subjects?.optionalStudent?.includes(u_student?._id)) {
            students.push(u_student);
          }
          // }
        }
      } else {
        students = mixter_student;
      }

      students.sort(function (st1, st2) {
        return parseInt(st1.studentROLLNO) - parseInt(st2.studentROLLNO);
      });

      // const cEncrypt = await encryptionPayload(students);
    }
    res.status(200).send({
      message: "Approve catalog with optional subject",
      students: students?.length ? students : [],
    });
  } catch (e) {
    console.log(e);
  }
};



exports.getAttendSubjectStudent = async (req, res) => {
  try {
    const prevDate = req.query.date;
    const which_day = req.query.status;
    const which_lecture = req.query.which_lecture;
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

    const subjects = await Subject.findById(req.params.sid)
      .populate({
        path: "attendance",
        match: {
          $and: [
            {
              attendDate: { $regex: regularexp },
            },
            {
              which_lecture: { $eq: `${which_lecture}` },
            },
          ],
        },
        select:
          "attendDate presentTotal absentTotal presentStudent absentStudent from to",
      })
      .populate({
        path: "class",
        populate: {
          path: "timetableDayWise",
          match: {
            day: { $eq: which_day },
          },
          select: "schedule.from schedule.to schedule.subject",
        },
        select: "timetableDayWise",
        // select: "timetableDayWise attendance_time_slot",
      })
      .select("_id")
      .lean()
      .exec();
    let obj = {
      // to: "09:30 Am",
      // from: "09:06 Am",
      to: subjects.attendance[0]?.to ?? "",
      from: subjects.attendance[0]?.from ?? "",
      is_mark: subjects.attendance[0]?._id ? true : false,
      already_slot_mark: false,
      subject: null,
      is_timetable: false,
      which_lecture: "",
    };
    // console.log(subjects?.class);
    if (!subjects.attendance[0]?._id) {
      const slot_based = await ClassAttendanceTimeSlot.findOne({
        $and: [
          {
            date: { $eq: prevDate },
          },
          {
            class: { $eq: `${subjects?.class?._id}` },
          },
        ],
      });

      if (slot_based?.slot?.length > 0) {
        for (let t_slot of slot_based?.slot) {
          if (
            !t_slot?.is_extra &&
            `${t_slot?.register_subject}` === `${req.params.sid}` &&
            `${t_slot.which_lecture}` === `${which_lecture}`
          ) {
            obj.to = t_slot.to;
            obj.from = t_slot.from;
            obj.is_mark = t_slot.is_mark;
            obj.which_lecture = t_slot?.which_lecture;
            break;
          }
        }
      }
      // here start for time table
      if (!obj?.to && !obj?.from) {
        for (let time_table of subjects?.class?.timetableDayWise?.[0]
          ?.schedule ?? []) {
          if (`${time_table?.subject}` === `${req.params.sid}`) {
            obj.to = time_table.to;
            obj.from = time_table.from;
            obj.is_timetable = true;
            break;
          }
        }
      }
    }

    if (subjects.attendance?.length > 0) {
      const attend = subjects.attendance[0];
      const present = [];
      const absent = [];
      attend?.presentStudent?.forEach((st) => present.push(st.student));
      attend?.absentStudent?.forEach((st) => absent.push(st.student));
      res.status(200).send({
        subjects: {
          _id: subjects._id,
          time_slot: obj,
          attendance: [
            {
              _id: attend?._id,
              presentTotal: attend?.presentTotal,
              absentTotal: attend?.absentTotal,
              presentStudent: present,
              absentStudent: absent,
              attendDate: attend?.attendDate,
            },
          ],
        },
      });
    } else {
      // const classEncrypt = await encryptionPayload(subjects);
      res.status(200).send({
        subjects: {
          _id: subjects._id,
          time_slot: obj,
          attendance: [],
          // slot: subjects?.class?.attendance_time_slot,
        },
      });
    }
  } catch (e) {
    console.log(e);
  }
};




exports.getAttendSubjectStudentExtraQuery = async (req, res) => {
  try {
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

    var subjects = await Subject.findById(req.params.sid);

    var all_attendence = await AttendenceDate.find({
      $and: [
        { subject: subjects?._id },
        { attendDate: { $regex: regularexp } },
        { attendence_type: "Extra_Lecture" },
      ],
    }).select(
      "attendDate presentTotal absentTotal presentStudent absentStudent"
    );

    if (all_attendence?.length > 0) {
      res.status(200).send({
        message: "Explore Extra Lecture Attendence Query",
        all_attendence: all_attendence,
        access: true,
      });
    } else {
      // const classEncrypt = await encryptionPayload(subjects);
      res.status(200).send({
        message: "No Extra Lecture Query",
        access: false,
        all_attendence: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAttendSubjectStudentExtraOneQuery = async (req, res) => {
  try {
    const { sid, aid } = req?.params;
    const subjects = await Subject.findById({ _id: sid }).populate({
      path: "class",
      select: "attendance_time_slot",
    });
    const attend = await AttendenceDate.findById({ _id: aid }).select(
      "attendDate presentTotal absentTotal presentStudent absentStudent attendence_name to from"
    );
    const present = [];
    const absent = [];
    let obj = {
      to: attend?.to ?? "",
      from: attend?.from ?? "",
      is_mark: true,
      already_slot_mark: false,
      is_timetable: false,
    };
    attend?.presentStudent?.forEach((st) => present.push(st.student));
    attend?.absentStudent?.forEach((st) => absent.push(st.student));
    res.status(200).send({
      subjects: {
        _id: subjects._id,
        time_slot: obj,
        attendance: [
          {
            _id: attend?._id,
            presentTotal: attend?.presentTotal,
            absentTotal: attend?.absentTotal,
            presentStudent: present,
            absentStudent: absent,
            attendDate: attend?.attendDate,
          },
        ],
      },
    });
  } catch (e) {
    console.log(e);
  }
};


// exports.markAttendenceSubjectStudent = async (req, res) => {
//   try {
//     const { sid } = req.params;
//     const { flow, from, to } = req?.query;
//     const subjects = await Subject.findById({ _id: sid }).populate({
//       path: "class",
//       select: "department masterClassName",
//       populate: {
//         path: "masterClassName",
//         select: "className",
//       },
//     });
//     const dLeave = await Holiday.findOne({
//       department: { $eq: `${subjects.class.department}` },
//       dDate: { $eq: `${req.body.date}` },
//     });
//     const attendanceone = await AttendenceDate.findOne({
//       subject: { $eq: `${sid}` },
//       attendDate: { $eq: `${req.body.date}` },
//     });
//     if (flow === "Normal_Lecture") {
//       if (dLeave || attendanceone) {
//         res.status(200).send({
//           message:
//             "Today will be holiday Provided by department Admin or already marked attendance",
//         });
//       } else {
//         const attendence = new AttendenceDate({});
//         attendence.attendDate = req.body.date;
//         attendence.subject = subjects._id;
//         attendence.attendTime = new Date();
//         if (from) {
//           attendence.from = from;
//         }
//         if (to) {
//           attendence.to = to;
//         }
//         await Promise.all([attendence.save(), subjects.save()]);
//         res
//           .status(200)
//           .send({ message: "Success", alreadyMark: attendence?._id });
//         for (let i = 0; i < req.body.present.length; i++) {
//           const student = await Student.findById({
//             _id: `${req.body.present[i]}`,
//           });
//           // const user = await User.findById({ _id: `${student.user}` });
//           // const notify = new StudentNotification({});
//           // notify.notifyContent = `you're present ${notify_attendence_provider(
//           //   req.body.date
//           // )}`;
//           // notify.notify_hi_content = `आप आज उपस्थित हैं |`;
//           // notify.notify_mr_content = `तुम्ही आज हजर आहात.`;
//           // notify.notifySender = subjects._id;
//           // notify.notifyReceiever = user._id;
//           // notify.notifyType = "Student";
//           // notify.notifyPublisher = student._id;
//           // notify.notifyBySubjectPhoto.subject_id = subjects?._id;
//           // notify.notifyBySubjectPhoto.subject_name = subjects.subjectName;
//           // notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
//           // notify.notifyBySubjectPhoto.subject_title = subjects.subjectTitle;
//           // notify.notifyCategory = "Student Present";
//           // user.activity_tab.push(notify._id);
//           // student.notification.push(notify._id);
//           student.subjectAttendance.push(attendence._id);

//           attendence.presentStudent.push({
//             student: student._id,
//             inTime: getOnlyTime(),
//             // status: getOnlyTimeCompare(),
//             status: "Present",
//           });
//           // notify.notifyCategory = "Attendence";
//           // notify.redirectIndex = 3;
//           //
//           // invokeMemberTabNotification(
//           //   "Student Activity",
//           //   notify,
//           //   "Mark Attendence",
//           //   user._id,
//           //   user.deviceToken,
//           //   "Student",
//           //   notify
//           // );
//           //
//           // await Promise.all([student.save(), notify.save(), user.save()]);
//           await student.save();
//         }

//         for (let i = 0; i < req.body.absent.length; i++) {
//           const student = await Student.findById({
//             _id: `${req.body.absent[i]}`,
//           });
//           let gettingDate = req.body.date?.split("/");
//           let gettingDateMod = new Date(
//             `${gettingDate[2]}/${gettingDate[1]}/${gettingDate[0]}`
//           );
//           let todayeDate = new Date();
//           let todayeDateISO = todayeDate;
//           let gettingDateISO = gettingDateMod;
//           if (todayeDateISO.getDate() === gettingDateISO.getDate()) {
//             const user = await User.findById({ _id: `${student.user}` });
//             const notify = new StudentNotification({});
//             notify.notifyContent = `you're absent ${notify_attendence_provider(
//               req.body.date
//             )}`;
//             notify.notify_hi_content = `आप आज अनुपस्थित हैं |`;
//             notify.notify_mr_content = `तुम्ही आज गैरहजर आहात.`;
//             notify.notifySender = subjects._id;
//             notify.notifyReceiever = user._id;
//             notify.notifyType = "Student";
//             notify.notifyPublisher = student._id;
//             notify.notifyCategory = "Student Absent";
//             notify.notifyBySubjectPhoto.subject_id = subjects?._id;
//             notify.notifyBySubjectPhoto.subject_name = subjects.subjectName;
//             notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
//             notify.notifyBySubjectPhoto.subject_title = subjects.subjectTitle;
//             user.activity_tab.push(notify._id);
//             student.notification.push(notify._id);
//             notify.notifyCategory = "Attendence";
//             notify.redirectIndex = 3;
//             //
//             // invokeMemberTabNotification(
//             //   "Student Activity",
//             //   notify,
//             //   "Mark Attendence",
//             //   user._id,
//             //   user.deviceToken,
//             //   "Student",
//             //   notify
//             // );
//             //
//             await Promise.all([notify.save(), user.save()]);
//           }
//           student.subjectAttendance.push(attendence._id);
//           attendence.absentStudent.push({
//             student: student._id,
//             inTime: getOnlyTime(),
//             status: "Absent",
//           });
//           await student.save();
//         }
//         subjects.attendance.push(attendence._id);
//         attendence.presentTotal = req.body.present.length;
//         attendence.absentTotal = req.body.absent.length;
//         await Promise.all([attendence.save(), subjects.save()]);
//       }
//     } else if (flow === "Extra_Lecture") {
//       const attendence = new AttendenceDate({});
//       attendence.attendDate = req.body.date;
//       attendence.subject = subjects._id;
//       if (from) {
//         attendence.from = from;
//       }
//       if (to) {
//         attendence.to = to;
//       }
//       attendence.attendence_type = "Extra_Lecture";
//       attendence.attendence_name = `${subjects.class.masterClassName?.className}-${subjects?.subjectName}-ExtraLecture-${req.body.date}`;
//       attendence.attendTime = new Date();
//       await Promise.all([attendence.save(), subjects.save()]);
//       res
//         .status(200)
//         .send({ message: "Success", alreadyMark: attendence?._id });
//       for (let i = 0; i < req.body.present.length; i++) {
//         const student = await Student.findById({
//           _id: `${req.body.present[i]}`,
//         });
//         // const user = await User.findById({ _id: `${student.user}` });
//         // const notify = new StudentNotification({});
//         // notify.notifyContent = `you're present ${notify_attendence_provider(
//         //   req.body.date
//         // )}`;
//         // notify.notify_hi_content = `आप आज उपस्थित हैं |`;
//         // notify.notify_mr_content = `तुम्ही आज हजर आहात.`;
//         // notify.notifySender = subjects._id;
//         // notify.notifyReceiever = user._id;
//         // notify.notifyType = "Student";
//         // notify.notifyPublisher = student._id;
//         // notify.notifyBySubjectPhoto.subject_id = subjects?._id;
//         // notify.notifyBySubjectPhoto.subject_name = subjects.subjectName;
//         // notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
//         // notify.notifyBySubjectPhoto.subject_title = subjects.subjectTitle;
//         // notify.notifyCategory = "Student Present";
//         // user.activity_tab.push(notify._id);
//         // student.notification.push(notify._id);
//         student.subjectAttendance.push(attendence._id);

//         attendence.presentStudent.push({
//           student: student._id,
//           inTime: getOnlyTime(),
//           // status: getOnlyTimeCompare(),
//           status: "Present",
//         });
//         // notify.notifyCategory = "Attendence";
//         // notify.redirectIndex = 3;
//         //
//         // invokeMemberTabNotification(
//         //   "Student Activity",
//         //   notify,
//         //   "Mark Attendence",
//         //   user._id,
//         //   user.deviceToken,
//         //   "Student",
//         //   notify
//         // );
//         //
//         // await Promise.all([student.save(), notify.save(), user.save()]);
//         await student.save();
//       }

//       for (let i = 0; i < req.body.absent.length; i++) {
//         const student = await Student.findById({
//           _id: `${req.body.absent[i]}`,
//         });
//         let gettingDate = req.body.date?.split("/");
//         let gettingDateMod = new Date(
//           `${gettingDate[2]}/${gettingDate[1]}/${gettingDate[0]}`
//         );
//         let todayeDate = new Date();
//         let todayeDateISO = todayeDate;
//         let gettingDateISO = gettingDateMod;
//         if (todayeDateISO.getDate() === gettingDateISO.getDate()) {
//           const user = await User.findById({ _id: `${student.user}` });
//           const notify = new StudentNotification({});
//           notify.notifyContent = `you're absent ${notify_attendence_provider(
//             req.body.date
//           )}`;
//           notify.notify_hi_content = `आप आज अनुपस्थित हैं |`;
//           notify.notify_mr_content = `तुम्ही आज गैरहजर आहात.`;
//           notify.notifySender = subjects._id;
//           notify.notifyReceiever = user._id;
//           notify.notifyType = "Student";
//           notify.notifyPublisher = student._id;
//           notify.notifyCategory = "Student Absent";
//           notify.notifyBySubjectPhoto.subject_id = subjects?._id;
//           notify.notifyBySubjectPhoto.subject_name = subjects.subjectName;
//           notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
//           notify.notifyBySubjectPhoto.subject_title = subjects.subjectTitle;
//           user.activity_tab.push(notify._id);
//           student.notification.push(notify._id);
//           notify.notifyCategory = "Attendence";
//           notify.redirectIndex = 3;
//           //
//           // invokeMemberTabNotification(
//           //   "Student Activity",
//           //   notify,
//           //   "Mark Attendence",
//           //   user._id,
//           //   user.deviceToken,
//           //   "Student",
//           //   notify
//           // );
//           //
//           await Promise.all([notify.save(), user.save()]);
//         }
//         student.subjectAttendance.push(attendence._id);
//         attendence.absentStudent.push({
//           student: student._id,
//           inTime: getOnlyTime(),
//           status: "Absent",
//         });
//         await student.save();
//       }
//       subjects.attendance.push(attendence._id);
//       attendence.presentTotal = req.body.present.length;
//       attendence.absentTotal = req.body.absent.length;
//       await Promise.all([attendence.save(), subjects.save()]);
//       const time_table = await ClassTimetable.findOne({
//         $and: [{ class: `${subjects?.class?._id}` }, { date: { $eq: date } }],
//       });
//       time_table?.schedule?.filter((val) => {
//         val.from = from;
//         val.to = to;
//       });
//       await time_table.save();
//     } else {
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };



































exports.markAttendenceSubjectStudent = async (req, res) => {
  try {
    const { sid } = req.params;
    const { from, to, present, absent, which_lecture } = req.body;
    var from_minutes = time_convertor(from);
    var to_minutes = time_convertor(to);
    var body_student = [];
    if (present?.length > 0) body_student = [...body_student, ...present];
    if (absent?.length > 0) body_student = [...body_student, ...absent];
    const { flow } = req?.query;
    const subjects = await Subject.findById({ _id: sid }).populate({
      path: "class",
      select: "department attendance_time_slot",
    });
    const attendanceone = await AttendenceDate.findOne({
      subject: { $eq: `${sid}` },
      attendDate: { $eq: `${req.body.date}` },
      which_lecture: { $eq: `${which_lecture}` },
    });
    var subject_taken = null;
    if (flow === "Normal_Lecture") {
      const slot_based = await ClassAttendanceTimeSlot.findOne({
        $and: [
          {
            date: { $eq: req.body.date },
          },
          {
            class: { $eq: `${subjects?.class?._id}` },
          },
        ],
      });
      let flag = false;
      if (slot_based?.slot?.length > 0) {
        for (let t_slot of slot_based?.slot) {
          if (!t_slot.is_mark) {
          } else {
            let slot_to = +t_slot?.to_minutes - 5;
            let come_to_minutes = +to_minutes - 5;
            if (from_minutes >= slot_to) {
            } else if (come_to_minutes <= +t_slot?.from_minutes) {
            } else {
              if (subjects?.selected_batch_query) {
                if (t_slot?.student?.length > 0) {
                  for (let gt of t_slot?.student) {
                    if (body_student?.includes(`${gt}`)) {
                      subject_taken = await Subject.findById({
                        _id: t_slot?.register_subject,
                      })
                        .populate({
                          path: "subjectTeacherName",
                          select:
                            "staffFirstName staffLastName staffMiddleName",
                        })
                        .select("subjectName subjectTeacherName")
                        .lean()
                        .exec();
                      flag = true;
                      break;
                    }
                  }
                }
              } else {
                subject_taken = await Subject.findById({
                  _id: t_slot?.register_subject,
                })
                  .populate({
                    path: "subjectTeacherName",
                    select: "staffFirstName staffLastName staffMiddleName",
                  })
                  .select("subjectName subjectTeacherName")
                  .lean()
                  .exec();
                flag = true;
                break;
              }
            }
          }
        }
      }
      if (attendanceone || flag) {
        res.status(200).send({
          already_slot_mark: flag,
          subject: subject_taken,
          message:
            "Today will be holiday Provided by department Admin or already marked attendance",
        });
      } else {
        const attendence = new AttendenceDate({});
        attendence.attendDate = req.body.date;
        attendence.subject = subjects._id;
        attendence.attendTime = new Date();
        attendence.from = from;
        attendence.to = to;
        attendence.which_lecture = which_lecture;

        for (let t_slot of slot_based?.slot) {
          if (
            !t_slot.is_extra &&
            `${sid}` === `${t_slot.register_subject}` &&
            `${t_slot.which_lecture}` === `${which_lecture}`
          ) {
            t_slot.is_mark = true;
            t_slot.student = body_student;
            break;
          }
        }
        await Promise.all([
          slot_based.save(),
          attendence.save(),
          subjects.save(),
          subjects.class.save(),
        ]);
        res
          .status(200)
          .send({ message: "Success", alreadyMark: attendence?._id });
        for (let i = 0; i < req.body.present.length; i++) {
          const student = await Student.findById({
            _id: `${req.body.present[i]}`,
          });
          student.subjectAttendance.push(attendence._id);
          attendence.presentStudent.push({
            student: student._id,
            inTime: getOnlyTime(),
            status: "Present",
          });
          await student.save();
        }

        for (let i = 0; i < req.body.absent.length; i++) {
          const student = await Student.findById({
            _id: `${req.body.absent[i]}`,
          });
          let gettingDate = req.body.date?.split("/");
          let gettingDateMod = new Date(
            `${gettingDate[2]}/${gettingDate[1]}/${gettingDate[0]}`
          );
          let todayeDate = new Date();
          if (todayeDate.getDate() === gettingDateMod.getDate()) {
            const user = await User.findById({ _id: `${student.user}` });
            const notify = new StudentNotification({});
            notify.notifyContent = `you're absent ${notify_attendence_provider(
              req.body.date
            )}`;
            notify.notify_hi_content = `आप आज अनुपस्थित हैं |`;
            notify.notify_mr_content = `तुम्ही आज गैरहजर आहात.`;
            notify.notifySender = subjects._id;
            notify.notifyReceiever = user._id;
            notify.notifyType = "Student";
            notify.notifyPublisher = student._id;
            notify.notifyCategory = "Student Absent";
            notify.notifyBySubjectPhoto.subject_id = subjects?._id;
            notify.notifyBySubjectPhoto.subject_name = subjects.subjectName;
            notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
            notify.notifyBySubjectPhoto.subject_title = subjects.subjectTitle;
            user.activity_tab.push(notify._id);
            student.notification.push(notify._id);
            notify.notifyCategory = "Attendence";
            notify.redirectIndex = 3;
            //
            // invokeMemberTabNotification(
            //   "Student Activity",
            //   notify,
            //   "Mark Attendence",
            //   user._id,
            //   user.deviceToken,
            //   "Student",
            //   notify
            // );
            //
            await Promise.all([notify.save(), user.save()]);
          }
          student.subjectAttendance.push(attendence._id);
          attendence.absentStudent.push({
            student: student._id,
            inTime: getOnlyTime(),
            status: "Absent",
          });

          await student.save();
        }
        subjects.attendance.push(attendence._id);
        attendence.presentTotal = req.body.present.length;
        attendence.absentTotal = req.body.absent.length;
        await Promise.all([attendence.save(), subjects.save()]);
      }
    } else if (flow === "Extra_Lecture") {
      const slot_based = await ClassAttendanceTimeSlot.findOne({
        $and: [
          {
            date: { $eq: req.body.date },
          },
          {
            class: { $eq: `${subjects?.class?._id}` },
          },
        ],
      });
      let flag = false;

      if (slot_based?.slot?.length > 0) {
        for (let t_slot of slot_based?.slot) {
          if (!t_slot.is_mark) {
          } else {
            let slot_to = +t_slot?.to_minutes - 5;
            let come_to_minutes = +to_minutes - 5;
            if (from_minutes >= slot_to) {
            } else if (come_to_minutes <= +t_slot?.from_minutes) {
            } else {
              if (subjects?.selected_batch_query) {
                if (t_slot?.student?.length > 0) {
                  for (let gt of t_slot?.student) {
                    if (body_student?.includes(`${gt}`)) {
                      subject_taken = await Subject.findById({
                        _id: t_slot?.register_subject,
                      })
                        .populate({
                          path: "subjectTeacherName",
                          select:
                            "staffFirstName staffLastName staffMiddleName",
                        })
                        .select("subjectName subjectTeacherName")
                        .lean()
                        .exec();
                      flag = true;
                      break;
                    }
                  }
                }
              } else {
                subject_taken = await Subject.findById({
                  _id: t_slot?.register_subject,
                })
                  .populate({
                    path: "subjectTeacherName",
                    select: "staffFirstName staffLastName staffMiddleName",
                  })
                  .select("subjectName subjectTeacherName")
                  .lean()
                  .exec();
                flag = true;
                break;
              }
            }
          }
        }
      }

      if (flag) {
        res.status(200).send({
          already_slot_mark: flag,
          subject: subject_taken,
          message: "Already marked attendance for this time slot",
        });
      }
      const attendence = new AttendenceDate({});
      attendence.attendDate = req.body.date;
      attendence.subject = subjects._id;
      attendence.from = from;
      attendence.to = to;
      attendence.attendence_type = "Extra_Lecture";
      attendence.attendence_name = `${subjects.class.masterClassName?.className}-${subjects?.subjectName}-ExtraLecture-${req.body.date}`;
      attendence.attendTime = new Date();
      // attendence.which_lecture = which_lecture;

      for (let t_slot of slot_based?.slot) {
        if (
          t_slot.is_extra &&
          `${sid}` === `${t_slot.register_subject}` &&
          `${which_lecture}` === `${t_slot.which_extra_lecture}`
        ) {
          t_slot.is_mark = true;
          t_slot.student = body_student;
          break;
        }
      }
      await Promise.all([
        slot_based.save(),
        attendence.save(),
        subjects.save(),
        subjects.class.save(),
      ]);
      res
        .status(200)
        .send({ message: "Success", alreadyMark: attendence?._id });
      for (let i = 0; i < req.body.present.length; i++) {
        const student = await Student.findById({
          _id: `${req.body.present[i]}`,
        });
        student.subjectAttendance.push(attendence._id);
        attendence.presentStudent.push({
          student: student._id,
          inTime: getOnlyTime(),
          status: "Present",
        });
        await student.save();
      }

      for (let i = 0; i < req.body.absent.length; i++) {
        const student = await Student.findById({
          _id: `${req.body.absent[i]}`,
        });
        let gettingDate = req.body.date?.split("/");
        let gettingDateMod = new Date(
          `${gettingDate[2]}/${gettingDate[1]}/${gettingDate[0]}`
        );
        let todayeDate = new Date();
        let todayeDateISO = todayeDate;
        let gettingDateISO = gettingDateMod;
        if (todayeDateISO.getDate() === gettingDateISO.getDate()) {
          const user = await User.findById({ _id: `${student.user}` });
          const notify = new StudentNotification({});
          notify.notifyContent = `you're absent ${notify_attendence_provider(
            req.body.date
          )}`;
          notify.notify_hi_content = `आप आज अनुपस्थित हैं |`;
          notify.notify_mr_content = `तुम्ही आज गैरहजर आहात.`;
          notify.notifySender = subjects._id;
          notify.notifyReceiever = user._id;
          notify.notifyType = "Student";
          notify.notifyPublisher = student._id;
          notify.notifyCategory = "Student Absent";
          notify.notifyBySubjectPhoto.subject_id = subjects?._id;
          notify.notifyBySubjectPhoto.subject_name = subjects.subjectName;
          notify.notifyBySubjectPhoto.subject_cover = "subject-cover.png";
          notify.notifyBySubjectPhoto.subject_title = subjects.subjectTitle;
          user.activity_tab.push(notify._id);
          student.notification.push(notify._id);
          notify.notifyCategory = "Attendence";
          notify.redirectIndex = 3;
          //
          // invokeMemberTabNotification(
          //   "Student Activity",
          //   notify,
          //   "Mark Attendence",
          //   user._id,
          //   user.deviceToken,
          //   "Student",
          //   notify
          // );
          //
          await Promise.all([notify.save(), user.save()]);
        }
        student.subjectAttendance.push(attendence._id);
        attendence.absentStudent.push({
          student: student._id,
          inTime: getOnlyTime(),
          status: "Absent",
        });
        await student.save();
      }
      subjects.attendance.push(attendence._id);
      attendence.presentTotal = req.body.present.length;
      attendence.absentTotal = req.body.absent.length;
      await Promise.all([attendence.save(), subjects.save()]);
    } else {
    }
  } catch (e) {
    console.log(e);
  }
};





exports.markAttendenceSubjectStudentUpdate = async (req, res) => {
  try {
    const { said } = req.params;
    const { flow } = req?.query;
    const attendance = await AttendenceDate.findOne({
      _id: { $eq: `${said}` },
      attendDate: { $eq: `${req.body.date}` },
      attendence_type: `${flow}`,
    });
    if (!attendance) {
      res.status(200).send({
        message: "Attendance not Updated, first make a attendance",
      });
    } else {
      const studentAttendance = await AttendenceDate.findById(said);
      for (let i = 0; i < req.body.present?.length; i++) {
        let flag = false;
        for (let pre of studentAttendance.presentStudent) {
          if (String(pre.student) === req.body.present[i]) flag = true;
          else flag = false;
        }
        if (!flag) {
          studentAttendance.presentStudent?.push({
            student: req.body.present[i],
            inTime: getOnlyTime(),
            status: "Present",
          });
          let prevLength = studentAttendance.absentStudent.length;
          studentAttendance.absentStudent =
            studentAttendance.absentStudent?.filter(
              (abs) => String(abs.student) !== req.body.present[i]
            );
          let nextLength = studentAttendance.absentStudent.length;

          studentAttendance.presentTotal += 1;
          if (prevLength > nextLength) studentAttendance.absentTotal -= 1;
        }
      }
      for (let i = 0; i < req.body.absent.length; i++) {
        let flag = false;
        for (let abs of studentAttendance.absentStudent) {
          if (String(abs.student) === req.body.absent[i]) flag = true;
          else flag = false;
        }
        if (!flag) {
          studentAttendance.absentStudent?.push({
            student: req.body.absent[i],
            inTime: getOnlyTime(),
            status: "Absent",
          });
          let prevLength = studentAttendance.presentStudent.length;
          studentAttendance.presentStudent =
            studentAttendance.presentStudent?.filter(
              (pre) => String(pre.student) !== req.body.absent[i]
            );
          let nextLength = studentAttendance.presentStudent.length;
          if (prevLength > nextLength) studentAttendance.presentTotal -= 1;
          studentAttendance.absentTotal += 1;
        }
      }
      await studentAttendance.save();
      res.status(200).send({ message: "Updated attendance" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getSubjectAttendStudentById = async (req, res) => {
  try {
    const month = req.query.month;
    const year = req.query.year;
    const subjectId = req.query.subjectId;
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
      .select("_id subjectAttendance leave")
      .populate({
        path: "subjectAttendance",
        match: {
          $and: [
            {
              attendDate: { $regex: regularexp },
            },
            {
              subject: { $eq: `${subjectId}` },
            },
          ],
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
      if (student.subjectAttendance) {
        student.subjectAttendance.forEach((day) => {
          for (let per of day?.presentStudent) {
            if (String(per.student) === req.params.sid) {
              present += 1;
              presentArray.push(day.attendDate);
            }
          }
          for (let abs of day?.absentStudent) {
            if (String(abs.student) === req.params.sid) {
              absent += 1;
              absentArray.push(day.attendDate);
            }
          }
        });
        days = student.subjectAttendance.length;
      }

      let presentPercentage = ((present * 100) / days).toFixed(2);
      let absentPercentage = ((absent * 100) / days).toFixed(2);
      // Add Another Encryption
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

exports.getAllSubjectOfStudent = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug regarding to call api",
        access: false,
      });

    const student = await Student.findById(sid).populate({
      path: "studentClass",
      select: "subject",
      populate: {
        path: "subject",
        select:
          "subjectOptional subjectName subjectTeacherName subject_category",
        populate: {
          path: "subjectTeacherName selected_batch_query",
          select:
            "staffFirstName staffMiddleName staffLastName batchName batchStatus",
        },
      },
    });

    let subjects = [];
    for (let sub of student?.studentClass?.subject) {
      if (sub.subjectOptional !== "Mandatory") {
        if (student?.studentOptionalSubject?.includes(sub?._id))
          subjects.push(sub);
      } else subjects.push(sub);
    }
    return res.status(200).send({
      message: "All subject list of student side",
      subjects,
      access: false,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllClassExportAttendance = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug regarding to call api",
        access: false,
      });
    const month = req.query.month;
    const year = req.query.year;
    const { is_type } = req.query;
    const { startRange, endRange } = req.body;
    let regularexp = "";
    var attendaceMappingDate = [];
    if (is_type === "RANGE") {
      let range1 = startRange;
      let range2 = endRange;

      var classes = await Class.findById(cid)
        .populate({
          path: "ApproveStudent",
          select:
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender leave studentGRNO",
          populate: {
            path: "leave",
            match: {
              // date: {
              //   $and: [
              //     {
              //       $gte: range1,
              //     },
              //     {
              //       $lte: range2,
              //     },
              //   ],
              // },
              status: { $eq: "Accepted" },
            },
            select: "date",
          },
        })
        .populate({
          path: "attendenceDate",
          // match: {
          //   attendDate: {
          //     $and: [
          //       {
          //         $gte: range1,
          //       },
          //       {
          //         $lte: range2,
          //       },
          //     ],
          //   },
          // },
          select: "attendDate presentStudent.student absentStudent.student",
        })
        .lean()
        .exec();

      let students = [];
      let range_attendance = [];
      for (let att of classes?.attendenceDate) {
        if (att.attendDate >= range1 && att.attendDate <= range2) {
          range_attendance.push(att);
        }
      }
      for (let stu of classes?.ApproveStudent) {
        let obj = {
          ...stu,
          availablity: [],
        };
        for (let att of range_attendance) {
          let statusObj = {
            date: att.attendDate,
            status: "",
          };
          for (let pre of att?.presentStudent) {
            if (String(stu._id) === String(pre.student)) statusObj.status = "P";
          }
          for (let abs of att?.absentStudent) {
            if (String(stu._id) === String(abs.student)) statusObj.status = "A";
          }
          obj.availablity.push(statusObj);
        }
        students.push(obj);
      }
      // console.log(classes);
      return res.status(200).send({
        message: "All student zip attendance with ranged based",
        attendance_zip: students,
        access: false,
      });
    } else if (is_type === "ALL") {
      var classes = await Class.findById(cid)
        .populate({
          path: "ApproveStudent",
          select:
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO student_prn_enroll_number",
        })
        .populate({
          path: "attendenceDate",
          select: "attendDate presentStudent.student absentStudent.student",
        })
        .populate({
          path: "subject",
          populate: {
            path: "selected_batch_query",
          },
        })
        .lean()
        .exec();
      let mapSubject = [];
      for (let sub of classes?.subject) {
        mapSubject.push({
          subjectName: `${sub?.subjectName} ${
            sub?.subject_category ? `(${sub?.subject_category})` : ""
          } ${
            sub?.selected_batch_query?.batchName
              ? `(${sub?.selected_batch_query?.batchName})`
              : ""
          } ${
            sub?.subjectOptional === "Optional"
              ? `(${sub?.subjectOptional})`
              : ""
          }`,
          subjectId: sub?._id,
        });
      }
      let students = [];
      for (let stu of classes?.ApproveStudent) {
        let obj = {
          ...stu,
          classWise: {
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
          },
          className: `${classes?.className} - ${classes?.classTitle}`,
          subjects: [],
        };
        students.push(obj);
      }

      for (let stu of students) {
        for (let att of classes?.attendenceDate) {
          for (let pre of att?.presentStudent) {
            if (String(stu._id) === String(pre.student))
              stu.classWise.presentCount += 1;
          }
          stu.classWise.totalCount += 1;
        }
        stu.classWise.totalPercentage = (
          (stu.classWise.presentCount * 100) /
          stu.classWise.totalCount
        ).toFixed(2);
      }

      for (let sub of classes?.subject) {
        const subjects = await Subject.findById(sub?._id).populate({
          path: "attendance",
        });

        for (let stu of students) {
          let sobj = {
            subjectName: `${sub?.subjectName} ${
              sub?.subject_category ? `(${sub?.subject_category})` : ""
            } ${
              sub?.selected_batch_query?.batchName
                ? `(${sub?.selected_batch_query?.batchName})`
                : ""
            } ${
              sub?.subjectOptional === "Optional"
                ? `(${sub?.subjectOptional})`
                : ""
            }`,
            subjectId: subjects?._id,
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
          };
          for (let att of subjects?.attendance) {
            for (let pre of att?.presentStudent) {
              if (String(stu._id) === String(pre.student))
                sobj.presentCount += 1;
            }
            sobj.totalCount += 1;
          }
          sobj.totalPercentage = (
            (sobj.presentCount * 100) /
            sobj.totalCount
          ).toFixed(2);

          stu.subjects.push(sobj);
        }
      }

      return res.status(200).send({
        message: "All student zip attendance wtih all wise",
        attendance_zip: {
          mapSubject,
          students,
          className: `${classes?.className} - ${classes?.classTitle}`,
          attendaceMappingDate,
        },
        access: false,
      });
    } else if (is_type === "ALL_SUBJECT_SEMESTER") {
      var classes = await Class.findById(cid)
        .populate({
          path: "ApproveStudent",
          select:
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO student_prn_enroll_number",
        })
        .populate({
          path: "subject",
          populate: {
            path: "selected_batch_query",
          },
        })
        .lean()
        .exec();
      let mapSubject = [];
      for (let sub of classes?.subject) {
        mapSubject.push({
          subjectName: `${sub?.subjectName} ${
            sub?.subject_category ? `(${sub?.subject_category})` : ""
          } ${
            sub?.selected_batch_query?.batchName
              ? `(${sub?.selected_batch_query?.batchName})`
              : ""
          } ${
            sub?.subjectOptional === "Optional"
              ? `(${sub?.subjectOptional})`
              : ""
          }`,
          subjectId: sub?._id,
        });
      }

      let students = [];
      for (let stu of classes?.ApproveStudent) {
        let obj = {
          ...stu,
          subjects: [],
        };
        students.push(obj);
      }

      for (let sub of classes?.subject) {
        const subjects = await Subject.findById(sub?._id).populate({
          path: "attendance",
        });

        for (let stu of students) {
          let sobj = {
            subjectName: `${sub?.subjectName} ${
              sub?.subject_category ? `(${sub?.subject_category})` : ""
            } ${
              sub?.selected_batch_query?.batchName
                ? `(${sub?.selected_batch_query?.batchName})`
                : ""
            } ${
              sub?.subjectOptional === "Optional"
                ? `(${sub?.subjectOptional})`
                : ""
            }`,
            subjectId: subjects?._id,
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
          };
          for (let att of subjects?.attendance) {
            for (let pre of att?.presentStudent) {
              if (String(stu._id) === String(pre.student))
                sobj.presentCount += 1;
            }
            sobj.totalCount += 1;
          }
          sobj.totalPercentage = (
            (sobj.presentCount * 100) /
            sobj.totalCount
          ).toFixed(2);

          stu.subjects.push(sobj);
        }
      }

      return res.status(200).send({
        message: "All student zip attendance wtih all subject semester wise",
        attendance_zip: {
          mapSubject,
          students,
          className: `${classes?.className} - ${classes?.classTitle}`,
        },
        access: true,
      });
    } else if (is_type === "ALL_SUBJECT_MONTHLY") {
      regularexp = new RegExp(`\/${month}\/${year}$`);
      var classes = await Class.findById(cid)
        .populate({
          path: "ApproveStudent",
          select:
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO student_prn_enroll_number",
        })
        .populate({
          path: "subject",
          populate: {
            path: "selected_batch_query",
          },
        })
        .lean()
        .exec();
      let mapSubject = [];
      for (let sub of classes?.subject) {
        mapSubject.push({
          subjectName: `${sub?.subjectName} ${
            sub?.subject_category ? `(${sub?.subject_category})` : ""
          } ${
            sub?.selected_batch_query?.batchName
              ? `(${sub?.selected_batch_query?.batchName})`
              : ""
          } ${
            sub?.subjectOptional === "Optional"
              ? `(${sub?.subjectOptional})`
              : ""
          }`,
          subjectId: sub?._id,
        });
      }

      let students = [];
      for (let stu of classes?.ApproveStudent) {
        let obj = {
          ...stu,
          subjects: [],
        };
        students.push(obj);
      }

      for (let sub of classes?.subject) {
        const subjects = await Subject.findById(sub?._id).populate({
          path: "attendance",
          match: {
            attendDate: { $regex: regularexp },
          },
        });

        for (let stu of students) {
          let sobj = {
            subjectName: `${sub?.subjectName} ${
              sub?.subject_category ? `(${sub?.subject_category})` : ""
            } ${
              sub?.selected_batch_query?.batchName
                ? `(${sub?.selected_batch_query?.batchName})`
                : ""
            } ${
              sub?.subjectOptional === "Optional"
                ? `(${sub?.subjectOptional})`
                : ""
            }`,
            subjectId: subjects?._id,
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
          };
          for (let att of subjects?.attendance) {
            for (let pre of att?.presentStudent) {
              if (String(stu._id) === String(pre.student))
                sobj.presentCount += 1;
            }
            sobj.totalCount += 1;
          }
          sobj.totalPercentage = (
            (sobj.presentCount * 100) /
            sobj.totalCount
          ).toFixed(2);

          stu.subjects.push(sobj);
        }
      }

      return res.status(200).send({
        message: "All student zip attendance wtih all subject monthly wise",
        attendance_zip: {
          mapSubject,
          students,
          className: `${classes?.className} - ${classes?.classTitle}`,
        },
        access: true,
      });
    } else {
      regularexp = new RegExp(`\/${month}\/${year}$`);
      var classes = await Class.findById(cid)
        .populate({
          path: "ApproveStudent",
          select:
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender leave studentGRNO student_prn_enroll_number",
          populate: {
            path: "leave",
            match: {
              date: { $regex: regularexp },
              status: { $eq: "Accepted" },
            },
            select: "date",
          },
        })
        .populate({
          path: "attendenceDate",
          match: {
            attendDate: { $regex: regularexp },
          },
          select: "attendDate presentStudent.student absentStudent.student",
        })
        .lean()
        .exec();
      let students = [];

      for (let att of classes?.attendenceDate) {
        attendaceMappingDate.push(att?.attendDate);
      }
      for (let stu of classes?.ApproveStudent) {
        let obj = {
          ...stu,
          availablity: [],
          classWise: {
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
          },
        };
        for (let att of classes?.attendenceDate) {
          let statusObj = {
            date: att.attendDate,
            status: "",
          };
          for (let pre of att?.presentStudent) {
            if (String(stu._id) === String(pre.student)) {
              statusObj.status = "P";
              obj.classWise.presentCount += 1;
            }
          }
          for (let abs of att?.absentStudent) {
            if (String(stu._id) === String(abs.student)) statusObj.status = "A";
          }
          obj.classWise.totalCount += 1;
          obj.availablity.push(statusObj);
        }
        obj.classWise.totalPercentage = (
          (obj.classWise.presentCount * 100) /
          obj.classWise.totalCount
        ).toFixed(2);
        students.push(obj);
      }
      return res.status(200).send({
        message: "All student zip attendance",
        attendance_zip: {
          students: students,
          attendaceMappingDate: attendaceMappingDate,
        },
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getAllExamAttedance = async (req, res) => {
  try {
    const { eid, seid } = req.params;
    const { date } = req.query;
    const seating_sequence = await Seating.findOne({
      _id: seid,
      exam: eid,
    });
    let related_sub = [];
    let q_date = new Date(date);
    for (let seat of seating_sequence.seat_exam_paper_array) {
      // "14/04/2023", exam date like this
      //query date like 2023-04-30
      let s_date_split = seat.date.split("/");
      let s_date = new Date(
        `${s_date_split[2]}-${s_date_split[1]}-${s_date_split[0]}`
      );
      if (q_date.getDate() === s_date.getDate()) {
        related_sub.push({
          subjectId: seat.subjectId,
          subjectName: seat.subjectName,
          from: seat.from,
          to: seat.to,
        });
      }
    }
    let student_list = [];
    for (let i = 0; i < related_sub?.length; i++) {
      const subjects = await Subject.findById(
        related_sub[i].subjectId
      ).populate({
        path: "class",
        select: "ApproveStudent className classTitle",
      });
      // let student_list = [];
      if (subjects.subjectOptional !== "Mandatory") {
        let mix_student = await Student.find({
          _id: {
            $in: subjects.optionalStudent,
          },
        }).select(
          "studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentGender"
        );
        for (let stu of mix_student) {
          if (
            +related_sub[i]?.from <=
            +stu.studentROLLNO <=
            +related_sub[i]?.to
          ) {
            student_list.push({
              studentFirstName: stu.studentFirstName,
              studentMiddleName: stu.studentMiddleName,
              student_biometric_id: stu.student_biometric_id,
              studentLastName: stu.studentLastName,
              photoId: stu.photoId,
              studentProfilePhoto: stu.studentProfilePhoto,
              studentROLLNO: stu.studentROLLNO,
              studentGender: stu.studentGender,
              className: subjects?.class?.className,
              classTitle: subjects?.class?.classTitle,
              _id: stu._id,
              subjectId: subjects?._id,
            });
          }
        }
      } else {
        let mix_student = await Student.find({
          _id: {
            $in: subjects.class?.ApproveStudent ?? [],
          },
        }).select(
          "studentFirstName studentMiddleName student_biometric_id studentLastName photoId studentProfilePhoto studentROLLNO studentGender"
        );
        for (let stu of mix_student) {
          if (
            +related_sub[i]?.from <=
            +stu.studentROLLNO <=
            +related_sub[i]?.to
          ) {
            student_list.push({
              studentFirstName: stu.studentFirstName,
              studentMiddleName: stu.studentMiddleName,
              student_biometric_id: stu.student_biometric_id,
              studentLastName: stu.studentLastName,
              photoId: stu.photoId,
              studentProfilePhoto: stu.studentProfilePhoto,
              studentROLLNO: stu.studentROLLNO,
              studentGender: stu.studentGender,
              className: subjects?.class?.className,
              classTitle: subjects?.class?.classTitle,
              _id: stu._id,
              subjectId: subjects?._id,
            });
          }
        }
      }
    }
    res.status(200).send({
      message: "Exam Attendance list of particular hall/ block",
      student_list,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getTodayExamAttedance = async (req, res) => {
  try {
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

    const seating_sequence = await Seating.findById(req.params.seid)
      .populate({
        path: "attendance",
        match: {
          attendDate: { $regex: regularexp },
        },
        select: "attendDate presentTotal absentTotal related_subjects",
      })
      .select("_id")
      .lean()
      .exec();

    if (seating_sequence.attendance?.length > 0) {
      const attend = seating_sequence.attendance[0];
      const present = [];
      const absent = [];
      for (let i = 0; i < attend.related_subjects.length; i++) {
        if (attend.related_subjects[i].status === "Present") {
          present.push({
            studentId: attend.related_subjects[i].student,
            subjectId: attend.related_subjects[i].subject,
          });
        } else {
          absent.push({
            studentId: attend.related_subjects[i].student,
            subjectId: attend.related_subjects[i].subject,
          });
        }
      }
      res.status(200).send({
        seating_sequence: {
          _id: seating_sequence._id,
          attendance: [
            {
              _id: attend?._id,
              presentTotal: attend?.presentTotal,
              absentTotal: attend?.absentTotal,
              presentStudent: present,
              absentStudent: absent,
              attendDate: attend?.attendDate,
            },
          ],
        },
      });
    } else {
      // const classEncrypt = await encryptionPayload(subjects);
      res.status(200).send({ seating_sequence });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.markAttendenceExamStudent = async (req, res) => {
  try {
    const { eid, seid } = req.params;
    const attendanceone = await AttendenceDate.findOne({
      exam: { $eq: `${eid}` },
      seating: { $eq: `${seid}` },
      attendDate: { $eq: `${req.body.date}` },
    });
    if (attendanceone) {
      res.status(200).send({
        message: "Today already marked attendance",
      });
    } else {
      const exam_today = await Exam.findById(eid);
      const seating_sequence = await Seating.findById(seid);
      const attendence = new AttendenceDate({});
      attendence.attendDate = req.body.date;
      attendence.exam = exam_today._id;
      attendence.seating = seating_sequence._id;
      attendence.attendTime = new Date();
      await Promise.all([
        attendence.save(),
        seating_sequence.save(),
        exam_today.save(),
      ]);
      res
        .status(200)
        .send({ message: "Success", alreadyMark: attendence?._id });
      for (let i = 0; i < req.body.present.length; i++) {
        const student = await Student.findById({
          _id: `${req.body.present[i]?.studentId}`,
        });
        attendence.related_subjects.push({
          subject: req.body.present[i]?.subjectId,
          student: req.body.present[i]?.studentId,
          status: "Present",
        });
        student.subjectAttendance.push(attendence._id);
        attendence.presentStudent.push({
          student: student._id,
          inTime: getOnlyTime(),
          status: "Present",
        });
        await student.save();
      }
      for (let i = 0; i < req.body.absent.length; i++) {
        const student = await Student.findById({
          _id: `${req.body.absent[i]?.studentId}`,
        });
        attendence.related_subjects.push({
          subject: req.body.absent[i]?.subjectId,
          student: req.body.absent[i]?.studentId,
          status: "Absent",
        });
        student.subjectAttendance.push(attendence._id);
        attendence.absentStudent.push({
          student: student._id,
          inTime: getOnlyTime(),
          status: "Absent",
        });
        await student.save();
      }
      exam_today.attednance.push(attendence._id);
      seating_sequence.attendance.push(attendence._id);
      attendence.presentTotal = req.body.present.length;
      attendence.absentTotal = req.body.absent.length;
      await Promise.all([
        attendence.save(),
        seating_sequence.save(),
        exam_today.save(),
      ]);
    }
  } catch (e) {
    console.log(e);
  }
};

exports.markAttendenceExamStudentUpdate = async (req, res) => {
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
      const studentAttendance = await AttendenceDate.findById(said);
      for (let i = 0; i < req.body.present?.length; i++) {
        let flag = false;
        for (let pre of studentAttendance.presentStudent) {
          if (String(pre.student) === req.body.present[i]?.studentId)
            flag = true;
          else flag = false;
        }
        if (!flag) {
          studentAttendance.presentStudent?.push({
            student: req.body.present[i]?.studentId,
            inTime: getOnlyTime(),
            status: "Present",
          });
          for (let rel_sub of studentAttendance?.related_subjects) {
            if (String(rel_sub.student) === req.body.present[i]?.studentId) {
              rel_sub.status = "Present";
            }
          }
          let prevLength = studentAttendance.absentStudent.length;
          studentAttendance.absentStudent =
            studentAttendance.absentStudent?.filter(
              (abs) => String(abs.student) !== req.body.present[i]?.studentId
            );
          let nextLength = studentAttendance.absentStudent.length;

          studentAttendance.presentTotal += 1;
          if (prevLength > nextLength) studentAttendance.absentTotal -= 1;
        }
      }
      for (let i = 0; i < req.body.absent.length; i++) {
        let flag = false;
        for (let abs of studentAttendance.absentStudent) {
          if (String(abs.student) === req.body.absent[i]?.studentId)
            flag = true;
          else flag = false;
        }
        if (!flag) {
          studentAttendance.absentStudent?.push({
            student: req.body.absent[i]?.studentId,
            inTime: getOnlyTime(),
            status: "Absent",
          });
          for (let rel_sub of studentAttendance?.related_subjects) {
            if (String(rel_sub.student) === req.body.absent[i]?.studentId) {
              rel_sub.status = "Absent";
            }
          }
          let prevLength = studentAttendance.presentStudent.length;
          studentAttendance.presentStudent =
            studentAttendance.presentStudent?.filter(
              (pre) => String(pre.student) !== req.body.absent[i]?.studentId
            );
          let nextLength = studentAttendance.presentStudent.length;
          if (prevLength > nextLength) studentAttendance.presentTotal -= 1;
          studentAttendance.absentTotal += 1;
        }
      }
      await studentAttendance.save();
      res.status(200).send({ message: "Updated attendance" });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.sendNotificationOfAttendance = async (req, res) => {
  try {
    const seating_sequence = await Seating.findById(req.params.seid).populate({
      path: "exam",
    });
    const staff = await Staff.findById({
      _id: `${seating_sequence?.seat_block_staff}`,
    });
    const notify = await StudentNotification({});
    const user = await User.findById({ _id: `${staff?.user}` });
    const newDate = new Date();
    notify.notifyContent = `You have a supervision on ${moment(newDate).format(
      "LL"
    )} for ${seating_sequence?.seat_block_name}.`;
    notify.notifySender = seating_sequence?.exam?.department;
    notify.notifyReceiever = user?._id;
    notify.examId = seating_sequence?.exam?._id;
    notify.seatingId = seating_sequence?._id;
    notify.notifyType = "Staff";
    notify.notifyPublisher = staff?._id;
    user.activity_tab.push(notify._id);
    notify.notifyByDepartPhoto = seating_sequence?.exam?.department;
    notify.notifyCategory = "Exam Attendance";
    notify.redirectIndex = 31;
    invokeMemberTabNotification(
      "Staff Activity",
      notify,
      "Seating Arrangement",
      user._id,
      user.deviceToken,
      "Student",
      notify
    );
    await Promise.all([notify.save(), user.save()]);
    res.status(200).send({
      message: "notification send to supervisor",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getAllSubjectExportAttendance = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid)
      return res.status(200).send({
        message: "Their is a bug regarding to call api",
        access: false,
      });
    const month = req.query.month;
    const year = req.query.year;
    const { is_type } = req.query;
    const { startRange, endRange } = req.body;
    let regularexp = "";
    var attendaceMappingDate = [];
    var attendance_zip = null;
    if (is_type === "RANGE") {
      let range1 = startRange;
      let range2 = endRange;
      var subjects = await Subject.findById(sid).populate({
        path: "attendance",
        // select: "attendDate presentStudent.student absentStudent.student",
      });
      // .lean()
      // .exec();

      var classes = await Class.findById(subjects?.class)
        .populate({
          path: "ApproveStudent",
          select:
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender leave studentGRNO student_prn_enroll_number",
          populate: {
            path: "leave",
            match: {
              status: { $eq: "Accepted" },
            },
            select: "date",
          },
        })
        .lean()
        .exec();

      let students = [];
      let range_attendance = [];
      for (let att of subjects?.attendance) {
        if (att.attendDate >= range1 && att.attendDate <= range2) {
          range_attendance.push(att);
        }
      }
      for (let stu of classes?.ApproveStudent) {
        let obj = {
          ...stu,
          availablity: [],
        };
        for (let att of range_attendance) {
          let statusObj = {
            date: att.attendDate,
            status: "",
          };
          for (let pre of att?.presentStudent) {
            if (String(stu._id) === String(pre.student)) statusObj.status = "P";
          }
          for (let abs of att?.absentStudent) {
            if (String(stu._id) === String(abs.student)) statusObj.status = "A";
          }
          obj.availablity.push(statusObj);
        }
        students.push(obj);
      }
      // console.log(classes);
      return res.status(200).send({
        message: "All student zip attendance with subject ranged based",
        attendance_zip: students,
        access: false,
      });
    } else if (is_type === "ALL") {
      var subjects = await Subject.findById(sid)
        .populate({
          path: "attendance",
        })
        .populate({
          path: "selected_batch_query",
        })
        .populate({
          path: "class",
          select: "className",
        })
        .select("attendance selected_batch_query class");

      let student_list = [];
      var classes = null;
      if (subjects?.selected_batch_query?._id) {
        student_list = await Student.find({
          _id: { $in: subjects?.selected_batch_query?.class_student_query },
        })
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender leave studentGRNO student_prn_enroll_number"
          )
          .lean()
          .exec();
      } else {
        if (subjects?.optionalStudent?.length > 0) {
          student_list = await Student.find({
            _id: { $in: subjects?.optionalStudent },
          })
            .select(
              "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender leave studentGRNO student_prn_enroll_number"
            )
            .lean()
            .exec();
        } else {
          classes = await Class.findById(subjects?.class)
            .populate({
              path: "ApproveStudent",
              select:
                "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO student_prn_enroll_number",
            })
            .lean()
            .exec();
          student_list = classes?.ApproveStudent;
        }
      }

      let mapSubject = {
        subjectName: `${subjects?.subjectName} ${
          subjects?.subject_category ? `(${subjects?.subject_category})` : ""
        } ${
          subjects?.selected_batch_query?.batchName
            ? `(${subjects?.selected_batch_query?.batchName})`
            : ""
        } ${
          subjects?.subjectOptional === "Optional"
            ? `(${subjects?.subjectOptional})`
            : ""
        }`,
        subjectId: subjects?._id,
        // className: `${classes?.className} - ${classes?.classTitle}`,
      };
      let students = [];
      for (let stu of student_list) {
        let obj = {
          ...stu,
          subjectWise: {
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
          },
        };
        students.push(obj);
      }
      for (let stu of students) {
        for (let att of subjects?.attendance) {
          for (let pre of att?.presentStudent) {
            if (String(stu._id) === String(pre.student))
              stu.subjectWise.presentCount += 1;
          }
          stu.subjectWise.totalCount += 1;
        }
        stu.subjectWise.totalPercentage = (
          (stu.subjectWise.presentCount * 100) /
          stu.subjectWise.totalCount
        ).toFixed(2);
      }

      attendance_zip = {
        mapSubject,
        students,
        attendaceMappingDate,
      };

      let obj = {
        GRNO: "",
        "Enrollment / PRN": "",
        RollNo: "",
        Name: "",
        Gender: "",
        [attendance_zip.mapSubject?.subjectName]: "",
        [`${attendance_zip.mapSubject?.subjectName} Overall Percentage`]: "",
      };
      const student = attendance_zip?.students?.map((stu) => {
        let dObj = { ...obj };
        dObj.GRNO = stu?.studentGRNO ?? "N/A";
        dObj["Enrollment / PRN"] = stu?.student_prn_enroll_number
          ? stu?.student_prn_enroll_number
          : "N/A";
        dObj.RollNo = stu?.studentROLLNO;
        dObj.Name = `${
          stu?.studentFirstName +
          " " +
          stu?.studentMiddleName +
          " " +
          stu?.studentLastName
        }`;
        dObj.Gender = stu?.studentGender;
        dObj[
          attendance_zip.mapSubject?.subjectName
        ] = `${stu.subjectWise.presentCount} out of ${stu.subjectWise.totalCount}`;
        dObj[`${attendance_zip.mapSubject?.subjectName} Overall Percentage`] =
          stu.subjectWise.totalPercentage;

        return dObj;
      });

      if (student?.length > 0) {
        excel_key = await subject_attendance_json_to_excel(
          sid,
          student,
          "Student Attendance",
          "SUBJECT_SEMESTER_ATTENDANCE",
          `semester-of-${subjects?.class?.className ?? ""}`
        );
      }
      res.status(200).send({
        message: "All student zip attendance wtih all subject wise",
        excel_key: excel_key,
      });
      // console.log("excel_key", );
      // return res.status(200).send({
      //   message: "All student zip attendance wtih all subject wise",
      //   attendance_zip: {
      //     mapSubject,
      //     students,
      //     attendaceMappingDate,
      //   },
      //   access: false,
      // });
    } else {
      regularexp = new RegExp(`\/${month}\/${year}$`);

      var subjects = await Subject.findById(sid)
        .populate({
          path: "attendance",
          match: {
            attendDate: { $regex: regularexp },
          },
          // select: "attendDate presentStudent.student absentStudent.student",
        })
        .populate({
          path: "selected_batch_query",
          select: "class_student_query",
        })
        .populate({
          path: "class",
          select: "className",
        })
        .select("attendance selected_batch_query class");

      // .lean()
      // .exec();
      let student_list = [];
      var classes = null;
      if (subjects?.selected_batch_query?._id) {
        student_list = await Student.find({
          _id: { $in: subjects?.selected_batch_query?.class_student_query },
        })
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender leave studentGRNO student_prn_enroll_number"
          )
          .lean()
          .exec();
      } else {
        if (subjects?.optionalStudent?.length > 0) {
          student_list = await Student.find({
            _id: { $in: subjects?.optionalStudent },
          })
            .select(
              "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender leave studentGRNO student_prn_enroll_number"
            )
            .lean()
            .exec();
        } else {
          classes = await Class.findById(subjects?.class)
            .populate({
              path: "ApproveStudent",
              select:
                "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender leave studentGRNO student_prn_enroll_number",
              populate: {
                path: "leave",
                match: {
                  date: { $regex: regularexp },
                  status: { $eq: "Accepted" },
                },
                select: "date",
              },
            })
            .lean()
            .exec();
          student_list = classes?.ApproveStudent;
        }
      }

      let students = [];
      for (let att of subjects?.attendance) {
        attendaceMappingDate.push(att?.attendDate);
      }
      // for (let stu of classes?.ApproveStudent)
      for (let stu of student_list) {
        let obj = {
          ...stu,
          availablity: [],
          subjectWise: {
            presentCount: 0,
            totalCount: 0,
            totalPercentage: 0,
          },
        };
        for (let att of subjects?.attendance) {
          let statusObj = {
            date: att.attendDate,
            status: "",
          };
          for (let pre of att?.presentStudent) {
            if (String(stu._id) === String(pre.student)) {
              statusObj.status = "P";
              obj.subjectWise.presentCount += 1;
            }
          }
          for (let abs of att?.absentStudent) {
            if (String(stu._id) === String(abs.student)) {
              statusObj.status = "A";
            }
          }
          obj.subjectWise.totalCount += 1;
          obj.availablity.push(statusObj);
        }
        obj.subjectWise.totalPercentage = (
          (obj.subjectWise.presentCount * 100) /
          obj.subjectWise.totalCount
        ).toFixed(2);
        students.push(obj);
      }
      attendance_zip = {
        students: students,
        attendaceMappingDate: attendaceMappingDate,
      };

      let newDate = new Date(`${year}-${month}-01`);
      newDate = newDate?.toISOString();
      let daysInMonth = moment(`${year}-${month}`, "YYYY-MM").daysInMonth();
      const student = attendance_zip?.students?.map((stu) => {
        let dObj = {};
        for (let i = 1; i <= daysInMonth; i++) {
          if (i < 10) {
            let db = `0${i}/${month}/${year}`;
            if (attendance_zip?.attendaceMappingDate?.includes(db))
              dObj[db] = "";
          } else {
            let dbt = `${i}/${month}/${year}`;
            if (attendance_zip?.attendaceMappingDate?.includes(dbt))
              dObj[dbt] = "";
          }
        }
        for (let avail of stu?.availablity) {
          dObj[`${avail?.date}`] = avail?.status;
        }

        let obj = {
          GRNO: stu?.studentGRNO ?? "N/A",
          "Enrollment / PRN": stu?.student_prn_enroll_number
            ? stu?.student_prn_enroll_number
            : "N/A",
          RollNo: stu?.studentROLLNO,
          Name:
            stu?.studentFirstName +
            " " +
            stu?.studentMiddleName +
            " " +
            stu?.studentLastName,
          Gender: stu?.studentGender,
          ...dObj,
          "Total Count": `${stu?.subjectWise?.presentCount} out of ${stu?.subjectWise?.totalCount}`,
          "Overall Percentage": stu?.subjectWise?.totalPercentage,
        };
        return obj;
      });

      if (student?.length > 0) {
        excel_key = await subject_attendance_json_to_excel(
          sid,
          student,
          "Student Attendance",
          "SUBJECT_MONTHLY_ATTENDANCE",
          `montly-of-${subjects?.class?.className ?? ""}`
        );
      }
      res.status(200).send({
        message: "All month student zip attendance with subject wise",
        excel_key: excel_key,
        // student_list,
        // attendance_zip,
        // subjects,
      });
      // return res.status(200).send({
      //   message: "All month student zip attendance with subject wise",
      //   attendance_zip: {
      //     students: students,
      //     attendaceMappingDate: attendaceMappingDate,
      //   },
      //   access: false,
      // });
    }
  } catch (e) {
    console.log(e);
  }
};



exports.subjectTodaySetAttendanceTimeQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { date, from, to, cid, flow, which_lecture } = req.body;
    const subjects = await Subject.findById({ _id: sid });
    const slot_based = await ClassAttendanceTimeSlot.findOne({
      $and: [
        {
          date: { $eq: date },
        },
        {
          class: { $eq: `${cid}` },
        },
      ],
    });
    let already_slot_mark = false;
    var subject = null;
    var from_minutes = time_convertor(from);
    var to_minutes = time_convertor(to);
    if (!slot_based?._id) {
      const cls = await Class.findById(cid);
      const slt = new ClassAttendanceTimeSlot({
        date: date,
        class: cid,
        slot: [
          {
            date: date,
            from: from,
            from_minutes: from_minutes,
            to: to,
            to_minutes: to_minutes,
            register_subject: sid,
            is_mark: false,
            is_extra: flow === "Normal_Lecture" ? false : true,
            which_lecture: flow === "Normal_Lecture" ? which_lecture : "0",
            which_extra_lecture:
              flow === "Normal_Lecture" ? "0" : which_lecture,
          },
        ],
      });
      cls?.attendance_time_slot?.push(slt?._id);
      await Promise.all([slt.save(), cls.save()]);
    } else {
      for (let t_slot of slot_based?.slot) {
        if (!t_slot.is_mark) {
        } else {
          let slot_to = +t_slot?.to_minutes - 5;
          let come_to_minutes = +to_minutes - 5;
          if (from_minutes >= slot_to) {
          } else if (come_to_minutes <= +t_slot?.from_minutes) {
          } else {
            if (subjects?.selected_batch_query) {
            } else {
              subject = await Subject.findById(t_slot.register_subject)
                .populate({
                  path: "subjectTeacherName",
                  select: "staffFirstName staffLastName staffMiddleName",
                })
                .select("subjectName subjectTeacherName")
                .lean()
                .exec();
              already_slot_mark = true;
              break;
            }
          }
        }
      }
      if (!already_slot_mark) {
        let flag = true;
        for (let t_slot of slot_based?.slot) {
          if (`${t_slot?.register_subject}` === `${sid}`) {
            if (t_slot?.is_extra && flow !== "Normal_Lecture") {
              if (`${which_lecture}` === `${t_slot.which_extra_lecture}`) {
                t_slot.date = date;
                t_slot.from = from;
                t_slot.to = to;
                t_slot.from_minutes = from_minutes;
                t_slot.to_minutes = to_minutes;
                flag = false;
                break;
              }
            }
            if (!t_slot?.is_extra && flow === "Normal_Lecture") {
              if (`${which_lecture}` === `${t_slot.which_lecture}`) {
                t_slot.date = date;
                t_slot.from = from;
                t_slot.to = to;
                t_slot.from_minutes = from_minutes;
                t_slot.to_minutes = to_minutes;
                flag = false;
                break;
              }
            }
          }
        }

        if (flag) {
          slot_based?.slot.push({
            date: date,
            from: from,
            to: to,
            from_minutes: from_minutes,
            to_minutes: to_minutes,
            register_subject: sid,
            is_mark: false,
            is_extra: flow === "Normal_Lecture" ? false : true,
            which_lecture: flow === "Normal_Lecture" ? which_lecture : "0",
            which_extra_lecture:
              flow === "Normal_Lecture" ? "0" : which_lecture,
          });
        }
        await slot_based.save();
      }
    }
    if (already_slot_mark)
      res.status(200).send({
        already_slot_mark,
        subject: subject,
        message: "For this time slot attendace has marked.",
      });
    else
      res.status(200).send({
        message: "Subject attendace time is set for taken attendance",
      });
  } catch (e) {
    console.log(e);
  }
};



exports.subjectTimeSlotFormatQuery = async (req, res) => {
  try {
    const ts = await ClassAttendanceTimeSlot.find({});

    for (let ct of ts) {
      for (let st of ct?.slot) {
        let from_minutes = time_convertor(st?.from);
        let to_minutes = time_convertor(st?.to);
        st.from_minutes = from_minutes;
        st.to_minutes = to_minutes;
      }
      await ct.save();
    }
    res.status(200).send({
      message: "Subject attendace time is set for taken attendance",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTimeSlotFormatQuery = async (req, res) => {
  try {
    const ts = await ClassAttendanceTimeSlot.find({});

    for (let ct of ts) {
      for (let st of ct?.slot) {
        let from_minutes = time_convertor(st?.from);
        let to_minutes = time_convertor(st?.to);
        st.from_minutes = from_minutes;
        st.to_minutes = to_minutes;
      }
      await ct.save();
    }
    res.status(200).send({
      message: "Subject attendace time is set for taken attendance",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.timetableQueryReset = async (req, res) => {
  try {
    console.log("Dsf");
    const ts = await ClassTimetable.find({
      $and: [{ day: { $eq: "Firday" } }],
    });

    // for (let ct of ts) {
    //   for (let st of ct?.slot) {
    //     let from_minutes = time_convertor(st?.from);
    //     let to_minutes = time_convertor(st?.to);
    //     st.from_minutes = from_minutes;
    //     st.to_minutes = to_minutes;
    //   }
    //   await ct.save();
    // }
    res.status(200).send({
      message: "time tabe",
      ts,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.subjectDeleteTodayAttendanceQuery = async (req, res) => {
  try {
    const { said } = req.params;
    const { flow } = req.query;
    let obj = {
      presentStudent: [],
      absentStudent: [],
    };

    const studentAttendance = await AttendenceDate.findById(said);
    const subject = await Subject.findById(studentAttendance?.subject);
    const slot_based = await ClassAttendanceTimeSlot.findOne({
      $and: [
        {
          date: { $eq: studentAttendance?.attendDate },
        },
        {
          class: { $eq: `${subject?.class}` },
        },
      ],
    });
    obj.presentStudent = studentAttendance?.presentStudent;
    obj.absentStudent = studentAttendance?.absentStudent;
    for (let t_slot of slot_based?.slot) {
      if (`${t_slot?.register_subject}` === `${subject?._id}`) {
        if (t_slot?.is_extra && flow !== "Normal_Lecture") {
          if (
            `${studentAttendance?.from}` === `${t_slot.from}` &&
            `${studentAttendance?.to}` === `${t_slot.to}`
          ) {
            t_slot.is_mark = false;
            t_slot.student = [];
            break;
          }
        }
        if (!t_slot?.is_extra && flow === "Normal_Lecture") {
          if (
            `${studentAttendance?.which_lecture}` === `${t_slot.which_lecture}`
          ) {
            t_slot.is_mark = false;
            t_slot.student = [];
            break;
          }
        }
      }
    }
    // await slot_based.save();
    // await AttendenceDate.findByIdAndDelete(said);

    await Promise.all([
      slot_based.save(),
      AttendenceDate.findByIdAndDelete(said),
    ]);
    res.status(200).send({
      message: "attendance is deleted",
      i,
    });
    var i = 0;
    for (let ct of obj?.presentStudent) {
      i += 1;
      const student = await Student.findById(ct?.student);
      student.subjectAttendance.pull(said);
      await student.save();
      console.log("number exist: ", i);
    }
    for (let ct of obj?.absentStudent) {
      i += 1;
      const student = await Student.findById(ct?.student);
      student.subjectAttendance.pull(said);
      await student.save();
      console.log("number exist absent : ", i);
    }
    subject.attendance.pull(said);
    await subject.save();
    // res.status(200).send({
    //   message: "attendance is deleted",
    //   i,
    // });
  } catch (e) {
    console.log(e);
  }
};


exports.subjectTimeSlotMarkListQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    if (!cid)
      return res.status(200).send({
        message: "Their is a bug regarding to call api",
        access: false,
      });
    const { date } = req.query;
    const slot_based = await ClassAttendanceTimeSlot.findOne({
      $and: [
        {
          date: { $eq: date },
        },
        {
          class: { $eq: `${cid}` },
        },
      ],
    });

    let slots = [];
    for (let st of slot_based?.slot ?? []) {
      if (st?.is_mark) {
        let subject = await Subject.findById(st?.register_subject)
          .populate({
            path: "subjectTeacherName",
            select:
              "staffFirstName staffLastName staffMiddleName staffROLLNO photoId staffProfilePhoto",
          })
          .select("subjectName subjectTeacherName");

        slots.push({
          from: st?.from,
          to: st?.to,
          is_mark: st?.is_mark,
          is_extra: st?.is_extra,
          subject: subject,
        });
      }
    }
    res.status(200).send({
      slots,
      message: "Already marked attendace list of subject",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.subjectTodayUpdateAttendanceTimeQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { date, from, to, cid, flow, said, which_lecture } = req.body;
    const subjects = await Subject.findById({ _id: sid }).populate({
      path: "selected_batch_query",
      select: "class_student_query",
    });
    const slot_based = await ClassAttendanceTimeSlot.findOne({
      $and: [
        {
          date: { $eq: date },
        },
        {
          class: { $eq: `${cid}` },
        },
      ],
    });
    let already_slot_mark = false;
    var subject = null;
    var from_minutes = time_convertor(from);
    var to_minutes = time_convertor(to);

    for (let t_slot of slot_based?.slot) {
      if (!t_slot.is_mark) {
      } else if (`${t_slot?.register_subject}` === `${sid}`) {
        if (
          t_slot?.is_extra &&
          flow !== "Normal_Lecture" &&
          `${which_lecture}` !== `${t_slot.which_extra_lecture}`
        ) {
          let slot_to = +t_slot?.to_minutes - 5;
          let come_to_minutes = +to_minutes - 5;
          if (from_minutes >= slot_to) {
          } else if (come_to_minutes <= +t_slot?.from_minutes) {
          } else {
            subject = await Subject.findById(t_slot.register_subject)
              .populate({
                path: "subjectTeacherName",
                select: "staffFirstName staffLastName staffMiddleName",
              })
              .select("subjectName subjectTeacherName")
              .lean()
              .exec();
            already_slot_mark = true;
            break;
          }
        }
        if (
          !t_slot?.is_extra &&
          flow === "Normal_Lecture" &&
          `${which_lecture}` !== `${t_slot.which_lecture}`
        ) {
          let slot_to = +t_slot?.to_minutes - 5;
          let come_to_minutes = +to_minutes - 5;
          if (from_minutes >= slot_to) {
          } else if (come_to_minutes <= +t_slot?.from_minutes) {
          } else {
            subject = await Subject.findById(t_slot.register_subject)
              .populate({
                path: "subjectTeacherName",
                select: "staffFirstName staffLastName staffMiddleName",
              })
              .select("subjectName subjectTeacherName")
              .lean()
              .exec();
            already_slot_mark = true;
            break;
          }
        }
      } else {
        let slot_to = +t_slot?.to_minutes - 5;
        let come_to_minutes = +to_minutes - 5;
        if (from_minutes >= slot_to) {
        } else if (come_to_minutes <= +t_slot?.from_minutes) {
        } else {
          if (subjects?.selected_batch_query) {
            if (
              subjects?.selected_batch_query?.class_student_query?.length > 0
            ) {
              for (let stu of subjects?.selected_batch_query
                ?.class_student_query) {
                for (let st of t_slot?.student ?? []) {
                  if (`${stu}` === `${st}`) {
                    subject = await Subject.findById(t_slot.register_subject)
                      .populate({
                        path: "subjectTeacherName",
                        select: "staffFirstName staffLastName staffMiddleName",
                      })
                      .select("subjectName subjectTeacherName")
                      .lean()
                      .exec();
                    already_slot_mark = true;
                    break;
                  }
                }
              }
            }
          } else {
            subject = await Subject.findById(t_slot.register_subject)
              .populate({
                path: "subjectTeacherName",
                select: "staffFirstName staffLastName staffMiddleName",
              })
              .select("subjectName subjectTeacherName")
              .lean()
              .exec();
            already_slot_mark = true;
            break;
          }
        }
      }
    }
    if (!already_slot_mark) {
      for (let t_slot of slot_based?.slot) {
        if (`${t_slot?.register_subject}` === `${sid}`) {
          if (t_slot?.is_extra && flow !== "Normal_Lecture") {
            if (`${which_lecture}` === `${t_slot.which_extra_lecture}`) {
              t_slot.date = date;
              t_slot.from = from;
              t_slot.to = to;
              t_slot.from_minutes = from_minutes;
              t_slot.to_minutes = to_minutes;
              break;
            }
          }
          if (!t_slot?.is_extra && flow === "Normal_Lecture") {
            if (`${which_lecture}` === `${t_slot.which_lecture}`) {
              t_slot.date = date;
              t_slot.from = from;
              t_slot.to = to;
              t_slot.from_minutes = from_minutes;
              t_slot.to_minutes = to_minutes;
              break;
            }
          }
        }
      }
      await slot_based.save();
    }

    if (already_slot_mark)
      res.status(200).send({
        already_slot_mark,
        subject: subject,
        message: "For this time slot attendace has marked.",
      });
    else
      res.status(200).send({
        message: "Subject attendace time updated for already taken attendance",
      });
    const studentAttendance = await AttendenceDate.findById(said);
    studentAttendance.from = from;
    studentAttendance.to = to;
    await studentAttendance.save();
  } catch (e) {
    console.log(e);
  }
};

exports.subjectAttednaceAddLectureQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { which_lecture, date } = req.body;
    const subject = await Subject.findById(sid);
    var day_lecture = "";

    day_lecture = await SubjectLectureDay.findOne({
      $and: [
        {
          subject: { $eq: `${sid}` },
        },
        {
          attendDate: { $eq: `${date}` },
        },
      ],
    });

    if (day_lecture) {
      day_lecture.lecture?.push({ which_lecture: which_lecture });
      await day_lecture.save();
    } else {
      day_lecture = new SubjectLectureDay({
        attendDate: date,
        subject: sid,
        class: subject?.class,
        lecture: [
          {
            which_lecture: which_lecture,
          },
        ],
      });
      subject.one_day_attendance_lecture?.push(day_lecture?._id);
      await Promise.all([day_lecture.save(), subject.save()]);
    }
    res.status(201).send({
      message: "One more lecture is added",
    });
  } catch (e) {
    console.log(e);
  }
};


exports.getSubjectAttednaceLectureQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { date, which_day } = req.query;

    if (!sid || !date) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const day_lecture = await SubjectLectureDay.findOne({
      $and: [
        {
          subject: { $eq: `${sid}` },
        },
        {
          attendDate: { $eq: `${date}` },
        },
      ],
    }).select("lecture");

    const subjects = await Subject.findById(sid).populate({
      path: "class",
      populate: {
        path: "timetableDayWise",
        match: {
          day: { $eq: which_day },
        },
        select: "schedule.from schedule.to schedule.subject",
      },
      select: "timetableDayWise",
    });

    var timetable_lecture = [];
    let ct = 1;
    for (let time_table of subjects?.class?.timetableDayWise?.[0]?.schedule ??
      []) {
      if (`${time_table?.subject}` === `${sid}`) {
        timetable_lecture.push({
          which_lecture: `${ct}`,
        });
        ct += 1;
      }
    }
    if (day_lecture?.lecture?.length > 0)
      timetable_lecture.push(...day_lecture?.lecture);
    res.status(200).send({
      message: "One day All lecture list",
      day_lecture: timetable_lecture,
    });
  } catch (e) {
    console.log(e);
  }
};


exports.assignAttendanceToDefaultParameterQuery = async (req, res) => {
  try {
    const attednance = await AttendenceDate.find({
      $and: [
        {
          attendence_type: { $eq: "Normal_Lecture" },
        },
        // {
        //   which_lecture: { $nin: ["1", "2", "3", "4", "5", "6", "7", "8"] },
        // },
      ],
    }).select("subject className which_lecture");

    let count = 0;
    for (let st of attednance) {
      if (st?.subject) {
        if (st?.which_lecture) {
          if (+st?.which_lecture < 2) {
            st.which_lecture = "1";
            await st.save();
          }
        } else {
          st.which_lecture = "1";
          await st.save();
        }
      }
      // st.which_lecture = "1";
      // await st.save();
      console.log(count);
      ++count;
    }
    res.status(200).send({
      message: "Default parameter is inserted",
      count: count,
      attednance: attednance,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.getInstituteStaffMarkExcelQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let regularexp = "";
    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 5);
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    const currentDateLocalFormat = currentDate.toISOString().split("-");
    var day =
      +currentDateLocalFormat[2].split("T")[0] > 9
        ? +currentDateLocalFormat[2].split("T")[0]
        : `0${+currentDateLocalFormat[2].split("T")[0]}`;
    var month =
      +currentDateLocalFormat[1] > 9
        ? +currentDateLocalFormat[1]
        : `0${+currentDateLocalFormat[1]}`;
    const year = +currentDateLocalFormat[0];
    // month = `02`
    // day = `29`
    regularexp = new RegExp(`${month}\/${year}$`);
    const staff = await Staff.find({
      institute: { $eq: `${id}` },
    }).select(
      "staffSubject staffFirstName staffLastName staffMiddleName staff_emp_code staffROLLNO"
    );

    let all_staff = [];
    for (let st of staff ?? []) {
      let dt_obj = {};
      for (let i = 1; i <= day; i++) {
        dt_obj[`${i > 9 ? i : `0${i}`}/${month}/${year}`] = "No";
      }
      if (st?.staffSubject?.length > 0) {
        const attednance = await AttendenceDate.find({
          $and: [
            {
              attendDate: { $regex: regularexp },
            },
            {
              subject: { $in: st?.staffSubject },
            },
          ],
        }).select("attendDate");
        for (let at of attednance ?? []) {
          if (dt_obj[at?.attendDate]) dt_obj[at?.attendDate] = "Yes";
        }
        all_staff.push({
          staffFirstName: st?.staffFirstName,
          staffLastName: st?.staffLastName,
          staffMiddleName: st?.staffMiddleName,
          staff_emp_code: st?.staff_emp_code,
          staffROLLNO: st?.staffROLLNO,
          dt_obj: dt_obj,
        });
      }
    }

    res.status(200).send({
      message: "Marked staff attendance",
      all_staff: all_staff,
    });
  } catch (e) {
    console.log(e);
  }
};











