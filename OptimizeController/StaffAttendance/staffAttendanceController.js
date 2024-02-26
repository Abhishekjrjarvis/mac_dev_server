// exports.getAttendInstituteStaff = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const prevDate = req.query.date;
//     let regularexp = "";
//     if (prevDate) {
//       const previousDate = prevDate?.split("/");
//       regularexp = new RegExp(
//         `${previousDate[0]}\/${previousDate[1]}\/${previousDate[2]}$`
//       );
//     } else {
//       var currentDate = new Date();
//       currentDate.setHours(currentDate.getHours() + 5);
//       currentDate.setMinutes(currentDate.getMinutes() + 30);
//       const currentDateLocalFormat = currentDate.toISOString().split("-");
//       const day =
//         +currentDateLocalFormat[2].split("T")[0] > 9
//           ? +currentDateLocalFormat[2].split("T")[0]
//           : `0${+currentDateLocalFormat[2].split("T")[0]}`;
//       const month =
//         +currentDateLocalFormat[1] > 9
//           ? +currentDateLocalFormat[1]
//           : `0${+currentDateLocalFormat[1]}`;
//       const year = +currentDateLocalFormat[0];
//       regularexp = new RegExp(`${day}\/${month}\/${year}$`);
//     }
//     const institute = await InstituteAdmin.findById({ _id: id })
//       .select("_id")
//       .populate({
//         path: "staffAttendance",
//         match: {
//           staffAttendDate: { $regex: regularexp },
//         },
//         select:
//           "staffAttendDate staffAttendTime presentStaff absentStaff absentTotal presentTotal",
//       })
//       .lean()
//       .exec();
//     if (institute.staffAttendance?.length > 0) {
//       const attend = institute.staffAttendance[0];
//       const present = [];
//       const absent = [];
//       attend?.presentStaff?.forEach((st) => present.push(st.staff));
//       attend?.absentStaff?.forEach((st) => absent.push(st.staff));
//       res.status(200).send({
//         message: "Success",
//         institute: {
//           _id: institute?._id,
//           staffAttendance: [
//             {
//               _id: attend?._id,
//               presentTotal: attend?.presentTotal,
//               absentTotal: attend?.absentTotal,
//               presentStaff: present,
//               absentStaff: absent,
//               staffAttendTime: attend?.staffAttendTime,
//               staffAttendDate: attend?.staffAttendDate,
//             },
//           ],
//         },
//       });
//     } else {
//       // const insEncrypt = await encryptionPayload(institute);
//       res.status(200).send({ message: "Success", institute });
//       // res.status(403).send({ message: "Failure" });
//     }
//     if (!institute) {
//       res.status(403).send({ message: "Failure" });
//     }
//   } catch {}
// };

// exports.markAttendenceDepartmentStaffUpdate = async (req, res) => {
//   try {
//     const { said } = req.params;
//     const attendance = await StaffAttendenceDate.findById(said);

//     if (!attendance) {
//       res.status(200).send({
//         message: "Attendance not Updated, first make a attendance",
//       });
//     } else {
//       // var currentDate = new Date();
//       // currentDate.setHours(currentDate.getHours() + 5);
//       // currentDate.setMinutes(currentDate.getMinutes() + 30);
//       // const currentDateLocalFormat = currentDate.toISOString().split("-");
//       // const markDate = req.body.date?.split("/");
//       // if (
//       //   +markDate[0] === +currentDateLocalFormat[2].split("T")[0] &&
//       //   +markDate[1] === +currentDateLocalFormat[1] &&
//       //   +markDate[2] === +currentDateLocalFormat[0]
//       // ) {
//       const staffAttendence = await StaffAttendenceDate.findById(said);
//       for (let i = 0; i < req.body.present?.length; i++) {
//         let flag = false;
//         for (let pre of staffAttendence.presentStaff) {
//           if (String(pre.staff) === req.body.present[i]) flag = true;
//           else flag = false;
//         }
//         if (!flag) {
//           staffAttendence.presentStaff?.push({
//             staff: req.body.present[i],
//             inTime: getOnlyTime(),
//             status: "Present",
//           });
//           let prevLength = staffAttendence.absentStaff.length;
//           staffAttendence.absentStaff = staffAttendence.absentStaff?.filter(
//             (abs) => String(abs.staff) !== req.body.present[i]
//           );
//           let nextLength = staffAttendence.absentStaff.length;

