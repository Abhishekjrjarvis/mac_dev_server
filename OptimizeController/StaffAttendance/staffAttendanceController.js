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
const Class = require("../../models/Class");
const Subject = require("../../models/Subject");
const Department = require("../../models/Department");
const Batch = require("../../models/Batch");
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

    let split_date = date?.split("/");
    const dt = new Date(`${split_date[2]}-${split_date[1]}-${split_date[0]}`);
    const attendance = new StaffAttendenceDate({
      staffAttendDate: date,
      institute: id,
      presentTotal: present?.length,
      absentTotal: absent?.length,
      staffAttendDateFormat: dt,
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
      if (staff.user.deviceToken) {
        invokeMemberTabNotification(
          "Staff Activity",
          notify,
          "Mark Attendence",
          staff.user._id,
          staff.user.deviceToken,
          "Staff",
          notify
        );
      }

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
    const { month, year } = req.query;
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

exports.staffTodayAttendanceStatsQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let regularexp = "";
    let server_date = attendance_today_date("yyyy-MM-DD")?.m_date?.split("-");
    regularexp = new RegExp(
      `${server_date[2]}\/${server_date[1]}\/${server_date[0]}$`
    );

    let obj = {
      present: 0,
      absent: 0,
      leave_with_pay: 0,
      on_duty_leave: 0,
      aid: "",
    };
    const attendance = await StaffAttendenceDate.findOne({
      institute: id,
      staffAttendDate: { $regex: regularexp },
    });
    if (attendance) {
      obj.aid = attendance?._id;
      obj.present = attendance.presentTotal;
      obj.absent = attendance.absentTotal;
    }

    res.status(200).send({
      message: "Today date staff attendance stats",
      stats: obj,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staffTodayAttendanceListStatsQuery = async (req, res) => {
  try {
    const { aid } = req.params;
    const { page, limit, flow, search } = req.query;
    if (!aid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = page ? parseInt(page) : 1;
    const itemPerPage = limit ? parseInt(limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const attendance = await StaffAttendenceDate.findById(aid);
    let staff_list = [];
    if (flow === "Present") {
      for (let ft of attendance.presentStaff ?? []) {
        staff_list.push(ft?.staff);
      }
    } else if (flow === "Absent") {
      for (let ft of attendance.absentStaff ?? []) {
        staff_list.push(ft?.staff);
      }
    } else if (flow === "Leave_with_pay") {
    } else {
    }
    var all_staff = [];
    if (!["", undefined, ""]?.includes(search)) {
      all_staff = await Staff.find({
        $and: [
          {
            _id: { $in: staff_list },
          },
          {
            $or: [
              {
                staffFirstName: { $regex: search, $options: "i" },
              },
              { staffMiddleName: { $regex: search, $options: "i" } },
              { staffLastName: { $regex: search, $options: "i" } },
              { staffROLLNO: { $regex: search, $options: "i" } },
            ],
          },
        ],
      }).select(
        "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto"
      );
    } else {
      all_staff = await Staff.find({
        _id: { $in: staff_list },
      })
        .select(
          "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto"
        )
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "Today date staff attendance stats List",
      all_staff: all_staff,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staffTimetableStatsQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, search } = req.query;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = page ? parseInt(page) : 1;
    const itemPerPage = limit ? parseInt(limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const department = await Department.find({
      institute: { $eq: `${id}` },
    }).select("departmentSelectBatch");

    const batches = [];
    for (let ft of department) {
      batches.push(ft?.departmentSelectBatch);
    }
    var cls_list = [];

    if (!["", undefined, ""]?.includes(search)) {
      cls_list = await Class.find({
        $and: [
          {
            batch: { $in: batches },
          },
          {
            $or: [
              {
                className: { $regex: search, $options: "i" },
              },
              { classTitle: { $regex: search, $options: "i" } },
            ],
          },
        ],
      })
        .populate({
          path: "classTeacher",
          select:
            "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto",
        })
        .select(
          "className classTitle classTeacher updated_timetable_count not_updated_timetable_count"
        );
    } else {
      cls_list = await Class.find({
        batch: { $in: batches },
      })
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: "classTeacher",
          select:
            "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto",
        })
        .select(
          "className classTitle classTeacher updated_timetable_count not_updated_timetable_count"
        );
    }

    res.status(200).send({
      message: "Timetable stats class list",
      cls_list: cls_list,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staffTimetableStatsSubjectListQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { page, limit, search, flow } = req.query;
    if (!cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = page ? parseInt(page) : 1;
    const itemPerPage = limit ? parseInt(limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const cls = await Class.findById(cid);

    const subjects = cls?.subject ?? [];

    var subject_list = [];

    if (!["", undefined, ""]?.includes(search)) {
      subject_list = await Subject.find({
        $and: [
          {
            _id: { $in: subjects },
          },
          {
            timetable_update: { $eq: `${flow}` },
          },

          {
            $or: [
              {
                subjectName: { $regex: search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "subjectTeacherName",
          select:
            "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto",
        })
        .select("subjectName subjectTeacherName");
    } else {
      subject_list = await Subject.find({
        $and: [
          {
            _id: { $in: subjects },
          },
          {
            timetable_update: { $eq: `${flow}` },
          },
        ],
      })
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: "subjectTeacherName",
          select:
            "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto",
        })
        .select("subjectName subjectTeacherName");
    }

    res.status(200).send({
      message: "Timetable stats class list",
      subject_list: subject_list,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staffTeachingPlanStatsQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const { page, limit, search } = req.query;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = page ? parseInt(page) : 1;
    const itemPerPage = limit ? parseInt(limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const department = await Department.find({
      institute: { $eq: `${id}` },
    }).select("departmentSelectBatch");
    const bt_id = [];
    for (let ft of department) {
      bt_id.push(ft?.departmentSelectBatch);
    }
    // const batches = await Batch.find({
    //   _id: { $in: bt_id },
    // }).populate({
    //   path: "classroom",
    //   select: "subject",
    // });

    // const sub_list = [];
    // for (let ft of batches) {
    //   for (let tt of ft?.classroom) {
    //     sub_list.push(...tt?.subject);
    //   }
    // }

    var all_staff = [];

    if (!["", undefined, ""]?.includes(search)) {
      all_staff = await Staff.find({
        $and: [
          {
            institute: { $eq: `${id}` },
          },
          {
            $or: [
              {
                staffFirstName: { $regex: search, $options: "i" },
              },
              { staffMiddleName: { $regex: search, $options: "i" } },
              { staffLastName: { $regex: search, $options: "i" } },
              { staffROLLNO: { $regex: search, $options: "i" } },
            ],
          },
        ],
      })
        .populate({
          path: "staffSubject",
          match: {
            batch: { $in: bt_id },
          },
          select: "teaching_plan",
        })
        .select(
          "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto"
        );
    } else {
      all_staff = await Staff.find({
        $and: [
          {
            institute: { $eq: `${id}` },
          },
        ],
      })
        // .skip(dropItem)
        // .limit(itemPerPage)
        .populate({
          path: "staffSubject",
          match: {
            batch: { $in: bt_id },
          },
          select: "teaching_plan",
        })
        .select(
          "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto"
        );
    }

    var teaching_plan = [];

    // for (let st of all_staff) {
    for (let i = 0; i < all_staff?.length; i++) {
      let st = all_staff[i];
      if (st?.staffSubject?.length > 0) {
        var obj = {
          staffFirstName: st?.staffFirstName,
          staffMiddleName: st?.staffMiddleName,
          staffLastName: st?.staffLastName,
          staffROLLNO: st?.staffROLLNO,
          photoId: st?.photoId,
          staffProfilePhoto: st?.staffProfilePhoto,
          _id: st?._id,
          updated_plan: 0,
          not_updated_plan: 0,
          remark: "red",
        };
        for (let sub of st?.staffSubject) {
          if (sub?.teaching_plan === "Yes") {
            obj.updated_plan += 1;
          } else {
            obj.not_updated_plan += 1;
          }
        }
        if (obj.updated_plan === obj.not_updated_plan) {
          obj.remark = "green";
        }
        teaching_plan.push(obj);
      }
    }

    if (["", undefined, ""]?.includes(search)) {
      teaching_plan = teaching_plan?.slice(dropItem, dropItem + itemPerPage);
    }
    res.status(200).send({
      message: "All staff list with teaching plan",
      teaching_plan: teaching_plan,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staffTeachingPlanStatsSubjectListQuery = async (req, res) => {
  try {
    const { id, sid } = req.params;
    const { page, limit, search, flow } = req.query;
    if (!id || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = page ? parseInt(page) : 1;
    const itemPerPage = limit ? parseInt(limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const department = await Department.find({
      institute: { $eq: `${id}` },
    }).select("departmentSelectBatch");
    const bt_id = [];
    for (let ft of department) {
      bt_id.push(ft?.departmentSelectBatch);
    }

    var subject_list = [];

    if (!["", undefined, ""]?.includes(search)) {
      subject_list = await Subject.find({
        $and: [
          {
            subjectTeacherName: { $eq: `${sid}` },
          },
          {
            batch: { $in: bt_id },
          },
          {
            teaching_plan: { $eq: `${flow}` },
          },
          {
            $or: [
              {
                subjectName: { $regex: search, $options: "i" },
              },
            ],
          },
        ],
      })
        .populate({
          path: "subjectTeacherName",
          select:
            "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto",
        })
        .select("subjectName subjectTeacherName");
    } else {
      subject_list = await Subject.find({
        $and: [
          {
            subjectTeacherName: { $eq: `${sid}` },
          },
          {
            batch: { $in: bt_id },
          },
          {
            teaching_plan: { $eq: `${flow}` },
          },
        ],
      })
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: "subjectTeacherName",
          select:
            "staffFirstName staffMiddleName staffLastName staffROLLNO photoId staffProfilePhoto",
        })
        .select("subjectName subjectTeacherName");
    }

    res.status(200).send({
      message: "Teaching plan stats subject list",
      subject_list: subject_list,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staffAttendanceInProfileWithRangeQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { from, to } = req.query;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let split_from = from?.split("/");
    let split_to = to?.split("/");
    const gte_Date = new Date(
      `${split_from[2]}-${split_from[1]}-${split_from[0]}`
    );
    const lte_Date = new Date(`${split_to[2]}-${split_to[1]}-${split_to[0]}`);
    lte_Date.setDate(lte_Date.getDate() + 1);

    const staff = await Staff.findById(sid);

    let all_attendance_count = staff?.attendDates?.length ?? 0;
    const stats = {
      total: all_attendance_count,
      present: 0,
      absent: 0,
      on_duty_leave: 0,
      leave_with_pay: 0,
    };
    var attendance = [];
    if (all_attendance_count > 0) {
      attendance = await StaffAttendenceDate.find({
        $and: [
          { _id: { $in: staff.attendDates } },
          {
            staffAttendDateFormat: {
              $gte: gte_Date,
              $lte: lte_Date,
            },
          },
        ],
      }).select("staffAttendDate absentStaff");
      for (let day of attendance) {
        let flag = true;
        for (let abs of day?.absentStaff) {
          if (`${abs.staff}` === `${sid}`) {
            stats.absent += 1;
            flag = false;
            break;
          }
        }
        if (flag) {
          stats.present += 1;
        }
      }
    }
    // if (staff?.staffLeave?.length > 0) {
    //   const leave = await Leave.find({
    //     staff: { $eq: sid },
    //     status: { $eq: "Accepted" },
    //     date: { $regex: regularexp },
    //   }).select("date");
    //   for (let lt of leave) {
    //     calendar.leaveList.push(...lt.date);
    //   }
    // }

    res.status(200).send({
      message: "One staff attendance stats in profile page",
      attendance,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.insertClassTimetableCountAndBatchToSubjectQuery = async (req, res) => {
  try {
    const cls = await Class.find({});
    let i = 0;
    let j = 0;
    const not_batch = [];
    // for (let ct of cls) {
    for (let z = 0; z < cls?.length; z++) {
      let ct = cls[z];
      if (ct?.batch) {
        for (let st of ct?.subject) {
          const sub = await Subject.findById(st);
          if (sub) {
            sub.batch = ct?.batch;
            sub.timetable_update = "No";
            sub.teaching_plan = "No";
            await sub.save();
            console.log("i :-> ", i);
            ++i;
          }
        }
      } else {
        not_batch.push(ct?._id);
      }

      ct.updated_timetable_count = 0;
      ct.not_updated_timetable_count = ct?.subject?.length;
      await ct.save();
      console.log("j :-> ", j);
      ++j;
    }
    res.status(200).send({
      message: "All subject insert field",
      i,
      j,
      not_batch,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.removeTimeSlotObjectInClassModelQuery = async (req, res) => {
  try {
    const cls = await Class.find({}).select("attendance_time_slot");

    for (let ct of cls) {
      for (let st of ct?.attendance_time_slot ?? []) {
        let at = [];
        if (`${st}`?.length === 24) {
          at.push(st);
        } else {
          console.log("it is object", st);
          break;
        }
      }
    }
    res.status(200).send({
      message: "All subject insert field",
      cls,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.staffAttendanceAdditionalFieldQuery = async (req, res) => {
  try {
    const attendance = await StaffAttendenceDate.find({});
    let i = 0;
    for (let at of attendance) {
      let split_date = at?.staffAttendDate?.split("/");
      const dt = new Date(`${split_date[2]}-${split_date[1]}-${split_date[0]}`);
      at.staffAttendDateFormat = dt;
      await at.save();
      console.log(i);
      ++i;
    }
    res.status(200).send({
      message: "All staff attendace date format added.",
    });
  } catch (e) {
    console.log(e);
  }
};

