const Department = require("../../models/Department");
const Guide = require("../../models/Guide/Guide");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Staff = require("../../models/Staff");
const Student = require("../../models/Student");
const User = require("../../models/User");
const Meeting = require("../../models/MentorMentee/meetings");
const { guide_json_to_excel } = require("../../Custom/JSONToExcel");
const Class = require("../../models/Class");
const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const RemainingList = require("../../models/Admission/RemainingList");

exports.check_staff_guide_tab_query = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const staff = await Staff.findById(sid);
    let guides = [];
    guides = await Guide.find({
      _id: { $in: staff.guide },
    }).populate({
      path: "department",
      select: "dName",
    });

    res.status(200).send({
      message: "Guide Tab Activated",
      access: true,
      customObj: {
        guides: guides,
        otherData: {
          institute: staff?.institute,
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
};

exports.activate_staff_guide_tab_query = async (req, res) => {
  try {
    const { did } = req.params;
    const { sid, guide_type } = req.body;
    if (!did || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const staff = await Staff.findById(sid);
    const guide = new Guide({
      staff: staff?._id,
      department: did,
      guide_type: guide_type,
    });
    staff.guide.push(guide?._id);
    staff.guide_count += 1;
    await Promise.all([guide.save(), staff.save()]);

    res.status(200).send({
      message: "Guide Tab Activated",
      access: true,
    });

    const department = await Department.findById(did);
    department.guide.push(guide?._id);
    department.guide_count += 1;
    await department.save();
  } catch (e) {
    console.log(e);
  }
};

exports.one_guide_detail_query = async (req, res) => {
  try {
    const { gid } = req.params;
    if (!gid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const guide = await Guide.findById(sid).select(
      "-mentees -queries -feed_question -meetings -export_collection -export_collection_count"
    );
    res.status(200).send({
      message: "Guide Tab Activated",
      access: true,
      guide: guide,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.one_guide_all_mentee_query = async (req, res) => {
  try {
    const { gid } = req.params;
    if (!gid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const guide = await Guide.findById(gid);
    let mentees = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      mentees = await Student.find({
        $and: [
          {
            _id: { $in: guide.mentees },
          },
          {
            $or: [
              {
                studentFristName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentLastName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentMiddleName: { $regex: req.query.search, $options: "i" },
              },
              {
                studentGRNO: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      }).select(
        "studentFirstName studentMiddleName studentLastName studentGRNO studentProfilePhoto"
      );
    } else {
      mentees = await Student.find({
        $and: [
          {
            _id: { $in: guide.mentees },
          },
        ],
      })
        .select(
          "studentFirstName studentMiddleName studentLastName studentGRNO studentProfilePhoto"
        )
        .sort("-1")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "One Guide Mentee List",
      access: true,
      mentees: mentees,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.one_guide_add_mentee_query = async (req, res) => {
  try {
    const { gid } = req.params;
    const { student_list } = req.body;
    if (!gid || student_list?.length <= 0) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const guide = await Guide.findById(gid).populate({
      path: "staff",
    });

    for (let std of student_list) {
      const student = await Student.findById(std);
      if (student?.user) {
        if (student.guide?.includes(std)) {
        } else {
          student.guide_count += 1;
          student.guide.push(guide?._id);
        }
        const user = await User.findById({ _id: student?.user });

        const notify = new StudentNotification({});
        notify.notifyContent = `${guide?.staff?.staffFirstName} ${
          guide?.staff?.staffMiddleName ?? ""
        } ${guide?.staff?.staffLastName} is assigned as your ${
          guide.guide_type
        } Guide.`;
        notify.notifySender = guide.department;
        notify.notifyReceiever = user._id;
        notify.notifyType = "Student";
        notify.notifyPublisher = student._id;
        notify.mentorId = guide._id;
        user.activity_tab.push(notify._id);
        notify.notifyByDepartPhoto = guide.department;
        notify.notifyCategory = "Assigned Guide";
        notify.redirectIndex = 29;
        guide.mentees_count += 1;
        guide.mentees.push(student?._id);
        await Promise.all([student.save(), user.save(), notify.save()]);

        // if (user.deviceToken) {
        //   invokeMemberTabNotification(
        //     "Student Activity",
        //     notify,
        //     "Assigned Guide",
        //     user._id,
        //     user.deviceToken,
        //     "Student",
        //     notify
        //   );
        // }
      }
    }
    await Promise.all([guide.save()]);

    res.status(200).send({
      message: "Mentee added in guide tab",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.one_guide_remove_mentee_query = async (req, res) => {
  try {
    const { gid } = req.params;
    const { student_list } = req.body;
    if (!gid || student_list?.length <= 0) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const guide = await Guide.findById(gid);

    for (let std of student_list) {
      const student = await Student.findById(std);
      guide.mentees_count -= 1;
      guide.mentees.pull(student?._id);
      student.guide_count -= 1;
      student.guide.pull(guide?._id);
      await student.save();
    }
    await guide.save();

    res.status(200).send({
      message: "Mentee remove in guide tab",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.one_guide_add_meeting_query = async (req, res) => {
  try {
    const { gid } = req.params;
    const { p_array, a_array } = req.body;
    if (!gid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const guide = await Guide.findById(gid);

    const new_meet = new Meeting({ ...req.body });
    new_meet.guide = guide?._id;
    new_meet.department = guide?.department;
    guide.meetings.push(new_meet?._id);
    guide.meetings_count += 1;

    new_meet.present_mentees = p_array;
    new_meet.mentees_present_count = p_array?.length;
    new_meet.absent_mentees = a_array;
    new_meet.mentees_absent_count = a_array?.length;
    await Promise.all([new_meet.save(), guide.save()]);
    res.status(200).send({
      message: "New Mentee added in guide tab",
      access: true,
    });
    if (new_meet?.meeting_alert) {
      var all_mentees = await Student.find({
        _id: { $in: guide?.mentees },
      });
      for (var ref of all_mentees) {
        if (ref?.user) {
          var user = await User.findById({ _id: `${ref?.user}` });
          var notify = new StudentNotification({});
          notify.notifyContent = `Today Meetings Agenda - ${new_meet?.agenda}. click here to read more...`;
          notify.notifySender = guide?._id;
          notify.notifyReceiever = user?._id;
          notify.notifyType = "Student";
          notify.notifyPublisher = ref?._id;
          user.activity_tab.push(notify?._id);
          notify.notifyByDepartPhoto = guide?.department;
          notify.notifyCategory = "Meeting Alert";
          notify.redirectIndex = 57;
          await Promise.all([user.save(), notify.save()]);
          if (user.deviceToken) {
            invokeMemberTabNotification(
              "Meeting Alert",
              notify.notifyContent,
              "New Agenda",
              user._id,
              user.deviceToken
            );
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};
exports.one_guide_meeting_list_query = async (req, res) => {
  try {
    const { gid } = req.params;
    if (!gid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const guide = await Guide.findById(gid);
    let meetings = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      meetings = await Meeting.find({
        $and: [
          {
            _id: { $in: guide.meetings },
          },
          {
            $or: [
              {
                agenda: { $regex: req.query.search, $options: "i" },
              },
              {
                summary: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      }).select(
        "agenda summary discussion created_at mentees_present_count mentees_absent_count meeting_alert department creation_status meeting_time"
      );
    } else {
      meetings = await Meeting.find({
        $and: [
          {
            _id: { $in: guide.meetings },
          },
        ],
      })
        .select(
          "agenda summary discussion created_at mentees_present_count mentees_absent_count meeting_alert department creation_status meeting_time"
        )
        .sort("-1")
        .skip(dropItem)
        .limit(itemPerPage);
    }

    res.status(200).send({
      message: "One Guide Meetings List",
      access: true,
      meetings: meetings,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.one_guide_meeting_detail_query = async (req, res) => {
  try {
    const { meid } = req.params;
    if (!meid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const meeting = await Meeting.findById(meid)
      .populate({
        path: "present_mentees",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO",
      })
      .populate({
        path: "absent_mentees",
        select:
          "studentFirstName studentMiddleName studentLastName photoId studentProfilePhoto valid_full_name studentGRNO",
      });
    res.status(200).send({
      message: "Guide Tab Activated",
      access: true,
      meeting: meeting,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.one_guide_update_meeting_query = async (req, res) => {
  try {
    const { meid } = req.params;
    const { p_array, a_array } = req.body;
    if (!meid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    await Meeting.findByIdAndUpdate(meid, req?.body);

    const meeting = await Meeting.findById(meid);
    meeting.present_mentees = p_array;
    meeting.mentees_present_count = p_array?.length;
    meeting.absent_mentees = a_array;
    meeting.mentees_absent_count = a_array?.length;
    await meeting.save();
    res.status(200).send({
      message: "Meeting updated guide tab",
      access: true,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.one_guide_add_schedule_meeting_query = async (req, res) => {
  try {
    const { gid } = req.params;
    const { p_array, a_array } = req.body;
    if (!gid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const guide = await Guide.findById(gid);

    const new_meet = new Meeting({ ...req.body });
    new_meet.guide = guide?._id;
    new_meet.department = guide?.department;
    new_meet.creation_status = "SCHEDULE";
    guide.meetings.push(new_meet?._id);
    guide.meetings_count += 1;

    new_meet.present_mentees = p_array;
    new_meet.mentees_present_count = p_array?.length;
    new_meet.absent_mentees = a_array;
    new_meet.mentees_absent_count = a_array?.length;
    await Promise.all([new_meet.save(), guide.save()]);
    res.status(200).send({
      message: "New Mentee added in guide tab",
      access: true,
    });
    if (new_meet?.meeting_alert) {
      const all_mentees = await Student.find({
        _id: { $in: guide?.mentees },
      });
      for (let ref of all_mentees) {
        if (ref?.user) {
          const user = await User.findById({ _id: `${ref?.user}` });
          const notify = new StudentNotification({});
          notify.notifyContent = `Meetings with Agenda - ${new_meet?.agenda} is scheduled on ${new_meet?.meeting_date} at ${new_meet?.meeting_time}. click here to read more...`;
          notify.notifySender = guide?._id;
          notify.notifyReceiever = user?._id;
          notify.notifyType = "Student";
          notify.notifyPublisher = ref?._id;
          user.activity_tab.push(notify?._id);
          notify.notifyByDepartPhoto = guide?.department;
          notify.notifyCategory = "Meeting Alert";
          notify.redirectIndex = 57;
          await Promise.all([user.save(), notify.save()]);
          if (user.deviceToken) {
            invokeMemberTabNotification(
              "Meeting Alert",
              notify.notifyContent,
              "New Agenda",
              user._id,
              user.deviceToken
            );
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

exports.one_guide_excel_list_query = async (req, res) => {
  try {
    const { gid } = req.params;
    if (!gid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const guide = await Guide.findById(gid)
      .select("export_collection")
      .lean()
      .exec();
    if (guide?.export_collection?.length > 0) {
      let sort_list = guide?.export_collection?.sort(
        (a, b) => b?.created_at - a?.created_at
      );
      res.status(200).send({
        message: "ALl Guide Export list",
        excel_arr: sort_list,
      });
    } else {
      res.status(200).send({
        message: "ALl Guide Export list",
        excel_arr: [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.one_guide_mentee_excel_list_query = async (req, res) => {
  try {
    const { gid } = req.params;
    if (!gid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const mentor = await Guide.findById(gid);
    res.status(200).send({
      message: "Generating excel all mentee list for guide",
    });
    const valid_all_students = await Student.find({
      _id: { $in: mentor?.mentees ?? [] },
    })
      .populate({
        path: "department",
        select: "dName",
      })
      .populate({
        path: "studentClass",
        select: "className classTitle",
      })
      .populate({
        path: "batches",
        select: "batchName",
      })
      .populate({
        path: "fee_structure hostel_fee_structure",
        select:
          "unique_structure_name applicable_fees total_admission_fees category_master batch_master class_master",
        populate: {
          path: "category_master batch_master class_master",
          select: "category_name batchName className",
        },
      });

    const excel_list = [];
    for (var ref of valid_all_students) {
      var struct = ref?.fee_structure
        ? ref?.fee_structure?._id
        : ref?.hostel_fee_structure
        ? ref?.hostel_fee_structure?._id
        : "";
      var valid_card = await RemainingList.find({
        $and: [{ student: `${ref?._id}` }],
      }).populate({
        path: "fee_structure",
      });
      var pending = 0;
      var paid = 0;
      var applicable_pending = 0;
      for (var ele of valid_card) {
        pending += ele?.remaining_fee;
        paid += ele?.paid_fee;
        applicable_pending +=
          ele?.fee_structure?.applicable_fees - ele?.paid_fee > 0
            ? ele?.fee_structure?.applicable_fees - ele?.paid_fee
            : 0;
      }
      if (struct) {
        var currentPaid = 0;
        var currentRemain = 0;
        var currentApplicableRemaining = 0;
        var valid_card = await RemainingList.findOne({
          $and: [{ fee_structure: `${struct}` }, { student: `${ref?._id}` }],
        }).populate({
          path: "fee_structure",
        });
        currentPaid += valid_card?.paid_fee;
        currentRemain += valid_card?.remaining_fee;
        currentApplicableRemaining +=
          valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee > 0
            ? valid_card?.fee_structure?.applicable_fees - valid_card?.paid_fee
            : 0;
      }
      const buildStructureObject = async (arr) => {
        var obj = {};
        for (let i = 0; i < arr.length; i++) {
          const { BatchName, Fees } = arr[i];
          obj[BatchName] = Fees;
        }
        return obj;
      };
      var all_remain = await RemainingList.find({
        $and: [{ student: ref?._id }],
      })
        .populate({
          path: "fee_structure",
          populate: {
            path: "batch_master",
          },
        })
        .populate({
          path: "appId",
        });

      var pusher = [];
      for (var query of all_remain) {
        pusher.push({
          BatchName: `${query?.fee_structure?.batch_master?.batchName}-PaidFees`,
          Fees: query?.paid_fee,
        });
        pusher.push({
          BatchName: `${query?.fee_structure?.batch_master?.batchName}-RemainingFees`,
          Fees: query?.remaining_fee,
        });
        pusher.push({
          BatchName: `${query?.fee_structure?.batch_master?.batchName}-ApplicableRemainingFees`,
          Fees:
            query?.fee_structure?.applicable_fees - query?.paid_fee > 0
              ? query?.fee_structure?.applicable_fees - query?.paid_fee
              : 0,
        });
        pusher.push({
          BatchName: `${query?.fee_structure?.batch_master?.batchName}-Remark`,
          Fees: query?.remark,
        });
      }
      if (pusher?.length > 0) {
        var result = await buildStructureObject(pusher);
      }
      excel_list.push({
        GRNO: ref?.studentGRNO ?? "#NA",
        Name:
          `${ref?.studentFirstName} ${
            ref?.studentMiddleName ? ref?.studentMiddleName : ""
          } ${ref?.studentLastName}` ?? ref?.valid_full_name,
        DOB: ref?.studentDOB ?? "#NA",
        Gender: ref?.studentGender ?? "#NA",
        Caste: ref?.studentCast ?? "#NA",
        Religion: ref?.studentReligion ?? "#NA",
        Nationality: `${ref?.studentNationality}` ?? "#NA",
        MotherName: `${ref?.studentMotherName}` ?? "#NA",
        MotherTongue: `${ref?.studentMTongue}` ?? "#NA",
        CastCategory: `${ref?.studentCastCategory}` ?? "#NA",
        PreviousSchool: `${ref?.studentPreviousSchool}` ?? "#NA",
        Address: `${ref?.studentAddress}` ?? "#NA",
        ParentsName: `${ref?.studentParentsName}` ?? "#NA",
        ParentsPhoneNumber: `${ref?.studentParentsPhoneNumber}` ?? "#NA",
        ParentsOccupation: `${ref?.studentParentsOccupation}` ?? "#NA",
        ParentsIncome: `${ref?.studentParentsAnnualIncom}` ?? "#NA",
        BloodGroup: `${ref?.student_blood_group}` ?? "#NA",
        Email: `${ref?.studentEmail}` ?? "#NA",
        GateScore: `${ref?.student_gate_score}` ?? "#NA",
        GateYear: `${ref?.student_gate_year}` ?? "#NA",
        InstituteDegree: `${ref?.student_degree_institute}` ?? "#NA",
        InstituteDegreeYear: `${ref?.student_degree_year}` ?? "#NA",
        CPIPercentage: `${ref?.student_percentage_cpi}` ?? "#NA",
        StudentProgramme: `${ref?.student_programme}` ?? "#NA",
        StudentBranch: `${ref?.student_branch}` ?? "#NA",
        SingleSeater: `${ref?.student_single_seater_room}` ?? "#NA",
        PhysicallyChallenged: `${ref?.student_ph}` ?? "#NA",
        ProfileCompletion: `${ref?.profile_percentage}` ?? "0",
        Standard: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.class_master?.className}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.class_master?.className}`
          : "#NA",
        Batch: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.batch_master?.batchName}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.batch_master?.batchName}`
          : "#NA",
        FeeStructure: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.unique_structure_name}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.unique_structure_name}`
          : "#NA",
        ActualFees: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.total_admission_fees}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.total_admission_fees}`
          : "0",
        ApplicableFees: `${ref?.fee_structure}`
          ? `${ref?.fee_structure?.applicable_fees}`
          : `${ref?.hostel_fee_structure}`
          ? `${ref?.hostel_fee_structure?.applicable_fees}`
          : "0",
        CurrentYearPaidFees: currentPaid ?? "0",
        CurrentYearRemainingFees: currentRemain ?? "0",
        CurrentYearApplicableRemainingFees: currentApplicableRemaining ?? "0",
        TotalPaidFees: paid ?? "0",
        TotalRemainingFees: pending ?? "0",
        TotalApplicablePending: applicable_pending ?? "0",
        ...result,
      });
      result = [];
    }
    if (excel_list?.length > 0) {
      await guide_json_to_excel(gid, excel_list, "Mentee", "MENTEE", "mentee");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.one_guide_mentee_attendance_excel_list_query = async (req, res) => {
  try {
    const { gid, type } = req.params;
    const month = req.query.month;
    const year = req.query.year;
    if (!gid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const mentor = await Guide.findById(gid).select("mentees");
    res.status(200).send({
      message: "Generating excel all attendance of mentee for mentor",
    });

    let regularexp = "";

    // if (type === "ALL_SUBJECT_SEMESTER") {
    //   var classes = await Class.findById(cid)
    //     .populate({
    //       path: "ApproveStudent",
    //       select:
    //         "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO student_prn_enroll_number",
    //     })
    //     .populate({
    //       path: "subject",
    //       populate: {
    //         path: "selected_batch_query",
    //       },
    //     })
    //     .lean()
    //     .exec();
    //   let mapSubject = [];
    //   for (let sub of classes?.subject) {
    //     mapSubject.push({
    //       subjectName: `${sub?.subjectName} ${
    //         sub?.subject_category ? `(${sub?.subject_category})` : ""
    //       } ${
    //         sub?.selected_batch_query?.batchName
    //           ? `(${sub?.selected_batch_query?.batchName})`
    //           : ""
    //       } ${
    //         sub?.subjectOptional === "Optional"
    //           ? `(${sub?.subjectOptional})`
    //           : ""
    //       }`,
    //       subjectId: sub?._id,
    //     });
    //   }

    //   let students = [];
    //   for (let stu of classes?.ApproveStudent) {
    //     let obj = {
    //       ...stu,
    //       subjects: [],
    //     };
    //     students.push(obj);
    //   }

    //   for (let sub of classes?.subject) {
    //     const subjects = await Subject.findById(sub?._id).populate({
    //       path: "attendance",
    //     });

    //     for (let stu of students) {
    //       let sobj = {
    //         subjectName: `${sub?.subjectName} ${
    //           sub?.subject_category ? `(${sub?.subject_category})` : ""
    //         } ${
    //           sub?.selected_batch_query?.batchName
    //             ? `(${sub?.selected_batch_query?.batchName})`
    //             : ""
    //         } ${
    //           sub?.subjectOptional === "Optional"
    //             ? `(${sub?.subjectOptional})`
    //             : ""
    //         }`,
    //         subjectId: subjects?._id,
    //         presentCount: 0,
    //         totalCount: 0,
    //         totalPercentage: 0,
    //       };
    //       for (let att of subjects?.attendance) {
    //         for (let pre of att?.presentStudent) {
    //           if (String(stu._id) === String(pre.student))
    //             sobj.presentCount += 1;
    //         }
    //         sobj.totalCount += 1;
    //       }
    //       sobj.totalPercentage = (
    //         (sobj.presentCount * 100) /
    //         sobj.totalCount
    //       ).toFixed(2);

    //       stu.subjects.push(sobj);
    //     }
    //   }
    // } else if (type === "ALL_SUBJECT_MONTHLY") {
    //   regularexp = new RegExp(`\/${month}\/${year}$`);

    //   var classes = await Class.findById(cid)
    //     .populate({
    //       path: "ApproveStudent",
    //       select:
    //         "studentFirstName studentMiddleName studentLastName studentROLLNO studentGender studentGRNO student_prn_enroll_number",
    //     })
    //     .populate({
    //       path: "subject",
    //       populate: {
    //         path: "selected_batch_query",
    //       },
    //     })
    //     .lean()
    //     .exec();
    //   let mapSubject = [];
    //   for (let sub of classes?.subject) {
    //     mapSubject.push({
    //       subjectName: `${sub?.subjectName} ${
    //         sub?.subject_category ? `(${sub?.subject_category})` : ""
    //       } ${
    //         sub?.selected_batch_query?.batchName
    //           ? `(${sub?.selected_batch_query?.batchName})`
    //           : ""
    //       } ${
    //         sub?.subjectOptional === "Optional"
    //           ? `(${sub?.subjectOptional})`
    //           : ""
    //       }`,
    //       subjectId: sub?._id,
    //     });
    //   }

    //   let students = [];
    //   for (let stu of classes?.ApproveStudent) {
    //     let obj = {
    //       ...stu,
    //       subjects: [],
    //     };
    //     students.push(obj);
    //   }

    //   for (let sub of classes?.subject) {
    //     const subjects = await Subject.findById(sub?._id).populate({
    //       path: "attendance",
    //       match: {
    //         attendDate: { $regex: regularexp },
    //       },
    //     });

    //     for (let stu of students) {
    //       let sobj = {
    //         subjectName: `${sub?.subjectName} ${
    //           sub?.subject_category ? `(${sub?.subject_category})` : ""
    //         } ${
    //           sub?.selected_batch_query?.batchName
    //             ? `(${sub?.selected_batch_query?.batchName})`
    //             : ""
    //         } ${
    //           sub?.subjectOptional === "Optional"
    //             ? `(${sub?.subjectOptional})`
    //             : ""
    //         }`,
    //         subjectId: subjects?._id,
    //         presentCount: 0,
    //         totalCount: 0,
    //         totalPercentage: 0,
    //       };
    //       for (let att of subjects?.attendance) {
    //         for (let pre of att?.presentStudent) {
    //           if (String(stu._id) === String(pre.student))
    //             sobj.presentCount += 1;
    //         }
    //         sobj.totalCount += 1;
    //       }
    //       sobj.totalPercentage = (
    //         (sobj.presentCount * 100) /
    //         sobj.totalCount
    //       ).toFixed(2);

    //       stu.subjects.push(sobj);
    //     }
    //   }
    // } else {
    // }
    // const excel_list = [];
    // for (let exc of mentor?.mentees) {
    //   excel_list.push({
    //     GRNO: exc?.studentGRNO ?? "#NA",
    //     Name: `${exc?.studentFirstName} ${
    //       exc?.studentMiddleName ? `${exc?.studentMiddleName} ` : " "
    //     }${exc?.studentLastName}`,
    //   });
    // }
    // if (excel_list?.length > 0)
    //   await guide_json_to_excel(mid, excel_list, "Mentee", "MENTEE", "mentee");
  } catch (e) {
    console.log(e);
  }
};
