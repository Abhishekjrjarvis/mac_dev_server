const Class = require("../../models/Class");
const Subject = require("../../models/Subject");
const Staff = require("../../models/Staff");
const Assignment = require("../../models/MCQ/Assignment");
const ClassTimetable = require("../../models/Timetable/ClassTimetable");
const InstituteAdmin = require("../../models/InstituteAdmin");
const {
  offStaffTimetableTimeCompare,
  // staffSideFromTimeComparison,
} = require("../../Utilities/timeComparison");
// const Student = require("../../models/Student");

exports.getDayWiseSchedule = async (req, res) => {
  try {
    if (!req.params.cid) throw "Please send class id to perform task";
    const classes = await Class.findById(req.params.cid)
      .populate({
        path: "timetableDayWise",
        match: { day: { $eq: req.query.status } },
        populate: {
          path: "schedule.assignStaff",
          select: "-_id staffFirstName staffMiddleName staffLastName",
        },
        select:
          "schedule.from schedule.subjectName schedule.to schedule.assignStaff",
      })
      .select("timetableDayWise")
      .lean()
      .exec();

    res.status(200).send({
      message: "Day wise all schedule list",
      dayList: classes.timetableDayWise?.[0]
        ? classes.timetableDayWise?.[0]
        : [],
    });
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
      //   console.log(timetable);
      await Promise.all([timetable.save(), classes.save()]);
    } else {
      // console.log("hi");
      classes.timetableDayWise[0].schedule.push({
        from: req.body.from,
        to: req.body.to,
        subject: subject._id,
        subjectName: subject.subjectName,
        assignStaff: subject.subjectTeacherName,
      });
      await classes.timetableDayWise[0].save();
      // console.log("hi", classes.timetableDayWise);
    }
    res.status(201).send({
      message: "New schedule is added ✔✔",
      //   classes: classes.timetableDayWise,
    });
  } catch (e) {
    console.log(e);
    res.status(200).send({
      message: e,
    });
  }
};

exports.addDateWiseSchedule = async (req, res) => {
  try {
    if (!req.params.cid || !req.body?.subjectId)
      throw "Please send class id to perform task";
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
      // console.log("hi");
      classes.timetableDateWise[0].schedule.push({
        from: req.body.from,
        to: req.body.to,
        subject: subject._id,
        subjectName: subject.subjectName,
        assignStaff: subject.subjectTeacherName,
      });
      await classes.timetableDateWise[0].save();
      // console.log("hi", classes.timetableDayWise);
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
          select: "-_id staffFirstName staffMiddleName staffLastName",
        },
        select:
          "schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff",
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
          select: "-_id staffFirstName staffMiddleName staffLastName",
        },
        select:
          "schedule.from schedule.subjectName schedule.subject schedule.to schedule.assignStaff",
      })
      .select("timetableDayWise")
      .lean()
      .exec();
    if (classesDay?.timetableDayWise?.length) {
      for (let daywise of classesDay?.timetableDayWise[0]?.schedule) {
        if (classes?.timetableDateWise?.length) {
          for (let datewise of classes?.timetableDateWise[0]?.schedule) {
            if (String(daywise.subject) === String(datewise.subject)) {
              daywise.from = datewise.from;
              daywise.to = datewise.to;
              daywise.assignStaff = datewise.assignStaff;
            }
          }
        }
      }
    }

    res.status(200).send({
      message: "Day wise all schedule list",
      // dayList: classes.timetableDateWise?.[0]
      //   ? classes.timetableDateWise?.[0]
      //   : [],
      dateList: classesDay.timetableDayWise?.[0]
        ? classesDay.timetableDayWise?.[0]
        : [],
    });
  } catch (e) {
    res.status(200).send({
      message: e,
    });
    console.log(e);
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
    res.status(200).send({
      message: "Staff schedule replaced by other staff  ✔✔",
      // offStaffList,
      // timetableOff,
      offStaff,
    });
  } catch (e) {
    console.log(e);
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

    res.status(200).send({
      message: "Staff side all schedule list",
      staffSchedlue,
    });
  } catch (e) {
    res.status(200).send({ message: e });
    console.log(e);
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
      studentScheduleList.push({
        from: sched.from,
        subjectName: sched.subjectName,
        to: sched.to,
        assignment: assignmentObj,
        assignStaff: sched.assignStaff,
        offStaff: sched?.offStaff,
      });
    }
    res.status(200).send({
      message: "Student side all schedule list",
      studentScheduleList,
    });
  } catch (e) {
    res.status(200).send({ message: e });
    console.log(e);
  }
};
