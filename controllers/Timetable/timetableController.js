const Class = require("../../models/Class");
const Subject = require("../../models/Subject");
const Staff = require("../../models/Staff");
const Assignment = require("../../models/MCQ/Assignment");
const ClassTimetable = require("../../models/Timetable/ClassTimetable");
const InstituteAdmin = require("../../models/InstituteAdmin");
const ChapterTopic = require("../../models/Academics/ChapterTopic");
const {
  offStaffTimetableTimeCompare,
  // staffSideFromTimeComparison,
} = require("../../Utilities/timeComparison");
const { custom_date_time } = require("../../helper/dayTimer");
const { get_day_wise_sort } = require("./timetableHelper");
const AttendenceDate = require("../../models/AttendenceDate");
// const Student = require("../../models/Student");
// const encryptionPayload = require("../../Utilities/Encrypt/payload");

exports.getDayWiseSchedule = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "timetableDayWise",
        match: { day: { $eq: req.query.status } },
        populate: {
          path: "schedule.assignStaff",
          select:
            "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
        },
        select:
          "schedule._id schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff",
      })
      .populate({
        path: "timetableDayWise",
        match: { day: { $eq: req.query.status } },
        populate: {
          path: "schedule.subject",
          populate: {
            path: "selected_batch_query",
            select: "batchName",
          },
          select: "subjectOptional selected_batch_query subject_category",
        },
        select:
          "schedule._id schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff",
      })
      .select("timetableDayWise")
      .lean()
      .exec();
    if (classes?.timetableDayWise?.[0]) {
      let modify_obj = {
        ...classes.timetableDayWise?.[0],
        schedule: get_day_wise_sort(classes.timetableDayWise?.[0]?.schedule),
      };

      // const cEncrypt = await encryptionPayload(classes.timetableDayWise?.[0]);
      res.status(200).send({
        message: "Day wise all schedule list",
        dayList: modify_obj,
      });
    } else {
      res.status(200).send({
        message: "Day wise all schedule list",
        dayList: [],
      });
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.addDayWiseSchedule = async (req, res) => {
  try {
    if (!req.params.cid || !req.body?.subjectId)
      throw "Please send class id to perform task";
    const { sfid } = req.query;
    const classes = await Class.findById(req.params.cid).populate({
      path: "timetableDayWise",
      match: { day: { $eq: req.body.day } },
    });
    const subject = await Subject.findById(req.body.subjectId);
    if (classes.timetableDayWise?.length <= 0) {
      const timetable = new ClassTimetable({
        day: req.body.day,
        class: req.params.cid,
        schedule: [
          {
            from: req.body.from,
            to: req.body.to,
            subject: subject._id,
            subjectName: subject.subjectName,
            assignStaff: subject.subjectTeacherName,
          },
        ],
      });
      classes.timetableDayWise.push(timetable._id);
      await Promise.all([timetable.save(), classes.save()]);
    } else {
      let flag = false;
      let flagIndex = false;
      let timet = classes.timetableDayWise[0].schedule;
      for (let i = 0; i < timet?.length; i++) {
        if (String(timet[i]._id) === String(sfid)) {
          flag = true;
          flagIndex = i;
          break;
        }
      }
      if (flag) {
        timet[flagIndex].from = req.body.from;
        timet[flagIndex].to = req.body.to;
        timet[flagIndex].subject = subject._id;
        timet[flagIndex].subjectName = subject.subjectName;
        timet[flagIndex].assignStaff = subject.subjectTeacherName;
      } else {
        classes.timetableDayWise[0].schedule.push({
          from: req.body.from,
          to: req.body.to,
          subject: subject._id,
          subjectName: subject.subjectName,
          assignStaff: subject.subjectTeacherName,
        });
      }

      await classes.timetableDayWise[0].save();
      // console.log("hi", classes.timetableDayWise);
      // console.log("hi", classes.timetableDayWise?.[0]?.schedule[0]);
    }
    res.status(201).send({
      message: "New schedule is added ✔✔",
      //   classes: classes.timetableDayWise,
    });
  } catch (e) {
    // console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.addDateWiseSchedule = async (req, res) => {
  try {
    if (!req.params.cid || !req.body?.subjectId)
      throw "Please send class id to perform task";
    const { sfid } = req.query;
    const classes = await Class.findById(req.params.cid).populate({
      path: "timetableDateWise",
      match: { date: { $eq: req.body.date } },
    });
    const subject = await Subject.findById(req.body.subjectId);
    if (classes.timetableDateWise?.length <= 0) {
      const timetable = new ClassTimetable({
        day: req.body.day,
        date: req.body.date,
        class: req.params.cid,
        schedule: [
          {
            from: req.body.from,
            to: req.body.to,
            subject: subject._id,
            subjectName: subject.subjectName,
            assignStaff: subject.subjectTeacherName,
          },
        ],
      });
      classes.timetableDateWise.push(timetable._id);
      //   console.log(timetable);
      await Promise.all([timetable.save(), classes.save()]);
    } else {
      let flag = false;
      let flagIndex = false;
      let timet = classes.timetableDateWise[0].schedule;
      for (let i = 0; i < timet?.length; i++) {
        if (String(timet[i]._id) === String(sfid)) {
          flag = true;
          flagIndex = i;
          break;
        }
      }
      if (flag) {
        timet[flagIndex].from = req.body.from;
        timet[flagIndex].to = req.body.to;
        timet[flagIndex].subject = subject._id;
        timet[flagIndex].subjectName = subject.subjectName;
        timet[flagIndex].assignStaff = subject.subjectTeacherName;
      } else {
        classes.timetableDateWise[0].schedule.push({
          from: req.body.from,
          to: req.body.to,
          subject: subject._id,
          subjectName: subject.subjectName,
          assignStaff: subject.subjectTeacherName,
        });
      }
      await classes.timetableDateWise[0].save();
    }
    res.status(201).send({
      message: "New schedule is added ✔✔",
      //   classes: classes.timetableDayWise,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getDateWiseSchedule = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "timetableDateWise",
        match: { date: { $eq: req.query.date } },
        populate: {
          path: "schedule.assignStaff",
          select: "staffFirstName staffMiddleName staffLastName",
        },
        select:
          "schedule._id schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff",
      })
      .populate({
        path: "timetableDayWise",
        match: { date: { $eq: req.query.date } },
        populate: {
          path: "schedule.subject",
          populate: {
            path: "selected_batch_query",
            select: "batchName",
          },
          select: "subjectOptional selected_batch_query subject_category",
        },
        select:
          "schedule._id schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff",
      })
      .select("timetableDateWise")
      .lean()
      .exec();

    const classesDay = await Class.findById(req.params.cid)
      .populate({
        path: "timetableDayWise",
        match: { day: { $eq: req.query.status } },
        populate: {
          path: "schedule.assignStaff",
          select:
            "staffFirstName staffMiddleName staffLastName staffProfilePhoto photoId",
        },
        select:
          "schedule._id schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff",
      })
      .populate({
        path: "timetableDayWise",
        match: { day: { $eq: req.query.status } },
        populate: {
          path: "schedule.subject",
          populate: {
            path: "selected_batch_query",
            select: "batchName",
          },
          select: "subjectOptional selected_batch_query subject_category",
        },
        select:
          "schedule._id schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff",
      })
      .select("timetableDayWise")
      .lean()
      .exec();
    if (classesDay?.timetableDayWise?.length) {
      for (let daywise of classesDay?.timetableDayWise[0]?.schedule) {
        if (classes?.timetableDateWise?.length) {
          for (let datewise of classes?.timetableDateWise[0]?.schedule) {
            if (
              String(daywise.subject?._id) === String(datewise.subject?._id)
            ) {
              // var all_topic = await ChapterTopic.find({ subject: `${datewise.subject}`})
              daywise.from = datewise.from;
              daywise.to = datewise.to;
              daywise.assignStaff = datewise.assignStaff;
            }
          }
        }
      }
    }
    if (classesDay.timetableDayWise?.[0]) {
      // const classesEncrypt = await encryptionPayload(classesDay.timetableDayWise?.[0]);
      res.status(200).send({
        message: "Day wise all schedule list",
        dateList: classesDay.timetableDayWise?.[0],
      });
    } else {
      res.status(200).send({
        message: "Day wise all schedule list",
        dateList: [],
      });
    }
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    // console.log(e);
  }
};

exports.getOneStaffAllSchedule = async (req, res) => {
  try {
    if (!req.params.sid)
      throw "Please send staff Id that assign as role of subject teacher";
    const staff = await Staff.findById(req.params.sid)
      .select("staffSubject")
      .lean()
      .exec();
    const subjects = await Subject.find({ _id: { $in: staff.staffSubject } })
      .populate({
        path: "class",
        populate: {
          path: "timetableDateWise",
          match: {
            date: { $eq: req.query.date },
          },
          populate: {
            path: "schedule.offStaff",
            select: "-_id staffFirstName staffMiddleName staffLastName",
          },
          select:
            "schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff schedule.offStaff",
        },
        select: "timetableDateWise className classTitle",
      })
      .populate({
        path: "class",
        populate: {
          path: "timetableDayWise",
          match: {
            day: { $eq: req.query.status },
          },
          populate: {
            path: "schedule.offStaff",
            select: "-_id staffFirstName staffMiddleName staffLastName",
          },
          select:
            "schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff schedule.offStaff",
        },
        select: "timetableDayWise className classTitle",
      })
      .select("class")
      .lean()
      .exec();
    const scheduleList = [];
    subjects?.forEach((sub) => {
      if (
        sub?.class?.timetableDayWise?.length ||
        sub?.class?.timetableDateWise?.length
      ) {
        const dayList = [...sub?.class?.timetableDayWise[0].schedule].filter(
          (val) => req.params.sid === String(val.assignStaff)
        );

        dayList?.forEach((daywise) => {
          sub?.class?.timetableDateWise[0]?.schedule?.forEach((datewise) => {
            if (String(daywise.subject) === String(datewise.subject)) {
              daywise.from = datewise.from;
              daywise.to = datewise.to;
              daywise.offStaff = datewise.offStaff;
            }
          });
        });

        scheduleList.push({
          _id: sub?.class?._id,
          className: sub?.class?.className,
          classTitle: sub?.class?.classTitle,
          schedule: dayList,
        });
      }
    });
    // const sEncrypt = await encryptionPayload(scheduleList);
    res.status(200).send({
      message: "Staff schedule list of particular date",
      // subjects,
      scheduleList,
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
  }
};

exports.replaceOneStaffSchedule = async (req, res) => {
  try {
    if (!req.params.sid || !req.body?.classId)
      throw "Please send class id to perform task";
    const classes = await Class.findById(req.body.classId).populate({
      path: "timetableDateWise",
      match: { date: { $eq: req.body.date } },
    });
    const subject = await Subject.findById(req.body.subjectId);
    if (classes.timetableDateWise?.length <= 0) {
      const timetable = new ClassTimetable({
        day: req.body.day,
        date: req.body.date,
        class: req.body.classId,
        schedule: [
          {
            from: req.body.from,
            to: req.body.to,
            subject: subject._id,
            subjectName: subject.subjectName,
            assignStaff: subject.subjectTeacherName,
            offStaff: req.body.replacedStaffId,
          },
        ],
      });
      classes.timetableDateWise.push(timetable._id);
      await Promise.all([timetable.save(), classes.save()]);
    } else {
      classes.timetableDateWise[0]?.schedule?.forEach(async (sched) => {
        if (String(sched.assignStaff) === req.params.sid) {
          sched.offStaff = req.body.replacedStaffId;
        } else {
          classes.timetableDateWise[0].schedule.push({
            from: req.body.from,
            to: req.body.to,
            subject: subject._id,
            subjectName: subject.subjectName,
            assignStaff: subject.subjectTeacherName,
            offStaff: req.body.replacedStaffId,
          });
          // await classes.timetableDateWise[0].save();
        }
      });
    }
    await classes.timetableDateWise[0].save();
    res.status(200).send({
      message: "Staff schedule replaced by other staff  ✔✔",
      //   classes: classes.timetableDayWise,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getInstituteAllotStaff = async (req, res) => {
  try {
    if (!req.params.id) throw "Please send institute id to perform task";
    const institute = await InstituteAdmin.findById(req.params.id).select(
      "classRooms ApproveStaff"
    );
    // .lean()
    // .exec();

    const timetableOff = await ClassTimetable.find({
      class: { $in: institute?.classRooms },
      $and: [
        { date: { $eq: req.query.date } },
        { day: { $eq: req.query.status } },
      ],
    });
    const offStaffList = [];
    // console.log(institute.ApproveStaff);
    timetableOff?.forEach((timetable) => {
      institute.ApproveStaff?.forEach((staff) => {
        timetable?.schedule?.forEach((sched) => {
          if (
            String(staff) === String(sched.assignStaff) ||
            String(staff) === String(sched.offStaff)
          ) {
            // console.log(
            //   offStaffTimetableTimeCompare(
            //     req.query.from,
            //     req.query.to,
            //     sched.from,
            //     sched.to
            //   )
            // );
            if (
              !offStaffTimetableTimeCompare(
                req.query.from,
                req.query.to,
                sched.from,
                sched.to
              )
            )
              offStaffList.push(staff);
            // console.log(sched);
          } else {
            offStaffList.push(staff);
          }
        });
      });
    });

    const offStaff = await Staff.find({ _id: { $in: offStaffList } }).select(
      "staffFirstName staffMiddleName staffLastName staffProfilePhoto staffROLLNO"
    );
    // const oEncrypt = await encryptionPayload(offStaff);
    res.status(200).send({
      message: "Staff schedule replaced by other staff  ✔✔",
      // offStaffList,
      // timetableOff,
      offStaff,
    });
  } catch (e) {
    // console.log(e);
    res.status(200).send({
      message: e,
      //   classes: classes.timetableDayWise,
    });
  }
};

exports.getStaffSideDateWise = async (req, res) => {
  try {
    if (!req.params.sid) throw "Please send staff id to perform task";
    const timetable = await ClassTimetable.find({
      $or: [
        { date: { $eq: req.query.date } },
        { day: { $eq: req.query.status } },
      ],
      $and: [
        {
          $or: [
            { "schedule.offStaff": { $eq: req.params.sid } },
            { "schedule.assignStaff": { $eq: req.params.sid } },
          ],
        },
      ],
    })
      .populate({
        path: "class",
        select: "className classTitle",
      })
      .lean()
      .exec();
    const staffSchedlue = [];
    for (let table of timetable) {
      for (let sched of table?.schedule) {
        if (String(sched.assignStaff) === req.params.sid) {
          const assignment = await Assignment.find({
            subject: { $eq: sched.subject },
            dueDate: { $eq: req.query.date },
          });
          const assignmentObj = [];
          for (let assign of assignment) {
            assignmentObj.push({
              assignmentName: assign.assignmentName,
              _id: assign._id,
            });
          }
          staffSchedlue.push({
            _id: table.class._id,
            className: table.class.className,
            classTitle: table.class.classTitle,
            from: sched.from,
            subjectName: sched.subjectName,
            to: sched.to,
            offPeriod: false,
            assignment: assignmentObj,
          });
        } else if (String(sched.offStaff) === req.params.sid) {
          staffSchedlue.push({
            _id: table.class._id,
            className: table.class.className,
            classTitle: table.class.classTitle,
            from: sched.from,
            subjectName: sched.subjectName,
            to: sched.to,
            offPeriod: true,
            assignment: [],
          });
        } else {
        }
      }
    }
    // const staffScheduleEncrypt = await encryptionPayload(staffSchedlue);
    res.status(200).send({
      message: "Staff side all schedule list",
      staffSchedlue,
    });
  } catch (e) {
    res.status(200).send({ message: e });
    // console.log(e);
  }
};

exports.getStudentSideDateWise = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send staff id to perform task";
    const timetable = await ClassTimetable.find({
      $and: [
        { class: { $eq: req.params.cid } },
        {
          $or: [
            { date: { $eq: req.query.date } },
            { day: { $eq: req.query.status } },
          ],
        },
      ],
    })
      .populate({
        path: "schedule.assignStaff",
        select: "-_id staffFirstName staffMiddleName staffLastName staffGender",
      })
      .populate({
        path: "schedule.offStaff",
        select: "-_id staffFirstName staffMiddleName staffLastName staffGender",
      })
      .lean()
      .exec();
    const scheduleList = [];
    const scheduleList1 = [];
    for (let timet of timetable) {
      if (timet.day === req.query.status && !timet?.date)
        scheduleList.push(...timet.schedule);
      else if (timet.day === req.query.status && timet?.date === req.query.date)
        scheduleList1.push(...timet.schedule);
      else {
      }
    }

    for (let sched of scheduleList) {
      for (let sched1 of scheduleList1) {
        if (String(sched.subject) === String(sched1.subject)) {
          sched.from = sched1.from;
          sched.to = sched1.to;
          sched.offStaff = sched1.offStaff;
        }
      }
    }
    const studentScheduleList = [];
    for (let sched of scheduleList) {
      const assignment = await Assignment.find({
        subject: { $eq: sched.subject },
        dueDate: { $eq: req.query.date },
      });
      const assignmentObj = [];
      for (let assign of assignment) {
        assignmentObj.push({
          assignmentName: assign.assignmentName,
          _id: assign._id,
        });
      }
      var valid_date = custom_date_time(0);
      // console.log(valid_date);
      var one_topic = await ChapterTopic.find({
        $and: [
          {
            topic_last_date: `${valid_date}`,
          },
          {
            subject: sched?.subject,
          },
        ],
      });
      // console.log(one_topic);
      studentScheduleList.push({
        from: sched.from,
        subjectName: sched.subjectName,
        to: sched.to,
        assignment: assignmentObj,
        assignStaff: sched.assignStaff,
        offStaff: sched?.offStaff,
        topic: [...one_topic],
      });
    }
    // const studentEncrypt = await encryptionPayload(studentScheduleList);
    res.status(200).send({
      message: "Student side all schedule list",
      studentScheduleList,
    });
  } catch (e) {
    res.status(200).send({ message: e });
    // console.log(e);
  }
};

const DayName = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Staurday",
];
exports.getSyncWiseStudentQuery = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const timetable = await ClassTimetable.find({
      $and: [{ class: { $eq: req.params.cid } }, { day: { $in: DayName } }],
    })
      .populate({
        path: "schedule.assignStaff",
        select: "staffFirstName staffMiddleName staffLastName staffGender",
      })
      .populate({
        path: "schedule.subject",
        populate: {
          path: "selected_batch_query",
          select: "batchName",
        },
        select: "subjectName subjectOptional subject_category",
      })
      .lean()
      .exec();

    var syncDay = {
      Monday: null,
      Tuesday: null,
      Wednesday: null,
      Thursday: null,
      Friday: null,
      Staurday: null,
    };

    for (let timet of timetable) {
      syncDay[timet.day] = get_day_wise_sort(timet?.schedule);
    }
    // const studentEncrypt = await encryptionPayload(syncDay);
    res.status(200).send({
      message: "Student side all schedule list",
      syncScheduleList: syncDay,
    });
  } catch (e) {
    res.status(200).send({ message: e });
    // console.log(e);
  }
};

exports.getSyncWiseStaffQuery = async (req, res) => {
  try {
    if (!req.params.sid)
      throw "Please send staff Id that assign as role of subject teacher";
    const staff = await Staff.findById(req.params.sid)
      .select("staffSubject")
      .lean()
      .exec();

    const subjects = await Subject.find({ _id: { $in: staff.staffSubject } })
      .populate({
        path: "class",
        populate: {
          path: "timetableDayWise",
          match: {
            day: { $in: DayName },
          },
          populate: {
            path: "schedule.subject",
            populate: {
              path: "selected_batch_query",
              select: "batchName",
            },
            select: "subjectName subjectOptional subject_category",
          },
          select: "day schedule.from schedule.subject schedule.to",
        },
        select: "timetableDayWise className classTitle",
      })
      .select("class")
      .lean()
      .exec();

    var syncDay = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Staurday: [],
    };

    for (let sub of subjects) {
      for (let ttable of sub?.class?.timetableDayWise) {
        let synObj = {
          className: sub?.class?.className,
          classTitle: sub?.class?.classTitle,
          schedule: [],
        };
        let not_sort_scheudle = [];
        for (let timet of ttable?.schedule) {
          if (String(sub?._id) === String(timet?.subject?._id)) {
            not_sort_scheudle.push({
              ...timet,
            });
          }
        }

        synObj.schedule = get_day_wise_sort(not_sort_scheudle);
        syncDay[ttable.day]?.push(synObj);
      }
    }
    // const studentEncrypt = await encryptionPayload(syncDay);
    res.status(200).send({
      message: "Staff side all schedule list",
      syncScheduleList: syncDay,
    });
  } catch (e) {
    res.status(200).send({ message: e });
    // console.log(e);
  }
};

exports.renderDestroyScheduleQuery = async (req, res) => {
  try {
    const { tid } = req.params;
    const { flow, scid } = req?.query;
    if (!tid)
      return res.status(200).send({
        message: "Their is a bug need to fixed immediately",
        access: false,
      });

    var valid_table = await ClassTimetable.findById({ _id: tid });
    var classes = await Class.findById({ _id: `${valid_table?.class}` });
    if (flow === "ENTIRE") {
      if (classes?.timetableDayWise?.includes(`${valid_table?._id}`)) {
        classes.timetableDayWise.pull(valid_table?._id);
      }
      if (classes?.timetableDateWise?.includes(`${valid_table?._id}`)) {
        classes.timetableDateWise.pull(valid_table?._id);
      }
      await classes.save();
      await ClassTimetable.findByIdAndDelete(valid_table?._id);
      res.status(200).send({
        message: "Explore Entire Timetable Deletion Operation Completed",
        access: true,
      });
    } else if (flow === "PARTICULAR") {
      for (var ref of valid_table?.schedule) {
        if (`${ref?._id}` === `${scid}`) {
          valid_table.schedule.pull(ref?._id);
        }
      }
      await valid_table.save();
      res.status(200).send({
        message: "Explore Particular Timetable Deletion Operation Completed",
        access: true,
      });
    } else {
      res.status(200).send({
        message: "Invalid Flow",
        access: false,
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getSubjectDateWiseScheduleQuery = async(req, res) => {
  try{
    const { sid } = req?.params
    const { date, status } = req?.query
    if(!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const subject = await Subject.findById({ _id: sid })
    const time_table = await ClassTimetable.findOne({ $and: [{ class: `${subject?.class}`}], $or:[
      {
        date: { $eq: date }
      },
      {
        day: `${status}`
      }
    ] })

    console.log(time_table)

    var list = time_table?.schedule?.filter((val) => {
      if(`${val?.subject}` === `${subject?._id}`) return val
    })

    res.status(200).send({ message: "Explore One Subject Time Table Query", access: true, list: list})
  }
  catch(e){
    console.log(e)
  }
}

exports.getSubjectDateWiseScheduleAttendenceQuery = async(req, res) => {
  try{
    const { sid } = req?.params
    const { date, from, to } = req?.query
    if(!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const subject = await Subject.findById({ _id: sid })
    const attend = await AttendenceDate.find({
      $and: [{
        subject: `${subject?._id}`
      },
    {
      attendDate: { $eq: `${date}` },
    },
  {
    from: `${from}`
  }, 
  {
    to: `${to}`
  }]
    })

    res.status(200).send({ message: "Explore One Subject Time Table Query", access: true, attend: attend, attendence_exist: attend?.length, dynamic: attend?.length > 0 ? "Attendence Already Marked At This Timestamp" : "mark New Attendence At This Timestamp"})

  }
  catch(e){
    console.log(e)
  }
}

exports.getSubjectDateWiseScheduleUpdateTimeTableQuery = async(req, res) => {
  try{
    const { sid } = req?.params
    const { date, from, to, status } = req?.query
    if(!sid) return res.status(200).send({ message: "Their is a bug need to fixed immediately", access: false})

    const subject = await Subject.findById({ _id: sid })
    const time_table = await ClassTimetable.findOne({ $and: [{ class: `${subject?.class}`}],
    $or:[
      {
        date: { $eq: date }
      },
      {
        day: `${status}`
      }
    ]
  })

    time_table?.schedule?.filter((val) => {
      if(`${val?.subject}` === `${subject?._id}`){
        val.from = `${from}`
        val.to = `${to}`
      }
    })

    res.status(200).send({ message: "Explore One Subject Time Table Query", access: true})
  }
  catch(e){
    console.log(e)
  }
}

exports.addDayWiseScheduleAutoQuery = async (req, res) => {
  try {
    if (!req.params.cid || !req.body?.subjectId)
      throw "Please send class id to perform task";
    const { sfid } = req.query;
    const classes = await Class.findById(req.params.cid).populate({
      path: "timetableDayWise",
      match: { day: { $eq: req.body.day } },
    });
    const subject = await Subject.findById(req.body.subjectId);
    if (classes.timetableDayWise?.length <= 0) {
      const timetable = new ClassTimetable({
        day: req.body.day,
        class: req.params.cid,
        schedule: [
          {
            from: req.body.from,
            to: req.body.to,
            subject: subject._id,
            subjectName: subject.subjectName,
            assignStaff: subject.subjectTeacherName,
          },
        ],
      });
      classes.timetableDayWise.push(timetable._id);
      await Promise.all([timetable.save(), classes.save()]);
    } else {
      let flag = false;
      let flagIndex = false;
      let timet = classes.timetableDayWise[0].schedule;
      for (let i = 0; i < timet?.length; i++) {
        if (String(timet[i]._id) === String(sfid)) {
          flag = true;
          flagIndex = i;
          break;
        }
      }
      if (flag) {
        timet[flagIndex].from = req.body.from;
        timet[flagIndex].to = req.body.to;
        timet[flagIndex].subject = subject._id;
        timet[flagIndex].subjectName = subject.subjectName;
        timet[flagIndex].assignStaff = subject.subjectTeacherName;
      } else {
        classes.timetableDayWise[0].schedule.push({
          from: req.body.from,
          to: req.body.to,
          subject: subject._id,
          subjectName: subject.subjectName,
          assignStaff: subject.subjectTeacherName,
        });
      }

      await classes.timetableDayWise[0].save();
      // console.log("hi", classes.timetableDayWise);
      // console.log("hi", classes.timetableDayWise?.[0]?.schedule[0]);
    }
  } catch (e) {
    console.log(e);
  }
};


const convert_time_format = (data) => {
  let data_string = `${data}`?.trim();
  let hr =
    data_string?.length > 3
      ? `${data_string?.substring(0, 2)}`
      : `${data_string?.substring(0, 1)}`;
  let mt =
    data_string?.length > 3
      ? `${data_string?.substring(2)}`
      : `${data_string?.substring(1)}`;
  let meridian = "Am";
  if (+hr > 12) {
    let rt = +hr - 12;
    hr = rt > 9 ? `${rt}` : `0${rt}`;
    meridian = "Pm";
  }
  return `${hr}:${mt} ${meridian}`;
};

// let row = {
//   subjectName: "",
//   SubjectStatus: "",
//   SubjectBatch: "",
//   day_arr: ["Monday", "Tuesday", "Wednesday"],
//   Monday: "1200-1300",
//   Tuesday: "1200-1300",
//   Wednesday: "1200-1300",
//   Monday: "1200-1300",
//   Monday: "1200-1300",
//   Monday: "1200-1300",
//   Monday: "1200-1300",
// };

exports.addTimeTableExcelQuery = async (rows, clsId) => {
  try {
    var subject = null;
    if (rows?.SubjectStatus?.trim() === "Theory") {
      subject = await Subject.findOne({
        $and: [
          {
            class: { $eq: `${clsId}` },
          },
          {
            subjectName: { $eq: `${rows?.Subject?.trim()}` },
          },
          {
            subject_category: { $eq: `${rows?.SubjectStatus?.trim()}` },
          },
        ],
      });
    } else {
      let multi_subject = await Subject.find({
        $and: [
          {
            class: { $eq: `${clsId}` },
          },
          {
            subjectName: { $eq: `${rows?.Subject?.trim()}` },
          },
          {
            subject_category: { $eq: `${rows?.SubjectStatus?.trim()}` },
          },
        ],
      }).populate({
        path: "selected_batch_query",
        match: {
          batchName: {
            $eq: `${rows?.SubjectBatch?.trim()}`,
          },
        },
      });
      for (let sub of multi_subject ?? []) {
        if (sub.selected_batch_query) {
          subject = sub;
          break;
        }
      }
    }

    for (let day of rows?.day_arr) {
      const classes = await Class.findById(clsId).populate({
        path: "timetableDayWise",
        match: { day: { $eq: day } },
      });
      if (rows[day] === "#NA") {
      } else {
        let time_split = [];
        if (rows[day]?.includes("-")) time_split = rows[day]?.split("-");
        else if (rows[day]?.includes("to")) time_split = rows[day]?.split("to");
        else if (rows[day]?.includes(",")) time_split = rows[day]?.split(",");
        else time_split = [];
        if (classes.timetableDayWise?.length <= 0) {
          const timetable = new ClassTimetable({
            day: day,
            class: clsId,
            schedule: [
              {
                from: convert_time_format(time_split?.[0]),
                to: convert_time_format(time_split?.[1]),
                subject: subject._id,
                subjectName: subject.subjectName,
                assignStaff: subject.subjectTeacherName,
              },
            ],
          });
          classes.timetableDayWise.push(timetable._id);
          await Promise.all([timetable.save(), classes.save()]);
        } else {
          let flag = false;
          let flagIndex = false;
          let timet = classes.timetableDayWise[0].schedule;
          for (let i = 0; i < timet?.length; i++) {
            if (String(timet[i]._id) === String(sfid)) {
              flag = true;
              flagIndex = i;
              break;
            }
          }
          if (flag) {
            timet[flagIndex].from = convert_time_format(time_split?.[0]);
            timet[flagIndex].to = convert_time_format(time_split?.[1]);
            timet[flagIndex].subject = subject._id;
            timet[flagIndex].subjectName = subject.subjectName;
            timet[flagIndex].assignStaff = subject.subjectTeacherName;
          } else {
            classes.timetableDayWise[0].schedule.push({
              from: convert_time_format(time_split?.[0]),
              to: convert_time_format(time_split?.[1]),
              subject: subject._id,
              subjectName: subject.subjectName,
              assignStaff: subject.subjectTeacherName,
            });
          }

          await classes.timetableDayWise[0].save();
        }
      }
    }
  } catch (e) {
    // console.log(e);
  }
};