//           staffAttendence.presentTotal += 1;
//           if (prevLength > nextLength) staffAttendence.absentTotal -= 1;
//         }
//         // if (staffAttendence.presentStaff?.includes(req.body.present[i])) {
//         // } else if (staffAttendence.absentStaff?.includes(req.body.present[i])) {
//         //   staffAttendence.presentStaff?.push(req.body.present[i]);
//         //   staffAttendence.absentStaff?.pull(req.body.present[i]);
//         //   staffAttendence.presentTotal += 1;
//         //   staffAttendence.absentTotal -= 1;
//         // } else {
//         //   if (req.body.present.includes(req.body.present[i])) {
//         //     staffAttendence.presentStaff?.push(req.body.present[i]);
//         //     staffAttendence.presentTotal += 1;
//         //   } else if (req.body.absent.includes(req.body.absent[i])) {
//         //     staffAttendence.absentStaff?.push(req.body.absent[i]);
//         //     staffAttendence.absentTotal += 1;
//         //   } else {
//         //   }
//         // }
//       }
//       for (let i = 0; i < req.body.absent?.length; i++) {
//         let flag = false;
//         for (let abs of staffAttendence.absentStaff) {
//           if (String(abs.staff) === req.body.absent[i]) flag = true;
//           else flag = false;
//         }
//         if (!flag) {
//           staffAttendence.absentStaff?.push({
//             staff: req.body.absent[i],
//             inTime: getOnlyTime(),
//             status: "Absent",
//           });
//           let prevLength = staffAttendence.presentStaff.length;
//           staffAttendence.presentStaff = staffAttendence.presentStaff?.filter(
//             (pre) => String(pre.staff) !== req.body.absent[i]
//           );
//           let nextLength = staffAttendence.presentStaff.length;
//           if (prevLength > nextLength) staffAttendence.presentTotal -= 1;
//           staffAttendence.absentTotal += 1;
//         }
//         // if (staffAttendence.absentStaff?.includes(req.body.absent[i])) {
//         // } else if (staffAttendence.presentStaff?.includes(req.body.absent[i])) {
//         //   staffAttendence.absentStaff?.push(req.body.absent[i]);
//         //   staffAttendence.presentStaff?.pull(req.body.absent[i]);
//         //   staffAttendence.presentTotal -= 1;
//         //   staffAttendence.absentTotal += 1;
//         // } else {
//         // }
//       }
//       await staffAttendence.save();
//       res.status(200).send({ message: "Updated attendance" });
//       // } else {
//       //   res
//       //     .status(200)
//       //     .send({ message: "You can not mark attendance this date" });
//       // }
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };

// exports.getAttendStaffById = async (req, res) => {
//   try {
//     const month = req.query.month;
//     const year = req.query.year;
//     let days = 0;
//     let present = 0;
//     let absent = 0;
//     const presentArray = [];
//     const absentArray = [];
//     let regularexp = "";
//     if (month) {
//       regularexp = new RegExp(`\/${month}\/${year}$`);
//     } else {
//       regularexp = new RegExp(`\/${year}$`);
//     }
//     const staff = await Staff.findById(req.params.sid)
//       .select("_id attendDates staffLeave")
//       .populate({
//         path: "attendDates",
//         match: {
//           staffAttendDate: { $regex: regularexp },
//         },

