const Student = require("../../models/Student");
const Class = require("../../models/Class");
const Subject = require("../../models/Subject");
const Department = require("../../models/Department");
const AttendenceDate = require("../../models/AttendenceDate");

exports.studentStatsClassQuery = async (req, res) => {
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
        .select("className classTitle classTeacher ApproveStudent");
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
        .select("className classTitle classTeacher ApproveStudent");
    }

    const modify_list = [];
    for (let i = 0; i < cls_list?.length; i++) {
      modify_list.push({
        classTeacher: cls_list[i]?.classTeacher,
        className: cls_list[i]?.className,
        classTitle: cls_list[i]?.classTitle,
        studentCount: cls_list[i]?.ApproveStudent?.length,
        _id: cls_list[i]?._id,
      });
    }
    res.status(200).send({
      message: "Timetable stats class list",
      cls_list: modify_list,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.studentStatsClassStudentListQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { page, limit, search } = req.query;
    if (!cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = page ? parseInt(page) : 1;
    const itemPerPage = limit ? parseInt(limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const cls = await Class.findById(cid).populate({
      path: "attendenceDate",
      select: "presentStudent",
    });

    var student_list = [];
    if (cls?.ApproveStudent?.length > 0) {
      if (!["", undefined, ""]?.includes(search)) {
        student_list = await Student.find({
          $and: [
            {
              _id: { $in: cls?.ApproveStudent },
            },
            {
              $or: [
                {
                  studentFirstName: { $regex: search, $options: "i" },
                },
                { studentMiddleName: { $regex: search, $options: "i" } },
                { studentLastName: { $regex: search, $options: "i" } },
                { studentROLLNO: { $regex: search, $options: "i" } },
                { valid_full_name: { $regex: search, $options: "i" } },
                { studentGRNO: { $regex: search, $options: "i" } },
              ],
            },
          ],
        })
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto studentGRNO"
          )
          .lean();
      } else {
        student_list = await Student.find({
          _id: { $in: cls?.ApproveStudent },
        })
          .skip(dropItem)
          .limit(itemPerPage)
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto studentGRNO"
          )
          .lean();
      }
    }
    let total_attendance = cls?.attendenceDate?.length;

    const modify_list = [];
    for (let stu of student_list) {
      let obj = { ...stu, present: 0, avg_attendance: 0 };
      for (let ctl of cls?.attendenceDate) {
        // let flag = false;
        for (let pt of ctl?.presentStudent) {
          if (`${stu?._id}` === `${pt?.student}`) {
            // flag = true;
            obj.present += 1;
            break;
          }
        }
        // if (flag) {
        //   obj.present += 1;
        // } else {
        //   obj.absent += 1;
        // }
      }
      if (obj.present && total_attendance)
        obj.avg_attendance = ((obj.present / total_attendance) * 100)?.toFixed(
          2
        );

      modify_list.push(obj);
    }
    res.status(200).send({
      message: "One class all student with average attendance",
      students: modify_list,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.studentStatsClassLectureStudentListQuery = async (req, res) => {
  try {
    const { cid } = req.params;
    const { page, limit, search } = req.query;
    if (!cid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = page ? parseInt(page) : 1;
    const itemPerPage = limit ? parseInt(limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const subject = await Subject.find({ class: { $eq: `${cid}` } })
      .populate({
        path: "selected_batch_query",
        select: "class_student_query batchName",
      })
      .populate({
        path: "attendance",
        select: "presentStudent",
      });

    const cls = await Class.findById(cid);
    var students = [];
    if (cls?.ApproveStudent?.length > 0) {
      if (!["", undefined, ""]?.includes(search)) {
        students = await Student.find({
          $and: [
            {
              _id: { $in: cls?.ApproveStudent },
            },
            {
              $or: [
                {
                  studentFirstName: { $regex: search, $options: "i" },
                },
                { studentMiddleName: { $regex: search, $options: "i" } },
                { studentLastName: { $regex: search, $options: "i" } },
                { studentROLLNO: { $regex: search, $options: "i" } },
                { valid_full_name: { $regex: search, $options: "i" } },
                { studentGRNO: { $regex: search, $options: "i" } },
              ],
            },
          ],
        })
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto studentGRNO"
          )
          .lean();
      } else {
        students = await Student.find({
          _id: { $in: cls?.ApproveStudent },
        })
          .skip(dropItem)
          .limit(itemPerPage)
          .select(
            "studentFirstName studentMiddleName studentLastName studentROLLNO photoId studentProfilePhoto studentGRNO"
          )
          .lean();
      }
    }

    const student_list = [];
    for (let stu of students) {
      let obj = {
        ...stu,
        presentLecture: 0,
        totalLecture: 0,
        avg_attendance: 0,
      };
      for (let ref of subject) {
        if (ref?.selected_batch_query) {
          if (ref?.selected_batch_query?.class_student_query?.length > 0) {
            for (let ele of ref?.selected_batch_query?.class_student_query) {
              if (`${ele}` === `${stu?._id}`) {
                for (let att of ref?.attendance) {
                  for (let pt of att?.presentStudent) {
                    if (`${stu?._id}` === `${pt?.student}`) {
                      obj.presentLecture += 1;
                      break;
                    }
                  }
                  obj.totalLecture += 1;
                }
              }
            }
          }
        } else {
          for (let att of ref?.attendance) {
            for (let pt of att?.presentStudent) {
              if (`${stu?._id}` === `${pt?.student}`) {
                obj.presentLecture += 1;
                break;
              }
            }
            obj.totalLecture += 1;
          }
        }
      }
      if (obj.presentLecture && obj.totalLecture)
        obj.avg_attendance = (
          (obj.presentLecture / obj.totalLecture) *
          100
        )?.toFixed(2);

      student_list.push(obj);
    }
    res.status(200).send({
      message: "One class all student with Leacuer wise average attendance",
      student_list: student_list,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.studentStatsOneStudentSubjectLectureQuery = async (req, res) => {
  try {
    const { cid, sid } = req.params;
    if (!cid || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const subject = await Subject.find({ class: { $eq: `${cid}` } })
      .populate({
        path: "selected_batch_query",
        select: "class_student_query batchName",
      })
      .populate({
        path: "attendance",
        select: "presentStudent",
      })
      .populate({
        path: "subjectTeacherName",
        select:
          "staffFirstName staffLastName staffMiddleName staffROLLNO photoId staffProfilePhoto",
      });

    var all_subject = [];
    for (let ref of subject) {
      let obj = {
        subjectName: ref?.subjectName,
        selected_batch_query: ref?.selected_batch_query,
        subjectTeacherName: ref?.subjectTeacherName,
        presentLecture: 0,
        totalLecture: 0,
        avg_attendance: 0,
        _id: ref?._id,
      };
      if (ref?.selected_batch_query) {
        if (ref?.selected_batch_query?.class_student_query?.length > 0) {
          for (let ele of ref?.selected_batch_query?.class_student_query) {
            if (`${ele}` === `${sid}`) {
              for (let att of ref?.attendance) {
                for (let pt of att?.presentStudent) {
                  if (`${sid}` === `${pt?.student}`) {
                    obj.presentLecture += 1;
                    break;
                  }
                }
                obj.totalLecture += 1;
              }
              if (obj.presentLecture && obj.totalLecture)
                obj.avg_attendance = (
                  (obj.presentLecture / obj.totalLecture) *
                  100
                )?.toFixed(2);
              all_subject.push(obj);
            }
          }
        }
      } else {
        for (let att of ref?.attendance) {
          for (let pt of att?.presentStudent) {
            if (`${stu?._id}` === `${pt?.student}`) {
              obj.presentLecture += 1;
              break;
            }
          }
          obj.totalLecture += 1;
        }
        if (obj.presentLecture && obj.totalLecture)
          obj.avg_attendance = (
            (obj.presentLecture / obj.totalLecture) *
            100
          )?.toFixed(2);
        all_subject.push(obj);
      }
    }

    res.status(200).send({
      message: "One student with Leacuer wise all subjects average attendance",
      all_subject: all_subject,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.studentStatsProfileDayWiseQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { date } = req.query;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const student = await Student.findById(sid).populate({
      path: "studentClass",
      select: "subject",
    });
    var attendance = [];
    attendance = await AttendenceDate.find({
      $and: [
        {
          subject: { $in: student?.studentClass?.subject ?? [] },
        },
        {
          attendDate: { $eq: `${date}` },
        },
      ],
    });

    var attendance_status = null;

    for (let att of attendance) {
      for (let pt of att?.presentStudent) {
        if (`${pt?.student}` === `${sid}`) {
          attendance_status = "Present";
          break;
        }
      }
    }
    if (attendance_status !== "Present" && attendance?.length > 0) {
      for (let pt of attendance?.[0]?.absentStudent) {
        if (`${pt?.student}` === `${sid}`) {
          attendance_status = "Absent";
          break;
        }
      }
    }

    res.status(200).send({
      message: "Day wise student present or absent",
      attendance_status: attendance_status,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.studentStatsProfileLectureWiseQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const student = await Student.findById(sid).populate({
      path: "studentClass",
      select: "subject",
    });
    var attendance = [];
    attendance = await AttendenceDate.find({
      subject: { $in: student?.studentClass?.subject ?? [] },
    });

    var profile_attendance_stats = {
      presentLecture: 0,
      absentLecture: 0,
      totalLecture: attendance?.length ?? 0,
      presentPercentage: 0,
      absentPercentage: 0,
    };

    for (let att of attendance) {
      let flag = false;
      for (let pt of att?.presentStudent) {
        if (`${pt?.student}` === `${sid}`) {
          flag = true;
          break;
        }
      }
      if (flag) {
        profile_attendance_stats.presentLecture += 1;
      } else {
        profile_attendance_stats.absentLecture += 1;
      }
    }
    if (
      profile_attendance_stats.presentLecture > 0 &&
      profile_attendance_stats.totalLecture > 0
    ) {
      profile_attendance_stats.presentPercentage = (
        (profile_attendance_stats.presentLecture /
          profile_attendance_stats.totalLecture) *
        100
      )?.toFixed(2);
    }
    if (
      profile_attendance_stats.absentLecture > 0 &&
      profile_attendance_stats.totalLecture > 0
    ) {
      profile_attendance_stats.absentPercentage = (
        (profile_attendance_stats.absentLecture /
          profile_attendance_stats.totalLecture) *
        100
      )?.toFixed(2);
    }
    res.status(200).send({
      message: "Lecture wise student present or absent percentage",
      profile_attendance_stats: profile_attendance_stats,
    });
  } catch (e) {
    console.log(e);
  }
};

