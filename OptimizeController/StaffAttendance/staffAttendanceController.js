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
      total: 0,
      present: 0,
      present_percentage: 0,
      absent: 0,
      absent_percentage: 0,
      on_duty_leave: 0,
      leave_with_pay: 0,
      on_duty_leave_percentage: 0,
      leave_with_pay_percentage: 0,
      dates: {},
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
            flag = false;
            break;
          }
        }
        if (flag) {
          calendar.present += 1;
          calendar.dates[day.staffAttendDate] = "P";
        } else {
          calendar.absent += 1;
          calendar.dates[day.staffAttendDate] = "A";
        }
      }
      calendar.total = attendance?.length ?? 0;
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
    if (calendar.present > 0 && calendar.total > 0)
      calendar.present_percentage = (
        (calendar.present / calendar.total) *
        100
      )?.toFixed(2);
    if (calendar.absent > 0 && calendar.total > 0)
      calendar.absent_percentage = (
        (calendar.absent / calendar.total) *
        100
      )?.toFixed(2);
    if (calendar.leave_with_pay > 0 && calendar.total > 0)
      calendar.leave_with_pay_percentage = (
        (calendar.leave_with_pay / calendar.total) *
        100
      )?.toFixed(2);
    if (calendar.on_duty_leave > 0 && calendar.total > 0)
      calendar.on_duty_leave_percentage = (
        (calendar.on_duty_leave / calendar.total) *
        100
      )?.toFixed(2);

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
      present_percentage: 0,
      absent_percentage: 0,
      on_duty_leave_percentage: 0,
      leave_with_pay_percentage: 0,
      dates: {},
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
            flag = false;
            break;
          }
        }
        if (flag) {
          stats.present += 1;
          stats.dates[day.staffAttendDate] = "P";
        } else {
          stats.absent += 1;
          stats.dates[day.staffAttendDate] = "A";
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

    if (stats.present > 0 && stats.total > 0)
      stats.present_percentage = ((stats.present / stats.total) * 100)?.toFixed(
        2
      );
    if (stats.absent > 0 && stats.total > 0)
      stats.absent_percentage = ((stats.absent / stats.total) * 100)?.toFixed(
        2
      );
    if (stats.leave_with_pay > 0 && stats.total > 0)
      stats.leave_with_pay_percentage = (
        (stats.leave_with_pay / stats.total) *
        100
      )?.toFixed(2);
    if (stats.on_duty_leave > 0 && stats.total > 0)
      stats.on_duty_leave_percentage = (
        (stats.on_duty_leave / stats.total) *
        100
      )?.toFixed(2);
    res.status(200).send({
      message: "One staff attendance stats in profile page",
      stats,
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

exports.staffTimetableCustomCriteriaQuery = async (req, res) => {
  try {
    const subject = await Subject.find({});
    let i = 0;
    for (let sub of subject) {
      if (sub) {
        const cls = await Class.findById(sub?.class).populate({
          path: "timetableDayWise",
        });
        let flag = false;
        for (let ctl of cls?.timetableDayWise) {
          for (let sch of ctl?.schedule) {
            if (`${sch?.subject}` === `${sub?._id}`) {
              flag = true;
              break;
            }
          }
          if (flag) {
            break;
          }
        }
        if (flag) {
          sub.timetable_update = "Yes";
          cls.updated_timetable_count += 1;
          cls.not_updated_timetable_count -= 1;
        } else {
          sub.timetable_update = "No";
          cls.not_updated_timetable_count += 1;
        }
        await Promise.all([sub.save(), cls.save()]);
        console.log(i);
        ++i;
      }
    }
    res.status(200).send({
      message: "All subject timetable criteria is updated.",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staffTeachingPlanCustomCriteriaQuery = async (req, res) => {
  try {
    const subject = await Subject.find({
      subjectStatus: "UnCompleted",
    });
    let i = 0;
    for (let sub of subject) {
      if (sub?.chapter?.length > 0) {
        sub.teaching_plan = "Yes";
        await sub.save();
        console.log(i);
        ++i;
      }
    }
    res.status(200).send({
      message: "All subject teaching plan criteria is updated.",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.staff_self_in_attendance_query = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, sid, m_time } = req.body;

    if (!id || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    let split_date = date?.split("/");
    const dt = new Date(`${split_date[2]}-${split_date[1]}-${split_date[0]}`);

    let attendance = await StaffAttendenceDate.findOne({
      $and: [
        {
          institute: { $eq: `${id}` },
        },
        {
          staffAttendDate: {
            $eq: `${date}`,
          },
        },
      ],
    });
    if (attendance?._id) {
      attendance.presentTotal += 1;
      attendance.presentStaff.push({
        staff: sid,
        inTime: m_time,
        status: "Present",
      });
      await attendance.save();
      res.status(201).send({ message: "Staff Attendance in successfully." });
    } else {
      attendance = new StaffAttendenceDate({
        staffAttendDate: date,
        institute: id,
        staffAttendDateFormat: dt,
        presentTotal: 1,
        presentStaff: [
          {
            staff: sid,
            inTime: m_time,
            status: "Present",
          },
        ],
      });
      await attendance.save();
      res.status(201).send({ message: "Staff Attendance in successfully." });
      const institute = await InstituteAdmin.findById(id);
      institute.staffAttendance.push(attendance?._id);
      await institute.save();
    }
    const staff = await Staff.findById(sid);
    staff.attendDates.push(attendance._id);
    await staff.save();
  } catch (e) {
    console.log(e);
  }
};

exports.staff_self_out_attendance_query = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, sid, m_time } = req.body;

    if (!id || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let attendance = await StaffAttendenceDate.findOne({
      $and: [
        {
          institute: { $eq: `${id}` },
        },
        {
          staffAttendDate: {
            $eq: `${date}`,
          },
        },
      ],
    });
    if (attendance?._id && attendance.presentStaff?.length > 0) {
      for (let dt of attendance.presentStaff) {
        if (`${dt?.staff}` === `${sid}`) {
          dt.outTime = m_time;
          break;
        }
      }
      await attendance.save();
    }
    res.status(201).send({ message: "Staff Attendance out successfully." });
  } catch (e) {
    console.log(e);
  }
};

exports.staff_self_attendance_date_logs_query = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, sid } = req.query;

    if (!id || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    let self_losg = null;

    let attendance = await StaffAttendenceDate.findOne({
      $and: [
        {
          institute: { $eq: `${id}` },
        },
        {
          staffAttendDate: {
            $eq: `${date}`,
          },
        },
      ],
    });

    if (attendance?._id && attendance.presentStaff?.length > 0) {
      for (let dt of attendance.presentStaff) {
        if (`${dt?.staff}` === `${sid}`) {
          self_losg = dt;
          break;
        }
      }
    }
    res.status(201).send({
      message: "Staff Attendance out successfully.",
      access: true,
      self_losg,
    });
  } catch (e) {
    console.log(e);
  }
};