//         select: "staffAttendDate presentStaff absentStaff",
//       })
//       .populate({
//         path: "staffLeave",
//         match: {
//           date: { $regex: regularexp },
//           status: { $eq: "Accepted" },
//         },
//         select: "date",
//       })
//       .lean()
//       .exec();

//     if (staff) {
//       if (staff.attendDates) {
//         staff.attendDates.forEach((day) => {
//           for (let per of day?.presentStaff) {
//             if (String(per.staff) === req.params.sid) {
//               present += 1;
//               presentArray.push(day.staffAttendDate);
//             }
//           }
//           for (let abs of day?.absentStaff) {
//             if (String(abs.staff) === req.params.sid) {
//               absent += 1;
//               absentArray.push(day.staffAttendDate);
//             }
//           }
//           // if (day.presentStaff?.includes(req.params.sid)) {
//           //   present += 1;
//           //   presentArray.push(day.staffAttendDate);
//           // } else if (day.absentStaff?.includes(req.params.sid)) {
//           //   absent += 1;
//           //   absentArray.push(day.staffAttendDate);
//           // } else {
//           // }
//         });
//         days = staff.attendDates.length;
//       }

//       let presentPercentage = ((present * 100) / days).toFixed(2);
//       let absentPercentage = ((absent * 100) / days).toFixed(2);
//       // Add Another Encryption
//       res.status(200).send({
//         message: "Success",
//         presentArray,
//         absentArray,
//         present: presentPercentage,
//         absent: absentPercentage,
//         leaves: staff.staffLeave,
//       });
//     } else {
//       res.status(404).send({ message: "Failure" });
//     }
//   } catch {}
// };

// exports.getAttendStaffByIdForMonth = async (req, res) => {
//   try {
//     const month = req.query.month;
//     const year = req.query.year;
//     let absentCount = 0;
//     let leaveCount = 0;
//     let regularexp = "";
//     if (month) regularexp = new RegExp(`\/${month}\/${year}$`);

//     const staff = await Staff.findById(req.params.sid)
//       .select("_id attendDates staffLeave")
//       .populate({
//         path: "attendDates",
//         match: {
//           staffAttendDate: { $regex: regularexp },
//         },

//         select: "staffAttendDate absentStaff",
//       })
//       .populate({
//         path: "staffLeave",
//         match: {
//           date: { $regex: regularexp },
//           status: { $eq: "Accepted" },
//         },
//         select: "date",
//       })
//       .lean()
//       .exec();

//     if (staff) {
//       if (staff.attendDates) {
//         staff.attendDates?.forEach((day) => {
//           for (let abs of day?.absentStaff) {
//             if (String(abs.staff) === req.params.sid) {
//               absentCount += 1;
//             }
//           }
//           // if (day.absentStaff?.includes(req.params.sid)) absentCount += 1;
//         });
//       }
//       if (staff.staffLeave) {
//         staff?.staffLeave?.forEach((leave) => {
//           leaveCount = leaveCount + leave?.date?.length;
//         });
//       }
//       // Add Another Encryption
//       res.status(200).send({
//         message: "Success",
//         absentCount,
//         leaveCount,
//       });
//     } else {
//       res.status(200).send({ message: "Failure" });
//     }
//   } catch {}
// };

const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const {
  attendance_today_date,
} = require("../../Utilities/Attendance/attendance_function");
const { notify_attendence_provider } = require("../../helper/dayTimer");
const InstituteAdmin = require("../../models/InstituteAdmin");
const Leave = require("../../models/Leave");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Staff = require("../../models/Staff");
const StaffAttendenceDate = require("../../models/StaffAttendenceDate");

