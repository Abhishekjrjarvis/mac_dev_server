const Student = require("../../models/Student");
const Class = require("../../models/Class");
const AttendenceDate = require("../../models/AttendenceDate");
const Holiday = require("../../models/Holiday");
const Department = require("../../models/Department");
const StaffAttendenceDate = require("../../models/StaffAttendenceDate");
const Staff = require("../../models/Staff");
const Batch = require("../../models/Batch");

exports.getAttendStudentClass = async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .select("className classTitle classStatus classStartDate")
      .populate({
        path: "ApproveStudent",
        select:
          "studentFirstName studentMiddleName studentLastName studentROLLNO",
      })
      .lean()
      .exec();
    if (classes) {
      res.status(200).send({ message: "Success", classes });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getAttendStudentClassById = async (req, res) => {
  try {
    const { cid } = req.params;
    const classes = await Class.findById({ _id: cid })
      .select("className classTitle classStatus classStartDate")
      .populate({
        path: "ApproveStudent",
        select: "id",
      })
      .lean()
      .exec();
    if (classes) {
      res.status(200).send({ message: "Success", classes });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
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
      const existAttend = await AttendenceDate.findOne({
        attendDate: { $eq: `${req.body.date}` },
      });
      if (existAttend) {
      } else {
        var classes = await Class.findById({ _id: cid });

        if (
          req.body.date >= classes.classStartDate
          // classes.attendenceDate.length >=1 && !classes.attendenceDate.includes(String(existAttend._id))
        ) {
          var attendence = new AttendenceDate({});
          attendence.attendDate = req.body.date;
          attendence.className = classes._id;

          for (let i = 0; i < req.body.present.length; i++) {
            const student = await Student.findById({
              _id: `${req.body.present[i]._id}`,
            });
            student.attendDate.push(attendence._id);
            attendence.presentStudent.push(student._id);
            attendence.presentTotal = req.body.present.length;
            await Promise.all([student.save(), attendence.save()]);
          }

          for (let i = 0; i < req.body.absent.length; i++) {
            const student = await Student.findById({
              _id: `${req.body.absent[i]._id}`,
            });
            student.attendDate.push(attendence._id);
            attendence.absentStudent.push(student._id);
            attendence.absentTotal = req.body.absent.length;
            await Promise.all([student.save(), attendence.save()]);
          }
          classes.attendenceDate.push(attendence._id);
          await classes.save();
          res.status(200).send({ message: "Success" });
        } else {
        }
      }
    }
  } catch {}
};

exports.markAttendenceClassStudentUpdate = async (req, res) => {
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
      const existAttend = await AttendenceDate.findOne({
        attendDate: { $eq: `${req.body.date}` },
      });
      if (existAttend) {
      } else {
        var classes = await Class.findById({ _id: cid });

        if (
          req.body.date >= classes.classStartDate
          // classes.attendenceDate.length >=1 && !classes.attendenceDate.includes(String(existAttend._id))
        ) {
          var attendence = new AttendenceDate({});
          attendence.attendDate = req.body.date;
          attendence.className = classes._id;

          for (let i = 0; i < req.body.present.length; i++) {
            const student = await Student.findById({
              _id: `${req.body.present[i]._id}`,
            });
            student.attendDate.push(attendence._id);
            attendence.presentStudent.push(student._id);
            attendence.presentTotal = req.body.present.length;
            await Promise.all([student.save(), attendence.save()]);
          }

          for (let i = 0; i < req.body.absent.length; i++) {
            const student = await Student.findById({
              _id: `${req.body.absent[i]._id}`,
            });
            student.attendDate.push(attendence._id);
            attendence.absentStudent.push(student._id);
            attendence.absentTotal = req.body.absent.length;
            await Promise.all([student.save(), attendence.save()]);
          }
          classes.attendenceDate.push(attendence._id);
          await classes.save();
          res.status(200).send({ message: "Success" });
        } else {
        }
      }
    }
  } catch {}
};
exports.retrieveAttendenceByDate = async (req, res) => {
  try {
    const { cid, date } = req.params;
    const attend = await AttendenceDate.findOne({
      $and: [{ className: cid }, { attendDate: date }],
    })
      .select(
        "attendDate presentStudent presentTotal absentStudent absentTotal"
      )
      .lean()
      .exec();
    if (attend) {
      res.status(200).send({ message: "Success", attend });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveStudentAttendenceCalendar = async (req, res) => {
  try {
    const { sid } = req.params;
    const { dateStatus } = req.body;
    const attendStatus = await AttendenceDate.findOne({
      attendDate: dateStatus,
    });
    if (attendStatus) {
      if (
        attendStatus.presentStudent.length >= 1 &&
        attendStatus.presentStudent.includes(String(sid))
      ) {
        res.status(200).send({ message: "Present", status: "Present" });
      } else if (
        attendStatus.absentStudent.length >= 1 &&
        attendStatus.absentStudent.includes(String(sid))
      ) {
        res.status(200).send({ message: "Absent", status: "Absent" });
      } else {
      }
    } else {
      res.status(200).send({ message: "Not Marking", status: "Not Marking" });
    }
  } catch {}
};

exports.getAttendDepartmentStaff = async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid })
      .select("batchName")
      .populate({
        path: "batchStaff",
        select:
          "staffFirstName staffMiddleName staffLastName photoId staffProfilePhoto staffROLLNO",
      })
      .lean()
      .exec();
    if (batch) {
      res.status(200).send({ message: "Success", batch });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.getAttendDepartmentStaffById = async (req, res) => {
  try {
    const { bid } = req.params;
    const batch = await Batch.findById({ _id: bid })
      .select("batchName")
      .populate({
        path: "batchStaff",
        select: "id",
      })
      .lean()
      .exec();
    if (batch) {
      res.status(200).send({ message: "Success", batch });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.retrieveAttendenceByStaffDate = async (req, res) => {
  try {
    const { did, date } = req.params;
    const attend = await StaffAttendenceDate.findOne({
      $and: [{ department: did }, { staffAttendDate: date }],
    })
      .select(
        "staffAttendDate presentStaff presentTotal absentStaff absentTotal"
      )
      .lean()
      .exec();
    if (attend) {
      res.status(200).send({ message: "Success", attend });
    } else {
      res.status(404).send({ message: "Failure" });
    }
  } catch {}
};

exports.markAttendenceDepartmentStaff = async (req, res) => {
  try {
    const { did } = req.params;
    const dLeaves = await Holiday.findOne({
      dDate: { $eq: `${req.body.date}` },
    });
    if (dLeaves) {
    } else {
      const existSAttend = await StaffAttendenceDate.findOne({
        staffAttendDate: { $eq: `${req.body.date}` },
      });
      if (existSAttend) {
      } else {
        var department = await Department.findById({ _id: did });
        var staffAttendence = await new StaffAttendenceDate({});
        staffAttendence.staffAttendDate = req.body.date;
        staffAttendence.department = department._id;

        for (let i = 0; i < req.body.present.length; i++) {
          const staff = await Staff.findById({
            _id: `${req.body.present[i]._id}`,
          });
          staff.attendDates.push(staffAttendence._id);
          staffAttendence.presentStaff.push(staff._id);
          staffAttendence.presentTotal = req.body.present.length;
          await Promise.all([staff.save(), staffAttendence.save()]);
        }

        for (let i = 0; i < req.body.absent.length; i++) {
          const staff = await Staff.findById({
            _id: `${req.body.absent[i]._id}`,
          });
          staff.attendDates.push(staffAttendence._id);
          staffAttendence.absentStaff.push(staff._id);
          staffAttendence.absentTotal = req.body.absent.length;
          await Promise.all([staff.save(), staffAttendence.save()]);
        }
        department.attendenceDate.push(staffAttendence._id);
        await staffAttendence.save();
        await department.save();
        res.status(200).send({ message: "Success" });
      }
    }
  } catch {}
};

exports.markAttendenceDepartmentStaffUpdate = async (req, res) => {
  try {
    const { did } = req.params;
    const dLeaves = await Holiday.findOne({
      dDate: { $eq: `${req.body.date}` },
    });
    if (dLeaves) {
    } else {
      const existSAttend = await StaffAttendenceDate.findOne({
        staffAttendDate: { $eq: `${req.body.date}` },
      });
      if (existSAttend) {
      } else {
        var department = await Department.findById({ _id: did });
        var staffAttendence = await new StaffAttendenceDate({});
        staffAttendence.staffAttendDate = req.body.date;
        staffAttendence.department = department._id;

        for (let i = 0; i < req.body.present.length; i++) {
          const staff = await Staff.findById({
            _id: `${req.body.present[i]._id}`,
          });
          staff.attendDates.push(staffAttendence._id);
          staffAttendence.presentStaff.push(staff._id);
          staffAttendence.presentTotal = req.body.present.length;
          await Promise.all([staff.save(), staffAttendence.save()]);
        }

        for (let i = 0; i < req.body.absent.length; i++) {
          const staff = await Staff.findById({
            _id: `${req.body.absent[i]._id}`,
          });
          staff.attendDates.push(staffAttendence._id);
          staffAttendence.absentStaff.push(staff._id);
          staffAttendence.absentTotal = req.body.absent.length;
          await Promise.all([staff.save(), staffAttendence.save()]);
        }
        department.attendenceDate.push(staffAttendence._id);
        await staffAttendence.save();
        await department.save();
        res.status(200).send({ message: "Success" });
      }
    }
  } catch {}
};
exports.retrieveStaffAttendenceCalendar = async (req, res) => {
  try {
    const { sid } = req.params;
    const { dateStatus } = req.body;
    const attendStatus = await StaffAttendenceDate.findOne({
      staffAttendDate: dateStatus,
    });
    if (attendStatus) {
      if (
        attendStatus.presentStaff.length >= 1 &&
        attendStatus.presentStaff.includes(String(sid))
      ) {
        res.status(200).send({ message: "Present", status: "Present" });
      } else if (
        attendStatus.absentStaff.length >= 1 &&
        attendStatus.absentStaff.includes(String(sid))
      ) {
        res.status(200).send({ message: "Absent", status: "Absent" });
      } else {
      }
    } else {
      res.status(200).send({ message: "Not Marking", status: "Not Marking" });
    }
  } catch {}
};

exports.holidayCalendar = async (req, res) => {
  try {
    const { did } = req.params;
    const { dateStatus } = req.body;
    const depart = await Department.findById({ _id: did });
    const staffDate = await StaffAttendenceDate.findOne({
      staffAttendDate: { $eq: `${dateStatus}` },
    });
    const classDate = await AttendenceDate.findOne({
      attendDate: { $eq: `${dateStatus}` },
    });
    if (staffDate && staffDate !== "undefined") {
      res.status(200).send({ message: "Count as a no holiday", staffDate });
    } else if (classDate && classDate !== "undefined") {
      res.status(200).send({ message: "Count as a no holiday", classDate });
    } else {
      const leave = await new Holiday({
        dDate: dateStatus,
        dHolidayReason: req.body.reason,
      });
      depart.holiday.push(leave);
      leave.department = depart;
      await depart.save();
      await leave.save();
      res.status(200).send({ message: "Holiday Marked " });
    }
  } catch {}
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

exports.delHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findById(req.params.hid);
    const depart = await Department.findById(holiday.department);
    depart.holiday.pull(req.params.hid);
    await Holiday.findByIdAndDelete(req.params.hid);
    depart.save();

    res.status(200).send({
      message: "deleted",
    });
  } catch (error) {}
};
