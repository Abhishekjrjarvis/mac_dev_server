const invokeMemberTabNotification = require("../../Firebase/MemberTab");
const Class = require("../../models/Class");
const Department = require("../../models/Department");
const InstituteAdmin = require("../../models/InstituteAdmin");
const StudentNotification = require("../../models/Marks/StudentNotification");
const Staff = require("../../models/Staff");
const SubjectMaster = require("../../models/SubjectMaster");
const Student = require("../../models/Student");
const StudentFeedback = require("../../models/StudentFeedback/StudentFeedback");
const StudentGiveFeedback = require("../../models/StudentFeedback/StudentGiveFeedback");
const User = require("../../models/User");
const StaffStudentFeedback = require("../../models/StudentFeedback/StaffStudentFeedback");
const {
  department_feedback_json_to_excel,
} = require("../../Custom/JSONToExcel");
const Subject = require("../../models/Subject");

exports.getStudentFeedbackQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      const feedback = await StudentFeedback.find({
        $and: [
          {
            institute: id,
          },
          {
            $or: [
              {
                feedback_name: { $regex: req.query.search, $options: "i" },
              },
            ],
          },
        ],
      })
        .select(
          "-questions -feedback_notify -feedback_staff -cls_student -export_collection"
        )
        .sort({
          created_at: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: "department",
          select: "dName",
        });

      res.status(201).send({
        message: "Student Feedback list",
        feedback: feedback ?? [],
      });
    } else {
      const feedback = await StudentFeedback.find({
        institute: id,
      })
        .select(
          "-questions -feedback_notify -feedback_staff -cls_student -export_collection"
        )

        .sort({
          created_at: -1,
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .populate({
          path: "department",
          select: "dName",
        });

      res.status(201).send({
        message: "Student Feedback list",
        feedback: feedback ?? [],
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.createStudentFeedbackQuery = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const {
      feedback_name,
      feedback_type,
      how_many_question_option,
      department,
    } = req.body;
    const feedback = new StudentFeedback({
      institute: id,
      feedback_name: feedback_name,
      feedback_type: feedback_type,
      how_many_question_option: how_many_question_option
        ? +how_many_question_option
        : 5,
      department: department,
    });
    const institute = await InstituteAdmin.findById(id);
    institute.student_feedback?.push(feedback?._id);
    institute.student_feedback_count += 1;
    await Promise.all([feedback.save(), institute.save()]);
    res.status(201).send({
      message: "student feedback created successfully",
    });
  } catch (e) {
    console.log(e);
  }
};
exports.updateStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const {
      feedback_name,
      feedback_type,
      how_many_question_option,
      department,
    } = req.body;

    const feedback = await StudentFeedback.findById(ifid);
    if (!feedback?.evaluation) {
      feedback.feedback_name = feedback_name;
      feedback.feedback_type = feedback_type;
      feedback.how_many_question_option = how_many_question_option;
      feedback.department = department;

      await feedback.save();
      res.status(200).send({
        message: "student feedback updated successfully",
      });
    } else {
      res.status(200).send({
        message:
          "student feedback not updated because student start feedback of subject teacher.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.removeStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid);
    if (!feedback?.evaluation) {
      const institute = await InstituteAdmin.findById(feedback?.institute);
      institute.student_feedback?.pull(feedback?._id);
      if (institute.student_feedback_count > 0)
        institute.student_feedback_count -= 1;

      await institute.save();
      await StudentFeedback.findByIdAndDelete(ifid);
      res.status(200).send({
        message: "student feedback deleted successfully",
      });
    } else {
      res.status(200).send({
        message:
          "student feedback not deleted because student start feedback of subject teacher.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.studentFeedbackDetailQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid).select(
      "-given_feedback -feedback_notify -feedback_staff"
    );
    res.status(200).send({
      message: "One feedback details.",
      feedback: feedback ?? null,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.addQuestionStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { questions } = req.body;
    const feedback = await StudentFeedback.findById(ifid);
    feedback.questions?.push(questions);
    feedback.question_count += 1;
    await feedback.save();
    res.status(201).send({
      message: "student feedback  question created successfully",
    });
  } catch (e) {
    console.log(e);
  }
};
exports.updateQuestionStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    const { questionId } = req.query;
    if (!ifid || !questionId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { questions } = req.body;
    const feedback = await StudentFeedback.findById(ifid);
    if (!feedback?.evaluation) {
      for (let que of feedback.questions) {
        if (`${que?._id}` === `${questionId}`) {
          que.question_title = questions?.question_title;
          que.options = questions?.options;
          break;
        }
      }
      await feedback.save();
      res.status(200).send({
        message: "student feedback question updated successfully",
      });
    } else {
      res.status(200).send({
        message:
          "student feedback question not updated because student start feedback of subject teacher.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};
exports.removeQuestionStudentFeedbackQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    const { questionId } = req.query;
    if (!ifid || !questionId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid);
    if (!feedback?.evaluation) {
      let arr = [];
      let count = 0;
      for (let i = 0; i < feedback.questions?.length; i++) {
        let que = feedback.questions[i];
        if (`${que?._id}` !== `${questionId}`) {
          ++count;
          arr.push({
            ...que,
            question_sno: `${count}`,
          });
        }
      }
      feedback.questions = arr;
      if (feedback.question_count > 0) feedback.question_count -= 1;
      await feedback.save();
      res.status(200).send({
        message: "student feedback question deleted successfully",
      });
    } else {
      res.status(200).send({
        message:
          "student feedback question not deleted because student start feedback of subject teacher.",
      });
    }
  } catch (e) {
    console.log(e);
  }
};

// here add batch wise condition
// exports.feedbackTakenByInstituteQuery = async (req, res) => {
//   try {
//     const { id, ifid } = req.params;
//     const { feedback_close_at } = req.body;
//     if (!id || !ifid) {
//       return res.status(200).send({
//         message: "Url Segement parameter required is not fulfill.",
//       });
//     }
//     const institute = await InstituteAdmin.findById(id);
//     const feedback = await StudentFeedback.findById(ifid);
//     feedback.evaluation = true;
//     feedback.send_notification = true;
//     let dt = new Date();
//     dt.setHours(dt.getHours() + 5);
//     dt.setMinutes(dt.getMinutes() + 30);
//     feedback.feedback_take_date = dt;
//     feedback.feedback_close_at = new Date(feedback_close_at);
//     await feedback.save();
//     res.status(200).send({
//       message: "student feedback taken by Institute Admin",
//     });

//     const department = await Department.find({
//       institute: id,
//     })
//       .populate({
//         path: "departmentSelectBatch",
//       })
//       .select("departmentSelectBatch");

//     const all_batches = [];

//     for (let dt of department) {
//       if (dt?.departmentSelectBatch?.batchStatus === "UnLocked") {
//         all_batches.push(dt?.departmentSelectBatch?._id);
//       }
//     }
//     // res.status(200).send({
//     //   message: "student feedback taken by Institute Admin",
//     //   feedback,
//     // });
//     const cls = await Class.find({
//       batch: { $in: all_batches },
//     })
//       .populate({
//         path: "subject",
//         populate: {
//           path: "selected_batch_query",
//           select: "class_student_query",
//         },
//         select: "subjectTeacherName subjectMasterName selected_batch_query",
//       })
//       .select("subject ApproveStudent");

//     var cls_student = {};
//     for (let ct of cls) {
//       cls_student[ct?._id] = {
//         staff: [],
//         student: [],
//       };
//       let arr = [];
//       for (let st of ct?.subject) {
//         let flag = true;
//         for (let it of arr) {
//           if (
//             `${it?.staffId}` === `${st?.subjectTeacherName}` &&
//             `${it?.master}` === `${st?.subjectMasterName}`
//           ) {
//             flag = false;
//             break;
//           }
//         }
//         if (flag) {
//           if (st?.subjectTeacherName)
//             arr.push({
//               staffId: st?.subjectTeacherName,
//               master: st?.subjectMasterName,
//               is_batch: st?.selected_batch_query ? true : false,
//               student: st?.selected_batch_query?.class_student_query,
//             });
//         }
//       }
//       cls_student[ct?._id]["student"] = ct?.ApproveStudent;
//       cls_student[ct?._id]["staff"] = arr;
//     }

//     // res.status(200).send({
//     //   message: "student feedback taken by Institute Admin",
//     //   cls_student: cls_student,
//     // });

//     // let sended_id = [
//     //   "66a67ffcde6cdcd86d1acdcb",
//     //   "66a68012de6cdcd86d1acf13",
//     //   "66a68022de6cdcd86d1acff4",
//     //   "66a6827bde6cdcd86d1adb1a",
//     //   "66a68292de6cdcd86d1adc33",
//     //   "66a682a4de6cdcd86d1add55",
//     //   "66a682b2de6cdcd86d1ade46",
//     //   "66a684e6de6cdcd86d1ae8fa",
//     //   "66a684f2de6cdcd86d1ae9aa",
//     //   "66a684fdde6cdcd86d1aea5b",
//     //   "66a68674de6cdcd86d1af18f",
//     //   "66a68682de6cdcd86d1af236",
//     //   "66a6868bde6cdcd86d1af299",
//     //   "66a68696de6cdcd86d1af312",
//     //   "66a68697de6cdcd86d1af31e",
//     //   "66a687e3de6cdcd86d1afcb6",
//     //   "66a687f6de6cdcd86d1afda3",
//     //   "66a6880fde6cdcd86d1aff28",
//     //   "66a6881fde6cdcd86d1b0029",
//     //   "66a6882ede6cdcd86d1b00fc",
//     //   "66a6882fde6cdcd86d1b0107",
//     //   "66a6883dde6cdcd86d1b01a1",
//     //   "66a6883ede6cdcd86d1b01ac",
//     //   "66a6883fde6cdcd86d1b01b7",
//     //   "66a68840de6cdcd86d1b01c2",
//     //   "66ab3f000a9333e4a5acd790",
//     //   "66ab3f6155671c796a91ebd6",
//     // ];

//     for (let obj in cls_student) {
//       let data = cls_student[obj];
//       feedback.cls_student.push({
//         class: obj,
//         sent: false,
//         staff: data["staff"],
//         student: data["student"],
//       });
//       await feedback.save();

//       // if (sended_id?.includes(obj)) {
//       //   console.log(true);
//       // } else {
//       for (let st of data["staff"] ?? []) {
//         const staff = await Staff.findById(st?.staffId);
//         const master = await SubjectMaster.findById(st?.master);
//         var staff_feedbaack = await StaffStudentFeedback.findOne({
//           $and: [
//             {
//               staff: { $eq: `${staff?._id}` },
//             },
//             {
//               feedbackId: { $eq: `${feedback?._id}` },
//             },
//           ],
//         });
//         if (staff_feedbaack) {
//           staff_feedbaack.subject_master?.push(master?._id);
//           staff_feedbaack.classes?.push(obj);
//           await staff_feedbaack.save();
//         } else {
//           staff_feedbaack = new StaffStudentFeedback({
//             institute: id,
//             feedbackId: feedback?._id,
//             staff: staff?._id,
//             subject_master: [master?._id],
//           });
//           staff.student_feedback?.push(staff_feedbaack?._id);
//           feedback.feedback_staff?.push(staff_feedbaack?._id);
//           staff_feedbaack.classes?.push(obj);
//           await staff_feedbaack.save();
//         }
//         // let all_student = st?.is_batch ? st?.student : data["student"];
//         let all_student = data["student"];
//         if (all_student?.length > 0) {
//           for (let stu of all_student) {
//             if (stu) {
//               const student = await Student.findById(stu);
//               if (student?.user) {
//                 const user = await User.findById(student?.user);
//                 const notify = new StudentNotification({});
//                 notify.notifyContent = `Give your valuable feedback to your beloved teacher - ${
//                   staff?.staffFirstName
//                 } ${
//                   staff?.staffMiddleName ? `${staff?.staffMiddleName} ` : ""
//                 }${staff?.staffLastName ?? ""} of - ${master?.subjectName}`;
//                 notify.notifySender = institute?._id;
//                 notify.notifyReceiever = user?._id;
//                 notify.notifyType = "Student";
//                 notify.notifyPublisher = student?._id;
//                 notify.instituteId = institute?._id;
//                 user.activity_tab.push(notify?._id);
//                 notify.notifyByInsPhoto = institute?._id;
//                 notify.notifyCategory = "Subject Teacher Feedback";
//                 notify.redirectIndex = 89;
//                 notify.student_feedback = feedback?._id;
//                 notify.staffId = staff?._id;
//                 notify.subjectMasterId = master?._id;
//                 notify.staffFeedbackId = staff_feedbaack?._id;
//                 notify.feedbackClassId = obj;
//                 feedback.feedback_notify?.push(notify?._id);
//                 feedback.feedback_notify_count += 1;
//                 if (user?.deviceToken) {
//                   invokeMemberTabNotification(
//                     "Student Activity",
//                     notify,
//                     "Staff Feedback",
//                     user._id,
//                     user.deviceToken,
//                     "Student",
//                     notify
//                   );
//                 }
//                 await Promise.all([notify.save(), user.save()]);
//               }
//             }
//           }
//         }
//         await Promise.all([
//           feedback.save(),
//           // staff_feedbaack.save(),
//           staff.save(),
//         ]);
//       }
//       // }

//       // if ("66ab3f6155671c796a91ebd6" === obj) {
//       // } else {
//       const fd_td = await StudentFeedback.findById(ifid);
//       let f_index = null;
//       if (fd_td?.cls_student?.length > 0) {
//         for (let i = 0; i < fd_td?.cls_student?.length; i++) {
//           let ct = fd_td?.cls_student[i];
//           if (`${ct?.class}` === `${obj}`) {
//             f_index = i;
//             break;
//           }
//         }
//       }
//       if (fd_td?.cls_student[f_index]) {
//         fd_td.cls_student[f_index]["sent"] = true;
//         await fd_td.save();
//       }
//       // }
//     }
//     // res.status(200).send({
//     //   message: "student feedback taken by Institute Admin",
//     //   feedback: feedback?.cls_student,
//     // });
//   } catch (e) {
//     console.log(e);
//   }
// };

// here add batch wise condition
exports.feedbackTakenByInstituteQueryMod = async (req, res) => {
  try {
    const { id, ifid } = req.params;
    const { feedback_close_at } = req.body;
    if (!id || !ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const institute = await InstituteAdmin.findById(id);
    const feedback = await StudentFeedback.findById(ifid);
    feedback.evaluation = true;
    feedback.send_notification = true;
    let dt = new Date();
    dt.setHours(dt.getHours() + 5);
    dt.setMinutes(dt.getMinutes() + 30);
    feedback.feedback_take_date = dt;
    feedback.feedback_close_at = new Date(feedback_close_at);
    await feedback.save();
    res.status(200).send({
      message: "student feedback taken by Institute Admin",
    });
    let department = [];
    if (feedback?.department?.length > 0) {
      department = await Department.find({
        _id: { $in: feedback?.department },
      })
        .populate({
          path: "departmentSelectBatch",
        })
        .select("departmentSelectBatch");
    } else {
      department = await Department.find({
        institute: id,
      })
        .populate({
          path: "departmentSelectBatch",
        })
        .select("departmentSelectBatch");
    }

    const all_batches = [];

    for (let dt of department) {
      if (dt?.departmentSelectBatch?.batchStatus === "UnLocked") {
        all_batches.push(dt?.departmentSelectBatch?._id);
      }
    }

    const cls = await Class.find({
      batch: { $in: all_batches },
    })
      .populate({
        path: "subject",
        populate: {
          path: "selected_batch_query",
          select: "class_student_query batchName",
        },
        select:
          "subjectTeacherName subjectMasterName optionalStudent selected_batch_query subject_category subjectName",
      })
      .select("subject ApproveStudent");

    var cls_student = {};

    for (let ct of cls) {
      cls_student[ct?._id] = {
        staff: [],
        student: [],
      };
      let arr = [];

      // for subject wise not master wise
      for (let st of ct?.subject) {
        if (st?.subjectTeacherName) {
          let current_subject_name = "";
          if (st?.selected_batch_query?.batchName) {
            let dt = "";
            if (st?.subject_category === "Practical") {
              dt = "P:";
            } else {
              dt = "T:";
            }
            dt = `${dt}${st?.selected_batch_query?.batchName ?? ""} `;
            current_subject_name += dt;
          }
          current_subject_name += st?.subjectName ?? "";
          arr.push({
            staffId: st?.subjectTeacherName,
            master: st?.subjectMasterName,
            subjectName: current_subject_name,
            is_batch: st?.selected_batch_query
              ? "Yes"
              : st?.optionalStudent?.length > 0
              ? "Yes"
              : "No",
            student: st?.selected_batch_query
              ? st?.selected_batch_query?.class_student_query
              : st?.optionalStudent?.length > 0
              ? st?.optionalStudent
              : [],
          });
        }
      }
      // master wise with multiple batch
      // for (let st of ct?.subject) {
      //   let flag = true;
      //   for (let it of arr) {
      //     if (
      //       `${it?.staffId}` === `${st?.subjectTeacherName}` &&
      //       `${it?.master}` === `${st?.subjectMasterName}`
      //     ) {
      //       flag = false;
      //       let ny = [];
      //       if (st?.selected_batch_query) {
      //         ny = st?.selected_batch_query?.class_student_query;
      //       } else {
      //         if (st?.optionalStudent?.length > 0) {
      //           ny = st?.optionalStudent;
      //         }
      //       }
      //       let jt = [];
      //       if (it?.student?.length > 0 && ny?.length > 0) {
      //         for (let ht of ny) {
      //           for (let gy of it?.student) {
      //             if (`${gy}` === `${ht}`) {
      //             } else {
      //               jt.push(ht);
      //             }
      //           }
      //         }
      //         it.student = [...it?.student, ...ny];
      //       }
      //     }
      //   }
      //   if (flag) {
      //     if (st?.subjectTeacherName)
      //       arr.push({
      //         staffId: st?.subjectTeacherName,
      //         master: st?.subjectMasterName,
      //         is_batch: st?.selected_batch_query
      //           ? "Yes"
      //           : st?.optionalStudent?.length > 0
      //           ? "Yes"
      //           : "No",
      //         student: st?.selected_batch_query
      //           ? st?.selected_batch_query?.class_student_query
      //           : st?.optionalStudent?.length > 0
      //           ? st?.optionalStudent
      //           : ct?.ApproveStudent,
      //       });
      //   }
      // }
      cls_student[ct?._id]["student"] = ct?.ApproveStudent;
      cls_student[ct?._id]["staff"] = arr;
    }
    // res.status(200).send({
    //   message: "student feedback taken by Institute Admin",
    //   cls_student,
    // });

    for (let obj in cls_student) {
      let data = cls_student[obj];
      feedback.cls_student.push({
        class: obj,
        sent: false,
        staff: data["staff"],
        student: data["student"],
      });
      await feedback.save();
      if (data && data["staff"]?.length > 0) {
        for (let st of data["staff"] ?? []) {
          const staff = await Staff.findById(st?.staffId);
          // const master = await SubjectMaster.findById(st?.master);
          var staff_feedbaack = await StaffStudentFeedback.findOne({
            $and: [
              {
                staff: { $eq: `${staff?._id}` },
              },
              {
                feedbackId: { $eq: `${feedback?._id}` },
              },
            ],
          });
          if (staff_feedbaack) {
            if (staff_feedbaack.subject_master?.length > 0) {
              let glag_t = true;
              for (let ty of staff_feedbaack.subject_master) {
                if (`${ty}` === `${st?.master}`) {
                  glag_t = false;
                  break;
                }
              }
              if (glag_t) {
                staff_feedbaack.subject_master?.push(st?.master);
              }
            }
            if (staff_feedbaack.classes?.length > 0) {
              let glag_t = true;
              for (let ty of staff_feedbaack.classes) {
                if (`${ty}` === `${obj}`) {
                  glag_t = false;
                  break;
                }
              }
              if (glag_t) {
                staff_feedbaack.classes?.push(obj);
              }
            }
            await staff_feedbaack.save();
          } else {
            staff_feedbaack = new StaffStudentFeedback({
              institute: id,
              feedbackId: feedback?._id,
              staff: staff?._id,
              subject_master: [st?.master],
            });
            staff.student_feedback?.push(staff_feedbaack?._id);
            feedback.feedback_staff?.push(staff_feedbaack?._id);
            staff_feedbaack.classes?.push(obj);
            await staff_feedbaack.save();
          }
          let all_student =
            st?.is_batch === "Yes" ? st?.student : data["student"];
          // let all_student = data["student"];
          if (all_student?.length > 0) {
            for (let stu of all_student) {
              if (stu) {
                const student = await Student.findById(stu);
                if (student?.user) {
                  const user = await User.findById(student?.user);
                  if (user?._id) {
                    const notify = new StudentNotification({});
                    notify.notifyContent = `Give your valuable feedback to your beloved teacher - ${
                      staff?.staffFirstName
                    } ${
                      staff?.staffMiddleName ? `${staff?.staffMiddleName} ` : ""
                    }${staff?.staffLastName ?? ""} of - ${st?.subjectName}`;
                    // console.log(notify.notifyContent);
                    notify.notifySender = institute?._id;
                    notify.notifyReceiever = user?._id;
                    notify.notifyType = "Student";
                    notify.notifyPublisher = student?._id;
                    notify.instituteId = institute?._id;
                    user.activity_tab.push(notify?._id);
                    notify.notifyByInsPhoto = institute?._id;
                    notify.notifyCategory = "Subject Teacher Feedback";
                    notify.redirectIndex = 89;
                    notify.student_feedback = feedback?._id;
                    notify.staffId = staff?._id;
                    notify.subjectMasterId = st?.master;
                    notify.staffFeedbackId = staff_feedbaack?._id;
                    notify.feedbackClassId = obj;
                    feedback.feedback_notify?.push(notify?._id);
                    feedback.feedback_notify_count += 1;
                    await Promise.all([notify.save(), user.save()]);

                    if (user?.deviceToken) {
                      invokeMemberTabNotification(
                        "Student Activity",
                        notify,
                        "Staff Feedback",
                        user._id,
                        user.deviceToken,
                        "Student",
                        notify
                      );
                    }
                  }
                }
              }
            }
          }
          await Promise.all([
            feedback.save(),
            // staff_feedbaack.save(),
            staff.save(),
          ]);
        }
      }

      const fd_td = await StudentFeedback.findById(ifid);
      let f_index = null;
      if (fd_td?.cls_student?.length > 0) {
        for (let i = 0; i < fd_td?.cls_student?.length; i++) {
          let ct = fd_td?.cls_student[i];
          if (`${ct?.class}` === `${obj}`) {
            f_index = i;
            break;
          }
        }
      }
      if (fd_td?.cls_student[f_index]) {
        fd_td.cls_student[f_index]["sent"] = true;
        await fd_td.save();
      }
    }
  } catch (e) {
    console.log(e);
  }
};
exports.giveStudentFeedbackQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    const { ifid, staffId, questions, notifyId, feedback_rating } = req.body;
    if (!sid || !ifid || !staffId || !notifyId) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const notify = await StudentNotification.findById(notifyId);
    const give_feedback = new StudentGiveFeedback({
      student: sid,
      subject_teacher: staffId,
      institute_feedback: ifid,
      subject_master: notify?.subjectMasterId,
      student_class: notify?.feedbackClassId,
      feedback_rating: feedback_rating,
      questions: questions,
    });
    notify.student_feedback_status = "Submitted";
    await Promise.all([give_feedback.save(), notify.save()]);
    res.status(200).send({
      message: "student feedback given successfully",
    });
    const feedback = await StudentFeedback.findById(ifid);
    feedback.given_feedback?.push(give_feedback?._id);
    feedback.feedback_given_student_count += 1;
    give_feedback.feedback_name = feedback?.feedback_name;
    give_feedback.feedback_type = feedback?.feedback_type;
    give_feedback.institute = feedback?.institute ?? null;
    var staff_feedback = await StaffStudentFeedback.findById(
      notify?.staffFeedbackId
    );

    if (staff_feedback) {
      staff_feedback.student_give_feedback?.push(give_feedback?._id);
      staff_feedback.student_give_feedback_count += 1;
      await staff_feedback.save();
    }

    await Promise.all([give_feedback.save(), feedback.save()]);
  } catch (e) {
    console.log(e);
  }
};

exports.getSubjectStaffListQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const st = await StaffStudentFeedback.find({
      feedbackId: ifid,
    }).select("staff");
    var staff = [];
    for (let ft of st) {
      staff.push(ft?.staff);
    }
    var all_staff = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      all_staff = await Staff.find({
        $and: [{ _id: { $in: staff } }],
        $or: [
          {
            staffFirstName: { $regex: req.query.search, $options: "i" },
          },
          {
            staffLastName: { $regex: req.query.search, $options: "i" },
          },
          {
            staffMiddleName: { $regex: req.query.search, $options: "i" },
          },
        ],
      })
        .populate({
          path: "student_feedback",
          match: { feedbackId: { $eq: `${ifid}` } },
          select:
            "student_give_feedback_count analytic_evaluation subject_analytic",
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "staffFirstName staffLastName staffMiddleName photoId staffProfilePhoto staffROLLNO staff_emp_code"
        );
    } else {
      all_staff = await Staff.find({
        _id: {
          $in: staff,
        },
      })
        .populate({
          path: "student_feedback",
          match: { feedbackId: { $eq: `${ifid}` } },
          select:
            "student_give_feedback_count analytic_evaluation subject_analytic",
        })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "staffFirstName staffLastName staffMiddleName photoId staffProfilePhoto staffROLLNO staff_emp_code"
        );
    }

    res.status(201).send({
      message: "staff Feedback list",
      all_staff,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.getGivenFeedbackStudentListQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const getPage = req.query.page ? parseInt(req.query.page) : 1;
    const itemPerPage = req.query.limit ? parseInt(req.query.limit) : 10;
    const dropItem = (getPage - 1) * itemPerPage;

    const st = await StudentGiveFeedback.find({
      institute_feedback: ifid,
    }).select("student");
    var student = [];
    for (let ft of st) {
      if (student?.includes(`${ft?.student}`)) {
      } else {
        student.push(`${ft?.student}`);
      }
    }
    var all_student = [];

    if (!["", undefined, ""]?.includes(req.query?.search)) {
      all_student = await Student.find({
        $and: [{ _id: { $in: student } }],
        $or: [
          {
            studentFirstName: { $regex: req.query.search, $options: "i" },
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
          {
            valid_full_name: { $regex: req.query.search, $options: "i" },
          },
        ],
      })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "studentFirstName studentLastName studentMiddleName photoId studentProfilePhoto studentROLLNO studentGRNO"
        );
    } else {
      all_student = await Student.find({
        _id: {
          $in: student,
        },
      })
        .skip(dropItem)
        .limit(itemPerPage)
        .select(
          "studentFirstName studentLastName studentMiddleName photoId studentProfilePhoto studentROLLNO studentGRNO"
        );
    }

    res.status(200).send({
      message: "Student Feedback list",
      all_student,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.feedbackAnalyticsProcessInstituteQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid);
    feedback.analytic_evaluation = true;
    await feedback.save();
    res.status(200).send({
      message: "Feedback analytics in process, please wait some time.",
    });
    const staff_feedback = await StaffStudentFeedback.find({
      feedbackId: ifid,
    });

    for (let st of staff_feedback ?? []) {
      const st_feedback = await StaffStudentFeedback.findById(st?._id);
      for (let mt of st?.subject_master) {
        let question = {};
        for (let qe of feedback?.questions) {
          question[qe?.question_sno] = {};
          if (feedback?.how_many_question_option === 2) {
            question[qe?.question_sno]["excellent"] = {
              count: 0,
              multiply: 5,
              percentage: 0,
            };
            question[qe?.question_sno]["poor"] = {
              count: 0,
              multiply: 1,
              percentage: 0,
            };
            question["excellent"] = {
              percentage: 0,
              multiply: 2,
              arr: [],
              factor: 0,
            };
            question["poor"] = {
              percentage: 0,
              multiply: 1,
              arr: [],
              factor: 0,
            };
          } else if (feedback?.how_many_question_option === 3) {
            question[qe?.question_sno]["excellent"] = {
              count: 0,
              multiply: 5,
              percentage: 0,
            };
            question[qe?.question_sno]["satisfaction"] = {
              count: 0,
              multiply: 3,
              percentage: 0,
            };
            question[qe?.question_sno]["poor"] = {
              count: 0,
              multiply: 1,
              percentage: 0,
            };
            question["excellent"] = {
              percentage: 0,
              multiply: 3,
              arr: [],
              factor: 0,
            };
            question["satisfaction"] = {
              percentage: 0,
              multiply: 2,
              arr: [],
              factor: 0,
            };
            question["poor"] = {
              percentage: 0,
              multiply: 1,
              arr: [],
              factor: 0,
            };
          } else if (feedback?.how_many_question_option === 4) {
            question[qe?.question_sno]["excellent"] = {
              count: 0,
              multiply: 5,
              percentage: 0,
            };
            question[qe?.question_sno]["good"] = {
              count: 0,
              multiply: 4,
              percentage: 0,
            };
            question[qe?.question_sno]["satisfaction"] = {
              count: 0,
              multiply: 3,
              percentage: 0,
            };
            question[qe?.question_sno]["poor"] = {
              count: 0,
              multiply: 1,
              percentage: 0,
            };
            question["excellent"] = {
              percentage: 0,
              multiply: 4,
              arr: [],
              factor: 0,
            };
            question["good"] = {
              percentage: 0,
              multiply: 3,
              arr: [],
              factor: 0,
            };
            question["satisfaction"] = {
              percentage: 0,
              multiply: 2,
              arr: [],
              factor: 0,
            };
            question["poor"] = {
              percentage: 0,
              multiply: 1,
              arr: [],
              factor: 0,
            };
          } else {
            question[qe?.question_sno]["excellent"] = {
              count: 0,
              multiply: 5,
              percentage: 0,
            };
            question[qe?.question_sno]["good"] = {
              count: 0,
              multiply: 4,
              percentage: 0,
            };
            question[qe?.question_sno]["satisfaction"] = {
              count: 0,
              multiply: 3,
              percentage: 0,
            };
            question[qe?.question_sno]["average"] = {
              count: 0,
              multiply: 2,
              percentage: 0,
            };
            question[qe?.question_sno]["poor"] = {
              count: 0,
              multiply: 1,
              percentage: 0,
            };
            question["excellent"] = {
              percentage: 0,
              multiply: 5,
              arr: [],
              factor: 0,
            };
            question["good"] = {
              percentage: 0,
              multiply: 4,
              arr: [],
              factor: 0,
            };
            question["satisfaction"] = {
              percentage: 0,
              multiply: 3,
              arr: [],
              factor: 0,
            };
            question["average"] = {
              percentage: 0,
              multiply: 2,
              arr: [],
              factor: 0,
            };
            question["poor"] = {
              percentage: 0,
              multiply: 1,
              arr: [],
              factor: 0,
            };
          }
        }
        let ana = {
          ...question,
          staffId: st?.staff,
          subjectMaster: mt,
          // excellent: {
          //   percentage: 0,
          //   multiply: 5,
          //   arr: [],
          //   factor: 0,
          // },
          // good: {
          //   percentage: 0,
          //   multiply: 4,
          //   arr: [],
          //   factor: 0,
          // },
          // satisfaction: {
          //   percentage: 0,
          //   multiply: 3,
          //   arr: [],
          //   factor: 0,
          // },
          // poor: {
          //   percentage: 0,
          //   multiply: 1,
          //   arr: [],
          //   factor: 0,
          // },
          // average: {
          //   percentage: 0,
          //   multiply: 2,
          //   arr: [],
          //   factor: 0,
          // },
          avg_percentage_arr: [],
          avg_percentage: 0,
        };
        const given_feedback = await StudentGiveFeedback.find({
          $and: [
            {
              _id: { $in: st?.student_give_feedback },
            },
            {
              subject_master: { $eq: `${mt}` },
            },
          ],
        });
        for (let gf of given_feedback ?? []) {
          for (let qu of gf?.questions) {
            let which_one = "";
            for (let opt of qu?.options) {
              if (opt?.selected) which_one = opt?.option_sno;
            }
            if (feedback?.how_many_question_option === 2) {
              let rt_fy = which_one === "1" ? "excellent" : "poor";
              ana[qu.question_sno][rt_fy]["count"] += 1;
            } else if (feedback?.how_many_question_option === 3) {
              let rt_fy =
                which_one === "1"
                  ? "excellent"
                  : which_one === "2"
                  ? "satisfaction"
                  : "poor";
              ana[qu.question_sno][rt_fy]["count"] += 1;
            } else if (feedback?.how_many_question_option === 4) {
              let rt_fy =
                which_one === "1"
                  ? "excellent"
                  : which_one === "2"
                  ? "good"
                  : which_one === "3"
                  ? "satisfaction"
                  : "poor";
              ana[qu.question_sno][rt_fy]["count"] += 1;
            } else {
              let rt_fy =
                which_one === "1"
                  ? "excellent"
                  : which_one === "2"
                  ? "good"
                  : which_one === "3"
                  ? "satisfaction"
                  : which_one === "4"
                  ? "average"
                  : "poor";
              ana[qu.question_sno][rt_fy]["count"] += 1;
            }
          }
        }
        if (given_feedback?.length > 0) {
          let category = [
            "excellent",
            "good",
            "satisfaction",
            "poor",
            "average",
          ];
          for (let o in ana) {
            let obj = ana[o];
            for (let cate of category) {
              if (obj[cate]) {
                obj[cate]["percentage"] = Math.floor(
                  (obj[cate]["count"] / given_feedback?.length) * 100
                  // (obj[cate]["count"] / feedback?.question_count) * 100
                );
                // console.log("ana[cate]", ana[cate]);
                ana[cate]["arr"].push(obj[cate]["percentage"]);
              }
            }
          }
          for (let cate of category) {
            if (ana[cate]) {
              let sum = ana[cate]["arr"]?.reduce((accc, cv) => accc + cv, 0);
              if (sum) {
                ana[cate]["percentage"] = Math.floor(
                  sum / ana[cate]["arr"]?.length
                );
                ana[cate]["factor"] =
                  ana[cate]["percentage"] * ana[cate]["multiply"];
                ana.avg_percentage_arr.push(ana[cate]["factor"]);
              }
            }
          }
          if (ana.avg_percentage_arr?.length > 0) {
            let sum = ana.avg_percentage_arr?.reduce(
              (accc, cv) => accc + cv,
              0
            );
            ana.avg_percentage = Math.floor(
              sum / feedback?.how_many_question_option ?? 5
            );
          }
          st_feedback.analytic?.push({
            subject_master: mt,
            feedback_analytic: [ana],
          });
        } else {
          st_feedback.analytic?.push({
            subject_master: mt,
            feedback_analytic: [ana],
          });
        }
        st_feedback.subject_analytic?.push({
          subject_master: mt,
          feedback_percentage: ana.avg_percentage,
        });
      }
      st_feedback.analytic_evaluation = true;
      await st_feedback.save();
    }
  } catch (e) {
    console.log(e);
  }
};

// exports.feedbackAnalyticsProcessInstituteQuery = async (req, res) => {
//   try {
//     const { ifid } = req.params;
//     if (!ifid) {
//       return res.status(200).send({
//         message: "Url Segement parameter required is not fulfill.",
//       });
//     }
//     const feedback = await StudentFeedback.findById(ifid);
//     feedback.analytic_evaluation = true;
//     await feedback.save();
//     res.status(200).send({
//       message: "Feedback analytics in process, please wait some time.",
//     });
//     const staff_feedback = await StaffStudentFeedback.find({
//       feedbackId: ifid,
//     });

//     for (let st of staff_feedback ?? []) {
//       const st_feedback = await StaffStudentFeedback.findById(st?._id);
//       let st_rating_arr = [];
//       for (let mt of st?.subject_master) {
//         let question = {};
//         let m_rating_arr = [];
//         for (let qe of feedback?.questions) {
//           question[qe?.question_sno] = {};
//           if (feedback?.how_many_question_option === 2) {
//             question[qe?.question_sno]["excellent"] = {
//               count: 0,
//               multiply: 5,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["poor"] = {
//               count: 0,
//               multiply: 1,
//               percentage: 0,
//             };
//             question["excellent"] = {
//               percentage: 0,
//               multiply: 2,
//               arr: [],
//               factor: 0,
//             };
//             question["poor"] = {
//               percentage: 0,
//               multiply: 1,
//               arr: [],
//               factor: 0,
//             };
//           } else if (feedback?.how_many_question_option === 3) {
//             question[qe?.question_sno]["excellent"] = {
//               count: 0,
//               multiply: 5,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["satisfaction"] = {
//               count: 0,
//               multiply: 3,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["poor"] = {
//               count: 0,
//               multiply: 1,
//               percentage: 0,
//             };
//             question["excellent"] = {
//               percentage: 0,
//               multiply: 3,
//               arr: [],
//               factor: 0,
//             };
//             question["satisfaction"] = {
//               percentage: 0,
//               multiply: 2,
//               arr: [],
//               factor: 0,
//             };
//             question["poor"] = {
//               percentage: 0,
//               multiply: 1,
//               arr: [],
//               factor: 0,
//             };
//           } else if (feedback?.how_many_question_option === 4) {
//             question[qe?.question_sno]["excellent"] = {
//               count: 0,
//               multiply: 5,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["good"] = {
//               count: 0,
//               multiply: 4,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["satisfaction"] = {
//               count: 0,
//               multiply: 3,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["poor"] = {
//               count: 0,
//               multiply: 1,
//               percentage: 0,
//             };
//             question["excellent"] = {
//               percentage: 0,
//               multiply: 4,
//               arr: [],
//               factor: 0,
//             };
//             question["good"] = {
//               percentage: 0,
//               multiply: 3,
//               arr: [],
//               factor: 0,
//             };
//             question["satisfaction"] = {
//               percentage: 0,
//               multiply: 2,
//               arr: [],
//               factor: 0,
//             };
//             question["poor"] = {
//               percentage: 0,
//               multiply: 1,
//               arr: [],
//               factor: 0,
//             };
//           } else {
//             question[qe?.question_sno]["excellent"] = {
//               count: 0,
//               multiply: 5,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["good"] = {
//               count: 0,
//               multiply: 4,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["satisfaction"] = {
//               count: 0,
//               multiply: 3,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["average"] = {
//               count: 0,
//               multiply: 2,
//               percentage: 0,
//             };
//             question[qe?.question_sno]["poor"] = {
//               count: 0,
//               multiply: 1,
//               percentage: 0,
//             };
//             question["excellent"] = {
//               percentage: 0,
//               multiply: 5,
//               arr: [],
//               factor: 0,
//             };
//             question["good"] = {
//               percentage: 0,
//               multiply: 4,
//               arr: [],
//               factor: 0,
//             };
//             question["satisfaction"] = {
//               percentage: 0,
//               multiply: 3,
//               arr: [],
//               factor: 0,
//             };
//             question["average"] = {
//               percentage: 0,
//               multiply: 2,
//               arr: [],
//               factor: 0,
//             };
//             question["poor"] = {
//               percentage: 0,
//               multiply: 1,
//               arr: [],
//               factor: 0,
//             };
//           }
//         }
//         let ana = {
//           ...question,
//           staffId: st?.staff,
//           subjectMaster: mt,
//           // excellent: {
//           //   percentage: 0,
//           //   multiply: 5,
//           //   arr: [],
//           //   factor: 0,
//           // },
//           // good: {
//           //   percentage: 0,
//           //   multiply: 4,
//           //   arr: [],
//           //   factor: 0,
//           // },
//           // satisfaction: {
//           //   percentage: 0,
//           //   multiply: 3,
//           //   arr: [],
//           //   factor: 0,
//           // },
//           // poor: {
//           //   percentage: 0,
//           //   multiply: 1,
//           //   arr: [],
//           //   factor: 0,
//           // },
//           // average: {
//           //   percentage: 0,
//           //   multiply: 2,
//           //   arr: [],
//           //   factor: 0,
//           // },
//           avg_percentage_arr: [],
//           avg_percentage: 0,
//         };
//         const given_feedback = await StudentGiveFeedback.find({
//           $and: [
//             {
//               _id: { $in: st?.student_give_feedback },
//             },
//             {
//               subject_master: { $eq: `${mt}` },
//             },
//           ],
//         });
//         for (let gf of given_feedback ?? []) {
//           for (let qu of gf?.questions) {
//             let which_one = "";
//             for (let opt of qu?.options) {
//               if (opt?.selected) which_one = opt?.option_sno;
//             }
//             if (feedback?.how_many_question_option === 2) {
//               let rt_fy = which_one === "1" ? "excellent" : "poor";
//               ana[qu.question_sno][rt_fy]["count"] += 1;
//             } else if (feedback?.how_many_question_option === 3) {
//               let rt_fy =
//                 which_one === "1"
//                   ? "excellent"
//                   : which_one === "2"
//                   ? "satisfaction"
//                   : "poor";
//               ana[qu.question_sno][rt_fy]["count"] += 1;
//             } else if (feedback?.how_many_question_option === 4) {
//               let rt_fy =
//                 which_one === "1"
//                   ? "excellent"
//                   : which_one === "2"
//                   ? "good"
//                   : which_one === "3"
//                   ? "satisfaction"
//                   : "poor";
//               ana[qu.question_sno][rt_fy]["count"] += 1;
//             } else {
//               let rt_fy =
//                 which_one === "1"
//                   ? "excellent"
//                   : which_one === "2"
//                   ? "good"
//                   : which_one === "3"
//                   ? "satisfaction"
//                   : which_one === "4"
//                   ? "average"
//                   : "poor";
//               ana[qu.question_sno][rt_fy]["count"] += 1;
//             }
//           }
//           m_rating_arr.push(gf?.feedback_rating);
//         }
//         if (given_feedback?.length > 0) {
//           let category = [
//             "excellent",
//             "good",
//             "satisfaction",
//             "poor",
//             "average",
//           ];
//           for (let o in ana) {
//             let obj = ana[o];
//             for (let cate of category) {
//               if (obj[cate]) {
//                 obj[cate]["percentage"] = Math.floor(
//                   (obj[cate]["count"] / given_feedback?.length) * 100
//                   // (obj[cate]["count"] / feedback?.question_count) * 100
//                 );
//                 // console.log("ana[cate]", ana[cate]);
//                 ana[cate]["arr"].push(obj[cate]["percentage"]);
//               }
//             }
//           }
//           for (let cate of category) {
//             if (ana[cate]) {
//               let sum = ana[cate]["arr"]?.reduce((accc, cv) => accc + cv, 0);
//               if (sum) {
//                 ana[cate]["percentage"] = Math.floor(
//                   sum / ana[cate]["arr"]?.length
//                 );
//                 ana[cate]["factor"] =
//                   ana[cate]["percentage"] * ana[cate]["multiply"];
//                 ana.avg_percentage_arr.push(ana[cate]["factor"]);
//               }
//             }
//           }
//           if (ana.avg_percentage_arr?.length > 0) {
//             let sum = ana.avg_percentage_arr?.reduce(
//               (accc, cv) => accc + cv,
//               0
//             );
//             ana.avg_percentage = Math.floor(
//               sum / feedback?.how_many_question_option ?? 5
//             );
//           }
//           let s_rat_avg = 0;
//           if (m_rating_arr?.length > 0) {
//             let s_rat = m_rating_arr?.reduce((acc, cv) => acc + cv, 0);
//             s_rat_avg = (s_rat / m_rating_arr?.length)?.toFixed(2);
//           }

//           st_feedback.analytic?.push({
//             subject_master: mt,
//             feedback_analytic: [ana],
//             master_rating: +s_rat_avg,
//           });
//           st_rating_arr.push(+s_rat_avg);
//         } else {
//           st_feedback.analytic?.push({
//             subject_master: mt,
//             feedback_analytic: [ana],
//           });
//           st_rating_arr.push(0);
//         }
//         let s_r_avg = 0;
//         if (m_rating_arr?.length > 0) {
//           let s_rat = m_rating_arr?.reduce((acc, cv) => acc + cv, 0);
//           s_r_avg = (s_rat / m_rating_arr?.length)?.toFixed(2);
//         }
//         st_feedback.subject_analytic?.push({
//           subject_master: mt,
//           feedback_percentage: ana.avg_percentage,
//           master_rating: +s_r_avg,
//         });
//       }
//       let r_avg = 0;
//       if (st_rating_arr?.length > 0) {
//         let s_rat = st_rating_arr?.reduce((acc, cv) => acc + cv, 0);
//         r_avg = (s_rat / st_rating_arr?.length)?.toFixed(2);
//       }
//       st_feedback.analytic_evaluation = true;
//       st_feedback.overall_rating = +r_avg;
//       await st_feedback.save();
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };

exports.getOneStaffAnalyticQuery = async (req, res) => {
  try {
    const { ifid, sid } = req.params;
    if (!ifid || !sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const staff_feedbaack = await StaffStudentFeedback.findOne({
      $and: [
        {
          feedbackId: ifid,
        },
        {
          staff: sid,
        },
      ],
    })
      .populate({
        path: "analytic",
        populate: {
          path: "subject_master",
          select: "subjectName",
        },
      })
      .select("analytic");
    res.status(200).send({
      message: "One staff analytics with all subject",
      staff_feedbaack,
    });
  } catch (e) {
    console.log(e);
  }
};
exports.updateStudentFeedbackCloseDateQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const { feedback_close_at } = req.body;
    const feedback = await StudentFeedback.findById(ifid);
    feedback.feedback_close_at = new Date(feedback_close_at);
    await feedback.save();
    res.status(200).send({
      message: "student feedback close date updated successfully",
    });
  } catch (e) {
    console.log(e);
  }
};
exports.getOneFeedbackStaffQuery = async (req, res) => {
  try {
    const { sid } = req.params;
    if (!sid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const staff_feedbaack = await Staff.findById(sid).select(
      "staffFirstName staffLastName staffMiddleName photoId staffProfilePhoto"
    );
    res.status(200).send({
      message: "staff Feedback info",
      staff_feedbaack: staff_feedbaack,
    });
  } catch (e) {
    console.log(e);
  }
};

exports.removeDublicateMasterQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const feedback = await StudentFeedback.findById(ifid);
    let j = 0;
    for (let i = 0; i < feedback?.feedback_staff?.length; i++) {
      const staff_feedbaack = await StaffStudentFeedback.findById(
        feedback?.feedback_staff[i]
      );
      let mt = staff_feedbaack?.subject_master ?? [];
      staff_feedbaack.subject_master = [];
      for (let t of mt) {
        if (!staff_feedbaack.subject_master?.includes(t)) {
          staff_feedbaack.subject_master?.push(t);
        }
      }

      let ct = staff_feedbaack?.classes ?? [];
      staff_feedbaack.classes = [];
      for (let t of ct) {
        if (!staff_feedbaack.classes?.includes(t)) {
          staff_feedbaack.classes?.push(t);
        }
      }

      let at = staff_feedbaack?.analytic ?? [];
      staff_feedbaack.analytic = [];

      for (let t of at) {
        let flag = true;
        for (let st of staff_feedbaack?.analytic ?? []) {
          if (`${t?.subject_master}` === `${st?.subject_master}`) {
            flag = false;
            break;
          }
        }
        if (flag) {
          staff_feedbaack.analytic?.push(t);
        }
      }

      let sub_at = staff_feedbaack?.subject_analytic ?? [];
      staff_feedbaack.subject_analytic = [];

      for (let t of sub_at) {
        let flag = true;
        for (let st of staff_feedbaack?.subject_analytic ?? []) {
          if (`${t?.subject_master}` === `${st?.subject_master}`) {
            flag = false;
            break;
          }
        }
        if (flag) {
          staff_feedbaack.subject_analytic?.push(t);
        }
      }
      await staff_feedbaack.save();
      console.log(j);
      ++j;
    }
    res.status(200).send({
      message: "remove dblicate master",
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getOneDepartmentAnalyticQuery = async (req, res) => {
  try {
    const { did } = req.params;
    const { ifid } = req.query;
    if (!did || !ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const department = await Department.findById(did);

    const cls = await Class.find({
      $and: [
        {
          batch: { $eq: `${department.departmentSelectBatch}` },
        },
        {
          department: { $eq: `${did}` },
        },
      ],
    });

    let excel_list = [];
    for (let ct of cls) {
      let lt = [];
      const subject = await Subject.find({
        $and: [
          {
            _id: {
              $in: ct.subject,
            },
          },
          {
            subject_category: {
              $in: ["Full Class", "Theory"],
            },
          },
        ],
      }).populate({
        path: "subjectTeacherName",
        select: "staffFirstName staffLastName staffMiddleName",
      });
      // .populate({
      //   path: "subjectMasterName",
      // });
      for (let st of subject) {
        const staff_feedback = await StaffStudentFeedback.findOne({
          $and: [
            {
              feedbackId: { $eq: `${ifid}` },
            },
            {
              staff: { $eq: `${st?.subjectTeacherName?._id}` },
            },
          ],
        }).populate({
          path: "analytic",
          // populate: {
          //   path: "subject_master",
          //   select: "subjectName",
          // },
        });
        var obj = null;
        if (lt?.length > 0) {
          obj = {
            "Class Name": "",
            Subject: "",
            Staff: "",
            Excellent: "",
            Good: "",
            Satisfactory: "",
            Poor: "",
            // average: "",
            Average: "",
            // subjectCategory: "",
          };
        } else {
          obj = {
            "Class Name": ct?.classTitle,
            Subject: "",
            Staff: "",
            Excellent: "",
            Good: "",
            Satisfactory: "",
            Poor: "",
            // average: "",
            Average: "",
            // subjectCategory: "",
          };
        }

        obj.Subject = st.subjectName;
        // obj.subjectCategory = st.subject_category;
        obj.Staff = `${st.subjectTeacherName?.staffFirstName ?? ""} ${
          st.subjectTeacherName?.staffMiddleName ?? ""
        } ${st.subjectTeacherName?.staffLastName ?? ""}`;

        for (let ft of staff_feedback?.analytic) {
          if (`${ft?.subject_master}` === `${st?.subjectMasterName}`) {
            let ftd = ft?.feedback_analytic?.[0];
            obj.Excellent = ftd?.excellent?.percentage;
            obj.Good = ftd?.good?.percentage;
            obj.Satisfactory = ftd?.satisfaction?.percentage;
            obj.Poor = ftd?.poor?.percentage;
            // obj.average=ftd?.excellent?.percentage
            obj.Average = ftd.avg_percentage;
          }
        }
        lt.push(obj);
      }
      lt.push({
        "Class Name": "",
        Subject: "",
        Staff: "",
        Excellent: "",
        Good: "",
        Satisfactory: "",
        Poor: "",
        // average: "",
        Average: "",
        // subjectCategory: "",
      });
      excel_list.push(...lt);
    }

    let excel_key = "";
    if (excel_list?.length > 0) {
      excel_key = await department_feedback_json_to_excel(
        ifid,
        excel_list,
        "Department Feedback",
        "FEEDBACK",
        "feedback",
        did
      );
    }
    res.status(200).send({
      message: "staff Feedback info",
      // excel_list: excel_list,
      excel_key: excel_key,
    });
  } catch (e) {
    console.log(e);
  }
};

//if feedback crash then this api hit
exports.feedbackRemoveByInstituteQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid);

    if (feedback?.feedback_notify?.length > 0) {
      for (let dt of feedback?.feedback_notify) {
        const notify = await StudentNotification(dt);

        if (notify?.notifyReceiever) {
          const user = await User.findById(notify?.notifyReceiever);
          user.activity_tab.pull(notify?._id);
          await user.save();
        }
        await StudentNotification.findByIdAndDelete(dt);
      }
    }

    if (feedback?.feedback_staff?.length > 0) {
      for (let st of feedback?.feedback_staff) {
        let st_d = await StaffStudentFeedback.findById(st);
        if (st_d?.staff) {
          const staff = await Staff.findById(st_d?.staff);
          staff.student_feedback.pull(st);
          await staff.save();
        }

        await StaffStudentFeedback.findByIdAndDelete(st);
      }
    }
    if (feedback?.institute) {
      const institute = await InstituteAdmin.findById(feedback?.institute);
      institute.student_feedback.pull(ifid);
      institute.student_feedback_count -= 1;
      await institute.save();
    }
    await StudentFeedback.findByIdAndDelete(ifid);

    res.status(200).send({
      message: "Student feedback deleted successfully.",
    });
  } catch (e) {
    console.log(e);
  }
};
//if feedback crash then only delete notification for student
exports.feedbackOnlyRemoveNotificationByInstituteQuery = async (req, res) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid);

    // let already_sent_notification = [
    //   "66b0aa0466cfdeac8303e0da",
    //   "66b0aa0566cfdeac8303e0e8",
    //   "66b0aa0566cfdeac8303e0f4",
    //   "66b0aa0666cfdeac8303e0fd",
    //   "66b0aa0666cfdeac8303e105",
    //   "66b0aa0666cfdeac8303e10d",
    //   "66b0aa0766cfdeac8303e116",
    //   "66b0aa0766cfdeac8303e122",
    //   "66b0aa0866cfdeac8303e12a",
    //   "66b0aa0866cfdeac8303e132",
    //   "66b0aa0866cfdeac8303e13b",
    //   "66b0aa0966cfdeac8303e143",
    //   "66b0aa0966cfdeac8303e14b",
    //   "66b0aa0966cfdeac8303e151",
    //   "66b0aa0966cfdeac8303e158",
    //   "66b0aa0a66cfdeac8303e160",
    //   "66b0aa0a66cfdeac8303e168",
    //   "66b0aa0a66cfdeac8303e171",
    //   "66b0aa0b66cfdeac8303e179",
    //   "66b0aa0b66cfdeac8303e181",
    //   "66b0aa0b66cfdeac8303e189",
    //   "66b0aa0c66cfdeac8303e192",
    //   "66b0aa0c66cfdeac8303e19a",
    //   "66b0aa0c66cfdeac8303e1a2",
    //   "66b0aa0c66cfdeac8303e1ab",
    //   "66b0aa0d66cfdeac8303e1b3",
    //   "66b0aa0d66cfdeac8303e1b9",
    //   "66b0aa0d66cfdeac8303e1c1",
    //   "66b0aa0e66cfdeac8303e1ca",
    //   "66b0aa0e66cfdeac8303e1d2",
    //   "66b0aa0e66cfdeac8303e1db",
    //   "66b0aa0f66cfdeac8303e1e3",
    //   "66b0aa0f66cfdeac8303e1eb",
    //   "66b0aa0f66cfdeac8303e1f3",
    //   "66b0aa0f66cfdeac8303e1fb",
    //   "66b0aa1066cfdeac8303e203",
    //   "66b0aa1066cfdeac8303e20c",
    //   "66b0aa1066cfdeac8303e212",
    //   "66b0aa1166cfdeac8303e217",
    //   "66b0aa1166cfdeac8303e21c",
    //   "66b0aa1166cfdeac8303e221",
    //   "66b0aa1266cfdeac8303e226",
    //   "66b0aa1266cfdeac8303e22b",
    //   "66b0aa1266cfdeac8303e231",
    //   "66b0aa1366cfdeac8303e237",
    //   "66b0aa1366cfdeac8303e23d",
    //   "66b0aa1366cfdeac8303e245",
    //   "66b0aa1466cfdeac8303e24a",
    //   "66b0aa1466cfdeac8303e252",
    //   "66b0aa1466cfdeac8303e25a",
    //   "66b0aa1566cfdeac8303e263",
    //   "66b0aa1566cfdeac8303e269",
    //   "66b0aa1566cfdeac8303e26e",
    //   "66b0aa1566cfdeac8303e273",
    //   "66b0aa1666cfdeac8303e278",
    //   "66b0aa1666cfdeac8303e27d",
    //   "66b0aa1666cfdeac8303e282",
    //   "66b0aa1766cfdeac8303e287",
    //   "66b0aa1766cfdeac8303e28c",
    //   "66b0aa1766cfdeac8303e291",
    //   "66b0aa1866cfdeac8303e296",
    //   "66b0aa1866cfdeac8303e29b",
    //   "66b0aa1866cfdeac8303e2a0",
    //   "66b0aa1866cfdeac8303e2a5",
    //   "66b0aa1966cfdeac8303e2aa",
    //   "66b0aa1966cfdeac8303e2af",
    // ];

    if (feedback?.feedback_notify?.length > 0) {
      for (let dt of feedback?.feedback_notify) {
        // for (let dt of already_sent_notification) {
        const notify = await StudentNotification.findById(dt);

        if (notify?.notifyReceiever) {
          const user = await User.findById(notify?.notifyReceiever);
          user.activity_tab.pull(notify?._id);
          await user.save();
        }
        await StudentNotification.findByIdAndDelete(dt);
        feedback.feedback_notify.pull(dt);
      }
    }

    if (feedback?.feedback_staff?.length > 0) {
      for (let st of feedback?.feedback_staff) {
        let st_d = await StaffStudentFeedback.findById(st);
        if (st_d?.staff) {
          const staff = await Staff.findById(st_d?.staff);
          staff.student_feedback.pull(st);
          await staff.save();
        }
        await StaffStudentFeedback.findByIdAndDelete(st);
      }
    }
    feedback.feedback_notify_count = 0;
    await feedback.save();

    res.status(200).send({
      message: "Student feedback deleted successfully.",
      count: already_sent_notification?.length,
    });
  } catch (e) {
    console.log(e);
  }
};

//if feedback crash for one class one subject
exports.feedbackResendNotificationOneSubjectByInstituteQuery = async (
  req,
  res
) => {
  try {
    const { ifid } = req.params;
    if (!ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const feedback = await StudentFeedback.findById(ifid);
    const institute = await InstituteAdmin.findById(feedback?.institute);
    var cls_student = {
      "66ab3f6155671c796a91ebd6": {
        staff: [
          {
            staffId: "64a79fcba59e4e19fe7ce32e",
            master: "66ac9cbdaa74f613d8843aed",
            is_batch: false,
          },
        ],
        student: [
          "650c15515234100be2d6c6da",
          "650d51cfc775ac6750e52499",
          "650c229b5234100be2dcac63",
          "650c22a45234100be2dcb038",
          "650c10c45234100be2d5a379",
          "650d49b6e66baac3ccbc921d",
          "650d51edc775ac6750e52acb",
          "650d49dde66baac3ccbc9bc6",
          "650c19665234100be2d819b4",
          "650c157f5234100be2d6d23f",
          "650c19875234100be2d828d0",
          "650c22d75234100be2dcc75d",
          "650c22e65234100be2dcce28",
          "650d523bc775ac6750e53cd1",
          "650c22ee5234100be2dcd11b",
          "650c26911aad4209c7fa4e05",
          "650c26a21aad4209c7fa51bb",
          "650c1a075234100be2d862c7",
          "650c15ca5234100be2d6e5f1",
          "650c1a105234100be2d866b7",
          "650d4a1de66baac3ccbcab35",
          "650c1a185234100be2d86aa0",
          "650d4a3de66baac3ccbcb31f",
          "650d526bc775ac6750e548db",
          "650c1a4e5234100be2d881d2",
          "650c23295234100be2dcebd3",
          "650d529ac775ac6750e554e1",
          "650d52a3c775ac6750e556bc",
          "650d52abc775ac6750e558ac",
          "650c236f5234100be2dd0a70",
          "650c271f1aad4209c7fa6f0f",
          "650c272f1aad4209c7fa7311",
          "650c117c5234100be2d5dede",
          "650c23a85234100be2dd2572",
          "650c228b5234100be2dca507",
          "650c119a5234100be2d5e6d7",
          "650c27481aad4209c7fa78e0",
          "650c1a9b5234100be2d8ada5",
          "650c16485234100be2d70572",
          "650c164f5234100be2d7076c",
          "650c16655234100be2d70d39",
          "650c1abf5234100be2d8c1f8",
          "650c11ca5234100be2d5f257",
          "650d4ae9e66baac3ccbcddd4",
          "650c168e5234100be2d716e0",
          "650c24055234100be2dd50c9",
          "650c24165234100be2dd57ca",
          "650c241e5234100be2dd5baf",
          "650c16a55234100be2d71cdb",
          "650c24595234100be2dd765d",
          "650c16e35234100be2d72e06",
          "650c27a31aad4209c7fa8e60",
          "650c1af15234100be2d8d7cf",
          "650c16f35234100be2d73208",
          "650d536cc775ac6750e5888c",
          "650c12635234100be2d61955",
          "650c17105234100be2d739e7",
          "650d539cc775ac6750e594bc",
          "650c27ea1aad4209c7fa9ffe",
          "650c17175234100be2d73bd0",
          "650c128c5234100be2d6234c",
          "650c242f5234100be2dd6367",
          "650c11925234100be2d5e4d7",
          "650c1aae5234100be2d8b93b",
          "66c98969d3d293b26b21191b",
          "66b06c28e40ece488c9ce9e4",
          "66b08c0ee40ece488c9dd1de",
          "66b08c5b4b68a8140a7efa36",
          "66b08c9de40ece488c9ddbbc",
          "66b08cea4b68a8140a7efff9",
        ],
      },
    };
    for (let obj in cls_student) {
      let data = cls_student[obj];
      for (let st of data["staff"] ?? []) {
        const staff = await Staff.findById(st?.staffId);
        const master = await SubjectMaster.findById(st?.master);
        var staff_feedbaack = await StaffStudentFeedback.findOne({
          $and: [
            {
              staff: { $eq: `${staff?._id}` },
            },
            {
              feedbackId: { $eq: `${feedback?._id}` },
            },
          ],
        });
        if (staff_feedbaack) {
          // staff_feedbaack.subject_master?.push(master?._id);
          // staff_feedbaack.classes?.push(obj);
          // await staff_feedbaack.save();
        } else {
          staff_feedbaack = new StaffStudentFeedback({
            institute: id,
            feedbackId: feedback?._id,
            staff: staff?._id,
            subject_master: [master?._id],
          });
          staff.student_feedback?.push(staff_feedbaack?._id);
          feedback.feedback_staff?.push(staff_feedbaack?._id);
          staff_feedbaack.classes?.push(obj);
          await staff_feedbaack.save();
        }
        let all_student = st?.is_batch ? st?.student : data["student"];
        let i = 0;
        if (all_student?.length > 0) {
          for (let stu of all_student) {
            ++i;
            console.log(i);
            if (stu) {
              const student = await Student.findById(stu);
              if (student?.user) {
                const user = await User.findById(student?.user);
                if (user?._id) {
                  const notify = new StudentNotification({});
                  notify.notifyContent = `Give your valuable feedback to your beloved teacher - ${
                    staff?.staffFirstName
                  } ${
                    staff?.staffMiddleName ? `${staff?.staffMiddleName} ` : ""
                  }${staff?.staffLastName ?? ""} of - ${master?.subjectName}`;
                  notify.notifySender = institute?._id;
                  notify.notifyReceiever = user?._id;
                  notify.notifyType = "Student";
                  notify.notifyPublisher = student?._id;
                  notify.instituteId = institute?._id;
                  user.activity_tab.push(notify?._id);
                  notify.notifyByInsPhoto = institute?._id;
                  notify.notifyCategory = "Subject Teacher Feedback";
                  notify.redirectIndex = 89;
                  notify.student_feedback = feedback?._id;
                  notify.staffId = staff?._id;
                  notify.subjectMasterId = master?._id;
                  notify.staffFeedbackId = staff_feedbaack?._id;
                  notify.feedbackClassId = obj;
                  feedback.feedback_notify?.push(notify?._id);
                  feedback.feedback_notify_count += 1;
                  if (user?.deviceToken) {
                    invokeMemberTabNotification(
                      "Student Activity",
                      notify,
                      "Staff Feedback",
                      user._id,
                      user.deviceToken,
                      "Student",
                      notify
                    );
                  }
                  await Promise.all([notify.save(), user.save()]);
                }
              }
            }
          }
        }
        await Promise.all([
          feedback.save(),
          // staff_feedbaack.save(),
          staff.save(),
        ]);
      }
    }

    res.status(200).send({
      message: "One subject Student feedback notify successfully.",
    });
  } catch (e) {
    console.log(e);
  }
};

// check which subject teacher subject student not send
exports.feedback_not_send_subject_teacher_query = async (req, res) => {
  try {
    const { id, ifid } = req.params;
    if (!id || !ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }
    const institute = await InstituteAdmin.findById(id);
    const feedback = await StudentFeedback.findById(ifid);

    const department = await Department.find({
      institute: id,
    })
      .populate({
        path: "departmentSelectBatch",
      })
      .select("departmentSelectBatch");

    const all_batches = [];

    for (let dt of department) {
      if (dt?.departmentSelectBatch?.batchStatus === "UnLocked") {
        all_batches.push(dt?.departmentSelectBatch?._id);
      }
    }
    // res.status(200).send({
    //   message: "student feedback taken by Institute Admin",
    //   feedback,
    // });
    const cls = await Class.find({
      batch: { $in: all_batches },
    })
      .populate({
        path: "subject",
        populate: {
          path: "selected_batch_query",
          select: "class_student_query",
        },
        select:
          "subjectName subjectTeacherName subjectMasterName selected_batch_query",
      })
      .select("subject ApproveStudent");

    var cls_student = {};
    for (let ct of cls) {
      // if (`${ct?._id}` === "66ab3f6155671c796a91ebd6") {
      cls_student[ct?._id] = {
        staff: [],
        student: [],
      };
      let arr = [];
      for (let st of ct?.subject) {
        let flag = true;
        for (let it of arr) {
          if (
            `${it?.staffId}` === `${st?.subjectTeacherName}` &&
            `${it?.master}` === `${st?.subjectMasterName}`
          ) {
            if (it?.is_batch && !it.tag) {
              let ft = ct?.ApproveStudent;
              // for (let yt of ct?.ApproveStudent) {
              //   ft.push(`${yt}`);
              // }

              if (it?.student?.length > 0) {
                for (let yt of it?.student) {
                  ft = ft?.filter((val) => `${val}` !== `${yt}`);
                }
              }
              if (st?.selected_batch_query?.class_student_query?.length > 0) {
                for (let yt of st?.selected_batch_query?.class_student_query) {
                  ft.push(`${yt}`);
                }
              }
              it.tag = true;
            } else {
              flag = false;
              break;
            }
            // if (it?.is_batch) {
            // if (st?.selected_batch_query?.class_student_query?.length > 0) {
            //   for (let yt of st?.selected_batch_query?.class_student_query) {
            //     if (it?.student?.includes(`${yt}`)) {
            //     } else {
            //       it?.student?.push(`${yt}`);
            //     }
            //   }
            // }

            // } else {
            //   flag = false;
            //   break;
            // }
          }
        }
        if (flag) {
          if (st?.subjectTeacherName) {
            // let ft = [];
            // if (st?.selected_batch_query?.class_student_query?.length > 0) {
            //   for (let yt of st?.selected_batch_query?.class_student_query) {
            //     ft.push(`${yt}`);
            //   }
            // } else {
            //   for (let yt of ct?.ApproveStudent) {
            //     ft.push(`${yt}`);
            //   }
            // }
            arr.push({
              staffId: st?.subjectTeacherName,
              master: st?.subjectMasterName,
              subjectName: st?.subjectName,
              // is_batch: true,
              is_batch: st?.selected_batch_query ? true : false,
              student:
                st?.selected_batch_query?.class_student_query?.length > 0
                  ? st?.selected_batch_query?.class_student_query
                  : [],
              tag: false,
              // student: ft,
            });
          }
        }
      }
      // cls_student[ct?._id]["student"] = [];
      cls_student[ct?._id]["student"] = ct?.ApproveStudent;
      cls_student[ct?._id]["staff"] = arr;
      // }
    }

    res.status(200).send({
      message: "student feedback taken by Institute Admin",
      // cls: cls,
      cls_student: cls_student,
    });
    let i = 0;
    let j = 0;
    for (let obj in cls_student) {
      let data = cls_student[obj];
      feedback.cls_student.push({
        class: obj,
        sent: false,
        staff: data["staff"],
        student: data["student"],
      });
      // await feedback.save();

      for (let st of data["staff"] ?? []) {
        if (
          st?.staffId === "64a79fcba59e4e19fe7ce32e" &&
          st?.master === "66ac9cbdaa74f613d8843aed"
        ) {
        } else {
          const staff = await Staff.findById(st?.staffId);
          const master = await SubjectMaster.findById(st?.master);
          var staff_feedbaack = await StaffStudentFeedback.findOne({
            $and: [
              {
                staff: { $eq: `${staff?._id}` },
              },
              {
                feedbackId: { $eq: `${feedback?._id}` },
              },
            ],
          });
          if (staff_feedbaack) {
            if (staff_feedbaack.subject_master?.includes(master?._id)) {
            } else {
              staff_feedbaack.subject_master?.push(master?._id);
            }
            if (staff_feedbaack.classes?.includes(obj)) {
            } else {
              staff_feedbaack.classes?.push(obj);
            }
            await staff_feedbaack.save();
          } else {
            staff_feedbaack = new StaffStudentFeedback({
              institute: id,
              feedbackId: feedback?._id,
              staff: staff?._id,
              subject_master: [master?._id],
            });
            staff.student_feedback?.push(staff_feedbaack?._id);
            feedback.feedback_staff?.push(staff_feedbaack?._id);
            staff_feedbaack.classes?.push(obj);
            await staff_feedbaack.save();
          }
          // let all_student = st?.is_batch ? st?.student : data["student"];
          let all_student = data["student"];
          if (all_student?.length > 0) {
            for (let stu of all_student) {
              if (stu) {
                ++i;
                console.log("i ->", i);
                const student = await Student.findById(stu);
                if (student?.user) {
                  const user = await User.findById(student?.user);
                  let notify = "";

                  notify = await StudentNotification.findOne({
                    $and: [
                      {
                        subjectMasterId: { $eq: `${master?._id}` },
                      },
                      {
                        notifyPublisher: { $eq: `${student?._id}` },
                      },
                      {
                        student_feedback: { $eq: `${feedback?._id}` },
                      },
                      {
                        staffFeedbackId: { $eq: `${staff_feedbaack?._id}` },
                      },
                    ],
                  });
                  if (notify?._id) {
                  } else {
                    ++j;
                    console.log("j->", j);
                    notify = new StudentNotification({});
                    notify.notifyContent = `Give your valuable feedback to your beloved teacher - ${
                      staff?.staffFirstName
                    } ${
                      staff?.staffMiddleName ? `${staff?.staffMiddleName} ` : ""
                    }${staff?.staffLastName ?? ""} of - ${master?.subjectName}`;
                    notify.notifySender = institute?._id;
                    notify.notifyReceiever = user?._id;
                    notify.notifyType = "Student";
                    notify.notifyPublisher = student?._id;
                    notify.instituteId = institute?._id;
                    user.activity_tab.push(notify?._id);
                    notify.notifyByInsPhoto = institute?._id;
                    notify.notifyCategory = "Subject Teacher Feedback";
                    notify.redirectIndex = 89;
                    notify.student_feedback = feedback?._id;
                    notify.staffId = staff?._id;
                    notify.subjectMasterId = master?._id;
                    notify.staffFeedbackId = staff_feedbaack?._id;
                    notify.feedbackClassId = obj;
                    feedback.feedback_notify?.push(notify?._id);
                    feedback.feedback_notify_count += 1;
                    if (user?.deviceToken) {
                      invokeMemberTabNotification(
                        "Student Activity",
                        notify,
                        "Staff Feedback",
                        user._id,
                        user.deviceToken,
                        "Student",
                        notify
                      );
                    }
                    await Promise.all([notify.save(), user.save()]);
                  }
                }
              }
            }
          }
          await Promise.all([
            feedback.save(),
            // staff_feedbaack.save(),
            staff.save(),
          ]);
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
};

// check which subject teacher subject student not send
exports.feedback_clone_question_query = async (req, res) => {
  try {
    const { ifid, nifid } = req.params;
    if (!nifid || !ifid) {
      return res.status(200).send({
        message: "Url Segement parameter required is not fulfill.",
      });
    }

    const feedback = await StudentFeedback.findById(ifid);
    const n_feedback = await StudentFeedback.findById(nifid);

    n_feedback.questions = feedback.questions;
    n_feedback.question_count = feedback.question_count;

    // console.log(n_feedback.questions);
    await n_feedback.save();
    res.status(200).send({
      message: "One subject Student feedback notify successfully.",
    });
  } catch (e) {
    console.log(e);
  }
};