exports.staffAttendanceMarkQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const { date, present, absent } = req.body;
    const { m_time } = attendance_today_date();

    const attendance = new StaffAttendenceDate({
      staffAttendDate: date,
      institute: id,
      presentTotal: present?.length,
      absentTotal: absent?.length,
    });

    await attendance.save();
    res.status(201).send({ message: "Staff Attendance marked successfully." });

    const institute = await InstituteAdmin.findById(id);
    institute.staffAttendance.push(attendance?._id);

    for (let pt of present) {
      const staff = await Staff.findById(pt).populate({
        path: "user",
        select: "_id uNotify userLegalName deviceToken activity_tab",
      });
      staff.attendDates.push(attendance._id);
      attendance.presentStaff.push({
        staff: staff._id,
        inTime: m_time,
        status: "Present",
      });
      await staff.save();
    }
    for (let at of absent) {
      const staff = await Staff.findById(at).populate({
        path: "user",
        select: "_id uNotify userLegalName deviceToken activity_tab",
      });
      staff.attendDates.push(attendance._id);
      attendance.absentStaff.push({
        staff: staff._id,
        inTime: m_time,
        status: "Absent",
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
      await Promise.all([staff.save(), notify.save(), staff.user.save()]);
    }
    await Promise.all([institute.save(), attendance.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.staffAttendanceUpdateQuery = async (req, res) => {
  try {
    const { said } = req.params;
    if (!said) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { present, absent } = req.body;
    const { m_time } = attendance_today_date();
    const attendance = await StaffAttendenceDate.findById(said);
    for (let pt of present ?? []) {
      let flag = false;
      for (let pre of attendance.presentStaff) {
        if (`${pre.staff}` === `${pt}`) {
          flag = true;
          break;
        } else flag = false;
      }
      if (!flag) {
        attendance.presentStaff?.push({
          staff: pt,
          inTime: m_time,
          status: "Present",
        });
        attendance.absentStaff?.pull(pt);
      }
    }
    for (let at of absent ?? []) {
      let flag = false;
      for (let pre of attendance.absentStaff) {
        if (`${pre.staff}` === `${at}`) {
          flag = true;
          break;
        } else flag = false;
      }
      if (!flag) {
        attendance.absentStaff?.push({
          staff: at,
          inTime: m_time,
          status: "Absent",
        });
        attendance.presentStaff?.pull(at);
      }
    }
    await attendance.save();
    res.status(201).send({ message: "Staff Attendance updated successfully." });
    for (let at of absent ?? []) {
      let flag = false;
      for (let pre of attendance.absentStaff) {
        if (`${pre.staff}` === `${at}`) {
          flag = true;
          break;
        } else flag = false;
      }
      if (!flag) {
        const staff = await Staff.findById(at).populate({
          path: "user",
          select: "_id uNotify userLegalName deviceToken activity_tab",
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
        await Promise.all([staff.save(), notify.save(), staff.user.save()]);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getStaffAttendanceQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const query_date = req.query.date;
    let regularexp = "";
    if (query_date) {
      const previousDate = query_date?.split("/");
      regularexp = new RegExp(
        `${previousDate[0]}\/${previousDate[1]}\/${previousDate[2]}$`
      );
    } else {
      let server_date = attendance_today_date("yyyy-MM-DD")?.m_date?.split("-");
      regularexp = new RegExp(
        `${server_date[2]}\/${server_date[1]}\/${server_date[0]}$`
      );
    }
    const attendance = await StaffAttendenceDate.findOne({
      institute: id,
      staffAttendDate: { $regex: regularexp },
    }).select(
      "staffAttendDate staffAttendTime presentStaff absentStaff absentTotal presentTotal"
    );
    if (attendance) {
      const present = [];
      const absent = [];
      attendance?.presentStaff?.forEach((st) => present.push(st.staff));
      attendance?.absentStaff?.forEach((st) => absent.push(st.staff));
      res.status(200).send({
        message: "Success",
        attendance: {
          _id: attendance?._id,
          presentTotal: attendance?.presentTotal,
          absentTotal: attendance?.absentTotal,
          presentStaff: present,
          absentStaff: absent,
          staffAttendTime: attendance?.staffAttendTime,
          staffAttendDate: attendance?.staffAttendDate,
        },
      });
    } else {
      res.status(200).send({ message: "Success", attendance: null });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.staffAttendanceCalendarQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { month, year } = req.query.date;
    if (!sid || !year) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let regularexp = "";
    if (month) regularexp = new RegExp(`\/${month}\/${year}$`);
    else regularexp = new RegExp(`\/${year}$`);
    let calendar = {
      days: 0,
      present: 0,
      presentPrecentage: 0,
      absent: 0,
      absentPrecentage: 0,
      presentList: [],
      asbentList: [],
      holidayList: [],
      leaveList: [],
    };
    const staff = await Staff.findById(sid);
    if (staff?.attendDates?.length > 0) {
      const attendance = await StaffAttendenceDate.find({
        _id: { $in: staff.attendDates },
        staffAttendDate: { $regex: regularexp },
      }).select("staffAttendDate absentStaff");
      for (let day of attendance) {
        let flag = true;
        for (let abs of day?.absentStaff) {
          if (`${abs.staff}` === `${sid}`) {
            calendar.absent += 1;
            calendar.asbentList.push(day.staffAttendDate);
            flag = false;
            break;
          }
        }
        if (flag) {
          calendar.present += 1;
          calendar.presentList.push(day.staffAttendDate);
        }
      }
      calendar.days = attendance?.length ?? 0;
    }
    if (staff?.staffLeave?.length > 0) {
      const leave = await Leave.find({
        staff: { $eq: sid },
        status: { $eq: "Accepted" },
        date: { $regex: regularexp },
      }).select("date");
      for (let lt of leave) {
        calendar.leaveList.push(...lt.date);
      }
    }
    calendar.presentPrecentage = (
      (calendar.present * 100) /
      calendar.days
    ).toFixed(2);
    calendar.absentPrecentage = (
      (calendar.absent * 100) /
      calendar.days
    ).toFixed(2);

    res.status(200).send({
      message: "One staff calendar related data.",
      calendar,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.staffAttendanceCalendarYearQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { month, year } = req.query.date;
    if (!sid || !year) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let regularexp = "";
    if (month) regularexp = new RegExp(`\/${month}\/${year}$`);
    else regularexp = new RegExp(`\/${year}$`);
    let calendar = {
      days: 0,
      present: 0,
      presentPrecentage: 0,
      absent: 0,
      absentPrecentage: 0,
      presentList: [],
      asbentList: [],
      holidayList: [],
      leaveList: [],
    };
    const staff = await Staff.findById(sid);
    if (staff?.attendDates?.length > 0) {
      const attendance = await StaffAttendenceDate.find({
        _id: { $in: staff.attendDates },
        staffAttendDate: { $regex: regularexp },
      }).select("staffAttendDate absentStaff");
      for (let day of attendance) {
        let flag = true;
        for (let abs of day?.absentStaff) {
          if (`${abs.staff}` === `${sid}`) {
            calendar.absent += 1;
            calendar.asbentList.push(day.staffAttendDate);
            flag = false;
            break;
          }
        }
        if (flag) {
          calendar.present += 1;
          calendar.presentList.push(day.staffAttendDate);
        }
      }
      calendar.days = attendance?.length ?? 0;
    }
    if (staff?.staffLeave?.length > 0) {
      const leave = await Leave.find({
        staff: { $eq: sid },
        status: { $eq: "Accepted" },
        date: { $regex: regularexp },
      }).select("date");
      for (let lt of leave) {
        calendar.leaveList.push(...lt.date);
      }
    }
    calendar.presentPrecentage = (
      (calendar.present * 100) /
      calendar.days
    ).toFixed(2);
    calendar.absentPrecentage = (
      (calendar.absent * 100) /
      calendar.days
    ).toFixed(2);

    res.status(200).send({
      message: "One staff calendar related data.",
      calendar,
    });
  } catch (e) {
    console.log(e);
  }
};

